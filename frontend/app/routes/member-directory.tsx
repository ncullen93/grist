import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useFetcher, useSearchParams, redirect } from "react-router";
import {
  Search,
  SlidersHorizontal,
  Plus,
  Mail,
  Link2,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from "~/components/ui/dialog";
import { PageHeader } from "~/components/page-header";
import { apiGet, apiPost } from "~/lib/api.server";
import type { Route } from "./+types/member-directory";

interface MemberItem {
  uid: string;
  slug: string;
  name: string;
  location: string;
  state: string;
  home_style: string;
  home_year: number | null;
  home_name: string;
  photo: string;
  tags: string[];
  member_since: string;
}

const styleOptions = [
  "All",
  "Greek Revival",
  "Queen Anne",
  "Italianate",
  "Dutch Colonial",
  "Victorian",
  "Stick Style",
  "Federal",
  "Cape Cod",
];

const eraOptions = [
  { label: "All", min: 0, max: 9999 },
  { label: "Pre-1800", min: 0, max: 1799 },
  { label: "1800\u20131850", min: 1800, max: 1850 },
  { label: "1850\u20131900", min: 1851, max: 1900 },
  { label: "Post-1900", min: 1901, max: 9999 },
];

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const homeStyle = url.searchParams.get("home_style") || "";
  const eraLabel = url.searchParams.get("era") || "";
  const page = url.searchParams.get("page") || "1";

  const params = new URLSearchParams();
  params.set("page", page);
  if (search) params.set("search", search);
  if (homeStyle) params.set("home_style", homeStyle);

  const era = eraOptions.find((e) => e.label === eraLabel);
  if (era && eraLabel !== "All") {
    params.set("era_min", String(era.min));
    params.set("era_max", String(era.max));
  }

  try {
    const res = await apiGet(request, `/api/members/?${params}`);
    if (!res.ok) return redirect("/login");
    const data = await res.json();
    return {
      results: data.results as MemberItem[],
      nextPage: data.next ? String(Number(page) + 1) : null,
      count: data.count as number,
      page: Number(page),
    };
  } catch {
    return redirect("/login");
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "invite-email") {
    const email = formData.get("email") as string;
    try {
      const res = await apiPost(request, "/api/members/invite/", { email });
      if (!res.ok) return { error: "Failed to send invite." };
      return { invited: true };
    } catch {
      return { error: "Unable to connect to server." };
    }
  }

  if (intent === "invite-link") {
    try {
      const res = await apiGet(request, "/api/members/invite-link/");
      if (!res.ok) return { error: "Failed to get invite link." };
      const data = await res.json();
      return { inviteUrl: data.invite_url as string };
    } catch {
      return { error: "Unable to connect to server." };
    }
  }

  return null;
}

function InviteDialog() {
  const [email, setEmail] = useState("");
  const emailFetcher = useFetcher();
  const linkFetcher = useFetcher();

  const sent = emailFetcher.data?.invited;
  const inviteUrl = linkFetcher.data?.inviteUrl;
  const [copied, setCopied] = useState(false);

  // Fetch invite link on mount
  useEffect(() => {
    if (linkFetcher.state === "idle" && !linkFetcher.data) {
      linkFetcher.submit({ intent: "invite-link" }, { method: "post" });
    }
  }, []);

  const handleSend = () => {
    if (!email.trim()) return;
    emailFetcher.submit(
      { intent: "invite-email", email },
      { method: "post" },
    );
  };

  useEffect(() => {
    if (sent) {
      const t = setTimeout(() => setEmail(""), 2000);
      return () => clearTimeout(t);
    }
  }, [sent]);

  const fullUrl = typeof window !== "undefined" && inviteUrl
    ? `${window.location.origin}${inviteUrl}`
    : "";

  const handleCopy = () => {
    if (fullUrl) {
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <DialogContent>
      {/* Email invite */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Invite by email
        </label>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex flex-1 items-center rounded-lg border border-border px-3 py-2">
            <Mail className="mr-2.5 size-4 shrink-0 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!email.trim() || emailFetcher.state !== "idle"}
          >
            {sent ? (
              <>
                <Check className="size-4" />
                Sent
              </>
            ) : (
              "Send"
            )}
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 py-4">
        <div className="flex-1 border-t border-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="flex-1 border-t border-border" />
      </div>

      {/* Copy link */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Share invite link
        </label>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex flex-1 items-center rounded-lg border border-border bg-muted/30 px-3 py-2">
            <Link2 className="mr-2.5 size-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm text-muted-foreground">
              {fullUrl || "Loading..."}
            </span>
          </div>
          <Button variant="outline" onClick={handleCopy} disabled={!fullUrl} className="shrink-0">
            {copied ? (
              <>
                <Check className="size-4" />
                Copied
              </>
            ) : (
              "Copy"
            )}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

export default function MemberDirectoryPage({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const [items, setItems] = useState(loaderData.results);
  const [nextPage, setNextPage] = useState(loaderData.nextPage);
  const fetcher = useFetcher();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const styleFilter = searchParams.get("home_style") || "All";
  const eraFilter = searchParams.get("era") || "All";

  // Reset when loaderData changes (new search/filter)
  useEffect(() => {
    setItems(loaderData.results);
    setNextPage(loaderData.nextPage);
  }, [loaderData]);

  // Append fetcher results for infinite scroll
  useEffect(() => {
    if (fetcher.data?.results) {
      setItems((prev) => [...prev, ...fetcher.data!.results]);
      setNextPage(fetcher.data.nextPage);
    }
  }, [fetcher.data]);

  // IntersectionObserver for infinite scroll
  const loadMore = useCallback(() => {
    if (!nextPage || fetcher.state !== "idle") return;
    const params = new URLSearchParams(searchParams);
    params.set("page", nextPage);
    fetcher.load(`/m/members?${params}`);
  }, [nextPage, fetcher.state, searchParams]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      next.delete("page");
      if (value) next.set("search", value);
      else next.delete("search");
      setSearchParams(next, { replace: true });
    }, 300);
  };

  const setStyleFilter = (value: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete("page");
    if (value === "All") next.delete("home_style");
    else next.set("home_style", value);
    setSearchParams(next, { replace: true });
  };

  const setEraFilter = (value: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete("page");
    if (value === "All") next.delete("era");
    else next.set("era", value);
    setSearchParams(next, { replace: true });
  };

  const hasActiveFilters =
    styleFilter !== "All" || eraFilter !== "All" || searchInput;

  const isLoadingMore = fetcher.state === "loading";

  return (
    <>
      <PageHeader title="Members" />
      {/* Sticky search bar */}
      <div className="sticky top-18 z-10 bg-background">
        <div className="max-w-4xl mx-auto flex items-center gap-3 px-4 md:px-8 py-8">
          <div className="flex flex-1 items-center rounded-lg border border-border bg-background px-4 py-2.5">
            <Search className="mr-3 size-4 shrink-0 text-muted-foreground" />
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name, location, or home style..."
              className="h-auto border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0 focus-visible:border-0"
            />
          </div>

          {/* Style filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm transition-colors hover:bg-muted/50 ${
                  styleFilter !== "All"
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                <SlidersHorizontal className="size-4" />
                {styleFilter === "All" ? "Style" : styleFilter}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {styleOptions.map((s) => (
                <DropdownMenuItem
                  key={s}
                  onSelect={() => setStyleFilter(s)}
                  className={styleFilter === s ? "font-medium" : ""}
                >
                  {s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Era filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm transition-colors hover:bg-muted/50 ${
                  eraFilter !== "All"
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                {eraFilter === "All" ? "Era" : eraFilter}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {eraOptions.map((e) => (
                <DropdownMenuItem
                  key={e.label}
                  onSelect={() => setEraFilter(e.label)}
                  className={eraFilter === e.label ? "font-medium" : ""}
                >
                  {e.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Invite button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="rounded-lg">
                <Plus className="size-4" />
                Invite
              </Button>
            </DialogTrigger>
            <InviteDialog />
          </Dialog>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 pb-8">
        {/* Active filters */}
        {hasActiveFilters && (
          <div className="mb-6 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {loaderData.count} result{loaderData.count !== 1 ? "s" : ""}
            </span>
            <button
              onClick={() => {
                setSearchInput("");
                const next = new URLSearchParams();
                setSearchParams(next, { replace: true });
              }}
              className="text-xs text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Member grid */}
        <div>
          {items.length === 0 ? (
            <div className="rounded-xl border border-border p-16 text-center">
              <p className="text-sm text-muted-foreground">
                No members match your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((member) => (
                <Link
                  key={member.uid}
                  to={`/m/members/${member.uid}`}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {member.home_year && (
                      <span className="absolute top-3 right-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                        {member.home_year}
                      </span>
                    )}
                  </div>
                  <div className="mt-3">
                    <h3 className="font-display text-base font-semibold text-foreground">
                      {member.name}
                    </h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {member.location}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Sentinel + loading indicator */}
          <div ref={sentinelRef} className="h-1" />
          {isLoadingMore && (
            <div className="flex justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
