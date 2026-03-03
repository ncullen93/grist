import { useState } from "react";
import { Link, useLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import { allMembers } from "~/lib/demo-data";

const memberSlugMap = new Map(
  allMembers.map((m) => [m.name, m.slug]),
);

interface Reply {
  id: number;
  author: string;
  location: string;
  homePhoto: string;
  time: string;
  body: string;
}

interface Post {
  id: number;
  author: string;
  location: string;
  homePhoto: string;
  time: string;
  channel: string;
  topics: string[];
  title: string;
  body: string;
  image?: string;
  likes: number;
  pinned: boolean;
  replies: Reply[];
}

const allChannels = [
  { name: "General", slug: "general" },
  { name: "Restoration Advice", slug: "restoration-advice" },
  { name: "Before & After", slug: "before-and-after" },
  { name: "Contractor Recs", slug: "contractor-recs" },
  { name: "Introductions", slug: "introductions" },
];

const allTopics = [
  "Windows & Doors",
  "Tax Credits",
  "Insurance",
  "Lead Paint",
  "Plaster & Masonry",
];

const allPosts: Post[] = [
  {
    id: 1,
    author: "Margaret H.",
    location: "Savannah, GA",
    homePhoto:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=80&h=80&fit=crop&crop=center",
    time: "2 hours ago",
    channel: "restoration-advice",
    topics: ["Plaster & Masonry"],
    title: "Repointing brick on an 1840s home \u2014 lime mortar vs. Portland?",
    body: "Our mason is suggesting Portland cement but I\u2019ve read that lime mortar is more appropriate for pre-1920 construction. The bricks are soft handmade ones and I\u2019m worried about trapping moisture. Would love to hear from anyone who\u2019s been through this.",
    likes: 23,
    pinned: false,
    replies: [
      {
        id: 101,
        author: "James W.",
        location: "Charleston, SC",
        homePhoto:
          "https://images.unsplash.com/photo-1525883405167-fc4e76c7713a?w=80&h=80&fit=crop&crop=center",
        time: "1 hour ago",
        body: "Lime mortar is absolutely the right call for pre-1920 soft brick. Portland is too hard and will cause spalling. We used a natural hydraulic lime (NHL 3.5) on our 1892 Queen Anne and it\u2019s held up beautifully for three years now.",
      },
      {
        id: 102,
        author: "Robert E.",
        location: "New Orleans, LA",
        homePhoto:
          "https://images.unsplash.com/photo-1519227355453-8f982e425321?w=80&h=80&fit=crop&crop=center",
        time: "45 min ago",
        body: "Same experience here. Our mason initially pushed Portland but we insisted on lime. The key is finding a mason who has actually worked with it before \u2014 the technique is different. Happy to share our guy\u2019s contact if you\u2019re near the Southeast.",
      },
      {
        id: 103,
        author: "Susan P.",
        location: "Hudson, NY",
        homePhoto:
          "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=80&h=80&fit=crop&crop=center",
        time: "30 min ago",
        body: "The Preservation Brief #2 from the National Park Service has excellent guidance on this. It specifically warns against Portland cement on historic masonry. Worth printing out and handing to your mason.",
      },
    ],
  },
  {
    id: 2,
    author: "James W.",
    location: "Charleston, SC",
    homePhoto:
      "https://images.unsplash.com/photo-1525883405167-fc4e76c7713a?w=80&h=80&fit=crop&crop=center",
    time: "4 hours ago",
    channel: "general",
    topics: ["Tax Credits"],
    title: "Federal tax credit approved \u2014 happy to share the process",
    body: "Just got our 20% credit approved on our 1892 Queen Anne. The documentation was intense but absolutely worth it. If anyone is considering it, I\u2019m happy to walk you through what worked for us.",
    likes: 45,
    pinned: true,
    replies: [
      {
        id: 201,
        author: "Caroline A.",
        location: "Richmond, VA",
        homePhoto:
          "https://images.unsplash.com/photo-1757992141434-983a12b82da3?w=80&h=80&fit=crop&crop=center",
        time: "3 hours ago",
        body: "Congratulations! We\u2019re starting this process on our Italianate. Would you say the Part 2 application was the most time-consuming part? And did you use a consultant or handle it yourselves?",
      },
      {
        id: 202,
        author: "James W.",
        location: "Charleston, SC",
        homePhoto:
          "https://images.unsplash.com/photo-1525883405167-fc4e76c7713a?w=80&h=80&fit=crop&crop=center",
        time: "2 hours ago",
        body: "Part 2 was definitely the most work \u2014 lots of before photos and detailed descriptions of what we planned to do. We used a preservation consultant for the application itself ($2,500) and it was worth every penny. They knew exactly what the reviewers look for.",
      },
    ],
  },
  {
    id: 3,
    author: "Caroline A.",
    location: "Richmond, VA",
    homePhoto:
      "https://images.unsplash.com/photo-1757992141434-983a12b82da3?w=80&h=80&fit=crop&crop=center",
    time: "6 hours ago",
    channel: "before-and-after",
    topics: ["Windows & Doors"],
    title: "Restored original pocket doors in our 1870 Italianate",
    body: "The hardware was all still intact behind the wall \u2014 just needed to be freed up and refinished. Three months of weekends but the result is incredible. The doors are solid walnut with original brass pulls.",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=400&fit=crop&crop=center",
    likes: 89,
    pinned: false,
    replies: [
      {
        id: 301,
        author: "Eleanor M.",
        location: "Newport, RI",
        homePhoto:
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=80&h=80&fit=crop&crop=center",
        time: "5 hours ago",
        body: "These are stunning! Did you strip and refinish them in place or were you able to remove them? We have a similar situation in our Stick Style cottage but the doors seem stuck in the wall cavity.",
      },
      {
        id: 302,
        author: "Caroline A.",
        location: "Richmond, VA",
        homePhoto:
          "https://images.unsplash.com/photo-1757992141434-983a12b82da3?w=80&h=80&fit=crop&crop=center",
        time: "4 hours ago",
        body: "We were able to remove them from the pocket by taking off the door casing on one side. The main issue was that decades of paint had sealed them in. A heat gun and patience got them free. Once out, we stripped them with Citristrip in the garage.",
      },
    ],
  },
  {
    id: 4,
    author: "Robert E.",
    location: "New Orleans, LA",
    homePhoto:
      "https://images.unsplash.com/photo-1519227355453-8f982e425321?w=80&h=80&fit=crop&crop=center",
    time: "8 hours ago",
    channel: "contractor-recs",
    topics: ["Plaster & Masonry"],
    title: "Plaster specialist needed \u2014 New Orleans area",
    body: "We have ornamental ceiling medallions in our 1856 Greek Revival that need stabilization. Two contractors have already told us to just tear it all out and drywall. Not happening. Looking for someone who knows historic plaster.",
    likes: 15,
    pinned: false,
    replies: [
      {
        id: 401,
        author: "Margaret H.",
        location: "Savannah, GA",
        homePhoto:
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=80&h=80&fit=crop&crop=center",
        time: "7 hours ago",
        body: "Try reaching out to the Preservation Resource Center of New Orleans \u2014 they maintain a list of tradespeople experienced with historic homes. Also, Big Easy Plaster has done ornamental work on several properties in the Garden District.",
      },
    ],
  },
  {
    id: 5,
    author: "Susan P.",
    location: "Hudson, NY",
    homePhoto:
      "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=80&h=80&fit=crop&crop=center",
    time: "12 hours ago",
    channel: "general",
    topics: [],
    title: "Our 1790 stone farmhouse just made the National Register",
    body: "It\u2019s been a two-year process with our SHPO but we finally got the certification. The research into the home\u2019s history alone was worth the effort \u2014 we learned things about this property that five generations of owners never knew.",
    likes: 67,
    pinned: false,
    replies: [
      {
        id: 501,
        author: "Thomas G.",
        location: "Lexington, KY",
        homePhoto:
          "https://images.unsplash.com/photo-1497219055242-93359eeed651?w=80&h=80&fit=crop&crop=center",
        time: "11 hours ago",
        body: "Congratulations! That\u2019s a huge milestone. Did you work with a preservation consultant for the nomination, or did you handle the research and application yourself?",
      },
      {
        id: 502,
        author: "Susan P.",
        location: "Hudson, NY",
        homePhoto:
          "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=80&h=80&fit=crop&crop=center",
        time: "10 hours ago",
        body: "We did most of the research ourselves \u2014 county deed records, old maps, and census data. Our SHPO liaison was incredibly helpful and reviewed our drafts before submission. The whole process cost us about $800 in filing fees.",
      },
    ],
  },
  {
    id: 6,
    author: "David C.",
    location: "San Francisco, CA",
    homePhoto:
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=80&h=80&fit=crop&crop=center",
    time: "1 day ago",
    channel: "restoration-advice",
    topics: ["Windows & Doors"],
    title: "Earthquake retrofit without destroying original features?",
    body: "We need to do a seismic upgrade on our 1895 Painted Lady. Has anyone done this while keeping the original plaster walls and wood-frame windows intact? Every contractor we\u2019ve talked to wants to gut the interior.",
    likes: 38,
    pinned: false,
    replies: [
      {
        id: 601,
        author: "Patricia Q.",
        location: "Portland, ME",
        homePhoto:
          "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=80&h=80&fit=crop&crop=center",
        time: "22 hours ago",
        body: "Look into soft-story retrofit specialists who work on Victorians specifically. There are firms in the Bay Area that do foundation bolting and cripple wall bracing from underneath without touching the interior at all. The city\u2019s soft-story program should have a list.",
      },
    ],
  },
  {
    id: 7,
    author: "Eleanor M.",
    location: "Newport, RI",
    homePhoto:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=80&h=80&fit=crop&crop=center",
    time: "1 day ago",
    channel: "before-and-after",
    topics: ["Windows & Doors"],
    title: "Six months of window restoration \u2014 all 32 done",
    body: "Finally finished restoring every original window in our 1868 Stick Style cottage. Stripped, reglazed, weatherstripped, and repainted. They work better than any modern replacement and they\u2019re gorgeous.",
    image:
      "https://images.unsplash.com/photo-1497219055242-93359eeed651?w=800&h=400&fit=crop&crop=center",
    likes: 112,
    pinned: false,
    replies: [
      {
        id: 701,
        author: "David C.",
        location: "San Francisco, CA",
        homePhoto:
          "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=80&h=80&fit=crop&crop=center",
        time: "20 hours ago",
        body: "This is incredible and exactly the motivation I need. Did you do the work yourself or hire someone? And roughly what was the per-window cost?",
      },
      {
        id: 702,
        author: "Eleanor M.",
        location: "Newport, RI",
        homePhoto:
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=80&h=80&fit=crop&crop=center",
        time: "18 hours ago",
        body: "All DIY! I took a window restoration workshop through the Window Preservation Alliance and then just went one by one. Materials cost about $30\u201350 per window \u2014 mainly glazing compound, weatherstrip, and paint. The glass was all original and in great shape.",
      },
    ],
  },
  {
    id: 8,
    author: "Thomas G.",
    location: "Lexington, KY",
    homePhoto:
      "https://images.unsplash.com/photo-1497219055242-93359eeed651?w=80&h=80&fit=crop&crop=center",
    time: "2 days ago",
    channel: "introductions",
    topics: [],
    title: "New member \u2014 1835 Federal on a horse farm in Kentucky",
    body: "Hi everyone. Just got verified. We\u2019ve owned this place for about twelve years and have been slowly working through it room by room. Original fanlight doorways, hand-carved mantels, and a lot of questions. Glad to be here.",
    likes: 54,
    pinned: false,
    replies: [
      {
        id: 801,
        author: "Margaret H.",
        location: "Savannah, GA",
        homePhoto:
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=80&h=80&fit=crop&crop=center",
        time: "2 days ago",
        body: "Welcome, Thomas! A Federal on a horse farm sounds like a dream. Would love to hear more about the mantels \u2014 are they original to the house? We have similar ones in our Greek Revival and they\u2019re one of our favorite features.",
      },
      {
        id: 802,
        author: "James W.",
        location: "Charleston, SC",
        homePhoto:
          "https://images.unsplash.com/photo-1525883405167-fc4e76c7713a?w=80&h=80&fit=crop&crop=center",
        time: "2 days ago",
        body: "Welcome! Twelve years of room-by-room work is the real deal. Looking forward to hearing about your projects. And definitely check out the #restoration-advice channel \u2014 great people in there.",
      },
    ],
  },
  {
    id: 9,
    author: "Patricia Q.",
    location: "Portland, ME",
    homePhoto:
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=80&h=80&fit=crop&crop=center",
    time: "2 days ago",
    channel: "restoration-advice",
    topics: ["Insurance", "Lead Paint"],
    title: "Lead paint encapsulation vs. abatement \u2014 what did you choose?",
    body: "Our 1812 Cape Cod has lead paint throughout. We have young kids so we need to deal with it. Encapsulation is cheaper but I\u2019m worried about it peeling in a few years. What has worked for others in this situation?",
    likes: 31,
    pinned: false,
    replies: [
      {
        id: 901,
        author: "Susan P.",
        location: "Hudson, NY",
        homePhoto:
          "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=80&h=80&fit=crop&crop=center",
        time: "2 days ago",
        body: "We went with encapsulation in the rooms our kids don\u2019t use much and full abatement in their bedrooms and the kitchen. The encapsulant we used (ECOBOND) has held up for four years with no peeling. Key is proper surface prep before application.",
      },
    ],
  },
];

export function loader() {
  return {
    channels: allChannels,
    topics: allTopics,
    posts: allPosts,
  };
}

export default function CommunityDemoPage() {
  const { channels, topics, posts } = useLoaderData<typeof loader>();
  const [activeChannel, setActiveChannel] = useState("general");
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [postData, setPostData] = useState(posts);
  const [composing, setComposing] = useState(false);
  const [composeTitle, setComposeTitle] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);

  const filteredPosts = postData.filter((post) => {
    const channelMatch =
      activeChannel === "general" || post.channel === activeChannel;
    const topicMatch = !activeTopic || post.topics.includes(activeTopic);
    return channelMatch && topicMatch;
  });

  const handleReply = (postId: number) => {
    if (!replyText.trim()) return;
    setPostData((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              replies: [
                ...p.replies,
                {
                  id: Date.now(),
                  author: "You",
                  location: "Brewster, MA",
                  homePhoto:
                    "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=80&h=80&fit=crop&crop=center",
                  time: "Just now",
                  body: replyText.trim(),
                },
              ],
            }
          : p,
      ),
    );
    setReplyText("");
  };

  const handlePost = () => {
    if (!composeTitle.trim() || !composeBody.trim()) return;
    const newPost: Post = {
      id: Date.now(),
      author: "You",
      location: "Brewster, MA",
      homePhoto:
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=80&h=80&fit=crop&crop=center",
      time: "Just now",
      channel: activeChannel === "general" ? "general" : activeChannel,
      topics: [],
      title: composeTitle.trim(),
      body: composeBody.trim(),
      likes: 0,
      pinned: false,
      replies: [],
    };
    setPostData((prev) => [newPost, ...prev]);
    setComposeTitle("");
    setComposeBody("");
    setComposing(false);
  };

  const handleLike = (postId: number) => {
    setPostData((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p)),
    );
  };

  return (
    <>
      {/* Header */}
      <section className="px-8 py-12 lg:px-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Community
        </p>
        <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">
          The Forum
        </h2>
      </section>

      {/* Forum content */}
      <section className="px-8 pb-24 lg:px-10">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Channels
            </p>
            <div className="mt-4 space-y-1">
              {channels.map((ch) => (
                <button
                  key={ch.slug}
                  onClick={() => {
                    setActiveChannel(ch.slug);
                    setExpandedPost(null);
                  }}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    activeChannel === ch.slug
                      ? "bg-primary/10 font-medium text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {ch.name}
                </button>
              ))}
            </div>

            <p className="mt-10 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Topics
            </p>
            <div className="mt-4 space-y-1">
              {topics.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setActiveTopic(activeTopic === t ? null : t);
                    setExpandedPost(null);
                  }}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    activeTopic === t
                      ? "bg-primary/10 font-medium text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="mt-10">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Online now
              </p>
              <div className="mt-4 flex -space-x-2">
                {[
                  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=48&h=48&fit=crop&crop=center",
                  "https://images.unsplash.com/photo-1525883405167-fc4e76c7713a?w=48&h=48&fit=crop&crop=center",
                  "https://images.unsplash.com/photo-1757992141434-983a12b82da3?w=48&h=48&fit=crop&crop=center",
                  "https://images.unsplash.com/photo-1519227355453-8f982e425321?w=48&h=48&fit=crop&crop=center",
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="size-7 rounded-full object-cover ring-2 ring-[#faf9f6]"
                  />
                ))}
                <div className="flex size-7 items-center justify-center rounded-full bg-gray-100 text-[9px] font-medium text-gray-400 ring-2 ring-[#faf9f6]">
                  +9
                </div>
              </div>
            </div>
          </div>

          {/* Feed */}
          <div>
            {/* Compose */}
            <div className="rounded-xl border border-gray-100 bg-white p-5">
              {!composing ? (
                <div
                  className="flex cursor-pointer items-center gap-4"
                  onClick={() => setComposing(true)}
                >
                  <img
                    src="https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=80&h=80&fit=crop&crop=center"
                    alt=""
                    className="size-9 rounded-full object-cover"
                  />
                  <div className="flex-1 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-400">
                    Share something with the community&hellip;
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=80&h=80&fit=crop&crop=center"
                      alt=""
                      className="size-9 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">You</p>
                      <p className="text-xs text-gray-400">Brewster, MA</p>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={composeTitle}
                    onChange={(e) => setComposeTitle(e.target.value)}
                    placeholder="Post title"
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary/30"
                  />
                  <textarea
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    placeholder="Write your post..."
                    rows={4}
                    className="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-[13px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary/30"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full"
                      onClick={() => {
                        setComposing(false);
                        setComposeTitle("");
                        setComposeBody("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-full"
                      onClick={handlePost}
                      disabled={!composeTitle.trim() || !composeBody.trim()}
                    >
                      Post
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Posts */}
            <div className="mt-6 space-y-5">
              {filteredPosts.length === 0 && (
                <div className="rounded-xl border border-gray-100 bg-white p-12 text-center">
                  <p className="text-sm text-gray-400">
                    No posts in this view yet.
                  </p>
                </div>
              )}
              {filteredPosts.slice(0, visibleCount).map((post) => {
                const isExpanded = expandedPost === post.id;

                return (
                  <div
                    key={post.id}
                    className="rounded-xl border border-gray-100 bg-white"
                  >
                    <div className="p-6">
                      {/* Author */}
                      <div className="flex items-center gap-3">
                        <img
                          src={post.homePhoto}
                          alt=""
                          className="size-10 rounded-full object-cover"
                        />
                        <div>
                          {memberSlugMap.has(post.author) ? (
                            <Link
                              to={`/members/demo/${memberSlugMap.get(post.author)}`}
                              className="text-sm font-semibold text-gray-900 hover:text-primary"
                            >
                              {post.author}
                            </Link>
                          ) : (
                            <p className="text-sm font-semibold text-gray-900">
                              {post.author}
                            </p>
                          )}
                          <p className="text-xs text-gray-400">
                            {post.location} &middot; {post.time}
                          </p>
                        </div>
                        {post.pinned && (
                          <span className="ml-auto rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-medium text-amber-600">
                            Pinned
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <h3 className="mt-4 font-display text-[15px] font-semibold text-gray-900">
                        {post.title}
                      </h3>
                      <p className="mt-2 text-[13px] leading-relaxed text-gray-600">
                        {post.body}
                      </p>

                      {/* Image */}
                      {post.image && (
                        <img
                          src={post.image}
                          alt=""
                          className="mt-4 aspect-2/1 w-full rounded-lg object-cover"
                        />
                      )}

                      {/* Topics */}
                      {post.topics.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {post.topics.map((t) => (
                            <span
                              key={t}
                              className="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-medium text-gray-400"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-5 flex items-center gap-6 border-t border-gray-50 pt-4">
                        <button
                          onClick={() => handleLike(post.id)}
                          className="text-xs text-gray-400 transition-colors hover:text-gray-600"
                        >
                          {post.likes} likes
                        </button>
                        <button
                          onClick={() =>
                            setExpandedPost(isExpanded ? null : post.id)
                          }
                          className="text-xs text-gray-400 transition-colors hover:text-gray-600"
                        >
                          {post.replies.length} replies
                        </button>
                        {!isExpanded && (
                          <button
                            onClick={() => setExpandedPost(post.id)}
                            className="ml-auto text-xs font-medium text-primary transition-colors hover:text-primary/80"
                          >
                            View thread
                          </button>
                        )}
                        {isExpanded && (
                          <button
                            onClick={() => setExpandedPost(null)}
                            className="ml-auto text-xs font-medium text-gray-400 transition-colors hover:text-gray-600"
                          >
                            Collapse
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded replies */}
                    {isExpanded && (
                      <div className="border-t border-gray-50 bg-gray-50/50 px-6 py-5">
                        <div className="space-y-4">
                          {post.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-3">
                              <img
                                src={reply.homePhoto}
                                alt=""
                                className="size-8 shrink-0 rounded-full object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-baseline gap-2">
                                  {memberSlugMap.has(reply.author) ? (
                                    <Link
                                      to={`/members/demo/${memberSlugMap.get(reply.author)}`}
                                      className="text-[13px] font-semibold text-gray-900 hover:text-primary"
                                    >
                                      {reply.author}
                                    </Link>
                                  ) : (
                                    <p className="text-[13px] font-semibold text-gray-900">
                                      {reply.author}
                                    </p>
                                  )}
                                  <p className="text-[11px] text-gray-400">
                                    {reply.location} &middot; {reply.time}
                                  </p>
                                </div>
                                <p className="mt-1 text-[13px] leading-relaxed text-gray-600">
                                  {reply.body}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Reply input */}
                        <div className="mt-5 flex items-start gap-3">
                          <img
                            src="https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=80&h=80&fit=crop&crop=center"
                            alt=""
                            className="size-8 shrink-0 rounded-full object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write a reply..."
                              rows={2}
                              className="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-[13px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary/30"
                            />
                            <div className="mt-2 flex justify-end">
                              <Button
                                size="sm"
                                className="rounded-full"
                                onClick={() => handleReply(post.id)}
                                disabled={!replyText.trim()}
                              >
                                Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredPosts.length > visibleCount && (
              <div className="mt-10 flex justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full"
                  onClick={() => setVisibleCount((c) => c + 5)}
                >
                  Load more
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
