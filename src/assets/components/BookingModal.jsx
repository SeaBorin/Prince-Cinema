import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { CAMBODIA_BRANCHES } from "../../data/cinemaData.js";

export default function BookingModal({
  movie,
  isOpen,
  onClose,
  onProceedToPayment,
  onRequireAuth,
}) {
  const { user, currentUser } = useAuth();
  const activeUser = user || currentUser;

  // Single source of truth — same branch list used by the Manager/Admin
  // dashboards, so booking data and dashboard filters always match
  const princeCinemas = CAMBODIA_BRANCHES.map((branch) => ({
    id: branch.id,
    name: branch.name,
  }));

  const cinemaFormats = [
    {
      id: "2d",
      name: "2D Digital",
      baseHall: 1,
      typeLabel: "2D Standard",
      priceMultiplier: 0,
    },
    {
      id: "3d",
      name: "3D Cinema",
      baseHall: 3,
      typeLabel: "3D RealD",
      priceMultiplier: 1.5,
    },
    {
      id: "screenx",
      name: "ScreenX 270°",
      baseHall: 4,
      typeLabel: "ScreenX Panoramic",
      priceMultiplier: 2.0,
    },
    {
      id: "imax",
      name: "IMAX Laser",
      baseHall: 5,
      typeLabel: "IMAX Laser Cinema",
      priceMultiplier: 3.5,
    },
  ];

  const [selectedCinema, setSelectedCinema] = useState(princeCinemas[0].name);
  const [selectedFormat, setSelectedFormat] = useState(cinemaFormats[0]);
  const [selectedDate, setSelectedDate] = useState("Today");
  const [selectedTime, setSelectedTime] = useState("18:30");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);

  const dates = ["Today", "Tomorrow", "Fri, Oct 24", "Sat, Oct 25"];
  const showtimes = ["13:00", "15:45", "18:30", "21:15", "23:45"];

  const SEAT_TYPES = {
    NORMAL: {
      label: "Normal Seat",
      price: 4.5,
      color: "border-blue-500/50 bg-blue-950/30 text-blue-300",
    },
    VIP: {
      label: "VIP Prime",
      price: 6.0,
      color: "border-amber-500/50 bg-amber-950/30 text-amber-300",
    },
    SWEETBOX: {
      label: "Sweetbox (Couple)",
      price: 12.0,
      color: "border-pink-500/50 bg-pink-950/30 text-pink-300",
    },
  };

  const seatRows = [
    { row: "A", type: "NORMAL" },
    { row: "B", type: "NORMAL" },
    { row: "C", type: "NORMAL" },
    { row: "D", type: "VIP" },
    { row: "E", type: "VIP" },
    { row: "F", type: "VIP" },
    { row: "G", type: "SWEETBOX" },
  ];
  const seatsPerRow = 8;

  const getDynamicCinemaHall = (movieId, cinemaName, formatObj) => {
    if (!movieId || !formatObj) return "Hall 1 (2D Standard)";

    const strToHash = `${movieId}_${cinemaName}`;
    let hash = 0;
    for (let i = 0; i < strToHash.length; i++) {
      hash = (hash << 5) - hash + strToHash.charCodeAt(i);
      hash |= 0;
    }

    const hallOffset = Math.abs(hash % 2);
    const hallNumber = formatObj.baseHall + hallOffset;

    return `Hall ${hallNumber} (${formatObj.typeLabel})`;
  };

  const cinemaHall = getDynamicCinemaHall(
    movie?.id,
    selectedCinema,
    selectedFormat,
  );

  const isMovieActiveInTheaters = (releaseDateStr) => {
    if (!releaseDateStr) return true;
    const releaseDate = new Date(releaseDateStr);
    const now = new Date();

    const diffTime = now - releaseDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    return diffDays >= 0 && diffDays <= 30;
  };

  const isExpired = movie
    ? !isMovieActiveInTheaters(movie.release_date)
    : false;

  const isTimePassed = (dateStr, timeStr) => {
    if (dateStr !== "Today") return false;

    const now = new Date();
    const [hours, minutes] = timeStr.split(":").map(Number);
    const showtimeDate = new Date();
    showtimeDate.setHours(hours, minutes, 0, 0);

    return now > showtimeDate;
  };

  const calculateShowtimeTimestamp = (dateStr, timeStr) => {
    const now = new Date();
    const [hours, minutes] = timeStr.split(":").map(Number);
    let targetDate = new Date();

    if (dateStr === "Today") {
      targetDate.setHours(hours, minutes, 0, 0);
    } else if (dateStr === "Tomorrow") {
      targetDate.setDate(now.getDate() + 1);
      targetDate.setHours(hours, minutes, 0, 0);
    } else {
      targetDate.setHours(hours, minutes, 0, 0);
    }

    return targetDate.toISOString();
  };

  const buildShowId = (movieId, cinema, formatId, date, time) => {
    const safeCinema = cinema.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const safeDate = date.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const safeTime = time.replace(":", "");
    return `${movieId}_${safeCinema}_${formatId}_${safeDate}_${safeTime}`;
  };

  useEffect(() => {
    if (selectedDate === "Today" && isTimePassed("Today", selectedTime)) {
      const nextAvailableTime = showtimes.find(
        (t) => !isTimePassed("Today", t),
      );
      if (nextAvailableTime) {
        setSelectedTime(nextAvailableTime);
      }
    }
  }, [selectedDate]);

  useEffect(() => {
    if (!movie || !isOpen || !db || isExpired) return;

    const showId = buildShowId(
      movie.id,
      selectedCinema,
      selectedFormat.id,
      selectedDate,
      selectedTime,
    );

    let unsubscribe = () => {};

    try {
      const bookingsRef = collection(db, "shows", showId, "bookings");

      unsubscribe = onSnapshot(
        bookingsRef,
        (snapshot) => {
          const taken = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.seats && Array.isArray(data.seats)) {
              taken.push(...data.seats);
            }
          });
          setBookedSeats(taken);
        },
        (error) => {
          console.warn("Firestore permissions note:", error.message);
        },
      );
    } catch (err) {
      console.error("Firestore attachment error:", err);
    }

    return () => unsubscribe();
  }, [
    movie,
    selectedCinema,
    selectedFormat,
    selectedDate,
    selectedTime,
    isOpen,
    isExpired,
  ]);

  if (!isOpen || !movie) return null;

  const toggleSeat = (seatId) => {
    if (isExpired || bookedSeats.includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      if (selectedSeats.length >= 6) {
        alert("Maximum 6 seats per transaction");
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((sum, seatId) => {
      const rowLetter = seatId.charAt(0);
      const rowConfig = seatRows.find((r) => r.row === rowLetter);
      const seatType = SEAT_TYPES[rowConfig?.type || "NORMAL"];
      return sum + seatType.price + selectedFormat.priceMultiplier;
    }, 0);
  };

  const totalPrice = calculateTotal();

  const handleCheckout = () => {
    if (isExpired || selectedSeats.length === 0) return;

    if (!activeUser) {
      onClose();
      if (typeof onRequireAuth === "function") {
        onRequireAuth();
      } else {
        alert("Please sign in to proceed with checkout.");
      }
      return;
    }

    const showtimeTimestamp = calculateShowtimeTimestamp(
      selectedDate,
      selectedTime,
    );

    const showId = buildShowId(
      movie.id,
      selectedCinema,
      selectedFormat.id,
      selectedDate,
      selectedTime,
    );

    const bookingDetails = {
      showId: showId,
      movieId: movie.id,
      movieTitle: movie.title,
      posterPath: movie.poster_path,
      cinema: selectedCinema,
      branch: selectedCinema,
      format: selectedFormat.name,
      date: selectedDate,
      time: selectedTime,
      showtime: selectedTime,
      showtimeTimestamp: showtimeTimestamp,
      hall: cinemaHall,
      seats: selectedSeats,
      totalAmount: totalPrice,
      createdAt: new Date().toISOString(),
      bookingId:
        "PC-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
    };

    if (typeof onProceedToPayment === "function") {
      onProceedToPayment(bookingDetails);
    } else {
      alert(
        `Pass Generated for ${movie.title}! Total Amount: $${totalPrice.toFixed(2)}`,
      );
      onClose();
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
      >
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎬</span>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">{movie.title}</h2>
              <p className="text-xs text-zinc-400">
                {cinemaHall} • Select Experience, Date & Seats
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {isExpired && (
          <div className="bg-rose-500/10 border-b border-rose-500/20 px-6 py-3 text-rose-400 text-xs font-semibold text-center shrink-0">
            🚫 Booking Closed: This movie premiered over 1 month ago and is no
            longer available for theater tickets.
          </div>
        )}

        <div className="overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                1. Select Cinema Location (Prince Cinema)
              </label>
              <select
                disabled={isExpired}
                value={selectedCinema}
                onChange={(e) => {
                  setSelectedCinema(e.target.value);
                  setSelectedSeats([]);
                }}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {princeCinemas.map((cinema) => (
                  <option
                    key={cinema.id}
                    value={cinema.name}
                    className="bg-zinc-900 text-zinc-100"
                  >
                    📍 {cinema.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-3">
                2. Select Cinema Experience
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {cinemaFormats.map((fmt) => (
                  <button
                    key={fmt.id}
                    disabled={isExpired}
                    onClick={() => {
                      setSelectedFormat(fmt);
                      setSelectedSeats([]);
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all flex flex-col items-center justify-center gap-0.5 ${
                      selectedFormat.id === fmt.id
                        ? "bg-amber-500 text-zinc-950 border-amber-500 font-bold shadow-md shadow-amber-500/20"
                        : "bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:border-zinc-600"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span>{fmt.name}</span>
                    {fmt.priceMultiplier > 0 && (
                      <span className="text-[10px] opacity-80">
                        (+${fmt.priceMultiplier.toFixed(2)})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-3">
                3. Select Date
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {dates.map((d) => (
                  <button
                    key={d}
                    disabled={isExpired}
                    onClick={() => {
                      setSelectedDate(d);
                      setSelectedSeats([]);
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all ${
                      selectedDate === d
                        ? "bg-amber-500 text-zinc-950 border-amber-500 font-bold shadow-md shadow-amber-500/20"
                        : "bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:border-zinc-600"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-3">
                4. Select Showtime
              </label>
              <div className="flex flex-wrap gap-2">
                {showtimes.map((t) => {
                  const passed = isTimePassed(selectedDate, t) || isExpired;
                  const isSelected = selectedTime === t;

                  return (
                    <button
                      key={t}
                      disabled={passed}
                      onClick={() => {
                        setSelectedTime(t);
                        setSelectedSeats([]);
                      }}
                      className={`py-2 px-4 rounded-xl text-xs font-medium border transition-all relative ${
                        passed
                          ? "bg-zinc-950/80 border-zinc-800/80 text-zinc-600 cursor-not-allowed line-through opacity-60"
                          : isSelected
                            ? "bg-amber-500 text-zinc-950 border-amber-500 font-bold shadow-md shadow-amber-500/20"
                            : "bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:border-zinc-600"
                      }`}
                    >
                      {t}
                      {passed && (
                        <span className="ml-1.5 text-[9px] no-underline font-normal text-rose-500/80">
                          🔒
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-3">
                5. Choose Seats ({selectedSeats.length}/6)
              </label>

              <div className="mb-6 text-center">
                <div className="h-2 w-3/4 mx-auto bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full shadow-[0_4px_20px_rgba(245,158,11,0.5)]"></div>
                <span className="text-[10px] text-zinc-500 tracking-widest uppercase block mt-1">
                  SCREEN ({cinemaHall})
                </span>
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                {seatRows.map(({ row, type }) => {
                  const tier = SEAT_TYPES[type];
                  const adjustedPrice =
                    tier.price + selectedFormat.priceMultiplier;

                  return (
                    <div
                      key={row}
                      className="flex items-center justify-center gap-2"
                    >
                      <span className="w-4 text-xs font-bold text-zinc-500 text-right">
                        {row}
                      </span>
                      <div className="flex gap-1.5">
                        {Array.from({ length: seatsPerRow }).map((_, idx) => {
                          const seatNum = idx + 1;
                          const seatId = `${row}${seatNum}`;
                          const isBooked =
                            bookedSeats.includes(seatId) || isExpired;
                          const isSelected = selectedSeats.includes(seatId);

                          let seatStyle = `border ${tier.color} hover:border-amber-400`;

                          if (isBooked)
                            seatStyle =
                              "bg-zinc-950 text-zinc-700 border-zinc-900 cursor-not-allowed line-through";
                          if (isSelected)
                            seatStyle =
                              "bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-md shadow-amber-500/30";

                          return (
                            <button
                              key={seatId}
                              disabled={isBooked}
                              onClick={() => toggleSeat(seatId)}
                              className={`w-7 h-7 rounded-lg text-[10px] flex items-center justify-center transition-all ${seatStyle}`}
                              title={`${row}${seatNum} - ${tier.label} ($${adjustedPrice.toFixed(2)})`}
                            >
                              {seatNum}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-zinc-800/80 text-[11px] text-zinc-400">
                <div className="flex items-center justify-center gap-1.5 bg-blue-950/20 py-1.5 rounded-lg border border-blue-500/20">
                  <div className="w-3 h-3 rounded border border-blue-500/50 bg-blue-950/30"></div>
                  <span>
                    Normal ($
                    {(
                      SEAT_TYPES.NORMAL.price + selectedFormat.priceMultiplier
                    ).toFixed(2)}
                    )
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1.5 bg-amber-950/20 py-1.5 rounded-lg border border-amber-500/20">
                  <div className="w-3 h-3 rounded border border-amber-500/50 bg-amber-950/30"></div>
                  <span>
                    VIP ($
                    {(
                      SEAT_TYPES.VIP.price + selectedFormat.priceMultiplier
                    ).toFixed(2)}
                    )
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1.5 bg-pink-950/20 py-1.5 rounded-lg border border-pink-500/20">
                  <div className="w-3 h-3 rounded border border-pink-500/50 bg-pink-950/30"></div>
                  <span>
                    Sweetbox ($
                    {(
                      SEAT_TYPES.SWEETBOX.price + selectedFormat.priceMultiplier
                    ).toFixed(2)}
                    )
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950/60 rounded-2xl p-5 border border-zinc-800/80 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider border-b border-zinc-800 pb-2">
                Order Summary
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Movie</span>
                  <span className="text-zinc-200 font-medium truncate max-w-[130px]">
                    {movie.title}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Cinema</span>
                  <span className="text-amber-400 font-medium truncate max-w-[130px]">
                    {selectedCinema}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Format</span>
                  <span className="text-amber-400 font-semibold">
                    {selectedFormat.name}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Showtime</span>
                  <span className="text-zinc-200 font-medium">
                    {selectedDate}, {selectedTime}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Cinema Hall</span>
                  <span className="text-zinc-200 font-medium">
                    {cinemaHall}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Selected Seats</span>
                  <span className="text-amber-400 font-bold">
                    {selectedSeats.length > 0
                      ? selectedSeats.join(", ")
                      : "None"}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-3 flex justify-between items-baseline">
                <span className="text-xs text-zinc-400 font-semibold">
                  Total Amount
                </span>
                <span className="text-2xl font-black text-amber-500">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              disabled={isExpired || selectedSeats.length === 0}
              onClick={handleCheckout}
              className="w-full mt-6 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isExpired ? "Booking Expired" : "Checkout & Generate Pass"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
