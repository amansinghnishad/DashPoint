import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../../app/routes/paths";

export default function Footer({ embedded = false }) {
  return (
    <footer className={`py-16 px-xl md:px-xxl select-none ${
      embedded ? "bg-transparent" : "bg-surface-card border-t border-hairline"
    }`}>
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
          {/* Brand column */}
          <div className="md:col-span-4 flex flex-col justify-between">
            <div>
              <Link
                to={APP_ROUTES.HOME}
                className="font-waldenburg-light text-2xl tracking-tight text-ink block mb-4"
              >
                DASHPOINT
              </Link>
              <p className="text-xs text-muted leading-relaxed max-w-[280px]">
                The print-editorial intelligence layer for files, calendar schedules, and workflows. Built with MERN stack precision.
              </p>
            </div>
          </div>

          {/* Navigation link columns */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="text-[11px] font-bold text-ink uppercase tracking-wider mb-4">Platform</h4>
              <ul className="space-y-2.5 text-xs text-muted">
                <li>
                  <Link to={APP_ROUTES.REGISTER} className="hover:text-ink transition-colors">
                    AI Chat Assistant
                  </Link>
                </li>
                <li>
                  <Link to={APP_ROUTES.REGISTER} className="hover:text-ink transition-colors">
                    Smart Calendar
                  </Link>
                </li>
                <li>
                  <Link to={APP_ROUTES.REGISTER} className="hover:text-ink transition-colors">
                    Document Hub
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-[11px] font-bold text-ink uppercase tracking-wider mb-4">Manifesto</h4>
              <ul className="space-y-2.5 text-xs text-muted">
                <li>
                  <a href="/#capabilities" className="hover:text-ink transition-colors">
                    Product Capabilities
                  </a>
                </li>
                <li>
                  <a href="/#manifesto" className="hover:text-ink transition-colors">
                    Core Philosophy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-bold text-ink uppercase tracking-wider mb-4">Developer</h4>
              <ul className="space-y-2.5 text-xs text-muted font-mono">
                <li>
                  <span className="text-muted-soft">amansinghnishad...</span>
                </li>
                <li>
                  <span className="text-muted-soft">v2.4.0-production</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-t border-hairline/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-soft font-semibold">
          <div>
            © 2026 DashPoint. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-ink transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-ink transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
