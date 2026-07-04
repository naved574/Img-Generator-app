"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight, Sparkles, Zap, Users, ShoppingBag, Layers, Code2 } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { MarketingHeader, MarketingFooter } from "@/components/site/MarketingHeader";
import { liveFeedItems, mockCreators } from "@/lib/mock";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Split text into spans of words (each word wrapped for staggered reveal)
function splitWords(text: string) {
  return text.split(" ").map((w, i) => (
    <span key={i} className="reveal-word inline-block overflow-hidden align-bottom">
      <span className="inline-block will-change-transform">{w}&nbsp;</span>
    </span>
  ));
}

export default function LandingPage() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root.current) return;
    const ctx = gsap.context(() => {
      // ====== HERO INTRO TIMELINE ======
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-eyebrow", { y: 20, opacity: 0, duration: 0.6 })
        .from(
          ".hero-title .reveal-word > span",
          { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.05 },
          "-=0.2",
        )
        .from(".hero-sub", { y: 20, opacity: 0, duration: 0.7 }, "-=0.5")
        .from(".hero-cta > *", { y: 16, opacity: 0, duration: 0.5, stagger: 0.08 }, "-=0.4")
        .from(".hero-meta", { opacity: 0, duration: 0.6 }, "-=0.3");

      // SVG accent draw
      const path = root.current!.querySelector<SVGPathElement>(".hero-accent path");
      if (path) {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        tl.to(path, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" }, "-=1.2");
      }

      // Eyebrow dot pulse
      gsap.to(".eyebrow-dot", {
        scale: 1.6,
        opacity: 0.4,
        repeat: -1,
        yoyo: true,
        duration: 1.1,
        ease: "sine.inOut",
        transformOrigin: "center",
      });

      // ====== HERO PARALLAX ======
      gsap.to(".hero-bg", {
        yPercent: 18,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // ====== SECTION HEADINGS (scroll-revealed words) ======
      gsap.utils.toArray<HTMLElement>(".scroll-heading").forEach((el) => {
        const words = el.querySelectorAll(".reveal-word > span");
        gsap.from(words, {
          yPercent: 110,
          opacity: 0,
          duration: 0.8,
          stagger: 0.05,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });

      gsap.utils.toArray<HTMLElement>(".scroll-fade").forEach((el) => {
        gsap.from(el, {
          y: 24,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });

      // ====== FEATURE GRID STAGGER ======
      gsap.from(".feature-card", {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: ".features-grid", start: "top 80%" },
      });

      // ====== CREATOR CARDS ======
      gsap.from(".creator-card", {
        y: 30,
        opacity: 0,
        scale: 0.97,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: { trigger: ".creators-grid", start: "top 85%" },
      });

      // ====== PRICING CTA ======
      gsap.from(".pricing-cta", {
        y: 30,
        opacity: 0,
        scale: 0.98,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: ".pricing-cta", start: "top 85%" },
      });

      // Sparkle ping inside pricing
      gsap.to(".sparkle-ping", {
        scale: 1.4,
        opacity: 0.5,
        repeat: -1,
        yoyo: true,
        duration: 1.4,
        ease: "sine.inOut",
        transformOrigin: "center",
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="min-h-screen">
      <MarketingHeader />

      {/* HERO */}
      <section className="hero-section relative overflow-hidden">
        <div
          className="hero-bg absolute inset-0 -z-10"
          style={{ background: "var(--gradient-radial)" }}
        />

        {/* Decorative SVG */}
        <svg
          className="hero-accent pointer-events-none absolute right-[-60px] top-20 -z-10 hidden h-[420px] w-[420px] opacity-40 md:block"
          viewBox="0 0 400 400"
          fill="none"
        >
          <path
            d="M20 200 C 80 60, 220 60, 280 180 S 380 360, 380 200"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="280" cy="180" r="3" fill="currentColor" className="sparkle-ping" />
          <circle cx="120" cy="120" r="2" fill="currentColor" className="sparkle-ping" />
        </svg>

        <div className="mx-auto max-w-7xl px-6 pt-24 pb-20 md:pt-36 md:pb-32">
          <div className="max-w-3xl">
            <span className="hero-eyebrow font-mono inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
              <span className="eyebrow-dot h-1.5 w-1.5 rounded-full bg-foreground" />
              Now in public beta · 50 free credits daily
            </span>
            <h1 className="hero-title mt-8 text-5xl font-display font-semibold leading-[1.05] tracking-tight md:text-7xl text-balance">
              {splitWords("AI image generation,")}
              <br />
              <span className="text-muted-foreground">{splitWords("built for creators.")}</span>
            </h1>
            <p className="hero-sub mt-6 max-w-xl text-lg text-muted-foreground text-pretty">
              Generate. Remix. Share. Monetize. The community-first AI platform with the workflows
              you actually need.
            </p>
            <div className="hero-cta mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="/auth/signup"
                className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Start creating free{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/explore"
                className="rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-surface"
              >
                Explore community
              </Link>
            </div>
            <div className="hero-meta mt-12 flex items-center gap-6 text-xs text-muted-foreground">
              <span>★ 4.9 from 2,400+ creators</span>
              <span>•</span>
              <span>1.2M images generated this week</span>
            </div>
          </div>
        </div>

        {/* Live feed strip */}
        <div className="scroll-fade hairline-t hairline-b overflow-hidden bg-background/40">
          <div
            className="flex animate-[scroll_60s_linear_infinite] gap-4 px-6 py-6"
            style={{ width: "max-content" }}
          >
            {[...liveFeedItems(12), ...liveFeedItems(12)].map((it, i) => (
              <div key={i} className="group relative h-40 w-40 shrink-0 overflow-hidden rounded-xl">
                <img
                  src={it.src}
                  alt={it.prompt}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="font-mono truncate text-[10px] text-white/70">@{it.creator}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-2xl">
          <p className="scroll-fade font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Why Lumen
          </p>
          <h2 className="scroll-heading mt-4 text-4xl font-display font-semibold tracking-tight md:text-5xl">
            {splitWords("Not another image generator.")}
          </h2>
          <p className="scroll-fade mt-4 text-muted-foreground">
            An entire creator ecosystem: workflows, remix culture, marketplace, monetization. Built
            for how creators actually work.
          </p>
        </div>
        <div className="features-grid mt-16 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: "Pro image generation",
              body: "Multiple models, every aspect ratio, fine controls. Generate in 2 seconds.",
            },
            {
              icon: Users,
              title: "Community-first",
              body: "Remix anything. Follow creators. Build a following on your work.",
            },
            {
              icon: ShoppingBag,
              title: "Built-in marketplace",
              body: "Sell prompts, style packs, LoRAs. Keep 80% of every sale.",
            },
            {
              icon: Zap,
              title: "Workflow builder",
              body: "Chain models, conditions, and outputs into reusable visual workflows.",
            },
            {
              icon: Layers,
              title: "AI canvas editor",
              body: "Inpaint, outpaint, upscale, remove background — all in the browser.",
            },
            {
              icon: Code2,
              title: "Developer API",
              body: "Production-grade API with metered pricing. Ship in minutes.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="feature-card bg-background p-8 transition-colors hover:bg-surface"
            >
              <f.icon className="h-5 w-5" />
              <h3 className="mt-6 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRENDING CREATORS */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="scroll-fade font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Trending creators
            </p>
            <h2 className="scroll-heading mt-3 text-3xl font-display font-semibold">
              {splitWords("Built by humans you'll want to follow")}
            </h2>
          </div>
          <Link
            href="/explore"
            className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
          >
            View all →
          </Link>
        </div>
        <div className="creators-grid mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {mockCreators.slice(0, 4).map((c) => (
            <Link
              key={c.handle}
              href={`/creators/${c.handle}`}
              className="creator-card group rounded-2xl border border-border p-5 transition-colors hover:bg-surface"
            >
              <div className="flex items-center gap-3">
                <img src={c.avatar} alt={c.name} className="h-12 w-12 rounded-full bg-surface" />
                <div>
                  <p className="font-display font-semibold">{c.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">@{c.handle}</p>
                </div>
              </div>
              <div className="mt-5 flex gap-6 text-xs text-muted-foreground">
                <span>
                  <span className="text-foreground font-medium">
                    {c.followers.toLocaleString()}
                  </span>{" "}
                  followers
                </span>
                <span>
                  <span className="text-foreground font-medium">{c.generations}</span> works
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="pricing-cta relative overflow-hidden rounded-3xl border border-border bg-surface p-12 text-center">
          <svg
            className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 opacity-20"
            viewBox="0 0 200 200"
            fill="none"
          >
            <circle
              cx="100"
              cy="100"
              r="60"
              stroke="currentColor"
              strokeWidth="1"
              className="sparkle-ping"
            />
            <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="0.5" />
          </svg>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Pricing
          </p>
          <h2 className="mt-4 text-4xl font-display font-semibold md:text-5xl">
            Free to start. Affordable to scale.
          </h2>
          <p className="mt-4 text-muted-foreground">
            50 credits daily on the free plan · Creator ₹499/mo · Pro ₹1999/mo
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/pricing"
              className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-surface"
            >
              See plans
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
            >
              Start free
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />

      <style>{`@keyframes scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
    </div>
  );
}
