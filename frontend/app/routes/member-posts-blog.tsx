import { useState, useRef, useEffect } from "react";
import { useFetcher } from "react-router";
import { redirect } from "react-router";
import toast from "react-hot-toast";
import type { Route } from "./+types/member-posts-blog";
import { apiGet, apiPatch, apiUpload } from "~/lib/api.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { PageHeader } from "~/components/page-header";
import { BlockEditor, newBlockId } from "~/components/block-editor";
import type { Block } from "~/components/block-editor";

function parseBlocks(content: string): Block[] {
  if (!content) {
    return [{ id: newBlockId(), type: "text", content: "", style: "normal" }];
  }
  try {
    const blocks = JSON.parse(content);
    if (Array.isArray(blocks)) {
      if (blocks.length === 0) {
        return [{ id: newBlockId(), type: "text", content: "", style: "normal" }];
      }
      return blocks.map(
        (b: { type: string; style?: string; content?: string; preview?: string }): Block => {
          if (b.type === "image" && b.preview) {
            return { id: newBlockId(), type: "image", preview: b.preview };
          }
          return {
            id: newBlockId(),
            type: "text",
            content: b.content || "",
            style: (b.style || "normal") as "normal",
          };
        },
      );
    }
  } catch {}
  return [{ id: newBlockId(), type: "text", content, style: "normal" }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  try {
    const [profileRes, postRes] = await Promise.all([
      apiGet(request, "/api/members/me/"),
      apiGet(request, `/api/blog/posts/${params.id}/`),
    ]);
    if (!profileRes.ok) return redirect("/login");
    if (!postRes.ok) throw new Response("Post not found", { status: 404 });
    const profile = await profileRes.json();
    const post = await postRes.json();
    return {
      name: profile.name,
      location: profile.location,
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        image: post.image,
        status: post.status as string,
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
        contentType,
      );
      if (!res.ok) return { error: "Upload failed" };
      const data = await res.json();
      return { url: data.url };
    } catch {
      return { error: "Upload failed" };
    }
  }

  const formData = await request.formData();
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const postStatus = (formData.get("status") as string) || "published";

  // Extract first image from blocks as the post image
  let image = "";
  try {
    const blocks = JSON.parse(content);
    const imgBlock = blocks.find((b: { type: string }) => b.type === "image");
    if (imgBlock) image = imgBlock.preview;
  } catch {}

  const payload: Record<string, string> = { title, content, status: postStatus, image };

  try {
    const res = await apiPatch(request, `/api/blog/posts/${params.id}/`, payload);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { error: err.detail || "Failed to save." };
    }
    if (postStatus === "published") {
      return redirect(`/m/blog/${params.id}`);
    }
    return { saved: true };
  } catch {
    return { error: "Unable to connect to server." };
  }
}

export default function BlogEditorPage({ loaderData }: Route.ComponentProps) {
  const { post } = loaderData;
  const [title, setTitle] = useState(post.title);
  const [blocks, setBlocks] = useState<Block[]>(() => parseBlocks(post.content));
  const [status, setStatus] = useState(post.status);
  const publishFetcher = useFetcher();
  const uploadFetcher = useFetcher();
  const isSubmitting = publishFetcher.state === "submitting";

  // Handle save response
  useEffect(() => {
    if (publishFetcher.state !== "idle") return;
    if (publishFetcher.data?.saved) {
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

  const isDraft = status !== "published";

  const handleSubmit = (submitStatus: "draft" | "published") => {
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
      { title, content: JSON.stringify(cleanBlocks), status: submitStatus },
      { method: "post" },
    );

    if (submitStatus === "published") {
      setStatus("published");
    }
  };

  return (
    <>
      <PageHeader title={isDraft ? "New Blog Post" : "Edit Blog Post"} />
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
            {isDraft ? (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  className="rounded-full px-6"
                  onClick={() => handleSubmit("draft")}
                  disabled={!hasContent || isSubmitting}
                >
                  Save Draft
                </Button>
                <Button
                  className="rounded-full px-8"
                  onClick={() => handleSubmit("published")}
                  disabled={!hasContent || isSubmitting}
                >
                  Publish
                </Button>
              </div>
            ) : (
              <Button
                className="rounded-full px-8 shrink-0"
                onClick={() => handleSubmit("published")}
                disabled={!hasContent || isSubmitting}
              >
                Save
              </Button>
            )}
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

        {/* Content card */}
        <div className="mt-4">
          <BlockEditor
            blocks={blocks}
            setBlocks={setBlocks}
            placeholder="Start writing..."
            onFileUpload={handleFileUpload}
          />
        </div>
      </div>
    </>
  );
}
