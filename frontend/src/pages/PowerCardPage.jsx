import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from "../context/UserContext";

const PowerCardDashboard = () => {
  const { users, currentUser, setCurrentUserId, currentUserId } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('available');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [allRequests, setAllRequests] = useState([]);
  const [availableRequests, setAvailableRequests] = useState([]); // ✅ keep this one
  const [myRequests, setMyRequests] = useState([]);

  const history = allRequests.filter(
    r => r.status === 'completed' &&
    (r.userA?.userId === currentUser.userId || r.userB?.userId === currentUser.userId)
  );
  const acceptedRequests = currentUser
  ? allRequests.filter(
      r => r.status === 'accepted' && r.userB?.userId === currentUser.userId
    )
  : [];



  useEffect(() => {
    if (!currentUserId) return;

    axios.get(`http://localhost:5000/api/powercard/eligible/${currentUserId}`)
      .then(res => setAvailableRequests(res.data))
      .catch(err => console.error("Failed to load eligible requests", err));
  }, [currentUserId]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/powercard/all")
      .then((res) => {
        setAllRequests(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch all requests", err);
      });
  }, []);


  useEffect(() => {
    if (!currentUser?.userId) return;
    
    axios.get(`http://localhost:5000/api/powercard/myrequests/${currentUser.userId}`)
      .then((res) => {
        setMyRequests(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch my requests", err);
      });
  }, [currentUser]);

    
  return (
    <div className="max-w-6xl mx-auto p-4">

      <h1 className="text-3xl font-bold text-center mb-6">PowerCard Dashboard</h1>
      
      {/* Tab Navigation */}
      <div className="flex border-b mb-4 space-x-4">
      <button 
        className={`py-3 px-6 font-medium ${activeTab === 'available' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        onClick={() => setActiveTab('available')}
      >
        Available Requests
      </button>

      <button 
        className={`py-3 px-6 font-medium ${activeTab === 'accepted' ? 'border-b-2 border-yellow-500 text-yellow-600' : 'text-gray-500'}`}
        onClick={() => setActiveTab('accepted')}
      >
        Accepted
      </button>

      <button 
        className={`py-3 px-6 font-medium ${activeTab === 'myRequests' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500'}`}
        onClick={() => setActiveTab('myRequests')}
      >
        My Requests
      </button>

      <button 
        className={`py-3 px-6 font-medium ${activeTab === 'history' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}
        onClick={() => setActiveTab('history')}
      >
        Request History
      </button>
    </div>

      
      {/* Available Requests (User B) */}
      {activeTab === 'available' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-50 p-4 border-b">
            <h2 className="text-xl font-bold text-blue-700">Available Requests</h2>
            <p className="text-sm text-gray-600">Accept requests to earn commissions</p>
          </div>

          <div className="divide-y">
            {availableRequests
              .filter(request => request.userA?.userId !== currentUser?.userId) // ✅ Strict check
              .map(request => (
                <div key={request.id} className="p-4 hover:bg-blue-50 transition-colors">
                  <div className="flex justify-between items-center">
                    {/* Left Side */}
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{request.card}</h3>
                      <p className="text-sm text-gray-500">
                        Created by: <span className="font-semibold">{request.userA?.name || "Unknown"}</span>
                      </p>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm">
                      <span>
                        PowerPartner Pays:{" "}
                        <span className="font-semibold text-blue-800">
                        ${request.total?.toFixed(2) || "0.00"}
                      </span>

                      </span>

                        <span>
                          Commission Earned:{" "}
                          <span className="font-semibold text-green-700">
                            ${request.commission}
                          </span>
                        </span>
                      </div>

                    </div>

                    {/* Right Side */}
                    <div className="flex flex-col items-end gap-2">
                      {request.timeLeft && (
                        <div className="text-xs text-gray-500 text-center">
                          Time Left
                          <div className="font-bold text-red-600">{request.timeLeft}</div>
                        </div>
                      )}
                      {request.status === 'open' ? (
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
                          onClick={() => setSelectedRequest(request)}
                        >
                          Accept Request
                        </button>
                      ) : request.status === 'accepted' && request.userB?.userId === currentUser?.userId ? (
                        <button
                          disabled
                          className="bg-yellow-100 text-yellow-800 font-semibold py-2 px-4 rounded-md text-sm cursor-default"
                        >
                          ✅ Accepted – Waiting for User A
                        </button>
                      ) : null}

                    </div>
                  </div>
                </div>
              ))}
          </div>

          {availableRequests.filter(request => request.userA?.userId !== currentUser?.userId).length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No available requests at this time
            </div>
          )}
        </div>
      )}


      
      {/* My Requests (User A) */}
      {activeTab === 'myRequests' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-50 p-4 border-b">
            <h2 className="text-xl font-bold text-green-700">My Requests</h2>
            <p className="text-sm text-gray-600">Track your created requests</p>
          </div>
          
          <div className="divide-y">

          {myRequests.map(request => (
            <div key={request.id} className="p-4 hover:bg-green-50 transition-colors border-b">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-lg mb-1">
                    {request.card || "Selected Card"}
                  </h3>

                  <div className="text-sm text-gray-600">
                    <span className="mr-3">
                      <strong>Status:</strong>{" "}
                      <span className={`ml-1 font-bold ${
                        request.status === 'open' ? 'text-yellow-600' : 
                        request.status === 'accepted' ? 'text-blue-600' : 
                        request.status === 'completed' ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </span>

                    {request.created_at && (
                      <span className="ml-4">
                        <strong>Created:</strong> {new Date(request.created_at * 1000).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {request.userB?.name && (
                    <div className="text-sm text-gray-700">
                      <strong>Helper:</strong> {request.userB.name} ({request.userB.email})
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-3 text-sm text-gray-800">
                    <div><strong>Product Price:</strong> ${request.productPrice?.toFixed(2) ?? "0.00"}</div>
                    <div><strong>Available Discount:</strong> -${request.discount?.toFixed(2) ?? "0.00"}</div>
                    <div><strong>Commission Offered:</strong> +${request.commission?.toFixed(2) ?? "0.00"}</div>
                    <div><strong>Service Fee:</strong> +${request.serviceFee?.toFixed(2) ?? "0.00"}</div>

                    {/* Escrow Total (User A) */}
                    <div className="col-span-2 font-semibold text-blue-600">
                      Your Total (Escrow): ${request.fullEscrow?.toFixed(2) ?? "0.00"}
                    </div>


                    {/* PowerPartner View */}
                    <div className="col-span-2 text-gray-500 text-xs italic">
                      PowerPartner pays only: ${request.total?.toFixed(2) ?? "0.00"}
                    </div>
                  </div>


                </div>

                {/* Action Buttons */}
                <div className="flex flex-col items-end gap-3">
                  {request.timeLeft && (
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Time Left</div>
                      <div className="font-bold text-red-600">{request.timeLeft}</div>
                    </div>
                  )}

                  {/* Escrow Logic */}
                  {request.status === "accepted" && request.userA?.userId === currentUser?.userId && !request.escrow_paid && (
                    <button
                      className="py-2 px-4 bg-yellow-400 hover:bg-yellow-500 rounded-md text-sm"
                      onClick={() => {
                        axios.post(`http://localhost:5000/api/powercard/pay-escrow/${request.id}`)

                          .then(() => {
                            alert("💰 Escrow payment successful");
                            setSelectedRequest(null); // close modal
                            // 🔄 Re-fetch requests
                            axios.get(`http://localhost:5000/api/powercard/myrequests/${currentUser.userId}`)
                              .then(res => setMyRequests(res.data));
                          })
                          .catch(() => alert("❌ Escrow payment failed"));
                      }}
                    >
                      💸 Pay Escrow
                    </button>
                  )}

                  {request.escrow_paid && request.userA?.userId === currentUser?.userId && (
                    <button
                      disabled
                      className="py-2 px-4 bg-green-200 text-green-800 rounded-md text-sm cursor-default"
                    >
                      ✅ Escrow Paid
                    </button>
                  )}

                  {/* View / Cancel */}
                  {request.status === "open" ? (
                    <button className="py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-md text-sm">
                      Cancel
                    </button>
                  ) : (
                    <button className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm">
                      View Details
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}


          </div>
          {myRequests.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              You haven't created any PowerCard requests yet.
            </div>
          )}

          <div className="p-4 border-t">
            <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New Request
            </button>
          </div>
        </div>
      )}
      
      {/* Request History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-purple-50 p-4 border-b">
            <h2 className="text-xl font-bold text-purple-700">Request History</h2>
            <p className="text-sm text-gray-600">Your completed PowerCard transactions</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{transaction.product}</td>

                    {/* Role */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.userA?.userId === currentUser?.userId
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {transaction.userA?.userId === currentUser?.userId ? "You (Requester)" : "You (PowerPartner)"}
                      </span>
                    </td>


                    {/* Partner Name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                        {transaction.userA?.userId === "userA"
                        ? transaction.userB?.name || "Unknown"
                        : transaction.userA?.name || "Unknown"}
                    </td>

                    {/* Amount or Commission */}
                    <td className="px-6 py-4 whitespace-nowrap">
                        {transaction.userA?.userId === "userA"
                        ? `$${transaction.total}` : `+ $${transaction.commission}`
}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'accepted'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1) || "Unknown"}
                        </span>
                    </td>

                    {/* Date (fallback to ID as timestamp if no created_at) */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.created_at
                        ? new Date(transaction.created_at * 1000).toLocaleDateString()
                        : "-"}
                    </td>
                    </tr>

                ))}
              </tbody>
            </table>
          </div>
          
          {history.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No transaction history yet
            </div>
          )}
        </div>
      )}
      
       {/* Accepted Requests (User B) */}
        {activeTab === 'accepted' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-yellow-50 p-4 border-b">
              <h2 className="text-xl font-bold text-yellow-700">Accepted Requests</h2>
              <p className="text-sm text-gray-600">Complete payments when escrow is ready</p>
            </div>

            <div className="divide-y">
              {acceptedRequests.map(request => (
                <div key={request.id} className="p-4 hover:bg-yellow-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg">{request.card}</h3>
                      <p className="text-sm text-gray-500">Created by: {request.userA?.name}</p>
                      <p className="text-sm">Total: <span className="font-semibold">${request.total}</span></p>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                      {/* Show status */}
                      <div className="text-sm text-gray-700 font-semibold">
                        Status: {request.escrow_paid ? "Escrow Paid" : "Waiting for Escrow"}
                      </div>

                      {/* Button to pay merchant if escrow is paid */}
                      {request.escrow_paid && (
                        <button
                          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
                          onClick={() => {
                            axios.post(`http://localhost:5000/api/powercard/pay-merchant/${request.id}`)
                              .then(() => {
                                alert("✅ Payment successful, transaction complete.");
                                // Optionally refetch allRequests here
                              })
                              .catch(() => alert("❌ Payment failed"));
                          }}
                        >
                          ✅ Pay Merchant
                        </button>
                      )}

                      {!request.escrow_paid && (
                        <button disabled className="bg-yellow-200 text-yellow-800 py-2 px-4 rounded-md cursor-default">
                          Waiting for User A
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {acceptedRequests.length === 0 && (
              <div className="p-6 text-center text-gray-500">No accepted requests found</div>
            )}
          </div>
        )}

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold">{selectedRequest.product}</h3>
                        <button 
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setSelectedRequest(null)}
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        </button>
                    </div>
                
                    <div className="mt-6 space-y-4">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Discount:</span>
                            <span className="font-bold">{selectedRequest.discount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Commission:</span>
                            <span className="font-bold text-green-600">{selectedRequest.commission}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Payment:</span>
                            <span className="font-bold">{selectedRequest.total}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Time Left:</span>
                            <span className="font-bold text-red-600">{selectedRequest.timeLeft}</span>
                        </div>
                        
                        <div className="mt-8 pt-4 border-t">
                            <h4 className="font-bold mb-2">Payment Instructions:</h4>
                            <ol className="list-decimal pl-5 space-y-2 text-sm">
                                <li>You'll pay {selectedRequest.total} to Amazon escrow</li>
                                <li>Requester will pay you back immediately after payment</li>
                                <li>You'll earn {selectedRequest.commission} commission</li>
                                <li>Payment must be completed within 6 hours</li>
                            </ol>
                        </div>
                    </div>
                    
                    <div className="mt-8 flex flex-col gap-3">
                        {/* Cancel Button */}
                        <div className="flex gap-3">
                            <button 
                            className="flex-1 py-3 bg-gray-300 hover:bg-gray-400 rounded-md"
                            onClick={() => setSelectedRequest(null)}
                            >
                            Cancel
                            </button>

                            {/* Accept Button – shown to everyone if status is open */}
                            {selectedRequest.status === "open" ? (
                              <button 
                                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                                onClick={() => {
                                  axios.post(`http://localhost:5000/api/powercard/accept/${selectedRequest.id}`, {
                                    userB: currentUser.userId
                                  })
                                  .then(() => {
                                    alert("✅ Request accepted!\nYou have 6 hours to pay.");
                                    setSelectedRequest(prev => ({
                                      ...prev,
                                      status: "accepted",
                                      userB: {
                                        userId: currentUser.userId,
                                        name: currentUser.name,
                                        email: currentUser.email
                                      }
                                    }));
                                  })
                                  .catch(() => {
                                    alert("❌ Could not accept request.");
                                  });
                                }}
                              >
                                Accept & Lock
                              </button>
                            ) : selectedRequest.status === "accepted" && selectedRequest.userB?.userId === currentUser.userId ? (
                              <button 
                                className="flex-1 py-3 bg-yellow-200 text-yellow-900 font-semibold rounded-md cursor-default"
                                disabled
                              >
                                ✅ Accepted – Waiting for User A to Pay
                              </button>
                            ) : null}

                        </div>

                        {/* Payment Buttons Section */}
                        <div className="flex gap-3">
                          {/* User A: Escrow payment after acceptance */}
                          {selectedRequest.userA?.userId === currentUser?.userId && selectedRequest.status === "accepted" && !selectedRequest.escrow_paid && (
                            <button 
                              className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 rounded-md"
                              onClick={() => {
                                axios.post(`http://localhost:5000/api/powercard/pay-escrow/${selectedRequest.id}`)


                                  .then(() => {
                                    alert("💰 Escrow payment successful");

                                    // Refresh data to reflect escrow status
                                    axios.get("http://localhost:5000/api/powercard/all")
                                      .then(res => setAllRequests(res.data));

                                    axios.get(`http://localhost:5000/api/powercard/myrequests/${currentUser.userId}`)
                                      .then(res => setMyRequests(res.data));

                                    setSelectedRequest(null); // Close modal
                                  })
                                  .catch(() => alert("❌ Escrow payment failed"));
                              }}
                            >
                              💸 User A Pays Escrow
                            </button>
                          )}

                          {/* User B: Merchant payment after escrow is paid */}
                          {selectedRequest.userB?.userId === currentUser?.userId && selectedRequest.escrow_paid && !selectedRequest.merchant_paid && (
                            <button 
                              className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-md"
                              onClick={() => {
                                axios.post(`http://localhost:5000/api/powercard/pay-merchant/${selectedRequest.id}`)
                                  .then(() => {
                                    alert("✅ Transaction completed. Commission received.");

                                    // Refresh data
                                    axios.get("http://localhost:5000/api/powercard/all")
                                      .then(res => setAllRequests(res.data));

                                    setSelectedRequest(null); // Close modal
                                  })
                                  .catch(() => alert("❌ Merchant payment failed"));
                              }}
                            >
                              ✅ Pay Merchant
                            </button>
                          )}
                        </div>

                    </div>

                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default PowerCardDashboard;