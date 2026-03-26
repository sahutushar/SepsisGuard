"""
Early Sepsis Risk Prediction System
Production-ready ML pipeline for sepsis risk scoring
"""

import pandas as pd
import numpy as np
import joblib
import warnings
warnings.filterwarnings("ignore")

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, roc_auc_score, classification_report)
from imblearn.over_sampling import SMOTE
from xgboost import XGBClassifier
import shap

# ─────────────────────────────────────────────
# 1. CONFIGURATION
# ─────────────────────────────────────────────
DATASET_PATH = "Dataset.csv"
MODEL_PATH   = "sepsis_model.pkl"
RANDOM_STATE = 42

VITAL_FEATURES = ["HR", "O2Sat", "Temp", "SBP", "MAP", "Resp"]
LAB_FEATURES   = ["BaseExcess", "HCO3", "pH", "PaCO2", "Lactate",
                   "WBC", "Creatinine", "Glucose", "Potassium"]
DEMO_FEATURES  = ["Age", "ICULOS"]

FEATURES = VITAL_FEATURES + LAB_FEATURES + DEMO_FEATURES
TARGET   = "SepsisLabel"


# ─────────────────────────────────────────────
# 2. DATA LOADING & PREPROCESSING
# ─────────────────────────────────────────────
def load_and_preprocess(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)

    # Keep only relevant columns
    cols_needed = FEATURES + [TARGET, "Patient_ID"]
    df = df[[c for c in cols_needed if c in df.columns]].copy()

    # Forward-fill within each patient, then global median fallback
    df = df.groupby("Patient_ID", group_keys=False).apply(
        lambda g: g.ffill().bfill()
    )
    for col in FEATURES:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].median())

    return df


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add rolling-window statistics per patient."""
    df = df.copy()
    for feat in ["HR", "Resp", "SBP", "O2Sat"]:
        if feat in df.columns:
            df[f"{feat}_roll3"] = (
                df.groupby("Patient_ID")[feat]
                  .transform(lambda x: x.rolling(3, min_periods=1).mean())
            )
    return df


# ─────────────────────────────────────────────
# 3. MODEL TRAINING
# ─────────────────────────────────────────────
def get_feature_cols(df: pd.DataFrame) -> list:
    base = [c for c in FEATURES if c in df.columns]
    roll = [c for c in df.columns if c.endswith("_roll3")]
    return base + roll


def train_models(X_train, y_train):
    rf = RandomForestClassifier(
        n_estimators=200, max_depth=10, class_weight="balanced",
        random_state=RANDOM_STATE, n_jobs=-1
    )
    xgb = XGBClassifier(
        n_estimators=200, max_depth=6, learning_rate=0.05,
        scale_pos_weight=(y_train == 0).sum() / (y_train == 1).sum(),
        use_label_encoder=False, eval_metric="logloss",
        random_state=RANDOM_STATE, n_jobs=-1
    )
    rf.fit(X_train, y_train)
    xgb.fit(X_train, y_train)
    return rf, xgb


# ─────────────────────────────────────────────
# 4. EVALUATION
# ─────────────────────────────────────────────
def evaluate(name: str, model, X_test, y_test) -> dict:
    y_pred  = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]
    metrics = {
        "Accuracy" : accuracy_score(y_test, y_pred),
        "Precision": precision_score(y_test, y_pred, zero_division=0),
        "Recall"   : recall_score(y_test, y_pred, zero_division=0),
        "F1"       : f1_score(y_test, y_pred, zero_division=0),
        "ROC-AUC"  : roc_auc_score(y_test, y_proba),
    }
    print(f"\n{'='*45}")
    print(f"  {name} Evaluation")
    print(f"{'='*45}")
    for k, v in metrics.items():
        print(f"  {k:<12}: {v:.4f}")
    print(f"\n{classification_report(y_test, y_pred, zero_division=0)}")
    return metrics


# ─────────────────────────────────────────────
# 5. RISK SCORING
# ─────────────────────────────────────────────
def risk_label(score: float) -> str:
    if score < 0.4:
        return "Low Risk"
    elif score < 0.7:
        return "Medium Risk"
    return "High Risk"


def predict_risk(model, scaler, feature_cols: list, patient_data: dict) -> dict:
    """
    patient_data: dict with feature values for a single time-step.
    Returns risk score and label.
    """
    row = pd.DataFrame([patient_data]).reindex(columns=feature_cols, fill_value=0)
    row_scaled = scaler.transform(row)
    score = float(model.predict_proba(row_scaled)[0, 1])
    return {"risk_score": round(score, 4), "risk_level": risk_label(score)}


# ─────────────────────────────────────────────
# 6. EXPLAINABILITY (SHAP)
# ─────────────────────────────────────────────
def explain_model(model, X_sample: pd.DataFrame, model_name: str):
    print(f"\n{'='*45}")
    print(f"  SHAP Feature Importance — {model_name}")
    print(f"{'='*45}")
    explainer   = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_sample)

    # For binary classifiers shap_values may be a list [class0, class1]
    # New SHAP versions return a 3D array (samples, features, classes)
    if isinstance(shap_values, list):
        sv = shap_values[1]
    elif shap_values.ndim == 3:
        sv = shap_values[:, :, 1]
    else:
        sv = shap_values
    mean_abs = np.abs(sv).mean(axis=0)
    importance = pd.Series(mean_abs, index=X_sample.columns).sort_values(ascending=False)

    print(importance.head(10).to_string())
    return importance


# ─────────────────────────────────────────────
# 7. MAIN PIPELINE
# ─────────────────────────────────────────────
def main():
    # --- Load & preprocess ---
    print("Loading dataset …")
    df = load_and_preprocess(DATASET_PATH)
    df = engineer_features(df)

    feature_cols = get_feature_cols(df)
    X = df[feature_cols].values
    y = df[TARGET].values.astype(int)

    print(f"Dataset shape : {df.shape}")
    print(f"Sepsis rate   : {y.mean():.2%}")

    # --- Train / test split ---
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )

    # --- Scale ---
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test  = scaler.transform(X_test)

    # --- SMOTE ---
    print("\nApplying SMOTE …")
    sm = SMOTE(random_state=RANDOM_STATE)
    X_train_res, y_train_res = sm.fit_resample(X_train, y_train)
    print(f"After SMOTE   : {np.bincount(y_train_res)}")

    # --- Train ---
    print("\nTraining models …")
    rf, xgb = train_models(X_train_res, y_train_res)

    # --- Evaluate ---
    rf_metrics  = evaluate("Random Forest", rf,  X_test, y_test)
    xgb_metrics = evaluate("XGBoost",       xgb, X_test, y_test)

    # --- Select best model ---
    best_model = rf if rf_metrics["ROC-AUC"] >= xgb_metrics["ROC-AUC"] else xgb
    best_name  = "Random Forest" if best_model is rf else "XGBoost"
    print(f"\n[BEST] Best model: {best_name}  (ROC-AUC = {max(rf_metrics['ROC-AUC'], xgb_metrics['ROC-AUC']):.4f})")

    # --- SHAP ---
    X_test_df = pd.DataFrame(X_test, columns=feature_cols)
    explain_model(best_model, X_test_df.sample(min(500, len(X_test_df)), random_state=RANDOM_STATE), best_name)

    # --- Save ---
    artifact = {"model": best_model, "scaler": scaler, "feature_cols": feature_cols}
    joblib.dump(artifact, MODEL_PATH)
    print(f"\n[SAVED] Model saved -> {MODEL_PATH}")

    # --- Example prediction ---
    example_patient = {
        "HR": 118, "O2Sat": 93, "Temp": 38.9, "SBP": 88,
        "MAP": 58,  "Resp": 28,  "BaseExcess": -5, "HCO3": 18,
        "pH": 7.28, "PaCO2": 32, "Lactate": 4.2,  "WBC": 18.5,
        "Creatinine": 2.1, "Glucose": 180, "Potassium": 5.1,
        "Age": 67,  "ICULOS": 12,
        "HR_roll3": 115, "O2Sat_roll3": 94, "Resp_roll3": 27, "SBP_roll3": 90,
    }
    result = predict_risk(best_model, scaler, feature_cols, example_patient)
    print("\n" + "="*45)
    print("  Example Prediction")
    print("="*45)
    print(f"  Risk Score : {result['risk_score']}")
    print(f"  Risk Level : {result['risk_level']}")
    print("="*45)

    return artifact


if __name__ == "__main__":
    main()
