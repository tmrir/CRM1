import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies, headers } from "next/headers";

const PROFILE_SESSION_COOKIE = "pcx";
const SESSION_TTL_DAYS = 7;

function sha256(s: string) {
  return crypto.createHash("sha256").update(s, "utf8").digest("hex");
}
function base64url(buf: Buffer) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function newSessionId() {
  return base64url(crypto.randomBytes(32));
}

// Mock DB helpers - replace with your actual DB/ORM
const db = {
  profileLinkTokens: {
    findValid: async (tokenHash: string, now: Date) => {
      // TODO: implement real lookup
      return { charity_id: 1 }; // mock
    },
    markUsed: async (tokenHash: string, now: Date) => {
      // TODO: implement real mark used
    },
  },
  profileContextSessions: {
    create: async (row: any) => {
      // TODO: implement real insert
    },
  },
};

export async function GET(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const now = new Date();

  const tokenHash = sha256(token);

  const link = await db.profileLinkTokens.findValid(tokenHash, now);
  if (!link) {
    return NextResponse.redirect(new URL("/profile", req.url));
  }

  await db.profileLinkTokens.markUsed(tokenHash, now);

  const sessionId = newSessionId();
  const sessionHash = sha256(sessionId);
  const expiresAt = new Date(now.getTime() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await db.profileContextSessions.create({
    session_id_hash: sessionHash,
    charity_id: link.charity_id,
    expires_at: expiresAt,
  });

  const res = NextResponse.redirect(new URL("/profile", req.url));
  res.cookies.set({
    name: PROFILE_SESSION_COOKIE,
    value: sessionId,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return res;
}
