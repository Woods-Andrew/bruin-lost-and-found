import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { config } from "@/lib/config";
import type {
  AiCacheEntry,
  Alert,
  Claim,
  Item,
  ItemAttributes,
  Profile,
  SavedQuery,
} from "@/lib/types";
import type { AppStore, NewClaim, NewItem } from "@/lib/store/types";

type ItemRow = {
  id: string;
  kind: Item["kind"];
  status: Item["status"];
  title: string;
  description: string;
  attributes: ItemAttributes;
  location: string;
  photo_url: string;
  reporter_id: string;
  embedding: number[] | null;
  ai_source: Item["aiSource"];
  created_at: string;
  updated_at: string;
};

function client(): SupabaseClient {
  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function mapProfile(row: {
  id: string;
  email: string;
  name: string;
  role: Profile["role"];
  email_verified: boolean;
}): Profile {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    emailVerified: row.email_verified,
  };
}

function mapItem(row: ItemRow): Item {
  return {
    id: row.id,
    kind: row.kind,
    status: row.status,
    title: row.title,
    description: row.description,
    attributes: row.attributes,
    location: row.location,
    photoUrl: row.photo_url,
    reporterId: row.reporter_id,
    embedding: row.embedding,
    aiSource: row.ai_source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapClaim(row: Record<string, string>): Claim {
  return {
    id: row.id,
    itemId: row.item_id,
    claimantId: row.claimant_id,
    proof: row.proof,
    identifyingDetails: row.identifying_details,
    pickupPreference: row.pickup_preference,
    status: row.status as Claim["status"],
    staffNote: row.staff_note || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const supabaseStore: AppStore = {
  async getProfile(id) {
    const { data } = await client().from("profiles").select("*").eq("id", id).maybeSingle();
    return data ? mapProfile(data) : null;
  },
  async getProfileByEmail(email) {
    const { data } = await client()
      .from("profiles")
      .select("*")
      .ilike("email", email)
      .maybeSingle();
    return data ? mapProfile(data) : null;
  },
  async upsertProfile(profile) {
    const { data, error } = await client()
      .from("profiles")
      .upsert({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        email_verified: profile.emailVerified,
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapProfile(data);
  },
  async listItems() {
    const { data, error } = await client()
      .from("items")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as ItemRow[]).map(mapItem);
  },
  async getItem(id) {
    const { data } = await client().from("items").select("*").eq("id", id).maybeSingle();
    return data ? mapItem(data as ItemRow) : null;
  },
  async createItem(input: NewItem) {
    const { data, error } = await client()
      .from("items")
      .insert({
        id: input.id || randomUUID(),
        kind: input.kind,
        status: input.status,
        title: input.title,
        description: input.description,
        attributes: input.attributes,
        location: input.location,
        photo_url: input.photoUrl,
        reporter_id: input.reporterId,
        embedding: input.embedding,
        ai_source: input.aiSource,
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapItem(data as ItemRow);
  },
  async updateItem(id, patch) {
    const { data, error } = await client()
      .from("items")
      .update({
        ...(patch.kind ? { kind: patch.kind } : {}),
        ...(patch.status ? { status: patch.status } : {}),
        ...(patch.title ? { title: patch.title } : {}),
        ...(patch.description ? { description: patch.description } : {}),
        ...(patch.attributes ? { attributes: patch.attributes } : {}),
        ...(patch.location ? { location: patch.location } : {}),
        ...(patch.photoUrl ? { photo_url: patch.photoUrl } : {}),
        ...(patch.embedding !== undefined ? { embedding: patch.embedding } : {}),
        ...(patch.aiSource ? { ai_source: patch.aiSource } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return mapItem(data as ItemRow);
  },
  async listClaims() {
    const { data, error } = await client()
      .from("claims")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Record<string, string>[]).map(mapClaim);
  },
  async getClaim(id) {
    const { data } = await client().from("claims").select("*").eq("id", id).maybeSingle();
    return data ? mapClaim(data as Record<string, string>) : null;
  },
  async createClaim(input: NewClaim) {
    const { data, error } = await client()
      .from("claims")
      .insert({
        item_id: input.itemId,
        claimant_id: input.claimantId,
        proof: input.proof,
        identifying_details: input.identifyingDetails,
        pickup_preference: input.pickupPreference,
        status: "pending",
        staff_note: "",
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapClaim(data as Record<string, string>);
  },
  async updateClaim(id, patch) {
    const { data, error } = await client()
      .from("claims")
      .update({
        ...(patch.status ? { status: patch.status } : {}),
        ...(patch.staffNote !== undefined ? { staff_note: patch.staffNote } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return mapClaim(data as Record<string, string>);
  },
  async listAlerts(userId) {
    const { data, error } = await client()
      .from("alerts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      itemId: row.item_id,
      title: row.title,
      body: row.body,
      read: row.read,
      createdAt: row.created_at,
    })) as Alert[];
  },
  async createAlert(input) {
    const { data, error } = await client()
      .from("alerts")
      .insert({
        user_id: input.userId,
        item_id: input.itemId,
        title: input.title,
        body: input.body,
        read: false,
      })
      .select("*")
      .single();
    if (error) throw error;
    return {
      id: data.id,
      userId: data.user_id,
      itemId: data.item_id,
      title: data.title,
      body: data.body,
      read: data.read,
      createdAt: data.created_at,
    };
  },
  async markAlertRead(id, userId) {
    await client().from("alerts").update({ read: true }).eq("id", id).eq("user_id", userId);
  },
  async saveQuery(input) {
    const { data, error } = await client()
      .from("saved_queries")
      .insert({
        user_id: input.userId,
        query: input.query,
        embedding: input.embedding,
      })
      .select("*")
      .single();
    if (error) throw error;
    return {
      id: data.id,
      userId: data.user_id,
      query: data.query,
      embedding: data.embedding,
      createdAt: data.created_at,
    };
  },
  async listSavedQueries() {
    const { data, error } = await client().from("saved_queries").select("*");
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      query: row.query,
      embedding: row.embedding,
      createdAt: row.created_at,
    })) as SavedQuery[];
  },
  async getAiCache(key) {
    const { data } = await client().from("ai_cache").select("*").eq("key", key).maybeSingle();
    return data
      ? ({
          key: data.key,
          kind: data.kind,
          payload: data.payload,
          createdAt: data.created_at,
        } as AiCacheEntry)
      : null;
  },
  async setAiCache(entry) {
    const { error } = await client().from("ai_cache").upsert({
      key: entry.key,
      kind: entry.kind,
      payload: entry.payload,
      created_at: entry.createdAt,
    });
    if (error) throw error;
  },
};
