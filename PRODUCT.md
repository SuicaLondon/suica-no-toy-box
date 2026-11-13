# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

SuicaのToy Box is a personal collection of small tools. Its first users are the
author and friends using a tool to make a real everyday decision; its second
audience is people looking at the author's work as an engineering showcase.
Usefulness to the first group comes first.

Grill Restaurant: a friend deciding whether a restaurant is worth the trip or
the hype pastes its Google Maps link, usually straight from the Maps app on a
phone, waits a minute or two, and reads the verdict.

## Product Purpose

Small, useful tools for everyday decisions. Each tool does one job well.

Grill Restaurant judges a restaurant from several kinds of evidence at once:
what its Google Maps reviewers say, what other review platforms and food
writers say, and whether and when the MICHELIN Guide listed it, then makes a
call: go, maybe or skip, who should go, who should skip, and the catch.
Success is a friend leaving with a decision and the reason for it.

## Positioning

Grill Restaurant gives a verdict first and keeps its working one tap away.
The verdict is decisive and critical, not subjective: it reasons from the
evidence, never from taste. It finds what the place sells itself on and
checks whether diners think it delivers, counts how many sources raise each
theme, tests MICHELIN's claims against the diners, and weighs single posts
and sponsored tastings below many independent reviews, so a one-line
complaint never sinks a place most people enjoy. Only in the rare case that
several sources on each side say the opposite about the food, with no clear
majority, does it warn that the food may vary between visits or divide
people. It names the dishes the sources say are worth ordering and the ones
they say are not, and never names a dish the sources do not. It never
invents a fault. Each
source's own result stays attributed and opens on request. The page talks about sources and a
verdict, never about agents or models.

## Operating Context

- Pasted Google Maps links, usually share links (maps.app.goo.gl) from the
  Maps app, sometimes full google.com/maps URLs, or share.google links from
  Google Search and the Google app. A share.google link gives the place's
  name but not its position.
- A check takes one to two minutes and costs real money in API fees (a King of
  Laksa check took 91 s and cost about $0.11), so it is started deliberately,
  once.

## Capabilities and Constraints

- Next.js app, one route per tool under `/[locale]/`, in English and
  Traditional Chinese (`en`, `zh`). Shared UI comes from `suica-ui`.
- Privacy first: no accounts, no behavioural tracking, nothing stored about
  users.
- Google Maps content from Gemini is shown as Gemini returned it, or as
  Gemini translated it with the original one tap away, with its Google Maps
  sources, only to the person who asked. It never reaches another model and
  is never mixed into content from other models. The text "Google Maps" is never translated or restyled.
- Gemini answers in English; on the Chinese page Gemini also translates
  that answer and its reviews.
- The verdict covers other platforms and MICHELIN only; it never sees Google
  Maps content. It is written in the page's language to the unslop rules:
  plain words, no hedging, no dashes or semicolons. Its jabs aim at the
  restaurant, never at staff, owners or reviewers.
- On the Chinese page, each source is translated into Traditional Chinese
  (Taiwan) as soon as it finishes, and waits for its translation; the
  original is always one tap away.

## Brand Commitments

- Name: SuicaのToy Box. Mascot: the Suica penguin.
- Voice: short, plain, a little playful ("Tiny tools. Real utility.").
- Tool names stay as given: "Grill Restaurant".

## Evidence on Hand

- No testimonials, usage numbers or press exist; do not invent any.

## Product Principles

1. Verdict first, evidence on tap: the verdict leads; every source's own
   result stays attributed and opens on request, so the verdict can be
   checked against it.
2. Sources, not agents: the page names what was checked (Google Maps reviews,
   review sites, the MICHELIN Guide) and never the agents or models doing it.
3. Waiting is part of the experience: a minute or two of checking shows what
   is being read and roughly how long is left, not a bare spinner.
4. A tool, not a chat: one input, one check, one result page. No conversation
   thread, no message bubbles.
5. Mobile first: pasted from a phone, read on a phone; wider screens add room,
   not features.
6. Honest about limits and cost: thin evidence, failed sources and the
   check's estimated cost are shown plainly.
