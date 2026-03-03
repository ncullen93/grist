import { useState } from "react";
import { Form, useNavigation } from "react-router";
import type { Route } from "./+types/signup-address";
import { apiPost } from "~/lib/api.server";
import { redirect } from "react-router";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const code = ((formData.get("code") as string) || "").trim();
  const address = ((formData.get("address") as string) || "").trim();

  if (address && !code) {
    return redirect("/signup/apply");
  }

  if (!code) {
    return { error: "Please enter an activation code or address." };
  }

  try {
    const res = await apiPost(request, "/api/auth/validate-code/", { code });
    const data = await res.json();

    if (!data.valid) {
      return { error: "Invalid or expired activation code." };
    }

    return redirect(`/signup/account?code=${encodeURIComponent(code)}`);
  } catch {
    return { error: "Unable to connect to server. Please try again." };
  }
}

export default function SignupAddress({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [address, setAddress] = useState("");
  const [code, setCode] = useState("");

  const hasAddress = address.trim().length > 0;
  const hasCode = code.trim().length > 0;
  const canContinue = hasAddress || hasCode;

  return (
    <Form method="post" className="flex flex-col gap-9">
      <div className="space-y-5">
        {actionData?.error && (
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {actionData.error}
          </div>
        )}

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700"
          >
            Home address
          </label>
          <Input
            id="address"
            name="address"
            type="text"
            placeholder="123 Main St, Brewster, MA"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              if (e.target.value) setCode("");
            }}
            className="mt-1.5 h-12 bg-white text-[15px]"
            autoFocus
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
            or
          </span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-gray-700"
          >
            Activation code
          </label>
          <Input
            id="code"
            name="code"
            type="text"
            placeholder="GRIST-XXXX-XXXX"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (e.target.value) setAddress("");
            }}
            className="mt-1.5 h-12 bg-white font-mono tracking-wider text-[15px]"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={!canContinue || isSubmitting}
        className="h-12 w-full rounded-lg bg-primary text-sm font-medium"
      >
        {isSubmitting ? "Checking..." : "Continue"}
      </Button>
    </Form>
  );
}
