import { css } from "../lib/css";
import type { Derived } from "../store/useDerived";
import { ChevronDown, LogoPin, PinMarker, Search, Spark } from "../components/icons";

export function Home({ D }: { D: Derived }) {
  return (
    <div style={css("height: 100vh; overflow-y: auto; display: flex; flex-direction: column;")}>
      {/* navbar */}
      <div style={css("height: 56px; min-height: 56px; border-bottom: 1px solid #E5E7EB; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; background: #fff;")}>
        <div style={css("display: flex; align-items: center; gap: 8px;")}>
          <LogoPin size={22} sw={1.8} stroke="#0A0A0A" />
          <span style={css("font-size: 16px; font-weight: 600; letter-spacing: -0.02em;")}>propscan</span>
        </div>
        <div style={css("display: flex; align-items: center; gap: 22px; font-size: 13px;")}>
          <div style={css("display: flex; align-items: center; border: 1px solid #E5E7EB; border-radius: 7px; overflow: hidden;")}>
            <span onClick={D.setLangAR} style={css(D.langArStyle)}>AR</span>
            <span onClick={D.setLangEN} style={css(D.langEnStyle)}>EN</span>
          </div>
          <span style={css("width: 1px; height: 20px; background: #E5E7EB;")}></span>
          <button onClick={D.goPost} style={css("height: 32px; padding: 0 14px; background: #16A34A; color: #fff; border: none; border-radius: 7px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer;")}>Post Requirement</button>
        </div>
      </div>

      {/* hero */}
      <div style={css("display: flex; flex-direction: column; align-items: center; padding: 56px 24px 48px;")}>
        <div style={css("display: inline-flex; align-items: center; gap: 7px; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 999px; padding: 4px 11px; font-size: 12px; color: #6B7280; margin-bottom: 28px;")}>
          <span style={css("width: 6px; height: 6px; border-radius: 50%; background: #16A34A; animation: ps-pulse 1.8s ease-in-out infinite;")}></span>
          <span>Live · <span style={css("color: #111827; font-weight: 500;")}>{D.liveCount}</span> properties</span>
        </div>
        <h1 style={css("font-size: 36px; font-weight: 700; letter-spacing: -0.03em; text-align: center; margin: 0 0 12px; line-height: 1.1; max-width: 620px;")}>Saudi Arabia's Every Property.<br />One Search.</h1>
        <p style={css("font-size: 14px; color: #6B7280; text-align: center; margin: 0 0 18px;")}>Search across Bayut, Wasalt, Aqar and Property Finder simultaneously.</p>
        <div style={css("font-size: 12px; color: #9CA3AF; text-align: center; margin-bottom: 36px; letter-spacing: 0;")}>Bayut · Wasalt · Aqar · Property Finder</div>

        {/* search card */}
        <div style={css("width: 100%; max-width: 860px; background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); overflow: visible;")}>
          {/* tabs */}
          <div style={css("display: flex; gap: 22px; padding: 0 18px; border-bottom: 1px solid #F3F4F6;")}>
            {D.tabs.map((tab, i) => (
              <div key={i} onClick={tab.onClick} style={css(tab.style)}>{tab.label}</div>
            ))}
          </div>
          {/* controls */}
          <div style={css("padding: 14px 16px;")}>
            {D.tabProperties && <PropertiesTab D={D} />}
            {D.tabDaily && <DailyTab D={D} />}
            {D.tabNew && <NewProjectsTab D={D} />}
            {D.anyPop && <div onClick={D.closePop} style={css("position: fixed; inset: 0; z-index: 40;")}></div>}
          </div>
        </div>

        {/* popular near footer */}
        <div style={css("margin-top: 40px; display: flex; gap: 7px; flex-wrap: wrap; justify-content: center; max-width: 620px;")}>
          <span style={css("font-size: 12px; color: #9CA3AF; margin-right: 4px; align-self: center;")}>Popular:</span>
          {D.popular.map((p, i) => (
            <span key={i} onClick={D.goResults} style={css("font-size: 12px; color: #374151; border: 1px solid #E5E7EB; border-radius: 999px; padding: 4px 11px; cursor: pointer;")}>{p}</span>
          ))}
        </div>
        {/* AI search */}
        <div style={css("width: 100%; max-width: 720px; margin-top: 34px;")}>
          <div style={css("display: flex; align-items: center; gap: 8px; border: 1px solid #16A34A; border-radius: 12px; padding: 8px 8px 8px 14px; box-shadow: 0 1px 2px rgba(0,0,0,.04);")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.7"><path d="M12 3l1.6 4.6L18 9.2l-4.4 1.6L12 15l-1.6-4.2L6 9.2l4.4-1.6z" /><path d="M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8z" /></svg>
            <input onChange={D.onAiQuery} value={D.aiQuery} placeholder="Try: 3 bed villa near sea in Jeddah under 2M" style={css("flex: 1; height: 30px; border: none; outline: none; font-size: 14px; font-family: inherit; background: transparent;")} />
            <button onClick={D.goAiSearch} style={css("height: 36px; padding: 0 16px; background: #16A34A; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer; white-space: nowrap;")}>Search with AI</button>
          </div>
          <div style={css("display: flex; gap: 7px; flex-wrap: wrap; justify-content: center; margin-top: 12px;")}>
            {D.aiExamples.map((q, i) => (
              <span key={i} onClick={q.onClick} style={css("font-size: 12px; color: #6B7280; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 999px; padding: 4px 11px; cursor: pointer;")}>{q.text}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PropertiesTab({ D }: { D: Derived }) {
  return (
    <>
      <div style={css("display: flex; align-items: center; gap: 8px;")}>
        <div style={css("display: flex; border: 1px solid #E5E7EB; border-radius: 7px; overflow: hidden; height: 34px;")}>
          <div onClick={D.setBuy} style={css(D.buyStyle)}>Buy</div>
          <div onClick={D.setRent} style={css(D.rentStyle)}>Rent</div>
        </div>
        <div style={css("position: relative; flex: 1;")}>
          <div onClick={D.togCity} style={css(D.trigStyle)}><span>{D.city}</span> <ChevronDown size={11} stroke="#9CA3AF" /></div>
          {D.popCity && (
            <div style={css("position: absolute; top: 42px; left: 0; z-index: 50; width: 220px; max-height: 280px; overflow-y: auto; background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.16); padding: 6px;")}>
              {D.cityMenu.map((o, i) => (<div key={i} onClick={o.onClick} style={css(o.style)}>{o.label}</div>))}
            </div>
          )}
        </div>
        <div style={css("position: relative; flex: 1.4;")}>
          <div onClick={D.togDistrict} style={css(D.trigStyle)}><span style={css(D.districtColor)}>{D.districtLabel}</span> <ChevronDown size={11} stroke="#9CA3AF" /></div>
          {D.popDistrict && <DistrictPopover D={D} />}
        </div>
        <button onClick={D.goResults} style={css("height: 34px; padding: 0 22px; background: #16A34A; color: #fff; border: none; border-radius: 7px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer; display: flex; align-items: center; gap: 6px; white-space: nowrap;")}><Search size={14} />Search</button>
      </div>
      <div style={css("display: flex; align-items: center; gap: 8px; margin-top: 8px;")}>
        {D.purposeBuy && (
          <div style={css("display: flex; border: 1px solid #E5E7EB; border-radius: 7px; overflow: hidden; height: 34px; flex: none;")}>
            <div onClick={D.setStAll} style={css(D.stAllStyle)}>All</div>
            <div onClick={D.setStReady} style={css(D.stReadyStyle)}>Ready</div>
            <div onClick={D.setStOff} style={css(D.stOffStyle)}>Off-Plan</div>
          </div>
        )}
        {D.purposeRent && (
          <div style={css("position: relative; flex: 1;")}>
            <div onClick={D.togRentP} style={css(D.trigStyle)}><span style={css(D.rentPColor)}>{D.rentPLabel}</span> <ChevronDown size={11} stroke="#9CA3AF" /></div>
            {D.popRentP && (
              <div style={css("position: absolute; top: 42px; left: 0; z-index: 50; width: 180px; background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.16); padding: 6px;")}>
                {D.rentPOpts.map((o, i) => (<div key={i} onClick={o.onClick} style={css(o.style)}>{o.label}</div>))}
              </div>
            )}
          </div>
        )}
        {/* type */}
        <div style={css("position: relative; flex: 1;")}>
          <div onClick={D.togPType} style={css(D.trigStyle)}><span style={css(D.pTypeColor)}>{D.pTypeLabel}</span> <ChevronDown size={11} stroke="#9CA3AF" /></div>
          {D.popPType && <TypePopover D={D} width={380} />}
        </div>
        {/* beds & baths (residential) */}
        {D.resMode && (
          <div style={css("position: relative; flex: 1;")}>
            <div onClick={D.togBedsBaths} style={css(D.trigStyle)}><span style={css(D.bbColor)}>{D.bedsBathsLabel}</span> <ChevronDown size={11} stroke="#9CA3AF" /></div>
            {D.popBedsBaths && <BedsBathsPopover D={D} />}
          </div>
        )}
        {/* area (commercial) */}
        {D.comMode && (
          <div style={css("position: relative; flex: 1;")}>
            <div onClick={D.togPArea} style={css(D.trigStyle)}><span style={css(D.pAreaColor)}>{D.pAreaLabel}</span> <ChevronDown size={11} stroke="#9CA3AF" /></div>
            {D.popPArea && <AreaPopover D={D} />}
          </div>
        )}
        {/* price */}
        <div style={css("position: relative; flex: 1;")}>
          <div onClick={D.togPPrice} style={css(D.trigStyle)}><span style={css(D.pPriceColor)}>{D.pPriceLabel}</span> <ChevronDown size={11} stroke="#9CA3AF" /></div>
          {D.popPPrice && <PricePopover D={D} align="right" />}
        </div>
        {/* platform */}
        <div style={css("position: relative; flex: 1;")}>
          <div onClick={D.togPlatform} style={css(D.trigStyle)}><span style={css(D.platformColor)}>{D.platformLabel}</span> <ChevronDown size={11} stroke="#9CA3AF" /></div>
          {D.popPlatform && <PlatformPopover D={D} />}
        </div>
      </div>
      <div onClick={D.goMap} style={css("margin-top: 12px; background: #F0FDF4; border: 1px solid #DCFCE7; border-radius: 8px; padding: 9px 12px; font-size: 12px; cursor: pointer;")}><span style={css("color: #15803D; font-weight: 600;")}>View Listings on Map</span> <span style={css("color: #374151;")}>Find your dream property in preferred areas using a map →</span></div>
    </>
  );
}

// ---- shared popovers -----------------------------------------------------
export function DistrictPopover({ D }: { D: Derived }) {
  return (
    <div style={css("position: absolute; top: 42px; left: 0; z-index: 50; width: 260px; background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.16); padding: 6px;")}>
      <div style={css("position: relative; display: flex; align-items: center; margin-bottom: 4px;")}>
        <svg style={css("position:absolute;left:9px;")} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
        <input placeholder={`Search ${D.districtCount} districts…`} value={D.districtQuery} onChange={D.onDistrictQuery} style={css("width: 100%; height: 32px; border: 1px solid #E5E7EB; border-radius: 7px; padding: 0 8px 0 28px; font-size: 12px; font-family: inherit;")} />
      </div>
      <div style={css("max-height: 240px; overflow-y: auto;")}>
        {D.districtMenu.map((o, i) => (<div key={i} onClick={o.onClick} style={css(o.style)}>{o.label}</div>))}
      </div>
    </div>
  );
}

export function TypePopover({ D, width, align = "left" }: { D: Derived; width: number; align?: "left" | "right" }) {
  return (
    <div style={css(`position: absolute; top: 42px; ${align}: 0; z-index: 50; width: ${width}px; max-width: 90vw; background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.16); padding: 16px;`)}>
      <div style={css("display: flex; border-bottom: 1px solid #F3F4F6; margin-bottom: 14px;")}><div onClick={D.setPTabRes} style={css(D.pTabResStyle)}>Residential</div><div onClick={D.setPTabCom} style={css(D.pTabComStyle)}>Commercial</div></div>
      <div style={css("display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; max-height: 260px; overflow-y: auto;")}>
        {D.pTypeOptions.map((o, i) => (
          <div key={i} onClick={o.onClick} style={css(o.style)}><span style={css(o.box)}>{o.sel && <span style={css("width: 8px; height: 8px; border-radius: 50%; background: #16A34A;")}></span>}</span>{o.label}</div>
        ))}
      </div>
      <div style={css("display: flex; gap: 10px;")}><button onClick={D.resetPType} style={css(D.resetBtn)}>Reset</button><button onClick={D.closePop} style={css(D.doneBtn)}>Done</button></div>
    </div>
  );
}

export function BedsBathsPopover({ D, align = "left" }: { D: Derived; align?: "left" | "right" }) {
  return (
    <div style={css(`position: absolute; top: 42px; ${align}: 0; z-index: 50; width: 340px; max-width: 90vw; background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.16); padding: 16px;`)}>
      <div style={css("font-size: 14px; font-weight: 700; margin-bottom: 10px;")}>Beds</div>
      <div style={css("display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 16px;")}>{D.bedPills.map((b, i) => (<span key={i} onClick={b.onClick} style={css(b.style)}>{b.label}</span>))}</div>
      <div style={css("font-size: 14px; font-weight: 700; margin-bottom: 10px;")}>Baths</div>
      <div style={css("display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 16px;")}>{D.bathPills.map((b, i) => (<span key={i} onClick={b.onClick} style={css(b.style)}>{b.label}</span>))}</div>
      <div style={css("display: flex; gap: 10px;")}><button onClick={D.resetBedsBaths} style={css(D.resetBtn)}>Reset</button><button onClick={D.closePop} style={css(D.doneBtn)}>Done</button></div>
    </div>
  );
}

export function AreaPopover({ D, align = "left" }: { D: Derived; align?: "left" | "right" }) {
  return (
    <div style={css(`position: absolute; top: 42px; ${align}: 0; z-index: 50; width: 300px; max-width: 90vw; background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.16); padding: 18px;`)}>
      <div style={css("font-size: 14px; font-weight: 700; margin-bottom: 14px;")}>Area (Sq. M.)</div>
      <div style={css("display: flex; gap: 12px; margin-bottom: 16px;")}>
        <div style={css("flex: 1;")}><div style={css("font-size: 12px; color: #6B7280; margin-bottom: 6px;")}>Min area</div><input placeholder="0" value={D.areaMin} onChange={D.onAreaMin} style={css("width: 100%; height: 38px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: inherit;")} /></div>
        <div style={css("flex: 1;")}><div style={css("font-size: 12px; color: #6B7280; margin-bottom: 6px;")}>Max area</div><input placeholder="Any" value={D.areaMax} onChange={D.onAreaMax} style={css("width: 100%; height: 38px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: inherit;")} /></div>
      </div>
      <div style={css("display: flex; gap: 10px;")}><button onClick={D.resetPArea} style={css(D.resetBtn)}>Reset</button><button onClick={D.closePop} style={css(D.doneBtn)}>Done</button></div>
    </div>
  );
}

export function PricePopover({ D, align = "right" }: { D: Derived; align?: "left" | "right" }) {
  return (
    <div style={css(`position: absolute; top: 42px; ${align}: 0; z-index: 50; width: 320px; max-width: 90vw; background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.16); padding: 18px;`)}>
      <div style={css("font-size: 14px; font-weight: 700; margin-bottom: 6px;")}>Price Range (SAR)</div>
      <div style={css("display: flex; justify-content: space-between; font-size: 12px; color: #9CA3AF; margin-bottom: 8px;")}><span>{D.pPriceMinLabel}</span><span>{D.pPriceMaxLabel}</span></div>
      <div style={css("position: relative; height: 22px; margin-bottom: 14px;")}>
        <div style={css("position: absolute; top: 9px; left: 0; right: 0; height: 3px; border-radius: 2px; background: #E5E7EB;")}></div>
        <div style={css(D.priceFill)}></div>
        <input className="ps-range" type="range" min={0} max={6000000} step={50000} value={D.minPriceNum} onChange={D.onMinPrice} />
        <input className="ps-range" type="range" min={0} max={6000000} step={50000} value={D.maxPriceNum} onChange={D.onMaxPrice} />
      </div>
      <div style={css("display: flex; gap: 12px; margin-bottom: 16px;")}>
        <div style={css("flex: 1;")}><div style={css("font-size: 12px; color: #6B7280; margin-bottom: 6px;")}>Minimum</div><input placeholder="0" value={D.minPrice} onChange={D.onMinPrice} style={css("width: 100%; height: 38px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: inherit;")} /></div>
        <div style={css("flex: 1;")}><div style={css("font-size: 12px; color: #6B7280; margin-bottom: 6px;")}>Maximum</div><input placeholder="Any" value={D.maxPrice} onChange={D.onMaxPrice} style={css("width: 100%; height: 38px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: inherit;")} /></div>
      </div>
      <div style={css("display: flex; gap: 10px;")}><button onClick={D.resetPPrice} style={css(D.resetBtn)}>Reset</button><button onClick={D.closePop} style={css(D.doneBtn)}>Done</button></div>
    </div>
  );
}

export function PlatformPopover({ D, align = "right" }: { D: Derived; align?: "left" | "right" }) {
  return (
    <div style={css(`position: absolute; top: 42px; ${align}: 0; z-index: 50; width: 250px; max-width: 90vw; background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.16); padding: 10px;`)}>
      <label onClick={D.platformAll} style={css("display: flex; align-items: center; gap: 9px; height: 38px; padding: 0 8px; border-radius: 7px; font-size: 13px; color: #374151; cursor: pointer; font-weight: 500;")}><span style={css(D.platformAllBox)}>{D.platformAllOn && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><path d="M5 12l4 4L19 7" /></svg>}</span>All platforms</label>
      <div style={css("height: 1px; background: #F3F4F6; margin: 4px 0;")}></div>
      {D.platformOpts.map((p, i) => (
        <label key={i} onClick={p.onToggle} style={css("display: flex; align-items: center; gap: 9px; height: 36px; padding: 0 8px; border-radius: 7px; font-size: 13px; color: #374151; cursor: pointer;")}><span style={css(p.box)}>{p.checked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><path d="M5 12l4 4L19 7" /></svg>}</span>{p.name}</label>
      ))}
      <div style={css("display: flex; gap: 10px; margin-top: 8px;")}><button onClick={D.platformAll} style={css(D.resetBtn)}>All</button><button onClick={D.closePop} style={css(D.doneBtn)}>Done</button></div>
    </div>
  );
}

// ---- Daily Rentals tab ---------------------------------------------------
function DailyTab({ D }: { D: Derived }) {
  return (
    <>
      <div style={css("display: flex; align-items: center; gap: 8px;")}>
        <div style={css("position: relative; flex: 1;")}>
          <div onClick={D.togCity} style={css(D.trigStyle)}><span>{D.city}</span> <ChevronDown size={11} stroke="#9CA3AF" /></div>
          {D.popCity && (
            <div style={css("position: absolute; top: 42px; left: 0; z-index: 50; width: 220px; max-height: 280px; overflow-y: auto; background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.16); padding: 6px;")}>
              {D.cityMenu.map((o, i) => (<div key={i} onClick={o.onClick} style={css(o.style)}>{o.label}</div>))}
            </div>
          )}
        </div>
        <div style={css("position: relative; flex: 1.4;")}>
          <div onClick={D.togDistrict} style={css(D.trigStyle)}><span style={css(D.districtColor)}>{D.districtLabel}</span> <ChevronDown size={11} stroke="#9CA3AF" /></div>
          {D.popDistrict && <DistrictPopover D={D} />}
        </div>
        <button onClick={D.goDaily} style={css("height: 34px; padding: 0 24px; background: #16A34A; color: #fff; border: none; border-radius: 7px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer; display: flex; align-items: center; gap: 6px;")}><Search size={14} />Search</button>
      </div>
      <div style={css("display: flex; align-items: center; gap: 8px; margin-top: 8px;")}>
        <select style={css("flex: 1; height: 34px; border: 1px solid #E5E7EB; border-radius: 7px; padding: 0 8px; font-size: 13px; font-family: inherit; color: #374151; background: #fff;")} defaultValue="All Property Types"><option>All Property Types</option><option>Apartment</option><option>Villa</option><option>Chalet</option><option>Studio</option></select>
        {/* check in */}
        <div style={css("position: relative; flex: 1;")}>
          <div onClick={D.togCheckin} style={css(D.trigStyle)}><span style={css(D.checkinColor)}>{D.checkinLabel}</span> <ChevronDown size={11} stroke="#9CA3AF" /></div>
          {D.popCheckin && (
            <div style={css("position: absolute; top: 42px; left: 0; z-index: 50; width: 520px; max-width: 80vw; background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.16); padding: 18px;")}>
              <div style={css("display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;")}>
                <div><div style={css("font-size: 14px; font-weight: 700;")}>Select Dates</div><div style={css("font-size: 12px; color: #9CA3AF; margin-top: 2px;")}>Add your travel dates for exact pricing</div></div>
                <div style={css("text-align: right;")}><div style={css("font-size: 11px; color: #9CA3AF; margin-bottom: 3px;")}>Check-in — Check-out</div><div style={css("font-size: 12px; color: #374151;")}>{D.checkinLabel}</div></div>
              </div>
              <div style={css("display: grid; grid-template-columns: 1fr 1fr; gap: 22px;")}>
                {[{ name: D.calM1Name, cells: D.calM1 }, { name: D.calM2Name, cells: D.calM2 }].map((mo, mi) => (
                  <div key={mi}>
                    <div style={css("text-align: center; font-size: 13px; font-weight: 600; margin-bottom: 10px;")}>{mo.name}</div>
                    <div style={css("display: grid; grid-template-columns: repeat(7,1fr); gap: 2px; margin-bottom: 4px;")}>{D.dow.map((d, i) => (<div key={i} style={css("text-align: center; font-size: 10px; color: #9CA3AF; font-weight: 600;")}>{d}</div>))}</div>
                    <div style={css("display: grid; grid-template-columns: repeat(7,1fr); gap: 2px;")}>{mo.cells.map((c, i) => (<div key={i} onClick={c.onClick} style={css(c.style)}>{c.label}</div>))}</div>
                  </div>
                ))}
              </div>
              <div style={css("display: flex; gap: 10px; margin-top: 16px;")}><button onClick={D.resetDates} style={css(D.resetBtn)}>Reset</button><button onClick={D.closePop} style={css(D.doneBtn)}>Done</button></div>
            </div>
          )}
        </div>
        {/* guests */}
        <div style={css("position: relative; flex: 1;")}>
          <div onClick={D.togGuests} style={css(D.trigStyle)}>{D.guestsLabel} <ChevronDown size={11} stroke="#9CA3AF" /></div>
          {D.popGuests && (
            <div style={css("position: absolute; top: 42px; left: 0; z-index: 50; width: 300px; background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.16); padding: 18px;")}>
              <div style={css("display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;")}>
                <div><div style={css("font-size: 14px; font-weight: 700;")}>Adults</div><div style={css("font-size: 12px; color: #9CA3AF;")}>Age 13 or above</div></div>
                <div style={css("display: flex; align-items: center; gap: 10px;")}><span onClick={D.decA} style={css(D.stepBtn)}>−</span><span style={css("font-size: 14px; font-weight: 600; min-width: 16px; text-align: center;")}>{D.adults}</span><span onClick={D.incA} style={css(D.stepBtn)}>+</span></div>
              </div>
              <div style={css("display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;")}>
                <div><div style={css("font-size: 14px; font-weight: 700;")}>Children</div><div style={css("font-size: 12px; color: #9CA3AF;")}>Ages 2 - 12</div></div>
                <div style={css("display: flex; align-items: center; gap: 10px;")}><span onClick={D.decC} style={css(D.stepBtn)}>−</span><span style={css("font-size: 14px; font-weight: 600; min-width: 16px; text-align: center;")}>{D.children}</span><span onClick={D.incC} style={css(D.stepBtn)}>+</span></div>
              </div>
              <div style={css("display: flex; gap: 10px;")}><button onClick={D.resetGuests} style={css(D.resetBtn)}>Reset</button><button onClick={D.closePop} style={css(D.doneBtn)}>Done</button></div>
            </div>
          )}
        </div>
        {/* price */}
        <div style={css("position: relative; flex: 1;")}>
          <div onClick={D.togPrice} style={css(D.trigStyle)}><span style={css(D.dpriceColor)}>{D.dpriceLabel}</span> <ChevronDown size={11} stroke="#9CA3AF" /></div>
          {D.popPrice && (
            <div style={css("position: absolute; top: 42px; right: 0; z-index: 50; width: 320px; background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.16); padding: 18px;")}>
              <div style={css("font-size: 14px; font-weight: 700; margin-bottom: 6px;")}>Price Range</div>
              <div style={css("display: flex; justify-content: space-between; font-size: 12px; color: #9CA3AF; margin-bottom: 8px;")}><span>{D.dPriceMinLabel}</span><span>{D.dPriceMaxLabel}</span></div>
              <div style={css("position: relative; height: 22px; margin-bottom: 14px;")}>
                <div style={css("position: absolute; top: 9px; left: 0; right: 0; height: 3px; border-radius: 2px; background: #E5E7EB;")}></div>
                <div style={css(D.dPriceFill)}></div>
                <input className="ps-range" type="range" min={0} max={5000} step={50} value={D.dMinNum} onChange={D.onDMin} />
                <input className="ps-range" type="range" min={0} max={5000} step={50} value={D.dMaxNum} onChange={D.onDMax} />
              </div>
              <div style={css("display: flex; gap: 12px; margin-bottom: 16px;")}>
                <div style={css("flex: 1;")}><div style={css("font-size: 12px; color: #6B7280; margin-bottom: 6px;")}>Minimum</div><input placeholder="0" value={D.dMin} onChange={D.onDMin} style={css("width: 100%; height: 38px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: inherit;")} /></div>
                <div style={css("flex: 1;")}><div style={css("font-size: 12px; color: #6B7280; margin-bottom: 6px;")}>Maximum</div><input placeholder="5,000" value={D.dMax} onChange={D.onDMax} style={css("width: 100%; height: 38px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: inherit;")} /></div>
              </div>
              <div style={css("display: flex; gap: 10px;")}><button onClick={D.resetPrice} style={css(D.resetBtn)}>Reset</button><button onClick={D.closePop} style={css(D.doneBtn)}>Done</button></div>
            </div>
          )}
        </div>
      </div>
      <div style={css("margin-top: 12px; background: #F0FDF4; border: 1px solid #DCFCE7; border-radius: 8px; padding: 9px 12px; font-size: 12px;")}><span style={css("color: #15803D; font-weight: 600;")}>Become a host</span> <span style={css("color: #374151;")}>Transform your property into a consistent income stream →</span></div>
    </>
  );
}

// ---- New Projects tab ----------------------------------------------------
function NewProjectsTab({ D }: { D: Derived }) {
  return (
    <>
      <div style={css("display: flex; align-items: center; gap: 8px;")}>
        <div style={css("position: relative; display: flex; align-items: center; flex: 1; min-width: 0;")}>
          <svg style={css("position: absolute; left: 11px;")} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.8"><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>
          <input placeholder="Enter location" value={D.district} onChange={D.onDistrict} style={css("width: 100%; height: 34px; border: 1px solid #E5E7EB; border-radius: 7px; padding: 0 10px 0 32px; font-size: 13px; font-family: inherit;")} />
        </div>
        <button onClick={D.goNewProj} style={css("height: 34px; padding: 0 24px; background: #16A34A; color: #fff; border: none; border-radius: 7px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer; display: flex; align-items: center; gap: 6px;")}><Search size={14} />Search</button>
      </div>
      <div style={css("display: flex; align-items: center; gap: 8px; margin-top: 8px;")}>
        {/* property type */}
        <div style={css("position: relative; flex: 1;")}>
          <div onClick={D.togType} style={css(D.trigStyle)}>{D.npTypeLabel} <ChevronDown size={11} stroke="#9CA3AF" /></div>
          {D.popType && (
            <div style={css("position: absolute; top: 42px; left: 0; z-index: 50; width: 360px; background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.16); padding: 16px;")}>
              <div style={css("display: flex; border-bottom: 1px solid #F3F4F6; margin-bottom: 14px;")}><div onClick={D.setNpTabRes} style={css(D.npTabResStyle)}>Residential</div><div onClick={D.setNpTabCom} style={css(D.npTabComStyle)}>Commercial</div></div>
              <div style={css("display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;")}>
                {D.npTypeOptions.map((o, i) => (<div key={i} onClick={o.onClick} style={css(o.style)}><span style={css(o.dot)}>{o.sel && <span style={css("width: 8px; height: 8px; border-radius: 50%; background: #16A34A;")}></span>}</span>{o.label}</div>))}
              </div>
              <div style={css("display: flex; gap: 10px;")}><button onClick={D.resetType} style={css(D.resetBtn)}>Reset</button><button onClick={D.closePop} style={css(D.doneBtn)}>Done</button></div>
            </div>
          )}
        </div>
        {/* handover */}
        <div style={css("position: relative; flex: 1;")}>
          <div onClick={D.togHandover} style={css(D.trigStyle)}><span style={css(D.handoverColor)}>{D.handoverLabel}</span> <ChevronDown size={11} stroke="#9CA3AF" /></div>
          {D.popHandover && (
            <div style={css("position: absolute; top: 42px; left: 0; z-index: 50; width: 200px; max-height: 260px; overflow-y: auto; background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.16); padding: 6px;")}>
              {D.handoverOptsD.map((o, i) => (<div key={i} onClick={o.onClick} style={css(o.style)}>{o.label}</div>))}
            </div>
          )}
        </div>
        {/* payment plan */}
        <div style={css("position: relative; flex: 1;")}>
          <div onClick={D.togPay} style={css(D.trigStyle)}><span style={css(D.payColor)}>{D.payPlanLabel}</span> <ChevronDown size={11} stroke="#9CA3AF" /></div>
          {D.popPay && (
            <div style={css("position: absolute; top: 42px; left: 0; z-index: 50; width: 320px; background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.16); padding: 18px;")}>
              <div style={css("font-size: 14px; font-weight: 700; margin-bottom: 12px;")}>Pre-handover Payment</div>
              <div style={css("display: flex; justify-content: space-between; font-size: 12px; color: #9CA3AF; margin-bottom: 6px;")}><span>0%</span><span style={css("color: #16A34A; font-weight: 600;")}>{D.payPlan}%</span><span>100%</span></div>
              <input type="range" min={0} max={100} value={D.payPlan} onChange={D.onPayPlan} style={css("width: 100%; accent-color: #16A34A; margin-bottom: 16px;")} />
              <div style={css("display: flex; gap: 10px;")}><button onClick={D.resetPay} style={css(D.resetBtn)}>Reset</button><button onClick={D.closePop} style={css(D.doneBtn)}>Done</button></div>
            </div>
          )}
        </div>
        {/* completion */}
        <div style={css("position: relative; flex: 1;")}>
          <div onClick={D.togCompletion} style={css(D.trigStyle)}><span style={css(D.completionColor)}>{D.completionLabel}</span> <ChevronDown size={11} stroke="#9CA3AF" /></div>
          {D.popCompletion && (
            <div style={css("position: absolute; top: 42px; right: 0; z-index: 50; width: 200px; background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.16); padding: 6px;")}>
              {D.completionOptsD.map((o, i) => (<div key={i} onClick={o.onClick} style={css(o.style)}>{o.label}</div>))}
            </div>
          )}
        </div>
      </div>
      <div onClick={D.goMap} style={css("margin-top: 12px; background: #F0FDF4; border: 1px solid #DCFCE7; border-radius: 8px; padding: 9px 12px; font-size: 12px; cursor: pointer;")}><span style={css("color: #15803D; font-weight: 600;")}>View Listings on Map</span> <span style={css("color: #374151;")}>Find your dream property in preferred areas using a map →</span></div>
    </>
  );
}

// Re-export marker icon for screens that import from here if needed.
export { PinMarker };
