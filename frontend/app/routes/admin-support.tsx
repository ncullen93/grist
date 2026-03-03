import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import type { Route } from "./+types/admin-support";
import { apiGet } from "~/lib/api.server";
import { redirect } from "react-router";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "~/components/ui/tabs";
import { ChevronDown, ChevronUp } from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
  const [meRes, supportRes] = await Promise.all([
    apiGet(request, "/api/auth/me/"),
    apiGet(request, "/api/admin/support/"),
  ]);

  if (!meRes.ok) return redirect("/login");
  const user = await meRes.json();
  if (!user.is_staff) return redirect("/m");

  const supportData = supportRes.ok ? await supportRes.json() : [];

  return {
    requests: Array.isArray(supportData) ? supportData : supportData.results ?? [],
  };
}

type SupportRequest = {
  id: number;
  type: string;
  subject: string;
  message: string;
  user_name: string;
  created_at: string;
};

const typeBadgeColors: Record<string, string> = {
  help: "bg-blue-100 text-blue-700",
  bug: "bg-red-100 text-red-700",
  suggestion: "bg-amber-100 text-amber-700",
};

function RequestList({ requests }: { requests: SupportRequest[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (requests.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-border p-16 text-center">
        <p className="text-sm text-muted-foreground">No requests found.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-lg border border-border divide-y divide-border">
      {requests.map((req) => (
        <div key={req.id}>
          <button
            onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
            className="flex items-center gap-4 w-full px-6 py-4 text-left hover:bg-muted/30 transition-colors cursor-pointer"
          >
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 ${
                typeBadgeColors[req.type] || "bg-muted text-muted-foreground"
              }`}
            >
              {req.type}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm text-foreground truncate">{req.subject}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {req.user_name} &middot; {new Date(req.created_at).toLocaleDateString()}
              </p>
            </div>
            {expandedId === req.id ? (
              <ChevronUp className="size-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronDown className="size-4 text-muted-foreground shrink-0" />
            )}
          </button>
          {expandedId === req.id && (
            <div className="px-6 pb-5 pt-0">
              <div className="rounded-lg bg-muted/30 p-4">
                <p className="text-sm text-foreground whitespace-pre-wrap">{req.message}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function AdminSupportPage({ loaderData }: Route.ComponentProps) {
  const { requests } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "all";
  const setActiveTab = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "all") next.delete("tab");
    else next.set("tab", value);
    setSearchParams(next, { replace: true });
  };

  const help = requests.filter((r: SupportRequest) => r.type === "help");
  const bugs = requests.filter((r: SupportRequest) => r.type === "bug");
  const suggestions = requests.filter((r: SupportRequest) => r.type === "suggestion");

  return (
    <>
      <header className="px-4 md:px-8 h-18 flex items-center bg-background shrink-0 border-b border-border sticky top-0 z-10">
        <nav className="flex items-center gap-1.5 text-sm">
          <Link to="/m/admin" className="font-medium text-muted-foreground hover:text-foreground transition-colors">
            Admin
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="font-semibold text-foreground">Support</span>
        </nav>
      </header>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({requests.length})</TabsTrigger>
            <TabsTrigger value="help">Help ({help.length})</TabsTrigger>
            <TabsTrigger value="bugs">Bugs ({bugs.length})</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions ({suggestions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <RequestList requests={requests} />
          </TabsContent>
          <TabsContent value="help">
            <RequestList requests={help} />
          </TabsContent>
          <TabsContent value="bugs">
            <RequestList requests={bugs} />
          </TabsContent>
          <TabsContent value="suggestions">
            <RequestList requests={suggestions} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
