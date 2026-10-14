import type {
  AiCacheEntry,
  Alert,
  Claim,
  ClaimStatus,
  Item,
  ItemStatus,
  Profile,
  SavedQuery,
} from "@/lib/types";

export type NewItem = Omit<Item, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
};

export type NewClaim = {
  itemId: string;
  claimantId: string;
  proof: string;
  identifyingDetails: string;
  pickupPreference: string;
};

export interface AppStore {
  getProfile(id: string): Promise<Profile | null>;
  getProfileByEmail(email: string): Promise<Profile | null>;
  upsertProfile(profile: Profile): Promise<Profile>;
  listItems(): Promise<Item[]>;
  getItem(id: string): Promise<Item | null>;
  createItem(item: NewItem): Promise<Item>;
  updateItem(id: string, patch: Partial<Item>): Promise<Item>;
  listClaims(): Promise<Claim[]>;
  getClaim(id: string): Promise<Claim | null>;
  createClaim(claim: NewClaim): Promise<Claim>;
  updateClaim(
    id: string,
    patch: { status?: ClaimStatus; staffNote?: string },
  ): Promise<Claim>;
  listAlerts(userId: string): Promise<Alert[]>;
  createAlert(input: {
    userId: string;
    itemId: string | null;
    title: string;
    body: string;
  }): Promise<Alert>;
  markAlertRead(id: string, userId: string): Promise<void>;
  saveQuery(input: {
    userId: string;
    query: string;
    embedding: number[];
  }): Promise<SavedQuery>;
  listSavedQueries(): Promise<SavedQuery[]>;
  getAiCache(key: string): Promise<AiCacheEntry | null>;
  setAiCache(entry: AiCacheEntry): Promise<void>;
}

export type ItemStatusPatch = ItemStatus;
