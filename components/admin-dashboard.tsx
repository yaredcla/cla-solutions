"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bell,
  Building2,
  Check,
  ChevronRight,
  CircleHelp,
  CirclePause,
  CirclePlay,
  Eye,
  FileText,
  Globe2,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  Link2,
  LogOut,
  Mail,
  PencilLine,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserPlus,
  UserRound,
  UsersRound
} from "lucide-react";
import {
  AnalyticsSummary,
  AdminStatus,
  EditableBlogPost,
  EditablePortfolio,
  EditableService,
  EditableTeamMember,
  InboxMessage,
  PublicAdminAccount,
  SiteState,
  defaultSiteState,
  newItemId
} from "@/lib/site-state";

type TabId = "overview" | "content" | "sections" | "services" | "work" | "inbox" | "analytics" | "accounts";
type CollectionKey =
  | "trustSignals"
  | "features"
  | "heroStats"
  | "heroHighlights"
  | "growthMetrics"
  | "performanceMetrics"
  | "process"
  | "testimonials"
  | "faqs";

const nav = [
  { label: "Overview", icon: LayoutDashboard, id: "overview" as const },
  { label: "Content", icon: Globe2, id: "content" as const },
  { label: "Sections", icon: FileText, id: "sections" as const },
  { label: "Services", icon: Building2, id: "services" as const },
  { label: "Work", icon: Eye, id: "work" as const },
  { label: "Inbox", icon: Mail, id: "inbox" as const },
  { label: "Analytics", icon: BarChart3, id: "analytics" as const },
  { label: "Accounts", icon: UserRound, id: "accounts" as const }
];

const emptyService = (): EditableService => ({
  id: "",
  title: "",
  description: "",
  bullets: ["", "", ""]
});

const emptyPortfolio = (): EditablePortfolio => ({
  id: "",
  title: "",
  type: "",
  description: "",
  stack: ["", "", ""],
  result: "",
  websiteUrl: "",
  logoUrl: ""
});

const emptyBlogPost = (): EditableBlogPost => ({
  id: "",
  title: "",
  category: "",
  readTime: "",
  excerpt: "",
  url: ""
});

const emptyTeamMember = (): EditableTeamMember => ({
  id: "",
  name: "",
  role: "",
  description: "",
  specialties: ["", "", ""],
  imageUrl: ""
});

const emptyAdminDraft = () => ({
  id: "",
  username: "",
  password: "",
  status: "active" as AdminStatus
});

const statusStyles: Record<InboxMessage["status"], string> = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-400/15 dark:text-blue-200",
  read: "bg-slate-100 text-slate-700 dark:bg-slate-400/15 dark:text-slate-200",
  replied: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200",
  archived: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200"
};

function SectionTitle({ title, copy }: { title: string; copy: string }) {
  return (
    <div>
      <h2 className="text-xl font-black text-ink dark:text-white">{title}</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{copy}</p>
    </div>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <article className={`rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950 ${className}`}>{children}</article>;
}

function LoginField({
  label,
  type,
  value,
  onChange,
  icon: Icon
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  icon: typeof KeyRound;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
      <span className="flex items-center gap-2">
        <Icon size={15} className="text-brand dark:text-cyan" />
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand dark:border-white/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-400"
      />
    </label>
  );
}

export default function AdminDashboard() {
  const [siteState, setSiteState] = useState<SiteState>(defaultSiteState);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [accounts, setAccounts] = useState<PublicAdminAccount[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [search, setSearch] = useState("");
  const [authReady, setAuthReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<PublicAdminAccount | null>(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [accountDraft, setAccountDraft] = useState(emptyAdminDraft());
  const [serviceDraft, setServiceDraft] = useState<EditableService>(emptyService());
  const [portfolioDraft, setPortfolioDraft] = useState<EditablePortfolio>(emptyPortfolio());
  const [blogDraft, setBlogDraft] = useState<EditableBlogPost>(emptyBlogPost());
  const [teamDraft, setTeamDraft] = useState<EditableTeamMember>(emptyTeamMember());

  async function loadDashboard() {
    setLoading(true);
    try {
      const [siteResponse, messageResponse, analyticsResponse, accountsResponse] = await Promise.all([
        fetch("/api/site-state"),
        fetch("/api/messages"),
        fetch("/api/analytics"),
        fetch("/api/admin/accounts")
      ]);

      if (!siteResponse.ok || !messageResponse.ok || !analyticsResponse.ok || !accountsResponse.ok) {
        throw new Error("Failed to load admin data.");
      }

      const [siteJson, messagesJson, analyticsJson, accountsJson] = await Promise.all([
        siteResponse.json(),
        messageResponse.json(),
        analyticsResponse.json(),
        accountsResponse.json()
      ]);
      setSiteState(siteJson);
      setMessages(messagesJson);
      setAnalytics(analyticsJson);
      setAccounts(accountsJson);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let alive = true;

    async function init() {
      try {
        const response = await fetch("/api/admin/session", { cache: "no-store" });
        const json = await response.json();
        if (!alive) return;
        const isAuthenticated = Boolean(json.authenticated);
        setAuthenticated(isAuthenticated);
        setCurrentAdmin(json.admin ?? null);
        setAuthReady(true);
        if (isAuthenticated) {
          await loadDashboard();
        } else {
          setLoading(false);
        }
      } catch {
        if (alive) {
          setAuthReady(true);
          setLoading(false);
        }
      }
    }

    init();
    return () => {
      alive = false;
    };
  }, []);

  async function refreshAll() {
    if (!authenticated) return;
    const [siteResponse, messageResponse, analyticsResponse, accountsResponse] = await Promise.all([
      fetch("/api/site-state"),
      fetch("/api/messages"),
      fetch("/api/analytics"),
      fetch("/api/admin/accounts")
    ]);

    setSiteState(await siteResponse.json());
    setMessages(await messageResponse.json());
    setAnalytics(await analyticsResponse.json());
    setAccounts(await accountsResponse.json());
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginForm)
    });
    const json = await response.json();
    if (!response.ok) {
      setLoginError(json.error || "Could not sign in.");
      return;
    }

    setAuthenticated(true);
    setCurrentAdmin(json.admin ?? null);
    setLoginForm({ username: "", password: "" });
    setActiveTab("overview");
    await loadDashboard();
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setCurrentAdmin(null);
    setAnalytics(null);
    setMessages([]);
    setAccounts([]);
    setLoading(false);
  }

  async function saveSiteState(next: SiteState) {
    setSaving("Saving site content...");
    const response = await fetch("/api/site-state", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next)
    });
    if (response.ok) {
      setSiteState(next);
      await refreshAll();
      setSaving("Saved");
      window.setTimeout(() => setSaving(""), 1500);
    } else {
      setSaving("Unable to save changes.");
    }
  }

  async function updateMessage(id: string, patch: Partial<InboxMessage>) {
    await fetch(`/api/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });
    await refreshAll();
  }

  async function deleteMessage(id: string) {
    await fetch(`/api/messages/${id}`, { method: "DELETE" });
    await refreshAll();
  }

  function setSetting<K extends keyof SiteState["settings"]>(key: K, value: SiteState["settings"][K]) {
    setSiteState((current) => ({ ...current, settings: { ...current.settings, [key]: value } }));
  }

  function updateCollectionItem<K extends CollectionKey>(
    key: K,
    id: string,
    patch: Partial<SiteState[K][number]>
  ) {
    setSiteState((current) => ({
      ...current,
      [key]: current[key].map((item) => item.id === id ? { ...item, ...patch } : item)
    }));
  }

  function removeCollectionItem<K extends CollectionKey>(key: K, id: string) {
    setSiteState((current) => ({
      ...current,
      [key]: current[key].filter((item) => item.id !== id)
    }));
  }

  async function saveServiceDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextService = {
      ...serviceDraft,
      bullets: serviceDraft.bullets.map((bullet) => bullet.trim()).filter(Boolean)
    };
    if (!nextService.id) {
      nextService.id = newItemId("service");
      await saveSiteState({ ...siteState, services: [nextService, ...siteState.services] });
    } else {
      await saveSiteState({
        ...siteState,
        services: siteState.services.map((service) => (service.id === nextService.id ? nextService : service))
      });
    }
    setServiceDraft(emptyService());
  }

  function editService(service: EditableService) {
    setServiceDraft({ ...service, bullets: [...service.bullets, "", "", ""].slice(0, 3) });
  }

  async function removeService(id: string) {
    await saveSiteState({ ...siteState, services: siteState.services.filter((service) => service.id !== id) });
  }

  async function savePortfolioDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextPortfolio = {
      ...portfolioDraft,
      stack: portfolioDraft.stack.map((item) => item.trim()).filter(Boolean),
      websiteUrl: portfolioDraft.websiteUrl?.trim() || undefined,
      logoUrl: portfolioDraft.logoUrl?.trim() || undefined
    };
    if (!nextPortfolio.id) {
      nextPortfolio.id = newItemId("work");
      await saveSiteState({ ...siteState, portfolio: [nextPortfolio, ...siteState.portfolio] });
    } else {
      await saveSiteState({
        ...siteState,
        portfolio: siteState.portfolio.map((item) => (item.id === nextPortfolio.id ? nextPortfolio : item))
      });
    }
    setPortfolioDraft(emptyPortfolio());
  }

  function editPortfolio(item: EditablePortfolio) {
    setPortfolioDraft({ ...item, stack: [...item.stack, "", "", ""].slice(0, 3) });
  }

  async function removePortfolio(id: string) {
    await saveSiteState({ ...siteState, portfolio: siteState.portfolio.filter((item) => item.id !== id) });
  }

  async function saveBlogDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextBlog = { ...blogDraft, url: blogDraft.url?.trim() || undefined };
    if (!nextBlog.id) {
      nextBlog.id = newItemId("blog");
      await saveSiteState({ ...siteState, blogPosts: [nextBlog, ...siteState.blogPosts] });
    } else {
      await saveSiteState({
        ...siteState,
        blogPosts: siteState.blogPosts.map((post) => post.id === nextBlog.id ? nextBlog : post)
      });
    }
    setBlogDraft(emptyBlogPost());
  }

  async function removeBlog(id: string) {
    await saveSiteState({ ...siteState, blogPosts: siteState.blogPosts.filter((post) => post.id !== id) });
    if (blogDraft.id === id) setBlogDraft(emptyBlogPost());
  }

  async function saveTeamDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextMember = {
      ...teamDraft,
      specialties: teamDraft.specialties.map((item) => item.trim()).filter(Boolean),
      imageUrl: teamDraft.imageUrl?.trim() || undefined
    };
    if (!nextMember.id) {
      nextMember.id = newItemId("team");
      await saveSiteState({ ...siteState, team: [nextMember, ...siteState.team] });
    } else {
      await saveSiteState({
        ...siteState,
        team: siteState.team.map((member) => member.id === nextMember.id ? nextMember : member)
      });
    }
    setTeamDraft(emptyTeamMember());
  }

  async function removeTeamMember(id: string) {
    await saveSiteState({ ...siteState, team: siteState.team.filter((member) => member.id !== id) });
    if (teamDraft.id === id) setTeamDraft(emptyTeamMember());
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveSiteState(siteState);
  }

  function editAccount(account: PublicAdminAccount) {
    setAccountDraft({
      id: account.id,
      username: account.username,
      password: "",
      status: account.status
    });
  }

  async function saveAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      username: accountDraft.username.trim(),
      password: accountDraft.password.trim(),
      status: accountDraft.status
    };

    const response = await fetch(accountDraft.id ? `/api/admin/accounts/${accountDraft.id}` : "/api/admin/accounts", {
      method: accountDraft.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      setSaving(json.error || "Could not save admin account.");
      return;
    }

    setSaving("Saved");
    setAccountDraft(emptyAdminDraft());
    await refreshAll();
    window.setTimeout(() => setSaving(""), 1500);
  }

  async function toggleAccountStatus(account: PublicAdminAccount, status: AdminStatus) {
    await fetch(`/api/admin/accounts/${account.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    await refreshAll();
  }

  async function deleteAccount(id: string) {
    await fetch(`/api/admin/accounts/${id}`, { method: "DELETE" });
    await refreshAll();
    if (accountDraft.id === id) {
      setAccountDraft(emptyAdminDraft());
    }
  }

  const unreadMessages = messages.filter((message) => message.status === "new");
  const totalMessages = messages.length;
  const filteredMessages = useMemo(() => {
    const query = search.toLowerCase();
    return messages.filter((message) => {
      return !query || [message.name, message.company, message.email, message.service, message.message]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [messages, search]);

  if (!authReady) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-10 text-ink dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-950">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand dark:text-cyan">Admin access</p>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">Checking session state...</p>
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-10 text-ink dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl place-items-center">
          <Card className="w-full max-w-md">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-md bg-ink text-white dark:bg-white dark:text-ink">
                <ShieldCheck size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand dark:text-cyan">Admin login</p>
                <h1 className="text-2xl font-black">CLA Solutions</h1>
              </div>
            </div>
            <form onSubmit={handleLogin} className="mt-6 grid gap-4">
              <LoginField label="Username" type="text" value={loginForm.username} onChange={(value) => setLoginForm((current) => ({ ...current, username: value }))} icon={UserRound} />
              <LoginField label="Password" type="password" value={loginForm.password} onChange={(value) => setLoginForm((current) => ({ ...current, password: value }))} icon={KeyRound} />
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-5 py-3 text-sm font-bold text-white shadow-glow transition hover:bg-blue-700">
                <LogOut size={16} className="rotate-180" /> Sign in
              </button>
              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                The dashboard lives at /admin and uses the username/password accounts managed inside the admin area.
              </p>
              {loginError ? <p className="text-sm font-semibold text-red-600 dark:text-red-300">{loginError}</p> : null}
            </form>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-ink dark:bg-slate-950 dark:text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-slate-200 bg-white px-4 py-5 dark:border-white/10 dark:bg-slate-950">
          <Link href="/" className="flex items-center gap-3 rounded-md px-2 py-2">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-ink text-sm font-black text-white dark:bg-white dark:text-ink">
              CLA
            </span>
            <span>
              <strong className="block text-sm">{siteState.settings.companyName}</strong>
              <span className="block text-xs text-slate-500 dark:text-slate-400">Operations Center</span>
            </span>
          </Link>

          <nav className="mt-8 grid gap-1">
            {nav.map((item, index) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold transition ${
                  (index === 0 && activeTab === "overview") || activeTab === item.id
                    ? "bg-ink text-white dark:bg-white dark:text-ink"
                    : "text-slate-600 hover:bg-slate-100 hover:text-ink dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-8 rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand dark:text-cyan">Inbox</p>
            <strong className="mt-3 block text-2xl">{unreadMessages.length}</strong>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">New messages waiting for review.</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200"
          >
            <LogOut size={16} /> Sign out
          </button>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Welcome back{currentAdmin ? `, ${currentAdmin.username}` : ""}
                </p>
                <h1 className="text-2xl font-black md:text-3xl">Business Dashboard</h1>
              </div>
              <div className="flex items-center gap-2">
                <label className="relative min-w-0 flex-1 md:w-72">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand dark:border-white/10 dark:bg-slate-900 dark:text-white"
                    placeholder="Search inbox, services, work"
                  />
                </label>
                <button className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200" aria-label="Notifications">
                  <Bell size={18} />
                </button>
              </div>
            </div>
          </header>

          <div className="grid gap-6 px-4 py-6 sm:px-6 lg:px-8">
            {loading ? (
              <Card className="text-sm text-slate-600 dark:text-slate-300">Loading dashboard...</Card>
            ) : null}

            {activeTab === "overview" ? (
              <>
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: "Messages", value: analytics?.totalMessages ?? totalMessages, icon: Mail, accent: "+18%" },
                    { label: "Services", value: analytics?.totalServices ?? siteState.services.length, icon: Building2, accent: "Live" },
                    { label: "Works", value: analytics?.totalPortfolioItems ?? siteState.portfolio.length, icon: Eye, accent: "Live" },
                    { label: "Lead Score", value: `${analytics?.leadScore ?? 0}%`, icon: Activity, accent: "Up" }
                  ].map((stat) => (
                    <Card key={stat.label}>
                      <div className="flex items-start justify-between">
                        <span className="grid h-11 w-11 place-items-center rounded-md bg-brand/10 text-brand dark:bg-cyan/10 dark:text-cyan">
                          <stat.icon size={21} />
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                          {stat.accent} <ArrowUpRight size={13} />
                        </span>
                      </div>
                      <strong className="mt-5 block text-3xl text-ink dark:text-white">{stat.value}</strong>
                      <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-300">{stat.label}</p>
                    </Card>
                  ))}
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                  <Card>
                    <div className="flex items-center justify-between gap-4">
                      <SectionTitle title="Inbox Summary" copy="Recent user inquiries and the current response state." />
                      <button onClick={() => setActiveTab("inbox")} className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 dark:border-white/10 dark:text-slate-200">
                        Open inbox
                      </button>
                    </div>
                    <div className="mt-6 grid gap-3">
                      {messages.slice(0, 4).map((message) => (
                        <div key={message.id} className="rounded-md bg-slate-50 p-4 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-bold">{message.name}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-300">{message.company || message.email}</p>
                            </div>
                            <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${statusStyles[message.status]}`}>{message.status}</span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-200">
                            {message.message.slice(0, 120)}
                            {message.message.length > 120 ? "..." : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card>
                    <SectionTitle title="What to work on" copy="A small operating queue for the week." />
                    <div className="mt-5 grid gap-3">
                      {["Refresh portfolio copy", "Review new leads", "Update SEO title", "Publish client case study"].map((task) => (
                        <div key={task} className="flex items-start gap-3 rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                          <span className="mt-0.5 grid h-5 w-5 place-items-center rounded border border-cyan text-cyan">
                            <Check size={13} />
                          </span>
                          {task}
                        </div>
                      ))}
                    </div>
                  </Card>
                </section>
              </>
            ) : null}

            {activeTab === "content" ? (
              <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <Card>
                  <SectionTitle title="Site Settings" copy="Change the text and contact details used across the website." />
                  <form onSubmit={saveSettings} className="mt-6 grid gap-4">
                    {[
                      ["companyName", "Company name"],
                      ["tagline", "Tagline"],
                      ["heroTitle", "Hero title"],
                      ["heroSubtitle", "Hero subtitle"],
                      ["ctaPrimary", "Primary CTA"],
                      ["ctaSecondary", "Secondary CTA"],
                      ["email", "Email"],
                      ["phone", "Phone"],
                      ["location", "Location"],
                      ["whatsapp", "WhatsApp number"],
                      ["telegram", "Telegram URL"],
                      ["linkedin", "LinkedIn URL"],
                      ["instagram", "Instagram URL"],
                      ["facebook", "Facebook URL"],
                      ["seoTitle", "SEO title"],
                      ["seoDescription", "SEO description"],
                      ["servicesTitle", "Services heading"],
                      ["servicesCopy", "Services description"],
                      ["whyEyebrow", "Why choose us label"],
                      ["whyTitle", "Why choose us heading"],
                      ["whyCopy", "Why choose us description"],
                      ["portfolioTitle", "Portfolio heading"],
                      ["portfolioCopy", "Portfolio description"],
                      ["processTitle", "Process heading"],
                      ["processCopy", "Process description"],
                      ["testimonialsTitle", "Testimonials heading"],
                      ["testimonialsCopy", "Testimonials description"],
                      ["faqTitle", "FAQ heading"],
                      ["blogTitle", "Blog heading"],
                      ["aboutTitle", "About/team heading"],
                      ["aboutCopy", "About/team description"],
                      ["ctaTitle", "Call-to-action heading"],
                      ["ctaCopy", "Call-to-action description"],
                      ["contactTitle", "Contact heading"]
                    ].map(([key, label]) => (
                      <label key={key} className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {label}
                        <input
                          value={siteState.settings[key as keyof SiteState["settings"]]}
                          onChange={(event) => setSetting(key as keyof SiteState["settings"], event.target.value)}
                          className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-brand dark:border-white/10 dark:bg-slate-900 dark:text-white"
                        />
                      </label>
                    ))}
                    <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-5 py-3 text-sm font-bold text-white shadow-glow transition hover:bg-blue-700">
                      <Sparkles size={17} /> Save site settings
                    </button>
                    {saving ? <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">{saving}</p> : null}
                  </form>
                </Card>

                <Card>
                  <SectionTitle title="Live Preview" copy="A quick read on what the homepage will show." />
                  <div className="mt-6 grid gap-3">
                    <div className="rounded-md bg-slate-50 p-4 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand dark:text-cyan">Hero</p>
                      <h3 className="mt-2 text-xl font-bold">{siteState.settings.heroTitle}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-200">{siteState.settings.heroSubtitle}</p>
                    </div>
                    <div className="rounded-md bg-slate-50 p-4 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand dark:text-cyan">Contact</p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-200">{siteState.settings.email}</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-200">{siteState.settings.phone}</p>
                    </div>
                  </div>
                </Card>
              </section>
            ) : null}

            {activeTab === "sections" ? (
              <section className="grid gap-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-black">Homepage Sections</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Manage the structured content shown across the public website.</p>
                  </div>
                  <button type="button" onClick={() => saveSiteState(siteState)} className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-5 py-3 text-sm font-bold text-white shadow-glow transition hover:bg-blue-700">
                    <Save size={17} /> Save section changes
                  </button>
                </div>

                <section className="grid gap-6 xl:grid-cols-2">
                  <Card>
                    <SectionTitle title="Blog editor" copy="Create and update the posts shown in Blog preview." />
                    <form onSubmit={saveBlogDraft} className="mt-6 grid gap-3">
                      {[
                        ["title", "Title"],
                        ["category", "Category"],
                        ["readTime", "Read time"],
                        ["url", "Article URL"]
                      ].map(([key, label]) => (
                        <label key={key} className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {label}
                          <input
                            value={String(blogDraft[key as keyof EditableBlogPost] ?? "")}
                            onChange={(event) => setBlogDraft((current) => ({ ...current, [key]: event.target.value }))}
                            className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-brand dark:border-white/10 dark:bg-slate-900 dark:text-white"
                          />
                        </label>
                      ))}
                      <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Excerpt
                        <textarea rows={4} value={blogDraft.excerpt} onChange={(event) => setBlogDraft((current) => ({ ...current, excerpt: event.target.value }))} className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-brand dark:border-white/10 dark:bg-slate-900 dark:text-white" />
                      </label>
                      <div className="flex gap-2">
                        <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-3 text-sm font-bold text-white"><Plus size={16} /> Save post</button>
                        <button type="button" onClick={() => setBlogDraft(emptyBlogPost())} className="rounded-md border border-slate-200 px-4 py-3 text-sm font-bold dark:border-white/10">Clear</button>
                      </div>
                    </form>
                    <div className="mt-6 grid gap-3">
                      {siteState.blogPosts.map((post) => (
                        <div key={post.id} className="rounded-md bg-slate-50 p-4 dark:bg-slate-900">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand dark:text-cyan">{post.category}</p>
                          <p className="mt-1 font-bold">{post.title}</p>
                          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{post.readTime}</p>
                          <div className="mt-3 flex gap-2">
                            <button type="button" onClick={() => setBlogDraft({ ...post, url: post.url ?? "" })} className="rounded-md border border-slate-200 p-2 dark:border-white/10" aria-label="Edit blog post"><PencilLine size={16} /></button>
                            <button type="button" onClick={() => removeBlog(post.id)} className="rounded-md border border-slate-200 p-2 dark:border-white/10" aria-label="Delete blog post"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card>
                    <SectionTitle title="Team editor" copy="Add team photos, biographies, roles, and specialties." />
                    <form onSubmit={saveTeamDraft} className="mt-6 grid gap-3">
                      {[
                        ["name", "Name"],
                        ["role", "Role"],
                        ["imageUrl", "Photo URL"]
                      ].map(([key, label]) => (
                        <label key={key} className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {label}
                          <input
                            value={String(teamDraft[key as keyof EditableTeamMember] ?? "")}
                            onChange={(event) => setTeamDraft((current) => ({ ...current, [key]: event.target.value }))}
                            className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-brand dark:border-white/10 dark:bg-slate-900 dark:text-white"
                          />
                        </label>
                      ))}
                      <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Description
                        <textarea rows={4} value={teamDraft.description} onChange={(event) => setTeamDraft((current) => ({ ...current, description: event.target.value }))} className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-brand dark:border-white/10 dark:bg-slate-900 dark:text-white" />
                      </label>
                      {teamDraft.specialties.map((specialty, index) => (
                        <div key={index} className="grid gap-2">
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Specialty {index + 1}</span>
                          <div className="flex gap-2">
                            <input value={specialty} onChange={(event) => setTeamDraft((current) => {
                              const specialties = [...current.specialties];
                              specialties[index] = event.target.value;
                              return { ...current, specialties };
                            })} className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-brand dark:border-white/10 dark:bg-slate-900 dark:text-white" />
                            <button type="button" onClick={() => setTeamDraft((current) => ({ ...current, specialties: current.specialties.filter((_, itemIndex) => itemIndex !== index) }))} className="rounded-md border border-slate-200 p-3 dark:border-white/10" aria-label="Remove specialty"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      ))}
                      <button type="button" onClick={() => setTeamDraft((current) => ({ ...current, specialties: [...current.specialties, ""] }))} className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-bold dark:border-white/10"><Plus size={15} /> Add specialty</button>
                      <div className="flex gap-2">
                        <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-3 text-sm font-bold text-white"><UsersRound size={16} /> Save member</button>
                        <button type="button" onClick={() => setTeamDraft(emptyTeamMember())} className="rounded-md border border-slate-200 px-4 py-3 text-sm font-bold dark:border-white/10">Clear</button>
                      </div>
                    </form>
                    <div className="mt-6 grid gap-3">
                      {siteState.team.map((member) => (
                        <div key={member.id} className="rounded-md bg-slate-50 p-4 dark:bg-slate-900">
                          <p className="font-bold">{member.name}</p>
                          <p className="text-sm text-brand dark:text-cyan">{member.role}</p>
                          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{member.specialties.join(" / ")}</p>
                          <div className="mt-3 flex gap-2">
                            <button type="button" onClick={() => setTeamDraft({ ...member, specialties: [...member.specialties, "", "", ""].slice(0, 3), imageUrl: member.imageUrl ?? "" })} className="rounded-md border border-slate-200 p-2 dark:border-white/10" aria-label="Edit team member"><PencilLine size={16} /></button>
                            <button type="button" onClick={() => removeTeamMember(member.id)} className="rounded-md border border-slate-200 p-2 dark:border-white/10" aria-label="Delete team member"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </section>

                <section className="grid gap-6 xl:grid-cols-2">
                  <Card>
                    <SectionTitle title="Trust points and advantages" copy="Edit, add, or remove the short selling points on the homepage." />
                    {(["trustSignals", "features"] as const).map((key) => (
                      <div key={key} className="mt-6">
                        <h3 className="font-bold">{key === "trustSignals" ? "Trust strip" : "Why choose us points"}</h3>
                        <div className="mt-3 grid gap-2">
                          {siteState[key].map((item) => (
                            <div key={item.id} className="flex gap-2">
                              <input value={item.label} onChange={(event) => updateCollectionItem(key, item.id, { label: event.target.value })} className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-900" />
                              <button type="button" onClick={() => removeCollectionItem(key, item.id)} className="rounded-md border border-slate-200 p-2 dark:border-white/10" aria-label="Delete item"><Trash2 size={16} /></button>
                            </div>
                          ))}
                        </div>
                        <button type="button" onClick={() => setSiteState((current) => ({ ...current, [key]: [...current[key], { id: newItemId(key), label: "New item" }] }))} className="mt-3 inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-bold dark:border-white/10"><Plus size={15} /> Add item</button>
                      </div>
                    ))}
                  </Card>

                  <Card>
                    <SectionTitle title="Hero and dashboard figures" copy="Control the public statistics, highlights, and percentage scores." />
                    {(["heroStats", "heroHighlights", "growthMetrics", "performanceMetrics"] as const).map((key) => (
                      <div key={key} className="mt-6">
                        <h3 className="font-bold">{key.replace(/([A-Z])/g, " $1")}</h3>
                        <div className="mt-3 grid gap-3">
                          {siteState[key].map((item) => (
                            <div key={item.id} className="grid gap-2 rounded-md bg-slate-50 p-3 dark:bg-slate-900 sm:grid-cols-[0.7fr_1fr_auto]">
                              <input value={item.value} onChange={(event) => updateCollectionItem(key, item.id, { value: event.target.value })} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950" />
                              <input value={item.label} onChange={(event) => updateCollectionItem(key, item.id, { label: event.target.value })} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950" />
                              <button type="button" onClick={() => removeCollectionItem(key, item.id)} className="rounded-md border border-slate-200 p-2 dark:border-white/10" aria-label="Delete metric"><Trash2 size={16} /></button>
                              {"description" in item ? (
                                <textarea value={item.description ?? ""} onChange={(event) => updateCollectionItem(key, item.id, { description: event.target.value })} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950 sm:col-span-3" />
                              ) : null}
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setSiteState((current) => ({
                            ...current,
                            [key]: [
                              ...current[key],
                              {
                                id: newItemId(key),
                                value: key === "growthMetrics" ? "0" : "New",
                                label: "New metric",
                                ...(key === "performanceMetrics" ? { description: "Describe this metric" } : {})
                              }
                            ]
                          }))}
                          className="mt-3 inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-bold dark:border-white/10"
                        >
                          <Plus size={15} /> Add metric
                        </button>
                      </div>
                    ))}
                  </Card>
                </section>

                <section className="grid gap-6 xl:grid-cols-3">
                  <Card>
                    <SectionTitle title="Process" copy="Manage the steps from discovery to growth." />
                    <div className="mt-5 grid gap-3">
                      {siteState.process.map((step) => (
                        <div key={step.id} className="grid gap-2 rounded-md bg-slate-50 p-3 dark:bg-slate-900">
                          <input value={step.title} onChange={(event) => updateCollectionItem("process", step.id, { title: event.target.value })} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold dark:border-white/10 dark:bg-slate-950" />
                          <textarea value={step.description} onChange={(event) => updateCollectionItem("process", step.id, { description: event.target.value })} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950" />
                          <button type="button" onClick={() => removeCollectionItem("process", step.id)} className="w-fit rounded-md border border-slate-200 p-2 dark:border-white/10" aria-label="Delete process step"><Trash2 size={16} /></button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setSiteState((current) => ({ ...current, process: [...current.process, { id: newItemId("process"), title: "New step", description: "Describe this step" }] }))} className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-bold dark:border-white/10"><Plus size={15} /> Add step</button>
                    </div>
                  </Card>

                  <Card>
                    <SectionTitle title="Testimonials" copy="Create, edit, and remove client feedback." />
                    <div className="mt-5 grid gap-3">
                      {siteState.testimonials.map((item) => (
                        <div key={item.id} className="grid gap-2 rounded-md bg-slate-50 p-3 dark:bg-slate-900">
                          {(["name", "role", "company"] as const).map((field) => (
                            <input key={field} value={item[field]} onChange={(event) => updateCollectionItem("testimonials", item.id, { [field]: event.target.value })} placeholder={field} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950" />
                          ))}
                          <textarea value={item.quote} onChange={(event) => updateCollectionItem("testimonials", item.id, { quote: event.target.value })} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950" />
                          <button type="button" onClick={() => removeCollectionItem("testimonials", item.id)} className="w-fit rounded-md border border-slate-200 p-2 dark:border-white/10" aria-label="Delete testimonial"><Trash2 size={16} /></button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setSiteState((current) => ({ ...current, testimonials: [...current.testimonials, { id: newItemId("testimonial"), name: "Client name", role: "Role", company: "Company", quote: "Client feedback" }] }))} className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-bold dark:border-white/10"><Plus size={15} /> Add testimonial</button>
                    </div>
                  </Card>

                  <Card>
                    <SectionTitle title="FAQs" copy="Manage common questions and answers." />
                    <div className="mt-5 grid gap-3">
                      {siteState.faqs.map((faq) => (
                        <div key={faq.id} className="grid gap-2 rounded-md bg-slate-50 p-3 dark:bg-slate-900">
                          <input value={faq.question} onChange={(event) => updateCollectionItem("faqs", faq.id, { question: event.target.value })} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold dark:border-white/10 dark:bg-slate-950" />
                          <textarea value={faq.answer} onChange={(event) => updateCollectionItem("faqs", faq.id, { answer: event.target.value })} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950" />
                          <button type="button" onClick={() => removeCollectionItem("faqs", faq.id)} className="w-fit rounded-md border border-slate-200 p-2 dark:border-white/10" aria-label="Delete FAQ"><Trash2 size={16} /></button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setSiteState((current) => ({ ...current, faqs: [...current.faqs, { id: newItemId("faq"), question: "New question", answer: "New answer" }] }))} className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-bold dark:border-white/10"><Plus size={15} /> Add FAQ</button>
                    </div>
                  </Card>
                </section>
                {saving ? <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">{saving}</p> : null}
              </section>
            ) : null}

            {activeTab === "services" ? (
              <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
                <Card>
                  <SectionTitle title={serviceDraft.id ? "Edit service" : "Add service"} copy="Create or update the services shown on the homepage." />
                  <form onSubmit={saveServiceDraft} className="mt-6 grid gap-4">
                    <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Title
                      <input
                        value={serviceDraft.title}
                        onChange={(event) => setServiceDraft((current) => ({ ...current, title: event.target.value }))}
                        className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-brand dark:border-white/10 dark:bg-slate-900 dark:text-white"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Description
                      <textarea
                        rows={4}
                        value={serviceDraft.description}
                        onChange={(event) => setServiceDraft((current) => ({ ...current, description: event.target.value }))}
                        className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-brand dark:border-white/10 dark:bg-slate-900 dark:text-white"
                      />
                    </label>
                    {serviceDraft.bullets.map((bullet, index) => (
                      <label key={index} className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Bullet {index + 1}
                        <input
                          value={bullet}
                          onChange={(event) =>
                            setServiceDraft((current) => {
                              const bullets = [...current.bullets];
                              bullets[index] = event.target.value;
                              return { ...current, bullets };
                            })
                          }
                          className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-brand dark:border-white/10 dark:bg-slate-900 dark:text-white"
                        />
                      </label>
                    ))}
                    <div className="flex gap-2">
                      <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-4 py-3 text-sm font-bold text-white shadow-glow transition hover:bg-blue-700">
                        <Plus size={16} /> Save service
                      </button>
                      <button type="button" onClick={() => setServiceDraft(emptyService())} className="rounded-md border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 dark:border-white/10 dark:text-slate-200">
                        Clear
                      </button>
                    </div>
                  </form>
                </Card>

                <Card>
                  <SectionTitle title="Service list" copy="Edit, remove, or reorder the services people see." />
                  <div className="mt-6 grid gap-3">
                    {siteState.services.map((service) => (
                      <div key={service.id} className="rounded-md bg-slate-50 p-4 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-bold">{service.title}</p>
                            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-200">{service.description}</p>
                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">{service.bullets.join(" · ")}</p>
                          </div>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => editService(service)} className="rounded-md border border-slate-200 p-2 text-slate-600 dark:border-white/10 dark:text-slate-200" aria-label="Edit service">
                              <PencilLine size={16} />
                            </button>
                            <button type="button" onClick={() => removeService(service.id)} className="rounded-md border border-slate-200 p-2 text-slate-600 dark:border-white/10 dark:text-slate-200" aria-label="Delete service">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </section>
            ) : null}

            {activeTab === "work" ? (
              <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
                <Card>
                  <SectionTitle title={portfolioDraft.id ? "Edit project" : "Add project"} copy="Manage sample work cards for the homepage portfolio." />
                  <form onSubmit={savePortfolioDraft} className="mt-6 grid gap-4">
                    <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Title
                      <input
                        value={portfolioDraft.title}
                        onChange={(event) => setPortfolioDraft((current) => ({ ...current, title: event.target.value }))}
                        className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-brand dark:border-white/10 dark:bg-slate-900 dark:text-white"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Type
                      <input
                        value={portfolioDraft.type}
                        onChange={(event) => setPortfolioDraft((current) => ({ ...current, type: event.target.value }))}
                        className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-brand dark:border-white/10 dark:bg-slate-900 dark:text-white"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Description
                      <textarea
                        rows={4}
                        value={portfolioDraft.description}
                        onChange={(event) => setPortfolioDraft((current) => ({ ...current, description: event.target.value }))}
                        className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-brand dark:border-white/10 dark:bg-slate-900 dark:text-white"
                      />
                    </label>
                    {portfolioDraft.stack.map((item, index) => (
                      <label key={index} className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Stack item {index + 1}
                        <input
                          value={item}
                          onChange={(event) =>
                            setPortfolioDraft((current) => {
                              const stack = [...current.stack];
                              stack[index] = event.target.value;
                              return { ...current, stack };
                            })
                          }
                          className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-brand dark:border-white/10 dark:bg-slate-900 dark:text-white"
                        />
                      </label>
                    ))}
                    <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Result
                      <input
                        value={portfolioDraft.result}
                        onChange={(event) => setPortfolioDraft((current) => ({ ...current, result: event.target.value }))}
                        className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-brand dark:border-white/10 dark:bg-slate-900 dark:text-white"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <span className="flex items-center gap-2">
                        <Link2 size={15} className="text-brand dark:text-cyan" />
                        Website link
                      </span>
                      <input
                        value={portfolioDraft.websiteUrl ?? ""}
                        onChange={(event) => setPortfolioDraft((current) => ({ ...current, websiteUrl: event.target.value }))}
                        placeholder="https://example.com"
                        className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand dark:border-white/10 dark:bg-slate-900 dark:text-white"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <span className="flex items-center gap-2">
                        <ImageIcon size={15} className="text-brand dark:text-cyan" />
                        Logo image URL
                      </span>
                      <input
                        value={portfolioDraft.logoUrl ?? ""}
                        onChange={(event) => setPortfolioDraft((current) => ({ ...current, logoUrl: event.target.value }))}
                        placeholder="/logo.png"
                        className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand dark:border-white/10 dark:bg-slate-900 dark:text-white"
                      />
                    </label>
                    <div className="flex gap-2">
                      <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-4 py-3 text-sm font-bold text-white shadow-glow transition hover:bg-blue-700">
                        <Plus size={16} /> Save work
                      </button>
                      <button type="button" onClick={() => setPortfolioDraft(emptyPortfolio())} className="rounded-md border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 dark:border-white/10 dark:text-slate-200">
                        Clear
                      </button>
                    </div>
                  </form>
                </Card>

                <Card>
                  <SectionTitle title="Portfolio list" copy="Control the cards that showcase sample work." />
                  <div className="mt-6 grid gap-3">
                    {siteState.portfolio.map((item) => (
                      <div key={item.id} className="rounded-md bg-slate-50 p-4 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-3">
                              {item.logoUrl ? (
                                <img
                                  src={item.logoUrl}
                                  alt={`${item.title} logo`}
                                  className="h-10 w-10 rounded-md object-contain bg-white p-1"
                                />
                              ) : (
                                <div className="grid h-10 w-10 place-items-center rounded-md bg-ink text-white dark:bg-white dark:text-ink">
                                  <CircleHelp size={18} />
                                </div>
                              )}
                              <div>
                                <p className="font-bold">{item.title}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-300">{item.type}</p>
                              </div>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-200">{item.description}</p>
                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">{item.stack.join(" · ")}</p>
                            <p className="mt-2 text-sm font-bold text-emerald-600 dark:text-emerald-300">{item.result}</p>
                            {item.websiteUrl ? (
                              <a
                                href={item.websiteUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 dark:border-white/10 dark:text-slate-200"
                              >
                                <Link2 size={14} /> Visit website
                              </a>
                            ) : null}
                          </div>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => editPortfolio(item)} className="rounded-md border border-slate-200 p-2 text-slate-600 dark:border-white/10 dark:text-slate-200" aria-label="Edit project">
                              <PencilLine size={16} />
                            </button>
                            <button type="button" onClick={() => removePortfolio(item.id)} className="rounded-md border border-slate-200 p-2 text-slate-600 dark:border-white/10 dark:text-slate-200" aria-label="Delete project">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </section>
            ) : null}

            {activeTab === "inbox" ? (
              <section className="grid gap-6">
                <Card>
                  <SectionTitle title="Messages" copy="Read, update, archive, or delete incoming inquiries." />
                  <div className="mt-6 grid gap-3">
                    {filteredMessages.map((message) => (
                      <div key={message.id} className="rounded-md bg-slate-50 p-4 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-bold">{message.name}</p>
                              <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${statusStyles[message.status]}`}>{message.status}</span>
                            </div>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                              {message.company || "No company"} · {message.email}
                            </p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{message.phone}</p>
                            <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-200">{message.message}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              value={message.status}
                              onChange={(event) => updateMessage(message.id, { status: event.target.value as InboxMessage["status"] })}
                              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                            >
                              <option value="new">new</option>
                              <option value="read">read</option>
                              <option value="replied">replied</option>
                              <option value="archived">archived</option>
                            </select>
                            <button type="button" onClick={() => updateMessage(message.id, { status: "read" })} className="rounded-md border border-slate-200 p-2 text-slate-600 dark:border-white/10 dark:text-slate-200" aria-label="Mark read">
                              <Check size={16} />
                            </button>
                            <button type="button" onClick={() => updateMessage(message.id, { status: "replied" })} className="rounded-md border border-slate-200 p-2 text-slate-600 dark:border-white/10 dark:text-slate-200" aria-label="Mark replied">
                              <ChevronRight size={16} />
                            </button>
                            <button type="button" onClick={() => deleteMessage(message.id)} className="rounded-md border border-slate-200 p-2 text-slate-600 dark:border-white/10 dark:text-slate-200" aria-label="Delete message">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!filteredMessages.length ? (
                      <div className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
                        No messages found.
                      </div>
                    ) : null}
                  </div>
                </Card>
              </section>
            ) : null}

            {activeTab === "analytics" ? (
              <section className="grid gap-6">
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: "Unread", value: analytics?.unreadMessages ?? unreadMessages.length, icon: Mail },
                    { label: "Replied", value: analytics?.respondedMessages ?? messages.filter((message) => message.status === "replied").length, icon: ChevronRight },
                    { label: "Services", value: analytics?.totalServices ?? siteState.services.length, icon: Building2 },
                    { label: "Works", value: analytics?.totalPortfolioItems ?? siteState.portfolio.length, icon: Eye }
                  ].map((stat) => (
                    <Card key={stat.label}>
                      <div className="flex items-start justify-between">
                        <span className="grid h-11 w-11 place-items-center rounded-md bg-brand/10 text-brand dark:bg-cyan/10 dark:text-cyan">
                          <stat.icon size={21} />
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                          Live
                        </span>
                      </div>
                      <strong className="mt-5 block text-3xl text-ink dark:text-white">{stat.value}</strong>
                      <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-300">{stat.label}</p>
                    </Card>
                  ))}
                </section>

                <section className="grid gap-6 xl:grid-cols-2">
                  <Card>
                    <SectionTitle title="Weekly lead trend" copy="A rough view of recent demand." />
                    <div className="mt-6 grid grid-cols-7 items-end gap-2">
                      {(analytics?.monthlyTrend ?? []).map((point) => (
                        <div key={point.label} className="grid gap-2">
                          <div className="flex h-40 items-end rounded-md bg-slate-100 p-2 dark:bg-slate-900">
                            <div className="w-full rounded-t-md bg-gradient-to-t from-brand to-cyan" style={{ height: `${point.value * 4}px` }} />
                          </div>
                          <span className="text-center text-xs font-semibold text-slate-500 dark:text-slate-300">{point.label}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card>
                    <SectionTitle title="Service demand" copy="Messages grouped by the services you offer." />
                    <div className="mt-6 grid gap-4">
                      {(analytics?.serviceCounts ?? []).map((point) => (
                        <div key={point.label}>
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="font-semibold">{point.label}</span>
                            <span className="text-slate-500 dark:text-slate-300">{point.value}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100 dark:bg-white/10">
                            <div className="h-2 rounded-full bg-gradient-to-r from-brand to-cyan" style={{ width: `${Math.min(100, point.value * 10)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </section>
              </section>
            ) : null}

            {activeTab === "accounts" ? (
              <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <Card>
                  <SectionTitle title={accountDraft.id ? "Edit account" : "Add account"} copy="Assign usernames and passwords, then pause or remove access when needed." />
                  <form onSubmit={saveAccount} className="mt-6 grid gap-4">
                    <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <span className="flex items-center gap-2">
                        <UserPlus size={15} className="text-brand dark:text-cyan" />
                        Username
                      </span>
                      <input
                        value={accountDraft.username}
                        onChange={(event) => setAccountDraft((current) => ({ ...current, username: event.target.value }))}
                        className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-brand dark:border-white/10 dark:bg-slate-900 dark:text-white"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <span className="flex items-center gap-2">
                        <KeyRound size={15} className="text-brand dark:text-cyan" />
                        Password {accountDraft.id ? "(leave blank to keep existing)" : ""}
                      </span>
                      <input
                        type="password"
                        value={accountDraft.password}
                        onChange={(event) => setAccountDraft((current) => ({ ...current, password: event.target.value }))}
                        className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-brand dark:border-white/10 dark:bg-slate-900 dark:text-white"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Status
                      <select
                        value={accountDraft.status}
                        onChange={(event) => setAccountDraft((current) => ({ ...current, status: event.target.value as AdminStatus }))}
                        className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-brand dark:border-white/10 dark:bg-slate-900 dark:text-white"
                      >
                        <option value="active">active</option>
                        <option value="paused">paused</option>
                      </select>
                    </label>
                    <div className="flex gap-2">
                      <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-4 py-3 text-sm font-bold text-white shadow-glow transition hover:bg-blue-700">
                        <Save size={16} /> Save account
                      </button>
                      <button type="button" onClick={() => setAccountDraft(emptyAdminDraft())} className="rounded-md border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 dark:border-white/10 dark:text-slate-200">
                        Clear
                      </button>
                    </div>
                  </form>
                </Card>

                <Card>
                  <SectionTitle title="Admin users" copy="Pause access, delete accounts, or edit credentials when responsibilities change." />
                  <div className="mt-6 grid gap-3">
                    {accounts.map((account) => (
                      <div key={account.id} className="rounded-md bg-slate-50 p-4 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-bold">{account.username}</p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                              {account.status} · {account.lastLoginAt ? `last login ${new Date(account.lastLoginAt).toLocaleString()}` : "never logged in"}
                            </p>
                          </div>
                          <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${account.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200" : "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200"}`}>
                            {account.status}
                          </span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button type="button" onClick={() => editAccount(account)} className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200">
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleAccountStatus(account, account.status === "active" ? "paused" : "active")}
                            className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200"
                          >
                            {account.status === "active" ? <CirclePause size={16} /> : <CirclePlay size={16} />}
                            {account.status === "active" ? "Pause" : "Resume"}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteAccount(account.id)}
                            className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </section>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
