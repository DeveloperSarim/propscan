import { css } from "../lib/css";
import type { Derived } from "../store/useDerived";

export function CookieBanner({ D }: { D: Derived }) {
  return (
    <div style={css("position: fixed; bottom: 0; left: 0; right: 0; z-index: 120; min-height: 64px; background: #fff; border-top: 1px solid #E5E7EB; box-shadow: 0 -4px 16px rgba(0,0,0,.06); display: flex; align-items: center; gap: 16px; padding: 12px 24px; flex-wrap: wrap;")}>
      <span style={css("font-size: 14px; color: #374151; flex: 1; min-width: 240px;")}>🍪 We use cookies to improve your experience. <span onClick={D.goPrivacy} style={css("color: #16A34A; font-weight: 500; cursor: pointer;")}>Read our Privacy Policy</span></span>
      <div style={css("display: flex; align-items: center; gap: 8px;")}>
        <button onClick={D.acceptCookie} style={css("height: 36px; padding: 0 18px; background: #16A34A; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer;")}>Accept All</button>
        <button onClick={D.acceptCookie} style={css("height: 36px; padding: 0 16px; background: #fff; color: #111827; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer;")}>Manage</button>
        <span onClick={D.acceptCookie} style={css("width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: #9CA3AF; cursor: pointer;")}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg></span>
      </div>
    </div>
  );
}
