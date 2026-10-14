import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getStore } from "@/lib/store";
import { AdminBoard } from "@/app/admin/admin-board";

export default async function AdminPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "staff") redirect("/");
  const store = getStore();
  const [items, claims] = await Promise.all([store.listItems(), store.listClaims()]);
  const profiles = await Promise.all(
    [...new Set(claims.map((claim) => claim.claimantId))].map((id) => store.getProfile(id)),
  );
  const emails = Object.fromEntries(
    profiles.filter(Boolean).map((profile) => [profile!.id, profile!.email]),
  );
  return <AdminBoard items={items} claims={claims} emails={emails} />;
}
