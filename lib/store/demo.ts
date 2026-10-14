import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { demoItems, demoProfiles } from "@/lib/demo/seed";
import type {
  AiCacheEntry,
  Alert,
  Claim,
  Item,
  Profile,
  SavedQuery,
} from "@/lib/types";
import type { AppStore, NewClaim, NewItem } from "@/lib/store/types";

type DemoState = {
  profiles: Profile[];
  items: Item[];
  claims: Claim[];
  alerts: Alert[];
  savedQueries: SavedQuery[];
  aiCache: AiCacheEntry[];
};

const dataDir = path.join(process.cwd(), ".data");
const storePath = path.join(dataDir, "store.json");

function emptyState(): DemoState {
  return {
    profiles: structuredClone(demoProfiles),
    items: structuredClone(demoItems),
    claims: [],
    alerts: [],
    savedQueries: [],
    aiCache: [],
  };
}

const globalStore = globalThis as typeof globalThis & {
  __blfStore?: DemoState;
  __blfQueue?: Promise<unknown>;
};

async function loadState(): Promise<DemoState> {
  if (globalStore.__blfStore) return globalStore.__blfStore;
  try {
    const raw = await readFile(storePath, "utf8");
    globalStore.__blfStore = JSON.parse(raw) as DemoState;
  } catch {
    globalStore.__blfStore = emptyState();
    await persist(globalStore.__blfStore);
  }
  return globalStore.__blfStore;
}

async function persist(state: DemoState) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(storePath, JSON.stringify(state, null, 2));
}

async function mutate<T>(fn: (state: DemoState) => T | Promise<T>) {
  globalStore.__blfQueue = (globalStore.__blfQueue ?? Promise.resolve()).then(
    async () => {
      const state = await loadState();
      const result = await fn(state);
      await persist(state);
      return result;
    },
  );
  return globalStore.__blfQueue as Promise<T>;
}

function now() {
  return new Date().toISOString();
}

export const demoStore: AppStore = {
  async getProfile(id) {
    const state = await loadState();
    return state.profiles.find((profile) => profile.id === id) || null;
  },
  async getProfileByEmail(email) {
    const state = await loadState();
    return (
      state.profiles.find(
        (profile) => profile.email.toLowerCase() === email.toLowerCase(),
      ) || null
    );
  },
  async upsertProfile(profile) {
    return mutate((state) => {
      const index = state.profiles.findIndex((row) => row.id === profile.id);
      if (index >= 0) state.profiles[index] = profile;
      else state.profiles.push(profile);
      return profile;
    });
  },
  async listItems() {
    const state = await loadState();
    return [...state.items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async getItem(id) {
    const state = await loadState();
    return state.items.find((item) => item.id === id) || null;
  },
  async createItem(input: NewItem) {
    return mutate((state) => {
      const item: Item = {
        ...input,
        id: input.id || randomUUID(),
        createdAt: now(),
        updatedAt: now(),
      };
      state.items.unshift(item);
      return item;
    });
  },
  async updateItem(id, patch) {
    return mutate((state) => {
      const item = state.items.find((row) => row.id === id);
      if (!item) throw new Error("Item not found");
      Object.assign(item, patch, { updatedAt: now() });
      return item;
    });
  },
  async listClaims() {
    const state = await loadState();
    return [...state.claims].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async getClaim(id) {
    const state = await loadState();
    return state.claims.find((claim) => claim.id === id) || null;
  },
  async createClaim(input: NewClaim) {
    return mutate((state) => {
      const claim: Claim = {
        ...input,
        id: randomUUID(),
        status: "pending",
        staffNote: "",
        createdAt: now(),
        updatedAt: now(),
      };
      state.claims.unshift(claim);
      return claim;
    });
  },
  async updateClaim(id, patch) {
    return mutate((state) => {
      const claim = state.claims.find((row) => row.id === id);
      if (!claim) throw new Error("Claim not found");
      Object.assign(claim, patch, { updatedAt: now() });
      return claim;
    });
  },
  async listAlerts(userId) {
    const state = await loadState();
    return state.alerts
      .filter((alert) => alert.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async createAlert(input) {
    return mutate((state) => {
      const duplicate = state.alerts.find(
        (alert) =>
          alert.userId === input.userId &&
          alert.itemId === input.itemId &&
          alert.title === input.title,
      );
      if (duplicate) return duplicate;
      const alert: Alert = {
        ...input,
        id: randomUUID(),
        read: false,
        createdAt: now(),
      };
      state.alerts.unshift(alert);
      return alert;
    });
  },
  async markAlertRead(id, userId) {
    await mutate((state) => {
      const alert = state.alerts.find((row) => row.id === id && row.userId === userId);
      if (alert) alert.read = true;
    });
  },
  async saveQuery(input) {
    return mutate((state) => {
      const existing = state.savedQueries.find(
        (row) => row.userId === input.userId && row.query === input.query,
      );
      if (existing) return existing;
      const saved: SavedQuery = {
        ...input,
        id: randomUUID(),
        createdAt: now(),
      };
      state.savedQueries.push(saved);
      return saved;
    });
  },
  async listSavedQueries() {
    const state = await loadState();
    return state.savedQueries;
  },
  async getAiCache(key) {
    const state = await loadState();
    return state.aiCache.find((entry) => entry.key === key) || null;
  },
  async setAiCache(entry) {
    await mutate((state) => {
      const index = state.aiCache.findIndex((row) => row.key === entry.key);
      if (index >= 0) state.aiCache[index] = entry;
      else state.aiCache.push(entry);
    });
  },
};
