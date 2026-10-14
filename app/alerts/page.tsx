import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getStore } from "@/lib/store";
import { MarkReadButton } from "@/app/alerts/mark-read";

export default async function AlertsPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const alerts = await getStore().listAlerts(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-ucla-dark">In-app alerts</h1>
        <p className="text-slate-600">
          Match and claim updates stay in the app. Email notifications are a stretch goal.
        </p>
      </div>
      <div className="space-y-3">
        {alerts.length === 0 ? <p className="card p-6">No alerts yet.</p> : null}
        {alerts.map((alert) => (
          <article key={alert.id} className={`card p-5 ${alert.read ? "opacity-70" : ""}`}>
            <h2 className="font-semibold text-ucla-dark">{alert.title}</h2>
            <p className="mt-1 text-slate-600">{alert.body}</p>
            <div className="mt-3 flex gap-3 text-sm">
              {alert.itemId ? (
                <Link className="text-ucla-blue font-medium" href={`/items/${alert.itemId}`}>
                  View item
                </Link>
              ) : null}
              {!alert.read ? <MarkReadButton id={alert.id} /> : <span>Read</span>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
