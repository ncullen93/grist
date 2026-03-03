import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { ArrowLeft, ChevronDown, Plus, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
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

// Demo content to pre-populate
const demoBlocks: Block[] = [
  {
    id: newId(),
    type: "text",
    style: "normal",
    content:
      "Owner of a 1905 Colonial Revival in Brewster. Passionate about preserving the character of historic homes while making them livable for modern families.",
  },
  {
    id: newId(),
    type: "text",
    style: "normal",
    content:
      "We purchased The Demo House in 2019, drawn in by the original hardwood floors, the wrap-around porch, and the sprawling backyard that backs up to a cranberry bog. The previous owners had done some updates over the years — a new roof in 2010, updated electrical — but much of the home's original character remained intact.",
  },
  {
    id: newId(),
    type: "image",
    preview:
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=900&h=500&fit=crop",
  },
  {
    id: newId(),
    type: "text",
    style: "normal",
    content:
      "Our first major project was restoring the original windows. The house has 32 windows, each with the original wavy glass panes. Rather than replacing them, we worked with a local craftsman to repair the sashes, add weatherstripping, and install interior storm windows. It was more expensive than replacement vinyl, but the character is irreplaceable.",
  },
  {
    id: newId(),
    type: "text",
    style: "normal",
    content:
      "We've since tackled the kitchen — keeping the original butler's pantry layout but updating the appliances and countertops — and are currently working on restoring the plaster walls in the upstairs bedrooms.",
  },
];

export default function MemberProfileOverviewPage() {
  const [blocks, setBlocks] = useState<Block[]>(demoBlocks);
  const [activeStyle, setActiveStyle] = useState<TextStyle>("normal");
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeBlockId = useRef<number | null>(null);
  const activeCursorPos = useRef<number>(0);
  const textareaEls = useRef<Map<number, HTMLTextAreaElement>>(new Map());
  const imageEls = useRef<Map<number, HTMLDivElement>>(new Map());

  const updateText = (id: number, content: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, content } : b)),
    );
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
        return [{ id: newId(), type: "text" as const, content: "", style: "normal" as TextStyle }];
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
    const block = blocks.find((b) => b.id === blockId);
    if (block?.type === "text") {
      setActiveStyle(block.style);
    }
  }, [blocks]);

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

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const before = el.value.slice(0, pos);
        const after = el.value.slice(pos);
        const idx = blocks.findIndex((b) => b.id === blockId);
        const block = blocks[idx] as Block & { type: "text" };
        const afterId = newId();

        setBlocks((prev) => {
          const result = [...prev];
          result.splice(idx, 1,
            { id: block.id, type: "text" as const, content: before, style: block.style },
            { id: afterId, type: "text" as const, content: after, style: "normal" as TextStyle },
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

      if (e.key === "ArrowUp" && (pos === 0 || el.value.lastIndexOf("\n", pos - 1) === -1)) {
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
          { id: afterId, type: "text" as const, content: "", style: "normal" as TextStyle } as Block,
        ];
      }

      const block = prev[idx] as Block & { type: "text" };
      const before = block.content.slice(0, cursorPos);
      const after = block.content.slice(cursorPos);
      const afterId = newId();

      const newBlocks: Block[] = [];
      if (before) {
        newBlocks.push({ id: block.id, type: "text", content: before, style: block.style });
      }
      newBlocks.push({ id: newId(), type: "image", preview });
      newBlocks.push({ id: afterId, type: "text", content: after, style: "normal" as TextStyle });

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

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
        {/* Hidden file input */}
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />

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
            <Button
              className="rounded-full px-8 shrink-0"
              onClick={handleSave}
            >
              {saved ? "Saved!" : "Save"}
            </Button>
          </div>
        </div>

        {/* Content card */}
        <div className="mt-4 rounded-xl border border-border bg-background">
          {/* Toolbar */}
          <div className="sticky top-18 z-10 flex items-center gap-3 border-b border-border bg-background px-6 py-5 rounded-t-xl">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full gap-1.5 min-w-[130px] justify-between">
                  {styleLabels[activeStyle]}
                  <ChevronDown className="size-3.5 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48" onCloseAutoFocus={(e) => {
                    e.preventDefault();
                    const id = activeBlockId.current;
                    if (id !== null) {
                      const el = textareaEls.current.get(id);
                      if (el) el.focus();
                    }
                  }}>
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
                  <DropdownMenuRadioItem value="h1" className="text-lg font-display font-semibold">
                    Heading 1
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="h2" className="text-base font-display font-semibold">
                    Heading 2
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="h3" className="text-[15px] font-display font-semibold">
                    Heading 3
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="h4" className="text-sm font-display font-medium">
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
                  textStyle={block.style}
                  onChange={(v) => updateText(block.id, v)}
                  onCursorChange={() => trackCursor(block.id)}
                  onKeyDown={(e) => handleTextareaKeyDown(e, block.id)}
                  onFocus={() => setSelectedImageId(null)}
                  registerEl={(el) => {
                    if (el) textareaEls.current.set(block.id, el);
                    else textareaEls.current.delete(block.id);
                  }}
                  placeholder={i === 0 ? "Write about yourself and your home..." : ""}
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
                    setSelectedImageId((cur) =>
                      cur === block.id ? null : cur,
                    )
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
  textStyle = "normal",
  onChange,
  placeholder,
  onCursorChange,
  onKeyDown,
  onFocus,
  registerEl,
}: {
  value: string;
  textStyle?: TextStyle;
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
  }, [value, textStyle]);

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
      className={`w-full resize-none border-0 bg-transparent px-0 py-0 outline-none placeholder:text-muted-foreground ${styleClasses[textStyle]} min-h-0`}
    />
  );
}
