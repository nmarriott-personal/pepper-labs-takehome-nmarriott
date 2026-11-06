# Submission

**Candidate name:** Nick Marriott
**Date:** November 6, 2026
**Time spent:** ~3 hours

---

## Completed Tasks

Check off what you finished:

- [x] Task 1 — Create Product
- [x] Task 2 — Update Variant
- [x] Task 3 — Fix soft-delete bug
- [x] Task 4 — Loading & error states
- [x] Task 5 — Input validation
- [x] Bonus A — Double-submit on Delete
- [x] Bonus B — Inconsistent error responses

---

## Approach & Decisions

**Workflow:** I approached this using an AI-assisted workflow. Before making any code changes, I stood up the baseline environment, inspected the SQLite schema and seed data, ran the test suite to see the initial failure modes, and clicked through the live app to reproduce each bug and missing feature firsthand. From there, I worked through the tasks one at a time—aligning on the design for each step, using AI to speed up implementation, reviewing and trimming the diffs to keep the code concise and consistent with the existing repo patterns, and verifying each task both via `npm test` / production builds and manually in the browser (including DevTools network throttling/offline checks) before committing.

### Task 1
Implemented `POST /api/products` using a SQLite transaction so the product and its variants are saved together (if a variant fails to insert, the product isn't left behind without variants). On the frontend, I built the form at `/products/new` with the ability to add/remove variant rows, and had the price field accept dollars and convert to cents (`Math.round(price * 100)`) on submit so it matches how prices are displayed in the rest of the app.

### Task 2
Implemented `PUT /api/variants/:id` following the same update pattern used in the existing `PUT /api/products/:id` route. On the product detail page, clicking Edit switches the price and inventory cells into input fields right in the table row with Save/Cancel buttons, which felt simpler and faster to use than opening a separate modal.

### Task 3
`GET /api/products` wasn't checking `deleted_at`, so soft-deleted items were still coming back in the query. I added `p.deleted_at IS NULL` as a default condition on the product list query (and on `GET /api/products/:id` so going directly to a deleted product's URL returns a 404).

### Task 4
Added `loading` and `error` states to `ProductsPage`. I reused the loading spinner style from `CategoriesPage` so the pages look consistent, and added a check on `r.ok` so failed requests show an error message instead of an empty product list.

### Task 5
Added checks on both the frontend forms and backend routes (`POST /api/products`, `PUT /api/products/:id`, and `PUT /api/variants/:id`) to make sure product name and variant SKU are required, SKUs are unique (both against the database and across rows in the same form), and price and inventory count are 0 or greater.

### Bonus A & B
- **Bonus A:** Added a `deleting` state on `ProductDetailPage` to disable the Delete button while the delete request is still running.
- **Bonus B:** Updated the remaining `.send()` error responses in `products.ts` to return `{ error }` JSON to match the rest of the API, and added a basic error-handling middleware in `app.ts`.

---

## What I'd improve with more time

- **Add a small delay on the search input:** Right now `ProductsPage` fetches from the backend on every keystroke. Adding a short debounce delay before firing the request would cut down on unnecessary API calls.
- **Hook up the remaining backend endpoints in the UI:** The backend already has working routes for `PUT /api/products/:id` and `DELETE /api/variants/:id`, so adding buttons on the product detail page to edit product info and add/delete variants would complete the full workflow.

---

## Anything else?

- **Test database cleanup:** Running `npm test` seeds and writes test products directly into `backend/dev.db`, which leaves test records in the local dev database afterward. Pointing the test suite at a separate test database file via `DATABASE_PATH` would keep `dev.db` clean while testing.
