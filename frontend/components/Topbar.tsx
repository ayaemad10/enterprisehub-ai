"use client";

import { useAuth } from "@/context/auth-context";
import { LogOut, Search } from "lucide-react";

export default function Topbar() {
  const { user, signOut } = useAuth();

  return (
    <header className="eh-glass flex items-center justify-between border-b border-eh-border px-6 py-4 md:px-10">
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-eh-text-faint" />
        <input
          placeholder="اسأل: أين عقد شركة ABC؟"
          disabled
          className="w-full cursor-not-allowed rounded-lg border border-eh-border bg-eh-bg-elevated/40 py-2 pr-10 pl-3 text-sm text-eh-text-faint placeholder:text-eh-text-faint"
          title="البحث الذكي — قريبًا"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="text-left">
          <p className="text-sm font-medium text-eh-text">{user?.full_name}</p>
          <p className="text-xs text-eh-text-muted">{user?.department || user?.role}</p>
        </div>
        <button
          onClick={signOut}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-eh-border text-eh-text-muted transition hover:border-eh-red/40 hover:text-eh-red"
          title="تسجيل الخروج"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
