import React from 'react'
import drop from '../assets/drop.svg';
import { useState , useContext, useEffect } from 'react';
import { PRODUCTS } from '../products';
import { Navigate, useLocation } from 'react-router-dom';
import { ShopContext } from '../context/show-context';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';


const Payment = () => {
    const [debitShow, setdebitShow] = useState(false)
    const [UPI, setUPI] = useState(false)
    const [Credit, setCredit] = useState(false)
    const [COD, setCOD] = useState(false)
    const [netBanking, setnetBanking] = useState(false)
    const [EMI, setEMI] = useState(false)
    const [PowerCard, setPowerCard] = useState(false)
    const { currentUserId } = useContext(UserContext);

    const [paymentMethod, setPaymentMethod] = useState('None');
    const [recommmendedPaymentMethod, setPayment] = useState('None');
    const { cartItems , addToCart, removeFromCart, setCartItems, clear } = useContext(ShopContext);
    const [selectedCard, setSelectedCard] = useState('')
    const [availableDiscount, setAvailableDiscount] = useState(0)

    const cardOptions = [
    { name: "HDFC Debit Card", discount: 5 },
    { name: "HDFC Credit Card", discount: 10 },
    { name: "SBI Debit Card", discount: 6 },
    { name: "SBI Credit Card", discount: 8 },
    { name: "ICICI Debit Card", discount: 6 },
    { name: "ICICI Credit Card", discount: 12 },
    { name: "Axis Debit Card", discount: 7 },
    { name: "Axis Credit Card", discount: 11 }
    ];



    const location = useLocation();

    const totalPrice = location.state.totalPrice;

    // useEffect(() => {
    //     axios.get("https://amazonhackon5.onrender.com
/predict")
    //     .then((response) => {
    //         setPayment(response.data['recommended_payment_method']);
    //         console.log(response);
    //     })
    //     .catch((error) => {
    //         console.log(error);
    //     });
    // },[]);

    const handledebit = () =>{
        setPaymentMethod('Debit Card');
        setdebitShow(!debitShow);
        setCredit(false);
        setCOD(false);
        setnetBanking(false);
        setEMI(false);
        setUPI(false);
        setPowerCard(false);
    }

    const handleUPI = () =>{
        setPaymentMethod('UPI');
        setUPI(!UPI);
        setCredit(false);
        setCOD(false);
        setnetBanking(false);
        setEMI(false);
        setdebitShow(false);
        setPowerCard(false);
    }

    const handleEMI = () =>{
        setPaymentMethod('EMI');
        setEMI(!EMI);
        setCredit(false);
        setCOD(false);
        setnetBanking(false);
        setUPI(false);
        setdebitShow(false);
        setPowerCard(false);
    }

    const handlenetBanking = () =>{
        setPaymentMethod('Net Banking');
        setnetBanking(!netBanking);
        setCredit(false);
        setCOD(false);
        setEMI(false);
        setUPI(false);
        setdebitShow(false);
        setPowerCard(false);
    }

    const handleCOD = () =>{
        setPaymentMethod('COD');
        setCOD(!COD);
        setCredit(false);
        setnetBanking(false);
        setEMI(false);
        setUPI(false);
        setdebitShow(false);
        setPowerCard(false);
    }

    const handleCredit = () =>{
        setPaymentMethod('Credit Card');
        setCredit(!Credit);
        setCOD(false);
        setnetBanking(false);
        setEMI(false);
        setUPI(false);
        setdebitShow(false);
        setPowerCard(false);
    }

    const handlePowerCard = () => {
        setPaymentMethod('PowerCard');
        setPowerCard(!PowerCard);
        // Reset all other methods
        setdebitShow(false);
        setUPI(false);
        setCredit(false);
        setCOD(false);
        setnetBanking(false);
        setEMI(false);
    }

    const handleGeneratePowerRequest = () => {
        const discountAmount = totalPrice * availableDiscount / 100;
        const userB_payment = parseFloat((totalPrice - discountAmount).toFixed(2));
        const commission = parseFloat((discountAmount * 0.2).toFixed(2));
        const serviceFee = parseFloat((discountAmount * 0.05).toFixed(2));
        const escrowAmount = parseFloat((userB_payment + commission + serviceFee).toFixed(2));

        axios.post("https://amazonhackon5.onrender.com
/api/powercard/request", {
            userA: currentUserId,
            card: selectedCard,
            productPrice: totalPrice,
            discount: discountAmount,
            commission: commission,
            serviceFee: serviceFee,
            total: parseFloat((totalPrice - discountAmount).toFixed(2)),   // ✅ for User B
            fullEscrow: escrowAmount                                    // ✅ for User A
        })
        .then((res) => {
            alert("✅ PowerRequest Created!\nRequest ID: " + res.data.id);
        })
        .catch((err) => {
            console.error(err);
            alert("❌ Failed to create PowerRequest.");
        });
    };




    useEffect(() => {
        if (selectedCard) {
            const card = cardOptions.find(option => option.name === selectedCard);
            if (card) {
                setAvailableDiscount(card.discount);
            }
        }
    }, [selectedCard]);

    const getDefaultCart = () => {
        let cart = {};
        for (let i = 1; i < PRODUCTS.length + 1; i++) {
          cart[i] = 0;
        }
        return cart;
      };

      useEffect(() => {
        console.log('After clearing:', cartItems);
      }, [cartItems]);

    const navigate = useNavigate();

    const handleCheckout = () =>{
        if( paymentMethod == 'None' ){
            alert('Please select a payment method');
            return;
        }
        axios.post("https://amazonhackon5.onrender.com
/checkout", { cartItems, paymentMethod })
        .then((response) => {
            console.log(response); 
            setCartItems(getDefaultCart());
            alert("Transaction Succesfull! You will be redirected to Home Page")
            navigate('/');
        })
        .catch((error) => {
            console.log(error);
            alert("Transaction Failed!")
        });
    }

  return (
    <div className='flex'>
        <div className="left w-[60%] m-4 p-6 flex flex-col gap-6">
            <div className='border flex justify-between items-center p-2 rounded-md h-16 border-black bg-black text-white'>
                <h2 className='text-2xl'>Preferred Payment Method : {recommmendedPaymentMethod}</h2>
            </div>
            
                <div className="methods flex flex-col gap-4 ">

                    <div className='border min-h-[40px] flex flex-col gap-2 p-2 rounded-md bg-gray-400  border-black'>
                    
                        <div className="flex justify-between ">
                            
                            <h2 className='text-lg'>UPI</h2>
                            <div className="drop cursor-pointer"  onClick={handleUPI} >
                                <img src={drop} alt="" />
                            </div>

                        </div>

                        <div className={UPI ? "flex flex-col gap-1" : 'hidden'} >
                                    <input className='p-2 rounded-md  w-[60%]' type="text" placeholder='UPI ID' />
                                </div>

                            </div>


                    <div className='border min-h-[40px] flex flex-col gap-2 bg-gray-400  p-2 rounded-md border-black'>

                        <div className="flex justify-between">
                            <h2 className="text-lg">EMI/Pay Later</h2>
                            <div className="drop cursor-pointer" onClick={handleEMI} >
                                <img src={drop} alt="" />
                            </div>

                        </div>

                        <div className={EMI ? "flex flex-col gap-1" : 'hidden'} >
                                <input className='p-2 rounded-md  w-[60%]' type="text" placeholder='Card Holder Name' />
                                <input className='p-2 rounded-md  w-[60%]' type="text" placeholder='Card Number' />
                                <input className='p-2 rounded-md  w-[60%]' type="text" placeholder='Card CVV' />
                            </div>

                    </div>

                    <div className='border min-h-[40px] flex flex-col gap-2 bg-gray-400  p-2 rounded-md border-black'>

                        
                        <div className=" upi flex justify-between">
                            
                            <h2 className="text-lg">Debit Card</h2>
                            <div className="drop cursor-pointer" onClick={handledebit}>
                                <img src={drop} alt="" />
                            </div>
                            
                        </div>

                        <div className={debitShow ? "flex flex-col bg-gray-400  gap-1" : 'hidden'} >
                            <input className='p-2 rounded-md  w-[60%]' type="text" placeholder='Card Holder Name' />
                            <input className='p-2 rounded-md  w-[60%]' type="text" placeholder='Card Number' />
                            <input className='p-2 rounded-md  w-[60%]' type="text" placeholder='Card CVV' />
                        </div>


                    </div>


                    <div className='border min-h-[40px] flex flex-col bg-gray-400  gap-2 p-2 rounded-md border-black'>

                        <div className="flex justify-between">
                            <h2 className="text-lg">Credit Card</h2>
                            <div className="drop cursor-pointer" onClick={handleCredit}>
                                <img src={drop} alt="" />
                            </div>
                        </div>

                        <div className={Credit ? "flex flex-col gap-1" : 'hidden'} >
                            <input className='p-2 rounded-md  w-[60%]' type="text" placeholder='Card Holder Name' />
                            <input className='p-2 rounded-md  w-[60%]' type="text" placeholder='Card Number' />
                            <input className='p-2 rounded-md  w-[60%]' type="text" placeholder='Card CVV' />
                        </div>

                    </div>


                    <div className='border min-h-[40px] flex flex-col gap-2 bg-gray-400 p-2 rounded-md border-black'>
                        <div className="flex justify-between">
                            <h2 className="text-lg">PowerCard</h2>
                            <div className="drop cursor-pointer" onClick={handlePowerCard}>
                                <img src={drop} alt="" />
                            </div>
                        </div>

                        <div className={PowerCard ? "flex flex-col gap-2 mt-2" : 'hidden'}>
                            {/* Card Selection */}
                            <div className="flex items-center">
                                <label className="w-48">Required Card:</label>
                                <select 
                                    className="p-2 rounded-md w-[60%]"
                                    value={selectedCard}
                                    onChange={(e) => setSelectedCard(e.target.value)}
                                >
                                    <option value="">Select a card</option>
                                    {cardOptions.map((card, index) => (
                                        <option key={index} value={card.name}>
                                            {card.name} ({card.discount}% discount)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Product Price */}
                            <div className="flex items-center">
                                <label className="w-48">Product Price:</label>
                                <input 
                                    className="p-2 rounded-md w-[60%] bg-gray-200"
                                    type="text"
                                    value={`$${totalPrice}`}
                                    readOnly
                                />
                            </div>

                            {/* Available Discount */}
                            <div className="flex items-center">
                                <label className="w-48">Available Discount:</label>
                                <input 
                                    className="p-2 rounded-md w-[60%] bg-gray-200"
                                    type="text"
                                    value={`${availableDiscount}% ($${(totalPrice * availableDiscount / 100).toFixed(2)})`}
                                    readOnly
                                />
                            </div>

                            {/* PowerPartner's Share */}
                            <div className="flex items-center">
                                <label className="w-48">PowerPartner's Share:</label>
                                <input 
                                    className="p-2 rounded-md w-[60%] bg-gray-200"
                                    type="text"
                                    value={`$${(totalPrice * availableDiscount / 100 * 0.2).toFixed(2)}`}
                                    readOnly
                                />
                            </div>

                            {/* Service Charge (5% of discount) */}
                            <div className="flex items-center">
                                <label className="w-48">Service Charge (5%):</label>
                                <input 
                                    className="p-2 rounded-md w-[60%] bg-gray-200"
                                    type="text"
                                    value={`$${(totalPrice * availableDiscount / 100 * 0.05).toFixed(2)}`}
                                    readOnly
                                />
                            </div>

                            {/* What User B Will Pay */}
                            <div className="flex items-center">
                            <label className="w-48">PowerPartner Will Pay:</label>
                            <input 
                                className="p-2 rounded-md w-[60%] bg-gray-200"
                                type="text"
                                value={`$${(totalPrice - (totalPrice * availableDiscount / 100)).toFixed(2)}`}
                                readOnly
                            />
                            </div>

                            {/* Total Escrow to Collect from User A */}
                            <div className="flex items-center">
                            <label className="w-48 font-bold">Your Total (Escrow):</label>
                            <input 
                                className="p-2 rounded-md w-[60%] bg-yellow-100 font-bold border-2 border-yellow-400"
                                type="text"
                                value={`$${(
                                (totalPrice - totalPrice * availableDiscount / 100) +
                                (totalPrice * availableDiscount / 100 * 0.2) +
                                (totalPrice * availableDiscount / 100 * 0.05)
                                ).toFixed(2)}`}
                                readOnly
                            />
                            </div>


                            

                           <div className="w-[108%] flex justify-center mt-2">
                                <button 
                                    className="bg-sky-300 hover:bg-sky-400 text-black font-bold py-1.5 px-3 rounded-md text-[0.925rem] leading-tight transition-colors w-40 shadow-sm"
                                    onClick={handleGeneratePowerRequest}

                                >
                                    Generate PowerRequest
                                </button>
                            </div>

                        </div>
                    </div>


                    <div className='border min-h-[40px] flex flex-col bg-gray-400  gap-2 p-2 rounded-md border-black'>

                        <div className=" flex justify-between">
                            <h2 className="text-lg">Net Banking</h2>
                            <div className="drop cursor-pointer" onClick={handlenetBanking}>
                                <img src={drop} alt="" />
                            </div>
                        </div>

                        
                        <div className={netBanking ? "flex flex-col gap-1" : 'hidden'} >
                            <input className='p-2 rounded-md  w-[60%]' type="text" placeholder='Bank Name' />
                            
                        </div>



                    </div>


                    
                    <div className='border min-h-[40px] flex flex-col bg-gray-400 gap-2 p-2 rounded-md border-black'>

                   

                        <div className="flex justify-between">
                            <h2 className="text-lg">COD</h2>
                            <div className="drop cursor-pointer" onClick={handleCOD}>
                                <img src={drop} alt="" />
                            </div>
                        </div>

                          
                        <div className={COD ? "flex flex-col items-end gap-1" : 'hidden'} >
                            <button className='p-2 rounded-md bg-[#ff9900]'>Click Here</button>
                        </div>


                    </div>

                </div>
            
        </div>

        <div className="right m-10 rounded-md p-4 gap-4 flex flex-col border border-black w-[25%]">

            <div className="w-full bg-[#ff9900]  p-2 rounded-md">Total : ${totalPrice}</div>

            <div className='bought flex flex-col gap-4'>

            {PRODUCTS.map((product) => {
            if (cartItems[product.id] !== 0) {
                return (
                <div key={product.id} className="flex justify-between p-2 rounded-md bg-white">
                    <span className="text-lg">{product.name}</span>
                    <div>
                    <div className="flex justify-between">
                        <span>Quantity : </span>
                        <span>{cartItems[product.id]}</span>
                    </div>
                    <div>
                        <span>Price : </span>
                        <span>${product.price * cartItems[product.id]}</span>
                    </div>
                    </div>
                </div>
                );
            }
            return null; // return null for non-cart items to avoid warnings
            })}


            </div>

            <button className='flex justify-center bg-[#ff9900] p-2 rounded-md' onClick={handleCheckout}>CheckOut</button>

        </div>

    </div>
  )
}

export default Payment
