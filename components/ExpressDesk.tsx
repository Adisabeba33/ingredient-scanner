"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Loader2, Zap, Check, ChevronDown } from "lucide-react";
import { expressTitle, groupCaptures, type ExpressRow } from "@/lib/express";
import { isPetSpecies, type PetSpecies } from "@/lib/pet-species";
import { isFoodForm, type FoodForm } from "@/lib/food-form";

/**
 * The other half of Express Mode: the desk.
 *
 * A shop trip leaves a row that knows who a product is and nothing about what
 * is in it. This is where the second half gets typed — with the photograph of
 * the front sitting beside the box you type into, because that is the whole
 * reason the photograph was taken.
 *
 * Saving does not "mark it done". The row MOVES: it is written into the catalog
 * as an ordinary verified product and deleted from the worklist. A list whose
 * finished rows stay on it stops being a list.
 */

type Row = ExpressRow & { photoUrl: string | null };

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

export function ExpressDesk({ adminToken }: { adminToken: string }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setNote(null);
    try {
      const res = await fetch("/api/express", {
        headers: { "x-admin-token": adminToken },
      });
      const data = (await res.json().catch(() => ({}))) as {
        rows?: Row[];
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        setNote(data.message ?? data.error ?? "Couldn't load the worklist.");
        setRows([]);
        return;
      }
      setRows(data.rows ?? []);
    } catch {
      setNote("Couldn't load the worklist — check your connection.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  const finished = useCallback((codes: string[], name: string | null) => {
    setRows((r) => (r ? r.filter((x) => !codes.includes(x.code)) : r));
    setEditing(null);
    setNote(
      `${name ?? codes[0]} is in the catalog` +
        (codes.length > 1 ? `, under all ${codes.length} codes.` : ".")
    );
  }, []);

  return (
    <section className="card flex flex-col gap-3 p-4">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center justify-between gap-3"
      >
        <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-ink">
          <Zap size={16} strokeWidth={2} aria-hidden="true" />
          Express worklist
        </span>
        <span className="inline-flex items-center gap-2 text-[12px] text-muted">
          {rows === null ? "Open" : `${rows.length} waiting`}
          <ChevronDown
            size={16}
            strokeWidth={1.8}
            aria-hidden="true"
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {open && (
        <>
          {note && <p className="text-[12px] leading-snug text-muted">{note}</p>}
          {loading && (
            <p className="inline-flex items-center gap-2 text-[12px] text-muted">
              <Loader2 size={13} className="animate-spin" aria-hidden="true" />
              Loading…
            </p>
          )}
          {rows !== null && rows.length === 0 && !loading && (
            <p className="text-[12.5px] leading-relaxed text-muted">
              Nothing waiting. Products captured in Express Mode land here once
              you&apos;ve processed the queue.
            </p>
          )}
          {/* Grouped: the pack sizes of one product are one job, not three. */}
          {rows &&
            groupCaptures(rows).map((group) => (
              <ExpressCard
                key={group[0].code}
                row={group[0]}
                siblings={group.slice(1)}
                adminToken={adminToken}
                editing={editing === group[0].code}
                onEdit={() =>
                  setEditing(editing === group[0].code ? null : group[0].code)
                }
                onFinished={finished}
              />
            ))}
        </>
      )}
    </section>
  );
}

function ExpressCard({
  row,
  siblings,
  adminToken,
  editing,
  onEdit,
  onFinished,
}: {
  row: Row;
  /** The other pack sizes captured with it. */
  siblings: Row[];
  adminToken: string;
  editing: boolean;
  onEdit: () => void;
  onFinished: (codes: string[], name: string | null) => void;
}) {
  // Memoised so it doesn't hand `save` a new array on every keystroke.
  const codes = useMemo(
    () => [row.code, ...siblings.map((s) => s.code)],
    [row.code, siblings]
  );
  const [ingredients, setIngredients] = useState("");
  const [brands, setBrands] = useState(row.brands ?? "");
  const [productName, setProductName] = useState(row.productName ?? "");
  // Seeded from the front of the pack. The shop trip already answered these;
  // making somebody answer them again would waste the reading.
  const [species, setSpecies] = useState<PetSpecies>(
    isPetSpecies(row.species) ? row.species : "unknown"
  );
  const [form, setForm] = useState<FoodForm>(
    isFoodForm(row.foodForm) ? row.foodForm : "unknown"
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPet = row.mode === "pet";

  const save = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/express/finish", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({
          codes,
          ingredientsText: ingredients,
          brands,
          productName,
          mode: row.mode,
          species: isPet ? species : undefined,
          foodForm: isPet ? form : undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        productName?: string | null;
        message?: string;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.message ?? data.error ?? "Couldn't save.");
        return;
      }
      onFinished(codes, data.productName ?? null);
    } catch {
      setError("Couldn't save — check your connection.");
    } finally {
      setSaving(false);
    }
  }, [
    saving,
    adminToken,
    codes,
    row.mode,
    ingredients,
    brands,
    productName,
    isPet,
    species,
    form,
    onFinished,
  ]);

  return (
    <div className="flex flex-col gap-2 rounded-input bg-surfaceSoft p-3">
      <button onClick={onEdit} className="flex items-start gap-3 text-left">
        {row.photoUrl ? (
          // The point of the whole exercise: the pack, in front of you, while
          // you type what is printed on its back.
          <Image
            src={row.photoUrl}
            alt=""
            width={64}
            height={64}
            unoptimized
            className="h-16 w-16 shrink-0 rounded object-cover"
          />
        ) : (
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded bg-surface text-[10px] text-faint">
            no photo
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold leading-snug text-ink">
            {expressTitle(row)}
          </span>
          <span className="mt-0.5 block font-mono text-[11px] text-muted">
            {row.code}
            {row.netWeight ? ` · ${row.netWeight}` : ""}
            {row.container ? ` · ${row.container}` : ""}
          </span>
          {/* The other pack sizes. Said plainly, because one composition is
              about to be written under all of them. */}
          {siblings.length > 0 && (
            <span className="mt-0.5 block text-[11px] leading-snug text-muted">
              + {siblings.length} more pack{siblings.length === 1 ? "" : "s"}:{" "}
              <span className="font-mono">
                {siblings.map((s) => s.code).join(", ")}
              </span>
            </span>
          )}
          {/* What the front gave us. Shown rather than hidden in the database:
              the photograph is right there, and a wrong reading is only
              catchable if it is visible. */}
          {(row.lifeStage ||
            row.proteins?.length ||
            row.texture ||
            row.multipackCount) && (
            <span className="mt-1 flex flex-wrap gap-1">
              {row.multipackCount && <Tag>{row.multipackCount}-pack</Tag>}
              {row.texture && <Tag>{row.texture}</Tag>}
              {row.lifeStage && <Tag>{row.lifeStage}</Tag>}
              {row.proteins?.map((p) => (
                <Tag key={p}>{p}</Tag>
              ))}
            </span>
          )}
          {row.frontClaims && row.frontClaims.length > 0 && (
            <span className="mt-1 block text-[11px] leading-snug text-faint">
              Claims: {row.frontClaims.join(" · ")}
            </span>
          )}
          {row.readError && (
            <span className="mt-1 block text-[11px] leading-snug text-amber">
              {row.readError}
            </span>
          )}
        </span>
      </button>

      {editing && (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              value={brands}
              onChange={(e) => setBrands(e.target.value)}
              placeholder="Brand"
              aria-label="Brand"
              className="h-10 w-full rounded-input border border-lineStrong bg-surface px-3 text-[13px] text-ink outline-none focus:border-sage-400"
            />
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Product name"
              aria-label="Product name"
              className="h-10 w-full rounded-input border border-lineStrong bg-surface px-3 text-[13px] text-ink outline-none focus:border-sage-400"
            />
          </div>

          {isPet && (
            <>
              <div className="flex gap-1.5">
                {SPECIES_CHOICES.map((c) => (
                  <Choice
                    key={c.value}
                    label={c.label}
                    active={species === c.value}
                    onClick={() => setSpecies(c.value)}
                  />
                ))}
              </div>
              <div className="flex gap-1.5">
                {FORM_CHOICES.map((c) => (
                  <Choice
                    key={c.value}
                    label={c.label}
                    active={form === c.value}
                    onClick={() => setForm(c.value)}
                  />
                ))}
              </div>
            </>
          )}

          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            rows={6}
            placeholder="Type the ingredient list exactly as printed on the pack"
            aria-label="Ingredients"
            className="w-full rounded-input border border-lineStrong bg-surface px-3 py-2 text-[12px] leading-snug text-ink outline-none focus:border-sage-400"
          />
          {error && <p className="text-[12px] text-amber">{error}</p>}
          <button
            onClick={save}
            disabled={saving || !ingredients.trim()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-input bg-sage-500 text-[14px] font-semibold text-white transition active:scale-[0.99] disabled:opacity-40"
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" aria-hidden="true" />
            ) : (
              <>
                <Check size={15} strokeWidth={2} aria-hidden="true" />
                Add to catalog
              </>
            )}
          </button>
          <p className="text-[11px] leading-snug text-faint">
            Saving writes {codes.length === 1 ? "a verified catalog row" : `${codes.length} verified catalog rows`} — one per
            barcode, photo included — and takes {codes.length === 1 ? "it" : "them"} off this list.
          </p>
        </div>
      )}
    </div>
  );
}

/** A small fact read off the front. */
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-muted">
      {children}
    </span>
  );
}

function Choice({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`h-9 flex-1 rounded-input border text-[12px] font-medium transition active:scale-[0.98] ${
        active
          ? "border-ink bg-ink text-white"
          : "border-lineStrong bg-surface text-ink"
      }`}
    >
      {label}
    </button>
  );
}
