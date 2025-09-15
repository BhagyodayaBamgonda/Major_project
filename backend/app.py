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

app = Flask(__name__)
CORS(app)

EXPORT_DIR = os.path.join(os.path.dirname(__file__), "exports")
os.makedirs(EXPORT_DIR, exist_ok=True)

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

def make_histograms(df, numeric_cols, max_count=2):
    charts = []
    for col in list(numeric_cols)[:max_count]:
        fig = px.histogram(df, x=col, nbins=20, template="plotly_dark",
                           title=f"Distribution of {col}")
        charts.append(("hist", col, fig))
    return charts

def make_bar_cat_num(df, categorical_cols, numeric_cols):
    charts = []
    if len(categorical_cols) and len(numeric_cols):
        cat = categorical_cols[0]
        num = numeric_cols[0]
        agg = df.groupby(cat, dropna=False)[num].mean().reset_index()
        fig = px.bar(agg, x=cat, y=num, template="plotly_dark",
                     title=f"{num} by {cat}")
        charts.append(("bar", f"{num}_by_{cat}", fig))
    return charts

def make_pie(df, categorical_cols):
    charts = []
    if len(categorical_cols):
        cat = categorical_cols[0]
        fig = px.pie(df, names=cat, template="plotly_dark", title=f"{cat} Distribution")
        charts.append(("pie", f"{cat}_distribution", fig))
    return charts

def make_timeseries(df, date_cols, numeric_cols):
    charts = []
    if len(date_cols) and len(numeric_cols):
        d = date_cols[0]
        n = numeric_cols[0]
        tmp = df[[d, n]].dropna(subset=[d])
        fig = px.line(tmp, x=d, y=n, template="plotly_dark",
                      title=f"{n} over {d}")
        fig.update_traces(mode="lines+markers")
        charts.append(("line", f"time_{n}_by_{d}", fig))
    return charts

@app.route("/upload", methods=["POST"])
def upload():
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
    chart_objs += make_histograms(df, numeric_cols, max_count=2)
    chart_objs += make_bar_cat_num(df, categorical_cols, numeric_cols)
    chart_objs += make_pie(df, categorical_cols)
    chart_objs += make_timeseries(df, datetime_cols, numeric_cols)

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

    return jsonify({
        "kpis": kpis,
        "columns": cols_meta,
        "preview": {
            "columns": [str(c) for c in df.columns],
            "rows": df.head(10).to_dict(orient="records")
        },
        "download_url": f"/download/{cleaned_name}",
        "charts": chart_specs
    })

@app.route("/download/<path:fname>", methods=["GET"])
def download_file(fname):
    return send_from_directory(EXPORT_DIR, fname, as_attachment=True)

if __name__ == "__main__":
    app.run(port=5000, debug=True)
