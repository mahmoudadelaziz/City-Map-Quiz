# Egypt Map Quiz

A small learning game for recognizing streets and landmarks in Egyptian cities using unlabeled, georeferenced OpenStreetMap street geometry.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/egypt-map-quiz run dev` — run the web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Web app: React + Vite
- API: Express 5
- Database: none for the first version; fixed quiz content is served from the API
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/egypt-map-quiz/src/App.tsx` — city selection, quiz flow, and score review UI
- `artifacts/egypt-map-quiz/src/index.css` — app styling and responsive layout
- `artifacts/api-server/src/lib/map-quiz-data.ts` — sample cities, questions, choices, and private answer keys
- `artifacts/api-server/src/routes/map-quiz.ts` — city list, quiz delivery, and grading endpoints
- `lib/api-spec/openapi.yaml` — API contract; generated React hooks and server validation schemas come from this file

## Architecture decisions

- Quiz questions are fixed sample data in the API for now; answers are graded server-side and the answer key is not sent with quiz questions.
- Quiz maps use a randomized local OpenStreetMap section around each target, with zoom controls. Street names appear on landmark questions and stay hidden on street questions; water is blue and gardens are green.
- No score history or account data is persisted yet, so the first version does not need a database.

## Product

Choose Cairo or Alexandria, answer six multiple-choice questions about local streets and landmarks on a real, unlabeled street map, and receive a graded score with a question-by-question review. Users can replay a city quiz.

## User preferences

The user prefers a simple MERN-style stack and wants brief explanations while the app is built. Keep future additions easy to follow.

## Gotchas

- The quiz map is for place recognition, not turn-by-turn navigation. Keep visible OpenStreetMap contributor attribution when changing map presentation.
- After changing `lib/api-spec/openapi.yaml`, run `pnpm --filter @workspace/api-spec run codegen` before using updated client hooks or server schemas.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
