import type { CSSProperties } from "react";

/**
 * Parse a CSS declaration string (the exact inline-style text used in the
 * original PropScan design) into a React style object. This lets the screen
 * components reuse the prototype's style strings verbatim — both the static
 * `style="..."` markup and the dynamic style strings produced by the derived
 * layer — guaranteeing pixel-faithful output.
 *
 * Example: css("display:flex; -webkit-appearance:none") ->
 *   { display: "flex", WebkitAppearance: "none" }
 */
export function css(...parts: Array<string | undefined | false | null>): CSSProperties {
  const style: Record<string, string> = {};
  for (const part of parts) {
    if (!part) continue;
    for (const decl of part.split(";")) {
      const idx = decl.indexOf(":");
      if (idx === -1) continue;
      const prop = decl.slice(0, idx).trim();
      const value = decl.slice(idx + 1).trim();
      if (!prop || !value) continue;
      // -webkit-appearance -> WebkitAppearance, font-size -> fontSize
      const key = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      style[key] = value;
    }
  }
  return style as CSSProperties;
}
