import Link from "next/link";
import { ArrowDownRight, ArrowRight, Command, MoveUpRight } from "lucide-react";

export default function HomePage() {
  return <main className="app-grain min-h-dvh overflow-hidden">
    <header className="relative z-10 mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
      <Link href="/" className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-panel bg-accent text-white"><Command size={19} /></span><span className="font-display text-lg">GCC Intelligence India</span></Link>
      <nav className="flex items-center gap-2"><Link href="/login" className="grid min-h-11 place-items-center px-4 text-sm font-semibold text-muted hover:text-ink">Sign in</Link><Link href="/signup" className="flex min-h-11 items-center gap-2 rounded-panel bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-deep">Create account <MoveUpRight size={15} /></Link></nav>
    </header>
    <section className="relative mx-auto grid min-h-[calc(100dvh-76px)] max-w-[1440px] grid-cols-1 items-center px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:px-12 lg:pb-20 lg:pt-4">
      <div className="relative z-10 max-w-[700px] py-10 fade-up">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-accent-deep"><span className="size-2 rounded-full bg-signal" /> India capability, in focus</p>
        <h1 className="mt-6 max-w-[680px] font-display text-[clamp(3rem,6vw,5.5rem)] leading-[0.98]">GCC Intelligence India</h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-muted">A clearer way to evaluate where capability grows: city signals, peer presence, talent and operating context in one source-aware view.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Link href="/signup" className="inline-flex min-h-12 items-center gap-2 rounded-panel bg-accent px-5 font-semibold text-white hover:bg-accent-deep">Enter the workspace <ArrowRight size={17} /></Link><Link href="/login" className="inline-flex min-h-12 items-center gap-2 rounded-panel border border-line px-5 font-semibold hover:bg-accent-soft">I already have access</Link></div>
        <div className="mt-14 grid max-w-xl grid-cols-3 border-t border-line pt-4 text-xs text-muted"><div><strong className="block font-display text-xl text-ink">City</strong>comparisons</div><div><strong className="block font-display text-xl text-ink">Peer</strong>landscape</div><div><strong className="block font-display text-xl text-ink">Source</strong>confidence</div></div>
      </div>
      <div className="relative mt-3 min-h-[360px] overflow-hidden border border-line bg-[#dbe9e3] sm:min-h-[460px] lg:ml-5 lg:mt-0 lg:min-h-[580px] dark:bg-[#1b302a]">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(8,127,114,.15)),url('https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=1300&q=85')] bg-cover bg-center mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12221f]/85 via-[#12221f]/10 to-transparent" />
        <div aria-hidden className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(8,127,114,.55)_1px,transparent_1px),linear-gradient(90deg,rgba(8,127,114,.55)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute left-[25%] top-[29%] size-3 rounded-full border-2 border-white bg-signal shadow-[0_0_0_8px_rgba(211,108,73,.22)]" />
        <div className="absolute left-[55%] top-[42%] size-3 rounded-full border-2 border-white bg-accent shadow-[0_0_0_8px_rgba(8,127,114,.24)]" />
        <div className="absolute left-[42%] top-[61%] size-3 rounded-full border-2 border-white bg-accent shadow-[0_0_0_8px_rgba(8,127,114,.24)]" />
        <div className="absolute right-[20%] top-[27%] size-3 rounded-full border-2 border-white bg-warning shadow-[0_0_0_8px_rgba(178,120,25,.24)]" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7"><div className="flex items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.14em] text-white/70">India / operating landscape</p><p className="mt-1 font-display text-3xl">Make the next city count.</p></div><span aria-hidden className="grid size-11 shrink-0 place-items-center border border-white/40"><ArrowDownRight size={20} /></span></div></div>
        <div className="absolute right-4 top-4 border border-white/50 bg-paper/80 px-3 py-2 text-xs font-semibold text-ink backdrop-blur">SOURCE-AWARE DATA</div>
      </div>
      <div className="col-span-full mt-8 flex justify-between border-t border-line pt-4 text-xs uppercase tracking-[0.12em] text-muted"><span>Built for India&apos;s GCC decisions</span><span>01 / Workspace</span></div>
    </section>
  </main>;
}