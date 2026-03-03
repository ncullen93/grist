import { Link } from "react-router";
import { Button } from "~/components/ui/button";

export default function SignupSubmitted() {
  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="text-sm font-medium text-gray-900">Next steps</p>
        <ol className="mt-4 space-y-4">
          <li className="flex items-start gap-3 text-[15px] text-gray-600">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
              1
            </span>
            We verify your address against historic registries.
          </li>
          <li className="flex items-start gap-3 text-[15px] text-gray-600">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
              2
            </span>
            We'll reach out if we have any questions.
          </li>
          <li className="flex items-start gap-3 text-[15px] text-gray-600">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
              3
            </span>
            Once approved, you'll receive an invite.
          </li>
        </ol>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          asChild
          className="h-12 w-full rounded-lg bg-primary text-sm font-medium"
        >
          <Link to="/">Back to home</Link>
        </Button>
        <p className="text-center text-xs text-gray-400">
          Demo mode — no application was actually submitted
        </p>
      </div>
    </>
  );
}
