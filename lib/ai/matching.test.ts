import assert from "node:assert/strict";
import test from "node:test";
import { cosine, mockEmbed } from "./matching.ts";

test("mock embeddings rank a backpack query above unrelated clothing", () => {
  const query = mockEmbed("navy north face backpack with a gold UCLA keychain");
  const backpack = mockEmbed(
    "Navy North Face backpack gold UCLA keychain Powell Library bag nylon",
  );
  const hoodie = mockEmbed("maroon champion hoodie bleach spot clothing cotton Royce");
  assert.ok(cosine(query, backpack) > cosine(query, hoodie));
});

test("mock embeddings are deterministic", () => {
  assert.deepEqual(mockEmbed("gold hydro flask"), mockEmbed("gold hydro flask"));
});
