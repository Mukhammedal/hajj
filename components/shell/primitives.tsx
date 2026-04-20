import type { CSSProperties, ReactNode } from "react";

import { formatHijriDate } from "@/lib/hijri";
import { cn } from "@/lib/utils";

interface HijriPillProps {
  className?: string;
  date?: Date;
  timeZone?: string;
}

export function HijriPill({ className, date, timeZone }: HijriPillProps) {
  return <span className={cn("hijri", className)}>{formatHijriDate(date, timeZone)}</span>;
}

interface RuKzToggleProps {
  active?: "KZ" | "RU";
  className?: string;
}

export function RuKzToggle({ active = "RU", className }: RuKzToggleProps) {
  return (
    <div aria-label="Переключатель языка" className={cn("lang-toggle", className)} role="group">
      <span className={cn(active === "RU" && "on")}>RU</span>
      <span className={cn(active === "KZ" && "on")}>KZ</span>
    </div>
  );
}

export const LangToggle = RuKzToggle;

interface StatusTagProps {
  children: ReactNode;
  className?: string;
  variant?: "danger" | "dark" | "default" | "emerald" | "success" | "warning";
}

export function StatusTag({ children, className, variant = "default" }: StatusTagProps) {
  return <span className={cn("tag", variant !== "default" && variant, className)}>{children}</span>;
}

interface ProgressBarProps {
  className?: string;
  tone?: "danger" | "default" | "em" | "gold" | "warn";
  value: number;
}

export function ProgressBar({ className, tone = "default", value }: ProgressBarProps) {
  const width = `${Math.max(0, Math.min(100, value))}%`;

  return (
    <div className={cn("bar", tone !== "default" && tone, className)}>
      <i style={{ width }} />
    </div>
  );
}

interface RadialGaugeProps {
  className?: string;
  label?: ReactNode;
  size?: number;
  strokeWidth?: number;
  textClassName?: string;
  tone?: "emerald" | "gold";
  value: number;
}

export function RadialGauge({
  className,
  label = "готов",
  size = 180,
  strokeWidth = 10,
  textClassName,
  tone = "gold",
  value,
}: RadialGaugeProps) {
  const normalizedValue = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (normalizedValue / 100) * circumference;
  const ringColor = tone === "gold" ? "#c9a961" : "var(--emerald)";
  const viewBox = `0 0 ${size} ${size}`;
  const center = size / 2;
  const labelStyle = tone === "gold" ? { color: "#ede6d4" } : undefined;
  const smallStyle = tone === "gold" ? ({ color: "#8c8268" } as CSSProperties) : undefined;

  return (
    <div className={cn("gauge-wrap", className)}>
      <svg height={size} viewBox={viewBox} width={size}>
        <circle cx={center} cy={center} fill="none" r={radius} stroke="rgba(255,255,255,.08)" strokeWidth={strokeWidth} />
        <circle
          cx={center}
          cy={center}
          fill="none"
          r={radius}
          stroke={ringColor}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <div className={cn("gauge-num", textClassName)} style={labelStyle}>
        {normalizedValue}
        <small style={smallStyle}>{label}</small>
      </div>
    </div>
  );
}
