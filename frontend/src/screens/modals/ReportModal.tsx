import { css } from "../../lib/css";
import type { Derived } from "../../store/useDerived";

export function ReportModal({ D }: { D: Derived }) {
  return (
    <div style={css("position: fixed; inset: 0; background: rgba(10,10,10,.4); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px;")}>
      <div style={css("width: 480px; max-width: 100%; background: #fff; border-radius: 24px; padding: 32px;")}>
        {D.reportDone && (
          <div style={css("text-align: center; padding: 12px 0;")}>
            <div style={css("width: 48px; height: 48px; border-radius: 50%; background: #F0FDF4; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px;")}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5"><path d="M5 12l4 4L19 7" /></svg></div>
            <div style={css("font-size: 18px; font-weight: 700; margin-bottom: 6px;")}>Report Submitted</div>
            <p style={css("font-size: 14px; color: #6B7280; margin: 0 0 20px;")}>Our team reviews within 24 hours.</p>
            <button onClick={D.closeModal} style={css("height: 40px; padding: 0 24px; background: #0A0A0A; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; font-family: inherit; cursor: pointer;")}>Close</button>
          </div>
        )}
        <div style={css(D.reportFormStyle)}>
          <div style={css("font-size: 11px; color: #16A34A; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; margin-bottom: 12px;")}>Report Listing</div>
          <div style={css("height: 80px; border-radius: 8px; background: #F3F4F6; background-image: repeating-linear-gradient(45deg, #E9EBEE 0, #E9EBEE 1px, transparent 1px, transparent 8px); margin-bottom: 10px;")}></div>
          <div style={css("font-size: 14px; font-weight: 600;")}>{D.detail.title}</div>
          <div style={css("font-size: 12px; color: #9CA3AF; margin-bottom: 18px;")}>{D.detail.ref}</div>
          <div style={css("font-size: 14px; font-weight: 600; margin-bottom: 10px;")}>Why are you reporting?</div>
          <div style={css("display: flex; flex-direction: column; gap: 7px; margin-bottom: 16px;")}>
            {D.reasons.map((r, i) => (
              <div key={i} onClick={r.onClick} style={css(r.style)}><span style={css(r.dotStyle)}>{r.active && <span style={css("width: 7px; height: 7px; border-radius: 50%; background: #16A34A;")}></span>}</span>{r.label}</div>
            ))}
          </div>
          <textarea placeholder="Additional details (optional)" style={css("width: 100%; height: 60px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 9px 12px; font-size: 13px; font-family: inherit; resize: none; margin-bottom: 10px;")}></textarea>
          <input placeholder="Your email (optional)" style={css("width: 100%; height: 40px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: inherit; margin-bottom: 18px;")} />
          <div style={css("display: flex; align-items: center; gap: 12px;")}><button onClick={D.submitReport} style={css("flex: 1; height: 44px; background: #16A34A; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; font-family: inherit; cursor: pointer;")}>Submit Report</button><span onClick={D.closeModal} style={css("font-size: 13px; color: #9CA3AF; cursor: pointer;")}>Cancel</span></div>
        </div>
      </div>
    </div>
  );
}
