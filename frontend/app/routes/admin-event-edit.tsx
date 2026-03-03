import { useState } from "react";
import { Form, Link, useNavigation, useActionData } from "react-router";
import type { Route } from "./+types/admin-event-edit";
import { apiGet, apiPatch, apiDelete } from "~/lib/api.server";
import { redirect } from "react-router";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Plus, X } from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/30";

export async function loader({ request, params }: Route.LoaderArgs) {
  const [meRes, eventRes] = await Promise.all([
    apiGet(request, "/api/auth/me/"),
    apiGet(request, `/api/events/${params.id}/`),
  ]);

  if (!meRes.ok) return redirect("/login");
  const user = await meRes.json();
  if (!user.is_staff) return redirect("/m");

  if (!eventRes.ok) return redirect("/m/admin");
  const event = await eventRes.json();

  return { user, event };
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const res = await apiDelete(request, `/api/events/${params.id}/`);
    if (res.ok || res.status === 204) return redirect("/m/admin");
    return { error: "Failed to delete event." };
  }

  const body = {
    title: formData.get("title"),
    subtitle: formData.get("subtitle") || "",
    description: formData.get("description") || "",
    long_description: JSON.parse(
      (formData.get("long_description") as string) || "[]"
    ),
    date: formData.get("date") || "",
    date_start: formData.get("date_start") || null,
    time: formData.get("time") || "",
    type: formData.get("type") || "In Person",
    status: formData.get("status") || "upcoming",
    image: formData.get("image") || "",
    spots: formData.get("spots") ? Number(formData.get("spots")) : null,
    featured: formData.get("featured") === "on",
    agenda: JSON.parse((formData.get("agenda") as string) || "[]"),
    speaker: formData.get("speaker_name")
      ? {
          name: formData.get("speaker_name"),
          role: formData.get("speaker_role") || "",
        }
      : undefined,
  };

  const res = await apiPatch(request, `/api/events/${params.id}/`, body);

  if (!res.ok) {
    const errors = await res.json().catch(() => ({}));
    return { error: "Failed to update event.", details: errors };
  }

  return redirect("/m/admin");
}

interface AgendaItem {
  time: string;
  title: string;
}

export default function AdminEventEditPage({
  loaderData,
}: Route.ComponentProps) {
  const { event } = loaderData;
  const actionData = useActionData<{ error?: string; details?: unknown }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [eventType, setEventType] = useState(event.type || "In Person");
  const [status, setStatus] = useState(event.status || "upcoming");
  const [agenda, setAgenda] = useState<AgendaItem[]>(
    event.agenda?.map((a: { time: string; title: string }) => ({
      time: a.time,
      title: a.title,
    })) || []
  );
  const [longDescription, setLongDescription] = useState<string[]>(
    event.long_description?.length ? event.long_description : [""]
  );

  const addAgendaItem = () => {
    setAgenda([...agenda, { time: "", title: "" }]);
  };

  const removeAgendaItem = (index: number) => {
    setAgenda(agenda.filter((_, i) => i !== index));
  };

  const updateAgendaItem = (
    index: number,
    field: keyof AgendaItem,
    value: string
  ) => {
    setAgenda(
      agenda.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const updateParagraph = (index: number, value: string) => {
    setLongDescription(longDescription.map((p, i) => (i === index ? value : p)));
  };

  const addParagraph = () => {
    setLongDescription([...longDescription, ""]);
  };

  const removeParagraph = (index: number) => {
    if (longDescription.length <= 1) return;
    setLongDescription(longDescription.filter((_, i) => i !== index));
  };

  const dateStartValue = event.date_start
    ? new Date(event.date_start).toISOString().slice(0, 16)
    : "";

  return (
    <>
      <header className="px-4 md:px-8 h-18 flex items-center bg-background shrink-0 border-b border-border sticky top-0 z-10">
        <Link
          to="/m/admin"
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Admin
        </Link>
      </header>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {actionData?.error && (
          <div className="mb-6 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {actionData.error}
          </div>
        )}

        <Form method="post">
          {/* Hidden fields for complex data */}
          <input type="hidden" name="type" value={eventType} />
          <input type="hidden" name="status" value={status} />
          <input
            type="hidden"
            name="agenda"
            value={JSON.stringify(agenda.filter((a) => a.time || a.title))}
          />
          <input
            type="hidden"
            name="long_description"
            value={JSON.stringify(longDescription.filter((p) => p.trim()))}
          />

          {/* Basic Info */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-sidebar">
              <h3 className="text-sm font-semibold text-foreground">
                Basic Information
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-6 items-start">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2.5">
                  Title *
                </label>
                <input
                  name="title"
                  required
                  defaultValue={event.title}
                  placeholder="Event title"
                  className={inputClass}
                />
              </div>
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-6 items-start">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2.5">
                  Subtitle
                </label>
                <input
                  name="subtitle"
                  defaultValue={event.subtitle}
                  placeholder="Short subtitle"
                  className={inputClass}
                />
              </div>
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-6 items-start">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2.5">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={event.description}
                  placeholder="Brief description shown in event cards"
                  rows={3}
                  className={inputClass}
                />
              </div>
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-6 items-start">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2.5">
                  Type
                </label>
                <div className="flex gap-3 pt-1">
                  {["In Person", "Virtual"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEventType(t)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                        eventType === t
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-6 items-start">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2.5">
                  Status
                </label>
                <div className="flex gap-3 pt-1">
                  {["upcoming", "past"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer capitalize ${
                        status === s
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="mt-8 rounded-lg border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-sidebar">
              <h3 className="text-sm font-semibold text-foreground">
                Date & Time
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-6 items-start">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2.5">
                  Display Date
                </label>
                <input
                  name="date"
                  defaultValue={event.date}
                  placeholder='e.g. "March 15, 2026"'
                  className={inputClass}
                />
              </div>
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-6 items-start">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2.5">
                  Start Date
                </label>
                <input
                  name="date_start"
                  type="datetime-local"
                  defaultValue={dateStartValue}
                  className={inputClass}
                />
              </div>
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-6 items-start">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2.5">
                  Time Display
                </label>
                <input
                  name="time"
                  defaultValue={event.time}
                  placeholder='e.g. "6:00 PM - 8:00 PM"'
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="mt-8 rounded-lg border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-sidebar">
              <h3 className="text-sm font-semibold text-foreground">
                Details
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-6 items-start">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2.5">
                  Image URL
                </label>
                <input
                  name="image"
                  type="url"
                  defaultValue={event.image}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-6 items-start">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2.5">
                  Spots
                </label>
                <input
                  name="spots"
                  type="number"
                  min="1"
                  defaultValue={event.spots || ""}
                  placeholder="Leave empty for unlimited"
                  className={inputClass}
                />
              </div>
              <div className="px-6 py-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Featured event
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Show this event prominently on the events page
                  </p>
                </div>
                <FeaturedToggle defaultChecked={event.featured} />
              </div>
            </div>
          </div>

          {/* Long Description */}
          <div className="mt-8 rounded-lg border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-sidebar flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Long Description
              </h3>
              <button
                type="button"
                onClick={addParagraph}
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
              >
                + Add paragraph
              </button>
            </div>
            <div className="px-6 py-5 space-y-3">
              {longDescription.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <textarea
                    value={p}
                    onChange={(e) => updateParagraph(i, e.target.value)}
                    placeholder={`Paragraph ${i + 1}`}
                    rows={3}
                    className={`${inputClass} flex-1`}
                  />
                  {longDescription.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeParagraph(i)}
                      className="text-muted-foreground hover:text-destructive transition-colors self-start mt-2 cursor-pointer"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Speaker */}
          <div className="mt-8 rounded-lg border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-sidebar">
              <h3 className="text-sm font-semibold text-foreground">
                Speaker
                <span className="font-normal text-muted-foreground ml-2">
                  Optional
                </span>
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-6 items-start">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2.5">
                  Name
                </label>
                <input
                  name="speaker_name"
                  defaultValue={event.speaker?.name || ""}
                  placeholder="Speaker name"
                  className={inputClass}
                />
              </div>
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-6 items-start">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2.5">
                  Role
                </label>
                <input
                  name="speaker_role"
                  defaultValue={event.speaker?.role || ""}
                  placeholder='e.g. "Interior Designer"'
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Agenda */}
          <div className="mt-8 rounded-lg border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-sidebar flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Agenda
                <span className="font-normal text-muted-foreground ml-2">
                  Optional
                </span>
              </h3>
              <button
                type="button"
                onClick={addAgendaItem}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
              >
                <Plus className="size-3.5" />
                Add item
              </button>
            </div>
            <div className="px-6 py-5">
              {agenda.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No agenda items yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {agenda.map((item, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <input
                        value={item.time}
                        onChange={(e) =>
                          updateAgendaItem(i, "time", e.target.value)
                        }
                        placeholder="Time"
                        className={`${inputClass} w-36 shrink-0`}
                      />
                      <input
                        value={item.title}
                        onChange={(e) =>
                          updateAgendaItem(i, "title", e.target.value)
                        }
                        placeholder="Activity"
                        className={`${inputClass} flex-1`}
                      />
                      <button
                        type="button"
                        onClick={() => removeAgendaItem(i)}
                        className="text-muted-foreground hover:text-destructive transition-colors mt-2.5 cursor-pointer"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit + Delete */}
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full px-8"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
              <Link
                to="/m/admin"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </Link>
            </div>
            <Form method="post">
              <input type="hidden" name="intent" value="delete" />
              <Button
                type="submit"
                variant="outline"
                className="rounded-full text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={(e) => {
                  if (
                    !confirm(
                      `Delete "${event.title}"? This cannot be undone.`
                    )
                  ) {
                    e.preventDefault();
                  }
                }}
              >
                Delete Event
              </Button>
            </Form>
          </div>
        </Form>
      </div>
    </>
  );
}

function FeaturedToggle({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <>
      <input type="hidden" name="featured" value={checked ? "on" : ""} />
      <button
        type="button"
        onClick={() => setChecked(!checked)}
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
    </>
  );
}
