# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

No test framework is configured.

## Architecture

Next.js 16 App Router application for AI-powered music generation with lyrics creation. TypeScript strict mode, React 19, Tailwind CSS v4, deployed to Vercel.

### Data Flow

1. User inputs topic, style, mood → POST `/api/generate-lyrics` → OpenAI-compatible LLM → returns title, tags, lyrics
2. User edits lyrics → POST `/api/generate-music` → Suno API → inline polling (up to 55s for Vercel timeout) → returns songs
3. Client polls GET `/api/status?taskId=...` for async completion if inline polling times out
4. Projects persisted in browser localStorage (key: `ai_music_history_v1`)

### Key Files

- **`app/page.tsx`** — Main client component; all UI state management via React hooks. Multi-step flow: input → lyrics_editing → music_processing → completed.
- **`app/lib/data.ts`** — Music style presets and mood definitions with detailed Suno API prompt/tag arrays.
- **`app/lib/storage.ts`** — localStorage wrapper. Types: `Project`, `Song`.
- **`app/api/generate-lyrics/route.ts`** — Lyrics generation via OpenAI-compatible API. CORS-enabled.
- **`app/api/generate-music/route.ts`** — Music generation via Suno API with polling loop. Runtime: nodejs, maxDuration: 60s. CORS-enabled.
- **`app/api/status/route.ts`** — Polls Suno `/generate/record-info` for async task status.
- **`app/api/create/route.ts`** — Legacy combined endpoint (lyrics + music in one route).

### Environment Variables

| Variable | Purpose | Default |
|---|---|---|
| `LYRICS_API_KEY` | OpenAI-compatible API key for lyrics generation | — |
| `LYRICS_BASE_URL` | OpenAI-compatible API base URL | — |
| `LYRICS_MODEL` | LLM model name | `deepseek-chat` |
| `SUNO_BASE_URL` | Suno API base URL | — |
| `SUNO_API_KEY` | Suno API key | — |

### Patterns

- Path alias: `@/*` maps to project root
- API routes use CORS headers (`Access-Control-Allow-Origin: *`) with OPTIONS support
- Suno API response normalization handles field name variations across API versions
- OpenAI SDK configured with custom baseURL for provider flexibility (DeepSeek, etc.)
- Geist font family via `next/font/google`
