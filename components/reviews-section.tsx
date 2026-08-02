"use client";

import * as React from "react";
import { Star, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Skeleton } from "./ui/skeleton";
import { AccordionItem } from "./accordion";
import { useLang } from "./lang-provider";

/**
 * Field limits mirrored from `app/api/reviews/route.ts` (AUTHOR_NAME_MAX /
 * TITLE_MAX / BODY_MAX / RATING_MIN / RATING_MAX) so the form never lets a
 * shopper submit something the API will reject. Keep these in sync with that
 * file if the limits ever change server-side.
 */
const AUTHOR_NAME_MAX = 80;
const TITLE_MAX = 120;
const BODY_MAX = 2000;
const RATING_MIN = 1;
const RATING_MAX = 5;

const STAR_SLOTS = [1, 2, 3, 4, 5] as const;

interface ApiReview {
  id: string;
  productHandle: string;
  authorName: string;
  rating: number;
  title: string | null;
  body: string;
  createdAt: string;
}

type RatingDistribution = Record<1 | 2 | 3 | 4 | 5, number>;

interface ReviewsAggregate {
  average: number;
  count: number;
  distribution: RatingDistribution;
}

interface ReviewsApiResponse {
  reviews: ApiReview[];
  aggregate: ReviewsAggregate;
}

const EMPTY_AGGREGATE: ReviewsAggregate = {
  average: 0,
  count: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

/** Read-only star row. Renders a muted outline row plus a solid black row
 *  clipped to `value / 5` so fractional averages (e.g. 4.3) fill partially. */
function StarRow({
  value,
  sizeClass = "h-4 w-4",
  label,
  className,
}: {
  value: number;
  sizeClass?: string;
  label: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(1, value / 5)) * 100;
  return (
    <span role="img" aria-label={label} className={cn("relative inline-flex", className)}>
      <span aria-hidden="true" className="flex gap-0.5 text-muted-foreground">
        {STAR_SLOTS.map((n) => (
          <Star key={n} className={sizeClass} />
        ))}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-0 flex gap-0.5 overflow-hidden text-foreground"
        style={{ width: `${pct}%` }}
      >
        {STAR_SLOTS.map((n) => (
          <Star key={n} className={cn(sizeClass, "fill-current")} />
        ))}
      </span>
    </span>
  );
}

/** Interactive 1-5 star picker for the write-review form. Click to select,
 *  hover/focus to preview. Plain buttons (not a native radio group) so the
 *  fill state is driven entirely by React state, no CSS sibling tricks. */
function StarPicker({
  value,
  onChange,
  label,
  starWord,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
  starWord: (n: number) => string;
}) {
  const [hover, setHover] = React.useState(0);
  const display = hover || value;
  return (
    <div role="group" aria-label={label} className="flex items-center gap-1">
      {STAR_SLOTS.map((n) => (
        <button
          key={n}
          type="button"
          aria-pressed={value === n}
          aria-label={starWord(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onFocus={() => setHover(n)}
          onBlur={() => setHover(0)}
          onClick={() => onChange(n)}
          className="p-1 text-muted-foreground transition-transform duration-150 ease-out hover:scale-110 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <Star className={cn("h-6 w-6", n <= display && "fill-current text-foreground")} />
        </button>
      ))}
    </div>
  );
}

/** One row of the 5→1 rating breakdown: star number, a solid black fill on a
 *  light track sized by that star's share of the total, and the raw count. */
function DistributionBar({
  star,
  count,
  total,
}: {
  star: 1 | 2 | 3 | 4 | 5;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-3 text-right text-xs tabular-nums text-muted-foreground">{star}</span>
      <Star aria-hidden="true" className="h-3 w-3 shrink-0 fill-current text-foreground" />
      <div aria-hidden="true" className="h-1.5 flex-1 overflow-hidden bg-secondary">
        <div
          className="h-full bg-foreground transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-7 text-right text-xs tabular-nums text-muted-foreground">{count}</span>
    </div>
  );
}

/** The "Write a Review" form. Posts to /api/reviews and never optimistically
 *  lists the new review — GET only returns approved rows, so `t.submitted`
 *  plus a cleared form is the correct, complete acknowledgment. */
function ReviewForm({ productHandle, t }: { productHandle: string; t: Dictionary["reviews"] }) {
  const { lang } = useLang();
  const uid = React.useId();

  const [rating, setRating] = React.useState(0);
  const [authorName, setAuthorName] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [hp, setHp] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const genericError =
    lang === "gr" ? "Κάτι πήγε στραβά. Δοκιμάστε ξανά." : "Something went wrong. Please try again.";
  const ratingRequiredError = lang === "gr" ? "Επιλέξτε μια βαθμολογία." : "Please select a rating.";

  const starWord = React.useCallback(
    (n: number) =>
      lang === "gr" ? `${n} ${n === 1 ? "αστέρι" : "αστέρια"}` : `${n} ${n === 1 ? "star" : "stars"}`,
    [lang]
  );

  /** Clear a stale success/error message the moment the shopper edits again. */
  function touch() {
    if (submitted) setSubmitted(false);
    if (error) setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (rating < RATING_MIN || rating > RATING_MAX) {
      setError(ratingRequiredError);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productHandle,
          authorName: authorName.trim(),
          rating,
          title: title.trim() || undefined,
          body: body.trim(),
          hp,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) throw new Error("submit failed");

      setSubmitted(true);
      setRating(0);
      setAuthorName("");
      setTitle("");
      setBody("");
      setHp("");
    } catch {
      setError(genericError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="pb-2 pr-2">
      {submitted && (
        <p role="status" className="mb-6 flex items-center gap-2 text-sm text-foreground">
          <Check className="h-4 w-4 text-accent" aria-hidden="true" />
          {t.submitted}
        </p>
      )}

      <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
        <div>
          <Label className="mb-2 block text-xs uppercase tracking-luxe text-navy">{t.ratingLabel}</Label>
          <StarPicker
            value={rating}
            onChange={(n) => {
              touch();
              setRating(n);
            }}
            label={t.ratingLabel}
            starWord={starWord}
          />
        </div>

        <div>
          <Label htmlFor={`${uid}-name`} className="mb-1.5 block text-xs uppercase tracking-luxe text-navy">
            {t.nameLabel}
          </Label>
          <Input
            id={`${uid}-name`}
            required
            maxLength={AUTHOR_NAME_MAX}
            autoComplete="name"
            aria-describedby={`${uid}-name-helper`}
            value={authorName}
            onChange={(e) => {
              touch();
              setAuthorName(e.target.value);
            }}
          />
          <p id={`${uid}-name-helper`} className="mt-1 text-xs text-muted-foreground">
            {t.nameHelper}
          </p>
        </div>

        <div>
          <Label htmlFor={`${uid}-title`} className="mb-1.5 block text-xs uppercase tracking-luxe text-navy">
            {t.titleLabel}
          </Label>
          <Input
            id={`${uid}-title`}
            maxLength={TITLE_MAX}
            value={title}
            onChange={(e) => {
              touch();
              setTitle(e.target.value);
            }}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-4">
            <Label htmlFor={`${uid}-body`} className="block text-xs uppercase tracking-luxe text-navy">
              {t.bodyLabel}
            </Label>
            <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
              {body.length}/{BODY_MAX}
            </span>
          </div>
          <textarea
            id={`${uid}-body`}
            required
            rows={5}
            maxLength={BODY_MAX}
            value={body}
            onChange={(e) => {
              touch();
              setBody(e.target.value);
            }}
            className="flex w-full border border-input bg-card px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {/* Honeypot: a real field for bots to fill in, invisible (not display:none)
            and out of the tab order for real shoppers. Never labelled. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <input
            type="text"
            name="hp"
            tabIndex={-1}
            autoComplete="off"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
          />
        </div>

        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" variant="accent" size="lg" disabled={submitting} className="w-full sm:w-auto">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {t.submit}
        </Button>
      </form>
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-8">
      <div className="flex items-center gap-10">
        <Skeleton className="h-12 w-16" />
        <div className="flex-1 space-y-2.5">
          {STAR_SLOTS.map((n) => (
            <Skeleton key={n} className="h-2.5 w-full max-w-xs" />
          ))}
        </div>
      </div>
      <Skeleton className="h-28 w-full max-w-lg" />
    </div>
  );
}

export function ReviewsSection({ productHandle }: { productHandle: string }) {
  const { lang, t: dict } = useLang();
  const t = dict.reviews;
  const headingId = React.useId();

  const [reviews, setReviews] = React.useState<ApiReview[]>([]);
  const [aggregate, setAggregate] = React.useState<ReviewsAggregate>(EMPTY_AGGREGATE);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/reviews?handle=${encodeURIComponent(productHandle)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load reviews");
        return res.json() as Promise<ReviewsApiResponse>;
      })
      .then((data) => {
        if (cancelled) return;
        setReviews(data.reviews ?? []);
        setAggregate(data.aggregate ?? EMPTY_AGGREGATE);
      })
      .catch(() => {
        if (cancelled) return;
        setReviews([]);
        setAggregate(EMPTY_AGGREGATE);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productHandle]);

  const countLabel = React.useMemo(() => {
    const template = aggregate.count === 1 ? t.count.one : t.count.other;
    return template.replace("{count}", String(aggregate.count));
  }, [aggregate.count, t.count]);

  const dateFormatter = React.useMemo(
    () =>
      new Intl.DateTimeFormat(lang === "gr" ? "el-GR" : "en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [lang]
  );

  const starsLabel = React.useCallback(
    (value: number) =>
      lang === "gr" ? `${value.toFixed(1)} από 5 αστέρια` : `${value.toFixed(1)} out of 5 stars`,
    [lang]
  );

  return (
    <section
      aria-labelledby={headingId}
      className="container mt-16 border-t border-border pt-12 lg:mt-24 lg:pt-16"
    >
      <h2 id={headingId} className="font-serif text-2xl md:text-3xl">
        {t.title}
      </h2>

      <div className="mt-8 max-w-3xl">
        {loading ? (
          <ReviewsSkeleton />
        ) : (
          <>
            {aggregate.count > 0 ? (
              <div className="grid gap-8 sm:grid-cols-[auto_1fr] sm:gap-14">
                <div className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
                  <span className="font-serif text-5xl leading-none">{aggregate.average.toFixed(1)}</span>
                  <StarRow value={aggregate.average} sizeClass="h-4 w-4" label={starsLabel(aggregate.average)} />
                  <span className="text-sm text-muted-foreground">{countLabel}</span>
                </div>
                <div className="w-full space-y-2 self-center">
                  {([5, 4, 3, 2, 1] as const).map((star) => (
                    <DistributionBar
                      key={star}
                      star={star}
                      count={aggregate.distribution[star] ?? 0}
                      total={aggregate.count}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t.emptyState}</p>
            )}

            {reviews.length > 0 && (
              <ul className="mt-12 divide-y divide-border border-t border-border">
                {reviews.map((r) => (
                  <li key={r.id} className="py-7 first:pt-6">
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
                      <StarRow value={r.rating} sizeClass="h-3.5 w-3.5" label={starsLabel(r.rating)} />
                      <time dateTime={r.createdAt} className="text-xs text-muted-foreground">
                        {dateFormatter.format(new Date(r.createdAt))}
                      </time>
                    </div>
                    {r.title && <p className="mt-3 font-serif text-lg leading-snug">{r.title}</p>}
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                    <p className="mt-3 text-xs uppercase tracking-luxe text-navy">{r.authorName}</p>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-12">
              <AccordionItem title={t.writeReview} defaultOpen={aggregate.count === 0}>
                <ReviewForm productHandle={productHandle} t={t} />
              </AccordionItem>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
