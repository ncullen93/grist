import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import {
  Search,
  SlidersHorizontal,
  Plus,
  Mail,
  Link2,
  Check,
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { PageHeader } from "~/components/page-header";
import { allMembers } from "~/lib/demo-data";

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

const PER_PAGE = 18;

function InviteDialog() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteLink = `${typeof window !== "undefined" ? window.location.origin : ""}/join/abc123`;

  const handleSend = () => {
    if (!email.trim()) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setEmail("");
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            disabled={!email.trim() || sent}
            className="shrink-0"
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
              {inviteLink}
            </span>
          </div>
          <Button variant="outline" onClick={handleCopy} className="shrink-0">
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

export default function MemberDirectoryPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") ?? "";
  const [search, setSearch] = useState(initialSearch);
  const [styleFilter, setStyleFilter] = useState("All");
  const [eraFilter, setEraFilter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PER_PAGE);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const era = eraOptions.find((e) => e.label === eraFilter) ?? eraOptions[0];

    return allMembers.filter((m) => {
      const searchMatch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q) ||
        m.homeStyle.toLowerCase().includes(q) ||
        m.homeName.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q));

      const styleMatch = styleFilter === "All" || m.homeStyle === styleFilter;

      const eraMatch = m.homeYear >= era.min && m.homeYear <= era.max;

      return searchMatch && styleMatch && eraMatch;
    });
  }, [search, styleFilter, eraFilter]);

  const visible = filtered.slice(0, visibleCount);

  const resetAndSet = <T,>(setter: (v: T) => void, value: T) => {
    setter(value);
    setVisibleCount(PER_PAGE);
  };

  const hasActiveFilters =
    styleFilter !== "All" || eraFilter !== "All" || search;

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
              value={search}
              onChange={(e) => resetAndSet(setSearch, e.target.value)}
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
                  onSelect={() => resetAndSet(setStyleFilter, s)}
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
                  onSelect={() => resetAndSet(setEraFilter, e.label)}
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
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={() => {
                setSearch("");
                setStyleFilter("All");
                setEraFilter("All");
                setVisibleCount(PER_PAGE);
              }}
              className="text-xs text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Member grid */}
        <div>
          {visible.length === 0 ? (
            <div className="rounded-xl border border-border p-16 text-center">
              <p className="text-sm text-muted-foreground">
                No members match your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((member) => (
                <Link
                  key={member.slug}
                  to={`/m/members/${member.slug}`}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-3 right-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      {member.homeYear}
                    </span>
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

          {/* Load more */}
          {filtered.length > visibleCount && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={() => setVisibleCount((c) => c + PER_PAGE)}
                className="rounded-full border border-border px-8 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
              >
                Load more
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
