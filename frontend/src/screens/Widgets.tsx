import { css } from "../lib/css";
import type { Derived } from "../store/useDerived";
import { Hover } from "../components/Hover";
import { ChevronDown, Clock, WhatsApp } from "../components/icons";

export function Widgets({ D }: { D: Derived }) {
  return (
    <div>
      {/* whatsapp contact FAB */}
      <a href="https://wa.me/966500000000" target="_blank" rel="noreferrer" style={css("position: fixed; bottom: 16px; right: 16px; z-index: 61; display: flex; align-items: center; gap: 9px; background: #16A34A; color: #fff; border-radius: 999px; height: 46px; padding: 0 18px 0 14px; box-shadow: 0 6px 20px rgba(22,163,74,.35); text-decoration: none; font-family: inherit;")}>
        <WhatsApp size={22} stroke="#fff" sw={1.9} />
        <span style={css("font-size: 13px; font-weight: 600;")}>Chat with us</span>
      </a>
      {/* recently viewed widget */}
      {D.rvOpen ? (
        <div style={css("position: fixed; bottom: 16px; left: 16px; width: 220px; background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 6px 24px rgba(0,0,0,.12); z-index: 60; overflow: hidden;")}>
          <div onClick={D.toggleRv} style={css("display: flex; align-items: center; justify-content: space-between; padding: 11px 13px; border-bottom: 1px solid #F3F4F6; cursor: pointer;")}><span style={css("font-size: 12px; font-weight: 600;")}>Recently Viewed</span><ChevronDown size={13} stroke="#9CA3AF" /></div>
          {D.recentProps.map((p) => (
            <Hover key={p.id} onClick={p.open} style={css("display: flex; gap: 9px; align-items: center; padding: 8px 12px; cursor: pointer;")} styleHover={css("background: #FAFAFA;")}><div style={css("width: 32px; height: 24px; min-width: 32px; border-radius: 4px; background: #F3F4F6; background-image: repeating-linear-gradient(45deg, #E9EBEE 0, #E9EBEE 1px, transparent 1px, transparent 6px);")}></div><div style={css("flex: 1; min-width: 0;")}><div style={css("font-size: 13px; font-weight: 600;")}><span style={css("unicode-bidi:isolate")}>SAR </span>{p.priceLabel}</div><div style={css("font-size: 11px; color: #9CA3AF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;")}>{p.location}</div></div></Hover>
          ))}
        </div>
      ) : (
        <div onClick={D.toggleRv} style={css("position: fixed; bottom: 16px; left: 16px; background: #fff; border: 1px solid #E5E7EB; border-radius: 999px; box-shadow: 0 4px 16px rgba(0,0,0,.1); z-index: 60; padding: 8px 14px; font-size: 12px; color: #374151; cursor: pointer; display: flex; align-items: center; gap: 7px;")}><Clock size={14} stroke="#6B7280" />Recently Viewed (8)</div>
      )}
      {/* price drop toast */}
      {D.toast && (
        <div style={css("position: fixed; bottom: 64px; left: 16px; width: 320px; background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 6px 24px rgba(0,0,0,.12); z-index: 60; padding: 14px;")}>
          <div style={css("font-size: 13px; font-weight: 600; color: #16A34A; margin-bottom: 4px;")}>Price Drop Alert</div>
          <div style={css("font-size: 13px; color: #374151; line-height: 1.4; margin-bottom: 10px;")}>Al Shati villa dropped to SAR 1.35M (was SAR 1.45M)</div>
          <div style={css("display: flex; align-items: center; gap: 12px;")}><span style={css("font-size: 13px; color: #16A34A; font-weight: 500; cursor: pointer;")}>View Property</span><span onClick={D.dismissToast} style={css("font-size: 13px; color: #9CA3AF; cursor: pointer;")}>Dismiss</span></div>
        </div>
      )}
    </div>
  );
}
