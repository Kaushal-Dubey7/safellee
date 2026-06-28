"""
SAFELLE ML MICROSERVICE — FastAPI
====================================
This is a STANDALONE service. It does NOT touch your existing
Node.js backend, MongoDB, or any current functionality.

It exposes ONE endpoint that your Node.js server will call.
If this service is down, slow, or errors — your Node backend
falls back to the existing weighted formula automatically.

RUN THIS:
    pip install fastapi uvicorn scikit-learn joblib pandas --break-system-packages
    python train_model.py          (run once to create safelle_model.joblib)
    uvicorn ml_service:app --host 0.0.0.0 --port 8001

TEST IT:
    curl -X POST http://localhost:8001/predict-safety-score \
      -H "Content-Type: application/json" \
      -d '{"crime":80,"lighting":75,"crowd":70,"weather":90,"efficiency":95,"community":65}'
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import joblib
import numpy as np
import os

app = FastAPI(
    title="Safelle ML Safety Scoring Service",
    description="Predicts route safety score from 6 safety signals",
    version="1.0.0"
)

# ─────────────────────────────────────────────────────────────
# LOAD MODEL ON STARTUP (loaded once, kept in memory — fast)
# ─────────────────────────────────────────────────────────────

MODEL_PATH = os.path.join(os.path.dirname(__file__), "safelle_model.joblib")
model = None
model_loaded = False

@app.on_event("startup")
def load_model():
    global model, model_loaded
    try:
        model = joblib.load(MODEL_PATH)
        model_loaded = True
        print(f"[SUCCESS] Model loaded successfully from {MODEL_PATH}")
    except Exception as e:
        model_loaded = False
        print(f"[ERROR] Model failed to load: {e}")
        print("[ERROR] Service will return errors — Node.js backend should fallback to formula")


# ─────────────────────────────────────────────────────────────
# REQUEST / RESPONSE SCHEMAS
# ─────────────────────────────────────────────────────────────

class SafetyFeatures(BaseModel):
    crime:      float = Field(..., ge=0, le=100, description="Crime safety score (0-100)")
    lighting:   float = Field(..., ge=0, le=100, description="Street lighting score (0-100)")
    crowd:      float = Field(..., ge=0, le=100, description="Crowd density score (0-100)")
    weather:    float = Field(..., ge=0, le=100, description="Weather condition score (0-100)")
    efficiency: float = Field(..., ge=0, le=100, description="Route efficiency score (0-100)")
    community:  float = Field(..., ge=0, le=100, description="Community rating score (0-100)")
    state_baseline: float = Field(70.0, ge=15, le=92, description="Real NCRB state-level safety baseline (0-100)")

class SafetyPrediction(BaseModel):
    safety_score: float
    source: str          # "ml_model" or would not return if failed
    model_version: str


# ─────────────────────────────────────────────────────────────
# HEALTH CHECK — Node.js can ping this first to decide whether
# to even attempt the ML call, avoiding unnecessary timeouts
# ─────────────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    return {
        "status": "healthy" if model_loaded else "degraded",
        "model_loaded": model_loaded
    }


# ─────────────────────────────────────────────────────────────
# MAIN PREDICTION ENDPOINT
# ─────────────────────────────────────────────────────────────

@app.post("/predict-safety-score", response_model=SafetyPrediction)
def predict_safety_score(features: SafetyFeatures):
    if not model_loaded:
        # Node.js backend should catch this and use its own formula
        raise HTTPException(
            status_code=503,
            detail="ML model not available — caller should use fallback formula"
        )

    try:
        X = np.array([[
            features.crime,
            features.lighting,
            features.crowd,
            features.weather,
            features.efficiency,
            features.community,
            features.state_baseline
        ]])

        prediction = model.predict(X)[0]
        prediction = float(np.clip(prediction, 0, 100))

        return SafetyPrediction(
            safety_score=round(prediction, 1),
            source="ml_model",
            model_version="gradient_boosting_v1"
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)} — caller should use fallback formula"
        )


@app.get("/")
def root():
    return {
        "service": "Safelle ML Safety Scoring Microservice",
        "status": "running",
        "model_loaded": model_loaded,
        "endpoint": "/predict-safety-score"
    }
