import { Link } from "react-router-dom";
import { Check } from "@/shared/ui/icons";
import SectionHeader from "../components/SectionHeader";

const included = [
  "Clock and calendar widgets",
  "Planner widgets",
  "Saved notes and files",
  "YouTube player widget",
  "Secure auth + API access",
];

export default function PricingSection() {
  return (
    <section id="pricing" className="relative py-28 overflow-hidden">
      {/* Different background style (not same as showcase) */}
      <div className="absolute inset-0 dp-bg" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 pointer-events-none" />

      <div className="relative mx-auto max-w-4xl px-6">
        <SectionHeader
          title="Simple pricing"
          description="Start free. Upgrade when you need more power."
        />

        <div className="mt-20 space-y-10">
          {/* MAIN CARD */}
          <div className="rounded-3xl border dp-border dp-surface p-12 text-center shadow-xl transition-all duration-300 hover:shadow-2xl">
            <h3 className="text-2xl font-semibold dp-text">Free</h3>

            <div className="mt-6 text-6xl font-semibold dp-text">$0</div>
            <p className="mt-2 dp-text-muted text-sm">per month</p>

            <div className="mt-10 mx-auto max-w-md space-y-4 text-left">
              {included.map((f) => (
                <div key={f} className="flex items-start gap-3 dp-text-muted">
                  <Check size={16} className="mt-1 dp-text" />
                  <span className="text-sm">{f}</span>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <Link
                to="/register"
                className="dp-btn-primary inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-semibold transition-all duration-200"
              >
                Get started for free
              </Link>
            </div>
          </div>

          {/* PRO TEASER (Different visual treatment) */}
          <div className="text-center dp-text-muted">
            <p className="text-sm uppercase tracking-widest opacity-70">
              Coming soon
            </p>

            <h4 className="mt-4 text-xl font-semibold dp-text">Pro plan</h4>

            <p className="mt-3 max-w-xl mx-auto text-sm">
              Advanced collaboration, analytics, integrations and priority
              support.
            </p>

            <button
              type="button"
              disabled
              className="mt-8 inline-flex items-center justify-center rounded-full dp-surface dp-border border px-6 py-3 text-sm font-semibold cursor-not-allowed"
            >
              Notify me
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
