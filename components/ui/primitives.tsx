"use client";

import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Eye, EyeOff, LoaderCircle, Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { cn, initials } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-accent-deep dark:text-[#10231f]",
  secondary: "border border-line bg-paper text-ink hover:bg-accent-soft",
  ghost: "text-muted hover:bg-accent-soft hover:text-ink",
  danger: "bg-signal text-white hover:opacity-90",
};
const buttonSizes: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", loading = false, icon, children, disabled, ...props },
  ref,
) {
  return (
    <button ref={ref} className={cn("inline-flex items-center justify-center gap-2 rounded-panel font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55", buttonVariants[variant], buttonSizes[size], className)} disabled={disabled || loading} {...props}>
      {loading ? <Spinner size="sm" /> : icon}
      {children}
    </button>
  );
});

export function IconButton({ label, className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return <button aria-label={label} title={label} className={cn("inline-flex size-11 items-center justify-center rounded-panel text-muted transition-colors hover:bg-accent-soft hover:text-ink disabled:opacity-50", className)} {...props}>{children}</button>;
}

const inputClass = "min-h-11 w-full rounded-panel border border-line bg-paper px-3 text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(inputClass, className)} {...props} />;
});

export function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);
  return <div className="relative">
    <Input {...props} type={visible ? "text" : "password"} className={cn("pr-12", props.className)} />
    <IconButton type="button" label={visible ? "Hide password" : "Show password"} className="absolute right-0 top-0" onClick={() => setVisible((value) => !value)}>
      {visible ? <EyeOff size={18} /> : <Eye size={18} />}
    </IconButton>
  </div>;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(inputClass, "min-h-28 resize-y py-2.5", className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...props }, ref) {
  return <div className="relative">
    <select ref={ref} className={cn(inputClass, "appearance-none pr-10", className)} {...props}>{children}</select>
    <ChevronDown aria-hidden size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
  </div>;
});

export function MultiSelect({ label, options, value, onChange }: { label: string; options: string[]; value: string[]; onChange: (value: string[]) => void }) {
  return <fieldset className="flex flex-wrap gap-2">
    <legend className="mb-2 text-sm font-semibold">{label}</legend>
    {options.map((option) => {
      const selected = value.includes(option);
      return <button key={option} type="button" aria-pressed={selected} onClick={() => onChange(selected ? value.filter((item) => item !== option) : [...value, option])} className={cn("min-h-10 rounded-panel border px-3 text-sm transition-colors", selected ? "border-accent bg-accent-soft text-accent-deep" : "border-line text-muted hover:border-accent")}>
        {selected && <Check aria-hidden size={14} className="mr-1 inline" />}{option}
      </button>;
    })}
  </fieldset>;
}

export function Checkbox({ label, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: string }) {
  return <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm text-ink"><input type="checkbox" className="size-4 accent-[var(--accent)]" {...props} />{label}</label>;
}

export function Switch({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return <button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)} className="inline-flex min-h-11 items-center gap-3 text-left text-sm disabled:opacity-50">
    <span className={cn("relative h-6 w-11 rounded-full transition-colors", checked ? "bg-accent" : "bg-line")}><span className={cn("absolute top-1 size-4 rounded-full bg-white transition-transform", checked ? "translate-x-6" : "translate-x-1")} /></span>{label}
  </button>;
}

export function Slider({ label, value, min = 0, max = 100, onChange }: { label: string; value: number; min?: number; max?: number; onChange: (value: number) => void }) {
  return <label className="grid gap-2 text-sm"><span className="flex justify-between"><span>{label}</span><strong>{value}</strong></span><input aria-label={label} type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-[var(--accent)]" /></label>;
}

export function FormField({ label, error, hint, htmlFor, children }: { label: string; error?: string; hint?: string; htmlFor?: string; children: ReactNode }) {
  const generatedId = useId();
  const id = htmlFor ?? generatedId;
  return <div className="grid gap-1.5">
    <label className="text-sm font-semibold" htmlFor={id}>{label}</label>
    {children}
    {error ? <p className="text-sm text-signal" role="alert">{error}</p> : hint ? <p className="text-xs text-muted">{hint}</p> : null}
  </div>;
}

export function SearchInput({ value, onSearch, placeholder = "Search" }: { value?: string; onSearch: (value: string) => void; placeholder?: string }) {
  const [query, setQuery] = useState(value ?? "");
  const debounced = useDebounce(query, 250);
  useEffect(() => onSearch(debounced), [debounced, onSearch]);
  return <div className="relative">
    <Search aria-hidden size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
    <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} className="pl-10" aria-label={placeholder} />
  </div>;
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-panel border border-line bg-paper", className)} {...props} />;
}

export function StatCard({ label, value, change, icon }: { label: string; value: string; change?: string; icon?: ReactNode }) {
  return <Card className="p-4 sm:p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-muted">{label}</p><p className="mt-2 font-display text-3xl leading-none">{value}</p>{change && <p className="mt-2 text-xs text-accent-deep">{change}</p>}</div>{icon && <span className="grid size-10 shrink-0 place-items-center rounded-panel bg-accent-soft text-accent-deep">{icon}</span>}</div></Card>;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "accent" | "signal" | "warning" }) {
  const tones = { neutral: "border-line text-muted", accent: "border-accent/30 bg-accent-soft text-accent-deep", signal: "border-signal/30 bg-signal/10 text-signal", warning: "border-warning/30 bg-warning/10 text-warning" };
  return <span className={cn("inline-flex min-h-6 items-center rounded border px-2 text-xs font-semibold", tones[tone])}>{children}</span>;
}

export function ConfidenceBadge({ confidence }: { confidence: string }) {
  const normalized = confidence.toLowerCase();
  const tone = normalized === "high" ? "accent" : normalized === "medium" ? "warning" : "neutral";
  return <Badge tone={tone}>Confidence: {confidence}</Badge>;
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-14 text-base" };
  return <span aria-label={name} title={name} className={cn("grid shrink-0 place-items-center rounded-full bg-accent-soft font-semibold text-accent-deep", sizes[size])}>{initials(name)}</span>;
}

export function Tabs({ items, active, onChange }: { items: string[]; active: string; onChange: (value: string) => void }) {
  return <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-line">
    {items.map((item) => <button key={item} role="tab" aria-selected={active === item} type="button" onClick={() => onChange(item)} className={cn("min-h-11 shrink-0 border-b-2 px-3 text-sm transition-colors", active === item ? "border-accent font-semibold text-accent-deep" : "border-transparent text-muted hover:text-ink")}>{item}</button>)}
  </div>;
}

function Overlay({ children, onClose, label, className }: { children: ReactNode; onClose: () => void; label: string; className: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);
  if (!mounted) return null;
  return createPortal(<div className="fixed inset-0 z-50 flex bg-black/45" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-label={label} className={cn("m-auto max-h-[90dvh] overflow-auto border border-line bg-paper shadow-lift", className)}>{children}</section>
  </div>, document.body);
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return <Overlay onClose={onClose} label={title} className="w-[min(92vw,34rem)] rounded-panel p-5 sm:p-6">
    <div className="mb-4 flex items-center justify-between gap-4"><h2 className="font-display text-2xl">{title}</h2><IconButton label="Close dialog" onClick={onClose}><X size={18} /></IconButton></div>{children}
  </Overlay>;
}

export function Drawer({ open, onClose, title, children, side = "right" }: { open: boolean; onClose: () => void; title: string; children: ReactNode; side?: "left" | "right" | "bottom" }) {
  if (!open) return null;
  const place = side === "bottom" ? "mt-auto w-full rounded-t-panel" : `h-full w-[min(92vw,27rem)] ${side === "left" ? "mr-auto" : "ml-auto"}`;
  return <Overlay onClose={onClose} label={title} className={cn("p-5", place)}><div className="mb-4 flex items-center justify-between"><h2 className="font-display text-2xl">{title}</h2><IconButton label="Close panel" onClick={onClose}><X size={18} /></IconButton></div>{children}</Overlay>;
}

export function BottomSheet(props: Omit<Parameters<typeof Drawer>[0], "side">) {
  return <Drawer {...props} side="bottom" />;
}

export function Dropdown({ label, children }: { label: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <div className="relative">
    <Button variant="secondary" icon={<ChevronDown size={16} />} onClick={() => setOpen((value) => !value)} aria-expanded={open}>{label}</Button>
    {open && <div className="absolute right-0 z-20 mt-2 min-w-48 rounded-panel border border-line bg-paper p-2 shadow-lift" onClick={() => setOpen(false)}>{children}</div>}
  </div>;
}

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return <span className="group relative inline-flex" title={label}>
    {children}<span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-xs text-paper group-hover:block group-focus-within:block">{label}</span>
  </span>;
}

interface ToastItem { id: number; message: string; tone: "success" | "error" | "info" }
interface ToastContextValue { toast: (message: string, tone?: ToastItem["tone"]) => void }
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const value = useMemo<ToastContextValue>(() => ({
    toast: (message, tone = "info") => {
      const id = Date.now() + Math.random();
      setItems((current) => [...current, { id, message, tone }]);
      window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 4200);
    },
  }), []);
  return <ToastContext.Provider value={value}>{children}<div aria-live="polite" className="fixed right-4 top-4 z-[70] grid w-[min(90vw,22rem)] gap-2">
    {items.map((item) => <div key={item.id} role="status" className={cn("flex items-start justify-between gap-3 rounded-panel border bg-paper px-4 py-3 shadow-lift", item.tone === "error" ? "border-signal text-signal" : item.tone === "success" ? "border-accent text-accent-deep" : "border-line text-ink")}><p className="text-sm">{item.message}</p><IconButton label="Dismiss notification" className="-my-2 -mr-2 size-8" onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}><X size={15} /></IconButton></div>)}
  </div></ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "size-4", md: "size-5", lg: "size-8" };
  return <LoaderCircle aria-label="Loading" className={cn("animate-spin", sizes[size])} />;
}

export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div aria-hidden className={cn("animate-pulse rounded-panel bg-line/70", className)} style={style} />;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="grid min-h-48 place-items-center border border-dashed border-line px-5 py-8 text-center"><div><p className="font-display text-xl">{title}</p><p className="mt-1 max-w-md text-sm text-muted">{description}</p>{action && <div className="mt-4">{action}</div>}</div></div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border border-signal/40 bg-signal/5 p-4 text-sm"><span>{message}</span>{onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>Try again</Button>}</div>;
}

export function Pagination({ page, pageSize, total, onPageChange }: { page: number; pageSize: number; total: number; onPageChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return <div className="flex items-center justify-between gap-3 text-sm text-muted"><span>{total === 0 ? "No results" : `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, total)} of ${total}`}</span><div className="flex gap-1"><IconButton label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)}><ChevronLeft size={18} /></IconButton><span className="grid min-w-10 place-items-center tabular-nums">{page} / {pages}</span><IconButton label="Next page" disabled={page >= pages} onClick={() => onPageChange(page + 1)}><ChevronRight size={18} /></IconButton></div></div>;
}

export interface DataColumn<T> {
  key: keyof T;
  header: string;
  render?: (row: T) => ReactNode;
  mobile?: boolean;
}

export function DataTable<T extends { id: string | number }>({ columns, rows, emptyLabel = "No records found" }: { columns: DataColumn<T>[]; rows: T[]; emptyLabel?: string }) {
  if (rows.length === 0) return <EmptyState title={emptyLabel} description="Try changing your filters or come back after data has been added." />;
  return <>
    <div className="hidden overflow-x-auto md:block"><table className="w-full border-collapse text-left text-sm"><thead><tr className="border-b border-line text-xs uppercase text-muted">{columns.map((column) => <th key={String(column.key)} scope="col" className="px-3 py-3 font-semibold">{column.header}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-b border-line last:border-0 hover:bg-accent-soft/40">{columns.map((column) => <td key={String(column.key)} className="px-3 py-3">{column.render ? column.render(row) : String(row[column.key] ?? "-")}</td>)}</tr>)}</tbody></table></div>
    <div className="grid gap-2 md:hidden">{rows.map((row) => <Card key={row.id} className="grid gap-2 p-3">{columns.filter((column) => column.mobile !== false).map((column, index) => <div key={String(column.key)} className={cn("flex justify-between gap-4 text-sm", index === 0 && "font-semibold")}><span className="text-muted">{column.header}</span><span className="text-right">{column.render ? column.render(row) : String(row[column.key] ?? "-")}</span></div>)}</Card>)}</div>
  </>;
}

export const Table = DataTable;
export function TableHeader({ children }: { children: ReactNode }) { return <thead>{children}</thead>; }
export function TableBody({ children }: { children: ReactNode }) { return <tbody>{children}</tbody>; }
export function TableRow({ children }: { children: ReactNode }) { return <tr className="border-b border-line last:border-0">{children}</tr>; }
export function TableCell({ children, header = false }: { children: ReactNode; header?: boolean }) { return header ? <th scope="col" className="px-3 py-3 text-left text-xs font-semibold uppercase text-muted">{children}</th> : <td className="px-3 py-3">{children}</td>; }

export function Tag({ children, onRemove }: { children: ReactNode; onRemove?: () => void }) {
  return <span className="inline-flex min-h-8 items-center gap-1 rounded border border-line px-2 text-xs">{children}{onRemove && <IconButton label="Remove tag" className="size-6" onClick={onRemove}><X size={13} /></IconButton>}</span>;
}

export function Progress({ value, label }: { value: number; label?: string }) {
  const normalized = Math.max(0, Math.min(100, value));
  return <div className="grid gap-1"><div className="flex justify-between text-xs text-muted"><span>{label}</span><span>{normalized}%</span></div><div role="progressbar" aria-valuenow={normalized} aria-valuemin={0} aria-valuemax={100} className="h-2 overflow-hidden rounded-full bg-line"><span className="block h-full bg-accent transition-[width]" style={{ width: `${normalized}%` }} /></div></div>;
}

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("gcc-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored ? stored === "dark" : prefersDark;
    setDark(initial);
    document.documentElement.classList.toggle("dark", initial);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("gcc-theme", next ? "dark" : "light");
  };
  return <IconButton label={`Switch to ${dark ? "light" : "dark"} theme`} onClick={toggle}><span aria-hidden className="text-lg">{dark ? "☼" : "◐"}</span></IconButton>;
}
