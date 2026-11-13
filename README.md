# SuicaのToy Box

A collection of simple yet useful tools for daily use. All tools run entirely in your browser or use lightweight serverless functions - no data is stored on any servers.

You can access it from the [link](https://suica-no-toy-box.vercel.app/)

## Features

- **Translater**: A Google Translate-like interface for quick translations
- **Sponsor Me**: Search for sponsorships for the company you want to apply to in the UK
- **What for dinner?**: Decide what to eat for dinner
- **Duration Board**: A board for tracking important dates to make your life have hope
- **Image Studio**: Compress and convert images on your device or on the server
- **Grill Restaurant**: Paste a Google Maps link and get a go, maybe or skip verdict on whether it is worth the trip, checked against its Google Maps reviews, other review sites and the MICHELIN Guide

## Tech Stack

- [Next.js 15](https://nextjs.org/) - React framework
- [Suica UI](https://github.com/SuicaLondon/suica-ui) - UI component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [React Hook Form](https://react-hook-form.com/) - Form validation
- [Zod](https://zod.dev/) - TypeScript-first schema validation
- [TanStack Query](https://tanstack.com/query) - Data fetching and state management
- [OpenAI API](https://openai.com/) - AI-powered translation

## Privacy First

All tools in SuicaのToy Box run entirely in your browser or use lightweight serverless functions. We don't store any data, don't use cookies, and don't track your usage.

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/SuicaLondon/suica-no-toy-box.git
cd suica-no-toy-box
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:
   Create a `.env.local` file with the following content:

```
OPENAI_API_KEY=your_api_key_here
```

Grill Restaurant also needs a Gemini key, and takes a few optional settings:

```
GEMINI_API_KEY=your_gemini_key_here
# Optional: models (defaults: gemini-3.8-flash, gpt-6-luna, gpt-6-luna)
GEMINI_MODEL=
OPENAI_MODEL=
SUMMARY_MODEL=            # verdict and translation: OpenAI, gemini-… or claude-… (needs ANTHROPIC_API_KEY)
# Optional: require a code before anyone can start a paid run
GRILL_RESTAURANT_ACCESS_CODE=
```

Each Grill Restaurant run costs roughly $0.15 to $0.45 in API fees. The same
check runs from the terminal and prints each source's full result:

```bash
pnpm grill-restaurant "https://maps.app.goo.gl/…"
```

4. Run the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## UI migration

Development writes to `.next-dev`, while production builds and `pnpm start` use
`.next`. This keeps production build checks from overwriting a running development
server's manifests and assets. Run only one development server per checkout.

Shared controls, cards, forms, menus, and calendars use Suica UI. Toast notifications
remain on Sonner, and the dinner roulette and other application-specific displays
retain their custom rendering. Duration cards show type and repeat as separate tags.
