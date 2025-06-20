import React from 'react';

export default function SplitSideBar({ active, onSelect }) {
  const items = [
    { key: 'calculator', label: 'Split Calculator' },
    { key: 'history', label: 'Split History' },
    { key: 'requests', label: 'Split Requests' },
  ];

  return (
    <div className="w-48 bg-white rounded-2xl shadow-lg p-4 flex flex-col space-y-2">
      <h2 className="text-lg font-semibold mb-2">Menu</h2>
      {items.map(item => (
        <button
          key={item.key}
          onClick={() => onSelect(item.key)}
          className={`text-left px-3 py-2 rounded-xl transition hover:bg-blue-100 focus:outline-none ${
            active === item.key ? 'bg-blue-200 font-medium' : 'text-gray-700'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
