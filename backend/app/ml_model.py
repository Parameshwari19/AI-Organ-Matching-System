import os
import joblib
import shap


MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "organ_priority_xgboost.pkl"
)


# Load trained XGBoost model
model = joblib.load(MODEL_PATH)


# Create SHAP explainer
explainer = shap.TreeExplainer(model)


print("XGBoost model loaded successfully!")
print("SHAP explainer created successfully!")