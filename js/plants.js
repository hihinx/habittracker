export const PLANT_TYPES = [
  { id: "sunflower", name: "向日葵", kind: "plant", emoji: "🌻", stages: ["🌰", "🌱", "🌿", "🌻"] },
  { id: "succulent", name: "多肉", kind: "plant", emoji: "🪴", stages: ["🫘", "🌱", "🪴", "🏵️"] },
  { id: "cherry", name: "樱花", kind: "plant", emoji: "🌸", stages: ["🌰", "🌱", "🌳", "🌸"] },
  { id: "lavender", name: "薰衣草", kind: "plant", emoji: "💜", stages: ["🌰", "🌱", "🌿", "💐"] },
  { id: "cactus", name: "仙人掌", kind: "plant", emoji: "🌵", stages: ["🌰", "🌱", "🌵", "🌺"] },
  { id: "bamboo", name: "竹子", kind: "plant", emoji: "🎋", stages: ["🌰", "🌱", "🎋", "🎍"] },
  { id: "lotus", name: "莲花", kind: "plant", emoji: "🪷", stages: ["🫛", "🌱", "🍃", "🪷"] },
  { id: "rose", name: "玫瑰", kind: "plant", emoji: "🌹", stages: ["🌰", "🌱", "🌿", "🌹"] },
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

export function randomCompanion() {
  const all = [...PLANT_TYPES, ...PET_TYPES];
  return all[Math.floor(Math.random() * all.length)];
}

/** @deprecated use randomCompanion */
export function randomPlant() {
  return randomCompanion();
}

export function stageIndex(day) {
  if (day <= 0) return 0;
  if (day <= 7) return 1;
  if (day <= 14) return 2;
  return 3;
}

export function companionStageEmoji(companion, day) {
  if (!companion?.stages?.length) return "🌱";
  return companion.stages[stageIndex(day)];
}

/** @deprecated use companionStageEmoji */
export function plantStageEmoji(companion, day) {
  return companionStageEmoji(companion, day);
}

export function stageLabel(day, kind = "plant") {
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

export function completionText(companion) {
  const kind = companion.kind || "plant";
  return kind === "pet" ? "完全进化了" : "完全绽放了";
}

export function companionKindLabel(companion) {
  const kind = companion.kind || "plant";
  return kind === "pet" ? "宠物" : "植物";
}

export function hatchVerb(companion) {
  return (companion?.kind || "plant") === "pet" ? "孵化" : "播种";
}

export function careVerb(companion) {
  return (companion?.kind || "plant") === "pet" ? "喂养" : "浇水";
}

export function evolutionStageLabels(kind = "plant") {
  return kind === "pet"
    ? ["待孵化", "幼体期", "少年期", "完全进化"]
    : ["待播种", "发芽期", "成长期", "完全绽放"];
}

export function cloneCompanion(companion) {
  if (!companion) return null;
  return { ...companion, stages: [...(companion.stages || [])] };
}

export const CHEER_MESSAGES = [
  "太棒了！你又让这个小生命茁壮了一分！",
  "今天的你，值得为自己骄傲 ✨",
  "坚持的人，运气都不会太差！",
  "又完成一天！你的未来会感谢现在的你。",
  "小小的打卡，大大的成长 🌱",
  "你比昨天更优秀了！",
  "21 天的奇迹，正在一天天生根。",
  "这份坚持，终会开出最美的花。",
  "打卡成功！今天的阳光为你而亮 ☀️",
  "了不起！习惯正在变成本能。",
];

export function randomCheer() {
  return CHEER_MESSAGES[Math.floor(Math.random() * CHEER_MESSAGES.length)];
}
