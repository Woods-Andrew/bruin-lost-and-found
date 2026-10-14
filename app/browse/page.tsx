import { ItemCard } from "@/components/item-card";
import { getStore } from "@/lib/store";

export default async function BrowsePage() {
  const items = (await getStore().listItems()).filter(
    (item) => item.status === "published" || item.status === "claimed",
  );
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-ucla-dark">Browse items</h1>
        <p className="text-slate-600">Published lost and found listings currently on campus.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
