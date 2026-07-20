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

type GithubRepoResult = {
  id: number;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string;
  topics?: string[];
};

const repos: Repo[] = [
  {
    fullName: "makeplane/plane",
    company: "Plane",
    domain: "project management / collaboration",
    language: "Python, FastAPI, TypeScript, React",
    signal: "Excellent",
    difficulty: "Medium",
    fit: "A modern full-stack product with public APIs, background jobs, permissions, integrations, and a large self-hosted community.",
    caution:
      "The codebase moves quickly. Confirm the issue is still reproducible and discuss larger fixes before investing heavily.",
    labels: ["bug", "api", "backend", "frontend"],
  },
  {
    fullName: "SigNoz/signoz",
    company: "SigNoz",
    domain: "observability / OpenTelemetry",
    language: "Go, TypeScript, React, Python",
    signal: "Excellent",
    difficulty: "High",
    fit: "Strong infrastructure target for traces, metrics, logs, dashboards, query systems, and emerging LLM observability work.",
    caution:
      "This is distributed-systems work. A cosmetic dashboard change is weaker than a measured correctness, query, or telemetry fix.",
    labels: ["bug", "opentelemetry", "observability", "ai"],
  },
  {
    fullName: "ComposioHQ/composio",
    company: "Composio",
    domain: "agent integrations / tool infrastructure",
    language: "Python, TypeScript",
    signal: "Excellent",
    difficulty: "Medium",
    fit: "A current AI infrastructure repo with useful SDK, authentication, schema conversion, routing, and integration surfaces.",
    caution:
      "Avoid shallow connector count. Authentication correctness, SDK reliability, schemas, and tool routing provide stronger evidence.",
    labels: ["bug", "sdk", "authentication", "agent"],
  },
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
    fullName: "huggingface/transformers",
    company: "Hugging Face",
    domain: "LLM / multimodal model library",
    language: "Python, PyTorch",
    signal: "Excellent",
    difficulty: "High",
    fit: "Probably the best PyTorch-adjacent repo if you want AI/ML hiring signal without touching PyTorch core internals immediately.",
    caution:
      "Do not start by adding random new models. Fix reproducible PyTorch integration bugs, tokenizer/processor edge cases, docs, or tests first.",
    labels: ["bug", "PyTorch", "Good First Issue"],
  },
  {
    fullName: "huggingface/accelerate",
    company: "Hugging Face",
    domain: "distributed training / PyTorch runtime",
    language: "Python, PyTorch",
    signal: "Strong",
    difficulty: "High",
    fit: "More focused than Transformers and closer to training systems: device placement, mixed precision, distributed execution, checkpointing.",
    caution:
      "Distributed bugs are environment-sensitive. If you cannot produce a minimal repro, maintainers cannot use your report or PR.",
    labels: ["bug", "good first issue", "pytorch"],
  },
  {
    fullName: "vllm-project/vllm",
    company: "vLLM ecosystem / many AI infra employers",
    domain: "LLM inference serving",
    language: "Python, PyTorch, CUDA, C++",
    signal: "Excellent",
    difficulty: "Very high",
    fit: "Very high hiring signal for modern AI infrastructure. If you know PyTorch and want production LLM serving, this is serious.",
    caution:
      "This is not beginner ML code. You need inference internals, GPU memory behavior, batching, kernels, and reproducible performance tests.",
    labels: ["bug", "good first issue", "performance"],
  },
  {
    fullName: "ray-project/ray",
    company: "Anyscale / AI infrastructure ecosystem",
    domain: "distributed compute / ML workloads",
    language: "Python, C++, Java, React",
    signal: "Excellent",
    difficulty: "High",
    fit: "Strong Python ML-infra signal. Good if you want distributed systems plus ML workloads instead of pure model work.",
    caution:
      "Ray has many moving parts. Pick one library area; do not bounce between Core, Train, Serve, Data, and dashboard issues.",
    labels: ["bug", "good first issue", "ray-train"],
  },
  {
    fullName: "pytorch/pytorch",
    company: "Meta / PyTorch Foundation ecosystem",
    domain: "deep learning framework core",
    language: "Python, C++, CUDA",
    signal: "Excellent",
    difficulty: "Very high",
    fit: "Highest raw PyTorch prestige. Good only if you want to work near framework internals, dispatch, autograd, compiler, or GPU backend work.",
    caution:
      "Do not make this your first year-long target unless you are ready for C++/CUDA and deep internals. Most PyTorch users are not PyTorch contributors.",
    labels: ["module:*", "good first issue", "triaged"],
  },
  {
    fullName: "Lightning-AI/pytorch-lightning",
    company: "Lightning AI",
    domain: "PyTorch training framework",
    language: "Python, PyTorch",
    signal: "Strong",
    difficulty: "Medium",
    fit: "Better PyTorch entry point than core PyTorch if you want training loops, callbacks, logging, distributed training, and user-facing APIs.",
    caution:
      "API compatibility is the trap. A small convenience change can break many users; tests and deprecation handling matter.",
    labels: ["bug", "good first issue", "help wanted"],
  },
  {
    fullName: "bentoml/BentoML",
    company: "BentoML",
    domain: "model serving / ML application deployment",
    language: "Python, TypeScript",
    signal: "Strong",
    difficulty: "Medium",
    fit: "Good practical ML engineering repo: packaging, serving APIs, deployment, observability, and Python-first production workflows.",
    caution:
      "Serving-library bugs need real deployment context. Avoid abstract suggestions; reproduce with a minimal service.",
    labels: ["bug", "good first issue", "help wanted"],
  },
  {
    fullName: "kserve/kserve",
    company: "CNCF / Kubeflow / Red Hat OpenShift AI ecosystem",
    domain: "model serving on Kubernetes",
    language: "Go, Python",
    signal: "Excellent",
    difficulty: "High",
    fit: "Best Red Hat-adjacent ML serving repo. Red Hat publicly discusses KServe as part of its OpenShift AI/Open Data Hub work.",
    caution:
      "This is MLOps/platform engineering, not notebook ML. You need Kubernetes, CRDs, serving runtimes, and controller behavior.",
    labels: ["kind/bug", "good first issue", "area/*"],
  },
  {
    fullName: "kubeflow/pipelines",
    company: "Kubeflow / Google / Red Hat OpenShift AI ecosystem",
    domain: "ML pipelines / workflow orchestration",
    language: "Python, Go, TypeScript",
    signal: "Excellent",
    difficulty: "High",
    fit: "Strong ML platform repo and explicitly part of Red Hat OpenShift AI's upstream ecosystem through Kubeflow/Open Data Hub.",
    caution:
      "Large platform surface. Start with SDK/compiler/test/documentation bugs before backend orchestration changes.",
    labels: ["good first issue", "kind/bug", "area/*"],
  },
  {
    fullName: "kubeflow/katib",
    company: "Kubeflow / Red Hat OpenShift AI ecosystem",
    domain: "AutoML / hyperparameter tuning",
    language: "Python, Go",
    signal: "Strong",
    difficulty: "High",
    fit: "Useful if you want ML platform work with optimization/search workflows rather than model architecture work.",
    caution:
      "Not a PyTorch-only repo. You need Kubernetes concepts and experiment lifecycle knowledge.",
    labels: ["good first issue", "kind/bug", "area/*"],
  },
  {
    fullName: "kubeflow/trainer",
    company: "Kubeflow / Red Hat OpenShift AI ecosystem",
    domain: "distributed training / LLM fine-tuning on Kubernetes",
    language: "Go, Python, PyTorch",
    signal: "Strong",
    difficulty: "High",
    fit: "Good bridge between your PyTorch knowledge and Red Hat-style platform engineering: training jobs, distributed workloads, fine-tuning.",
    caution:
      "The core is mostly Go. If you refuse Go/Kubernetes, do not pick it as your primary repo.",
    labels: ["good first issue", "kind/bug", "pytorch"],
  },
  {
    fullName: "opendatahub-io/odh-dashboard",
    company: "Red Hat OpenShift AI / Open Data Hub",
    domain: "AI platform dashboard",
    language: "TypeScript, React",
    signal: "Excellent",
    difficulty: "Medium",
    fit: "Best Red Hat-supported AI repo for your React side. It is closer to OpenShift AI product UX than generic ML libraries.",
    caution:
      "This is product/platform UI, not PyTorch. It is still highly relevant if you want Red Hat AI contribution signal.",
    labels: ["bug", "good first issue", "frontend"],
  },
  {
    fullName: "opendatahub-io/model-registry",
    company: "Red Hat OpenShift AI / Open Data Hub",
    domain: "ML model registry / metadata",
    language: "Go, Python, TypeScript",
    signal: "Excellent",
    difficulty: "High",
    fit: "Highly relevant to enterprise MLOps: model versions, artifacts, registry workflows, and OpenShift AI upstream work.",
    caution:
      "Registry work is correctness-heavy. You need to understand metadata semantics and API compatibility before changing behavior.",
    labels: ["bug", "good first issue", "area/*"],
  },
  {
    fullName: "opendatahub-io/notebooks",
    company: "Red Hat OpenShift AI / Open Data Hub",
    domain: "Jupyter workbenches / data science environments",
    language: "Python, Go, TypeScript",
    signal: "Strong",
    difficulty: "Medium",
    fit: "Good if you want user-facing data science platform work: notebook images, workbenches, and OpenShift AI integration.",
    caution:
      "Avoid only tweaking examples. Strong PRs improve reliability, packaging, security, or user workflow issues.",
    labels: ["bug", "good first issue", "kind/*"],
  },
  {
    fullName: "opendatahub-io/trustyai-service-operator",
    company: "Red Hat OpenShift AI / Open Data Hub",
    domain: "responsible AI / model monitoring",
    language: "Go, Python",
    signal: "Strong",
    difficulty: "High",
    fit: "Good Red Hat AI governance target: monitoring, explainability, fairness/drift service integration, operator work.",
    caution:
      "This is not model training. You need platform/operator skills and careful interpretation of ML monitoring concepts.",
    labels: ["bug", "good first issue", "operator"],
  },
  {
    fullName: "opendatahub-io/maas-billing",
    company: "Red Hat OpenShift AI / Open Data Hub",
    domain: "models-as-a-service / policy / billing",
    language: "Go, React",
    signal: "Selective",
    difficulty: "High",
    fit: "Interesting if you want emerging AI platform product work around hosted model access, policy, and usage tracking.",
    caution:
      "Work-in-progress repos can change direction quickly. Treat this as a secondary watch target, not your main year-long bet.",
    labels: ["bug", "enhancement", "frontend"],
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
    fullName: "openshift/console",
    company: "Red Hat OpenShift",
    domain: "Kubernetes platform console",
    language: "TypeScript, React",
    signal: "Excellent",
    difficulty: "High",
    fit: "Strong Red Hat React target. If you want Red Hat but not pure backend, this is more aligned than Podman or KubeVirt.",
    caution:
      "Issue volume is low in the public tracker. You may need to follow contribution docs and discussions, not just wait for easy issues.",
    labels: ["bug", "frontend", "lifecycle/*"],
  },
  {
    fullName: "cockpit-project/cockpit",
    company: "Red Hat ecosystem",
    domain: "Linux server management UI",
    language: "Python, JavaScript, C",
    signal: "Strong",
    difficulty: "Medium",
    fit: "Good Red Hat-adjacent fit for Python plus UI, especially if you care about Linux systems administration.",
    caution:
      "You need Linux/systemd/storage/networking context. UI-only contributions without systems understanding will be thin.",
    labels: ["bug", "good first issue", "starter"],
  },
  {
    fullName: "konveyor/tackle2-hub",
    company: "Red Hat / Konveyor",
    domain: "application modernization / migration",
    language: "Go, TypeScript",
    signal: "Strong",
    difficulty: "High",
    fit: "Legit Red Hat ecosystem repo for enterprise migration tooling. Good if you want platform/product backend work.",
    caution:
      "Not Python/Django. Useful for Red Hat signal, but you will need Go and Kubernetes-adjacent context.",
    labels: ["bug", "good first issue", "kind/*"],
  },
  {
    fullName: "containers/podman",
    company: "Red Hat containers ecosystem",
    domain: "containers / OCI runtime tooling",
    language: "Go",
    signal: "Excellent",
    difficulty: "Very high",
    fit: "High Red Hat signal and widely used. Pick only if you want serious Linux/container internals.",
    caution:
      "Wrong default for your Python/Django/PyTorch profile. Great repo, but expensive skill pivot.",
    labels: ["kind/bug", "good first issue", "help wanted"],
  },
  {
    fullName: "containers/skopeo",
    company: "Red Hat containers ecosystem",
    domain: "container image registry tooling",
    language: "Go",
    signal: "Strong",
    difficulty: "High",
    fit: "Smaller Red Hat container ecosystem target than Podman. Good for registry/image transport credibility.",
    caution:
      "Still a Go/Linux/container repo. Do not pick it if your goal is ML/Python career signaling.",
    labels: ["kind/bug", "good first issue", "help wanted"],
  },
  {
    fullName: "kubevirt/kubevirt",
    company: "Red Hat virtualization ecosystem",
    domain: "virtual machines on Kubernetes",
    language: "Go",
    signal: "Excellent",
    difficulty: "Very high",
    fit: "Very strong Red Hat/OpenShift signal for virtualization and Kubernetes platform roles.",
    caution:
      "Poor fit for your current stack unless you intentionally want to pivot into Kubernetes virtualization.",
    labels: ["kind/bug", "good first issue", "area/*"],
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

const ycRepos: Repo[] = [
  {
    fullName: "browser-use/browser-use",
    company: "Browser Use — YC W25",
    domain: "browser automation / AI agents",
    language: "Python, Playwright, LLMs",
    signal: "Excellent",
    difficulty: "Medium",
    fit: "One of the strongest recent YC open-source targets. Python-heavy, agentic browser automation, very visible, and close to hiring demand.",
    caution:
      "It is crowded. You need useful bug reproductions, connector fixes, or reliability work; low-effort agent demos will not stand out.",
    labels: ["bug", "good first issue", "help wanted"],
  },
  {
    fullName: "unslothai/unsloth",
    company: "Unsloth AI — YC S24",
    domain: "LLM fine-tuning / training efficiency",
    language: "Python, PyTorch, Triton",
    signal: "Excellent",
    difficulty: "High",
    fit: "Very aligned with PyTorch. High hiring signal for applied ML infra if you can handle training performance and model compatibility issues.",
    caution:
      "Do not start here unless you can reproduce GPU/training bugs. Performance claims require benchmarks, not vibes.",
    labels: ["bug", "help wanted", "model"],
  },
  {
    fullName: "mem0ai/mem0",
    company: "Mem0 — YC S24",
    domain: "AI memory / agent infrastructure",
    language: "Python, TypeScript",
    signal: "Excellent",
    difficulty: "Medium",
    fit: "Good Python + AI infra target with enough surface area for integrations, memory retrieval, tests, and SDK work.",
    caution:
      "AI memory is hype-heavy. Contributions need measurable behavior: failing test, retrieval quality issue, latency issue, or integration breakage.",
    labels: ["bug", "good first issue", "integration"],
  },
  {
    fullName: "onyx-dot-app/onyx",
    company: "Onyx — YC W24",
    domain: "enterprise RAG / search",
    language: "Python, React, TypeScript",
    signal: "Excellent",
    difficulty: "Medium",
    fit: "Strong fit for your Python/React/ML stack. Enterprise search, connectors, auth, retrieval, and UI all matter.",
    caution:
      "Connector work is useful, but shallow. Stronger signal comes from reliability, permissions, sync correctness, ranking, and evals.",
    labels: ["bug", "good first issue", "connector"],
  },
  {
    fullName: "manaflow-ai/cmux",
    company: "Manaflow — YC S24",
    domain: "AI coding workspace / agent orchestration",
    language: "TypeScript, React",
    signal: "Strong",
    difficulty: "Medium",
    fit: "Good YC target if you want developer-tooling and React-heavy work around coding agents.",
    caution:
      "Less aligned with PyTorch. Pick it only if you want product/devtool UI and agent workflow engineering.",
    labels: ["bug", "good first issue", "frontend"],
  },
  {
    fullName: "confident-ai/deepeval",
    company: "Confident AI — YC W25",
    domain: "LLM evaluation / testing",
    language: "Python",
    signal: "Excellent",
    difficulty: "Medium",
    fit: "Very practical AI engineering repo. Python-first, testing/evals oriented, and easier to contribute to than core model infra.",
    caution:
      "Eval libraries attract fuzzy metrics. Good PRs need clear semantics, stable tests, and examples that do not overclaim.",
    labels: ["bug", "good first issue", "docs"],
  },
  {
    fullName: "vibrantlabsai/ragas",
    company: "Vibrant Labs — YC W24",
    domain: "RAG evaluation",
    language: "Python",
    signal: "Strong",
    difficulty: "Medium",
    fit: "Good ML-adjacent Python target if you want RAG quality, evaluation, datasets, and test-driven contributions.",
    caution:
      "RAG evals can become hand-wavy. Focus on reproducibility, metric bugs, integrations, and benchmark examples.",
    labels: ["bug", "good first issue", "evaluation"],
  },
  {
    fullName: "rowboatlabs/rowboat",
    company: "Rowboat Labs — YC S24",
    domain: "AI agents / workflow automation",
    language: "TypeScript, Python",
    signal: "Strong",
    difficulty: "Medium",
    fit: "Recent YC open-source agent product with enough scope for backend, frontend, and integration contributions.",
    caution:
      "Agent repos often change quickly. Keep PRs small; avoid building speculative features they did not ask for.",
    labels: ["bug", "good first issue", "agent"],
  },
  {
    fullName: "tracecathq/tracecat",
    company: "Tracecat — YC W24",
    domain: "security automation / SOAR",
    language: "Python, TypeScript",
    signal: "Strong",
    difficulty: "Medium",
    fit: "Good Python/React repo with a clear buyer and security workflow angle. Hiring signal is stronger than generic AI wrappers.",
    caution:
      "Security automation requires precision. Do not contribute toy workflows; fix real reliability, connector, permission, or incident-flow issues.",
    labels: ["bug", "good first issue", "integration"],
  },
  {
    fullName: "hatchet-dev/hatchet",
    company: "Hatchet — YC W24",
    domain: "durable task queues / workflow engine",
    language: "Go, TypeScript, Python SDK",
    signal: "Strong",
    difficulty: "High",
    fit: "Worth watching because backend workflow infra is serious hiring signal and has Python SDK surface area.",
    caution:
      "Core is not Django/PyTorch. Pick SDK/docs/integration issues first unless you are willing to learn Go internals.",
    labels: ["bug", "good first issue", "sdk"],
  },
  {
    fullName: "pretzelai/pretzelai",
    company: "Pretzel AI — YC W24",
    domain: "AI notebooks / data analysis",
    language: "Python, TypeScript",
    signal: "Strong",
    difficulty: "Medium",
    fit: "Good fit if you want Python data tooling plus user-facing AI product work.",
    caution:
      "Notebook products can be messy. Strong PRs improve reproducibility, kernel/session reliability, packaging, or model-provider handling.",
    labels: ["bug", "good first issue", "notebook"],
  },
  {
    fullName: "openfoundry-ai/model_manager",
    company: "OpenFoundry — YC W24",
    domain: "open-source AI deployment tooling",
    language: "Python",
    signal: "Selective",
    difficulty: "Medium",
    fit: "Very aligned with open-source AI deployment, and small enough that meaningful contributions can be visible to founders.",
    caution:
      "Small repo means higher founder visibility but also less issue volume. You may need to propose well-scoped fixes, not just wait.",
    labels: ["bug", "good first issue", "deployment"],
  },
  {
    fullName: "better-auth/better-auth",
    company: "Better Auth — YC S25",
    domain: "authentication framework",
    language: "TypeScript",
    signal: "Strong",
    difficulty: "Medium",
    fit: "Good recent YC open-source target if you want web platform credibility and security-adjacent engineering.",
    caution:
      "Auth is sharp-edged. Avoid behavior changes without tests and compatibility notes.",
    labels: ["bug", "good first issue", "docs"],
  },
  {
    fullName: "mastra-ai/mastra",
    company: "Mastra — YC W25",
    domain: "TypeScript AI agent framework",
    language: "TypeScript",
    signal: "Strong",
    difficulty: "Medium",
    fit: "Good for agent framework and TypeScript contributions. Useful if you want YC startup visibility more than PyTorch depth.",
    caution:
      "Not Python/PyTorch. Keep this secondary unless you want to shift toward TypeScript AI app infrastructure.",
    labels: ["bug", "good first issue", "agent"],
  },
  {
    fullName: "trycua/cua",
    company: "Cua — YC S25",
    domain: "computer-use agents / virtual computers",
    language: "Python, TypeScript",
    signal: "Strong",
    difficulty: "High",
    fit: "Interesting if you want browser/computer-use agents and Python automation. Potentially high upside because the category is hot.",
    caution:
      "Fast-moving early repo. Treat as watchlist, not primary, until you see maintainer responsiveness and issue quality.",
    labels: ["bug", "good first issue", "agent"],
  },
  {
    fullName: "mcp-use/mcp-use",
    company: "Manufact — YC S25",
    domain: "MCP / agent tool use",
    language: "Python",
    signal: "Strong",
    difficulty: "Medium",
    fit: "Python-heavy and relevant to agent/tooling work. Good if you want current AI infrastructure without deep GPU work.",
    caution:
      "MCP repos are multiplying. Only invest if maintainers respond and the repo has real downstream users.",
    labels: ["bug", "good first issue", "mcp"],
  },
  {
    fullName: "cactus-compute/cactus",
    company: "Cactus — YC S25",
    domain: "AI compute / local inference",
    language: "C++, Python, mobile",
    signal: "Selective",
    difficulty: "High",
    fit: "Potentially useful if you want edge/local inference and are willing to touch lower-level code.",
    caution:
      "Skill mismatch risk. If the active issues are C++/mobile-heavy, this is not your best near-term bet.",
    labels: ["bug", "good first issue", "inference"],
  },
  {
    fullName: "onecli/onecli",
    company: "OneCLI — YC S26",
    domain: "developer CLI",
    language: "TypeScript",
    signal: "Selective",
    difficulty: "Low",
    fit: "Earliest-stage YC 2026 watch target. Low competition can mean high visibility if the founders actively review external PRs.",
    caution:
      "Very early means unstable direction and uncertain hiring signal. Watch first; contribute only if issue quality is real.",
    labels: ["bug", "good first issue", "cli"],
  },
];

type CatalogRepo = Repo & { tags: string[] };

const tagOrder = [
  "Python",
  "TypeScript",
  "JavaScript",
  "React",
  "Django",
  "PyTorch",
  "Go",
  "Rust",
  "C++",
  "Java",
  "Kubernetes",
  "AI / ML",
  "YC",
  "Red Hat",
];

function catalogTags(repo: Repo, isYc: boolean) {
  const haystack = [
    repo.language,
    repo.domain,
    repo.company,
    repo.fit,
    ...repo.labels,
  ]
    .join(" ")
    .toLowerCase();
  const tags = new Set<string>();
  const includes = (value: string) => haystack.includes(value);

  if (includes("python")) tags.add("Python");
  if (includes("typescript")) tags.add("TypeScript");
  if (includes("javascript")) tags.add("JavaScript");
  if (includes("react")) tags.add("React");
  if (includes("django")) tags.add("Django");
  if (includes("pytorch")) tags.add("PyTorch");
  if (/(^|\W)go(\W|$)/i.test(repo.language)) tags.add("Go");
  if (includes("rust")) tags.add("Rust");
  if (includes("c++") || includes("cuda")) tags.add("C++");
  if (/(^|\W)java(\W|$)/i.test(repo.language)) tags.add("Java");
  if (includes("kubernetes") || includes("kubeflow")) tags.add("Kubernetes");
  if (/\b(ai|ml|llm|machine learning|models?|agents?)\b/i.test(haystack))
    tags.add("AI / ML");
  if (isYc) tags.add("YC");
  if (includes("red hat") || includes("openshift") || includes("ansible"))
    tags.add("Red Hat");

  return tagOrder.filter((tag) => tags.has(tag));
}

const catalogRepos: CatalogRepo[] = [
  ...repos.map((repo) => ({ ...repo, tags: catalogTags(repo, false) })),
  ...ycRepos.map((repo) => ({ ...repo, tags: catalogTags(repo, true) })),
];

const sourceLinks = [
  {
    label: "Plane repository",
    href: "https://github.com/makeplane/plane",
  },
  {
    label: "SigNoz repository",
    href: "https://github.com/SigNoz/signoz",
  },
  {
    label: "Composio repository",
    href: "https://github.com/ComposioHQ/composio",
  },
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
    label: "Red Hat OpenShift AI upstream overview",
    href: "https://developers.redhat.com/products/red-hat-openshift-ai",
  },
  {
    label: "Red Hat Kubeflow community work",
    href: "https://www.redhat.com/en/blog/open-source-ai-red-hat-our-journey-kubeflow-community",
  },
  {
    label: "KServe repository",
    href: "https://github.com/kserve/kserve",
  },
  {
    label: "Kubeflow organization",
    href: "https://github.com/kubeflow",
  },
  {
    label: "Kubeflow Pipelines repository",
    href: "https://github.com/kubeflow/pipelines",
  },
  {
    label: "Kubeflow Trainer repository",
    href: "https://github.com/kubeflow/trainer",
  },
  {
    label: "Open Data Hub organization",
    href: "https://github.com/opendatahub-io",
  },
  {
    label: "ODH Dashboard repository",
    href: "https://github.com/opendatahub-io/odh-dashboard",
  },
  {
    label: "ODH Model Registry repository",
    href: "https://github.com/opendatahub-io/model-registry",
  },
  {
    label: "Hugging Face Transformers repository",
    href: "https://github.com/huggingface/transformers",
  },
  {
    label: "Hugging Face Accelerate repository",
    href: "https://github.com/huggingface/accelerate",
  },
  {
    label: "vLLM repository",
    href: "https://github.com/vllm-project/vllm",
  },
  {
    label: "Ray repository",
    href: "https://github.com/ray-project/ray",
  },
  {
    label: "PyTorch repository",
    href: "https://github.com/pytorch/pytorch",
  },
  {
    label: "Lightning repository",
    href: "https://github.com/Lightning-AI/pytorch-lightning",
  },
  {
    label: "BentoML repository",
    href: "https://github.com/bentoml/BentoML",
  },
  {
    label: "OpenShift Console repository",
    href: "https://github.com/openshift/console",
  },
  {
    label: "Cockpit repository",
    href: "https://github.com/cockpit-project/cockpit",
  },
  {
    label: "Konveyor organization",
    href: "https://github.com/konveyor",
  },
  {
    label: "Podman repository",
    href: "https://github.com/containers/podman",
  },
  {
    label: "Skopeo repository",
    href: "https://github.com/containers/skopeo",
  },
  {
    label: "KubeVirt repository",
    href: "https://github.com/kubevirt/kubevirt",
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

const defaultWatched: string[] = [];
const pollOptions = [30_000, 60_000, 120_000, 300_000];
const reposPerPage = 12;

function readStoredToken() {
  return window.localStorage.getItem("github-token") ?? "";
}

function readStoredWatched() {
  const savedWatched = window.localStorage.getItem("watched-repos");
  if (!savedWatched) return defaultWatched;
  try {
    const parsed = JSON.parse(savedWatched);
    return Array.isArray(parsed) && parsed.every((item) => typeof item === "string")
      ? parsed
      : defaultWatched;
  } catch {
    return defaultWatched;
  }
}

function readStoredPollMs() {
  const savedPoll = Number(window.localStorage.getItem("poll-ms"));
  return pollOptions.includes(savedPoll) ? savedPoll : 60_000;
}

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
  const [storageReady, setStorageReady] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showWatchedOnly, setShowWatchedOnly] = useState(false);
  const [activeView, setActiveView] = useState<"explore" | "guide" | "token">("explore");
  const [searchScope, setSearchScope] = useState<"curated" | "github">("curated");
  const [currentPage, setCurrentPage] = useState(1);
  const [githubResults, setGithubResults] = useState<GithubRepoResult[]>([]);
  const [githubTotal, setGithubTotal] = useState(0);
  const [githubPage, setGithubPage] = useState(1);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState("");
  const knownIssueIds = useRef<Set<number>>(new Set());
  const initialLoadComplete = useRef(false);

  useEffect(() => {
    // Hydrate device-local preferences after the client mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWatched(readStoredWatched());
    setPollMs(readStoredPollMs());
    setToken(readStoredToken());
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem("watched-repos", JSON.stringify(watched));
    window.localStorage.setItem("poll-ms", String(pollMs));
  }, [watched, pollMs, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    if (token) window.localStorage.setItem("github-token", token);
    else window.localStorage.removeItem("github-token");
  }, [token, storageReady]);

  async function fetchIssues(silent = false) {
    if (!watched.length) {
      setIssues({});
      return;
    }
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
    if (!storageReady) return;
    // The watcher intentionally performs its first refresh when preferences are ready.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchIssues();
    const id = window.setInterval(() => fetchIssues(true), pollMs);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watched.join(","), pollMs, token, storageReady]);

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

  const tagCounts = useMemo(
    () =>
      Object.fromEntries(
        tagOrder.map((tag) => [
          tag,
          catalogRepos.filter((repo) => repo.tags.includes(tag)).length,
        ]),
      ),
    [],
  );

  const filteredRepos = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return catalogRepos.filter((repo) => {
      if (showWatchedOnly && !watched.includes(repo.fullName)) return false;
      if (!selectedTags.every((tag) => repo.tags.includes(tag))) return false;
      if (!normalizedQuery) return true;
      return [
        repo.fullName,
        repo.company,
        repo.domain,
        repo.language,
        repo.fit,
        ...repo.tags,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [query, selectedTags, showWatchedOnly, watched]);

  const pageCount = Math.max(1, Math.ceil(filteredRepos.length / reposPerPage));
  const visiblePage = Math.min(currentPage, pageCount);
  const paginatedRepos = filteredRepos.slice(
    (visiblePage - 1) * reposPerPage,
    visiblePage * reposPerPage,
  );

  const githubPageCount = Math.max(
    1,
    Math.ceil(Math.min(githubTotal, 1000) / reposPerPage),
  );

  async function searchGithub(page = 1) {
    const searchTerm = query.trim();
    if (!searchTerm) {
      setGithubError("Enter a repository, technology, or topic to search GitHub.");
      return;
    }

    setGithubLoading(true);
    setGithubError("");
    try {
      const headers: HeadersInit = {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      };
      if (token.trim()) headers.Authorization = `Bearer ${token.trim()}`;
      const params = new URLSearchParams({
        q: `${searchTerm} archived:false`,
        sort: "stars",
        order: "desc",
        per_page: String(reposPerPage),
        page: String(page),
      });
      const response = await fetch(`https://api.github.com/search/repositories?${params}`, {
        headers,
      });
      if (!response.ok) {
        throw new Error(`GitHub returned ${response.status} ${response.statusText}`);
      }
      const data = (await response.json()) as {
        total_count: number;
        items: GithubRepoResult[];
      };
      setGithubResults(data.items);
      setGithubTotal(data.total_count);
      setGithubPage(page);
    } catch (err) {
      setGithubError(err instanceof Error ? err.message : "GitHub search failed");
    } finally {
      setGithubLoading(false);
    }
  }

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

  function toggleTag(tag: string) {
    setCurrentPage(1);
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    );
  }

  const rateLimitWarning =
    !token.trim() && watched.length > 2
      ? "You are watching more than two repos without a token. GitHub's anonymous rate limit will bite you."
      : "";

  return (
    <main className="relative min-h-screen overflow-hidden text-slate-100">
      <div aria-hidden="true" className="space-scene">
        <div className="space-nebula" />
        <div className="star-layer star-layer-far" />
        <div className="star-layer star-layer-mid" />
        <div className="star-layer star-layer-near" />
        <div className="space-planet">
          <div className="space-planet-glow" />
          <div className="space-planet-body" />
          <div className="space-planet-ring" />
        </div>
        <div className="shooting-star shooting-star-one" />
        <div className="shooting-star shooting-star-two" />
      </div>
      <section className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
        <header className="grid gap-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950 via-[#10213b] to-[#0e2a34] p-6 shadow-2xl shadow-black/30 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
          <div>
            <p className="mb-3 w-fit rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
              Repo Radar · discover, filter, watch
            </p>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
              Find an open-source repo that fits your stack.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
              Browse a curated catalog by language, framework, ecosystem, or
              accelerator. Combine tags like Python + YC, save the repositories
              you care about, and monitor their newest GitHub issues in one place.
            </p>
          </div>
          <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5 text-amber-50">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
              How it works
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Build a focused watchlist</h2>
            <p className="mt-3 text-sm leading-6 text-amber-100/90">
              Select one or more tags to narrow the catalog. Watching a repo adds
              it to your local list and activates live issue polling. Your choices
              stay in this browser; no account is required.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-2xl bg-slate-950/25 p-3">
                <strong className="block text-xl text-white">{catalogRepos.length}</strong>
                repos
              </div>
              <div className="rounded-2xl bg-slate-950/25 p-3">
                <strong className="block text-xl text-white">{tagOrder.length}</strong>
                tags
              </div>
              <div className="rounded-2xl bg-slate-950/25 p-3">
                <strong className="block text-xl text-white">{watched.length}</strong>
                watched
              </div>
            </div>
          </div>
        </header>

        <nav
          aria-label="Primary navigation"
          className="flex w-fit max-w-full flex-wrap rounded-2xl border border-white/10 bg-slate-950/70 p-1"
        >
          <button
            aria-current={activeView === "explore" ? "page" : undefined}
            className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
              activeView === "explore"
                ? "bg-cyan-300 text-slate-950"
                : "text-slate-300 hover:text-white"
            }`}
            onClick={() => setActiveView("explore")}
          >
            Explore repos
          </button>
          <button
            aria-current={activeView === "guide" ? "page" : undefined}
            className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
              activeView === "guide"
                ? "bg-cyan-300 text-slate-950"
                : "text-slate-300 hover:text-white"
            }`}
            onClick={() => setActiveView("guide")}
          >
            Contribution guide
          </button>
          <button
            aria-current={activeView === "token" ? "page" : undefined}
            className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
              activeView === "token"
                ? "bg-cyan-300 text-slate-950"
                : "text-slate-300 hover:text-white"
            }`}
            onClick={() => setActiveView("token")}
          >
            GitHub token setup
          </button>
        </nav>

        {activeView === "explore" && <>
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 lg:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                Repository discovery
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {searchScope === "curated"
                  ? "Filter by stack and ecosystem"
                  : "Search every public GitHub repository"}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                {searchScope === "curated"
                  ? "Multiple tags use AND logic. Python + YC shows repositories that match both."
                  : "Results come live from GitHub and can be added directly to your watchlist."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  showWatchedOnly
                    ? "bg-cyan-300 text-slate-950"
                    : "border border-white/10 text-slate-300 hover:border-cyan-300/50"
                }`}
                onClick={() => {
                  setCurrentPage(1);
                  setShowWatchedOnly((value) => !value);
                }}
              >
                Watched only · {watched.length}
              </button>
              {searchScope === "curated" && (selectedTags.length > 0 || query || showWatchedOnly) && (
                <button
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 hover:border-rose-300/50 hover:text-rose-100"
                  onClick={() => {
                    setSelectedTags([]);
                    setQuery("");
                    setShowWatchedOnly(false);
                    setCurrentPage(1);
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 flex w-fit rounded-xl border border-white/10 bg-slate-950/70 p-1">
            {(["curated", "github"] as const).map((scope) => (
              <button
                aria-pressed={searchScope === scope}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  searchScope === scope
                    ? "bg-white text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
                key={scope}
                onClick={() => {
                  setSearchScope(scope);
                  setCurrentPage(1);
                }}
              >
                {scope === "curated" ? "Curated" : "All GitHub"}
              </button>
            ))}
          </div>

          <form
            className="mt-4 flex flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              if (searchScope === "github") searchGithub(1);
            }}
          >
            <label className="block flex-1">
              <span className="sr-only">Search repositories</span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-5 py-4 text-white outline-none placeholder:text-slate-600 focus:border-cyan-300"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setCurrentPage(1);
              }}
              placeholder={
                searchScope === "curated"
                  ? "Search curated repos, companies, or technologies..."
                  : "Try: python speech recognition, topic:observability, or stars:>5000"
              }
            />
            </label>
            {searchScope === "github" && (
              <button
                className="rounded-2xl bg-cyan-300 px-6 py-4 font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-50"
                disabled={githubLoading}
                type="submit"
              >
                {githubLoading ? "Searching..." : "Search GitHub"}
              </button>
            )}
          </form>

          {searchScope === "curated" && <div className="mt-4 flex flex-wrap gap-2" aria-label="Repository tags">
            {tagOrder.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  aria-pressed={active}
                  className={`rounded-full border px-3 py-2 text-sm transition ${
                    active
                      ? "border-cyan-200 bg-cyan-300 text-slate-950"
                      : "border-white/10 bg-slate-950/50 text-slate-300 hover:border-cyan-300/50 hover:text-white"
                  }`}
                  key={tag}
                  onClick={() => toggleTag(tag)}
                >
                  {tag} <span className={active ? "text-slate-700" : "text-slate-500"}>{tagCounts[tag]}</span>
                </button>
              );
            })}
          </div>}
          {searchScope === "github" && githubError && (
            <p className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">
              {githubError}
            </p>
          )}
          {searchScope === "github" && !token.trim() && (
            <p className="mt-3 text-xs text-slate-500">
              GitHub applies a stricter anonymous limit to repository search. Add a token in the watcher settings if searches begin returning 403.
            </p>
          )}
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 lg:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-200">
                My watchlist
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Watched repositories
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Every repository you watch appears here, including repositories added through live GitHub search.
              </p>
            </div>
            <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-4 py-2 text-sm font-semibold text-violet-100">
              {watched.length} {watched.length === 1 ? "repository" : "repositories"}
            </span>
          </div>

          {watched.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-white/15 bg-slate-950/40 p-8 text-center">
              <p className="font-semibold text-slate-200">Your watchlist is empty.</p>
              <p className="mt-2 text-sm text-slate-500">
                Select Watch issues on a curated or GitHub search result to add it here.
              </p>
            </div>
          ) : (
            <ul className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {watched.map((repoName) => {
                const catalogRepo = catalogRepos.find((repo) => repo.fullName === repoName);
                const issueCount = issues[repoName]?.length;

                return (
                  <li
                    className="flex min-w-0 items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-950/70 p-4"
                    key={repoName}
                  >
                    <div className="min-w-0">
                      <a
                        className="block truncate font-semibold text-white transition hover:text-cyan-200"
                        href={`https://github.com/${repoName}`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {repoName} ↗
                      </a>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {catalogRepo
                          ? `${catalogRepo.language} · ${catalogRepo.signal} fit`
                          : "Added from GitHub search"}
                        {typeof issueCount === "number"
                          ? ` · ${issueCount} open ${issueCount === 1 ? "issue" : "issues"} loaded`
                          : ""}
                      </p>
                    </div>
                    <button
                      aria-label={`Unwatch ${repoName}`}
                      className="shrink-0 rounded-xl border border-rose-300/20 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:border-rose-300/60 hover:bg-rose-300/10"
                      onClick={() => toggleRepo(repoName)}
                    >
                      Unwatch
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

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
                  placeholder="Saved locally after first paste"
                />
                <span className="mt-2 block text-xs leading-5 text-slate-500">
                  Saved in this browser&apos;s localStorage and reused on
                  reload before the first API call. Do not use this on a shared
                  machine.
                </span>
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

        {searchScope === "curated" && <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Repository catalog
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-white">
                {filteredRepos.length} {filteredRepos.length === 1 ? "match" : "matches"}
              </h2>
            </div>
            {selectedTags.length > 0 && (
              <p className="text-sm text-slate-400">
                Matching every tag: <span className="text-cyan-200">{selectedTags.join(" + ")}</span>
              </p>
            )}
          </div>
          {filteredRepos.length === 0 && (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
              <h3 className="text-lg font-semibold text-white">No repositories match this combination.</h3>
              <p className="mt-2 text-sm text-slate-400">Remove one tag or clear the search to widen the catalog.</p>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {paginatedRepos.map((repo) => {
            const active = watched.includes(repo.fullName);
            return (
              <article
                key={repo.fullName}
                className="flex min-w-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <a
                      className="block break-words text-lg font-semibold text-white hover:text-cyan-200"
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
                  {repo.tags.map((tag) => (
                    <button
                      className="rounded-full bg-cyan-300/10 px-2 py-1 text-[11px] font-medium text-cyan-100 hover:bg-cyan-300/20"
                      key={tag}
                      onClick={() => {
                        if (!selectedTags.includes(tag)) toggleTag(tag);
                      }}
                    >
                      {tag}
                    </button>
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
          </div>
          {pageCount > 1 && (
            <nav
              aria-label="Repository pages"
              className="mt-6 flex flex-wrap items-center justify-center gap-2"
            >
              <button
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={visiblePage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                Previous
              </button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                <button
                  aria-current={page === visiblePage ? "page" : undefined}
                  className={`h-10 min-w-10 rounded-xl px-3 text-sm font-semibold transition ${
                    page === visiblePage
                      ? "bg-cyan-300 text-slate-950"
                      : "border border-white/10 text-slate-300 hover:border-cyan-300/50"
                  }`}
                  key={page}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={visiblePage === pageCount}
                onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
              >
                Next
              </button>
            </nav>
          )}
        </section>}

        {searchScope === "github" && (
          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Live GitHub search
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-white">
                  {githubTotal > 0
                    ? `${githubTotal.toLocaleString()} repositories found`
                    : "Search beyond the curated catalog"}
                </h2>
              </div>
              {githubTotal > 1000 && (
                <p className="text-sm text-slate-500">GitHub exposes the first 1,000 results.</p>
              )}
            </div>

            {githubResults.length === 0 && !githubLoading && (
              <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
                <h3 className="text-lg font-semibold text-white">Search GitHub’s public repositories</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Use plain terms or GitHub qualifiers such as language:python, topic:audio, or stars:&gt;1000.
                </p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {githubResults.map((repo) => {
                const active = watched.includes(repo.full_name);
                return (
                  <article
                    className="flex min-w-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5"
                    key={repo.id}
                  >
                    <div className="min-w-0">
                      <a
                        className="block break-words text-lg font-semibold text-white hover:text-cyan-200"
                        href={repo.html_url}
                        target="_blank"
                      >
                        {repo.full_name}
                      </a>
                      <p className="mt-3 min-h-12 text-sm leading-6 text-slate-400">
                        {repo.description || "No repository description provided."}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                      {repo.language && (
                        <span className="rounded-full bg-cyan-300/10 px-2 py-1 text-cyan-100">
                          {repo.language}
                        </span>
                      )}
                      <span className="rounded-full bg-slate-950 px-2 py-1">
                        ★ {repo.stargazers_count.toLocaleString()}
                      </span>
                      <span className="rounded-full bg-slate-950 px-2 py-1">
                        {repo.forks_count.toLocaleString()} forks
                      </span>
                      <span className="rounded-full bg-slate-950 px-2 py-1">
                        {repo.open_issues_count.toLocaleString()} open issues
                      </span>
                    </div>

                    <p className="mt-4 text-xs text-slate-500">
                      Last pushed {formatAge(repo.pushed_at)}
                    </p>
                    <button
                      className={`mt-5 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        active
                          ? "bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                          : "border border-white/10 text-slate-200 hover:border-cyan-300/60"
                      }`}
                      onClick={() => toggleRepo(repo.full_name)}
                    >
                      {active ? "Watching" : "Watch issues"}
                    </button>
                  </article>
                );
              })}
            </div>

            {githubResults.length > 0 && (
              <nav
                aria-label="GitHub search pages"
                className="mt-6 flex items-center justify-center gap-3"
              >
                <button
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 disabled:opacity-40"
                  disabled={githubPage === 1 || githubLoading}
                  onClick={() => searchGithub(githubPage - 1)}
                >
                  Previous
                </button>
                <span className="text-sm text-slate-400">
                  Page <strong className="text-white">{githubPage}</strong> of {githubPageCount}
                </span>
                <button
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 disabled:opacity-40"
                  disabled={githubPage === githubPageCount || githubLoading}
                  onClick={() => searchGithub(githubPage + 1)}
                >
                  Next
                </button>
              </nav>
            )}
          </section>
        )}
        </>}

        {false && <section className="rounded-[2rem] border border-violet-300/20 bg-violet-300/[0.06] p-5 lg:p-7">
          <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="mb-2 w-fit rounded-full border border-violet-300/25 bg-violet-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-violet-200">
                YC open-source window
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                YC 2024–2026 repos where contributor history can matter
              </h2>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">
                These are recent YC open-source companies from the YC OSS list,
                filtered for AI, Python, devtools, auth, security, and infra.
                This is a separate watch pane because early-stage startups may
                notice useful contributors faster than mature projects.
              </p>
            </div>
            <a
              className="rounded-2xl border border-violet-300/30 px-4 py-3 text-sm font-semibold text-violet-100 transition hover:border-violet-200 hover:bg-violet-300/10"
              href="https://github.com/yc-oss/open-source-companies"
              target="_blank"
            >
              Source: yc-oss list
            </a>
          </div>

          <div className="mb-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
            Hiring signal is not automatic. Founder visibility is higher in YC
            repos, but only if your contributions are useful: broken
            integration fixes, clear bug reports, reproducible tests, docs that
            reduce support load, or reliability work.
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {ycRepos.map((repo) => {
              const active = watched.includes(repo.fullName);
              return (
                <article
                  key={repo.fullName}
                  className="flex flex-col rounded-3xl border border-violet-200/15 bg-slate-950/70 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <a
                        className="text-lg font-semibold text-white hover:text-violet-200"
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
                        ? "bg-violet-300 text-slate-950 hover:bg-violet-200"
                        : "border border-white/10 text-slate-200 hover:border-violet-300/60"
                    }`}
                    onClick={() => toggleRepo(repo.fullName)}
                  >
                    {active ? "Watching" : "Watch YC issues"}
                  </button>
                </article>
              );
            })}
          </div>
        </section>}

        {activeView === "guide" && (
          <section
            className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 lg:p-10"
            data-source-count={sourceLinks.length}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
              Contribution guide
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-white sm:text-4xl">
              Make your first contribution without wasting maintainers&apos; time.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
              A useful contribution starts with verification and communication,
              not immediately editing code. Follow this sequence for any repository.
            </p>

            <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                ["01", "Check project health", "Look for recent commits, releases, issue responses, and merged community pull requests."],
                ["02", "Read the rules", "Open README, CONTRIBUTING, development setup, test instructions, and pull-request templates."],
                ["03", "Reproduce the problem", "Confirm the issue still exists on the current default branch and record exact reproduction steps."],
                ["04", "Agree on scope", "Comment with your diagnosis and proposed fix. Ask before implementing broad or compatibility-sensitive changes."],
                ["05", "Fix it with tests", "Make the smallest complete change, add a regression test, and run the project’s required checks."],
                ["06", "Write a reviewable PR", "Explain the problem, root cause, solution, verification, risks, and any behavior intentionally left unchanged."],
              ].map(([number, title, description]) => (
                <li className="rounded-3xl border border-white/10 bg-slate-950/70 p-5" key={number}>
                  <span className="font-mono text-sm font-semibold text-cyan-200">{number}</span>
                  <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
                </li>
              ))}
            </ol>

            <div className="mt-8 rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5">
              <h3 className="font-semibold text-amber-50">Do not start with a blind pull request.</h3>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-amber-100/90">
                An issue label is not permission, and an unassigned issue may already have work in progress.
                Search linked pull requests, read the discussion, and confirm the expected behavior first.
              </p>
            </div>
          </section>
        )}

        {activeView === "token" && (
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
              GitHub token setup
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-white sm:text-4xl">
              Create a fine-grained token for higher API limits.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
              A token is optional. Repo Radar can search public repositories without one,
              but GitHub gives signed-in API requests a much higher general rate limit.
              For public discovery and issue watching, do not grant additional permissions.
            </p>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <ol className="grid gap-4">
                  {[
                    ["01", "Open token settings", "Sign in to GitHub, open Settings → Developer settings → Personal access tokens → Fine-grained tokens, then choose Generate new token."],
                    ["02", "Name it and limit its lifetime", "Use a clear name such as Repo Radar and choose a 30- or 90-day expiration. Short-lived tokens reduce the damage if one leaks."],
                    ["03", "Keep access minimal", "Choose your personal account as resource owner. Fine-grained tokens already include read-only access to public repositories, so leave every additional repository permission at No access."],
                    ["04", "Generate and copy once", "GitHub only shows the token value after creation. Copy it without posting it, committing it, or including it in a screenshot."],
                    ["05", "Paste it into Repo Radar", "Return to Explore repos and paste it into Optional GitHub token. It stays in this browser's local storage, so never use this option on a shared computer."],
                  ].map(([number, title, description]) => (
                    <li className="rounded-3xl border border-white/10 bg-slate-950/70 p-5" key={number}>
                      <span className="font-mono text-sm font-semibold text-cyan-200">{number}</span>
                      <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
                    </li>
                  ))}
                </ol>

                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                    href="https://github.com/settings/personal-access-tokens/new?name=Repo%20Radar&description=Public%20repository%20search%20and%20issue%20watching&expires_in=90"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Create token on GitHub ↗
                  </a>
                  <a
                    className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 hover:border-cyan-300/60"
                    href="https://github.com/settings/personal-access-tokens"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Review or revoke tokens ↗
                  </a>
                </div>
              </div>

              <div className="space-y-5">
                <figure className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70">
                  {/* The vinext runtime does not provide Next.js image optimization. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="GitHub documentation explaining personal access tokens and warning users to treat them like passwords"
                    className="h-auto w-full"
                    height={887}
                    src="/github-token-fine-grained-guide.png"
                    width={762}
                  />
                  <figcaption className="p-4 text-xs leading-5 text-slate-400">
                    GitHub treats access tokens like passwords. Never share the value or put it in a reel.
                  </figcaption>
                </figure>

                <div className="rounded-3xl border border-rose-300/20 bg-rose-300/10 p-5">
                  <h3 className="font-semibold text-rose-50">The uncomfortable security detail</h3>
                  <p className="mt-2 text-sm leading-6 text-rose-100/90">
                    Repo Radar stores the token unencrypted in this browser&apos;s local storage.
                    That is convenient, not secure storage. Use a minimal, expiring token, avoid shared devices,
                    and revoke it immediately if it appears in a screenshot, recording, commit, or log.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        <footer className="mt-4 border-t border-white/10 px-2 py-8 text-sm text-slate-400">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-slate-200">
                Made for OSS with <span className="text-rose-400" aria-label="love">♥</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Your watchlist and optional token stay in this browser.
              </p>
            </div>

            <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-3">
              <button
                className="transition hover:text-cyan-200"
                onClick={() => {
                  setActiveView("explore");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Explore repos
              </button>
              <button
                className="transition hover:text-cyan-200"
                onClick={() => {
                  setActiveView("guide");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Contribution guide
              </button>
              <button
                className="transition hover:text-cyan-200"
                onClick={() => {
                  setActiveView("token");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Token setup
              </button>
              <a
                className="transition hover:text-cyan-200"
                href="https://github.com/ZoroZoro95/RepoForYou"
                rel="noreferrer"
                target="_blank"
              >
                GitHub ↗
              </a>
            </nav>
          </div>
        </footer>
      </section>
    </main>
  );
}
