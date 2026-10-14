"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Database, FileUp, Rows3 } from "lucide-react";
import { AppShell } from "@/components/features/AppShell";
import { Badge, Button, Card, EmptyState, ErrorState, Skeleton, StatCard } from "@/components/ui";
import { apiFetch } from "@/lib/api";

interface HealthResponse { status: string; app: string }
interface UploadTableSummary { key: string; row_count: number }
interface UploadTablesResponse { tables: UploadTableSummary[] }

export default function DashboardPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [tables, setTables] = useState<UploadTableSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const totalRows = useMemo(() => tables.reduce((total, table) => total + table.row_count, 0), [tables]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([apiFetch<HealthResponse>("health"), apiFetch<UploadTablesResponse>("uploads/tables")])
      .then(([healthResult, tableResult]) => {
        if (!cancelled) {
          setHealth(healthResult);
          setTables(tableResult.tables);
        }
      })
      .catch((caught: unknown) => { if (!cancelled) setError(caught instanceof Error ? caught.message : "Could not load database inventory."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const count = (name: string) => tables.find((table) => table.key === name)?.row_count ?? 0;

  return <AppShell>
    <div className="fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-accent">Workspace / overview</p><h1 className="mt-2 font-display text-4xl sm:text-5xl">Your India data room.</h1><p className="mt-2 max-w-2xl text-sm text-muted">Upload and maintain the GCC, city, talent, cost and property datasets your team trusts.</p></div><Badge tone={health ? "accent" : error ? "signal" : "neutral"}>{loading ? "Connecting" : health ? "Database online" : "API unavailable"}</Badge></div>
      {error && <div className="mt-6"><ErrorState message={error} onRetry={() => { setLoading(true); setError(null); void Promise.all([apiFetch<HealthResponse>("health"), apiFetch<UploadTablesResponse>("uploads/tables")]).then(([healthResult, tableResult]) => { setHealth(healthResult); setTables(tableResult.tables); }).catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Could not load database inventory.")).finally(() => setLoading(false)); }} /></div>}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="All uploaded rows" value={loading ? "…" : totalRows.toLocaleString()} change="Across managed data tables" icon={<Database size={19} />} />
        <StatCard label="GCC directory" value={loading ? "…" : count("gccs").toLocaleString()} change="Company and location records" icon={<Rows3 size={19} />} />
        <StatCard label="Cities" value={loading ? "…" : count("cities").toLocaleString()} change="City reference records" icon={<Rows3 size={19} />} />
        <StatCard label="Providers" value={loading ? "…" : count("providers").toLocaleString()} change="Service-provider records" icon={<Rows3 size={19} />} />
      </div>
      <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        <Card className="p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.12em] text-muted">Database inventory</p><h2 className="mt-1 font-display text-2xl">Managed tables</h2></div><Link href="/upload"><Button icon={<FileUp size={17} />}>Upload data</Button></Link></div>
          {loading ? <div className="mt-5 grid gap-3">{[1, 2, 3, 4, 5].map((item) => <Skeleton key={item} className="h-11 w-full" />)}</div> : tables.length ? <div className="mt-5 grid gap-1 sm:grid-cols-2">{tables.map((table) => <Link key={table.key} href="/upload" className="flex min-h-12 items-center justify-between gap-3 border-b border-line px-2 text-sm transition-colors hover:bg-accent-soft/40"><span className="truncate">{table.key.replaceAll("_", " ")}</span><Badge>{table.row_count.toLocaleString()}</Badge></Link>)}</div> : <div className="mt-5"><EmptyState title="No upload tables found" description="The upload API did not return any table definitions." /></div>}
        </Card>
        <Card className="flex flex-col p-5 sm:p-6"><p className="text-xs uppercase tracking-[0.12em] text-muted">Next action</p><h2 className="mt-1 font-display text-2xl">Bring your data in.</h2><p className="mt-3 text-sm text-muted">Choose a table, copy its exact headers and value types, then import a CSV. Matching natural keys update existing rows safely.</p><div className="mt-5"><Link href="/upload"><Button variant="secondary" icon={<ArrowRight size={17} />}>Open data upload</Button></Link></div>
          {totalRows === 0 && !loading && <div className="mt-auto pt-8"><p className="border-l-2 border-warning bg-warning/5 p-3 text-sm">Your database has no uploaded business data yet. The assistant will answer from these tables as you populate them.</p></div>}
        </Card>
      </div>
    </div>
  </AppShell>;
}
