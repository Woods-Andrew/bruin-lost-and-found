export type Role = "student" | "staff";
export type ItemKind = "lost" | "found";
export type ItemStatus = "draft" | "published" | "claimed" | "resolved" | "removed";
export type ClaimStatus = "pending" | "approved" | "rejected" | "picked_up";
export type AiSource = "mock" | "qwen";

export type ItemAttributes = {
  category: string;
  color: string;
  brand: string;
  material: string;
  distinctiveMarks: string;
};

export type Profile = {
  id: string;
  email: string;
  name: string;
  role: Role;
  emailVerified: boolean;
};

export type Item = {
  id: string;
  kind: ItemKind;
  status: ItemStatus;
  title: string;
  description: string;
  attributes: ItemAttributes;
  location: string;
  photoUrl: string;
  reporterId: string;
  embedding: number[] | null;
  aiSource: AiSource;
  createdAt: string;
  updatedAt: string;
};

export type Claim = {
  id: string;
  itemId: string;
  claimantId: string;
  proof: string;
  identifyingDetails: string;
  pickupPreference: string;
  status: ClaimStatus;
  staffNote: string;
  createdAt: string;
  updatedAt: string;
};

export type Alert = {
  id: string;
  userId: string;
  itemId: string | null;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type SavedQuery = {
  id: string;
  userId: string;
  query: string;
  embedding: number[];
  createdAt: string;
};

export type AiCacheEntry = {
  key: string;
  kind: string;
  payload: unknown;
  createdAt: string;
};

export type VisionResult = {
  title: string;
  description: string;
  attributes: ItemAttributes;
  source: AiSource;
  note: string;
};

export type SearchHit = {
  item: Item;
  score: number;
  stage: "embedding" | "rerank";
};

export type SearchResponse = {
  hits: SearchHit[];
  embeddingSource: AiSource;
  rerankSource: AiSource | "skipped";
  note: string;
};
