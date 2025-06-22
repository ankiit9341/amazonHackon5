// SplitDashboard.jsx
import React, { useState } from 'react';
import SplitSideBar from './SplitSideBar';
import SplitCalculator from './SplitCalculator';
import SplitHistory from './SplitHistory';
import SplitRequests from './SplitRequests';

export default function SplitDashboard() {
  const [view, setView] = useState('calculator');

  const renderContent = () => {
    switch (view) {
      case 'calculator':
        return <SplitCalculator />;
      case 'history':
        return <SplitHistory />;
      case 'requests':
        return <SplitRequests />;
      default:
        return <SplitCalculator />;
    }
  };

  return (
    <div className="flex w-full bg-gray-100">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-200 p-8 flex-shrink-0 flex flex-col">
        <h1 className="text-3xl font-extrabold text-indigo-600 mb-10">Split Bills</h1>
        <SplitSideBar active={view} onSelect={setView} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-12">
        <div className="w-full h-full max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-10">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
