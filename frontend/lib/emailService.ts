import emailjs from "@emailjs/browser";

// ── Replace these with your EmailJS dashboard values ──────────────────────────
const SERVICE_ID  = "YOUR_SERVICE_ID";   // e.g. "service_abc123"
const TEMPLATE_ID = "YOUR_TEMPLATE_ID"; // e.g. "template_xyz456"
const PUBLIC_KEY  = "YOUR_PUBLIC_KEY";  // e.g. "abcDEFghiJKL123"
// ─────────────────────────────────────────────────────────────────────────────

export interface EmailAlertParams {
  patientName:  string;
  patientId:    string;
  ward:         string;
  riskPercent:  number;
  riskLevel:    string;
  toEmail:      string;
  actions:      string[];
  timestamp:    string;
}

export async function sendSepsisAlert(params: EmailAlertParams): Promise<void> {
  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      to_email:     params.toEmail,
      patient_name: params.patientName,
      patient_id:   params.patientId,
      ward:         params.ward,
      risk_percent: params.riskPercent.toFixed(1),
      risk_level:   params.riskLevel,
      actions:      params.actions.map((a, i) => `${i + 1}. ${a}`).join("\n"),
      timestamp:    params.timestamp,
    },
    PUBLIC_KEY
  );
}
