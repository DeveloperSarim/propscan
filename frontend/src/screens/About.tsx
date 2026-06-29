import { css } from "../lib/css";
import type { Derived } from "../store/useDerived";
import { NavHeader, PostButton } from "../components/NavHeader";
import { Email, LogoPin, WhatsApp } from "../components/icons";

export function About({ D }: { D: Derived }) {
  return (
    <div style={css("height: 100vh; overflow-y: auto; background: #fff;")}>
      <NavHeader D={D} right={<PostButton D={D} />} />
      <div style={css("max-width: 960px; margin: 0 auto; padding: 0 24px 60px;")}>
        <div style={css("text-align: center; padding: 56px 0 0;")}>
          <div style={css("font-size: 11px; color: #16A34A; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; margin-bottom: 12px;")}>About PropScan</div>
          <h1 style={css("font-size: 28px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 12px; line-height: 1.1;")}>Built for Saudi Property Seekers</h1>
          <p style={css("font-size: 14px; color: #6B7280; max-width: 480px; margin: 0 auto; line-height: 1.5;")}>We believe finding your property shouldn't mean visiting 8 different websites.</p>
        </div>
        <div style={css("display: flex; justify-content: center; gap: 0; padding: 48px 0; border-bottom: 1px solid #F3F4F6;")}>
          {[["50,000+", "Properties", true], ["8", "Platforms", true], ["13", "Cities", true], ["2026", "Founded", false]].map(([n, l, b], i) => (
            <div key={i} style={css("text-align: center; padding: 0 36px;" + (b ? " border-right: 1px solid #E5E7EB;" : ""))}><div style={css("font-size: 24px; font-weight: 700;")}>{n}</div><div style={css("font-size: 13px; color: #9CA3AF; margin-top: 4px;")}>{l}</div></div>
          ))}
        </div>
        <div style={css("display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; padding: 64px 0;")}>
          <div>
            <h2 style={css("font-size: 24px; font-weight: 700; margin: 0 0 14px;")}>Our Mission</h2>
            <p style={css("font-size: 15px; color: #6B7280; line-height: 1.6; margin: 0 0 14px; text-wrap: pretty;")}>Saudi Arabia's property market is fragmented across dozens of listing sites, each with its own search, its own brokers, and its own duplicate listings. Buyers waste hours cross-referencing the same villa on five different platforms.</p>
            <p style={css("font-size: 15px; color: #6B7280; line-height: 1.6; margin: 0; text-wrap: pretty;")}>PropScan scans every major platform continuously, de-duplicates the results, and gives you one clean, fast search — with verified brokers and REGA-licensed listings.</p>
          </div>
          <div style={css("border: 1px solid #E5E7EB; border-radius: 16px; padding: 28px; background: #F9FAFB;")}>
            <div style={css("display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 18px;")}>
              {D.platformsAll.map((pl, i) => (<span key={i} style={css("font-size: 11px; color: #6B7280; background: #fff; border: 1px solid #E5E7EB; border-radius: 6px; padding: 6px 4px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;")}>{pl}</span>))}
            </div>
            <div style={css("text-align: center; font-size: 20px; color: #D1D5DB; margin-bottom: 14px;")}>↓</div>
            <div style={css("display: flex; align-items: center; justify-content: center; gap: 8px; background: #0A0A0A; border-radius: 10px; padding: 14px;")}><LogoPin size={22} sw={1.8} stroke="#fff" /><span style={css("color: #fff; font-size: 18px; font-weight: 600;")}>propscan</span></div>
          </div>
        </div>
        <div style={css("padding: 0 0 64px;")}>
          <h2 style={css("font-size: 24px; font-weight: 700; margin: 0 0 24px;")}>Our Team</h2>
          <div style={css("display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;")}>
            {D.team.map((m, i) => (
              <div key={i} style={css("border: 1px solid #E5E7EB; border-radius: 16px; padding: 24px; text-align: center;")}><div style={css("width: 64px; height: 64px; border-radius: 50%; background: #F3F4F6; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 600; color: #6B7280; margin: 0 auto 12px;")}>{m.init}</div><div style={css("font-size: 15px; font-weight: 600;")}>{m.name}</div><div style={css("font-size: 13px; color: #9CA3AF; margin-top: 2px;")}>{m.role}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div style={css("background: #F9FAFB; border-top: 1px solid #E5E7EB; padding: 48px 24px; text-align: center;")}>
        <div style={css("display: flex; gap: 10px; justify-content: center; margin-bottom: 16px;")}><button style={css("height: 42px; padding: 0 20px; background: #16A34A; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; font-family: inherit; cursor: pointer; display: flex; align-items: center; gap: 7px;")}><WhatsApp size={16} />WhatsApp</button><button style={css("height: 42px; padding: 0 20px; background: #fff; color: #111827; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 14px; font-weight: 500; font-family: inherit; cursor: pointer; display: flex; align-items: center; gap: 7px;")}><Email size={16} />Email</button></div>
        <div style={css("font-size: 13px; color: #9CA3AF;")}>📍 Jeddah, Saudi Arabia  ·  info@propscan.sa</div>
      </div>
    </div>
  );
}
