"use client";

import { useEffect, useState } from "react";
import { fetchDashboard, DashboardStats } from "@/lib/api";
import StatCard from "@/components/StatCard";
import { Files, FolderTree, ScrollText, AlertTriangle, HardDrive, UploadCloud, Users } from "lucide-react";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 بايت";
  const units = ["بايت", "كيلوبايت", "ميجابايت", "جيجابايت"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard()
      .then(setStats)
      .catch(() => setError("تعذر تحميل بيانات لوحة التحكم. تأكد من تشغيل الخادم الخلفي."));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-eh-text">لوحة التحكم</h1>
        <p className="text-sm text-eh-text-muted">نظرة عامة على ملفات ومستندات الشركة</p>
      </div>

      {error && (
        <div className="eh-glass rounded-xl border-eh-red/30 p-4 text-sm text-eh-red">{error}</div>
      )}

      {!stats && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="eh-glass h-32 animate-pulse rounded-2xl" />
          ))}
        </div>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="إجمالي الملفات" value={stats.total_files} icon={Files} tone="gold" />
            <StatCard label="المجلدات" value={stats.total_folders} icon={FolderTree} tone="teal" />
            <StatCard label="التصاريح والعقود" value={stats.total_licenses} icon={ScrollText} tone="gold" />
            <StatCard
              label="تصاريح منتهية"
              value={stats.expired_licenses}
              icon={AlertTriangle}
              tone={stats.expired_licenses > 0 ? "red" : "teal"}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="مساحة التخزين المستخدمة"
              value={formatBytes(stats.storage_used_bytes)}
              icon={HardDrive}
              tone="gold"
            />
            <StatCard label="ملفات مرفوعة اليوم" value={stats.files_uploaded_today} icon={UploadCloud} tone="teal" />
            <StatCard label="مستخدمون نشطون" value={stats.active_users} icon={Users} tone="gold" />
          </div>

          {stats.expiring_soon_licenses > 0 && (
            <div className="eh-glass flex items-center gap-3 rounded-xl border-eh-gold/30 p-4">
              <AlertTriangle className="h-5 w-5 text-eh-gold" />
              <p className="text-sm text-eh-text">
                لديك <span className="font-semibold text-eh-gold">{stats.expiring_soon_licenses}</span> تصريح/عقد
                سينتهي خلال الثلاثين يومًا القادمة.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
