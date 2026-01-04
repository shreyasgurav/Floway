"use client";

import { useState } from "react";
import { Automation } from "@/types";
import Image from "next/image";

interface AutomationStatusProps {
  automation: Automation;
  onUpdate: (automation: Automation) => void;
  onDelete: (automationId: string) => void;
  onCreateNew: () => void;
}

export default function AutomationStatus({
  automation,
  onUpdate,
  onDelete,
  onCreateNew,
}: AutomationStatusProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/automations/${automation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !automation.isActive }),
      });

      const data = await response.json();
      if (response.ok) {
        onUpdate(data.automation);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/automations/${automation.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onDelete(automation.id);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Status header */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`status-dot ${automation.isActive ? "active" : "paused"}`} />
            <span className="font-medium">
              {automation.isActive ? "Active" : "Paused"}
            </span>
          </div>
          <button
            onClick={handleToggle}
            disabled={loading}
            className={`toggle ${automation.isActive ? "active" : ""}`}
            aria-pressed={automation.isActive}
          />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 pt-4 border-t border-[var(--border-color)]">
          <div>
            <p className="text-2xl font-semibold">{automation.dmsSent}</p>
            <p className="text-sm text-[var(--text-secondary)]">DMs sent</p>
          </div>
        </div>
      </div>

      {/* Automation details */}
      <div className="card mb-6">
        <div className="flex gap-4 items-start mb-6">
          {automation.mediaThumbnail && (
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative">
              <Image
                src={automation.mediaThumbnail}
                alt="Post thumbnail"
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[var(--text-secondary)] mb-1">Post</p>
            <p className="text-sm truncate">
              {automation.mediaCaption || "No caption"}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Keyword
            </p>
            <div className="inline-block px-3 py-1.5 bg-[var(--bg-tertiary)] rounded-lg font-mono text-sm">
              {automation.keyword}
            </div>
          </div>

          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">
              DM Message
            </p>
            <div className="dm-bubble">
              {automation.dmMessage}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {automation.replyOncePerUser ? (
                <path d="M20 6L9 17l-5-5" />
              ) : (
                <path d="M18 6L6 18M6 6l12 12" />
              )}
            </svg>
            {automation.replyOncePerUser
              ? "Reply once per person"
              : "Reply to every matching comment"}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={onCreateNew}
          className="btn-secondary w-full"
        >
          Create New Automation
        </button>

        {showConfirmDelete ? (
          <div className="card border-red-500/30 bg-red-500/5">
            <p className="text-sm mb-4">
              Are you sure? This will stop the automation permanently.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                {loading ? "Deleting..." : "Yes, delete"}
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="w-full py-3 text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Delete automation
          </button>
        )}
      </div>
    </div>
  );
}

