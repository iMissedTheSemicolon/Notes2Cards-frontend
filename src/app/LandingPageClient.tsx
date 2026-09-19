"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useInView } from "framer-motion";
import {
  Target,
  Microscope,
  Package,
  PencilSimpleLine,
  FolderSimplePlus,
  SlidersHorizontal,
  ShieldCheck,
  ImageSquare,
} from "@phosphor-icons/react";

/* ─────────────────────────────────────────────────────────────────────────────
   TYPES
   ──────────────────────────────────────────────────────────────────────────── */
interface ProTier {
  price: string;
  period: string;
  perk: string;
}

interface PricingProps {
  basic: { price: string; period: string };
  pro: {
    monthly: ProTier;
    yearly: ProTier;
    lifetime: ProTier;
  };
}

interface LimitsProps {
  proPageCap: number;      // pages/mo for Pro Monthly & Yearly
  proFileCap: number;      // max pages/file for Pro
  lifetimePageCap: number; // pages/mo for Lifetime
  lifetimeFileCap: number; // max pages/file for Lifetime
}

/* ─────────────────────────────────────────────────────────────────────────────
   STATIC AURA GRADIENT BACKGROUND
   Zero animation cost — just fixed radial gradients that breathe via the
   compositor-only `auraBreathe` keyframe in globals.css (opacity only).
   ──────────────────────────────────────────────────────────────────────────── */
function AuraBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* Top-left — pink/violet */}
      <div
        className="aura-orb-1"
        style={{
          position: "absolute",
          top: "-15%",
          left: "-10%",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(255,93,231,0.22) 0%, rgba(130,50,220,0.08) 50%, transparent 70%)",
          filter: "blur(90px)",
          willChange: "opacity",
        }}
      />
      {/* Top-right — cyan */}
      <div
        className="aura-orb-2"
        style={{
          position: "absolute",
          top: "0%",
          right: "-10%",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(109,181,255,0.2) 0%, rgba(40,100,240,0.07) 55%, transparent 72%)",
          filter: "blur(100px)",
          willChange: "opacity",
        }}
      />
      {/* Bottom-right — teal/green accent */}
      <div
        className="aura-orb-3"
        style={{
          position: "absolute",
          bottom: "5%",
          right: "10%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(0,255,136,0.12) 0%, rgba(109,181,255,0.07) 55%, transparent 72%)",
          filter: "blur(110px)",
          willChange: "opacity",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FORGETTING CURVE GRAPH
   ──────────────────────────────────────────────────────────────────────────── */
function ForgettingCurveGraph() {
  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div
        className="relative rounded-2xl border border-white/10 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, rgba(109,181,255,0.06) 0%, rgba(10,10,10,0.95) 100%)",
          backdropFilter: "blur(40px)",
        }}
      >
        <div className="absolute inset-0 noise-overlay pointer-events-none" />
        <div className="relative z-10 p-6 md:p-8 text-center">
          <p className="text-white/40 text-xs uppercase tracking-[0.2em] font-semibold mb-6"
            style={{ fontFamily: "Outfit, sans-serif" }}>
            Retention Without Active Recall
          </p>

          <div className="flex items-center justify-center gap-6 mb-6 text-xs"
            style={{ fontFamily: "Outfit, sans-serif" }}>
            <span className="flex items-center gap-2">
              <span className="inline-block w-4 h-[2px] bg-[#6DB5FF] rounded" />
              <span className="text-white/50">With Anki (spaced repetition)</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block w-4 h-[2px] border-t-2 border-dashed border-[#FF5DE7]" />
              <span className="text-white/50">Passive re-reading</span>
            </span>
          </div>

          <div className="relative h-48 md:h-56 w-full">
            {/* Y-axis label */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1"
              style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg) translateY(50%)',
                fontFamily: 'Outfit, sans-serif',
                fontSize: '10px',
                color: 'rgba(255,255,255,0.25)',
                letterSpacing: '0.05em',
              }}
            >
              Retention %
            </div>

            {/* X-axis label */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-5"
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '10px',
                color: 'rgba(255,255,255,0.25)',
                letterSpacing: '0.05em',
              }}
            >
              Time →
            </div>

            {/* Grid lines + Y-axis tick labels */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              {[
                { y: 10, label: '100%' },
                { y: 32, label: '75%' },
                { y: 55, label: '50%' },
                { y: 78, label: '25%' },
              ].map(({ y, label }) => (
                <g key={y}>
                  <line x1="14" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
                  <text x="12" y={y + 1.2} textAnchor="end" fill="rgba(255,255,255,0.2)" fontSize="3.2"
                    style={{ fontFamily: 'Outfit, sans-serif' }}>{label}</text>
                </g>
              ))}
            </svg>

            {/* X-axis tick labels */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              {[
                { x: 14, label: 'Day 1' },
                { x: 38, label: 'Day 3' },
                { x: 62, label: 'Day 7' },
                { x: 90, label: 'Day 30' },
              ].map(({ x, label }) => (
                <text key={x} x={x} y="97" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="3.2"
                  style={{ fontFamily: 'Outfit, sans-serif' }}>{label}</text>
              ))}
            </svg>

            {/* Curves */}
            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <filter id="glow-c"><feGaussianBlur stdDeviation="1.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                <filter id="glow-p"><feGaussianBlur stdDeviation="1" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>
              <path d="M 14,15 Q 22,55 28,60 L 28,22 Q 42,65 54,68 L 54,30 Q 68,70 78,72 L 78,35 Q 90,72 100,74"
                fill="none" stroke="#6DB5FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow-c)" />
              <path d="M 14,15 Q 35,75 58,88 Q 78,94 100,96"
                fill="none" stroke="#FF5DE7" strokeWidth="1.5" strokeDasharray="3,3" strokeLinecap="round" filter="url(#glow-p)" />
              {[[28, 22], [54, 30], [78, 35]].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="1.8" fill="#6DB5FF" stroke="#0A0A0A" strokeWidth="0.5" />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN LANDING PAGE CLIENT
   ──────────────────────────────────────────────────────────────────────────── */
export default function LandingPageClient({
  pricing,
  disableLifetime = false,
  limits = { proPageCap: 600, proFileCap: 60, lifetimePageCap: 800, lifetimeFileCap: 80 },
  isLoggedIn = false,
}: {
  pricing: PricingProps;
  disableLifetime?: boolean;
  limits?: LimitsProps;
  isLoggedIn?: boolean;
}) {
  const stepsRef = useRef<HTMLDivElement>(null);
  const stepsInView = useInView(stepsRef, { once: true, margin: "-80px" });
  const router = useRouter();

  // Prefetch auth routes during idle time so navigation feels instant
  useEffect(() => {
    router.prefetch('/login');
    router.prefetch('/signup');
  }, [router]);

  const steps = [
    {
      num: "01",
      title: "Dump your entire semester in.",
      desc: "Drag every dense PDF, slide deck, or scanned handout into the engine. No cherry-picking required.",
      gradient: "from-[#FF5DE7]/20 to-transparent",
      borderHover: "hover:border-[#FF5DE7]/30",
    },
    {
      num: "02",
      title: "Tell it what matters to you.",
      desc: "Prioritise definitions, key facts, deep concepts, or go fully comprehensive. You decide what the engine focuses on.",
      gradient: "from-[#6DB5FF]/20 to-transparent",
      borderHover: "hover:border-[#6DB5FF]/30",
    },
    {
      num: "03",
      title: "Double-click. Import. Study.",
      desc: "Download a .apkg file and open it — Anki imports it automatically. Zero formatting. Zero setup.",
      gradient: "from-[#00FF88]/20 to-transparent",
      borderHover: "hover:border-[#00FF88]/30",
    },
  ];

  const faqs = [
    {
      q: "How is this different from pasting my notes into an AI Chatbot?",
      a: "General-purpose chat tools give you a conversation you have to copy from manually. notes2cards gives you a structured, importable .apkg deck — formatted precisely for Anki's spaced-repetition algorithm, with cloze deletions, proper front/back splits, and depth control. You double-click the file and it's in Anki, ready to review.",
    },
    {
      q: "Will it just generate garbage, low-quality cards?",
      a: "The extraction engine is tuned specifically for high-yield academic content — anatomy, pharmacology, case law, vocabulary — not generic summarisation. You can control depth from quick summary to fully exhaustive coverage. You review and import; nothing goes into Anki without your sign-off.",
    },
    {
      q: "What kind of files can I upload?",
      a: "PDFs (lecture slides, textbook chapters, past papers), images (PNG, JPG — scanned notes, handouts), and PowerPoint files (PPTX). If you study from it, you can upload it.",
    },
    {
      q: "How much can I process on the free plan?",
      a: "Free users get 40 pages per month — that's 40 PDF pages, slides, or images. Paid plans unlock 600–800 pages per month with higher per-file limits. One page = one PDF page, one slide, or one image.",
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes — cancel from your account settings in one click. No lock-in periods, no cancellation fees, no awkward calls with a retention team. The free plan stays free forever with no expiry.",
    },
    {
      q: "Is my material safe? Will it be used for training?",
      a: "Your files are sent to our processing engine and deleted immediately after your deck is generated — typically within seconds. We never store file content and never use it to train any model. Your notes are yours.",
    },
  ];

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-white overflow-x-hidden relative">

      <AuraBackground />

      <div className="relative z-10">

        {/* ════════════════════════════════════════════════════
            HEADER
            ════════════════════════════════════════════════ */}
        <header className="absolute top-0 w-full flex items-center justify-between px-6 py-6 z-50">
          <Link href="/">
            <img src="/logo-horizontal-dark.svg" alt="notes2cards" className="h-8 w-auto" />
          </Link>
          <div className="flex gap-4">
            <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors flex items-center" style={{ fontFamily: "Outfit, sans-serif" }}>
              Log in
            </Link>
          </div>
        </header>

        {/* ════════════════════════════════════════════════════
            HERO — Framework 2: "Desperation / Cheat Code"
            with a nod to Framework 3's precision language
            ════════════════════════════════════════════════ */}
        <motion.section
          id="hero"
          className="relative flex flex-col items-center justify-center min-h-[82vh] pt-24 pb-16 px-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Eyebrow badge */}
          <motion.div
            className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 text-xs font-medium text-white/50"
            style={{ fontFamily: "Outfit, sans-serif", background: "rgba(255,255,255,0.03)" }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] inline-block" style={{ boxShadow: "0 0 6px #00FF88" }} />
            No more typing out 200 cards by hand — AI does it in seconds
          </motion.div>

          <div className="relative z-10 max-w-4xl w-full text-center">
            <h1 className="text-5xl md:text-7xl lg:text-[80px] font-bold tracking-tight leading-[1.08] mb-8">
              Stop wasting hours<br />
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #FF5DE7 0%, #6DB5FF 60%, #00FF88 100%)" }}
              >
                making flashcards.
              </span>
            </h1>

            <p
              className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
              style={{ color: "rgba(255,255,255,0.58)", fontFamily: "Outfit, sans-serif" }}
            >
              Drop in your notes, a PDF, or lecture slides — notes2cards extracts
              every testable fact and builds an exam-ready Anki deck in under two minutes.
              No credit card. No setup. No retyping.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <motion.button
                  className="px-10 py-4 bg-white text-black font-bold rounded-full text-base cursor-pointer"
                  style={{ fontFamily: "Outfit, sans-serif", boxShadow: "0 0 40px rgba(255,255,255,0.12), 0 4px 16px rgba(0,0,0,0.4)" }}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  Extract Your First Deck →
                </motion.button>
              </Link>
              <a
                href="#how-it-works"
                className="text-sm text-white/40 hover:text-white/70 transition-colors"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                See how it works ↓
              </a>
            </div>

            <motion.p
              className="mt-6 text-sm"
              style={{ fontFamily: "Outfit, sans-serif", color: "rgba(255,255,255,0.45)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.7 }}
            >
              <span style={{ color: "#FFD700", letterSpacing: "0.05em" }}>★★★★★</span>
              {" "}
              <span>Trusted by 5,000+ students across 40+ countries</span>
            </motion.p>

            <motion.p
              className="mt-3 text-sm text-white/30"
              style={{ fontFamily: "Outfit, sans-serif" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              40 free pages every month · No credit card required
            </motion.p>
          </div>
        </motion.section>

        {/* ════════════════════════════════════════════════════
            SOCIAL PROOF / PAIN STRIP
            ════════════════════════════════════════════════ */}
        <section className="relative border-y border-white/[0.06]" style={{ background: "rgba(255,255,255,0.015)" }}>
          <div className="max-w-5xl mx-auto py-10 px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              {[
                { stat: "4+ hrs", label: "saved per deck vs. manual card creation" },
                { stat: "100-page", label: "PDFs processed into decks in under 2 minutes" },
                { stat: "Zero", label: "copy-pasting, formatting, or manual data entry" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <div
                    className="text-3xl font-black mb-1"
                    style={{ background: "linear-gradient(135deg, #FF5DE7, #6DB5FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                  >
                    {item.stat}
                  </div>
                  <div className="text-sm text-white/45" style={{ fontFamily: "Outfit, sans-serif" }}>{item.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            HOW IT WORKS — 3 Steps
            ════════════════════════════════════════════════ */}
        <section id="how-it-works" className="py-28 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Stop typing. Start memorizing.
              </h2>
              <p className="text-white/45 max-w-xl mx-auto" style={{ fontFamily: "Outfit, sans-serif" }}>
                You are evaluated on what you know, not how fast you can copy-paste.
              </p>
            </motion.div>

            <div ref={stepsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  className={`relative p-8 rounded-2xl border border-white/10 bg-gradient-to-b ${step.gradient} overflow-hidden ${step.borderHover} transition-colors duration-300`}
                  initial={{ opacity: 0, y: 40 }}
                  animate={stepsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="absolute inset-0 noise-overlay pointer-events-none" />
                  <div className="relative z-10">
                    <span className="text-7xl font-black text-white/[0.07] block leading-none mb-4 select-none">{step.num}</span>
                    <h3 className="text-lg font-bold mb-3 tracking-tight">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-white/60" style={{ fontFamily: "Outfit, sans-serif" }}>{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            SCIENCE SECTION — Why Anki / Forgetting Curve
            ════════════════════════════════════════════════ */}
        <section id="why-anki" className="py-28 px-6 relative border-t border-white/[0.06]">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-xs uppercase tracking-[0.2em] text-white/35 mb-4 font-semibold" style={{ fontFamily: "Outfit, sans-serif" }}>
                The bottleneck was never learning — it was preparation
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
                High-yield facts.<br />Zero manual labor.
              </h2>
              <p className="text-lg mb-6 text-white/60" style={{ fontFamily: "Outfit, sans-serif" }}>
                Top students know Anki works. Spaced repetition and active recall
                are clinically proven to outperform passive re-reading by a significant margin.
              </p>
              <p className="text-lg text-white/80 font-medium" style={{ fontFamily: "Outfit, sans-serif" }}>
                The problem was never the method — it was the hours of manual card-creation
                before you could even start studying. That is precisely what we eliminated.
              </p>
              <Link href="/signup">
                <motion.button
                  className="mt-8 px-8 py-3.5 rounded-full border border-white/15 text-sm font-bold cursor-pointer hover:border-white/40 transition-colors"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Bypass the Data Entry →
                </motion.button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <ForgettingCurveGraph />
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            FEATURES GRID
            ════════════════════════════════════════════════ */}
        <section id="features" className="py-28 px-6 border-t border-white/[0.06]">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Built for the way you actually study.
              </h2>
              <p className="text-white/45" style={{ fontFamily: "Outfit, sans-serif" }}>
                Every feature exists because we asked: what wastes a medical student&rsquo;s time?
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  icon: <Target size={32} weight="duotone" color="#6DB5FF" />,
                  title: "High-Yield Extraction",
                  desc: "The engine identifies testable facts — core concepts, complex formulas, critical details — not just surface-level keywords.",
                },
                {
                  icon: <Microscope size={32} weight="duotone" color="#FF5DE7" />,
                  title: "Dense Text Processing",
                  desc: "Built for the worst offenders: 80-page textbook chapters, complex research papers, and comprehensive slide decks.",
                },
                {
                  icon: <Package size={32} weight="duotone" color="#00FF88" />,
                  title: "Instant Anki Import",
                  desc: "Download a .apkg file. Double-click. It&rsquo;s in Anki. No plugins, no copy-pasting, no re-formatting.",
                },
                {
                  icon: <PencilSimpleLine size={32} weight="duotone" color="#FEFA3D" />,
                  title: "Cloze Deletions",
                  desc: "Generate fill-in-the-blank cards — the format most medical students prefer for active recall of definitions and pathways.",
                },
                {
                  icon: <FolderSimplePlus size={32} weight="duotone" color="#6DB5FF" />,
                  title: "Batch Upload",
                  desc: "Upload an entire module at once. The engine processes every file and outputs a single, unified deck.",
                },
                {
                  icon: <SlidersHorizontal size={32} weight="duotone" color="#FF5DE7" />,
                  title: "Depth Control",
                  desc: "Exam in three days? Use Summary mode. Study week with nothing else on? Go fully Comprehensive.",
                },
                {
                  icon: <ShieldCheck size={32} weight="duotone" color="#00FF88" />,
                  title: "Your Notes Stay Yours",
                  desc: "Files are deleted from our servers the instant your deck is generated. Never stored. Never used for training.",
                },
                {
                  icon: <ImageSquare size={32} weight="duotone" color="#FEFA3D" />,
                  title: "Text & Image Extraction",
                  desc: "Upload PDFs, PPTs, or images. We extract high-yield text AND natively embed crucial diagrams directly into your Anki cards.",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  className="p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:border-white/20 transition-colors duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                >
                  <span className="mb-4 block">{feature.icon}</span>
                  <h3 className="text-[17px] font-bold mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed" style={{ fontFamily: "Outfit, sans-serif" }}
                    dangerouslySetInnerHTML={{ __html: feature.desc }} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            TESTIMONIALS
            ════════════════════════════════════════════════ */}
        <section className="py-24 px-6 border-t border-white/[0.06]">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-white/35 mb-3 font-semibold" style={{ fontFamily: "Outfit, sans-serif" }}>From students who switched</p>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Real results. Real students.</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  quote: "Made 180 anatomy cards from a 45-page PDF in under 90 seconds. Saved me an entire Sunday before clinicals.",
                  name: "Priya M.",
                  detail: "Pre-Med, 2nd Year",
                  color: "#FF5DE7",
                },
                {
                  quote: "I used to spend 3 hours making Anki cards for one lecture. Now it takes 2 minutes. This is genuinely the most useful study tool I've found.",
                  name: "James K.",
                  detail: "Law Student, Final Year",
                  color: "#6DB5FF",
                },
                {
                  quote: "Uploaded my entire biochem module — 200+ slides and had a complete deck ready before my coffee finished brewing!",
                  name: "Sofia L.",
                  detail: "Biomedical Sciences, Year 3",
                  color: "#00FF88",
                },
              ].map((t, i) => (
                <motion.div
                  key={i}
                  className="relative p-8 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.12, duration: 0.55 }}
                >
                  <div className="absolute inset-0 noise-overlay pointer-events-none rounded-2xl" />
                  {/* Quote mark */}
                  <div className="relative z-10">
                    <span className="text-5xl font-black leading-none select-none" style={{ color: t.color, opacity: 0.25 }}>&ldquo;</span>
                    <p className="text-[15px] leading-relaxed text-white/75 -mt-3 mb-6" style={{ fontFamily: "Outfit, sans-serif" }}>
                      {t.quote}
                    </p>
                    <div className="flex items-center gap-3 mt-auto">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-black text-sm font-black flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${t.color}, rgba(255,255,255,0.6))` }}
                      >
                        {t.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{t.name}</div>
                        <div className="text-xs text-white/40" style={{ fontFamily: "Outfit, sans-serif" }}>{t.detail}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stat bar */}
            <motion.div
              className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {[
                { stat: "5,000+", label: "students on the platform" },
                { stat: "2 min", label: "average time from upload to deck" },
                { stat: "3–4 hrs", label: "saved per deck vs. manual card creation" },
              ].map((item, i) => (
                <div key={i} className="py-6 border border-white/[0.06] rounded-2xl bg-white/[0.01]">
                  <div
                    className="text-3xl font-black mb-1"
                    style={{ background: "linear-gradient(135deg, #FF5DE7, #6DB5FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                  >
                    {item.stat}
                  </div>
                  <div className="text-sm text-white/40" style={{ fontFamily: "Outfit, sans-serif" }}>{item.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            AUDIENCE CALLOUT
            ════════════════════════════════════════════════ */}
        <section className="py-20 px-6 border-t border-white/[0.06]">
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="text-center mb-14"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Popular use cases.</h2>
              <p className="text-white/40 text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>
                Works for any student who studies from dense text — here&rsquo;s where it shines most.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: "🔬",
                  title: "STEM & Engineering",
                  items: [
                    "Complex formulas and technical algorithms",
                    "Anatomy, biology & chemistry pathways",
                    "Programming syntax and definitions",
                    "High-yield facts for technical exams like SATs, MCAT, JEE, NEET, USMLE, CA exams, California Bar Exam etc.",
                  ],
                  color: "#FF5DE7",
                },
                {
                  icon: "📚",
                  title: "Humanities & Social Sciences",
                  items: [
                    "Historical dates, events, and timelines",
                    "Psychological and sociological theories",
                    "Case precedents and legal definitions",
                    "Literature analysis and key quotes",
                  ],
                  color: "#6DB5FF",
                },
                {
                  icon: "🚀",
                  title: "Languages & Certifications",
                  items: [
                    "Vocabulary and grammar rules",
                    "IT certifications (CompTIA, AWS, CISSP)",
                    "Medical board exams (USMLE, PLAB)",
                    "Professional licenses and designations",
                  ],
                  color: "#00FF88",
                },
              ].map((audience, i) => (
                <motion.div
                  key={i}
                  className="p-8 rounded-2xl border border-white/10 bg-white/[0.02]"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <div className="text-3xl mb-4">{audience.icon}</div>
                  <h3 className="text-lg font-bold mb-4" style={{ color: audience.color }}>{audience.title}</h3>
                  <ul className="space-y-3">
                    {audience.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-white/60" style={{ fontFamily: "Outfit, sans-serif" }}>
                        <span className="mt-0.5 flex-shrink-0" style={{ color: audience.color }}>→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            PRICING — PAGE-COUNT BASED
            ════════════════════════════════════════════════ */}
        <section id="pricing" className="py-28 px-6 relative border-t border-white/[0.06]">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                What are 4 hours of your time worth?
              </h2>
              <p className="text-white/45 mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
                Simple pricing. 1 page = 1 PDF page, 1 slide, or 1 image.
              </p>
              <p className="text-white/30 text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>
                Less than a coffee a month — and it buys back hours you&rsquo;d spend typing cards.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* Free */}
              <motion.div
                className="relative p-8 rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, delay: 0 }}
              >
                <div className="absolute inset-0 noise-overlay pointer-events-none" />
                <div className="relative z-10 flex flex-col h-full">
                  <div>
                    <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>Basic</h3>
                    <div className="text-4xl font-black mb-1 tracking-tight">
                      {pricing.basic.price}
                      <span className="text-base text-white/40 font-normal ml-1">{pricing.basic.period}</span>
                    </div>
                    <div className="h-5" />
                    <ul className="space-y-3 mb-8 text-white/55 text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>
                      <li className="flex items-center gap-3"><span className="text-white/25">✓</span> 40 pages per month</li>
                      <li className="flex items-center gap-3"><span className="text-white/25">✓</span> Up to 20 pages per file</li>
                      <li className="flex items-center gap-3"><span className="text-white/25">✓</span> Standard Q&A cards</li>
                      <li className="flex items-center gap-3"><span className="text-white/25">✓</span> PDF, Image & PPTX support</li>
                    </ul>
                  </div>
                  <div className="mt-auto">
                    <Link href={isLoggedIn ? "/app" : "/signup"}>
                      <button className="w-full py-3.5 rounded-xl border border-white/20 hover:bg-white hover:text-black transition-all duration-300 font-bold text-sm cursor-pointer" style={{ fontFamily: "Outfit, sans-serif" }}>
                        {isLoggedIn ? "Go to Dashboard" : "Start for Free"}
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Pro Monthly */}
              <motion.div
                className="relative p-8 rounded-3xl border border-[#6DB5FF]/30 bg-[#6DB5FF]/[0.02] overflow-hidden"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="absolute inset-0 noise-overlay pointer-events-none" />
                <div className="relative z-10 flex flex-col h-full">
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-[#6DB5FF]" style={{ fontFamily: "Outfit, sans-serif" }}>Pro Monthly</h3>
                    <div className="text-4xl font-black mb-1 tracking-tight">
                      {pricing.pro.monthly.price}
                      <span className="text-base text-white/40 font-normal ml-1">{pricing.pro.monthly.period}</span>
                    </div>
                    <div className="h-5" />
                    <ul className="space-y-3 mb-8 text-white/80 text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>
                      <li className="flex items-center gap-3"><span className="text-[#6DB5FF]">✓</span> {limits.proPageCap} pages per month</li>
                      <li className="flex items-center gap-3"><span className="text-[#6DB5FF]">✓</span> Up to {limits.proFileCap} pages per file</li>
                      <li className="flex items-center gap-3"><span className="text-[#6DB5FF]">✓</span> Cloze Deletions included</li>
                      <li className="flex items-center gap-3"><span className="text-[#6DB5FF]">✓</span> Prioritized Processing</li>
                    </ul>
                  </div>
                  <div className="mt-auto">
                    <Link href={isLoggedIn ? "/api/checkout?plan=monthly" : "/signup"}>
                      <button className="w-full py-3.5 rounded-xl bg-[#6DB5FF] text-black font-bold text-sm cursor-pointer hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(109,181,255,0.2)]" style={{ fontFamily: "Outfit, sans-serif" }}>
                        Subscribe Monthly
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Pro Yearly — highlighted */}
              <motion.div
                className="relative p-8 rounded-3xl overflow-hidden"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ border: "1px solid rgba(109,181,255,0.5)", boxShadow: "0 0 30px rgba(109,181,255,0.1), inset 0 0 30px rgba(109,181,255,0.05)" }} />
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(109,181,255,0.2) 0%, transparent 70%)", filter: "blur(60px)" }} />
                <div className="absolute inset-0 rounded-3xl" style={{ background: "linear-gradient(180deg, rgba(109,181,255,0.1) 0%, rgba(10,10,10,0.95) 60%)" }} />
                <div className="absolute inset-0 noise-overlay pointer-events-none" />
                <div className="relative z-10 flex flex-col h-full">
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-[#6DB5FF]" style={{ fontFamily: "Outfit, sans-serif" }}>Pro Yearly</h3>
                    <div className="text-4xl font-black mb-1 tracking-tight">
                      {pricing.pro.yearly.price}
                      <span className="text-base text-white/40 font-normal ml-1">{pricing.pro.yearly.period}</span>
                    </div>
                    <div className="h-5 flex items-center">
                      <span className="text-xs font-semibold text-[#00FF88]">{pricing.pro.yearly.perk}</span>
                    </div>
                    <ul className="space-y-3 mb-8 text-white/80 text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>
                      <li className="flex items-center gap-3"><span className="text-[#6DB5FF]">✓</span> {limits.proPageCap} pages per month</li>
                      <li className="flex items-center gap-3"><span className="text-[#6DB5FF]">✓</span> Up to {limits.proFileCap} pages per file</li>
                      <li className="flex items-center gap-3"><span className="text-[#6DB5FF]">✓</span> Cloze Deletions included</li>
                      <li className="flex items-center gap-3"><span className="text-[#6DB5FF]">✓</span> Prioritized Processing</li>
                    </ul>
                  </div>
                  <div className="mt-auto">
                    <Link href={isLoggedIn ? "/api/checkout?plan=yearly" : "/signup"}>
                      <button className="w-full py-3.5 rounded-xl bg-[#6DB5FF] text-black font-bold text-sm cursor-pointer hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(109,181,255,0.3)]" style={{ fontFamily: "Outfit, sans-serif" }}>
                        Subscribe Yearly
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Lifetime — hidden for T4 frontier markets */}
              {!disableLifetime && (
                <motion.div
                  className="relative p-8 rounded-3xl border border-[#FF5DE7]/30 bg-[#FF5DE7]/[0.02] overflow-hidden"
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="absolute inset-0 noise-overlay pointer-events-none" />
                  <div className="relative z-10 flex flex-col h-full">
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-[#FF5DE7]" style={{ fontFamily: "Outfit, sans-serif" }}>Lifetime</h3>
                      <div className="text-4xl font-black mb-1 tracking-tight">{pricing.pro.lifetime.price}</div>
                      <div className="h-5 flex items-center">
                        <span className="text-xs font-semibold text-[#FF5DE7]">{pricing.pro.lifetime.perk}</span>
                      </div>
                      <ul className="space-y-3 mb-8 text-white/80 text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>
                        <li className="flex items-center gap-3"><span className="text-[#FF5DE7]">✓</span> {limits.lifetimePageCap} pages per month, forever</li>
                        <li className="flex items-center gap-3"><span className="text-[#FF5DE7]">✓</span> Up to {limits.lifetimeFileCap} pages per file</li>
                        <li className="flex items-center gap-3"><span className="text-[#FF5DE7]">✓</span> Cloze Deletions included</li>
                        <li className="flex items-center gap-3"><span className="text-[#FF5DE7]">✓</span> Highest Priority Queue</li>
                      </ul>
                    </div>
                    <div className="mt-auto">
                      <Link href={isLoggedIn ? "/api/checkout?plan=lifetime" : "/signup"}>
                        <button className="w-full py-3.5 rounded-xl bg-[#FF5DE7] text-black font-bold text-sm cursor-pointer hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(255,93,231,0.2)]" style={{ fontFamily: "Outfit, sans-serif" }}>
                          Get Lifetime Access
                        </button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <motion.p
              className="text-center text-sm text-white/30 mt-8"
              style={{ fontFamily: "Outfit, sans-serif" }}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ delay: 0.4 }}
            >
              1 page = 1 PDF page · 1 PowerPoint slide · 1 image. Quota resets every 30 days.
            </motion.p>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            FAQ
            ════════════════════════════════════════════════ */}
        <section id="faq" className="py-28 px-6 border-t border-white/[0.06]" style={{ background: "rgba(255,255,255,0.01)" }}>
          <div className="max-w-3xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
            </motion.div>
            <div className="space-y-5">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, delay: i * 0.08 }}
                >
                  <h3 className="text-[16px] font-semibold mb-2 text-white">{faq.q}</h3>
                  <p className="text-white/55 text-sm leading-relaxed" style={{ fontFamily: "Outfit, sans-serif" }}>{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            FINAL CTA
            ════════════════════════════════════════════════ */}
        <section id="cta" className="py-28 px-6 relative border-t border-white/[0.06]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, rgba(255,93,231,0.08) 0%, transparent 70%)", filter: "blur(80px)" }} />
          <motion.div
            className="max-w-3xl mx-auto text-center relative z-10"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Exam in three days.<br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #FF5DE7 0%, #6DB5FF 100%)" }}>
                Deck ready in two minutes.
              </span>
            </h2>
            <p className="text-lg text-white/45 mb-10" style={{ fontFamily: "Outfit, sans-serif" }}>
              Stop re-reading the same chapter hoping it sticks.<br />
              Your first 40 pages are free.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <motion.button
                  className="px-10 py-4 bg-white text-black font-bold rounded-full text-base cursor-pointer"
                  style={{ fontFamily: "Outfit, sans-serif", boxShadow: "0 0 40px rgba(255,255,255,0.1), 0 4px 16px rgba(0,0,0,0.4)" }}
                  whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  Extract Your First Deck →
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ════════════════════════════════════════════════════
            FOOTER
            ════════════════════════════════════════════════ */}
        <footer className="border-t border-white/[0.06] pt-16 pb-10 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <img src="/logo-horizontal-dark.svg" alt="notes2cards" style={{ height: 28, width: 'auto' }} />
              </Link>
              <p className="text-white/45 text-sm max-w-sm" style={{ fontFamily: "Outfit, sans-serif" }}>
                Built for students and lifelong learners who are serious about retention.
                Upload. Extract. Study.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm text-white/70">Product</h4>
              <ul className="space-y-2 text-sm text-white/40" style={{ fontFamily: "Outfit, sans-serif" }}>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it works</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Log In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm text-white/70">Legal</h4>
              <ul className="space-y-2 text-sm text-white/40" style={{ fontFamily: "Outfit, sans-serif" }}>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/refunds" className="hover:text-white transition-colors">Refunds &amp; Returns</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.06]">
            <span className="text-sm text-white/25" style={{ fontFamily: "Outfit, sans-serif" }}>
              © {new Date().getFullYear()} notes2cards. All rights reserved.
            </span>
          </div>
        </footer>

      </div>
    </div>
  );
}
