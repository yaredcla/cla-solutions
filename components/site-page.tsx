"use client";

import { FormEvent, useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Check,
  ExternalLink,
  Mail,
  Menu,
  Moon,
  Phone,
  Send,
  Sun,
  UserRound,
  X
} from "lucide-react";
import {
  BarChart3,
  Building2,
  Code2,
  GraduationCap,
  Globe2,
  LineChart,
  Megaphone,
  Palette,
  ShoppingCart,
  ShieldCheck,
  Store,
  Utensils
} from "lucide-react";
import {
  navItems,
} from "@/lib/site-data";
import { defaultSiteState, type SiteState } from "@/lib/site-state";

function SectionHeading({
  eyebrow,
  title,
  copy,
  inverted = false
}: {
  eyebrow: string;
  title: string;
  copy: string;
  inverted?: boolean;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand dark:text-cyan">{eyebrow}</p>
      <h2 className={`mt-3 text-3xl font-bold md:text-5xl ${inverted ? "text-white" : "text-ink dark:text-white"}`}>{title}</h2>
      <p className={`mt-4 text-base leading-7 ${inverted ? "text-slate-300" : "text-slate-600 dark:text-slate-300"}`}>{copy}</p>
    </div>
  );
}

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export default function SitePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [siteState, setSiteState] = useState<SiteState>(defaultSiteState);
  const [savingMessage, setSavingMessage] = useState("");
  const [contactError, setContactError] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    let alive = true;
    fetch("/api/site-state", { cache: "no-store" })
      .then((response) => response.json())
      .then((state: SiteState) => {
        if (alive) setSiteState(state);
      })
      .catch(() => null);
    return () => {
      alive = false;
    };
  }, []);

  function toggleTheme() {
    setDarkMode((current) => {
      const next = !current;
      document.documentElement.classList.toggle("dark", next);
      window.localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    setContactError("");
    setSavingMessage("Sending...");
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      setSavingMessage("");
      setContactError("Something went wrong while sending your message.");
      return;
    }
    setSubmitted(true);
    setSavingMessage("Message sent.");
    form.reset();
  }

  const serviceIcons = [Globe2, ShoppingCart, Code2, Palette, Megaphone, ShieldCheck];
  const portfolioIcons = [Building2, LineChart, Utensils, GraduationCap, Store, BarChart3];
  const services = siteState.services.map((service, index) => ({
    ...service,
    icon: serviceIcons[index % serviceIcons.length]
  }));
  const portfolio = siteState.portfolio.map((item, index) => ({
    ...item,
    icon: portfolioIcons[index % portfolioIcons.length]
  }));
  const highlightIcons = [Globe2, BarChart3, ShieldCheck];
  const trustIcons = [ShieldCheck, ArrowRight, Phone, ExternalLink, Check, Building2];

  return (
    <main className="min-h-screen bg-white text-ink transition-colors dark:bg-slate-950 dark:text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="CLA Solutions home">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-ink text-sm font-black text-white dark:bg-white dark:text-ink">
              {siteState.settings.companyName.slice(0, 3).toUpperCase()}
            </span>
            <span>
              <span className="block text-sm font-bold">{siteState.settings.companyName}</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">{siteState.settings.tagline}</span>
            </span>
          </a>
          <div className="hidden items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="text-sm font-medium text-slate-600 transition hover:text-brand dark:text-slate-300 dark:hover:text-cyan">
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 text-slate-700 transition hover:border-brand hover:text-brand dark:border-white/10 dark:text-slate-200 dark:hover:border-cyan dark:hover:text-cyan"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <a href="#contact" className="hidden rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-700 sm:inline-flex">
              {siteState.settings.ctaPrimary}
            </a>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 text-slate-700 lg:hidden dark:border-white/10 dark:text-white"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label="Open navigation"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
        {menuOpen ? (
          <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-panel lg:hidden dark:border-white/10 dark:bg-slate-950">
            <div className="mx-auto grid max-w-7xl gap-3">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10">
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      <section id="top" className="relative isolate overflow-hidden pt-28">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(140deg,#f8fafc_0%,#eef6ff_42%,#ffffff_100%)] dark:bg-[linear-gradient(140deg,#08111f_0%,#0f2743_52%,#07101d_100%)]" />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-20 lg:pt-20">
          <Reveal className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-brand/20 bg-white/70 px-3 py-1 text-sm font-semibold text-brand shadow-sm dark:border-cyan/30 dark:bg-slate-950 dark:text-cyan">
              {siteState.settings.location}
            </div>
            <h1 className="max-w-4xl text-4xl font-black leading-tight text-ink dark:text-white sm:text-5xl lg:text-7xl">
              {siteState.settings.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              {siteState.settings.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#contact" className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-5 py-3 text-sm font-bold text-white shadow-glow transition hover:bg-blue-700">
                {siteState.settings.ctaPrimary} <ArrowRight size={18} />
              </a>
              <a href="#work" className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-ink transition hover:border-brand hover:text-brand dark:border-white/15 dark:bg-slate-950 dark:text-white dark:hover:border-cyan dark:hover:text-cyan">
                {siteState.settings.ctaSecondary} <ExternalLink size={17} />
              </a>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {siteState.heroStats.map((stat) => (
                <div key={stat.label} className="rounded-md border border-slate-200 bg-white/70 p-4 text-slate-800 shadow-sm dark:border-white/10 dark:bg-slate-950 dark:text-slate-100">
                  <strong className="block text-xl font-black text-ink dark:text-white">{stat.value}</strong>
                  <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">{stat.label}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="relative min-h-[500px]">
            <div className="absolute left-3 top-3 z-10 grid gap-3 sm:left-0">
              {siteState.heroHighlights.map((item, index) => {
                const Icon = highlightIcons[index % highlightIcons.length];
                return (
                <div
                  key={item.label}
                  className="flex w-44 items-center gap-3 rounded-md border border-white/80 bg-white/90 p-3 text-slate-800 shadow-panel backdrop-blur dark:border-white/10 dark:bg-slate-950/90 dark:text-slate-100"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-md bg-cyan/15 text-brand dark:text-cyan">
                    <Icon size={18} />
                  </span>
                  <span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">{item.label}</span>
                    <strong className="block text-sm">{item.value}</strong>
                  </span>
                </div>
                );
              })}
            </div>
            <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[620px] rounded-md border border-slate-200 bg-white p-4 shadow-glow dark:border-white/10 dark:bg-slate-950">
              <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand dark:text-cyan">Growth Dashboard</p>
                  <h2 className="mt-1 text-xl font-bold">Digital presence score</h2>
                </div>
                <span className="rounded-md bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">Live</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {siteState.growthMetrics.map((metric) => (
                  <div key={metric.id} className="rounded-md bg-slate-50 p-4 dark:bg-slate-900">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold">{metric.label}</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">+{metric.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-white/10">
                      <div className="h-2 rounded-full bg-gradient-to-r from-brand to-cyan" style={{ width: `${Math.min(100, Number(metric.value) || 0)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 h-40 rounded-md bg-ink p-4 dark:bg-black/30">
                <div className="flex h-full items-end gap-2">
                  {[44, 66, 48, 78, 56, 92, 72, 96, 84, 100].map((height) => (
                    <span
                      key={height}
                      className="flex-1 rounded-t bg-gradient-to-t from-brand to-cyan"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-5 dark:border-white/10 dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 sm:grid-cols-3 sm:px-6 lg:grid-cols-6 lg:px-8">
          {siteState.trustSignals.map((item, index) => {
            const Icon = trustIcons[index % trustIcons.length];
            return (
          <div key={item.id} className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <Icon className="text-brand dark:text-cyan" size={18} />
              {item.label}
            </div>
            );
          })}
        </div>
      </section>

      <section id="services" className="px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Services" title={siteState.settings.servicesTitle} copy={siteState.settings.servicesCopy} />
        <div className="mx-auto mt-12 grid max-w-7xl gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <Reveal key={service.title} className="rounded-md border border-slate-200 bg-white p-6 text-slate-800 shadow-sm transition hover:-translate-y-1 hover:shadow-panel dark:border-white/10 dark:bg-slate-900 dark:text-slate-100">
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-md bg-brand/10 text-brand dark:bg-cyan/10 dark:text-cyan">
                <service.icon size={24} />
              </div>
              <h3 className="text-xl font-bold">{service.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{service.description}</p>
              <ul className="mt-5 grid gap-2">
                {service.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Check size={16} className="text-cyan" /> {bullet}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-20 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand dark:text-cyan">{siteState.settings.whyEyebrow}</p>
            <h2 className="mt-3 text-3xl font-bold md:text-5xl">{siteState.settings.whyTitle}</h2>
            <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-300">
              {siteState.settings.whyCopy}
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {siteState.features.map((feature) => (
                <div key={feature.id} className="flex items-center gap-3 rounded-md bg-white p-3 text-sm font-semibold text-slate-800 shadow-sm dark:bg-slate-900 dark:text-slate-100">
                  <Check size={17} className="text-cyan" /> {feature.label}
                </div>
              ))}
            </div>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {siteState.performanceMetrics.map((metric) => (
              <Reveal key={metric.id} className="rounded-md border border-slate-200 bg-white p-7 text-slate-800 shadow-sm dark:border-white/10 dark:bg-slate-950 dark:text-slate-100">
                <strong className="text-4xl font-black text-brand dark:text-cyan">{metric.value}</strong>
                <p className="mt-2 font-semibold">{metric.label}</p>
                <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{metric.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="work" className="px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Portfolio" title={siteState.settings.portfolioTitle} copy={siteState.settings.portfolioCopy} />
        <div className="mx-auto mt-12 grid max-w-7xl gap-5 md:grid-cols-2 xl:grid-cols-3">
          {portfolio.map((project) => (
            <Reveal key={project.title} className="overflow-hidden rounded-md border border-slate-200 bg-white text-slate-800 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-100">
              <div className="grid aspect-[16/10] place-items-center bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,.32),transparent_32%),linear-gradient(135deg,#0F172A,#2563EB)] p-6 text-white">
                <div className="grid gap-4 text-center">
                  {"logoUrl" in project && project.logoUrl ? (
                    <img src={project.logoUrl} alt={`${project.title} logo`} className="mx-auto h-16 w-16 rounded-md bg-white p-2 object-contain" />
                  ) : null}
                  <project.icon size={64} />
                </div>
              </div>
              <div className="p-6">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand dark:text-cyan">{project.type}</span>
                <h3 className="mt-2 text-xl font-bold">{project.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{project.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <span key={tech} className="rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">{tech}</span>
                  ))}
                </div>
                {"websiteUrl" in project && project.websiteUrl ? (
                  <a href={project.websiteUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand dark:text-cyan">
                    Visit website <ArrowRight size={16} />
                  </a>
                ) : null}
                <p className="mt-5 text-sm font-bold text-emerald-600 dark:text-emerald-300">{project.result}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="process" className="bg-ink px-4 py-20 text-white dark:bg-black sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Process" title={siteState.settings.processTitle} copy={siteState.settings.processCopy} inverted />
        <div className="mx-auto mt-12 grid max-w-7xl gap-4 md:grid-cols-3 lg:grid-cols-6">
          {siteState.process.map((step, index) => (
            <Reveal key={step.id} className="rounded-md border border-white/10 bg-white/10 p-5">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-cyan text-sm font-black text-ink">{index + 1}</span>
              <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{step.description}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Clients" title={siteState.settings.testimonialsTitle} copy={siteState.settings.testimonialsCopy} />
        <div className="mx-auto mt-12 grid max-w-7xl gap-5 lg:grid-cols-3">
          {siteState.testimonials.map((testimonial) => (
            <Reveal key={testimonial.id} className="rounded-md border border-slate-200 bg-white p-6 text-slate-800 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-100">
              <div className="mb-5 h-12 w-12 rounded-md bg-gradient-to-br from-brand to-cyan" />
              <p className="text-base leading-7 text-slate-700 dark:text-slate-200">&ldquo;{testimonial.quote}&rdquo;</p>
              <div className="mt-6">
                <strong className="block">{testimonial.name}</strong>
                <span className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}, {testimonial.company}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="about" className="bg-slate-50 px-4 py-20 dark:bg-slate-950 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="About us" title={siteState.settings.aboutTitle} copy={siteState.settings.aboutCopy} />
        <div className="mx-auto mt-12 grid max-w-7xl gap-5 md:grid-cols-2 xl:grid-cols-3">
          {siteState.team.map((member) => (
            <Reveal key={member.id} className="overflow-hidden rounded-md border border-slate-200 bg-white text-slate-800 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-100">
              {member.imageUrl ? (
                <img src={member.imageUrl} alt={member.name} className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="grid aspect-[4/3] place-items-center bg-ink text-white dark:bg-black/30">
                  <UserRound size={64} />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="mt-1 text-sm font-semibold text-brand dark:text-cyan">{member.role}</p>
                <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{member.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {member.specialties.map((specialty) => (
                    <span key={specialty} className="rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">{specialty}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-20 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand dark:text-cyan">FAQ</p>
            <h2 className="mt-3 text-3xl font-bold md:text-5xl">{siteState.settings.faqTitle}</h2>
            <div className="mt-8 grid gap-4">
              {siteState.faqs.map((faq) => (
                <details key={faq.id} className="rounded-md border border-slate-200 bg-white p-5 text-slate-800 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100">
                  <summary className="cursor-pointer font-bold">{faq.question}</summary>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{faq.answer}</p>
                </details>
              ))}
            </div>
          </Reveal>
          <div id="insights">
            <Reveal className="lg:pt-16">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand dark:text-cyan">Resources</p>
              <h2 className="mt-3 text-3xl font-bold">{siteState.settings.blogTitle}</h2>
              <div className="mt-8 grid gap-4">
                {siteState.blogPosts.map((post) => (
                  <article key={post.id} className="rounded-md border border-slate-200 bg-white p-5 text-slate-800 transition hover:border-brand dark:border-white/10 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-cyan">
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand dark:text-cyan">{post.category}</span>
                    <h3 className="mt-2 text-lg font-bold">{post.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{post.excerpt}</p>
                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{post.readTime}</p>
                    {post.url ? <a href={post.url} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand dark:text-cyan">Read article <ArrowRight size={15} /></a> : null}
                  </article>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-6xl rounded-md bg-[linear-gradient(135deg,#0F172A,#1d4ed8_58%,#06B6D4)] px-6 py-14 text-center text-white shadow-glow md:px-12">
          <h2 className="text-3xl font-black md:text-5xl">{siteState.settings.ctaTitle}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-blue-50">{siteState.settings.ctaCopy}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="#contact" className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold text-ink transition hover:bg-blue-50">
              Schedule Consultation <ArrowRight size={18} />
            </a>
            <a href="#contact" className="inline-flex items-center justify-center gap-2 rounded-md border border-white/30 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">
              Get a Quote <Send size={17} />
            </a>
          </div>
        </Reveal>
      </section>

      <section id="contact" className="bg-slate-50 px-4 py-20 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand dark:text-cyan">Contact</p>
            <h2 className="mt-3 text-3xl font-bold md:text-5xl">{siteState.settings.contactTitle}</h2>
            <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-300">
              {siteState.settings.seoDescription}
            </p>
            <div className="mt-8 grid gap-4 text-sm">
              <a href={`mailto:${siteState.settings.email}`} className="flex items-center gap-3 rounded-md bg-white p-4 font-semibold shadow-sm dark:bg-slate-900">
                <Mail className="text-brand dark:text-cyan" size={19} /> {siteState.settings.email}
              </a>
              <a href={`tel:${siteState.settings.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 rounded-md bg-white p-4 font-semibold shadow-sm dark:bg-slate-900">
                <Phone className="text-brand dark:text-cyan" size={19} /> {siteState.settings.phone}
              </a>
            </div>
          </Reveal>
          <Reveal>
            <form onSubmit={handleSubmit} className="grid gap-4 rounded-md border border-slate-200 bg-white p-5 text-slate-800 shadow-panel dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 sm:grid-cols-2">
              {["name", "company", "email", "phone"].map((field) => (
                <label key={field} className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {field}
                  <input name={field} required={field !== "company"} type={field === "email" ? "email" : "text"} className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-brand dark:border-white/10 dark:bg-slate-900 dark:text-white" />
                </label>
              ))}
              <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 sm:col-span-2">
                Service Needed
                <select name="service" className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-brand dark:border-white/10 dark:bg-slate-900">
                  {services.map((service) => (
                    <option key={service.title}>{service.title}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 sm:col-span-2">
                Message
                <textarea name="message" required rows={5} className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-brand dark:border-white/10 dark:bg-slate-900 dark:text-white" />
              </label>
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-5 py-3 text-sm font-bold text-white shadow-glow transition hover:bg-blue-700 sm:col-span-2">
                Send Message <Send size={17} />
              </button>
              {savingMessage ? <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 sm:col-span-2">{savingMessage}</p> : null}
              {submitted ? <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-300 sm:col-span-2">Thanks. Your inquiry is ready for CLA Solutions to review.</p> : null}
              {contactError ? <p className="text-sm font-semibold text-red-600 dark:text-red-300 sm:col-span-2">{contactError}</p> : null}
            </form>
          </Reveal>
        </div>
      </section>

      <footer className="bg-ink px-4 py-12 text-white dark:bg-black sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-white text-sm font-black text-ink">CLA</span>
              <strong>{siteState.settings.companyName}</strong>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">{siteState.settings.tagline}.</p>
          </div>
          {[
            ["Company", "About", "Process", "Portfolio"],
            ["Services", "Websites", "E-Commerce", "Applications"],
            ["Resources", "Blog", "FAQ", "Contact"]
          ].map(([title, ...links]) => (
            <div key={title}>
              <h3 className="font-bold">{title}</h3>
              <div className="mt-4 grid gap-2">
                {links.map((link) => (
                  <a key={link} href="#top" className="text-sm text-slate-300 hover:text-cyan">{link}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <p>(c) 2026 {siteState.settings.companyName}. All Rights Reserved.</p>
          <div className="flex gap-4">
            {[
              ["LinkedIn", siteState.settings.linkedin],
              ["Facebook", siteState.settings.facebook],
              ["Telegram", siteState.settings.telegram],
              ["Instagram", siteState.settings.instagram]
            ].map(([social, href]) => (
              <a key={social} href={href} target="_blank" rel="noreferrer" className="hover:text-cyan">{social}</a>
            ))}
          </div>
        </div>
      </footer>

      <a
        href={`https://wa.me/${siteState.settings.whatsapp}`}
        className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-glow transition hover:bg-emerald-600"
        aria-label="Contact CLA Solutions on WhatsApp"
      >
        <Phone size={22} />
      </a>
    </main>
  );
}
