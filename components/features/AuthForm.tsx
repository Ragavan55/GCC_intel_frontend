"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, Command } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { User, UserRole } from "@/lib/types";
import { Button, FormField, Input, PasswordInput, Select, useToast } from "@/components/ui";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("other");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (isSignup && !name.trim()) next.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address.";
    if (password.length < (isSignup ? 8 : 1)) next.password = isSignup ? "Use at least 8 characters." : "Enter your password.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await apiFetch<User>(`auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(isSignup ? { name: name.trim(), email, password, role } : { email, password }),
      });
      toast(`Welcome${user.name ? `, ${user.name.split(" ")[0]}` : " back"}.`, "success");
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not sign in. Try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  return <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.92fr)]">
    <section className="relative hidden overflow-hidden border-r border-line bg-[#e2efe8] p-10 text-[#153d36] lg:flex lg:flex-col lg:justify-between dark:bg-[#172b26] dark:text-[#dff5eb]">
      <Link href="/" className="flex w-fit items-center gap-3"><span className="grid size-11 place-items-center rounded-panel bg-accent text-white"><Command size={21} /></span><span className="font-display text-xl">GCC Intelligence India</span></Link>
      <div className="relative z-10 max-w-xl fade-up"><p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-deep dark:text-accent">The operating map</p><h1 className="mt-5 font-display text-6xl leading-[0.98]">Build your India capability with clarity.</h1><p className="mt-6 max-w-md text-lg opacity-75">One grounded view of the cities, talent, peers and operating signals shaping India’s GCC landscape.</p></div>
      <div className="relative z-10 flex gap-8 text-xs uppercase tracking-[0.12em] opacity-65"><span>City signals</span><span>Source-aware insights</span><span>India first</span></div>
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-8 size-[28rem] rounded-full border border-accent/20" /><div aria-hidden className="pointer-events-none absolute -bottom-12 right-10 size-[20rem] rounded-full border border-accent/20" />
    </section>
    <section className="flex min-h-dvh items-center justify-center px-5 py-12 sm:px-8">
      <div className="w-full max-w-[420px] fade-up">
        <Link href="/" className="mb-12 flex items-center gap-3 lg:hidden"><span className="grid size-10 place-items-center rounded-panel bg-accent text-white"><Command size={19} /></span><span className="font-display text-xl">GCC Intel India</span></Link>
        <div className="mb-8"><p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">Workspace access</p><h2 className="mt-2 font-display text-4xl">{isSignup ? "Create your account" : "Welcome back"}</h2><p className="mt-2 text-sm text-muted">{isSignup ? "Your India GCC workspace starts here." : "Sign in to continue to your workspace."}</p></div>
        <form onSubmit={submit} noValidate className="grid gap-5">
          {isSignup && <><FormField label="Full name" htmlFor="name" error={errors.name}><Input id="name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></FormField>
            <FormField label="I work in" htmlFor="role"><Select id="role" aria-label="Role" value={role} onChange={(event) => setRole(event.target.value as UserRole)}><option value="other">Other</option><option value="gcc_leader">GCC leadership</option><option value="advisor">Advisory</option><option value="real_estate">Real estate</option><option value="recruiter">Talent and recruiting</option></Select></FormField></>}
          <FormField label="Work email" htmlFor="email" error={errors.email}><Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" /></FormField>
          <FormField label="Password" htmlFor="password" error={errors.password} hint={isSignup ? "At least 8 characters." : undefined}><PasswordInput id="password" autoComplete={isSignup ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /></FormField>
          <Button type="submit" loading={loading} className="mt-1 w-full" icon={!loading && <ArrowRight size={17} />}>{isSignup ? "Create account" : "Sign in"}</Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">{isSignup ? "Already have an account?" : "New to the workspace?"} <Link className="font-semibold text-accent-deep underline decoration-accent/40 underline-offset-4" href={isSignup ? "/login" : "/signup"}>{isSignup ? "Sign in" : "Create an account"}</Link></p>
      </div>
    </section>
  </div>;
}