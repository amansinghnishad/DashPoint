import { Link } from "react-router-dom";

import { APP_ROUTES } from "../../../app/routes/paths";
import InteractiveLines from "../../../features/landing/components/InteractiveLines";

export default function Footer({ embedded = false }) {
  const headingText = embedded ? "text-white" : "text-ink";
  const bodyText = embedded ? "text-white/60" : "text-muted";
  const softText = embedded ? "text-white/40" : "text-muted-soft";
  const hoverText = embedded ? "hover:text-white" : "hover:text-ink";
  const borderStyle = embedded ? "border-white/10" : "border-hairline/60";

  return (
    <footer className={`py-16 px-xl md:px-xxl select-none relative overflow-hidden z-10 ${
      embedded ? "bg-transparent" : "bg-neutral-950 text-white border-t border-white/10"
    }`}>
      {!embedded && (
        <InteractiveLines
          backgroundColor="#0c0a09"
          lineColor="#f99149"
          lineWidth={1.5}
          minLines={25}
          maxLines={65}
          fade={true}
          fadeIntensity={35}
        />
      )}
      <div className="max-w-[1280px] mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
          {/* Brand column */}
          <div className="md:col-span-4 flex flex-col justify-between">
            <div>
              <Link
                to={APP_ROUTES.HOME}
                className={`font-waldenburg-light text-2xl tracking-tight ${headingText} block mb-4`}
              >
                DASHPOINT
              </Link>
              <p className={`text-xs ${bodyText} leading-relaxed max-w-[280px]`}>
                The print-editorial intelligence layer for files, calendar schedules, and workflows. Built with MERN stack precision.
              </p>
            </div>
          </div>

          {/* Navigation link columns */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className={`text-[11px] font-bold ${headingText} uppercase tracking-wider mb-4`}>Platform</h4>
              <ul className={`space-y-2.5 text-xs ${bodyText}`}>
                <li>
                  <Link to={APP_ROUTES.REGISTER} className={`${hoverText} transition-colors`}>
                    AI Chat Assistant
                  </Link>
                </li>
                <li>
                  <Link to={APP_ROUTES.REGISTER} className={`${hoverText} transition-colors`}>
                    Smart Calendar
                  </Link>
                </li>
                <li>
                  <Link to={APP_ROUTES.REGISTER} className={`${hoverText} transition-colors`}>
                    Document Hub
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className={`text-[11px] font-bold ${headingText} uppercase tracking-wider mb-4`}>Manifesto</h4>
              <ul className={`space-y-2.5 text-xs ${bodyText}`}>
                <li>
                  <a href="/#capabilities" className={`${hoverText} transition-colors`}>
                    Product Capabilities
                  </a>
                </li>
                <li>
                  <a href="/#manifesto" className={`${hoverText} transition-colors`}>
                    Core Philosophy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className={`text-[11px] font-bold ${headingText} uppercase tracking-wider mb-4`}>Developer</h4>
              <ul className={`space-y-2.5 text-xs ${bodyText} font-mono`}>
                <li>
                  <span className={softText}>amansinghnishad...</span>
                </li>
                <li>
                  <span className={softText}>v2.4.0-production</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className={`border-t ${borderStyle} pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] ${softText} font-semibold`}>
          <div>
            © 2026 DashPoint. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className={`${hoverText} transition-colors`}>Privacy Policy</a>
            <a href="#" className={`${hoverText} transition-colors`}>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
