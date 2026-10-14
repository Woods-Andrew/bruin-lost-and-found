import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { getStore } from "@/lib/store";
import { ClaimForm } from "@/app/items/[id]/claim/claim-form";

export default async function ClaimPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSession();
  if (!user) redirect("/login");
  const { id } = await params;
  const item = await getStore().getItem(id);
  if (!item) notFound();
  if (item.status !== "published") redirect(`/items/${item.id}`);
  return <ClaimForm itemId={item.id} title={item.title} />;
}
