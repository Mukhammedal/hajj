import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

export type DesignIconName = "arrow" | "bell" | "check" | "chev" | "doc" | "pin" | "qr" | "search" | "star" | "wa";

interface DesignIconProps {
  className?: string;
  name: DesignIconName;
  size?: number;
  style?: CSSProperties;
}

export function DesignIcon({ className, name, size = 16, style }: DesignIconProps) {
  const viewBox = name === "qr" ? "0 0 24 24" : "0 0 16 16";

  return (
    <svg aria-hidden="true" className={cn("design-icon", className)} height={size} style={style} viewBox={viewBox} width={size}>
      <use href={`#i-${name}`} />
    </svg>
  );
}

export function DesignIconSprite() {
  return (
    <svg aria-hidden="true" height="0" style={{ position: "absolute" }} width="0">
      <defs>
        <symbol id="i-check" viewBox="0 0 16 16">
          <path d="M3 8l3 3 7-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </symbol>
        <symbol id="i-arrow" viewBox="0 0 16 16">
          <path
            d="M3 8h10m-4-4l4 4-4 4"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.6"
          />
        </symbol>
        <symbol id="i-star" viewBox="0 0 16 16">
          <path d="M8 1.5l2.1 4.4 4.8.7-3.5 3.4.8 4.8L8 12.6l-4.3 2.3.8-4.8L1 6.6l4.8-.7z" fill="currentColor" />
        </symbol>
        <symbol id="i-search" viewBox="0 0 16 16">
          <circle cx="7" cy="7" fill="none" r="5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M11 11l4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
        </symbol>
        <symbol id="i-bell" viewBox="0 0 16 16">
          <path
            d="M8 2a4 4 0 00-4 4v3l-1 2h10l-1-2V6a4 4 0 00-4-4zM6 13a2 2 0 004 0"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </symbol>
        <symbol id="i-doc" viewBox="0 0 16 16">
          <path
            d="M3 1h7l3 3v11H3V1z M10 1v3h3 M5.5 7h5 M5.5 10h5 M5.5 13h3"
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.4"
          />
        </symbol>
        <symbol id="i-pin" viewBox="0 0 16 16">
          <path
            d="M8 1a5 5 0 015 5c0 3.5-5 9-5 9S3 9.5 3 6a5 5 0 015-5z M8 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.4"
          />
        </symbol>
        <symbol id="i-wa" viewBox="0 0 16 16">
          <path d="M8 1a7 7 0 00-6 10.5L1 15l3.5-1A7 7 0 108 1z" fill="currentColor" />
        </symbol>
        <symbol id="i-chev" viewBox="0 0 16 16">
          <path d="M5 3l5 5-5 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
        </symbol>
        <symbol id="i-qr" viewBox="0 0 24 24">
          <path
            d="M3 3h7v7H3zm2 2v3h3V5zm8-2h7v7h-7zm2 2v3h3V5zm-12 8h7v7H3zm2 2v3h3v-3zm8 0h2v2h-2zm4 0h3v2h-3zm-4 4h3v3h-3zm4 0h3v3h-3zm-4-8h7v2h-3v2h-2v-2h-2z"
            fill="currentColor"
          />
        </symbol>
      </defs>
    </svg>
  );
}
