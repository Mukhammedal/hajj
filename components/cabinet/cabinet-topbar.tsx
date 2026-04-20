import type { ReactNode } from "react";

import { HijriPill } from "@/components/shell/primitives";

interface CabinetTopbarProps {
  actions?: ReactNode;
  title: ReactNode;
}

export function CabinetTopbar({ actions, title }: CabinetTopbarProps) {
  return (
    <div className="app-topbar">
      <h2>{title}</h2>
      <div className="right">
        <HijriPill />
        {actions}
      </div>
    </div>
  );
}
