import { css } from "../lib/css";
import type { Derived } from "../store/useDerived";
import { LogoPin, WhatsApp } from "../components/icons";

export function Login({ D }: { D: Derived }) {
  return (
    <div style={css("height: 100vh; display: flex; overflow: hidden;")}>
      {/* left brand panel */}
      <div style={css("width: 44%; min-width: 360px; background: #0A0A0A; color: #fff; display: flex; flex-direction: column; justify-content: space-between; padding: 40px;")}>
        <div onClick={D.goHome} style={css("display: flex; align-items: center; gap: 8px; cursor: pointer;")}>
          <LogoPin size={22} sw={1.7} stroke="#fff" />
          <span style={css("font-size: 16px; font-weight: 500;")}>propscan</span>
        </div>
        <div>
          <div style={css("font-size: 28px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 16px;")}>Every Saudi property.<br />One account.</div>
          <p style={css("font-size: 14px; color: #9CA3AF; line-height: 1.6; max-width: 340px; margin: 0 0 28px;")}>Save listings, set price alerts, and track your requirements across Bayut, Wasalt, Aqar and 5 more platforms.</p>
          <div style={css("display: flex; flex-direction: column; gap: 12px;")}>
            {D.loginPerks.map((p, i) => (
              <div key={i} style={css("display: flex; align-items: center; gap: 10px; font-size: 13px; color: #D1D5DB;")}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5"><path d="M5 12l4 4L19 7" /></svg>{p}</div>
            ))}
          </div>
        </div>
        <div style={css("font-size: 11px; color: #6B7280;")}>REGA-licensed listings · 47,293 properties live</div>
      </div>
      {/* right form */}
      <div style={css("flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px; background: #fff;")}>
        <div style={css("width: 100%; max-width: 360px;")}>
          <h1 style={css("font-size: 24px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 6px;")}>{D.authTitle}</h1>
          <p style={css("font-size: 14px; color: #6B7280; margin: 0 0 24px;")}>{D.authSubtitle}</p>
          <div style={css("display: flex; flex-direction: column; gap: 12px;")}>
            {D.authIsSignup && <input placeholder="Full name" style={css("height: 42px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: inherit;")} />}
            <input placeholder="Email or phone" style={css("height: 42px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: inherit;")} />
            <input type="password" placeholder="Password" defaultValue="propscan" style={css("height: 42px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: inherit;")} />
            {D.authIsLogin && (
              <div style={css("display: flex; align-items: center; justify-content: space-between; font-size: 12px;")}>
                <label style={css("display: flex; align-items: center; gap: 7px; color: #6B7280; cursor: pointer;")}><input type="checkbox" defaultChecked style={css("accent-color: #16A34A; width: 14px; height: 14px;")} />Remember me</label>
                <span style={css("color: #16A34A; cursor: pointer;")}>Forgot password?</span>
              </div>
            )}
            <button onClick={D.doLogin} style={css("height: 44px; background: #16A34A; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; font-family: inherit; cursor: pointer; margin-top: 4px;")}>{D.authCta}</button>
          </div>
          <div style={css("display: flex; align-items: center; gap: 12px; margin: 20px 0;")}><div style={css("flex: 1; height: 1px; background: #F3F4F6;")}></div><span style={css("font-size: 12px; color: #9CA3AF;")}>or</span><div style={css("flex: 1; height: 1px; background: #F3F4F6;")}></div></div>
          <div style={css("display: flex; flex-direction: column; gap: 10px;")}>
            <button onClick={D.doLogin} style={css("height: 42px; background: #fff; color: #111827; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 14px; font-weight: 500; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 9px;")}><span style={css("font-size: 15px; font-weight: 700; color: #4285F4;")}>G</span>Continue with Google</button>
            <button onClick={D.doLogin} style={css("height: 42px; background: #fff; color: #111827; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 14px; font-weight: 500; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 9px;")}><WhatsApp size={16} stroke="#16A34A" />Continue with WhatsApp</button>
          </div>
          <div style={css("text-align: center; font-size: 13px; color: #6B7280; margin-top: 24px;")}>{D.authSwitchText} <span onClick={D.toggleAuth} style={css("color: #16A34A; font-weight: 500; cursor: pointer;")}>{D.authSwitchCta}</span></div>
        </div>
      </div>
    </div>
  );
}
