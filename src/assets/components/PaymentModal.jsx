// src/assets/components/PaymentModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

import abaLogo from "../aba_pay.png";
import acledaLogo from "../aceleda.png";
import khqrLogo from "../khqr.png";
import visaLogo from "../visacard.png";
import mastercardLogo from "../mastercard.jpg";

const PAYMENT_METHODS = [
  { id: "khqr", label: "KHQR", logo: khqrLogo },
  { id: "aba", label: "ABA Pay", logo: abaLogo },
  { id: "acleda", label: "ACLEDA", logo: acledaLogo },
  { id: "visa", label: "Visa", logo: visaLogo },
  { id: "mastercard", label: "Mastercard", logo: mastercardLogo },
];

const POLL_INTERVAL_MS = 3000;
const QR_EXPIRY_MS = 10 * 60 * 1000; // Bakong's 10-minute guideline

export default function PaymentModal({
  booking,
  isOpen,
  onClose,
  onBack,
  onPaymentSuccess,
}) {
  const [selectedMethod, setSelectedMethod] = useState("khqr");
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Real KHQR state
  const [khqrString, setKhqrString] = useState(null);
  const [khqrMd5, setKhqrMd5] = useState(null);
  const [khqrLoading, setKhqrLoading] = useState(false);
  const [khqrError, setKhqrError] = useState("");
  const [khqrExpiresAt, setKhqrExpiresAt] = useState(null);
  const pollTimerRef = useRef(null);

  const isCardMethod =
    selectedMethod === "visa" || selectedMethod === "mastercard";
  const referenceCode = booking?.bookingId || booking?.orderId;

  const resetCardFields = () => {
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
  };

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  // Generate a real KHQR code the moment this modal opens with KHQR selected
  useEffect(() => {
    if (!isOpen || !booking || selectedMethod !== "khqr") return;

    let cancelled = false;

    const generateQr = async () => {
      setKhqrLoading(true);
      setKhqrError("");
      setKhqrString(null);
      setKhqrMd5(null);

      try {
        const res = await fetch("/api/generate-khqr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: booking.totalAmount,
            billNumber: referenceCode,
            currency: "USD",
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.qr) {
          throw new Error(data.error || "Failed to generate QR");
        }

        if (cancelled) return;

        setKhqrString(data.qr);
        setKhqrMd5(data.md5);
        setKhqrExpiresAt(Date.now() + QR_EXPIRY_MS);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setKhqrError(
            "Could not generate the KHQR code. Please try again or choose a different method.",
          );
        }
      } finally {
        if (!cancelled) setKhqrLoading(false);
      }
    };

    generateQr();

    return () => {
      cancelled = true;
    };
  }, [isOpen, booking, selectedMethod, referenceCode]);

  // Poll for real payment confirmation once we have an MD5 to check
  useEffect(() => {
    if (!khqrMd5 || selectedMethod !== "khqr") {
      stopPolling();
      return;
    }

    pollTimerRef.current = setInterval(async () => {
      // Stop polling once the QR has expired
      if (khqrExpiresAt && Date.now() > khqrExpiresAt) {
        stopPolling();
        setKhqrError("This QR code has expired. Please generate a new one.");
        return;
      }

      try {
        const res = await fetch("/api/check-khqr-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ md5: khqrMd5 }),
        });
        const data = await res.json();

        if (data.paid) {
          stopPolling();
          finalizePayment("KHQR");
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, POLL_INTERVAL_MS);

    return () => stopPolling();
  }, [khqrMd5, khqrExpiresAt, selectedMethod]);

  // Stop polling and reset KHQR state whenever the modal closes
  useEffect(() => {
    if (!isOpen) {
      stopPolling();
      setKhqrString(null);
      setKhqrMd5(null);
      setKhqrError("");
    }
  }, [isOpen]);

  if (!isOpen || !booking) return null;

  const handleSelectMethod = (methodId) => {
    stopPolling();
    setSelectedMethod(methodId);
    resetCardFields();
    setKhqrError("");
  };

  const finalizePayment = (methodLabel) => {
    const paidBooking = {
      ...booking,
      paymentMethod: methodLabel,
      paidAt: new Date().toISOString(),
      status: "PAID",
    };

    if (typeof onPaymentSuccess === "function") {
      onPaymentSuccess(paidBooking);
    }
  };

  // For ABA / ACLEDA / Card — still simulated, since those need their own
  // separate gateway integrations (not part of KHQR)
  const handleConfirmSimulatedPayment = async () => {
    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setProcessing(false);

    const methodLabel = PAYMENT_METHODS.find(
      (m) => m.id === selectedMethod,
    )?.label;
    finalizePayment(methodLabel);
  };

  const handleCancelClick = () => {
    if (processing) return;
    stopPolling();
    if (typeof onBack === "function") {
      onBack();
    }
  };

  const handleCloseClick = () => {
    stopPolling();
    if (typeof onClose === "function") {
      onClose();
    }
  };

  const isCardFormValid =
    !isCardMethod ||
    (cardNumber.replace(/\s/g, "").length >= 12 &&
      cardExpiry.length === 5 &&
      cardCvv.length >= 3);

  return (
    <div
      onClick={handleCloseClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-white my-8"
      >
        <button
          onClick={handleCloseClick}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">Confirm Payment</h2>

        {/* Order Summary */}
        <div className="space-y-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl p-4 mb-6">
          {booking.type === "food" ? (
            <>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-1 mb-1">
                {booking.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-zinc-400"
                  >
                    <span className="text-zinc-300 truncate max-w-[65%]">
                      {item.name}{" "}
                      <span className="text-zinc-500">× {item.quantity}</span>
                    </span>
                    <span className="text-zinc-200 font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-zinc-800 pt-2 flex justify-between items-baseline">
                <span className="text-zinc-400 font-semibold">Total</span>
                <span className="text-xl font-black text-amber-500">
                  ${booking.totalAmount?.toFixed(2)}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between text-zinc-400">
                <span>Movie</span>
                <span className="text-zinc-200 font-medium">
                  {booking.movieTitle}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Cinema</span>
                <span className="text-amber-400 font-medium">
                  {booking.cinema}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Showtime</span>
                <span className="text-zinc-200 font-medium">
                  {booking.date}, {booking.time}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Seats</span>
                <span className="text-amber-400 font-bold">
                  {booking.seats?.join(", ")}
                </span>
              </div>
              <div className="border-t border-zinc-800 pt-2 flex justify-between items-baseline">
                <span className="text-zinc-400 font-semibold">Total</span>
                <span className="text-xl font-black text-amber-500">
                  ${booking.totalAmount?.toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Payment Method Selector */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-3">
            Select Payment Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => handleSelectMethod(method.id)}
                className={`flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-xl border text-center transition-all ${
                  selectedMethod === method.id
                    ? "bg-amber-500 border-amber-500 shadow-md shadow-amber-500/20"
                    : "bg-zinc-800/50 border-zinc-700/50 hover:border-zinc-600"
                }`}
              >
                <span className="w-10 h-10 flex items-center justify-center bg-white rounded-lg p-1 overflow-hidden">
                  <img
                    src={method.logo}
                    alt={method.label}
                    className="w-full h-full object-contain"
                  />
                </span>
                <span
                  className={`text-[11px] leading-tight font-medium ${
                    selectedMethod === method.id
                      ? "text-zinc-950 font-bold"
                      : "text-zinc-300"
                  }`}
                >
                  {method.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Real KHQR Code */}
        {selectedMethod === "khqr" && (
          <div className="mb-6 flex flex-col items-center justify-center space-y-3 bg-white p-5 rounded-xl text-zinc-950 min-h-[220px]">
            {khqrLoading ? (
              <p className="text-xs text-zinc-600">
                Generating your KHQR code...
              </p>
            ) : khqrError ? (
              <div className="text-center space-y-2">
                <p className="text-xs text-rose-600 font-semibold">
                  {khqrError}
                </p>
                <button
                  type="button"
                  onClick={() => handleSelectMethod("khqr")}
                  className="text-xs underline text-zinc-600"
                >
                  Try again
                </button>
              </div>
            ) : khqrString ? (
              <>
                <QRCodeSVG value={khqrString} size={180} />
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest text-center">
                  Scan with ABA / ACLEDA / Wing / any KHQR-supported app
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold text-center animate-pulse">
                  Waiting for payment...
                </p>
              </>
            ) : null}
          </div>
        )}

        {/* ABA / ACLEDA Simulated Redirect Note */}
        {(selectedMethod === "aba" || selectedMethod === "acleda") && (
          <div className="mb-6 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-center space-y-3">
            <span className="w-12 h-12 mx-auto flex items-center justify-center bg-white rounded-lg p-1.5 overflow-hidden">
              <img
                src={PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.logo}
                alt={
                  PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.label
                }
                className="w-full h-full object-contain"
              />
            </span>
            <p className="text-xs text-zinc-300">
              You'll be asked to approve this payment in your{" "}
              <span className="font-semibold text-amber-400">
                {PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.label}
              </span>{" "}
              app.
            </p>
            <p className="text-[10px] text-zinc-500">
              (Demo only — click "Confirm & Pay" to simulate approval.)
            </p>
          </div>
        )}

        {/* Card Form for Visa / Mastercard */}
        {isCardMethod && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-9 h-9 flex items-center justify-center bg-white rounded-md p-1 overflow-hidden">
                <img
                  src={
                    PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.logo
                  }
                  alt={
                    PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.label
                  }
                  className="w-full h-full object-contain"
                />
              </span>
              <span className="text-xs font-semibold text-zinc-300">
                {PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.label}{" "}
                Card Details
              </span>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">
                Card Number
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-zinc-400 block mb-1">
                  Expiry
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  maxLength={5}
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-zinc-400 block mb-1">CVV</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="123"
                  maxLength={4}
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
            <p className="text-[10px] text-zinc-500">
              (Demo only — no real card is charged.)
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCancelClick}
            disabled={processing}
            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-bold rounded-xl text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          {/* KHQR has no "Confirm & Pay" button — payment is detected automatically via polling */}
          {selectedMethod !== "khqr" && (
            <button
              type="button"
              onClick={handleConfirmSimulatedPayment}
              disabled={processing || !isCardFormValid}
              className="flex-[2] py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? "Processing..." : "Confirm & Pay"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
