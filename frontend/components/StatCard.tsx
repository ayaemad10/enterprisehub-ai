"use client";

import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "gold" | "teal" | "red";
  hint?: string;
}

const TONE_MAP = {
  gold: { bg: "bg-eh-gold-soft", text: "text-eh-gold", ring: "var(--eh-gold)" },
  teal: { bg: "bg-eh-teal-soft", text: "text-eh-teal", ring: "var(--eh-teal)" },
  red: { bg: "bg-eh-red-soft", text: "text-eh-red", ring: "var(--eh-red)" },
};

export default function StatCard({ label, value, icon: Icon, tone = "gold", hint }: StatCardProps) {
  const t = TONE_MAP[tone];
  return (
    <div className="eh-glass eh-glass-hover rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div
          className={`eh-seal flex h-11 w-11 items-center justify-center rounded-full ${t.bg}`}
          style={{ ["--seal-color" as string]: t.ring }}
        >
          <Icon className={`h-5 w-5 ${t.text}`} strokeWidth={1.8} />
        </div>
        {hint && <span className="text-[11px] text-eh-text-faint">{hint}</span>}
      </div>
      <p className="mt-4 font-display text-3xl font-bold text-eh-text">{value}</p>
      <p className="mt-1 text-sm text-eh-text-muted">{label}</p>
    </div>
  );
}
