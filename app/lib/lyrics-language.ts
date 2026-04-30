export type LyricLanguageChoice = {
  mode: "auto" | "specified";
  label: string;
};

const LANGUAGE_LABELS: Record<string, string> = {
  auto: "自动识别",
  "zh-CN": "中文（简体）",
  "zh-TW": "中文（繁体）",
  en: "English",
  ja: "日本語",
  ko: "한국어",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  it: "Italiano",
  ru: "Русский",
  ar: "العربية",
  hi: "हिन्दी",
  id: "Bahasa Indonesia",
  vi: "Tiếng Việt",
  th: "ไทย",
  tr: "Türkçe",
  nl: "Nederlands",
  pl: "Polski",
};

export function resolveLyricLanguage(input: unknown): LyricLanguageChoice {
  const raw = typeof input === "string" ? input.trim() : "";
  if (!raw || raw === "auto" || /自动|auto/i.test(raw)) {
    return { mode: "auto", label: "自动识别" };
  }

  return {
    mode: "specified",
    label: LANGUAGE_LABELS[raw] || raw,
  };
}

export function buildLyricLanguagePrompt(input: unknown): string {
  const language = resolveLyricLanguage(input);

  if (language.mode === "specified") {
    return `【歌词语言要求】
      - 目标歌词语言：${language.label}
      - 歌曲标题和歌词正文必须使用目标语言，并使用该语言自然的文字系统、标点和表达习惯。
      - 除专有名词、品牌名、地名、人名，或用户明确要求的混合语外，不要夹杂其它语言。
      - 押韵、节奏、句长和副歌对仗要按目标语言的自然语感处理，不要逐字翻译中文句式。`;
  }

  return `【歌词语言要求】
      - 自动判断目标语言：优先遵循用户在主题中明确指定的语言，例如“用英文写”“write in Spanish”“日语歌词”。
      - 若用户未指定语言，使用创作主题的主要语言；混合语言主题使用占比最高、语义最明确的语言。
      - 支持主要语言及其文字系统，包括中文简体、中文繁体、英语、日语、韩语、西班牙语、法语、德语、葡萄牙语、意大利语、俄语、阿拉伯语、印地语、印尼语、越南语、泰语、土耳其语、荷兰语、波兰语等。
      - 歌曲标题和歌词正文使用同一种目标语言；除专有名词、品牌名、地名、人名，或用户明确要求的混合语外，不要随意夹杂其它语言。
      - 押韵、节奏、句长和副歌对仗要按目标语言的自然语感处理，不要套用中文句式。`;
}
