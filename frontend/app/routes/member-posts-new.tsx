import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { PageHeader } from "~/components/page-header";
import { BlockEditor, newBlockId } from "~/components/block-editor";
import type { Block } from "~/components/block-editor";

export default function MemberPostsNewPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([
    { id: newBlockId(), type: "text", content: "", style: "normal" },
  ]);

  const hasContent =
    title.trim() !== "" &&
    blocks.some(
      (b) =>
        (b.type === "text" && b.content.trim() !== "") || b.type === "image",
    );

  const handlePublish = () => {
    if (!hasContent) return;
    navigate("/m/posts");
  };

  return (
    <>
      <PageHeader title="New Blog Post" />
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
              disabled={!hasContent}
            >
              Publish
            </Button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            By Margaret H. &middot; Brewster, MA
          </p>
        </div>

        {/* Content card */}
        <div className="mt-4">
          <BlockEditor
            blocks={blocks}
            setBlocks={setBlocks}
            placeholder="Start writing..."
          />
        </div>
      </div>
    </>
  );
}
