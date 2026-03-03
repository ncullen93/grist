import { Form, Link, useNavigation } from "react-router";
import type { Route } from "./+types/login";
import { apiPost, redirectWithCookies } from "~/lib/api.server";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const res = await apiPost(request, "/api/auth/login/", { email, password });

    if (!res.ok) {
      return { error: "Invalid email or password." };
    }

    return redirectWithCookies(res, "/m/home");
  } catch {
    return { error: "Unable to connect to server. Please try again." };
  }
}

export default function Login({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="flex min-h-dvh flex-col sm:flex-row">
      {/* Left panel — form */}
      <div className="flex w-full flex-col sm:w-[55%] sm:min-h-dvh">
        <header className="px-6 pt-5 sm:px-10 sm:pt-6">
          <Link to="/" className="font-display font-extrabold">
            Grist Club
          </Link>
        </header>

        <main className="flex flex-1 justify-center px-6 pt-10 pb-16 sm:px-10 sm:pt-24 sm:pb-24">
          <div className="flex w-full max-w-md flex-col gap-9">
            <div>
              <h1 className="font-display text-2xl font-medium tracking-normal text-gray-900 sm:text-3xl">
                Welcome back
              </h1>
              <p className="mt-2 text-[15px] leading-relaxed text-gray-500">
                Log in to your Grist Club account.
              </p>
            </div>

            <Form method="post" className="flex flex-col gap-9">
              <div className="space-y-5">
                {actionData?.error && (
                  <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {actionData.error}
                  </div>
                )}

                <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors focus-within:border-gray-400">
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email"
                    className="h-12 rounded-none border-0 bg-transparent px-4 text-[15px] shadow-none focus-visible:ring-0"
                    autoFocus
                    required
                  />
                  <div className="border-t border-gray-200" />
                  <Input
                    name="password"
                    type="password"
                    placeholder="Password"
                    className="h-12 rounded-none border-0 bg-transparent px-4 text-[15px] shadow-none focus-visible:ring-0"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-lg bg-primary text-sm font-medium"
                >
                  Log in
                </Button>
                <Link
                  to="/signup"
                  className="text-center text-sm text-gray-400 hover:text-gray-600"
                >
                  Don't have an account? Sign up
                </Link>
              </div>
            </Form>
          </div>
        </main>
      </div>

      {/* Right panel — image (hidden on mobile) */}
      <div className="relative hidden overflow-hidden sm:flex sm:w-[45%] sm:min-h-dvh">
        <div
          className="absolute -inset-8 bg-cover bg-center"
          style={{
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
