import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@react95/core";

import MainTaskBar from "@/components/common/MainTaskBar";
import TaskBar from "@/components/common/taskbar/TaskBar";
import React from "react";
import { PageContext } from "@/context/PageContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <PageContext>
        <div className=" scroll-auto ">
          <Component {...pageProps} />
        </div>
        <TaskBar />
      </PageContext>
    </ThemeProvider>
  );
}
