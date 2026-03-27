export interface VitalsInput {
  HR: number;
  O2Sat: number;
  Temp: number;
  SBP: number;
  MAP: number;
  Resp: number;
}

export interface Contributor {
  feature: string;
  value: number;
  normal_range: string;
  status: "low" | "high" | "normal";
  contribution: number;
}

export interface PredictionResult {
  risk_score: number;
  risk_level: "Low" | "Medium" | "High";
  risk_percent: number;
  contributors: Contributor[];
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  ward: string;
  diagnosis: string;
  admittedAt: string;
  email: string;
  vitals: VitalsInput;
  result?: PredictionResult;
  timestamp?: string;
  history?: VitalTrendPoint[];
}

export interface VitalTrendPoint {
  time: string;
  HR: number;
  O2Sat: number;
  Temp: number;
  Resp: number;
  SBP: number;
}

export interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  ward: string;
  riskLevel: "Low" | "Medium" | "High";
  riskPercent: number;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  actions: string[];
}

export interface Report {
  id: string;
  patientId: string;
  patientName: string;
  ward: string;
  generatedAt: string;
  riskLevel: "Low" | "Medium" | "High";
  riskPercent: number;
  vitals: VitalsInput;
  contributors: Contributor[];
  recommendation: string;
}
