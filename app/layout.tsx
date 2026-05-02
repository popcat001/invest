import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Binoculars, BookOpenText, CalendarDays, Database, Layers3, Settings } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Invest Research Dashboard",
  description: "Personal AI public equities research workstation"
};

export const dynamic = "force-dynamic";

const nav = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/research", label: "Research", icon: Database },
  { href: "/portfolio", label: "Portfolio", icon: Layers3 },
  { href: "/monthly", label: "Monthly Review", icon: CalendarDays },
  { href: "/watchlist", label: "Watchlist", icon: Binoculars },
  { href: "/reference", label: "Reference", icon: BookOpenText },
  { href: "/settings", label: "Settings", icon: Settings }
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <aside className="sidebar">
            <Link href="/" className="brand" aria-label="Invest dashboard home">
              <span className="brand-mark">L/T</span>
              <span>
                <strong>Invest</strong>
                <small>AI equity research</small>
              </span>
            </Link>
            <nav className="nav-list" aria-label="Main navigation">
              {nav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link href={item.href} key={item.href} className="nav-item">
                    <Icon size={17} aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <p className="disclaimer">Research support only. Not financial advice.</p>
          </aside>
          <main className="workspace">{children}</main>
        </div>
      </body>
    </html>
  );
}
