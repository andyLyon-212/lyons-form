import Link from "next/link";
import {
  MousePointerClick,
  Sparkles,
  GitBranch,
  LayoutTemplate,
  Palette,
  Share2,
} from "lucide-react";

const FEATURES = [
  {
    icon: MousePointerClick,
    title: "Drag & Drop Builder",
    description:
      "Build forms visually — drag fields, reorder them, and preview in real time.",
  },
  {
    icon: Sparkles,
    title: "AI Generation",
    description:
      "Describe your form in plain English and let AI generate it instantly.",
  },
  {
    icon: GitBranch,
    title: "Smart Logic",
    description:
      "Conditional fields that show or hide based on user answers.",
  },
  {
    icon: LayoutTemplate,
    title: "Starter Templates",
    description:
      "Jump-start with pre-built templates for contact forms, events, and more.",
  },
  {
    icon: Palette,
    title: "Custom Styling",
    description:
      "Full control over colors, fonts, backgrounds, and button styles.",
  },
  {
    icon: Share2,
    title: "Instant Publishing",
    description:
      "One-click publish — share your form via a unique link with anyone.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Create",
    description:
      "Start from scratch, pick a template, or generate with AI.",
  },
  {
    step: "02",
    title: "Customize",
    description:
      "Add fields, set validation rules, and style your form.",
  },
  {
    step: "03",
    title: "Share",
    description:
      "Publish with one click and share your unique form link.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] animate-pulse [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-fuchsia-600/5 blur-[100px] animate-pulse [animation-delay:4s]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-wider">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              LYONS FORM
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-white transition-colors"
            >
              How It Works
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2 text-sm font-medium text-gray-300 border border-white/10 rounded-lg hover:border-white/30 hover:text-white transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-fuchsia-600 hover:from-blue-500 hover:via-purple-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-purple-600/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pt-28 pb-32 text-center">
        <div className="inline-block mb-6 px-4 py-1.5 text-xs font-medium tracking-wide uppercase text-purple-300 border border-purple-500/20 rounded-full bg-purple-500/5">
          AI-Powered Form Builder
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.1] tracking-tight">
          <span className="block">Build Powerful</span>
          <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
            Forms in Minutes
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 leading-relaxed">
          Create, customize, and share beautiful forms with a drag-and-drop
          builder, AI generation, conditional logic, and instant publishing —
          no coding required.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-fuchsia-600 hover:from-blue-500 hover:via-purple-500 hover:to-fuchsia-500 transition-all shadow-xl shadow-purple-600/25 hover:shadow-purple-500/40"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold rounded-xl border border-white/10 text-gray-300 hover:border-white/25 hover:text-white hover:bg-white/5 transition-all"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Build Great Forms
            </span>
          </h2>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">
            Packed with features that make form building fast, flexible, and
            actually enjoyable.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:border-purple-500/20 hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-3 border border-white/5 group-hover:border-purple-500/20 transition-colors">
                <feature.icon className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="relative z-10 mx-auto max-w-5xl px-6 py-24"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold">
            How It{" "}
            <span className="bg-gradient-to-r from-fuchsia-400 to-blue-400 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="mt-4 text-gray-400">
            Three simple steps to your perfect form.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.step} className="text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-purple-600/20 to-blue-600/20 text-2xl font-bold text-purple-300">
                {step.step}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center">
        <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-purple-600/10 via-blue-600/5 to-fuchsia-600/10 p-12 sm:p-16">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Ready to Build?
          </h2>
          <p className="mt-4 text-gray-400 max-w-lg mx-auto">
            Join now and start creating beautiful, smart forms in minutes.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-block px-10 py-4 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-fuchsia-600 hover:from-blue-500 hover:via-purple-500 hover:to-fuchsia-500 transition-all shadow-xl shadow-purple-600/25 hover:shadow-purple-500/40"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Lyons Form. All rights reserved.
          </span>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/login" className="hover:text-gray-300 transition-colors">
              Sign In
            </Link>
            <Link
              href="/register"
              className="hover:text-gray-300 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
