import { CheckCircle2 } from "lucide-react";
import SectionHeader from "../components/SectionHeader";

const bullets = [
  "Save content and revisit it later.",
  "Keep your planner widgets visible together.",
  "Open the dashboard and start working immediately.",
];

export default function ShowcaseSection() {
  return (
    <section id="showcase" className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader
              align="left"
              title="A clean workspace that stays out of the way"
              description="Designed to feel calm and fast—so you can focus on the work, not the interface."
            />
            <ul className="mt-8 space-y-3">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-3 text-slate-700">
                  <CheckCircle2 size={18} className="mt-0.5 text-emerald-600" />
                  <span className="text-sm leading-6 sm:text-base">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <video
                className="h-full w-full"
                controls
                preload="metadata"
                poster="/logo.png"
              >
                <source src="/1.mp4" type="video/mp4" />
                <source src="/2.mp4" type="video/mp4" />
              </video>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Demo video (local asset) — replace anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
