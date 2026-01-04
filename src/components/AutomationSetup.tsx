"use client";

import { useState } from "react";
import { InstagramMedia, Automation } from "@/types";
import Image from "next/image";

interface AutomationSetupProps {
  media: InstagramMedia;
  onBack: () => void;
  onCreated: (automation: Automation) => void;
}

export default function AutomationSetup({ media, onBack, onCreated }: AutomationSetupProps) {
  const [keyword, setKeyword] = useState("");
  const [dmMessage, setDmMessage] = useState("");
  const [replyOncePerUser, setReplyOncePerUser] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const isValid = keyword.trim().length > 0 && dmMessage.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaId: media.id,
          mediaThumbnail: media.thumbnailUrl || media.mediaUrl,
          mediaCaption: media.caption,
          keyword: keyword.trim(),
          dmMessage: dmMessage.trim(),
          replyOncePerUser,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create automation");
      }

      onCreated(data.automation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Selected post preview */}
      <div className="card mb-6 flex gap-4 items-start">
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative">
          <Image
            src={media.thumbnailUrl || media.mediaUrl || "/placeholder.svg"}
            alt="Selected post"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[var(--text-secondary)] mb-1">
            Selected {media.mediaType === "VIDEO" || media.mediaType === "REELS" ? "Reel" : "Post"}
          </p>
          <p className="text-sm truncate">
            {media.caption || "No caption"}
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-sm text-[var(--accent)] hover:underline"
        >
          Change
        </button>
      </div>

      {/* Setup form */}
      <div className="space-y-6">
        {/* Keyword input */}
        <div>
          <label className="block text-sm font-medium mb-2">
            When someone comments...
          </label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="LINK"
            className="input"
            maxLength={50}
          />
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Case insensitive. The comment must contain this exact word.
          </p>
        </div>

        {/* DM message input */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Send them this DM...
          </label>
          <textarea
            value={dmMessage}
            onChange={(e) => setDmMessage(e.target.value)}
            placeholder="Hey! Here's the link you asked for: https://example.com"
            className="input min-h-[120px] resize-none"
            maxLength={1000}
          />
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            You can include links. Max 1000 characters.
          </p>
        </div>

        {/* Reply once toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Reply only once per person</p>
            <p className="text-sm text-[var(--text-secondary)]">
              Each person gets only one DM, even if they comment multiple times
            </p>
          </div>
          <button
            onClick={() => setReplyOncePerUser(!replyOncePerUser)}
            className={`toggle ${replyOncePerUser ? "active" : ""}`}
            aria-pressed={replyOncePerUser}
          />
        </div>

        {/* Preview section */}
        {isValid && (
          <div className="animate-fade-in">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-[var(--accent)] hover:underline mb-4"
            >
              {showPreview ? "Hide preview" : "Show preview"}
            </button>

            {showPreview && (
              <div className="space-y-4 animate-fade-in">
                {/* Comment preview */}
                <div className="card">
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">
                    Comment
                  </p>
                  <div className="comment-bubble">
                    <div className="comment-avatar" />
                    <div>
                      <span className="font-semibold text-sm">someone</span>
                      <span className="text-sm ml-2">{keyword}</span>
                    </div>
                  </div>
                </div>

                {/* DM preview */}
                <div className="card">
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">
                    Auto DM
                  </p>
                  <div className="dm-bubble">
                    {dmMessage}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="animate-pulse">Activating...</span>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              Turn ON Automation
            </>
          )}
        </button>
      </div>
    </div>
  );
}

