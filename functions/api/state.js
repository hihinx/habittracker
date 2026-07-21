/** Cloudflare Pages Function — 替代本地 serve.py 的 /api/state */
const STATE_KEY = "shared";

const EMPTY_PAYLOAD = {
  revision: 0,
  updatedAt: null,
  state: null,
};

async function readState(kv) {
  const payload = await kv.get(STATE_KEY, "json");
  return payload || { ...EMPTY_PAYLOAD };
}

async function writeState(kv, state) {
  const current = await readState(kv);
  const payload = {
    revision: (current.revision || 0) + 1,
    updatedAt: new Date().toISOString(),
    state,
  };
  await kv.put(STATE_KEY, JSON.stringify(payload));
  return payload;
}

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

export async function onRequest(context) {
  const { request, env } = context;
  const kv = env.HABIT_STATE;

  if (!kv) {
    return new Response(JSON.stringify({ error: "KV binding HABIT_STATE missing" }), {
      status: 503,
      headers: JSON_HEADERS,
    });
  }

  if (request.method === "GET") {
    const payload = await readState(kv);
    return new Response(JSON.stringify(payload), { status: 200, headers: JSON_HEADERS });
  }

  if (request.method === "PUT") {
    try {
      const body = await request.json();
      const state = body?.state;
      if (!state || typeof state !== "object" || !Array.isArray(state.habits)) {
        return new Response(JSON.stringify({ error: "invalid state" }), {
          status: 400,
          headers: JSON_HEADERS,
        });
      }
      const saved = await writeState(kv, state);
      return new Response(JSON.stringify(saved), { status: 200, headers: JSON_HEADERS });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 400,
        headers: JSON_HEADERS,
      });
    }
  }

  return new Response("Method Not Allowed", { status: 405 });
}
