"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Search,
  Loader2,
  Trash2,
  Database,
  Pencil,
  Camera,
} from "lucide-react";
import { StoredIngredients } from "./StoredIngredients";
import {
  ConfirmDestructive,
  isUnlocked,
} from "@/components/ConfirmDestructive";
import { isPetSpecies, type PetSpecies } from "@/lib/pet-species";
import { isFoodForm, type FoodForm } from "@/lib/food-form";
import { isScanMode } from "@/lib/capture-mode";
import type { ScanMode } from "@/lib/barcode";

/**
 * See what's actually stored in the shared catalog, and remove a bad row.
 *
 * Capture is otherwise write-only: when a product reads wrong in the consumer
 * app you can't tell whether your correction landed, went to a different
 * barcode, or never ran. Showing the stored ingredient text — the real bytes,
 * fetched fresh, no HTTP cache in the way — turns that guesswork into a fact,
 * and the bin removes the row so it can be captured cleanly again.
 */

interface CatalogRow {
  code: string;
  productName: string | null;
  brands: string | null;
  mode: string | null;
  /** Which animal the pack is for. Null on rows captured before we read it. */
  species: string | null;
  /** Dry or wet. Null on rows captured before we read it. */
  foodForm: string | null;
  /** Whether two independent signals agreed on the form. */
  foodFormConfirmed: boolean | null;
  ingredientsText: string | null;
}

/**
 * The species is the one field a reader can't check by eye against the stored
 * text, and it decides the whole report — so show it on every pet row,
 * including when it's missing. An unmarked cat food gets a species-neutral
 * report, which is exactly the mixing we set out to remove.
 */
function SpeciesChip({ species }: { species: string | null }) {
  const known = isPetSpecies(species) && species !== "unknown";
  const text = known
    ? species === "cat"
      ? "Cat"
      : species === "dog"
        ? "Dog"
        : "Cat & dog"
    : "Species?";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        known ? "bg-sage-100 text-sage-600" : "bg-amber-soft text-ink"
      }`}
    >
      {text}
    </span>
  );
}

/**
 * Dry or wet. Amber when it isn't settled — either nothing said, or the pack
 * and the ingredients disagreed, and both leave the report reading the
 * ingredient order without knowing which way to read it.
 */
function FormChip({
  form,
  confirmed,
}: {
  form: string | null;
  confirmed: boolean | null;
}) {
  const known = isFoodForm(form) && form !== "unknown";
  const text = known
    ? form === "dry"
      ? "Dry"
      : form === "wet"
        ? "Wet"
        : "Semi-moist"
    : "Dry/wet?";
  // A form only one signal vouched for is shown, but marked — it's a lead, not
  // a fact, and it's the row worth a second look.
  const settled = known && confirmed !== false;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        settled ? "bg-sage-100 text-sage-600" : "bg-amber-soft text-ink"
      }`}
    >
      {text}
      {known && confirmed === false ? " ?" : ""}
    </span>
  );
}

/** What the product IS. Wrong here and everything downstream is wrong: a cereal
 *  filed as pet food gets judged against a dog's diet. */
const MODE_CHOICES: { value: ScanMode; label: string }[] = [
  { value: "pet", label: "Pet food" },
  { value: "human", label: "Human food" },
  { value: "cosmetics", label: "Cosmetics" },
];

const SPECIES_CHOICES: { value: PetSpecies; label: string }[] = [
  { value: "cat", label: "Cat" },
  { value: "dog", label: "Dog" },
  { value: "both", label: "Both" },
  { value: "unknown", label: "Not stated" },
];

const FORM_CHOICES: { value: FoodForm; label: string }[] = [
  { value: "dry", label: "Dry" },
  { value: "wet", label: "Wet" },
  { value: "semi-moist", label: "Semi" },
  { value: "unknown", label: "Not sure" },
];

const DEBOUNCE_MS = 300;

type Filter = "no-ingredients" | "no-name" | "no-report" | null;

/**
 * How many ingredients the stored text lists. Commas separate items on every
 * label, and the parenthesised vitamin/mineral blocks are counted as their
 * members — which is what you want here, since the question is only "does this
 * look like the whole list, or did glare cut it short?".
 */
function countIngredients(text: string): number {
  return text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean).length;
}

/** A tappable count — "No ingredients 2" narrows the list to exactly those. */
function FilterChip({
  label,
  count,
  active,
  warn,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  warn?: boolean;
  onClick: () => void;
}) {
  // A zero gap is good news, not something to chase — show it calm, not amber.
  const highlight = warn && count > 0;
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium transition active:scale-[0.98] ${
        active
          ? "border-ink bg-ink text-white"
          : highlight
            ? "border-amber bg-amber-soft text-ink"
            : "border-line bg-surface text-muted"
      }`}
    >
      {label}
      <span className={active ? "opacity-80" : "font-semibold"}>{count}</span>
    </button>
  );
}

export function CatalogBrowser({
  adminToken,
  onRecapture,
}: {
  adminToken: string;
  /** Start a fresh capture for a product already in the catalog, so new photos
   *  are read by the model and overwrite the stored row. */
  onRecapture: (code: string, productName: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<CatalogRow[] | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  // The gaps worth chasing, and which one the list is narrowed to.
  const [stats, setStats] = useState<{
    noIngredients: number;
    noName: number;
    noReport: number;
    truncated: boolean;
  } | null>(null);
  const [filter, setFilter] = useState<Filter>(null);
  const [busyCode, setBusyCode] = useState<string | null>(null);
  /** Why the list is empty, when it's empty because something broke. */
  const [loadError, setLoadError] = useState<string | null>(null);
  /** The database is missing the newer columns — a migration hasn't been run. */
  const [missingColumns, setMissingColumns] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const seqRef = useRef(0);

  const load = useCallback(
    async (q: string, f: Filter) => {
      setLoading(true);
      const seq = ++seqRef.current;
      try {
        const res = await fetch("/api/catalog", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-admin-token": adminToken,
          },
          body: JSON.stringify({ q, filter: f }),
        });
        if (seq !== seqRef.current) return;
        if (!res.ok) {
          // A failed request is NOT an empty catalog. Saying "nothing matches"
          // here hid a real server error behind a normal-looking result, which
          // is the most misleading thing this panel can do — the whole point of
          // it is to tell you what's really stored.
          const body = (await res.json().catch(() => ({}))) as {
            error?: string;
            message?: string;
          };
          setRows([]);
          setLoadError(
            [body.error, body.message].filter(Boolean).join(": ") ||
              `Couldn't read the catalog (${res.status}).`
          );
          return;
        }
        const data = (await res.json()) as {
          results?: CatalogRow[];
          totalCodes?: number;
          missingColumns?: boolean;
        };
        setLoadError(null);
        setMissingColumns(!!data.missingColumns);
        setRows(data.results ?? []);
        if (typeof data.totalCodes === "number") setTotal(data.totalCodes);
      } catch {
        if (seq === seqRef.current) {
          setRows([]);
          setLoadError("Couldn't reach the server — check your connection.");
        }
      } finally {
        if (seq === seqRef.current) setLoading(false);
      }
    },
    [adminToken]
  );

  // Show the catalog size straight away, without opening the panel.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/catalog", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-admin-token": adminToken,
          },
          body: JSON.stringify({ countOnly: true }),
        });
        if (!alive || !res.ok) return;
        const data = (await res.json()) as { totalCodes?: number };
        if (typeof data.totalCodes === "number") setTotal(data.totalCodes);
      } catch {
        /* offline — the counter just stays blank */
      }
    })();
    return () => {
      alive = false;
    };
  }, [adminToken]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => void load(query.trim(), filter), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [open, query, filter, load]);

  // Gap counts, refreshed whenever the panel is opened.
  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/catalog", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({ stats: true }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        noIngredients?: number;
        noName?: number;
        noReport?: number;
        truncated?: boolean;
      };
      setStats({
        noIngredients: data.noIngredients ?? 0,
        noName: data.noName ?? 0,
        noReport: data.noReport ?? 0,
        truncated: !!data.truncated,
      });
    } catch {
      /* offline — chips just don't appear */
    }
  }, [adminToken]);

  useEffect(() => {
    if (open) void loadStats();
  }, [open, loadStats]);

  // Deleting is irreversible, so it goes through a password prompt unless one
  // was entered in the last few minutes (see ConfirmDestructive).
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  // Inline editing: which row is open, the draft values, and the save awaiting
  // a password (edits go through the same gate as deletes).
  const [editing, setEditing] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftBrands, setDraftBrands] = useState("");
  const [draftText, setDraftText] = useState("");
  const [draftSpecies, setDraftSpecies] = useState<PetSpecies>("unknown");
  const [draftForm, setDraftForm] = useState<FoodForm>("unknown");
  const [draftMode, setDraftMode] = useState<ScanMode>("pet");
  const [saving, setSaving] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);

  const openEditor = useCallback((row: CatalogRow) => {
    setEditing(row.code);
    setDraftName(row.productName ?? "");
    setDraftBrands(row.brands ?? "");
    setDraftText(row.ingredientsText ?? "");
    setDraftSpecies(isPetSpecies(row.species) ? row.species : "unknown");
    setDraftForm(isFoodForm(row.foodForm) ? row.foodForm : "unknown");
    setDraftMode(isScanMode(row.mode) ? row.mode : "pet");
    setNote(null);
  }, []);

  const save = useCallback(async () => {
    if (!editing || saving) return;
    setSaving(true);
    setNote(null);
    try {
      const res = await fetch("/api/catalog/update", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({
          code: editing,
          productName: draftName,
          brands: draftBrands,
          ingredientsText: draftText,
          species: draftSpecies,
          foodForm: draftForm,
          mode: draftMode,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        setNote(data.message ?? data.error ?? "Couldn't save.");
        return;
      }
      // Reflect the saved values without a refetch.
      setRows((r) =>
        r
          ? r.map((x) =>
              x.code === editing
                ? {
                    ...x,
                    productName: draftName.trim() || null,
                    brands: draftBrands.trim() || null,
                    mode: draftMode,
                    // Mirror what the server does when a row leaves pet mode:
                    // these describe an animal's food and mean nothing on a
                    // cereal box. Showing them until the next refetch would
                    // suggest they survived, which they didn't.
                    species: draftMode === "pet" ? draftSpecies : null,
                    foodForm: draftMode === "pet" ? draftForm : null,
                    // Set by hand — the most reliable signal there is.
                    foodFormConfirmed:
                      draftMode === "pet" ? draftForm !== "unknown" : null,
                    ingredientsText: draftText.replace(/\s+/g, " ").trim(),
                  }
                : x
            )
          : r
      );
      setEditing(null);
      setNote(
        draftText.trim()
          ? "Saved. The stored report was cleared so it rebuilds from this."
          : "Saved."
      );
    } catch {
      setNote("Couldn't save — check your connection.");
    } finally {
      setSaving(false);
    }
  }, [
    editing,
    saving,
    adminToken,
    draftName,
    draftBrands,
    draftText,
    draftSpecies,
    draftForm,
    draftMode,
  ]);

  const requestSave = useCallback(() => {
    if (isUnlocked()) {
      void save();
      return;
    }
    setPendingSave(true);
  }, [save]);

  const remove = useCallback(
    async (code: string) => {
      if (busyCode) return;
      setBusyCode(code);
      setNote(null);
      try {
        const res = await fetch("/api/delete-barcode", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-admin-token": adminToken,
          },
          body: JSON.stringify({ code }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          deleted?: boolean;
        };
        if (res.ok && data.deleted) {
          setRows((r) => (r ? r.filter((x) => x.code !== code) : r));
          setTotal((t) => (t === null ? t : Math.max(0, t - 1)));
          setNote(`Deleted ${code}. Capture it again to re-add it.`);
        } else {
          setNote(`Couldn't delete ${code}.`);
        }
      } catch {
        setNote("Couldn't delete — check your connection.");
      } finally {
        setBusyCode(null);
      }
    },
    [adminToken, busyCode]
  );

  const requestRemove = useCallback(
    (code: string) => {
      // Recent password entry keeps a short window open, so cleaning up several
      // rows doesn't mean re-typing it for each one.
      if (isUnlocked()) {
        void remove(code);
        return;
      }
      setPendingDelete(code);
    },
    [remove]
  );

  return (
    <section className="card flex flex-col gap-3 p-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-2 text-left"
      >
        <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-ink">
          <Database size={16} strokeWidth={1.8} aria-hidden="true" />
          Catalog
          {total !== null && (
            <span className="rounded-full bg-sage-100 px-2 py-0.5 text-[12px] font-semibold text-sage-600">
              {total}
            </span>
          )}
        </span>
        <span className="text-[12px] font-medium text-faint">
          {open ? "Hide" : "Browse / fix"}
        </span>
      </button>

      {open && (
        <>
          <p className="-mt-1 text-[12px] leading-relaxed text-muted">
            {total !== null && (
              <>
                <span className="font-medium text-ink">
                  {total} barcode{total === 1 ? "" : "s"} seeded
                </span>{" "}
                — one recipe can hold several (6/15/30 lb).{" "}
              </>
            )}
            What&apos;s actually stored right now. Check a product here before
            assuming a fix didn&apos;t work — this reads the database directly.
          </p>

          {/* Gaps worth chasing — tap one to list exactly those products. */}
          {stats && (
            <div className="flex flex-wrap gap-2">
              <FilterChip
                label="All"
                count={total ?? 0}
                active={filter === null}
                onClick={() => setFilter(null)}
              />
              <FilterChip
                label="No ingredients"
                count={stats.noIngredients}
                warn
                active={filter === "no-ingredients"}
                onClick={() =>
                  setFilter((f) =>
                    f === "no-ingredients" ? null : "no-ingredients"
                  )
                }
              />
              <FilterChip
                label="No name"
                count={stats.noName}
                warn
                active={filter === "no-name"}
                onClick={() =>
                  setFilter((f) => (f === "no-name" ? null : "no-name"))
                }
              />
              <FilterChip
                label="No report"
                count={stats.noReport}
                warn
                active={filter === "no-report"}
                onClick={() =>
                  setFilter((f) => (f === "no-report" ? null : "no-report"))
                }
              />
            </div>
          )}
          {stats?.truncated && (
            <p className="text-[11px] text-faint">
              Counts cover the most recent 2,000 barcodes.
            </p>
          )}

          <div className="relative">
            <Search
              size={15}
              strokeWidth={1.8}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              placeholder="Brand, name, or barcode digits"
              aria-label="Search the catalog"
              className="h-11 w-full rounded-input border border-line bg-surface pl-9 pr-9 text-[14px] text-ink outline-none focus:border-sage-400"
            />
            {loading && (
              <Loader2
                size={15}
                aria-hidden="true"
                className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-faint"
              />
            )}
          </div>

          {note && (
            <p className="rounded-input bg-surfaceSoft px-3 py-2 text-[12px] text-ink">
              {note}
            </p>
          )}

          {loadError && (
            <p className="rounded-input border border-amber bg-amber-soft px-3 py-2 text-[12px] leading-snug text-ink">
              {loadError}
            </p>
          )}

          {missingColumns && (
            <p className="rounded-input border border-amber bg-amber-soft px-3 py-2 text-[12px] leading-snug text-ink">
              This database is missing the newer columns, so species and
              dry/wet aren&apos;t shown or stored. Run the pending migrations in
              Supabase — the products themselves are fine.
            </p>
          )}

          {rows !== null && rows.length === 0 && !loading && !loadError && (
            <p className="text-[12px] text-muted">
              {filter === "no-ingredients"
                ? "Every product has its ingredients. Nothing to fix."
                : filter === "no-name"
                  ? "Every product has a name."
                  : filter === "no-report"
                    ? "Every product has a report."
                    : "Nothing matches that."}
            </p>
          )}

          {rows !== null && rows.length > 0 && (
            <ul className="flex flex-col gap-2">
              {rows.map((row) => (
                <li
                  key={row.code}
                  className="flex flex-col gap-1.5 rounded-input bg-surfaceSoft p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold text-ink">
                        {row.productName || "Unnamed product"}
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px] text-muted">
                        <span className="truncate">{row.brands || "—"}</span>
                        {row.mode === "pet" && (
                          <>
                            <SpeciesChip species={row.species} />
                            <FormChip
                              form={row.foodForm}
                              confirmed={row.foodFormConfirmed}
                            />
                          </>
                        )}
                      </div>
                      <div className="font-mono text-[11px] text-faint">
                        {row.code}
                        {/* Item count is the cheap check on a glare-heavy or
                            half-read label: a kibble lists 30–40, so a stored
                            list of 8 says the read was cut short. */}
                        {row.ingredientsText && (
                          <span className="ml-2 font-sans">
                            {countIngredients(row.ingredientsText)} items
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => onRecapture(row.code, row.productName)}
                        aria-label={`Re-shoot the photos for ${row.code}`}
                        className="rounded-full p-1.5 text-sage-600 transition active:scale-95"
                      >
                        <Camera size={16} strokeWidth={1.8} aria-hidden="true" />
                      </button>
                      <button
                        onClick={() =>
                          editing === row.code ? setEditing(null) : openEditor(row)
                        }
                        aria-label={`Edit ${row.code}`}
                        className="rounded-full p-1.5 text-muted transition active:scale-95"
                      >
                        <Pencil size={16} strokeWidth={1.8} aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => requestRemove(row.code)}
                        disabled={busyCode === row.code}
                        aria-label={`Delete ${row.code} from the catalog`}
                        className="rounded-full p-1.5 text-risk-high transition active:scale-95 disabled:opacity-40"
                      >
                        {busyCode === row.code ? (
                          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                        ) : (
                          <Trash2 size={16} strokeWidth={1.8} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                  {editing === row.code ? (
                    <div className="flex flex-col gap-2">
                      <input
                        value={draftBrands}
                        onChange={(e) => setDraftBrands(e.target.value)}
                        placeholder="Brand (e.g. Weruva)"
                        aria-label="Brand"
                        className="h-10 w-full rounded-input border border-lineStrong bg-surface px-3 text-[13px] text-ink outline-none focus:border-sage-400"
                      />
                      <input
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        placeholder="Product name"
                        aria-label="Product name"
                        className="h-10 w-full rounded-input border border-lineStrong bg-surface px-3 text-[13px] text-ink outline-none focus:border-sage-400"
                      />
                      {/* What the product is. First, because everything under
                          it depends on the answer — and because this is the
                          field that used to cost a walk back to the shelf: a
                          sticky picker filed human food as pet food, and there
                          was no way to say otherwise afterwards. */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-medium text-muted">
                          This product is
                        </span>
                        <div className="flex gap-1.5">
                          {MODE_CHOICES.map((c) => (
                            <button
                              key={c.value}
                              onClick={() => setDraftMode(c.value)}
                              aria-pressed={draftMode === c.value}
                              className={`h-9 flex-1 rounded-input border text-[12px] font-medium transition active:scale-[0.98] ${
                                draftMode === c.value
                                  ? "border-ink bg-ink text-white"
                                  : "border-lineStrong bg-surface text-ink"
                              }`}
                            >
                              {c.label}
                            </button>
                          ))}
                        </div>
                        {draftMode !== "pet" && row.mode === "pet" && (
                          <span className="text-[11px] leading-snug text-amber">
                            Saving drops this row&apos;s species, dry/wet and
                            Guaranteed Analysis — they describe an animal&apos;s
                            food.
                          </span>
                        )}
                      </div>
                      {draftMode === "pet" && (
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-medium text-muted">
                            This food is for
                          </span>
                          <div className="flex gap-1.5">
                            {SPECIES_CHOICES.map((c) => (
                              <button
                                key={c.value}
                                onClick={() => setDraftSpecies(c.value)}
                                aria-pressed={draftSpecies === c.value}
                                className={`h-9 flex-1 rounded-input border text-[12px] font-medium transition active:scale-[0.98] ${
                                  draftSpecies === c.value
                                    ? "border-ink bg-ink text-white"
                                    : "border-lineStrong bg-surface text-ink"
                                }`}
                              >
                                {c.label}
                              </button>
                            ))}
                          </div>
                          <span className="text-[11px] leading-snug text-faint">
                            Decides who the app writes the report for — a cat
                            food is never judged against a dog&apos;s diet.
                          </span>
                          <span className="mt-1 text-[11px] font-medium text-muted">
                            And it&apos;s
                          </span>
                          <div className="flex gap-1.5">
                            {FORM_CHOICES.map((c) => (
                              <button
                                key={c.value}
                                onClick={() => setDraftForm(c.value)}
                                aria-pressed={draftForm === c.value}
                                className={`h-9 flex-1 rounded-input border text-[12px] font-medium transition active:scale-[0.98] ${
                                  draftForm === c.value
                                    ? "border-ink bg-ink text-white"
                                    : "border-lineStrong bg-surface text-ink"
                                }`}
                              >
                                {c.label}
                              </button>
                            ))}
                          </div>
                          <span className="text-[11px] leading-snug text-faint">
                            Wet food is listed by weight with its water, so
                            broth near the top is normal. In a bag it
                            isn&apos;t — same list, opposite reading.
                          </span>
                        </div>
                      )}
                      <textarea
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                        rows={6}
                        placeholder="Paste the ingredient list exactly as printed on the label"
                        aria-label="Ingredients"
                        className="w-full rounded-input border border-lineStrong bg-surface px-3 py-2 text-[12px] leading-snug text-ink outline-none focus:border-sage-400"
                      />
                      <p className="text-[11px] leading-snug text-faint">
                        Type it as printed — don&apos;t translate or tidy it up.
                        This is what the app reads as the real composition.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditing(null)}
                          className="h-10 flex-1 rounded-input border border-lineStrong bg-surface text-[13px] font-medium text-ink transition active:scale-[0.98]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={requestSave}
                          disabled={saving}
                          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-input bg-sage-500 text-[13px] font-semibold text-white transition active:scale-[0.98] disabled:opacity-40"
                        >
                          {saving ? (
                            <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                          ) : (
                            "Save"
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Was a 96-pixel box with an inner scrollbar: six lines of
                    // a twenty-line composition, and a thumb cannot reliably
                    // catch a small scroller inside a scrolling list, so it
                    // read as cut off with no way down. It now folds and opens,
                    // and the page does the scrolling.
                    <StoredIngredients
                      text={row.ingredientsText}
                      emptyNote="No ingredients stored — tap the pencil to paste them, or re-capture."
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {pendingSave && (
        <ConfirmDestructive
          title="Save this change?"
          body="This replaces what the app shows for this product, and clears its stored report so the analysis rebuilds from the new text."
          confirmLabel="Save"
          tone="normal"
          onConfirm={() => {
            setPendingSave(false);
            void save();
          }}
          onCancel={() => setPendingSave(false)}
        />
      )}

      {pendingDelete && (
        <ConfirmDestructive
          title="Delete from the catalog?"
          body={`${pendingDelete} will be removed from the shared catalog, along with its cached report. This can't be undone — the product has to be captured again.`}
          confirmLabel="Delete"
          onConfirm={() => {
            const code = pendingDelete;
            setPendingDelete(null);
            void remove(code);
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </section>
  );
}
