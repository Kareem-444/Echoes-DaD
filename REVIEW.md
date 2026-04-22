# Codebase Review

## 🔴 Critical (must fix before production)

- File path: `backend/apps/users/serializers.py`, `backend/apps/echoes/serializers.py`, `backend/apps/matches/serializers.py`, `backend/apps/chat/serializers.py`
  - What the problem is: `UserSerializer` includes `email`, and that serializer is nested into echo authors, match participants, and chat message senders.
  - Why it matters: Echoes is positioned as anonymous, but feed, match, and chat API responses can expose private email addresses to other authenticated users.

- File path: `froentend/lib/AuthContext.tsx`, `froentend/lib/api.ts`, `froentend/lib/chat/chatSocketStub.ts`, `froentend/lib/contexts/WebSocketContext.tsx`, `froentend/middleware.ts`
  - What the problem is: Access and refresh JWTs are stored in `localStorage`; the access token is mirrored into a browser-readable cookie without `HttpOnly` or `Secure`; WebSocket URLs send JWTs as `?token=...`; WebSocket builders always emit `ws://`.
  - Why it matters: XSS can steal both access and refresh tokens, query-string tokens can leak through logs/proxies/browser tooling, and plain `ws://` is insecure and breaks under HTTPS due to mixed content.

- File path: `backend/echoes_backend/settings.py`
  - What the problem is: `SECRET_KEY` falls back to `django-insecure-default-key`, `DEBUG` defaults to `True`, and production security settings such as HTTPS redirect, HSTS, secure cookies, and proxy SSL headers are not configured.
  - Why it matters: A missing environment variable can silently boot production with development security posture and a predictable signing key.

- File path: `backend/apps/users/views.py`, `backend/echoes_backend/settings.py`
  - What the problem is: Logout calls `RefreshToken(refresh_token).blacklist()`, but `rest_framework_simplejwt.token_blacklist` is not installed. Exceptions are swallowed with `except Exception: pass`.
  - Why it matters: Refresh tokens may remain valid after logout, and failures are invisible to operators and users.

- File path: `froentend/app/api/chat/route.ts`, `froentend/components/AIAssistant.tsx`
  - What the problem is: The Groq-backed AI route is unauthenticated, has no rate limiting, accepts arbitrary message arrays, and returns raw exception messages to the client.
  - Why it matters: Anyone who can reach the Next.js app can burn paid AI quota, submit oversized prompts, and receive internal configuration/runtime details.

- File path: `froentend/app/api/chat/route.ts`, `froentend/app/chat/[id]/page.tsx`, `froentend/app/feed/page.tsx`, `froentend/app/profile/page.tsx`, `froentend/components/NotificationToast.tsx`, `froentend/lib/contexts/WebSocketContext.tsx`
  - What the problem is: `npx.cmd tsc --noEmit` fails with multiple TypeScript errors, including Groq message typing, nullable booleans passed to JSX `disabled`, missing `Modal` props, optional milestone values assigned to required numbers, notification title literal types, and `Set<unknown>` inference.
  - Why it matters: The frontend is not type-clean and may fail production builds or ship paths with mismatched runtime contracts.

## 🟡 Important (should fix soon)

- File path: `backend/apps/users/views.py`, `backend/apps/echoes/views.py`, `backend/apps/matches/views.py`, `backend/apps/tokens/views.py`, `backend/apps/chat/services.py`, `froentend/app/api/chat/route.ts`
  - What the problem is: No throttling/rate limiting is configured for login/register/Google auth, echo resonance, reports, match generation, daily token claims, chat sends, or the AI route.
  - Why it matters: These endpoints can be brute-forced or abused to spam notifications, inflate resonance counts, exhaust token/AI budgets, and create avoidable load.

- File path: `backend/apps/chat/services.py`, `backend/apps/tokens/views.py`, `backend/apps/echoes/views.py`
  - What the problem is: Chat token deduction and daily token rewards are not wrapped in transactions or row locks; resonance has no per-user uniqueness guard.
  - Why it matters: Concurrent requests can overspend or over-credit token balances, and one user can repeatedly resonate with the same echo.

- File path: `backend/apps/echoes/serializers.py`, `backend/apps/chat/serializers.py`, `backend/apps/echoes/models.py`, `froentend/app/api/chat/route.ts`
  - What the problem is: `EchoCreateSerializer` lacks the non-empty validation present on `EchoSerializer`; `MessageCreateSerializer` allows whitespace and unbounded message length; `mood` is free-form; AI messages are not length-limited or schema-validated beyond being an array.
  - Why it matters: Invalid or oversized user input can degrade data quality, inflate storage, and increase abuse surface.

- File path: `backend/apps/echoes/views.py`, `backend/apps/chat/views.py`, `backend/apps/matches/views.py`, `froentend/app/feed/page.tsx`, `froentend/app/profile/page.tsx`, `froentend/app/chat/[id]/page.tsx`
  - What the problem is: Feed, profile echoes, chat history, and matches load full result sets without pagination. Match generation materializes all candidate users before sampling.
  - Why it matters: As data grows, common screens can become slow or memory-heavy and API responses can become too large for mobile clients.

- File path: `backend/apps/echoes/models.py`, `backend/apps/matches/models.py`, `backend/apps/chat/models.py`, `backend/apps/notifications/models.py`, `backend/apps/tokens/models.py`
  - What the problem is: Frequently queried/order-by fields lack explicit composite indexes, including active feed ordering, user match lookups, match message history, notification inbox reads, and token transaction history.
  - Why it matters: PostgreSQL will increasingly rely on scans/sorts for core product queries.

- File path: `backend/apps/matches/views.py`, `backend/apps/matches/serializers.py`
  - What the problem is: Match generation performs per-candidate latest echo queries, and match serialization selects `echo1`/`echo2` but not their nested authors.
  - Why it matters: This creates N+1 query patterns that will worsen as match volume grows.

- File path: `backend/apps/tokens/models.py`, `backend/apps/tokens/migrations/`
  - What the problem is: `python manage.py makemigrations --check --dry-run` reports a missing migration for `TokenTransaction.reason` because the model includes `boost` but migrations do not.
  - Why it matters: Fresh deployments can have schema/model drift, and boost token transactions may fail validation or diverge between environments.

- File path: `backend/echoes_backend/settings.py`, `backend/.env.example`, `froentend/.env.example`, `README.md`
  - What the problem is: Required production environment variables are only partially documented. Redis/channel layer variables, frontend WebSocket URL, CORS origins, and Django secure deployment flags are missing or incomplete; examples still default to `DEBUG=True`.
  - Why it matters: Deployment relies on tribal knowledge and can accidentally run with development defaults.

- File path: `backend/echoes_backend/settings.py`
  - What the problem is: Channels falls back to `InMemoryChannelLayer` unless Redis variables are present.
  - Why it matters: In multi-process or multi-instance production, WebSocket notifications/chat events will not reliably reach users across workers.

- File path: `backend/echoes_backend/settings.py`
  - What the problem is: CORS is hard-coded to localhost and `CORS_ALLOW_CREDENTIALS=True`.
  - Why it matters: This is not overly open today, but it is not environment-driven for production and credentialed CORS needs strict origin management.

- File path: `backend/apps/users/views.py`, `froentend/app/chat/[id]/page.tsx`, `froentend/components/NotificationInboxButton.tsx`, `froentend/app/write/page.tsx`
  - What the problem is: Several catch blocks swallow errors or only log to the browser console; backend logout suppresses all exceptions.
  - Why it matters: Production failures become hard to diagnose and users can see stale or misleading state.

- File path: `backend/echoes_backend/settings.py`
  - What the problem is: No explicit backend `LOGGING` configuration is present.
  - Why it matters: Authentication, abuse, WebSocket, and token-balance issues need structured server-side visibility in production.

- File path: `backend/apps/users/views.py`
  - What the problem is: Google OAuth verification checks audience, issuer, email, and `email_verified`, which is good, but there is no rate limiting and configuration failure is returned as a client-facing message.
  - Why it matters: The verification core is sound, but operational and abuse controls are still missing around the endpoint.

- File path: `froentend/lib/groqClient.ts`
  - What the problem is: Server code reads `.env.local` directly from disk before checking `process.env`.
  - Why it matters: This is brittle in serverless/container deployments and increases the chance of environment-specific behavior.

- File path: `froentend/app/matches/page.tsx`, `froentend/app/profile/page.tsx`, `froentend/components/MatchCard.tsx`
  - What the problem is: `npm.cmd run lint` fails on two explicit `any` usages and one unused `useRouter` import.
  - Why it matters: The lint gate currently fails and loose typing hides response-shape mistakes.

## 🟢 Minor (nice to have)

- File path: `froentend/src/app/*`, `froentend/lib/auth.tsx`, `froentend/lib/mockData.ts`, `froentend/components/GeometricAvatar.tsx`, `froentend/components/TokenBadge.tsx`, `Echoes/*`
  - What the problem is: Legacy scaffold, mock data, unused components, and static prototype HTML/screenshots remain in the tracked repo.
  - Why it matters: Dead code makes navigation harder and increases the chance future edits target the wrong implementation.

- File path: `froentend/app/auth/page.tsx`, `froentend/app/write/page.tsx`, `froentend/app/feed/page.tsx`, `froentend/app/page.tsx`, `froentend/components/EchoCard.tsx`, `froentend/components/MatchCard.tsx`, `README.md`
  - What the problem is: Several files contain mojibake/encoding artifacts such as `âœ¦`, `ðŸ˜Š`, and `Â©`.
  - Why it matters: User-facing copy and documentation look broken and may signal broader encoding inconsistency.

- File path: `froentend/app/auth/page.tsx`, `froentend/app/chat/[id]/page.tsx`, `froentend/app/settings/page.tsx`, `froentend/app/page.tsx`, `froentend/components/AIAssistant.tsx`, `froentend/components/EchoCard.tsx`, `froentend/components/NotificationInboxButton.tsx`, `froentend/lib/chat/chatSocketStub.ts`
  - What the problem is: Several components exceed 200 lines and mix fetching, state management, rendering, and formatting.
  - Why it matters: Large components are harder to test and make regressions more likely during feature work.

- File path: `froentend/app/forgot-password/page.tsx`, `froentend/app/privacy/page.tsx`, `froentend/app/ethics/page.tsx`, `froentend/app/terms/page.tsx`, `froentend/app/safety/page.tsx`
  - What the problem is: Placeholder/coming-soon pages are still linked from real user flows.
  - Why it matters: Production users expect password recovery and legal/safety pages to be complete.

- File path: `backend/scratch/seed_prompts.py`
  - What the problem is: A scratch script is tracked under `backend/` and manually mutates `sys.path`.
  - Why it matters: It is useful for development but should be documented as operational tooling or moved out of application code.

- File path: `froentend/app/layout.tsx`, `froentend/app/welcome/page.tsx`, `froentend/components/AIAssistant.tsx`
  - What the problem is: ESLint warns about page-scoped custom font loading and raw `<img>` usage instead of `next/image`.
  - Why it matters: These are not immediate correctness bugs, but they can hurt frontend consistency and image performance.

- File path: `froentend/`, project root docs
  - What the problem is: The frontend directory is misspelled as `froentend`.
  - Why it matters: It creates friction in scripts, onboarding, documentation, and deployment setup.

- File path: `froentend/lib/chat/chatSocketStub.ts`
  - What the problem is: The live chat socket hook still has `Stub` in its filename.
  - Why it matters: The name understates that this is production behavior and can mislead maintainers.

- File path: `README.md`, `froentend/README.md`, `froentend/lib/api.ts`
  - What the problem is: The README says the frontend API client is hard-coded to localhost, but the current code reads `NEXT_PUBLIC_API_URL`.
  - Why it matters: Outdated documentation can cause incorrect deployment/debugging assumptions.

- File path: `backend/`, `froentend/`
  - What the problem is: No TODO/FIXME comments were found in application code.
  - Why it matters: This is a positive cleanup signal, but it also means unfinished work is represented by placeholder files and README notes rather than inline task markers.

## 📊 Summary

- Backend framework check: `python manage.py check` passed with no issues.
- Backend migration check: `python manage.py makemigrations --check --dry-run` failed because a `TokenTransaction.reason` migration is missing.
- Frontend lint: `npm.cmd run lint` failed on explicit `any` and an unused import; it also produced image/font warnings.
- Frontend type check: `npx.cmd tsc --noEmit` failed with multiple type errors.
- Secret scan: no committed private API keys or private keys were detected in tracked source, but insecure defaults and real-looking public OAuth client IDs are present in examples.
- Authentication coverage: Django REST endpoints are generally protected by `IsAuthenticated` except intended auth endpoints; the main gaps are token storage, refresh-token invalidation, throttling, and the unauthenticated Next.js AI route.
- Google OAuth: token verification uses Google audience verification, issuer checks, and `email_verified`; no core verification flaw was found.
