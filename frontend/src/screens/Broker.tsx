import { css } from "../lib/css";
import type { Derived } from "../store/useDerived";
import { ChevronLeft, Email, LogoPin, Phone, WhatsApp } from "../components/icons";

export function Broker({ D }: { D: Derived }) {
  const b = D.brokerView;
  return (
    <div style={css("height: 100vh; display: flex; flex-direction: column; overflow: hidden;")}>
      <div style={css("height: 48px; min-height: 48px; border-bottom: 1px solid #E5E7EB; display: flex; align-items: center; padding: 0 16px; gap: 12px; background: #fff;")}>
        <div onClick={D.goBack} style={css("display: flex; align-items: center; gap: 5px; font-size: 13px; color: #374151; cursor: pointer;")}><ChevronLeft size={15} />Back</div>
        <div style={css("flex: 1;")}></div>
        <div onClick={D.goHome} style={css("display: flex; align-items: center; gap: 6px; cursor: pointer;")}><LogoPin size={18} sw={1.8} stroke="#0A0A0A" /><span style={css("font-size: 13px; font-weight: 500;")}>propscan</span></div>
      </div>
      <div style={css("flex: 1; overflow-y: auto;")}>
        <div style={css("max-width: 1000px; margin: 0 auto; padding: 28px 24px 60px;")}>
          {/* broker header */}
          <div style={css("display: flex; gap: 18px; align-items: flex-start; padding-bottom: 24px; border-bottom: 1px solid #F3F4F6; margin-bottom: 24px;")}>
            <div style={css("width: 72px; height: 72px; min-width: 72px; border-radius: 14px; background: #F3F4F6; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; color: #6B7280;")}>{b.initials}</div>
            <div style={css("flex: 1; min-width: 0;")}>
              <div style={css("display: flex; align-items: center; gap: 9px; margin-bottom: 3px;")}>
                <span style={css("font-size: 22px; font-weight: 700; letter-spacing: -0.02em;")}>{b.name}</span>
                <span style={css("display: inline-flex; align-items: center; gap: 3px; font-size: 12px; color: #15803D; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 5px; padding: 2px 7px; font-weight: 500;")}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l4 4L19 7" /></svg>REGA Verified</span>
              </div>
              <div style={css("font-size: 14px; color: #6B7280; margin-bottom: 12px;")}>{b.agency} · {b.city}</div>
              <div style={css("display: flex; gap: 24px;")}>
                {[[String(b.count), "Active listings"], ["4.8", "Rating · 126 reviews"], ["8 yrs", "On PropScan"], ["< 1 hr", "Avg. response"]].map(([n, l], i) => (
                  <div key={i}><div style={css("font-size: 18px; font-weight: 700;")}>{n}</div><div style={css("font-size: 12px; color: #9CA3AF;")}>{l}</div></div>
                ))}
              </div>
            </div>
            <div style={css("display: flex; flex-direction: column; gap: 8px; width: 180px;")}>
              <button style={css("height: 38px; background: #16A34A; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px;")}><Phone size={14} />{b.phone}</button>
              <div style={css("display: flex; gap: 8px;")}>
                <button style={css("flex: 1; height: 38px; background: #fff; color: #111827; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center;")}><WhatsApp size={15} /></button>
                <button style={css("flex: 1; height: 38px; background: #fff; color: #111827; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center;")}><Email size={15} /></button>
              </div>
            </div>
          </div>
          {/* listings */}
          <div style={css("display: flex; align-items: baseline; gap: 10px; margin-bottom: 16px;")}><h2 style={css("font-size: 17px; font-weight: 700; margin: 0;")}>Listings</h2><span style={css("font-size: 13px; color: #9CA3AF;")}>{b.count} properties</span></div>
          <div style={css("display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px;")}>
            {b.listings.map((p) => (
              <div key={p.id} onClick={p.open} style={css("border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; cursor: pointer; background: #fff;")}>
                <div style={css("height: 130px; background: #F3F4F6; background-image: repeating-linear-gradient(45deg, #E9EBEE 0, #E9EBEE 1px, transparent 1px, transparent 8px); position: relative;")}><span style={css("position: absolute; top: 8px; left: 8px; background: rgba(255,255,255,.92); border: 1px solid #E5E7EB; border-radius: 5px; padding: 2px 7px; font-size: 11px; color: #374151;")}>{p.status}</span></div>
                <div style={css("padding: 14px;")}><div style={css("display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;")}><span style={css("font-size: 16px; font-weight: 700;")}><span style={css("unicode-bidi:isolate")}>SAR </span>{p.priceLabel}</span><span style={css("font-size: 11px; color: #9CA3AF;")}>{p.source}</span></div><div style={css("font-size: 13px; font-weight: 500; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;")}>{p.title}</div><div style={css("font-size: 13px; color: #6B7280; margin-bottom: 2px;")}>{p.specs}</div><div style={css("font-size: 13px; color: #9CA3AF;")}>{p.location}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
