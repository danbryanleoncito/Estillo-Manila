import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { CartProvider } from "./context/CartContext";
import NavigationBar from "./components/AppNavbar";
import RequireAuth, { RequireAdmin } from "./components/RequireAuth";
import Error from "./pages/Error";
import Footer from "./components/Footer";
import { api } from "./utils/api";

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

  // Rehydrate the logged-in state from a token already in localStorage (e.g. after a
  // page refresh) — without this, `user` always starts as {id: null, isAdmin: null}
  // and every refresh looks logged out even though the token is still valid.
  useEffect(() => {
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
        // Only drop the token when the server says it is invalid. A network blip should not
        // log the user out.
        if (err.status === 401 || err.status === 403) localStorage.clear();
      })
      .finally(() => setAuthReady(true));
  }, []);

  return (
    <>
      <UserProvider value={{ user, setUser, unsetUser, authReady }}>
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
