import { useState } from "react";
import { HelpCircle, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";

const requestTypes = [
  { value: "help", label: "Help request" },
  { value: "bug", label: "Bug report" },
  { value: "suggestion", label: "Suggestion" },
];

export function HelpDialog() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [type, setType] = useState("help");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  function handleClose(next: boolean) {
    setOpen(next);
    if (!next) {
      setTimeout(() => {
        setSubmitted(false);
        setType("help");
      }, 200);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <button
        onClick={() => setOpen(true)}
        className="cursor-pointer flex items-center justify-center size-10 rounded-full transition-colors hover:ring-2 hover:ring-border"
      >
        <HelpCircle className="size-5 text-muted-foreground" />
      </button>
      <DialogContent className="sm:max-w-lg">
        {submitted ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 size-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Send className="size-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold font-display text-foreground">
              Thanks for reaching out!
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We'll get back to you within 24 hours.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => handleClose(false)}
            >
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">
                How can we help?
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="mt-2 space-y-4">
              <div>
                <div className="mt-2 mb-6 flex gap-2">
                  {requestTypes.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setType(opt.value)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                        type === opt.value
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label
                  htmlFor="help-subject"
                  className="text-sm font-medium text-foreground"
                >
                  Subject
                </label>
                <input
                  id="help-subject"
                  type="text"
                  required
                  placeholder="Brief summary"
                  className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label
                  htmlFor="help-message"
                  className="text-sm font-medium text-foreground"
                >
                  Message
                </label>
                <textarea
                  id="help-message"
                  required
                  rows={4}
                  placeholder="Describe your issue or idea..."
                  className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleClose(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
