import React from "react";
import Navbar from "./components/Navbar.jsx";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Shop } from "./pages/shop/shop";
import { ShopContextProvider } from "./context/show-context.jsx";
import { Cart } from "./pages/cart/cart.jsx";
import Payment from "./components/Payment.jsx";
import { Dashboard } from "./pages/dashboard/dashboard.jsx";
import Budget from "./pages/Budget/budget.jsx";
import PowerCardPage from "./pages/PowerCardPage";
import Profile from "./pages/Profile";
import MyOrders from "./pages/MyOrders";
import SplitBill from "./pages/Split/SplitBill.jsx";
// import VoiceAssistant from "./components/VoiceAssistant";
import AmazonFresh from "./pages/AmazonFresh";

function App() {
  return (
    <ShopContextProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Shop />} />
        <Route path="/split" element={<SplitBill />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/pay" element={<Payment />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {<Route path="/budget" element={<Budget />} /> }
        <Route path="/powercard" element={<PowerCardPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/fresh" element={<AmazonFresh />} />
      </Routes>
      {/* <VoiceAssistant /> */}
    </ShopContextProvider>
  );
}

export default App;
