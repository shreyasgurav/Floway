"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { InstagramMedia, Automation } from "@/types";
import MediaGrid from "@/components/MediaGrid";
import AutomationSetup from "@/components/AutomationSetup";
import AutomationStatus from "@/components/AutomationStatus";

type Step = "select-post" | "setup" | "active";

export default function DashboardPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("select-post");
  const [media, setMedia] = useState<InstagramMedia[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<InstagramMedia | null>(null);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch media and automations on load
  useEffect(() => {
    async function loadData() {
      try {
        const [mediaRes, automationsRes] = await Promise.all([
          fetch("/api/media"),
          fetch("/api/automations"),
        ]);

        if (mediaRes.status === 401 || automationsRes.status === 401) {
          router.push("/");
          return;
        }

        const mediaData = await mediaRes.json();
        const automationsData = await automationsRes.json();

        if (mediaData.error) throw new Error(mediaData.error);
        if (automationsData.error) throw new Error(automationsData.error);

        setMedia(mediaData.media || []);
        setAutomations(automationsData.automations || []);

        // If there's an active automation, show it
        const activeAutomation = automationsData.automations?.find(
          (a: Automation) => a.isActive
        );
        if (activeAutomation) {
          setStep("active");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleSelectMedia = (mediaItem: InstagramMedia) => {
    setSelectedMedia(mediaItem);
    setStep("setup");
  };

  const handleBack = () => {
    if (step === "setup") {
      setSelectedMedia(null);
      setStep("select-post");
    }
  };

  const handleAutomationCreated = (automation: Automation) => {
    setAutomations([...automations, automation]);
    setStep("active");
  };

  const handleAutomationUpdated = (updatedAutomation: Automation) => {
    setAutomations(
      automations.map((a) =>
        a.id === updatedAutomation.id ? updatedAutomation : a
      )
    );
  };

  const handleAutomationDeleted = (automationId: string) => {
    setAutomations(automations.filter((a) => a.id !== automationId));
    setStep("select-post");
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const activeAutomation = automations.find((a) => a.isActive);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="card max-w-md text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-secondary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-lg border-b border-[var(--border-color)]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step !== "select-post" && step !== "active" && (
              <button
                onClick={handleBack}
                className="p-2 -ml-2 text-[var(--text-secondary)] hover:text-white transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="font-semibold">InstaFlow</h1>
          </div>
          
          <button
            onClick={handleLogout}
            className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {step === "select-post" && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Select a post</h2>
              <p className="text-[var(--text-secondary)]">
                Choose which post or reel should trigger your DM reply
              </p>
            </div>
            <MediaGrid media={media} onSelect={handleSelectMedia} />
          </div>
        )}

        {step === "setup" && selectedMedia && (
          <AutomationSetup
            media={selectedMedia}
            onBack={handleBack}
            onCreated={handleAutomationCreated}
          />
        )}

        {step === "active" && activeAutomation && (
          <AutomationStatus
            automation={activeAutomation}
            onUpdate={handleAutomationUpdated}
            onDelete={handleAutomationDeleted}
            onCreateNew={() => setStep("select-post")}
          />
        )}
      </main>
    </div>
  );
}

