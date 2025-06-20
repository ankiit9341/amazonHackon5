import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../../context/UserContext";

export default function SplitRequests() {
  const { currentUser, users } = useContext(UserContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    if (!currentUser?.userId) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/split/requests/${currentUser.userId}`
      );
      const unpaid = res.data.filter((req) => req.status === "pending");
      setRequests(unpaid);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await axios.post(`http://localhost:5000/api/split/pay`, {
        request_id: requestId,
      });
      alert("✅ Payment successful!");
      fetchRequests();
    } catch (err) {
      console.error("Payment failed", err);
      alert("Payment failed: " + (err?.response?.data?.error || "Unknown error"));
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentUser]);

  const getUserName = (userId) => {
    const u = users.find((u) => u.userId === userId);
    return u ? u.name : userId;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Pending Split Requests</h2>

      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : requests.length === 0 ? (
        <p className="text-center text-gray-500">🎉 No pending requests</p>
      ) : (
        <ul className="space-y-5">
          {requests.map((req) => {
            const isDebtor = req.receiver_id === currentUser.userId;
            const isCreditor = req.payer_id === currentUser.userId;
            const payerName = getUserName(req.payer_id);
            const receiverName = getUserName(req.receiver_id);

            return (
              <li
                key={req._id}
                className="p-4 rounded-xl border shadow-sm bg-gray-50 hover:bg-gray-100 transition-all"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 overflow-hidden">
                    {isDebtor ? (
                      <>
                        <p className="text-gray-700 font-medium truncate">
                          <span className="text-blue-700">{payerName}</span> requested{" "}
                          <span className="font-bold text-green-700">₹{req.amount}</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1 truncate" title={req.message}>
                          {req.message}
                        </p>
                      </>
                    ) : isCreditor ? (
                      <>
                        <p className="text-gray-700 font-medium truncate">
                          Waiting for <span className="text-red-700">{receiverName}</span> to pay{" "}
                          <span className="font-bold text-green-700">₹{req.amount}</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1 truncate" title={req.message}>
                          {req.message}
                        </p>
                      </>
                    ) : null}
                  </div>

                  {isDebtor && (
                    <button
                      onClick={() => handleAccept(req._id)}
                      className="shrink-0 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition"
                    >
                      Pay
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
