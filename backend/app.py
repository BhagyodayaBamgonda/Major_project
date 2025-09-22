from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.io as pio
import os
import uuid
import json
from plotly.utils import PlotlyJSONEncoder
import traceback
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

EXPORT_DIR = os.path.join(os.path.dirname(__file__), "exports")
os.makedirs(EXPORT_DIR, exist_ok=True)

# Store analysis history for dashboard
analysis_history = []

def try_parse_dates(df: pd.DataFrame) -> pd.DataFrame:
    for col in df.columns:
        if "date" in col.lower():
            try:
                df[col] = pd.to_datetime(df[col], errors="coerce")
            except Exception:
                pass
    return df

def role_of_dtype(dtype: str) -> str:
    if "datetime" in str(dtype):
        return "datetime"
    if "int" in str(dtype) or "float" in str(dtype):
        return "numeric"
    return "categorical"

def make_histograms(df, numeric_cols, max_count=3):
    charts = []
    for col in list(numeric_cols)[:max_count]:
        fig = px.histogram(df, x=col, nbins=20, template="plotly_white",
                           title=f"Distribution of {col}")
        charts.append(("hist", col, fig))
    return charts

def make_bar_cat_num(df, categorical_cols, numeric_cols):
    charts = []
    if len(categorical_cols) and len(numeric_cols):
        cat = categorical_cols[0]
        num = numeric_cols[0]
        agg = df.groupby(cat, dropna=False)[num].mean().reset_index()
        fig = px.bar(agg, x=cat, y=num, template="plotly_white",
                     title=f"{num} by {cat}")
        charts.append(("bar", f"{num}_by_{cat}", fig))
    return charts

def make_pie(df, categorical_cols):
    charts = []
    if len(categorical_cols):
        cat = categorical_cols[0]
        # Limit to top 10 categories for better visualization
        value_counts = df[cat].value_counts().head(10)
        fig = px.pie(values=value_counts.values, names=value_counts.index, 
                     template="plotly_white", title=f"{cat} Distribution")
        charts.append(("pie", f"{cat}_distribution", fig))
    return charts

def make_timeseries(df, date_cols, numeric_cols):
    charts = []
    if len(date_cols) and len(numeric_cols):
        d = date_cols[0]
        n = numeric_cols[0]
        tmp = df[[d, n]].dropna(subset=[d])
        if len(tmp) > 1:  # Only create timeseries if we have enough data
            fig = px.line(tmp, x=d, y=n, template="plotly_white",
                          title=f"{n} over {d}")
            fig.update_traces(mode="lines+markers")
            charts.append(("line", f"time_{n}_by_{d}", fig))
    return charts

def make_scatter_plot(df, numeric_cols):
    charts = []
    if len(numeric_cols) >= 2:
        x_col, y_col = numeric_cols[0], numeric_cols[1]
        fig = px.scatter(df, x=x_col, y=y_col, template="plotly_white",
                         title=f"{y_col} vs {x_col}")
        charts.append(("scatter", f"{y_col}_vs_{x_col}", fig))
    return charts

def make_correlation_heatmap(df, numeric_cols):
    charts = []
    if len(numeric_cols) >= 2:
        # Calculate correlation matrix
        corr_matrix = df[numeric_cols].corr()
        fig = px.imshow(corr_matrix, text_auto=True, aspect="auto",
                        template="plotly_white", title="Correlation Heatmap")
        charts.append(("heatmap", "correlation", fig))
    return charts

@app.route("/upload", methods=["POST"])
def upload():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        try:
            df = pd.read_csv(file)
        except Exception as e:
            return jsonify({"error": f"Failed to read CSV: {e}"}), 400

        # Cleaning options
        remove_nulls = request.form.get("remove_nulls", "false").lower() == "true"
        remove_dupes = request.form.get("remove_duplicates", "false").lower() == "true"
        fill_strategy = request.form.get("fill_strategy", "none").lower()
        fill_constant = request.form.get("fill_constant", "")
        standardize = request.form.get("standardize", "false").lower() == "true"
        normalize = request.form.get("normalize", "false").lower() == "true"

        df = try_parse_dates(df)

        if remove_dupes:
            df = df.drop_duplicates()

        if remove_nulls:
            df = df.dropna()

        if not remove_nulls and fill_strategy in ("mean", "median", "constant"):
            num_cols = df.select_dtypes(include=[np.number]).columns
            obj_cols = df.select_dtypes(exclude=[np.number]).columns

            if fill_strategy == "mean":
                df[num_cols] = df[num_cols].fillna(df[num_cols].mean(numeric_only=True))
                df[obj_cols] = df[obj_cols].fillna("Missing")
            elif fill_strategy == "median":
                df[num_cols] = df[num_cols].fillna(df[num_cols].median(numeric_only=True))
                df[obj_cols] = df[obj_cols].fillna("Missing")
            elif fill_strategy == "constant":
                cnum = pd.to_numeric(fill_constant, errors="coerce")
                if pd.isna(cnum):
                    df[num_cols] = df[num_cols].fillna(0)
                else:
                    df[num_cols] = df[num_cols].fillna(float(cnum))
                df[obj_cols] = df[obj_cols].fillna(fill_constant if fill_constant != "" else "Missing")

        # Standardize and Normalize if requested
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if standardize and len(numeric_cols) > 0:
            df[numeric_cols] = (df[numeric_cols] - df[numeric_cols].mean()) / df[numeric_cols].std()
        
        if normalize and len(numeric_cols) > 0:
            df[numeric_cols] = (df[numeric_cols] - df[numeric_cols].min()) / (df[numeric_cols].max() - df[numeric_cols].min())

        # KPIs (force native int)
        kpis = {
            "rows": int(df.shape[0]),
            "columns": int(df.shape[1]),
            "missing": int(df.isna().sum().sum()),
            "duplicates": int(df.duplicated().sum())
        }

        # Column summary (force int for counts)
        cols_meta = []
        for c in df.columns:
            dtype = str(df[c].dtype)
            cols_meta.append({
                "column": str(c),
                "dtype": dtype,
                "role": role_of_dtype(dtype),
                "non_null_count": int(df[c].notna().sum())
            })

        # Detect types
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        categorical_cols = df.select_dtypes(exclude=[np.number]).columns
        datetime_cols = df.select_dtypes(include=["datetime64[ns]", "datetime64[ns, UTC]"]).columns

        # Build charts
        chart_objs = []
        chart_specs = []
        chart_objs += make_histograms(df, numeric_cols, max_count=3)
        chart_objs += make_bar_cat_num(df, categorical_cols, numeric_cols)
        chart_objs += make_pie(df, categorical_cols)
        chart_objs += make_timeseries(df, datetime_cols, numeric_cols)
        chart_objs += make_scatter_plot(df, numeric_cols)
        chart_objs += make_correlation_heatmap(df, numeric_cols)

        # Save cleaned CSV
        cleaned_name = f"cleaned_{uuid.uuid4().hex}.csv"
        cleaned_path = os.path.join(EXPORT_DIR, cleaned_name)
        df.to_csv(cleaned_path, index=False)

        # Save chart images + JSON payload
        for kind, key, fig in chart_objs:
            img_name = f"{kind}_{key}_{uuid.uuid4().hex}.png"
            img_path = os.path.join(EXPORT_DIR, img_name)
            pio.write_image(fig, img_path, format="png", scale=2, width=1200, height=700)

            # Convert figure safely with JSON encoder
            fig_dict = json.loads(json.dumps(fig.to_dict(), cls=PlotlyJSONEncoder))

            chart_specs.append({
                "title": str(fig.layout.title.text) if fig.layout.title and fig.layout.title.text else key,
                "figure": fig_dict,
                "image_url": f"/download/{img_name}"
            })

        # Prepare dashboard data
        dashboard_data = {
            "kpis": kpis,
            "columns": cols_meta,
            "preview": {
                "columns": [str(c) for c in df.columns],
                "rows": df.head(10).to_dict(orient="records")
            },
            "download_url": f"/download/{cleaned_name}",
            "charts": chart_specs,
            "timestamp": datetime.now().isoformat()
        }

        # Store in history
        analysis_history.append({
            "timestamp": datetime.now().isoformat(),
            "filename": file.filename,
            "kpis": kpis
        })

        return jsonify(dashboard_data)

    except Exception as e:
        logger.error(f"Error in upload endpoint: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route("/clean", methods=["POST"])
def clean_data():
    """Endpoint to clean data without uploading a new file"""
    try:
        logger.info("Received request to /clean endpoint")
        
        # Check if request has JSON data
        if not request.is_json:
            logger.error("Request is not JSON")
            return jsonify({"error": "Request must be JSON"}), 400
            
        data = request.get_json()
        logger.info(f"Request data received")
        
        if not data or "data" not in data:
            logger.error("No data provided in request")
            return jsonify({"error": "No data provided"}), 400
            
        # Convert to DataFrame
        df = pd.DataFrame(data["data"])
        logger.info(f"DataFrame created with shape: {df.shape}")
        
        # Get cleaning options from request
        options = data.get("options", {})
        remove_nulls = options.get("remove_nulls", False)
        remove_dupes = options.get("remove_duplicates", False)
        fill_strategy = options.get("fill_strategy", "none").lower()
        fill_constant = options.get("fill_constant", "")
        standardize = options.get("standardize", False)
        normalize = options.get("normalize", False)
        
        logger.info(f"Cleaning options: remove_nulls={remove_nulls}, remove_dupes={remove_dupes}, fill_strategy={fill_strategy}")
        
        # Apply cleaning operations
        df = try_parse_dates(df)

        if remove_dupes:
            df = df.drop_duplicates()
            logger.info("Removed duplicates")

        if remove_nulls:
            df = df.dropna()
            logger.info("Removed null values")

        if not remove_nulls and fill_strategy in ("mean", "median", "constant"):
            num_cols = df.select_dtypes(include=[np.number]).columns
            obj_cols = df.select_dtypes(exclude=[np.number]).columns

            if fill_strategy == "mean":
                df[num_cols] = df[num_cols].fillna(df[num_cols].mean(numeric_only=True))
                df[obj_cols] = df[obj_cols].fillna("Missing")
                logger.info("Filled missing values with mean (numeric) and 'Missing' (text)")
            elif fill_strategy == "median":
                df[num_cols] = df[num_cols].fillna(df[num_cols].median(numeric_only=True))
                df[obj_cols] = df[obj_cols].fillna("Missing")
                logger.info("Filled missing values with median (numeric) and 'Missing' (text)")
            elif fill_strategy == "constant":
                cnum = pd.to_numeric(fill_constant, errors="coerce")
                if pd.isna(cnum):
                    df[num_cols] = df[num_cols].fillna(0)
                else:
                    df[num_cols] = df[num_cols].fillna(float(cnum))
                df[obj_cols] = df[obj_cols].fillna(fill_constant if fill_constant != "" else "Missing")
                logger.info(f"Filled missing values with constant: {fill_constant}")
        
        # Standardize and Normalize if requested
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if standardize and len(numeric_cols) > 0:
            df[numeric_cols] = (df[numeric_cols] - df[numeric_cols].mean()) / df[numeric_cols].std()
            logger.info("Standardized numeric columns")
        
        if normalize and len(numeric_cols) > 0:
            df[numeric_cols] = (df[numeric_cols] - df[numeric_cols].min()) / (df[numeric_cols].max() - df[numeric_cols].min())
            logger.info("Normalized numeric columns")
        
        # Return cleaned data
        response_data = {
            "status": "success", 
            "message": "Data cleaned successfully",
            "cleaned_data": df.to_dict(orient="records"),
            "columns": list(df.columns),
            "shape": {"rows": df.shape[0], "columns": df.shape[1]}
        }
        
        logger.info("Cleaning completed successfully")
        return jsonify(response_data), 200
            
    except Exception as e:
        logger.error(f"Error in /clean endpoint: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route("/download/<path:fname>", methods=["GET"])
def download_file(fname):
    return send_from_directory(EXPORT_DIR, fname, as_attachment=True)

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Flask server is running"})

@app.route("/history", methods=["GET"])
def get_history():
    """Get analysis history for dashboard"""
    return jsonify({"history": analysis_history[-10:]})  # Return last 10 analyses

@app.route("/", methods=["GET"])
def index():
    """Root endpoint with API documentation"""
    return jsonify({
        "message": "Flask Data Processing API",
        "endpoints": {
            "/upload": "POST - Upload and process a CSV file",
            "/clean": "POST - Clean provided JSON data",
            "/download/<filename>": "GET - Download a file",
            "/health": "GET - Health check",
            "/history": "GET - Get analysis history"
        }
    })

if __name__ == "__main__":
    logger.info("Starting Flask server...")
    app.run(host='0.0.0.0', port=5000, debug=True)