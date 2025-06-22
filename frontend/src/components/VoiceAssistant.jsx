// // VoiceAssistant.jsx
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Mic, X, Loader, ShoppingCart, Check, AlertCircle } from "lucide-react";

// const VoiceAssistant = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [status, setStatus] = useState("🎤 Ready to take your grocery order by voice!");
//   const [isRunning, setIsRunning] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [cartInfo, setCartInfo] = useState({ items: 0, total: 0 });
//   const [error, setError] = useState("");
//   const [isSpeaking, setIsSpeaking] = useState(false);

//   // Check assistant status on component mount and when panel opens
//   useEffect(() => {
//     let interval;
    
//     if (isOpen) {
//       checkAssistantStatus();
//       interval = setInterval(checkAssistantStatus, 3000);
//     }
    
//     return () => clearInterval(interval);
//   }, [isOpen]);

//   const checkAssistantStatus = async () => {
//     try {
//       const res = await axios.get("http://localhost:5000/api/voice-assistant/status");
//       setIsRunning(res.data.is_running);
//       setCartInfo({
//         items: res.data.cart_items || 0,
//         total: res.data.cart_total || 0
//       });
      
//       if (res.data.is_running) {
//         setStatus("🎙️ Voice assistant is active and listening...");
//       } else if (cartInfo.items > 0) {
//         setStatus("🛒 Your order is complete! Check your email for confirmation.");
//       } else {
//         setStatus("🎤 Ready to take your grocery order by voice!");
//       }
//     } catch (err) {
//       console.error(err);
//       setError("Failed to check assistant status");
//     }
//   };

//   const startVoiceAssistant = async () => {
//     try {
//       setIsLoading(true);
//       setStatus("Starting voice assistant...");
//       setError("");
      
//       const res = await axios.post("http://localhost:5000/api/voice-assistant/start");
      
//       setIsRunning(true);
//       setStatus("🎙️ Voice assistant started! Listening for your commands...");
//       setCartInfo({ items: 0, total: 0 });
//     } catch (err) {
//       console.error(err);
//       setStatus("❌ Failed to start assistant");
//       setError(err.response?.data?.message || "Please check your backend connection");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const stopVoiceAssistant = async () => {
//     try {
//       setIsLoading(true);
//       setStatus("Stopping voice assistant...");
      
//       const res = await axios.post("http://localhost:5000/api/voice-assistant/stop");
      
//       setIsRunning(false);
//       setStatus("🛑 Voice assistant stopped");
      
//       // Close panel after a short delay
//       setTimeout(() => setIsOpen(false), 1500);
//     } catch (err) {
//       console.error(err);
//       setStatus("❌ Failed to stop assistant");
//       setError(err.response?.data?.message || "Could not stop the assistant");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleToggle = () => {
//     if (isOpen) {
//       if (isRunning) {
//         stopVoiceAssistant();
//       } else {
//         setIsOpen(false);
//       }
//     } else {
//       setIsOpen(true);
//       startVoiceAssistant();
//     }
//   };

//   // Simulate speaking indicator
//   useEffect(() => {
//     const speakingIntervals = [];
    
//     if (status.includes("Assistant:")) {
//       setIsSpeaking(true);
//       speakingIntervals.push(
//         setTimeout(() => setIsSpeaking(false), 3000)
//       );
//     }
    
//     return () => speakingIntervals.forEach(clearTimeout);
//   }, [status]);

//   return (
//     <>
//       <button
//         className={`fixed bottom-6 right-6 text-white p-4 rounded-full shadow-lg z-50 transition-all duration-300 hover:scale-110 ${
//           isRunning 
//             ? "animate-pulse bg-green-500 hover:bg-green-600" 
//             : "bg-[#FF9900] hover:bg-[#FF8C00]"
//         }`}
//         onClick={handleToggle}
//         aria-label={isRunning ? "Stop voice assistant" : "Start voice assistant"}
//       >
//         {isLoading ? (
//           <Loader className="animate-spin" size={28} />
//         ) : isSpeaking ? (
//           <div className="relative">
//             <Mic size={28} />
//             <span className="absolute -top-1 -right-1 flex h-3 w-3">
//               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
//               <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
//             </span>
//           </div>
//         ) : (
//           <Mic size={28} />
//         )}
//       </button>

//       {isOpen && (
//         <div className="fixed bottom-6 right-6 w-[360px] bg-white shadow-2xl rounded-lg flex flex-col z-50 border border-gray-300 overflow-hidden">
//           <div className="bg-[#131921] text-white p-4 flex justify-between items-center">
//             <div className="flex items-center space-x-2">
//               <span className="font-bold text-lg">Voice Assistant</span>
//               <span className="bg-[#ff9900] text-xs px-2 py-1 rounded">Beta</span>
//               {isRunning && (
//                 <span className="flex items-center text-xs">
//                   <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
//                   Live
//                 </span>
//               )}
//             </div>
//             <X 
//               className="cursor-pointer hover:bg-[#232f3e] rounded-full p-1" 
//               size={24} 
//               onClick={() => isRunning ? stopVoiceAssistant() : setIsOpen(false)}
//               aria-label="Close assistant"
//             />
//           </div>

//           <div className="p-4 text-sm text-gray-700">
//             {isLoading ? (
//               <div className="flex items-center justify-center py-4">
//                 <Loader className="animate-spin text-[#FF9900] mr-2" size={20} />
//                 <span>Processing...</span>
//               </div>
//             ) : error ? (
//               <div className="flex items-center text-red-500">
//                 <AlertCircle className="mr-2" size={18} />
//                 <span>{error}</span>
//               </div>
//             ) : (
//               <>
//                 <div className="mb-3">{status}</div>
                
//                 {cartInfo.items > 0 && (
//                   <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-3">
//                     <div className="flex justify-between">
//                       <span className="flex items-center">
//                         <ShoppingCart className="mr-2" size={16} />
//                         Items in cart:
//                       </span>
//                       <span className="font-medium">{cartInfo.items}</span>
//                     </div>
//                     <div className="flex justify-between mt-1">
//                       <span>Current total:</span>
//                       <span className="font-bold">₹{cartInfo.total}</span>
//                     </div>
//                   </div>
//                 )}
                
//                 <div className="text-xs text-gray-500 mt-2">
//                   <div className="font-medium mb-1">Try saying:</div>
//                   <ul className="list-disc pl-5 space-y-1">
//                     <li><em>"Add 2 milk and 1 bread"</em></li>
//                     <li><em>"What's in my cart?"</em></li>
//                     <li><em>"My name is Arjun"</em></li>
//                     <li><em>"Confirm my order"</em></li>
//                     <li><em>"Stop the assistant"</em></li>
//                   </ul>
//                   <div className="mt-2 italic">UPI PIN will be requested at checkout</div>
//                 </div>
//               </>
//             )}
//           </div>

//           {isRunning && (
//             <div className="px-4 pb-4 flex space-x-2">
//               <button
//                 onClick={stopVoiceAssistant}
//                 className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center justify-center"
//               >
//                 <X size={16} className="mr-2" />
//                 Stop Assistant
//               </button>
//               {cartInfo.items > 0 && (
//                 <button
//                   onClick={() => {
//                     axios.post("http://localhost:5000/api/voice-assistant/confirm");
//                     setStatus("Confirming your order...");
//                   }}
//                   className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center justify-center"
//                 >
//                   <Check size={16} className="mr-2" />
//                   Checkout
//                 </button>
//               )}
//             </div>
//           )}
//         </div>
//       )}
//     </>
//   );
// };

// export default VoiceAssistant;