"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { Github, Globe, Hexagon, Menu, X, Languages } from "lucide-react";
import { useLocale } from "@/contexts/locale-context";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { AboutPlatformDialog } from "@/components/about-platform-dialog";

type MainShellProps = {
  children: ReactNode;
};

export function MainShell({ children }: MainShellProps) {
  const pathname = usePathname();
  const { locale, setLocale, t } = useLocale();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const { status } = useNetworkStatus();

  const navItems = [
    { href: "/", label: t.nav.overview },
    { href: "/discuss", label: t.nav.discussions },
    { href: "/decide", label: t.nav.governance },
    { href: "/constitution", label: t.nav.constitution },
  ];

  const toggleLocale = () => {
    setLocale(locale === "zh" ? "en" : "zh");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col selection:bg-[var(--accent-primary)] selection:text-white">
      <div className="pointer-events-none fixed inset-0 z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-[var(--accent-primary)]/5 blur-[120px]" />
        <div className="absolute right-[-5%] bottom-[10%] h-[30%] w-[30%] rounded-full bg-[var(--accent-secondary)]/5 blur-[100px]" />
        <div className="absolute top-[40%] left-[60%] h-[20%] w-[20%] rounded-full bg-[var(--accent-tertiary)]/5 blur-[80px]" />
      </div>

      <nav
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "border-b border-[var(--border-subtle)] bg-[var(--bg-void)]/80 py-3 backdrop-blur-xl"
            : "bg-transparent py-5"
        }`}
      >
        <div className="ucp-container flex items-center justify-between gap-3">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--bg-surface-elevated)] to-[var(--bg-surface)] shadow-lg shadow-black/20 transition-colors group-hover:border-[var(--accent-primary)]/50">
              <Hexagon
                size={20}
                className="text-[var(--accent-primary)] transition-all group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                strokeWidth={2.5}
              />
            </div>
            <div className="flex flex-col">
              <span className="leading-none font-[var(--font-rajdhani)] text-lg font-bold tracking-wide text-white">
                THE UCP
              </span>
              <span className="text-[10px] tracking-[0.2em] text-[var(--text-tertiary)] uppercase transition-colors group-hover:text-[var(--text-secondary)]">
                {t.nav.sovereignNode}
              </span>
            </div>
          </Link>

          <div className="hidden items-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 p-1.5 backdrop-blur-md md:flex">
            {navItems.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]/50 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <div className="flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-3 py-1.5 font-mono text-xs">
              <span className="relative flex h-2 w-2">
                {status !== "offline" && (
                  <span
                    className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                      status === "smooth"
                        ? "bg-emerald-400"
                        : status === "busy"
                          ? "bg-amber-400"
                          : "bg-red-400"
                    }`}
                  />
                )}
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    status === "smooth"
                      ? "bg-emerald-500"
                      : status === "busy"
                        ? "bg-amber-500"
                        : status === "congested"
                          ? "bg-red-500"
                          : "bg-gray-500"
                  }`}
                />
              </span>
              <span
                className={
                  status === "smooth"
                    ? "text-emerald-400"
                    : status === "busy"
                      ? "text-amber-400"
                      : status === "congested"
                        ? "text-red-400"
                        : "text-gray-400"
                }
              >
                {status === "smooth"
                  ? t.nav.networkSmooth
                  : status === "busy"
                    ? t.nav.networkBusy
                    : status === "congested"
                      ? t.nav.networkCongested
                      : t.nav.networkOffline}
              </span>
            </div>
            <button
              type="button"
              onClick={toggleLocale}
              className="glass-button rounded-lg px-3 py-2 text-sm font-bold text-white hover:text-[var(--accent-primary)]"
              title={locale === "zh" ? "Switch to English" : "切换到中文"}
            >
              <Languages size={16} />
            </button>
          </div>

          <button
            type="button"
            className="text-[var(--text-primary)] md:hidden"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-40 flex flex-col bg-[var(--bg-void)] px-6 pt-24 md:hidden">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`border-b border-[var(--border-subtle)] py-4 font-[var(--font-rajdhani)] text-2xl font-bold ${
                  active ? "text-[var(--accent-primary)]" : "text-[var(--text-secondary)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ) : null}

      <main className="flex-1 pt-24 pb-20 md:pt-32">{children}</main>

      <footer className="relative overflow-hidden border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[var(--bg-surface-elevated)] via-[var(--bg-void)] to-[var(--bg-void)] opacity-50" />

        <div className="ucp-container relative z-10 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="col-span-1 space-y-6 md:col-span-2">
            <div className="flex items-center gap-3">
              <Hexagon size={24} className="text-[var(--text-tertiary)]" />
              <h3 className="text-xl font-bold tracking-tight">{t.footer.title}</h3>
            </div>
            <p className="max-w-sm leading-relaxed text-[var(--text-secondary)]">{t.footer.description}</p>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-bold tracking-wider text-[var(--text-tertiary)] uppercase">
              {t.footer.protocol}
            </h4>
            <ul className="space-y-3 text-[var(--text-secondary)]">
              <li>
                <Link href="/" className="transition-colors hover:text-[var(--accent-primary)]">
                  {t.nav.overview}
                </Link>
              </li>
              <li>
                <Link href="/discuss" className="transition-colors hover:text-[var(--accent-primary)]">
                  {t.nav.discussions}
                </Link>
              </li>
              <li>
                <Link href="/decide" className="transition-colors hover:text-[var(--accent-primary)]">
                  {t.nav.governance}
                </Link>
              </li>
              <li>
                <Link href="/constitution" className="transition-colors hover:text-[var(--accent-primary)]">
                  {t.nav.constitution}
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setIsAboutOpen(true)}
                  className="transition-colors hover:text-[var(--accent-primary)]"
                >
                  {t.about.linkText}
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-bold tracking-wider text-[var(--text-tertiary)] uppercase">
              {t.footer.connect}
            </h4>
            <div className="flex gap-4 text-[var(--text-secondary)]">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Github"
                className="glass-button group rounded-full p-2 transition-all hover:border-[var(--accent-primary)] hover:text-white"
              >
                <Github size={18} className="transition-transform group-hover:scale-110" />
              </a>
              <a
                href="https://theucp.org"
                target="_blank"
                rel="noreferrer"
                aria-label="Website"
                className="glass-button group rounded-full p-2 transition-all hover:border-[var(--accent-primary)] hover:text-white"
              >
                <Globe size={18} className="transition-transform group-hover:scale-110" />
              </a>
            </div>
          </div>
        </div>

        <div className="ucp-container relative z-10 mt-16 flex flex-col items-center justify-between gap-4 border-t border-[var(--border-subtle)] pt-8 font-mono text-xs text-[var(--text-tertiary)] md:flex-row">
          <p>© 2026 The UCP</p>
          <p>Powered by UCP Protocol</p>
        </div>
      </footer>

      <AboutPlatformDialog isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}
