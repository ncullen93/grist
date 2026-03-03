import { Link } from "react-router";
import { Button } from "~/components/ui/button";

export default function SignupWelcome() {
  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="text-sm font-medium text-gray-900">What happens next</p>
        <ul className="mt-4 space-y-3 text-sm text-gray-500">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
              1
            </span>
            We verify your home against public registries.
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
              2
            </span>
            You get an email once approved (usually within a day).
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
              3
            </span>
            Start connecting with other historic homeowners.
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          asChild
          className="h-12 w-full rounded-lg bg-primary text-sm font-medium"
        >
          <Link to="/m">Go to dashboard</Link>
        </Button>
        <p className="text-center text-xs text-gray-400">
          Demo mode — no account was actually created
        </p>
      </div>
    </>
  );
}
