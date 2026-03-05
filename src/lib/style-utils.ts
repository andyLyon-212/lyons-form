import type { FormStyles } from "./builder-types";

export function getBackgroundStyle(
  bg: FormStyles["background"]
): React.CSSProperties {
  switch (bg.type) {
    case "solid":
      return { backgroundColor: bg.color };
    case "gradient":
      return {
        background: `linear-gradient(${bg.gradientDirection}, ${bg.gradientFrom}, ${bg.gradientTo})`,
      };
    case "image":
      return bg.imageUrl
        ? {
            backgroundImage: `url(${bg.imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }
        : { backgroundColor: bg.color };
    default:
      return {};
  }
}

const SHADOW_MAP: Record<FormStyles["container"]["shadow"], string> = {
  none: "none",
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
};

export function getContainerStyle(styles: FormStyles): React.CSSProperties {
  if (styles.liquidGlass) {
    return {
      borderRadius: styles.container.borderRadius,
      padding: styles.container.padding,
      background: "rgba(255, 255, 255, 0.12)",
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
      border: "1px solid rgba(255, 255, 255, 0.25)",
      boxShadow:
        "0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
    };
  }
  return {
    borderRadius: styles.container.borderRadius,
    boxShadow: SHADOW_MAP[styles.container.shadow],
    padding: styles.container.padding,
    backgroundColor: "white",
  };
}

export function getGlassInputStyle(): React.CSSProperties {
  return {
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    color: "inherit",
  };
}

export function getGlassButtonStyle(primaryColor: string): React.CSSProperties {
  return {
    backdropFilter: "blur(12px) saturate(150%)",
    WebkitBackdropFilter: "blur(12px) saturate(150%)",
    boxShadow:
      "inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 4px 16px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    backgroundColor: `${primaryColor}b3`,
  };
}

export function getFontSizeClass(size: FormStyles["fontSize"]): string {
  switch (size) {
    case "small":
      return "text-sm";
    case "large":
      return "text-lg";
    default:
      return "text-base";
  }
}

export function getGoogleFontsUrl(fontFamily: string): string {
  const encoded = fontFamily.replace(/ /g, "+");
  return `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;500;600;700&display=swap`;
}
