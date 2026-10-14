"use client";

import { useState, useTransition } from "react";
import { rateAsset } from "@/app/assets/[assetId]/actions";

const MESSAGES = {
  "already-rated": "You've already rated this asset.",
  invalid: "That rating couldn't be saved.",
  failed: "Your rating couldn't be saved. Try again.",
} as const;

/** Five star buttons for an anonymous 1–5 rating. */
export function StarRating({
  assetId,
  onRated,
}: {
  assetId: string;
  onRated: (ratingCount: number, ratingAverage: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const [given, setGiven] = useState(0);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const locked = given > 0 || pending;

  function rate(stars: number) {
    startTransition(async () => {
      const result = await rateAsset(assetId, stars);
      if (result.ok) {
        setGiven(stars);
        setMessage(
          `Thanks, you rated this ${stars} ${stars === 1 ? "star" : "stars"}.`,
        );
        onRated(result.ratingCount, result.ratingAverage);
      } else {
        if (result.reason === "already-rated") setGiven(-1);
        setMessage(MESSAGES[result.reason]);
      }
    });
  }

  const shown = hover || Math.max(given, 0);
  return (
    <div className="star-rating">
      <fieldset disabled={locked} onMouseLeave={() => setHover(0)}>
        <legend>Rate this asset</legend>
        <div className="star-rating-buttons">
          {[1, 2, 3, 4, 5].map((stars) => (
            <button
              key={stars}
              type="button"
              aria-label={`${stars} ${stars === 1 ? "star" : "stars"}`}
              aria-pressed={given === stars}
              className={stars <= shown ? "is-on" : undefined}
              onMouseEnter={() => setHover(stars)}
              onFocus={() => setHover(stars)}
              onBlur={() => setHover(0)}
              onClick={() => rate(stars)}
            >
              <span aria-hidden="true">{stars <= shown ? "★" : "☆"}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <p className="small" aria-live="polite">
        {pending ? "Saving your rating…" : message || "No account needed. One rating per asset."}
      </p>
    </div>
  );
}
