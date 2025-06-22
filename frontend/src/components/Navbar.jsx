import React from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom';

import amazonLogo from '../assets/amazon-logo.png';
import amazonFreshLogo from '../assets/amazon-fresh-logo.png';
import cartIcon from '../assets/cart.png';
import AmazonFresh from "../pages/AmazonFresh";
import './Navbar.css';
import { User } from "lucide-react"; // icon library

const Navbar = () => {
  const navigate = useNavigate();

  const handleBudgetClick = () => {
    navigate('/budget');
  };

  const handlePowerCardClick = () => {
    navigate('/powercard'); // New route for PowerCard page
  };

  return (
    <div className="w-full flex justify-between items-center bg-black py-3 px-1">
      <div className='flex md:gap-10 md:w-[40%]'>
        <Link to="/">
          <img className='w-28 h-8' src={amazonLogo} alt="" id="amazon-logo"/>
        </Link>

        <Link to="/fresh">
          <div className="w-28 h-8 bg-white rounded-sm flex items-center justify-center">
            <img
              className="w-full h-full object-contain"
              src={amazonFreshLogo}
              alt="Amazon Fresh"
            />
          </div>
        </Link>

        <div className='w-full flex border border-black rounded-md outline-none'>
          <input className='w-full outline-none rounded-l-md p-1' type="text" id="search-input" placeholder="Search..." />
          <button className='w-1 md:w-28 rounded-r-md bg-[#ff9900]' id="search-button">Search</button>
        </div>
      </div>

      <div className='flex gap-5'>
        <div className='flex gap-4'>
          {/* Budget Button */}
          <button onClick={handleBudgetClick} className='w-18 text-sm h-10 p-1 md:p-2 rounded-md bg-[#ff9900]'>Budget</button>

          {/* PowerCard Button */}
          <button onClick={handlePowerCardClick} className='w-18 text-sm h-10 p-1 md:p-2 rounded-md bg-[#ff9900]' id="navbar-powercard-btn">
            PowerCard
          </button>

    
          {/* Split Button */}
          <Link to='/split'>
            <button className='w-18 text-sm h-10 p-1 md:p-2 rounded-md bg-[#ff9900]' id="navbar-dashboard-btn">SplitXpress</button>
          </Link>
        </div>

        <Link to="/cart">
          <div className='flex gap-1 items-center'>
            <img className='h-8' src={cartIcon} alt="" id="cart-icon" />
            <span className='text-white' id="navbar-cart-label">Cart</span>
          </div>
        </Link>

        <div>
          <Link to="/profile">
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 shadow transition duration-200"
              aria-label="Profile"
            >
              <User className="w-5 h-5 text-white" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
