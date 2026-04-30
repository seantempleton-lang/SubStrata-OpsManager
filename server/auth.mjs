import { createHash, randomBytes, randomInt, scryptSync, timingSafeEqual } from "node:crypto";

import { pool, query } from "./db.mjs";
import { getUserAuthoritySummary, normalizeAppRole } from "./authorization.mjs";

const SESSION_COOKIE_NAME = "substrata_session";
const SESSION_DURATION_DAYS = 30;
const PASSWORD_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const PASSWORD_LINK_DURATION_HOURS = 48;
const LOGIN_RATE_LIMIT_WINDOW_MINUTES = 10;
const MAX_LOGIN_FAILURES_PER_IDENTIFIER = 5;
const MAX_LOGIN_FAILURES_PER_IP = 12;
const ACCOUNT_LOCKOUT_FAILURES = 5;
const ACCOUNT_LOCKOUT_MINUTES = 15;

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function createStatusError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeLoginIdentifier(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized || null;
}

function normalizeAuditValue(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

function getRetryMinutes(futureTime) {
  const milliseconds = new Date(futureTime).getTime() - Date.now();
  return Math.max(1, Math.ceil(milliseconds / 60000));
}

function passwordLinkBaseUrl() {
  return process.env.APP_BASE_URL ? process.env.APP_BASE_URL.replace(/\/$/, "") : "";
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

export function buildPasswordLink(token, purpose = "invite") {
  const queryString = new URLSearchParams({
    passwordToken: token,
    passwordPurpose: purpose,
  }).toString();

  return `${passwordLinkBaseUrl()}/?${queryString}`;
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

export async function loginWithPassword(email, password, auditContext = {}) {
  const normalizedLogin = String(email || "").trim();
  const rawPassword = String(password || "");
  const loginIdentifier = normalizeLoginIdentifier(normalizedLogin);
  const ipAddress = normalizeAuditValue(auditContext?.ipAddress);
  const userAgent = normalizeAuditValue(auditContext?.userAgent);

  if (!normalizedLogin || !rawPassword) {
    throw new Error("Username and password are required.");
  }

  await enforceLoginRateLimit({ loginIdentifier, ipAddress, userAgent });

  const client = await pool.connect();
  let auditEvent = null;
  let transactionOpen = false;

  try {
    await client.query("begin");
    transactionOpen = true;

    const accountResult = await client.query(
      `
        select
          a.id as account_id,
          a.password_hash,
          a.user_id,
          a.failed_login_count,
          a.locked_until,
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
        for update
      `,
      [normalizeLoginUsername(normalizedLogin), normalizeLoginEmail(normalizedLogin)],
    );

    if (accountResult.rowCount === 0) {
      auditEvent = {
        eventType: "login_failed",
        loginIdentifier,
        ipAddress,
        userAgent,
        metadata: { reason: "unknown_login" },
      };
      throw createStatusError("Invalid username or password.", 401);
    }

    const account = accountResult.rows[0];
    account.app_role = normalizeAppRole(account.app_role);

    if (account.locked_until && new Date(account.locked_until).getTime() > Date.now()) {
      const retryAfterMinutes = getRetryMinutes(account.locked_until);
      auditEvent = {
        eventType: "login_locked",
        accountId: account.account_id,
        userId: account.user_id,
        loginIdentifier,
        ipAddress,
        userAgent,
        metadata: {
          lockedUntil: account.locked_until,
          retryAfterMinutes,
        },
      };
      throw createStatusError(
        `This account is temporarily locked after repeated sign-in failures. Try again in about ${retryAfterMinutes} minutes.`,
        429,
      );
    }

    if (!verifyPassword(rawPassword, account.password_hash)) {
      const failureUpdate = await client.query(
        `
          update app_auth_accounts
          set
            failed_login_count = failed_login_count + 1,
            last_failed_login_at = now(),
            locked_until = case
              when failed_login_count + 1 >= $2
                then now() + ($3 * interval '1 minute')
              else null
            end,
            updated_at = now()
          where id = $1
          returning failed_login_count, locked_until
        `,
        [account.account_id, ACCOUNT_LOCKOUT_FAILURES, ACCOUNT_LOCKOUT_MINUTES],
      );

      const failureState = failureUpdate.rows[0];
      const isLocked = Boolean(failureState?.locked_until);
      auditEvent = {
        eventType: "login_failed",
        accountId: account.account_id,
        userId: account.user_id,
        loginIdentifier,
        ipAddress,
        userAgent,
        metadata: {
          reason: "invalid_password",
          failedLoginCount: Number(failureState?.failed_login_count ?? 0),
          accountLocked: isLocked,
          lockedUntil: failureState?.locked_until ?? null,
        },
      };

      if (isLocked) {
        throw createStatusError(
          `This account is temporarily locked after repeated sign-in failures. Try again in about ${ACCOUNT_LOCKOUT_MINUTES} minutes.`,
          429,
        );
      }

      throw createStatusError("Invalid username or password.", 401);
    }

    const sessionToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

    const sessionInsert = await client.query(
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

    await client.query(
      `
        update app_auth_accounts
        set
          last_login_at = now(),
          failed_login_count = 0,
          last_failed_login_at = null,
          locked_until = null,
          updated_at = now()
        where id = $1
      `,
      [account.account_id],
    );

    await client.query("commit");
    transactionOpen = false;

    await recordAuthEvent({
      eventType: "login_succeeded",
      accountId: account.account_id,
      userId: account.user_id,
      sessionId: sessionInsert.rows[0].id,
      loginIdentifier,
      ipAddress,
      userAgent,
      metadata: {
        expiresAt: sessionInsert.rows[0].expires_at,
      },
    });

    return {
      sessionId: sessionInsert.rows[0].id,
      sessionToken,
      expiresAt: sessionInsert.rows[0].expires_at,
      user: normalizeUser(account),
    };
  } catch (error) {
    if (transactionOpen) {
      await client.query("rollback");
    }
    if (auditEvent) {
      await recordAuthEvent(auditEvent);
    }
    throw error;
  } finally {
    client.release();
  }
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

export async function revokeSession(sessionId, auditContext = {}) {
  if (!sessionId) return;

  const result = await query(
    `
      update app_sessions
      set
        revoked_at = now(),
        updated_at = now()
      where id = $1
      returning id, account_id
    `,
    [sessionId],
  );

  if (result.rowCount === 0) return;

  const accountResult = await query(
    `
      select user_id
      from app_auth_accounts
      where id = $1
      limit 1
    `,
    [result.rows[0].account_id],
  );

  await recordAuthEvent({
    eventType: "logout",
    accountId: result.rows[0].account_id,
    userId: accountResult.rows[0]?.user_id ?? null,
    sessionId: result.rows[0].id,
    ipAddress: auditContext?.ipAddress,
    userAgent: auditContext?.userAgent,
  });
}

function getQueryExecutor(client) {
  if (client?.query) {
    return client.query.bind(client);
  }

  return query;
}

export async function revokeAllUserSessions(userId, auditContext = {}, client = null) {
  if (!userId) return 0;

  const runQuery = getQueryExecutor(client);
  const revokedSessions = await runQuery(
    `
      update app_sessions s
      set
        revoked_at = now(),
        updated_at = now()
      from app_auth_accounts a
      where a.user_id = $1
        and s.account_id = a.id
        and s.revoked_at is null
      returning s.id, s.account_id
    `,
    [userId],
  );

  if (revokedSessions.rowCount === 0) {
    return 0;
  }

  await recordAuthEvent({
    eventType: "sessions_revoked",
    userId,
    accountId: revokedSessions.rows[0]?.account_id ?? null,
    ipAddress: auditContext?.ipAddress,
    userAgent: auditContext?.userAgent,
    metadata: {
      revokedSessionCount: revokedSessions.rowCount,
    },
    client,
  });

  return revokedSessions.rowCount;
}

export async function recordAuthEvent({
  eventType,
  accountId = null,
  userId = null,
  sessionId = null,
  loginIdentifier = null,
  ipAddress = null,
  userAgent = null,
  metadata = {},
  client = null,
}) {
  if (!eventType) return;

  const runQuery = getQueryExecutor(client);

  await runQuery(
    `
      insert into app_auth_events (
        event_type,
        account_id,
        user_id,
        session_id,
        login_identifier,
        ip_address,
        user_agent,
        metadata
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
    `,
    [
      eventType,
      accountId,
      userId,
      sessionId,
      normalizeLoginIdentifier(loginIdentifier),
      normalizeAuditValue(ipAddress),
      normalizeAuditValue(userAgent),
      JSON.stringify(metadata ?? {}),
    ],
  );
}

async function getRecentFailureCounts({ loginIdentifier = null, ipAddress = null }) {
  if (!loginIdentifier && !ipAddress) {
    return { identifierFailures: 0, ipFailures: 0 };
  }

  const result = await query(
    `
      select
        count(*) filter (
          where $1::text is not null
            and login_identifier = $1
        ) as identifier_failures,
        count(*) filter (
          where $2::text is not null
            and ip_address = $2
        ) as ip_failures
      from app_auth_events
      where event_type = 'login_failed'
        and created_at >= now() - ($3 * interval '1 minute')
    `,
    [loginIdentifier, ipAddress, LOGIN_RATE_LIMIT_WINDOW_MINUTES],
  );

  return {
    identifierFailures: Number(result.rows[0]?.identifier_failures ?? 0),
    ipFailures: Number(result.rows[0]?.ip_failures ?? 0),
  };
}

async function enforceLoginRateLimit({ loginIdentifier, ipAddress, userAgent }) {
  const { identifierFailures, ipFailures } = await getRecentFailureCounts({
    loginIdentifier,
    ipAddress,
  });

  const blockedByIdentifier =
    Boolean(loginIdentifier) && identifierFailures >= MAX_LOGIN_FAILURES_PER_IDENTIFIER;
  const blockedByIp = Boolean(ipAddress) && ipFailures >= MAX_LOGIN_FAILURES_PER_IP;

  if (!blockedByIdentifier && !blockedByIp) {
    return;
  }

  await recordAuthEvent({
    eventType: "login_rate_limited",
    loginIdentifier,
    ipAddress,
    userAgent,
    metadata: {
      windowMinutes: LOGIN_RATE_LIMIT_WINDOW_MINUTES,
      identifierFailures,
      ipFailures,
      blockedByIdentifier,
      blockedByIp,
    },
  });

  throw createStatusError(
    `Too many sign-in attempts. Please wait ${LOGIN_RATE_LIMIT_WINDOW_MINUTES} minutes and try again.`,
    429,
  );
}

export async function issuePasswordSetupToken({
  userId,
  purpose = "invite",
  createdByUserId = null,
  client = null,
  auditContext = null,
}) {
  const runQuery = getQueryExecutor(client);
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + PASSWORD_LINK_DURATION_HOURS * 60 * 60 * 1000);

  await runQuery(
    `
      update app_password_tokens
      set revoked_at = now()
      where user_id = $1
        and purpose = $2
        and consumed_at is null
        and revoked_at is null
    `,
    [userId, purpose],
  );

  await runQuery(
    `
      insert into app_password_tokens (
        user_id,
        token_hash,
        purpose,
        expires_at,
        created_by_user_id
      )
      values ($1, $2, $3, $4, $5)
    `,
    [userId, hashToken(token), purpose, expiresAt, createdByUserId],
  );

  await recordAuthEvent({
    eventType: "password_link_issued",
    userId,
    ipAddress: auditContext?.ipAddress,
    userAgent: auditContext?.userAgent,
    metadata: {
      purpose,
      expiresAt,
      createdByUserId,
    },
    client,
  });

  return {
    token,
    purpose,
    expiresAt,
    link: buildPasswordLink(token, purpose),
  };
}

export async function getPasswordTokenPreview(rawToken, auditContext = {}) {
  if (!rawToken) {
    throw new Error("Password token is required.");
  }

  const result = await query(
    `
      select
        pt.id,
        pt.purpose,
        pt.expires_at,
        pt.consumed_at,
        pt.revoked_at,
        u.id as user_id,
        u.full_name,
        u.email,
        u.login_username,
        u.is_active
      from app_password_tokens pt
      join app_users u on u.id = pt.user_id
      where pt.token_hash = $1
      limit 1
    `,
    [hashToken(rawToken)],
  );

  if (result.rowCount === 0) {
    await recordAuthEvent({
      eventType: "password_link_validation_failed",
      ipAddress: auditContext?.ipAddress,
      userAgent: auditContext?.userAgent,
      metadata: { reason: "invalid_token" },
    });
    throw new Error("This password link is invalid.");
  }

  const token = result.rows[0];

  if (!token.is_active) {
    await recordAuthEvent({
      eventType: "password_link_validation_failed",
      userId: token.user_id,
      ipAddress: auditContext?.ipAddress,
      userAgent: auditContext?.userAgent,
      metadata: { reason: "inactive_user", purpose: token.purpose },
    });
    throw new Error("This user is inactive.");
  }

  if (token.revoked_at || token.consumed_at) {
    await recordAuthEvent({
      eventType: "password_link_validation_failed",
      userId: token.user_id,
      ipAddress: auditContext?.ipAddress,
      userAgent: auditContext?.userAgent,
      metadata: { reason: "used_or_revoked", purpose: token.purpose },
    });
    throw new Error("This password link has already been used.");
  }

  if (new Date(token.expires_at).getTime() <= Date.now()) {
    await recordAuthEvent({
      eventType: "password_link_validation_failed",
      userId: token.user_id,
      ipAddress: auditContext?.ipAddress,
      userAgent: auditContext?.userAgent,
      metadata: { reason: "expired", purpose: token.purpose, expiresAt: token.expires_at },
    });
    throw new Error("This password link has expired.");
  }

  await recordAuthEvent({
    eventType: "password_link_validated",
    userId: token.user_id,
    ipAddress: auditContext?.ipAddress,
    userAgent: auditContext?.userAgent,
    metadata: {
      purpose: token.purpose,
      expiresAt: token.expires_at,
    },
  });

  return {
    purpose: token.purpose,
    expiresAt: token.expires_at,
    user: {
      id: token.user_id,
      name: token.full_name,
      email: token.email,
      username: token.login_username,
    },
  };
}

export async function completePasswordSetup(rawToken, password, auditContext = {}) {
  if (!rawToken) {
    throw new Error("Password token is required.");
  }

  const normalizedPassword = String(password ?? "");

  if (normalizedPassword.length < 10) {
    throw new Error("Password must be at least 10 characters long.");
  }

  const tokenHash = hashToken(rawToken);
  const client = await pool.connect();
  let successAudit = null;
  let failureAudit = null;
  let transactionOpen = false;

  try {
    await client.query("begin");
    transactionOpen = true;

    const tokenResult = await client.query(
      `
        select
          pt.id,
          pt.user_id,
          pt.purpose,
          pt.expires_at,
          pt.consumed_at,
          pt.revoked_at,
          u.email,
          u.login_username,
          u.full_name,
          u.is_active,
          aa.id as account_id
        from app_password_tokens pt
        join app_users u on u.id = pt.user_id
        left join app_auth_accounts aa on aa.user_id = u.id
        where pt.token_hash = $1
        for update
      `,
      [tokenHash],
    );

    if (tokenResult.rowCount === 0) {
      failureAudit = {
        eventType: "password_link_completion_failed",
        ipAddress: auditContext?.ipAddress,
        userAgent: auditContext?.userAgent,
        metadata: { reason: "invalid_token" },
      };
      throw new Error("This password link is invalid.");
    }

    const token = tokenResult.rows[0];

    if (!token.is_active) {
      failureAudit = {
        eventType: "password_link_completion_failed",
        userId: token.user_id,
        ipAddress: auditContext?.ipAddress,
        userAgent: auditContext?.userAgent,
        metadata: { reason: "inactive_user", purpose: token.purpose },
      };
      throw new Error("This user is inactive.");
    }

    if (token.revoked_at || token.consumed_at) {
      failureAudit = {
        eventType: "password_link_completion_failed",
        userId: token.user_id,
        ipAddress: auditContext?.ipAddress,
        userAgent: auditContext?.userAgent,
        metadata: { reason: "used_or_revoked", purpose: token.purpose },
      };
      throw new Error("This password link has already been used.");
    }

    if (new Date(token.expires_at).getTime() <= Date.now()) {
      failureAudit = {
        eventType: "password_link_completion_failed",
        userId: token.user_id,
        ipAddress: auditContext?.ipAddress,
        userAgent: auditContext?.userAgent,
        metadata: { reason: "expired", purpose: token.purpose, expiresAt: token.expires_at },
      };
      throw new Error("This password link has expired.");
    }

    const loginEmail = normalizeLoginEmail(token.email);
    if (!loginEmail) {
      failureAudit = {
        eventType: "password_link_completion_failed",
        userId: token.user_id,
        ipAddress: auditContext?.ipAddress,
        userAgent: auditContext?.userAgent,
        metadata: { reason: "missing_email", purpose: token.purpose },
      };
      throw new Error("A valid email address is required before setting a password.");
    }

    const passwordHash = createPasswordHash(normalizedPassword);

    await client.query(
      `
        insert into app_auth_accounts (
          user_id,
          login_email,
          password_hash,
          is_active,
          updated_at
        )
        values ($1, $2, $3, true, now())
        on conflict (user_id) do update
        set
          login_email = excluded.login_email,
          password_hash = excluded.password_hash,
          is_active = true,
          updated_at = now()
      `,
      [token.user_id, loginEmail, passwordHash],
    );

    await client.query(
      `
        update app_password_tokens
        set consumed_at = now()
        where id = $1
      `,
      [token.id],
    );

    if (token.account_id) {
      await client.query(
        `
          update app_sessions
          set
            revoked_at = now(),
            updated_at = now()
          where account_id = $1
            and revoked_at is null
        `,
        [token.account_id],
      );
    }

    successAudit = {
      eventType: "password_link_completed",
      accountId: token.account_id,
      userId: token.user_id,
      loginIdentifier: loginEmail,
      ipAddress: auditContext?.ipAddress,
      userAgent: auditContext?.userAgent,
      metadata: {
        purpose: token.purpose,
      },
    };

    await client.query("commit");
    transactionOpen = false;

    await recordAuthEvent(successAudit);

    return {
      purpose: token.purpose,
      user: {
        id: token.user_id,
        name: token.full_name,
        email: loginEmail,
        username: token.login_username,
      },
    };
  } catch (error) {
    if (transactionOpen) {
      await client.query("rollback");
    }
    if (failureAudit) {
      await recordAuthEvent(failureAudit);
    }
    throw error;
  } finally {
    client.release();
  }
}
