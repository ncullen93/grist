import { Outlet, Link, useLocation } from "react-router";

const STEPS: Record<
  string,
  {
    flow: string;
    index: number;
    total: number;
    title: string;
    subtitle: string;
  }
> = {
  // Shared first step
  "/signup": {
    flow: "shared",
    index: 0,
    total: 3,
    title: "Verify your home",
    subtitle: "Enter your address or activation code if you have one.",
  },
  // Activation code flow
  "/signup/account": {
    flow: "code",
    index: 1,
    total: 3,
    title: "Create your account",
    subtitle: "Enter your name, email, and choose a password.",
  },
  "/signup/welcome": {
    flow: "code",
    index: 2,
    total: 3,
    title: "Welcome to Grist Club",
    subtitle: "You're in. Your account is ready.",
  },
  // Address flow
  "/signup/apply": {
    flow: "address",
    index: 1,
    total: 3,
    title: "Tell us about yourself",
    subtitle: "We'll use this to follow up on your application.",
  },
  "/signup/submitted": {
    flow: "address",
    index: 2,
    total: 3,
    title: "Thanks for applying",
    subtitle: "We'll verify your address and be in touch soon.",
  },
};

export default function SignupLayout() {
  const { pathname } = useLocation();
  const step = STEPS[pathname] ?? STEPS["/signup"];

  return (
    <div className="flex min-h-dvh flex-col sm:flex-row">
      {/* Left panel — form */}
      <div className="flex w-full flex-col sm:w-[55%]  sm:min-h-dvh">
        <header className="px-6 pt-5 sm:px-10 sm:pt-6">
          <Link to="/" className="font-display font-extrabold">
            Grist Club
          </Link>
        </header>

        <main className="flex flex-1 justify-center px-6 pt-10 pb-16 sm:px-10 sm:pt-24 sm:pb-24">
          <div className="flex w-full max-w-md flex-col gap-9">
            {/* Progress bar */}
            <div className="flex gap-1.5">
              {Array.from({ length: step.total }, (_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${
                    i <= step.index ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>

            {/* Heading */}
            <div>
              <h1 className="font-display text-2xl font-medium tracking-normal text-gray-900 sm:text-3xl">
                {step.title}
              </h1>
              <p className="mt-2 text-[15px] leading-relaxed text-gray-500">
                {step.subtitle}
              </p>
            </div>

            <Outlet />
          </div>
        </main>
      </div>

      {/* Right panel — image (hidden on mobile) */}
      <div className="relative hidden overflow-hidden sm:flex sm:w-[45%] sm:min-h-dvh">
        <div
          className="absolute -inset-8 bg-cover bg-center"
          style={{
            // alt: "url(https://images.unsplash.com/photo-1606942373266-e6b8c56a5173?w=1200&h=1800&fit=crop&crop=center)",
            // alt: "url(https://images.unsplash.com/photo-1605580824293-6afbca59da59?w=1200&h=1800&fit=crop&crop=center)",
            // alt: "url(https://images.unsplash.com/photo-1716175005854-b8503450ebe6?w=1200&h=1800&fit=crop&crop=center)",
            // alt: "url(https://images.unsplash.com/photo-1558308508-4e7a8fdff9c0?w=1200&h=1800&fit=crop&crop=center)",
            // alt: "url(https://images.unsplash.com/photo-1630807052734-d8bbdc64567f?w=1200&h=1800&fit=crop&crop=center)",
            // alt: "url(https://images.unsplash.com/photo-1587393042695-169ff1f1ea7f?w=1200&h=1800&fit=crop&crop=center)",
            // alt: "url(https://images.unsplash.com/photo-1593006776550-a4897f8527b7?w=1200&h=1800&fit=crop&crop=center)",
            backgroundImage:
              "url(https://images.unsplash.com/photo-1606942373266-e6b8c56a5173?w=1200&h=1800&fit=crop&crop=center)",
          }}
        />
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 flex h-full flex-col justify-end p-10">
          <div className="max-w-xs">
            <p className="font-display text-2xl font-medium leading-tight tracking-tight text-white">
              The community we wish we'd had from day one.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
