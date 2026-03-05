import { Link } from "react-router";
import { Button } from "~/components/ui/button";

export default function SignupWelcome() {
  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="text-sm font-medium text-gray-900">Next steps</p>
        <ol className="mt-4 space-y-4">
          <li className="flex items-start gap-3 text-[15px] text-gray-600">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
              1
            </span>
            Your account has been created.
          </li>
          <li className="flex items-start gap-3 text-[15px] text-gray-600">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
              2
            </span>
            Browse the forum, events, and directory.
          </li>
          <li className="flex items-start gap-3 text-[15px] text-gray-600">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
              3
            </span>
            Set up your profile whenever you're ready.
          </li>
        </ol>
      </div>

      <Button
        asChild
        className="h-12 w-full rounded-lg bg-primary text-sm font-medium"
      >
        <Link to="/m/home">Go to dashboard</Link>
      </Button>
    </>
  );
}
