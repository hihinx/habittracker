const CACHE = "habit-tracker-v3";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

/** Always fetch fresh files — do not serve stale cached HTML/JS. */
self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

self.addEventListener("message", (e) => {
  if (e.data?.type === "SCHEDULE_REMINDER") {
    scheduleReminder(e.data.time);
  }
});

async function scheduleReminder(time) {
  const [hh, mm] = time.split(":").map(Number);
  const now = new Date();
  const next = new Date();
  next.setHours(hh, mm, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);

  const delay = next.getTime() - now.getTime();
  setTimeout(async () => {
    await self.registration.showNotification("🌱 习惯提醒", {
      body: "上午好！今天的习惯打卡准备好了吗？",
      icon: "./manifest.json",
      tag: "daily-reminder",
    });
    scheduleReminder(time);
  }, delay);
}
