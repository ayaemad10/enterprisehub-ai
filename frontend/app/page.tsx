"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const hasToken = typeof window !== "undefined" && localStorage.getItem("eh_token");
    router.replace(hasToken ? "/dashboard" : "/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-eh-gold border-t-transparent" />
    </div>
  );
}
