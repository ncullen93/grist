import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { Plus, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { PageHeader } from "~/components/page-header";
import { BlockEditor, newBlockId } from "~/components/block-editor";
import type { Block } from "~/components/block-editor";
import type { ListingCategory } from "~/lib/demo-data";

const categories: { label: string; value: ListingCategory }[] = [
  { label: "For Sale", value: "for-sale" },
  { label: "Wanted", value: "wanted" },
  { label: "Free", value: "free" },
];

export default function MemberPostsNewMarketplacePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ListingCategory>("for-sale");
  const [price, setPrice] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([
    { id: newBlockId(), type: "text", content: "", style: "normal" },
  ]);
  const [images, setImages] = useState<{ id: number; preview: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);

  const hasContent =
    title.trim() !== "" &&
    blocks.some((b) => b.type === "text" && b.content.trim() !== "");

  const handlePublish = () => {
    if (!hasContent) return;
    navigate("/m/posts");
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setImages((prev) => [...prev, { id: ++nextId.current, preview }]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (id: number) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <>
      <PageHeader title="New Marketplace Listing" />
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
              placeholder="What are you listing?"
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
        </div>

        {/* Category + Price */}
        <div className="mt-4 rounded-xl border border-border bg-background px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    category === cat.value
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            {category === "for-sale" && (
              <Input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price (e.g. $500)"
                className="w-40"
              />
            )}
          </div>
        </div>

        {/* Photos card */}
        <div className="mt-4 rounded-xl border border-border bg-background p-6">
          <p className="text-sm font-medium text-foreground mb-4">Photos</p>
          <div className="grid grid-cols-4 gap-3">
            {images.map((img) => (
              <div
                key={img.id}
                className="group relative aspect-square rounded-xl overflow-hidden"
              >
                <img
                  src={img.preview}
                  alt=""
                  className="size-full object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeImage(img.id)}
                  className="absolute top-2 right-2 size-7 rounded-full bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            ))}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
            >
              <Plus className="size-6" />
            </button>
          </div>
        </div>

        {/* Content card */}
        <div className="mt-4">
          <BlockEditor
            blocks={blocks}
            setBlocks={setBlocks}
            placeholder="Describe your item..."
            showImages={false}
          />
        </div>
      </div>
    </>
  );
}
