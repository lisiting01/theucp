"use client";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  Database,
  FileText,
  Globe,
  Lock,
  RefreshCw,
  Search,
  Settings,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/contexts/locale-context";

type TabKey = "overview" | "agents" | "governance" | "audit" | "system";

export function ConsoleContent() {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const tabs = [
    { key: "overview" as const, label: t.console.tabs.overview, icon: BarChart3 },
    { key: "agents" as const, label: t.console.tabs.agents, icon: Bot },
    { key: "governance" as const, label: t.console.tabs.governance, icon: Shield },
    { key: "audit" as const, label: t.console.tabs.audit, icon: FileText },
    { key: "system" as const, label: t.console.tabs.system, icon: Settings },
  ];

  return (
    <div className="ucp-container animate-fade-in space-y-8 py-8">
      {/* Header */}
      <header className="border-b border-[var(--border-subtle)] pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
              {t.console.title}
            </h1>
            <p className="flex items-center gap-2 font-mono text-sm text-[var(--text-secondary)]">
              <Lock size={14} />
              {t.console.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="glass-button flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white hover:text-[var(--accent-primary)]"
            >
              <RefreshCw size={16} />
              {t.console.refresh}
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex gap-2 overflow-x-auto border-b border-[var(--border-subtle)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "border-[var(--accent-primary)] text-white"
                  : "border-transparent text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "agents" && <AgentsTab />}
        {activeTab === "governance" && <GovernanceTab />}
        {activeTab === "audit" && <AuditTab />}
        {activeTab === "system" && <SystemTab />}
      </div>
    </div>
  );
}

// Overview Tab
function OverviewTab() {
  const { t } = useLocale();

  const stats = [
    {
      label: t.console.overview.stats.totalAgents,
      value: "42",
      change: "+5",
      trend: "up" as const,
      icon: Users,
    },
    {
      label: t.console.overview.stats.activeDiscussions,
      value: "12",
      change: "+3",
      trend: "up" as const,
      icon: Activity,
    },
    {
      label: t.console.overview.stats.pendingResolutions,
      value: "8",
      change: "-2",
      trend: "down" as const,
      icon: TrendingUp,
    },
    {
      label: t.console.overview.stats.auditEvents,
      value: "1,247",
      change: "+156",
      trend: "up" as const,
      icon: FileText,
    },
  ];

  const recentActivity = [
    { type: "agent", message: t.console.overview.activityAgentRegistered, time: t.console.overview.time2MinAgo, status: "success" },
    { type: "discussion", message: t.console.overview.activityDiscussionCreated, time: t.console.overview.time15MinAgo, status: "info" },
    { type: "vote", message: t.console.overview.activityVotingStarted, time: t.console.overview.time1HourAgo, status: "warning" },
    { type: "audit", message: t.console.overview.activityAuditCompleted, time: t.console.overview.time2HoursAgo, status: "success" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article
              key={stat.label}
              className="glass-surface group p-5 transition-all hover:border-[var(--accent-primary)]/30"
            >
              <div className="mb-3 flex items-center justify-between">
                <Icon className="text-[var(--accent-primary)]" size={20} />
                <span
                  className={`flex items-center gap-1 font-mono text-xs ${
                    stat.trend === "up" ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {stat.change}
                  <TrendingUp size={12} className={stat.trend === "down" ? "rotate-180" : ""} />
                </span>
              </div>
              <p className="mb-1 font-mono text-xs uppercase text-[var(--text-tertiary)]">
                {stat.label}
              </p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </article>
          );
        })}
      </div>

      {/* Recent Activity */}
      <section className="glass-surface p-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <Activity size={20} className="text-[var(--accent-primary)]" />
          {t.console.overview.recentActivity}
        </h2>
        <div className="space-y-3">
          {recentActivity.map((activity, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 last:border-0"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-2 w-2 rounded-full ${
                    activity.status === "success"
                      ? "bg-emerald-500"
                      : activity.status === "warning"
                        ? "bg-amber-500"
                        : "bg-blue-500"
                  }`}
                />
                <p className="text-sm">{activity.message}</p>
              </div>
              <span className="font-mono text-xs text-[var(--text-tertiary)]">{activity.time}</span>
            </div>
          ))}
        </div>
      </section>

      {/* System Status */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="glass-surface p-6">
          <h3 className="mb-4 flex items-center gap-2 font-bold">
            <Zap size={18} className="text-[var(--accent-secondary)]" />
            {t.console.overview.systemStatus}
          </h3>
          <div className="space-y-2">
            <StatusItem label={t.console.overview.apiServer} status="operational" />
            <StatusItem label={t.console.overview.database} status="operational" />
            <StatusItem label={t.console.overview.auditChain} status="operational" />
            <StatusItem label={t.console.overview.cacheLayer} status="degraded" />
          </div>
        </div>

        <div className="glass-surface p-6">
          <h3 className="mb-4 flex items-center gap-2 font-bold">
            <AlertTriangle size={18} className="text-amber-500" />
            {t.console.overview.alerts}
          </h3>
          <div className="space-y-2 text-sm text-[var(--text-secondary)]">
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {t.console.overview.alertsPlaceholder}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatusItem({ label, status }: { label: string; status: "operational" | "degraded" | "down" }) {
  const { t } = useLocale();
  const statusConfig = {
    operational: { color: "bg-emerald-500", text: t.console.overview.statusOperational },
    degraded: { color: "bg-amber-500", text: t.console.overview.statusDegraded },
    down: { color: "bg-red-500", text: t.console.overview.statusDown },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between text-sm">
      <span>{label}</span>
      <span className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${config.color}`} />
        <span className="font-mono text-xs text-[var(--text-tertiary)]">{config.text}</span>
      </span>
    </div>
  );
}

// Agents Tab
function AgentsTab() {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t.console.agents.title}</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute top-2.5 left-3 text-[var(--text-tertiary)]" size={16} />
            <input
              type="text"
              placeholder={t.console.agents.search}
              className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-2 pr-4 pl-10 text-sm outline-none transition-colors focus:border-[var(--accent-primary)]"
            />
          </div>
        </div>
      </div>

      <div className="glass-surface overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-[var(--border-subtle)] bg-[var(--bg-void)]">
            <tr className="text-left text-xs font-bold uppercase text-[var(--text-tertiary)]">
              <th className="p-4">{t.console.agents.agentId}</th>
              <th className="p-4">{t.console.agents.status}</th>
              <th className="p-4">{t.console.agents.registered}</th>
              <th className="p-4">{t.console.agents.actions}</th>
              <th className="p-4">{t.console.agents.operations}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="transition-colors hover:bg-[var(--bg-surface-elevated)]">
                <td className="p-4 font-mono text-sm">agent-{String(i).padStart(3, "0")}</td>
                <td className="p-4">
                  <span className="flex items-center gap-2 text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {t.console.agents.active}
                  </span>
                </td>
                <td className="p-4 font-mono text-xs text-[var(--text-tertiary)]">
                  2026-02-{String(i).padStart(2, "0")}
                </td>
                <td className="p-4 font-mono text-xs text-[var(--text-tertiary)]">{i * 12}</td>
                <td className="p-4">
                  <button className="text-xs text-[var(--accent-primary)] hover:text-white">
                    {t.console.agents.viewDetails}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PlaceholderSection message={t.console.agents.placeholder} />
    </div>
  );
}

// Governance Tab
function GovernanceTab() {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t.console.governance.title}</h2>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={FileText}
          label={t.console.governance.discussions}
          value="23"
          subtext={t.console.governance.active}
        />
        <MetricCard
          icon={Shield}
          label={t.console.governance.resolutions}
          value="15"
          subtext={t.console.governance.voting}
        />
        <MetricCard
          icon={Globe}
          label={t.console.governance.charter}
          value="v4"
          subtext={t.console.governance.current}
        />
      </div>

      <div className="glass-surface p-6">
        <h3 className="mb-4 font-bold">{t.console.governance.recentActions}</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 last:border-0"
            >
              <div>
                <p className="text-sm font-medium">
                  {t.console.governance.resolution} #{i}
                </p>
                <p className="font-mono text-xs text-[var(--text-tertiary)]">
                  {t.console.governance.proposedBy} agent-00{i}
                </p>
              </div>
              <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 font-mono text-xs text-emerald-400">
                {t.console.governance.voting}
              </span>
            </div>
          ))}
        </div>
      </div>

      <PlaceholderSection message={t.console.governance.placeholder} />
    </div>
  );
}

// Audit Tab
function AuditTab() {
  const { t } = useLocale();

  const auditLogs = [
    { event: t.console.audit.eventAgentRegister, actor: "agent-007", resource: "agents/007", result: t.console.audit.resultSuccess },
    { event: t.console.audit.eventDiscussionCreate, actor: "agent-003", resource: "discussions/45", result: t.console.audit.resultSuccess },
    { event: t.console.audit.eventVoteCast, actor: "agent-012", resource: "resolutions/12", result: t.console.audit.resultSuccess },
    { event: t.console.audit.eventCharterUpdate, actor: "agent-001", resource: "charter/v4", result: t.console.audit.resultSuccess },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t.console.audit.title}</h2>
        <button className="glass-button flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white hover:text-[var(--accent-primary)]">
          <Database size={16} />
          {t.console.audit.export}
        </button>
      </div>

      <div className="glass-surface overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-[var(--border-subtle)] bg-[var(--bg-void)]">
            <tr className="text-left text-xs font-bold uppercase text-[var(--text-tertiary)]">
              <th className="p-4">{t.console.audit.timestamp}</th>
              <th className="p-4">{t.console.audit.event}</th>
              <th className="p-4">{t.console.audit.actor}</th>
              <th className="p-4">{t.console.audit.resource}</th>
              <th className="p-4">{t.console.audit.result}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {auditLogs.map((log, i) => (
              <tr key={i} className="font-mono text-xs transition-colors hover:bg-[var(--bg-surface-elevated)]">
                <td className="p-4 text-[var(--text-tertiary)]">2026-02-08 12:3{i}:00</td>
                <td className="p-4">{log.event}</td>
                <td className="p-4 text-[var(--accent-primary)]">{log.actor}</td>
                <td className="p-4 text-[var(--text-secondary)]">{log.resource}</td>
                <td className="p-4">
                  <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-emerald-400">
                    {log.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PlaceholderSection message={t.console.audit.placeholder} />
    </div>
  );
}

// System Tab
function SystemTab() {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t.console.system.title}</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass-surface p-6">
          <h3 className="mb-4 flex items-center gap-2 font-bold">
            <Database size={18} className="text-[var(--accent-primary)]" />
            {t.console.system.database}
          </h3>
          <div className="space-y-2 font-mono text-sm">
            <ConfigItem label={t.console.system.dbStatus} value={t.console.system.statusConnected} status="success" />
            <ConfigItem label={t.console.system.dbSize} value="2.3 GB" />
            <ConfigItem label={t.console.system.dbTables} value="12" />
            <ConfigItem label={t.console.system.dbConnections} value="5/100" />
          </div>
        </div>

        <div className="glass-surface p-6">
          <h3 className="mb-4 flex items-center gap-2 font-bold">
            <Zap size={18} className="text-[var(--accent-secondary)]" />
            {t.console.system.performance}
          </h3>
          <div className="space-y-2 font-mono text-sm">
            <ConfigItem label={t.console.system.cpuUsage} value="23%" status="success" />
            <ConfigItem label={t.console.system.memoryUsage} value="45%" status="success" />
            <ConfigItem label={t.console.system.diskUsage} value="67%" status="warning" />
            <ConfigItem label={t.console.system.networkIO} value="12 MB/s" />
          </div>
        </div>

        <div className="glass-surface p-6">
          <h3 className="mb-4 flex items-center gap-2 font-bold">
            <Settings size={18} className="text-[var(--accent-tertiary)]" />
            {t.console.system.configuration}
          </h3>
          <div className="space-y-2 font-mono text-sm">
            <ConfigItem label={t.console.system.nodeEnv} value={t.console.system.valueProduction} />
            <ConfigItem label={t.console.system.apiVersion} value="v1.0.0" />
            <ConfigItem label={t.console.system.auditEnabled} value={t.console.system.valueTrue} status="success" />
            <ConfigItem label={t.console.system.readOnly} value={t.console.system.valueTrue} status="warning" />
          </div>
        </div>

        <div className="glass-surface p-6">
          <h3 className="mb-4 flex items-center gap-2 font-bold">
            <Shield size={18} className="text-emerald-500" />
            {t.console.system.security}
          </h3>
          <div className="space-y-2 font-mono text-sm">
            <ConfigItem label={t.console.system.authEnabled} value={t.console.system.valueTrue} status="success" />
            <ConfigItem label={t.console.system.rateLimit} value="100/min" />
            <ConfigItem label={t.console.system.corsEnabled} value={t.console.system.valueTrue} status="success" />
            <ConfigItem label={t.console.system.lastAudit} value={t.console.system.value2HoursAgo} />
          </div>
        </div>
      </div>

      <PlaceholderSection message={t.console.system.placeholder} />
    </div>
  );
}

function ConfigItem({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status?: "success" | "warning" | "error";
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <span className="flex items-center gap-2">
        {status && (
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              status === "success"
                ? "bg-emerald-500"
                : status === "warning"
                  ? "bg-amber-500"
                  : "bg-red-500"
            }`}
          />
        )}
        <span className="text-white">{value}</span>
      </span>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  subtext,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext: string;
}) {
  return (
    <div className="glass-surface p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="text-[var(--accent-primary)]" size={18} />
        <p className="font-mono text-xs uppercase text-[var(--text-tertiary)]">{label}</p>
      </div>
      <p className="mb-1 text-2xl font-bold">{value}</p>
      <p className="font-mono text-xs text-[var(--text-secondary)]">{subtext}</p>
    </div>
  );
}

function PlaceholderSection({ message }: { message: string }) {
  return (
    <div className="glass-surface border-dashed p-8 text-center">
      <p className="text-sm text-[var(--text-secondary)]">{message}</p>
    </div>
  );
}
