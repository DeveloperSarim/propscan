import { css } from "../lib/css";
import type { Derived } from "../store/useDerived";
import { Hover } from "../components/Hover";
import { ChevronDown, Download, FileIcon, LogoPin, PinMarker, Search } from "../components/icons";

export function Results({ D }: { D: Derived }) {
  return (
    <div style={css("height: 100vh; display: flex; flex-direction: column; overflow: hidden;")}>
      {/* top app bar */}
      <div className="ps-topbar" style={css("height: 48px; min-height: 48px; border-bottom: 1px solid #E5E7EB; display: flex; align-items: center; padding: 0 14px; gap: 14px; background: #fff;")}>
        <div onClick={D.goHome} style={css("display: flex; align-items: center; gap: 6px; cursor: pointer; padding-right: 14px; border-right: 1px solid #E5E7EB; height: 100%;")}>
          <LogoPin size={18} sw={1.8} stroke="#0A0A0A" />
          <span style={css("font-size: 13px; font-weight: 500;")}>propscan</span>
        </div>
        <div style={css("display: flex; align-items: center; gap: 7px; font-size: 12px; color: #6B7280;")}>
          <span style={css("color: #9CA3AF;")}>Workspaces</span><span style={css("color: #D1D5DB;")}>/</span><span style={css("color: #111827; font-weight: 500;")}>{D.city} · 5 districts</span>
        </div>
        <div style={css("display: inline-flex; align-items: center; gap: 6px; background: #F0FDF4; border: 1px solid #BBF7D0; color: #15803D; border-radius: 999px; padding: 3px 9px; font-size: 12px; font-weight: 500;")}>
          <span style={css("width: 5px; height: 5px; border-radius: 50%; background: #16A34A; animation: ps-pulse 1.8s ease-in-out infinite;")}></span>{D.statTotal} properties</div>
        <div style={css("flex: 1;")}></div>
        <div style={css("display: flex; align-items: center; gap: 2px; border: 1px solid #E5E7EB; border-radius: 7px; padding: 2px;")}>
          {D.views.map((v, i) => (
            <div key={i} onClick={v.onClick} style={css(v.style)}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={v.iconD} /></svg>{v.label}</div>
          ))}
        </div>
        <div style={css("position: relative; display: flex; align-items: center;")}>
          <svg style={css("position: absolute; left: 8px;")} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
          <input placeholder="Search within…" value={D.searchWithin} onChange={D.onSearchWithin} style={css("height: 30px; border: 1px solid #E5E7EB; border-radius: 7px; padding: 0 10px 0 27px; font-size: 12px; font-family: inherit; width: 150px;")} />
        </div>
        <ExportMenu D={D} />
      </div>

      <div style={css("flex: 1; display: flex; overflow: hidden;")}>
        {D.resultsSidebarShown && <ResultsSidebar D={D} />}

        {/* main results area */}
        <div className="ps-row" style={css("flex: 1; display: flex; overflow: hidden;")}>
          {/* LIST / GRID column */}
          <div className="ps-listcol" style={css(D.listColStyle)}>
            {/* AI suggestion bar */}
            {D.aiMode && (
              <div style={css("display: flex; align-items: center; gap: 10px; padding: 9px 14px; border-bottom: 1px solid #F3F4F6; background: #F0FDF4;")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.7"><path d="M12 3l1.6 4.6L18 9.2l-4.4 1.6L12 15l-1.6-4.2L6 9.2l4.4-1.6z" /></svg>
                <span style={css("flex: 1; font-size: 12px; color: #374151;")}><span style={css("font-weight: 600; color: #15803D;")}>AI Suggestion:</span> Try expanding to Al Rawdah — 234 more similar properties</span>
                <span onClick={D.applySearch} style={css("font-size: 12px; color: #15803D; font-weight: 600; cursor: pointer; white-space: nowrap;")}>Apply Suggestion</span>
                <span onClick={D.dismissAi} style={css("color: #9CA3AF; cursor: pointer; display: flex;")}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg></span>
              </div>
            )}
            {/* live scanning state */}
            {D.isSearching && <div style={css("position: relative; height: 3px; background: #F3F4F6; overflow: hidden;")}><div style={css("position: absolute; top: 0; left: 0; height: 100%; width: 40%; background: #16A34A; animation: ps-scan 1.6s linear infinite;")}></div></div>}
            <div style={css("padding: 6px 14px; border-bottom: 1px solid #F3F4F6; font-size: 11px; color: #9CA3AF; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;")}>
              {Object.entries(D.platformStatus).map(([name, status]) => (
                <span key={name} style={css("display: inline-flex; align-items: center; gap: 3px;")}>
                  {status === "loading"
                    ? <span style={css("display: inline-block; width: 8px; height: 8px; border-radius: 50%; border: 1.5px solid #16A34A; border-top-color: transparent; animation: ps-spin 0.7s linear infinite;")}></span>
                    : status === "done"
                    ? <span style={css("color:#16A34A; font-size: 12px;")}>✓</span>
                    : <span style={css("color:#EF4444; font-size: 12px;")}>✗</span>}
                  <span style={css(status === "loading" ? "color:#374151; font-weight:500;" : status === "done" ? "color:#16A34A;" : "color:#EF4444;")}>{name}</span>
                  {status === "done" && D.platformCounts[name] != null && <span style={css("color:#9CA3AF;")}>{D.platformCounts[name].toLocaleString()}</span>}
                </span>
              ))}
              {Object.keys(D.platformStatus).length === 0 && <span>Search to see results</span>}
            </div>
            {/* list header row */}
            <div style={css("height: 36px; min-height: 36px; border-bottom: 1px solid #E5E7EB; display: flex; align-items: center; padding: 0 14px; font-size: 11px; color: #9CA3AF; gap: 10px; background: #FAFAFA;")}>
              <span>Showing <span style={css("color: #374151; font-weight: 500;")}>{D.listCount}</span> of {D.statTotal}</span>
              <div style={css("flex: 1;")}></div>
              <span style={css("cursor: pointer; display: flex; align-items: center; gap: 4px;")}>Sort: Relevance <ChevronDown size={11} /></span>
            </div>

            {D.viewCards && <CardsView D={D} />}
            {D.viewGrid && <GridView D={D} />}
            {D.viewRows && <RowsView D={D} />}
            {D.viewSplitCards && <SplitCards D={D} />}
            {D.viewSheet && <SheetView D={D} />}
            {D.viewStats && <StatsView D={D} />}
          </div>

          {/* MAP column (split view only) */}
          {D.viewSplit && (
            <div className="ps-mapcol" style={css("flex: 1; min-width: 320px; position: relative; background: #EEF0F2; background-image: linear-gradient(#E4E7EB 1px, transparent 1px), linear-gradient(90deg, #E4E7EB 1px, transparent 1px); background-size: 64px 64px, 64px 64px;")}>
              <div style={css("position: absolute; inset: 0; background-image: linear-gradient(115deg, transparent 47%, #E0E3E8 47%, #E0E3E8 49%, transparent 49%), linear-gradient(20deg, transparent 62%, #E0E3E8 62%, #E0E3E8 63.5%, transparent 63.5%); pointer-events: none;")}></div>
              {D.list.map((p) => (
                <div key={p.id} onClick={p.open} style={css(`position: absolute; left: ${p.x}; top: ${p.y}; transform: translate(-50%,-50%); background: #fff; border: 1px solid #16A34A; border-radius: 999px; padding: 3px 8px; font-size: 11px; font-weight: 600; color: #0A0A0A; box-shadow: 0 1px 3px rgba(0,0,0,.15); cursor: pointer; white-space: nowrap;`)}><span style={css("unicode-bidi:isolate")}>SAR </span>{p.pinLabel}</div>
              ))}
              <div style={css("position: absolute; bottom: 12px; right: 12px; display: flex; flex-direction: column; border: 1px solid #E5E7EB; border-radius: 7px; overflow: hidden; background: #fff;")}>
                <span style={css("width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; border-bottom: 1px solid #E5E7EB; font-size: 16px; color: #374151;")}>+</span>
                <span style={css("width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 16px; color: #374151;")}>−</span>
              </div>
              <div style={css("position: absolute; top: 12px; left: 12px; background: rgba(255,255,255,.92); border: 1px solid #E5E7EB; border-radius: 6px; padding: 4px 9px; font-size: 11px; color: #6B7280;")}>{D.city} · {D.listCount} pins</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ClientExportMenu({ D }: { D: Derived }) {
  return (
    <div style={css("position: relative;")}>
      <button onClick={D.togClientExport} style={css("height: 32px; padding: 0 13px; background: #15803D; color: #fff; border: none; border-radius: 7px; font-size: 12px; font-weight: 500; font-family: inherit; cursor: pointer; display: flex; align-items: center; gap: 6px;")}><Download size={13} />Export for Clients <ChevronDown size={11} /></button>
      {D.clientExportOpen && (
        <div style={css("position: absolute; top: 38px; right: 0; z-index: 70; width: 230px; background: #fff; border: 1px solid #E5E7EB; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,.16); padding: 6px;")}>
          <div style={css("font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #9CA3AF; font-weight: 600; padding: 6px 8px 4px;")}>Rayash branding · no source links</div>
          <Hover onClick={D.clientExportCsv} style={css("display: flex; align-items: center; gap: 10px; padding: 9px 8px; border-radius: 7px; font-size: 13px; color: #374151; cursor: pointer;")} styleHover={css("background:#FAFAFA;")}><FileIcon size={15} stroke="#15803D" /><span style={css("flex:1;")}>CSV</span><span style={css("font-family:'JetBrains Mono',monospace; font-size:11px; color:#9CA3AF;")}>.csv</span></Hover>
          <Hover onClick={D.clientExportXls} style={css("display: flex; align-items: center; gap: 10px; padding: 9px 8px; border-radius: 7px; font-size: 13px; color: #374151; cursor: pointer;")} styleHover={css("background:#FAFAFA;")}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 3v18" /></svg><span style={css("flex:1;")}>Excel</span><span style={css("font-family:'JetBrains Mono',monospace; font-size:11px; color:#9CA3AF;")}>.xlsx</span></Hover>
          <Hover onClick={D.clientExportPdf} style={css("display: flex; align-items: center; gap: 10px; padding: 9px 8px; border-radius: 7px; font-size: 13px; color: #374151; cursor: pointer;")} styleHover={css("background:#FAFAFA;")}><FileIcon size={15} stroke="#B42318" /><span style={css("flex:1;")}>PDF</span><span style={css("font-family:'JetBrains Mono',monospace; font-size:11px; color:#9CA3AF;")}>.pdf</span></Hover>
        </div>
      )}
    </div>
  );
}

export function ExportMenu({ D }: { D: Derived }) {
  return (
    <div style={css("position: relative;")}>
      <button onClick={D.togMapExport} style={css("height: 32px; padding: 0 13px; background: #0A0A0A; color: #fff; border: none; border-radius: 7px; font-size: 12px; font-weight: 500; font-family: inherit; cursor: pointer; display: flex; align-items: center; gap: 6px;")}><Download size={13} />Export <ChevronDown size={11} /></button>
      {D.mapExportOpen && (
        <div style={css("position: absolute; top: 38px; right: 0; z-index: 70; width: 240px; background: #fff; border: 1px solid #E5E7EB; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,.16); padding: 6px;")}>

          {/* ── Internal export ── */}
          <div style={css("font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #9CA3AF; font-weight: 600; padding: 6px 8px 4px;")}>Export all · {D.listCount}</div>
          <Hover onClick={D.exportAllCsv}  style={css("display: flex; align-items: center; gap: 10px; padding: 9px 8px; border-radius: 7px; font-size: 13px; color: #374151; cursor: pointer;")} styleHover={css("background:#FAFAFA;")}><FileIcon size={15} stroke="#15803D" /><span style={css("flex:1;")}>CSV</span><span style={css("font-family:'JetBrains Mono',monospace; font-size:11px; color:#9CA3AF;")}>.csv</span></Hover>
          <Hover onClick={D.exportAllXls}  style={css("display: flex; align-items: center; gap: 10px; padding: 9px 8px; border-radius: 7px; font-size: 13px; color: #374151; cursor: pointer;")} styleHover={css("background:#FAFAFA;")}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 3v18" /></svg><span style={css("flex:1;")}>Excel</span><span style={css("font-family:'JetBrains Mono',monospace; font-size:11px; color:#9CA3AF;")}>.xlsx</span></Hover>
          <Hover onClick={D.exportAllJson} style={css("display: flex; align-items: center; gap: 10px; padding: 9px 8px; border-radius: 7px; font-size: 13px; color: #374151; cursor: pointer;")} styleHover={css("background:#FAFAFA;")}><FileIcon size={15} stroke="#6B7280" /><span style={css("flex:1;")}>JSON</span><span style={css("font-family:'JetBrains Mono',monospace; font-size:11px; color:#9CA3AF;")}>.json</span></Hover>
          <Hover onClick={D.exportAllPdf}  style={css("display: flex; align-items: center; gap: 10px; padding: 9px 8px; border-radius: 7px; font-size: 13px; color: #374151; cursor: pointer;")} styleHover={css("background:#FAFAFA;")}><FileIcon size={15} stroke="#B42318" /><span style={css("flex:1;")}>PDF</span><span style={css("font-family:'JetBrains Mono',monospace; font-size:11px; color:#9CA3AF;")}>.pdf</span></Hover>

          {/* ── Client export ── */}
          <div style={css("border-top: 1px solid #F3F4F6; margin: 4px 0;")}></div>
          <div style={css("font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #15803D; font-weight: 600; padding: 6px 8px 4px;")}>For Clients · Rayash branding</div>
          <Hover onClick={D.clientExportCsv} style={css("display: flex; align-items: center; gap: 10px; padding: 9px 8px; border-radius: 7px; font-size: 13px; color: #374151; cursor: pointer;")} styleHover={css("background:#F0FDF4;")}><FileIcon size={15} stroke="#15803D" /><span style={css("flex:1;")}>CSV — no links</span><span style={css("font-family:'JetBrains Mono',monospace; font-size:11px; color:#9CA3AF;")}>.csv</span></Hover>
          <Hover onClick={D.clientExportXls} style={css("display: flex; align-items: center; gap: 10px; padding: 9px 8px; border-radius: 7px; font-size: 13px; color: #374151; cursor: pointer;")} styleHover={css("background:#F0FDF4;")}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 3v18" /></svg><span style={css("flex:1;")}>Excel — no links</span><span style={css("font-family:'JetBrains Mono',monospace; font-size:11px; color:#9CA3AF;")}>.xlsx</span></Hover>
          <Hover onClick={D.clientExportPdf} style={css("display: flex; align-items: center; gap: 10px; padding: 9px 8px; border-radius: 7px; font-size: 13px; color: #374151; cursor: pointer;")} styleHover={css("background:#F0FDF4;")}><FileIcon size={15} stroke="#B42318" /><span style={css("flex:1;")}>PDF — no links</span><span style={css("font-family:'JetBrains Mono',monospace; font-size:11px; color:#9CA3AF;")}>.pdf</span></Hover>

        </div>
      )}
    </div>
  );
}

function EmptyState({ D, variant }: { D: Derived; variant: "cards" | "rows" | "split" }) {
  if (variant === "cards")
    return (
      <div style={css("padding: 64px 24px; text-align: center;")}>
        <div style={css("font-size: 15px; font-weight: 600; margin-bottom: 4px;")}>No properties match your filters</div>
        <div style={css("font-size: 13px; color: #9CA3AF; margin-bottom: 16px;")}>Try removing a filter, widening price, or switching city.</div>
        <button onClick={D.clearFilters} style={css("height: 34px; padding: 0 16px; background: #0A0A0A; color: #fff; border: none; border-radius: 7px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer;")}>Clear all filters</button>
      </div>
    );
  if (variant === "rows")
    return (
      <div style={css("padding: 64px 24px; text-align: center;")}>
        <div style={css("width: 44px; height: 44px; border-radius: 11px; background: #F3F4F6; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px;")}><Search size={22} stroke="#9CA3AF" /></div>
        <div style={css("font-size: 15px; font-weight: 600; margin-bottom: 4px;")}>No properties match your filters</div>
        <div style={css("font-size: 13px; color: #9CA3AF; margin-bottom: 16px;")}>Try removing a filter, widening price, or switching city.</div>
        <button onClick={D.clearFilters} style={css("height: 34px; padding: 0 16px; background: #0A0A0A; color: #fff; border: none; border-radius: 7px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer;")}>Clear all filters</button>
      </div>
    );
  return (
    <div style={css("padding: 48px 24px; text-align: center;")}><div style={css("font-size: 14px; font-weight: 600; margin-bottom: 4px;")}>No properties found</div><button onClick={D.clearFilters} style={css("margin-top: 10px; height: 32px; padding: 0 14px; background: #0A0A0A; color: #fff; border: none; border-radius: 7px; font-size: 12px; font-weight: 500; font-family: inherit; cursor: pointer;")}>Clear filters</button></div>
  );
}

function CardsView({ D }: { D: Derived }) {
  return (
    <div style={css("flex: 1; overflow-y: auto; padding: 14px;")}>
      <div style={css("display: flex; align-items: center; border: 1px solid #E5E7EB; border-radius: 10px; padding: 12px 18px; margin-bottom: 14px; gap: 0;")}>
        {D.locCounts.map((l, i) => (
          <div key={i} onClick={l.onClick} style={css("flex: 1; cursor: pointer; font-size: 14px;")}><span style={css("color: #15803D; font-weight: 600;")}>{l.name}</span> <span style={css("color: #9CA3AF;")}>({l.count})</span></div>
        ))}
        <span onClick={D.goMap} style={css("font-size: 12px; font-weight: 600; letter-spacing: 0.04em; color: #15803D; cursor: pointer; white-space: nowrap;")}>VIEW ALL LOCATIONS</span>
      </div>
      <div style={css("display: flex; flex-direction: column; gap: 14px;")}>
        {D.list.map((p) => (
          <Hover key={p.id} onClick={p.open} style={css("display: flex; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; cursor: pointer; background: #fff;")} styleHover={css("box-shadow: 0 4px 16px rgba(0,0,0,.07);")}>
            <div style={css("width: 260px; min-width: 260px; position: relative; overflow: hidden; background: #F3F4F6;" + (p.image ? "" : " background-image: repeating-linear-gradient(45deg, #E9EBEE 0, #E9EBEE 1px, transparent 1px, transparent 9px);"))}>
              {p.image ? <img src={p.image} alt={p.title} style={css("width: 100%; height: 100%; object-fit: cover; display: block;")} loading="lazy" /> : <span style={css("position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #B6BAC0;")}>no image</span>}
              <span style={css("position: absolute; top: 10px; left: 10px; display: inline-flex; align-items: center; gap: 4px; background: rgba(255,255,255,.95); border: 1px solid #E5E7EB; border-radius: 6px; padding: 3px 8px; font-size: 11px; font-weight: 600; color: #15803D;")}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l4 4L19 7" /></svg>Verified</span>
              <span style={css("position: absolute; bottom: 10px; left: 10px; display: inline-flex; align-items: center; gap: 5px; background: rgba(0,0,0,.7); border-radius: 6px; padding: 4px 8px;")}><span style={css("font-size: 11px; font-weight: 600; color: #fff;")}>{p.source}</span></span>
              <span onClick={D.stopProp} style={css("position: absolute; bottom: 10px; right: 10px; width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,.95); display: flex; align-items: center; justify-content: center; cursor: pointer;")}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg></span>
            </div>
            <div style={css("flex: 1; min-width: 0; padding: 16px 18px; position: relative;")}>
              {p.isOffPlan && <span style={css("position: absolute; top: 16px; right: 16px; display: inline-flex; align-items: center; gap: 4px; background: #F0FDF4; border: 1px solid #BBF7D0; color: #15803D; border-radius: 999px; padding: 3px 9px; font-size: 11px; font-weight: 600;")}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></svg>Off-Plan</span>}
              <div style={css("font-size: 20px; font-weight: 700; margin-bottom: 10px;")}><span style={css("unicode-bidi:isolate")}>SAR </span>{p.priceLabel}</div>
              <div style={css("display: flex; align-items: center; gap: 14px; font-size: 13px; color: #374151; margin-bottom: 12px;")}>
                <span style={css("font-weight: 500;")}>{p.type}</span>
                <span style={css("color: #E5E7EB;")}>|</span>
                <span style={css("display: inline-flex; align-items: center; gap: 5px;")}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.7"><path d="M2 9V5a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v4" /><path d="M2 11h20v6" /><path d="M4 17v2M20 17v2" /></svg>{p.bedsNum}</span>
                <span style={css("display: inline-flex; align-items: center; gap: 5px;")}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.7"><path d="M4 12V5a2 2 0 0 1 4 0" /><path d="M3 12h18v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" /></svg>{p.bathsNum}</span>
                <span style={css("color: #E5E7EB;")}>|</span>
                <span><span style={css("color: #6B7280;")}>Area:</span> {p.area} Sq. M.</span>
              </div>
              <div style={css("font-size: 15px; font-weight: 600; color: #15803D; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;")}>{p.cardTitle}</div>
              <div style={css("display: flex; align-items: center; gap: 6px; font-size: 13px; color: #6B7280; margin-bottom: 12px;")}><PinMarker size={14} stroke="#9CA3AF" sw={1.7} />{p.location}</div>
              <div style={css("display: inline-flex; align-items: center; gap: 7px; background: #F5F3FF; border-radius: 7px; padding: 6px 11px; font-size: 12px; color: #5B5BD6; margin-bottom: 14px;")}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l2 6 6 .5-4.5 4 1.5 6-5-3.5-5 3.5 1.5-6L4 8.5 10 8z" /></svg>Agent last visited this property on {p.posted}</div>
              <div style={css("display: flex; gap: 10px;")} onClick={D.stopProp}>
                <button style={css("height: 38px; padding: 0 18px; background: #ECFDF5; color: #15803D; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; display: flex; align-items: center; gap: 7px;")}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 6 10-6" /></svg>Email</button>
                <button style={css("height: 38px; padding: 0 18px; background: #ECFDF5; color: #15803D; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; display: flex; align-items: center; gap: 7px;")}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z" /></svg>Call</button>
                <button style={css("height: 38px; width: 44px; background: #ECFDF5; color: #15803D; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;")}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-12 7.5L3 21l2-5.5A8.5 8.5 0 1 1 21 11.5z" /></svg></button>
              </div>
            </div>
          </Hover>
        ))}
        {D.noResults && <EmptyState D={D} variant="cards" />}
      </div>
    </div>
  );
}

function GridView({ D }: { D: Derived }) {
  return (
    <div style={css("flex: 1; overflow-y: auto; padding: 14px; display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; align-content: start;")}>
      {D.list.map((p) => (
        <div key={p.id} onClick={p.open} style={css("border: 1px solid #E5E7EB; border-radius: 10px; overflow: hidden; cursor: pointer; background: #fff;")}>
          <div style={css("height: 140px; position: relative; overflow: hidden; background: #F3F4F6;" + (p.image ? "" : " background-image: repeating-linear-gradient(45deg, #E9EBEE 0, #E9EBEE 1px, transparent 1px, transparent 8px);"))}>
            {p.image ? <img src={p.image} alt={p.title} style={css("width: 100%; height: 100%; object-fit: cover; display: block;")} loading="lazy" /> : <span style={css("position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #B6BAC0;")}>no image</span>}
            <span style={css("position: absolute; top: 8px; left: 8px; background: rgba(255,255,255,.9); border: 1px solid #E5E7EB; border-radius: 5px; padding: 2px 6px; font-size: 10px; color: #374151;")}>{p.status}</span>
            <span style={css("position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,.55); color: #fff; border-radius: 4px; padding: 1px 6px; font-size: 10px;")}>{p.source}</span>
          </div>
          <div style={css("padding: 10px;")}>
            <div style={css("display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 3px;")}><span style={css("font-size: 14px; font-weight: 700;")}><span style={css("unicode-bidi:isolate")}>SAR </span>{p.priceLabel}</span><span style={css("font-size: 11px; color: #9CA3AF;")}>{p.source}</span></div>
            <div style={css("font-size: 13px; font-weight: 500; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;")}>{p.title}</div>
            <div style={css("font-size: 12px; color: #6B7280; margin-bottom: 3px;")}>{p.specs}</div>
            <div style={css("font-size: 12px; color: #9CA3AF;")}>{p.location}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RowsView({ D }: { D: Derived }) {
  return (
    <div style={css("flex: 1; overflow-y: auto;")}>
      {D.list.map((p) => (
        <Hover key={p.id} onClick={p.open} style={css("display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-bottom: 1px solid #F3F4F6; cursor: pointer;")} styleHover={css("background: #FAFAFA;")}>
          <input type="checkbox" onClick={D.stopProp} style={css("accent-color: #16A34A; width: 14px; height: 14px;")} />
          <span style={css("font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #C0C4CA; width: 30px;")}>{p.num}</span>
          <div style={css("width: 44px; height: 44px; min-width: 44px; border-radius: 7px; overflow: hidden; flex-shrink: 0; background: #F3F4F6; background-image: repeating-linear-gradient(45deg, #E9EBEE 0, #E9EBEE 1px, transparent 1px, transparent 7px);")}>{p.image ? <img src={p.image} alt="" style={css("width: 100%; height: 100%; object-fit: cover; display: block;")} loading="lazy" /> : null}</div>
          <div style={css("flex: 1; min-width: 0;")}>
            <div style={css("display: flex; align-items: center; gap: 8px;")}>
              <span style={css("font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;")}>{p.title}</span>
              {p.isOffPlan && <span style={css("font-size: 10px; color: #15803D; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 4px; padding: 1px 5px; white-space: nowrap;")}>Off-Plan</span>}
            </div>
            <div style={css("font-size: 12px; color: #9CA3AF; margin-top: 2px;")}>{p.source} · {p.posted}</div>
          </div>
          <div style={css("width: 150px; min-width: 150px;")}>
            <div style={css("font-size: 14px; font-weight: 700;")}><span style={css("unicode-bidi:isolate")}>SAR </span>{p.priceLabel}</div>
            <div style={css("font-size: 12px; color: #6B7280; margin-top: 2px;")}>{p.specs}</div>
          </div>
          <div style={css("width: 130px; min-width: 130px; font-size: 12px; color: #9CA3AF;")} className="ps-loc">{p.location}</div>
          <div style={css("display: flex; align-items: center; gap: 4px;")} onClick={D.stopProp}>
            {[
              <PinMarker key="m" size={13} stroke="currentColor" />,
              <svg key="w" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-12 7.5L3 21l2-5.5A8.5 8.5 0 1 1 21 11.5z" /></svg>,
              <svg key="c" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z" /></svg>,
              <svg key="cp" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>,
            ].map((icon, i) => (
              <span key={i} style={css("width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border: 1px solid #E5E7EB; border-radius: 6px; color: #6B7280; cursor: pointer;")}>{icon}</span>
            ))}
          </div>
        </Hover>
      ))}
      {D.noResults && <EmptyState D={D} variant="rows" />}
    </div>
  );
}

export function SplitCards({ D }: { D: Derived }) {
  return (
    <div style={css("flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 12px;")}>
      {D.list.map((p) => (<PropertyCard key={p.id} D={D} p={p} />))}
      {D.hasMore && (
        <button onClick={D.loadMore} style={css("width: 100%; height: 38px; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 13px; font-weight: 500; color: #374151; cursor: pointer; font-family: inherit;")}>Load more results</button>
      )}
      {D.noResults && <EmptyState D={D} variant="split" />}
    </div>
  );
}

// Shared card used by Split + Map results panel.
export function PropertyCard({ D, p }: { D: Derived; p: Derived["list"][number] }) {
  return (
    <Hover onClick={p.open} style={css("flex: none; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; cursor: pointer; background: #fff;")} styleHover={css("box-shadow: 0 4px 14px rgba(0,0,0,.07); border-color: #D1D5DB;")}>
      <div style={css("height: 140px; position: relative; overflow: hidden; background: #F3F4F6;" + (p.image ? "" : " background-image: repeating-linear-gradient(45deg, #E9EBEE 0, #E9EBEE 1px, transparent 1px, transparent 8px);"))}>
        {p.image ? <img src={p.image} alt={p.title} style={css("width: 100%; height: 100%; object-fit: cover; display: block;")} loading="lazy" /> : null}
        <span style={css("position: absolute; top: 8px; left: 8px; background: rgba(255,255,255,.95); border: 1px solid #E5E7EB; border-radius: 5px; padding: 2px 7px; font-size: 10px; color: #374151;")}>{p.status}</span>
        <span style={css("border-radius: 5px; padding: 2px 7px; font-size: 10px; font-weight: 600; position:absolute; bottom: 8px; left: 8px; " + p.freshStyle)}>{p.freshLabel}</span>
        <span onClick={(e) => { e.stopPropagation(); p.toggleSave(e as unknown as import("react").MouseEvent); }} style={css(p.saveBox + " z-index: 10;")}><svg width="13" height="13" viewBox="0 0 24 24" fill={p.saveFill} stroke="currentColor" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg></span>
      </div>
      <div style={css("padding: 11px 13px;")}>
        <div style={css("display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px;")}><span style={css("font-size: 16px; font-weight: 700;")}><span style={css("unicode-bidi:isolate")}>SAR </span>{p.priceLabel}</span><span style={css("font-size: 11px; color: #9CA3AF;")}>{p.source}</span></div>
        <div style={css("font-size: 11px; color: #16A34A; font-weight: 500; margin-bottom: 4px;")}>{p.ppsm}</div>
        <div style={css("font-size: 13px; font-weight: 600; color: #15803D; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;")}>{p.title}</div>
        <div style={css("font-size: 12px; color: #6B7280; margin-bottom: 3px;")}>{p.specs}</div>
        <div style={css("font-size: 12px; color: #9CA3AF; margin-bottom: 10px;")}>{p.location}</div>
        <div style={css("display: flex; gap: 6px;")} onClick={D.stopProp}>
          <button style={css("flex: 1; height: 30px; background: #ECFDF5; color: #15803D; border: none; border-radius: 7px; font-size: 12px; font-weight: 600; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;")}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z" /></svg>Call</button>
          <button style={css("flex: 1; height: 30px; background: #ECFDF5; color: #15803D; border: none; border-radius: 7px; font-size: 12px; font-weight: 600; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;")}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-12 7.5L3 21l2-5.5A8.5 8.5 0 1 1 21 11.5z" /></svg>WhatsApp</button>
          <a href={p.shareUrl} target="_blank" rel="noreferrer" title="Share on WhatsApp" style={css("width: 38px; height: 30px; background: #fff; color: #15803D; border: 1px solid #E5E7EB; border-radius: 7px; cursor: pointer; display: flex; align-items: center; justify-content: center; text-decoration: none;")}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" /></svg></a>
        </div>
      </div>
    </Hover>
  );
}

function SheetView({ D }: { D: Derived }) {
  const cols = "56px 60px 240px 120px 110px 64px 64px 96px 180px 100px 96px";
  return (
    <div style={css("flex: 1; overflow: auto;")}>
      <div style={css(`display: grid; grid-template-columns: ${cols}; min-width: 1140px; align-items: center; padding: 0 14px; height: 38px; border-bottom: 1px solid #E5E7EB; background: #FAFAFA; font-size: 11px; color: #6B7280; font-weight: 600; position: sticky; top: 0;`)}>
        <span>#</span><span>Image</span><span>Title</span><span>Source</span><span>Price ↕</span><span>Beds ↕</span><span>Baths</span><span>Area ↕</span><span>Location</span><span>Added</span><span>Status</span>
      </div>
      {D.sheetRows.map((p) => (
        <Hover key={p.id} onClick={p.open} style={css(`display: grid; grid-template-columns: ${cols}; min-width: 1140px; align-items: center; padding: 0 14px; height: 48px; border-bottom: 1px solid #F3F4F6; font-size: 12px; cursor: pointer;`)} styleHover={css("background: #FAFAFA;")}>
          <span style={css("font-family: 'JetBrains Mono', monospace; color: #C0C4CA;")}>{p.num}</span>
          <span style={css("width: 38px; height: 28px; border-radius: 5px; overflow: hidden; background: #F3F4F6; background-image: repeating-linear-gradient(45deg, #E9EBEE 0, #E9EBEE 1px, transparent 1px, transparent 6px); flex-shrink: 0; display: inline-block;")}>{p.images?.[0] ? <img src={p.images[0]} alt="" style={css("width: 100%; height: 100%; object-fit: cover; display: block; border-radius: 5px;")} loading="lazy" /> : null}</span>
          <span style={css("font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 8px;")}>{p.title}</span>
          <span style={css("color: #6B7280;")}>{p.source}</span>
          <span style={css("font-weight: 700;")}><span style={css("unicode-bidi:isolate")}>SAR </span>{p.priceLabel}</span>
          <span style={css("color: #374151;")}>{p.beds}</span>
          <span style={css("color: #374151;")}>{p.baths}</span>
          <span style={css("color: #374151;")}>{p.area} m²</span>
          <span style={css("color: #9CA3AF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 8px;")}>{p.location}</span>
          <span style={css("color: #9CA3AF;")}>{p.posted}</span>
          <span style={css("color: #374151;")}>{p.status}</span>
        </Hover>
      ))}
      <div style={css("display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; font-size: 12px; color: #6B7280;")}>
        <span>Showing <span style={css("color: #374151; font-weight: 500;")}>1–{D.listCount}</span> of {D.statTotal}</span>
        <div style={css("display: flex; gap: 4px; align-items: center;")}>
          <span style={css("width: 28px; height: 26px; display: flex; align-items: center; justify-content: center; border: 1px solid #E5E7EB; border-radius: 6px; cursor: pointer; color: #9CA3AF;")}>‹</span>
          <span style={css("width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border: 1px solid #0A0A0A; background: #0A0A0A; color: #fff; border-radius: 6px; cursor: pointer;")}>1</span>
          <span style={css("width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border: 1px solid #E5E7EB; border-radius: 6px; cursor: pointer; color: #374151;")}>2</span>
          <span style={css("width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border: 1px solid #E5E7EB; border-radius: 6px; cursor: pointer; color: #374151;")}>3</span>
          <span style={css("color: #9CA3AF; padding: 0 4px;")}>…</span>
          <span style={css("width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border: 1px solid #E5E7EB; border-radius: 6px; cursor: pointer; color: #374151;")}>77</span>
          <span style={css("width: 28px; height: 26px; display: flex; align-items: center; justify-content: center; border: 1px solid #E5E7EB; border-radius: 6px; cursor: pointer; color: #374151;")}>›</span>
        </div>
      </div>
    </div>
  );
}

function StatsView({ D }: { D: Derived }) {
  return (
    <div style={css("flex: 1; overflow-y: auto; padding: 18px;")}>
      <div style={css("display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 18px;")}>
        {[["Total", D.statTotal], ["Avg Price", D.statAvgPrice], ["Avg Area", D.statAvgArea], ["Top Source", D.statTopSource]].map(([l, v], i) => (
          <div key={i} style={css("border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px;")}><div style={css("font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;")}>{l}</div><div style={css("font-size: 24px; font-weight: 700;")}>{v}</div></div>
        ))}
      </div>
      <div style={css("display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px;")}>
        <div style={css("border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px;")}>
          <div style={css("font-size: 13px; font-weight: 600; margin-bottom: 16px;")}>Price Distribution</div>
          <div style={css("display: flex; align-items: flex-end; gap: 14px; height: 160px; padding-bottom: 4px;")}>
            {D.priceBars.map((b, i) => (
              <div key={i} style={css("flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; justify-content: flex-end; height: 100%;")}>
                <span style={css("font-size: 11px; color: #6B7280;")}>{b.n}</span>
                <div style={css(b.barStyle)}></div>
                <span style={css("font-size: 11px; color: #9CA3AF;")}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={css("border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px;")}>
          <div style={css("font-size: 13px; font-weight: 600; margin-bottom: 16px;")}>Source Platform Breakdown</div>
          <div style={css("display: flex; flex-direction: column; gap: 11px;")}>
            {D.srcBars.map((b, i) => (
              <div key={i} style={css("display: flex; align-items: center; gap: 10px;")}>
                <span style={css("width: 92px; font-size: 12px; color: #374151;")}>{b.label}</span>
                <div style={css("flex: 1; background: #F3F4F6; border-radius: 5px; height: 9px;")}><div style={css(b.barStyle)}></div></div>
                <span style={css("width: 24px; font-size: 12px; color: #9CA3AF; text-align: right;")}>{b.n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={css("border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden;")}>
        <div style={css("display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr 1.2fr; padding: 11px 14px; background: #FAFAFA; font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid #E5E7EB;")}>
          <span>District</span><span>Properties</span><span>Avg Price</span><span>Avg m²</span><span>Common Type</span>
        </div>
        {D.distRows.map((r, i) => (
          <div key={i} style={css(r.style)}><span style={css("font-weight: 500;")}>{r.d}</span><span style={css("color: #374151;")}>{r.n}</span><span style={css("color: #374151;")}>{r.avgP}</span><span style={css("color: #374151;")}>{r.avgA}</span><span style={css("color: #6B7280;")}>{r.mct}</span></div>
        ))}
      </div>
    </div>
  );
}

// Hidden in this Hero variant (resultsSidebarShown is always false), kept for fidelity.
function ResultsSidebar({ D }: { D: Derived }) {
  return (
    <div style={css("width: 240px; min-width: 240px; border-right: 1px solid #E5E7EB; display: flex; flex-direction: column; background: #fff;")}>
      <div style={css("flex: 1; overflow-y: auto; padding: 14px;")}>
        <div style={css("font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #9CA3AF; font-weight: 600; margin-bottom: 10px;")}>New Query</div>
        <div style={css("font-size: 11px; font-weight: 600; color: #374151; margin-bottom: 7px;")}>Property Type</div>
        <div style={css("display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px;")}>
          {D.typeOptions.map((t, i) => (
            <label key={i} onClick={t.onToggle} style={css("display: flex; align-items: center; gap: 8px; font-size: 13px; color: #374151; cursor: pointer;")}>
              <span style={css(t.boxStyle)}>{t.checked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><path d="M5 12l4 4L19 7" /></svg>}</span>
              <span style={css("flex: 1;")}>{t.name}</span><span style={css("font-size: 11px; color: #9CA3AF;")}>{t.count}</span>
            </label>
          ))}
        </div>
      </div>
      <div style={css("padding: 12px 14px; border-top: 1px solid #E5E7EB;")}>
        <button onClick={D.applySearch} style={css("width: 100%; height: 34px; background: #0A0A0A; color: #fff; border: none; border-radius: 7px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer;")}>Search</button>
      </div>
    </div>
  );
}
