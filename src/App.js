import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import NavigationBar from "./components/AppNavbar";
import Error from "./pages/Error";
import Footer from "./components/Footer";

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

  function unsetUser() {
    localStorage.clear();
  }
  return (
    <>
      <UserProvider value={{ user, setUser, unsetUser }}>
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
            <Route path="/admin" element={<AdminDashBoard />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin/orders" element={<AdminOrder />} />
          </Routes>
          <Footer />
        </Router>
      </UserProvider>
    </>
  );
}
// TEST
export default App;
