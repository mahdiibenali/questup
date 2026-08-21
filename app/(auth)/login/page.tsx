"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      name,
      isSignUp: isSignUp.toString(),
      redirect: false,
    });

    if (result?.error) {
      setError(isSignUp ? "Email already in use" : "Invalid email or password");
    } else {
      router.push(isSignUp ? "/onboarding" : "/");
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary-muted mb-6">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 4L24 16H20V28H12V16H8L16 4Z" fill="#6C5CE7" />
              <circle cx="16" cy="8" r="2" fill="#FDCB6E" />
            </svg>
          </div>
          <h1 className="text-3xl font-display font-bold text-text tracking-tight">
            LevelUp
          </h1>
          <p className="text-text-secondary mt-2 text-sm">
            Your life, gamified.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-bg-elevated border border-border rounded-xl p-8">
          <h2 className="text-xl font-display font-semibold text-text mb-6">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 bg-bg border border-border rounded-lg text-text placeholder:text-text-dim text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-elevated transition-all"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-4 bg-bg border border-border rounded-lg text-text placeholder:text-text-dim text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-elevated transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-4 bg-bg border border-border rounded-lg text-text placeholder:text-text-dim text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-elevated transition-all"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-streak-muted rounded-lg">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="#FF6B6B">
                  <path d="M8 1C4.1 1 1 4.1 1 8s3.1 7 7 7 7-3.1 7-7S11.9 1 8 1zm3.5 10.5L10.5 12.5 8 10l-2.5 2.5-1-1L7 9 4.5 6.5l1-1L8 8l2.5-2.5 1 1L9 9l2.5 2.5z"/>
                </svg>
                <span className="text-sm text-streak">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                  </svg>
                  {isSignUp ? "Creating account..." : "Signing in..."}
                </span>
              ) : (
                isSignUp ? "Get started" : "Sign in"
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-bg-elevated text-text-dim">or</span>
            </div>
          </div>

          {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && (
            <button
              onClick={() => signIn("facebook", { callbackUrl: "/" })}
              className="w-full h-11 flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166FE5] text-white font-medium rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </button>
          )}
        </div>

        {/* Toggle */}
        <p className="text-center text-sm text-text-secondary mt-6">
          {isSignUp ? "Already have an account?" : "New here?"}{" "}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
            className="text-primary hover:text-primary-hover font-medium transition-colors"
          >
            {isSignUp ? "Sign in" : "Create an account"}
          </button>
        </p>
      </div>
    </div>
  );
}
