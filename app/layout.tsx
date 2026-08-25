import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maximiliano López Montaño — Software Engineer",
  description: "Software engineer, indie app developer, and game developer in Monterrey, Mexico.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
