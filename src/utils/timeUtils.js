// src/utils/timeUtils.js

/**
 * Generates dynamic showtime options based on current time
 */
export const getDynamicShowtimes = () => {
  const now = new Date();
  const currentHour = now.getHours();

  // Standard daily schedule templates
  const baseSchedules = [
    { time: "10:30 AM", hour: 10, minute: 30, type: "2D 2D-SUB", price: 4.5 },
    { time: "01:15 PM", hour: 13, minute: 15, type: "3D ATMOS", price: 6.0 },
    { time: "04:00 PM", hour: 16, minute: 0, type: "VIP LUXURY", price: 10.0 },
    { time: "07:00 PM", hour: 19, minute: 0, type: "IMAX 3D", price: 8.5 },
    { time: "09:45 PM", hour: 21, minute: 45, type: "2D 2D-SUB", price: 4.5 },
  ];

  // Map each showtime to today's date or mark passed ones as expired
  return baseSchedules.map((slot) => {
    const showtimeDate = new Date();
    showtimeDate.setHours(slot.hour, slot.minute, 0, 0);

    const isExpired = now > showtimeDate;

    return {
      ...slot,
      dateString: showtimeDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      isoTimestamp: showtimeDate.toISOString(),
      isExpired,
      isAvailable: !isExpired,
    };
  });
};

/**
 * Check if a ticket/booking showtime has expired
 */
export const isBookingExpired = (showtimeIsoString) => {
  if (!showtimeIsoString) return false;
  const showtimeDate = new Date(showtimeIsoString);
  // Add 2 hours buffer for movie length before marking as completely expired
  showtimeDate.setHours(showtimeDate.getHours() + 2);
  return new Date() > showtimeDate;
};
