interface Themes {
  [key: string]: {
    bg: string;
    surface: string;
    surfaceLight: string;
    surface0: string;
    fg: string;
    muted: string;
  };
}

export const availableThemes = ["classic", "nord", "everforest", "catppuccin", "gruvbox"];

export const themes: Themes = {
  "classic": {
    bg: "#000",
    surface: "#252525",
    surfaceLight: "#333",
    surface0: "#444",
    fg: "#fff",
    muted: "#888"
  },
  "nord": {
    bg: "#2e3440",
    surface: "#3b4252",
    surfaceLight: "#3f4454",
    surface0: "#434c5e",
    fg: "#eceff4",
    muted: "#d8dee9"
  },
  "everforest": {
    bg: "#2D353B",
    surface: "#3D484D",
    surfaceLight: "#464F52",
    surface0: "#4F585E",
    fg: "#D3C7AA",
    muted: "#859289"
  },
  "catppuccin": {
    bg: "#1e1e2e",
    surface: "#313244",
    surfaceLight: "#363a4f",
    surface0: "#45475a",
    fg: "#cdd6f4",
    muted: "#a6adc8"
  },
  "gruvbox": {
    bg: "#282828",
    surface: "#32302f",
    surfaceLight: "#3c3836",
    surface0: "#3c3836",
    fg: "#ebdbb2",
    muted: "#928374"
  },
}
