import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

const MyOrders = () => {
  const { currentUser } = useContext(UserContext);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!currentUser?.userId) return;

    axios.get(`https://amazonhackon5.onrender.com
/api/powercard/my-orders/${currentUser.userId}`)
      .then(res => setOrders(res.data))
      .catch(err => console.error("Failed to load orders", err));
  }, [currentUser]);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">📦 My Orders</h2>

      {orders.length === 0 ? (
        <p className="text-gray-600">You haven't placed any orders yet.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map(order => (
            <li key={order.id} className="p-4 bg-white shadow-md rounded-md">
              <div><strong>Card:</strong> {order.card}</div>
              <div><strong>Price:</strong> ${order.productPrice}</div>
              <div><strong>Discount:</strong> ${order.discount}</div>
              <div><strong>Status:</strong> ✅ Completed</div>
              <div className="text-sm text-gray-500">
                Placed on {new Date(order.created_at * 1000).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyOrders;
