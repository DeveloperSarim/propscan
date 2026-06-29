import { css } from "../../lib/css";
import type { Derived } from "../../store/useDerived";

export function OnboardingModal({ D }: { D: Derived }) {
  return (
    <div style={css("position: fixed; inset: 0; background: #fff; display: flex; align-items: center; justify-content: center; z-index: 100; padding: 24px;")}>
      <div style={css("width: 560px; max-width: 100%; text-align: center;")}>
        {D.onbStep1 && (
          <>
            <div style={css("display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; max-width: 320px; margin: 0 auto 28px;")}>{D.platformsAll.map((pl, i) => (<span key={i} style={css("font-size: 11px; color: #6B7280; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 8px 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;")}>{pl}</span>))}</div>
            <div style={css("font-size: 22px; color: #D1D5DB; margin-bottom: 24px;")}>↓</div>
            <h2 style={css("font-size: 20px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 10px;")}>8 Platforms. One Portal.</h2>
            <p style={css("font-size: 13px; color: #6B7280; max-width: 380px; margin: 0 auto 24px; line-height: 1.5;")}>We automatically search every major Saudi real estate platform so you don't have to.</p>
          </>
        )}
        {D.onbStep2 && (
          <>
            <div style={css("display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 28px;")}>
              <div style={css("display: flex; flex-direction: column; align-items: center; gap: 8px;")}><div style={css("width: 52px; height: 52px; border-radius: 12px; border: 1px solid #E5E7EB; display: flex; align-items: center; justify-content: center;")}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg></div><span style={css("font-size: 12px; color: #6B7280;")}>Search</span></div>
              <span style={css("color: #D1D5DB;")}>→</span>
              <div style={css("display: flex; flex-direction: column; align-items: center; gap: 8px;")}><div style={css("width: 52px; height: 52px; border-radius: 12px; border: 1px solid #E5E7EB; display: flex; align-items: center; justify-content: center;")}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.8"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></svg></div><span style={css("font-size: 12px; color: #6B7280;")}>We Scan</span></div>
              <span style={css("color: #D1D5DB;")}>→</span>
              <div style={css("display: flex; flex-direction: column; align-items: center; gap: 8px;")}><div style={css("width: 52px; height: 52px; border-radius: 12px; border: 1px solid #E5E7EB; display: flex; align-items: center; justify-content: center;")}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="1.8"><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg></div><span style={css("font-size: 12px; color: #6B7280;")}>Results</span></div>
            </div>
            <h2 style={css("font-size: 20px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 10px;")}>How PropScan Works</h2>
            <p style={css("font-size: 13px; color: #6B7280; max-width: 400px; margin: 0 auto 24px; line-height: 1.5;")}>Search once. We scan all 8 platforms in real time, de-duplicate listings, and show you clean, verified results.</p>
          </>
        )}
        {D.onbStep3 && (
          <>
            <div style={css("display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 22px;")}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="1.7" strokeLinecap="round"><path d="M12 22s6-5.5 6-11a6 6 0 1 0-12 0c0 5.5 6 11 6 11z" /><line x1="6.5" y1="10.5" x2="17.5" y2="10.5" /></svg><span style={css("font-size: 18px; font-weight: 600; letter-spacing: -0.02em;")}>propscan</span></div>
            <h2 style={css("font-size: 20px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 20px;")}>Ready to find your property?</h2>
            <button onClick={D.closeModal} style={css("width: 100%; max-width: 300px; height: 40px; background: #16A34A; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer; margin: 0 auto 12px; display: block;")}>Start Searching</button>
            <div onClick={D.closeModal} style={css("font-size: 13px; color: #9CA3AF; cursor: pointer;")}>Skip</div>
          </>
        )}
        <div style={css(D.onbNavStyle)}>
          <div style={css("display: flex; align-items: center; justify-content: center; gap: 10px;")}>
            {D.onbStep2 && <span onClick={D.onbBack} style={css("font-size: 13px; color: #6B7280; cursor: pointer;")}>← Back</span>}
            <button onClick={D.onbNext} style={css("height: 42px; padding: 0 24px; background: #16A34A; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; font-family: inherit; cursor: pointer;")}>Next →</button>
          </div>
          <div style={css("display: flex; gap: 7px; justify-content: center; margin-top: 18px;")}><span style={css(D.onbDot1)}></span><span style={css(D.onbDot2)}></span><span style={css(D.onbDot3)}></span></div>
        </div>
      </div>
    </div>
  );
}
