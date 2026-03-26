"""
Early Sepsis Risk Prediction — FastAPI Backend
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
import joblib
import pandas as pd
import numpy as np
import os

# ── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Sepsis Risk Prediction API",
    description="Real-time sepsis risk scoring from patient vitals",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Model loading ─────────────────────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "sepsis_model.pkl")

try:
    artifact     = joblib.load(MODEL_PATH)
    MODEL        = artifact["model"]
    SCALER       = artifact["scaler"]
    FEATURE_COLS = artifact["feature_cols"]
    print(f"[OK] Model loaded. Features: {FEATURE_COLS}")
except Exception as e:
    raise RuntimeError(f"Failed to load model: {e}")

# ── Schemas ───────────────────────────────────────────────────────────────────
class VitalsInput(BaseModel):
    HR:    float = Field(..., ge=0,   le=300,  description="Heart Rate (bpm)")
    O2Sat: float = Field(..., ge=0,   le=100,  description="Oxygen Saturation (%)")
    Temp:  float = Field(..., ge=30,  le=45,   description="Temperature (°C)")
    SBP:   float = Field(..., ge=0,   le=300,  description="Systolic Blood Pressure (mmHg)")
    MAP:   float = Field(..., ge=0,   le=200,  description="Mean Arterial Pressure (mmHg)")
    Resp:  float = Field(..., ge=0,   le=60,   description="Respiration Rate (breaths/min)")

    @validator("O2Sat")
    def o2sat_range(cls, v):
        if v < 50:
            raise ValueError("O2Sat seems unrealistically low")
        return v


class PredictionOutput(BaseModel):
    risk_score:   float
    risk_level:   str
    risk_percent: float
    contributors: list[dict]


class HealthResponse(BaseModel):
    status:  str
    model:   str
    features: int


# ── Helpers ───────────────────────────────────────────────────────────────────
VITAL_DEFAULTS = {
    "BaseExcess": 0.0, "HCO3": 24.0, "pH": 7.4, "PaCO2": 40.0,
    "Lactate": 1.0, "WBC": 8.0, "Creatinine": 1.0, "Glucose": 100.0,
    "Potassium": 4.0, "Age": 60.0, "ICULOS": 1.0,
    "HR_roll3": 0.0, "O2Sat_roll3": 0.0, "Resp_roll3": 0.0, "SBP_roll3": 0.0,
}

NORMAL_RANGES = {
    "HR":    (60,  100),
    "O2Sat": (95,  100),
    "Temp":  (36.1, 37.2),
    "SBP":   (90,  140),
    "MAP":   (70,  100),
    "Resp":  (12,  20),
}

def risk_label(score: float) -> str:
    if score < 0.4:  return "Low"
    if score < 0.7:  return "Medium"
    return "High"


def compute_contributors(vitals: dict) -> list[dict]:
    """
    Rule-based contribution scores for each vital sign.
    Returns sorted list of {feature, value, deviation, contribution}.
    """
    results = []
    for feat, (lo, hi) in NORMAL_RANGES.items():
        val = vitals.get(feat, 0)
        mid = (lo + hi) / 2
        span = (hi - lo) / 2 or 1
        deviation = abs(val - mid) / span          # normalised distance from centre
        contribution = round(min(deviation / 3, 1.0), 3)   # cap at 1
        status = "normal"
        if val < lo:   status = "low"
        elif val > hi: status = "high"
        results.append({
            "feature":      feat,
            "value":        val,
            "normal_range": f"{lo}–{hi}",
            "status":       status,
            "contribution": contribution,
        })
    return sorted(results, key=lambda x: x["contribution"], reverse=True)


def build_feature_row(vitals: dict) -> pd.DataFrame:
    row = {**VITAL_DEFAULTS, **vitals}
    # fill rolling features with the vital value itself (single time-step)
    for feat in ["HR", "O2Sat", "Resp", "SBP"]:
        roll_key = f"{feat}_roll3"
        if roll_key in FEATURE_COLS:
            row[roll_key] = vitals.get(feat, VITAL_DEFAULTS.get(roll_key, 0))
    return pd.DataFrame([row]).reindex(columns=FEATURE_COLS, fill_value=0)


# ── Endpoints ─────────────────────────────────────────────────────────────────
@app.get("/health", response_model=HealthResponse)
def health():
    return {
        "status":   "ok",
        "model":    type(MODEL).__name__,
        "features": len(FEATURE_COLS),
    }


@app.post("/predict", response_model=PredictionOutput)
def predict(data: VitalsInput):
    try:
        vitals = data.dict()
        row    = build_feature_row(vitals)
        scaled = SCALER.transform(row)
        score  = float(MODEL.predict_proba(scaled)[0, 1])

        return {
            "risk_score":   round(score, 4),
            "risk_level":   risk_label(score),
            "risk_percent": round(score * 100, 2),
            "contributors": compute_contributors(vitals),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
def root():
    return {"message": "Sepsis Risk Prediction API — visit /docs for Swagger UI"}
