
/**
 * Storage Adapter for Local Guest Mode with TanStack Store
 * Uses Proxy pattern to transparently persist changes without monkey-patching.
 */

const getStorageKey = (collectionId: string) => `local_collection_${collectionId}`;

export function loadInternal<T>(collectionId: string): T[] {
  try {
    const raw = localStorage.getItem(getStorageKey(collectionId));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn(`[StorageAdapter] Failed to load ${collectionId}`, e);
    return [];
  }
}

export function saveInternal<T>(collectionId: string, data: T[]) {
  try {
    localStorage.setItem(getStorageKey(collectionId), JSON.stringify(data));
  } catch (e) {
    console.error(`[StorageAdapter] Failed to save ${collectionId}`, e);
  }
}

/**
 * Creates a Proxy around a Collection that intercepts write operations
 * and persists the state to localStorage.
 */
export function createPersistentCollection(
  originalCollection: any,
  collectionId: string
) {
  // 1. Initial Hydration (Load from disk into memory)
  const initialData = loadInternal(collectionId);
  if (initialData.length > 0) {
    // Use internal upsert if available, or just ignore if already handled by sync
    // We safely cast because we know TanStack collections have upsert
    try {
      originalCollection.upsert(initialData);
    } catch (e) {
      console.warn("[StorageAdapter] Hydration failed or unavailable", e);
    }
  }

  // 2. Create Proxy
  return new Proxy(originalCollection, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);

      // We only care about function calls
      if (typeof value === 'function') {

        // Intercept 'insert'
        if (prop === 'insert') {
          return function (this: any, ...args: any[]) {
            // A. Call original
            const result = value.apply(this, args);

            // B. Persist
            // We reload state from "source of truth" if possible, or just append
            // Ideally: const newData = target.all ? target.all() : [...initial, arg]
            // But for now, we follow the "Append to Loaded" pattern for safety
            const current = loadInternal(collectionId);
            current.push(args[0]); // args[0] is the data
            saveInternal(collectionId, current);

            return result;
          }
        }

        // Intercept 'update'
        if (prop === 'update') {
          return function (this: any, ...args: any[]) {
            // A. Call original
            const result = value.apply(this, args);

            // B. Persist
            const { where, data } = args[0];
            if (where?.id && data) {
              const current = loadInternal<any>(collectionId);
              const index = current.findIndex(item => item.id === where.id);
              if (index !== -1) {
                current[index] = { ...current[index], ...data };
                saveInternal(collectionId, current);
              }
            }
            return result;
          }
        }
      }

      return value;
    }
  });
}
