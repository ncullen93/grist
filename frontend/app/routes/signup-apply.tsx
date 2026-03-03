import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

export default function SignupApply() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const canContinue = fullName.trim().length > 0 && email.trim().length > 0;

  return (
    <>
      <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors focus-within:border-gray-400">
        <Input
          id="fullName"
          type="text"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="h-12 rounded-none border-0 bg-transparent px-4 text-[15px] shadow-none focus-visible:ring-0"
          autoFocus
        />
        <div className="border-t border-gray-200" />
        <Input
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 rounded-none border-0 bg-transparent px-4 text-[15px] shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="flex flex-col gap-4">
        <Button
          onClick={() => navigate("/signup/submitted")}
          disabled={!canContinue}
          className="h-12 w-full rounded-lg bg-primary text-sm font-medium"
        >
          Submit application
        </Button>
        <Link
          to="/signup"
          className="text-center text-sm text-gray-400 hover:text-gray-600"
        >
          Back
        </Link>
      </div>
    </>
  );
}
