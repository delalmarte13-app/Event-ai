import { randomUUID } from "crypto";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";

// Local/test-only sign-in that bypasses the real Manus OAuth server. It signs a
// session with the same JWT secret the app already trusts and upserts the user
// straight into the DB, so no external OAuth round-trip is required. Only
// mounted when DEV_LOGIN_ENABLED=true (never on by default).
const FORM_HTML = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Entrar (modo prueba) — EventAI</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0b0b0f; color: #f5f5f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    form { background: #17171f; padding: 2rem; border-radius: 12px; width: min(90vw, 360px); box-shadow: 0 10px 30px rgba(0,0,0,.4); }
    h1 { font-size: 1.1rem; margin: 0 0 1rem; }
    input { width: 100%; box-sizing: border-box; padding: .75rem; border-radius: 8px; border: 1px solid #333; background: #0b0b0f; color: #fff; font-size: 1rem; margin-bottom: 1rem; }
    button { width: 100%; padding: .75rem; border-radius: 8px; border: none; background: #d4af37; color: #111; font-weight: 600; font-size: 1rem; cursor: pointer; }
    p { font-size: .8rem; color: #999; margin-top: 1rem; }
  </style>
</head>
<body>
  <form method="post" action="/api/dev-login">
    <h1>Entrar a EventAI (modo prueba)</h1>
    <input name="name" placeholder="Tu nombre" maxlength="60" required autofocus />
    <button type="submit">Entrar</button>
    <p>Acceso de prueba local, sin contraseña. No usar en producción.</p>
  </form>
</body>
</html>`;

export function registerDevLoginRoutes(app: Express) {
  if (!ENV.devLoginEnabled) return;

  console.warn("[DevLogin] DEV_LOGIN_ENABLED=true — test sign-in route is active at /dev-login");

  app.get("/dev-login", (_req: Request, res: Response) => {
    res.set("content-type", "text/html; charset=utf-8").send(FORM_HTML);
  });

  app.post("/api/dev-login", async (req: Request, res: Response) => {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    if (!name) {
      res.status(400).json({ error: "name is required" });
      return;
    }

    try {
      const openId = `dev-${randomUUID()}`;

      await db.upsertUser({
        openId,
        name,
        email: null,
        loginMethod: "dev",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(openId, {
        name,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[DevLogin] Failed", error);
      res.status(500).json({ error: "dev login failed" });
    }
  });
}
