import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { UploadForm } from "@/app/upload/upload-form";

export default async function UploadPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const user = await getSession();
  if (!user) redirect("/login");
  const { kind } = await searchParams;
  return <UploadForm defaultKind={kind === "lost" ? "lost" : "found"} />;
}
