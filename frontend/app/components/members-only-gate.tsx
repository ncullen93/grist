import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import type { ReactNode } from "react";

function HistoricHomeIllustration() {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      className="mx-auto h-36 w-auto"
      aria-hidden="true"
    >
      {/* Ground line */}
      <line
        x1="10"
        y1="140"
        x2="190"
        y2="140"
        className="stroke-primary/20"
        strokeWidth="1.5"
      />

      {/* Main house body */}
      <rect
        x="45"
        y="70"
        width="110"
        height="70"
        rx="1"
        className="fill-primary/[0.07] stroke-primary/30"
        strokeWidth="1.5"
      />

      {/* Gable / pediment */}
      <path
        d="M40 72L100 28L160 72"
        className="fill-primary/5 stroke-primary/30"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Pediment trim line */}
      <path
        d="M48 70L100 34L152 70"
        className="stroke-primary/15"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* Columns */}
      {[58, 78, 122, 142].map((x) => (
        <g key={x}>
          {/* Column shaft */}
          <rect
            x={x - 2.5}
            y="72"
            width="5"
            height="56"
            className="fill-primary/[0.07] stroke-primary/30"
            strokeWidth="1"
          />
          {/* Capital */}
          <rect
            x={x - 4}
            y="70"
            width="8"
            height="3"
            rx="0.5"
            className="fill-primary/10 stroke-primary/30"
            strokeWidth="1"
          />
          {/* Base */}
          <rect
            x={x - 4}
            y="127"
            width="8"
            height="3"
            rx="0.5"
            className="fill-primary/10 stroke-primary/30"
            strokeWidth="1"
          />
        </g>
      ))}

      {/* Front door */}
      <rect
        x="90"
        y="100"
        width="20"
        height="40"
        rx="1"
        className="fill-primary/15 stroke-primary/30"
        strokeWidth="1.5"
      />
      {/* Door transom (half-round window above door) */}
      <path
        d="M90 100 A10 10 0 0 1 110 100"
        className="fill-primary/[0.07] stroke-primary/30"
        strokeWidth="1"
      />
      {/* Doorknob */}
      <circle cx="106" cy="122" r="1.5" className="fill-primary/40" />

      {/* Windows - left pair */}
      <rect
        x="55"
        y="82"
        width="14"
        height="20"
        rx="1"
        className="fill-primary/[0.07] stroke-primary/25"
        strokeWidth="1"
      />
      <line
        x1="62"
        y1="82"
        x2="62"
        y2="102"
        className="stroke-primary/20"
        strokeWidth="0.75"
      />
      <line
        x1="55"
        y1="92"
        x2="69"
        y2="92"
        className="stroke-primary/20"
        strokeWidth="0.75"
      />

      {/* Windows - right pair */}
      <rect
        x="131"
        y="82"
        width="14"
        height="20"
        rx="1"
        className="fill-primary/[0.07] stroke-primary/25"
        strokeWidth="1"
      />
      <line
        x1="138"
        y1="82"
        x2="138"
        y2="102"
        className="stroke-primary/20"
        strokeWidth="0.75"
      />
      <line
        x1="131"
        y1="92"
        x2="145"
        y2="92"
        className="stroke-primary/20"
        strokeWidth="0.75"
      />

      {/* Chimney */}
      <rect
        x="130"
        y="22"
        width="12"
        height="30"
        rx="1"
        className="fill-primary/[0.07] stroke-primary/25"
        strokeWidth="1.5"
      />
      {/* Chimney cap */}
      <rect
        x="128"
        y="20"
        width="16"
        height="4"
        rx="1"
        className="fill-primary/10 stroke-primary/25"
        strokeWidth="1"
      />

      {/* Steps */}
      <rect
        x="85"
        y="140"
        width="30"
        height="4"
        className="fill-primary/5 stroke-primary/20"
        strokeWidth="1"
      />
      <rect
        x="88"
        y="136"
        width="24"
        height="4"
        className="fill-primary/5 stroke-primary/20"
        strokeWidth="1"
      />

      {/* Lock icon overlay - centered on door */}
      <circle cx="100" cy="118" r="9" className="fill-white/90" />
      <circle
        cx="100"
        cy="118"
        r="7"
        className="fill-primary/10 stroke-primary"
        strokeWidth="1.5"
      />
      {/* Lock body */}
      <rect
        x="96"
        y="117"
        width="8"
        height="6"
        rx="1"
        className="fill-primary"
      />
      {/* Lock shackle */}
      <path
        d="M97.5 117V114.5a2.5 2.5 0 0 1 5 0V117"
        className="stroke-primary"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Keyhole */}
      <circle cx="100" cy="120" r="1" className="fill-white" />

      {/* Decorative trees */}
      <ellipse
        cx="25"
        cy="120"
        rx="12"
        ry="18"
        className="fill-primary/6 stroke-primary/15"
        strokeWidth="1"
      />
      <line
        x1="25"
        y1="138"
        x2="25"
        y2="140"
        className="stroke-primary/20"
        strokeWidth="2"
      />
      <ellipse
        cx="175"
        cy="122"
        rx="10"
        ry="15"
        className="fill-primary/6 stroke-primary/15"
        strokeWidth="1"
      />
      <line
        x1="175"
        y1="137"
        x2="175"
        y2="140"
        className="stroke-primary/20"
        strokeWidth="2"
      />
    </svg>
  );
}

export function MembersOnlyGate({
  children,
}: {
  children: ReactNode;
}) {
  const isLoggedIn = false;

  if (isLoggedIn) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-[calc(100vh-76px)]">
      {/* Blurred skeleton content */}
      <div
        className="pointer-events-none select-none blur-[6px]"
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-[#faf9f6]/60" />

      {/* Auth card */}
      <div className="absolute inset-0 flex items-start justify-center pt-28">
        <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white px-8 pt-10 pb-8 shadow-xl">
          <HistoricHomeIllustration />

          <h2 className="mt-5 text-center font-display text-xl font-semibold tracking-tight text-gray-900">
            Members only
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Sign in or apply to access this page.
          </p>

          <div className="mt-7 space-y-2.5">
            <Button size="lg" className="w-full rounded-full" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full rounded-full"
              asChild
            >
              <Link to="#">Apply</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
