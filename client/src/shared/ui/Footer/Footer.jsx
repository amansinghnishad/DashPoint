import { Link } from "react-router-dom";
import { Github, Mail, MapPin } from "@/shared/ui/icons";
import { APP_ROUTES } from "../../../app/routes/paths";
import useTheme from "../../../hooks/useTheme";

const links = [
  { label: "Features", href: "#features" },
  { label: "Demo", href: "#showcase" },
  { label: "Pricing", href: "#pricing" },
];

export default function Footer({ embedded = false }) {
  const { theme } = useTheme();
  const logoSrc =
    theme === "dark" ? "/Dark-mode-logo.png" : "/Light-mode-logo.png";

  return (
    <footer
      className={`relative overflow-hidden ${
        embedded ? "bg-transparent" : "bg-slate-950"
      }`}
    >
      {!embedded ? (
        <div
          className="dp-glow pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <div className="absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-indigo-600/30 blur-3xl" />
          <div className="absolute -bottom-24 right-[-10rem] h-72 w-[36rem] rounded-full bg-amber-400/15 blur-3xl" />
        </div>
      ) : null}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative border-t border-white/10 py-12">
          <div className="grid gap-10 lg:grid-cols-3">
            <div>
              <img src={logoSrc} alt="DashPoint" className="h-14" />
              <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">
                A clean, modern dashboard for organizing tasks, notes, and saved
                content.
              </p>
            </div>

            <div className="grid gap-10 sm:grid-cols-2 lg:col-span-2">
              <div>
                <p className="text-sm font-semibold text-white">Quick links</p>
                <ul className="mt-4 space-y-2">
                  {links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-sm text-white/70 hover:text-white"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                  <li>
                    <Link
                      to={APP_ROUTES.LOGIN}
                      className="text-sm text-white/70 hover:text-white"
                    >
                      Sign in
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={APP_ROUTES.REGISTER}
                      className="text-sm text-white/70 hover:text-white"
                    >
                      Create account
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <p className="text-sm font-semibold text-white">Contact</p>
                <div className="mt-4 space-y-3 text-sm text-white/70">
                  <div className="flex items-start gap-2">
                    <Mail size={16} className="mt-0.5 text-white/60" />
                    <span>hello@dashpoint.com</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="mt-0.5 text-white/60" />
                    <span>Lucknow, UP</span>
                  </div>
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 text-white/70 hover:text-white"
                  >
                    <Github size={16} className="text-white/60" />
                    <span>GitHub</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-white/60">
              © {new Date().getFullYear()} DashPoint. All rights reserved.
            </p>
            <p className="text-xs text-white/60">
              Built for a fast, focused workflow.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
