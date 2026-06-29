import type { ReactNode } from "react";
import { css } from "../lib/css";
import type { Derived } from "../store/useDerived";
import { LogoPin } from "./icons";

/** The shared content-page top bar: logo + nav links + a right-side slot. */
export function NavHeader({ D, right }: { D: Derived; right?: ReactNode }) {
  return (
    <div style={css("height: 56px; min-height: 56px; border-bottom: 1px solid #E5E7EB; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; background: #fff;")}>
      <div style={css("display: flex; align-items: center; gap: 28px;")}>
        <div onClick={D.goHome} style={css("display: flex; align-items: center; gap: 7px; cursor: pointer;")}><LogoPin size={20} sw={1.8} stroke="#0A0A0A" /><span style={css("font-size: 14px; font-weight: 500;")}>propscan</span></div>
        <div style={css("display: flex; gap: 18px;")}>{D.navLinks.map((l, i) => (<span key={i} onClick={l.onClick} style={css(l.style)}>{l.label}</span>))}</div>
      </div>
      {right}
    </div>
  );
}

export function PostButton({ D }: { D: Derived }) {
  return (
    <button onClick={D.goPost} style={css("height: 32px; padding: 0 13px; background: #16A34A; color: #fff; border: none; border-radius: 7px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer;")}>Post Requirement</button>
  );
}
