import { useState } from "react";
import { Link, useFetcher, useSearchParams } from "react-router";
import type { Route } from "./+types/admin-marketplace";
import { apiGet, apiDelete, apiPost, apiPatch } from "~/lib/api.server";
import { redirect } from "react-router";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { Trash2, Plus, Pencil } from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
  const [meRes, listingsRes, tagsRes] = await Promise.all([
    apiGet(request, "/api/auth/me/"),
    apiGet(request, "/api/marketplace/listings/"),
    apiGet(request, "/api/marketplace/tags/"),
  ]);

  if (!meRes.ok) return redirect("/login");
  const user = await meRes.json();
  if (!user.is_staff) return redirect("/m");

  const listingsData = await listingsRes.json();
  const tagsData = await tagsRes.json();

  return {
    listings: listingsData.results ?? listingsData,
    tags: Array.isArray(tagsData) ? tagsData : tagsData.results ?? [],
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "delete-listing") {
    const listingId = formData.get("listingId") as string;
    await apiDelete(request, `/api/marketplace/listings/${listingId}/`);
    return { ok: true };
  }

  if (intent === "create-tag") {
    const name = formData.get("name") as string;
    await apiPost(request, "/api/marketplace/tags/", { name, slug: name.toLowerCase().replace(/\s+/g, "-") });
    return { ok: true };
  }

  if (intent === "delete-tag") {
    const tagId = formData.get("tagId") as string;
    await apiDelete(request, `/api/marketplace/tags/${tagId}/`);
    return { ok: true };
  }

  if (intent === "update-tag") {
    const tagId = formData.get("tagId") as string;
    const name = formData.get("name") as string;
    await apiPatch(request, `/api/marketplace/tags/${tagId}/`, { name });
    return { ok: true };
  }

  return { ok: false };
}

type Listing = {
  id: number;
  title: string;
  author_name: string;
  category: string;
  price: string;
  condition: string;
  likes_count: number;
  time: string;
};

type Tag = { id: number; name: string; slug: string };

const categoryColors: Record<string, string> = {
  "for-sale": "bg-blue-100 text-blue-700",
  wanted: "bg-amber-100 text-amber-700",
  free: "bg-emerald-100 text-emerald-700",
};

export default function AdminMarketplacePage({ loaderData }: Route.ComponentProps) {
  const { listings, tags } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "listings";
  const setActiveTab = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "listings") next.delete("tab");
    else next.set("tab", value);
    setSearchParams(next, { replace: true });
  };
  const fetcher = useFetcher();

  const handleDeleteListing = (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    fetcher.submit({ intent: "delete-listing", listingId: String(id) }, { method: "post" });
  };

  // Tag inline management state
  const [newTagName, setNewTagName] = useState("");
  const [editingTagId, setEditingTagId] = useState<number | null>(null);
  const [editTagName, setEditTagName] = useState("");
  const tagFetcher = useFetcher();

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    tagFetcher.submit({ intent: "create-tag", name: newTagName.trim() }, { method: "post" });
    setNewTagName("");
  };

  const handleDeleteTag = (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    tagFetcher.submit({ intent: "delete-tag", tagId: String(id) }, { method: "post" });
  };

  const handleUpdateTag = (id: number) => {
    if (!editTagName.trim()) return;
    tagFetcher.submit({ intent: "update-tag", tagId: String(id), name: editTagName.trim() }, { method: "post" });
    setEditingTagId(null);
  };

  return (
    <>
      <header className="px-4 md:px-8 h-18 flex items-center bg-background shrink-0 border-b border-border sticky top-0 z-10">
        <nav className="flex items-center gap-1.5 text-sm">
          <Link to="/m/admin" className="font-medium text-muted-foreground hover:text-foreground transition-colors">
            Admin
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="font-semibold text-foreground">Marketplace</span>
        </nav>
      </header>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="listings">Listings ({listings.length})</TabsTrigger>
            <TabsTrigger value="tags">Tags ({tags.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            {listings.length === 0 ? (
              <div className="mt-6 rounded-lg border border-border p-16 text-center">
                <p className="text-sm text-muted-foreground">No listings yet.</p>
              </div>
            ) : (
              <div className="mt-6 rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-sidebar border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                        Price
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((listing: Listing) => (
                      <tr key={listing.id} className="border-b border-border last:border-0">
                        <td className="px-6 py-4 font-medium">{listing.title}</td>
                        <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell">
                          {listing.author_name}
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[listing.category] || "bg-muted text-muted-foreground"}`}>
                            {listing.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                          {listing.price ? `$${listing.price}` : "\u2014"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteListing(listing.id, listing.title)}
                            className="inline-flex items-center text-destructive/70 hover:text-destructive transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tags">
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="New tag name..."
                  className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/30"
                  onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
                />
                <Button onClick={handleCreateTag} className="rounded-full gap-2" disabled={!newTagName.trim()}>
                  <Plus className="size-4" />
                  Add
                </Button>
              </div>

              {tags.length === 0 ? (
                <div className="rounded-lg border border-border p-12 text-center">
                  <p className="text-sm text-muted-foreground">No tags yet.</p>
                </div>
              ) : (
                <div className="rounded-lg border border-border divide-y divide-border">
                  {tags.map((tag: Tag) => (
                    <div key={tag.id} className="flex items-center justify-between px-6 py-4">
                      {editingTagId === tag.id ? (
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="text"
                            value={editTagName}
                            onChange={(e) => setEditTagName(e.target.value)}
                            className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary/30"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleUpdateTag(tag.id);
                              if (e.key === "Escape") setEditingTagId(null);
                            }}
                            autoFocus
                          />
                          <Button size="sm" onClick={() => handleUpdateTag(tag.id)}>Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingTagId(null)}>Cancel</Button>
                        </div>
                      ) : (
                        <>
                          <div>
                            <span className="font-medium text-sm text-foreground">{tag.name}</span>
                            <span className="ml-2 text-xs text-muted-foreground font-mono">{tag.slug}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => { setEditingTagId(tag.id); setEditTagName(tag.name); }}
                              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
                              title="Edit"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTag(tag.id, tag.name)}
                              className="inline-flex items-center text-destructive/70 hover:text-destructive transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
