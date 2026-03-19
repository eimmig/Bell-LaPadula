import { createMiddleware } from "hono/factory";
import { sign, verify } from "hono/jwt";
import type { User } from "./models.js";
import { findUserById } from "./data.js";

const jwtSecret = process.env.JWT_SECRET ?? "dev-secret-change-me";

type JwtPayload = {
  sub: string;
  username: string;
  clearance: string;
  categories: string[];
  exp: number;
};

export async function issueToken(user: User) {
  const now = Math.floor(Date.now() / 1000);
  const payload: JwtPayload = {
    sub: user.id,
    username: user.username,
    clearance: user.clearance,
    categories: user.categories,
    exp: now + 60 * 60
  };

  return sign(payload, jwtSecret);
}

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Token ausente." }, 401);
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const payload = (await verify(token, jwtSecret, "HS256")) as JwtPayload;
    const user = findUserById(payload.sub);

    if (!user) {
      return c.json({ error: "Usuario do token nao encontrado." }, 401);
    }

    c.set("user", user);
    await next();
  } catch {
    return c.json({ error: "Token invalido ou expirado." }, 401);
  }
});
