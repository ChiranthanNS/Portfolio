"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function ScreenshotGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (images.length === 0) return null;

  function prev() {
    setLightbox((i) => (i !== null ? (i - 1 + images.length) % images.length : 0));
  }
  function next() {
    setLightbox((i) => (i !== null ? (i + 1) % images.length : 0));
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((src, idx) => (
          <button
            key={src}
            onClick={() => setLightbox(idx)}
            className="group bg-surface-2 relative aspect-video overflow-hidden rounded-xl border border-transparent transition hover:border-primary/30"
            aria-label={`View screenshot ${idx + 1}`}
          >
            <Image
              src={src}
              alt={`${title} screenshot ${idx + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover transition-transform group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-5xl w-full px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightbox]!}
              alt={`${title} screenshot ${lightbox + 1}`}
              width={1200}
              height={675}
              className="rounded-2xl object-contain"
            />
            <button
              onClick={() => setLightbox(null)}
              className="absolute right-6 top-2 text-white/70 hover:text-white"
              aria-label="Close"
            >
              <X className="size-6" />
            </button>
            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                  aria-label="Previous"
                >
                  <ChevronLeft className="size-8" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                  aria-label="Next"
                >
                  <ChevronRight className="size-8" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
