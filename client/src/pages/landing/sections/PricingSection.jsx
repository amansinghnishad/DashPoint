import { Link } from "react-router-dom";
import { Check, Sparkles } from "lucide-react";
import SectionHeader from "../components/SectionHeader";

const included = [
  "Clock, weather, and calendar widgets",
  "Sticky notes and todo lists",
  "Content extraction and saved items",
  "YouTube player widget",
  "Secure auth + API access",
];

export default function PricingSection() {
  return (
    <section id="pricing" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Simple pricing"
          description="Start with the essentials today. Add advanced capabilities when you need them."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Free</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Great for personal productivity.
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-semibold text-slate-900">$0</div>
                <div className="text-sm text-slate-500">per month</div>
              </div>
            </div>

            <ul className="mt-6 space-y-3">
              {included.map((f) => (
                <li key={f} className="flex items-start gap-3 text-slate-700">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <Check size={14} />
                  </span>
                  <span className="text-sm leading-6">{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link
                to="/register"
                className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Create an account
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Pro (coming soon)
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Advanced AI features, collaboration, and deeper insights.
            </p>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-medium text-slate-900">
                Planned additions
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Team workflows, analytics, integrations, priority support.
              </p>
            </div>

            <button
              type="button"
              disabled
              className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-slate-200 px-6 py-3 text-sm font-semibold text-slate-600"
            >
              Notify me
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
