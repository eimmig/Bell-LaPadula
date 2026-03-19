import { mkdir, appendFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { AuditEvent } from "./models.js";

const auditPath = resolve("logs", "audit.log");

export async function writeAuditLog(event: AuditEvent) {
  const line = JSON.stringify(event);
  await mkdir(dirname(auditPath), { recursive: true });
  await appendFile(auditPath, `${line}\n`, "utf-8");
}
