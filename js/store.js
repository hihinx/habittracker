import { randomCompanion, cloneCompanion } from "./plants.js";
import {
  todayKey,
  yesterdayKey,
  addDays,
  consecutiveStreak,
  lastCheckinDate,
  sessionEndDate,
  daysBetween,
  DAILY_TARGET,
  GENERAL_DEFAULT_DAYS,
  GENERAL_DEFAULT_CHECKINS,
  MAX_FOCUS_PER_TYPE,
} from "./habit-rules.js";

const STORAGE_KEY = "habit-tracker-v2";
const API_STATE = "/api/state";
const FETCH_TIMEOUT_MS = 6000;

async function fetchWithTimeout(url, options = {}, ms = FETCH_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

const DEFAULT_STATE = {
  reminderTime: "09:30",
  mulliganCredits: 0,
  habits: [],
  focusSessions: [],
  achievements: [],
};

function cloneData(obj) {
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(obj);
    } catch {
      /* fall through */
    }
  }
  return JSON.parse(JSON.stringify(obj));
}

function uid() {
  if (globalThis.crypto?.randomUUID) {
    try {
      return globalThis.crypto.randomUUID();
    } catch {
      /* non-secure context */
    }
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function migrateHabit(h) {
  return {
    goalDays: GENERAL_DEFAULT_DAYS,
    goalCheckins: GENERAL_DEFAULT_CHECKINS,
    type: "daily",
    ...h,
    type: h.type || "daily",
  };
}

function migrateSession(s) {
  const type = s.type || "daily";
  const session = {
    mulliganUsed: 0,
    mulliganDates: [],
    atRisk: false,
    ...s,
    type,
    goalDays: s.goalDays || GENERAL_DEFAULT_DAYS,
    goalCheckins: s.goalCheckins || GENERAL_DEFAULT_CHECKINS,
  };
  if (type === "general") {
    delete session.plant;
  } else if (!session.plant) {
    session.plant = randomCompanion();
  }
  return session;
}

function buildAchievementFromSession(session, habit) {
  const streak =
    session.type === "daily"
      ? consecutiveStreak(session.checkIns)
      : session.checkIns.length;
  return {
    id: uid(),
    sessionId: session.id,
    habitId: habit.id,
    habitName: habit.name,
    habitIcon: habit.icon,
    type: session.type || "daily",
    completedAt: session.completedAt || new Date().toISOString(),
    startDate: session.startDate,
    mulliganUsed: session.mulliganUsed || 0,
    streak: session.type === "daily" ? streak : undefined,
    checkIns: session.type === "general" ? session.checkIns.length : undefined,
    goalDays: session.goalDays,
    goalCheckins: session.goalCheckins,
    companion:
      session.type === "daily" && session.plant ? cloneCompanion(session.plant) : undefined,
  };
}

function migrateAchievements(state) {
  if (!Array.isArray(state.achievements)) state.achievements = [];

  for (const habit of state.habits) {
    if (habit.status === "honor") habit.status = "pool";
  }

  const hasSession = new Set(
    state.achievements.filter((a) => a.sessionId).map((a) => a.sessionId)
  );

  for (const session of state.focusSessions || []) {
    if (!session.completedAt || hasSession.has(session.id)) continue;
    const habit = state.habits.find((h) => h.id === session.habitId);
    if (!habit) continue;
    state.achievements.push(buildAchievementFromSession(session, habit));
    hasSession.add(session.id);
  }

  for (const a of state.achievements) {
    if (a.type === "general") {
      delete a.companion;
    }
    if (a.type === "daily" && !a.companion && a.sessionId) {
      const session = state.focusSessions.find((s) => s.id === a.sessionId);
      if (session?.plant) a.companion = cloneCompanion(session.plant);
    }
  }

  for (const habit of state.habits) {
    const recorded = state.achievements.filter((a) => a.habitId === habit.id).length;
    const missing = Math.max(0, (habit.completionCount || 0) - recorded);
    for (let i = 0; i < missing; i++) {
      state.achievements.push({
        id: uid(),
        sessionId: null,
        habitId: habit.id,
        habitName: habit.name,
        habitIcon: habit.icon,
        type: habit.type || "daily",
        completedAt: habit.updatedAt || new Date().toISOString(),
        startDate: null,
        mulliganUsed: 0,
        streak: habit.type === "general" ? undefined : habit.bestStreak || DAILY_TARGET,
        checkIns:
          habit.type === "general" ? habit.goalCheckins || GENERAL_DEFAULT_CHECKINS : undefined,
        goalDays: habit.goalDays,
        goalCheckins: habit.goalCheckins,
      });
    }
  }

  state.achievements.sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || ""));
}

function normalizeState(raw) {
  const habits = (raw?.habits || []).map(migrateHabit);
  const focusSessions = (raw?.focusSessions || []).map(migrateSession);
  const state = {
    ...cloneData(DEFAULT_STATE),
    ...raw,
    habits,
    focusSessions,
    achievements: raw?.achievements || [],
  };
  migrateAchievements(state);
  const habitIds = new Set(state.habits.map((h) => h.id));
  state.focusSessions = (state.focusSessions || []).filter((s) => habitIds.has(s.habitId));
  return state;
}

export class HabitStore {
  constructor() {
    this.state = cloneData(DEFAULT_STATE);
    this.revision = 0;
    this.syncEnabled = false;
    this._pushTimer = null;
    this._pendingEvents = [];
  }

  consumePendingEvents() {
    const events = [...this._pendingEvents];
    this._pendingEvents = [];
    return events;
  }

  _emit(event) {
    this._pendingEvents.push(event);
  }

  loadLocal() {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        raw = localStorage.getItem("habit-tracker-v1");
      }
      if (!raw) return cloneData(DEFAULT_STATE);
      return normalizeState(JSON.parse(raw));
    } catch {
      return cloneData(DEFAULT_STATE);
    }
  }

  saveLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  async fetchServer() {
    const res = await fetchWithTimeout(API_STATE, { cache: "no-store" });
    if (!res.ok) throw new Error(`server ${res.status}`);
    return res.json();
  }

  async pushServer() {
    if (!this.syncEnabled) return;
    const res = await fetchWithTimeout(API_STATE, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: this.state }),
    });
    if (!res.ok) throw new Error(`save failed ${res.status}`);
    const payload = await res.json();
    this.revision = payload.revision || this.revision;
  }

  applyServerPayload(payload) {
    if (!payload?.state || !Array.isArray(payload.state.habits)) return false;
    const incomingRev = payload.revision || 0;
    if (incomingRev <= this.revision && this.state.habits.length > 0) return false;
    this.state = normalizeState(payload.state);
    this.revision = incomingRev;
    this.evaluateSessions(false);
    this.saveLocal();
    return true;
  }

  async init() {
    const local = this.loadLocal();
    try {
      const payload = await this.fetchServer();
      this.syncEnabled = true;
      const serverHasData = payload.state && payload.state.habits?.length > 0;
      const localHasData = local.habits?.length > 0;

      if (serverHasData) {
        this.applyServerPayload(payload);
      } else if (localHasData) {
        this.state = normalizeState(local);
        this.evaluateSessions(false);
        await this.pushServer();
      } else {
        this.state = normalizeState(local);
      }
    } catch {
      this.state = normalizeState(local);
      this.evaluateSessions(false);
    }
    this.evaluateSessions(true);
    return this;
  }

  async syncFromServer() {
    if (!this.syncEnabled) return false;
    try {
      const payload = await this.fetchServer();
      const changed = this.applyServerPayload(payload);
      this.evaluateSessions(true);
      return changed;
    } catch {
      return false;
    }
  }

  save() {
    this.state.updatedAt = new Date().toISOString();
    this.saveLocal();
    if (!this.syncEnabled) return;
    clearTimeout(this._pushTimer);
    this._pushTimer = setTimeout(() => {
      this.pushServer().catch(() => {});
    }, 120);
  }

  getHabits() {
    return this.state.habits;
  }

  getHabit(id) {
    return this.state.habits.find((h) => h.id === id);
  }

  getFocusSessions(type = null) {
    return this.state.focusSessions.filter(
      (s) => s.active && (!type || s.type === type)
    );
  }

  getSession(habitId) {
    return this.state.focusSessions.find((s) => s.habitId === habitId && s.active);
  }

  focusSlotsRemaining(type) {
    return MAX_FOCUS_PER_TYPE - this.getFocusSessions(type).length;
  }

  poolHabits() {
    const focusedIds = new Set(this.getFocusSessions().map((s) => s.habitId));
    return this.state.habits.filter((h) => h.status === "pool" && !focusedIds.has(h.id));
  }

  getAchievements() {
    return [...(this.state.achievements || [])].sort((a, b) =>
      (b.completedAt || "").localeCompare(a.completedAt || "")
    );
  }

  _recordAchievement(session, habit) {
    if (!this.state.achievements) this.state.achievements = [];
    if (session.id && this.state.achievements.some((a) => a.sessionId === session.id)) {
      return this.state.achievements.find((a) => a.sessionId === session.id);
    }
    const achievement = buildAchievementFromSession(session, habit);
    this.state.achievements.unshift(achievement);
    return achievement;
  }

  focusedHabits(type = null) {
    const ids = this.getFocusSessions(type).map((s) => s.habitId);
    return this.state.habits.filter((h) => ids.includes(h.id));
  }

  addHabit({ name, icon, description = "", type = "daily", goalDays, goalCheckins }) {
    const habit = {
      id: uid(),
      name,
      icon,
      description,
      type,
      goalDays: type === "general" ? Number(goalDays) || GENERAL_DEFAULT_DAYS : undefined,
      goalCheckins:
        type === "general" ? Number(goalCheckins) || GENERAL_DEFAULT_CHECKINS : undefined,
      bestStreak: 0,
      attemptCount: 0,
      completionCount: 0,
      status: "pool",
      createdAt: new Date().toISOString(),
    };
    this.state.habits.push(habit);
    this.save();
    return habit;
  }

  updateHabit(id, patch) {
    const habit = this.getHabit(id);
    if (!habit) return null;
    if (this.getSession(id)) {
      throw new Error("聚焦中的习惯无法修改类型，请先暂时放弃");
    }
    Object.assign(habit, patch);
    if (habit.type === "daily") {
      delete habit.goalDays;
      delete habit.goalCheckins;
    }
    this.save();
    return habit;
  }

  deleteHabit(id) {
    const habit = this.getHabit(id);
    if (!habit) throw new Error("习惯不存在");
    if (this.getSession(id)) {
      throw new Error("聚焦中的习惯无法删除，请先暂时放弃");
    }
    if (habit.status !== "pool") {
      throw new Error("仅习惯池中的习惯可以删除");
    }
    this.state.habits = this.state.habits.filter((h) => h.id !== id);
    this.state.focusSessions = this.state.focusSessions.filter((s) => s.habitId !== id);
    this.save();
    return true;
  }

  adoptToFocus(habitId) {
    const habit = this.getHabit(habitId);
    if (!habit || habit.status !== "pool") {
      throw new Error("该习惯无法选入聚焦");
    }
    const type = habit.type || "daily";
    if (this.focusSlotsRemaining(type) <= 0) {
      throw new Error("聚焦坑位已满");
    }

    const today = todayKey();
    const session = {
      id: uid(),
      habitId,
      type,
      startDate: today,
      checkIns: [],
      mulliganUsed: 0,
      mulliganDates: [],
      atRisk: false,
      active: true,
      startedAt: new Date().toISOString(),
    };

    if (type === "daily") {
      session.plant = randomCompanion();
    } else {
      session.goalDays = habit.goalDays || GENERAL_DEFAULT_DAYS;
      session.goalCheckins = habit.goalCheckins || GENERAL_DEFAULT_CHECKINS;
      session.endDate = addDays(today, session.goalDays - 1);
    }

    habit.attemptCount += 1;
    this.state.focusSessions.push(session);
    this.save();
    return session;
  }

  _failSession(session, reason) {
    const habit = this.getHabit(session.habitId);
    session.active = false;
    session.failedAt = new Date().toISOString();
    session.failReason = reason;
    session.atRisk = false;

    const streak =
      session.type === "daily"
        ? consecutiveStreak(session.checkIns)
        : session.checkIns.length;
    if (streak > habit.bestStreak) habit.bestStreak = streak;

    habit.status = "pool";
    this._emit({ kind: "failed", session, habit, reason });
  }

  _completeSession(session) {
    const habit = this.getHabit(session.habitId);
    session.active = false;
    session.completedAt = session.completedAt || new Date().toISOString();
    session.atRisk = false;
    habit.completionCount += 1;
    this.state.mulliganCredits += 1;
    habit.status = "pool";

    const streak =
      session.type === "daily"
        ? consecutiveStreak(session.checkIns)
        : session.checkIns.length;
    if (streak > habit.bestStreak) habit.bestStreak = streak;

    const achievement = this._recordAchievement(session, habit);
    this._emit({ kind: "completed", session, habit, achievement });
  }

  evaluateSessions(emitEvents = true) {
    const today = todayKey();
    const yesterday = yesterdayKey();
    const eventsBefore = this._pendingEvents.length;

    for (const session of this.getFocusSessions()) {
      const habit = this.getHabit(session.habitId);
      if (!habit) continue;

      if (session.type === "daily") {
        const started = session.startDate <= yesterday;
        const hasYesterday = session.checkIns.includes(yesterday);
        const last = lastCheckinDate(session.checkIns);

        if (started && !hasYesterday && last && last < yesterday) {
          if (session.atRisk) {
            this._failSession(session, "missed_day");
            continue;
          }
          session.atRisk = true;
          if (emitEvents) {
            this._emit({ kind: "at_risk", session, habit, date: yesterday });
          }
          continue;
        }

        if (started && !hasYesterday && session.checkIns.length === 0 && session.startDate <= yesterday) {
          if (session.atRisk) {
            this._failSession(session, "missed_day");
            continue;
          }
          session.atRisk = true;
          if (emitEvents) {
            this._emit({ kind: "at_risk", session, habit, date: yesterday });
          }
          continue;
        }

        session.atRisk = false;
        const streak = consecutiveStreak(session.checkIns);
        if (streak >= DAILY_TARGET) {
          this._completeSession(session);
        }
      } else if (session.type === "general") {
        const end = sessionEndDate(session);
        const count = session.checkIns.length;

        if (count >= session.goalCheckins) {
          this._completeSession(session);
          continue;
        }

        if (today > end) {
          this._failSession(session, "deadline");
        }
      }
    }

    if (this._pendingEvents.length > eventsBefore) {
      this.save();
    }
  }

  abandonFocus(habitId) {
    const session = this.getSession(habitId);
    if (!session) throw new Error("未找到聚焦中的习惯");

    const habit = this.getHabit(habitId);
    session.active = false;
    session.abandonedAt = new Date().toISOString();
    session.atRisk = false;

    const streak =
      session.type === "daily"
        ? consecutiveStreak(session.checkIns)
        : session.checkIns.length;
    if (streak > habit.bestStreak) habit.bestStreak = streak;

    habit.status = "pool";
    this.save();
    return habit;
  }

  isCheckedInToday(session) {
    return session.checkIns.includes(todayKey());
  }

  checkIn(habitId) {
    const session = this.getSession(habitId);
    if (!session) throw new Error("该习惯不在聚焦中");
    if (this.isCheckedInToday(session)) throw new Error("今日已打卡");

    if (session.type === "daily" && session.atRisk) {
      throw new Error("昨日未打卡，请先使用补签挽救");
    }

    const today = todayKey();
    session.checkIns.push(today);
    session.checkIns.sort();

    const habit = this.getHabit(habitId);
    const streak =
      session.type === "daily"
        ? consecutiveStreak(session.checkIns)
        : session.checkIns.length;
    if (streak > habit.bestStreak) habit.bestStreak = streak;

    let completed = false;
    if (session.type === "daily" && streak >= DAILY_TARGET) {
      this._completeSession(session);
      completed = true;
    } else if (session.type === "general" && session.checkIns.length >= session.goalCheckins) {
      this._completeSession(session);
      completed = true;
    }

    this.save();
    return { session, habit, completed, mulliganEarned: completed };
  }

  useMulligan(habitId, dateKey) {
    if (this.state.mulliganCredits <= 0) {
      throw new Error("没有可用的补签机会");
    }
    const session = this.getSession(habitId);
    if (!session) throw new Error("该习惯不在聚焦中");
    if (session.checkIns.includes(dateKey)) {
      throw new Error("该日期已打卡");
    }

    const today = todayKey();
    if (dateKey > today) throw new Error("不能补签未来日期");

    if (session.type === "general") {
      const end = sessionEndDate(session);
      if (dateKey < session.startDate || dateKey > end) {
        throw new Error("补签日期须在挑战期限内");
      }
    }

    session.checkIns.push(dateKey);
    session.checkIns.sort();
    session.mulliganUsed = (session.mulliganUsed || 0) + 1;
    session.mulliganDates = [...(session.mulliganDates || []), dateKey];

    if (session.type === "daily" && dateKey === yesterdayKey()) {
      session.atRisk = false;
    }

    const habit = this.getHabit(habitId);
    const streak =
      session.type === "daily"
        ? consecutiveStreak(session.checkIns)
        : session.checkIns.length;
    if (streak > habit.bestStreak) habit.bestStreak = streak;

    if (session.type === "daily" && streak >= DAILY_TARGET) {
      this._completeSession(session);
    } else if (session.type === "general" && session.checkIns.length >= session.goalCheckins) {
      this._completeSession(session);
    }

    this.state.mulliganCredits -= 1;
    this.save();
    return session;
  }

  exportSnapshot() {
    return {
      version: 3,
      exportedAt: new Date().toISOString(),
      state: cloneData(this.state),
    };
  }

  setReminderTime(time) {
    this.state.reminderTime = time;
    this.save();
  }

  getReminderTime() {
    return this.state.reminderTime;
  }

  getMulliganCredits() {
    return this.state.mulliganCredits;
  }

  isSyncEnabled() {
    return this.syncEnabled;
  }

  importSnapshot(raw) {
    let payload;
    try {
      payload = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      throw new Error("导入内容格式不正确，请检查后重试");
    }
    const data = payload.state || payload;
    if (!data || !Array.isArray(data.habits)) {
      throw new Error("无效的数据格式");
    }
    this.state = normalizeState(data);
    this.evaluateSessions(false);
    this.save();
    return this.state;
  }

  seedFromConfig(config) {
    if (this.state.habits.length > 0) return false;

    for (const h of config.habits) {
      const habit = {
        id: uid(),
        name: h.name,
        icon: h.icon,
        description: "",
        type: "daily",
        bestStreak: h.bestStreak,
        attemptCount: h.attemptCount,
        completionCount: h.bestStreak >= 21 ? 1 : 0,
        status: "pool",
        createdAt: new Date().toISOString(),
      };
      this.state.habits.push(habit);

      if (h.inFocus && h.currentDay > 0) {
        const companion = randomCompanion();
        const checkIns = [];
        for (let i = 0; i < h.currentDay; i++) {
          const d = new Date();
          d.setDate(d.getDate() - (h.currentDay - 1 - i));
          checkIns.push(d.toISOString().slice(0, 10));
        }
        this.state.focusSessions.push({
          id: uid(),
          habitId: habit.id,
          type: "daily",
          plant: companion,
          startDate: checkIns[0] || todayKey(),
          checkIns,
          mulliganUsed: 0,
          mulliganDates: [],
          atRisk: false,
          active: true,
          startedAt: new Date().toISOString(),
        });
      }
    }

    this.state.reminderTime = config.reminderTime || "09:30";
    this.save();
    return true;
  }
}
