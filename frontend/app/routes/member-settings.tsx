import { useState } from "react";
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
import { apiGet, apiPatch } from "~/lib/api.server";
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

  // Show toast on save result
  if (fetcher.data?.saved) {
    toast.success("Saved");
    fetcher.data.saved = false; // prevent re-toast
  }
  if (fetcher.data?.error) {
    toast.error(fetcher.data.error);
    fetcher.data.error = null;
  }

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
        <div className="mt-8 rounded-lg border border-destructive/30 overflow-hidden">
          <div className="px-6 py-4 border-b border-destructive/30 bg-destructive/5">
            <h3 className="text-sm font-semibold text-destructive">
              Danger Zone
            </h3>
          </div>
          <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">
                Leave this club
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                You will lose access to all member content and events.
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-full text-destructive border-destructive/30 hover:bg-destructive/10 shrink-0"
            >
              Leave club
            </Button>
          </div>
        </div>

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
