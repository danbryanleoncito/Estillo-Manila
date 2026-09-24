import { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { CartProvider } from "./context/CartContext";
import NavigationBar from "./components/AppNavbar";
import RequireAuth, { RequireAdmin } from "./components/RequireAuth";
import Error from "./pages/Error";
import Footer from "./components/Footer";
import { api, SESSION_EXPIRED_EVENT } from "./utils/api";
import { notyf } from "./utils/notify";

// PAGES
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import ProductsView from "./pages/ProductsView";
import AdminDashBoard from "./pages/AdminDashBoard";
import ProductSearch from "./pages/ProductSearch";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Checkout from "./pages/Order";
import AdminOrder from "./pages/AdminOrder";

function App() {
  const [user, setUser] = useState({
    id: null,
    isAdmin: null,
  });
  // False until we know whether a saved token is still valid. Route guards wait for this so a
  // page refresh does not bounce a logged-in user (or admin) away before the login is restored.
  const [authReady, setAuthReady] = useState(false);

  function unsetUser() {
    localStorage.clear();
  }

  // Set when the saved login could not be CHECKED (server asleep, offline), as opposed to being
  // rejected. The token is kept, and the guards offer a Retry instead of sending the user to /login.
  const [authError, setAuthError] = useState(null);

  // Rehydrate the logged-in state from a token already in localStorage (e.g. after a
  // page refresh) — without this, `user` always starts as {id: null, isAdmin: null}
  // and every refresh looks logged out even though the token is still valid.
  const restoreSession = useCallback(() => {
    setAuthError(null);
    if (!localStorage.getItem("token")) {
      setAuthReady(true);
      return;
    }

    api("/users/details")
      .then((data) => {
        if (data && data._id) {
          setUser({ id: data._id, isAdmin: data.isAdmin });
        } else {
          localStorage.clear();
        }
      })
      .catch((err) => {
        if (err.status === 401 || err.status === 403) {
          // The server says the login is no longer valid.
          localStorage.clear();
        } else {
          // Could not be checked. Do not log the user out for that, and do not pretend they
          // were never logged in either.
          setAuthError(err.message);
        }
      })
      .finally(() => setAuthReady(true));
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  function retryAuth() {
    setAuthReady(false);
    restoreSession();
  }

  // api() fires this when the server rejects the saved login mid-session (expired, forged, or the
  // account is gone). Sign out once, with one clear message, instead of a "Failed" toast per request.
  useEffect(() => {
    const onExpired = () => {
      if (!localStorage.getItem("token")) return; // already handled by an earlier request
      localStorage.clear();
      setUser({ id: null, isAdmin: null });
      notyf.open({ type: "warning", message: "Your session has expired. Please log in again." });
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  return (
    <>
      <UserProvider value={{ user, setUser, unsetUser, authReady, authError, retryAuth }}>
        <CartProvider>
          <Router>
            <NavigationBar />
            <Routes>
              {/* ROUTE HERE */}
              <Route path="/" element={<Home />} />
              <Route path="*" element={<Error />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="/product/:productId" element={<ProductsView />} />
              <Route path="/product" element={<ProductSearch />} />
              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <AdminDashBoard />
                  </RequireAdmin>
                }
              />
              <Route
                path="/cart"
                element={
                  <RequireAuth>
                    <Cart />
                  </RequireAuth>
                }
              />
              <Route
                path="/profile"
                element={
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                }
              />
              <Route
                path="/checkout"
                element={
                  <RequireAuth>
                    <Checkout />
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <RequireAdmin>
                    <AdminOrder />
                  </RequireAdmin>
                }
              />
            </Routes>
            <Footer />
          </Router>
        </CartProvider>
      </UserProvider>
    </>
  );
}
// TEST
export default App;
