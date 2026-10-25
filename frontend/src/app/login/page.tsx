"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  FileText,
  ShieldCheck,
  Sparkles,
  LoaderCircle,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";
const TOKEN_KEY = "contentforge_access_token";
const USER_KEY = "contentforge_user";

type AuthUser = {
  id: number;
  name: string;
  email: string;
};

type AuthResponse = {
  status: string;
  message: string;
  access_token: string;
  token_type: string;
  user: AuthUser;
};

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [loading, setLoading] = useState(false);

  function changeMode(nextMode: "login" | "register") {
    setMode(nextMode);
    setMessage("");
    setPassword("");
    setConfirmPassword("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (mode === "register" && password !== confirmPassword) {
      setMessageType("error");
      setMessage("Passwords do not match.");
      return;
    }

    if (mode === "register" && name.trim().length === 0) {
      setMessageType("error");
      setMessage("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/register";

      const payload =
        mode === "login"
          ? { email: cleanEmail, password }
          : { name: name.trim(), email: cleanEmail, password };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => ({}))) as
        | AuthResponse
        | { detail?: string | Array<{ msg?: string }> };

      if (!response.ok) {
        const detail = "detail" in data ? data.detail : undefined;
        const errorText = Array.isArray(detail)
          ? detail.map((item) => item.msg || "Invalid input").join(" ")
          : detail || `Request failed (${response.status}).`;
        throw new Error(errorText);
      }

      const authData = data as AuthResponse;
      if (!authData.access_token || !authData.user) {
        throw new Error("The server returned an incomplete authentication response.");
      }

      // MVP storage: accessible to JavaScript. For production, prefer an HttpOnly secure cookie.
      localStorage.setItem(TOKEN_KEY, authData.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(authData.user));

      setMessageType("success");
      setMessage(mode === "login" ? "Login successful. Redirecting…" : "Account created. Redirecting…");
      router.replace("/");
      router.refresh();
    } catch (error) {
      setMessageType("error");
      if (error instanceof TypeError) {
        setMessage("Cannot reach the backend. Make sure FastAPI is running at http://127.0.0.1:8000.");
      } else {
        setMessage(error instanceof Error ? error.message : "Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-800">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="hidden flex-col justify-between bg-indigo-700 p-12 text-white lg:flex">
          <Link href="/" className="flex w-fit items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-white">
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white/15 p-1"><img src="/contentforge-logo-icon.png" alt="ContentForge AI logo" className="h-full w-full object-contain" /></span>
            <span>
              <span className="block text-xl font-bold">ContentForge AI</span>
              <span className="text-sm text-indigo-100">Intelligent Content Transformation</span>
            </span>
          </Link>

          <div className="max-w-lg">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15"><FileText size={32} /></div>
            <h1 className="text-4xl font-bold leading-tight">Turn one source into content for every audience.</h1>
            <p className="mt-5 text-lg leading-8 text-indigo-100">Transform documents into summaries, professional posts, presentations, and more—all from one workspace.</p>
            <div className="mt-8 flex items-center gap-3 text-sm text-indigo-100"><ShieldCheck size={19} /> Built for a focused, reliable content workflow</div>
          </div>
          <p className="text-sm text-indigo-200">ContentForge AI </p>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            {/* <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-700"><ArrowLeft size={16} /> Back to workspace</Link> */}

            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white p-1"><img src="/contentforge-logo-icon.png" alt="ContentForge AI logo" className="h-full w-full object-contain" /></span>
                <div><p className="text-lg font-bold">ContentForge AI</p><p className="text-xs text-slate-500">Content Intelligence</p></div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-7">
                <p className="text-sm font-semibold text-indigo-600">WELCOME TO CONTENTFORGE</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{mode === "login" ? "Sign in to your account" : "Create your account"}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{mode === "login" ? "Continue creating and managing your content." : "Get started with your AI content workspace."}</p>
              </div>

              <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                <button type="button" onClick={() => changeMode("login")} className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${mode === "login" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Sign in</button>
                <button type="button" onClick={() => changeMode("register")} className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${mode === "register" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Create account</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "register" && (
                  <div>
                    <label htmlFor="full-name" className="mb-1.5 block text-sm font-medium text-slate-700">Full name</label>
                    <input id="full-name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
                  </div>
                )}
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">Email address</label>
                  <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
                </div>
                <div>
                  <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
                  <div className="relative">
                    <input id="password" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
                    <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-slate-700">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                </div>
                {mode === "register" && (
                  <div>
                    <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-slate-700">Confirm password</label>
                    <input id="confirm-password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
                  </div>
                )}

                {message && (
                  <p role="status" aria-live="polite" className={`rounded-xl border px-3 py-2.5 text-sm ${messageType === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
                    {message}
                  </p>
                )}

                <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-indigo-200">
                  {loading && <LoaderCircle size={17} className="animate-spin" />}
                  {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
                </button>
              </form>
            </div>
            <p className="mt-6 text-center text-xs text-slate-400">By continuing, you agree to use the platform responsibly.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
