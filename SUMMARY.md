# Grist Club

Grist Club is a private, members-only online community built exclusively for verified owners of historic homes. Every member must own a home listed on a recognized historic register — the National Register of Historic Places, a state-level register, or a local historic district. This verification requirement ensures that every conversation, recommendation, and connection comes from someone with real, firsthand experience maintaining and preserving an old house.

The platform was founded by Nick and Cecilia, fifth-generation owners of a historic Cape Cod cottage in Brewster, Massachusetts. After inheriting the home, they found themselves searching for practical advice that Google couldn't provide — questions about lime mortar, original windows, period-appropriate repairs, and navigating historic commissions. The answers were scattered across niche Facebook groups, outdated blogs, and expensive consultations. They realized that historic homeowners are a passionate but isolated group who need a dedicated space to connect. What started as a group text with neighbors and Saturday morning coffee meetups grew into Grist Club: the community they wished they'd had from day one.

## Who It's For

Grist Club is for anyone who owns a verified historic home in the United States. The community started in New England but is expanding nationwide. Members come from all backgrounds — what they share is the experience of caring for a house with real history. Typical members own pre-1960s homes in styles ranging from Cape Cod and Colonial to Victorian, Queen Anne, Italianate, Federal, Greek Revival, and Dutch Colonial. Whether they're mid-restoration, decades into stewardship, or just getting started, members join to find trusted advice and genuine connection with people who understand the unique joys and challenges of old-house ownership.

## Core Values

Four principles guide the community. **Verification** — every home is confirmed against a historic register, so members know they're talking to real owners. **Privacy** — posts, conversations, and profiles are never public; everything stays within the community. **Generosity** — members share what they've learned, mistakes included, so others don't start from scratch. **Preservation** — the community believes these homes deserve to be maintained, not modernized beyond recognition.

## Features

### Forum

The forum is the heart of the community. It's organized into channels — topical categories like restoration advice, contractor recommendations, or specific architectural styles. Members can browse channels, search across all threads, and post new questions or discussions. Threads support rich text content with headings and images, and admins can pin important threads to the top of a channel. Every thread has a reply section where members can share their experience, and posts can be liked to surface the most helpful contributions. The forum uses infinite scroll for browsing and supports filtering by channel.

### Blog

Members can write and publish blog posts to share longer stories — restoration journeys, before-and-after transformations, lessons learned, or profiles of their homes. The blog editor supports a block-based format with text blocks (including headings) and inline image uploads. Posts can be saved as drafts before publishing. Published posts appear in a community-wide blog feed that's searchable and supports infinite scroll. Other members can like posts and leave comments, creating conversation around shared experiences.

### Marketplace

The marketplace lets members buy, sell, and give away materials, hardware, and supplies related to historic homes. Listings fall into three categories: For Sale, Wanted, and Free. Each listing includes a title, description, price (when applicable), condition, photo gallery with multiple images, and tags for discoverability. Members can browse listings with search, filter by category and tags, and contact sellers through a reply thread on each listing. Infinite scroll keeps browsing seamless across large inventories.

### Events

Grist Club hosts a mix of virtual and in-person events. These include monthly video meetups, quarterly expert Q&A sessions, and an annual in-person retreat. Each event has a detail page with the full description, date and time, speaker information, an agenda with scheduled items, and attendee capacity. Members can RSVP to upcoming events and view their RSVPs in a dedicated tab. Featured events are highlighted at the top of the events page. Past events remain visible for reference, showing who attended.

### Member Directory

The member directory is a searchable, filterable grid of all community members. Each member card shows their home photo, name, location, and the year their home was built. The directory can be filtered by architectural style (Greek Revival, Queen Anne, Victorian, etc.) and era (pre-1800, 1800–1850, 1851–1900, post-1900), and searched by name or location. Clicking a member opens their full profile, which includes their home details, a personal story or bio written in the block editor, interest tags, and tabs for their posts and event attendance. Members can follow each other to see their activity in the home feed. The directory also includes an invite system where members can send email invitations or share a link to bring in new historic homeowners.

### Admin Tools

Staff members have access to a full admin dashboard for managing the community. This includes tools for creating and editing events, managing member profiles and staff permissions, moderating blog posts and forum threads (including pinning, moving, and deleting), managing marketplace listings and tags, reviewing membership applications and generating activation codes, handling support tickets (help requests, bug reports, and suggestions), and viewing site-wide analytics covering member growth, post activity, event attendance, and geographic distribution.

## Signup and Verification

New members go through a multi-step signup flow. They start by entering their home address, which is checked against supported historic registries (currently nine state registers plus the National Register of Historic Places). If their home is found, they can proceed to create an account. If not, they submit an application with their name and email, which is reviewed by an admin who may verify the home manually. Approved applicants receive an activation code that lets them create their account and join the community immediately. This process ensures that every member is a genuine historic homeowner.

## Technical Overview

The application is built with React 19 and React Router v7 for server-side rendered, file-based routing. The backend is Django REST Framework with session-based authentication. All data fetching happens server-side in loaders and actions — there are no client-side API calls. The UI uses Tailwind CSS, shadcn/ui components, and a warm beige-and-green color palette. Key technical features include a custom block editor for rich content, infinite scroll pagination with IntersectionObserver, optimistic UI updates for likes, follows, and RSVPs, image uploads proxied through the Node server, and toast notifications for user feedback.
