import { useState, useRef, useEffect } from "react";
import { useFetcher } from "react-router";
import { redirect } from "react-router";
import toast from "react-hot-toast";
import type { Route } from "./+types/member-posts-edit-marketplace";
import { apiGet, apiPatch, apiUpload } from "~/lib/api.server";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { PageHeader } from "~/components/page-header";
import { BlockEditor, newBlockId } from "~/components/block-editor";
import type { Block } from "~/components/block-editor";

type ListingCategory = "for-sale" | "wanted" | "free";

const categories: { label: string; value: ListingCategory }[] = [
  { label: "For Sale", value: "for-sale" },
  { label: "Wanted", value: "wanted" },
  { label: "Free", value: "free" },
];

export async function loader({ request, params }: Route.LoaderArgs) {
  try {
    const [profileRes, listingRes] = await Promise.all([
      apiGet(request, "/api/members/me/"),
      apiGet(request, `/api/marketplace/listings/${params.id}/`),
    ]);
    if (!profileRes.ok) return redirect("/login");
    if (!listingRes.ok) throw new Response("Listing not found", { status: 404 });
    const profile = await profileRes.json();
    const listing = await listingRes.json();
    return {
      name: profile.name,
      location: profile.location,
      listing: {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        category: listing.category,
        price: listing.price,
        image: listing.image,
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

  // Update marketplace listing
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const price = (formData.get("price") as string) || "";
  const image = (formData.get("image") as string) || "";

  try {
    const res = await apiPatch(request, `/api/marketplace/listings/${params.id}/`, {
      title,
      description,
      category,
      price,
      image,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { error: err.detail || "Failed to save listing." };
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

export default function EditMarketplaceListingPage({
  loaderData,
}: Route.ComponentProps) {
  const { listing } = loaderData;
  const [title, setTitle] = useState(listing.title);
  const [category, setCategory] = useState<ListingCategory>(
    (listing.category as ListingCategory) || "for-sale",
  );
  const [price, setPrice] = useState(listing.price || "");
  const [blocks, setBlocks] = useState<Block[]>(() =>
    parseBlocks(listing.description),
  );
  const [images, setImages] = useState<
    { id: number; preview: string; uploaded?: boolean }[]
  >(() =>
    listing.image
      ? [{ id: 0, preview: listing.image, uploaded: true }]
      : [],
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);
  const publishFetcher = useFetcher();
  const uploadFetcher = useFetcher();
  const isSaving = publishFetcher.state === "submitting";

  useEffect(() => {
    if (publishFetcher.state === "idle" && publishFetcher.data?.saved) {
      toast.success("Saved");
    }
  }, [publishFetcher.state, publishFetcher.data]);

  // Promise resolve ref for the async gallery image upload
  const pendingResolve = useRef<
    ((url: string) => void) | null
  >(null);

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

  const uploadFile = (file: File): Promise<string> => {
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

  const isUploading = uploadFetcher.state !== "idle";

  const handleImageSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (fileInputRef.current) fileInputRef.current.value = "";

    for (const file of Array.from(files)) {
      const localId = ++nextId.current;
      const localPreview = URL.createObjectURL(file);
      setImages((prev) => [...prev, { id: localId, preview: localPreview }]);

      // Upload and replace preview with real URL
      const url = await uploadFile(file);
      setImages((prev) =>
        prev.map((img) =>
          img.id === localId
            ? { ...img, preview: url, uploaded: true }
            : img,
        ),
      );
    }
  };

  const removeImage = (id: number) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const hasContent =
    title.trim() !== "" &&
    blocks.some((b) => b.type === "text" && b.content.trim() !== "");

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

    // Use the first uploaded image as the listing image
    const mainImage = images.find((img) => img.uploaded)?.preview || "";

    publishFetcher.submit(
      {
        title,
        description: JSON.stringify(cleanBlocks),
        category,
        price: category === "for-sale" ? price : "",
        image: mainImage,
      },
      { method: "post" },
    );
  };

  return (
    <>
      <PageHeader title="Edit Listing" />
      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-8 pb-48">
        {/* Hidden file input */}
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
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
              onClick={handleSave}
              disabled={!hasContent || isSaving || isUploading}
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
        <div className="mt-4 rounded-xl bg-background">
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
                {!img.uploaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Loader2 className="size-5 text-white animate-spin" />
                  </div>
                )}
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
              <ImagePlus className="size-6" />
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
