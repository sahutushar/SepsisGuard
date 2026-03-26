import axios from "axios";
import { VitalsInput, PredictionResult } from "@/types";

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

// ── Simulated vital trend data ────────────────────────────────────────────────
export function generateTrendData(baseVitals: VitalsInput, points = 12) {
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

// ── Critical preset ───────────────────────────────────────────────────────────
export const CRITICAL_VITALS: VitalsInput = {
  HR: 128, O2Sat: 88, Temp: 39.4, SBP: 82, MAP: 55, Resp: 32,
};

export const NORMAL_VITALS: VitalsInput = {
  HR: 75, O2Sat: 98, Temp: 36.8, SBP: 120, MAP: 85, Resp: 16,
};

export const SAMPLE_PATIENTS = [
  { id: "P-001", name: "James Carter",   age: 67, ward: "ICU-A",   vitals: CRITICAL_VITALS },
  { id: "P-002", name: "Maria Gonzalez", age: 54, ward: "ICU-B",   vitals: { HR: 105, O2Sat: 93, Temp: 38.2, SBP: 95,  MAP: 65, Resp: 24 } },
  { id: "P-003", name: "Robert Kim",     age: 72, ward: "Ward-3",  vitals: { HR: 88,  O2Sat: 96, Temp: 37.5, SBP: 110, MAP: 75, Resp: 19 } },
  { id: "P-004", name: "Susan Patel",    age: 45, ward: "Ward-5",  vitals: NORMAL_VITALS },
  { id: "P-005", name: "David Okafor",   age: 61, ward: "ICU-C",   vitals: { HR: 118, O2Sat: 91, Temp: 38.8, SBP: 88,  MAP: 60, Resp: 28 } },
];
