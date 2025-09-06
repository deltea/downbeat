interface Themes {
  [key: string]: {
    bg: string;
    surface: string;
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
    surface0: "#444",
    fg: "#fff",
    muted: "#888"
  },
  "nord": {
    bg: "#2e3440",
    surface: "#3b4252",
    surface0: "#434c5e",
    fg: "#eceff4",
    muted: "#d8dee9"
  },
  "tokyo-night": {
    bg: "#1a1b26",
    surface: "#24283b",
    surface0: "#303446",
    fg: "#c0caf5",
    muted: "#a9b1d6"
  },
  "everforest": {
    bg: "#2D353B",
    surface: "#3D484D",
    surface0: "#4F585E",
    fg: "#D3C7AA",
    muted: "#859289"
  },
  "catppuccin": {
    bg: "#1e1e2e",
    surface: "#313244",
    surface0: "#45475a",
    fg: "#cdd6f4",
    muted: "#a6adc8"
  },
  "gruvbox": {
    bg: "#282828",
    surface: "#32302f",
    surface0: "#3c3836",
    fg: "#ebdbb2",
    muted: "#928374"
  },
  "solarized": {
    bg: "#002b36",
    surface: "#073642",
    surface0: "#586e75",
    fg: "#839496",
    muted: "#93a1a1"
  }
}
