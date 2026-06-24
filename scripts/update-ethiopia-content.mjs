import { neon } from "@neondatabase/serverless";
import { loadLocalEnv } from "./env.mjs";

loadLocalEnv();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to update site content.");
}

const sql = neon(databaseUrl);
const rows = await sql`select data from site_state where id = 'main' limit 1`;
const current = rows[0]?.data ?? {};

const next = {
  ...current,
  settings: {
    ...(current.settings ?? {}),
    tagline: "Transforming Ethiopian Businesses Through Digital Innovation",
    heroSubtitle:
      "We help Ethiopian businesses attract more customers, build trust, and increase revenue through modern digital solutions.",
    location: "Serving Ethiopia",
    phone: "+251994184777",
    email: "yaredwondwossen@gmail.com",
    whatsapp: "251994184777",
    telegram: "https://web.telegram.org/k/",
    linkedin: "https://www.linkedin.com/in/yared-wondwossen-8425a4377",
    instagram: "https://www.instagram.com/?hl=en",
    facebook: "https://web.facebook.com/yared.wondwosone",
    seoTitle: "CLA Solutions | Website Development Ethiopia",
    seoDescription:
      "CLA Solutions helps Ethiopian businesses grow through premium websites, web applications, e-commerce, SEO, and digital transformation.",
    servicesTitle: "Digital solutions for serious growth",
    servicesCopy:
      "From elegant company sites to operational web apps, CLA Solutions builds the digital foundation Ethiopian businesses need to compete with confidence.",
    whyEyebrow: "Why choose us",
    whyTitle: "Built for Ethiopian businesses with global standards.",
    whyCopy:
      "We combine deep knowledge of the Ethiopian market with modern engineering practices so your website can earn trust, convert customers, and scale with your ambition.",
    portfolioTitle: "Digital projects designed for Ethiopian growth",
    portfolioCopy:
      "Explore modern, conversion-focused platforms CLA Solutions can deliver for businesses across Ethiopia.",
    processTitle: "A clear path from idea to launch",
    processCopy:
      "You always know what is happening, what comes next, and how each step supports your business goals.",
    testimonialsTitle: "Trusted by ambitious Ethiopian operators",
    testimonialsCopy:
      "Hear from business leaders who value clarity, speed, local understanding, and practical results.",
    faqTitle: "Answers before the first call.",
    blogTitle: "Blog preview",
    aboutTitle: "Meet the people behind CLA Solutions",
    aboutCopy:
      "A focused Ethiopian technology team combining strategy, design, and engineering to help local businesses grow.",
    ctaTitle: "Ready to Grow Your Business Online?",
    ctaCopy:
      "Let us build a digital presence that helps your Ethiopian business stand out.",
    contactTitle: "Tell us what you want to build."
  },
  services: current.services ?? [
    {
      id: "website-development",
      title: "Website Development",
      description:
        "Premium business sites, corporate platforms, and landing pages built for credibility and conversion.",
      bullets: ["Business websites", "Corporate websites", "Landing pages"]
    },
    {
      id: "ecommerce-solutions",
      title: "E-Commerce Solutions",
      description:
        "Online stores with product management, local payment readiness, and performance-first storefronts.",
      bullets: ["Online stores", "Payment integration", "Product management"]
    },
    {
      id: "web-applications",
      title: "Web Applications",
      description:
        "Custom dashboards and management systems that streamline everyday operations.",
      bullets: ["Custom systems", "Dashboards", "Management platforms"]
    }
  ],
  portfolio: current.portfolio ?? [
    {
      id: "hotel-booking-website",
      title: "Hotel Booking Website",
      type: "Hospitality",
      description:
        "A booking-focused site for a boutique hotel with room discovery, inquiry flows, and local SEO.",
      stack: ["Next.js", "CMS", "SEO"],
      result: "42% more direct inquiries"
    },
    {
      id: "real-estate-platform",
      title: "Real Estate Platform",
      type: "Property",
      description:
        "Property listings, lead capture, and agent workflows for a growing Addis Ababa brokerage.",
      stack: ["React", "Maps", "CRM"],
      result: "3x faster lead follow-up"
    },
    {
      id: "ecommerce-store",
      title: "E-Commerce Store",
      type: "Retail",
      description:
        "A catalog and order-management storefront for an Ethiopian product business.",
      stack: ["Commerce", "Payments", "Inventory"],
      result: "Launched in 21 days"
    }
  ],
  testimonials: current.testimonials ?? [
    {
      id: "testimonial-1",
      quote:
        "CLA Solutions turned our outdated website into a real sales asset. The team understood our market and moved quickly.",
      name: "Alpha Lencho",
      role: "CEO and Founder",
      company: "Alpha Labs"
    },
    {
      id: "testimonial-2",
      quote:
        "CLA Solutions have contributed a lot to my entrepreneurial journey.",
      name: "Hana Tariku",
      role: "Founder",
      company: "Hani Buys"
    }
  ],
  faqs: current.faqs ?? [
    {
      id: "faq-1",
      question: "How long does a business website take?",
      answer:
        "Most focused business websites launch in 2 to 4 weeks, depending on content readiness and review speed."
    },
    {
      id: "faq-2",
      question: "Can you support payment and WhatsApp workflows?",
      answer:
        "Yes. We design around Ethiopian customer behavior, including WhatsApp contact, lead forms, payment readiness, and handoff workflows."
    },
    {
      id: "faq-3",
      question: "Do you provide ongoing maintenance?",
      answer:
        "Yes. Maintenance plans can include updates, monitoring, backups, security checks, SEO improvements, and content support."
    }
  ],
  trustSignals: current.trustSignals ?? [
    { id: "trust-support", label: "24/7 Support" },
    { id: "trust-delivery", label: "Fast Delivery" },
    { id: "trust-mobile", label: "Mobile Optimized" },
    { id: "trust-seo", label: "SEO Ready" },
    { id: "trust-security", label: "Secure Hosting" },
    { id: "trust-scale", label: "Scalable Solutions" }
  ],
  features: [
    { id: "feature-ethiopia", label: "Deep understanding of Ethiopian businesses" },
    { id: "feature-affordable", label: "Affordable professional solutions" },
    { id: "feature-modern", label: "Modern technologies" },
    { id: "feature-support", label: "Dedicated local support" },
    { id: "feature-fast", label: "Fast project turnaround" },
    { id: "feature-partnership", label: "Long-term partnership approach" }
  ],
  heroStats: [
    { id: "hero-stat-workflows", value: "30+", label: "Digital workflows planned" },
    { id: "hero-stat-services", value: "6", label: "Core service areas" },
    { id: "hero-stat-market", value: "ET", label: "Ethiopian market focus" }
  ],
  heroHighlights: current.heroHighlights ?? [
    { id: "highlight-launch", value: "21 days", label: "Launch plan" },
    { id: "highlight-performance", value: "A-grade", label: "Performance" },
    { id: "highlight-security", value: "Built in", label: "Security" }
  ],
  growthMetrics: [
    { id: "growth-traffic", value: "24", label: "Traffic" },
    { id: "growth-leads", value: "35", label: "Leads" },
    { id: "growth-speed", value: "46", label: "Speed" },
    { id: "growth-trust", value: "57", label: "Trust" }
  ],
  performanceMetrics: current.performanceMetrics ?? [
    {
      id: "metric-responsive",
      value: "100%",
      label: "Mobile Responsive",
      description: "Designed for how Ethiopian customers browse and buy."
    },
    {
      id: "metric-uptime",
      value: "99.9%",
      label: "Uptime Ready",
      description: "Reliable infrastructure for daily business operations."
    },
    {
      id: "metric-performance",
      value: "A+",
      label: "Performance Focus",
      description: "Fast experiences that build confidence and reduce drop-off."
    },
    {
      id: "metric-support",
      value: "24h",
      label: "Support Response",
      description: "Practical support when your team needs it."
    }
  ],
  process: current.process ?? [
    { id: "process-discovery", title: "Discovery", description: "Understanding your business goals" },
    { id: "process-planning", title: "Planning", description: "Creating the project roadmap" },
    { id: "process-design", title: "Design", description: "Building the UI and UX" },
    { id: "process-development", title: "Development", description: "Building the solution" },
    { id: "process-launch", title: "Launch", description: "Deploying with confidence" },
    { id: "process-growth", title: "Growth", description: "Continuous improvement" }
  ],
  blogPosts: [
    {
      id: "blog-mobile-first",
      title: "Why Ethiopian businesses need mobile-first websites",
      category: "Strategy",
      readTime: "5 min read",
      excerpt:
        "How mobile-first design helps Ethiopian companies reach more customers and convert interest into action."
    },
    {
      id: "blog-seo-ethiopia",
      title: "A practical SEO checklist for Ethiopian companies",
      category: "Growth",
      readTime: "7 min read",
      excerpt:
        "The essential technical and content steps Ethiopian businesses can use to improve search visibility."
    },
    {
      id: "blog-project-planning",
      title: "What to prepare before starting a web project",
      category: "Planning",
      readTime: "4 min read",
      excerpt:
        "A concise preparation guide for a faster, clearer, and more successful website project."
    }
  ],
  team: current.team ?? [
    {
      id: "team-yared",
      name: "Yared Wondwossen",
      role: "Founder and Digital Solutions Lead",
      description:
        "Leads CLA Solutions with a focus on practical digital systems that help Ethiopian businesses earn trust and grow.",
      specialties: [
        "Web strategy",
        "Full-stack development",
        "Digital transformation"
      ]
    }
  ]
};

await sql`
  insert into site_state (id, data, updated_at)
  values ('main', ${JSON.stringify(next)}::jsonb, now())
  on conflict (id) do update set
    data = excluded.data,
    updated_at = excluded.updated_at
`;

console.log("Updated the main site state for the Ethiopian-focused content model.");
