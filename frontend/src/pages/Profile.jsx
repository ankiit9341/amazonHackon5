import React, { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { Link } from 'react-router-dom';

const Profile = () => {
  const { users, currentUser, currentUserId, setCurrentUserId } = useContext(UserContext);
  const loading = !currentUser;

  // Function to get initials from name
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 to-blue-800">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400"></div>
        <p className="mt-4 text-white font-medium">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-gradient-to-b from-indigo-900 to-blue-800 text-white flex flex-col">
        <div className="p-6 flex items-center border-b border-indigo-700">
          <div className="bg-indigo-600 rounded-lg p-2 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
          <h1 className="text-xl font-bold">FinDash</h1>
        </div>
        
        <nav className="flex-1 py-6">
          <ul className="space-y-2 px-4">
            <li>
              <a href="#" className="flex items-center p-3 bg-indigo-700 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Profile
              </a>
            </li>
            <li>
              <Link to="/my-orders" className="flex items-center p-3 bg-indigo-700 rounded-lg hover:bg-indigo-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M16 11V9a4 4 0 00-8 0v2H6a2 2 0 00-2 2v5h12v-5a2 2 0 00-2-2h-1zM8 9a2 2 0 114 0v2H8V9z" />
                </svg>
                My Orders
              </Link>
            </li>

            <li>
              <a href="#" className="flex items-center p-3 hover:bg-indigo-700 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                Transactions
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center p-3 hover:bg-indigo-700 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                Cards
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center p-3 hover:bg-indigo-700 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 13.047 14.01c-.04.27-.147.516-.308.704a1 1 0 01-.872.31l-3.302-.719-1.594 1.415a1 1 0 01-1.482-1.074l.477-2.97-1.086-1.74a1 1 0 01.136-1.236l1.5-1.5 2.699-.369L11.3 3.05a1 1 0 01.7-.05z" clipRule="evenodd" />
                </svg>
                Rewards
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center p-3 hover:bg-indigo-700 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Support
              </a>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 border-t border-indigo-700">
          <div className="flex items-center">
            <div className="bg-indigo-600 rounded-full w-10 h-10 flex items-center justify-center mr-3">
              <span className="font-bold">{getInitials(currentUser.name)}</span>
            </div>
            <div>
              <p className="font-medium text-sm">{currentUser.name}</p>
              <p className="text-indigo-300 text-xs">{currentUser.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100">
        {/* Top Bar */}
        <div className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Profile Dashboard</h2>
            <p className="text-sm text-gray-600">Manage your account and preferences</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </button>
            <div className="relative">
              <select
                value={currentUserId}
                onChange={(e) => setCurrentUserId(e.target.value)}
                className="bg-gray-100 border-0 rounded-lg py-2 pl-4 pr-8 focus:ring-2 focus:ring-indigo-500"
              >
                {users.map((user) => (
                  <option key={user.userId} value={user.userId}>
                    {user.name} ({user.userId})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-6">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-white bg-opacity-20 backdrop-blur-sm border-2 border-white border-opacity-30 rounded-full w-20 h-20 flex items-center justify-center">
                      <span className="text-white text-3xl font-bold">
                        {getInitials(currentUser.name)}
                      </span>
                    </div>
                    <div className="ml-6">
                      <h1 className="text-2xl font-bold text-white">{currentUser.name}</h1>
                      <p className="text-indigo-100 mt-1">{currentUser.email}</p>
                      <div className="flex mt-2">
                        <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-medium text-white mr-2">
                          Premium Member
                        </span>
                        <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-medium text-white">
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 md:mt-0 flex space-x-4">
                    <button className="bg-white text-indigo-600 px-5 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                      Edit Profile
                    </button>
                    <button className="bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-800 transition-colors">
                      Add Funds
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Account Balance</p>
                  <p className="text-2xl font-bold text-green-600">${currentUser.balance.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Cards</p>
                  <p className="text-2xl font-bold text-indigo-600">{currentUser.cards.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="text-2xl font-bold text-indigo-600">2023</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-2xl font-bold text-green-600">Active</p>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Information */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Personal Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Full Name</h3>
                    <p className="text-gray-900 font-medium text-lg">{currentUser.name}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Email Address</h3>
                    <p className="text-gray-900 font-medium text-lg">{currentUser.email}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Contact Number</h3>
                    <p className="text-gray-900 font-medium text-lg">{currentUser.contact}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Account ID</h3>
                    <p className="text-gray-900 font-medium text-lg">{currentUser.userId}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Address</h3>
                    <p className="text-gray-900 font-medium">123 Financial Street, Bangalore, India</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Last Login</h3>
                    <p className="text-gray-900 font-medium">Today, 14:32</p>
                  </div>
                </div>
              </div>
              
              {/* Security Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Security</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Password</h3>
                      <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                    </div>
                    <button className="text-indigo-600 font-medium hover:text-indigo-800">Change</button>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500">Add extra security to your account</p>
                    </div>
                    <button className="text-indigo-600 font-medium hover:text-indigo-800">Enable</button>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Login Activity</h3>
                      <p className="text-sm text-gray-500">View recent login history</p>
                    </div>
                    <button className="text-indigo-600 font-medium hover:text-indigo-800">View</button>
                  </div>
                </div>
              </div>
              
              {/* Payment Methods */}
              <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Payment Methods</h2>
                  <button className="flex items-center text-indigo-600 font-medium hover:text-indigo-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add New Card
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentUser.cards.map((card, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white relative overflow-hidden">
                      <div className="absolute top-4 right-4">
                        <div className="bg-white bg-opacity-20 p-1 rounded">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm opacity-80">Card Number</div>
                          <div className="text-xl font-mono tracking-wider mt-1">{card}</div>
                        </div>
                        <div className="bg-white rounded-lg p-1">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-6" />
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-8">
                        <div>
                          <div className="text-sm opacity-80">Card Holder</div>
                          <div className="font-medium">{currentUser.name}</div>
                        </div>
                        <div>
                          <div className="text-sm opacity-80">Expires</div>
                          <div className="font-medium">12/25</div>
                        </div>
                        <div>
                          <div className="text-sm opacity-80">CVV</div>
                          <div className="font-medium">***</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;