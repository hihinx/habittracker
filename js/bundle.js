(() => {
  // js/plants.js
  var PLANT_TIERS = {
    flower: { id: "flower", label: "\u5C0F\u82B1", maxDays: 7 },
    bush: { id: "bush", label: "\u704C\u6728", maxDays: 21 },
    tree: { id: "tree", label: "\u4E54\u6728", maxDays: Infinity }
  };
  var PLANT_TYPES = [
    { id: "daisy", name: "\u96CF\u83CA", kind: "plant", tier: "flower", emoji: "\u{1F33C}", stages: ["\u{1F330}", "\u{1F331}", "\u{1F33F}", "\u{1F33C}"] },
    { id: "clover", name: "\u4E09\u53F6\u8349", kind: "plant", tier: "flower", emoji: "\u2618\uFE0F", stages: ["\u{1F330}", "\u{1F331}", "\u2618\uFE0F", "\u{1F340}"] },
    { id: "tulip", name: "\u90C1\u91D1\u9999", kind: "plant", tier: "flower", emoji: "\u{1F337}", stages: ["\u{1F330}", "\u{1F331}", "\u{1F337}", "\u{1F337}"] },
    { id: "lavender", name: "\u85B0\u8863\u8349\u4E1B", kind: "plant", tier: "bush", emoji: "\u{1F49C}", stages: ["\u{1F330}", "\u{1F331}", "\u{1F33F}", "\u{1F490}"] },
    { id: "succulent", name: "\u591A\u8089\u4E1B", kind: "plant", tier: "bush", emoji: "\u{1FAB4}", stages: ["\u{1FAD8}", "\u{1F331}", "\u{1FAB4}", "\u{1F3F5}\uFE0F"] },
    { id: "rose", name: "\u73AB\u7470\u4E1B", kind: "plant", tier: "bush", emoji: "\u{1F339}", stages: ["\u{1F330}", "\u{1F331}", "\u{1F33F}", "\u{1F339}"] },
    { id: "cherry", name: "\u6A31\u82B1\u6811", kind: "plant", tier: "tree", emoji: "\u{1F338}", stages: ["\u{1F330}", "\u{1F331}", "\u{1F333}", "\u{1F338}"] },
    { id: "bamboo", name: "\u7AF9", kind: "plant", tier: "tree", emoji: "\u{1F38B}", stages: ["\u{1F330}", "\u{1F331}", "\u{1F38B}", "\u{1F38D}"] },
    { id: "sunflower", name: "\u5411\u65E5\u8475", kind: "plant", tier: "tree", emoji: "\u{1F33B}", stages: ["\u{1F330}", "\u{1F331}", "\u{1F33F}", "\u{1F33B}"] }
  ];
  var PET_TYPES = [
    { id: "fox", name: "\u5C0F\u72D0\u72F8", kind: "pet", emoji: "\u{1F98A}", stages: ["\u{1F95A}", "\u{1F423}", "\u{1F425}", "\u{1F98A}"] },
    { id: "cat", name: "\u5C0F\u732B\u54AA", kind: "pet", emoji: "\u{1F431}", stages: ["\u{1F95A}", "\u{1F423}", "\u{1F431}", "\u{1F63A}"] },
    { id: "dog", name: "\u5C0F\u72D7\u72D7", kind: "pet", emoji: "\u{1F436}", stages: ["\u{1F95A}", "\u{1F423}", "\u{1F415}", "\u{1F436}"] },
    { id: "rabbit", name: "\u5C0F\u5154\u5B50", kind: "pet", emoji: "\u{1F430}", stages: ["\u{1F95A}", "\u{1F423}", "\u{1F407}", "\u{1F430}"] },
    { id: "panda", name: "\u5C0F\u718A\u732B", kind: "pet", emoji: "\u{1F43C}", stages: ["\u{1F95A}", "\u{1F423}", "\u{1F43B}", "\u{1F43C}"] },
    { id: "dragon", name: "\u5C0F\u9F99", kind: "pet", emoji: "\u{1F432}", stages: ["\u{1F95A}", "\u{1F423}", "\u{1F98E}", "\u{1F432}"] },
    { id: "owl", name: "\u5C0F\u732B\u5934\u9E70", kind: "pet", emoji: "\u{1F989}", stages: ["\u{1F95A}", "\u{1F423}", "\u{1F425}", "\u{1F989}"] },
    { id: "bear", name: "\u5C0F\u718A", kind: "pet", emoji: "\u{1F43B}", stages: ["\u{1F95A}", "\u{1F423}", "\u{1F9F8}", "\u{1F43B}"] }
  ];
  function plantTierForGoalDays(goalDays) {
    if (goalDays <= PLANT_TIERS.flower.maxDays) return "flower";
    if (goalDays <= PLANT_TIERS.bush.maxDays) return "bush";
    return "tree";
  }
  function plantsInTier(tier) {
    return PLANT_TYPES.filter((p) => p.tier === tier);
  }
  function randomPet() {
    return PET_TYPES[Math.floor(Math.random() * PET_TYPES.length)];
  }
  function plantForGoalDays(goalDays) {
    const tier = plantTierForGoalDays(goalDays);
    const pool = plantsInTier(tier);
    return pool[Math.floor(Math.random() * pool.length)] || PLANT_TYPES[0];
  }
  function stageIndex(day) {
    if (day <= 0) return 0;
    if (day <= 7) return 1;
    if (day <= 14) return 2;
    return 3;
  }
  function generalStageIndex(count, goal) {
    if (count <= 0) return 0;
    const ratio = Math.min(1, count / goal);
    if (ratio >= 1) return 3;
    if (ratio > 0.75) return 3;
    if (ratio > 0.25) return 2;
    return 1;
  }
  var FLEX_GROWTH_STAGES = ["\u{1F330}", "\u{1F331}", "\u{1F33F}", "\u{1F338}"];
  function flexGrowthEmoji(count, goal) {
    return FLEX_GROWTH_STAGES[generalStageIndex(count, goal)];
  }
  function flexGrowthStageLabels() {
    return ["\u79CD\u5B50", "\u53D1\u82BD", "\u751F\u957F", "\u7EFD\u653E"];
  }
  function companionStageEmoji(companion, day, count, goal) {
    var _a;
    if (!((_a = companion == null ? void 0 : companion.stages) == null ? void 0 : _a.length)) return "\u{1F331}";
    if (count != null && goal != null) {
      return companion.stages[generalStageIndex(count, goal)];
    }
    return companion.stages[stageIndex(day)];
  }
  function stageLabel(day, kind = "pet") {
    if (kind === "pet") {
      if (day <= 0) return "\u5F85\u5B75\u5316";
      if (day <= 7) return "\u5E7C\u4F53\u671F";
      if (day <= 14) return "\u5C11\u5E74\u671F";
      if (day < 21) return "\u8FDB\u5316\u524D\u5915";
      return "\u5B8C\u5168\u8FDB\u5316";
    }
    if (day <= 0) return "\u5F85\u64AD\u79CD";
    if (day <= 7) return "\u53D1\u82BD\u671F";
    if (day <= 14) return "\u6210\u957F\u671F";
    if (day < 21) return "\u542B\u82DE\u671F";
    return "\u5B8C\u5168\u7EFD\u653E";
  }
  function flexStageLabel(count, goal) {
    if (count <= 0) return "\u5F85\u64AD\u79CD";
    if (count >= goal) return "\u5B8C\u5168\u7EFD\u653E";
    const ratio = count / goal;
    if (ratio <= 0.25) return "\u53D1\u82BD\u671F";
    if (ratio <= 0.5) return "\u6210\u957F\u671F";
    if (ratio <= 0.75) return "\u542B\u82DE\u671F";
    return "\u7EFD\u653E\u524D\u5915";
  }
  function completionText(companion) {
    const kind = (companion == null ? void 0 : companion.kind) || "pet";
    return kind === "pet" ? "\u5B8C\u5168\u8FDB\u5316\u4E86" : "\u5B8C\u5168\u7EFD\u653E\u4E86";
  }
  function focusWelcomeTitle() {
    return "\u4F60\u83B7\u5F97\u4E86\u4E00\u679A\u5BA0\u7269\u86CB\uFF01";
  }
  function focusWelcomeMsg(companion) {
    const name = (companion == null ? void 0 : companion.name) || "\u65B0\u4F19\u4F34";
    return `\u8FDE\u7EED\u5582\u517B 21 \u5929\uFF0C\u5E2E${name}\u7684\u86CB\u5B75\u5316\u6210\u4F19\u4F34\u5427\uFF5E`;
  }
  function flexWelcomeTitle() {
    return "\u4F60\u83B7\u5F97\u4E86\u4E00\u9897\u79CD\u5B50\uFF01";
  }
  function flexWelcomeMsg(goalDays, goalCheckins) {
    return `${goalDays} \u5929\u5185\u5B8C\u6210 ${goalCheckins} \u6B21\u6253\u5361\uFF0C\u5E2E\u79CD\u5B50\u6162\u6162\u53D1\u82BD\u5427\uFF5E`;
  }
  function careVerb(companion) {
    return ((companion == null ? void 0 : companion.kind) || "pet") === "pet" ? "\u5582\u517B" : "\u5B8C\u6210";
  }
  function evolutionStageLabels(kind = "pet") {
    return kind === "pet" ? ["\u80DA\u80CE", "\u5E7C\u4F53\u671F", "\u5C11\u5E74\u671F", "\u5B8C\u5168\u8FDB\u5316"] : ["\u79CD\u5B50", "\u53D1\u82BD\u671F", "\u6210\u957F\u671F", "\u5B8C\u5168\u7EFD\u653E"];
  }
  function cloneCompanion(companion) {
    if (!companion) return null;
    return { ...companion, stages: [...companion.stages || []] };
  }
  var CHEER_MESSAGES = [
    "\u592A\u68D2\u4E86\uFF01\u4F60\u53C8\u8BA9\u8FD9\u4E2A\u5C0F\u751F\u547D\u8301\u58EE\u4E86\u4E00\u5206\uFF01",
    "\u4ECA\u5929\u7684\u4F60\uFF0C\u503C\u5F97\u4E3A\u81EA\u5DF1\u9A84\u50B2",
    "\u575A\u6301\u7684\u4EBA\uFF0C\u8FD0\u6C14\u90FD\u4E0D\u4F1A\u592A\u5DEE\uFF01",
    "\u53C8\u5B8C\u6210\u4E00\u5929\uFF01\u4F60\u7684\u672A\u6765\u4F1A\u611F\u8C22\u73B0\u5728\u7684\u4F60\u3002",
    "\u5C0F\u5C0F\u7684\u6253\u5361\uFF0C\u5927\u5927\u7684\u6210\u957F",
    "\u4F60\u6BD4\u6628\u5929\u66F4\u4F18\u79C0\u4E86\uFF01",
    "21 \u5929\u7684\u5947\u8FF9\uFF0C\u6B63\u5728\u4E00\u5929\u5929\u751F\u6839\u3002",
    "\u8FD9\u4EFD\u575A\u6301\uFF0C\u7EC8\u4F1A\u5F00\u51FA\u6700\u7F8E\u7684\u82B1\u3002",
    "\u6253\u5361\u6210\u529F\uFF01\u4ECA\u5929\u7684\u9633\u5149\u4E3A\u4F60\u800C\u4EAE",
    "\u4E86\u4E0D\u8D77\uFF01\u4E60\u60EF\u6B63\u5728\u53D8\u6210\u672C\u80FD\u3002"
  ];
  var FLEX_CHEER_MESSAGES = [
    "\u6D47\u6C34\u6210\u529F\uFF01\u79CD\u5B50\u53C8\u6084\u6084\u957F\u5927\u4E86\u4E00\u70B9\uFF5E",
    "\u6BCF\u4E00\u6B21\u5B8C\u6210\uFF0C\u90FD\u662F\u5728\u4E3A\u53D1\u82BD\u84C4\u529B",
    "\u8282\u594F\u5F88\u597D\uFF0C\u7EE7\u7EED\u4FDD\u6301",
    "\u4F60\u7684\u5C0F\u79CD\u5B50\u611F\u53D7\u5230\u4E86\u4F60\u7684\u7528\u5FC3",
    "\u8FDB\u6B65\u770B\u5F97\u89C1\uFF0C\u79BB\u7EFD\u653E\u66F4\u8FD1\u4E86"
  ];
  function randomCheer(isFlex = false) {
    const pool = isFlex ? FLEX_CHEER_MESSAGES : CHEER_MESSAGES;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // js/habit-rules.js
  var HABIT_TYPES = {
    daily: { id: "daily", label: "\u6BCF\u65E5\u4F34", badgeClass: "badge-daily" },
    general: { id: "general", label: "\u968F\u5FC3\u82BD", badgeClass: "badge-general" }
  };
  var DAILY_TARGET = 21;
  var GENERAL_DEFAULT_DAYS = 30;
  var GENERAL_DEFAULT_CHECKINS = 10;
  var MAX_FOCUS_PER_TYPE = 5;
  function typeInfo(type) {
    return HABIT_TYPES[type] || HABIT_TYPES.daily;
  }
  function localDateKey(date = /* @__PURE__ */ new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  function todayKey() {
    return localDateKey();
  }
  function dateKeyOffset(days) {
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() + days);
    return localDateKey(d);
  }
  function yesterdayKey() {
    return dateKeyOffset(-1);
  }
  function addDays(dateKey, days) {
    const d = /* @__PURE__ */ new Date(dateKey + "T12:00:00");
    d.setDate(d.getDate() + days);
    return localDateKey(d);
  }
  function daysBetween(startKey, endKey) {
    const a = /* @__PURE__ */ new Date(startKey + "T12:00:00");
    const b = /* @__PURE__ */ new Date(endKey + "T12:00:00");
    return Math.round((b - a) / 864e5);
  }
  function consecutiveStreak(checkIns) {
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
  function lastCheckinDate(checkIns) {
    if (!checkIns.length) return null;
    const sorted = [...checkIns].sort();
    return sorted[sorted.length - 1];
  }
  function sessionEndDate(session) {
    if (session.type === "general") {
      return addDays(session.startDate, session.goalDays - 1);
    }
    return null;
  }
  function daysRemaining(session) {
    if (session.type !== "general") return null;
    const end = sessionEndDate(session);
    return Math.max(0, daysBetween(todayKey(), end) + 1);
  }
  function generalProgress(session) {
    const count = session.checkIns.length;
    const goal = session.goalCheckins;
    const pct = Math.min(100, Math.round(count / goal * 100));
    return { count, goal, pct, daysLeft: daysRemaining(session) };
  }
  function dailyProgress(session) {
    const streak = consecutiveStreak(session.checkIns);
    const pct = Math.min(100, Math.round(streak / DAILY_TARGET * 100));
    return { streak, target: DAILY_TARGET, pct, day: streak };
  }
  function stageDayForCompanion(session) {
    if (session.type === "general") {
      const { count, goal } = generalProgress(session);
      return Math.round(count / goal * DAILY_TARGET);
    }
    return consecutiveStreak(session.checkIns);
  }
  function typeToastLabel(type) {
    return type === "general" ? "\u968F\u5FC3\u82BD" : "\u6BCF\u65E5\u4F34";
  }
  function mulliganLabel(session) {
    const n = session.mulliganUsed || 0;
    return n > 0 ? ` \xB7 \u8865\u7B7E\xD7${n}` : "";
  }

  // js/store.js
  var STORAGE_KEY = "habit-tracker-v2";
  var META_KEY = "habit-tracker-v2-meta";
  var API_STATE = "/api/state";
  var FETCH_TIMEOUT_MS = 6e3;
  var BOOT_SYNC_TIMEOUT_MS = 4e3;
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
  var DEFAULT_STATE = {
    reminderTime: "09:30",
    mulliganCredits: 0,
    habits: [],
    focusSessions: [],
    achievements: []
  };
  function cloneData(obj) {
    if (typeof structuredClone === "function") {
      try {
        return structuredClone(obj);
      } catch (e) {
      }
    }
    return JSON.parse(JSON.stringify(obj));
  }
  function uid() {
    var _a;
    if ((_a = globalThis.crypto) == null ? void 0 : _a.randomUUID) {
      try {
        return globalThis.crypto.randomUUID();
      } catch (e) {
      }
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
  function migrateHabit(h) {
    return {
      goalDays: GENERAL_DEFAULT_DAYS,
      goalCheckins: GENERAL_DEFAULT_CHECKINS,
      ...h,
      type: h.type || "daily"
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
      goalCheckins: s.goalCheckins || GENERAL_DEFAULT_CHECKINS
    };
    if (type === "general") {
      const goalDays = session.goalDays || GENERAL_DEFAULT_DAYS;
      if (!session.plant || session.plant.kind === "pet") {
        session.plant = plantForGoalDays(goalDays);
      }
    } else {
      if (!session.plant || session.plant.kind !== "pet") {
        session.plant = randomPet();
      }
    }
    return session;
  }
  function buildAchievementFromSession(session, habit) {
    const streak = session.type === "daily" ? consecutiveStreak(session.checkIns) : session.checkIns.length;
    return {
      id: uid(),
      sessionId: session.id,
      habitId: habit.id,
      habitName: habit.name,
      habitIcon: habit.icon,
      type: session.type || "daily",
      completedAt: session.completedAt || (/* @__PURE__ */ new Date()).toISOString(),
      startDate: session.startDate,
      mulliganUsed: session.mulliganUsed || 0,
      streak: session.type === "daily" ? streak : void 0,
      checkIns: session.type === "general" ? session.checkIns.length : void 0,
      goalDays: session.goalDays,
      goalCheckins: session.goalCheckins,
      companion: session.plant ? cloneCompanion(session.plant) : void 0
    };
  }
  function migrateAchievements(state) {
    var _a;
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
      if (a.type === "general" && ((_a = a.companion) == null ? void 0 : _a.kind) === "pet") {
        delete a.companion;
      }
      if (!a.companion && a.sessionId) {
        const session = state.focusSessions.find((s) => s.id === a.sessionId);
        if (session == null ? void 0 : session.plant) a.companion = cloneCompanion(session.plant);
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
          completedAt: habit.updatedAt || (/* @__PURE__ */ new Date()).toISOString(),
          startDate: null,
          mulliganUsed: 0,
          streak: habit.type === "general" ? void 0 : habit.bestStreak || DAILY_TARGET,
          checkIns: habit.type === "general" ? habit.goalCheckins || GENERAL_DEFAULT_CHECKINS : void 0,
          goalDays: habit.goalDays,
          goalCheckins: habit.goalCheckins
        });
      }
    }
    state.achievements.sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || ""));
  }
  function normalizeState(raw) {
    const habits = ((raw == null ? void 0 : raw.habits) || []).map(migrateHabit);
    const focusSessions = ((raw == null ? void 0 : raw.focusSessions) || []).map(migrateSession);
    const state = {
      reminderTime: (raw == null ? void 0 : raw.reminderTime) || DEFAULT_STATE.reminderTime,
      mulliganCredits: Number(raw == null ? void 0 : raw.mulliganCredits) || 0,
      habits,
      focusSessions,
      achievements: (raw == null ? void 0 : raw.achievements) || []
    };
    migrateAchievements(state);
    const habitIds = new Set(state.habits.map((h) => h.id));
    state.focusSessions = (state.focusSessions || []).filter((s) => habitIds.has(s.habitId));
    return state;
  }
  var HabitStore = class {
    constructor() {
      this.state = cloneData(DEFAULT_STATE);
      this.revision = 0;
      this.syncEnabled = false;
      this._pushTimer = null;
      this._pendingPush = false;
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
    loadMeta() {
      try {
        const meta = JSON.parse(localStorage.getItem(META_KEY) || "{}");
        this.revision = Number(meta.revision) || 0;
      } catch (e) {
        this.revision = 0;
      }
    }
    saveMeta() {
      try {
        localStorage.setItem(META_KEY, JSON.stringify({ revision: this.revision }));
      } catch (e) {
      }
    }
    loadLocal() {
      try {
        let raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          raw = localStorage.getItem("habit-tracker-v1");
        }
        if (!raw) return cloneData(DEFAULT_STATE);
        return normalizeState(JSON.parse(raw));
      } catch (e) {
        return cloneData(DEFAULT_STATE);
      }
    }
    saveLocal() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        this.saveMeta();
      } catch (e) {
      }
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
        body: JSON.stringify({ state: this.state })
      });
      if (!res.ok) throw new Error(`save failed ${res.status}`);
      const payload = await res.json();
      this.revision = payload.revision || this.revision;
      this._pendingPush = false;
      this.saveMeta();
    }
    applyServerPayload(payload) {
      if (!(payload == null ? void 0 : payload.state) || !Array.isArray(payload.state.habits)) return false;
      const incomingRev = payload.revision || 0;
      if (incomingRev < this.revision) return false;
      if (incomingRev === this.revision && this.state.habits.length > 0) return false;
      const serverUpdated = payload.state.updatedAt || payload.updatedAt;
      const localUpdated = this.state.updatedAt;
      if (this.state.habits.length > 0 && localUpdated && serverUpdated && localUpdated > serverUpdated) {
        return false;
      }
      this.state = normalizeState(payload.state);
      this.revision = incomingRev;
      this.evaluateSessions(false);
      this.saveLocal();
      return true;
    }
    async _mergeWithServer(local) {
      var _a, _b, _c, _d;
      const payload = await this.fetchServer();
      this.syncEnabled = true;
      const incomingRev = payload.revision || 0;
      const serverHasData = ((_b = (_a = payload.state) == null ? void 0 : _a.habits) == null ? void 0 : _b.length) > 0;
      const localHasData = ((_c = local.habits) == null ? void 0 : _c.length) > 0;
      const serverUpdated = ((_d = payload.state) == null ? void 0 : _d.updatedAt) || payload.updatedAt;
      const localUpdated = this.state.updatedAt;
      const localIsNewer = localHasData && localUpdated && (!serverUpdated || localUpdated > serverUpdated || incomingRev < this.revision);
      if (localIsNewer) {
        await this.pushServer();
        return;
      }
      if (serverHasData && incomingRev >= this.revision) {
        if (this.applyServerPayload(payload)) {
          this.evaluateSessions(true);
          window.dispatchEvent(new CustomEvent("habit-store-synced"));
        }
        return;
      }
      if (localHasData) {
        await this.pushServer();
      }
    }
    async init() {
      this.loadMeta();
      const local = this.loadLocal();
      this.state = normalizeState(local);
      this.evaluateSessions(false);
      this.evaluateSessions(true);
      void this._bootSync(local);
      return this;
    }
    async _bootSync(local) {
      try {
        await Promise.race([
          this._mergeWithServer(local),
          new Promise(
            (_, reject) => setTimeout(() => reject(new Error("sync timeout")), BOOT_SYNC_TIMEOUT_MS)
          )
        ]);
      } catch (e) {
        this.syncEnabled = false;
      }
      if (this._pendingPush && this.syncEnabled) {
        this._pendingPush = false;
        await this.pushServer().catch(() => {
          this._pendingPush = true;
        });
      }
      this.evaluateSessions(true);
      window.dispatchEvent(new CustomEvent("habit-store-synced"));
    }
    async ensureSync() {
      if (this.syncEnabled) return true;
      try {
        await Promise.race([
          this.fetchServer(),
          new Promise(
            (_, reject) => setTimeout(() => reject(new Error("sync timeout")), BOOT_SYNC_TIMEOUT_MS)
          )
        ]);
        this.syncEnabled = true;
        if (this._pendingPush) {
          await this.pushServer().catch(() => {
          });
        }
        return true;
      } catch (e) {
        return false;
      }
    }
    async syncFromServer() {
      var _a;
      if (!this.syncEnabled) return false;
      try {
        const payload = await this.fetchServer();
        const serverUpdated = ((_a = payload.state) == null ? void 0 : _a.updatedAt) || payload.updatedAt;
        const localUpdated = this.state.updatedAt;
        if (localUpdated && serverUpdated && localUpdated > serverUpdated) {
          await this.pushServer();
          return false;
        }
        const changed = this.applyServerPayload(payload);
        this.evaluateSessions(true);
        return changed;
      } catch (e) {
        return false;
      }
    }
    save() {
      this.state.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      this.saveLocal();
      if (!this.syncEnabled) {
        this._pendingPush = true;
        return;
      }
      clearTimeout(this._pushTimer);
      this._pushTimer = setTimeout(() => {
        this.pushServer().catch(() => {
          this._pendingPush = true;
        });
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
      return [...this.state.achievements || []].sort(
        (a, b) => (b.completedAt || "").localeCompare(a.completedAt || "")
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
        goalDays: type === "general" ? Number(goalDays) || GENERAL_DEFAULT_DAYS : void 0,
        goalCheckins: type === "general" ? Number(goalCheckins) || GENERAL_DEFAULT_CHECKINS : void 0,
        bestStreak: 0,
        attemptCount: 0,
        completionCount: 0,
        status: "pool",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.state.habits.push(habit);
      this.save();
      return habit;
    }
    updateHabit(id, patch) {
      const habit = this.getHabit(id);
      if (!habit) return null;
      if (this.getSession(id)) {
        throw new Error("\u805A\u7126\u4E2D\u7684\u4E60\u60EF\u65E0\u6CD5\u4FEE\u6539\u7C7B\u578B\uFF0C\u8BF7\u5148\u6682\u65F6\u653E\u5F03");
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
      if (!habit) throw new Error("\u4E60\u60EF\u4E0D\u5B58\u5728");
      if (this.getSession(id)) {
        throw new Error("\u805A\u7126\u4E2D\u7684\u4E60\u60EF\u65E0\u6CD5\u5220\u9664\uFF0C\u8BF7\u5148\u6682\u65F6\u653E\u5F03");
      }
      if (habit.status !== "pool") {
        throw new Error("\u4EC5\u4E60\u60EF\u6C60\u4E2D\u7684\u4E60\u60EF\u53EF\u4EE5\u5220\u9664");
      }
      this.state.habits = this.state.habits.filter((h) => h.id !== id);
      this.state.focusSessions = this.state.focusSessions.filter((s) => s.habitId !== id);
      this.save();
      return true;
    }
    adoptToFocus(habitId) {
      const habit = this.getHabit(habitId);
      if (!habit || habit.status !== "pool") {
        throw new Error("\u8BE5\u4E60\u60EF\u65E0\u6CD5\u9009\u5165\u805A\u7126");
      }
      const type = habit.type || "daily";
      if (this.focusSlotsRemaining(type) <= 0) {
        throw new Error("\u805A\u7126\u5751\u4F4D\u5DF2\u6EE1");
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
        startedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (type === "daily") {
        session.plant = randomPet();
      } else {
        session.goalDays = habit.goalDays || GENERAL_DEFAULT_DAYS;
        session.goalCheckins = habit.goalCheckins || GENERAL_DEFAULT_CHECKINS;
        session.endDate = addDays(today, session.goalDays - 1);
        session.plant = plantForGoalDays(session.goalDays);
      }
      habit.attemptCount += 1;
      this.state.focusSessions.push(session);
      this.save();
      return session;
    }
    _failSession(session, reason) {
      const habit = this.getHabit(session.habitId);
      session.active = false;
      session.failedAt = (/* @__PURE__ */ new Date()).toISOString();
      session.failReason = reason;
      session.atRisk = false;
      const streak = session.type === "daily" ? consecutiveStreak(session.checkIns) : session.checkIns.length;
      if (streak > habit.bestStreak) habit.bestStreak = streak;
      habit.status = "pool";
      this._emit({ kind: "failed", session, habit, reason });
    }
    _completeSession(session) {
      const habit = this.getHabit(session.habitId);
      session.active = false;
      session.completedAt = session.completedAt || (/* @__PURE__ */ new Date()).toISOString();
      session.atRisk = false;
      habit.completionCount += 1;
      this.state.mulliganCredits += 1;
      habit.status = "pool";
      const streak = session.type === "daily" ? consecutiveStreak(session.checkIns) : session.checkIns.length;
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
      if (!session) throw new Error("\u672A\u627E\u5230\u805A\u7126\u4E2D\u7684\u4E60\u60EF");
      const habit = this.getHabit(habitId);
      session.active = false;
      session.abandonedAt = (/* @__PURE__ */ new Date()).toISOString();
      session.atRisk = false;
      const streak = session.type === "daily" ? consecutiveStreak(session.checkIns) : session.checkIns.length;
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
      if (!session) throw new Error("\u8BE5\u4E60\u60EF\u4E0D\u5728\u805A\u7126\u4E2D");
      if (this.isCheckedInToday(session)) throw new Error("\u4ECA\u65E5\u5DF2\u6253\u5361");
      if (session.type === "daily" && session.atRisk) {
        throw new Error("\u6628\u65E5\u672A\u6253\u5361\uFF0C\u8BF7\u5148\u4F7F\u7528\u8865\u7B7E\u633D\u6551");
      }
      const today = todayKey();
      session.checkIns.push(today);
      session.checkIns.sort();
      const habit = this.getHabit(habitId);
      const streak = session.type === "daily" ? consecutiveStreak(session.checkIns) : session.checkIns.length;
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
        throw new Error("\u6CA1\u6709\u53EF\u7528\u7684\u8865\u7B7E\u673A\u4F1A");
      }
      const session = this.getSession(habitId);
      if (!session) throw new Error("\u8BE5\u4E60\u60EF\u4E0D\u5728\u805A\u7126\u4E2D");
      if (session.checkIns.includes(dateKey)) {
        throw new Error("\u8BE5\u65E5\u671F\u5DF2\u6253\u5361");
      }
      const today = todayKey();
      if (dateKey > today) throw new Error("\u4E0D\u80FD\u8865\u7B7E\u672A\u6765\u65E5\u671F");
      if (session.type === "general") {
        const end = sessionEndDate(session);
        if (dateKey < session.startDate || dateKey > end) {
          throw new Error("\u8865\u7B7E\u65E5\u671F\u987B\u5728\u6311\u6218\u671F\u9650\u5185");
        }
      }
      session.checkIns.push(dateKey);
      session.checkIns.sort();
      session.mulliganUsed = (session.mulliganUsed || 0) + 1;
      session.mulliganDates = [...session.mulliganDates || [], dateKey];
      if (session.type === "daily" && dateKey === yesterdayKey()) {
        session.atRisk = false;
      }
      const habit = this.getHabit(habitId);
      const streak = session.type === "daily" ? consecutiveStreak(session.checkIns) : session.checkIns.length;
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
        exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
        state: cloneData(this.state)
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
      } catch (e) {
        throw new Error("\u5BFC\u5165\u5185\u5BB9\u683C\u5F0F\u4E0D\u6B63\u786E\uFF0C\u8BF7\u68C0\u67E5\u540E\u91CD\u8BD5");
      }
      const data = payload.state || payload;
      if (!data || !Array.isArray(data.habits)) {
        throw new Error("\u65E0\u6548\u7684\u6570\u636E\u683C\u5F0F");
      }
      this.state = normalizeState(data);
      this.evaluateSessions(false);
      this.save();
      return this.state;
    }
    seedFromConfig(config) {
      if (this.state.habits.length > 0) return false;
      for (const h of config.habits) {
        const type = h.type || "daily";
        const habit = {
          id: uid(),
          name: h.name,
          icon: h.icon,
          description: "",
          type,
          goalDays: h.goalDays || GENERAL_DEFAULT_DAYS,
          goalCheckins: h.goalCheckins || GENERAL_DEFAULT_CHECKINS,
          bestStreak: h.bestStreak,
          attemptCount: h.attemptCount,
          completionCount: type === "daily" && h.bestStreak >= 21 ? 1 : h.completionCount || 0,
          status: "pool",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.state.habits.push(habit);
        if (h.inFocus && h.currentDay > 0) {
          const checkIns = [];
          for (let i = 0; i < h.currentDay; i++) {
            const d = /* @__PURE__ */ new Date();
            d.setDate(d.getDate() - (h.currentDay - 1 - i));
            checkIns.push(d.toISOString().slice(0, 10));
          }
          const today = todayKey();
          if (type === "general") {
            this.state.focusSessions.push({
              id: uid(),
              habitId: habit.id,
              type: "general",
              plant: plantForGoalDays(habit.goalDays),
              goalDays: habit.goalDays,
              goalCheckins: habit.goalCheckins,
              startDate: addDays(today, -(h.currentDay - 1)),
              endDate: addDays(today, habit.goalDays - h.currentDay),
              checkIns,
              mulliganUsed: 0,
              mulliganDates: [],
              atRisk: false,
              active: true,
              startedAt: (/* @__PURE__ */ new Date()).toISOString()
            });
          } else {
            this.state.focusSessions.push({
              id: uid(),
              habitId: habit.id,
              type: "daily",
              plant: randomPet(),
              startDate: checkIns[0] || today,
              checkIns,
              mulliganUsed: 0,
              mulliganDates: [],
              atRisk: false,
              active: true,
              startedAt: (/* @__PURE__ */ new Date()).toISOString()
            });
          }
        }
      }
      this.state.reminderTime = config.reminderTime || "09:30";
      this.save();
      return true;
    }
  };

  // js/app.js
  var ICONS = ["\u{1F4D6}", "\u{1F3C3}", "\u{1F9D8}", "\u{1F4A7}", "\u{1F305}", "\u270D\uFE0F", "\u{1F3B8}", "\u{1F957}", "\u{1F634}", "\u{1F9F9}", "\u{1F48A}", "\u{1F6B6}", "\u{1F9E0}", "\u{1F3AF}"];
  var FOCUS_FULL_TOAST = "\u4EFB\u52A1\u8D85\u8F7D\uFF0C\u4FDD\u62A4\u4F60\u7684\u6CE8\u610F\u529B\u54E6\uFF5E";
  var TOAST = {
    focusFull: FOCUS_FULL_TOAST,
    needName: "\u8BF7\u8F93\u5165\u4E60\u60EF\u540D\u79F0",
    addedToPool: "\u5DF2\u52A0\u5165\u4E60\u60EF\u6C60",
    savedEdit: "\u4FEE\u6539\u5DF2\u4FDD\u5B58",
    savedReminder: "\u63D0\u9192\u65F6\u95F4\u5DF2\u4FDD\u5B58",
    abandoned: "\u5DF2\u6682\u65F6\u653E\u5F03\uFF0C\u4E60\u60EF\u56DE\u5230\u4E60\u60EF\u6C60",
    archivedHonor: "\u5DF2\u8BB0\u5165\u8363\u8A89\u699C",
    keptInPool: "\u5DF2\u56DE\u5230\u4E60\u60EF\u6C60\uFF0C\u53EF\u968F\u65F6\u518D\u6311\u6218",
    challengeDone: "\u6311\u6218\u5B8C\u6210\uFF01\u5DF2\u8BB0\u5165\u8363\u8A89\u699C",
    mulliganOk: "\u8865\u7B7E\u6210\u529F\uFF0C\u7EE7\u7EED\u52A0\u6CB9\uFF5E",
    exported: "\u6570\u636E\u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F",
    exportFail: "\u590D\u5236\u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u9009\u62E9\u5185\u5BB9\u590D\u5236",
    imported: "\u6570\u636E\u5BFC\u5165\u6210\u529F",
    deleted: "\u4E60\u60EF\u5DF2\u5220\u9664",
    rescueSkip: "\u5DF2\u8DF3\u8FC7\uFF0C\u4E0B\u6B21\u6253\u5F00\u65F6\u6311\u6218\u53EF\u80FD\u5931\u6548",
    fallback: "\u64CD\u4F5C\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5",
    loadFail: "\u52A0\u8F7D\u5931\u8D25\uFF0C\u8BF7\u5237\u65B0\u9875\u9762\u91CD\u8BD5"
  };
  function userFacingMessage(err) {
    const msg = (typeof err === "string" ? err : (err == null ? void 0 : err.message) || "").trim();
    if (!msg) return TOAST.fallback;
    if (msg.includes("<") || msg.includes(">")) return TOAST.fallback;
    if (/server\s+\d+|save failed|SyntaxError|Unexpected token|JSON\.parse|Invalid/i.test(msg)) {
      return TOAST.fallback;
    }
    const map = {
      "\u805A\u7126\u4E2D\u7684\u4E60\u60EF\u65E0\u6CD5\u4FEE\u6539\u7C7B\u578B\uFF0C\u8BF7\u5148\u6682\u65F6\u653E\u5F03": "\u6B63\u5728\u805A\u7126\u4E2D\uFF0C\u8BF7\u5148\u6682\u65F6\u653E\u5F03\u518D\u4FEE\u6539",
      "\u4E60\u60EF\u4E0D\u5B58\u5728": "\u627E\u4E0D\u5230\u8FD9\u4E2A\u4E60\u60EF",
      "\u805A\u7126\u4E2D\u7684\u4E60\u60EF\u65E0\u6CD5\u5220\u9664\uFF0C\u8BF7\u5148\u6682\u65F6\u653E\u5F03": "\u6B63\u5728\u805A\u7126\u4E2D\uFF0C\u8BF7\u5148\u6682\u65F6\u653E\u5F03\u518D\u5220\u9664",
      "\u4EC5\u4E60\u60EF\u6C60\u4E2D\u7684\u4E60\u60EF\u53EF\u4EE5\u5220\u9664": "\u53EA\u80FD\u5220\u9664\u4E60\u60EF\u6C60\u4E2D\u7684\u4E60\u60EF",
      "\u8BE5\u4E60\u60EF\u65E0\u6CD5\u9009\u5165\u805A\u7126": "\u8FD9\u4E2A\u4E60\u60EF\u6682\u65F6\u65E0\u6CD5\u9009\u5165\u805A\u7126",
      "21Daily \u805A\u7126\u5751\u4F4D\u5DF2\u6EE1": TOAST.focusFull,
      "General \u805A\u7126\u5751\u4F4D\u5DF2\u6EE1": TOAST.focusFull,
      "\u805A\u7126\u5751\u4F4D\u5DF2\u6EE1": TOAST.focusFull,
      "\u672A\u627E\u5230\u805A\u7126\u4E2D\u7684\u4E60\u60EF": "\u8FD9\u4E2A\u4E60\u60EF\u4E0D\u5728\u805A\u7126\u4E2D",
      "\u8BE5\u4E60\u60EF\u4E0D\u5728\u805A\u7126\u4E2D": "\u8FD9\u4E2A\u4E60\u60EF\u4E0D\u5728\u805A\u7126\u4E2D",
      "\u4ECA\u65E5\u5DF2\u6253\u5361": "\u4ECA\u5929\u5DF2\u7ECF\u6253\u5361\u5566",
      "\u6628\u65E5\u672A\u6253\u5361\uFF0C\u8BF7\u5148\u4F7F\u7528\u8865\u7B7E\u633D\u6551": "\u6628\u65E5\u672A\u6253\u5361\uFF0C\u8BF7\u5148\u8865\u7B7E\u633D\u6551",
      "\u6CA1\u6709\u53EF\u7528\u7684\u8865\u7B7E\u673A\u4F1A": "\u6682\u65E0\u8865\u7B7E\u673A\u4F1A",
      "\u8BE5\u65E5\u671F\u5DF2\u6253\u5361": "\u8FD9\u4E00\u5929\u5DF2\u7ECF\u6253\u5361\u8FC7\u4E86",
      "\u4E0D\u80FD\u8865\u7B7E\u672A\u6765\u65E5\u671F": "\u4E0D\u80FD\u8865\u7B7E\u672A\u6765\u7684\u65E5\u671F",
      "\u8865\u7B7E\u65E5\u671F\u987B\u5728\u6311\u6218\u671F\u9650\u5185": "\u53EA\u80FD\u8865\u7B7E\u6311\u6218\u671F\u5185\u7684\u65E5\u671F",
      "\u65E0\u6548\u7684\u6570\u636E\u683C\u5F0F": "\u5BFC\u5165\u5185\u5BB9\u6709\u8BEF\uFF0C\u8BF7\u68C0\u67E5\u540E\u91CD\u8BD5",
      "\u5BFC\u5165\u5185\u5BB9\u683C\u5F0F\u4E0D\u6B63\u786E\uFF0C\u8BF7\u68C0\u67E5\u540E\u91CD\u8BD5": "\u5BFC\u5165\u5185\u5BB9\u6709\u8BEF\uFF0C\u8BF7\u68C0\u67E5\u540E\u91CD\u8BD5"
    };
    return map[msg] || msg;
  }
  function showToast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 2800);
  }
  function showErrorToast(err) {
    showToast(userFacingMessage(err));
  }
  var CONFIRMED_CONFIG = {
    reminderTime: "09:30",
    habits: [
      { name: "\u9605\u8BFB 30 \u5206\u949F", icon: "\u{1F4D6}", type: "daily", inFocus: true, bestStreak: 12, attemptCount: 2, currentDay: 12 },
      { name: "\u8FD0\u52A8 20 \u5206\u949F", icon: "\u{1F3C3}", type: "daily", inFocus: true, bestStreak: 7, attemptCount: 1, currentDay: 5 },
      { name: "\u5199\u4EE3\u7801", icon: "\u{1F4BB}", type: "general", inFocus: true, bestStreak: 3, attemptCount: 1, currentDay: 3, goalDays: 30, goalCheckins: 10 },
      { name: "\u51A5\u60F3 10 \u5206\u949F", icon: "\u{1F9D8}", inFocus: false, bestStreak: 14, attemptCount: 3, currentDay: 0 },
      { name: "\u559D 8 \u676F\u6C34", icon: "\u{1F4A7}", inFocus: false, bestStreak: 21, attemptCount: 1, currentDay: 0 }
    ]
  };
  var store = new HabitStore();
  var activeTab = "home";
  var pendingAbandonId = null;
  var pendingRescueHabitId = null;
  var dailyCarouselIndex = 0;
  var appReady = false;
  var newHabitIcon = "\u{1F3AF}";
  var canonicalUrl = location.origin + location.pathname;
  var $ = (sel) => document.querySelector(sel);
  var $$ = (sel) => document.querySelectorAll(sel);
  function typeBadge(type) {
    const info = typeInfo(type);
    return `<span class="type-badge ${info.badgeClass}">${info.label}</span>`;
  }
  function launchConfetti() {
    const container = $("#confetti");
    container.innerHTML = "";
    const colors = ["#16a34a", "#22c55e", "#fde047", "#f472b6", "#60a5fa", "#fb923c"];
    for (let i = 0; i < 60; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[i % colors.length];
      piece.style.animationDuration = `${1.2 + Math.random() * 1.5}s`;
      piece.style.animationDelay = `${Math.random() * 0.4}s`;
      piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      container.appendChild(piece);
    }
    setTimeout(() => container.innerHTML = "", 3e3);
  }
  var FETCH_TIMEOUT_MS2 = 6e3;
  async function fetchWithTimeout2(url, options = {}, ms = FETCH_TIMEOUT_MS2) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    try {
      return await fetch(url, { ...options, signal: ctrl.signal });
    } finally {
      clearTimeout(timer);
    }
  }
  async function loadCanonicalUrl() {
    try {
      const res = await fetchWithTimeout2("./data/lan-config.json", { cache: "no-store" });
      if (!res.ok) return;
      const cfg = await res.json();
      if (cfg.canonicalUrl) canonicalUrl = cfg.canonicalUrl;
    } catch (e) {
    }
  }
  async function ensureCanonicalUrl() {
    const host = location.hostname;
    if (host !== "127.0.0.1" && host !== "localhost") return true;
    try {
      const res = await fetchWithTimeout2("./data/lan-config.json", { cache: "no-store" });
      if (!res.ok) return true;
      const cfg = await res.json();
      if (cfg.canonicalUrl) {
        const canonicalOrigin = new URL(cfg.canonicalUrl).origin;
        if (location.origin !== canonicalOrigin) {
          location.replace(cfg.canonicalUrl);
          return false;
        }
      }
    } catch (e) {
    }
    return true;
  }
  function siteUrl() {
    return new URL("/", location.href).href;
  }
  async function copySiteUrl() {
    const url = siteUrl();
    try {
      await navigator.clipboard.writeText(url);
      showToast("\u94FE\u63A5\u5DF2\u590D\u5236");
    } catch (e) {
      showToast("\u590D\u5236\u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u590D\u5236");
    }
  }
  function renderHeader() {
    const daily = store.getFocusSessions("daily");
    const general = store.getFocusSessions("general");
    $("#statsBar").innerHTML = `
    <span class="stat-chip stat-chip-pet">\u6BCF\u65E5\u4F34 ${daily.length}/${MAX_FOCUS_PER_TYPE}</span>
    <span class="stat-chip stat-chip-plant">\u968F\u5FC3\u82BD ${general.length}/${MAX_FOCUS_PER_TYPE}</span>
  `;
  }
  function sortDailySessions(sessions) {
    return [...sessions].sort((a, b) => {
      const aDone = store.isCheckedInToday(a);
      const bDone = store.isCheckedInToday(b);
      if (aDone !== bDone) return aDone ? 1 : -1;
      if (a.atRisk !== b.atRisk) return a.atRisk ? -1 : 1;
      return 0;
    });
  }
  function hideLoadStatus() {
    var _a;
    (_a = document.getElementById("loadStatus")) == null ? void 0 : _a.remove();
  }
  function showBootstrapError(err) {
    console.error("[habit-tracker] bootstrap failed:", err);
    if (!appReady) {
      if (typeof window.showBootError === "function") {
        window.showBootError(TOAST.loadFail);
      } else {
        showToast(TOAST.loadFail);
      }
    }
  }
  function renderEvolutionRow(companion, progressValue, kind = "pet") {
    var _a;
    if (!((_a = companion == null ? void 0 : companion.stages) == null ? void 0 : _a.length)) return "";
    const labels = evolutionStageLabels(kind);
    const current = kind === "plant" && (progressValue == null ? void 0 : progressValue.count) != null ? generalStageIndex(progressValue.count, progressValue.goal) : stageIndex(progressValue);
    return companion.stages.map(
      (emoji, i) => `<span class="evo-step ${i <= current ? "evo-done" : ""} ${i === current ? "evo-current" : ""}" title="${labels[i]}">${emoji}</span>`
    ).join("");
  }
  function nurtureTaskBridge(companion, isFlex = false) {
    if (isFlex) return `\u5E2E${companion.name}\u5B8C\u6210\u4ECA\u65E5\u6D47\u6C34`;
    return `\u5B8C\u6210\u4ECA\u65E5\u4EFB\u52A1\uFF0C\u5E2E${companion.name}\u6210\u957F\u5427`;
  }
  function renderDailyNurtureCard(session) {
    var _a;
    const habit = store.getHabit(session.habitId);
    if (!habit) return "";
    const companion = ((_a = session.plant) == null ? void 0 : _a.kind) === "pet" ? session.plant : randomPet();
    const checked = store.isCheckedInToday(session);
    const p = dailyProgress(session);
    const emoji = companionStageEmoji(companion, p.streak);
    const mullTag = mulliganLabel(session);
    const atRisk = session.atRisk;
    const riskBanner = atRisk ? `<div class="at-risk-hint">\u6628\u65E5\u672A\u7167\u6599 \xB7 <button class="link-btn link-btn-muted" data-rescue="${habit.id}">\u8865\u7B7E\u633D\u6551</button></div>` : "";
    const actionBtn = checked ? `<div class="nurture-done">\u2728 \u4ECA\u65E5\u5DF2\u5B8C\u6210\uFF1A${habit.icon} ${habit.name}</div>` : `<button class="checkin-btn nurture-checkin" data-checkin="${habit.id}" ${atRisk ? "disabled" : ""}>\u2713 \u5B8C\u6210\u300C${habit.name}\u300D</button>`;
    return `
    <article class="daily-nurture-card companion-pet ${checked ? "done-today" : ""}" data-habit="${habit.id}">
      ${riskBanner}
      <div class="nurture-hero">
        <div class="nurture-avatar-large" id="avatar-${habit.id}">${emoji}</div>
        <div class="nurture-companion-name">${companion.name}</div>
        <div class="nurture-stage">\u4F19\u4F34 \xB7 ${stageLabel(p.streak, "pet")}</div>
      </div>
      <div class="nurture-divider"></div>
      <div class="nurture-task-title">${habit.icon} ${habit.name}${mullTag}</div>
      <div class="nurture-task-bridge">${nurtureTaskBridge(companion)}</div>
      <div class="nurture-progress">
        <div class="progress-label"><span>\u8FDE\u7EED ${p.streak}/${DAILY_TARGET} \u5929</span><span>${p.pct}%</span></div>
        <div class="progress-bar"><div class="progress-fill progress-fill-pet" style="width:${p.pct}%"></div></div>
      </div>
      <div class="nurture-evolution">${renderEvolutionRow(companion, p.streak, "pet")}</div>
      ${actionBtn}
      <button class="abandon-link abandon-link-subtle" data-abandon="${habit.id}" type="button">\u6682\u65F6\u653E\u5F03</button>
    </article>`;
  }
  function renderFlexGrowthRow(count, goal) {
    const current = generalStageIndex(count, goal);
    const labels = flexGrowthStageLabels();
    return FLEX_GROWTH_STAGES.map(
      (emoji, i) => `<span class="evo-step ${i <= current ? "evo-done" : ""} ${i === current ? "evo-current" : ""}" title="${labels[i]}">${emoji}</span>`
    ).join("");
  }
  function renderFlexSproutCard(session) {
    const habit = store.getHabit(session.habitId);
    if (!habit) return "";
    const checked = store.isCheckedInToday(session);
    const p = generalProgress(session);
    const emoji = flexGrowthEmoji(p.count, p.goal);
    const mullTag = mulliganLabel(session);
    const actionHtml = checked ? `<div class="flex-sprout-action flex-sprout-done">
        <span class="flex-done-label">\u4ECA\u65E5\u5DF2\u5B8C\u6210</span>
        <span class="flex-done-habit">${habit.icon} ${habit.name}</span>
      </div>` : `<div class="flex-sprout-action">
        <button class="flex-checkin-btn" data-checkin="${habit.id}" type="button">\u5B8C\u6210\u6253\u5361</button>
      </div>`;
    return `
    <article class="flex-sprout-card ${checked ? "done-today" : ""}" data-habit="${habit.id}">
      <div class="flex-sprout-main">
        <div class="flex-sprout-emoji" id="avatar-${habit.id}">${emoji}</div>
        <div class="flex-sprout-info">
          <div class="flex-sprout-title">${habit.icon} ${habit.name}${mullTag}</div>
          <div class="flex-sprout-meta">${flexStageLabel(p.count, p.goal)} \xB7 ${p.count}/${p.goal} \u6B21 \xB7 \u5269 ${p.daysLeft} \u5929</div>
          <div class="progress-bar flex-progress-bar"><div class="progress-fill progress-fill-plant" style="width:${p.pct}%"></div></div>
        </div>
        ${actionHtml}
      </div>
      <button class="abandon-link abandon-link-subtle" data-abandon="${habit.id}" type="button">\u6682\u65F6\u653E\u5F03</button>
    </article>`;
  }
  function renderDailySection() {
    const sessions = sortDailySessions(store.getFocusSessions("daily"));
    const remaining = store.focusSlotsRemaining("daily");
    let cardsHtml = "";
    for (const s of sessions) {
      cardsHtml += `<div class="daily-carousel-slide">${renderDailyNurtureCard(s)}</div>`;
    }
    for (let i = 0; i < remaining; i++) {
      cardsHtml += `<div class="daily-carousel-slide"><div class="empty-slot daily-empty-slot">\u7A7A\u5751\u4F4D \xB7 \u53BB\u4E60\u60EF\u6C60\u9009\u5165</div></div>`;
    }
    const dotsHtml = sessions.length + remaining > 1 ? `<div class="daily-carousel-dots" id="dailyCarouselDots"></div>` : "";
    const emptyHtml = sessions.length === 0 && remaining === MAX_FOCUS_PER_TYPE ? `<div class="empty-slot daily-empty-slot">\u4ECE\u4E60\u60EF\u6C60\u9009\u5165 \xB7 \u53D1\u613F\u83B7\u5F97\u5BA0\u7269\u86CB\uFF0C\u6253\u5361\u5B75\u5316\u4F19\u4F34</div>` : "";
    if (sessions.length === 0 && remaining < MAX_FOCUS_PER_TYPE) {
    }
    return `
    <div class="focus-section focus-section-daily">
      <div class="focus-section-head">
        <h3>\u6BCF\u65E5\u4F34</h3>
        <span class="focus-section-count">${sessions.length}/${MAX_FOCUS_PER_TYPE}</span>
      </div>
      ${sessions.length === 0 && remaining === MAX_FOCUS_PER_TYPE ? emptyHtml : `
        <div class="daily-carousel" id="dailyCarousel">
          <div class="daily-carousel-track" id="dailyCarouselTrack">${cardsHtml}</div>
          ${dotsHtml}
        </div>`}
    </div>`;
  }
  function renderGeneralSection() {
    const sessions = store.getFocusSessions("general");
    const remaining = store.focusSlotsRemaining("general");
    let html = `<div class="focus-section focus-section-general">
    <div class="focus-section-head">
      <h3>\u968F\u5FC3\u82BD</h3>
      <span class="focus-section-count">${sessions.length}/${MAX_FOCUS_PER_TYPE}</span>
    </div>`;
    if (sessions.length === 0 && remaining === MAX_FOCUS_PER_TYPE) {
      html += `<div class="empty-slot empty-slot-sm">\u4ECE\u4E60\u60EF\u6C60\u9009\u5165 \xB7 \u53D1\u613F\u83B7\u5F97\u79CD\u5B50\uFF0C\u6309\u8282\u594F\u5B8C\u6210\u76EE\u6807</div>`;
    }
    for (const s of sessions) {
      html += renderFlexSproutCard(s);
    }
    for (let i = 0; i < remaining; i++) {
      html += `<div class="empty-slot empty-slot-sm">\u7A7A\u5751\u4F4D</div>`;
    }
    html += `</div>`;
    return html;
  }
  function initDailyCarousel() {
    const track = $("#dailyCarouselTrack");
    const carousel = $("#dailyCarousel");
    if (!track || !carousel) return;
    const slides = Array.from(track.querySelectorAll(".daily-carousel-slide"));
    if (slides.length === 0) return;
    let targetIndex = 0;
    for (let i = 0; i < slides.length; i++) {
      const card = slides[i].querySelector(".daily-nurture-card");
      if (card && !card.classList.contains("done-today")) {
        targetIndex = i;
        break;
      }
    }
    dailyCarouselIndex = targetIndex;
    function updateDailyDots() {
      const dotsEl = $("#dailyCarouselDots");
      if (!dotsEl) return;
      dotsEl.innerHTML = slides.map(
        (_, i) => `<button type="button" class="carousel-dot ${i === dailyCarouselIndex ? "active" : ""}" data-dot="${i}" aria-label="\u7B2C ${i + 1} \u4E2A"></button>`
      ).join("");
    }
    function scrollToIndex(index) {
      const slide = slides[index];
      if (!slide) return;
      dailyCarouselIndex = index;
      track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: "smooth" });
      updateDailyDots();
    }
    if (!carousel.dataset.bound) {
      carousel.dataset.bound = "1";
      carousel.addEventListener("click", (e) => {
        const dot = e.target.closest(".carousel-dot");
        if (dot) scrollToIndex(Number(dot.dataset.dot));
      });
    }
    track.onscroll = () => {
      const center = track.scrollLeft + track.clientWidth / 2;
      let nearest = 0;
      let minDist = Infinity;
      slides.forEach((slide, i) => {
        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
        const dist = Math.abs(slideCenter - center);
        if (dist < minDist) {
          minDist = dist;
          nearest = i;
        }
      });
      if (nearest !== dailyCarouselIndex) {
        dailyCarouselIndex = nearest;
        updateDailyDots();
      }
    };
    updateDailyDots();
    requestAnimationFrame(() => {
      const slide = slides[targetIndex];
      if (slide) track.scrollLeft = slide.offsetLeft - track.offsetLeft;
    });
  }
  function openWelcomeModal(session, habit) {
    const companion = session.plant;
    if (!companion) return;
    const isFlex = session.type === "general";
    $("#hatchEmoji").textContent = isFlex ? FLEX_GROWTH_STAGES[0] : companion.stages[0];
    $("#hatchTitle").textContent = isFlex ? flexWelcomeTitle() : focusWelcomeTitle();
    $("#hatchMsg").textContent = isFlex ? flexWelcomeMsg(session.goalDays, session.goalCheckins) : focusWelcomeMsg(companion);
    $("#hatchHabit").textContent = `\u5173\u8054\u4E60\u60EF\uFF1A${habit.icon} ${habit.name}`;
    $("#hatchStages").innerHTML = isFlex ? renderFlexGrowthRow(0, session.goalCheckins) : renderEvolutionRow(companion, 0, "pet");
    $("#closeHatch").textContent = isFlex ? "\u5F00\u59CB\u6253\u5361" : "\u5F00\u59CB\u5582\u517B";
    $("#hatchModal").dataset.habitId = habit.id;
    $("#hatchModal").classList.toggle("hatch-pet", !isFlex);
    $("#hatchModal").classList.toggle("hatch-plant", isFlex);
    $("#hatchModal").classList.add("show");
  }
  function renderHome() {
    $("#tabContent").innerHTML = `
    <div class="focus-home-layout">
      ${renderDailySection()}
      ${renderGeneralSection()}
    </div>`;
    try {
      initDailyCarousel();
    } catch (err) {
      console.error("[habit-tracker] carousel init failed:", err);
    }
  }
  function poolAdoptLabel(type) {
    return type === "general" ? "\u5F00\u59CB\u57F9\u80B2" : "\u5F00\u59CB\u517B\u6210";
  }
  function celebrateTitle(session) {
    if (session.type === "general") return "\u968F\u5FC3\u82BD \xB7 \u5B8C\u5168\u7EFD\u653E\uFF01";
    return "\u6BCF\u65E5\u4F34 \xB7 \u4F19\u4F34\u8FDB\u5316\u4E86\uFF01";
  }
  function poolStatsLine(h) {
    if (h.type === "general") {
      return `\u76EE\u6807 ${h.goalDays || 30}\u5929/${h.goalCheckins || 10}\u6B21 \xB7 \u5F00\u542F ${h.attemptCount} \u6B21${h.completionCount ? ` \xB7 \u5B8C\u6210 ${h.completionCount} \u6B21` : ""}`;
    }
    return `\u6700\u9AD8\u8FDE\u7EED ${h.bestStreak} \u5929 \xB7 \u5F00\u542F ${h.attemptCount} \u6B21${h.completionCount ? ` \xB7 \u5B8C\u6210 ${h.completionCount} \u6B21` : ""}`;
  }
  function formatAchievementDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  function achievementCompanionEmoji(a) {
    var _a, _b;
    if ((_b = (_a = a.companion) == null ? void 0 : _a.stages) == null ? void 0 : _b.length) {
      return a.companion.stages[a.companion.stages.length - 1];
    }
    return a.habitIcon || "\u{1F3C6}";
  }
  function achievementCompanionSubtitle(a) {
    if (!a.companion) return "";
    const kind = a.companion.kind === "pet" ? "\u4F19\u4F34" : "\u690D\u7269";
    return `${kind} \xB7 ${a.companion.name}`;
  }
  function achievementDetailLine(a) {
    const mull = a.mulliganUsed > 0 ? `\uFF08\u8865\u7B7E\xD7${a.mulliganUsed}\uFF09` : "";
    if (a.type === "general") {
      const days = a.goalDays != null ? a.goalDays : 30;
      const count = a.checkIns != null ? a.checkIns : a.goalCheckins != null ? a.goalCheckins : 0;
      return `${days} \u5929\u5185\u6210\u529F\u5B8C\u6210 ${count} \u6B21${mull}`;
    }
    const streak = a.streak != null ? a.streak : DAILY_TARGET;
    return `\u8FDE\u7EED ${streak} \u5929${mull}`;
  }
  function achievementTitle(a) {
    return `${a.habitIcon || ""} ${a.habitName}`.trim();
  }
  function renderHonorMedal(a) {
    const type = a.type || "daily";
    const hasCompanion = Boolean(a.companion);
    const sealEmoji = hasCompanion ? achievementCompanionEmoji(a) : a.habitIcon || "\u{1F3C6}";
    const companionLine = achievementCompanionSubtitle(a);
    return `
    <article class="honor-medal honor-medal-${type}${hasCompanion ? " has-companion" : ""}">
      <div class="honor-medal-seal" aria-hidden="true">${sealEmoji}</div>
      <div class="honor-medal-body">
        <div class="honor-medal-task">${achievementTitle(a)}</div>
        ${companionLine ? `<div class="honor-medal-reward">${companionLine}</div>` : ""}
        <div class="honor-medal-stat">${achievementDetailLine(a)}</div>
        <time class="honor-medal-date">${formatAchievementDate(a.completedAt)}</time>
      </div>
    </article>`;
  }
  function completionCelebrateMsg(habit, session) {
    const companion = session.plant;
    if (session.type === "daily" && companion) {
      const finalEmoji = companion.stages[companion.stages.length - 1];
      return `${finalEmoji} ${companion.name} ${completionText(companion)}\uFF01\u5DF2\u5165\u4F4F\u4F19\u4F34\u7A9D \xB7 +1 \u8865\u7B7E \xB7 \u300C${habit.name}\u300D\u53EF\u968F\u65F6\u518D\u6311\u6218`;
    }
    if (session.type === "general" && companion) {
      const finalEmoji = companion.stages[companion.stages.length - 1];
      return `${finalEmoji} ${companion.name} ${completionText(companion)}\uFF01\u5DF2\u6536\u5F55\u690D\u7269\u56FE\u9274 \xB7 +1 \u8865\u7B7E \xB7 \u300C${habit.name}\u300D\u53EF\u968F\u65F6\u518D\u6311\u6218`;
    }
    return `\u300C${habit.name}\u300D\u76EE\u6807\u8FBE\u6210\uFF01\u5DF2\u8BB0\u5165\u8363\u8A89\u699C \xB7 +1 \u8865\u7B7E \xB7 \u53EF\u968F\u65F6\u518D\u6311\u6218`;
  }
  function renderPool() {
    const pool = store.poolHabits();
    const achievements = store.getAchievements();
    let html = `<div class="section-title">\u4E60\u60EF\u6C60</div>`;
    if (pool.length === 0) {
      html += `<div class="empty-slot" style="padding:20px">\u4E60\u60EF\u6C60\u4E3A\u7A7A</div>`;
    }
    for (const h of pool) {
      const type = h.type || "daily";
      const slotsLeft = store.focusSlotsRemaining(type);
      html += `
      <div class="pool-item">
        <span class="pool-icon">${h.icon}</span>
        <div class="pool-body">
          <strong>${typeBadge(type)} ${h.name}</strong>
          <small>${poolStatsLine(h)}</small>
        </div>
        <div class="pool-actions">
          <button class="btn btn-ghost" data-edit="${h.id}">\u7F16\u8F91</button>
          <button class="btn btn-primary${slotsLeft === 0 ? " adopt-blocked" : ""}" data-adopt="${h.id}" ${slotsLeft === 0 ? 'data-slots-full="1"' : ""}>${poolAdoptLabel(type)}</button>
        </div>
      </div>`;
    }
    html += `<div class="section-title">\u{1F3C6} \u8363\u8A89\u699C${achievements.length ? ` \xB7 ${achievements.length} \u9879` : ""}</div>`;
    if (achievements.length === 0) {
      html += `<div class="empty-slot honor-empty">\u5B8C\u6210\u6311\u6218\u540E\uFF0C\u52CB\u7AE0\u4F1A\u9648\u5217\u5728\u8FD9\u91CC</div>`;
    } else {
      html += `<div class="honor-wall">`;
      for (const a of achievements) {
        html += renderHonorMedal(a);
      }
      html += `</div>`;
    }
    $("#tabContent").innerHTML = html;
  }
  function renderSettings() {
    const mulligans = store.getMulliganCredits();
    const sessions = store.getFocusSessions();
    const yesterday = yesterdayKey();
    let mulliganHtml = "";
    if (mulligans > 0) {
      const eligible = sessions.filter((s) => {
        if (s.checkIns.includes(yesterday)) return false;
        if (s.type === "daily") return s.atRisk || s.checkIns.length > 0;
        return true;
      });
      if (eligible.length > 0) {
        mulliganHtml = `<div class="section-title">\u8865\u7B7E</div>`;
        for (const s of eligible) {
          const h = store.getHabit(s.habitId);
          if (!h) continue;
          mulliganHtml += `
          <div class="pool-item">
            <span class="pool-icon">${h.icon}</span>
            <div class="pool-body">
              <strong>${typeBadge(s.type)} ${h.name}</strong>
              <small>\u8865\u7B7E ${yesterday}${mulliganLabel(s)}</small>
            </div>
            <button class="btn btn-primary" data-mulligan="${h.id}">\u8865\u7B7E</button>
          </div>`;
        }
      }
    }
    $("#tabContent").innerHTML = `
    <div class="sync-notice site-url-notice">
      <strong>\u8BBF\u95EE\u5730\u5740</strong>
      <p class="site-url-row"><code id="siteUrlText">${siteUrl()}</code></p>
      <button class="btn" type="button" id="copySiteUrl">\u590D\u5236\u94FE\u63A5</button>
      <p class="site-url-hint">\u624B\u673A\u3001\u7535\u8111\u8BF7\u4F7F\u7528\u540C\u4E00\u94FE\u63A5\u6253\u5F00\uFF0C\u6570\u636E\u4F1A\u81EA\u52A8\u540C\u6B65\u3002</p>
    </div>
    <div class="sync-notice">
      <strong>${store.isSyncEnabled() ? "\u2601\uFE0F \u4E91\u7AEF\u81EA\u52A8\u540C\u6B65\u5DF2\u5F00\u542F" : "\u26A0\uFE0F \u79BB\u7EBF\u6A21\u5F0F\uFF08\u4EC5\u672C\u673A\uFF09"}</strong>
      <p>${store.isSyncEnabled() ? "\u6570\u636E\u4FDD\u5B58\u5728 Cloudflare\uFF0C\u624B\u673A\u4E0E\u7535\u8111\u6253\u5F00\u540C\u4E00\u7F51\u5740\u5373\u53EF\u540C\u6B65\u3002" : "\u672A\u80FD\u8FDE\u63A5\u4E91\u7AEF API\uFF0C\u6570\u636E\u4EC5\u4FDD\u5B58\u5728\u672C\u673A\u6D4F\u89C8\u5668\u3002"}</p>
    </div>
    <div class="settings-panel">
      <div class="section-title" style="margin-top:0">\u6570\u636E\u540C\u6B65</div>
      <div class="sync-actions">
        <button class="btn btn-primary" id="exportData">\u5BFC\u51FA\u6570\u636E</button>
        <button class="btn" id="importDataBtn">\u5BFC\u5165\u6570\u636E</button>
      </div>
      <div class="form-group" id="importArea" hidden>
        <textarea id="importText" placeholder='{"version":2,...}'></textarea>
        <button class="btn btn-primary" id="confirmImport" style="width:100%;margin-top:8px">\u786E\u8BA4\u5BFC\u5165</button>
      </div>
    </div>
    <div class="settings-panel" style="margin-top:14px">
      <div class="form-group">
        <label>\u6BCF\u65E5\u63D0\u9192\u65F6\u95F4</label>
        <input type="time" id="settingReminder" value="${store.getReminderTime()}" />
      </div>
      <div class="form-group">
        <label>\u8865\u7B7E\u673A\u4F1A</label>
        <input type="text" disabled value="\u5F53\u524D ${mulligans} \u6B21\uFF08\u5B8C\u6210\u6311\u6218 +1\uFF09" />
      </div>
      <button class="btn btn-primary" id="saveReminder" style="width:100%;padding:12px">\u4FDD\u5B58\u63D0\u9192</button>
    </div>
    ${mulliganHtml}`;
  }
  function render() {
    try {
      renderHeader();
      document.body.classList.toggle("tab-home-active", activeTab === "home");
      if (activeTab === "home") renderHome();
      else if (activeTab === "pool") renderPool();
      else renderSettings();
    } catch (err) {
      console.error("[habit-tracker] render failed:", err);
      if (!appReady) throw err;
      const root = $("#tabContent");
      if (root) {
        root.innerHTML = `<div class="empty-slot">\u754C\u9762\u5237\u65B0\u51FA\u9519\uFF0C\u8BF7\u91CD\u65B0\u6253\u5F00\u9875\u9762</div>`;
      }
    }
  }
  function processPendingEvents() {
    var _a;
    const events = store.consumePendingEvents();
    for (const ev of events) {
      if (ev.kind === "at_risk") {
        pendingRescueHabitId = ev.habit.id;
        $("#rescueMsg").textContent = `\u300C${ev.habit.name}\u300D\u6628\u65E5\u672A\u7167\u6599\u3002\u4F7F\u7528 1 \u6B21\u8865\u7B7E\u673A\u4F1A\u53EF\u7EE7\u7EED\u6311\u6218\uFF0C\u5426\u5219\u4E0B\u6B21\u6253\u5F00\u5C06\u5931\u6548\u3002`;
        $("#rescueModal").classList.add("show");
        break;
      }
      if (ev.kind === "failed") {
        const isFlex = ((_a = ev.session) == null ? void 0 : _a.type) === "general";
        const reason = ev.reason === "missed_day" ? "\u6628\u65E5\u672A\u7167\u6599\uFF0C\u8FDE\u7EED\u6311\u6218\u4E2D\u65AD" : "\u79CD\u5B50\u672A\u80FD\u53D1\u82BD\uFF0C\u671F\u9650\u5185\u672A\u8FBE\u6210\u76EE\u6807\u6B21\u6570";
        $("#failTitle").textContent = isFlex ? "\u79CD\u5B50\u672A\u80FD\u53D1\u82BD" : "\u6311\u6218\u5931\u6548";
        $("#failMsg").textContent = `\u300C${ev.habit.name}\u300D${reason}\uFF0C\u5DF2\u56DE\u5230\u4E60\u60EF\u6C60\u3002`;
        $("#failModal").classList.add("show");
      }
      if (ev.kind === "completed") {
        const session = ev.session;
        if (session.plant) {
          $("#celebrateEmoji").textContent = session.plant.stages[session.plant.stages.length - 1];
        } else {
          $("#celebrateEmoji").textContent = "\u{1F3C6}";
        }
        $("#celebrateTitle").textContent = celebrateTitle(session);
        $("#celebrateMsg").textContent = completionCelebrateMsg(ev.habit, ev.session);
        $("#celebrateModal").classList.add("show");
      }
    }
  }
  function handleCheckIn(habitId) {
    var _a, _b;
    try {
      const result = store.checkIn(habitId);
      launchConfetti();
      (_a = $(`#avatar-${habitId}`)) == null ? void 0 : _a.classList.add("bounce");
      if (result.completed) {
        const { habit, session } = result;
        if (session.plant) {
          $("#celebrateEmoji").textContent = session.plant.stages[session.plant.stages.length - 1];
        } else {
          $("#celebrateEmoji").textContent = "\u{1F3C6}";
        }
        $("#celebrateTitle").textContent = celebrateTitle(session);
        $("#celebrateMsg").textContent = completionCelebrateMsg(habit, session);
        $("#celebrateModal").classList.add("show");
      } else {
        const session = result.session;
        if (session.plant) {
          if (session.type === "general") {
            const p = generalProgress(session);
            $("#celebrateEmoji").textContent = flexGrowthEmoji(p.count, p.goal);
            $("#celebrateTitle").textContent = "\u6D47\u6C34\u6210\u529F\uFF01";
          } else {
            $("#celebrateEmoji").textContent = companionStageEmoji(
              session.plant,
              stageDayForCompanion(session)
            );
            $("#celebrateTitle").textContent = `${careVerb(session.plant)}\u6210\u529F\uFF01`;
          }
          $("#celebrateMsg").textContent = randomCheer(session.type === "general");
        } else {
          $("#celebrateEmoji").textContent = ((_b = store.getHabit(habitId)) == null ? void 0 : _b.icon) || "\u2713";
          $("#celebrateTitle").textContent = "\u6253\u5361\u6210\u529F\uFF01";
          $("#celebrateMsg").textContent = randomCheer();
        }
        $("#celebrateModal").classList.add("show");
      }
      render();
    } catch (e) {
      showErrorToast(e);
    }
  }
  function handleAdopt(habitId) {
    const habit = store.getHabit(habitId);
    const type = (habit == null ? void 0 : habit.type) || "daily";
    if (store.focusSlotsRemaining(type) <= 0) {
      showToast(TOAST.focusFull);
      return;
    }
    try {
      const session = store.adoptToFocus(habitId);
      activeTab = "home";
      $$(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === "home"));
      render();
      if (session.plant) {
        openWelcomeModal(session, habit);
      } else {
        showToast(`\u300C${habit.name}\u300D\u5DF2\u9009\u5165${typeToastLabel(habit.type)}`);
      }
    } catch (e) {
      showErrorToast(e);
    }
  }
  function toggleGeneralFields(prefix) {
    var _a, _b;
    const type = ((_a = $(`#${prefix}HabitType`)) == null ? void 0 : _a.value) || ((_b = $("#habitType")) == null ? void 0 : _b.value);
    const fields = prefix ? $(`#${prefix}GeneralGoalFields`) : $("#generalGoalFields");
    if (fields) fields.hidden = type !== "general";
  }
  function openAddModal() {
    newHabitIcon = "\u{1F3AF}";
    $("#habitName").value = "";
    $("#habitDesc").value = "";
    $("#habitType").value = "daily";
    $("#habitGoalDays").value = "30";
    $("#habitGoalCheckins").value = "10";
    toggleGeneralFields("");
    renderIconPicker("#addIconPicker", newHabitIcon, (icon) => {
      newHabitIcon = icon;
    });
    $("#addModal").classList.add("show");
  }
  function openEditModal(habitId) {
    const habit = store.getHabit(habitId);
    $("#editHabitId").value = habitId;
    $("#editHabitName").value = habit.name;
    $("#editHabitDesc").value = habit.description || "";
    $("#editHabitType").value = habit.type || "daily";
    $("#editGoalDays").value = habit.goalDays || 30;
    $("#editGoalCheckins").value = habit.goalCheckins || 10;
    toggleGeneralFields("edit");
    renderIconPicker("#editIconPicker", habit.icon, (icon) => {
      $("#editHabitId").dataset.icon = icon;
    });
    $("#editModal").classList.add("show");
  }
  function renderIconPicker(containerSel, selected, onSelect) {
    const container = $(containerSel);
    container.innerHTML = ICONS.map(
      (icon) => `<button type="button" class="icon-opt ${icon === selected ? "selected" : ""}" data-icon="${icon}">${icon}</button>`
    ).join("");
    container.querySelectorAll(".icon-opt").forEach((btn) => {
      btn.addEventListener("click", () => {
        container.querySelectorAll(".icon-opt").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        onSelect(btn.dataset.icon);
      });
    });
  }
  function saveNewHabit() {
    const name = $("#habitName").value.trim();
    if (!name) {
      showToast(TOAST.needName);
      return;
    }
    const type = $("#habitType").value;
    store.addHabit({
      name,
      icon: newHabitIcon,
      description: $("#habitDesc").value.trim(),
      type,
      goalDays: $("#habitGoalDays").value,
      goalCheckins: $("#habitGoalCheckins").value
    });
    $("#addModal").classList.remove("show");
    showToast(TOAST.addedToPool);
    activeTab = "pool";
    $$(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === "pool"));
    render();
  }
  function saveEditHabit() {
    var _a;
    const id = $("#editHabitId").value;
    const icon = (_a = $("#editIconPicker").querySelector(".selected")) == null ? void 0 : _a.dataset.icon;
    const type = $("#editHabitType").value;
    try {
      store.updateHabit(id, {
        name: $("#editHabitName").value.trim(),
        description: $("#editHabitDesc").value.trim(),
        type,
        goalDays: Number($("#editGoalDays").value),
        goalCheckins: Number($("#editGoalCheckins").value),
        ...icon ? { icon } : {}
      });
      $("#editModal").classList.remove("show");
      showToast(TOAST.savedEdit);
      render();
    } catch (e) {
      showErrorToast(e);
    }
  }
  function openAbandonModal(habitId) {
    pendingAbandonId = habitId;
    const habit = store.getHabit(habitId);
    $("#abandonText").textContent = `\u786E\u5B9A\u6682\u65F6\u653E\u5F03\u300C${habit.name}\u300D\u5417\uFF1F`;
    $("#abandonModal").classList.add("show");
  }
  function confirmAbandon() {
    if (!pendingAbandonId) return;
    try {
      store.abandonFocus(pendingAbandonId);
      showToast(TOAST.abandoned);
      pendingAbandonId = null;
      $("#abandonModal").classList.remove("show");
      render();
    } catch (e) {
      showErrorToast(e);
    }
  }
  function doMulligan(habitId, date = yesterdayKey()) {
    store.useMulligan(habitId, date);
    launchConfetti();
    showToast(TOAST.mulliganOk);
    render();
  }
  async function exportData() {
    const json = JSON.stringify(store.exportSnapshot(), null, 2);
    try {
      await navigator.clipboard.writeText(json);
      showToast(TOAST.exported);
    } catch (e) {
      showToast(TOAST.exportFail);
    }
  }
  function confirmImportData() {
    var _a, _b;
    const text = (_b = (_a = $("#importText")) == null ? void 0 : _a.value) == null ? void 0 : _b.trim();
    if (!text || !confirm("\u8986\u76D6\u672C\u673A\u6570\u636E\uFF1F")) return;
    try {
      store.importSnapshot(text);
      $("#importArea").hidden = true;
      showToast(TOAST.imported);
      render();
      processPendingEvents();
    } catch (e) {
      showErrorToast(e);
    }
  }
  async function purgeStaleCaches() {
    if ("serviceWorker" in navigator) {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      } catch (e) {
      }
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  }
  function bindTabContentEvents() {
    const root = $("#tabContent");
    if (!root || root.dataset.bound === "1") return;
    root.dataset.bound = "1";
    root.addEventListener("click", (e) => {
      const target = e.target.closest(
        "[data-checkin], [data-abandon], [data-adopt], [data-edit], [data-mulligan], [data-rescue], #saveReminder, #exportData, #importDataBtn, #confirmImport, #copySiteUrl"
      );
      if (!target) return;
      if (!root.contains(target) && !target.closest("#tabContent")) return;
      if (target.id === "exportData") return exportData();
      if (target.id === "copySiteUrl") return copySiteUrl();
      if (target.id === "importDataBtn") {
        $("#importArea").hidden = !$("#importArea").hidden;
        return;
      }
      if (target.id === "confirmImport") return confirmImportData();
      if (target.id === "saveReminder") {
        store.setReminderTime($("#settingReminder").value);
        showToast(TOAST.savedReminder);
        return;
      }
      if (target.dataset.adopt && target.dataset.slotsFull) {
        showToast(TOAST.focusFull);
        return;
      }
      if (target.disabled && !target.dataset.rescue) return;
      e.preventDefault();
      if (target.dataset.checkin) handleCheckIn(target.dataset.checkin);
      else if (target.dataset.abandon) openAbandonModal(target.dataset.abandon);
      else if (target.dataset.adopt) handleAdopt(target.dataset.adopt);
      else if (target.dataset.edit) openEditModal(target.dataset.edit);
      else if (target.dataset.mulligan) {
        try {
          doMulligan(target.dataset.mulligan);
        } catch (err) {
          showErrorToast(err);
        }
      } else if (target.dataset.rescue) {
        pendingRescueHabitId = target.dataset.rescue;
        $("#rescueMsg").textContent = `\u4F7F\u7528 1 \u6B21\u8865\u7B7E\u673A\u4F1A\u8865\u7B7E\u6628\u65E5\uFF1F`;
        $("#rescueModal").classList.add("show");
      }
    });
  }
  var staticEventsBound = false;
  function bindStaticEvents() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
    if (staticEventsBound) return;
    staticEventsBound = true;
    $$(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeTab = btn.dataset.tab;
        $$(".tab-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        render();
      });
    });
    (_a = $("#fabAdd")) == null ? void 0 : _a.addEventListener("click", openAddModal);
    (_b = $("#habitType")) == null ? void 0 : _b.addEventListener("change", () => toggleGeneralFields(""));
    (_c = $("#editHabitType")) == null ? void 0 : _c.addEventListener("change", () => toggleGeneralFields("edit"));
    (_d = $("#confirmAbandon")) == null ? void 0 : _d.addEventListener("click", confirmAbandon);
    (_e = $("#cancelAbandon")) == null ? void 0 : _e.addEventListener("click", () => {
      var _a2;
      return (_a2 = $("#abandonModal")) == null ? void 0 : _a2.classList.remove("show");
    });
    (_f = $("#saveHabit")) == null ? void 0 : _f.addEventListener("click", saveNewHabit);
    (_g = $("#cancelAdd")) == null ? void 0 : _g.addEventListener("click", () => {
      var _a2;
      return (_a2 = $("#addModal")) == null ? void 0 : _a2.classList.remove("show");
    });
    (_h = $("#saveEdit")) == null ? void 0 : _h.addEventListener("click", saveEditHabit);
    (_i = $("#deleteEdit")) == null ? void 0 : _i.addEventListener("click", deleteEditHabit);
    (_j = $("#cancelEdit")) == null ? void 0 : _j.addEventListener("click", () => {
      var _a2;
      return (_a2 = $("#editModal")) == null ? void 0 : _a2.classList.remove("show");
    });
    (_k = $("#closeCelebrate")) == null ? void 0 : _k.addEventListener("click", () => {
      var _a2;
      (_a2 = $("#celebrateModal")) == null ? void 0 : _a2.classList.remove("show");
    });
    (_l = $("#closeHatch")) == null ? void 0 : _l.addEventListener("click", () => {
      var _a2;
      return (_a2 = $("#hatchModal")) == null ? void 0 : _a2.classList.remove("show");
    });
    (_m = $("#closeFail")) == null ? void 0 : _m.addEventListener("click", () => {
      var _a2;
      return (_a2 = $("#failModal")) == null ? void 0 : _a2.classList.remove("show");
    });
    (_n = $("#rescueMulligan")) == null ? void 0 : _n.addEventListener("click", () => {
      if (!pendingRescueHabitId) return;
      try {
        doMulligan(pendingRescueHabitId, yesterdayKey());
        pendingRescueHabitId = null;
        $("#rescueModal").classList.remove("show");
      } catch (e) {
        showErrorToast(e);
      }
    });
    (_o = $("#rescueSkip")) == null ? void 0 : _o.addEventListener("click", () => {
      pendingRescueHabitId = null;
      $("#rescueModal").classList.remove("show");
      showToast(TOAST.rescueSkip);
    });
  }
  function deleteEditHabit() {
    const id = $("#editHabitId").value;
    const habit = store.getHabit(id);
    if (!habit || !confirm(`\u5220\u9664\u300C${habit.name}\u300D\uFF1F`)) return;
    try {
      store.deleteHabit(id);
      $("#editModal").classList.remove("show");
      showToast(TOAST.deleted);
      render();
    } catch (e) {
      showErrorToast(e);
    }
  }
  function startSyncLoop() {
    const tick = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        if (!store.isSyncEnabled()) await store.ensureSync();
        if (await store.syncFromServer()) render();
        store.evaluateSessions(true);
        processPendingEvents();
        render();
      } catch (err) {
        console.error("[habit-tracker] sync failed:", err);
      }
    };
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") tick();
    });
    setInterval(tick, 8e3);
  }
  async function bootstrap() {
    window.__habitBootStarted = true;
    try {
      await store.init();
      if ((location.hostname === "127.0.0.1" || location.hostname === "localhost") && store.getHabits().length === 0) {
        store.seedFromConfig(CONFIRMED_CONFIG);
      }
      store.evaluateSessions(true);
      bindTabContentEvents();
      bindStaticEvents();
      processPendingEvents();
      render();
      appReady = true;
      window.__habitAppReady = true;
      startSyncLoop();
      void purgeStaleCaches();
    } catch (err) {
      showBootstrapError(err);
    } finally {
      if (appReady) hideLoadStatus();
    }
  }
  function initApp() {
    const host = location.hostname;
    const boot = () => bootstrap();
    if (host === "127.0.0.1" || host === "localhost") {
      ensureCanonicalUrl().then((ok) => {
        if (ok) boot();
        loadCanonicalUrl();
      });
      return;
    }
    boot();
    loadCanonicalUrl();
  }
  window.addEventListener("habit-store-synced", () => {
    if (!appReady) return;
    render();
    processPendingEvents();
  });
  window.addEventListener("pageshow", (e) => {
    if (e.persisted && appReady) {
      hideLoadStatus();
      render();
    }
  });
  initApp();
})();
