# Gamification: current state and roadmap

Goal: make working through the Thilo more engaging for scouts by tracking
reading progress, offering quizzes per chapter, and rewarding completion,
while keeping the site a static, offline-capable PWA.

## What exists today

### Local-first progress store (`src/utils/progress.ts`)

All progress lives in `localStorage` under the key `thilo-progress-v1`, so it
works offline and needs no account:

```ts
{
  chaptersRead: { "<sectionSlug>#<chapterSlug>": "<ISO timestamp>" },
  quizResults:  { "<quiz JSON url>": { correct, total, completedAt } }
}
```

- `markChapterRead` / `isChapterRead` / `getSectionReadCount` for reading
  progress.
- `recordQuizResult` / `getQuizResult` keep the *best* attempt per quiz.
- `onProgressChange(callback)` subscribes to changes, including from other
  tabs (`storage` event). Local changes fire the `thilo:progress` custom
  event.
- `resetProgress()` clears everything.

Slugs are per-locale (the store keys use whatever slug the page URL uses), so
progress is tracked per language. That is acceptable for now; see "Cross-
locale progress" below for the fix if it becomes a problem.

### Wiring

- `BaseLayout.astro` exposes the store as `window.thiloProgress` for inline
  scripts and marks a chapter as read when its `<h2>` heading has been fully
  scrolled into view (IntersectionObserver, re-armed on every
  `astro:page-load`). Currently switched off via `READ_TRACKING_ENABLED =
  false` in `BaseLayout.astro` until the feature launches.
- `TableOfContents.astro` shows a partially filled bookmark next to chapters
  that have been read and updates live via the `thilo:progress` event.
- `Quiz.tsx` records the score whenever a scout completes a
  react-quiz-component quiz.

## AI quiz tooling evaluation (July 2026)

Research question for the "Erste AI Quiz Tests" position: can an existing
AI quiz platform generate and host the Thilo quizzes, or should generation
stay in-house?

### skillbuddy.io

AI-assisted course and quiz platform with a learn-to-earn model: organisers
build courses (AI structures uploaded material into chapters, lessons, and
quizzes), learners earn Bitcoin (SATS) rewards for completing them. The
platform itself is free; skillbuddy takes 10% of rewards distributed to
learners. White-label branding and native iOS/Android apps are included.

Findings against the Thilo constraints:

- Content would be duplicated into their platform. Strapi stays the source
  of truth for the book, so every content change would need a second,
  manual sync into skillbuddy.
- Monetary (Bitcoin) rewards for an audience of mostly minors is not a
  model PBS can adopt; without the reward system, the platform's core
  engagement loop and pricing model fall away.
- No documented quiz export or API: quizzes render inside their hosted
  apps, not inside the offline PWA, and cannot be extracted as the
  react-quiz-component JSON the site consumes.
- The white-label mobile apps duplicate what the shipped PWA already does.

### Other hosted AI quiz makers

Sampled the current field (Edcafe AI, Questgen, ClassPoint, forms.app,
Fillout, MyQuizGPT). All generate questions from pasted or uploaded
content, but none export plain JSON; the closest is Questgen's QTI/Moodle
XML, which would still need conversion. They are priced per editor per
month, and most render quizzes on their own hosted pages, which breaks
offline use and adds a permanent third-party dependency.

### Conclusion

No hosted platform fits the constraints: offline static PWA, three
locales, react-quiz-component JSON as the delivery format, and no accounts
or rewards involving minors. The test integration therefore targeted the
in-repo pipeline instead: hand-authored quiz JSON rendered by the
`Quiz.tsx` island with results recorded in the local progress store (see
"What exists today"), and build-time generation with the Claude API as the
scaling path (see roadmap below), which keeps quizzes reviewable in the
repo and costs API calls only when chapter content changes.

## Roadmap

### 1. AI-generated quizzes per chapter

Quizzes are currently hand-authored JSON files linked from Strapi markdown
(any link containing `quiz` and `.json` is rendered as a `<QuizComponent>`
island, see `src/utils/markdown.ts`). To scale this to every chapter:

**Build-time generation script** (`scripts/generate-quizzes.ts`, to be
written):

1. Fetch all sections/chapters from Strapi (reuse `getSections` from
   `src/utils/data.ts`).
2. For each chapter above a minimum content length, call the Claude API
   (model `claude-sonnet-5`) with the chapter markdown and a JSON-schema
   prompt asking for 3-5 multiple-choice questions in the chapter's locale.
3. Emit react-quiz-component JSON to `public/quizzes/<locale>/<sectionSlug>/<chapterSlug>.json`.
4. Cache by content hash (store the hash inside the generated JSON) so
   unchanged chapters don't re-generate, keeping API cost near zero on
   rebuilds.

**Quality gate**: generated quizzes should be committed to the repo (not
generated on every CI run) so a human can review/fix questions before they
ship. Long-term, storing them in Strapi instead would let editors curate them
in the same place as the content.

**Rendering**: either keep the markdown-link convention (editors paste the
quiz link into Strapi) or auto-append the quiz to every chapter that has a
generated file. Auto-append is preferred: `Section.astro` can check for a
quiz at the conventional path at build time and render the island without any
editor action.

**Replace react-quiz-component with a custom quiz component.** The library's
own stylesheet is unusable as-is (see `stripQuizComponentCss` in
`astro.config.mjs`, a Vite transform that reaches into the library's bundled
JS to cut its injected `:root{--quiz-...}` CSS at build time) and `quiz.css`
now re-implements the full look by targeting the library's internal class
names (`.questionWrapperBody`, `.answerBtn`, `.quiz-result-filter`, etc.).
That's a lot of surface area riding on an untyped dependency (`Quiz.tsx`
imports it with `@ts-ignore`) whose DOM structure we don't control and that
could shift on any version bump, silently breaking the CSS overrides.

Since quizzes are build-time generated JSON (3-5 multiple-choice questions,
see above) and don't need the library's other question types (open-ended,
picture-choice, polls) or its result-filtering UI, a small purpose-built
component covering start screen, one question at a time, correct/incorrect
feedback, and a result summary would be less code than the override
stylesheet it replaces, fully typed, and would let `stripQuizComponentCss`
and the `react-quiz-component` dependency be deleted outright.

### 2. Badges and section completion

All derivable from the existing store, no schema change needed:

- **Section progress ring** next to each section in the ToC:
  `getSectionReadCount(sectionSlug, chapterSlugs) / chapters.length`.
- **Section badge** when every chapter is read *and* the section quiz best
  score is >= 80%. Sections already have distinctive icons and colors from
  Strapi; the badge can be the section icon in full color vs. grayscale.
- **"Thilo complete"** meta-badge when all sections are done.
- A small progress page (`/fortschritt`) listing sections, per-chapter read
  state, quiz scores, and earned badges. All client-rendered from
  `window.thiloProgress`, so it stays SSG-friendly.

### 3. Cross-locale progress

Keys are per-locale slugs today. To merge progress across languages, key
chapters by the stable Strapi identity instead: `sorting` for sections
(already used as the cross-locale key in `sectionMappings.ts`) and
`chapter.sorting` within a section. Migration: on first load with the new
version, rewrite `thilo-progress-v1` keys via the section mappings embedded
in the `all-sections` meta tag, bump to `thilo-progress-v2`.

### 4. Accounts and sync (later)

Local-first stays the default; sync is additive:

- **Option A, MiData OAuth**: scouts already have MiData accounts
  (PBS/MSdS/MSS member database). OAuth login, store the progress blob keyed
  by MiData id. Requires a small API (the Strapi instance could host a
  `progress` collection type).
- **Option B, group codes**: a Leiter creates a group code; scouts join with
  the code and a nickname, no personal data. Enables a group leaderboard for
  quiz scores, which fits scouting better than individual rankings.

Sync protocol: last-write-wins per key (`chaptersRead` timestamps and
`quizResults.completedAt` already carry the data needed for merging).

### Privacy notes

- Everything today is device-local; nothing leaves the browser.
- If sync is added, progress data is personal data of mostly minors: group
  codes (Option B) are the safer default, MiData only with PBS involvement.
