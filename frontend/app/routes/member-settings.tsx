import { useState } from "react";
import { Button } from "~/components/ui/button";
import { PageHeader } from "~/components/page-header";

export default function MemberSettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [forumDigest, setForumDigest] = useState(false);
  const [directMessages, setDirectMessages] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState("members");
  const [settingsSaved, setSettingsSaved] = useState(false);

  const handleSettingsSave = () => {
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
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
              <select
                value={profileVisibility}
                onChange={(e) => setProfileVisibility(e.target.value)}
                className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/30"
              >
                <option value="everyone">Everyone</option>
                <option value="members">Members only</option>
                <option value="private">Private</option>
              </select>
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
            onClick={handleSettingsSave}
          >
            {settingsSaved ? "Saved!" : "Save changes"}
          </Button>
          {settingsSaved && (
            <p className="text-sm text-primary">
              Your settings have been updated.
            </p>
          )}
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
