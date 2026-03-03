import { useState } from "react";
import { Link } from "react-router";
import { Pencil } from "lucide-react";
import { Button } from "~/components/ui/button";
import { PageHeader } from "~/components/page-header";

export default function MyProfilePage() {
  const [name, setName] = useState("Guest Member");
  const [location, setLocation] = useState("Brewster, MA");
  const [homeName, setHomeName] = useState("The Demo House");
  const [homeYear, setHomeYear] = useState("1905");
  const [homeStyle, setHomeStyle] = useState("Colonial Revival");
  const [registry, setRegistry] = useState(
    "Cape Cod Commission Historic Inventory",
  );
  const [profileSaved, setProfileSaved] = useState(false);

  const handleProfileSave = () => {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  return (
    <>
      <PageHeader title="Profile" />
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Avatar + name header */}
        <div className="flex items-center gap-5">
          <div className="size-16 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-xl font-display font-bold text-primary-foreground">
              {name.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">
              {name}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Member since 2025
            </p>
          </div>
        </div>

        {/* Personal info */}
        <div className="mt-8 rounded-lg border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-sidebar">
            <h3 className="text-sm font-semibold text-foreground">
              Personal Information
            </h3>
          </div>
          <div className="divide-y divide-border">
            <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-6 items-start">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2.5">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/30"
              />
            </div>
            <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-6 items-start">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2.5">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/30"
              />
            </div>
            <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-6 items-start">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2.5">
                Bio
              </label>
              <Link
                to="/m/profile/overview"
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors w-fit"
              >
                <Pencil className="size-3.5" />
                Edit
              </Link>
            </div>
          </div>
        </div>

        {/* Home details */}
        <div className="mt-8 rounded-lg border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-sidebar">
            <h3 className="text-sm font-semibold text-foreground">
              Home Details
            </h3>
          </div>
          <div className="divide-y divide-border">
            <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-6 items-start">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2.5">
                Home name
              </label>
              <input
                type="text"
                value={homeName}
                onChange={(e) => setHomeName(e.target.value)}
                className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/30"
              />
            </div>
            <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-6 items-start">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2.5">
                Year built
              </label>
              <input
                type="text"
                value={homeYear}
                onChange={(e) => setHomeYear(e.target.value)}
                className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/30"
              />
            </div>
            <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-6 items-start">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2.5">
                Style
              </label>
              <input
                type="text"
                value={homeStyle}
                onChange={(e) => setHomeStyle(e.target.value)}
                className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/30"
              />
            </div>
            <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-6 items-start">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2.5">
                Registry
              </label>
              <input
                type="text"
                value={registry}
                onChange={(e) => setRegistry(e.target.value)}
                className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/30"
              />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="mt-8 flex items-center gap-4">
          <Button className="rounded-full px-8" onClick={handleProfileSave}>
            {profileSaved ? "Saved!" : "Save changes"}
          </Button>
          {profileSaved && (
            <p className="text-sm text-primary">
              Your profile has been updated.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
