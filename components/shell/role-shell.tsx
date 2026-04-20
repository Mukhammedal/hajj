"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { DesignIconName } from "@/components/shell/design-icons";
import { DesignIcon } from "@/components/shell/design-icons";
import { cn } from "@/lib/utils";

export interface ShellNavItem {
  count?: string;
  href: string;
  icon?: DesignIconName;
  label: string;
  prefix?: string;
}

export interface ShellNavGroup {
  items: ShellNavItem[];
  label?: string;
}

interface RoleShellProps {
  avatar: {
    background?: string;
    initials: string;
    subtitle: string;
    title: string;
  };
  children: ReactNode;
  navGroups: ShellNavGroup[];
  roleClassName: string;
  roleLabel: string;
}

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function RoleShell({ avatar, children, navGroups, roleClassName, roleLabel }: RoleShellProps) {
  const pathname = usePathname();

  return (
    <div className="app-shell page-wrap">
      <div className="app">
        <aside className="sidebar">
          <Link className="logo" href="/">
            <span className="logo-mark em">h</span>HajjCRM
          </Link>
          <span className={cn("pill-role", roleClassName)}>{roleLabel}</span>
          {navGroups.map((group, groupIndex) => (
            <div key={`${group.label ?? "root"}-${groupIndex}`}>
              {group.label ? <div className="group">{group.label}</div> : null}
              {group.items.map((item) => {
                const active = isActivePath(pathname, item.href);

                return (
                  <Link key={item.href} className={cn(active && "on")} href={item.href}>
                    {item.icon ? <DesignIcon name={item.icon} size={14} /> : item.prefix ? <span className="nav-prefix">{item.prefix}</span> : null}
                    {item.label}
                    {item.count ? <span className="count">{item.count}</span> : null}
                  </Link>
                );
              })}
            </div>
          ))}

          <div className="avatar-block">
            <div className="avatar" style={avatar.background ? { background: avatar.background } : undefined}>
              {avatar.initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="avatar-title">{avatar.title}</div>
              <div className="avatar-subtitle">{avatar.subtitle}</div>
            </div>
          </div>
        </aside>

        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}
