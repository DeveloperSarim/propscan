import { useState } from "react";
import { css } from "../lib/css";
import type { Derived } from "../store/useDerived";
import { NavHeader } from "../components/NavHeader";

const BEDS = ["Any", "1", "2", "3", "4", "5+"];

export function Post({ D }: { D: Derived }) {
  const [propType, setPropType] = useState("");
  const [district, setDistrict] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");
  const [beds, setBeds] = useState("Any");
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    if (!name.trim() || !whatsapp.trim()) {
      setErrorMsg("Name and WhatsApp number are required.");
      return;
    }
    setErrorMsg("");
    setStatus("loading");
    try {
      const res = await fetch("/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purpose: D.purposeBuy ? "Buy" : "Rent",
          property_type: propType,
          city: D.city,
          district,
          budget_min: budgetMin,
          budget_max: budgetMax,
          area_min: areaMin,
          area_max: areaMax,
          bedrooms: beds,
          notes,
          name: name.trim(),
          whatsapp: whatsapp.trim().replace(/^0+/, ""),
        }),
      });
      if (res.ok) {
        setStatus("done");
      } else {
        setStatus("error");
        setErrorMsg("Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please check your connection.");
    }
  };

  const right = (
    <div style={css("display: flex; align-items: center; gap: 14px;")}>
      <span onClick={D.goDash} style={css("font-size: 13px; color: #374151; cursor: pointer;")}>Saved</span>
      <div onClick={D.goDash} style={css("width: 30px; height: 30px; border-radius: 50%; background: #F3F4F6; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: #6B7280; cursor: pointer;")}>FR</div>
    </div>
  );

  if (status === "done") {
    return (
      <div style={css("height: 100vh; overflow-y: auto; background: #F9FAFB;")}>
        <NavHeader D={D} right={right} />
        <div style={css("max-width: 600px; margin: 0 auto; padding: 64px 24px 60px;")}>
          <div style={css("background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; padding: 48px 40px; text-align: center;")}>
            <div style={css("width: 56px; height: 56px; border-radius: 50%; background: #F0FDF4; border: 2px solid #BBF7D0; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;")}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <h2 style={css("font-size: 24px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 10px;")}>Requirement Submitted!</h2>
            <p style={css("font-size: 14px; color: #6B7280; margin: 0 0 28px; line-height: 1.6;")}>
              Verified brokers will contact you on WhatsApp within 24 hours.<br />
              An email notification has been sent to the admin.
            </p>
            <button onClick={D.goHome} style={css("height: 44px; padding: 0 28px; background: #16A34A; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; font-family: inherit; cursor: pointer;")}>
              Back to Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={css("height: 100vh; overflow-y: auto; background: #F9FAFB;")}>
      <NavHeader D={D} right={right} />
      <div style={css("max-width: 600px; margin: 0 auto; padding: 64px 24px 60px;")}>
        <div style={css("background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; padding: 40px;")}>
          <div style={css("font-size: 11px; color: #16A34A; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; margin-bottom: 10px;")}>Post Your Requirement</div>
          <h2 style={css("font-size: 28px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 8px;")}>Tell us what you're looking for</h2>
          <p style={css("font-size: 14px; color: #6B7280; margin: 0 0 28px;")}>Verified brokers will contact you directly.</p>

          <div style={css("display: flex; flex-direction: column; gap: 14px;")}>
            {/* Purpose */}
            <div style={css("display: flex; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; height: 40px;")}>
              <div onClick={D.setBuy} style={css(D.buyStyle)}>Buy</div>
              <div onClick={D.setRent} style={css(D.rentStyle)}>Rent</div>
            </div>

            {/* Property Type */}
            <select
              value={propType}
              onChange={(e) => setPropType(e.target.value)}
              style={css("height: 40px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 10px; font-size: 14px; font-family: inherit; background: #fff; color: " + (propType ? "#111827" : "#9CA3AF") + ";")}
            >
              <option value="">Property Type</option>
              <option>Apartment</option>
              <option>Villa</option>
              <option>Townhouse</option>
              <option>Office</option>
              <option>Land</option>
            </select>

            {/* City */}
            <select
              value={D.city}
              onChange={D.onCity}
              style={css("height: 40px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 10px; font-size: 14px; font-family: inherit; background: #fff;")}
            >
              <option>Jeddah</option>
              <option>Riyadh</option>
              <option>Dammam</option>
              <option>Mecca</option>
              <option>Medina</option>
              <option>Khobar</option>
            </select>

            {/* District */}
            <input
              placeholder="District / Neighbourhood (optional)"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              style={css("height: 40px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: inherit;")}
            />

            {/* Budget */}
            <div style={css("display: flex; gap: 12px;")}>
              <input
                placeholder="SAR Min Budget"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                type="number"
                style={css("flex: 1; height: 40px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: inherit;")}
              />
              <input
                placeholder="SAR Max Budget"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                type="number"
                style={css("flex: 1; height: 40px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: inherit;")}
              />
            </div>

            {/* Area */}
            <div style={css("display: flex; gap: 12px;")}>
              <input
                placeholder="m² Min Area"
                value={areaMin}
                onChange={(e) => setAreaMin(e.target.value)}
                type="number"
                style={css("flex: 1; height: 40px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: inherit;")}
              />
              <input
                placeholder="m² Max Area"
                value={areaMax}
                onChange={(e) => setAreaMax(e.target.value)}
                type="number"
                style={css("flex: 1; height: 40px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: inherit;")}
              />
            </div>

            {/* Bedrooms */}
            <div>
              <div style={css("font-size: 12px; color: #6B7280; margin-bottom: 7px;")}>Bedrooms</div>
              <div style={css("display: flex; gap: 6px;")}>
                {BEDS.map((b) => (
                  <span
                    key={b}
                    onClick={() => setBeds(b)}
                    style={css(
                      "font-size: 12px; border-radius: 6px; padding: 5px 13px; cursor: pointer; " +
                      (beds === b
                        ? "background: #F0FDF4; border: 1px solid #16A34A; color: #15803D;"
                        : "background: #fff; border: 1px solid #E5E7EB; color: #374151;")
                    )}
                  >{b}</span>
                ))}
              </div>
            </div>

            {/* Notes */}
            <textarea
              placeholder="Additional notes — floor preference, view, timeline…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={css("height: 80px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 10px 12px; font-size: 14px; font-family: inherit; resize: none;")}
            />

            {/* Name */}
            <input
              placeholder="Your Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={css("height: 40px; border: 1px solid " + (!name.trim() && errorMsg ? "#EF4444" : "#E5E7EB") + "; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: inherit;")}
            />

            {/* WhatsApp */}
            <div style={css("display: flex; align-items: center; border: 1px solid " + (!whatsapp.trim() && errorMsg ? "#EF4444" : "#E5E7EB") + "; border-radius: 8px; height: 40px; overflow: hidden;")}>
              <span style={css("padding: 0 10px; border-right: 1px solid #E5E7EB; font-size: 14px; color: #6B7280; height: 100%; display: flex; align-items: center; gap: 5px; white-space: nowrap;")}>🇸🇦 +966</span>
              <input
                placeholder="WhatsApp Number *"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                type="tel"
                style={css("flex: 1; height: 100%; border: none; padding: 0 12px; font-size: 14px; font-family: inherit; outline: none;")}
              />
            </div>

            {/* Error */}
            {errorMsg && (
              <div style={css("font-size: 13px; color: #DC2626; background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 10px 14px;")}>
                {errorMsg}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={status === "loading"}
              style={css(
                "height: 48px; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; font-family: inherit; cursor: " +
                (status === "loading" ? "not-allowed" : "pointer") +
                "; margin-top: 4px; display: flex; align-items: center; justify-content: center; gap: 8px; " +
                (status === "loading" ? "background: #86EFAC; color: #fff;" : "background: #16A34A; color: #fff;")
              )}
            >
              {status === "loading" ? (
                <>
                  <span style={css("width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; animation: ps-spin 0.7s linear infinite;")}></span>
                  Sending…
                </>
              ) : "Post Requirement"}
            </button>

            <div style={css("font-size: 12px; color: #9CA3AF; text-align: center;")}>✓ Free  ·  ✓ Verified brokers only  ·  ✓ No spam</div>
          </div>
        </div>
      </div>
    </div>
  );
}
