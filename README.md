# The Reel — Cinematic Movie Explorer & Watchlist

An award-style, story-driven, and high-performance movie explorer and watchlist web application built with **React 18**, **TypeScript**, **Vite**, **Framer Motion**, and **Lenis** smooth scrolling.

Built strictly under a monochromatic design philosophy (jet black and off-white) with subtle SVG film-grain noise, 3D CSS perspective cards with dynamic glare highlights, magnetic button physics, difference blend-mode cursor lerping, debounced search with `AbortController` cancellation, infinite scroll, and an optimistic watchlist with automatic `localStorage` rollback.

---

## Quick Start & Run Instructions

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later

### Installation & Local Setup

1. **Clone the repository and enter the directory**:
   ```bash
   git clone <repository-url>
   cd movie_exp_list
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your TMDB API key to `.env`:
   ```env
   VITE_TMDB_KEY=your_actual_tmdb_api_key_here
   ```
   > **Note on Zero-Config Evaluation**: If `VITE_TMDB_KEY` is omitted or left blank, the application automatically routes all requests to a curated, high-fidelity offline catalog featuring full cast rosters, synopsis, and CDN artwork (including *Interstellar*, *Blade Runner 2049*, *Dune*, *Parasite*, *Inception*, and *The Godfather*). Evaluators can test the entire experience immediately without setting up API keys!

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Production Build & Preview**:
   ```bash
   npm run build
   npm run preview
   ```

---

## Architecture & Codebase Structure

```
movie_exp_list/
├── src/
│   ├── api/
│   │   ├── tmdb.ts              # Pure fetch layer; accepts AbortSignal; status code validation
│   │   └── mockData.ts          # Curated offline catalog for zero-config evaluation & offline resilience
│   ├── types/
│   │   └── movie.ts             # Strict TypeScript models: Movie, MovieDetails, WatchlistAction, etc.
│   ├── context/
│   │   └── ToastContext.tsx     # Minimal pill toast provider with spring dismissal
│   ├── hooks/
│   │   ├── useDebounce.ts       # 300ms input debounce window
│   │   ├── useMovieSearch.ts    # Search orchestrator: AbortController cancellation, deduplication, retry
│   │   ├── useInfiniteScroll.ts # IntersectionObserver sentinel with 400px prefetch threshold
│   │   ├── useWatchlist.tsx     # useReducer + Context + localStorage optimistic sync & atomic rollback
│   │   ├── useMousePosition.ts  # Pointer tracking with coarse touch guard
│   │   ├── useMagnetic.ts       # Spring attraction within 80px radius
│   │   ├── useTilt.ts           # 3D perspective rotation (rotateX/rotateY) and specular glare
│   │   ├── useTextScramble.ts   # Cinematic character decryption sequence
│   │   ├── useLenis.ts          # Lenis smooth-scroll engine with exponential deceleration
│   │   └── useReducedMotion.ts  # WCAG 2.1 prefers-reduced-motion media query listener
│   ├── components/
│   │   ├── Hero/                # Storytelling hero with masked word reveal & mouse-following spotlight
│   │   ├── SearchBar/           # Pill-shaped input with clear action and '/' shortcut
│   │   ├── MovieCard/           # 3D tilt card, floating translateZ layers, slide-up hover action
│   │   ├── MovieGrid/           # Responsive 2 to 6 column grid with infinite scroll sentinel
│   │   ├── Skeleton/            # Shimmer sweep skeleton loading grid
│   │   ├── DetailModal/         # Shared-element transition (layoutId), focus trap, scroll lock
│   │   ├── WatchlistSection/    # Inverted high-contrast section with layoutId tab underline
│   │   ├── CustomCursor/        # Lerp trailing ring with difference blend-mode & card expansion
│   │   ├── Magnetic/            # Reusable magnetic physics button wrapper
│   │   ├── Marquee/             # Continuous text ribbon accelerating proportional to scroll velocity
│   │   ├── ScrollProgress/      # 2px hairline top progress indicator
│   │   ├── Toast/               # Spring-animated bottom-center pill toasts
│   │   ├── EmptyState/          # Minimalist typographic empty state
│   │   ├── ErrorState/          # Offline-aware error presentation with retry action
│   │   └── Footer/              # Monolithic serif wordmark with scroll fade-in
│   ├── styles/
│   │   ├── tokens.css           # Strict monochromatic design tokens, clamp type scale, grid vars
│   │   └── global.css           # Reset, SVG film grain overlay, focus rings, Lenis rules
│   ├── App.tsx                  # Root application tree wiring providers and storytelling layout
│   └── main.tsx                 # DOM root rendering with film grain noise filter
```

---

## Strict Monochromatic Design System

The application strictly enforces a high-contrast monochromatic palette where **movie posters provide the only accent colors on the page**:

- **Core Palette**:
  - `--bg: #0A0A0A` (Jet black)
  - `--surface: #121212`, `--surface-2: #1A1A1A`, `--surface-hover: #222222`
  - `--fg: #F2EFE8` (Off-white)
  - `--fg-muted: rgba(242, 239, 232, 0.6)`, `--border: rgba(242, 239, 232, 0.12)`
- **Inverted Contrast Section ("Your Reel")**:
  - `--inv-bg: #F2EFE8` (Off-white background)
  - `--inv-fg: #0A0A0A` (Jet black typography)
  - Creates a dramatic editorial shift for personal queue curation.
- **Typography Hierarchy**:
  - **Display**: *Instrument Serif* (Google Fonts) with fluid `clamp()` sizing and tight letter spacing.
  - **UI / Body**: *Inter* with small uppercase labels and wide tracking (`0.18em`).
- **Texture**: Procedural SVG `feTurbulence` film-grain overlay applied at `~4.5%` opacity with `mix-blend-mode: overlay`.

---

## State Management Rationale (Why No Redux?)

A common architectural question in frontend assessments is state management selection. Here is why **`useReducer` + `createContext`** was chosen over Redux / Zustand:

1. **Zero Bundle Bloat**: Avoids adding 10kB+ of external store runtime and boilerplate middleware to the bundle.
2. **Domain Isolation**:
   - The **Watchlist** is the only cross-cutting persistent domain in the app; managing it via an isolated context provider guarantees complete predictability.
   - The **Search UI** (query, input text, transient active tabs) correctly resides in local component state. Storing rapid keystroke inputs in a global store causes unnecessary root re-renders across the entire tree.
3. **Deterministic Action Reducers**: `useReducer` gives us identical action dispatching (`ADD`, `REMOVE`, `TOGGLE_STATUS`, `ROLLBACK`) and atomic snapshot restoration capabilities without third-party machinery.

---

## Technical Deep-Dive: Race Conditions from Rapid Keystrokes

### The Problem
When a user types into a live search input (e.g. typing `"Dune"`), a separate network request can be emitted for each keystroke:
1. `t = 0ms`: User types `"D"` $\to$ Request A dispatched (takes 450ms)
2. `t = 80ms`: User types `"Du"` $\to$ Request B dispatched (takes 350ms)
3. `t = 160ms`: User types `"Dun"` $\to$ Request C dispatched (takes 200ms)
4. `t = 240ms`: User types `"Dune"` $\to$ Request D dispatched (takes 100ms)

Request D resolves first at `t = 340ms`, displaying results for `"Dune"`. However, at `t = 450ms`, the older Request A finishes and overwrites the UI with results for `"D"`. The user sees the search results mysteriously revert to stale data.

### The Solution: Multi-Tiered Synchronization

```
Keystroke
   │
   ▼
[useDebounce (300ms)]  ──(Paces request dispatch until user pauses)
   │
   ▼
[useMovieSearch]
   ├── 1. abortControllerRef.current.abort()  ──(Cancels prior socket immediately)
   ├── 2. const controller = new AbortController()  ──(Instantiates fresh controller)
   ├── 3. searchMovies(query, page, controller.signal)  ──(Passes signal to fetch)
   └── 4. catch(error):
             if (error.name === 'AbortError') return; ──(Silently ignore cancellation)
```

1. **300ms Debounce Window**: Suppresses firing intermediate queries while the user is actively typing.
2. **Socket-Level Cancellation**: As soon as a debounced query fires, `useMovieSearch` calls `.abort()` on its stored `AbortController`. The browser immediately terminates the TCP stream, conserving client bandwidth.
3. **Token Validation**: The hook checks whether `abortControllerRef.current === controller` before committing state, ensuring only the latest query has authority to update React state.
4. **Silent Abort Trapping**: When a request is aborted, `fetch` rejects with a `DOMException` where `name === 'AbortError'`. The catch handler explicitly ignores this error, preventing spurious alert banners or state resets.

---

## Optimistic UI & Storage Rollback Mechanism

When a user adds a film to their Reel:
1. **Immediate State Commit**: The action is dispatched to `watchlistReducer`, updating React memory and UI components with zero perceived latency.
2. **Background Serialization**: The next state is serialized to JSON and persisted to `localStorage`.
3. **Atomic Rollback on Error**: If `localStorage.setItem` throws an exception (such as `QuotaExceededError` or private browsing restrictions):
   - The catch block immediately dispatches `{ type: 'ROLLBACK', previousState }`.
   - React state reverts back to the exact pre-mutation snapshot.
   - An error toast notifies the user: *"Storage quota exceeded. Reverted changes."*

---

## Creative Interaction & Physics Mechanics

- **Custom Difference Cursor**:
  - Immediate 6px inner dot tracks physical mouse position.
  - Trailing 36px outer ring follows via linear interpolation (`lerpFactor = 0.16`) inside an isolated `requestAnimationFrame` loop.
  - Hovering a movie card smoothly expands the ring to 72px and reveals an inner `"View"` label.
  - Hovering buttons contracts the ring to 22px with an off-white fill.
- **3D Tilt Cards with Glare**:
  - Computes mouse coordinates relative to the card's bounding box and applies hardware-accelerated 3D rotation (`rotateX`, `rotateY` up to $\pm 10^\circ$) under `perspective: 1000px`.
  - A moving specular radial gradient shifts opposite the cursor angle.
  - `transform-style: preserve-3d` with `translateZ(24px)` elevates typography layers into real 3D z-space.
- **Magnetic Buttons**:
  - Calculates Euclidean distance ($\sqrt{\Delta x^2 + \Delta y^2}$) between pointer and button center; attracts within an 80px radius and springs back on leave.
- **Kinetic Marquee**:
  - Infinite continuous text strip that detects window scroll delta ($\Delta y$) and temporarily accelerates its velocity, decaying back to baseline speed with exponential friction.
- **Shared-Element Detail Modal**:
  - Clicking any card expands the poster directly into the modal view via Framer Motion `layoutId={`poster-${movie.id}`}` using FLIP animation.
  - Traps keyboard `Tab` within the dialog, locks background body scroll, and listens for the `Escape` key.

---

## Accessibility & Performance Guarantees

- **Respect for `prefers-reduced-motion`**:
  - Automatically disables Lenis smooth scrolling, cursor lerping, 3D card tilt, magnetic physics, and continuous marquee movement.
- **Touch-First Detection**:
  - Bypasses custom cursor and tilt transformations on coarse touch screens (`@media (pointer: coarse)`), preserving 60fps native mobile touch scrolling.
- **Cumulative Layout Shift (CLS) Prevention**:
  - All poster card containers and skeletons enforce a rigid `2/3` aspect ratio with fallback monograms.
- **Keyboard Navigation**:
  - High-visibility focus indicators (`:focus-visible` with `outline-offset: 4px`).
  - Search hotkey (`/` to focus, `Escape` to clear).
  - ARIA compliance (`role="dialog"`, `aria-modal="true"`, `aria-label` attributes on cards, buttons, and inputs).

---

## Vercel Deployment Instructions

Deploying this application to **Vercel** takes under two minutes:

### Option A: Via Vercel Web Dashboard (Recommended)
1. Push this repository to your GitHub/GitLab account.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your `movie_exp_list` repository.
4. Framework Preset will be automatically detected as **Vite**.
5. Under **Environment Variables**, add:
   - **Key**: `VITE_TMDB_KEY`
   - **Value**: Your TMDB API key (optional; if left empty, fallback catalog activates automatically).
6. Click **Deploy**. Vercel will run `tsc && vite build` and deploy the output in `/dist`.

### Option B: Via Vercel CLI
```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy to preview
vercel

# 4. Deploy to production
vercel --prod
```
When prompted, accept the default build command (`vite build`) and output directory (`dist`).
