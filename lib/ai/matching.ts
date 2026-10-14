import { createHash } from "node:crypto";

export const DEFAULT_EMBEDDING_DIM = 1024;

export function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function tokenIndex(token: string, dim: number) {
  const digest = createHash("sha256").update(token).digest();
  return digest.readUInt32BE(0) % dim;
}

export function mockEmbed(text: string, dim = DEFAULT_EMBEDDING_DIM) {
  const vector = new Array(dim).fill(0);
  const tokens = tokenize(text);
  if (tokens.length === 0) {
    vector[0] = 1;
    return vector;
  }
  for (const token of tokens) {
    vector[tokenIndex(token, Math.min(64, dim))] += 1;
  }
  return normalize(vector);
}

export function normalize(vector: number[]) {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (!magnitude) return vector;
  return vector.map((value) => value / magnitude);
}

export function cosine(a: number[] | null, b: number[] | null) {
  if (!a?.length || !b?.length) return 0;
  const length = Math.min(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < length; i += 1) sum += a[i] * b[i];
  return sum;
}

export function itemText(input: {
  title: string;
  description: string;
  attributes?: Record<string, string>;
  location?: string;
}) {
  const attributes = Object.values(input.attributes || {}).join(" ");
  return `${input.title} ${input.description} ${attributes} ${input.location || ""}`;
}

export function padEmbedding(vector: number[], dim = DEFAULT_EMBEDDING_DIM) {
  if (vector.length === dim) return vector;
  if (vector.length > dim) return vector.slice(0, dim);
  return [...vector, ...new Array(dim - vector.length).fill(0)];
}
