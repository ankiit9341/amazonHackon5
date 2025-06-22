import milk from './fresh/milk.jpg';
import cheese from './fresh/cheese.jpg';
import yogurt from './fresh/yogurt.jpg';
import butter from './fresh/butter.jpg';
import eggs from './fresh/eggs.jpg';
import apple from './fresh/apple.jpg';
import banana from './fresh/banana.jpg';
import orange from './fresh/orange.jpg';
import grapes from './fresh/grapes.jpg';
import mango from './fresh/mango.jpg';
import bread from './fresh/bread.jpg';
import tomato from './fresh/tomato.jpg';
import potato from './fresh/potato.jpg';
import sugar from './fresh/sugar.jpg';



export default function AmazonFreshPage() {
  // Only the specified items
const freshProducts = [
  { id: 1, name: 'Milk', price: '$3.49', image: milk },
  { id: 2, name: 'Cheese', price: '$4.99', image: cheese },
  { id: 3, name: 'Yogurt', price: '$2.99', image: yogurt },
  { id: 4, name: 'Butter', price: '$3.79', image: butter },
  { id: 5, name: 'Eggs', price: '$2.49', image: eggs },
  { id: 6, name: 'Apple', price: '$1.29/kg', image: apple },
  { id: 7, name: 'Banana', price: '$0.49/kg', image: banana },
  { id: 8, name: 'Orange', price: '$1.19/kg', image: orange },
  { id: 10, name: 'Grapes', price: '$2.99/kg', image: grapes },
  { id: 11, name: 'Mango', price: '$1.89/each', image: mango },
  { id: 12, name: 'Bread', price: '$2.99', image: bread },
  { id: 13, name: 'Tomato', price: '$1.79/kg', image: tomato },
  { id: 14, name: 'Potato', price: '$0.99/kg', image: potato },
  { id: 15, name: 'Sugar', price: '$4.49', image: sugar },
];

  return (
    <div className="bg-gray-100 min-h-screen">

      {/* Fresh Products Section */}
      <section className="container mx-auto my-8 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Fresh Groceries</h2>
          <a href="#" className="text-amazon_blue hover:underline">See all</a>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {freshProducts.map((product) => (
            <div key={product.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
             <div className="relative h-48 bg-gray-100">
  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
</div>

              <div className="p-3">
                <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                <div className="flex items-center mt-1">
                  <div className="flex text-yellow-400">
                    {[1,2,3,4,5].map((star) => (
                      <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-600 ml-1">(1234)</span>
                </div>
                <div className="mt-2">
                  <span className="font-bold text-lg">{product.price}</span>
                </div>
                <div className="flex items-center mt-1">
                  <span className="text-xs bg-blue-100 text-blue-800 px-1">Prime</span>
                  <span className="text-xs ml-1 text-gray-600">FREE Delivery</span>
                </div>
                <button className="mt-3 w-full bg-amazon_yellow hover:bg-yellow-400 py-1 rounded text-sm font-semibold">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto text-center">
          <p>© 2023 Amazon Fresh Clone. Demo only.</p>
        </div>
      </footer>
    </div>
  );
}