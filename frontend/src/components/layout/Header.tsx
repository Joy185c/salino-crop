"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sprout, Menu, X } from "lucide-react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/#map", label: "Map" },
  { href: "/plots", label: "Plots" },
  { href: "/#forecast", label: "Forecast" },
  { href: "/#advisory", label: "Advisory" },
  { href: "/#validation", label: "Validation" },
  { href: "/#data-sources", label: "Data Sources" },
  { href: "/#methodology", label: "Methodology" },
];

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm px-4 lg:px-6 py-3 flex items-center justify-between">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary">
          <Sprout className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-primary font-bold text-lg leading-tight">SalinO-Crop</span>
          <span className="text-xs font-semibold text-slate-400">Coastal Salinity Intelligence</span>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="hidden lg:flex items-center gap-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-bold pb-1 border-b-2 transition-colors ${
                isActive
                  ? "text-primary border-primary"
                  : "text-slate-400 border-transparent hover:text-primary"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-3 lg:gap-4">
        <div className="text-sm font-bold text-slate-400 hidden sm:flex items-center gap-1 cursor-pointer">
          <span className="text-primary">বাংলা</span>
          <span className="text-slate-700 font-light">|</span>
          <span>EN</span>
        </div>
        {process.env.NEXT_PUBLIC_DEMO_MODE === "true" && (
          <div className="hidden sm:block bg-accent text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
            DEMO
          </div>
        )}
        
        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute top-[100%] left-0 w-full bg-white border-b border-gray-100 shadow-lg flex flex-col p-4 gap-2 lg:hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-sm font-bold p-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-teal-50 text-primary"
                    : "text-gray-500 hover:bg-gray-50 hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between px-3 sm:hidden">
            <div className="text-sm font-bold text-gray-400 flex items-center gap-2">
              <span className="text-primary">বাংলা</span>
              <span>|</span>
              <span>EN</span>
            </div>
            {process.env.NEXT_PUBLIC_DEMO_MODE === "true" && (
              <div className="bg-accent text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
                DEMO
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
