import { css } from "../lib/css";
import type { Derived } from "../store/useDerived";
import { NavHeader, PostButton } from "../components/NavHeader";
import { Clock, Email, PinMarker, WhatsApp } from "../components/icons";

export function Contact({ D }: { D: Derived }) {
  return (
    <div style={css("height: 100vh; overflow-y: auto; background: #fff;")}>
      <NavHeader D={D} right={<PostButton D={D} />} />
      <div style={css("max-width: 960px; margin: 0 auto; padding: 56px 24px 60px; display: grid; grid-template-columns: 1.2fr 1fr; gap: 48px; align-items: start;")}>
        <div>
          <h2 style={css("font-size: 28px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 6px;")}>Get in Touch</h2>
          <p style={css("font-size: 14px; color: #6B7280; margin: 0 0 24px;")}>We respond within 24 hours.</p>
          <div style={css("display: flex; flex-direction: column; gap: 14px;")}>
            <input placeholder="Name" style={css("height: 40px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: inherit;")} />
            <input placeholder="Email" style={css("height: 40px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: inherit;")} />
            <input placeholder="Phone" style={css("height: 40px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: inherit;")} />
            <select style={css("height: 40px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 10px; font-size: 14px; font-family: inherit; background: #fff; color: #6B7280;")} defaultValue="Subject…"><option>Subject…</option><option>General enquiry</option><option>Report a listing</option><option>Partnership</option><option>Press</option></select>
            <textarea placeholder="Message" style={css("height: 110px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 10px 12px; font-size: 14px; font-family: inherit; resize: none;")}></textarea>
            <button style={css("height: 44px; background: #16A34A; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; font-family: inherit; cursor: pointer; align-self: flex-start; padding: 0 24px;")}>Send Message</button>
          </div>
        </div>
        <div style={css("border: 1px solid #E5E7EB; border-radius: 16px; padding: 28px;")}>
          <div style={css("display: flex; flex-direction: column; gap: 12px; margin-bottom: 18px;")}>
            <button style={css("height: 44px; background: #16A34A; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;")}><WhatsApp size={16} />Chat on WhatsApp</button>
            <div style={css("display: flex; align-items: center; gap: 10px; height: 44px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 14px; font-size: 13px; color: #374151;")}><Email size={16} stroke="#6B7280" />info@propscan.sa</div>
            <div style={css("display: flex; align-items: center; gap: 10px; height: 44px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 14px; font-size: 13px; color: #374151;")}><PinMarker size={16} stroke="#6B7280" />Jeddah, Saudi Arabia</div>
            <div style={css("display: flex; align-items: center; gap: 10px; height: 44px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 14px; font-size: 13px; color: #374151;")}><Clock size={16} stroke="#6B7280" />Sun–Thu, 9am–6pm AST</div>
          </div>
          <div style={css("height: 200px; border-radius: 12px; border: 1px solid #E5E7EB; background: #EEF0F2; background-image: linear-gradient(#E4E7EB 1px, transparent 1px), linear-gradient(90deg, #E4E7EB 1px, transparent 1px); background-size: 40px 40px, 40px 40px; position: relative;")}><svg style={css("position: absolute; left: 50%; top: 50%; transform: translate(-50%,-100%);")} width="24" height="24" viewBox="0 0 24 24" fill="#16A34A" stroke="#fff" strokeWidth="1.5"><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" /></svg></div>
        </div>
      </div>
    </div>
  );
}
