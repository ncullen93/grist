import { Link, useFetcher, useSearchParams } from "react-router";
import type { Route } from "./+types/admin-applications";
import { apiGet, apiPatch, apiPost, apiDelete } from "~/lib/api.server";
import { redirect } from "react-router";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Check, X, Plus } from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
  const [meRes, applicationsRes, codesRes] = await Promise.all([
    apiGet(request, "/api/auth/me/"),
    apiGet(request, "/api/admin/applications/"),
    apiGet(request, "/api/admin/activation-codes/"),
  ]);

  if (!meRes.ok) return redirect("/login");
  const user = await meRes.json();
  if (!user.is_staff) return redirect("/m");

  const applicationsData = applicationsRes.ok ? await applicationsRes.json() : [];
  const codesData = codesRes.ok ? await codesRes.json() : [];

  return {
    applications: Array.isArray(applicationsData) ? applicationsData : applicationsData.results ?? [],
    codes: Array.isArray(codesData) ? codesData : codesData.results ?? [],
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "approve") {
    const appId = formData.get("appId") as string;
    await apiPatch(request, `/api/admin/applications/${appId}/`, { status: "approved" });
    return { ok: true };
  }

  if (intent === "reject") {
    const appId = formData.get("appId") as string;
    await apiPatch(request, `/api/admin/applications/${appId}/`, { status: "rejected" });
    return { ok: true };
  }

  if (intent === "generate-codes") {
    const count = formData.get("count") as string;
    await apiPost(request, "/api/admin/activation-codes/", { count: Number(count) || 5 });
    return { ok: true };
  }

  if (intent === "delete-code") {
    const codeId = formData.get("codeId") as string;
    await apiDelete(request, `/api/admin/activation-codes/${codeId}/`);
    return { ok: true };
  }

  return { ok: false };
}

type Application = {
  id: string;
  full_name: string;
  email: string;
  address: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
};

type ActivationCode = {
  id: number;
  code: string;
  is_used: boolean;
  used_by_email: string | null;
  used_at: string | null;
  created_at: string;
};

export default function AdminApplicationsPage({ loaderData }: Route.ComponentProps) {
  const { applications, codes } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "pending";
  const setActiveTab = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "pending") next.delete("tab");
    else next.set("tab", value);
    setSearchParams(next, { replace: true });
  };
  const fetcher = useFetcher();

  const pending = applications.filter((a: Application) => a.status === "pending");
  const approved = applications.filter((a: Application) => a.status === "approved");
  const rejected = applications.filter((a: Application) => a.status === "rejected");

  const handleApprove = (id: string) => {
    fetcher.submit({ intent: "approve", appId: id }, { method: "post" });
  };

  const handleReject = (id: string, name: string) => {
    if (!confirm(`Reject application from ${name}?`)) return;
    fetcher.submit({ intent: "reject", appId: id }, { method: "post" });
  };

  const handleGenerateCodes = () => {
    fetcher.submit({ intent: "generate-codes", count: "5" }, { method: "post" });
  };

  const handleDeleteCode = (id: number, code: string) => {
    if (!confirm(`Delete code ${code}?`)) return;
    fetcher.submit({ intent: "delete-code", codeId: String(id) }, { method: "post" });
  };

  function ApplicationTable({ apps, showActions }: { apps: Application[]; showActions: boolean }) {
    if (apps.length === 0) {
      return (
        <div className="mt-6 rounded-lg border border-border p-16 text-center">
          <p className="text-sm text-muted-foreground">No applications found.</p>
        </div>
      );
    }
    return (
      <div className="mt-6 rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-sidebar border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                Address
              </th>
              {showActions && (
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {apps.map((app) => (
              <tr key={app.id} className="border-b border-border last:border-0">
                <td className="px-6 py-4 font-medium">{app.full_name}</td>
                <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell">
                  {app.email}
                </td>
                <td className="px-6 py-4 text-muted-foreground hidden md:table-cell max-w-xs truncate">
                  {app.address}
                </td>
                {showActions && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleApprove(app.id)}
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium hover:bg-primary/20 transition-colors cursor-pointer"
                        title="Approve"
                      >
                        <Check className="size-3" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(app.id, app.full_name)}
                        className="inline-flex items-center gap-1 rounded-full bg-destructive/10 text-destructive px-3 py-1 text-xs font-medium hover:bg-destructive/20 transition-colors cursor-pointer"
                        title="Reject"
                      >
                        <X className="size-3" />
                        Reject
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      <header className="px-4 md:px-8 h-18 flex items-center bg-background shrink-0 border-b border-border sticky top-0 z-10">
        <Link
          to="/m/admin"
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Admin
        </Link>
      </header>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
            <TabsTrigger value="codes">Codes ({codes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <ApplicationTable apps={pending} showActions={true} />
          </TabsContent>
          <TabsContent value="approved">
            <ApplicationTable apps={approved} showActions={false} />
          </TabsContent>
          <TabsContent value="rejected">
            <ApplicationTable apps={rejected} showActions={false} />
          </TabsContent>
          <TabsContent value="codes">
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-end">
                <Button onClick={handleGenerateCodes} className="rounded-full gap-2">
                  <Plus className="size-4" />
                  Generate 5 Codes
                </Button>
              </div>

              {codes.length === 0 ? (
                <div className="rounded-lg border border-border p-16 text-center">
                  <p className="text-sm text-muted-foreground">No activation codes yet.</p>
                </div>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-sidebar border-b border-border">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                          Used By
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {codes.map((code: ActivationCode) => (
                        <tr key={code.id} className="border-b border-border last:border-0">
                          <td className="px-6 py-4 font-mono text-sm">{code.code}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                code.is_used
                                  ? "bg-muted text-muted-foreground"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              {code.is_used ? "Used" : "Available"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                            {code.used_by_email || "\u2014"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {!code.is_used && (
                              <button
                                onClick={() => handleDeleteCode(code.id, code.code)}
                                className="inline-flex items-center text-destructive/70 hover:text-destructive transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <X className="size-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
