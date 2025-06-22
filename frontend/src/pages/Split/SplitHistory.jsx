import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';

export default function SplitHistory() {
  const { currentUser, users } = useContext(UserContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.userId) return;
    setLoading(true);
    axios
      .get(`https://amazonhackon5.onrender.com/api/split/history/${currentUser.userId}`)
      .then((res) => setHistory(res.data))
      .catch((err) => console.error('Failed to fetch split history', err))
      .finally(() => setLoading(false));
  }, [currentUser]);

  const getUserName = (userId) => {
    const u = users.find((u) => u.userId === userId);
    return u ? u.name : userId;
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow">
        <h2 className="text-2xl font-semibold mb-4">Split History</h2>
        <p className="text-center text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!history.length) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow">
        <h2 className="text-2xl font-semibold mb-4">Split History</h2>
        <p className="text-center text-gray-500">No history available 🎉</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800">Split History</h2>
      {history.map((item) => {
        const payerName = getUserName(item.payer_id);
        const dateStr = new Date(item.created_at).toLocaleDateString();
        return (
          <div
            key={item._id}
            className="bg-white rounded-2xl shadow-md overflow-hidden"
          >
            <div className="p-4 border-b bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-lg font-semibold text-gray-800 truncate"
                    title={item.title}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-sm text-gray-600 mt-1 truncate"
                    title={item.description}
                  >
                    {item.description}
                  </p>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm text-gray-500">{dateStr}</p>
                  <p className="text-xl font-bold text-green-600">₹{item.amount}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-2">
                Paid by{' '}
                <span
                  className={`font-medium ${
                    item.payer_id === currentUser.userId
                      ? 'text-blue-600'
                      : 'text-gray-800'
                  }`}
                >
                  {payerName} {item.payer_id === currentUser.userId && '(You)'}
                </span>
              </p>
            </div>

            <ul className="p-4 space-y-3">
              {item.members.map((m) => {
                const name = getUserName(m.user_id);
                const isYou = m.user_id === currentUser.userId;
                return (
                  <li
                    key={m.user_id}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          m.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {m.status.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p
                          className="text-gray-800 truncate"
                          title={name}
                        >
                          {name} {isYou && '(You)'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          ₹{m.share_amount}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
