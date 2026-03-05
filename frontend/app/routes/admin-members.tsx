import { Link, useSearchParams } from "react-router";
import type { Route } from "./+types/admin-members";
import { apiGet } from "~/lib/api.server";
import { redirect } from "react-router";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "~/components/ui/tabs";

export async function loader({ request }: Route.LoaderArgs) {
  const [meRes, membersRes, invitationsRes] = await Promise.all([
    apiGet(request, "/api/auth/me/"),
    apiGet(request, "/api/members/"),
    apiGet(request, "/api/admin/invitations/"),
  ]);

  if (!meRes.ok) return redirect("/login");
  const user = await meRes.json();
  if (!user.is_staff) return redirect("/m");

  const membersData = await membersRes.json();
  const invitationsData = invitationsRes.ok ? await invitationsRes.json() : [];

  return {
    members: membersData.results ?? membersData,
    invitations: Array.isArray(invitationsData) ? invitationsData : invitationsData.results ?? [],
  };
}

type Member = {
  uid: string;
  slug: string;
  name: string;
  location: string;
  state: string;
  home_style: string;
  member_since: string;
  photo: string;
};

type Invitation = {
  id: number;
  inviter_name: string;
  email: string;
  code: string;
  created_at: string;
  used_by_name: string | null;
};

export default function AdminMembersPage({ loaderData }: Route.ComponentProps) {
  const { members, invitations } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "members";
  const setActiveTab = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "members") next.delete("tab");
    else next.set("tab", value);
    setSearchParams(next, { replace: true });
  };

  return (
    <>
      <header className="px-4 md:px-8 h-18 flex items-center bg-background shrink-0 border-b border-border sticky top-0 z-10">
        <nav className="flex items-center gap-1.5 text-sm">
          <Link to="/m/admin" className="font-medium text-muted-foreground hover:text-foreground transition-colors">
            Admin
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="font-semibold text-foreground">Members</span>
        </nav>
      </header>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="members">All Members ({members.length})</TabsTrigger>
            <TabsTrigger value="invitations">Invitations ({invitations.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            {members.length === 0 ? (
              <div className="mt-6 rounded-lg border border-border p-16 text-center">
                <p className="text-sm text-muted-foreground">No members yet.</p>
              </div>
            ) : (
              <div className="mt-6 rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-sidebar border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                        Home Style
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                        Since
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member: Member) => (
                      <tr
                        key={member.uid}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-6 py-4">
                          <Link
                            to={`/m/home/${member.uid}`}
                            className="flex items-center gap-3 hover:text-primary transition-colors"
                          >
                            {member.photo ? (
                              <img
                                src={member.photo}
                                alt={member.name}
                                className="size-8 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="size-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                                <span className="text-xs font-medium text-primary-foreground">
                                  {member.name?.charAt(0) || "?"}
                                </span>
                              </div>
                            )}
                            <span className="font-medium">{member.name}</span>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell">
                          {[member.location, member.state].filter(Boolean).join(", ") || "\u2014"}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                          {member.home_style || "\u2014"}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                          {member.member_since || "\u2014"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="invitations">
            {invitations.length === 0 ? (
              <div className="mt-6 rounded-lg border border-border p-16 text-center">
                <p className="text-sm text-muted-foreground">No invitations yet.</p>
              </div>
            ) : (
              <div className="mt-6 rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-sidebar border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Invited By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invitations.map((inv: Invitation) => (
                      <tr
                        key={inv.id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-6 py-4 font-medium">
                          {inv.inviter_name || "\u2014"}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell">
                          {inv.email || "\u2014"}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground hidden md:table-cell font-mono text-xs">
                          {inv.code}
                        </td>
                        <td className="px-6 py-4">
                          {inv.used_by_name ? (
                            <span className="inline-flex rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
                              Used by {inv.used_by_name}
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
