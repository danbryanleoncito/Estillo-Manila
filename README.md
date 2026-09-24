# Capstone 3 Demo App Overview:
## Application Name: Estilo Manila – Web-based E-commerce application

- Live site: https://estillo-manila.vercel.app
- Backend API: https://estilo-manila-backend-v2.onrender.com (see the `estilo-manila-backend-v2` repo)

## Team Members:
- Marc Aldous Conde
- Dan Leoncito

## User Credentials:
- Admin User
  - Email: admin@gmail.com
  - Password: Admin123!
- Dummy Customer:
  - Email: customer@gmail.com
  - Password: Customer123!

## Tech Stack
- React 18 (Create React App), react-router-dom v6, react-bootstrap, Notyf toasts
- Stripe.js / `@stripe/react-stripe-js` for card payments (test mode)

## Getting Started

```bash
npm install
npm start        # dev server on http://localhost:3000
npm test         # smoke test (App renders)
npm run build    # production build
```

Create `frontend/.env` (it is gitignored):

| Variable | Purpose |
| --- | --- |
| `REACT_APP_API_BASE_URL` | Backend base URL **including the `/b4` prefix**, e.g. `http://localhost:3004/b4` |
| `REACT_APP_STRIPE_PUBLISHABLE_KEY` | Stripe **test-mode** publishable key (`pk_test_...`). Safe to expose in the browser; never put a secret key here |

Create React App bakes `REACT_APP_*` values in at **build time**. After changing one (locally or in Vercel's environment settings) you must restart `npm start` or redeploy for it to take effect.

## Checkout & Payments

- The cart's **Checkout** button goes to `/checkout`, the single place orders are placed (it refuses an empty cart).
- Pick **Cash on Delivery** (order saved as `COD`) or **Card**.
- Card payments use Stripe's card field and confirm inline. If the bank requires 3D Secure it appears as a popup on the page, with no redirect.
- The submit button is disabled with a spinner while a payment is processing, so it cannot be double-submitted. A declined card shows an error toast and leaves you on the page to retry.
- Order tables on the Profile page and the admin Orders page show a colored **Payment** badge: green Paid, grey COD, red Failed, amber Unpaid.
- The shipping and contact fields on the checkout page are currently display only; the backend does not store an address yet.
- Test cards: `4242 4242 4242 4242` (success), `4000 0027 6000 3184` (3D Secure), `4000 0000 0000 0002` (declined). Use any future expiry and any CVC. No real money is charged.

## Patch Notes

Full history is in [CHANGELOG.md](CHANGELOG.md). Summary:

### v0.7.1 (2026-09-24)
_Integrated by Dan Leoncito._
- **Fixed:** The checkout form no longer rejects a valid mobile number written like "+63 917 123 4567".

### v0.7.0 (2026-09-24)
_Integrated by Dan Leoncito._
- **Added:** A real delivery address form at checkout (validated, saved with the order), and a "Deliver to" column on the customer's orders and the admin orders page.
- **Removed:** Checkout controls that did nothing (contact email, news opt-in, "save this information").

### v0.6.0 (2026-09-24)
_Integrated by Dan Leoncito._
- **Added:** A Retry state everywhere something loads (cart, checkout, products, search, profile, admin); an admin "needs attention" panel; "Refund processing" on lines whose refund is still going through; a clear sign-out when the server rejects the saved login.
- **Fixed:** Wrong-password login said the email did not exist; the login token and registration passwords were written to the console; failed loads showed as "empty cart" / "Product not found" / "No products found"; a refresh while the server was unreachable logged the user out; registration errors were ignored.

### v0.5.0 (2026-09-24)
_Integrated by Dan Leoncito._
- **Added:** Readable orders (names, quantities, prices, per-line status, refunds) for customers and admins, and shortfall disputes: a banner and Resolve dialog where a customer cancels an item or keeps fewer, with a live refund preview.
- **Fixed:** Order tables no longer show raw ids or break on empty or unexpected responses.

### v0.4.0 (2026-09-24)
_Integrated by Dan Leoncito._
- **Added:** Stock across the storefront: Sold out and Only N left badges, a quantity limit on the product page, stock-aware cart lines with one-click fixes, a clear list of unavailable items at checkout, a safe "Finish my order" retry after a successful charge, and a Stock column and field for admins.
- **Fixed:** Editing a product in the admin dashboard no longer overwrites its live stock; the availability switch and admin toasts now reflect what the server actually did.

### v0.3.0 (2026-09-24)
_Integrated by Dan Leoncito._
- **Added:** A shared API helper that keeps the server's error details (such as stock conflicts), a shared cart that keeps the navbar badge and cart page in sync, route guards for the cart, checkout, profile and admin pages, and tests for them.
- **Fixed:** The cart, search and admin-orders pages no longer refetch endlessly; the navbar cart badge works; server errors (like "Only 3 available") are shown instead of a success message; the quantity control stops at the available stock; refreshing `/admin` keeps you on the page; search waits until you stop typing.

### v0.2.1 (2026-09-22)
_Integrated by Dan Leoncito._
- **Fixed:** Refreshing the page logged you out. The login state is now restored from the saved token when the app loads.
- **Fixed:** The footer "Customer Care" links (Home, Products, Login, Register, Email Us) were plain text and did nothing. They now navigate, and Email Us opens a `mailto:` link (placeholder address).

### v0.2.0 (2026-09-22)
_Integrated by Dan Leoncito._
- **Added:** Stripe test-mode card checkout alongside Cash on Delivery on a single `/checkout` page, plus Payment badges on the order tables.
- **Fixed:** The cart's Checkout button used to place an order in place and skip the checkout page; it now goes to `/checkout`.
- **Fixed:** The checkout page's submit buttons did nothing (or reloaded the page), and the Cash on Delivery radio never showed as selected.
- **Fixed:** Replaced the leftover Create React App boilerplate test with a real App smoke test.

## Features:
## Features by Marc Aldous Conde
- Front-End Development
  - Home Page
  - Products Page
  - Product View Page
- Back-End Development
  - Get Featured Products
  - Get All Active Products
  - Add Products
  - Update Products
  - Set Product Availability
  - Delete Products
## Features by Dan Leoncito
- Front-End Development
  - Admin Page
  - Register Page
  - Login Page
  - Cart Page
  - Checkout Page (card via Stripe, or Cash on Delivery)
