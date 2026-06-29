import { css } from "../lib/css";
import type { Derived } from "../store/useDerived";
import { Copy, LogoPin, WhatsApp } from "../components/icons";

export function Shortlist({ D }: { D: Derived }) {
  return (
    <div style={css("height: 100vh; overflow-y: auto; background: #fff;")}>
      <div style={css("height: 56px; min-height: 56px; border-bottom: 1px solid #E5E7EB; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; background: #fff;")}>
        <div onClick={D.goHome} style={css("display: flex; align-items: center; gap: 7px; cursor: pointer;")}><LogoPin size={20} sw={1.8} stroke="#0A0A0A" /><span style={css("font-size: 14px; font-weight: 500;")}>propscan</span></div>
        <button onClick={D.goResults} style={css("height: 32px; padding: 0 13px; background: #fff; color: #111827; border: 1px solid #E5E7EB; border-radius: 7px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer;")}>Browse Properties</button>
      </div>
      <div style={css("max-width: 960px; margin: 0 auto; padding: 36px 24px 60px;")}>
        <div style={css("display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 24px;")}>
          <div>
            <div style={css("font-size: 11px; color: #16A34A; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; margin-bottom: 10px;")}>Your Shortlist</div>
            <h1 style={css("font-size: 28px; font-weight: 800; letter-spacing: -0.02em; margin: 0 0 6px;")}>Shared Property Shortlist</h1>
            <div style={css("font-size: 14px; color: #9CA3AF;")}>5 properties · Shared by Ahmed · June 18, 2026</div>
          </div>
          <div style={css("display: flex; gap: 8px;")}><button style={css("height: 36px; padding: 0 14px; background: #fff; color: #111827; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer;")}>Save All</button><button style={css("height: 36px; padding: 0 14px; background: #16A34A; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer;")}>Export PDF</button></div>
        </div>
        <div style={css("display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px;")}>
          {D.shortlist.map((p) => (
            <div key={p.id} style={css("display: flex; align-items: center; gap: 14px; border: 1px solid #E5E7EB; border-radius: 12px; padding: 12px;")}>
              <div style={css("width: 110px; height: 80px; min-width: 110px; border-radius: 9px; background: #F3F4F6; background-image: repeating-linear-gradient(45deg,#E9EBEE 0,#E9EBEE 1px,transparent 1px,transparent 8px);")}></div>
              <div style={css("flex: 1; min-width: 0;")}><div style={css("font-size: 16px; font-weight: 700; margin-bottom: 3px;")}><span style={css("unicode-bidi:isolate")}>SAR </span>{p.priceLabel}</div><div style={css("font-size: 14px; font-weight: 500; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;")}>{p.title}</div><div style={css("font-size: 13px; color: #6B7280;")}>{p.specs} · {p.location}</div></div>
              <button onClick={p.open} style={css("height: 36px; padding: 0 16px; background: #fff; color: #111827; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer; white-space: nowrap;")}>View Property</button>
            </div>
          ))}
        </div>
        <div style={css("background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 16px; padding: 24px;")}>
          <div style={css("font-size: 15px; font-weight: 700; margin-bottom: 14px;")}>Share this shortlist</div>
          <div style={css("display: flex; align-items: center; gap: 8px; margin-bottom: 10px;")}>
            <div style={css("flex: 1; display: flex; align-items: center; height: 40px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 12px; background: #fff; font-size: 13px; color: #6B7280;")}><span style={css("flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;")}>propscan.sa/s/ahmed-jeddah-5x9k2</span><Copy size={15} stroke="#9CA3AF" style={css("cursor:pointer;")} /></div>
            <button style={css("height: 40px; padding: 0 16px; background: #16A34A; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer;")}>Copy Link</button>
            <button style={css("height: 40px; padding: 0 16px; background: #fff; color: #111827; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer; display: flex; align-items: center; gap: 7px;")}><WhatsApp size={15} stroke="#16A34A" />WhatsApp</button>
          </div>
          <div style={css("font-size: 12px; color: #9CA3AF;")}>Anyone with this link can view these properties.</div>
        </div>
      </div>
    </div>
  );
}
