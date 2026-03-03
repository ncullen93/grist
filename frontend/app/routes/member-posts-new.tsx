import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { ChevronDown, Plus, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { PageHeader } from "~/components/page-header";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "~/components/ui/dropdown-menu";

type TextStyle = "normal" | "h1" | "h2" | "h3" | "h4";

const styleLabels: Record<TextStyle, string> = {
  normal: "Normal text",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
};

const styleClasses: Record<TextStyle, string> = {
  normal: "text-base leading-relaxed",
  h1: "text-3xl font-display font-semibold leading-tight",
  h2: "text-2xl font-display font-semibold leading-tight",
  h3: "text-xl font-display font-semibold leading-snug",
  h4: "text-lg font-display font-medium leading-snug",
};

type Block =
  | { id: number; type: "text"; content: string; style: TextStyle }
  | { id: number; type: "image"; preview: string };

let _blockId = 0;
function newId() {
  return ++_blockId;
}

export default function MemberPostsNewPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([
    { id: newId(), type: "text", content: "", style: "normal" },
  ]);
  const [activeStyle, setActiveStyle] = useState<TextStyle>("normal");
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeBlockId = useRef<number | null>(null);
  const activeCursorPos = useRef<number>(0);
  const textareaEls = useRef<Map<number, HTMLTextAreaElement>>(new Map());
  const imageEls = useRef<Map<number, HTMLDivElement>>(new Map());

  const updateText = (id: number, content: string) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content } : b)));
  };

  const updateStyle = (id: number, style: TextStyle) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id && b.type === "text" ? { ...b, style } : b)),
    );
    setActiveStyle(style);
  };

  const removeBlock = (id: number) => {
    setSelectedImageId(null);
    setBlocks((prev) => {
      const filtered = prev.filter((b) => b.id !== id);
      if (filtered.length === 0) {
        return [
          {
            id: newId(),
            type: "text" as const,
            content: "",
            style: "normal" as TextStyle,
          },
        ];
      }
      // Merge adjacent text blocks
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

  const trackCursor = useCallback(
    (blockId: number) => {
      const el = textareaEls.current.get(blockId);
      if (el) {
        activeBlockId.current = blockId;
        activeCursorPos.current = el.selectionStart ?? el.value.length;
      }
      const block = blocks.find((b) => b.id === blockId);
      if (block?.type === "text") {
        setActiveStyle(block.style);
      }
    },
    [blocks],
  );

  // Focus a text block at a specific position
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

  // Handle keyboard in textareas: Enter splits blocks, arrows navigate across blocks
  const handleTextareaKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>, blockId: number) => {
      const el = e.currentTarget;
      const pos = el.selectionStart;

      // Enter: split into a new block
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const before = el.value.slice(0, pos);
        const after = el.value.slice(pos);
        const idx = blocks.findIndex((b) => b.id === blockId);
        const block = blocks[idx] as Block & { type: "text" };
        const afterId = newId();

        setBlocks((prev) => {
          const result = [...prev];
          result.splice(
            idx,
            1,
            {
              id: block.id,
              type: "text" as const,
              content: before,
              style: block.style,
            },
            {
              id: afterId,
              type: "text" as const,
              content: after,
              style: "normal" as TextStyle,
            },
          );
          return result;
        });

        requestAnimationFrame(() => {
          const newEl = textareaEls.current.get(afterId);
          if (newEl) {
            newEl.focus();
            newEl.setSelectionRange(0, 0);
          }
        });
        return;
      }

      // ArrowDown at end of text → next block
      if (e.key === "ArrowDown" && el.value.indexOf("\n", pos) === -1) {
        const idx = blocks.findIndex((b) => b.id === blockId);
        const next = blocks[idx + 1];
        if (next?.type === "image") {
          e.preventDefault();
          setSelectedImageId(next.id);
          imageEls.current.get(next.id)?.focus();
        } else if (next?.type === "text") {
          e.preventDefault();
          focusTextBlock(next.id, "start");
        }
      }

      // ArrowUp at start of text → prev block
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
        } else if (prev?.type === "text") {
          e.preventDefault();
          focusTextBlock(prev.id, "end");
        }
      }

      // Backspace at start of block → merge with previous text block
      if (e.key === "Backspace" && pos === 0 && el.selectionEnd === 0) {
        const idx = blocks.findIndex((b) => b.id === blockId);
        const prev = blocks[idx - 1];
        if (prev?.type === "text") {
          e.preventDefault();
          const mergePos = prev.content.length;
          setBlocks((p) => {
            const result = [...p];
            result.splice(idx - 1, 2, {
              id: prev.id,
              type: "text" as const,
              content: prev.content + el.value,
              style: prev.style,
            });
            return result;
          });
          requestAnimationFrame(() => {
            const prevEl = textareaEls.current.get(prev.id);
            if (prevEl) {
              prevEl.focus();
              prevEl.setSelectionRange(mergePos, mergePos);
            }
          });
        }
      }
    },
    [blocks, focusTextBlock],
  );

  // Handle keys on a selected image
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
        // Focus the text block before or after
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
          {
            id: afterId,
            type: "text" as const,
            content: "",
            style: "normal" as TextStyle,
          } as Block,
        ];
      }

      const block = prev[idx] as Block & { type: "text" };
      const before = block.content.slice(0, cursorPos);
      const after = block.content.slice(cursorPos);
      const afterId = newId();

      const newBlocks: Block[] = [];
      if (before) {
        newBlocks.push({
          id: block.id,
          type: "text",
          content: before,
          style: block.style,
        });
      }
      newBlocks.push({ id: newId(), type: "image", preview });
      newBlocks.push({
        id: afterId,
        type: "text",
        content: after,
        style: "normal" as TextStyle,
      });

      const result = [...prev];
      result.splice(idx, 1, ...newBlocks);

      // Focus the text block after the image
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
      <PageHeader title="New Blog Post" />
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
            By Margaret H. &middot; Brewster, MA
          </p>
        </div>

        {/* Content card */}
        <div className="mt-4 rounded-xl border border-border bg-background">
          {/* Toolbar */}
          <div className="sticky top-18 z-10 flex items-center gap-3 border-b border-border bg-background px-6 py-5 rounded-t-xl">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-1.5 min-w-[130px] justify-between"
                >
                  {styleLabels[activeStyle]}
                  <ChevronDown className="size-3.5 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-48"
                onCloseAutoFocus={(e) => {
                  e.preventDefault();
                  const id = activeBlockId.current;
                  if (id !== null) {
                    const el = textareaEls.current.get(id);
                    if (el) el.focus();
                  }
                }}
              >
                <DropdownMenuRadioGroup
                  value={activeStyle}
                  onValueChange={(v) => {
                    const id = activeBlockId.current;
                    if (id !== null) updateStyle(id, v as TextStyle);
                  }}
                >
                  <DropdownMenuRadioItem value="normal" className="text-sm">
                    Normal text
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value="h1"
                    className="text-lg font-display font-semibold"
                  >
                    Heading 1
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value="h2"
                    className="text-base font-display font-semibold"
                  >
                    Heading 2
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value="h3"
                    className="text-[15px] font-display font-semibold"
                  >
                    Heading 3
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value="h4"
                    className="text-sm font-display font-medium"
                  >
                    Heading 4
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
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

          <div className="p-6">
            {blocks.map((block, i) =>
              block.type === "text" ? (
                <AutoGrowTextarea
                  key={block.id}
                  value={block.content}
                  style={block.style}
                  onChange={(v) => updateText(block.id, v)}
                  onCursorChange={() => trackCursor(block.id)}
                  onKeyDown={(e) => handleTextareaKeyDown(e, block.id)}
                  onFocus={() => setSelectedImageId(null)}
                  registerEl={(el) => {
                    if (el) textareaEls.current.set(block.id, el);
                    else textareaEls.current.delete(block.id);
                  }}
                  placeholder={
                    i === 0 && blocks.length === 1 ? "Start writing..." : ""
                  }
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
        </div>
      </div>
    </>
  );
}

function AutoGrowTextarea({
  value,
  style = "normal",
  onChange,
  placeholder,
  onCursorChange,
  onKeyDown,
  onFocus,
  registerEl,
}: {
  value: string;
  style?: TextStyle;
  onChange: (value: string) => void;
  placeholder: string;
  onCursorChange: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onFocus: () => void;
  registerEl: (el: HTMLTextAreaElement | null) => void;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [value, style]);

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
      className={`w-full resize-none border-0 bg-transparent px-0 py-0 outline-none placeholder:text-muted-foreground ${styleClasses[style]} min-h-0`}
    />
  );
}
