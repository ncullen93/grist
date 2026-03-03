import { useState, useRef, useEffect } from "react";
import { Link, useFetcher } from "react-router";
import type { Route } from "./+types/member-profile-overview";
import { apiGet, apiPatch, apiUpload } from "~/lib/api.server";
import { redirect } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { BlockEditor, newBlockId } from "~/components/block-editor";
import type { Block } from "~/components/block-editor";

/**
 * Convert stored story data to Block[] format.
 * Handles both legacy string arrays and the full Block[] format.
 */
function storyToBlocks(story: unknown): Block[] {
  if (!Array.isArray(story) || story.length === 0) {
    return [{ id: newBlockId(), type: "text", style: "normal", content: "" }];
  }

  // If first element is a string, it's the legacy format (array of paragraphs)
  if (typeof story[0] === "string") {
    return story.map((text: string) => ({
      id: newBlockId(),
      type: "text" as const,
      style: "normal" as const,
      content: text,
    }));
  }

  // Full Block[] format — regenerate IDs to avoid collisions
  return story.map((block: Block) => ({
    ...block,
    id: newBlockId(),
  }));
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const res = await apiGet(request, "/api/members/me/");
    if (!res.ok) return redirect("/login");
    const profile = await res.json();
    return { story: profile.story };
  } catch {
    return redirect("/login");
  }
}

export async function action({ request }: Route.ActionArgs) {
  const contentType = request.headers.get("content-type") || "";

  // Image upload — forward multipart to Django
  if (contentType.includes("multipart/form-data")) {
    try {
      const body = await request.arrayBuffer();
      const res = await apiUpload(
        request,
        "/api/members/upload/",
        body,
        contentType
      );
      if (!res.ok) {
        return { error: "Upload failed" };
      }
      const data = await res.json();
      return { url: data.url };
    } catch {
      return { error: "Upload failed" };
    }
  }

  // Story save — JSON
  const formData = await request.formData();
  const story = JSON.parse(formData.get("story") as string);

  try {
    const res = await apiPatch(request, "/api/members/me/", { story });
    if (!res.ok) {
      return { error: "Failed to save." };
    }
    return { success: true };
  } catch {
    return { error: "Unable to connect to server." };
  }
}

export default function MemberProfileOverviewPage({
  loaderData,
}: Route.ComponentProps) {
  const [blocks, setBlocks] = useState<Block[]>(() =>
    storyToBlocks(loaderData.story)
  );
  const saveFetcher = useFetcher();
  const uploadFetcher = useFetcher();
  const isSaving = saveFetcher.state === "submitting";
  const saved = saveFetcher.data?.success && saveFetcher.state === "idle";

  // Promise resolve ref for the async upload callback
  const pendingResolve = useRef<((url: string) => void) | null>(null);

  // When uploadFetcher returns data with a url, resolve the pending promise
  useEffect(() => {
    if (
      uploadFetcher.state === "idle" &&
      uploadFetcher.data?.url &&
      pendingResolve.current
    ) {
      pendingResolve.current(uploadFetcher.data.url);
      pendingResolve.current = null;
    }
  }, [uploadFetcher.state, uploadFetcher.data]);

  const handleFileUpload = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      pendingResolve.current = resolve;
      const formData = new FormData();
      formData.append("file", file);
      uploadFetcher.submit(formData, {
        method: "post",
        encType: "multipart/form-data",
      });
    });
  };

  const handleSave = () => {
    // Strip the auto-generated IDs before saving — they're ephemeral
    const cleanBlocks = blocks
      .filter((b) => b.type === "image" || b.content.trim() !== "" || blocks.length === 1)
      .map((b) => {
        if (b.type === "text") {
          return { type: b.type, style: b.style, content: b.content };
        }
        return { type: b.type, preview: b.preview };
      });

    saveFetcher.submit(
      { story: JSON.stringify(cleanBlocks) },
      { method: "post" }
    );
  };

  return (
    <>
      <header className="px-4 md:px-8 h-18 flex items-center bg-background shrink-0 border-b border-border sticky top-0 z-10">
        <Link
          to="/m/profile"
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Profile
        </Link>
      </header>
      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-8 pb-48">
        {/* Header */}
        <div className="rounded-xl border border-border bg-background p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-xl font-semibold text-foreground">
                Overview
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                This will appear on your member profile page.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {saved && (
                <span className="text-sm text-primary">Saved!</span>
              )}
              <Button
                className="rounded-full px-8"
                onClick={handleSave}
                disabled={isSaving}
              >
                Save
              </Button>
            </div>
          </div>
        </div>

        {/* Content card */}
        <div className="mt-4">
          <BlockEditor
            blocks={blocks}
            setBlocks={setBlocks}
            placeholder="Write about yourself and your home..."
            onFileUpload={handleFileUpload}
          />
        </div>
      </div>
    </>
  );
}
