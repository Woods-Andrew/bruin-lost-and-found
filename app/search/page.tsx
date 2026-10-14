import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { SearchForm } from "@/app/search/search-form";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await getSession();
  if (!user) redirect("/login");
  const { q } = await searchParams;
  return <SearchForm defaultQuery={q} />;
}
