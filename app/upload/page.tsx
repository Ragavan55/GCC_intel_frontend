"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowDownToLine, Check, Clipboard, FileSpreadsheet, Upload as UploadIcon } from "lucide-react";
import { AppShell } from "@/components/features/AppShell";
import { Badge, Button, Card, EmptyState, ErrorState, Input, Select, Skeleton, useToast } from "@/components/ui";
import { apiFetch } from "@/lib/api";

interface UploadColumn {
  name: string;
  type: string;
  required: boolean;
  example: string;
}
interface UploadTable {
  key: string;
  label: string;
  aliases: string[];
  headers: string[];
  natural_key: string[];
  columns: UploadColumn[];
  row_count: number;
}
interface TableListResponse { tables: UploadTable[] }
interface UploadResult { table: string; rows_received: number; inserted: number; updated: number }

function escapeCsv(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

export default function UploadPage() {
  const [tables, setTables] = useState<UploadTable[]>([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loadingTables, setLoadingTables] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [copied, setCopied] = useState<"headers" | "schema" | null>(null);
  const { toast } = useToast();

  const selected = useMemo(() => tables.find((table) => table.key === selectedKey) ?? tables[0], [selectedKey, tables]);

  const loadTables = useCallback(async () => {
    setLoadingTables(true);
    setError(null);
    try {
      const response = await apiFetch<TableListResponse>("uploads/tables");
      setTables(response.tables);
      setSelectedKey((current) => current || response.tables[0]?.key || "");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load upload table definitions.");
    } finally {
      setLoadingTables(false);
    }
  }, []);

  useEffect(() => { void loadTables(); }, [loadTables]);

  async function copyText(text: string, kind: "headers" | "schema") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1600);
      toast(kind === "headers" ? "Column headers copied" : "Typed schema copied", "success");
    } catch {
      toast("Clipboard access was unavailable", "error");
    }
  }

  function downloadTemplate() {
    if (!selected) return;
    const contents = `${selected.headers.map(escapeCsv).join(",")}\r\n${selected.headers.map(() => "").join(",")}\r\n`;
    const blobUrl = URL.createObjectURL(new Blob([contents], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = `${selected.key}-template.csv`;
    anchor.click();
    URL.revokeObjectURL(blobUrl);
  }

  async function submitUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !file) {
      toast("Choose a table and a CSV file first.", "error");
      return;
    }
    setUploading(true);
    setResult(null);
    const data = new FormData();
    data.append("file", file);
    try {
      const response = await apiFetch<UploadResult>(`uploads/${selected.key}`, { method: "POST", body: data });
      setResult(response);
      setFile(null);
      const fileInput = document.getElementById("table-csv-file");
      if (fileInput instanceof HTMLInputElement) fileInput.value = "";
      await loadTables();
      toast(`${response.inserted} inserted, ${response.updated} updated.`, "success");
    } catch (caught) {
      toast(caught instanceof Error ? caught.message : "Upload failed. Check the CSV and try again.", "error");
    } finally {
      setUploading(false);
    }
  }

  const schemaText = selected?.columns.map((column) => `${column.name}: ${column.type}${column.required ? " (required)" : " (optional)"}${column.example ? `; example: ${column.example}` : ""}`).join("\n") ?? "";

  return <AppShell>
    <div className="fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-accent">Workspace / data management</p><h1 className="mt-2 font-display text-4xl sm:text-5xl">Upload your data.</h1><p className="mt-2 max-w-2xl text-sm text-muted">Choose a table, copy its schema, and import a UTF-8 CSV. Existing records are updated by their natural key.</p></div>
        <Badge>{tables.length} uploadable tables</Badge>
      </div>

      {error && <div className="mt-6"><ErrorState message={error} onRetry={() => void loadTables()} /></div>}
      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div className="grid gap-5">
          <Card className="p-5 sm:p-6">
            <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-panel bg-accent-soft text-accent-deep"><FileSpreadsheet size={19} /></span><div><h2 className="font-display text-2xl">1. Select a data table</h2><p className="mt-1 text-sm text-muted">The selected table determines the expected CSV headers and value types.</p></div></div>
            <div className="mt-5">{loadingTables ? <Skeleton className="h-11 w-full" /> : tables.length ? <Select aria-label="Data table" value={selected?.key ?? ""} onChange={(event) => { setSelectedKey(event.target.value); setResult(null); }}>
              {tables.map((table) => <option key={table.key} value={table.key}>{table.label} · {table.row_count.toLocaleString()} rows</option>)}
            </Select> : <EmptyState title="No upload schemas available" description="The server did not return any uploadable tables." />}</div>
            {selected && <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted"><span>Upsert key:</span>{selected.natural_key.map((key) => <Badge key={key}>{key}</Badge>)}{selected.aliases.map((alias) => <span key={alias}>Alias: <code>{alias}</code></span>)}</div>}
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-display text-2xl">2. Match the table structure</h2><p className="mt-1 text-sm text-muted">Headers must match exactly. Required fields need a value in every data row.</p></div><Badge tone="accent">{selected?.headers.length ?? 0} columns</Badge></div>
            {!selected ? <div className="mt-5"><Skeleton className="h-32 w-full" /></div> : <>
              <div className="mt-5 flex flex-wrap gap-2"><Button type="button" variant="secondary" size="sm" icon={copied === "headers" ? <Check size={15} /> : <Clipboard size={15} />} onClick={() => void copyText(selected.headers.join(","), "headers")}>{copied === "headers" ? "Copied" : "Copy headers"}</Button><Button type="button" variant="secondary" size="sm" icon={copied === "schema" ? <Check size={15} /> : <Clipboard size={15} />} onClick={() => void copyText(schemaText, "schema")}>{copied === "schema" ? "Copied" : "Copy typed schema"}</Button><Button type="button" variant="ghost" size="sm" icon={<ArrowDownToLine size={15} />} onClick={downloadTemplate}>Download blank CSV</Button></div>
              <div className="mt-4 overflow-x-auto rounded-panel border border-line"><table className="w-full text-left text-sm"><thead><tr className="border-b border-line bg-accent-soft/40 text-xs uppercase text-muted"><th className="px-3 py-2">Column</th><th className="px-3 py-2">Value type</th><th className="px-3 py-2">Requirement</th><th className="px-3 py-2">Example</th></tr></thead><tbody>{selected.columns.map((column) => <tr key={column.name} className="border-b border-line last:border-0"><td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{column.name}</td><td className="whitespace-nowrap px-3 py-2 text-xs text-muted">{column.type}</td><td className="px-3 py-2">{column.required ? <Badge tone="warning">Required</Badge> : <span className="text-xs text-muted">Optional</span>}</td><td className="max-w-48 truncate px-3 py-2 text-xs text-muted">{column.example || "—"}</td></tr>)}</tbody></table></div>
            </>}
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-panel bg-accent-soft text-accent-deep"><UploadIcon size={19} /></span><div><h2 className="font-display text-2xl">3. Upload CSV</h2><p className="mt-1 text-sm text-muted">UTF-8 CSV, maximum 10 MB and 10,000 rows per file.</p></div></div>
            <form onSubmit={(event) => void submitUpload(event)} className="mt-5 grid gap-4">
              <label htmlFor="table-csv-file" className="text-sm font-semibold">CSV file</label>
              <Input id="table-csv-file" type="file" accept=".csv,text/csv" aria-label="Choose a CSV file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="h-auto py-2 file:mr-3 file:rounded file:border-0 file:bg-accent-soft file:px-3 file:py-2 file:text-sm file:font-semibold file:text-accent-deep" />
              {file && <p className="text-xs text-muted">Selected: {file.name} · {(file.size / 1024).toFixed(1)} KB</p>}
              <Button type="submit" loading={uploading} disabled={!selected || !file} icon={<UploadIcon size={17} />} className="w-full sm:w-fit">{uploading ? "Importing rows…" : `Upload to ${selected?.label ?? "table"}`}</Button>
            </form>
            {result && <div role="status" className="mt-5 border-l-2 border-accent bg-accent-soft/40 p-4 text-sm"><p className="font-semibold">Upload complete · {result.table}</p><p className="mt-1 text-muted">{result.rows_received} rows processed: {result.inserted} inserted, {result.updated} updated.</p></div>}
          </Card>
        </div>

        <aside className="grid gap-5">
          <Card className="p-5"><p className="text-xs font-bold uppercase tracking-[0.13em] text-muted">Database inventory</p><h2 className="mt-1 font-display text-2xl">Uploaded tables</h2><div className="mt-4 grid gap-1">{loadingTables ? [1, 2, 3, 4].map((row) => <Skeleton key={row} className="h-10 w-full" />) : tables.map((table) => <Link key={table.key} href={`/data/${table.key}`} className="flex min-h-11 items-center justify-between gap-3 border-b border-line text-left text-sm last:border-0 hover:text-accent-deep"><span className="truncate">{table.label}</span><span className="tabular-nums text-muted">{table.row_count.toLocaleString()}</span></Link>)}</div></Card>
          <Card className="border-accent/30 bg-accent-soft/30 p-5"><h2 className="font-display text-xl">Import behavior</h2><p className="mt-2 text-sm text-muted">Rows are matched by the displayed upsert key. Matching rows are updated; new keys are inserted. The whole file is rejected if a header or typed value is invalid.</p><p className="mt-3 text-xs text-muted">Optional provenance fields are <code>source</code>, <code>source_url</code>, <code>confidence</code>, and <code>last_verified_at</code>.</p></Card>
        </aside>
      </div>
    </div>
  </AppShell>;
}
