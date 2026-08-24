import { getTranslations } from "next-intl/server";
import { KeyRound, MessageCircle, Wallet } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";

export default async function HowItWorks() {
  const t = await getTranslations("howItWorks");

  const steps = [
    { icon: KeyRound, title: t("step1Title"), desc: t("step1Desc") },
    { icon: MessageCircle, title: t("step2Title"), desc: t("step2Desc") },
    { icon: Wallet, title: t("step3Title"), desc: t("step3Desc") },
  ];

  return (
    <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-24 px-4 sm:px-6">
      <FadeIn>
        <h2 className="text-center text-2xl font-black sm:text-3xl">
          <span className="text-gradient">{t("title")}</span>
        </h2>
      </FadeIn>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {steps.map((step, index) => (
          <FadeIn key={step.title} delay={index * 0.12}>
            <div className="glass relative h-full rounded-2xl p-6 transition-transform hover:-translate-y-1">
              <span
                className="absolute end-5 top-5 text-5xl font-black text-white/5"
                aria-hidden
              >
                {index + 1}
              </span>
              <span className="grid size-11 place-items-center rounded-xl bg-primary/15 glow-cyan">
                <step.icon className="size-5 text-primary" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-black">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{step.desc}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
