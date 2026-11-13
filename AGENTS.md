# AGENTS.md

SuicaのToy Box: small tools in one Next.js 15 app (app router, React 19), styled with Tailwind CSS v4 and the `suica-ui` components, tested with Vitest, managed with pnpm. Product context is in PRODUCT.md, the visual system in DESIGN.md.

## Done means

A change is done when these pass. The pre-commit hook runs ESLint with `--max-warnings=0`, so a single warning blocks the commit.

- `pnpm lint`
- `pnpm exec tsc --noEmit -p .` (CI does not typecheck)
- `pnpm exec vitest run` (`pnpm test` starts watch mode)

## Feature layout

- A tool lives in `src/lib/features/<tool>/`, named after its route, with `<tool>-tool.tsx` at the root as the page's entry component.
- Group the rest by job, one folder each: `components/`, `hooks/`, `view/` for the pure helpers components share (whatever returns JSX is a component), `test/` for fixtures several tests share, and domain folders. The root keeps only the entry component, its test and the feature's `regex.ts`. `src/lib/features/grill-restaurant/` is the model: `agents/` (each an `Agent` with its default model, `run` and `cost`: `sources/` holds one per review source, beside `summary/`, `translation/` and `common/` for what every agent shares), `providers/` (the AI SDK model clients every agent shares, picked by model name), `check/` (the run that drives the agents), `stream/`. A folder that grows several jobs splits into a subfolder per job the same way, as `view/` does into `progress/`, `sources/`, `site-marks/` and `composer/`.
- Route handlers (`src/app/api/**/route.ts`) stay thin: HTTP helpers from `src/utils/http.ts` (`errorResponse`, `isSameOrigin`), the work from the feature folder.
- Zod schemas for requests and forms live in `src/schemas/<tool>.ts`. Environment variables are read through a zod-checked module that reports missing names, never values, instead of throwing at import (`grill-restaurant/check/grill-env.server.ts`).

## Translations

- A page's text is its `messages`, in English and Traditional Chinese, in `src/i18n`: `tool-messages.ts`, or `<tool>-messages.ts` for a larger tool, exporting `<tool>Messages` and the type `<Tool>Messages`.
- The name is `messages` everywhere: `useToolI18n()` returns `{ locale, messages }`, and components take their tool's text as a `messages` prop.

## Components

- One component per file. A component gets a folder, `components/<name>/index.tsx`; a child only one parent uses sits beside it as `<child>.tsx` (`components/verdict-card/decision-stamp.tsx`); a building block two or more components use sits in `components/common/<name>/` (`grill-restaurant/components/common/note/`). One that other tools could use moves up to `src/components/<group>/<name>/`, like `src/components/button/copy-button/`. shadcn/ui primitives in `src/components/ui` are generated and exempt.
- Choose between more than two outcomes with a lookup object (`Record<Status, string>`), early returns in a small function, or a `switch`. Each ternary stays one level deep.

## Styling

- Every Tailwind class comes from the theme or Tailwind's built-in scale:
  - Theme tokens: the `@theme` block in `src/app/globals.css` (type roles `text-headline` to `text-data`, each setting size, line height, tracking and weight; `font-heading`, `tracking-button`, `max-w-measure`) and suica-ui's (`rounded-panel`, `rounded-control`, colours).
  - Built-in v4 utilities: quarter steps of the spacing scale (`p-4.5`), fractions (`w-2/3`), container widths (`max-w-2xl`), opacity modifiers on theme colours (`bg-toy-text/8`), breakpoint ranges (`max-md:`), boolean `data-*:` and `aria-*:` variants.
  - When the scale lacks a value, add a token to `@theme` or an `@utility` in `globals.css`, and record it in DESIGN.md.
- A look used in more than one place is a component (`<Note>`, `<ToolButton>`, `<NavLink>`) that writes its class list once and takes `className` for one-off spacing. Class lists live in the JSX that uses them, or in a lookup object that styles a state.
- Style a state with a lookup object of class lists merged by `cn()`. Computed values, such as a progress width, go in `style`.
- suica-ui components merge `className` with their own tailwind-merge, which knows only Tailwind's built-in scale plus `rounded-control` and `rounded-panel`. Give suica-ui components built-in sizes (`text-xs`, `rounded-xs`) and keep the theme text tokens for our own elements. Our `cn` (`src/utils/cn.ts`) knows the tokens; add each new token to its config.

## Errors

Handle failures with `tryCatch` and `tryCatchAsync` from `src/utils/try-catch.ts`, Result style: check `.error`, then use `.data`. `try/finally` is for cleanup only, such as releasing a stream.

## Regular expressions

- Every regex is a named, documented constant in a regex module: `src/utils/regex.ts` for general patterns (links, file extensions, line breaks), or the feature's own `regex.ts` for its formats (`grill-restaurant/regex.ts` holds the Google Maps URL patterns). A pattern built from input is a function there (`placeCardField`). Tests write their text matchers inline.
- A global (`g`) pattern is for `replace()`. `test()` and `exec()` on a shared global pattern carry its `lastIndex` from one call to the next.

## ESLint

`eslint.config.mjs` enforces one component per file, one-level ternaries, theme-only Tailwind classes (arbitrary values and variants such as `[&_svg]:` included), JSX only outside `view/`, and two local rules defined in the config: regexes only in regex modules (`toy-box/no-inline-regex`), and class lists only where they are used (`toy-box/no-class-constants` flags a `className` built from a module-level string or an import). Its `LEGACY` lists name files written before these rules: when you edit one, bring it up to standard and delete its line. New files follow the rules from the start.
