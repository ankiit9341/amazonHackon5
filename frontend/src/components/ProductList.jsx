import React from "react";
import './ProductList.css'
import boxImg from '../assets/box.png'

const ProductList = ({ itemsList, addToCart, cartItems = [] }) => {
  return (
    <div className="product-list">
      {itemsList.map((item, index) => (
        <div className="product-card" key={index}>
          <img src={boxImg} alt={item.name} className="product-img" />
          <h2>{item.name}</h2>
          <div className="product-price-div">
            <div className="product-price">${item.price}</div>
            <button
              className="add-to-cart-button"
              onClick={() => addToCart(item)}
            >
              Add to Cart
              {cartItems[index] > 0 && <> ({cartItems[index]})</>}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
