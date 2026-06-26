import { Inter } from "next/font/google";
import "./globals.css";
import { StatsProvider } from "./StatsContext";
import { TooltipProvider } from "@/components/ui/tooltip";


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "InstaWrapped",
  description: "Open Source, Easy to use Instagram data package explorer",
  icons: {
    icon: '/logo.png'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="https://pro.fontawesome.com/releases/v6.0.0-beta2/css/all.css" />

        <meta name="theme-color" content="#0066ff" />
        <meta name="msapplication-TileColor" content="#0066ff" />
        <meta name="title" content="InstaWrapped" />
        <meta name="description" content="Open Source, Easy to use Instagram data package explorer" />
        <meta name="keywords"
          content="instagram, meta, facebook, instagram stats, instagram wrapped, spotify wrapped, programming, pop cat, pop cat api, pop cat discord bot" />
        <meta name="language" content="English" />
        <meta name="author" content="InstaWrapped" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://instawrapped.popcat.xyz" />
        <meta property="og:title" content="InstaWrapped" />
        <meta property="og:description" content="Open Source, Easy to use Instagram data package explorer" />
        <meta property="og:image" content="/meta-img.png" />
        <meta property="twitter:card" content="summary_large_image" />
        <title>InstaWrapped</title>
      </head>
      <body className={inter.className}><StatsProvider><TooltipProvider>{children}</TooltipProvider></StatsProvider></body>
    </html>
  );
}
