# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Voice-app ("sonar") is a social voice recording application where users can post voice recordings (rants/bants) and view a feed of posts. Users authenticate anonymously with just a username.

## Development Commands

```bash
# Start development server with hot reload
npm run dev

# Start production server
npm start
```

## Architecture

**Stack**: Express.js (ES modules), MongoDB/Mongoose, JWT authentication, Cloudinary for storage

**Structure**: MVC pattern
- `models/` - Mongoose schemas (User, VoicePost)
- `controllers/` - Request handlers (auth.js, voice.js)
- `routes/` - Route definitions (auth.routes.js, voice.routes.js)
- `middleware/` - auth, upload (multer), validation (yup)
- `services/` - External service integrations (cloudinary.js)
- `config/` - Database connection

**Main Entry**: `app.js` - Express app setup, registers routes under `/auth` and `/voice` prefixes

## Authentication

Anonymous JWT-based authentication - users only need a username (no password/email). The system:
1. User submits username to `POST /auth/anonymous`
2. Creates new user or returns existing user with matching username
3. Issues JWT token (24h expiry) signed with `process.env.JWT_SECRET`
4. Protected routes require `Authorization: Bearer <token>` header
5. Auth middleware (`middleware/auth.js`) decodes JWT and sets `req.user` with id and username

## Voice Upload Flow

Audio uploads use a background processing pattern:
1. Request received with audio file via multer (`middleware/upload.js`)
2. Immediate 202 response sent to client
3. Background process uploads to Cloudinary and creates VoicePost in DB
4. On error, sends email notification (via `sendUploadErrorMail.js`)

Files temporarily stored in `uploads/` directory before Cloudinary upload.

## Database Models

**User**: `{ username: String (unique), createdAt: Date }`

**VoicePost**: `{ userId: ObjectId (ref User), audioUrl: String, duration: Number, reactions: { fire, heart, clap }, plays: Number, reports: Number, createdAt: Date }`

## Environment Variables

Required in `.env`:
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for signing JWT tokens
- `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - Cloudinary credentials
- `PORT` - Server port (defaults to 5001)

## Validation

Uses yup schemas defined in `schema.js`. Applied via `validate()` middleware which validates `req.body` and returns 400 with errors on validation failure.
