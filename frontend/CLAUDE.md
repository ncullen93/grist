# Frontend Project Guidelines

## UI Components

- **Always use shadcn/ui components** instead of building custom ones. Install new components with `npx shadcn@latest add <component>`.
- Component aliases: `~/components/ui` for shadcn components, `~/components` for app components.
- Use the `cn()` utility from `~/lib/utils` for conditional class merging.

## Styling

- Use Tailwind CSS utility classes for all styling.
- Display font: Cabinet Grotesk (`font-display` class).
- Body font: Inter (`font-sans` class, default).
- Theme colors are defined as CSS variables in `app/app.css`.

## Images

- **Never link images via external URLs** (e.g. Unsplash). Always download images to `public/` and reference them with local paths (e.g. `/mockups/blog-hero.jpg`).
- Mockup/illustration images go in `public/mockups/`.
- After downloading, verify the file is an actual image (`file <path>`) — Unsplash URLs can 404 silently.

## Project Structure

- Routes are defined in `app/routes.ts` using React Router v7 file-based config.
- Layout routes wrap pages (e.g., `marketing-layout.tsx` provides the navbar).
- Reusable components go in `app/components/`.
- shadcn components are auto-installed to `app/components/ui/`.
