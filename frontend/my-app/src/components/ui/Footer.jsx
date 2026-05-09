import { Link } from "react-router-dom";
import { Facebook, Github, Instagram, Linkedin, Mail, MapPin, Phone, Pill, Twitter } from "lucide-react";

const quickLinks = [
  { to: "/", label: "Home" },
  { to: "/search", label: "Search Medicines" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/about", label: "About Us" },
  { to: "/about#contact", label: "Contact" },
];

const contactItems = [
  { icon: Mail, label: "Team Email", value: "contact@medibridge.com", href: "mailto:contact@medibridge.com" },
  { icon: Mail, label: "Support Email", value: "support@medibridge.com", href: "mailto:support@medibridge.com" },
  { icon: Phone, label: "Phone", value: "+91 9876543210", href: "tel:+919876543210" },
  { icon: MapPin, label: "Address", value: "Srinagar, Kashmir" },
];

const socialLinks = [
  { href: "https://instagram.com", label: "Instagram", icon: Instagram },
  { href: "https://facebook.com", label: "Facebook", icon: Facebook },
  { href: "https://x.com", label: "Twitter", icon: Twitter },
  { href: "https://linkedin.com", label: "LinkedIn", icon: Linkedin },
  { href: "https://github.com", label: "GitHub", icon: Github },
];

export function Footer() {
  return (
    <footer className="relative mt-12 border-t border-base-300 bg-gradient-to-b from-base-100 to-base-200/70">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),transparent_60%)]" />
      <div className="container-page relative py-12">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
                <Pill className="h-5 w-5" />
              </span>
              <span className="text-xl font-semibold">MediBridge</span>
            </Link>
            <p className="max-w-sm text-sm text-base-content/75">
              Connecting people with nearby pharmacies instantly.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="btn btn-circle btn-sm border border-base-300 bg-base-100 text-base-content/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400 hover:text-emerald-600"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-base-content/60">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="inline-flex text-base-content/80 transition-colors duration-200 hover:text-emerald-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div id="contact" className="lg:col-span-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-base-content/60">
              Contact Information
            </h3>
            <ul className="space-y-3 text-sm">
              {contactItems.map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-3 rounded-xl border border-base-300 bg-base-100/70 p-3">
                  <Icon className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wide text-base-content/60">{label}</p>
                    {href ? (
                      <a href={href} className="break-all text-base-content/85 hover:text-emerald-600">
                        {value}
                      </a>
                    ) : (
                      <p className="text-base-content/85">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="divider my-6" />
        <div className="flex flex-col gap-2 text-sm text-base-content/65 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 MediBridge — Built by Code Cartel</p>
          <p>Designed for modern medicine discovery and inventory workflows.</p>
        </div>
      </div>
    </footer>
  );
}
