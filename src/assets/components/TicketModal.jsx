// src/assets/components/TicketModal.jsx

import React from "react";

function TicketModal({ booking, isOpen, onClose }) {
  if (!isOpen || !booking) return null;

  const formatTimestamp = (isoString) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return null;

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const bookedAtFormatted = formatTimestamp(booking.createdAt);
  const paidAtFormatted = formatTimestamp(booking.paidAt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-white my-8 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white"
        >
          ✕
        </button>

        <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-[10px] font-bold tracking-wider uppercase">
          Booking Confirmed
        </span>

        <h2 className="text-xl font-black text-white mt-3 mb-1">
          PRINCE CINEMA TICKET
        </h2>
        <p className="text-xs text-zinc-400">
          Booking Reference:{" "}
          <span className="text-amber-400 font-mono font-bold">
            {booking.bookingId}
          </span>
        </p>

        {/* Digital Ticket Body */}
        <div className="my-6 p-4 bg-zinc-950 border border-dashed border-zinc-700 rounded-2xl text-left space-y-3">
          <div>
            <p className="text-[10px] uppercase text-zinc-500 font-bold">
              Movie
            </p>
            <p className="text-sm font-bold text-white">{booking.movieTitle}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] uppercase text-zinc-500 font-bold">
                Date & Time
              </p>
              <p className="text-xs text-zinc-300">
                {booking.date} @ {booking.showtime}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-zinc-500 font-bold">
                Format
              </p>
              <p className="text-xs text-zinc-300">{booking.format}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] uppercase text-zinc-500 font-bold">
                Location
              </p>
              <p className="text-xs text-zinc-300 line-clamp-1">
                {booking.branch}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-zinc-500 font-bold">
                Cinema Hall
              </p>
              <p className="text-xs font-semibold text-amber-400">
                {booking.hall || "Hall 1"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
            <div>
              <p className="text-[10px] uppercase text-zinc-500 font-bold">
                Seats
              </p>
              <p className="text-sm font-extrabold text-amber-400">
                {booking.seats.join(", ")}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-zinc-500 font-bold">
                Total Paid
              </p>
              <p className="text-sm font-extrabold text-white">
                ${booking.totalAmount.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Payment & Order Exact Timestamp Section */}
          <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-1 gap-1 text-[11px]">
            {bookedAtFormatted && (
              <div className="flex justify-between items-center text-zinc-400">
                <span className="text-[10px] uppercase text-zinc-500 font-semibold">
                  Order Placed:
                </span>
                <span className="font-mono text-zinc-300">
                  {bookedAtFormatted}
                </span>
              </div>
            )}
            {paidAtFormatted && (
              <div className="flex justify-between items-center text-emerald-400 font-medium">
                <span className="text-[10px] uppercase text-emerald-500/80 font-bold">
                  Payment Confirmed:
                </span>
                <span className="font-mono">{paidAtFormatted}</span>
              </div>
            )}
          </div>
        </div>

        {/* Simulated KHQR Code */}
        <div className="flex flex-col items-center justify-center space-y-2 bg-white p-4 rounded-xl text-zinc-950">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking.bookingId}`}
            alt="Ticket QR Code"
            className="w-32 h-32 object-contain"
          />
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
            Scan at Cinema Entrance / KHQR Valid
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-sm transition"
        >
          Done & Close Pass
        </button>
      </div>
    </div>
  );
}

export default TicketModal;
