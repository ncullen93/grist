import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export default function SignupAccount() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const canContinue =
    firstName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 8;

  return (
    <>
      <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors focus-within:border-gray-400">
        <Input
          id="firstName"
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

      <div className="flex flex-col gap-4">
        <Button
          onClick={() => navigate("/signup/welcome")}
          disabled={!canContinue}
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
    </>
  );
}
