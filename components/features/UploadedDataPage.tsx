"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, FileUp } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { AppShell } from "@/components/features/AppShell";
import { Badge, Button, Card, DataTable, EmptyState, ErrorState, Pagination, Skeleton, type DataColumn } from "@/components/ui";

type DataValue = string | number | null;
interface UploadedRecord { id: number; [key: string]: DataValue }
interface UploadedRecordsResponse {
  table: string;
  items: UploadedRecord[];
  total: number;
  page: number;
  page_size: number;
}

export function UploadedDataPage({ tableKey, title, description }: { tableKey: string; title: string; description: string }) {
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useApi<UploadedRecordsResponse>(`uploads/${tableKey}/records?page=${page}&page_size=50`);
  const columns = useMemo<DataColumn<UploadedRecord>[]>(() => {
    const first = data?.items[0];
    if (!first) return [];
    return Object.keys(first).filter((key) => key !== "id").map((key) => ({
      key,
      header: key.replaceAll("_", " "),
      render: (row) => {
        const value = row[key];
        if (value === null || value === undefined || value === "") return "—";
        if ((key === "source_url" || key === "website") && typeof value === "string" && value.startsWith("http")) {
          return <a className="inline-flex max-w-56 items-center gap-1 truncate text-accent-deep underline" href={value} target="_blank" rel="noreferrer">{value}<ArrowUpRight size={13} /></a>;
        }
        return typeof value === "number" ? value.toLocaleString() : value;
      },
    }));
  }, [data?.items]);

  return <AppShell>
    <div className="fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-accent">Workspace / uploaded data</p><h1 className="mt-2 font-display text-4xl sm:text-5xl">{title}</h1><p className="mt-2 max-w-2xl text-sm text-muted">{description}</p></div><div className="flex items-center gap-3"><Badge>{loading ? "Loading" : `${(data?.total ?? 0).toLocaleString()} records`}</Badge><Link href="/upload"><Button icon={<FileUp size={16} />}>Upload</Button></Link></div></div>
      <Card className="mt-7 p-4 sm:p-5">
        {loading ? <div className="grid gap-3">{[1, 2, 3, 4, 5].map((row) => <Skeleton key={row} className="h-10 w-full" />)}</div>
          : error ? <ErrorState message={error.message} onRetry={() => void refetch()} />
            : !data?.items.length ? <EmptyState title={`No ${title.toLowerCase()} uploaded yet`} description={`Upload rows to the ${tableKey} table and they will appear here. The chat assistant can query them after import.`} action={<Link href="/upload"><Button icon={<FileUp size={16} />}>Upload {title.toLowerCase()}</Button></Link>} />
              : <><DataTable columns={columns} rows={data.items} /><div className="mt-4"><Pagination page={data.page} pageSize={data.page_size} total={data.total} onPageChange={setPage} /></div></>}
      </Card>
    </div>
  </AppShell>;
}
