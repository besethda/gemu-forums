"use client";

import { useEffect, useRef, useState } from "react";

const demoSource = "/gemu/demolition-demo.mp4";

export function EngineDemo() {
  const video = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const preference = useRef<"auto" | "play" | "pause">("auto");
  const syncPlayback = useRef<(() => void) | null>(null);
  const [playing, setPlaying] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const element = video.current!;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    let inView = false;

    function sync() {
      const canAutoplay = !reducedMotion.matches && !connection?.saveData;
      const shouldPlay =
        inView &&
        !document.hidden &&
        preference.current !== "pause" &&
        (preference.current === "play" || canAutoplay);

      if (!shouldPlay) {
        element.pause();
        return;
      }

      // Assign src only here to keep video bytes out of the initial page load.
      if (!element.getAttribute("src")) {
        element.src = demoSource;
        element.load();
      }
      // A blocked autoplay attempt leaves the Play button available.
      void element.play().catch(() => {});
    }

    syncPlayback.current = sync;
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting && entry.intersectionRatio >= 0.25;
        sync();
      },
      { threshold: [0, 0.25] },
    );
    observer.observe(frame.current!);
    reducedMotion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);

    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      syncPlayback.current = null;
      element.pause();
    };
  }, []);

  function togglePlayback() {
    const element = video.current!;
    if (playing) {
      preference.current = "pause";
    } else {
      preference.current = "play";
      if (unavailable) {
        setUnavailable(false);
        element.load();
      }
    }
    syncPlayback.current?.();
  }

  return (
    <section className="engine-demo" aria-labelledby="engine-demo-title">
      <h3 id="engine-demo-title">See the engine in action</h3>
      <div className="engine-demo-frame" ref={frame}>
        <video
          ref={video}
          id="engine-demolition-video"
          width={1280}
          height={772}
          poster="/gemu/demolition-poster.webp"
          preload="none"
          muted
          playsInline
          loop
          aria-labelledby="engine-demo-title"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => {
            setPlaying(false);
            setUnavailable(true);
          }}
        />
        <button
          type="button"
          className="engine-demo-control"
          aria-controls="engine-demolition-video"
          onClick={togglePlayback}
        >
          <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
          {playing ? "Pause demo" : unavailable ? "Retry demo" : "Play demo"}
        </button>
      </div>
      {unavailable && (
        <p className="small" role="status">
          The video couldn&apos;t load. Try playing it again.
        </p>
      )}
    </section>
  );
}
