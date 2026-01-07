# Backend Scripts

## create-admin.ts
Source: [apps/backend/scripts/create-admin.ts](../../apps/backend/scripts/create-admin.ts)

Creates an admin user directly in MongoDB. Update `username`, `email`, and especially `userPassword` before running.

Run (example):
```
cd apps/backend
node -r dotenv/config scripts/create-admin.ts
```

Notes:
- Script builds its own Mongo URI from `MONGO_HOST/PORT/DB`. For consistency with the app, consider switching it to `MONGODB_URI`.
- Do not use production credentials in source; inject via environment.

## migration-runner.ts
Source: [apps/backend/scripts/migration-runner.ts](../../apps/backend/scripts/migration-runner.ts)

Placeholder for running migrations. Currently empty.