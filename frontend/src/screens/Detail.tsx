import { css } from "../lib/css";
import type { Derived } from "../store/useDerived";
import { Hover } from "../components/Hover";
import { DetailMap } from "../components/DetailMap";
import { ArrowUpRight, ChevronLeft, ChevronRight, Download, ChevronDown, Email, Heart, PinMarker, Phone, Share, WhatsApp } from "../components/icons";

type DetailType = Derived["detail"];

function RegaTable({ d }: { d: DetailType }) {
  const rows: [string, string, boolean][] = [
    d.falLicense ? ["FAL / Broker License", d.falLicense, true] : null,
    d.adLicense ? ["Advertising License", d.adLicense, true] : null,
    d.adLicenseExpiryFormatted ? ["Ad License Expiry", d.adLicenseExpiryFormatted, false] : null,
    d.regaStreet ? ["REGA Street", d.regaStreet, false] : null,
    d.completionStatus ? ["Completion", d.completionStatus.charAt(0).toUpperCase() + d.completionStatus.slice(1), false] : null,
  ].filter(Boolean) as [string, string, boolean][];
  if (rows.length === 0) return null;
  return (
    <div style={css("border: 1px solid #E5E7EB; border-radius: 9px; overflow: hidden;")}>
      {rows.map(([k, v, mono], i) => (
        <div key={i} style={css("display: flex; justify-content: space-between; padding: 11px 13px;" + (i < rows.length - 1 ? " border-bottom: 1px solid #F3F4F6;" : ""))}>
          <span style={css("color: #9CA3AF; font-size: 12px;")}>{k}</span>
          <span style={css("font-size: 13px; font-weight: 500;" + (mono ? " font-family: 'JetBrains Mono', monospace;" : ""))}>{v}</span>
        </div>
      ))}
    </div>
  );
}

export function Detail({ D }: { D: Derived }) {
  const d = D.detail;
  return (
    <div style={css("height: 100vh; display: flex; flex-direction: column; overflow: hidden;")}>
      {/* top nav */}
      <div style={css("height: 48px; min-height: 48px; border-bottom: 1px solid #E5E7EB; display: flex; align-items: center; padding: 0 16px; gap: 12px; background: #fff;")}>
        <div onClick={D.goBack} style={css("display: flex; align-items: center; gap: 5px; font-size: 13px; color: #374151; cursor: pointer;")}>
          <ChevronLeft size={15} />Back to results</div>
        {D.hasRecent && (
          <div style={css("display: flex; align-items: center; gap: 7px; padding-left: 14px; margin-left: 4px; border-left: 1px solid #E5E7EB; overflow: hidden;")}>
            <span style={css("font-size: 11px; color: #9CA3AF; white-space: nowrap;")}>Recently viewed:</span>
            {D.recentViewed.map((r, i) => (<span key={i} onClick={r.open} style={css(r.style)}>{r.priceLabel}</span>))}
          </div>
        )}
        <div style={css("flex: 1;")}></div>
        <div style={css("position: relative;")}>
          <div onClick={D.togDetailExport} style={css("font-size: 12px; color: #fff; background: #0A0A0A; border-radius: 7px; padding: 7px 12px; display: flex; align-items: center; gap: 6px; cursor: pointer;")}><Download size={13} />Export <ChevronDown size={11} /></div>
          {D.detailExportOpen && (
            <div style={css("position: absolute; top: 38px; right: 0; z-index: 50; width: 220px; background: #fff; border: 1px solid #E5E7EB; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,.16); padding: 6px;")}>
              <div style={css("font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #9CA3AF; font-weight: 600; padding: 6px 8px 4px;")}>Download listing</div>
              <Hover onClick={D.exportCsv} style={css("display: flex; align-items: center; gap: 9px; padding: 9px 8px; border-radius: 7px; font-size: 13px; color: #374151; cursor: pointer;")} styleHover={css("background:#FAFAFA;")}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="1.8"><path d="M14 3v5h5M7 3h7l5 5v13H7z" /></svg>CSV (.csv)</Hover>
              <Hover onClick={D.exportXls} style={css("display: flex; align-items: center; gap: 9px; padding: 9px 8px; border-radius: 7px; font-size: 13px; color: #374151; cursor: pointer;")} styleHover={css("background:#FAFAFA;")}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="1.8"><path d="M14 3v5h5M7 3h7l5 5v13H7z" /><path d="M10 13l4 5M14 13l-4 5" /></svg>Excel (.xls)</Hover>
              <Hover onClick={D.exportPdf} style={css("display: flex; align-items: center; gap: 9px; padding: 9px 8px; border-radius: 7px; font-size: 13px; color: #374151; cursor: pointer;")} styleHover={css("background:#FAFAFA;")}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="1.8"><path d="M14 3v5h5M7 3h7l5 5v13H7z" /></svg>PDF (.pdf)</Hover>
            </div>
          )}
        </div>
        <span style={css("font-size: 12px; color: #6B7280; display: flex; align-items: center; gap: 5px; cursor: pointer;")}><Heart size={13} />Save</span>
        <span onClick={D.openShare} style={css("font-size: 12px; color: #6B7280; display: flex; align-items: center; gap: 5px; cursor: pointer;")}><Share size={13} />Share</span>
      </div>

      <div style={css("flex: 1; overflow-y: auto;")}>
        <div style={css("max-width: 1100px; margin: 0 auto; padding: 18px 24px 48px;")}>
          {/* breadcrumb */}
          <div style={css("font-size: 12px; color: #9CA3AF; margin-bottom: 16px;")}>{d.source} <span style={css("color:#D1D5DB;")}>/</span> {d.city} <span style={css("color:#D1D5DB;")}>/</span> {d.district} <span style={css("color:#D1D5DB;")}>/</span> <span style={css("color: #374151;")}>{d.title}</span></div>

          {/* images */}
          <div style={css("display: flex; gap: 10px; margin-bottom: 22px;")}>
            <div style={css("flex: 1; height: 360px; border-radius: 12px; overflow: hidden; position: relative; border: 1px solid #E5E7EB; background: #F3F4F6;" + (d.mainImage ? "" : " background-image: repeating-linear-gradient(45deg, #E9EBEE 0, #E9EBEE 1px, transparent 1px, transparent 9px); display: flex; align-items: center; justify-content: center;"))}>
              {d.mainImage
                ? <img src={d.mainImage} alt={d.title} style={css("width: 100%; height: 100%; object-fit: cover; display: block;")} />
                : <span style={css("font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #B6BAC0;")}>No photo available</span>}
              <span style={css("position: absolute; bottom: 12px; left: 12px; background: rgba(255,255,255,.92); border: 1px solid #E5E7EB; border-radius: 6px; padding: 3px 8px; font-size: 11px; color: #374151;")}>{d.status} · {d.source}</span>
              {d.images.length > 1 && <span style={css("position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,.6); color: #fff; border-radius: 6px; padding: 3px 8px; font-size: 11px; font-weight: 600;")}>+{d.images.length} photos</span>}
            </div>
            {d.thumbImages.length > 0 && (
              <div style={css("width: 130px; display: flex; flex-direction: column; gap: 10px;")}>
                {d.thumbImages.map((t, i) => (
                  <div key={i} style={css("flex: 1; border-radius: 9px; overflow: hidden; border: 1px solid #E5E7EB;")}>
                    <img src={t} alt="" style={css("width: 100%; height: 100%; object-fit: cover; display: block;")} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* two column layout */}
          <div style={css("display: flex; gap: 28px; align-items: flex-start;")}>
            <div style={css("flex: 1; min-width: 0;")}>
              {/* price + platform link */}
              <div style={css("display: flex; align-items: baseline; gap: 12px; margin-bottom: 6px;")}>
                <span style={css("font-size: 24px; font-weight: 700;")}><span style={css("unicode-bidi:isolate")}>SAR </span>{d.priceFull}</span>
                {d.isRent && <span style={css("font-size: 13px; color: #9CA3AF;")}>/ year</span>}
                <a href={d.sourceUrl} target="_blank" rel="noreferrer" style={css("margin-left: auto; display: inline-flex; align-items: center; gap: 6px; text-decoration: none; background: #F0FDF4; border: 1px solid #BBF7D0; color: #15803D; border-radius: 999px; padding: 5px 12px; font-size: 12px; font-weight: 600;")}>Listed on {d.source} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M9 7h8v8" /></svg></a>
              </div>
              <div style={css("font-size: 18px; font-weight: 600; margin-bottom: 6px;")}>{d.title}</div>
              <div style={css("font-size: 13px; color: #6B7280; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;")}><PinMarker size={14} stroke="currentColor" />{d.location}</div>

              {/* specs bar */}
              <div style={css("display: flex; gap: 18px; font-size: 13px; color: #374151; padding: 14px 0; border-top: 1px solid #F3F4F6; border-bottom: 1px solid #F3F4F6; margin: 14px 0;")}>
                <span style={css("display: flex; align-items: center; gap: 6px;")}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8"><path d="M2 9V5a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v4" /><path d="M2 11h20v6" /><path d="M4 17v2M20 17v2" /><path d="M6 9V7h5v2" /></svg>{d.bedsLabel}</span>
                <span style={css("display: flex; align-items: center; gap: 6px;")}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8"><path d="M4 12V5a2 2 0 0 1 4 0" /><path d="M3 12h18v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" /><path d="M7 19l-1 2M18 19l1 2" /></svg>{d.bathsLabel}</span>
                <span style={css("display: flex; align-items: center; gap: 6px;")}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8"><path d="M3 3h18v18H3z" /><path d="M3 9h6V3M21 15h-6v6" /></svg>{d.area} m²</span>
                <span style={css("display: flex; align-items: center; gap: 6px;")}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>{d.type}</span>
              </div>

              {/* description — only if non-empty */}
              {d.desc ? (
                <>
                  <div style={css("font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #9CA3AF; font-weight: 600; margin-bottom: 10px;")}>Overview</div>
                  <p style={css("font-size: 13px; line-height: 1.6; color: #374151; margin: 0 0 22px; text-wrap: pretty;")}>{d.desc}</p>
                </>
              ) : null}

              {/* details table */}
              <div style={css("font-size: 13px; font-weight: 600; margin-bottom: 10px;")}>Details</div>
              <div style={css("display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid #E5E7EB; border-radius: 9px; overflow: hidden; margin-bottom: 28px;")}>
                {D.detailRows.map((r, i) => (
                  <div key={i} style={css(r.style)}><span style={css("color: #9CA3AF; font-size: 12px;")}>{r.k}</span><span style={css("font-size: 13px; color: #111827; font-weight: 500;")}>{r.v}</span></div>
                ))}
              </div>

              {/* amenities — only if non-empty */}
              {d.amenities.length > 0 && (
                <>
                  <div style={css("font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #9CA3AF; font-weight: 600; margin-bottom: 12px; padding-top: 24px; border-top: 1px solid #F3F4F6;")}>Features &amp; Amenities</div>
                  <div style={css("display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px 14px; margin-bottom: 28px;")}>
                    {d.amenities.map((a, i) => (
                      <div key={i} style={css("display: flex; align-items: center; gap: 7px; font-size: 13px; color: #374151;")}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2"><path d="M5 12l4 4L19 7" /></svg>{a}</div>
                    ))}
                  </div>
                </>
              )}

              {/* REGA Info — show only when data available */}
              {(d.regaVerified || d.falLicense || d.adLicenseExpiryFormatted) && (
                <>
                  <div style={css("font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #9CA3AF; font-weight: 600; margin-bottom: 14px; padding-top: 24px; border-top: 1px solid #F3F4F6;")}>REGA Info</div>
                  <div style={css("display: flex; align-items: flex-start; gap: 20px; margin-bottom: 28px;")}>
                    <div style={css("flex: 1;")}>
                      {d.regaVerified && (
                        <span style={css("display: inline-flex; align-items: center; gap: 5px; color: #15803D; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 6px; padding: 4px 10px; font-size: 12px; font-weight: 500; margin-bottom: 16px;")}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l4 4L19 7" /></svg>
                          REGA Verified
                        </span>
                      )}
                      <RegaTable d={d} />
                      <a href={d.sourceUrl} target="_blank" rel="noreferrer" style={css("font-size: 12px; color: #16A34A; margin-top: 12px; cursor: pointer; display: inline-block; text-decoration: none;")}>Verify on {d.source} →</a>
                    </div>
                  </div>
                </>
              )}

              {/* location map */}
              <div style={css("font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #9CA3AF; font-weight: 600; margin-bottom: 12px; padding-top: 24px; border-top: 1px solid #F3F4F6;")}>Location</div>
              <div style={css("height: 220px; border-radius: 10px; border: 1px solid #E5E7EB; overflow: hidden; margin-bottom: 10px;")}>
                <DetailMap lat={d.lat} lng={d.lng} city={d.city} label={d.location} />
              </div>
              <div style={css("font-size: 12px; color: #9CA3AF; margin-bottom: 28px;")}>{d.location}</div>
            </div>

            {/* broker card */}
            <div style={css("width: 300px; min-width: 300px; position: sticky; top: 0;")}>
              <div style={css("border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px;")}>
                <div onClick={D.openBroker} style={css("display: flex; align-items: center; gap: 11px; margin-bottom: 14px; cursor: pointer;")}>
                  <div style={css("width: 44px; height: 44px; border-radius: 50%; background: #F3F4F6; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 600; color: #6B7280;")}>{d.brokerInitials}</div>
                  <div style={css("flex: 1;")}>
                    <div style={css("font-size: 14px; font-weight: 600;")}>{d.brokerName || "Agent"}</div>
                    <div style={css("font-size: 12px; color: #9CA3AF;")}>{d.brokerAgency || d.source}</div>
                  </div>
                  <ChevronRight size={15} stroke="#9CA3AF" />
                </div>
                <div style={css("display: flex; align-items: center; gap: 6px; font-size: 12px; color: #6B7280; margin-bottom: 14px;")}>
                  <span style={css("display: inline-flex; align-items: center; gap: 3px; color: #15803D; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 4px; padding: 1px 6px; font-weight: 500;")}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l4 4L19 7" /></svg>Verified</span>
                  <span>{d.brokerListings} active listings</span>
                </div>
                <div style={css("display: flex; flex-direction: column; gap: 8px;")}>
                  {d.brokerPhone ? (
                    <a href={d.brokerCallUrl} style={css("height: 36px; background: #16A34A; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; text-decoration: none;")}><Phone size={15} />Call {d.brokerPhone}</a>
                  ) : (
                    <a href={d.sourceUrl} target="_blank" rel="noreferrer" style={css("height: 36px; background: #16A34A; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; text-decoration: none;")}>Contact via {d.source}</a>
                  )}
                  <div style={css("display: flex; gap: 8px;")}>
                    {d.brokerPhone ? (
                      <a href={d.brokerWaUrl} target="_blank" rel="noreferrer" style={css("flex: 1; height: 36px; background: #fff; color: #111827; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; text-decoration: none;")}><WhatsApp size={15} />WhatsApp</a>
                    ) : (
                      <a href={d.sourceUrl} target="_blank" rel="noreferrer" style={css("flex: 1; height: 36px; background: #fff; color: #111827; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; text-decoration: none;")}><WhatsApp size={15} />WhatsApp</a>
                    )}
                    <button style={css("flex: 1; height: 36px; background: #fff; color: #111827; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;")}><Email size={15} />Email</button>
                  </div>
                  <a href={d.sourceUrl} target="_blank" rel="noreferrer" style={css("height: 38px; background: #0A0A0A; color: #fff; border-radius: 8px; font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; text-decoration: none;")}><ArrowUpRight size={15} />View on {d.source}</a>
                </div>
                <div style={css("margin-top: 14px; padding-top: 14px; border-top: 1px solid #F3F4F6; font-size: 11px; color: #9CA3AF;")}>Listing ref <span style={css("font-family: 'JetBrains Mono', monospace; color: #6B7280;")}>{d.ref}</span> · Sourced from {d.source}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
