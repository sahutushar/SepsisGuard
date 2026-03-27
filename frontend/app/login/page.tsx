"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Lock, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      router.push("/");
    } else {
      setError("Invalid username or password");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">SepsisGuard</h1>
            <p className="text-gray-500 text-sm">Early Sepsis Detection System</p>
          </div>
        </div>

        {/* Card */}
        <form onSubmit={handleLogin}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-gray-900 dark:text-white font-semibold text-lg">Sign in to continue</h2>

          <div className="space-y-1">
            <label className="text-gray-500 dark:text-gray-400 text-sm">Username</label>
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
              <User className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="doctor / nurse / admin"
                className="bg-transparent text-gray-900 dark:text-white text-sm flex-1 outline-none placeholder-gray-400"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-gray-500 dark:text-gray-400 text-sm">Password</label>
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
              <Lock className="w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent text-gray-900 dark:text-white text-sm flex-1 outline-none placeholder-gray-400"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors">
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <p className="text-gray-600 text-xs text-center">
            Demo: <span className="text-gray-400">doctor / sepsis123</span>
          </p>
        </form>
      </div>
    </div>
  );
}
