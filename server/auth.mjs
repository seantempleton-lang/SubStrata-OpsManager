import { createHash, randomBytes, randomInt, scryptSync, timingSafeEqual } from "node:crypto";

import { query } from "./db.mjs";
import { getUserAuthoritySummary, normalizeAppRole } from "./authorization.mjs";

const SESSION_COOKIE_NAME = "substrata_session";
const SESSION_DURATION_DAYS = 30;
const PASSWORD_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function parseCookies(headerValue = "") {
  return headerValue
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((accumulator, part) => {
      const separator = part.indexOf("=");
      if (separator <= 0) return accumulator;
      const name = part.slice(0, separator);
      const value = part.slice(separator + 1);
      accumulator[name] = decodeURIComponent(value);
      return accumulator;
    }, {});
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (options.maxAge != null) parts.push(`Max-Age=${options.maxAge}`);
  if (options.httpOnly !== false) parts.push("HttpOnly");
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.secure) parts.push("Secure");
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);

  return parts.join("; ");
}

function verifyPassword(password, storedHash) {
  if (!storedHash) return false;

  const [algorithm, salt, hash] = storedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !hash) return false;

  const derived = scryptSync(password, salt, Buffer.from(hash, "hex").length);
  const existing = Buffer.from(hash, "hex");

  return existing.length === derived.length && timingSafeEqual(existing, derived);
}

export function normalizeLoginEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function normalizeLoginUsername(username) {
  return String(username || "").trim().replace(/[^A-Za-z0-9]/g, "");
}

export function generateLoginUsername(fullName, fallback = "User") {
  const cleaned = normalizeLoginUsername(fullName);
  return cleaned || normalizeLoginUsername(fallback) || "User";
}

export function createPasswordHash(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64);
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export function generateRandomPassword(length = 10) {
  const targetLength = Math.max(10, length);
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";

  const password = [
    upper[randomInt(upper.length)],
    lower[randomInt(lower.length)],
    digits[randomInt(digits.length)],
  ];

  while (password.length < targetLength) {
    password.push(PASSWORD_ALPHABET[randomInt(PASSWORD_ALPHABET.length)]);
  }

  for (let index = password.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [password[index], password[swapIndex]] = [password[swapIndex], password[index]];
  }

  return password.join("");
}

function normalizeUser(row) {
  if (!row) return null;

  const authority = getUserAuthoritySummary({
    appRole: row.app_role,
  });

  return {
    dbId: row.user_id,
    id: row.employee_code,
    username: row.login_username,
    name: row.full_name,
    initials: row.initials,
    role: row.role_title,
    roleTitle: row.role_title,
    appRole: authority.appRole,
    appRoleRank: authority.appRoleRank,
    division: row.division,
    region: row.region,
    email: row.email,
    phone: row.phone,
  };
}

export function clearSessionCookie(res) {
  res.setHeader(
    "Set-Cookie",
    serializeCookie(SESSION_COOKIE_NAME, "", {
      path: "/",
      sameSite: "Lax",
      httpOnly: true,
      maxAge: 0,
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
    }),
  );
}

export async function getSessionFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie);
  const sessionToken = cookies[SESSION_COOKIE_NAME];
  if (!sessionToken) return null;

  const sessionResult = await query(
    `
      select
        s.id as session_id,
        s.account_id,
        s.expires_at,
        a.user_id,
        u.employee_code,
        u.login_username,
        u.full_name,
        u.initials,
        u.role_title,
        u.app_role,
        u.division,
        u.region,
        u.email,
        u.phone
      from app_sessions s
      join app_auth_accounts a on a.id = s.account_id
      join app_users u on u.id = a.user_id
      where s.session_token_hash = $1
        and s.revoked_at is null
        and s.expires_at > now()
        and a.is_active = true
        and u.is_active = true
      limit 1
    `,
    [hashToken(sessionToken)],
  );

  if (sessionResult.rowCount === 0) {
    return null;
  }

  const row = sessionResult.rows[0];

  await query(
    `
      update app_sessions
      set
        last_seen_at = now(),
        updated_at = now()
      where id = $1
    `,
    [row.session_id],
  );

  return {
    sessionId: row.session_id,
    accountId: row.account_id,
    expiresAt: row.expires_at,
    user: normalizeUser(row),
  };
}

export async function requireAuth(req, res, next) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      clearSessionCookie(res);
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    req.auth = session;
    next();
  } catch (error) {
    next(error);
  }
}

export async function loginWithPassword(email, password) {
  const normalizedLogin = String(email || "").trim();
  const rawPassword = String(password || "");

  if (!normalizedLogin || !rawPassword) {
    throw new Error("Username and password are required.");
  }

  const accountResult = await query(
    `
      select
        a.id as account_id,
        a.password_hash,
        a.user_id,
        u.employee_code,
        u.login_username,
        u.full_name,
        u.initials,
        u.role_title,
        u.app_role,
        u.division,
        u.region,
        u.email,
        u.phone
      from app_auth_accounts a
      join app_users u on u.id = a.user_id
      where (
        lower(u.login_username) = lower($1)
        or lower(a.login_email) = $2
      )
        and a.is_active = true
        and u.is_active = true
      limit 1
    `,
    [normalizeLoginUsername(normalizedLogin), normalizeLoginEmail(normalizedLogin)],
  );

  if (accountResult.rowCount === 0) {
    throw new Error("Invalid email or password.");
  }

  const account = accountResult.rows[0];
  account.app_role = normalizeAppRole(account.app_role);
  if (!verifyPassword(rawPassword, account.password_hash)) {
    throw new Error("Invalid email or password.");
  }

  const sessionToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  const sessionInsert = await query(
    `
      insert into app_sessions (
        account_id,
        session_token_hash,
        expires_at,
        last_seen_at
      )
      values ($1, $2, $3, now())
      returning id, expires_at
    `,
    [account.account_id, hashToken(sessionToken), expiresAt],
  );

  await query(
    `
      update app_auth_accounts
      set
        last_login_at = now(),
        updated_at = now()
      where id = $1
    `,
    [account.account_id],
  );

  return {
    sessionId: sessionInsert.rows[0].id,
    sessionToken,
    expiresAt: sessionInsert.rows[0].expires_at,
    user: normalizeUser(account),
  };
}

export function setSessionCookie(res, sessionToken, expiresAt) {
  res.setHeader(
    "Set-Cookie",
    serializeCookie(SESSION_COOKIE_NAME, sessionToken, {
      path: "/",
      sameSite: "Lax",
      httpOnly: true,
      maxAge: Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
      expires: new Date(expiresAt),
      secure: process.env.NODE_ENV === "production",
    }),
  );
}

export async function revokeSession(sessionId) {
  if (!sessionId) return;

  await query(
    `
      update app_sessions
      set
        revoked_at = now(),
        updated_at = now()
      where id = $1
    `,
    [sessionId],
  );
}
