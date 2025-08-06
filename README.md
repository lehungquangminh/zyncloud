# ZynCloud Authentication Server

A Node.js authentication server that supports Google (via Firebase) and Discord OAuth2 login methods.

## Features

- Google authentication via Firebase
- Discord OAuth2 authentication
- SQLite database with Prisma ORM
- JWT-based authentication
- TypeScript support
- Environment variables configuration

## Prerequisites

- Node.js >= 14
- npm or yarn
- A Firebase project (for Google authentication)
- A Discord application (for Discord authentication)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in the required values:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables:
   - `JWT_SECRET`: A secure random string for JWT signing
   - `FIREBASE_SERVICE_ACCOUNT`: Your Firebase service account JSON
   - `DISCORD_CLIENT_ID`: Your Discord application client ID
   - `DISCORD_CLIENT_SECRET`: Your Discord application client secret
   - `DISCORD_REDIRECT_URI`: Your Discord OAuth2 redirect URI
   - `FRONTEND_URL`: Your frontend application URL

5. Initialize the database:
   ```bash
   npm run prisma:migrate
   ```

## Development

Start the development server:
```bash
npm run dev
```

## Production

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Google Authentication

```
POST /auth/google
Content-Type: application/json
{
  "idToken": "firebase-id-token"
}
```

### Discord Authentication

```
GET /auth/discord
```
Redirects to Discord OAuth2 authorization page

```
GET /auth/callback?code=discord-auth-code
```
Handles Discord OAuth2 callback

### User Information

```
GET /users/me
Authorization: Bearer <jwt-token>
```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `JWT_SECRET`: Secret for JWT signing
- `DATABASE_URL`: SQLite database URL
- `FIREBASE_SERVICE_ACCOUNT`: Firebase service account credentials
- `DISCORD_CLIENT_ID`: Discord OAuth2 client ID
- `DISCORD_CLIENT_SECRET`: Discord OAuth2 client secret
- `DISCORD_REDIRECT_URI`: Discord OAuth2 redirect URI
- `FRONTEND_URL`: Frontend application URL
