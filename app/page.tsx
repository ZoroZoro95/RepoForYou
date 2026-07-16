"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Repo = {
  fullName: string;
  company: string;
  domain: string;
  language: string;
  signal: "Excellent" | "Strong" | "Selective" | "Risky";
  difficulty: "Low" | "Medium" | "High" | "Very high";
  fit: string;
  caution: string;
  labels: string[];
};

type GithubIssue = {
  id: number;
  number: number;
  title: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  user?: { login: string };
  labels: Array<{ name: string; color?: string }>;
  comments: number;
  pull_request?: unknown;
};

const repos: Repo[] = [
  {
    fullName: "ansible/ansible",
    company: "Red Hat",
    domain: "automation / infrastructure",
    language: "Python",
    signal: "Excellent",
    difficulty: "Medium",
    fit: "Best Red Hat-aligned target if you want visible, practical infra contributions without jumping straight into Kubernetes internals.",
    caution:
      "Do not start with large feature work. Their own README tells contributors to talk first for larger changes.",
    labels: ["bug", "docs", "affects_*"],
  },
  {
    fullName: "ansible/awx",
    company: "Red Hat / Ansible Automation Platform upstream",
    domain: "automation platform / web app",
    language: "Python, Django, React",
    signal: "Strong",
    difficulty: "High",
    fit: "Very relevant to your stack and directly Red Hat-adjacent. It maps to enterprise backend, REST APIs, RBAC, task execution, and UI work.",
    caution:
      "AWX has been in a large refactor and releases were paused. Contribute only after reading current forum/repo direction; otherwise you can spend months on dead-end areas.",
    labels: ["community", "needs_triage", "type:bug"],
  },
  {
    fullName: "ansible/django-ansible-base",
    company: "Red Hat / Ansible",
    domain: "Django platform foundation",
    language: "Python, Django",
    signal: "Excellent",
    difficulty: "Medium",
    fit: "Probably the sharpest Red Hat fit for your current stack: Django, RBAC, resource registry, API foundations, and smaller surface area than AWX.",
    caution:
      "Small repo does not mean easy. You need clean tests and careful compatibility work because downstream Ansible platform code depends on it.",
    labels: ["bug", "help wanted", "good first issue"],
  },
  {
    fullName: "ansible/ansible-lint",
    company: "Red Hat / Ansible",
    domain: "developer tooling / automation quality",
    language: "Python",
    signal: "Strong",
    difficulty: "Medium",
    fit: "Good entry point if you want faster review cycles and Python-only tooling work before moving into larger Red Hat platform repos.",
    caution:
      "Lint-rule changes are deceptively political. False positives and backwards compatibility matter more than clever code.",
    labels: ["bug", "help wanted", "good first issue"],
  },
  {
    fullName: "getsentry/sentry",
    company: "Sentry",
    domain: "observability / error tracking",
    language: "Python, Django, TypeScript, React",
    signal: "Excellent",
    difficulty: "High",
    fit: "One of the best matches for Python + Django + React. Contributions here are directly legible to product engineering teams.",
    caution:
      "Huge codebase and many issues are product-owned. Pick narrow bugs with reproduction steps; random feature requests are weak signal.",
    labels: ["Bug", "Product Area:*", "javascript"],
  },
  {
    fullName: "zulip/zulip",
    company: "Zulip",
    domain: "collaboration / chat",
    language: "Python, Django, TypeScript, React Native",
    signal: "Excellent",
    difficulty: "Medium",
    fit: "Best training-ground repo in this list: serious Django app, strong contributor docs, lots of open issues, and visible maintainer review.",
    caution:
      "Because they onboard many contributors, low-effort PRs will not distinguish you. Aim for repeated ownership of one feature area.",
    labels: ["good first issue", "help wanted", "area:*"],
  },
  {
    fullName: "saleor/saleor",
    company: "Saleor Commerce",
    domain: "headless commerce / GraphQL API",
    language: "Python, Django, GraphQL",
    signal: "Strong",
    difficulty: "Medium",
    fit: "Excellent if you want backend product work: Django, GraphQL, permissions, checkout, payments, async integrations.",
    caution:
      "Commerce bugs require domain precision. Do not touch payments/tax/inventory logic without tests and a very clear reproduction.",
    labels: ["Good first issue", "Help wanted", "bug", "triage"],
  },
  {
    fullName: "saleor/storefront",
    company: "Saleor Commerce",
    domain: "commerce frontend",
    language: "React, Next.js, TypeScript, GraphQL",
    signal: "Strong",
    difficulty: "Medium",
    fit: "Good React/Next target tied to a real open-source company and a backend you can also learn through Saleor core.",
    caution:
      "Frontend-only storefront polish is weaker than fixing typed GraphQL/data-flow bugs across API and UI.",
    labels: ["bug", "good first issue", "help wanted"],
  },
  {
    fullName: "wagtail/wagtail",
    company: "Torchbox-backed Wagtail ecosystem",
    domain: "Django CMS",
    language: "Python, Django, JavaScript",
    signal: "Strong",
    difficulty: "Medium",
    fit: "Very good Django credibility repo. It is mature, widely used, and has clear component labels.",
    caution:
      "CMS/admin UX changes need backwards compatibility and accessibility discipline. Avoid drive-by UI changes.",
    labels: ["good first issue", "type:Bug", "component:Django"],
  },
  {
    fullName: "netbox-community/netbox",
    company: "NetBox Labs",
    domain: "network automation / source of truth",
    language: "Python, Django",
    signal: "Strong",
    difficulty: "High",
    fit: "Strong enterprise Django repo with a real company behind hosted NetBox. Good if you want infra-adjacent Python without Go/Kubernetes.",
    caution:
      "Their process is strict: accepted issues matter. Do not open PRs before the issue is accepted or you will waste time.",
    labels: ["status: accepted", "type: bug", "status: needs owner"],
  },
  {
    fullName: "apache/airflow",
    company: "Astronomer, Google Cloud, data-platform employers",
    domain: "workflow orchestration / data engineering",
    language: "Python, React, TypeScript",
    signal: "Excellent",
    difficulty: "High",
    fit: "High hiring signal for Python backend/data-platform jobs. Many companies hire around Airflow experience.",
    caution:
      "Apache process is slower and more formal. You need patience, tests, and willingness to discuss design publicly.",
    labels: ["good first issue", "kind:bug", "area:*"],
  },
  {
    fullName: "dagster-io/dagster",
    company: "Dagster Labs",
    domain: "data orchestration / data assets",
    language: "Python, TypeScript, React",
    signal: "Excellent",
    difficulty: "High",
    fit: "Very relevant if you want modern data-platform roles. Company-backed, active, Python-heavy, and UI-heavy.",
    caution:
      "Large issue count does not mean easy. Start with integrations/docs/tests before core orchestration semantics.",
    labels: ["good first issue", "bug", "area:*"],
  },
  {
    fullName: "PrefectHQ/prefect",
    company: "Prefect",
    domain: "workflow orchestration",
    language: "Python",
    signal: "Strong",
    difficulty: "Medium",
    fit: "Good Python product-infra repo with a company behind it. Faster ramp than Airflow for many contributors.",
    caution:
      "Make sure issues apply to current major versions; old Prefect behavior changed significantly across versions.",
    labels: ["bug", "good first issue", "help wanted"],
  },
  {
    fullName: "mlflow/mlflow",
    company: "Databricks / ML platform ecosystem",
    domain: "ML lifecycle / AI engineering",
    language: "Python, TypeScript, React",
    signal: "Excellent",
    difficulty: "High",
    fit: "Strong if you want ML platform roles without becoming a model researcher. Good bridge from Python web/API work into AI tooling.",
    caution:
      "Issues often depend on Databricks or cloud-specific behavior. Reproducibility is the gate; without it, PRs are weak.",
    labels: ["bug", "area/*", "good first issue"],
  },
  {
    fullName: "appsmithorg/appsmith",
    company: "Appsmith",
    domain: "internal tools / low-code platform",
    language: "TypeScript, React, Java",
    signal: "Strong",
    difficulty: "Medium",
    fit: "Useful if you want React-heavy product engineering. Many frontend bugs are visible and user-facing.",
    caution:
      "Not Python/Django. Good for React credibility, but less aligned with your backend stack.",
    labels: ["Good First Issue", "Frontend", "Bug"],
  },
  {
    fullName: "mattermost/mattermost",
    company: "Mattermost",
    domain: "collaboration / messaging",
    language: "TypeScript, React, Go",
    signal: "Strong",
    difficulty: "High",
    fit: "Good React product-engineering target with a company behind it and many help-wanted issues.",
    caution:
      "Backend is Go. If you only want Python/Django, this is a secondary target, not your main year-long bet.",
    labels: ["Help Wanted", "Bug Report/Open", "Area/*"],
  },
  {
    fullName: "keycloak/keycloak",
    company: "Red Hat / CNCF ecosystem",
    domain: "identity / access management",
    language: "Java, TypeScript",
    signal: "Excellent",
    difficulty: "High",
    fit: "High-value enterprise backend project. Good if you can tolerate Java, auth protocol details, and slower review loops.",
    caution:
      "Auth bugs are not beginner toys. You need tests and standards awareness, otherwise maintainers will ignore you.",
    labels: ["good-first-issue", "kind/bug", "area/*"],
  },
  {
    fullName: "kubernetes/kubernetes",
    company: "Google, Red Hat, VMware, Microsoft, cloud vendors",
    domain: "cloud infrastructure",
    language: "Go",
    signal: "Excellent",
    difficulty: "Very high",
    fit: "The strongest brand-name signal, but only if you survive the process and become consistently useful.",
    caution:
      "Bad first choice if you just want quick merged PRs. The repo is huge and process-heavy.",
    labels: ["kind/bug", "sig/*", "help wanted"],
  },
  {
    fullName: "prometheus/prometheus",
    company: "Grafana Labs / CNCF ecosystem",
    domain: "observability",
    language: "Go",
    signal: "Strong",
    difficulty: "High",
    fit: "Good route into observability companies. Smaller surface than Kubernetes but still serious infrastructure.",
    caution:
      "Prometheus changes need strong reasoning around correctness, compatibility, and operational behavior.",
    labels: ["component/*", "kind/bug", "help wanted"],
  },
  {
    fullName: "grafana/grafana",
    company: "Grafana Labs",
    domain: "observability UI / platform",
    language: "TypeScript, Go",
    signal: "Strong",
    difficulty: "High",
    fit: "Best if you want a mixed frontend/backend path with a company directly behind the repo.",
    caution:
      "The repo is large. Random UI polish PRs are weak signal; chase bugs with tests or owned subsystems.",
    labels: ["area/*", "type/bug", "good first issue"],
  },
  {
    fullName: "cilium/cilium",
    company: "Cisco / Isovalent, CNCF ecosystem",
    domain: "eBPF networking / security",
    language: "Go, C",
    signal: "Excellent",
    difficulty: "Very high",
    fit: "Very high career upside if you want deep systems/networking credibility.",
    caution:
      "This is not a casual repo. You need Linux networking, Kubernetes, and eBPF fundamentals.",
    labels: ["kind/bug", "area/*", "good-first-issue"],
  },
  {
    fullName: "envoyproxy/envoy",
    company: "Tetrate, Solo.io, Lyft-origin, CNCF ecosystem",
    domain: "proxy / service mesh",
    language: "C++",
    signal: "Strong",
    difficulty: "Very high",
    fit: "Good if you want backend systems credibility and are willing to get serious about C++ and networking.",
    caution:
      "Not suitable if you are still shaky with C++, tests, or protocol-level debugging.",
    labels: ["help wanted", "area/*", "bug"],
  },
  {
    fullName: "rust-lang/rust",
    company: "Rust ecosystem employers",
    domain: "compiler / language tooling",
    language: "Rust",
    signal: "Selective",
    difficulty: "Very high",
    fit: "Strong general signal for systems/tooling jobs, but less direct to one company than Red Hat/Grafana/Cilium.",
    caution:
      "Compiler work is slow to ramp. Do not pick this unless you want the language/toolchain path itself.",
    labels: ["E-easy", "E-mentor", "A-*"],
  },
];

const sourceLinks = [
  {
    label: "Red Hat contributions list",
    href: "https://www.redhat.com/en/about/open-source-program-office/contributions",
  },
  {
    label: "Ansible repository",
    href: "https://github.com/ansible/ansible",
  },
  {
    label: "Ansible organization repositories",
    href: "https://github.com/ansible",
  },
  {
    label: "AWX repository",
    href: "https://github.com/ansible/awx",
  },
  {
    label: "django-ansible-base repository",
    href: "https://github.com/ansible/django-ansible-base",
  },
  {
    label: "ansible-lint repository",
    href: "https://github.com/ansible/ansible-lint",
  },
  {
    label: "Sentry repository",
    href: "https://github.com/getsentry/sentry",
  },
  {
    label: "Zulip repository",
    href: "https://github.com/zulip/zulip",
  },
  {
    label: "Saleor repository",
    href: "https://github.com/saleor/saleor",
  },
  {
    label: "Saleor Storefront repository",
    href: "https://github.com/saleor/storefront",
  },
  {
    label: "Wagtail repository",
    href: "https://github.com/wagtail/wagtail",
  },
  {
    label: "NetBox repository",
    href: "https://github.com/netbox-community/netbox",
  },
  {
    label: "Airflow repository",
    href: "https://github.com/apache/airflow",
  },
  {
    label: "Dagster repository",
    href: "https://github.com/dagster-io/dagster",
  },
  {
    label: "Prefect repository",
    href: "https://github.com/PrefectHQ/prefect",
  },
  {
    label: "MLflow repository",
    href: "https://github.com/mlflow/mlflow",
  },
  {
    label: "Appsmith repository",
    href: "https://github.com/appsmithorg/appsmith",
  },
  {
    label: "Mattermost repository",
    href: "https://github.com/mattermost/mattermost",
  },
  {
    label: "Keycloak repository",
    href: "https://github.com/keycloak/keycloak",
  },
  {
    label: "Kubernetes repository",
    href: "https://github.com/kubernetes/kubernetes",
  },
  {
    label: "Prometheus repository",
    href: "https://github.com/prometheus/prometheus",
  },
  {
    label: "Grafana repository",
    href: "https://github.com/grafana/grafana",
  },
  {
    label: "Cilium repository",
    href: "https://github.com/cilium/cilium",
  },
  {
    label: "Envoy repository",
    href: "https://github.com/envoyproxy/envoy",
  },
  {
    label: "Rust repository",
    href: "https://github.com/rust-lang/rust",
  },
];

const defaultWatched = [
  "ansible/django-ansible-base",
  "getsentry/sentry",
  "zulip/zulip",
  "saleor/saleor",
];
const pollOptions = [30_000, 60_000, 120_000, 300_000];

function formatAge(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60_000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function signalClass(signal: Repo["signal"]) {
  return signal.toLowerCase().replace(" ", "-");
}

function dedupeIssues(items: GithubIssue[]) {
  const seen = new Set<number>();
  return items.filter((issue) => {
    if (issue.pull_request || seen.has(issue.id)) return false;
    seen.add(issue.id);
    return true;
  });
}

export default function Home() {
  const [watched, setWatched] = useState<string[]>(defaultWatched);
  const [pollMs, setPollMs] = useState(60_000);
  const [token, setToken] = useState("");
  const [issues, setIssues] = useState<Record<string, GithubIssue[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [notifications, setNotifications] = useState(false);
  const knownIssueIds = useRef<Set<number>>(new Set());
  const initialLoadComplete = useRef(false);

  useEffect(() => {
    const savedToken = window.localStorage.getItem("github-token") ?? "";
    const savedWatched = window.localStorage.getItem("watched-repos");
    const savedPoll = window.localStorage.getItem("poll-ms");
    setToken(savedToken);
    if (savedWatched) setWatched(JSON.parse(savedWatched));
    if (savedPoll) setPollMs(Number(savedPoll));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("watched-repos", JSON.stringify(watched));
    window.localStorage.setItem("poll-ms", String(pollMs));
  }, [watched, pollMs]);

  useEffect(() => {
    if (token) window.localStorage.setItem("github-token", token);
    else window.localStorage.removeItem("github-token");
  }, [token]);

  async function fetchIssues(silent = false) {
    if (!watched.length) return;
    setLoading(!silent);
    setError("");
    try {
      const headers: HeadersInit = {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      };
      if (token.trim()) headers.Authorization = `Bearer ${token.trim()}`;

      const responses = await Promise.all(
        watched.map(async (repo) => {
          const url = `https://api.github.com/repos/${repo}/issues?state=open&sort=created&direction=desc&per_page=12`;
          const response = await fetch(url, { headers });
          if (!response.ok) {
            throw new Error(
              `${repo}: GitHub returned ${response.status} ${response.statusText}`,
            );
          }
          const data = (await response.json()) as GithubIssue[];
          return [repo, dedupeIssues(data)] as const;
        }),
      );

      const nextIssues = Object.fromEntries(responses);
      const newIssues: GithubIssue[] = [];
      for (const repoIssues of Object.values(nextIssues)) {
        for (const issue of repoIssues) {
          if (!knownIssueIds.current.has(issue.id)) newIssues.push(issue);
        }
      }

      for (const issue of newIssues) knownIssueIds.current.add(issue.id);
      setIssues(nextIssues);
      setLastChecked(new Date());

      if (
        notifications &&
        initialLoadComplete.current &&
        newIssues.length &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        const issue = newIssues[0];
        new Notification(`${newIssues.length} new GitHub issue(s)`, {
          body: `Latest: #${issue.number} ${issue.title}`,
        });
      }
      initialLoadComplete.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown GitHub error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchIssues();
    const id = window.setInterval(() => fetchIssues(true), pollMs);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watched.join(","), pollMs, token]);

  const allIssues = useMemo(
    () =>
      Object.entries(issues)
        .flatMap(([repo, repoIssues]) =>
          repoIssues.map((issue) => ({ ...issue, repo })),
        )
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
    [issues],
  );

  async function enableNotifications() {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setNotifications(permission === "granted");
  }

  function toggleRepo(repo: string) {
    setWatched((current) =>
      current.includes(repo)
        ? current.filter((item) => item !== repo)
        : [...current, repo],
    );
  }

  const rateLimitWarning =
    !token.trim() && watched.length > 2
      ? "You are watching more than two repos without a token. GitHub's anonymous rate limit will bite you."
      : "";

  return (
    <main className="min-h-screen bg-[#08111f] text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
        <header className="grid gap-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950 via-[#10213b] to-[#0e2a34] p-6 shadow-2xl shadow-black/30 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
          <div>
            <p className="mb-3 w-fit rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
              Open-source contribution radar
            </p>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
              Pick one serious repo. Build a one-year contribution record.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
              This dashboard shortlists active company-adjacent repositories and
              watches newly opened GitHub issues. The hard truth: no credible
              company hires purely because your GitHub graph is green. They hire
              when your contributions prove subsystem ownership, review quality,
              and persistence.
            </p>
          </div>
          <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5 text-amber-50">
            <h2 className="text-lg font-semibold">Recommendation</h2>
            <p className="mt-3 text-sm leading-6 text-amber-100/90">
              Given Python, Django, and some React, your best first targets are{" "}
              <a
                className="font-semibold underline decoration-amber-200/60 underline-offset-4"
                href="https://github.com/zulip/zulip"
                target="_blank"
              >
                zulip/zulip
              </a>{" "}
              for contributor onboarding,{" "}
              <a
                className="font-semibold underline decoration-amber-200/60 underline-offset-4"
                href="https://github.com/getsentry/sentry"
                target="_blank"
              >
                getsentry/sentry
              </a>{" "}
              for high hiring signal, or{" "}
              <a
                className="font-semibold underline decoration-amber-200/60 underline-offset-4"
                href="https://github.com/ansible/django-ansible-base"
                target="_blank"
              >
                ansible/django-ansible-base
              </a>{" "}
              if you specifically want Red Hat relevance. Kubernetes/Cilium are
              famous, but they are the wrong default for your current stack.
            </p>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Live issue watcher
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Near-real-time polling while this page is open.
                </p>
              </div>
              <button
                className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                onClick={() => fetchIssues()}
              >
                {loading ? "Checking..." : "Check now"}
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              <label className="text-sm font-medium text-slate-300">
                Poll interval
                <select
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                  value={pollMs}
                  onChange={(event) => setPollMs(Number(event.target.value))}
                >
                  {pollOptions.map((value) => (
                    <option key={value} value={value}>
                      Every {value / 1000}s
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-slate-300">
                Optional GitHub token
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-300"
                  type="password"
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  placeholder="Higher rate limit; stored only in this browser"
                />
              </label>

              <button
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/60 hover:text-cyan-100"
                onClick={enableNotifications}
              >
                {notifications
                  ? "Browser notifications enabled"
                  : "Enable new issue notifications"}
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">
              <p>
                Last checked:{" "}
                <span className="text-white">
                  {lastChecked ? lastChecked.toLocaleTimeString() : "not yet"}
                </span>
              </p>
              <p className="mt-2">
                Watching:{" "}
                <span className="text-white">
                  {watched.length ? watched.join(", ") : "none"}
                </span>
              </p>
              {(error || rateLimitWarning) && (
                <p className="mt-3 rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-rose-100">
                  {error || rateLimitWarning}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-xl font-semibold text-white">
              Newly opened issues
            </h2>
            <div className="mt-4 max-h-[580px] space-y-3 overflow-auto pr-1">
              {allIssues.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-slate-400">
                  No issues loaded yet. Select repos and hit check now.
                </div>
              )}
              {allIssues.map((issue) => (
                <article
                  key={issue.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 transition hover:border-cyan-300/40"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="rounded-full bg-cyan-300/10 px-2 py-1 font-semibold text-cyan-100">
                      {issue.repo}
                    </span>
                    <span>#{issue.number}</span>
                    <span>{formatAge(issue.created_at)}</span>
                    <span>{issue.comments} comments</span>
                  </div>
                  <a
                    className="mt-3 block text-base font-semibold leading-6 text-white hover:text-cyan-200"
                    href={issue.html_url}
                    target="_blank"
                  >
                    {issue.title}
                  </a>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {issue.labels.slice(0, 5).map((label) => (
                      <span
                        className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-slate-300"
                        key={label.name}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {repos.map((repo) => {
            const active = watched.includes(repo.fullName);
            return (
              <article
                key={repo.fullName}
                className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <a
                      className="text-lg font-semibold text-white hover:text-cyan-200"
                      href={`https://github.com/${repo.fullName}`}
                      target="_blank"
                    >
                      {repo.fullName}
                    </a>
                    <p className="mt-1 text-sm text-slate-400">
                      {repo.company}
                    </p>
                  </div>
                  <span className={`signal ${signalClass(repo.signal)}`}>
                    {repo.signal}
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-slate-500">Domain</dt>
                    <dd className="text-slate-200">{repo.domain}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Ramp</dt>
                    <dd className="text-slate-200">{repo.difficulty}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-slate-500">Stack</dt>
                    <dd className="text-slate-200">{repo.language}</dd>
                  </div>
                </dl>

                <p className="mt-4 text-sm leading-6 text-slate-300">
                  {repo.fit}
                </p>
                <p className="mt-3 rounded-2xl border border-rose-300/15 bg-rose-300/10 p-3 text-sm leading-6 text-rose-100/90">
                  {repo.caution}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {repo.labels.map((label) => (
                    <span
                      className="rounded-full bg-slate-900 px-2 py-1 text-[11px] text-slate-300"
                      key={label}
                    >
                      {label}
                    </span>
                  ))}
                </div>

                <button
                  className={`mt-auto rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                      : "border border-white/10 text-slate-200 hover:border-cyan-300/60"
                  }`}
                  onClick={() => toggleRepo(repo.fullName)}
                >
                  {active ? "Watching" : "Watch issues"}
                </button>
              </article>
            );
          })}
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 lg:col-span-2">
            <h2 className="text-xl font-semibold text-white">
              One-year contribution strategy
            </h2>
            <ol className="mt-4 grid gap-3 text-sm leading-6 text-slate-300 md:grid-cols-3">
              <li className="rounded-2xl bg-slate-950/70 p-4">
                <span className="text-cyan-200">Month 1:</span> reproduce bugs,
                improve docs only where you verified behavior, and learn review
                norms.
              </li>
              <li className="rounded-2xl bg-slate-950/70 p-4">
                <span className="text-cyan-200">Months 2-4:</span> land small
                fixes with tests in one subsystem. Stop repo-hopping.
              </li>
              <li className="rounded-2xl bg-slate-950/70 p-4">
                <span className="text-cyan-200">Months 5-12:</span> become the
                person maintainers trust for a narrow area, then document the
                impact publicly.
              </li>
            </ol>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-xl font-semibold text-white">Evidence used</h2>
            <div className="mt-4 grid gap-2 text-sm">
              {sourceLinks.map((link) => (
                <a
                  className="rounded-2xl border border-white/10 px-3 py-2 text-slate-300 hover:border-cyan-300/50 hover:text-cyan-100"
                  href={link.href}
                  key={link.href}
                  target="_blank"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
