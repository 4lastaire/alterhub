# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Mobile**: Expo (React Native) with Expo Router

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── alterhub/           # Expo React Native app (Alterhub)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Alterhub Mobile App

Alterhub app for tracking system members and fronting history.

### Features
- **Members tab**: List all alters with colored borders, pronouns, front status
- **Fronting tab**: See currently fronting alters with timer and custom status
- **History tab**: Timeline of front sessions with date range filtering
- **Member detail**: Create/edit/delete members with name, pronouns, description, color, avatar

### Navigation
- Tab-based navigation (NativeTabs on iOS 26, classic Tabs fallback)
- Modal presentation for member create/edit screen
- Pull-to-refresh on all lists

### Theme
- Dark mode: `#0D1117` background, `#161B22` surface, `#4ECDC4` tint
- 15 predefined member colors

## Database Schema

- `members` table: id, name, pronouns, description, color, avatar_url, is_fronting, timestamps
- `front_sessions` table: id, member_id, member_name, member_color, member_avatar_url, custom_status, start_time, end_time, is_active

## API Endpoints

- `GET/POST /api/members` — list and create members
- `GET/PUT/DELETE /api/members/:id` — read, update, delete member
- `GET/POST /api/fronters` — list active sessions, start fronting
- `DELETE /api/fronters/:id` — stop fronting session
- `PATCH /api/fronters/:id/status` — update custom status
- `GET /api/front-history` — front history with optional date range
