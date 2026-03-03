import { useState } from "react";
import { Form, Link, useNavigation } from "react-router";
import type { Route } from "./+types/signup-account";
import { apiPost, redirectWithCookies } from "~/lib/api.server";
import { redirect } from "react-router";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) return redirect("/signup");
  return { code };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const code = formData.get("code") as string;
  const firstName = formData.get("firstName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const res = await apiPost(request, "/api/auth/signup/", {
      activation_code: code,
      first_name: firstName,
      email,
      password,
    });

    if (!res.ok) {
      const data = await res.json();
      return { error: data.error || "Signup failed. Please try again." };
    }

    return redirectWithCookies(res, "/signup/welcome");
  } catch {
    return { error: "Unable to connect to server. Please try again." };
  }
}

export default function SignupAccount({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const canContinue =
    firstName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 8;

  return (
    <Form method="post" className="flex flex-col gap-9">
      <input type="hidden" name="code" value={loaderData.code} />

      <div className="space-y-5">
        {actionData?.error && (
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {actionData.error}
          </div>
        )}

        <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors focus-within:border-gray-400">
          <Input
            id="firstName"
            name="firstName"
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="h-12 rounded-none border-0 bg-transparent px-4 text-[15px] shadow-none focus-visible:ring-0"
            autoFocus
          />
          <div className="border-t border-gray-200" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-none border-0 bg-transparent px-4 text-[15px] shadow-none focus-visible:ring-0"
          />
          <div className="border-t border-gray-200" />
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password (8+ characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-none border-0 bg-transparent px-4 pr-10 text-[15px] shadow-none focus-visible:ring-0"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Button
          type="submit"
          disabled={!canContinue || isSubmitting}
          className="h-12 w-full rounded-lg bg-primary text-sm font-medium"
        >
          Continue
        </Button>
        <Link
          to="/signup"
          className="text-center text-sm text-gray-400 hover:text-gray-600"
        >
          Back
        </Link>
      </div>
    </Form>
  );
}
