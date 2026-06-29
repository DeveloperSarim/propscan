import { css } from "../lib/css";
import type { Derived } from "../store/useDerived";
import { NavHeader } from "../components/NavHeader";

export function Calc({ D }: { D: Derived }) {
  const right = <button onClick={D.goPost} style={css("height: 32px; padding: 0 13px; background: #16A34A; color: #fff; border: none; border-radius: 7px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer;")}>Post Requirement</button>;
  return (
    <div style={css("height: 100vh; overflow-y: auto; background: #F9FAFB;")}>
      <NavHeader D={D} right={right} />
      <div style={css("max-width: 560px; margin: 0 auto; padding: 56px 24px 60px;")}>
        <div style={css("display: flex; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; height: 40px; margin-bottom: 22px;")}><div onClick={D.setCalcMort} style={css(D.calcMortStyle)}>Mortgage</div><div onClick={D.setCalcYield} style={css(D.calcYieldStyle)}>Rental Yield</div></div>

        {D.calcMortgage && (
          <div style={css("background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; padding: 32px;")}>
            <h2 style={css("font-size: 22px; font-weight: 700; margin: 0 0 4px;")}>Mortgage Calculator</h2>
            <p style={css("font-size: 14px; color: #6B7280; margin: 0 0 24px;")}>Estimate your monthly payments.</p>
            <div style={css("display: flex; flex-direction: column; gap: 16px;")}>
              <div><div style={css("font-size: 12px; color: #6B7280; margin-bottom: 6px;")}>Property Price (SAR )</div><input value={D.mortPrice} onChange={D.onMortPrice} style={css("width: 100%; height: 40px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: inherit;")} /></div>
              <div><div style={css("font-size: 12px; color: #6B7280; margin-bottom: 6px;")}>Down Payment (%)</div><input value={D.mortDown} onChange={D.onMortDown} style={css("width: 100%; height: 40px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: inherit;")} /><div style={css("font-size: 12px; color: #9CA3AF; margin-top: 5px;")}>= {D.mortDownAmt}</div></div>
              <div><div style={css("font-size: 12px; color: #6B7280; margin-bottom: 6px;")}>Interest Rate (%)</div><input value={D.mortRate} onChange={D.onMortRate} style={css("width: 100%; height: 40px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: inherit;")} /></div>
              <div><div style={css("font-size: 12px; color: #6B7280; margin-bottom: 7px;")}>Loan Term</div><div style={css("display: flex; gap: 6px;")}>{D.termChips.map((t, i) => (<span key={i} onClick={t.onClick} style={css(t.style)}>{t.label}</span>))}</div></div>
            </div>
            <div style={css("border-left: 3px solid #16A34A; background: #F9FAFB; border-radius: 0 10px 10px 0; padding: 16px 18px; margin-top: 24px;")}>
              <div style={css("font-size: 12px; color: #6B7280; margin-bottom: 2px;")}>Monthly Payment</div>
              <div style={css("font-size: 28px; font-weight: 800; color: #16A34A; margin-bottom: 14px; letter-spacing: -0.02em;")}>{D.mortMonthly}</div>
              <div style={css("display: flex; gap: 18px;")}>
                <div><div style={css("font-size: 11px; color: #9CA3AF;")}>Loan Amount</div><div style={css("font-size: 14px; font-weight: 600;")}>{D.mortLoan}</div></div>
                <div><div style={css("font-size: 11px; color: #9CA3AF;")}>Total Interest</div><div style={css("font-size: 14px; font-weight: 600;")}>{D.mortInt}</div></div>
                <div><div style={css("font-size: 11px; color: #9CA3AF;")}>Total Payment</div><div style={css("font-size: 14px; font-weight: 600;")}>{D.mortTotal}</div></div>
              </div>
            </div>
          </div>
        )}

        {D.calcYield && (
          <div style={css("background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; padding: 32px;")}>
            <h2 style={css("font-size: 22px; font-weight: 700; margin: 0 0 4px;")}>Rental Yield Calculator</h2>
            <p style={css("font-size: 14px; color: #6B7280; margin: 0 0 24px;")}>Estimate your annual rental return.</p>
            <div style={css("display: flex; flex-direction: column; gap: 16px;")}>
              <div><div style={css("font-size: 12px; color: #6B7280; margin-bottom: 6px;")}>Property Price (SAR )</div><input value={D.yldPrice} onChange={D.onYldPrice} style={css("width: 100%; height: 40px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: inherit;")} /></div>
              <div><div style={css("font-size: 12px; color: #6B7280; margin-bottom: 6px;")}>Monthly Rent (SAR )</div><input value={D.yldRent} onChange={D.onYldRent} style={css("width: 100%; height: 40px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: inherit;")} /></div>
            </div>
            <div style={css("border-left: 3px solid #16A34A; background: #F9FAFB; border-radius: 0 10px 10px 0; padding: 16px 18px; margin-top: 24px;")}>
              <div style={css("font-size: 12px; color: #6B7280; margin-bottom: 2px;")}>Annual Yield</div>
              <div style={css("font-size: 28px; font-weight: 800; color: #16A34A; margin-bottom: 14px; letter-spacing: -0.02em;")}>{D.yldPct}</div>
              <div style={css("display: flex; gap: 18px;")}>
                <div><div style={css("font-size: 11px; color: #9CA3AF;")}>Annual Rental Income</div><div style={css("font-size: 14px; font-weight: 600;")}>{D.yldAnnual}</div></div>
                <div><div style={css("font-size: 11px; color: #9CA3AF;")}>Monthly</div><div style={css("font-size: 14px; font-weight: 600;")}>{D.yldMonthly}</div></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
