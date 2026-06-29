import { css } from "../lib/css";
import type { Derived } from "../store/useDerived";
import { Hover } from "../components/Hover";
import { NavHeader, PostButton } from "../components/NavHeader";

export function AreaGuide({ D }: { D: Derived }) {
  return (
    <div style={css("height: 100vh; overflow-y: auto; background: #fff;")}>
      <NavHeader D={D} right={<PostButton D={D} />} />
      <div style={css("max-width: 1200px; margin: 0 auto; padding: 24px 24px 60px;")}>
        <div style={css("font-size: 12px; color: #9CA3AF; margin-bottom: 16px;")}>Home <span style={css("color:#D1D5DB;")}>›</span> Area Guides <span style={css("color:#D1D5DB;")}>›</span> Jeddah <span style={css("color:#D1D5DB;")}>›</span> <span style={css("color:#374151;")}>Al Nakheel</span></div>
        <div style={css("display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 24px;")}>
          <div>
            <h1 style={css("font-size: 32px; font-weight: 800; letter-spacing: -0.03em; margin: 0 0 8px;")}>Al Nakheel, Jeddah</h1>
            <span style={css("display: inline-flex; align-items: center; gap: 6px; background: #F0FDF4; border: 1px solid #BBF7D0; color: #15803D; border-radius: 999px; padding: 4px 11px; font-size: 12px; font-weight: 500;")}><span style={css("width: 6px; height: 6px; border-radius: 50%; background: #16A34A;")}></span>1,247 properties available</span>
          </div>
          <button onClick={D.goResults} style={css("height: 38px; padding: 0 18px; background: #16A34A; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer; white-space: nowrap;")}>Search Properties Here</button>
        </div>
        {/* stats */}
        <div style={css("display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 18px;")}>
          {D.areaStats.map((s, i) => (
            <div key={i} style={css("background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px 18px;")}><div style={css("font-size: 12px; color: #9CA3AF; margin-bottom: 8px;")}>{s.label}</div><div style={css("font-size: 22px; font-weight: 700; letter-spacing: -0.02em;")}>{s.value}</div></div>
          ))}
        </div>
        {/* price trend chart */}
        <div style={css("background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; padding: 18px; margin-bottom: 22px;")}>
          <div style={css("display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;")}><div style={css("font-size: 16px; font-weight: 700;")}>Price Trend — Last 6 Months</div><span style={css("font-size: 12px; color: #15803D; font-weight: 600; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 999px; padding: 3px 9px;")}>+3.2% this quarter</span></div>
          <div style={css("display: flex; align-items: flex-end; gap: 14px; height: 150px;")}>
            {D.trendBars.map((b, i) => (<div key={i} style={css("flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; gap: 7px;")}><div style={css(b.style)}></div><span style={css("font-size: 11px; color: #9CA3AF;")}>{b.month}</span></div>))}
          </div>
        </div>
        {/* nearby places */}
        <div style={css("display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;")}>
          {D.nearbyCols.map((c, i) => (
            <div key={i} style={css("background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; padding: 18px;")}>
              <div style={css("font-size: 14px; font-weight: 600; margin-bottom: 12px;")}>{c.title}</div>
              {c.items.map((it, j) => (<div key={j} style={css("display: flex; align-items: center; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid #F3F4F6; font-size: 13px;")}><span style={css("color: #374151;")}>{it.name}</span><span style={css("color: #9CA3AF;")}>{it.dist}</span></div>))}
            </div>
          ))}
        </div>
        <div style={css("display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 22px;")}>
          {D.nearbyMore.map((c, i) => (
            <div key={i} style={css("background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; padding: 18px;")}>
              <div style={css("font-size: 14px; font-weight: 600; margin-bottom: 12px;")}>{c.title}</div>
              {c.items.map((it, j) => (<div key={j} style={css("display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F3F4F6; font-size: 13px;")}><span style={css("color: #374151;")}>{it.name}</span><span style={css("color: #9CA3AF;")}>{it.dist}</span></div>))}
            </div>
          ))}
        </div>
        {/* map */}
        <div style={css("height: 300px; border-radius: 12px; border: 1px solid #E5E7EB; background: #EEF0F2; background-image: linear-gradient(#E4E7EB 1px, transparent 1px), linear-gradient(90deg, #E4E7EB 1px, transparent 1px); background-size: 56px 56px, 56px 56px; position: relative; margin-bottom: 10px;")}>
          <div style={css("position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); display: flex; flex-direction: column; align-items: center; gap: 4px;")}><svg width="28" height="28" viewBox="0 0 24 24" fill="#16A34A" stroke="#fff" strokeWidth="1.5"><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" /></svg><span style={css("background: #fff; border: 1px solid #E5E7EB; border-radius: 5px; padding: 2px 8px; font-size: 11px; color: #374151;")}>Al Nakheel, Jeddah</span></div>
        </div>
        <div style={css("margin-bottom: 32px;")}><span onClick={D.goMap} style={css("font-size: 13px; color: #15803D; font-weight: 500; cursor: pointer;")}>Explore Al Nakheel on Map →</span></div>
        {/* listings preview */}
        <div style={css("font-size: 24px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 16px;")}>Properties in Al Nakheel</div>
        <div style={css("display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 20px;")}>
          {D.areaListings.map((p) => (
            <Hover key={p.id} onClick={p.open} style={css("border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; cursor: pointer; background: #fff;")} styleHover={css("box-shadow: 0 6px 20px rgba(0,0,0,.08);")}>
              <div style={css("height: 150px; background:#F3F4F6; background-image: repeating-linear-gradient(45deg,#E9EBEE 0,#E9EBEE 1px,transparent 1px,transparent 8px); position: relative;")}><span style={css("position:absolute;top:8px;left:8px;background:rgba(255,255,255,.92);border:1px solid #E5E7EB;border-radius:5px;padding:2px 7px;font-size:10px;color:#374151;")}>{p.status}</span></div>
              <div style={css("padding:12px 13px;")}><div style={css("display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;")}><span style={css("font-size:15px;font-weight:700;")}><span style={css("unicode-bidi:isolate")}>SAR </span>{p.priceLabel}</span><span style={css("font-size:11px;color:#9CA3AF;")}>{p.source}</span></div><div style={css("font-size:13px;font-weight:600;color:#15803D;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;")}>{p.title}</div><div style={css("font-size:12px;color:#6B7280;margin-bottom:2px;")}>{p.specs}</div><div style={css("font-size:12px;color:#9CA3AF;")}>{p.location}</div></div>
            </Hover>
          ))}
        </div>
        <div style={css("text-align: center; margin-bottom: 36px;")}><button onClick={D.goResults} style={css("height: 40px; padding: 0 22px; background: #16A34A; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; font-family: inherit; cursor: pointer;")}>View All 1,247 Properties</button></div>
        {/* related areas */}
        <div style={css("font-size: 16px; font-weight: 700; margin-bottom: 14px;")}>Nearby Areas</div>
        <div style={css("display: flex; gap: 9px; flex-wrap: wrap;")}>{D.relatedAreas.map((a, i) => (<Hover key={i} as="span" onClick={D.goArea} style={css("font-size: 13px; color: #374151; border: 1px solid #E5E7EB; border-radius: 999px; padding: 7px 14px; cursor: pointer;")} styleHover={css("border-color:#0A0A0A;")}>{a}</Hover>))}</div>
      </div>
    </div>
  );
}
