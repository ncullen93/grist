import { Form, useNavigation, useFetcher } from "react-router";
import { useRef, useState, useEffect } from "react";
import type { Route } from "./+types/member-profile";
import { apiGet, apiPatch, apiUpload } from "~/lib/api.server";
import { redirect } from "react-router";
import { Link } from "react-router";
import { Pencil, ImagePlus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { PageHeader } from "~/components/page-header";
import toast from "react-hot-toast";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const res = await apiGet(request, "/api/members/me/");
    if (!res.ok) return redirect("/login");
    return { profile: await res.json() };
  } catch {
    return redirect("/login");
  }
}

export async function action({ request }: Route.ActionArgs) {
  const contentType = request.headers.get("content-type") || "";

  // Image upload — forward multipart to Django
  if (contentType.includes("multipart/form-data")) {
    try {
      const res = await apiUpload(
        request,
        "/api/members/upload/",
        await request.arrayBuffer(),
        contentType,
      );
      if (!res.ok) return { error: "Upload failed." };
      const data = await res.json();
      return { url: data.url };
    } catch {
      return { error: "Upload failed." };
    }
  }

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  // Save photo URL to profile
  if (intent === "save_photo") {
    try {
      const res = await apiPatch(request, "/api/members/me/", {
        photo: formData.get("photo"),
      });
      if (!res.ok) return { error: "Failed to save photo." };
      const profile = await res.json();
      return { photoSaved: true, photo: profile.photo };
    } catch {
      return { error: "Unable to connect to server." };
    }
  }

  const photo = formData.get("photo") as string;
  const body: Record<string, unknown> = {
    name: formData.get("name"),
    location: formData.get("location"),
    home_name: formData.get("home_name"),
    home_year: formData.get("home_year"),
    home_style: formData.get("home_style"),
    registry: formData.get("registry"),
    ...(photo ? { photo } : {}),
  };

  try {
    const res = await apiPatch(request, "/api/members/me/", body);
    if (!res.ok) {
      return { error: "Failed to save profile." };
    }
    return { success: true };
  } catch {
    return { error: "Unable to connect to server." };
  }
}

export default function MyProfilePage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const { profile } = loaderData;

  const uploadFetcher = useFetcher();
  const photoFetcher = useFetcher();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(
    profile.photo || null,
  );

  // When upload returns a URL, save it to the profile immediately
  const savedUrlRef = useRef<string | null>(null);
  useEffect(() => {
    const url = uploadFetcher.data?.url;
    if (uploadFetcher.state === "idle" && url && url !== savedUrlRef.current) {
      savedUrlRef.current = url;
      setCurrentPhoto(url);
      photoFetcher.submit(
        { intent: "save_photo", photo: url },
        { method: "post" },
      );
    }
  }, [uploadFetcher.state, uploadFetcher.data]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    uploadFetcher.submit(formData, {
      method: "post",
      encType: "multipart/form-data",
    });
    // Reset so the same file can be re-selected
    e.target.value = "";
  };

  const isUploading = uploadFetcher.state !== "idle" || photoFetcher.state !== "idle";

  // Toast on save success/error
  useEffect(() => {
    if (actionData?.success) toast.success("Profile saved");
    if (actionData?.error) toast.error(actionData.error);
  }, [actionData]);

  return (
    <>
      <PageHeader title="Profile" />
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Avatar + name header */}
        <div className="flex items-center gap-5">
          <div className="size-16 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-xl font-display font-bold text-primary-foreground">
              {profile.name?.charAt(0) || "?"}
            </span>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">
              {profile.name}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Member since{" "}
              {profile.member_since
                ? new Date(profile.member_since).getFullYear()
                : "—"}
            </p>
          </div>
        </div>

        <Form method="post">
          {currentPhoto && (
            <input type="hidden" name="photo" value={currentPhoto} />
          )}
          {/* Personal info */}
          <div className="mt-8 rounded-lg border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-sidebar">
              <h3 className="text-sm font-semibold text-foreground">
                Personal Information
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-6 items-start">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2.5">
                  Name
                </label>
                <input
                  name="name"
                  type="text"
                  defaultValue={profile.name || ""}
                  key={profile.name}
                  className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/30"
                />
              </div>
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-6 items-start">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2.5">
                  Location
                </label>
                <input
                  name="location"
                  type="text"
                  defaultValue={profile.location || ""}
                  key={profile.location}
                  className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/30"
                />
              </div>
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-6 items-start">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2.5">
                  Home Photo
                </label>
                <div className="flex items-center gap-4">
                  {currentPhoto && (
                    <img
                      src={currentPhoto}
                      alt="Home"
                      className="size-20 rounded-lg object-cover shrink-0"
                    />
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="size-3.5 mr-2" />
                    {currentPhoto ? "Change" : "Upload"}
                  </Button>
                </div>
              </div>
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-6 items-start">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2.5">
                  Bio
                </label>
                <Link
                  to="/m/profile/overview"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors w-fit"
                >
                  <Pencil className="size-3.5" />
                  Edit
                </Link>
              </div>
            </div>
          </div>

          {/* Home details */}
          <div className="mt-8 rounded-lg border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-sidebar">
              <h3 className="text-sm font-semibold text-foreground">
                Home Details
              </h3>
            </div>
            <div className="divide-y divide-border">
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-6 items-start">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2.5">
                  Home name
                </label>
                <input
                  name="home_name"
                  type="text"
                  defaultValue={profile.home_name || ""}
                  key={profile.home_name}
                  className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/30"
                />
              </div>
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-6 items-start">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2.5">
                  Year built
                </label>
                <input
                  name="home_year"
                  type="text"
                  defaultValue={profile.home_year || ""}
                  key={profile.home_year}
                  className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/30"
                />
              </div>
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-6 items-start">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2.5">
                  Style
                </label>
                <input
                  name="home_style"
                  type="text"
                  defaultValue={profile.home_style || ""}
                  key={profile.home_style}
                  className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/30"
                />
              </div>
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-6 items-start">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2.5">
                  Registry
                </label>
                <input
                  name="registry"
                  type="text"
                  defaultValue={profile.registry || ""}
                  key={profile.registry}
                  className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/30"
                />
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="mt-8">
            <Button
              type="submit"
              className="rounded-full px-8"
              disabled={isSubmitting}
            >
              Save changes
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
}
