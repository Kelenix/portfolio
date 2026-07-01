import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { ToastContainer } from "@/components/admin/Toast";
import { AdminSessionGuard } from "@/components/admin/AdminSessionGuard";
import { IdleTimeout } from "@/components/admin/IdleTimeout";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { template: "%s | Admin", default: "Admin" },
  robots: { index: false, follow: false },
};

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  try {
    session = await auth();
  } catch {
    redirect("/admin/login");
  }

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <ThemeProvider>
      <div
        className="flex min-h-screen"
        style={{ background: "var(--background)", color: "var(--foreground)" }}
      >
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-8">{children}</main>
        </div>
        <ToastContainer />
        <AdminSessionGuard />
        <IdleTimeout />
      </div>
    </ThemeProvider>
  );
}
