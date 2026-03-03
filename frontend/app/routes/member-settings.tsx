import { useState, useEffect, useRef } from "react";
import { useFetcher, redirect } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { PageHeader } from "~/components/page-header";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { apiGet, apiPatch, apiPost } from "~/lib/api.server";
import toast from "react-hot-toast";
import type { Route } from "./+types/member-settings";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const [settingsRes, profileRes] = await Promise.all([
      apiGet(request, "/api/settings/"),
      apiGet(request, "/api/members/me/"),
    ]);
    if (!settingsRes.ok || !profileRes.ok) return redirect("/login");
    const settings = await settingsRes.json();
    const profile = await profileRes.json();
    return {
      emailNotifications: settings.email_notifications as boolean,
      eventReminders: settings.event_reminders as boolean,
      forumDigest: settings.forum_digest as boolean,
      directMessages: settings.direct_messages as boolean,
      profileVisibility: profile.profile_visibility as string,
    };
  } catch {
    return redirect("/login");
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "delete-account") {
    try {
      const res = await apiPost(request, "/api/members/delete-account/");
      if (!res.ok && res.status !== 204) {
        return { error: "Failed to delete account." };
      }
      return redirect("/");
    } catch {
      return { error: "Unable to connect to server." };
    }
  }

  const emailNotifications = formData.get("emailNotifications") === "true";
  const eventReminders = formData.get("eventReminders") === "true";
  const forumDigest = formData.get("forumDigest") === "true";
  const directMessages = formData.get("directMessages") === "true";
  const profileVisibility = formData.get("profileVisibility") as string;

  try {
    const [settingsRes, profileRes] = await Promise.all([
      apiPatch(request, "/api/settings/", {
        email_notifications: emailNotifications,
        event_reminders: eventReminders,
        forum_digest: forumDigest,
        direct_messages: directMessages,
      }),
      apiPatch(request, "/api/members/me/", {
        profile_visibility: profileVisibility,
      }),
    ]);
    if (!settingsRes.ok || !profileRes.ok) {
      const err = await settingsRes.json().catch(() => ({}));
      return { error: err.detail || "Failed to save settings." };
    }
    return { saved: true };
  } catch {
    return { error: "Unable to connect to server." };
  }
}

export default function MemberSettingsPage({ loaderData }: Route.ComponentProps) {
  const [emailNotifications, setEmailNotifications] = useState(loaderData.emailNotifications);
  const [eventReminders, setEventReminders] = useState(loaderData.eventReminders);
  const [forumDigest, setForumDigest] = useState(loaderData.forumDigest);
  const [directMessages, setDirectMessages] = useState(loaderData.directMessages);
  const [profileVisibility, setProfileVisibility] = useState(loaderData.profileVisibility);

  const fetcher = useFetcher();
  const toastShownRef = useRef<string | null>(null);

  useEffect(() => {
    if (fetcher.data?.saved && toastShownRef.current !== "saved") {
      toast.success("Saved");
      toastShownRef.current = "saved";
    } else if (fetcher.data?.error && toastShownRef.current !== fetcher.data.error) {
      toast.error(fetcher.data.error);
      toastShownRef.current = fetcher.data.error;
    }
    if (!fetcher.data) toastShownRef.current = null;
  }, [fetcher.data]);

  const handleSave = () => {
    fetcher.submit(
      {
        emailNotifications: String(emailNotifications),
        eventReminders: String(eventReminders),
        forumDigest: String(forumDigest),
        directMessages: String(directMessages),
        profileVisibility,
      },
      { method: "post" },
    );
  };

  return (
    <>
      <PageHeader title="Settings" />
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Notifications */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-sidebar">
            <h3 className="text-sm font-semibold text-foreground">
              Notifications
            </h3>
          </div>
          <div className="divide-y divide-border">
            <ToggleRow
              label="Email notifications"
              description="Receive email updates about club activity"
              checked={emailNotifications}
              onChange={setEmailNotifications}
            />
            <ToggleRow
              label="Event reminders"
              description="Get reminded about upcoming events you've RSVP'd to"
              checked={eventReminders}
              onChange={setEventReminders}
            />
            <ToggleRow
              label="Forum digest"
              description="Weekly summary of new forum discussions"
              checked={forumDigest}
              onChange={setForumDigest}
            />
            <ToggleRow
              label="Direct messages"
              description="Allow other members to send you messages"
              checked={directMessages}
              onChange={setDirectMessages}
            />
          </div>
        </div>

        {/* Privacy */}
        <div className="mt-8 rounded-lg border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-sidebar">
            <h3 className="text-sm font-semibold text-foreground">
              Privacy
            </h3>
          </div>
          <div className="divide-y divide-border">
            <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-6 items-start">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2.5">
                Profile visibility
              </label>
              <Select value={profileVisibility} onValueChange={setProfileVisibility}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="members">Members only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <DeleteAccountSection />

        {/* Save */}
        <div className="mt-8 flex items-center gap-4">
          <Button
            className="rounded-full px-8"
            onClick={handleSave}
            disabled={fetcher.state !== "idle"}
          >
            Save changes
          </Button>
        </div>
      </div>
    </>
  );
}

function DeleteAccountSection() {
  const deleteFetcher = useFetcher();
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-8 rounded-lg border border-destructive/30 overflow-hidden">
      <div className="px-6 py-4 border-b border-destructive/30 bg-destructive/5">
        <h3 className="text-sm font-semibold text-destructive">
          Danger Zone
        </h3>
      </div>
      <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            Delete account
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            This will permanently delete your account and all your data.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="rounded-full text-destructive border-destructive/30 hover:bg-destructive/10 shrink-0"
            >
              Delete account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This action is permanent. Your profile, posts, and all data will
              be permanently deleted. This cannot be undone.
            </DialogDescription>
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={deleteFetcher.state !== "idle"}
                onClick={() =>
                  deleteFetcher.submit(
                    { intent: "delete-account" },
                    { method: "post" },
                  )
                }
              >
                Delete account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="px-6 py-5 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-10 h-6 rounded-full transition-colors cursor-pointer ${
          checked ? "bg-primary" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-1 left-1 size-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
