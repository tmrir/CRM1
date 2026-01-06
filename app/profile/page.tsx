"use client";

import { useState } from "react";

type Action = "interested" | "request_call" | "not_now";

export default function ProfilePage() {
  const [busy, setBusy] = useState<Action | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function send(action: Action) {
    setBusy(action);
    setMsg(null);
    try {
      const r = await fetch("/api/profile-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, hp: "" }),
      });
      const j = await r.json();
      setMsg({ ok: !!j.ok, text: j.message ?? (j.ok ? "تم" : "تعذر التنفيذ") });
    } catch {
      setMsg({ ok: false, text: "تعذر الاتصال بالخدمة. حاول لاحقًا." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-xl px-6 py-16">
        <h1 className="text-2xl font-semibold">بوابة ردّ الجمعية</h1>
        <p className="mt-3 text-sm text-neutral-600">
          اختر الإجراء المناسب ليتم تحديث حالة الجمعية في النظام وتسجيله تلقائيًا.
        </p>

        <div className="mt-10 space-y-3">
          <button className="w-full rounded-xl border bg-white px-4 py-4 text-right hover:bg-neutral-50 disabled:opacity-60"
            disabled={busy !== null} onClick={() => send("interested")}>
            {busy === "interested" ? "جارٍ الإرسال..." : "نرغب بالاطلاع والتواصل"}
          </button>

          <button className="w-full rounded-xl border bg-white px-4 py-4 text-right hover:bg-neutral-50 disabled:opacity-60"
            disabled={busy !== null} onClick={() => send("request_call")}>
            {busy === "request_call" ? "جارٍ الإرسال..." : "نحتاج اتصال هاتفي"}
          </button>

          <button className="w-full rounded-xl border bg-white px-4 py-4 text-right hover:bg-neutral-50 disabled:opacity-60"
            disabled={busy !== null} onClick={() => send("not_now")}>
            {busy === "not_now" ? "جارٍ الإرسال..." : "غير مناسب حاليًا"}
          </button>
        </div>

        {msg && (
          <div className={`mt-8 rounded-xl border px-4 py-3 text-sm ${msg.ok ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
            {msg.text}
          </div>
        )}
      </div>
    </main>
  );
}
