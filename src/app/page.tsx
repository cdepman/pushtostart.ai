import { Navbar } from "@/components/shared/navbar";
import { CtaButton } from "@/components/landing/cta-button";
import { PromptCopySection } from "@/components/landing/prompt-copy-section";
import { Sparkles, Eye, Globe } from "lucide-react";

const STEPS = [
  {
    icon: Sparkles,
    title: "Create with Claude",
    description:
      "Ask Claude to build something for you — a calculator, quiz, recipe page, or anything you can imagine.",
  },
  {
    icon: Eye,
    title: "Paste & Preview",
    description:
      "Copy your creation from Claude and paste it here. You'll see a live preview right away.",
  },
  {
    icon: Globe,
    title: "Publish It",
    description:
      "Choose a name and hit publish. Your creation gets its own link you can share with anyone.",
  },
];

export default function LandingPage() {
  return (
    <div className="theme-light min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(99,102,241,0.06), transparent)",
          }}
        />

        <div className="relative mx-auto max-w-4xl px-6 pb-20 pt-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Free while in beta
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            Create with Claude.
            <br />
            <span className="text-primary">Share with the world.</span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Turn the things you make in Claude into real websites with their own
            link. Just paste, preview, and publish — no technical skills needed.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <CtaButton label="Get Started — It's Free" />
          </div>
          <div className="mt-4 flex justify-center">
            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              See how it works &darr;
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              How it works
            </p>
            <h2 className="text-3xl font-bold">Three steps. Thirty seconds.</h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <step.icon size={24} className="text-primary" />
                </div>
                <div className="mb-1 text-xs font-medium text-muted-foreground">
                  Step {i + 1}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Try this in Claude */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              Try it yourself
            </p>
            <h2 className="text-3xl font-bold">
              Start with a prompt, end with a website
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Copy one of these prompts into Claude, then bring your creation
              here to publish it.
            </p>
          </div>

          <PromptCopySection />
        </div>
      </section>

      {/* What you can create */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              Ideas to get you started
            </p>
            <h2 className="text-3xl font-bold">
              If you can imagine it, you can publish it
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Tip calculators & unit converters",
              "Fun quizzes & trivia games",
              "Personal portfolio pages",
              "Charts & visual summaries",
              "Simple games & puzzles",
              "Handy everyday tools",
              "Event pages & invitations",
              "Interactive how-to guides",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-border bg-card px-5 py-4 text-sm"
              >
                <span className="mr-2 text-primary">&#x203A;</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Publish your first creation
          </h2>
          <p className="mb-8 text-muted-foreground">
            Free while in beta. Publish up to 3 creations on your own link. No
            credit card needed.
          </p>
          <CtaButton label="Get Started Free" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-4xl px-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PushToStart</p>
        </div>
      </footer>
    </div>
  );
}
