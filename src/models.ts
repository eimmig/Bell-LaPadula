export const LEVELS = ["PUBLIC", "CONFIDENTIAL", "SECRET", "TOP_SECRET"] as const;

export type SecurityLevel = (typeof LEVELS)[number];

export interface User {
  id: string;
  username: string;
  password: string;
  clearance: SecurityLevel;
  categories: string[];
}

export interface Document {
  id: string;
  title: string;
  content: string;
  classification: SecurityLevel;
  categories: string[];
  ownerId: string;
}

export interface AuditEvent {
  timestamp: string;
  actor?: string;
  action: string;
  target?: string;
  outcome: "ALLOW" | "DENY";
  reason?: string;
}
