import type { ReactNode } from "react";

import { HijriPill } from "@/components/shell/primitives";

interface CrmTopbarProps {
  actions?: ReactNode;
  title: ReactNode;
}

export function CrmTopbar({ actions, title }: CrmTopbarProps) {
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
