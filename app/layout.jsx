import "./globals.css";

export const metadata = {
  title: "Feng Hotpot · Taste the Legend",
  description:
    "Authentic Sichuan hot pot in Sunnyvale. Signature red-oil málà broth. Join the loyalty program, skip the wait, and taste the legend.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bagel+Fat+One&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
