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
  
  useEffect(() => {
    console.log("CHECK : _app : MOUNT");

    if (window.location.pathname !== "/" && window.location.pathname !== "/signup"){
      fetch(`${backendUrl}/auth/validity`, {
        headers: { authorization: `Bearer ${sessionStorage.getItem("accessToken")}` },
      }).then((res) => {
        if (res.status === 401) {
        window.location.href = "/";
        }
      });
    }   
    return () => {
      console.log("CHECK : _app : UNMOUNT");
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
