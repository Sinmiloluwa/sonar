# Sonar — Product Requirements Document

**Version**: 1.0
**Date**: 2026-02-26
**Status**: Living document

---

## 1. Product Overview

**Sonar** is a social voice recording platform where users post short audio clips ("rants/bants") and consume a feed of voice content from others. The product is built for low-friction participation — users authenticate with just a username (or Google) and immediately start posting and listening.

**Core value proposition**: Audio-first social expression with minimal sign-up friction.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ES Modules) |
| Framework | Express.js |
| Database | MongoDB / Mongoose |
| Auth | JWT (24h expiry) + Google OAuth |
| File storage | Cloudinary |
| Background jobs | BullMQ + Redis |
| Push notifications | Firebase Cloud Messaging (FCM) |
| Email | Nodemailer (error + notification emails) |

---

## 3. Current Feature Set (v1)

### 3.1 Authentication

| Feature | Detail |
|---|---|
| Anonymous auth | User submits a username → JWT issued; account created or returned if username exists |
| Google OAuth | Full OAuth flow; links `googleId`, `email`, `displayName`, `profilePicture` to user |
| JWT | 24h expiry, signed with `JWT_SECRET`, carried as `Authorization: Bearer <token>` |
| Email update | Anonymous users can attach an email to their account (Google accounts cannot change email) |

**Endpoints**
- `POST /auth/anonymous`
- `POST /auth/google`

---

### 3.2 Voice Posts

| Feature | Detail |
|---|---|
| Upload | `POST /voice/upload` — multipart audio file via multer; returns 202 immediately |
| Background processing | BullMQ job uploads to Cloudinary, creates `VoicePost` doc, triggers notifications |
| Error handling | Upload failure sends error email to user |
| My uploads | `GET /voice/my-uploads` — authenticated user's own posts, newest first |

**VoicePost fields**: `userId`, `audioUrl`, `duration`, `tags[]`, `category`, `description` (max 500 chars), `reactions.{fire,heart,clap}`, `plays`, `reports`, `createdAt`

---

### 3.3 Feed

Single endpoint `GET /voice/feed` with three modes controlled by query params:

| Mode | Behaviour |
|---|---|
| `for-you` (default) | Up to 30 posts from followed users (newest first) + up to 20 trending posts from last 48h not already included |
| `trending` | Posts from last 48h ranked by `reactions.fire + reactions.heart + reactions.clap + plays`, limit 50 |
| `following` | Posts from followed users only, newest first, limit 50 |

**Filters available on all modes**: `category` (slug), `userId`

---

### 3.4 Reactions

Toggle endpoint: `POST /voice/:postId/react`
Reaction types: `fire`, `heart`, `clap`
A user can toggle each reaction type on/off independently.

---

### 3.5 Follow System

| Endpoint | Action |
|---|---|
| `POST /users/follow/:userId` | Follow a user |
| `DELETE /users/follow/:userId` | Unfollow a user |
| `GET /users/following` | List users the authenticated user follows |

Following a user triggers a `new_follower` notification. New posts from followed users trigger `new_post` notifications to all followers.

---

### 3.6 Search

`GET /search?q=&type=&tag=&category=&userId=&page=`

| Type | Behaviour |
|---|---|
| `users` | Regex match on `username`, returns `username`, `displayName`, `profilePicture` |
| `posts` | Regex match on `description`, `tags`, and category name/description; filterable by `tag`, `category`, `userId`; paginated (20/page) |
| `tags` | Aggregated tag list sorted by post count, top 50 |

---

### 3.7 Categories

System-defined categories with `name`, `slug`, `description`, `imageUrl`. Posts require a category. The feed and search can both be filtered by category slug.

---

### 3.8 Notifications

**In-app notifications**

| Type | Trigger |
|---|---|
| `reaction` | Someone reacts to your post |
| `new_follower` | Someone follows you |
| `upload_complete` | Your audio upload finished processing |
| `new_post` | A user you follow posted |
| `login` | New login to your account |

**Endpoints**
- `GET /notifications` — paginated notification list
- `GET /notifications/unread-count`
- `PATCH /notifications/read-all`
- `PATCH /notifications/:id/read`

**Push notifications (FCM)**
- `POST /notifications/fcm-token` — register device token
- `DELETE /notifications/fcm-token` — remove device token
- Users can have multiple FCM tokens (multi-device)

---

### 3.9 User Profile

- `GET /users/profile` — authenticated user's own profile (excludes `fcmTokens`)
- `PATCH /users/email` — update email (anonymous accounts only)

---

## 4. Planned Features (v2)

The features below are prioritised by impact and dependency order.

---

### 4.1 Delete & Edit Post

**Why**: Users have no way to remove or correct their own posts.

**Scope**
- `DELETE /voice/:postId` — soft-delete or hard-delete own posts only; server validates ownership
- `PATCH /voice/:postId` — update `description`, `tags`, and/or `category` only (audio URL is immutable)

**Data model changes**: Optional `deletedAt` field on `VoicePost` for soft delete; feed queries exclude deleted posts.

---

### 4.2 Public User Profiles

**Why**: Users discovered via search or feed have no profile page to visit.

**Scope**
- `GET /users/:userId` — returns `username`, `displayName`, `profilePicture`, follower count, following count, post count
- `GET /voice/feed?userId=:userId` already exists; this adds the profile metadata endpoint

**Data model changes**: None — counts are derived at query time or cached.

---

### 4.3 Follower List

**Why**: The follow model is one-sided at the API level — users can see who they follow but not who follows them.

**Scope**
- `GET /users/followers` — list of users following the authenticated user
- `GET /users/:userId/followers` — public follower list for any user
- `GET /users/:userId/following` — public following list for any user

---

### 4.4 Comments

**Why**: Core engagement loop — text or voice replies drive deeper interaction per post.

**Scope**
- Comments are text-only (v2); voice reply comments are v3
- `POST /voice/:postId/comments` — add a comment (max 300 chars)
- `GET /voice/:postId/comments` — paginated comment list, newest first
- `DELETE /voice/:postId/comments/:commentId` — delete own comment
- Posting a comment triggers a `comment` notification to the post owner

**New model**: `Comment { postId, userId, text, createdAt }`
**New notification type**: `comment`

---

### 4.5 Bookmarks

**Why**: Users want to save posts to revisit without reacting publicly.

**Scope**
- `POST /voice/:postId/bookmark` — toggle bookmark on/off
- `GET /voice/bookmarks` — paginated list of bookmarked posts, newest bookmark first

**New model**: `Bookmark { userId, postId, createdAt }` with unique index on `(userId, postId)`

---

### 4.6 Reposts

**Why**: Amplification mechanic — lets users surface content they like to their followers.

**Scope**
- `POST /voice/:postId/repost` — toggle repost; adds post to reposter's followers' feeds
- Reposts appear in the following feed attributed as "reposted by @username"
- `GET /voice/reposts` — posts the authenticated user has reposted

**New model**: `Repost { userId, postId, createdAt }` with unique index on `(userId, postId)`
**Feed change**: following-feed query unions `Follow → Repost → VoicePost`
**New notification type**: `repost` to original post owner

---

### 4.7 Post Visibility

**Why**: Users may want to share content only with followers.

**Scope**
- Add `visibility` field to `VoicePost`: `"public"` (default) | `"followers"`
- Feed and profile queries filter out `"followers"` posts for non-followers
- `PATCH /voice/:postId` (from 4.1) allows changing visibility

**Data model changes**: `visibility: { type: String, enum: ['public', 'followers'], default: 'public' }` on `VoicePost`

---

### 4.8 Listen History

**Why**: The `plays` counter exists but there is no per-user history. History enables "already listened" UX and personalised recommendations.

**Scope**
- `POST /voice/:postId/play` — record a play event (debounced: one play per user per post per 24h counts toward the aggregate)
- `GET /voice/history` — paginated list of posts the user has played, most recent first

**New model**: `PlayEvent { userId, postId, createdAt }` with index on `(userId, postId)`

---

### 4.9 Recommended Users

**Why**: Cold-start discovery for new users or users following nobody.

**Scope**
- `GET /users/recommended` — list of up to 10 users to follow
- Algorithm (v1): users with the most followers, excluding already-followed accounts and self
- Algorithm (v2): second-degree follows (people your followees follow)

---

### 4.10 Report Resolution (Admin)

**Why**: `VoicePost.reports` is incremented via reactions but there is no tooling to act on flagged content.

**Scope**
- `GET /admin/reports` — posts sorted by `reports` desc, with threshold filter (e.g. `?min=5`)
- `DELETE /admin/posts/:postId` — admin hard-delete any post
- `PATCH /admin/posts/:postId/clear-reports` — reset report count after review
- Routes protected by an `isAdmin` middleware flag on the User model

**Data model changes**: `isAdmin: { type: Boolean, default: false }` on `User`

---

### 4.11 Cursor-Based Pagination

**Why**: The feed and search use offset pagination which degrades with large datasets (duplicate/missed items as new posts arrive).

**Scope**
- Replace `page`/`skip` with `cursor` (last seen `_id` + `createdAt`) on feed and search endpoints
- Response includes `nextCursor` field; client passes it as `?cursor=` on next request
- Existing `page`-based search remains for backward compatibility during transition

---

## 5. Data Models Summary

| Model | Status |
|---|---|
| `User` | Exists |
| `VoicePost` | Exists |
| `Category` | Exists |
| `Follow` | Exists |
| `Reaction` | Exists |
| `Notification` | Exists |
| `Comment` | Planned (4.4) |
| `Bookmark` | Planned (4.5) |
| `Repost` | Planned (4.6) |
| `PlayEvent` | Planned (4.8) |

---

## 6. API Surface Summary

### Existing endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /auth/anonymous | — | Create/login anonymous user |
| POST | /auth/google | — | Google OAuth login |
| POST | /voice/upload | ✓ | Upload voice post |
| GET | /voice/feed | ✓ | Feed (for-you / trending / following) |
| GET | /voice/my-uploads | ✓ | Own posts |
| POST | /voice/:postId/react | ✓ | Toggle reaction |
| POST | /users/follow/:userId | ✓ | Follow user |
| DELETE | /users/follow/:userId | ✓ | Unfollow user |
| GET | /users/following | ✓ | Users I follow |
| GET | /users/profile | ✓ | My profile |
| PATCH | /users/email | ✓ | Update email |
| GET | /search | ✓ | Search users, posts, tags |
| GET | /notifications | ✓ | Notification list |
| GET | /notifications/unread-count | ✓ | Unread count |
| PATCH | /notifications/read-all | ✓ | Mark all read |
| PATCH | /notifications/:id/read | ✓ | Mark one read |
| POST | /notifications/fcm-token | ✓ | Register push token |
| DELETE | /notifications/fcm-token | ✓ | Remove push token |

### Planned endpoints

| Method | Path | Feature |
|---|---|---|
| DELETE | /voice/:postId | 4.1 |
| PATCH | /voice/:postId | 4.1 |
| GET | /users/:userId | 4.2 |
| GET | /users/followers | 4.3 |
| GET | /users/:userId/followers | 4.3 |
| GET | /users/:userId/following | 4.3 |
| POST | /voice/:postId/comments | 4.4 |
| GET | /voice/:postId/comments | 4.4 |
| DELETE | /voice/:postId/comments/:commentId | 4.4 |
| POST | /voice/:postId/bookmark | 4.5 |
| GET | /voice/bookmarks | 4.5 |
| POST | /voice/:postId/repost | 4.6 |
| GET | /voice/reposts | 4.6 |
| POST | /voice/:postId/play | 4.8 |
| GET | /voice/history | 4.8 |
| GET | /users/recommended | 4.9 |
| GET | /admin/reports | 4.10 |
| DELETE | /admin/posts/:postId | 4.10 |
| PATCH | /admin/posts/:postId/clear-reports | 4.10 |

---

## 7. Notification Types (Full)

| Type | Exists | Trigger |
|---|---|---|
| `reaction` | ✓ | Someone reacts to your post |
| `new_follower` | ✓ | Someone follows you |
| `upload_complete` | ✓ | Your upload finished |
| `new_post` | ✓ | Someone you follow posted |
| `login` | ✓ | New login to account |
| `comment` | Planned | Someone commented on your post |
| `repost` | Planned | Someone reposted your post |
