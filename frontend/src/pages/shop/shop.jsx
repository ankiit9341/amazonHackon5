import React, { useContext } from 'react'
import { PRODUCTS } from "../../products";
import './shop.css';
import { ShopContext } from '../../context/show-context';

export const Shop = () => {
  const { addToCart, cartItems } = useContext(ShopContext);
  return (
    <div className="product-list">
        {
        PRODUCTS.map((product, index) => (
          <div className="product-card" key={index}>
            <div className='product-image'>
              <img src={product.imgSrc} className="product-img" />
            </div>

            <div className='product-desc'>
              <h2>{product.name}</h2>
              <div className="product-price-div">
                <div className="product-price">
                  ${product.price}
                </div>
                <button
                  className="add-to-cart-button"
                  onClick={() => addToCart(index)}  // if you're using product.id, also replace that with index
                >
                  Add to Cart {cartItems[index] > 0 && <> ({cartItems[index]}) </>}
                </button>
              </div>
            </div>
          </div>
        ))
        }
    </div>
  )
};
