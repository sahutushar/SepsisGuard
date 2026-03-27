import axios from "axios";
import { VitalsInput, PredictionResult, Patient, Alert, Report } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const api = axios.create({ baseURL: API_BASE });

export async function predictSepsis(vitals: VitalsInput): Promise<PredictionResult> {
  const { data } = await api.post<PredictionResult>("/predict", vitals);
  return data;
}

export async function checkHealth() {
  const { data } = await api.get("/health");
  return data;
}

export function generateTrendData(baseVitals: VitalsInput, points = 12): import("@/types").VitalTrendPoint[] {
  const now = Date.now();
  return Array.from({ length: points }, (_, i) => {
    const t = new Date(now - (points - 1 - i) * 5 * 60 * 1000);
    const jitter = (range: number) => (Math.random() - 0.5) * range;
    return {
      time: t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      HR:    Math.round(baseVitals.HR    + jitter(10)),
      O2Sat: Math.round(Math.min(100, baseVitals.O2Sat + jitter(4))),
      Temp:  parseFloat((baseVitals.Temp  + jitter(0.4)).toFixed(1)),
      Resp:  Math.round(baseVitals.Resp  + jitter(4)),
      SBP:   Math.round(baseVitals.SBP   + jitter(12)),
    };
  });
}

export const CRITICAL_VITALS: VitalsInput = {
  HR: 128, O2Sat: 88, Temp: 39.4, SBP: 82, MAP: 55, Resp: 32,
};

export const NORMAL_VITALS: VitalsInput = {
  HR: 75, O2Sat: 98, Temp: 36.8, SBP: 120, MAP: 85, Resp: 16,
};

export const SAMPLE_PATIENTS: Patient[] = [
  {
    id: "P-001", name: "James Carter",   age: 67, ward: "ICU-A",  diagnosis: "Pneumonia",        admittedAt: "2025-01-10 08:30",
    email: "james.carter@hospital.org",
    vitals: CRITICAL_VITALS,
    history: generateTrendData(CRITICAL_VITALS),
  },
  {
    id: "P-002", name: "Maria Gonzalez", age: 54, ward: "ICU-B",  diagnosis: "UTI / Bacteremia", admittedAt: "2025-01-10 11:15",
    email: "maria.gonzalez@hospital.org",
    vitals: { HR: 105, O2Sat: 93, Temp: 38.2, SBP: 95,  MAP: 65, Resp: 24 },
    history: generateTrendData({ HR: 105, O2Sat: 93, Temp: 38.2, SBP: 95, MAP: 65, Resp: 24 }),
  },
  {
    id: "P-003", name: "Robert Kim",     age: 72, ward: "Ward-3", diagnosis: "Post-op Care",     admittedAt: "2025-01-09 14:00",
    email: "robert.kim@hospital.org",
    vitals: { HR: 88,  O2Sat: 96, Temp: 37.5, SBP: 110, MAP: 75, Resp: 19 },
    history: generateTrendData({ HR: 88, O2Sat: 96, Temp: 37.5, SBP: 110, MAP: 75, Resp: 19 }),
  },
  {
    id: "P-004", name: "Susan Patel",    age: 45, ward: "Ward-5", diagnosis: "Observation",      admittedAt: "2025-01-10 09:00",
    email: "susan.patel@hospital.org",
    vitals: NORMAL_VITALS,
    history: generateTrendData(NORMAL_VITALS),
  },
  {
    id: "P-005", name: "David Okafor",   age: 61, ward: "ICU-C",  diagnosis: "Abdominal Sepsis", admittedAt: "2025-01-10 06:45",
    email: "david.okafor@hospital.org",
    vitals: { HR: 118, O2Sat: 91, Temp: 38.8, SBP: 88,  MAP: 60, Resp: 28 },
    history: generateTrendData({ HR: 118, O2Sat: 91, Temp: 38.8, SBP: 88, MAP: 60, Resp: 28 }),
  },
  {
    id: "P-006", name: "Linda Thompson", age: 58, ward: "Ward-2", diagnosis: "COPD Exacerbation",admittedAt: "2025-01-09 20:00",
    email: "linda.thompson@hospital.org",
    vitals: { HR: 92,  O2Sat: 94, Temp: 37.8, SBP: 105, MAP: 72, Resp: 22 },
    history: generateTrendData({ HR: 92, O2Sat: 94, Temp: 37.8, SBP: 105, MAP: 72, Resp: 22 }),
  },
];

export const SAMPLE_ALERTS: Alert[] = [
  {
    id: "A-001", patientId: "P-001", patientName: "James Carter", patientEmail: "james.carter@hospital.org", ward: "ICU-A",
    riskLevel: "High", riskPercent: 87.4,
    message: "Critical sepsis risk detected. Immediate intervention required.",
    timestamp: new Date(Date.now() - 5 * 60000).toLocaleTimeString(),
    acknowledged: false,
    actions: [
      "Notify attending physician immediately",
      "Initiate sepsis protocol (blood cultures × 2)",
      "Administer broad-spectrum antibiotics within 1 hour",
      "Increase monitoring frequency to every 15 min",
    ],
  },
  {
    id: "A-002", patientId: "P-005", patientName: "David Okafor", patientEmail: "david.okafor@hospital.org", ward: "ICU-C",
    riskLevel: "High", riskPercent: 74.1,
    message: "Elevated sepsis risk. Vitals deteriorating over last 30 minutes.",
    timestamp: new Date(Date.now() - 18 * 60000).toLocaleTimeString(),
    acknowledged: false,
    actions: [
      "Review current antibiotic regimen",
      "Order lactate level and CBC",
      "Consider ICU escalation",
    ],
  },
  {
    id: "A-003", patientId: "P-002", patientName: "Maria Gonzalez", patientEmail: "maria.gonzalez@hospital.org", ward: "ICU-B",
    riskLevel: "Medium", riskPercent: 52.3,
    message: "Moderate risk — O₂ saturation trending downward.",
    timestamp: new Date(Date.now() - 45 * 60000).toLocaleTimeString(),
    acknowledged: true,
    actions: [
      "Increase O₂ supplementation",
      "Repeat vitals in 30 minutes",
    ],
  },
  {
    id: "A-004", patientId: "P-006", patientName: "Linda Thompson", patientEmail: "linda.thompson@hospital.org", ward: "Ward-2",
    riskLevel: "Medium", riskPercent: 41.8,
    message: "Borderline risk — respiratory rate elevated.",
    timestamp: new Date(Date.now() - 90 * 60000).toLocaleTimeString(),
    acknowledged: true,
    actions: [
      "Administer bronchodilator",
      "Monitor SpO₂ continuously",
    ],
  },
];

export const SAMPLE_REPORTS: Report[] = SAMPLE_PATIENTS.map((p, i) => ({
  id: `R-00${i + 1}`,
  patientId: p.id,
  patientName: p.name,
  ward: p.ward,
  generatedAt: new Date(Date.now() - i * 3600000).toLocaleString(),
  riskLevel: (["High", "High", "Low", "Low", "High", "Medium"] as const)[i],
  riskPercent: [87.4, 52.3, 18.1, 9.7, 74.1, 41.8][i],
  vitals: p.vitals,
  contributors: [
    { feature: "HR",    value: p.vitals.HR,    normal_range: "60–100",  status: p.vitals.HR > 100 ? "high" : "normal",   contribution: 0.8 },
    { feature: "O2Sat", value: p.vitals.O2Sat, normal_range: "95–100",  status: p.vitals.O2Sat < 95 ? "low" : "normal",  contribution: 0.7 },
    { feature: "Resp",  value: p.vitals.Resp,  normal_range: "12–20",   status: p.vitals.Resp > 20 ? "high" : "normal",  contribution: 0.5 },
    { feature: "Temp",  value: p.vitals.Temp,  normal_range: "36.1–37.2", status: p.vitals.Temp > 37.2 ? "high" : "normal", contribution: 0.4 },
    { feature: "SBP",   value: p.vitals.SBP,   normal_range: "90–140",  status: p.vitals.SBP < 90 ? "low" : "normal",   contribution: 0.6 },
    { feature: "MAP",   value: p.vitals.MAP,   normal_range: "70–100",  status: p.vitals.MAP < 70 ? "low" : "normal",   contribution: 0.3 },
  ],
  recommendation: [
    "Immediate sepsis protocol activation required.",
    "Close monitoring and antibiotic review recommended.",
    "Continue routine monitoring.",
    "Patient stable — standard care.",
    "Urgent surgical review and ICU escalation.",
    "Respiratory therapy and bronchodilator therapy.",
  ][i],
}));
