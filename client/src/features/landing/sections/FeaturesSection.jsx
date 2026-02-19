import { Calendar, FileText, Youtube, Zap } from "@/shared/ui/icons";

import SectionHeader from "../components/SectionHeader";

const features = [
  {
    icon: Calendar,
    title: "Smart Calendar",
    description:
      "Track events, deadlines, and daily plans in one organized view.",
    gradient: "from-blue-200 via-blue-100 to-indigo-50",
  },
  {
    icon: Youtube,
    title: "YouTube Integration",
    description: "Embed and manage videos directly inside your workspace.",
    gradient: "from-red-200 via-rose-100 to-red-50",
  },
  {
    icon: FileText,
    title: "File Management",
    description: "Upload, organize, and access important files anytime.",
    gradient: "from-amber-200 via-yellow-100 to-amber-50",
  },
  {
    icon: Zap,
    title: "AI Chat Assistant",
    description:
      "Ask, plan, and generate ideas instantly with built-in AI chat.",
    gradient: "from-purple-200 via-violet-100 to-purple-50",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          title="Tools to Nurture Your Ideas"
          description="A focused set of tools to capture, organize, and execute your ideas beautifully."
        />

        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${feature.gradient} p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
            >
              {/* 🪨 Grain */}
              <div className="pointer-events-none absolute inset-0 dp-noise opacity-30" />

              {/* 🌑 Dark Texture */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.08),transparent_60%)]" />

              {/* Content */}
              <div className="relative z-10 flex items-start gap-5">
                {/* Icon Left */}
                <div className="rounded-xl  p-4 shrink-0">
                  <feature.icon size={24} className="text-slate-800" />
                </div>

                {/* Text Right */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {feature.description}
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
