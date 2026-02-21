import { Calendar, FileText, Youtube, Zap } from "@/shared/ui/icons";
import SectionHeader from "../components/SectionHeader";

const features = [
  {
    icon: Calendar,
    title: "Smart Calendar",
    description:
      "Track events, deadlines, and daily plans in one organized view.",
  },
  {
    icon: Youtube,
    title: "YouTube Integration",
    description: "Embed and manage videos directly inside your workspace.",
  },
  {
    icon: FileText,
    title: "File Management",
    description: "Upload, organize, and access important files anytime.",
  },
  {
    icon: Zap,
    title: "AI Chat Assistant",
    description:
      "Ask, plan, and generate ideas instantly with built-in AI chat.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-transparent py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          title="Tools to Nurture Your Ideas"
          description="A focused set of tools to capture, organize, and execute your ideas beautifully."
        />

        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="
                relative overflow-hidden rounded-2xl 
                dp-surface 
                border dp-border
                p-8
                transition-all duration-300
                hover:-translate-y-1 
                hover:shadow-xl
              "
            >
              {/* subtle theme glow */}
              <div className="pointer-events-none absolute inset-0 dp-glow opacity-20" />

              {/* Content */}
              <div className="relative z-10 flex items-start gap-5">
                {/* Icon */}
                <div className="p-4 shrink-0 ">
                  <feature.icon size={24} className="dp-text" />
                </div>

                {/* Text */}
                <div>
                  <h3 className="text-lg font-semibold dp-text">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 dp-text-muted">
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
