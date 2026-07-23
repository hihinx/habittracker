/** Worker：提供 habittracker.freyachou.workers.dev 静态站 + /api/state */
const STATE_KEY = "shared";

const EMPTY_PAYLOAD = {
  revision: 0,
  updatedAt: null,
  state: null,
};

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
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

const STATIC_CACHE = "public, max-age=3600";

async function fetchAsset(env, request) {
  const response = await env.ASSETS.fetch(request);
  const pathname = new URL(request.url).pathname;
  if (!response.ok) return response;
  const headers = new Headers(response.headers);
  if (/\.(html?|js|css|json)$/i.test(pathname) || pathname === "/") {
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    headers.set("Pragma", "no-cache");
  } else if (!headers.has("Cache-Control")) {
    headers.set("Cache-Control", STATIC_CACHE);
  }
  const body = await response.arrayBuffer();
  return new Response(body, { status: response.status, headers });
}

async function handleStateApi(request, env) {
  const kv = env.HABIT_STATE;
  if (!kv) {
    return new Response(JSON.stringify({ error: "KV binding HABIT_STATE missing" }), {
      status: 503,
      headers: JSON_HEADERS,
    });
  }

  if (request.method === "GET") {
    return new Response(JSON.stringify(await readState(kv)), { status: 200, headers: JSON_HEADERS });
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
      const sanitized = {
        reminderTime: state.reminderTime || "09:30",
        mulliganCredits: Number(state.mulliganCredits) || 0,
        habits: state.habits,
        focusSessions: Array.isArray(state.focusSessions) ? state.focusSessions : [],
        achievements: Array.isArray(state.achievements) ? state.achievements : [],
      };
      return new Response(JSON.stringify(await writeState(kv, sanitized)), {
        status: 200,
        headers: JSON_HEADERS,
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 400,
        headers: JSON_HEADERS,
      });
    }
  }

  return new Response("Method Not Allowed", { status: 405 });
}

export default {
  async fetch(request, env) {
    const pathname = new URL(request.url).pathname;
    if (pathname === "/api/state") {
      return handleStateApi(request, env);
    }
    if (pathname === "/lan-config.json" || pathname === "/data/lan-config.json") {
      return new Response("Not Found", { status: 404 });
    }
    return fetchAsset(env, request);
  },
};
