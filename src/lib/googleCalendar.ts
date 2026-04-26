export function buildGoogleCalendarUrl(event: {
  title: string;
  description: string;
  date: string; // format: "YYYY-MM-DD"
  city: string;
  state?: string;
}): string {
  const BASE_URL = "https://calendar.google.com/calendar/render";

  const [year, month, day] = event.date.split("-").map(Number);
  const startDate = new Date(year, month - 1, day);
  const endDate = new Date(year, month - 1, day + 1);

  const formatDate = (d: Date): string => {
    const y = d.getFullYear().toString();
    const m = (d.getMonth() + 1).toString().padStart(2, "0");
    const dd = d.getDate().toString().padStart(2, "0");
    return `${y}${m}${dd}`;
  };

  const dates = `${formatDate(startDate)}/${formatDate(endDate)}`;
  const location = event.state ? `${event.city}, ${event.state}` : event.city;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates,
    details: event.description,
    location,
  });

  return `${BASE_URL}?${params.toString()}`;
}
