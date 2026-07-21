import { HabitStore } from "./store.js";
import {
  companionStageEmoji,
  stageLabel,
  stageIndex,
  randomCheer,
  completionText,
  companionKindLabel,
  evolutionStageLabels,
  hatchVerb,
  careVerb,
  randomCompanion,
} from "./plants.js";
import {
  typeInfo,
  typeToastLabel,
  dailyProgress,
  generalProgress,
  stageDayForCompanion,
  mulliganLabel,
  yesterdayKey,
  DAILY_TARGET,
} from "./habit-rules.js";

const ICONS = ["📖", "🏃", "🧘", "💧", "🌅", "✍️", "🎸", "🥗", "😴", "🧹", "💊", "🚶", "🧠", "🎯"];
const FOCUS_FULL_TOAST = "任务超载，保护你的注意力哦～";

const TOAST = {
  focusFull: FOCUS_FULL_TOAST,
  needName: "请输入习惯名称",
  addedToPool: "已加入习惯池",
  savedEdit: "修改已保存",
  savedReminder: "提醒时间已保存",
  abandoned: "已暂时放弃，习惯回到习惯池",
  archivedHonor: "已记入荣誉榜",
  keptInPool: "已回到习惯池，可随时再挑战",
  challengeDone: "挑战完成！已记入荣誉榜",
  mulliganOk: "补签成功，继续加油～",
  exported: "数据已复制到剪贴板",
  exportFail: "复制失败，请手动选择内容复制",
  imported: "数据导入成功",
  deleted: "习惯已删除",
  rescueSkip: "已跳过，下次打开时挑战可能失效",
  fallback: "操作失败，请稍后重试",
  loadFail: "加载失败，请刷新页面重试",
};

/** 将内部错误转为用户可读文案，过滤 HTML / 状态码等技术信息 */
function userFacingMessage(err) {
  const msg = (typeof err === "string" ? err : err?.message || "").trim();
  if (!msg) return TOAST.fallback;
  if (msg.includes("<") || msg.includes(">")) return TOAST.fallback;
  if (/server\s+\d+|save failed|SyntaxError|Unexpected token|JSON\.parse|Invalid/i.test(msg)) {
    return TOAST.fallback;
  }
  const map = {
    "聚焦中的习惯无法修改类型，请先暂时放弃": "正在聚焦中，请先暂时放弃再修改",
    "习惯不存在": "找不到这个习惯",
    "聚焦中的习惯无法删除，请先暂时放弃": "正在聚焦中，请先暂时放弃再删除",
    "仅习惯池中的习惯可以删除": "只能删除习惯池中的习惯",
    "该习惯无法选入聚焦": "这个习惯暂时无法选入聚焦",
    "21Daily 聚焦坑位已满": TOAST.focusFull,
    "General 聚焦坑位已满": TOAST.focusFull,
    "聚焦坑位已满": TOAST.focusFull,
    "未找到聚焦中的习惯": "这个习惯不在聚焦中",
    "该习惯不在聚焦中": "这个习惯不在聚焦中",
    "今日已打卡": "今天已经打卡啦",
    "昨日未打卡，请先使用补签挽救": "昨日未打卡，请先补签挽救",
    "没有可用的补签机会": "暂无补签机会",
    "该日期已打卡": "这一天已经打卡过了",
    "不能补签未来日期": "不能补签未来的日期",
    "补签日期须在挑战期限内": "只能补签挑战期内的日期",
    "无效的数据格式": "导入内容有误，请检查后重试",
    "导入内容格式不正确，请检查后重试": "导入内容有误，请检查后重试",
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

const CONFIRMED_CONFIG = {
  reminderTime: "09:30",
  habits: [
    { name: "阅读 30 分钟", icon: "📖", inFocus: true, bestStreak: 12, attemptCount: 2, currentDay: 12 },
    { name: "运动 20 分钟", icon: "🏃", inFocus: true, bestStreak: 7, attemptCount: 1, currentDay: 5 },
    { name: "冥想 10 分钟", icon: "🧘", inFocus: false, bestStreak: 14, attemptCount: 3, currentDay: 0 },
    { name: "喝 8 杯水", icon: "💧", inFocus: false, bestStreak: 21, attemptCount: 1, currentDay: 0 },
    { name: "早起 6:30", icon: "🌅", inFocus: false, bestStreak: 9, attemptCount: 2, currentDay: 0 },
  ],
};

const store = new HabitStore();

let activeTab = "home";
let pendingAbandonId = null;
let pendingRescueHabitId = null;
let dailyCarouselIndex = 0;
let appReady = false;
let newHabitIcon = "🎯";
let canonicalUrl = location.origin + location.pathname;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

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
  setTimeout(() => (container.innerHTML = ""), 3000);
}

const FETCH_TIMEOUT_MS = 6000;

async function fetchWithTimeout(url, options = {}, ms = FETCH_TIMEOUT_MS) {
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
    const res = await fetchWithTimeout("./lan-config.json", { cache: "no-store" });
    if (!res.ok) return;
    const cfg = await res.json();
    if (cfg.canonicalUrl) canonicalUrl = cfg.canonicalUrl;
  } catch {
    /* ignore */
  }
}

async function ensureCanonicalUrl() {
  const host = location.hostname;
  if (host !== "127.0.0.1" && host !== "localhost") return true;
  try {
    const res = await fetchWithTimeout("./lan-config.json", { cache: "no-store" });
    if (!res.ok) return true;
    const cfg = await res.json();
    if (cfg.canonicalUrl) {
      const canonicalOrigin = new URL(cfg.canonicalUrl).origin;
      if (location.origin !== canonicalOrigin) {
        location.replace(cfg.canonicalUrl);
        return false;
      }
    }
  } catch {
    /* ignore */
  }
  return true;
}

function renderHeader() {
  const daily = store.getFocusSessions("daily");
  const general = store.getFocusSessions("general");
  $("#statsBar").innerHTML = `
    <span class="stat-chip">21D ${daily.length}/3</span>
    <span class="stat-chip">Gen ${general.length}/3</span>
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
  document.getElementById("loadStatus")?.remove();
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

function renderEvolutionRow(companion, streak) {
  if (!companion?.stages?.length) return "";
  const kind = companion.kind || "plant";
  const labels = evolutionStageLabels(kind);
  const current = stageIndex(streak);
  return companion.stages
    .map(
      (emoji, i) =>
        `<span class="evo-step ${i <= current ? "evo-done" : ""} ${i === current ? "evo-current" : ""}" title="${labels[i]}">${emoji}</span>`
    )
    .join("");
}

function nurtureTaskBridge(companion) {
  return `帮${companion.name}完成今日成长`;
}

function renderDailyNurtureCard(session) {
  const habit = store.getHabit(session.habitId);
  if (!habit) return "";
  const companion = session.plant || randomCompanion();
  const checked = store.isCheckedInToday(session);
  const kind = companion?.kind || "plant";
  const p = dailyProgress(session);
  const emoji = companionStageEmoji(companion, p.streak);
  const mullTag = mulliganLabel(session);
  const atRisk = session.atRisk;
  const themeClass = kind === "pet" ? "companion-pet" : "companion-plant";

  const riskBanner = atRisk
    ? `<div class="at-risk-hint">昨日未打卡 · <button class="link-btn link-btn-muted" data-rescue="${habit.id}">补签挽救</button></div>`
    : "";

  const actionBtn = checked
    ? `<div class="nurture-done">✨ 今日已完成：${habit.icon} ${habit.name}</div>`
    : `<button class="checkin-btn nurture-checkin" data-checkin="${habit.id}" ${atRisk ? "disabled" : ""}>✓ 完成「${habit.name}」</button>`;

  return `
    <article class="daily-nurture-card ${themeClass} ${checked ? "done-today" : ""}" data-habit="${habit.id}">
      ${riskBanner}
      <div class="nurture-hero">
        <div class="nurture-avatar-large" id="avatar-${habit.id}">${emoji}</div>
        <div class="nurture-companion-name">${companion.name}</div>
        <div class="nurture-stage">${companionKindLabel(companion)} · ${stageLabel(p.streak, kind)}</div>
      </div>
      <div class="nurture-divider"></div>
      <div class="nurture-task-title">${habit.icon} ${habit.name}${mullTag}</div>
      <div class="nurture-task-bridge">${nurtureTaskBridge(companion)}</div>
      <div class="nurture-progress">
        <div class="progress-label"><span>连续 ${p.streak}/${DAILY_TARGET} 天</span><span>${p.pct}%</span></div>
        <div class="progress-bar"><div class="progress-fill" style="width:${p.pct}%"></div></div>
      </div>
      <div class="nurture-evolution">${renderEvolutionRow(companion, p.streak)}</div>
      ${actionBtn}
      <button class="abandon-link" data-abandon="${habit.id}">暂时放弃</button>
    </article>`;
}

function renderGeneralTaskCard(session) {
  const habit = store.getHabit(session.habitId);
  if (!habit) return "";
  const checked = store.isCheckedInToday(session);
  const p = generalProgress(session);
  const mullTag = mulliganLabel(session);

  return `
    <article class="general-task-card ${checked ? "done-today" : ""}" data-habit="${habit.id}">
      <div class="task-card-main">
        <span class="task-icon" aria-hidden="true">${habit.icon}</span>
        <div class="task-info">
          <h2>${typeBadge("general")} ${habit.name}</h2>
          <div class="task-meta">${p.count}/${p.goal} 次 · 剩 ${p.daysLeft} 天${mullTag}</div>
          <div class="progress-wrap progress-inline">
            <div class="progress-bar"><div class="progress-fill" style="width:${p.pct}%"></div></div>
          </div>
        </div>
        <div class="task-action">
          ${checked
            ? `<span class="checkin-done-compact">✓</span>`
            : `<button class="checkin-btn checkin-btn-compact" data-checkin="${habit.id}">打卡</button>`}
        </div>
      </div>
      <div class="progress-wrap progress-full">
        <div class="progress-label"><span>进度</span><span>${p.pct}%</span></div>
        <div class="progress-bar"><div class="progress-fill" style="width:${p.pct}%"></div></div>
      </div>
      ${checked
        ? `<div class="checkin-done checkin-done-full">✨ 今日已完成</div>`
        : `<button class="checkin-btn checkin-btn-full" data-checkin="${habit.id}">今日打卡</button>`}
      <button class="abandon-link" data-abandon="${habit.id}">暂时放弃</button>
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
    cardsHtml += `<div class="daily-carousel-slide"><div class="empty-slot daily-empty-slot">空坑位 · 去习惯池选入</div></div>`;
  }

  const dotsHtml =
    sessions.length + remaining > 1
      ? `<div class="daily-carousel-dots" id="dailyCarouselDots"></div>`
      : "";

  const emptyHtml =
    sessions.length === 0 && remaining === 3
      ? `<div class="empty-slot daily-empty-slot">从习惯池选入 · 随机获得植物或宠物伙伴</div>`
      : "";

  if (sessions.length === 0 && remaining < 3) {
    /* mixed empty + slots handled in carousel */
  }

  return `
    <div class="focus-section focus-section-daily">
      <div class="focus-section-head">
        <h3>21Daily 养成场</h3>
        <span class="focus-section-count">${sessions.length}/3</span>
      </div>
      ${sessions.length === 0 && remaining === 3 ? emptyHtml : `
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
      <h3>General 任务板</h3>
      <span class="focus-section-count">${sessions.length}/3</span>
    </div>`;

  if (sessions.length === 0 && remaining === 3) {
    html += `<div class="empty-slot empty-slot-sm">从习惯池选入 · 期限内指定次数</div>`;
  }

  for (const s of sessions) {
    html += renderGeneralTaskCard(s);
  }
  for (let i = 0; i < remaining; i++) {
    html += `<div class="empty-slot empty-slot-sm">空坑位</div>`;
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
    dotsEl.innerHTML = slides
      .map(
        (_, i) =>
          `<button type="button" class="carousel-dot ${i === dailyCarouselIndex ? "active" : ""}" data-dot="${i}" aria-label="第 ${i + 1} 个"></button>`
      )
      .join("");
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

function openHatchModal(session, habit) {
  const companion = session.plant;
  if (!companion) return;
  const kind = companion.kind || "plant";
  const verb = hatchVerb(companion);
  $("#hatchEmoji").textContent = companion.stages[0];
  $("#hatchTitle").textContent = `${verb}成功！你获得了 ${companion.name}`;
  $("#hatchMsg").textContent = `连续打卡 21 天，帮它完成进化吧～`;
  $("#hatchHabit").textContent = `关联习惯：${habit.icon} ${habit.name}`;
  $("#hatchStages").innerHTML = renderEvolutionRow(companion, 0);
  $("#hatchModal").dataset.habitId = habit.id;
  $("#hatchModal").classList.toggle("hatch-pet", kind === "pet");
  $("#hatchModal").classList.toggle("hatch-plant", kind === "plant");
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

function poolStatsLine(h) {
  if (h.type === "general") {
    return `目标 ${h.goalDays || 30}天/${h.goalCheckins || 10}次 · 开启 ${h.attemptCount} 次${h.completionCount ? ` · 完成 ${h.completionCount} 次` : ""}`;
  }
  return `最高连续 ${h.bestStreak} 天 · 开启 ${h.attemptCount} 次${h.completionCount ? ` · 完成 ${h.completionCount} 次` : ""}`;
}

function formatAchievementDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function achievementCompanionEmoji(a) {
  if (a.companion?.stages?.length) {
    return a.companion.stages[a.companion.stages.length - 1];
  }
  return a.habitIcon || "🏆";
}

function achievementTitle(a) {
  if (a.type === "daily" && a.companion) {
    const kind = a.companion.kind || "plant";
    const got = kind === "pet" ? "获得了宠物" : "获得了植物";
    return `${got} · ${a.companion.name}`;
  }
  return `${a.type === "general" ? "General" : "21Daily"} · ${a.habitName}`;
}

function achievementSummary(a) {
  const mull = a.mulliganUsed > 0 ? `（补签×${a.mulliganUsed}）` : "";
  if (a.type === "general") {
    const days = a.goalDays != null ? a.goalDays : 30;
    const count = a.checkIns != null ? a.checkIns : a.goalCheckins != null ? a.goalCheckins : 0;
    return `${days}天内成功打卡${count}次${a.habitName}${mull}`;
  }
  const streak = a.streak != null ? a.streak : DAILY_TARGET;
  return `${streak}天连续${a.habitName}${mull}`;
}

function completionCelebrateMsg(habit, session) {
  const companion = session.plant;
  if (session.type === "daily" && companion) {
    const finalEmoji = companion.stages[companion.stages.length - 1];
    const kind = companion.kind || "plant";
    const got = kind === "pet" ? "宠物伙伴" : "植物伙伴";
    return `${finalEmoji} ${companion.name} ${completionText(companion)}！${got}已收录进荣誉榜 · +1 补签 · 「${habit.name}」可随时再挑战`;
  }
  return `「${habit.name}」目标达成！已记入荣誉榜 · +1 补签 · 可随时再挑战`;
}

function renderPool() {
  const pool = store.poolHabits();
  const achievements = store.getAchievements();

  let html = `<div class="section-title">习惯池</div>`;
  if (pool.length === 0) {
    html += `<div class="empty-slot" style="padding:20px">习惯池为空</div>`;
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
          <button class="btn btn-ghost" data-edit="${h.id}">编辑</button>
          <button class="btn btn-primary${slotsLeft === 0 ? " adopt-blocked" : ""}" data-adopt="${h.id}" ${slotsLeft === 0 ? 'data-slots-full="1"' : ""}>选入聚焦</button>
        </div>
      </div>`;
  }

  html += `<div class="section-title">🏆 荣誉榜${achievements.length ? ` · ${achievements.length} 项` : ""}</div>`;
  if (achievements.length === 0) {
    html += `<div class="empty-slot" style="padding:20px">完成挑战后，成就会出现在这里</div>`;
  }
  for (const a of achievements) {
    const isDailyCompanion = a.type === "daily" && a.companion;
    html += `
      <div class="honor-item ${isDailyCompanion ? "honor-companion" : ""}">
        <span class="pool-icon honor-avatar">${isDailyCompanion ? achievementCompanionEmoji(a) : a.habitIcon || "🏆"}</span>
        <div class="pool-body">
          <strong>${isDailyCompanion ? achievementTitle(a) : `${typeBadge(a.type || "daily")} ${a.habitName}`}</strong>
          <small>${formatAchievementDate(a.completedAt)} · ${achievementSummary(a)}</small>
        </div>
      </div>`;
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
      mulliganHtml = `<div class="section-title">补签</div>`;
      for (const s of eligible) {
        const h = store.getHabit(s.habitId);
        if (!h) continue;
        mulliganHtml += `
          <div class="pool-item">
            <span class="pool-icon">${h.icon}</span>
            <div class="pool-body">
              <strong>${typeBadge(s.type)} ${h.name}</strong>
              <small>补签 ${yesterday}${mulliganLabel(s)}</small>
            </div>
            <button class="btn btn-primary" data-mulligan="${h.id}">补签</button>
          </div>`;
      }
    }
  }

  $("#tabContent").innerHTML = `
    <div class="sync-notice">
      <strong>${store.isSyncEnabled() ? "☁️ 云端自动同步已开启" : "⚠️ 离线模式（仅本机）"}</strong>
      <p>${store.isSyncEnabled()
        ? "数据保存在 Cloudflare，手机与电脑打开同一网址即可同步。"
        : "未能连接云端 API，数据仅保存在本机浏览器。"}</p>
    </div>
    <div class="settings-panel">
      <div class="section-title" style="margin-top:0">数据同步</div>
      <div class="sync-actions">
        <button class="btn btn-primary" id="exportData">导出数据</button>
        <button class="btn" id="importDataBtn">导入数据</button>
      </div>
      <div class="form-group" id="importArea" hidden>
        <textarea id="importText" placeholder='{"version":2,...}'></textarea>
        <button class="btn btn-primary" id="confirmImport" style="width:100%;margin-top:8px">确认导入</button>
      </div>
    </div>
    <div class="settings-panel" style="margin-top:14px">
      <div class="form-group">
        <label>每日提醒时间</label>
        <input type="time" id="settingReminder" value="${store.getReminderTime()}" />
      </div>
      <div class="form-group">
        <label>补签机会</label>
        <input type="text" disabled value="当前 ${mulligans} 次（完成挑战 +1）" />
      </div>
      <button class="btn btn-primary" id="saveReminder" style="width:100%;padding:12px">保存提醒</button>
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
      root.innerHTML = `<div class="empty-slot">界面刷新出错，请重新打开页面</div>`;
    }
  }
}

function processPendingEvents() {
  const events = store.consumePendingEvents();
  for (const ev of events) {
    if (ev.kind === "at_risk") {
      pendingRescueHabitId = ev.habit.id;
      $("#rescueMsg").textContent = `「${ev.habit.name}」昨日未打卡。使用 1 次补签机会可继续挑战，否则下次打开将失效。`;
      $("#rescueModal").classList.add("show");
      break;
    }
    if (ev.kind === "failed") {
      const reason =
        ev.reason === "missed_day"
          ? "昨日未打卡，连续挑战中断"
          : "目标期限内未达成打卡次数";
      $("#failTitle").textContent = "挑战失效";
      $("#failMsg").textContent = `「${ev.habit.name}」${reason}，已回到习惯池。`;
      $("#failModal").classList.add("show");
    }
    if (ev.kind === "completed") {
      const session = ev.session;
      if (session.type === "daily" && session.plant) {
        $("#celebrateEmoji").textContent = session.plant.stages[session.plant.stages.length - 1];
      } else {
        $("#celebrateEmoji").textContent = "🏆";
      }
      $("#celebrateTitle").textContent =
        ev.session.type === "daily" ? "21Daily 养成成功！" : "General 目标达成！";
      $("#celebrateMsg").textContent = completionCelebrateMsg(ev.habit, ev.session);
      $("#celebrateModal").classList.add("show");
    }
  }
}

function handleCheckIn(habitId) {
  try {
    const result = store.checkIn(habitId);
    launchConfetti();
    $(`#avatar-${habitId}`)?.classList.add("bounce");

    if (result.completed) {
      const { habit, session } = result;
      if (session.type === "daily" && session.plant) {
        $("#celebrateEmoji").textContent = session.plant.stages[session.plant.stages.length - 1];
      } else {
        $("#celebrateEmoji").textContent = "🏆";
      }
      $("#celebrateTitle").textContent =
        session.type === "daily" ? "21Daily 养成成功！" : "General 目标达成！";
      $("#celebrateMsg").textContent = completionCelebrateMsg(habit, session);
      $("#celebrateModal").classList.add("show");
    } else {
      const session = result.session;
      if (session.type === "daily" && session.plant) {
        $("#celebrateEmoji").textContent = companionStageEmoji(
          session.plant,
          stageDayForCompanion(session)
        );
        $("#celebrateTitle").textContent = `${careVerb(session.plant)}成功！`;
      } else {
        $("#celebrateEmoji").textContent = store.getHabit(habitId)?.icon || "✓";
        $("#celebrateTitle").textContent = "打卡成功！";
      }
      $("#celebrateMsg").textContent = randomCheer();
      $("#celebrateModal").classList.add("show");
    }
    render();
  } catch (e) {
    showErrorToast(e);
  }
}

function handleAdopt(habitId) {
  const habit = store.getHabit(habitId);
  const type = habit?.type || "daily";
  if (store.focusSlotsRemaining(type) <= 0) {
    showToast(TOAST.focusFull);
    return;
  }
  try {
    const session = store.adoptToFocus(habitId);
    activeTab = "home";
    $$(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === "home"));
    render();
    if ((habit.type || "daily") === "daily" && session.plant) {
      openHatchModal(session, habit);
    } else {
      showToast(`「${habit.name}」已选入${typeToastLabel(habit.type)}聚焦`);
    }
  } catch (e) {
    showErrorToast(e);
  }
}

function toggleGeneralFields(prefix) {
  const type = $(`#${prefix}HabitType`)?.value || $("#habitType")?.value;
  const fields = prefix ? $(`#${prefix}GeneralGoalFields`) : $("#generalGoalFields");
  if (fields) fields.hidden = type !== "general";
}

function openAddModal() {
  newHabitIcon = "🎯";
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
    (icon) =>
      `<button type="button" class="icon-opt ${icon === selected ? "selected" : ""}" data-icon="${icon}">${icon}</button>`
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
    goalCheckins: $("#habitGoalCheckins").value,
  });
  $("#addModal").classList.remove("show");
  showToast(TOAST.addedToPool);
  activeTab = "pool";
  $$(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === "pool"));
  render();
}

function saveEditHabit() {
  const id = $("#editHabitId").value;
  const icon = $("#editIconPicker").querySelector(".selected")?.dataset.icon;
  const type = $("#editHabitType").value;
  try {
    store.updateHabit(id, {
      name: $("#editHabitName").value.trim(),
      description: $("#editHabitDesc").value.trim(),
      type,
      goalDays: Number($("#editGoalDays").value),
      goalCheckins: Number($("#editGoalCheckins").value),
      ...(icon ? { icon } : {}),
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
  $("#abandonText").textContent = `确定暂时放弃「${habit.name}」吗？`;
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
  } catch {
    showToast(TOAST.exportFail);
  }
}

function confirmImportData() {
  const text = $("#importText")?.value?.trim();
  if (!text || !confirm("覆盖本机数据？")) return;
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
    } catch {
      /* ignore */
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
      "[data-checkin], [data-abandon], [data-adopt], [data-edit], [data-mulligan], [data-rescue], #saveReminder, #exportData, #importDataBtn, #confirmImport"
    );
    if (!target) return;
    if (!root.contains(target) && !target.closest("#tabContent")) return;

    if (target.id === "exportData") return exportData();
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
      $("#rescueMsg").textContent = `使用 1 次补签机会补签昨日？`;
      $("#rescueModal").classList.add("show");
    }
  });
}

let staticEventsBound = false;

function bindStaticEvents() {
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

  $("#fabAdd")?.addEventListener("click", openAddModal);
  $("#habitType")?.addEventListener("change", () => toggleGeneralFields(""));
  $("#editHabitType")?.addEventListener("change", () => toggleGeneralFields("edit"));
  $("#confirmAbandon")?.addEventListener("click", confirmAbandon);
  $("#cancelAbandon")?.addEventListener("click", () => $("#abandonModal")?.classList.remove("show"));
  $("#saveHabit")?.addEventListener("click", saveNewHabit);
  $("#cancelAdd")?.addEventListener("click", () => $("#addModal")?.classList.remove("show"));
  $("#saveEdit")?.addEventListener("click", saveEditHabit);
  $("#deleteEdit")?.addEventListener("click", deleteEditHabit);
  $("#cancelEdit")?.addEventListener("click", () => $("#editModal")?.classList.remove("show"));
  $("#closeCelebrate")?.addEventListener("click", () => {
    $("#celebrateModal")?.classList.remove("show");
  });
  $("#closeHatch")?.addEventListener("click", () => $("#hatchModal")?.classList.remove("show"));
  $("#closeFail")?.addEventListener("click", () => $("#failModal")?.classList.remove("show"));
  $("#rescueMulligan")?.addEventListener("click", () => {
    if (!pendingRescueHabitId) return;
    try {
      doMulligan(pendingRescueHabitId, yesterdayKey());
      pendingRescueHabitId = null;
      $("#rescueModal").classList.remove("show");
    } catch (e) {
      showErrorToast(e);
    }
  });
  $("#rescueSkip")?.addEventListener("click", () => {
    pendingRescueHabitId = null;
    $("#rescueModal").classList.remove("show");
    showToast(TOAST.rescueSkip);
  });
}

function deleteEditHabit() {
  const id = $("#editHabitId").value;
  const habit = store.getHabit(id);
  if (!habit || !confirm(`删除「${habit.name}」？`)) return;
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
  setInterval(tick, 8000);
}

async function bootstrap() {
  try {
    await store.init();
    store.seedFromConfig(CONFIRMED_CONFIG);
    store.evaluateSessions(true);
    bindTabContentEvents();
    bindStaticEvents();
    processPendingEvents();
    render();
    appReady = true;
    window.__habitAppReady = true;
    startSyncLoop();
  } catch (err) {
    showBootstrapError(err);
  } finally {
    if (appReady) hideLoadStatus();
  }
}

function initApp() {
  let started = false;
  const boot = () => {
    if (started) return;
    started = true;
    bootstrap();
  };

  Promise.race([ensureCanonicalUrl(), new Promise((resolve) => setTimeout(() => resolve(true), 2500))])
    .then((ok) => {
      if (!ok) return;
      boot();
      loadCanonicalUrl();
      purgeStaleCaches();
    })
    .catch(boot);
}

window.addEventListener("pageshow", (e) => {
  if (e.persisted && appReady) {
    hideLoadStatus();
    render();
  }
});

initApp();
