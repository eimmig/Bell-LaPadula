export const LEVELS = ["PUBLIC_FEED", "BACKSTAGE", "SPOILER", "ULTIMATE_FINALE"] as const;

export type SecurityLevel = (typeof LEVELS)[number];

export interface User {
  id: string;
  username: string;
  password: string;
  clearance: SecurityLevel;
  categories: string[];
}

export interface Leak {
  id: string;
  title: string;
  content: string;
  spoilerLevel: SecurityLevel;
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
