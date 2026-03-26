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
  vitals: VitalsInput;
  result?: PredictionResult;
  timestamp?: string;
}

export interface VitalTrendPoint {
  time: string;
  HR: number;
  O2Sat: number;
  Temp: number;
  Resp: number;
  SBP: number;
}
