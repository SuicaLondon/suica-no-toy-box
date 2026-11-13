/**
 * Global stylesheets are imported only for their side effects, as layout.tsx
 * imports globals.css. Next.js declares CSS modules (*.module.css) but not
 * these, and TypeScript 6 checks side-effect imports by default.
 */
declare module "*.css";
