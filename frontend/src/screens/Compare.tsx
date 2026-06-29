import { css } from "../lib/css";
import type { Derived } from "../store/useDerived";
import { NavHeader } from "../components/NavHeader";

export function Compare({ D }: { D: Derived }) {
  return (
    <div style={css("height: 100vh; overflow-y: auto; background: #fff;")}>
      <NavHeader D={D} />
      <div style={css("max-width: 1100px; margin: 0 auto; padding: 28px 24px 60px;")}>
        <div style={css("display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;")}><h1 style={css("font-size: 24px; font-weight: 700; margin: 0;")}>Compare Properties</h1><button style={css("height: 34px; padding: 0 14px; background: #fff; color: #111827; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer; display: flex; align-items: center; gap: 6px;")}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 15V3" /><path d="M7 10l5 5 5-5" /><path d="M5 21h14" /></svg>Export Comparison PDF</button></div>
        <div style={css("border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden;")}>
          {/* header row */}
          <div style={css(D.compareGrid)}>
            <div style={css("padding: 16px 14px; background: #FAFAFA; border-bottom: 1px solid #E5E7EB;")}></div>
            {D.compareCols.map((c) => (
              <div key={c.id} style={css("padding: 14px; border-left: 1px solid #F3F4F6; border-bottom: 1px solid #E5E7EB; background: #FAFAFA; position: relative;")}>
                <span onClick={c.removeCol} style={css("position: absolute; top: 10px; right: 10px; width: 20px; height: 20px; border-radius: 50%; background: #fff; border: 1px solid #E5E7EB; display: flex; align-items: center; justify-content: center; cursor: pointer;")}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg></span>
                <div style={css("height: 90px; border-radius: 8px; background: #F3F4F6; background-image: repeating-linear-gradient(45deg, #E9EBEE 0, #E9EBEE 1px, transparent 1px, transparent 8px); margin-bottom: 10px;")}></div>
                <div style={css("font-size: 16px; font-weight: 700;")}><span style={css("unicode-bidi:isolate")}>SAR </span>{c.priceLabel}</div>
                <div style={css("font-size: 12px; color: #9CA3AF; margin-top: 2px;")}>{c.location}</div>
              </div>
            ))}
          </div>
          {D.compareRows.map((r, i) => (
            <div key={i} style={css(r.style)}>
              <div style={css("padding: 13px 14px; font-size: 12px; color: #6B7280; font-weight: 500;")}>{r.label}</div>
              {r.cells.map((c, j) => (<div key={j} style={css(c.style)}>{c.text}</div>))}
            </div>
          ))}
        </div>
        <div style={css("display: flex; gap: 10px; margin-top: 18px;")}><button style={css("height: 40px; padding: 0 18px; background: #16A34A; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer;")}>Export as PDF</button><button style={css("height: 40px; padding: 0 18px; background: #fff; color: #111827; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer;")}>+ Add Another Property</button></div>
      </div>
    </div>
  );
}
