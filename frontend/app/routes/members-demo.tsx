import { useState, useMemo } from "react";
import { Link, useLoaderData, useSearchParams } from "react-router";
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

const PER_PAGE = 6;

export function loader() {
  return { members: allMembers };
}

export default function MembersDemoPage() {
  const { members } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") ?? "";
  const [search, setSearch] = useState(initialSearch);
  const [styleFilter, setStyleFilter] = useState("All");
  const [eraFilter, setEraFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);
  const [showEraDropdown, setShowEraDropdown] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const era = eraOptions.find((e) => e.label === eraFilter) ?? eraOptions[0];

    return members.filter((m) => {
      const searchMatch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q) ||
        m.homeStyle.toLowerCase().includes(q) ||
        m.homeName.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q));

      const styleMatch =
        styleFilter === "All" || m.homeStyle === styleFilter;

      const eraMatch = m.homeYear >= era.min && m.homeYear <= era.max;

      return searchMatch && styleMatch && eraMatch;
    });
  }, [members, search, styleFilter, eraFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE,
  );

  const resetAndSet = <T,>(setter: (v: T) => void, value: T) => {
    setter(value);
    setPage(1);
  };

  return (
    <>
      {/* Header */}
      <section className="px-8 py-12 lg:px-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Directory
        </p>
        <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">
          Member Directory
        </h2>
      </section>

      {/* Stats */}
      <section className="bg-[#e8ece5] px-8 py-24 lg:px-10">
        <div className="grid grid-cols-1 gap-16 sm:grid-cols-4">
          {[
            { value: "342", label: "Verified members\nacross the country" },
            { value: "38", label: "States\nrepresented" },
            {
              value: "289",
              label: "Historic homes\nlisted in the directory",
            },
            { value: "127", label: "Average home age\nin years" },
          ].map((stat) => (
            <div key={stat.value}>
              <p className="font-display text-5xl font-medium tracking-tight text-gray-900 sm:text-6xl">
                {stat.value}
              </p>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Search + Filters */}
      <section className="px-8 pt-16 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center rounded-lg border border-gray-200 bg-white px-5 py-3">
            <svg
              viewBox="0 0 20 20"
              className="mr-3 size-4 shrink-0 fill-gray-300"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => resetAndSet(setSearch, e.target.value)}
              placeholder="Search by name, location, home style, or era..."
              className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
            />
          </div>
          <div className="flex gap-3">
            {/* Style filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowStyleDropdown(!showStyleDropdown);
                  setShowEraDropdown(false);
                }}
                className={`rounded-lg border bg-white px-5 py-3 text-sm transition-colors ${
                  styleFilter !== "All"
                    ? "border-primary text-primary"
                    : "border-gray-200 text-gray-600"
                }`}
              >
                {styleFilter === "All" ? "Style" : styleFilter}
              </button>
              {showStyleDropdown && (
                <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
                  {styleOptions.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        resetAndSet(setStyleFilter, s);
                        setShowStyleDropdown(false);
                      }}
                      className={`block w-full px-4 py-2 text-left text-sm transition-colors ${
                        styleFilter === s
                          ? "bg-primary/10 font-medium text-gray-900"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Era filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowEraDropdown(!showEraDropdown);
                  setShowStyleDropdown(false);
                }}
                className={`rounded-lg border bg-white px-5 py-3 text-sm transition-colors ${
                  eraFilter !== "All"
                    ? "border-primary text-primary"
                    : "border-gray-200 text-gray-600"
                }`}
              >
                {eraFilter === "All" ? "Era" : eraFilter}
              </button>
              {showEraDropdown && (
                <div className="absolute right-0 z-10 mt-2 w-40 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
                  {eraOptions.map((e) => (
                    <button
                      key={e.label}
                      onClick={() => {
                        resetAndSet(setEraFilter, e.label);
                        setShowEraDropdown(false);
                      }}
                      className={`block w-full px-4 py-2 text-left text-sm transition-colors ${
                        eraFilter === e.label
                          ? "bg-primary/10 font-medium text-gray-900"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active filters */}
        {(styleFilter !== "All" || eraFilter !== "All" || search) && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-gray-400">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={() => {
                setSearch("");
                setStyleFilter("All");
                setEraFilter("All");
                setPage(1);
              }}
              className="text-xs text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </section>

      {/* Member grid */}
      <section className="px-8 py-16 lg:px-10">
        {paged.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-16 text-center">
            <p className="text-sm text-gray-400">
              No members match your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((member) => (
              <Link
                key={member.slug}
                to={`/members/demo/${member.slug}`}
                className="group overflow-hidden rounded-xl border border-gray-100 bg-white transition-shadow hover:shadow-lg"
              >
                <div className="aspect-4/3 overflow-hidden">
                  <img
                    src={member.photo}
                    alt={member.homeName}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-base font-semibold text-gray-900">
                        {member.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {member.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-gray-900">
                        {member.homeYear}
                      </p>
                      <p className="text-xs text-gray-400">
                        {member.homeStyle}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs italic text-gray-500">
                    {member.homeName}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {member.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            resetAndSet(setSearch, tag);
                          }}
                          className="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-medium text-gray-500 transition-colors hover:bg-primary/10 hover:text-primary"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    <span className="text-xs text-gray-300 transition-colors group-hover:text-gray-500">
                      View
                      <svg
                        viewBox="0 0 20 20"
                        className="ml-1 inline size-3.5 fill-current"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 10a.75.75 0 01.75-.75h10.638l-3.96-4.158a.75.75 0 111.08-1.04l5.25 5.5a.75.75 0 010 1.08l-5.25 5.5a.75.75 0 11-1.08-1.04l3.96-4.158H3.75A.75.75 0 013 10z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`flex size-10 items-center justify-center rounded-lg text-sm transition-colors ${
                  n === currentPage
                    ? "bg-gray-900 text-white"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
