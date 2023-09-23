import "@/styles/globals.css";
import { ThemeProvider } from "@react95/core";
import type { AppProps } from "next/app";
import { useRouter } from 'next/router';

import TaskBar from "@/components/common/taskbar/TaskBar";
import React, { useEffect } from "react";
import { PageContext } from "@/context/PageContext";
import Cookies from "js-cookie";

export default function App({ Component, pageProps }: AppProps) {
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "failed";
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "failed";
  const router = useRouter();

  useEffect(() => {
    console.log("App : Mount");
    console.log("App : router.asPath", router.asPath);
    if (window.location.pathname !== "/" && window.location.pathname !== "/signup"){
      fetch(`${backendUrl}/auth/validity`, {
        headers: { authorization: `Bearer ${sessionStorage.getItem("accessToken")}` },
      }).then((res) => {
        if (res.status === 401) {
        window.location.href = "/";
        }
      }).catch((err) => {
        console.log("_app.tsx : fetch failed",err);
      });
    }
    return () => {
      console.log("App : Unmount");
    }
  }, [router.asPath]);

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
