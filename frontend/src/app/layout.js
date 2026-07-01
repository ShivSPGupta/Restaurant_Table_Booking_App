import "./globals.css";

export const metadata = {
  title: "Restaurant Booking System App",
  description: "Book restaurant tables and manage reservations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
