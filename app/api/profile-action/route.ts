import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies, headers } from "next/headers";

const PROFILE_SESSION_COOKIE = "pcx";
const RL_WINDOW_MS = 10 * 60 * 1000; // 10 min
const RL_MAX = 10;

type Action = "interested" | "request_call" | "not_now";

const ACTION_TO_STAGE: Record<Action, string> = {
  interested: "interested",
  request_call: "request_call",
  not_now: "not_now",
};

function sha256(s: string) {
  return crypto.createHash("sha256").update(s, "utf8").digest("hex");
}

function getClientIp(h: Headers): string {
  const xff = h.get("x-forwarded-for");
  return xff ? xff.split(",")[0].trim() : "0.0.0.0";
}

function ymd(d: Date) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Mock DB helpers - replace with your actual DB/ORM
const db = {
  tx: async (fn: any) => await fn(),
  profileContextSessions: {
    findValid: async (sessionHash: string, now: Date) => {
      // TODO: implement real lookup
      return { charity_id: 1 }; // mock
    },
    touch: async (sessionHash: string, now: Date) => {
      // TODO: implement real touch
    },
  },
  rateLimit: {
    consume: async ({ key_hash, window_start, max }: any) => true, // TODO: implement real RL
  },
  charities: {
    getById: async (charityId: number) => ({ stage: "new" }), // TODO: implement real lookup
    updateStage: async ({ charity_id, new_stage }: any) => {
      // TODO: implement real update
    },
  },
  charityEvents: {
    existsByIdempotencyKey: async (key: string) => false, // TODO: implement real check
    insert: async (event: any) => {
      // TODO: implement real insert
    },
  },
};

export async function POST(req: Request) {
  const h = await headers();

  if (h.get("origin") !== "https://tivro.sa") {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Bad request" }, { status: 400 });
  }

  const action = body?.action as Action | undefined;
  const hp = body?.hp as string | undefined;

  if (hp && hp.length > 0) {
    return NextResponse.json({ ok: true, message: "تم" }, { status: 200 });
  }

  if (!action || !(action in ACTION_TO_STAGE)) {
    return NextResponse.json({ ok: false, message: "Invalid action" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const sessionId = cookieStore.get(PROFILE_SESSION_COOKIE)?.value;
  if (!sessionId) {
    return NextResponse.json(
      { ok: false, message: "تعذر تحديد السياق. افتح رابط واتساب الأخير ثم حاول." },
      { status: 401 }
    );
  }

  const now = new Date();
  const sessionHash = sha256(sessionId);

  const session = await db.profileContextSessions.findValid(sessionHash, now);
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "انتهت صلاحية الجلسة. افتح رابط واتساب الأخير ثم حاول." },
      { status: 401 }
    );
  }

  const ip = getClientIp(h);
  const rlKeyHash = sha256(`${ip}:${sessionHash}`);
  const windowStart = new Date(Math.floor(now.getTime() / RL_WINDOW_MS) * RL_WINDOW_MS);

  const allowed = await db.rateLimit.consume({ key_hash: rlKeyHash, window_start: windowStart, max: RL_MAX });
  if (!allowed) {
    return NextResponse.json({ ok: false, message: "طلبات كثيرة. حاول لاحقًا." }, { status: 429 });
  }

  const charityId = session.charity_id;
  const stage = ACTION_TO_STAGE[action];
  const day = ymd(now);
  const idempotencyKey = sha256(`charity:${charityId}:action:${action}:day:${day}`);

  try {
    await db.tx(async (trx) => {
      const exists = await trx.charityEvents.existsByIdempotencyKey(idempotencyKey);
      if (exists) return;

      const charity = await trx.charities.getById(charityId);
      if (!charity) throw new Error("NOT_FOUND");

      if (charity.stage !== stage) {
        await trx.charities.updateStage({ charity_id: charityId, new_stage: stage });
      }

      await trx.charityEvents.insert({
        charity_id: charityId,
        action,
        stage,
        source: "profile_page",
        idempotency_key: idempotencyKey,
        created_at: now,
        ip,
        user_agent: h.get("user-agent") ?? null,
      });

      await trx.profileContextSessions.touch(sessionHash, now);
    });

    return NextResponse.json({ ok: true, message: "تم تسجيل الإجراء بنجاح. شكرًا لك." }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, message: "تعذر التنفيذ حاليًا." }, { status: 500 });
  }
}
