import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { PRODUCTS } from "../../products";
import { ShopContext } from "../../context/show-context";
import axios from "axios";

export const Cart = () => {
  const { cartItems, addToCart, removeFromCart } = useContext(ShopContext);
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();

  // Calculate total price
  useEffect(() => {
    const newTotal = Object.entries(cartItems).reduce((total, [productId, quantity]) => {
      const product = PRODUCTS.find(p => p.id === parseInt(productId));
      return total + (product ? product.price * quantity : 0);
    }, 0);
    setTotalPrice(newTotal);
  }, [cartItems]);

  const isCartEmpty = Object.values(cartItems).every(qty => qty === 0);

  const handleCheckout = () => {
    if (totalPrice === 0) {
      alert("🛒 Your cart is empty. Please add items to continue.");
      return;
    }
    axios.post("https://amazonhackon5.onrender.com/api/data", { totalPrice })
      .then(() => {
        navigate('/pay', { state: { totalPrice } });
      })
      .catch((err) => console.error("Checkout error:", err));
  };

  const handleMinus = (productId) => removeFromCart(productId);
  const handlePlus = (productId) => addToCart(productId);

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-50 min-h-screen">
      {/* Cart Header */}
      <div className="mb-6 border-b pb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Shopping Cart</h1>
        {!isCartEmpty && (
          <div className="mt-2 text-sm text-gray-600">
            Price
          </div>
        )}
      </div>

      {isCartEmpty ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-5xl mb-4">🛒</div>
          <h2 className="text-xl md:text-2xl font-medium text-gray-900 mb-2">Your Amazon Cart is empty</h2>
          <p className="text-gray-600 mb-6">Your shopping cart is waiting. Give it purpose – fill it with groceries, gifts, gadgets and more.</p>
          <button 
            onClick={() => navigate('/shop')} 
            className="bg-[#FF9900] hover:bg-[#FF8C00] text-white font-medium py-2 px-6 rounded-md shadow-sm transition-colors"
          >
            Shop today's deals
          </button>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Cart Items Section */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {PRODUCTS.map((product) => {
                if (cartItems[product.id] > 0) {
                  return (
                    <div key={product.id} className="p-4 border-b last:border-b-0 flex flex-col sm:flex-row">
                      {/* Product Image */}
                      <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
                        <img 
                          src={product.imgSrc} 
                          alt={product.name} 
                          className="w-32 h-32 object-contain"
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-grow">
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <div className="mb-2 sm:mb-0">
                            <h3 className="text-lg font-medium text-gray-900 hover:text-[#C7511F] transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600">In Stock</p>
                            <p className="text-sm text-green-700 font-medium mt-1">FREE delivery</p>
                          </div>
                          
                          <div className="text-lg font-bold text-gray-900">
                            ${(product.price * cartItems[product.id]).toFixed(2)}
                          </div>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="mt-4 flex items-center">
                          <div className="flex items-center border rounded-md">
                            <button 
                              onClick={() => handleMinus(product.id)} 
                              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-l-md transition-colors"
                            >
                              -
                            </button>
                            <div className="w-12 h-8 flex items-center justify-center border-x bg-white">
                              {cartItems[product.id] ?? 0}
                            </div>
                            <button 
                              onClick={() => handlePlus(product.id)} 
                              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-r-md transition-colors"
                            >
                              +
                            </button>
                          </div>
                          
                          <div className="ml-4">
                            <button 
                              onClick={() => removeFromCart(product.id)}
                              className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
              <div className="mb-4 pb-3 border-b">
                <h2 className="text-xl font-medium text-gray-900">Order Summary</h2>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items ({Object.values(cartItems).filter(qty => qty > 0).length}):</span>
                  <span className="text-gray-900">${totalPrice.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="text-green-700">FREE</span>
                </div>
                
                <div className="flex justify-between text-lg font-bold pt-3 border-t">
                  <span>Order Total:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              <button 
                onClick={handleCheckout} 
                className="w-full bg-[#FF9900] hover:bg-[#FF8C00] text-white font-medium py-2 rounded-md shadow-sm transition-colors"
              >
                Proceed to Checkout
              </button>
              
              <div className="mt-4 text-xs text-gray-500">
                By placing your order, you agree to Amazon's <a href="#" className="text-[#007185] hover:underline">Conditions of Use</a> and <a href="#" className="text-[#007185] hover:underline">Privacy Notice</a>.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};