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

## Project Structure

- Routes are defined in `app/routes.ts` using React Router v7 file-based config.
- Layout routes wrap pages (e.g., `marketing-layout.tsx` provides the navbar).
- Reusable components go in `app/components/`.
- shadcn components are auto-installed to `app/components/ui/`.
