export type CategoryTheme = {
  key: string;
  label: string;
  primary: string;
  secondary: string;
  glow: string;
  gradient: string;
  bgSubtle: string;
  borderSubtle: string;
};

const THEMES: Record<string, Omit<CategoryTheme, "key" | "label">> = {
  poker: {
    primary: "#c41e3a",
    secondary: "#c9a96e",
    glow: "rgba(196,30,58,0.10)",
    gradient: "linear-gradient(135deg, #c41e3a, #c9a96e)",
    bgSubtle: "rgba(196,30,58,0.06)",
    borderSubtle: "rgba(196,30,58,0.25)",
  },
  kitchen: {
    primary: "#e07a5f",
    secondary: "#f2cc8f",
    glow: "rgba(224,122,95,0.10)",
    gradient: "linear-gradient(135deg, #e07a5f, #f2cc8f)",
    bgSubtle: "rgba(224,122,95,0.06)",
    borderSubtle: "rgba(224,122,95,0.25)",
  },
  wine: {
    primary: "#d4a056",
    secondary: "#f5d89a",
    glow: "rgba(212,160,86,0.10)",
    gradient: "linear-gradient(135deg, #d4a056, #f5d89a)",
    bgSubtle: "rgba(212,160,86,0.06)",
    borderSubtle: "rgba(212,160,86,0.25)",
  },
  games: {
    primary: "#3b82f6",
    secondary: "#60a5fa",
    glow: "rgba(59,130,246,0.10)",
    gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)",
    bgSubtle: "rgba(59,130,246,0.06)",
    borderSubtle: "rgba(59,130,246,0.25)",
  },
  karaoke: {
    primary: "#a855f7",
    secondary: "#f472b6",
    glow: "rgba(168,85,247,0.10)",
    gradient: "linear-gradient(135deg, #a855f7, #f472b6)",
    bgSubtle: "rgba(168,85,247,0.06)",
    borderSubtle: "rgba(168,85,247,0.25)",
  },
  business: {
    primary: "#10b981",
    secondary: "#34d399",
    glow: "rgba(16,185,129,0.10)",
    gradient: "linear-gradient(135deg, #10b981, #34d399)",
    bgSubtle: "rgba(16,185,129,0.06)",
    borderSubtle: "rgba(16,185,129,0.25)",
  },
  workshop: {
    primary: "#06b6d4",
    secondary: "#22d3ee",
    glow: "rgba(6,182,212,0.10)",
    gradient: "linear-gradient(135deg, #06b6d4, #22d3ee)",
    bgSubtle: "rgba(6,182,212,0.06)",
    borderSubtle: "rgba(6,182,212,0.25)",
  },
};

const DEFAULT_THEME: CategoryTheme = {
  key: "default",
  label: "Event",
  primary: "#c9a96e",
  secondary: "#d4af37",
  glow: "rgba(201,169,110,0.10)",
  gradient: "linear-gradient(135deg, #c9a96e, #d4af37)",
  bgSubtle: "rgba(201,169,110,0.06)",
  borderSubtle: "rgba(201,169,110,0.3)",
};

export function getCategoryTheme(
  category: string | null | undefined,
): CategoryTheme {
  const cat = (category ?? "").toLowerCase();

  if (cat.includes("poker") || cat.includes("card") || cat.includes("hold"))
    return { key: "poker", label: "Poker", ...THEMES.poker };

  if (
    cat.includes("kitchen") ||
    cat.includes("cook") ||
    cat.includes("culinary") ||
    cat.includes("food") ||
    cat.includes("recipe")
  )
    return { key: "kitchen", label: "Kitchen United", ...THEMES.kitchen };

  if (cat.includes("wine") || cat.includes("tasting") || cat.includes("sommelier"))
    return { key: "wine", label: "Wine & Tasting", ...THEMES.wine };

  if (
    cat.includes("game") ||
    cat.includes("mafia") ||
    cat.includes("board")
  )
    return { key: "games", label: "Business Games", ...THEMES.games };

  if (
    cat.includes("karaoke") ||
    cat.includes("sing") ||
    cat.includes("music")
  )
    return { key: "karaoke", label: "Karaoke", ...THEMES.karaoke };

  if (
    cat.includes("pitch") ||
    cat.includes("startup") ||
    cat.includes("entrepreneur") ||
    cat.includes("network")
  )
    return { key: "business", label: "Business", ...THEMES.business };

  if (
    cat.includes("workshop") ||
    cat.includes("masterclass") ||
    cat.includes("class") ||
    cat.includes("training") ||
    cat.includes("seminar")
  )
    return { key: "workshop", label: "Workshop", ...THEMES.workshop };

  return DEFAULT_THEME;
}

/**
 * Predefined category options for admin dropdown.
 * The `group` visually groups related categories.
 */
export const CATEGORY_OPTIONS: { value: string; group: string }[] = [
  { value: "Poker Night", group: "Poker" },
  { value: "Poker Tournament", group: "Poker" },
  { value: "Poker Masterclass", group: "Poker" },
  { value: "Cooking Class", group: "Kitchen United" },
  { value: "Kitchen Event", group: "Kitchen United" },
  { value: "Wine Tasting", group: "Wine & Tasting" },
  { value: "Food & Drink", group: "Wine & Tasting" },
  { value: "Business Games", group: "Games" },
  { value: "Mafia Night", group: "Games" },
  { value: "Board Games", group: "Games" },
  { value: "Karaoke Night", group: "Karaoke" },
  { value: "Music Event", group: "Karaoke" },
  { value: "Business Pitch", group: "Business" },
  { value: "Networking Event", group: "Business" },
  { value: "Workshop", group: "Learning" },
  { value: "Masterclass", group: "Learning" },
  { value: "Special Event", group: "Other" },
  { value: "Private Event", group: "Other" },
];

/**
 * Categories showcased on the home page.
 * The icon key is resolved in the page component.
 */
export const SHOWCASE_CATEGORIES: {
  key: string;
  label: string;
  tagline: string;
  description: string;
  iconName: string;
}[] = [
  {
    key: "poker",
    label: "Poker Events",
    tagline: "Where strategy meets sophistication",
    description:
      "Premium poker nights, tournaments, and masterclasses with professional dealers.",
    iconName: "Spade",
  },
  {
    key: "kitchen",
    label: "Kitchen United",
    tagline: "Culinary experiences that connect",
    description:
      "Cooking classes, wine tastings, and gastronomic adventures for every palate.",
    iconName: "ChefHat",
  },
  {
    key: "game",
    label: "Business Games",
    tagline: "Play smart, network smarter",
    description:
      "Mafia nights, strategic board games, and competitive team-building evenings.",
    iconName: "Gamepad2",
  },
  {
    key: "karaoke",
    label: "Karaoke Nights",
    tagline: "Your stage, your moment",
    description:
      "Private karaoke with premium sound, curated playlists, and unforgettable nights.",
    iconName: "Mic",
  },
  {
    key: "pitch",
    label: "Business Pitches",
    tagline: "Ideas that ignite",
    description:
      "Pitch nights, startup showcases, and entrepreneurial networking events.",
    iconName: "Lightbulb",
  },
];
