import pandas as pd
import ast
from typing import Any, Tuple, Optional
import numpy as np

class SecurityNodeVisitor(ast.NodeVisitor):
    def visit_Import(self, node):
        raise ValueError("Import statements are not allowed.")
    
    def visit_ImportFrom(self, node):
        raise ValueError("Import statements are not allowed.")
        
    def visit_Call(self, node):
        if isinstance(node.func, ast.Name):
            forbidden_funcs = {'eval', 'exec', 'open', '__import__', 'globals', 'locals', 'getattr', 'setattr', 'delattr', 'hasattr', 'compile'}
            if node.func.id in forbidden_funcs:
                raise ValueError(f"Function '{node.func.id}' is not allowed.")
        self.generic_visit(node)

def execute_pandas_code(df: pd.DataFrame, code: str) -> Tuple[Any, str]:
    try:
        # Parse and validate the code
        tree = ast.parse(code)
        visitor = SecurityNodeVisitor()
        visitor.visit(tree)
    except SyntaxError as e:
        return None, f"Syntax Error in generated code: {str(e)}"
    except ValueError as ve:
        return None, str(ve)
        
    # Operate on a copy to prevent corrupting the original df on error
    safe_df = df.copy()
    local_env = {"df": safe_df}
    
    try:
        # Execute the code safely
        exec(code, {"__builtins__": {}}, local_env)
        
        if "result" not in local_env:
            raise ValueError("The generated code did not define a 'result' variable.")
            
        result = local_env["result"]
        
        # Convert pandas/numpy objects for JSON serialization
        # Check Series/DataFrame FIRST because they have an .item() method that crashes on multiple values
        if isinstance(result, (pd.Series, pd.DataFrame)):
            # Replace NaNs with None for JSON compliance
            result = result.replace({np.nan: None}).to_dict()
        elif hasattr(result, "item") and callable(getattr(result, "item")):
            # Check if it's a single element before calling .item()
            if hasattr(result, "size") and result.size > 1:
                if hasattr(result, "tolist"):
                    result = result.tolist()
            else:
                result = result.item()
        elif isinstance(result, np.ndarray):
            result = result.tolist()
            
        return result, None
    except Exception as e:
        return None, f"Execution error: {str(e)}"

def detect_simple_query(df: pd.DataFrame, norm_query: str) -> Tuple[Any, Optional[str]]:
    """
    Attempts to execute very simple queries (sum, mean, count, min, max) without LLM.
    Returns (result, code_string) if successful, otherwise (None, None).
    """
    words = norm_query.split()
    operations = {
        "average": "mean", "mean": "mean",
        "sum": "sum", "total": "sum",
        "count": "count", "max": "max",
        "maximum": "max", "min": "min", "minimum": "min",
        "unique": "nunique"
    }
    
    op = next((operations[w] for w in words if w in operations), None)
    # Special case: "total unique" -> "nunique"
    if "unique" in words:
        op = "nunique"

    if not op:
        return None, None
        
    lower_cols = {str(c).lower(): c for c in df.columns}
    target_col = None
    
    # Check exact word matches
    for w in words:
        if w in lower_cols:
            target_col = lower_cols[w]
            break
            
    # Check substring matches
    if not target_col:
        for c_lower, c_orig in lower_cols.items():
            if c_lower in norm_query:
                target_col = c_orig
                break
                
    if target_col and op:
        try:
            # SAFETY: Only perform numeric operations on numeric columns
            is_numeric = pd.api.types.is_numeric_dtype(df[target_col])
            if op in ["mean", "sum"] and not is_numeric:
                return None, None # Fallback to LLM for non-numeric sum/mean
                
            if op == "mean": res = df[target_col].mean()
            elif op == "sum": res = df[target_col].sum()
            elif op == "count": res = df[target_col].count()
            elif op == "max": res = df[target_col].max()
            elif op == "min": res = df[target_col].min()
            elif op == "nunique": res = df[target_col].nunique()
                
            code_str = f"result = df['{target_col}'].{op}()"
            
            if hasattr(res, "item") and callable(getattr(res, "item")):
                res = res.item()
                
            return res, code_str
        except Exception:
            return None, None
            
    return None, None

def generate_local_explanation(answer: Any) -> str:
    """Generates a simple, local human-readable response without LLM calls."""
    if answer is None:
        return "I could not compute a result for that query."
    if isinstance(answer, (list, dict)):
        return "Here is the extracted data structure."
    return f"The calculated result is: {answer}"
