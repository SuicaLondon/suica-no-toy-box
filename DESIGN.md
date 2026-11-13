---
name: "Suica UI, Toy Box theme"
description: "suica-ui components in the Toy Box theme: green-tinted neutral grounds, one green accent, Geist Sans and Geist Mono, flat hairline cards."
colors:
  toy-accent: "#007a3b"
  toy-accent-dark: "#18a957"
  toy-bg: "#f3f4ef"
  toy-bg-dark: "#090c0a"
  surface-elevated: "#fbfcf8"
  surface-elevated-dark: "#111612"
  toy-text: "#141814"
  toy-text-dark: "#f2f4f0"
  toy-muted: "#667068"
  toy-muted-dark: "#858d86"
  toy-icon: "#101310"
  toy-icon-dark: "#f2f4f0"
  toy-line: "rgb(20 24 20 / 18%)"
  toy-line-dark: "rgb(242 244 240 / 20%)"
  toy-line-strong: "rgb(20 24 20 / 28%)"
  toy-line-strong-dark: "rgb(242 244 240 / 30%)"
  toy-hover: "rgb(0 122 59 / 3.5%)"
  toy-hover-dark: "rgb(24 169 87 / 5.5%)"
  toy-glow: "rgb(0 118 58 / 5.5%)"
  toy-glow-dark: "rgb(0 132 61 / 9%)"
  toy-error: "#c52a1f"
  toy-error-dark: "#ff8a80"
  danger: "#b42318"
  danger-dark: "#ff7b72"
  warning: "#8a5a00"
  warning-dark: "#f0b429"
typography:
  display:
    fontFamily: "Geist, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(4.5rem, 5.47vw, 5.25rem)"
    fontWeight: 700
    lineHeight: 0.93
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Geist, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Geist, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  title-md:
    fontFamily: "Geist, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  title-sm:
    fontFamily: "Geist, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 650
    lineHeight: 1.35
  body:
    fontFamily: "Geist, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.65
  body-sm:
    fontFamily: "Geist, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Geist Mono, SFMono-Regular, Consolas, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.1em"
  button:
    fontFamily: "Geist Mono, SFMono-Regular, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.33
    letterSpacing: "0.08em"
  data:
    fontFamily: "Geist Mono, SFMono-Regular, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0.02em"
    fontFeature: "'tnum'"
  chrome:
    fontFamily: "Geist Mono, SFMono-Regular, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0.12em"
rounded:
  inner: "2px"
  control: "6px"
  panel: "12px"
  full: "9999px"
spacing:
  tight: "6px"
  row: "10px"
  card-gap: "14px"
  edge-mobile: "18px"
  edge: "24px"
  section: "28px"
components:
  button-primary:
    backgroundColor: "{colors.toy-accent}"
    textColor: "{colors.toy-bg}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "rgb(0 122 59 / 90%)"
  button-outline:
    backgroundColor: "{colors.toy-bg}"
    textColor: "{colors.toy-text}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
    height: "44px"
  button-outline-hover:
    backgroundColor: "{colors.toy-hover}"
    textColor: "{colors.toy-accent}"
  button-small:
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "6px 12px"
    height: "36px"
  button-ghost-icon:
    backgroundColor: "transparent"
    textColor: "{colors.toy-text}"
    rounded: "{rounded.control}"
    size: "40px"
  button-ghost-icon-hover:
    backgroundColor: "{colors.toy-hover}"
    textColor: "{colors.toy-accent}"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.toy-text}"
    rounded: "{rounded.control}"
    padding: "4px 14px"
    height: "48px"
  card:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.toy-text}"
    rounded: "{rounded.panel}"
    padding: "24px"
  card-mobile:
    padding: "18px"
  badge:
    backgroundColor: "transparent"
    textColor: "{colors.toy-text}"
    rounded: "{rounded.control}"
    padding: "2px 8px"
    height: "24px"
  row-selectable:
    backgroundColor: "transparent"
    textColor: "{colors.toy-text}"
    rounded: "{rounded.inner}"
    padding: "18px"
  row-selectable-selected:
    backgroundColor: "{colors.toy-hover}"
  decision-stamp:
    backgroundColor: "{colors.toy-text}"
    textColor: "{colors.toy-bg}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "28px"
  source-row:
    backgroundColor: "transparent"
    textColor: "{colors.toy-text}"
    padding: "14px 0"
  source-row-hover:
    textColor: "{colors.toy-accent}"
  progress-track:
    backgroundColor: "rgb(20 24 20 / 8%)"
    rounded: "{rounded.inner}"
    height: "4px"
  nav-link:
    textColor: "{colors.toy-text}"
    typography: "{typography.chrome}"
    height: "40px"
  nav-link-hover:
    textColor: "{colors.toy-accent}"
---

# Design System: Suica UI, Toy Box theme

## Overview

**Creative North Star: "Suica UI, Toy Box theme"**

The system is the `suica-ui` React component package wearing the Toy Box theme. The package supplies the components (Card, Button, Input, Field, Alert, Badge, Spinner, Skeleton, Tabs) and their `--sui-theme-*` variables. The Toy Box theme in `src/app/globals.css` repeats the same values as `--toy-*` tokens for the app's own markup, and adds the page ground with its corner glow, a failure red, the text-selection colour and the focus outline. Every surface ships in a light and a dark theme, following the visitor's choice or the operating system.

Each tool is a working surface: a 72px header bar, the tool's line icon and title, then a grid of flat hairline cards on a green-tinted neutral ground. Density is compact and phone-first: 24px card padding (18px on phones), 14px between cards, reading text at 15px. Colour is nearly all neutral; one green marks what can be pressed, what is selected, what has focus and what is running. Geist Sans carries words; Geist Mono carries numbers, times, prices, data labels, button labels and the site chrome.

Two rejections are settled. Cards and controls carry no decorative shadows (the package's flat-surfaces rule). Results are headed panels, never a chat transcript or message bubbles.

**Key Characteristics:**

- Two grounds, one structure: pale warm grey with off-white cards, or green-black with dark green-grey cards.
- One green accent for action, selection, focus and live state; ink for finished work; red only for failure.
- Geist Sans for language, Geist Mono for measures and commands.
- Flat 12px hairline cards, 6px controls, 2px selectable rows.
- Compact, phone-first spacing: 24px card padding, 14px gaps, a 68ch reading measure.
- Motion is 150 to 180ms colour and border changes, removed under reduced motion.

## Colors

Two green-tinted neutral grounds, one green accent and two status hues. Every token has a light value and a `-dark` value, and the theme swaps them together.

### Primary

- **Deep Green** (#007a3b; dark **Bright Green** #18a957), `toy-accent`: the one accent. Fills primary buttons, with the ground colour as their label. Colours links, the selected row's hairline, the live status line, the running progress bar and the ring beside a source being checked, focus outlines, the text caret and the text-selection highlight. In the chrome it marks SUICA in the wordmark, the current language in the language switch and the footer's privacy title.

### Neutral

- **Pale Warm Grey** (#f3f4ef; dark **Green-Black** #090c0a), `toy-bg`: the page ground, and the fill of outline buttons.
- **Off-White** (#fbfcf8; dark **Dark Green-Grey** #111612), `surface-elevated`: the card face, one step lighter than the ground in both themes.
- **Near-Black Ink** (#141814; dark **Pale Grey-White** #f2f4f0), `toy-text`: all primary text. At 80% it draws a finished progress bar; at 8% it draws the empty track. It also fills the verdict's decision stamp.
- **Grey-Green** (#667068; dark **Light Grey-Green** #858d86), `toy-muted`: descriptions, notes, captions, timestamps, older log rows and sources still waiting. It holds at least 4.6:1 on ground and card in both themes.
- **Near-Black** (#101310; dark #f2f4f0), `toy-icon`: the line icons beside tool titles and on home cards.
- **Ink Hairline** (rgb(20 24 20 / 18%); dark rgb(242 244 240 / 20%)), `toy-line`: every border and separator.
- **Strong Hairline** (rgb(20 24 20 / 28%); dark rgb(242 244 240 / 30%)), `toy-line-strong`: hover borders, outline-button and badge borders, quotation rules.
- **Green Tint** (rgb(0 122 59 / 3.5%); dark rgb(24 169 87 / 5.5%)), `toy-hover`: the hover fill and the selected row's fill.
- **Green Glow** (rgb(0 118 58 / 5.5%); dark rgb(0 132 61 / 9%)), `toy-glow`: a radial glow in the page ground's top-left corner that fades out by 32rem.

### Status

- **Brick Red** (#c52a1f; dark **Light Coral** #ff8a80), `toy-error`: failure drawn by the app's own markup: failed bars, inline error text.
- **Dark Red** (#b42318; dark **Coral Red** #ff7b72), `danger`: failure drawn by package components: danger alerts, field errors, invalid input borders.
- **Dark Amber** (#8a5a00; dark **Amber** #f0b429), `warning`: warning alerts only.

### Named Rules

**The One Green Rule.** Green is the only hue in the interface. It marks what can be pressed, what is selected, what has focus and what is running, plus the brand name in the chrome. Nothing else is green, and no second accent joins it.

**The Ink-Means-Done Rule.** In a status display, running and selected are green, finished is ink, waiting and stopped are muted, and failed is red.

## Typography

**Display Font:** Geist (self-hosted through next/font, with ui-sans-serif, system-ui, sans-serif behind it)
**Body Font:** Geist
**Label/Mono Font:** Geist Mono (with SFMono-Regular, Consolas, monospace behind it)

**Character:** One family in two cuts. Geist Sans carries every word, at 400 for reading and 650 for headings; Geist Mono carries everything counted, timed, priced or pressed. Traditional Chinese falls back to the platform's CJK sans.

### Hierarchy

- **Display** (700, clamp(4.5rem, 5.47vw, 5.25rem), 0.93, -0.04em): the home page title only; clamp(3rem, 14vw, 3.5rem) on phones.
- **Headline** (650, 1.5rem, 1.15, -0.025em): the heading at the top of a result panel.
- **Title** (650, 1.375rem, 1.15, -0.025em): the tool page title, 1.25rem on phones. Home card titles use the same size at 600; empty-state headings use 1.25rem.
- **Title Medium** (650, 1.0625rem, 1.25, -0.015em): the name at the top of a card that a result belongs to, such as Grill Restaurant's place card.
- **Title Small** (650, 0.9375rem, 1.35): section headings inside a panel, platform names, headings in rendered Markdown. 28px of space above, 10px below.
- **Body** (400, 0.9375rem, 1.65): reading text and rendered Markdown, capped at 68ch. Quoted review text runs at 1.6.
- **Body Small** (400, 0.8125rem, 1.45 to 1.55, muted): tool descriptions, notes under results, cost lines.
- **Label** (500, Geist Mono 0.6875rem, 0.1em, uppercase, muted): data labels such as Go if, Skip if and Heads up, or Location and Type.
- **Button** (500, Geist Mono 0.75rem, 0.08em, uppercase): every button label in the tools.
- **Data** (400, Geist Mono 0.75rem, 1.6, 0.02em, tabular numerals): status lines, the facts under a panel heading, timestamps, prices, ratings, years and model names. A run's status line sits at 500 and turns green while the run is live.
- **Chrome** (400, Geist Mono 0.75rem, 0.12em, uppercase): site navigation and the footer line. The wordmark runs at 0.9375rem, 500, 0.16em.

In code, each role is a Tailwind theme token in `src/app/globals.css` that sets size, line height, tracking and weight together: `text-headline`, `text-title-md`, `text-title-sm`, `text-body`, `text-body-sm`, `text-label` and `text-data`. Add `font-mono` and `uppercase` where the role calls for them. Button labels on suica-ui buttons use `font-mono text-xs tracking-button uppercase`, because suica-ui's class merging only understands Tailwind's built-in sizes. Headings take `font-heading` (650), and reading text caps at `max-w-measure` (68ch).

### Named Rules

**The Two-Voice Rule.** Geist Sans for words, Geist Mono for measures and commands. Sentences, headings and names stay in Sans; numbers, times, prices, data labels, button labels and the site chrome go to Mono, with tabular numerals wherever figures line up.

**The 650 Rule.** Headings are weight 650 and tighten as they grow: about -0.015em at 17px, -0.025em at 22 to 24px, -0.04em at display size, and never tighter.

**The CJK Tracking Rule.** In Traditional Chinese, wide mono tracking comes down to 0.1em; the characters have no case to space out.

## Layout

Every page is one centred column: `min(1600px, 100% - 48px)` on tool pages and `min(1320px, 100% - 64px)` on the home page. Below 1024px both run at `100% - 48px`, and below 768px at `100% - 36px`.

The tool shell stacks four parts: the 72px header bar with a hairline under it; the tool header 24px below (a 38px line icon at stroke 1.35, 34px on phones, beside the title and a one-line description); the tool body 20px below that (18px on phones); and the footer, 18px below, with a hairline above it.

The tool body is a grid of cards 14px apart. Inside a card, padding is 24px (18px below 768px), buttons sit 10px apart, list rows take 10 to 20px of vertical padding with a hairline on top, and a section heading gets 28px above and 10px below.

Layouts are phone first. Tools are one column on phones and split into two at 1024px (Image Studio) or 1100px (Sponsor Me, Translate). Grill Restaurant is one column below 1024px, capped at 42rem and aligned with the tool header: the place card, the verdict, then what was checked. From 1024px it splits into two equal columns 14px apart: the place card and verdict on the left, sticking 24px from the top while you scroll, and what was checked on the right. The sources never get a row of tiles of their own. The home page sets a sticky intro column beside a two-column grid of project cards 14px apart; below 1024px the intro stacks above the cards, and below 768px the cards go to one column. Below 520px, primary buttons take the full width and the wordmark shortens to SUICA.

### Named Rules

**The Matched Edge Rule.** On tool pages the page gutter equals the card padding: 24px, or 18px under 768px. Cards sit 14px apart at every width.

## Elevation & Depth

Flat by default. Depth is one tonal step and a hairline: the card face is one step lighter than the ground in both themes and is outlined by a 1px `toy-line` border. The ground itself carries a faint green glow from its top-left corner. Hover never lifts anything; it strengthens a border or adds the green tint. Shadows belong only to layers that float above content.

### Shadow Vocabulary

- **Floating layer** (`box-shadow: 0 1px 3px 0 rgb(0 0 0 / 10%), 0 1px 2px -1px rgb(0 0 0 / 10%)`): the package's dialogs, dropdown menus and sidebar.

### Named Rules

**The Flat Surfaces Rule.** Cards, buttons, inputs and badges carry no shadow, at rest or on hover. Only floating layers get one: dialogs, menus and the sidebar.

**The Lighter Card Rule.** A card is one step lighter than the ground it sits on, in light and in dark, and carries a hairline. That step and that hairline are the whole depth system.

## Shapes

Three corner radii and a circle. Cards, dialogs and alerts take 12px (`rounded.panel`). Buttons, inputs, badges, selects, tab panels and skeletons take 6px (`rounded.control`). Rows that can be selected inside a card, the progress track, row placeholders and the small copy button set into a text area take 2px (`rounded.inner`); the bar inside the track takes 1px. Full circles are kept for the avatar, the status rings and the loading pill.

Edges are 1px hairlines: card borders, the header's bottom rule, the footer's top rule, and row separators, drawn as a top border on every row except the first.

### Named Rules

**The Dashed-Means-Not-Yet Rule.** A dashed hairline marks something that isn't there yet: an empty or idle card, a file drop zone, the verdict card while it waits, the ring beside a source not yet started. Solid hairlines are for things that exist.

## Components

### Buttons

Compact, flat and labelled in mono.

- **Shape:** gently rounded corners (6px), a 1px border, no shadow.
- **Primary:** green fill and border with a ground-coloured label in the Button type role; 44px tall with 16px side padding. Hover drops the fill to 90%.
- **Outline:** ground fill, strong-hairline border, ink label; on hover the border and label turn green over the green tint. The usual partner to a primary button (Paste, Stop, Grill another, Swap languages).
- **Small (`size="sm"`):** 36px tall with 12px side padding, for actions inside a card such as Stop and Read the summary.
- **Ghost icon:** transparent, 40px square (44px tall on phones) with an 18px icon; hover turns the icon green over the green tint. The theme toggle.
- **Busy:** an 18px Spinner replaces the leading icon, the label changes to the running verb (Opening the link, Translating…) and the button disables at 50% opacity.
- **Focus:** a 1px green outline 4px outside the button, set for every link and button on a `.toy-page`.
- **Icons:** 16px lucide icons lead the label.

### Chips

- **Style:** the package Badge, outline variant: transparent fill, strong-hairline border, ink text in Geist Mono 0.75rem at 500, 24px tall, 8px side padding, 6px corners. Used for facts on a result row (Location, Type, Rating).
- **State:** chips don't select. A selectable item is a row (see Cards / Containers).

### Cards / Containers

- **Corner Style:** 12px.
- **Background:** `surface-elevated` on the `toy-bg` ground.
- **Shadow Strategy:** none; see Elevation & Depth.
- **Border:** 1px `toy-line`; dashed for empty and idle states.
- **Internal Padding:** 24px, 18px below 768px.
- **Empty state:** a dashed card with centred content: a 1.25rem heading and a 14px muted line capped at 430px.
- **Selectable row:** a 2px-cornered row inside a card with a 1px `toy-line` border and 18px padding; hover and selection turn the border green and add the green tint.
- **Lists and logs:** rows divided by a top hairline. A live log puts a 2.5rem Geist Mono timestamp column beside the text, newest first, with older rows muted.
- **Disclosure:** a folded list of lookups opens from a Geist Mono 0.75rem muted summary with a chevron that turns 90°.

### Inputs / Fields

- **Style:** the package Input: transparent fill, 1px hairline border, 6px corners, 48px tall in the tools with 14px side padding; text at 16px on phones and 14px from 768px; muted placeholder. Text fields take a green caret (`caret-toy-accent`).
- **Field:** a Geist Sans 14px label at 500 above the control, an optional 12px muted description, 8px between the parts.
- **Focus:** the border turns green and a 1px green ring at 20% surrounds it.
- **Error / Disabled:** the border turns `danger` and a 14px `danger` message at 500 follows the control with `role="alert"`; disabled controls sit at 50% opacity.

### Navigation

- **Site header:** a 72px bar with a bottom hairline, in the Chrome type role. On the left, the wordmark SUICA の TOY BOX at 0.9375rem with SUICA in green. On the right: Blog, GitHub with its icon, the language switch and the theme toggle. The switch names both languages in their own words, English / 中文, in that order on every page, after a muted Languages icon: the page's own language in green, as selected, and the other an ink link that turns green on hover. Links turn green on hover over 180ms.
- **Mobile:** below 768px the header tightens and links grow to a 44px touch height; below 520px the wordmark shows only SUICA and GitHub shows only its icon.
- **Footer:** a top hairline, then one line in the Chrome type role in muted: the privacy title in green, an em dash, the privacy statement.
- **Tabs:** where a surface needs tabs, use the package Tabs: underline variant, Geist Mono 0.75rem uppercase labels at 0.08em, 44px tall, with a 2px green underline and a green label on the active tab.

### Alerts

- The package Alert: 12px corners, a 1px border, 12px padding, 14px text on 24px lines, an optional 20px icon in the status colour. Danger and warning variants fill with their status colour at 8 to 12% and border with it at 28 to 34%. Used for failures, such as a source that could not be checked or a verdict that could not be written (danger), and for warnings a source returns (warning).

### Links

- Green, with a 1px underline 4px below the text that thickens to 2px on hover. A link that opens a new tab ends with a 14px arrow-up-right icon and a screen-reader note saying so.

### Loading

- **Skeleton:** 6px corners (2px for row placeholders) and a shimmer that sweeps every 1.4s.
- **Spinner:** a 14px ring, 18px inside buttons.
- Both stop under reduced motion.

### Utilities

Custom Tailwind utilities in `src/app/globals.css`, for values the theme scale does not cover:

- **`wrap-anywhere`:** `overflow-wrap: anywhere`, for links and names that would otherwise overflow a phone. Tailwind 4.1 ships the same utility.
- **`checkerboard`:** the 20px grey transparency grid behind Image Studio's preview, the same in both themes.
- **`grid-cols-stat`:** a 5rem label column beside its value, for Image Studio's stats on phones.
- **`grid-cols-studio`:** a 340px settings column beside a preview that takes the rest, for Image Studio from the `lg` breakpoint.
- **`chrome-icons`:** sizes the header's line icons to 15px at a 1.5 stroke. Set on the header's nav, it reaches every icon inside, the theme toggle's too. Tailwind's stroke widths are whole numbers only.

Theme tokens for the site chrome, in the same file: `tracking-wordmark` (0.16em) and `tracking-chrome` (0.12em) for the letter-spacing in the Chrome type role, and the `xs` breakpoint (520px, used as `max-xs:`) below which the header shortens.

### Verdict and Source Checklist

The signature pair, from Grill Restaurant: the verdict leads, and what was checked sits under it, or beside it from 1024px. The page names sources, never agents or models.

- **Place card:** the place name (650, 1.0625rem) with an Open in Google Maps link and, while the check runs, a Stop button. Under it, a 4px progress track in ink at 8% with 2px corners. Its bar is green while live, ink at 80% when done, muted when stopped and `toy-error` when the connection drops. Then the status line in the Data role at 500 (Grilling · about 40 s left, green while live, then Done in 91 s) and the cost line in Body Small.
- **Verdict card:** a decision stamp beside the call. The stamp is an ink chip, 28px tall with 6px corners and a ground-coloured label in the Button role: GO, MAYBE or SKIP. The call is in the Headline role on 1.2 lines, two or three sentences. In the rare case the sources really split on the food, a Reviews disagree warning sits under the call: the package Alert in its warning variant, with a triangle icon, the role `note` (it is a finding, not an interruption) and one sentence naming the split. Most verdicts have none. The good and the bad follow as a pros-and-cons pair, then the take on the hype as one plain paragraph. Worth ordering and Not worth ordering follow behind a hairline as a second pros-and-cons pair, each dish with why and how many sources say so; it is left out when the sources name no dishes. Go if and Skip if sit behind a hairline under Label captions, side by side from 640px, then Heads up behind another, then a muted confidence note. While it waits, the card is dashed and holds two skeleton rows and a line saying what it waits for.
- **Checklist card:** headed What we're checking while the check runs and What we checked after. One row per source (Google Maps reviews, Review sites, MICHELIN Guide), divided by hairlines, with 14px of vertical padding: a 16px status mark, the source name (650, 0.9375rem) and one Data line. The line is muted while the source runs (what is being read) and ink once it is done (the finding).
- **Status marks:** a 14px ring, green with a gap and turning every 0.8s while running; an ink check when done; a `toy-error` X when it failed; a muted minus when stopped; a dashed muted ring while waiting. The ring stops turning under reduced motion.
- **Opening:** a finished or failed row is a full-width button with a muted chevron that turns over when open. It opens that source's full result under the row, indented 28px, one row at a time. Hover turns the row's text green over 150ms.
- **Pros and cons:** one pattern for the verdict's good and bad, Google Maps' pros and cons and each review site's. Two lists side by side from 640px, stacked below, 24px apart. Each has a Label caption in its colour, green (`toy-accent`) for the good side and `toy-error` for the bad, and each item sits behind a mono + or − in the same colour, so the two sides never blur. A side with nothing in it is left out.
- **Section labels:** headings inside an opened source (The reviews behind it, What the inspectors say, Year by year) use the Label role in `toy-muted`, never a bold line that reads as part of the text.
- **Google Maps detail:** the address and an Open in Google Maps link, the answer as Google returned it with a note saying so, the first three reviews behind it, the most detailed first, with a Show all button, and a privacy note. Google Maps answers two questions, each laid out under its own headings, word for word: pros and cons, then the dishes worth and not worth ordering, each as a pros-and-cons pair (a single list is the good side alone). A rare third list in the first answer, where reviews really split, follows as the same warning as the verdict's; any other answer shows as Markdown. Each review is set off like a quote by a 2px `toy-line-strong` rule on its left, 16px apart, with its date and link under it. The rating stays on the row and is not repeated.
- **Review sites detail:** one entry per site, divided by hairlines: its mark, its name (650, 0.9375rem) with the rating in the Data role at the far end, what the site says, its pros and cons, the dishes its reviewers say are and are not worth ordering as a second pair (left out when they name none), and a link to it. The mark is 16px in `toy-muted`, hung left of the name so the rest of the entry lines up with the name. It is the site's own glyph from Simple Icons (CC0, bundled with the page), or lucide's Globe for a site without one; never the brand's colours, and never a favicon fetched while the page runs.
- **Translated sources:** on the Chinese page an opened source shows 翻譯中… in the note style until its translation lands, then a Show original text button (Data role, green, underlined) above the result that swaps between the translation and the original. If the translation fails, the original shows under a muted note.

## Do's and Don'ts

### Do:

- **Do** build from the suica-ui components and colour the app's own markup with the `--toy-*` tokens (`text-toy-muted`, `border-toy-line`, `var(--toy-accent)`), so both themes follow without extra work.
- **Do** put every tool in the ToolShell: header bar, line icon and title, a grid of cards 14px apart, footer.
- **Do** pad cards 24px (18px under 768px) and keep the tool page's gutter equal to that padding.
- **Do** set button labels in Geist Mono 0.75rem, uppercase, tracked 0.08em, on 44px buttons (36px `sm` buttons inside a card).
- **Do** set every number, time, price, date and model name in Geist Mono with tabular numerals.
- **Do** mark a selected row with a green hairline and the green tint, on 2px corners.
- **Do** cap reading text at 68ch, at 15px on 1.65 lines.
- **Do** build every class from the theme tokens and Tailwind's built-in scale (`text-body`, `rounded-panel`, `max-w-measure`, `p-4.5`, `bg-toy-text/8`); when the scale lacks a value, add a token or an `@utility` to `src/app/globals.css` and record it here.
- **Do** theme the browser's own surfaces: text selection in green with ground-coloured text, a 1px green focus outline 4px out, a green caret in text fields, and a `color-scheme` that follows the theme (the `.toy-page` wrapper sets it).
- **Do** keep transitions to colour and border changes at 150 to 180ms, and remove them under `prefers-reduced-motion`.

### Don't:

- **Don't** introduce a second accent hue or hard-code a colour; use a token or a package variant (`variant="destructive"`, not a literal red).
- **Don't** draw finished work in green; green means running or selected.
- **Don't** give cards, buttons or inputs a shadow, or lift them on hover.
- **Don't** put a label above a heading: no mono eyebrow, no kicker, no section number such as "01 / Source image". Pass `eyebrow={null}` to SectionHeading, as the home page does. Some older tools still carry these; they are not the pattern.
- **Don't** use corner radii off the 12, 6 and 2px scale, apart from full circles.
- **Don't** set body text, headings or names in Geist Mono; outside the header and footer chrome, mono is for figures, labels and buttons.
- **Don't** restyle, recase or translate the words "Google Maps"; they keep the surrounding text style, never mono uppercase, and carry `translate="no"`.
- **Don't** present model output as chat bubbles or a message thread; each result is a headed panel.
- **Don't** show Grill Restaurant's agents, models or providers; the page names the sources it checked and what they found.
- **Don't** give Grill Restaurant's sources a column or a row of tiles of their own; they stack under the verdict.
- **Don't** stand Unicode glyphs or emoji in for icons; icons are lucide line icons, at stroke 1.35 for the large tool marks. The one exception is a review site's own mark beside its name.
