import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../context/UserContext';
import axios from 'axios';

export default function SplitCalculator() {
  const { users, currentUser } = useContext(UserContext);

  // Show loading state until currentUser is available
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading user...</p>
      </div>
    );
  }

  // Form state
  const [title, setTitle]               = useState('');
  const [description, setDescription]   = useState('');
  const [totalAmount, setTotalAmount]   = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUsers, setSelectedUsers]   = useState([]);
  const [customAmounts, setCustomAmounts]   = useState({});
  const [calculatedShares, setCalculatedShares] = useState({});

  // NEW: Fraud warnings to show the user
  const [fraudWarnings, setFraudWarnings] = useState([]);

  // Recompute shares whenever inputs change
  useEffect(() => {
    const total = parseFloat(totalAmount);
    if (!total || selectedUsers.length < 1) {
      setCalculatedShares({});
      return;
    }

    const participants = [currentUser.userId, ...selectedUsers];
    const customTotal = Object.values(customAmounts).reduce(
      (sum, v) => sum + (v || 0),
      0
    );
    const remainingCount = participants.filter(
      (uid) => customAmounts[uid] == null
    ).length;
    const evenShare = remainingCount > 0
      ? (total - customTotal) / remainingCount
      : 0;

    const shares = {};
    participants.forEach((uid) => {
      shares[uid] =
        customAmounts[uid] != null
          ? customAmounts[uid]
          : parseFloat(evenShare.toFixed(2));
    });

    setCalculatedShares(shares);
  }, [selectedUsers, customAmounts, totalAmount, currentUser.userId]);

  // Handlers for adding/removing participants & custom amounts
  const handleAddUser = () => {
    if (
      selectedUserId &&
      selectedUserId !== currentUser.userId &&
      !selectedUsers.includes(selectedUserId)
    ) {
      setSelectedUsers([...selectedUsers, selectedUserId]);
      setSelectedUserId('');
    }
  };

  const handleRemoveUser = (uid) => {
    setSelectedUsers(selectedUsers.filter((id) => id !== uid));
    setCustomAmounts((c) => {
      const copy = { ...c };
      delete copy[uid];
      return copy;
    });
  };

  const handleCustomChange = (uid, amt) => {
    const val = parseFloat(amt);
    setCustomAmounts((c) => ({
      ...c,
      [uid]: isNaN(val) ? null : val,
    }));
  };

  // Submission handler
  const handleSend = async () => {
    // Clear previous warnings
    setFraudWarnings([]);

    // Basic validation
    if (!title || !description || !totalAmount || selectedUsers.length === 0) {
      return alert('Please fill all fields and add at least one participant.');
    }

    // Build members payload
    const members = [
      {
        user_id: currentUser.userId,
        share_amount: calculatedShares[currentUser.userId] || 0,
        status: 'paid',
      },
      ...selectedUsers.map((uid) => ({
        user_id: uid,
        share_amount: calculatedShares[uid] || 0,
        status: 'unpaid',
      }))
    ];

    try {
      // POST to your backend
      await axios.post('https://amazonhackon5.onrender.com/api/split/expenses', {
        title,
        description,
        amount: parseFloat(totalAmount),
        payer_id: currentUser.userId,
        members,
      });

      // On success, reset form
      alert('✅ Expense shared successfully!');
      setTitle('');
      setDescription('');
      setTotalAmount('');
      setSelectedUsers([]);
      setCustomAmounts({});
    } catch (err) {
      // If backend returned fraud_flags on a 400, extract and show them
      const data = err.response?.data;
      if (err.response?.status === 400 && data?.fraud_flags) {
        const warnings = [];
        if (data.error) warnings.push(data.error);                            // Backend message
        if (data.fraud_flags.duplicate)  warnings.push("Duplicate expense detected.");
        if (data.fraud_flags.high_value) warnings.push("High-value expense flagged.");
        setFraudWarnings(warnings);
        return;  // Don't reset form
      }

      // Other errors
      console.error(err);
      alert('❌ Error submitting expense.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Split Expense</h2>

      {/* Fraud warning banner */}
      {fraudWarnings.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded">
          {fraudWarnings.map((msg, i) => (
            <p key={i}>⚠️ {msg}</p>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Title (e.g. Dinner)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />

        <input
          type="text"
          placeholder="Description (e.g. at Domino’s)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />

        <input
          type="number"
          placeholder="Total Amount (₹)"
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />

        <div className="flex gap-2 items-center">
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="flex-1 p-2 border rounded-lg"
          >
            <option value="">-- Select Member --</option>
            {users
              .filter((u) =>
                u.userId !== currentUser.userId &&
                !selectedUsers.includes(u.userId)
              )
              .map((u) => (
                <option key={u.userId} value={u.userId}>
                  {u.name} ({u.userId})
                </option>
              ))}
          </select>
          <button
            onClick={handleAddUser}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add
          </button>
        </div>

        {(selectedUsers.length > 0 || totalAmount) && (
          <div className="mt-4 space-y-3">
            {/* “You” always shown */}
            <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
              <span className="flex-1 font-medium">
                You ({currentUser.userId})
              </span>
              <input
                type="number"
                placeholder="Custom ₹"
                className="w-24 p-2 border rounded-md"
                value={customAmounts[currentUser.userId] ?? ''}
                onChange={(e) =>
                  handleCustomChange(currentUser.userId, e.target.value)
                }
              />
              <span className="text-sm text-gray-500">
                Share: ₹{calculatedShares[currentUser.userId]?.toFixed(2) ?? '0.00'}
              </span>
            </div>

            {/* Other participants */}
            {selectedUsers.map((uid) => {
              const user = users.find((u) => u.userId === uid);
              return (
                <div
                  key={uid}
                  className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg"
                >
                  <span className="flex-1 font-medium">
                    {user?.name || 'Unknown'} ({uid})
                  </span>
                  <input
                    type="number"
                    placeholder="Custom ₹"
                    className="w-24 p-2 border rounded-md"
                    value={customAmounts[uid] ?? ''}
                    onChange={(e) => handleCustomChange(uid, e.target.value)}
                  />
                  <span className="text-sm text-gray-500">
                    Share: ₹{calculatedShares[uid]?.toFixed(2) ?? '0.00'}
                  </span>
                  <button
                    onClick={() => handleRemoveUser(uid)}
                    className="text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={handleSend}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 mt-4"
        >
          Split & Send
        </button>
      </div>
    </div>
  );
}
