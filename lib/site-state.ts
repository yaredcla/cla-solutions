export type SiteSettings = {
  companyName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  phone: string;
  email: string;
  location: string;
  whatsapp: string;
  seoTitle: string;
  seoDescription: string;
};

export type EditableService = {
  id: string;
  title: string;
  description: string;
  bullets: string[];
};

export type EditablePortfolio = {
  id: string;
  title: string;
  type: string;
  description: string;
  stack: string[];
  result: string;
  websiteUrl?: string;
  logoUrl?: string;
};

export type EditableTestimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
};

export type EditableFaq = {
  id: string;
  question: string;
  answer: string;
};

export type SiteState = {
  settings: SiteSettings;
  services: EditableService[];
  portfolio: EditablePortfolio[];
  testimonials: EditableTestimonial[];
  faqs: EditableFaq[];
};

export type AdminStatus = "active" | "paused";

export type AdminAccount = {
  id: string;
  username: string;
  passwordHash: string;
  status: AdminStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
};

export type PublicAdminAccount = Omit<AdminAccount, "passwordHash">;

export type InboxMessage = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  createdAt: string;
};

export type AnalyticsSummary = {
  totalMessages: number;
  unreadMessages: number;
  respondedMessages: number;
  totalServices: number;
  totalPortfolioItems: number;
  leadScore: number;
  monthlyTrend: Array<{ label: string; value: number }>;
  serviceCounts: Array<{ label: string; value: number }>;
};

export const defaultSiteState: SiteState = {
  settings: {
    companyName: "CLA Solutions",
    tagline: "Transforming African Businesses Through Digital Innovation",
    heroTitle: "Professional Websites That Grow Your Business",
    heroSubtitle:
      "We help Ethiopian and East African businesses attract more customers, build trust, and increase revenue through modern digital solutions.",
    ctaPrimary: "Get Free Consultation",
    ctaSecondary: "View Our Work",
    phone: "+251 XX XXX XXXX",
    email: "hello@clasolutions.africa",
    location: "Serving Ethiopia & East Africa",
    whatsapp: "251000000000",
    seoTitle: "CLA Solutions | Website Development Ethiopia & East Africa",
    seoDescription:
      "CLA Solutions helps Ethiopian and East African businesses grow through premium websites, web applications, e-commerce, SEO, and digital transformation."
  },
  services: [
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
      description: "Custom dashboards and management systems that streamline everyday operations.",
      bullets: ["Custom systems", "Dashboards", "Management platforms"]
    }
  ],
  portfolio: [
    {
      id: "hotel-booking-website",
      title: "Hotel Booking Website",
      type: "Hospitality",
      description: "A booking-focused site for a boutique hotel with room discovery, inquiry flows, and local SEO.",
      stack: ["Next.js", "CMS", "SEO"],
      result: "42% more direct inquiries"
    },
    {
      id: "real-estate-platform",
      title: "Real Estate Platform",
      type: "Property",
      description: "Property listings, lead capture, and agent workflows for a growing Addis Ababa brokerage.",
      stack: ["React", "Maps", "CRM"],
      result: "3x faster lead follow-up"
    },
    {
      id: "ecommerce-store",
      title: "E-Commerce Store",
      type: "Retail",
      description: "A catalog and order-management storefront for a regional product business.",
      stack: ["Commerce", "Payments", "Inventory"],
      result: "Launched in 21 days"
    }
  ],
  testimonials: [
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
        "Cla-solutions have contributed alot to my Entrepreneurial Journey.",
      name: "Hana Tariku",
      role: "Founder",
      company: "Hani Buys"
    },
    {
      id: "testimonial-3",
      quote:
        "They gave us the structure, speed, and support we needed to launch online without overwhelming our team.",
      name: "Amina Yusuf",
      role: "Operations Lead",
      company: "EastLink Foods"
    }
  ],
  faqs: [
    {
      id: "faq-1",
      question: "How long does a business website take?",
      answer: "Most focused business websites launch in 2 to 4 weeks, depending on content readiness and review speed."
    },
    {
      id: "faq-2",
      question: "Can you support payment and WhatsApp workflows?",
      answer:
        "Yes. We design around regional customer behavior, including WhatsApp contact, lead forms, payment readiness, and handoff workflows."
    },
    {
      id: "faq-3",
      question: "Do you provide ongoing maintenance?",
      answer: "Yes. Maintenance plans can include updates, monitoring, backups, security checks, SEO improvements, and content support."
    }
  ]
};

export function newMessageId() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function newItemId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
