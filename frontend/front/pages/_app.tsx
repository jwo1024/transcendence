import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@react95/core";

import NavBar from "@/components/common/NavBar";
import MainTaskBar from "@/components/common/MainTaskBar";


export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <NavBar />
      <Component {...pageProps} />
      <MainTaskBar />
    </ThemeProvider>
  );
}
