import "@/styles/globals.css";
import type { AppProps } from "next/app";
import NavBar from "@/components/common/NavBar";


import { ThemeProvider } from "@react95/core";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <NavBar />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
