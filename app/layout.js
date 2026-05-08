import "./globals.css";

export const metadata = {
  title: "SSP Travels — Premium Luxury Bus Travel Experience",
  description:
    "Experience cinematic luxury bus travel with SSP Travels. Book premium bus tickets across India with world-class comfort and service.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
