import "./globals.css";
// import { Providers } from "./page";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* <Providers>{children}</Providers> */}
        <>{children}</>
      </body>
    </html>
  );
}
