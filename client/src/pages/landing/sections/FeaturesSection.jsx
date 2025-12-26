import {
  Calendar,
  CloudSun,
  FileText,
  Globe,
  LayoutGrid,
  Lock,
  Timer,
  Youtube,
  Zap,
} from "lucide-react";
import SectionHeader from "../components/SectionHeader";

const features = [
  {
    icon: LayoutGrid,
    title: "Custom dashboard",
    description: "Arrange widgets the way you work best.",
  },
  {
    icon: FileText,
    title: "Content extraction",
    description: "Turn web pages into saved, readable content.",
  },
  {
    icon: Youtube,
    title: "Media",
    description: "Keep focus with an embedded YouTube player.",
  },
  {
    icon: CloudSun,
    title: "Weather",
    description: "Quick forecast without leaving your dashboard.",
  },
  {
    icon: Timer,
    title: "Time & focus",
    description: "Utilities that keep your day moving.",
  },
  {
    icon: Calendar,
    title: "Calendar",
    description: "Track events and upcoming deadlines.",
  },
  {
    icon: Lock,
    title: "Secure",
    description: "Auth-aware API calls with token handling.",
  },
  {
    icon: Globe,
    title: "Cross-device",
    description: "Responsive UI for desktop and mobile.",
  },
  {
    icon: Zap,
    title: "Fast",
    description: "Lightweight UI optimized for speed.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Everything you need, in one place"
          description="A focused set of widgets and tools that cover daily workflow without the clutter."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700">
                  <f.icon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {f.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {f.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
