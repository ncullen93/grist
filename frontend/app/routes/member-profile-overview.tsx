import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { BlockEditor, newBlockId } from "~/components/block-editor";
import type { Block } from "~/components/block-editor";

// Demo content to pre-populate
const demoBlocks: Block[] = [
  {
    id: newBlockId(),
    type: "text",
    style: "normal",
    content:
      "Owner of a 1905 Colonial Revival in Brewster. Passionate about preserving the character of historic homes while making them livable for modern families.",
  },
  {
    id: newBlockId(),
    type: "text",
    style: "normal",
    content:
      "We purchased The Demo House in 2019, drawn in by the original hardwood floors, the wrap-around porch, and the sprawling backyard that backs up to a cranberry bog. The previous owners had done some updates over the years — a new roof in 2010, updated electrical — but much of the home's original character remained intact.",
  },
  {
    id: newBlockId(),
    type: "image",
    preview:
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=900&h=500&fit=crop",
  },
  {
    id: newBlockId(),
    type: "text",
    style: "normal",
    content:
      "Our first major project was restoring the original windows. The house has 32 windows, each with the original wavy glass panes. Rather than replacing them, we worked with a local craftsman to repair the sashes, add weatherstripping, and install interior storm windows. It was more expensive than replacement vinyl, but the character is irreplaceable.",
  },
  {
    id: newBlockId(),
    type: "text",
    style: "normal",
    content:
      "We've since tackled the kitchen — keeping the original butler's pantry layout but updating the appliances and countertops — and are currently working on restoring the plaster walls in the upstairs bedrooms.",
  },
];

export default function MemberProfileOverviewPage() {
  const [blocks, setBlocks] = useState<Block[]>(demoBlocks);
  const [saved, setSaved] = useState(false);

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
            <Button className="rounded-full px-8 shrink-0" onClick={handleSave}>
              {saved ? "Saved!" : "Save"}
            </Button>
          </div>
        </div>

        {/* Content card */}
        <div className="mt-4">
          <BlockEditor
            blocks={blocks}
            setBlocks={setBlocks}
            placeholder="Write about yourself and your home..."
          />
        </div>
      </div>
    </>
  );
}
