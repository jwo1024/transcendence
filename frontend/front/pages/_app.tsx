import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@react95/core";

import MainTaskBar from "@/components/common/MainTaskBar";
import TaskBar from "@/components/common/TaskBar";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <div className=" scroll-auto">
      <Component {...pageProps} />
      </div>
      {/* <TaskBar /> */}
      <MainTaskBar />
    </ThemeProvider>
  );
}
