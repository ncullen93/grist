import { useState } from "react";
import { useNavigate } from "react-router";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

export default function SignupAddress() {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [code, setCode] = useState("");

  const hasAddress = address.trim().length > 0;
  const hasCode = code.trim().length > 0;
  const canContinue = hasAddress || hasCode;

  function handleContinue() {
    if (hasCode) {
      navigate("/signup/account");
    } else {
      navigate("/signup/apply");
    }
  }

  return (
    <>
      <div className="space-y-5">
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700"
          >
            Home address
          </label>
          <Input
            id="address"
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
        onClick={handleContinue}
        disabled={!canContinue}
        className="h-12 w-full rounded-lg bg-primary text-sm font-medium"
      >
        Continue
      </Button>
    </>
  );
}
