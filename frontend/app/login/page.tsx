"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/context/auth-context";
import { Lock, Mail, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signIn(email, password);
    } catch {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Ambient seal rings in the background — the platform's signature motif */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full border border-dashed border-eh-gold/20" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-72 w-72 rounded-full border border-dashed border-eh-teal/15" />

      <div className="eh-glass w-full max-w-md rounded-2xl p-8 shadow-2xl">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="eh-seal flex h-14 w-14 items-center justify-center rounded-full bg-eh-gold-soft" style={{ ['--seal-color' as string]: 'var(--eh-gold)' }}>
            <ShieldCheck className="h-6 w-6 text-eh-gold" strokeWidth={2} />
          </div>
          <h1 className="font-display text-2xl font-bold text-eh-text">EnterpriseHub AI</h1>
          <p className="text-sm text-eh-text-muted">منصة تشغيل الشركة — ملفات، مستندات، وتصاريح في مكان واحد</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-eh-text-muted">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-eh-text-faint" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full rounded-lg border border-eh-border bg-eh-bg-elevated/60 py-2.5 pr-10 pl-3 text-sm text-eh-text placeholder:text-eh-text-faint focus:border-eh-gold/50 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-eh-text-muted">كلمة المرور</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-eh-text-faint" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-eh-border bg-eh-bg-elevated/60 py-2.5 pr-10 pl-3 text-sm text-eh-text placeholder:text-eh-text-faint focus:border-eh-gold/50 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-eh-red/30 bg-eh-red/10 px-3 py-2 text-sm text-eh-red">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-eh-gold py-2.5 text-sm font-semibold text-eh-bg transition hover:brightness-110 disabled:opacity-60"
          >
            {isSubmitting ? "جارٍ الدخول..." : "تسجيل الدخول"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-eh-text-faint">
          للتجربة: أنشئ حسابًا عبر نقطة النهاية <code className="text-eh-text-muted">/api/auth/register</code>
        </p>
      </div>
    </div>
  );
}
