import Navbar from "./components/Navbar.jsx";
import "./App.css";
import { Routes, Route } from "react-router-dom"; // ✅ Only import Routes/Route
import { Shop } from "./pages/shop/shop";
import { ShopContextProvider } from "./context/show-context.jsx";
import { Cart } from "./pages/cart/cart.jsx";
import Payment from "./components/Payment.jsx";
import { Dashboard } from "./pages/dashboard/dashboard.jsx";
import Budget from "./pages/Budget/budget.jsx";
import PowerCardPage from './pages/PowerCardPage';
import Profile from "./pages/Profile";
import MyOrders from './pages/MyOrders';

function App() {
  return (
    <ShopContextProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/pay" element={<Payment />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/powercard" element={<PowerCardPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-orders" element={<MyOrders />} />
      </Routes>
    </ShopContextProvider>
  );
}

export default App;
