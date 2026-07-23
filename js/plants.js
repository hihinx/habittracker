export const PLANT_TIERS = {
  flower: { id: "flower", label: "小花", maxDays: 7 },
  bush: { id: "bush", label: "灌木", maxDays: 21 },
  tree: { id: "tree", label: "乔木", maxDays: Infinity },
};

export const PLANT_TYPES = [
  { id: "daisy", name: "雏菊", kind: "plant", tier: "flower", emoji: "🌼", stages: ["🌰", "🌱", "🌿", "🌼"] },
  { id: "clover", name: "三叶草", kind: "plant", tier: "flower", emoji: "☘️", stages: ["🌰", "🌱", "☘️", "🍀"] },
  { id: "tulip", name: "郁金香", kind: "plant", tier: "flower", emoji: "🌷", stages: ["🌰", "🌱", "🌷", "🌷"] },
  { id: "lavender", name: "薰衣草丛", kind: "plant", tier: "bush", emoji: "💜", stages: ["🌰", "🌱", "🌿", "💐"] },
  { id: "succulent", name: "多肉丛", kind: "plant", tier: "bush", emoji: "🪴", stages: ["🫘", "🌱", "🪴", "🏵️"] },
  { id: "rose", name: "玫瑰丛", kind: "plant", tier: "bush", emoji: "🌹", stages: ["🌰", "🌱", "🌿", "🌹"] },
  { id: "cherry", name: "樱花树", kind: "plant", tier: "tree", emoji: "🌸", stages: ["🌰", "🌱", "🌳", "🌸"] },
  { id: "bamboo", name: "竹", kind: "plant", tier: "tree", emoji: "🎋", stages: ["🌰", "🌱", "🎋", "🎍"] },
  { id: "sunflower", name: "向日葵", kind: "plant", tier: "tree", emoji: "🌻", stages: ["🌰", "🌱", "🌿", "🌻"] },
];

export const PET_TYPES = [
  { id: "fox", name: "小狐狸", kind: "pet", emoji: "🦊", stages: ["🥚", "🐣", "🐥", "🦊"] },
  { id: "cat", name: "小猫咪", kind: "pet", emoji: "🐱", stages: ["🥚", "🐣", "🐱", "😺"] },
  { id: "dog", name: "小狗狗", kind: "pet", emoji: "🐶", stages: ["🥚", "🐣", "🐕", "🐶"] },
  { id: "rabbit", name: "小兔子", kind: "pet", emoji: "🐰", stages: ["🥚", "🐣", "🐇", "🐰"] },
  { id: "panda", name: "小熊猫", kind: "pet", emoji: "🐼", stages: ["🥚", "🐣", "🐻", "🐼"] },
  { id: "dragon", name: "小龙", kind: "pet", emoji: "🐲", stages: ["🥚", "🐣", "🦎", "🐲"] },
  { id: "owl", name: "小猫头鹰", kind: "pet", emoji: "🦉", stages: ["🥚", "🐣", "🐥", "🦉"] },
  { id: "bear", name: "小熊", kind: "pet", emoji: "🐻", stages: ["🥚", "🐣", "🧸", "🐻"] },
];

export function plantTierForGoalDays(goalDays) {
  if (goalDays <= PLANT_TIERS.flower.maxDays) return "flower";
  if (goalDays <= PLANT_TIERS.bush.maxDays) return "bush";
  return "tree";
}

export function plantTierLabel(goalDays) {
  const tier = plantTierForGoalDays(goalDays);
  return PLANT_TIERS[tier].label;
}

export function plantsInTier(tier) {
  return PLANT_TYPES.filter((p) => p.tier === tier);
}

export function randomPet() {
  return PET_TYPES[Math.floor(Math.random() * PET_TYPES.length)];
}

export function plantForGoalDays(goalDays) {
  const tier = plantTierForGoalDays(goalDays);
  const pool = plantsInTier(tier);
  return pool[Math.floor(Math.random() * pool.length)] || PLANT_TYPES[0];
}

/** @deprecated daily/general 已拆分，保留兼容旧代码 */
export function randomCompanion() {
  return randomPet();
}

/** @deprecated use randomPet / plantForGoalDays */
export function randomPlant() {
  return plantForGoalDays(30);
}

export function stageIndex(day) {
  if (day <= 0) return 0;
  if (day <= 7) return 1;
  if (day <= 14) return 2;
  return 3;
}

export function generalStageIndex(count, goal) {
  if (count <= 0) return 0;
  const ratio = Math.min(1, count / goal);
  if (ratio >= 1) return 3;
  if (ratio > 0.75) return 3;
  if (ratio > 0.25) return 2;
  return 1;
}

export const FLEX_GROWTH_STAGES = ["🌰", "🌱", "🌿", "🌸"];

export function flexGrowthEmoji(count, goal) {
  return FLEX_GROWTH_STAGES[generalStageIndex(count, goal)];
}

export function flexGrowthStageLabels() {
  return ["种子", "发芽", "生长", "绽放"];
}

export function companionStageEmoji(companion, day, count, goal) {
  if (!companion?.stages?.length) return "🌱";
  if (count != null && goal != null) {
    return companion.stages[generalStageIndex(count, goal)];
  }
  return companion.stages[stageIndex(day)];
}

/** @deprecated use companionStageEmoji */
export function plantStageEmoji(companion, day) {
  return companionStageEmoji(companion, day);
}

export function stageLabel(day, kind = "pet") {
  if (kind === "pet") {
    if (day <= 0) return "待孵化";
    if (day <= 7) return "幼体期";
    if (day <= 14) return "少年期";
    if (day < 21) return "进化前夕";
    return "完全进化";
  }
  if (day <= 0) return "待播种";
  if (day <= 7) return "发芽期";
  if (day <= 14) return "成长期";
  if (day < 21) return "含苞期";
  return "完全绽放";
}

export function flexStageLabel(count, goal) {
  if (count <= 0) return "待播种";
  if (count >= goal) return "完全绽放";
  const ratio = count / goal;
  if (ratio <= 0.25) return "发芽期";
  if (ratio <= 0.5) return "成长期";
  if (ratio <= 0.75) return "含苞期";
  return "绽放前夕";
}

export function completionText(companion) {
  const kind = companion?.kind || "pet";
  return kind === "pet" ? "完全进化了" : "完全绽放了";
}

export function companionKindLabel(companion) {
  const kind = companion?.kind || "pet";
  return kind === "pet" ? "伙伴" : "植物";
}

export function hatchVerb(companion) {
  return (companion?.kind || "pet") === "pet" ? "孵化" : "播种";
}

/** 每日伴 · 选入聚焦 */
export function focusWelcomeTitle() {
  return "你获得了一枚宠物蛋！";
}

export function focusWelcomeMsg(companion) {
  const name = companion?.name || "新伙伴";
  return `连续喂养 21 天，帮${name}的蛋孵化成伙伴吧～`;
}

/** 随心芽 · 选入聚焦 */
export function flexWelcomeTitle() {
  return "你获得了一颗种子！";
}

export function flexWelcomeMsg(goalDays, goalCheckins) {
  return `${goalDays} 天内完成 ${goalCheckins} 次打卡，帮种子慢慢发芽吧～`;
}

export function careVerb(companion) {
  return (companion?.kind || "pet") === "pet" ? "喂养" : "完成";
}

export function evolutionStageLabels(kind = "pet") {
  return kind === "pet"
    ? ["胚胎", "幼体期", "少年期", "完全进化"]
    : ["种子", "发芽期", "成长期", "完全绽放"];
}

export function cloneCompanion(companion) {
  if (!companion) return null;
  return { ...companion, stages: [...(companion.stages || [])] };
}

export const CHEER_MESSAGES = [
  "太棒了！你又让这个小生命茁壮了一分！",
  "今天的你，值得为自己骄傲",
  "坚持的人，运气都不会太差！",
  "又完成一天！你的未来会感谢现在的你。",
  "小小的打卡，大大的成长",
  "你比昨天更优秀了！",
  "21 天的奇迹，正在一天天生根。",
  "这份坚持，终会开出最美的花。",
  "打卡成功！今天的阳光为你而亮",
  "了不起！习惯正在变成本能。",
];

export const FLEX_CHEER_MESSAGES = [
  "浇水成功！种子又悄悄长大了一点～",
  "每一次完成，都是在为发芽蓄力",
  "节奏很好，继续保持",
  "你的小种子感受到了你的用心",
  "进步看得见，离绽放更近了",
];

export function randomCheer(isFlex = false) {
  const pool = isFlex ? FLEX_CHEER_MESSAGES : CHEER_MESSAGES;
  return pool[Math.floor(Math.random() * pool.length)];
}
