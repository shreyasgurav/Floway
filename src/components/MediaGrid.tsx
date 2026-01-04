"use client";

import { InstagramMedia } from "@/types";
import Image from "next/image";

interface MediaGridProps {
  media: InstagramMedia[];
  onSelect: (media: InstagramMedia) => void;
}

export default function MediaGrid({ media, onSelect }: MediaGridProps) {
  if (media.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-[var(--text-secondary)]">
          No posts found. Create some content on Instagram first.
        </p>
      </div>
    );
  }

  return (
    <div className="media-grid">
      {media.map((item, index) => (
        <button
          key={item.id}
          onClick={() => onSelect(item)}
          className="media-item animate-fade-in"
          style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
        >
          {/* Media thumbnail */}
          <Image
            src={item.thumbnailUrl || item.mediaUrl || "/placeholder.svg"}
            alt={item.caption || "Instagram post"}
            fill
            sizes="(max-width: 640px) 33vw, 200px"
            className="object-cover"
          />
          
          {/* Media type indicator */}
          {(item.mediaType === "VIDEO" || item.mediaType === "REELS") && (
            <div className="absolute top-2 right-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white" className="drop-shadow">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
          
          {item.mediaType === "CAROUSEL_ALBUM" && (
            <div className="absolute top-2 right-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white" className="drop-shadow">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
            </div>
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-sm font-medium">Select</span>
          </div>
        </button>
      ))}
    </div>
  );
}

