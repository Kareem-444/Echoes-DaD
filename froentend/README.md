# Echoes — Project Status

## Tech Stack
- **Backend**: Django 4.2.17 (Python 3.12+)
- **Frontend**: Next.js 14.2 (React 18, TypeScript, Tailwind CSS)
- **Database**: PostgreSQL (via `psycopg2-binary`)
- **Authentication**: JWT (JSON Web Tokens) with `djangorestframework-simplejwt`
- **API Architecture**: RESTful API using Django REST Framework (DRF)

## Current API Endpoints

### Authentication & User Management
- `POST /api/auth/register/` - Register a new user (Email + Password)
- `POST /api/auth/login/` - Login and receive Access/Refresh JWTs
- `POST /api/auth/logout/` - Invalidate the current session
- `GET /api/auth/me/` - Retrieve the authenticated user's profile and stats
- `POST /api/users/<uuid:user_id>/block/` - Block or unblock a specific user

### Echoes (Posts)
- `GET /api/echoes/` - Fetch all active, non-expired echoes (excludes blocked users)
- `POST /api/echoes/` - Create a new echo (max 500 characters, optional mood)
- `GET /api/echoes/<uuid:echo_id>/` - Retrieve details of a specific echo
- `DELETE /api/echoes/<uuid:echo_id>/` - Delete your own echo
- `POST /api/echoes/<uuid:echo_id>/resonate/` - Resonate with an echo (increments count and checks for milestones)
- `POST /api/echoes/<uuid:echo_id>/report/` - Report an echo for spam, harm, or inappropriateness
- `GET /api/echoes/prompts/today/` - Get the daily writing prompt

### Matches & Connection
- `GET /api/matches/` - List all active matches for the authenticated user
- `POST /api/matches/generate/` - Algorithmically generate up to 3 new matches based on recent echoes
- `GET /api/matches/<uuid:pk>/` - View match details and block status
- `DELETE /api/matches/<uuid:pk>/` - Unmatch or permanently delete a connection

### Chat & Messaging
- `GET /api/chat/<uuid:match_id>/` - Retrieve message history for a match
- `POST /api/chat/<uuid:match_id>/` - Send a message (costs 5 tokens)

### Tokens & Economy
- `GET /api/tokens/balance/` - Check current token balance and last claim date
- `POST /api/tokens/daily/` - Claim the daily reward (5 tokens once per 24h)

## Database Models

### User (users table)
- `id` (UUID): Primary key
- `email` (EmailField): Unique identifier
- `anonymous_name` (CharField): Poetic pseudonym (e.g., "Silent Circle")
- `avatar_shape` & `avatar_color`: Geometric profile visuals
- `token_balance` (IntegerField): User's virtual currency (default: 50)
- `echoes_shared` & `resonances`: Performance metrics
- `last_daily_claim` (DateField): Tracks daily token claims

### Echo (echoes table)
- `id` (UUID): Primary key
- `author` (ForeignKey): Link to `User`
- `content` (TextField): 500-character limit
- `resonance_count` (IntegerField): Number of "likes"
- `mood` (CharField): Emotional tag (e.g., "reflective", "vibrant")
- `expires_at` (DateTimeField): Auto-set to 24 hours after creation
- `created_at` (DateTimeField)

### Match (matches table)
- `id` (UUID): Primary key
- `user1` & `user2` (ForeignKeys): The two connected users
- `echo1` & `echo2` (ForeignKeys): The echoes that triggered the match
- `harmony_score` (IntegerField): 60-99% algorithmically determined
- `is_active` (BooleanField): Tracks if the match is still open

### Message (messages table)
- `id` (UUID): Primary key
- `match` (ForeignKey): Link to `Match`
- `sender` (ForeignKey): Link to `User`
- `content` (TextField): Chat text
- `is_read` (BooleanField): Message status

### Supporting Tables
- `blocks`: `blocker` → `blocked` relationship
- `reports`: `reporter` → `echo` with reason code
- `daily_prompts`: Fixed-date writing prompts
- `token_transactions`: Log of all token influx (daily) and outflow (chat)

## Implemented Features
- [x] **Delete Echo**: Users can remove their own posts.
- [x] **Report Echo**: Community moderation tools for reporting content.
- [x] **Block User**: Ability to prevent interaction and hide content from specific users.
- [x] **Unmatch**: Break a connection to hide chat history and matches.
- [x] **Echo Expiry (24h)**: Backend logic filters out old content automatically.
- [x] **Mood Tags**: Users can label echoes with emotions for better discovery.
- [x] **Daily Prompt**: Centralized system providing writing inspiration.
- [x] **Resonance Milestone Notification**: Backend triggers milestone flags at 50, 100, and 500 resonances.
- [x] **JWT Auth**: Full secure login/logout flow with token persistence.
- [x] **Anonymity System**: Auto-generation of names and geometric avatars.

## In Progress
- [ ] **Boost Echo (tokens)**: Implementation for spending tokens to pin/highlight echoes.
- [ ] **Messaging Persistence**: Refining the current REST-based chat into a more robust interface.
- [ ] **Real-time Notifications**: Adding WebSocket support for immediate message delivery.

## Missing / TODO
- [ ] **Buy Token Packs**: Stripe integration for purchasing token bundles.
- [ ] **Email Verification**: Production-grade onboarding flow.
- [ ] **Password Reset**: Self-service account recovery logic.
- [ ] **Production Deployment**: Docker/Kubernetes or platform-specific configs (Vercel/Heroku).

## Notes
### Matching Algorithm
The current algorithm (`generate_matches`) selects 3 random users who have active echoes and are not blocked. It calculates a "Harmony Score" (base 60-99%). If the current user and the candidate share the exact same mood tag on their latest echoes, a **20% Harmony Boost** is applied, emphasizing emotional resonance.

### Token System
- **Initial Grant**: 50 tokens
- **Daily Reward**: +5 tokens
- **Message Cost**: -5 tokens per message sent
- **Resonating**: Currently free (intended to encourage engagement)
