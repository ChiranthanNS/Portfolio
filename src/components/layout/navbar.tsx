"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, Menu, X } from "lucide-react";
import { profile } from "../../content/profile";
import { cn } from "../../lib/utils";
import { scrollToHash } from "../../lib/scroll";

const navLinks = [
  { label: "Projects", href: "/#projects" },
  { label: "Experience", href: "/#experience" },
  { label: "Skills", href: "/#skills" },
  { label: "Contact", href: "/#contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection(null);
      return;
    }
    const sections = navLinks
      .map((link) => link.href.split("#")[1])
      .filter((id): id is string => Boolean(id))
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [pathname]);

  function handleNavClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    if (href.startsWith("/#")) {
      e.preventDefault();
      setMenuOpen(false);
      if (pathname === "/") {
        scrollToHash(href.slice(1));
      } else {
        window.location.href = href;
      }
    } else {
      setMenuOpen(false);
    }
  }

  function handleHireMe() {
    setMenuOpen(false);
    if (pathname === "/") {
      scrollToHash("contact");
    } else {
      window.location.href = "/#contact";
    }
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-200",
        scrolled || menuOpen
          ? "border-border bg-background/85 border-b backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8"
        aria-label="Main navigation"
      >
        {/* Logo matching reference badge */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-heading text-sm font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
        >
          <div className="flex size-8 items-center justify-center rounded-xl border border-primary/30 bg-surface-2 font-mono text-xs font-bold text-primary shadow-[0_0_12px_rgba(52,211,153,0.15)]">
            C
          </div>
          <span className="font-semibold text-[0.95rem] tracking-tight">
            {profile.fullName}
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            const sectionId = link.href.split("#")[1];
            const isActive = activeSection === sectionId;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={cn(
                  "relative py-1 text-sm font-medium transition-colors",
                  isActive
                    ? "text-foreground font-semibold after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        {/* Desktop action buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={handleHireMe}
            className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold shadow-sm transition-all duration-150"
          >
            Hire Me
          </button>

          {profile.cvPath ? (
            <a
              href={profile.cvPath}
              download
              className="border-border bg-surface-2 hover:bg-surface text-foreground hover:border-primary/40 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors"
            >
              <Download className="size-3.5" />
              <span>Resume</span>
            </a>
          ) : (
            <span
              className="border-border bg-surface-2 text-muted-foreground inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium opacity-50"
              title="Resume pending"
            >
              <Download className="size-3.5" />
              <span>Resume</span>
            </span>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="text-muted-foreground hover:text-foreground md:hidden p-1.5"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="border-border bg-background/95 border-t px-5 pb-6 pt-3 backdrop-blur-lg md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-muted-foreground hover:text-foreground rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-2"
              >
                {link.label}
              </a>
            ))}
            <div className="border-border my-2 border-t" />
            <div className="flex flex-col gap-2.5 pt-1">
              <button
                onClick={handleHireMe}
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full cursor-pointer items-center justify-center rounded-full py-2.5 text-sm font-semibold"
              >
                Hire Me
              </button>
              {profile.cvPath ? (
                <a
                  href={profile.cvPath}
                  download
                  className="border-border bg-surface-2 text-foreground hover:bg-surface flex w-full items-center justify-center gap-2 rounded-full border py-2.5 text-sm font-medium"
                >
                  <Download className="size-4" />
                  Download Resume
                </a>
              ) : (
                <span className="border-border bg-surface-2 text-muted-foreground flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border py-2.5 text-sm font-medium opacity-50">
                  <Download className="size-4" />
                  Resume (pending)
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
