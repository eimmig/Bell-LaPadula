import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { z } from "zod";
import { authMiddleware, issueToken } from "./auth.js";
import { writeAuditLog } from "./audit.js";
import { documents, findDocumentById, findUserByUsername } from "./data.js";
import type { Document, User } from "./models.js";
import { canRead, canWrite, levelFromString } from "./security.js";

type AppBindings = {
  Variables: {
    user: User;
  };
};

const app = new Hono<AppBindings>();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

const createDocumentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  classification: z.enum(["PUBLIC", "CONFIDENTIAL", "SECRET", "TOP_SECRET"]),
  categories: z.array(z.string().min(1)).default([])
});

app.get("/", (c) => {
  return c.json({
    name: "Simple Access Control with Hono",
    model: "Bell-LaPadula",
    endpoints: [
      "POST /auth/login",
      "GET /documents",
      "GET /documents/:id",
      "POST /documents",
      "GET /audit/logs"
    ]
  });
});

app.post("/auth/login", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    await writeAuditLog({
      timestamp: new Date().toISOString(),
      action: "AUTH_LOGIN",
      outcome: "DENY",
      reason: "Payload invalido"
    });
    return c.json({ error: "Payload invalido." }, 400);
  }

  const { username, password } = parsed.data;
  const user = findUserByUsername(username);

  if (!user || user.password !== password) {
    await writeAuditLog({
      timestamp: new Date().toISOString(),
      actor: username,
      action: "AUTH_LOGIN",
      outcome: "DENY",
      reason: "Credenciais invalidas"
    });
    return c.json({ error: "Credenciais invalidas." }, 401);
  }

  const token = await issueToken(user);

  await writeAuditLog({
    timestamp: new Date().toISOString(),
    actor: user.username,
    action: "AUTH_LOGIN",
    outcome: "ALLOW"
  });

  return c.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      clearance: user.clearance,
      categories: user.categories
    }
  });
});

app.use("/documents/*", authMiddleware);
app.use("/audit/*", authMiddleware);

app.get("/documents", async (c) => {
  const user = c.get("user");
  const readable = documents.filter((doc) => canRead(user, doc));

  await writeAuditLog({
    timestamp: new Date().toISOString(),
    actor: user.username,
    action: "LIST_DOCUMENTS",
    outcome: "ALLOW"
  });

  return c.json({
    documents: readable.map((d) => ({
      id: d.id,
      title: d.title,
      classification: d.classification,
      categories: d.categories
    }))
  });
});

app.get("/documents/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const doc = findDocumentById(id);

  if (!doc) {
    await writeAuditLog({
      timestamp: new Date().toISOString(),
      actor: user.username,
      action: "READ_DOCUMENT",
      target: id,
      outcome: "DENY",
      reason: "Documento nao encontrado"
    });
    return c.json({ error: "Documento nao encontrado." }, 404);
  }

  if (!canRead(user, doc)) {
    await writeAuditLog({
      timestamp: new Date().toISOString(),
      actor: user.username,
      action: "READ_DOCUMENT",
      target: id,
      outcome: "DENY",
      reason: "Violacao Bell-LaPadula (no read up / categorias)"
    });
    return c.json({ error: "Acesso negado pela politica Bell-LaPadula." }, 403);
  }

  await writeAuditLog({
    timestamp: new Date().toISOString(),
    actor: user.username,
    action: "READ_DOCUMENT",
    target: id,
    outcome: "ALLOW"
  });

  return c.json({ document: doc });
});

app.post("/documents", async (c) => {
  const user = c.get("user");
  const body = await c.req.json().catch(() => null);
  const parsed = createDocumentSchema.safeParse(body);

  if (!parsed.success) {
    await writeAuditLog({
      timestamp: new Date().toISOString(),
      actor: user.username,
      action: "CREATE_DOCUMENT",
      outcome: "DENY",
      reason: "Payload invalido"
    });
    return c.json({ error: "Payload invalido." }, 400);
  }

  const exists = findDocumentById(parsed.data.id);
  if (exists) {
    await writeAuditLog({
      timestamp: new Date().toISOString(),
      actor: user.username,
      action: "CREATE_DOCUMENT",
      target: parsed.data.id,
      outcome: "DENY",
      reason: "ID ja existente"
    });
    return c.json({ error: "Ja existe documento com este ID." }, 409);
  }

  const docLevel = levelFromString(parsed.data.classification);
  if (!docLevel) {
    return c.json({ error: "Nivel de classificacao invalido." }, 400);
  }

  const newDoc: Document = {
    id: parsed.data.id,
    title: parsed.data.title,
    content: parsed.data.content,
    classification: docLevel,
    categories: parsed.data.categories,
    ownerId: user.id
  };

  if (!canWrite(user, newDoc)) {
    await writeAuditLog({
      timestamp: new Date().toISOString(),
      actor: user.username,
      action: "CREATE_DOCUMENT",
      target: newDoc.id,
      outcome: "DENY",
      reason: "Violacao Bell-LaPadula (no write down / categorias)"
    });
    return c.json({ error: "A escrita viola Bell-LaPadula." }, 403);
  }

  documents.push(newDoc);

  await writeAuditLog({
    timestamp: new Date().toISOString(),
    actor: user.username,
    action: "CREATE_DOCUMENT",
    target: newDoc.id,
    outcome: "ALLOW"
  });

  return c.json({ document: newDoc }, 201);
});

app.get("/audit/logs", async (c) => {
  const user = c.get("user");

  if (user.clearance !== "TOP_SECRET") {
    await writeAuditLog({
      timestamp: new Date().toISOString(),
      actor: user.username,
      action: "READ_AUDIT_LOGS",
      outcome: "DENY",
      reason: "Somente TOP_SECRET pode visualizar auditoria"
    });
    return c.json({ error: "Acesso negado." }, 403);
  }

  await writeAuditLog({
    timestamp: new Date().toISOString(),
    actor: user.username,
    action: "READ_AUDIT_LOGS",
    outcome: "ALLOW"
  });

  return c.text("Logs gravados em logs/audit.log (JSON Lines)");
});

const port = Number(process.env.PORT ?? 3000);

serve({
  fetch: app.fetch,
  port
});

console.log(`Servidor Hono executando em http://localhost:${port}`);
