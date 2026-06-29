import { css } from "../lib/css";
import type { Derived } from "../store/useDerived";
import { NavHeader, PostButton } from "../components/NavHeader";
import { Download } from "../components/icons";

export function Market({ D }: { D: Derived }) {
  return (
    <div style={css("height: 100vh; overflow-y: auto; background: #fff;")}>
      <NavHeader D={D} right={<PostButton D={D} />} />
      <div style={css("max-width: 1200px; margin: 0 auto; padding: 36px 24px 60px;")}>
        <div style={css("font-size: 11px; color: #16A34A; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; margin-bottom: 12px;")}>Market Reports</div>
        <h1 style={css("font-size: 32px; font-weight: 800; letter-spacing: -0.03em; margin: 0 0 8px;")}>Saudi Real Estate Market Insights</h1>
        <p style={css("font-size: 15px; color: #6B7280; margin: 0 0 28px; max-width: 560px;")}>Monthly reports on property prices, trends and activity across Saudi Arabia.</p>
        {/* featured report */}
        <div style={css("display: flex; gap: 24px; border: 1px solid #E5E7EB; border-radius: 16px; padding: 24px; margin-bottom: 32px;")}>
          <div style={css("width: 220px; min-width: 220px; height: 150px; border-radius: 12px; background: #0A0A0A; background-image: repeating-linear-gradient(45deg,#1c1c1c 0,#1c1c1c 1px,transparent 1px,transparent 11px); position: relative;")}><span style={css("position: absolute; top: 10px; left: 10px; background: rgba(255,255,255,.92); border-radius: 5px; padding: 2px 8px; font-size: 10px; font-weight: 700; color: #0A0A0A;")}>JUNE 2026</span></div>
          <div style={css("flex: 1; min-width: 0;")}>
            <span style={css("display: inline-block; font-size: 11px; font-weight: 600; color: #15803D; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 999px; padding: 3px 9px; margin-bottom: 10px;")}>Latest Report</span>
            <h2 style={css("font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 8px;")}>Jeddah Real Estate Report — June 2026</h2>
            <p style={css("font-size: 14px; color: #6B7280; line-height: 1.55; margin: 0 0 10px;")}>Average prices rose 4.2% this quarter. Al Nakheel remains the most active district, with off-plan demand climbing in north Jeddah.</p>
            <div style={css("font-size: 13px; color: #9CA3AF; margin-bottom: 16px;")}>47,293 listings · 13 cities · 8 platforms</div>
            <div style={css("display: flex; gap: 10px;")}><button style={css("height: 38px; padding: 0 18px; background: #16A34A; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer; display: flex; align-items: center; gap: 7px;")}><Download size={14} sw={1.9} />Download PDF</button><button style={css("height: 38px; padding: 0 18px; background: #fff; color: #111827; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer;")}>View Online</button></div>
          </div>
        </div>
        {/* filters */}
        <div style={css("display: flex; align-items: center; gap: 8px; margin-bottom: 16px;")}>
          <select style={css("height: 34px; border: 1px solid #E5E7EB; border-radius: 7px; padding: 0 10px; font-size: 13px; font-family: inherit; background: #fff;")} defaultValue="All Cities"><option>All Cities</option><option>Jeddah</option><option>Riyadh</option><option>Dammam</option></select>
          <select style={css("height: 34px; border: 1px solid #E5E7EB; border-radius: 7px; padding: 0 10px; font-size: 13px; font-family: inherit; background: #fff;")} defaultValue="All Months"><option>All Months</option><option>June 2026</option><option>May 2026</option></select>
        </div>
        {/* reports grid */}
        <div style={css("display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 32px;")}>
          {D.reports.map((r, i) => (
            <div key={i} style={css("border: 1px solid #E5E7EB; border-radius: 16px; overflow: hidden;")}>
              <div style={css("aspect-ratio: 4/3; background: #0A0A0A; background-image: repeating-linear-gradient(45deg,#1c1c1c 0,#1c1c1c 1px,transparent 1px,transparent 10px); position: relative;")}><span style={css("position: absolute; top: 9px; left: 9px; background: rgba(255,255,255,.92); border-radius: 5px; padding: 2px 7px; font-size: 10px; font-weight: 700; color: #0A0A0A;")}>{r.month}</span></div>
              <div style={css("padding: 14px;")}><div style={css("font-size: 15px; font-weight: 700; margin-bottom: 4px;")}>{r.title}</div><div style={css("font-size: 13px; color: #9CA3AF; margin-bottom: 12px;")}>{r.sub}</div><button style={css("height: 32px; padding: 0 14px; background: #fff; color: #111827; border: 1px solid #E5E7EB; border-radius: 7px; font-size: 12px; font-weight: 500; font-family: inherit; cursor: pointer;")}>Download PDF</button></div>
            </div>
          ))}
        </div>
        {/* cities covered */}
        <div style={css("font-size: 14px; font-weight: 600; margin-bottom: 12px;")}>Cities covered</div>
        <div style={css("display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 36px;")}>{D.reportCities.map((c, i) => (<span key={i} style={css("font-size: 13px; color: #374151; border: 1px solid #E5E7EB; border-radius: 999px; padding: 6px 13px;")}>{c}</span>))}</div>
        {/* subscribe */}
        <div style={css("background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 16px; padding: 32px; text-align: center;")}>
          <div style={css("font-size: 18px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 14px;")}>Get reports in your inbox</div>
          <div style={css("display: flex; gap: 8px; max-width: 420px; margin: 0 auto 10px;")}><input placeholder="you@email.com" style={css("flex: 1; height: 40px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: inherit;")} /><button style={css("height: 40px; padding: 0 20px; background: #16A34A; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; font-family: inherit; cursor: pointer;")}>Subscribe</button></div>
          <div style={css("font-size: 12px; color: #9CA3AF;")}>Monthly · Free · Unsubscribe anytime</div>
        </div>
      </div>
    </div>
  );
}
