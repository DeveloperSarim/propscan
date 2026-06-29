import { css } from "../lib/css";
import type { Derived } from "../store/useDerived";
import { Hover } from "../components/Hover";
import { LogoPin } from "../components/icons";

export function Dashboard({ D }: { D: Derived }) {
  return (
    <div style={css("height: 100vh; display: flex; overflow: hidden;")}>
      <div style={css("width: 240px; min-width: 240px; border-right: 1px solid #E5E7EB; display: flex; flex-direction: column; background: #fff;")}>
        <div onClick={D.goHome} style={css("display: flex; align-items: center; gap: 7px; padding: 18px 16px; cursor: pointer;")}><LogoPin size={20} sw={1.8} stroke="#0A0A0A" /><span style={css("font-size: 14px; font-weight: 500;")}>propscan</span></div>
        <div style={css("border-top: 1px solid #E5E7EB; padding: 12px 10px; flex: 1; display: flex; flex-direction: column; gap: 2px;")}>
          {D.dashNav.map((n, i) => (
            <div key={i} onClick={n.onClick} style={css(n.style)}><span style={css("width: 6px; height: 6px; border-radius: 50%; background: #D1D5DB;")}></span><span style={css("flex: 1;")}>{n.label}</span>{n.hasCount && <span style={css("font-size: 11px; background: #F3F4F6; color: #6B7280; border-radius: 999px; padding: 1px 7px; font-weight: 500;")}>{n.count}</span>}</div>
          ))}
        </div>
        <div style={css("border-top: 1px solid #E5E7EB; padding: 14px 16px; display: flex; align-items: center; gap: 10px;")}><div style={css("width: 32px; height: 32px; border-radius: 50%; background: #F3F4F6; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: #6B7280;")}>FR</div><div style={css("flex: 1;")}><div style={css("font-size: 13px; font-weight: 500;")}>Faisal R.</div><div onClick={D.goHome} style={css("font-size: 11px; color: #9CA3AF; cursor: pointer;")}>Sign out</div></div></div>
      </div>
      <div style={css("flex: 1; overflow-y: auto; padding: 24px 28px;")}>
        {D.dashSaved && (
          <>
            <div style={css("display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 22px;")}>
              {D.dashSummary.map((c, i) => (
                <Hover key={i} onClick={c.onClick} style={css("background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px 18px; cursor: pointer;")} styleHover={css("border-color:#0A0A0A;")}><div style={css("font-size: 12px; color: #9CA3AF; margin-bottom: 8px;")}>{c.label}</div><div style={css("font-size: 24px; font-weight: 700; letter-spacing: -0.02em;")}>{c.value}</div></Hover>
              ))}
            </div>
            <div style={css("background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; padding: 18px; margin-bottom: 26px;")}>
              <div style={css("font-size: 14px; font-weight: 600; margin-bottom: 12px;")}>Recent activity</div>
              {D.activityFeed.map((a, i) => (<div key={i} style={css("display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid #F3F4F6;")}><span style={css("width: 7px; height: 7px; border-radius: 50%; background: #16A34A; min-width: 7px;")}></span><span style={css("flex: 1; font-size: 13px; color: #374151;")}>{a.text}</span><span style={css("font-size: 12px; color: #9CA3AF; white-space: nowrap;")}>{a.time}</span></div>))}
            </div>
            <div style={css("display: flex; align-items: baseline; gap: 10px; margin-bottom: 18px;")}><h1 style={css("font-size: 24px; font-weight: 700; margin: 0;")}>Saved Properties</h1><span style={css("font-size: 14px; color: #9CA3AF;")}>{D.savedCount} properties</span></div>
            {D.hasSaved && (
              <div style={css("display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px;")}>
                {D.savedProps.map((p) => (
                  <div key={p.id} onClick={p.open} style={css("border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; cursor: pointer; background: #fff;")}>
                    <div style={css("height: 130px; background: #F3F4F6; background-image: repeating-linear-gradient(45deg, #E9EBEE 0, #E9EBEE 1px, transparent 1px, transparent 8px); position: relative;")}><span style={css("position: absolute; top: 8px; left: 8px; background: rgba(255,255,255,.92); border: 1px solid #E5E7EB; border-radius: 5px; padding: 2px 7px; font-size: 11px; color: #374151;")}>{p.source}</span><span style={css("position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; background: rgba(255,255,255,.92); border-radius: 50%; display: flex; align-items: center; justify-content: center;")}><svg width="13" height="13" viewBox="0 0 24 24" fill="#16A34A" stroke="#16A34A" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg></span></div>
                    <div style={css("padding: 14px;")}><div style={css("font-size: 16px; font-weight: 700; margin-bottom: 4px;")}><span style={css("unicode-bidi:isolate")}>SAR </span>{p.priceLabel}</div><div style={css("font-size: 13px; color: #6B7280; margin-bottom: 3px;")}>{p.specs}</div><div style={css("font-size: 13px; color: #9CA3AF;")}>{p.location}</div></div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {D.dashSearches && (
          <>
            <h1 style={css("font-size: 24px; font-weight: 700; margin: 0 0 18px;")}>Saved Searches</h1>
            <div style={css("display: flex; flex-direction: column; gap: 10px; max-width: 640px;")}>
              {D.savedSearches.map((ss, i) => (<div key={i} style={css("border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 14px;")}><div style={css("flex: 1;")}><div style={css("font-size: 14px; font-weight: 600;")}>{ss.name}</div><div style={css("font-size: 13px; color: #9CA3AF; margin-top: 2px;")}>{ss.meta}</div></div><span style={css("font-size: 12px; color: #15803D; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 999px; padding: 3px 9px; font-weight: 500;")}>{ss.count}</span><span style={css("font-size: 12px; color: #9CA3AF; cursor: pointer;")}>Remove</span></div>))}
            </div>
          </>
        )}
        {D.dashAlerts && (
          <>
            <h1 style={css("font-size: 24px; font-weight: 700; margin: 0 0 18px;")}>Price Alerts</h1>
            <div style={css("display: flex; flex-direction: column; gap: 10px; max-width: 700px;")}>
              {D.alerts.map((a, i) => (
                <div key={i} style={css("border: 1px solid #E5E7EB; border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; gap: 14px;")}>
                  <div style={css("width: 48px; height: 36px; min-width: 48px; border-radius: 7px; background: #F3F4F6; background-image: repeating-linear-gradient(45deg, #E9EBEE 0, #E9EBEE 1px, transparent 1px, transparent 7px);")}></div>
                  <div style={css("flex: 1; min-width: 0;")}><div style={css("font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;")}>{a.title}</div><div style={css("font-size: 12px; color: #9CA3AF;")}>{a.location}</div></div>
                  <div style={css("text-align: right;")}><div style={css("font-size: 11px; color: #9CA3AF;")}>Current</div><div style={css("font-size: 13px; font-weight: 600;")}>{a.current}</div></div>
                  <div style={css("text-align: right;")}><div style={css("font-size: 11px; color: #9CA3AF;")}>Alert at</div><div style={css("font-size: 13px; font-weight: 600; color: #16A34A;")}>{a.target}</div></div>
                  <div style={css("width: 36px; height: 20px; border-radius: 999px; background: #16A34A; position: relative;")}><span style={css("position: absolute; top: 2px; right: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff;")}></span></div>
                  <span style={css("font-size: 12px; color: #9CA3AF; cursor: pointer;")}>Remove</span>
                </div>
              ))}
            </div>
          </>
        )}
        {D.dashReq && (
          <>
            <h1 style={css("font-size: 24px; font-weight: 700; margin: 0 0 18px;")}>My Requirements</h1>
            <div style={css("display: flex; flex-direction: column; gap: 10px; max-width: 640px;")}>
              {D.requirements.map((r, i) => (<div key={i} style={css("border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 14px;")}><div style={css("flex: 1;")}><div style={css("font-size: 14px; font-weight: 600;")}>{r.title}</div><div style={css("font-size: 13px; color: #9CA3AF; margin-top: 2px;")}>{r.meta}</div></div><span style={css("font-size: 12px; color: #15803D; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 999px; padding: 3px 9px; font-weight: 500;")}>{r.status}</span></div>))}
            </div>
          </>
        )}
        {D.dashRecent && (
          <>
            <h1 style={css("font-size: 24px; font-weight: 700; margin: 0 0 18px;")}>Recently Viewed</h1>
            <div style={css("display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px;")}>
              {D.recentProps.map((p) => (
                <div key={p.id} onClick={p.open} style={css("border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; cursor: pointer; background: #fff;")}>
                  <div style={css("height: 130px; background: #F3F4F6; background-image: repeating-linear-gradient(45deg, #E9EBEE 0, #E9EBEE 1px, transparent 1px, transparent 8px); position: relative;")}><span style={css("position: absolute; top: 8px; left: 8px; background: rgba(255,255,255,.92); border: 1px solid #E5E7EB; border-radius: 5px; padding: 2px 7px; font-size: 11px; color: #374151;")}>{p.viewed}</span></div>
                  <div style={css("padding: 14px;")}><div style={css("font-size: 16px; font-weight: 700; margin-bottom: 4px;")}><span style={css("unicode-bidi:isolate")}>SAR </span>{p.priceLabel}</div><div style={css("font-size: 13px; color: #6B7280; margin-bottom: 3px;")}>{p.specs}</div><div style={css("font-size: 13px; color: #9CA3AF;")}>{p.location}</div></div>
                </div>
              ))}
            </div>
          </>
        )}
        {D.dashNotifs && (
          <>
            <h1 style={css("font-size: 24px; font-weight: 700; margin: 0 0 18px;")}>Notifications</h1>
            <div style={css("border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; max-width: 720px;")}>
              {D.notifs.map((n, i) => (
                <div key={i} style={css("display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid #F3F4F6;")}>
                  {n.unread && <span style={css("width: 7px; height: 7px; border-radius: 50%; background: #16A34A;")}></span>}
                  <span style={css("flex: 1; font-size: 14px; color: #374151;")}>{n.msg}</span>
                  <span style={css("font-size: 12px; color: #9CA3AF; white-space: nowrap;")}>{n.time}</span>
                </div>
              ))}
            </div>
          </>
        )}
        {D.dashSettings && (
          <>
            <h1 style={css("font-size: 24px; font-weight: 700; margin: 0 0 18px;")}>Settings</h1>
            <div style={css("display: flex; flex-direction: column; gap: 14px; max-width: 480px;")}>
              <div><div style={css("font-size: 12px; color: #6B7280; margin-bottom: 6px;")}>Full Name</div><input defaultValue="Faisal Al-Rashid" style={css("width: 100%; height: 40px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: inherit;")} /></div>
              <div><div style={css("font-size: 12px; color: #6B7280; margin-bottom: 6px;")}>Email</div><input defaultValue="faisal@example.com" style={css("width: 100%; height: 40px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: inherit;")} /></div>
              <div><div style={css("font-size: 12px; color: #6B7280; margin-bottom: 6px;")}>WhatsApp</div><input defaultValue="+966 50 123 4567" style={css("width: 100%; height: 40px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: inherit;")} /></div>
              <button style={css("height: 40px; background: #16A34A; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; font-family: inherit; cursor: pointer; align-self: flex-start; padding: 0 18px;")}>Save Changes</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
