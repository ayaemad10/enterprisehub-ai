"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  FolderOpen,
  ScrollText,
  Bell,
  MessageSquare,
  Users,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard, enabled: true },
  { href: "/drive", label: "ملفات الشركة", icon: FolderOpen, enabled: true },
  { href: "/licenses", label: "التصاريح والعقود", icon: ScrollText, enabled: false },
  { href: "/notifications", label: "التنبيهات", icon: Bell, enabled: false },
  { href: "/ai-chat", label: "المساعد الذكي", icon: MessageSquare, enabled: false },
  { href: "/employees", label: "الموظفون", icon: Users, enabled: false },
  { href: "/audit-log", label: "سجل العمليات", icon: ClipboardList, enabled: false },
];

export default function Sidebar({ activePath }: { activePath: string }) {
  return (
    <aside className="eh-glass hidden w-64 shrink-0 flex-col border-l-0 border-r border-eh-border p-5 md:flex">
      <div className="mb-8 flex items-center gap-2.5 px-1">
        <div className="eh-seal flex h-9 w-9 items-center justify-center rounded-full bg-eh-gold-soft" style={{ ["--seal-color" as string]: "var(--eh-gold)" }}>
          <ShieldCheck className="h-4.5 w-4.5 text-eh-gold" strokeWidth={2} />
        </div>
        <span className="font-display text-lg font-bold text-eh-text">EnterpriseHub</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, enabled }) => {
          const isActive = activePath === href;
          return (
            <Link
              key={href}
              href={enabled ? href : "#"}
              aria-disabled={!enabled}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                isActive
                  ? "bg-eh-gold-soft text-eh-gold"
                  : enabled
                  ? "text-eh-text-muted hover:bg-white/5 hover:text-eh-text"
                  : "cursor-not-allowed text-eh-text-faint"
              }`}
            >
              <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
              <span>{label}</span>
              {!enabled && <span className="mr-auto text-[10px] text-eh-text-faint">قريبًا</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-lg border border-eh-border bg-eh-bg-elevated/50 p-3 text-xs text-eh-text-faint">
        الإصدار 0.1 — MVP
      </div>
    </aside>
  );
}
