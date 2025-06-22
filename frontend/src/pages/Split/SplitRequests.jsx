import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../../context/UserContext";

// Axios instance
const API = axios.create({
  baseURL: "https://amazonhackon5.onrender.com
/api/split",
});

export default function SplitRequests() {
  const { currentUser, users } = useContext(UserContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const fetchRequests = async (userId) => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await API.get(`/requests/${userId}`);
      setRequests(res.data.filter((r) => r.status === "pending"));
    } catch (err) {
      console.error("Failed to fetch requests", err);
      setError("Could not load split requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await API.post("/pay", { request_id: requestId });
      await fetchRequests(currentUser.userId);
      alert("✅ Payment successful!");
    } catch (err) {
      console.error("Payment failed", err);
      alert(
        "❌ Payment failed: " +
          (err.response?.data?.error || "Unknown error")
      );
    }
  };

  useEffect(() => {
    fetchRequests(currentUser?.userId);
  }, [currentUser?.userId]);

  const getUserName = (userId) => {
    const u = users.find((u) => u.userId === userId);
    return u ? u.name : userId;
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Pending Split Requests
      </h2>

      {loading && <p className="text-center text-gray-600">Loading...</p>}
      {error && <p className="text-center text-red-600 mb-4">{error}</p>}
      {!loading && !error && requests.length === 0 && (
        <p className="text-center text-gray-500">🎉 No pending requests</p>
      )}

      {!loading && !error && requests.length > 0 && (
        <ul className="space-y-5">
          {requests.map((req) => {
            const isDebtor   = req.receiver_id === currentUser.userId;
            const isCreditor = req.payer_id === currentUser.userId;
            const payerName  = getUserName(req.payer_id);
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
                          <span className="text-blue-700">{payerName}</span>{" "}
                          requested{" "}
                          <span className="font-bold text-green-700">
                            ₹{req.amount}
                          </span>
                        </p>
                        <p
                          className="text-sm text-gray-500 mt-1 truncate"
                          title={req.message}
                        >
                          {req.message}
                        </p>
                        {/* Fraud warnings */}
                        {req.fraud_flags?.duplicate && (
                          <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded">
                            ⚠️ Duplicate expense detected.
                          </div>
                        )}
                        {req.fraud_flags?.high_value && (
                          <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded">
                            ⚠️ High-value expense flagged.
                          </div>
                        )}
                      </>
                    ) : isCreditor ? (
                      <>
                        <p className="text-gray-700 font-medium truncate">
                          Waiting for{" "}
                          <span className="text-red-700">{receiverName}</span>{" "}
                          to pay{" "}
                          <span className="font-bold text-green-700">
                            ₹{req.amount}
                          </span>
                        </p>
                        <p
                          className="text-sm text-gray-500 mt-1 truncate"
                          title={req.message}
                        >
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
