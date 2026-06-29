import type { CSSProperties, ReactNode } from "react";

interface IconProps {
  size?: number;
  sw?: number | string;
  stroke?: string;
  fill?: string;
  style?: CSSProperties;
}

function svg(
  inner: ReactNode,
  { size = 24, sw = 1.8, stroke = "currentColor", fill = "none", style }: IconProps,
  round = false,
) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={sw}
      strokeLinecap={round ? "round" : undefined}
      strokeLinejoin={round ? "round" : undefined}
      style={style}
    >
      {inner}
    </svg>
  );
}

// PropScan logo pin (minimal pin with scan line)
export const LogoPin = (p: IconProps) =>
  svg(
    <>
      <path d="M12 22s6-5.5 6-11a6 6 0 1 0-12 0c0 5.5 6 11 6 11z" />
      <line x1="6.5" y1="10.5" x2="17.5" y2="10.5" />
    </>,
    p,
    true,
  );

// Location pin marker (with dot)
export const PinMarker = (p: IconProps) =>
  svg(
    <>
      <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </>,
    p,
  );

export const ChevronDown = (p: IconProps) => svg(<path d="M6 9l6 6 6-6" />, { sw: 2, ...p });
export const ChevronRight = (p: IconProps) => svg(<path d="M9 18l6-6-6-6" />, { sw: 2, ...p });
export const ChevronLeft = (p: IconProps) => svg(<path d="M15 18l-6-6 6-6" />, { sw: 2, ...p });

export const Search = (p: IconProps) =>
  svg(
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4-4" />
    </>,
    { sw: 2, ...p },
  );

export const Check = (p: IconProps) => svg(<path d="M5 12l4 4L19 7" />, { sw: 2.5, ...p });

export const WhatsApp = (p: IconProps) =>
  svg(<path d="M21 11.5a8.38 8.38 0 0 1-12 7.5L3 21l2-5.5A8.5 8.5 0 1 1 21 11.5z" />, p);

export const Phone = (p: IconProps) =>
  svg(
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z" />,
    p,
  );

export const Email = (p: IconProps) =>
  svg(
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7l10 6 10-6" />
    </>,
    p,
  );

export const Heart = (p: IconProps) =>
  svg(<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />, p);

export const Share = (p: IconProps) =>
  svg(
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </>,
    p,
  );

export const Compare = (p: IconProps) =>
  svg(<path d="M16 3h5v5M21 3l-7 7M8 21H3v-5M3 21l7-7" />, { sw: 2, ...p });

export const Download = (p: IconProps) =>
  svg(<path d="M12 3v12M7 10l5 5 5-5M5 21h14" />, { sw: 2, ...p });

export const Close = (p: IconProps) => svg(<path d="M18 6L6 18M6 6l12 12" />, { sw: 2, ...p });

export const Beds = (p: IconProps) =>
  svg(
    <>
      <path d="M2 9V5a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v4" />
      <path d="M2 11h20v6" />
      <path d="M4 17v2M20 17v2" />
    </>,
    { sw: 1.7, ...p },
  );

export const Baths = (p: IconProps) =>
  svg(
    <>
      <path d="M4 12V5a2 2 0 0 1 4 0" />
      <path d="M3 12h18v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" />
    </>,
    { sw: 1.7, ...p },
  );

export const Spark = (p: IconProps) =>
  svg(<path d="M12 3l1.6 4.6L18 9.2l-4.4 1.6L12 15l-1.6-4.2L6 9.2l4.4-1.6z" />, { sw: 1.7, ...p });

export const ArrowUpRight = (p: IconProps) =>
  svg(<path d="M7 17L17 7M9 7h8v8" />, { sw: 2, ...p });

export const Copy = (p: IconProps) =>
  svg(
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>,
    p,
  );

export const Clock = (p: IconProps) =>
  svg(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>,
    p,
  );

export const FileIcon = (p: IconProps) =>
  svg(<path d="M14 3v5h5M7 3h7l5 5v13H7z" />, p);

export const Grid = (p: IconProps) =>
  svg(
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>,
    { sw: 1.9, ...p },
  );

// helper to wrap a path string for view-switcher icons (round caps)
export const ViewIcon = ({ d, ...p }: IconProps & { d: string }) =>
  svg(<path d={d} />, { size: 13, sw: 1.8, ...p }, true);
