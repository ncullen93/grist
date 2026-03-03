import { useState, useRef, useEffect } from "react";
import { useFetcher } from "react-router";
import { redirect } from "react-router";
import toast from "react-hot-toast";
import type { Route } from "./+types/member-posts-edit-forum";
import { apiGet, apiPatch, apiUpload } from "~/lib/api.server";
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

export async function loader({ request, params }: Route.LoaderArgs) {
  try {
    const [profileRes, postRes, channelsRes] = await Promise.all([
      apiGet(request, "/api/members/me/"),
      apiGet(request, `/api/forum/posts/${params.id}/`),
      apiGet(request, "/api/forum/channels/"),
    ]);
    if (!profileRes.ok) return redirect("/login");
    if (!postRes.ok) throw new Response("Post not found", { status: 404 });
    const profile = await profileRes.json();
    const post = await postRes.json();
    const channels: Channel[] = channelsRes.ok ? await channelsRes.json() : [];
    return {
      name: profile.name,
      location: profile.location,
      channels,
      post: {
        id: post.id,
        title: post.title,
        body: post.body,
        image: post.image,
        channel_slug: post.channel_slug,
      },
    };
  } catch (e) {
    if (e instanceof Response) throw e;
    return redirect("/login");
  }
}

export async function action({ request, params }: Route.ActionArgs) {
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

  // Update forum post
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
    const res = await apiPatch(request, `/api/forum/posts/${params.id}/`, {
      title,
      body,
      image,
      channel,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { error: err.detail || "Failed to save post." };
    }
    return { saved: true };
  } catch {
    return { error: "Unable to connect to server." };
  }
}

function parseBlocks(content: string): Block[] {
  try {
    const blocks = JSON.parse(content);
    if (Array.isArray(blocks)) {
      return blocks.map((b: { type: string; style?: string; content?: string; preview?: string }): Block => {
        if (b.type === "image" && b.preview) {
          return { id: newBlockId(), type: "image", preview: b.preview };
        }
        return { id: newBlockId(), type: "text", content: b.content || "", style: (b.style || "normal") as "normal" };
      });
    }
  } catch {}
  return [{ id: newBlockId(), type: "text", content, style: "normal" }];
}

export default function EditForumPostPage({
  loaderData,
}: Route.ComponentProps) {
  const { post } = loaderData;
  const [title, setTitle] = useState(post.title);
  const [channel, setChannel] = useState(post.channel_slug || "general");
  const [blocks, setBlocks] = useState<Block[]>(() => parseBlocks(post.body));
  const publishFetcher = useFetcher();
  const uploadFetcher = useFetcher();
  const isSaving = publishFetcher.state === "submitting";

  useEffect(() => {
    if (publishFetcher.state === "idle" && publishFetcher.data?.saved) {
      toast.success("Saved");
    }
  }, [publishFetcher.state, publishFetcher.data]);

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

  const handleSave = () => {
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
      <PageHeader title="Edit Forum Post" />
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
              onClick={handleSave}
              disabled={!hasContent || isSaving}
            >
              Save
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
