export const HABIT_TYPES = {
  daily: { id: "daily", label: "每日伴", badgeClass: "badge-daily" },
  general: { id: "general", label: "随心芽", badgeClass: "badge-general" },
};

export const DAILY_TARGET = 21;
export const GENERAL_DEFAULT_DAYS = 30;
export const GENERAL_DEFAULT_CHECKINS = 10;
export const MAX_FOCUS_PER_TYPE = 5;

export function typeInfo(type) {
  return HABIT_TYPES[type] || HABIT_TYPES.daily;
}

function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayKey() {
  return localDateKey();
}

export function dateKeyOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return localDateKey(d);
}

export function yesterdayKey() {
  return dateKeyOffset(-1);
}

export function addDays(dateKey, days) {
  const d = new Date(dateKey + "T12:00:00");
  d.setDate(d.getDate() + days);
  return localDateKey(d);
}

export function daysBetween(startKey, endKey) {
  const a = new Date(startKey + "T12:00:00");
  const b = new Date(endKey + "T12:00:00");
  return Math.round((b - a) / 86400000);
}

export function consecutiveStreak(checkIns) {
  if (!checkIns.length) return 0;
  const sorted = [...checkIns].sort();
  let streak = 1;
  for (let i = sorted.length - 1; i > 0; i--) {
    const diff = daysBetween(sorted[i - 1], sorted[i]);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

export function lastCheckinDate(checkIns) {
  if (!checkIns.length) return null;
  const sorted = [...checkIns].sort();
  return sorted[sorted.length - 1];
}

export function sessionEndDate(session) {
  if (session.type === "general") {
    return addDays(session.startDate, session.goalDays - 1);
  }
  return null;
}

export function daysRemaining(session) {
  if (session.type !== "general") return null;
  const end = sessionEndDate(session);
  return Math.max(0, daysBetween(todayKey(), end) + 1);
}

export function generalProgress(session) {
  const count = session.checkIns.length;
  const goal = session.goalCheckins;
  const pct = Math.min(100, Math.round((count / goal) * 100));
  return { count, goal, pct, daysLeft: daysRemaining(session) };
}

export function dailyProgress(session) {
  const streak = consecutiveStreak(session.checkIns);
  const pct = Math.min(100, Math.round((streak / DAILY_TARGET) * 100));
  return { streak, target: DAILY_TARGET, pct, day: streak };
}

export function stageDayForCompanion(session) {
  if (session.type === "general") {
    const { count, goal } = generalProgress(session);
    return Math.round((count / goal) * DAILY_TARGET);
  }
  return consecutiveStreak(session.checkIns);
}

export function typeToastLabel(type) {
  return type === "general" ? "随心芽" : "每日伴";
}

export function mulliganLabel(session) {
  const n = session.mulliganUsed || 0;
  return n > 0 ? ` · 补签×${n}` : "";
}
