# SepsisGuard — Early Sepsis Risk Prediction System

A full-stack AI-powered hospital monitoring dashboard that predicts sepsis risk in real-time from patient vitals.

---

## Project Structure

```
sepsis Prediction/
├── backend/
│   ├── main.py              # FastAPI server
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx         # Main dashboard
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   ├── VitalsForm.tsx   # Patient input form
│   │   ├── RiskGauge.tsx    # SVG gauge + risk badge
│   │   ├── ContributorsPanel.tsx  # SHAP-style breakdown
│   │   ├── VitalTrendChart.tsx    # Recharts line chart
│   │   ├── AlertModal.tsx   # High-risk popup alert
│   │   └── PatientList.tsx  # Multi-patient monitor
│   ├── lib/
│   │   └── api.ts           # Axios client + helpers
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces
│   └── .env.local
├── sepsis_model.pkl          # Trained RandomForest model
├── sepsis_pipeline.py        # ML training pipeline
├── Dataset.csv
└── start.bat                 # One-click launcher
```

---

## Quick Start

### Option 1 — One-click (Windows)
```
Double-click start.bat
```
Opens both servers and launches the browser automatically.

---

### Option 2 — Manual

**Backend**
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend** (new terminal)
```bash
cd frontend
npm run dev
```

Then open: http://localhost:3000

---

## API Reference

| Method | Endpoint   | Description              |
|--------|------------|--------------------------|
| GET    | /health    | Server + model status    |
| POST   | /predict   | Predict sepsis risk      |
| GET    | /docs      | Swagger UI               |

### POST /predict

**Request**
```json
{
  "HR": 128,
  "O2Sat": 88,
  "Temp": 39.4,
  "SBP": 82,
  "MAP": 55,
  "Resp": 32
}
```

**Response**
```json
{
  "risk_score": 0.6368,
  "risk_level": "Medium",
  "risk_percent": 63.68,
  "contributors": [
    { "feature": "O2Sat", "value": 88.0, "normal_range": "95-100", "status": "low", "contribution": 1.0 },
    { "feature": "Temp",  "value": 39.4, "normal_range": "36.1-37.2", "status": "high", "contribution": 1.0 },
    ...
  ]
}
```

### Risk Levels
| Score     | Level  | UI Color |
|-----------|--------|----------|
| 0 – 0.4   | Low    | Green    |
| 0.4 – 0.7 | Medium | Yellow   |
| 0.7 – 1.0 | High   | Red      |

---

## Model Performance

| Metric   | Score  |
|----------|--------|
| ROC-AUC  | 0.8838 |
| Recall   | 65.1%  |
| F1       | 0.237  |

- Model: RandomForestClassifier (200 trees)
- Training data: 546,122 ICU time-series rows
- Class imbalance handled with SMOTE
- Features: HR, O2Sat, Temp, SBP, MAP, Resp + 15 lab/demo features

---

## Dashboard Features

- Patient vitals input form with live abnormal value highlighting
- SVG arc gauge showing risk score 0–100%
- Color-coded risk badge (Low / Medium / High)
- High-risk alert modal with clinical action checklist
- Vital signs trend chart (simulated 60-min history)
- Vital contribution breakdown panel
- Multi-patient monitor with quick-scan
- "Simulate Critical Condition" button for demo
- API status indicator in top bar
- Fully responsive dark-mode UI
