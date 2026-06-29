import { css } from "../lib/css";
import type { Derived } from "../store/useDerived";
import { LogoPin } from "../components/icons";

export function Legal({ D }: { D: Derived }) {
  return (
    <div style={css("height: 100vh; overflow-y: auto; background: #fff;")}>
      <div style={css("height: 56px; min-height: 56px; border-bottom: 1px solid #E5E7EB; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; background: #fff;")}>
        <div onClick={D.goHome} style={css("display: flex; align-items: center; gap: 7px; cursor: pointer;")}><LogoPin size={20} sw={1.8} stroke="#0A0A0A" /><span style={css("font-size: 14px; font-weight: 500;")}>propscan</span></div>
        <div style={css("display: flex; gap: 18px;")}><span onClick={D.goPrivacy} style={css(D.privacyTab)}>Privacy</span><span onClick={D.goTerms} style={css(D.termsTab)}>Terms</span></div>
      </div>
      <div style={css("max-width: 1040px; margin: 0 auto; padding: 40px 24px 60px; display: flex; gap: 40px; align-items: flex-start;")}>
        <div style={css("width: 200px; min-width: 200px; position: sticky; top: 0;")}>
          {D.legalNav.map((n, i) => (<div key={i} style={css(n.style)}>{n.label}</div>))}
        </div>
        <div style={css("flex: 1; min-width: 0; max-width: 800px;")}>
          <h1 style={css("font-size: 36px; font-weight: 800; letter-spacing: -0.03em; margin: 0 0 6px;")}>{D.legalTitle}</h1>
          <div style={css("font-size: 13px; color: #9CA3AF; margin-bottom: 28px;")}>Last updated: June 18, 2026</div>
          {D.legalSections.map((sec, i) => (
            <div key={i} style={css("margin-bottom: 26px;")}><h2 style={css("font-size: 20px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 10px;")}>{sec.h}</h2><p style={css("font-size: 15px; line-height: 1.7; color: #374151; margin: 0; text-wrap: pretty;")}>{sec.body}</p></div>
          ))}
        </div>
      </div>
    </div>
  );
}
