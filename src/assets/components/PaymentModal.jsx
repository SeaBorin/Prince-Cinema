// F:\react-course\react-app-two\prince-cinema-app\src\assets\components\PaymentModal.jsx

import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";

function PaymentModal({ booking, isOpen, onClose, onPaymentSuccess }) {
  const [timeLeft, setTimeLeft] = useState(180); // 3-minute payment countdown timer
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setTimeLeft(180);
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen || !booking) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  const handlePayClick = async () => {
    setIsProcessing(true);

    // Exact date & time when payment button is clicked
    const paymentTimestamp = new Date().toISOString();

    const paidBooking = {
      ...booking,
      paidAt: paymentTimestamp,
    };

    try {
      // Save confirmed seats into Firestore show document so seats are marked booked in real-time
      if (booking.showId && booking.seats && db) {
        const bookingsRef = collection(db, "shows", booking.showId, "bookings");
        await addDoc(bookingsRef, {
          seats: booking.seats,
          bookingId: booking.bookingId || "",
          createdAt: booking.createdAt || paymentTimestamp,
          paidAt: paymentTimestamp,
          totalAmount: booking.totalAmount || 0,
        });
      }
    } catch (error) {
      console.error("Error saving booking seats to Firestore:", error);
    } finally {
      setIsProcessing(false);
      onPaymentSuccess(paidBooking);
    }
  };

  // Generate a mock KHQR payload string using standard Bakong parameters
  const qrString = `00020101021229150011prince@khqr520459995303840540${booking.totalAmount.toFixed(2)}5802KH5912PRINCECINEMA6010PHNOM PENH6304`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-white text-center my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg"
        >
          ✕
        </button>

        {/* KHQR Header Banner */}
        <div className="bg-red-600 text-white font-black py-2 rounded-xl text-sm tracking-wider uppercase mb-4 shadow-md flex items-center justify-center gap-2">
          <span>KHQR</span>
          <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded font-mono">
            Bakong / ABA
          </span>
        </div>

        <h3 className="text-base font-bold text-white">Scan to Pay</h3>
        <p className="text-xs text-zinc-400 mt-0.5">PRINCE CINEMA CAMBODIA</p>

        {/* Total Amount Display */}
        <div className="my-3 py-2 bg-zinc-950 rounded-xl border border-zinc-800">
          <p className="text-[10px] text-zinc-500 uppercase font-semibold">
            Total Payment
          </p>
          <p className="text-2xl font-black text-amber-400">
            ${booking.totalAmount.toFixed(2)}{" "}
            <span className="text-xs text-zinc-400 font-normal">USD</span>
          </p>
        </div>

        {/* KHQR Code Display */}
        <div className="relative bg-white p-4 rounded-2xl mx-auto w-48 h-48 flex flex-col items-center justify-center border-4 border-red-600 shadow-inner my-4">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrString)}`}
            alt="KHQR Payment Code"
            className="w-full h-full object-contain"
          />
          {/* Central Bakong / ABA Branding icon */}
          <div className="absolute bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded border border-white">
            KHQR
          </div>
        </div>

        {/* Timer */}
        <div className="text-xs text-zinc-400 my-2">
          QR Code expires in:{" "}
          <span className="font-mono text-amber-400 font-bold">
            {formattedTime}
          </span>
        </div>

        <p className="text-[10px] text-zinc-500 mb-5">
          Accepts ABA Mobile, Sathapana, Wing, ACLEDA, and Bakong supporting
          mobile apps.
        </p>

        {/* Action Button */}
        <button
          onClick={handlePayClick}
          disabled={isProcessing || timeLeft === 0}
          className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold rounded-xl text-sm transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <span>Verifying Payment...</span>
          ) : (
            <span>Simulate Successful KHQR Payment</span>
          )}
        </button>
      </div>
    </div>
  );
}

export default PaymentModal;
