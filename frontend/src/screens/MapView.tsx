import { css } from "../lib/css";
import type { Derived } from "../store/useDerived";
import { ChevronDown, ChevronLeft, ChevronRight, Download, Heart, LogoPin, PinMarker, Search } from "../components/icons";
import { ExportMenu, PropertyCard } from "./Results";
import { AreaPopover, BedsBathsPopover, PlatformPopover, PricePopover, TypePopover } from "./Home";
import { LeafletMap } from "../components/LeafletMap";
import { useStore } from "../store/useStore";
import { useCallback, useMemo } from "react";

export function MapView({ D }: { D: Derived }) {
  const onSelectPin = useCallback((id: string) => {
    useStore.getState().setState({ mapPin: id, selectedId: id });
  }, []);
  const onPinDrop = useCallback((lat: number, lng: number) => {
    useStore.getState().onPinDrop(lat, lng);
  }, []);

  // Keep searchPinForMap stable across renders so the Leaflet effect only fires on real changes
  const searchPinForMap = useMemo(
    () => D.searchPinForMap,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [D.searchPinForMap?.lat, D.searchPinForMap?.lng, D.searchPinForMap?.radius, D.searchPinForMap?.label]
  );

  // Dispatch custom zoom events — LeafletMap listens for these
  const zoomIn = useCallback(() => window.dispatchEvent(new CustomEvent("ps-zoom", { detail: 1 })), []);
  const zoomOut = useCallback(() => window.dispatchEvent(new CustomEvent("ps-zoom", { detail: -1 })), []);

  return (
    <div style={css("height: 100vh; display: flex; flex-direction: column; overflow: hidden;")}>
      {/* top app bar */}
      <div className="ps-topbar" style={css("height: 48px; min-height: 48px; border-bottom: 1px solid #E5E7EB; display: flex; align-items: center; padding: 0 14px; gap: 14px; background: #fff;")}>
        <div onClick={D.goHome} style={css("display: flex; align-items: center; gap: 6px; cursor: pointer; padding-right: 14px; border-right: 1px solid #E5E7EB; height: 100%;")}>
          <LogoPin size={18} sw={1.8} stroke="#0A0A0A" />
          <span style={css("font-size: 13px; font-weight: 500;")}>propscan</span>
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
          <svg style={css("position: absolute; left: 9px;")} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
          <input placeholder="Search within…" value={D.searchWithin} onChange={D.onSearchWithin} style={css("height: 32px; border: 1px solid #E5E7EB; border-radius: 7px; padding: 0 10px 0 28px; font-size: 12px; font-family: inherit; width: 160px;")} />
        </div>
        <ExportMenu D={D} />
      </div>

      <div className="ps-row" style={css("flex: 1; display: flex; overflow: hidden;")}>
        {D.mapSidebarOpen && <MapSidebar D={D} />}
        {D.mapSidebarClosed && (
          <div onClick={D.toggleMapSidebar} style={css("position: absolute; top: 60px; left: 14px; z-index: 25; display: flex; align-items: center; gap: 7px; background: #fff; border: 1px solid #E5E7EB; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.1); padding: 8px 12px; font-size: 12px; font-weight: 500; color: #374151; cursor: pointer;")}><Search size={14} stroke="#16A34A" sw={1.9} />Search panel</div>
        )}

        {/* map */}
        <div className="ps-mapcol" style={css(D.mapBgStyle)}>
          <LeafletMap
            city={D.city}
            mapSat={D.mapSat}
            selectedId={D.selectedId ?? undefined}
            pins={D.mapPins}
            onSelectPin={onSelectPin}
            searchPin={searchPinForMap}
            pinMode={D.pinMode}
            onPinDrop={onPinDrop}
          />
          {/* drop hint label (pin mode) — pointer-events:none so Leaflet receives the click */}
          {D.pinMode && (
            <div style={css("position: absolute; top: 56px; left: 50%; transform: translateX(-50%); z-index: 16; background: #0A0A0A; color: #fff; border-radius: 999px; padding: 7px 14px; font-size: 12px; font-weight: 500; pointer-events: none; box-shadow: 0 2px 8px rgba(0,0,0,.2);")} >Click anywhere on the map to drop your pin</div>
          )}
          {/* right control rail */}
          <div style={css("position: absolute; top: 14px; right: 14px; z-index: 22; display: flex; flex-direction: column; border: 1px solid #E5E7EB; border-radius: 10px; overflow: hidden; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,.08);")}>
            <span onClick={zoomIn} title="Zoom in" style={css("width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer; border-bottom: 1px solid #F3F4F6; font-size: 18px; color: #374151;")}>+</span>
            <span onClick={zoomOut} title="Zoom out" style={css("width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer; border-bottom: 1px solid #E5E7EB; font-size: 18px; color: #374151;")}>−</span>
            <span onClick={D.myLocation} title="My location" style={css("width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer; border-bottom: 1px solid #F3F4F6; color: #374151;")}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 11l19-9-9 19-2-8-8-2z" /></svg></span>
            <span onClick={D.togPinMode} title="Drop a pin" style={css(D.railPinStyle)}><PinMarker size={17} /></span>
            <span onClick={D.toggleSatellite} title="Toggle satellite" style={css(D.railSatStyle)}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 2a10 10 0 0 1 0 20M12 2a10 10 0 0 0 0 20M2 12h20M4 6h16M4 18h16" /></svg></span>
            <span title="Fullscreen" style={css("width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #374151;")}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg></span>
          </div>
          {/* selected pin popup card — click anywhere to open detail */}
          {D.mapPinOpen && (
            <div onClick={D.mapPinProp.open} style={css("position: absolute; bottom: 18px; left: 50%; transform: translateX(-50%); width: 360px; max-width: calc(100% - 32px); background: #fff; border: 1px solid #E5E7EB; border-radius: 14px; box-shadow: 0 8px 32px rgba(0,0,0,.18); overflow: hidden; z-index: 20; cursor: pointer;")}>
              {/* close button — stops propagation so it doesn't open detail */}
              <div onClick={(e) => { e.stopPropagation(); D.closeMapPin(); }} style={css("position: absolute; top: 8px; right: 8px; width: 26px; height: 26px; border-radius: 50%; background: rgba(255,255,255,.92); border: 1px solid #E5E7EB; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 2; box-shadow: 0 1px 4px rgba(0,0,0,.1);")}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.2"><path d="M18 6L6 18M6 6l12 12" /></svg></div>
              <div style={css("display: flex; gap: 0; height: 112px;")}>
                {/* image or placeholder */}
                <div style={css("width: 120px; min-width: 120px; position: relative; overflow: hidden; background: #F3F4F6;")}>
                  {D.mapPinProp.image
                    ? <img src={D.mapPinProp.image} alt="" style={css("width: 100%; height: 100%; object-fit: cover;")} />
                    : <div style={css("width: 100%; height: 100%; background: linear-gradient(135deg, #E9EBEE 25%, #F3F4F6 50%, #E9EBEE 75%);")}></div>
                  }
                  <span style={css("position: absolute; top: 7px; left: 7px; background: rgba(255,255,255,.92); border: 1px solid #E5E7EB; border-radius: 5px; padding: 1px 6px; font-size: 10px; color: #374151; font-weight: 500;")}>{D.mapPinProp.status}</span>
                </div>
                {/* details */}
                <div style={css("flex: 1; min-width: 0; padding: 11px 14px; display: flex; flex-direction: column; justify-content: space-between;")}>
                  <div>
                    <div style={css("font-size: 17px; font-weight: 800; margin-bottom: 1px; letter-spacing: -0.01em;")}><span style={css("unicode-bidi:isolate")}>SAR </span>{D.mapPinProp.priceLabel}</div>
                    <div style={css("font-size: 12px; font-weight: 500; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #111827;")}>{D.mapPinProp.title}</div>
                    <div style={css("font-size: 11px; color: #6B7280;")}>{D.mapPinProp.specs}</div>
                    <div style={css("font-size: 11px; color: #9CA3AF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;")}>{D.mapPinProp.location}</div>
                  </div>
                  <div style={css("display: flex; align-items: center; justify-content: space-between;")}>
                    <span style={css("font-size: 10px; font-weight: 600; color: #16A34A; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 999px; padding: 2px 7px;")}>{D.mapPinProp.source}</span>
                    <span style={css("font-size: 11px; color: #16A34A; font-weight: 600; display: flex; align-items: center; gap: 3px;")}>View details <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* PIN SEARCH popup */}
          {D.pinPopOpen && <PinSearchPopup D={D} />}
          {/* map / satellite toggle */}
          <div style={css("position: absolute; bottom: 14px; right: 14px; display: flex; align-items: center; gap: 2px; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,.08);")}>
            <div onClick={D.setMapPlain} style={css(D.mapModeStyle)}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 4l6 2 6-2v14l-6 2-6-2-6 2V6z" /><path d="M9 4v14M15 6v14" /></svg>Map</div>
            <div onClick={D.setMapSat} style={css(D.satModeStyle)}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>Satellite</div>
          </div>
          <div style={css("position: absolute; top: 14px; left: 14px; background: rgba(255,255,255,.92); border: 1px solid #E5E7EB; border-radius: 6px; padding: 5px 10px; font-size: 12px; color: #374151; font-weight: 500; z-index: 10;")}>{D.city} · {D.statTotal} properties{D.isSearching ? " (loading…)" : ""}</div>
        </div>

        {/* right results cards panel */}
        {D.mapCardsOpen && <CardsPanel D={D} />}
        {D.mapCardsClosed && (
          <div onClick={D.toggleMapCards} style={css("position: absolute; top: 60px; right: 14px; z-index: 25; display: flex; align-items: center; gap: 7px; background: #fff; border: 1px solid #E5E7EB; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.1); padding: 8px 12px; font-size: 12px; font-weight: 500; color: #374151; cursor: pointer;")}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.9"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>{D.statTotal} results</div>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={css("border: 1px solid #F3F4F6; border-radius: 12px; overflow: hidden; background: #fff;")}>
      <div style={css("height: 130px; background: linear-gradient(90deg, #F3F4F6 25%, #E9EBEE 50%, #F3F4F6 75%); background-size: 200% 100%; animation: ps-shimmer 1.4s ease-in-out infinite;")}></div>
      <div style={css("padding: 12px 14px; display: flex; flex-direction: column; gap: 8px;")}>
        <div style={css("height: 18px; width: 60%; border-radius: 4px; background: linear-gradient(90deg, #F3F4F6 25%, #E9EBEE 50%, #F3F4F6 75%); background-size: 200% 100%; animation: ps-shimmer 1.4s ease-in-out infinite;")}></div>
        <div style={css("height: 13px; width: 80%; border-radius: 4px; background: linear-gradient(90deg, #F3F4F6 25%, #E9EBEE 50%, #F3F4F6 75%); background-size: 200% 100%; animation: ps-shimmer 1.4s ease-in-out infinite;")}></div>
        <div style={css("height: 13px; width: 50%; border-radius: 4px; background: linear-gradient(90deg, #F3F4F6 25%, #E9EBEE 50%, #F3F4F6 75%); background-size: 200% 100%; animation: ps-shimmer 1.4s ease-in-out infinite;")}></div>
      </div>
    </div>
  );
}

function CardsPanel({ D }: { D: Derived }) {
  const showSkeleton = D.isSearching && D.list.length === 0;
  const platformEntries = Object.entries(D.platformStatus);

  return (
    <div className="ps-cardspanel" style={css("width: 360px; min-width: 360px; border-left: 1px solid #E5E7EB; display: flex; flex-direction: column; background: #fff;")}>
      {/* Header row — fixed height, all controls */}
      <div style={css("height: 46px; min-height: 46px; display: flex; align-items: center; gap: 6px; padding: 0 10px 0 14px; border-bottom: 1px solid #E5E7EB;")}>
        <span style={css("font-size: 13px; font-weight: 700; white-space: nowrap;")}>{D.statTotal}</span>
        <span style={css("font-size: 12px; color: #9CA3AF; white-space: nowrap;")}>results</span>
        <div style={css("flex: 1;")}></div>
        {/* Saved toggle — icon only */}
        <span onClick={D.toggleSavedOnly} title={`Saved (${D.savedCount})`} style={css("display: flex; align-items: center; gap: 3px; padding: 4px 7px; border-radius: 6px; border: 1px solid #E5E7EB; cursor: pointer; font-size: 11px; font-weight: 500; color: #374151;")}><Heart size={12} fill={D.savedToggleFill} />{D.savedCount}</span>
        {/* Sort */}
        <div style={css("position: relative;")}>
          <span onClick={D.togSort} style={css("display: flex; align-items: center; gap: 3px; padding: 4px 7px; border-radius: 6px; border: 1px solid #E5E7EB; cursor: pointer; font-size: 11px; color: #374151; white-space: nowrap;")}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M7 12h10M11 18h2" /></svg>
            Sort
            <ChevronDown size={10} />
          </span>
          {D.popSort && (
            <div style={css("position: absolute; top: 30px; right: 0; z-index: 60; width: 180px; background: #fff; border: 1px solid #E5E7EB; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,.16); padding: 6px;")}>
              {D.sortOptions.map((o, i) => (<div key={i} onClick={o.onClick} style={css(o.style)}>{o.label}</div>))}
            </div>
          )}
        </div>
        {/* Export */}
        <span onClick={D.exportCardsCsv} title="Export CSV" style={css("display: flex; align-items: center; gap: 3px; padding: 4px 7px; border-radius: 6px; border: 1px solid #E5E7EB; cursor: pointer; font-size: 11px; font-weight: 600; color: #15803D; white-space: nowrap;")}>
          <Download size={12} sw={2} />CSV
        </span>
        {/* Close */}
        <span onClick={D.toggleMapCards} title="Hide results" style={css("width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border: 1px solid #E5E7EB; border-radius: 6px; color: #6B7280; cursor: pointer; flex-shrink: 0;")}><ChevronRight size={14} sw={1.9} /></span>
      </div>
      {/* Platform status strip */}
      {platformEntries.length > 0 && (
        <div style={css("display: flex; align-items: center; gap: 6px; padding: 5px 14px; border-bottom: 1px solid #F3F4F6; flex-wrap: wrap; background: #FAFAFA;")}>
          {platformEntries.map(([name, status]) => (
            <span key={name} style={css("display: inline-flex; align-items: center; gap: 3px; font-size: 10px;")}>
              {status === "loading"
                ? <span style={css("display:inline-block; width:7px; height:7px; border-radius:50%; border:1.5px solid #16A34A; border-top-color:transparent; animation:ps-spin 0.7s linear infinite;")}></span>
                : status === "done"
                ? <span style={css("color:#16A34A; font-size:11px; line-height:1;")}>✓</span>
                : <span style={css("color:#EF4444; font-size:11px; line-height:1;")}>✗</span>}
              <span style={css(status === "loading" ? "color:#374151;font-weight:500;" : status === "done" ? "color:#16A34A;" : "color:#EF4444;")}>{name.replace("Property Finder","PF")}</span>
              {status === "done" && D.platformCounts[name] != null && (
                <span style={css("color:#9CA3AF;")}>{D.platformCounts[name].toLocaleString()}</span>
              )}
            </span>
          ))}
        </div>
      )}
      {D.compareBarOpen && (
        <div style={css("display: flex; align-items: center; gap: 9px; padding: 9px 14px; border-bottom: 1px solid #E5E7EB; background: #0A0A0A;")}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8"><path d="M16 3h5v5M21 3l-7 7M8 21H3v-5M3 21l7-7" /></svg>
          <span style={css("flex: 1; font-size: 12px; color: #fff;")}><span style={css("font-weight: 700;")}>{D.compareCount}</span> selected to compare</span>
          <span onClick={D.clearCompare} style={css("font-size: 12px; color: #9CA3AF; cursor: pointer;")}>Clear</span>
          <button onClick={D.openCompare} style={css("height: 28px; padding: 0 13px; background: #16A34A; color: #fff; border: none; border-radius: 7px; font-size: 12px; font-weight: 600; font-family: inherit; cursor: pointer;")}>Compare →</button>
        </div>
      )}
      {/* Scanning progress bar */}
      {D.isSearching && <div style={css("height: 3px; background: #F3F4F6; overflow: hidden; flex-shrink: 0;")}><div style={css("height: 100%; width: 40%; background: #16A34A; animation: ps-scan 1.6s linear infinite;")}></div></div>}
      <div style={css("flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 12px;")}>
        {showSkeleton
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          : D.list.map((p) => (<PropertyCard key={p.id} D={D} p={p} />))
        }
        {D.hasMore && !showSkeleton && (
          <button onClick={D.loadMore} style={css("width: 100%; height: 38px; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 13px; font-weight: 500; color: #374151; cursor: pointer; font-family: inherit;")}>Load more results</button>
        )}
        {D.noResults && (
          <div style={css("padding: 48px 24px; text-align: center;")}>
            <div style={css("font-size: 14px; font-weight: 600; margin-bottom: 4px;")}>No properties found</div>
            <div style={css("font-size: 12px; color: #9CA3AF; margin-bottom: 14px;")}>Try widening your filters or area.</div>
            <button onClick={D.clearFilters} style={css("height: 32px; padding: 0 14px; background: #fff; color: #111827; border: 1px solid #E5E7EB; border-radius: 7px; font-size: 12px; font-weight: 500; font-family: inherit; cursor: pointer;")}>Clear filters</button>
          </div>
        )}
      </div>
    </div>
  );
}

function PinSearchPopup({ D }: { D: Derived }) {
  return (
    <div style={css("position: fixed; top: 70px; left: 50%; transform: translateX(-50%); z-index: 60; width: 720px; max-width: calc(100vw - 40px); background: #fff; border: 1px solid #E5E7EB; border-radius: 14px; box-shadow: 0 14px 40px rgba(0,0,0,.22); padding: 16px 18px;")}>
      <div style={css("display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px;")}>
        <div>
          <div style={css("display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; color: #15803D; margin-bottom: 2px;")}><PinMarker size={12} sw={2} />PIN SEARCH · {D.pinCoords}</div>
          <div style={css("font-size: 17px; font-weight: 700; letter-spacing: -0.02em;")}>What to find here?</div>
        </div>
        <span onClick={D.closePinPop} style={css("cursor: pointer; color: #9CA3AF;")}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg></span>
      </div>
      {/* row 1 */}
      <div style={css("display: flex; align-items: center; gap: 8px; margin-bottom: 8px;")}>
        <div style={css("display: flex; border: 1px solid #E5E7EB; border-radius: 7px; overflow: hidden; height: 36px;")}><div onClick={D.setBuy} style={css(D.buyStyle)}>Buy</div><div onClick={D.setRent} style={css(D.rentStyle)}>Rent</div></div>
        <div style={css("flex: 1; font-size: 12px; color: #9CA3AF; padding-left: 4px;")}>Searching at dropped pin · {D.pinRadiusLabel} radius</div>
        <button onClick={D.doPinSearch} style={css("height: 36px; padding: 0 20px; background: #16A34A; color: #fff; border: none; border-radius: 7px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer; display: flex; align-items: center; gap: 6px; white-space: nowrap;")}><Search size={14} />Search</button>
      </div>
      {/* row 2 */}
      <div style={css("display: flex; align-items: center; gap: 8px; margin-bottom: 12px;")}>
        {D.purposeBuy && (
          <div style={css("display: flex; border: 1px solid #E5E7EB; border-radius: 7px; overflow: hidden; height: 36px; flex: none;")}><div onClick={D.setStAll} style={css(D.stAllStyle)}>All</div><div onClick={D.setStReady} style={css(D.stReadyStyle)}>Ready</div><div onClick={D.setStOff} style={css(D.stOffStyle)}>Off-Plan</div></div>
        )}
        {D.purposeRent && (
          <div style={css("position: relative; flex: 1;")}>
            <div onClick={D.togRentP} style={css(D.trigStyle + "; height: 36px;")}><span style={css(D.rentPColor)}>{D.rentPLabel}</span> <ChevronDown size={11} stroke="#9CA3AF" /></div>
            {D.popRentP && <div style={css("position: absolute; top: 40px; left: 0; z-index: 60; width: 180px; background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.16); padding: 6px;")}>{D.rentPOpts.map((o, i) => (<div key={i} onClick={o.onClick} style={css(o.style)}>{o.label}</div>))}</div>}
          </div>
        )}
        <div style={css("position: relative; flex: 1;")}>
          <div onClick={D.togPType} style={css(D.trigStyle + "; height: 36px;")}><span style={css(D.pTypeColor)}>{D.pTypeLabel}</span> <ChevronDown size={11} stroke="#9CA3AF" /></div>
          {D.popPType && <TypePopover D={D} width={380} align="left" />}
        </div>
        {D.resMode && (
          <div style={css("position: relative; flex: 1;")}>
            <div onClick={D.togBedsBaths} style={css(D.trigStyle + "; height: 36px;")}><span style={css(D.bbColor)}>{D.bedsBathsLabel}</span> <ChevronDown size={11} stroke="#9CA3AF" /></div>
            {D.popBedsBaths && <BedsBathsPopover D={D} align="left" />}
          </div>
        )}
        {D.comMode && (
          <div style={css("position: relative; flex: 1;")}>
            <div onClick={D.togPArea} style={css(D.trigStyle + "; height: 36px;")}><span style={css(D.pAreaColor)}>{D.pAreaLabel}</span> <ChevronDown size={11} stroke="#9CA3AF" /></div>
            {D.popPArea && <AreaPopover D={D} align="left" />}
          </div>
        )}
        <div style={css("position: relative; flex: 1;")}>
          <div onClick={D.togPPrice} style={css(D.trigStyle + "; height: 36px;")}><span style={css(D.pPriceColor)}>{D.pPriceLabel}</span> <ChevronDown size={11} stroke="#9CA3AF" /></div>
          {D.popPPrice && <PricePopover D={D} align="right" />}
        </div>
        <div style={css("position: relative; flex: 1;")}>
          <div onClick={D.togPlatform} style={css(D.trigStyle + "; height: 36px;")}><span style={css(D.platformColor)}>{D.platformLabel}</span> <ChevronDown size={11} stroke="#9CA3AF" /></div>
          {D.popPlatform && <PlatformPopover D={D} align="right" />}
        </div>
      </div>
      {/* radius row */}
      <div style={css("display: flex; align-items: center; gap: 12px; padding-top: 12px; border-top: 1px solid #F3F4F6;")}>
        <span style={css("font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #9CA3AF; font-weight: 600; white-space: nowrap;")}>Radius</span>
        <input type="range" min={1} max={100} value={D.pinRadius} onChange={D.onPinRadius} style={css("flex: 1; accent-color: #16A34A;")} />
        <div style={css("display: flex; gap: 6px;")}>{D.pinRadiusChips.map((r, i) => (<span key={i} onClick={r.onClick} style={css(r.style)}>{r.label}</span>))}</div>
        <span style={css("font-size: 13px; font-weight: 600; color: #15803D; white-space: nowrap;")}>{D.pinRadiusLabel}</span>
      </div>
      <button onClick={D.doPinSearch} style={css("width: 100%; height: 42px; margin-top: 14px; background: #16A34A; color: #fff; border: none; border-radius: 9px; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;")}><Search size={16} />Search Property</button>
    </div>
  );
}

// Hidden in this Hero variant (mapSidebarOpen is always false), kept for fidelity.
function MapSidebar({ D }: { D: Derived }) {
  return (
    <div className="ps-mapside" style={css("width: 312px; min-width: 312px; border-right: 1px solid #E5E7EB; display: flex; flex-direction: column; background: #fff;")}>
      <div style={css("padding: 14px 14px 0;")}>
        <div style={css("display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;")}>
          <span style={css("font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #9CA3AF; font-weight: 600;")}>Find Property</span>
          <span onClick={D.toggleMapSidebar} title="Hide panel" style={css("width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border: 1px solid #E5E7EB; border-radius: 6px; color: #6B7280; cursor: pointer;")}><ChevronLeft size={14} sw={1.9} /></span>
        </div>
        <div onClick={D.togPinMode} style={css("display: flex; align-items: center; gap: 10px; background: #0A0A0A; color: #fff; border-radius: 9px; padding: 10px 12px; cursor: pointer; margin-bottom: 14px;")}><PinMarker size={18} sw={1.7} /><div style={css("flex: 1;")}><div style={css("font-size: 13px; font-weight: 600;")}>Search from map</div><div style={css("font-size: 11px; color: rgba(255,255,255,.6);")}>Drop a pin, pick filters</div></div></div>
      </div>
      <div style={css("flex: 1; overflow-y: auto; padding: 0 14px 14px;")}>
        <div style={css("font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #9CA3AF; font-weight: 600; margin-bottom: 8px;")}>Purpose</div>
        <div style={css("display: flex; border: 1px solid #E5E7EB; border-radius: 7px; overflow: hidden; height: 34px; margin-bottom: 12px;")}>
          <div onClick={D.setBuy} style={css(D.buyStyle)}>Buy</div>
          <div onClick={D.setRent} style={css(D.rentStyle)}>Rent</div>
        </div>
        <div style={css("font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #9CA3AF; font-weight: 600; margin-bottom: 8px;")}>Property type</div>
        <div style={css("display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 12px;")}>
          {D.mapTypeChips.map((t, i) => (<span key={i} onClick={t.onClick} style={css(t.style)}>{t.label}</span>))}
        </div>
        <div style={css("font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #9CA3AF; font-weight: 600; margin-bottom: 8px;")}>Platform</div>
        <div style={css("display: flex; gap: 5px; flex-wrap: wrap;")}>{D.platformChips.map((p, i) => (<span key={i} onClick={p.onClick} style={css(p.style)}>{p.label}</span>))}</div>
      </div>
      <div style={css("padding: 12px 14px; border-top: 1px solid #E5E7EB;")}>
        <button onClick={D.applySearch} style={css("width: 100%; height: 42px; background: #16A34A; color: #fff; border: none; border-radius: 9px; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;")}><Search size={16} />Search Property</button>
      </div>
    </div>
  );
}
