import { useState, useRef, useEffect } from "react";
import { useFetcher } from "react-router";
import { redirect } from "react-router";
import type { Route } from "./+types/member-posts-new-forum";
import { apiGet, apiPost, apiUpload } from "~/lib/api.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { PageHeader } from "~/components/page-header";
import { BlockEditor, newBlockId } from "~/components/block-editor";
import type { Block } from "~/components/block-editor";

interface Channel {
  id: number;
  name: string;
  slug: string;
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const [profileRes, channelsRes] = await Promise.all([
      apiGet(request, "/api/members/me/"),
      apiGet(request, "/api/forum/channels/"),
    ]);
    if (!profileRes.ok) return redirect("/login");
    const profile = await profileRes.json();
    const channels: Channel[] = channelsRes.ok ? await channelsRes.json() : [];
    return { name: profile.name, location: profile.location, channels };
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
      if (!res.ok) return { error: "Upload failed" };
      const data = await res.json();
      return { url: data.url };
    } catch {
      return { error: "Upload failed" };
    }
  }

  // Create forum post
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const channel = formData.get("channel") as string;

  // Extract first image from blocks as the post image
  let image = "";
  try {
    const blocks = JSON.parse(body);
    const imgBlock = blocks.find((b: { type: string }) => b.type === "image");
    if (imgBlock) image = imgBlock.preview;
  } catch {}

  try {
    const res = await apiPost(request, "/api/forum/posts/", {
      title,
      body,
      image,
      channel,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { error: err.detail || "Failed to create post." };
    }
    return redirect("/m/posts");
  } catch {
    return { error: "Unable to connect to server." };
  }
}

export default function MemberPostsNewForumPage({
  loaderData,
}: Route.ComponentProps) {
  const [title, setTitle] = useState("");
  const [channel, setChannel] = useState(
    loaderData.channels[0]?.slug || "general",
  );
  const [blocks, setBlocks] = useState<Block[]>([
    { id: newBlockId(), type: "text", content: "", style: "normal" },
  ]);
  const publishFetcher = useFetcher();
  const uploadFetcher = useFetcher();
  const isPublishing = publishFetcher.state === "submitting";

  // Promise resolve ref for the async upload callback
  const pendingResolve = useRef<((url: string) => void) | null>(null);

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

  const hasContent =
    title.trim() !== "" &&
    blocks.some(
      (b) =>
        (b.type === "text" && b.content.trim() !== "") || b.type === "image",
    );

  const handlePublish = () => {
    if (!hasContent) return;
    const cleanBlocks = blocks
      .filter(
        (b) =>
          b.type === "image" || b.content.trim() !== "" || blocks.length === 1,
      )
      .map((b) => {
        if (b.type === "text") {
          return { type: b.type, style: b.style, content: b.content };
        }
        return { type: b.type, preview: b.preview };
      });

    publishFetcher.submit(
      { title, body: JSON.stringify(cleanBlocks), channel },
      { method: "post" },
    );
  };

  return (
    <>
      <PageHeader title="New Forum Post" />
      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-8 pb-48">
        {/* Header card */}
        <div className="rounded-xl border border-border bg-background p-6">
          <div className="flex items-center gap-4">
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="text-3xl! h-auto min-w-0 flex-1 border-0 bg-transparent px-0 py-0 font-display font-semibold shadow-none focus-visible:ring-0 focus-visible:border-0"
              autoFocus
            />
            <Button
              className="rounded-full px-8 shrink-0"
              onClick={handlePublish}
              disabled={!hasContent || isPublishing}
            >
              {isPublishing ? "Publishing..." : "Publish"}
            </Button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            By {loaderData.name} &middot; {loaderData.location}
          </p>
          {publishFetcher.data?.error && (
            <p className="mt-2 text-sm text-destructive">
              {publishFetcher.data.error}
            </p>
          )}
        </div>

        {/* Channel selector */}
        <div className="mt-4 rounded-xl border border-border bg-background px-6 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            {loaderData.channels.map((ch) => (
              <button
                key={ch.slug}
                onClick={() => setChannel(ch.slug)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  channel === ch.slug
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {ch.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content card */}
        <div className="mt-4">
          <BlockEditor
            blocks={blocks}
            setBlocks={setBlocks}
            placeholder="Write your post..."
            onFileUpload={handleFileUpload}
          />
        </div>
      </div>
    </>
  );
}
