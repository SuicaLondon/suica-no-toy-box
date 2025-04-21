# SuicaのToy Box

A collection of simple yet useful tools for daily use. All tools run entirely in your browser or use lightweight serverless functions - no data is stored on any servers.

You can access it from the [link](https://suica-no-toy-box.vercel.app/)

## Features

- **Translater**: A Google Translate-like interface for quick translations
- **Sponsor Me**: Search for sponsorships for the company you want to apply to in the UK
- **What for dinner?**: Decide what to eat for dinner
- **Duration Board**: A board for tracking important dates to make your life have hope

## Tech Stack

- [Next.js 15](https://nextjs.org/) - React framework
- [Shadcn UI](https://ui.shadcn.com/) - UI component library
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

4. Run the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
