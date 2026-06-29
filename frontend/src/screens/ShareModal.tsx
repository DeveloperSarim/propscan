import { css } from "../lib/css";
import type { Derived } from "../store/useDerived";
import { Hover } from "../components/Hover";
import { WhatsApp } from "../components/icons";

export function ShareModal({ D }: { D: Derived }) {
  return (
    <div style={css("position: fixed; inset: 0; z-index: 90;")} onClick={D.closeShare}>
      <div style={css("position: absolute; top: 56px; right: 24px; width: 220px; background: #fff; border: 1px solid #E5E7EB; border-radius: 10px; box-shadow: 0 8px 28px rgba(0,0,0,.14); overflow: hidden;")}>
        <Hover style={css("display: flex; align-items: center; gap: 9px; height: 38px; padding: 0 13px; font-size: 14px; color: #374151; cursor: pointer;")} styleHover={css("background: #FAFAFA;")}><WhatsApp size={15} stroke="#16A34A" />Share on WhatsApp</Hover>
        <Hover style={css("display: flex; align-items: center; gap: 9px; height: 38px; padding: 0 13px; font-size: 14px; color: #374151; cursor: pointer; border-top: 1px solid #F3F4F6;")} styleHover={css("background: #FAFAFA;")}><span style={css("width: 15px; text-align: center; font-weight: 600;")}>𝕏</span>Share on X</Hover>
        <Hover style={css("display: flex; align-items: center; gap: 9px; height: 38px; padding: 0 13px; font-size: 14px; color: #374151; cursor: pointer; border-top: 1px solid #F3F4F6;")} styleHover={css("background: #FAFAFA;")}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></svg>Copy Link</Hover>
      </div>
    </div>
  );
}
