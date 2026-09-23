# Changelog

All notable changes to this frontend are documented in this file.

## [0.4.0] - 2026-09-24
_Integrated by Dan Leoncito._

### Added
- Stock is now visible everywhere. Product cards (home, products, search) show a **Sold out** badge
  and a dimmed card at 0 stock and **Only N left** at 5 or fewer; sold-out products stay visible and
  openable. Featured products on the home page prefer items that are in stock. One shared
  `ProductCard` replaces the two duplicated card components (which also nested links inside links).
- Product page: shows sold out / low stock / no longer available, limits the quantity to what is
  actually available (live stock, capped at 99, minus what is already in your cart), says how many
  you already have in your cart, and shows "Sold out" / "Max in cart" on a disabled button.
- Cart page: each line shows "Sold out", "Only N available" (with a one-click **Reduce to N**) or a
  low-stock note; Checkout is disabled, with the reason, until the cart can actually be bought; a
  real empty state and a message for items whose product was deleted.
- Checkout: an order summary; when items are no longer available (before paying, or after) it
  lists exactly which ones and how many are left, and refreshes the cart. If a card is charged but
  the order cannot be finished, the page says so and offers **Finish my order**, which only retries
  the order and can never create a second charge. An order that opens a shortfall dispute sends the
  customer to Profile with a notice.
- Admin: a **Stock** column (with Sold out / Low stock badges) and a Stock field when adding a
  product.

### Fixed
- Admin saves sent the whole product, so editing a name overwrote live `stock` with the value from
  when the page loaded (erasing sales made since). It now sends only the fields that were changed.
- Admin edit handlers wrote a junk `"undefined"` field; the availability switch used stale global
  state (always archiving); toasts said "updated" / "added" even when the server refused. All fixed;
  failures now show the server's message (e.g. "Product Already Exists").
- Removed the dashboard's delete button, which had no action.

## [0.3.0] - 2026-09-24
_Integrated by Dan Leoncito._

### Added
- `utils/api.js`: one `api()` helper for every backend call. Failures become an `ApiError` that
  keeps the HTTP status and the response body (so a stock `409 { outOfStock, available }` is no
  longer lost), understands all the backend's error shapes, and lets endpoints where 404 means
  "nothing yet" (cart, orders, search) return an empty value.
- `context/CartContext.js`: the cart is fetched once and refreshed after every change, replacing
  the per-page fetching. The navbar cart badge now shows the number of units in the cart.
- Route guards (`RequireAuth` / `RequireAdmin`) on `/cart`, `/checkout`, `/profile`,
  `/admin` and `/admin/orders`. They wait for the saved login to be restored before deciding.
- `utils/stock.js` (mirrors the backend's min(stock, 99) limit and the "low stock" threshold), a
  shared `Notyf` instance, and tests for the API helper, stock helpers and route guards.

### Fixed
- The cart page, product search page and admin orders page refetched endlessly (an effect with no
  dependency array), and the product page refetched on every render. Each now loads once.
- Every screen created a new `Notyf` on each render, leaking DOM nodes; they now share one.
- The navbar cart badge was permanently 0 (a broken `!typeof` check).
- Adding to the cart showed "Added To Cart Successfully!" even when the server refused (for example
  "Only 3 available"); it now shows the server's message.
- The quantity control had no upper limit, submitted the form from its +/- buttons, never re-synced
  with the server and toasted success on failure. It now stops at the available stock, reverts a
  refused change, and follows the server's quantity.
- The product quantity field blocked every key press, so it could not be typed into.
- Refreshing `/admin` sent the admin back to the home page (the redirect ran before the saved login
  was restored), and `/profile`'s "logged out" check was always true.
- Searching sent a request for every key press (including Shift and arrows) and errored on
  characters like `(`; it now waits 300 ms after typing, ignores stale responses, and treats
  "no results" as empty rather than an error.
- The cart's Remove button had no label (its icon was commented out), and logging out cleared
  storage during render.
- A network hiccup while restoring the login no longer logs the user out; only a rejected token does.

## [0.2.1] - 2026-09-22
_Integrated by Dan Leoncito._

### Fixed
- Refreshing the page logged the user out: `App.js` always started `user` as
  `{ id: null, isAdmin: null }` and never checked `localStorage` for an existing token, so the
  app looked logged out even though the JWT was still valid. It now rehydrates `user` from
  `/users/details` on load when a token is present (clearing the token if it is rejected).
- The footer "Customer Care" items (Home, Products, Login, Register, Email Us) were bare `<li>`
  text with no link. They now navigate to their routes; Email Us is a `mailto:` link using a
  placeholder support address, since no real one exists in the project.

## [0.2.0] - 2026-09-22
_Integrated by Dan Leoncito._

### Added
- Wired the frontend to the backend's Stripe test-mode payment integration:
  - `/checkout` (`pages/Order.js`) is now the one real checkout flow, supporting both Cash on
    Delivery and card payments via `@stripe/stripe-js` / `@stripe/react-stripe-js`.
  - Card payments use Stripe's `CardElement` + `confirmCardPayment`, which handles 3D Secure via
    an inline on-page popup when required — no redirect, no return_url page to build.
  - A `submitting` state disables the submit button and shows a spinner while a payment/checkout
    request is in flight, to prevent double-submits.
  - `ProfileView.js` and `AppOrder.js` now render a color-coded Payment badge (green Paid / grey
    COD / red Failed / amber Unpaid) next to each order's status.
  - `REACT_APP_STRIPE_PUBLISHABLE_KEY` env var (see `.env`).

### Fixed
- `AppCart.js`'s Checkout button placed an order directly, in-place, bypassing the dedicated
  `/checkout` page entirely; it now navigates to `/checkout` (blocked client-side if the cart is
  empty), which becomes the single place orders are placed from.
- `AppCheckoutForm.js` had its own uncontrolled `<form>` with a submit button that did nothing but
  trigger a native full-page reload (no `onSubmit`, no `preventDefault`). Removed the stray button
  and its `<form>` wrapper; it's now a plain fieldset inside the page's one real form.
- `AppPaymentMethod.js`'s "Complete order" button lived outside any `<form>`, so it never did
  anything. Its `paymentMethod` state is now lifted to the parent and submitted through the page's
  single real form; also fixed a missing `checked` prop on the Cash on Delivery radio, which never
  visually reflected selection.
- `AppCart.js` read `const { userId } = useContext(UserContext)`, which was always `undefined`
  since `UserContext`'s actual shape is `{ user: { id, isAdmin }, ... }` — removed along with the
  dead checkout `fetch` call that used it.

### Removed
- Nothing removed in this release.
