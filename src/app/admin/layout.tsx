import { ThemeProvider } from "@/components/providers/ThemeProvider";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <div style={{ background: "var(--background)", color: "var(--foreground)", minHeight: "100vh" }}>
        {children}
      </div>
    </ThemeProvider>
  );
}
