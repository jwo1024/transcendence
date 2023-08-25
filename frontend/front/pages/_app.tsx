import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@react95/core";

import MainTaskBar from "@/components/common/MainTaskBar";


export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <div className=" scroll-auto">
      <Component {...pageProps} />
      </div>
      <MainTaskBar />
    </ThemeProvider>
  );
}
