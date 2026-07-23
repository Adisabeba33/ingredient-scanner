/**
 * Offline-first pending queue (IndexedDB).
 *
 * Store aisles have poor wifi, so nothing depends on the network at capture
 * time: a finished product is written straight to IndexedDB and stays there
 * until "Process all" runs on good wifi. Photos live ONLY here — once their
 * text is extracted the product is deleted, so the phone never accumulates
 * images and the final catalog is text-only (spec §5, §6).
 *
 * Everything is stored as plain data URLs (JPEG) + string barcodes, so a
 * product is a small self-contained record that survives a page reload or the
 * browser being closed mid-pass.
 */

export type CaptureMode = "pet" | "human" | "cosmetics";

export interface PendingProduct {
  id: string;
  /** All pack-size codes for ONE recipe. One verified row is written per code. */
  barcodes: string[];
  mode: CaptureMode;
  /** JPEG data URLs. Ingredients is the one that matters; the rest are optional. */
  photos: {
    brand?: string;
    ingredients?: string;
    nutrition?: string;
  };
  createdAt: number;
}

const DB_NAME = "catalog-scanner";
const DB_VERSION = 1;
const STORE = "pending";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("Failed to open IndexedDB."));
  });
}

function tx(
  db: IDBDatabase,
  mode: IDBTransactionMode
): IDBObjectStore {
  return db.transaction(STORE, mode).objectStore(STORE);
}

/** A stable-ish id without Date.now/Math.random dependencies at call sites. */
function makeId(): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${performance.now()}-${Math.floor(performance.now() * 1000) % 100000}`;
  return rand;
}

export async function addProduct(
  product: Omit<PendingProduct, "id" | "createdAt">
): Promise<PendingProduct> {
  const db = await openDb();
  const record: PendingProduct = {
    ...product,
    id: makeId(),
    createdAt: Date.now(),
  };
  await new Promise<void>((resolve, reject) => {
    const store = tx(db, "readwrite");
    const req = store.add(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error ?? new Error("Failed to queue product."));
  });
  db.close();
  return record;
}

export async function listProducts(): Promise<PendingProduct[]> {
  const db = await openDb();
  const items = await new Promise<PendingProduct[]>((resolve, reject) => {
    const store = tx(db, "readonly");
    const req = store.getAll();
    req.onsuccess = () => resolve((req.result as PendingProduct[]) ?? []);
    req.onerror = () => reject(req.error ?? new Error("Failed to read queue."));
  });
  db.close();
  return items.sort((a, b) => a.createdAt - b.createdAt);
}

export async function countProducts(): Promise<number> {
  const db = await openDb();
  const n = await new Promise<number>((resolve, reject) => {
    const store = tx(db, "readonly");
    const req = store.count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("Failed to count queue."));
  });
  db.close();
  return n;
}

export async function deleteProduct(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const store = tx(db, "readwrite");
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error ?? new Error("Failed to delete product."));
  });
  db.close();
}
