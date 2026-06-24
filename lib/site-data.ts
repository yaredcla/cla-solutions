import {
  Activity,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock3,
  Code2,
  Database,
  Globe2,
  GraduationCap,
  Headphones,
  LayoutDashboard,
  LineChart,
  Lock,
  Megaphone,
  MessageSquare,
  Palette,
  Rocket,
  Search,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Store,
  Utensils,
  Zap
} from "lucide-react";

export const navItems = [
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "Insights", href: "#insights" },
  { label: "Contact", href: "#contact" }
];

export const trustSignals = [
  { label: "24/7 Support", icon: Headphones },
  { label: "Fast Delivery", icon: Clock3 },
  { label: "Mobile Optimized", icon: Smartphone },
  { label: "SEO Ready", icon: Search },
  { label: "Secure Hosting", icon: Lock },
  { label: "Scalable Solutions", icon: Database }
];

export const services = [
  {
    title: "Website Development",
    icon: Globe2,
    description: "Premium business sites, corporate platforms, and landing pages built for credibility and conversion.",
    bullets: ["Business websites", "Corporate websites", "Landing pages"]
  },
  {
    title: "E-Commerce Solutions",
    icon: ShoppingCart,
    description: "Online stores with product management, local payment readiness, and performance-first storefronts.",
    bullets: ["Online stores", "Payment integration", "Product management"]
  },
  {
    title: "Web Applications",
    icon: Code2,
    description: "Custom dashboards and management systems that streamline everyday operations.",
    bullets: ["Custom systems", "Dashboards", "Management platforms"]
  },
  {
    title: "UI/UX Design",
    icon: Palette,
    description: "Research-led interfaces, prototypes, and design systems that feel simple for busy teams.",
    bullets: ["User research", "Prototyping", "Design systems"]
  },
  {
    title: "SEO Optimization",
    icon: Megaphone,
    description: "Technical SEO, content structure, and speed improvements for stronger discovery.",
    bullets: ["Search rankings", "Performance optimization", "Content structure"]
  },
  {
    title: "Maintenance & Support",
    icon: ShieldCheck,
    description: "Monitoring, updates, and security care that keep your digital presence healthy.",
    bullets: ["Updates", "Security", "Monitoring"]
  }
];

export const features = [
  "Deep understanding of African businesses",
  "Affordable professional solutions",
  "Modern technologies",
  "Dedicated support",
  "Fast project turnaround",
  "Long-term partnership approach"
];

export const metrics = [
  { value: "100%", label: "Mobile Responsive" },
  { value: "99.9%", label: "Uptime Ready" },
  { value: "A+", label: "Performance Focus" },
  { value: "24h", label: "Support Response" }
];

export const portfolio = [
  {
    title: "Hotel Booking Website",
    type: "Hospitality",
    icon: Building2,
    description: "A booking-focused site for a boutique hotel with room discovery, inquiry flows, and local SEO.",
    stack: ["Next.js", "CMS", "SEO"],
    result: "42% more direct inquiries"
  },
  {
    title: "Real Estate Platform",
    type: "Property",
    icon: LineChart,
    description: "Property listings, lead capture, and agent workflows for a growing Addis Ababa brokerage.",
    stack: ["React", "Maps", "CRM"],
    result: "3x faster lead follow-up"
  },
  {
    title: "Restaurant Website",
    type: "Food & Beverage",
    icon: Utensils,
    description: "A polished menu and reservation presence designed for mobile-first customers.",
    stack: ["Tailwind", "Analytics", "WhatsApp"],
    result: "28% more table requests"
  },
  {
    title: "School Management Portal",
    type: "Education",
    icon: GraduationCap,
    description: "A private portal for admissions, announcements, and family communication.",
    stack: ["TypeScript", "Auth", "Dashboard"],
    result: "Reduced admin workload"
  },
  {
    title: "E-Commerce Store",
    type: "Retail",
    icon: Store,
    description: "A catalog and order-management storefront for a regional product business.",
    stack: ["Commerce", "Payments", "Inventory"],
    result: "Launched in 21 days"
  },
  {
    title: "Corporate Company Website",
    type: "Enterprise",
    icon: BarChart3,
    description: "A multilingual corporate presence for a manufacturing firm expanding across East Africa.",
    stack: ["Next.js", "i18n", "Content"],
    result: "International-ready brand"
  }
];

export const process = [
  ["Discovery", "Understanding client goals"],
  ["Planning", "Project roadmap"],
  ["Design", "UI/UX creation"],
  ["Development", "Building the solution"],
  ["Launch", "Deployment"],
  ["Growth", "Continuous improvement"]
];

export const testimonials = [
  {
    quote: "CLA Solutions turned our outdated website into a real sales asset. The team understood our market and moved quickly.",
    name: "alpha lencho",
    role: "CEO and Founder",
    company: "Alpha Labs"
  },
  {
    quote: "CLA-Solutions have contributed alot to my Entrepreneurial Journey.",
    name: "hana tariku",
    role: "Founder",
    company: "Hani Buys"
  },
  {
    quote: "CLA Solutions helped our business transition from traditional word-of-mouth brokerage into a modern, technology driven, and highly efficient property brokerage firm.",
    name: "biniyam fantahun",
    role: "operation manager",
    company: "Urban Rent"
  }
];

export const faqs = [
  {
    question: "How long does a business website take?",
    answer: "Most focused business websites launch in 2 to 4 weeks, depending on content readiness and review speed."
  },
  {
    question: "Can you support payment and WhatsApp workflows?",
    answer: "Yes. We design around regional customer behavior, including WhatsApp contact, lead forms, payment readiness, and handoff workflows."
  },
  {
    question: "Do you provide ongoing maintenance?",
    answer: "Yes. Maintenance plans can include updates, monitoring, backups, security checks, SEO improvements, and content support."
  }
];

export const blogPosts = [
  {
    title: "Why Ethiopian businesses need mobile-first websites",
    category: "Strategy",
    readTime: "5 min read"
  },
  {
    title: "A practical SEO checklist for East African companies",
    category: "Growth",
    readTime: "7 min read"
  },
  {
    title: "What to prepare before starting a web project",
    category: "Planning",
    readTime: "4 min read"
  }
];

export const heroStats = [
  { value: "30+", label: "Digital workflows planned" },
  { value: "6", label: "Core service areas" },
  { value: "E.A.", label: "Regional market focus" }
];

export const heroHighlights = [
  { label: "Launch plan", value: "21 days", icon: Rocket },
  { label: "Performance", value: "A-grade", icon: Zap },
  { label: "Security", value: "Built in", icon: CheckCircle2 }
];

export const adminStats = [
  { label: "Qualified Leads", value: "128", change: "+18%", icon: MessageSquare },
  { label: "Active Projects", value: "14", change: "+4", icon: LayoutDashboard },
  { label: "Conversion Rate", value: "32%", change: "+6.2%", icon: Activity },
  { label: "Monthly Revenue", value: "$42.8k", change: "+12%", icon: BarChart3 }
];

export const leadPipeline = [
  { stage: "New inquiry", count: 42, value: "$61k", color: "bg-cyan" },
  { stage: "Discovery booked", count: 21, value: "$48k", color: "bg-brand" },
  { stage: "Proposal sent", count: 16, value: "$74k", color: "bg-emerald-500" },
  { stage: "Won this month", count: 9, value: "$39k", color: "bg-amber-500" }
];

export const recentLeads = [
  { name: "Addis Pearl Hotel", service: "Hotel Booking Website", status: "Discovery", budget: "$4.8k", date: "Jun 15" },
  { name: "Rift Valley Academy", service: "School Portal", status: "Proposal", budget: "$8.5k", date: "Jun 14" },
  { name: "Habesha Organics", service: "E-Commerce Store", status: "New", budget: "$6.2k", date: "Jun 14" },
  { name: "Kigali Build Group", service: "Corporate Website", status: "Won", budget: "$9.1k", date: "Jun 13" }
];

export const projectHealth = [
  { project: "Blue Nile Hospitality", progress: 78, owner: "Design", due: "Jun 24" },
  { project: "Savanna Realty Platform", progress: 54, owner: "Engineering", due: "Jul 02" },
  { project: "EastLink Foods Store", progress: 91, owner: "QA", due: "Jun 19" }
];

export const contentTasks = [
  "Publish SEO article: Business Website Ethiopia",
  "Refresh portfolio cards with new restaurant case study",
  "Review testimonials for homepage rotation",
  "Prepare June performance report for clients"
];
