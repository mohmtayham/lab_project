# LabSphere API

Laboratory Information System (LIS) REST API built with **NestJS + Prisma + MySQL**.

## Features

- **JWT auth** with access + refresh tokens (argon2 password hashing)
- **RBAC** — roles (`ADMIN`, `DOCTOR`, `LAB_TECH`, `RECEPTIONIST`, `ACCOUNTANT`) with fine-grained permissions enforced by global guards
- Full lab domain: patients, test catalogue, orders, test requests, samples, devices, **results with review/approve workflow and audit history**, payments (with discounts), support requests, notifications
- Dashboard aggregation endpoints (stats, trends, distributions)
- Swagger docs, Helmet, CORS, rate limiting, global validation

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env        # then edit DATABASE_URL + secrets

# 3. Create the database schema
npm run prisma:migrate      # dev migration
#   or: npx prisma db push  # push schema without a migration

# 4. Seed roles, permissions, admin user and demo data
npm run db:seed

# 5. Run
npm run start:dev
```

API is served under `http://localhost:8000/api` and Swagger docs at `http://localhost:8000/api/docs`.

### Seeded logins

| Role      | Email                  | Password   |
|-----------|------------------------|------------|
| ADMIN     | admin@labsphere.io     | Admin@123  |
| LAB_TECH  | tech@labsphere.io      | Tech@123   |

## Key endpoints

| Area      | Route base            |
|-----------|-----------------------|
| Auth      | `/api/auth`           |
| Users     | `/api/users`          |
| Patients  | `/api/patients`       |
| Tests     | `/api/tests`          |
| Orders    | `/api/orders`         |
| Requests  | `/api/requests`       |
| Samples   | `/api/samples`        |
| Devices   | `/api/devices`        |
| Results   | `/api/results`        |
| Payments  | `/api/payments`       |
| Support   | `/api/support-requests` |
| Dashboard | `/api/dashboard`      |

## Result workflow

`pending → entered → reviewed → approved` (or `rejected`). Every value change is written to `result_history`. Approving a result marks its request item `completed`.
