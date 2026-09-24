# TheBlog — Full-Stack Django Blog Platform

A multi-user blogging platform where each registered user can create, edit, delete, and browse their own blog posts. Built as a Django REST Framework backend with a React frontend, as part of the Full-Stack Django Internship Workshop.

## Tech stack

- **Backend:** Django 5 + Django REST Framework, SQLite, SimpleJWT for authentication
- **Frontend:** React (Vite), React Router, Axios, plain CSS (no UI framework)
- **Auth:** JWT (access + refresh tokens), with token blacklisting on logout

## Why DRF + React instead of server-rendered templates

The workshop allows either approach. We chose a decoupled API (DRF) with a separate React SPA because:

- It cleanly separates data/permissions logic (backend) from presentation (frontend), which made it easier to enforce ownership rules on the server independent of the UI.
- It matches how many real internship and junior engineering roles are structured, so it was better practice for that context.
- The frontend was built against a Figma design, and a full SPA gave more control over matching that design exactly than server-rendered templates would have.

The trade-off is more moving parts (two apps, CORS, token refresh logic) compared to a single Django Templates project, which we accepted deliberately.

## Database schema

Three core models, all managed through Django's ORM and versioned with migrations:

**User** — Django's built-in `auth.User`. Passwords are hashed by Django's default hasher; hashing is never disabled.

**Category**
| Field | Type | Notes |
|---|---|---|
| name | CharField | unique |
| slug | SlugField | unique, auto-generated from name if left blank |

**Post**
| Field | Type | Notes |
|---|---|---|
| title | CharField | |
| content | TextField | |
| author | ForeignKey → User | `on_delete=CASCADE`; set server-side from the logged-in user, never from client input |
| category | ForeignKey → Category | nullable; `on_delete=SET_NULL` so deleting a category doesn't delete its posts |
| is_published | BooleanField | default `False` (draft) |
| published_at | DateTimeField | set automatically the first time a post is published; cleared if unpublished |
| created_at / updated_at | DateTimeField | automatic |

**Comments and Tags were scoped out** of this submission to keep the required feature set solid. The schema supports adding both later via a new migration (Tag as a ManyToMany on Post; Comment as a FK to both Post and User) without touching existing tables.

We chose SQLite for development, per the workshop's default recommendation, since the project doesn't need PostgreSQL's concurrency or features at this scale. Because everything goes through the ORM, switching to PostgreSQL later would only require changing the `DATABASES` setting.

## Authentication and permissions

- Signup, login, and logout are handled via JWT (`djangorestframework-simplejwt`). Logout blacklists the refresh token so it can't be reused.
- **Anyone** (including anonymous visitors) can view the list of published posts and open a published post's detail page.
- **Only authenticated users** can create posts.
- **Only a post's author** can update or delete it — enforced by a custom `IsOwnerOrReadOnly` permission class on the server, not just by hiding buttons in the UI. A non-owner attempting to edit or delete via the API directly receives `403 Forbidden`.
- **Drafts are private**: a draft post returns `404` to anyone other than its author (including anonymous users), so its existence isn't leaked.
- Categories are read-only to regular users; only staff accounts can create or edit them.

## API overview

| Method & URL | Access | Notes |
|---|---|---|
| `POST /api/auth/register/` | Anyone | |
| `POST /api/auth/login/` | Anyone | Returns access + refresh tokens |
| `POST /api/auth/token/refresh/` | Anyone | |
| `POST /api/auth/logout/` | Authenticated | Blacklists the refresh token |
| `GET /api/auth/me/` | Authenticated | Current user |
| `GET /api/posts/` | Anyone | Published only; supports `?search=`, `?category=<slug>`, `?ordering=`, `?page=` |
| `POST /api/posts/` | Authenticated | |
| `GET /api/posts/<id>/` | Anyone (drafts: author only) | |
| `PATCH` / `DELETE /api/posts/<id>/` | Owner only | |
| `GET /api/posts/mine/` | Authenticated | Includes the user's own drafts |
| `GET /api/categories/` | Anyone | Writes require staff |

## Frontend

- **Home:** post list with search-by-title, category filter, newest/oldest sort, and pagination (5 per page).
- **Post detail:** full content; Edit/Delete shown only to the post's own author (server still enforces this on save).
- **My Posts:** the logged-in user's posts (including drafts) with quick Edit/Delete and a delete confirmation modal.
- **Create/Edit form:** shared component for both actions; a checkbox toggles published vs. draft.
- **Auth pages:** signup and login with server-side validation errors surfaced in the UI.

Styling is plain CSS with design tokens (`variables.css`) pulled directly from the project's Figma file, rather than a CSS framework, to match the design exactly and keep the code simple to read.

## Running the project locally

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
cp .env.example .env         # then fill in a real SECRET_KEY
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend runs at `http://127.0.0.1:8000`. Visit `/admin/` to add categories and posts, or use the API/frontend directly.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env         # defaults to http://127.0.0.1:8000/api
npm run dev
```

Frontend runs at `http://localhost:5173`.

Both servers must be running at the same time, in separate terminals, for the app to work.

### Generating a SECRET_KEY

```bash
python -c "from django.core.management.utils import get_random_secret_key as g; print(g())"
```

## Environment variables

**backend/.env**
```
SECRET_KEY=
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

**frontend/.env**
```
VITE_API_URL=http://127.0.0.1:8000/api
```

Neither `.env` file is committed; `.env.example` files with placeholder values are provided instead.

## Assumptions made

- One category per post (ForeignKey) rather than multiple categories, since the spec only required "at least one grouping/classification model."
- A published post's date shown in the UI is `published_at`, not `created_at`, so that editing a draft's content before publishing doesn't misrepresent when it went live.
- Registration requires a password confirmation field on the backend; the frontend currently submits the same value twice rather than showing a second field (noted as a known gap below).

## Known gaps / not implemented

- Comments and Tags (bonus features) — scoped out to focus on the required feature set.
- No image upload for posts.
- No automated test suite yet.
- Not deployed; runs locally only.

## Tech notes for reviewers

- All database access goes through Django's ORM; no raw SQL anywhere.
- Passwords are hashed via Django's default password hasher and validated against Django's built-in password validators at registration.
- CORS is restricted to the frontend's origin via `django-cors-headers`.
