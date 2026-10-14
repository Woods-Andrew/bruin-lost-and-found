import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { SearchForm } from "@/app/search/search-form";

export default async function SearchPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  return <SearchForm />;
}
