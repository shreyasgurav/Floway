import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;

  // Redirect logged-in users to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-2xl mx-auto text-center animate-fade-in">
          {/* Logo/Brand */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm text-[var(--text-secondary)]">
              <span className="status-dot active"></span>
              For Business & Creator accounts
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Turn comments into
            <br />
            <span className="ig-gradient">conversations</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-[var(--text-secondary)] mb-10 max-w-lg mx-auto">
            When someone comments a keyword on your post, 
            they instantly receive your DM. Set it up in under 60 seconds.
          </p>

          {/* Error message */}
          {params.error && (
            <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
              {params.error}
            </div>
          )}

          {/* Login Button */}
          <Link
            href="/api/auth/login"
            className="btn-primary text-lg px-8 py-4"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Continue with Instagram
          </Link>

          {/* Privacy note */}
          <p className="mt-6 text-sm text-[var(--text-muted)]">
            We only request permissions needed for comment automation.
            <br />
            Your data stays private.
          </p>
        </div>

        {/* How it works */}
        <div className="mt-20 w-full max-w-3xl mx-auto animate-fade-in stagger-2" style={{ opacity: 0 }}>
          <h2 className="text-center text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-8">
            How it works
          </h2>
          
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="text-2xl mb-3">1</div>
              <h3 className="font-semibold mb-2">Pick a post</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Select any post or reel from your account
              </p>
            </div>
            
            <div className="card text-center">
              <div className="text-2xl mb-3">2</div>
              <h3 className="font-semibold mb-2">Set a keyword</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Choose what word triggers the reply
              </p>
            </div>
            
            <div className="card text-center">
              <div className="text-2xl mb-3">3</div>
              <h3 className="font-semibold mb-2">Write your DM</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Craft the message they'll receive
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-[var(--text-muted)]">
        <p>Built for Instagram Business & Creator accounts</p>
      </footer>
    </main>
  );
}
