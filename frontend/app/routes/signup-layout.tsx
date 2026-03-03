import { Outlet, Link, useLocation } from "react-router";

const STEPS = [
  {
    path: "/signup",
    title: "Verify your home",
    subtitle:
      "Enter the address of your historic home, or use an activation code if you received one.",
  },
  {
    path: "/signup/account",
    title: "Create your account",
    subtitle: "Enter your name, email, and choose a password.",
  },
  {
    path: "/signup/welcome",
    title: "Welcome to Grist Club",
    subtitle: "Your application has been submitted.",
  },
];

export default function SignupLayout() {
  const { pathname } = useLocation();
  const currentIndex = STEPS.findIndex((s) => s.path === pathname);
  const step = currentIndex >= 0 ? currentIndex : 0;
  const { title, subtitle } = STEPS[step];

  return (
    <div className="flex min-h-dvh flex-col sm:flex-row">
      {/* Left panel — form */}
      <div className="flex w-full flex-col sm:w-[55%] sm:min-h-dvh">
        <header className="px-6 pt-5 sm:px-10 sm:pt-6">
          <Link to="/" className="font-display font-extrabold">
            Grist Club
          </Link>
        </header>

        <main className="flex flex-1 justify-center px-6 pt-10 pb-16 sm:px-10 sm:pt-20 sm:pb-24">
          <div className="flex w-full max-w-md flex-col gap-9">
            {/* Progress bar */}
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${
                    i <= step ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>

            {/* Heading */}
            <div>
              <h1 className="font-display text-2xl font-medium tracking-tight text-gray-900 sm:text-3xl">
                {title}
              </h1>
              <p className="mt-2 text-[15px] leading-relaxed text-gray-500">
                {subtitle}
              </p>
            </div>

            <Outlet />
          </div>
        </main>
      </div>

      {/* Right panel — image (hidden on mobile) */}
      <div className="relative hidden overflow-hidden sm:flex sm:w-[45%] sm:min-h-dvh">
        <div
          className="absolute -inset-4 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&h=1800&fit=crop&crop=center)",
          }}
        />
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 flex h-full flex-col justify-end p-10">
          <div className="max-w-sm">
            <p className="font-display text-2xl font-medium leading-tight tracking-tight text-white">
              The community we wish we'd had from day one.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Join verified historic homeowners sharing advice, resources, and
              real friendships.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
