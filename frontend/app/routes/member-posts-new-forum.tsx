import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { Plus, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { PageHeader } from "~/components/page-header";
import { allChannels } from "~/lib/demo-data";

type Block =
  | { id: number; type: "text"; content: string }
  | { id: number; type: "image"; preview: string };

let _blockId = 0;
function newId() {
  return ++_blockId;
}

export default function MemberPostsNewForumPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [channel, setChannel] = useState("general");
  const [blocks, setBlocks] = useState<Block[]>([
    { id: newId(), type: "text", content: "" },
  ]);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeBlockId = useRef<number | null>(null);
  const activeCursorPos = useRef<number>(0);
  const textareaEls = useRef<Map<number, HTMLTextAreaElement>>(new Map());
  const imageEls = useRef<Map<number, HTMLDivElement>>(new Map());

  const updateText = (id: number, content: string) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content } : b)));
  };

  const removeBlock = (id: number) => {
    setSelectedImageId(null);
    setBlocks((prev) => {
      const filtered = prev.filter((b) => b.id !== id);
      if (filtered.length === 0) {
        return [{ id: newId(), type: "text" as const, content: "" }];
      }
      const merged: Block[] = [];
      for (const block of filtered) {
        const last = merged[merged.length - 1];
        if (block.type === "text" && last?.type === "text") {
          merged[merged.length - 1] = {
            ...last,
            content: last.content + block.content,
          };
        } else {
          merged.push(block);
        }
      }
      return merged;
    });
  };

  const trackCursor = useCallback((blockId: number) => {
    const el = textareaEls.current.get(blockId);
    if (el) {
      activeBlockId.current = blockId;
      activeCursorPos.current = el.selectionStart ?? el.value.length;
    }
  }, []);

  const focusTextBlock = useCallback(
    (blockId: number, pos: "start" | "end") => {
      requestAnimationFrame(() => {
        const el = textareaEls.current.get(blockId);
        if (el) {
          el.focus();
          const p = pos === "start" ? 0 : el.value.length;
          el.setSelectionRange(p, p);
        }
      });
    },
    [],
  );

  const handleTextareaKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>, blockId: number) => {
      const el = e.currentTarget;
      const pos = el.selectionStart;

      if (e.key === "ArrowDown" && el.value.indexOf("\n", pos) === -1) {
        const idx = blocks.findIndex((b) => b.id === blockId);
        const next = blocks[idx + 1];
        if (next?.type === "image") {
          e.preventDefault();
          setSelectedImageId(next.id);
          imageEls.current.get(next.id)?.focus();
        }
      }

      if (
        e.key === "ArrowUp" &&
        (pos === 0 || el.value.lastIndexOf("\n", pos - 1) === -1)
      ) {
        const idx = blocks.findIndex((b) => b.id === blockId);
        const prev = blocks[idx - 1];
        if (prev?.type === "image") {
          e.preventDefault();
          setSelectedImageId(prev.id);
          imageEls.current.get(prev.id)?.focus();
        }
      }
    },
    [blocks],
  );

  const handleImageKeyDown = useCallback(
    (e: React.KeyboardEvent, blockId: number) => {
      const idx = blocks.findIndex((b) => b.id === blockId);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = blocks[idx + 1];
        if (next?.type === "text") {
          setSelectedImageId(null);
          focusTextBlock(next.id, "start");
        }
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = blocks[idx - 1];
        if (prev?.type === "text") {
          setSelectedImageId(null);
          focusTextBlock(prev.id, "end");
        }
      }

      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        const prev = blocks[idx - 1];
        const next = blocks[idx + 1];
        if (prev?.type === "text") {
          focusTextBlock(prev.id, "end");
        } else if (next?.type === "text") {
          focusTextBlock(next.id, "start");
        }
        removeBlock(blockId);
      }
    },
    [blocks, focusTextBlock],
  );

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);

    const focusedId = activeBlockId.current;
    const cursorPos = activeCursorPos.current;

    setBlocks((prev) => {
      const idx = prev.findIndex(
        (b) => b.id === focusedId && b.type === "text",
      );

      if (idx === -1) {
        const afterId = newId();
        return [
          ...prev,
          { id: newId(), type: "image" as const, preview },
          { id: afterId, type: "text" as const, content: "" } as Block,
        ];
      }

      const block = prev[idx] as Block & { type: "text" };
      const before = block.content.slice(0, cursorPos);
      const after = block.content.slice(cursorPos);
      const afterId = newId();

      const newBlocks: Block[] = [];
      if (before) {
        newBlocks.push({ id: block.id, type: "text", content: before });
      }
      newBlocks.push({ id: newId(), type: "image", preview });
      newBlocks.push({ id: afterId, type: "text", content: after });

      const result = [...prev];
      result.splice(idx, 1, ...newBlocks);

      requestAnimationFrame(() => {
        const el = textareaEls.current.get(afterId);
        if (el) {
          el.focus();
          el.setSelectionRange(0, 0);
        }
      });

      return result;
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
      <PageHeader title="New Forum Post" />
      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-8 pb-48">
        {/* Hidden file input */}
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />

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
            By Margaret H. &middot; Savannah, GA
          </p>

          {/* Channel selector */}
          <div className="mt-4 flex items-center gap-3">
            {allChannels.map((ch) => (
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
        <div className="mt-4 rounded-xl border border-border bg-background p-6">
          <div>
            {blocks.map((block, i) =>
              block.type === "text" ? (
                <AutoGrowTextarea
                  key={block.id}
                  value={block.content}
                  onChange={(v) => updateText(block.id, v)}
                  onCursorChange={() => trackCursor(block.id)}
                  onKeyDown={(e) => handleTextareaKeyDown(e, block.id)}
                  onFocus={() => setSelectedImageId(null)}
                  registerEl={(el) => {
                    if (el) textareaEls.current.set(block.id, el);
                    else textareaEls.current.delete(block.id);
                  }}
                  isFirst={i === 0 && blocks.every((b) => b.type === "text")}
                  placeholder={i === 0 ? "Write your post..." : ""}
                />
              ) : (
                <div
                  key={block.id}
                  ref={(el) => {
                    if (el) imageEls.current.set(block.id, el);
                    else imageEls.current.delete(block.id);
                  }}
                  tabIndex={0}
                  onKeyDown={(e) => handleImageKeyDown(e, block.id)}
                  onClick={() => {
                    setSelectedImageId(block.id);
                    imageEls.current.get(block.id)?.focus();
                  }}
                  onFocus={() => setSelectedImageId(block.id)}
                  onBlur={() =>
                    setSelectedImageId((cur) => (cur === block.id ? null : cur))
                  }
                  className={`relative rounded-xl overflow-hidden outline-none transition-shadow my-4 ${
                    selectedImageId === block.id ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <img
                    src={block.preview}
                    alt=""
                    className="w-full object-cover rounded-xl"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBlock(block.id);
                    }}
                    className={`absolute top-3 right-3 size-8 rounded-full bg-black/50 text-white hover:bg-black/70 transition-opacity ${
                      selectedImageId === block.id
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ),
            )}
          </div>

          {/* Add image button */}
          <div className="mt-6 pt-6 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full gap-2"
            >
              <Plus className="size-4" />
              Image
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function AutoGrowTextarea({
  value,
  onChange,
  placeholder,
  onCursorChange,
  onKeyDown,
  onFocus,
  registerEl,
  isFirst = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onCursorChange: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onFocus: () => void;
  registerEl: (el: HTMLTextAreaElement | null) => void;
  isFirst?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      const minH = isFirst ? 160 : 0;
      ref.current.style.height =
        Math.max(ref.current.scrollHeight, minH) + "px";
    }
  }, [value, isFirst]);

  return (
    <textarea
      ref={(el) => {
        ref.current = el;
        registerEl(el);
      }}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        onCursorChange();
      }}
      onFocus={() => {
        onFocus();
        onCursorChange();
      }}
      onClick={onCursorChange}
      onKeyUp={onCursorChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      rows={1}
      className={`w-full resize-none border-0 bg-transparent px-0 py-0 text-base leading-relaxed outline-none placeholder:text-muted-foreground ${isFirst ? "min-h-40" : "min-h-0"}`}
    />
  );
}
