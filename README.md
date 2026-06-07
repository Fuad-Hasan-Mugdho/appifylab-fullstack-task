# Appifylab Full Stack Developer Task

This project converts the provided Login, Register, and Feed HTML/CSS pages into a full stack Next.js application while keeping the supplied visual design assets.

## Tech Stack

- Next.js App Router for React frontend and backend API routes
- Prisma ORM with PostgreSQL
- JWT authentication stored in httpOnly cookies
- Local image uploads saved under `public/uploads`

## Implemented Features

- User registration with first name, last name, email, and password
- Secure password hashing with `bcryptjs`
- Login/logout with protected feed access
- Create text posts with optional image upload
- Public posts visible to everyone
- Private posts visible only to the author
- Feed ordered by newest posts first
- Like/unlike posts, comments, and replies
- Display names of users who liked each post, comment, or reply
- Add comments and nested replies

## Local Setup

```bash
npm install
cp .env.example .env
docker compose up db -d
npx prisma db push
npm run dev
```

Open `http://localhost:3000`.

## Docker Setup

Build and run the full application with Docker Compose:

```bash
docker compose up --build
```

Open `http://localhost:3000`.

The container automatically waits for PostgreSQL, runs `prisma db push`, and then starts the Next.js server. PostgreSQL data is persisted in the `appifylab_postgres_data` Docker volume and uploaded images are persisted in the `appifylab_uploads` volume.

For production, set a strong JWT secret before running:

```bash
JWT_SECRET="replace-with-a-long-random-secret" docker compose up --build -d
```

## Render Deployment

This repository includes `render.yaml` for one-click Render deployment with:

- Docker web service
- Managed PostgreSQL database
- Generated `JWT_SECRET`
- `DATABASE_URL` injected from the Render database

Deploy steps:

1. Push this repository to GitHub.
2. Go to Render and choose **New > Blueprint**.
3. Connect this GitHub repository.
4. Apply the `render.yaml` blueprint.
5. Wait for the deploy to finish and open the generated live URL.

## Demo Flow

1. Register two users in separate browser sessions.
2. Create a public post with text and an image.
3. Create a private post and verify only the author can see it.
4. Like/unlike posts and show the liked-by names.
5. Add comments, replies, and like/unlike them.
6. Log out and verify `/feed` redirects to `/login`.

## Database Notes

The schema is designed with indexed read paths for feed visibility, author timelines, nested comments, and like lookups. Likes use a compound unique key across target type, target id, and user id to prevent duplicate likes.
