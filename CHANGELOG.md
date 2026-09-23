# Changelog

All notable changes to this frontend are documented in this file.

## [0.2.1] - 2026-09-22

### Fixed
- Refreshing the page logged the user out: `App.js` always started `user` as
  `{ id: null, isAdmin: null }` and never checked `localStorage` for an existing token, so the
  app looked logged out even though the JWT was still valid. It now rehydrates `user` from
  `/users/details` on load when a token is present (clearing the token if it is rejected).
- The footer "Customer Care" items (Home, Products, Login, Register, Email Us) were bare `<li>`
  text with no link. They now navigate to their routes; Email Us is a `mailto:` link using a
  placeholder support address, since no real one exists in the project.

## [0.2.0] - 2026-09-22

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
