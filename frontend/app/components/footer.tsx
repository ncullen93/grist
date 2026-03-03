import { Link, useLocation } from "react-router";

const footerLinks = [
  {
    heading: "Community",
    links: [
      { label: "Forum", href: "#" },
      { label: "Members", href: "#" },
      { label: "Profiles", href: "#" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Preservation Guides", href: "#" },
      { label: "Tax Credits", href: "#" },
      { label: "Insurance", href: "#" },
    ],
  },
  {
    heading: "Events",
    links: [
      { label: "Upcoming", href: "#" },
      { label: "Past Events", href: "#" },
    ],
  },
  {
    heading: "Connect",
    links: [
      { label: "Instagram", href: "#" },
      { label: "Newsletter", href: "#" },
    ],
  },
  {
    heading: "About",
    links: [
      { label: "Our Story", href: "#" },
      { label: "FAQ", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Privacy", href: "#" },
    ],
  },
];

export function Footer() {
  const { pathname } = useLocation();
  const isGreen = pathname !== "/" && pathname !== "/about";

  return (
    <footer
      className={`px-8 pt-16 lg:px-10 lg:pt-20 ${isGreen ? "bg-primary" : "bg-[#faf9f6]"}`}
    >
      <div className="flex flex-col gap-12 lg:flex-row lg:gap-20">
        {/* Logo */}
        <div className="shrink-0">
          <Link to="/">
            <span
              className={`font-display text-lg font-extrabold ${isGreen ? "text-white" : ""}`}
            >
              Grist Club
            </span>
          </Link>
        </div>

        {/* Link columns */}
        <div className="grid flex-1 grid-cols-2 gap-x-12 gap-y-8 sm:grid-cols-3 md:grid-cols-5 lg:ml-20">
          {footerLinks.map((group) => (
            <div key={group.heading}>
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${isGreen ? "text-white/60" : "text-gray-900"}`}
              >
                {group.heading}
              </p>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className={`text-sm transition-colors ${isGreen ? "text-white/80 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Large decorative name */}
      <div className="mt-16 overflow-hidden text-right">
        <span
          className={`font-display text-[clamp(6rem,15vw,14rem)] font-extrabold leading-none ${isGreen ? "text-white/10" : "text-gray-200"}`}
        >
          Grist
        </span>
      </div>
    </footer>
  );
}
