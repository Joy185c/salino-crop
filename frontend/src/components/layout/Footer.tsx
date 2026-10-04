"use client";

import Link from "next/link";
import { Sprout, MapPin, Mail, Phone, Globe } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#020617] border-t border-[#1e293b] pt-12 pb-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-600 shadow-lg shadow-emerald-600/20">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-xl leading-tight">SalinO-Crop</span>
                <span className="text-xs font-semibold text-emerald-400">Intelligence Platform</span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mt-4 max-w-xs">
              Empowering coastal farmers with AI-driven root-zone salinity forecasts and data-backed crop advisory for a climate-resilient Bangladesh.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="https://github.com/Joy185c/salino-crop" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-colors">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { label: "Interactive Map", href: "/#map" },
                { label: "Salinity Forecasts", href: "/#forecast" },
                { label: "Crop Advisory", href: "/#advisory" },
                { label: "Ground Validation", href: "/#validation" },
                { label: "Plot Directory", href: "/plots" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-400 hover:text-emerald-400 text-sm transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-700 group-hover:bg-emerald-500 transition-colors"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Science & Data */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">Science & Data</h3>
            <ul className="space-y-2">
              {[
                { label: "Methodology", href: "/#methodology" },
                { label: "Data Sources", href: "/#data-sources" },
                { label: "Copernicus Sentinel", href: "https://scihub.copernicus.eu/" },
                { label: "AI Models (PINN/RF)", href: "/#methodology" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} target={link.href.startsWith("http") ? "_blank" : "_self"} className="text-gray-400 hover:text-emerald-400 text-sm transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-700 group-hover:bg-emerald-500 transition-colors"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">Contact & Support</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Daffodil International University<br/>Birulia, Savar, Dhaka</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Mail className="w-5 h-5 text-emerald-500 shrink-0" />
                <a href="mailto:support@salinocrop.tech" className="hover:text-emerald-400 transition-colors">support@salinocrop.tech</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>+880 1700-000000</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#1e293b] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs text-center md:text-left">
            &copy; {currentYear} SalinO-Crop. Built by <b>DIU Hustle Brigade</b> for Hack for Humanity.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <Link href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
