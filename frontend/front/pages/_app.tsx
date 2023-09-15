import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@react95/core";

import MainTaskBar from "@/components/common/MainTaskBar";
import TaskBar from "@/components/common/taskbar/TaskBar";
import React, { useEffect } from "react";
import { PageContext } from "@/context/PageContext";
import Cookies from "js-cookie";

export default function App({ Component, pageProps }: AppProps) {
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "failed";
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "failed";
  
  const handleWindowClose = (e: BeforeUnloadEvent) => {
    const tokenData = sessionStorage.getItem("accessToken");
    if (tokenData) {
      Cookies.set("accessToken", tokenData);
      navigator.sendBeacon(`${backendUrl}/auth/logoff`, null);
    }
  }
 
  useEffect(() => {
    console.log("CHECK : _app : MOUNT");
    window.addEventListener("beforeunload", handleWindowClose);
    return () => {
      console.log("CHECK : _app : UNMOUNT");
      window.removeEventListener("beforeunload", handleWindowClose);
    };
  });

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
