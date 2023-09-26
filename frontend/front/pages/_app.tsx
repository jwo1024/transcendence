import "@/styles/globals.css";
import { ThemeProvider } from "@react95/core";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";

import TaskBar from "@/components/common/taskbar/TaskBar";
import React, { useEffect, useState } from "react";
import { PageContext } from "@/context/PageContext";

export default function App({ Component, pageProps }: AppProps) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "failed";
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<string>("");

  useEffect(() => {
    if (
      window.location.pathname !== "/" &&
      window.location.pathname !== "/signup"
    ) {
      const token = sessionStorage.getItem("accessToken");
      fetch(`${backendUrl}/auth/validity`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (res.status === 401) {
            fetch(`${backendUrl}/auth/logoff`, {
              headers: {
                authorization: `Bearer ${token}`
            }
          });
            window.location.href = "/";
          }
        })
        .catch((err) => {
          console.log("_app.tsx : fetch failed", err);
        });
    }
    if (router.asPath === "/") {
      setCurrentPage("Desktop");
    } else if (router.asPath === "/signup") {
      setCurrentPage("Sign Up");
    } else if (router.asPath === "/login") {
      setCurrentPage("Log In");
    } else if (router.asPath === "/game") {
      setCurrentPage("Game");
    } else if (router.asPath === "/menu") {
      setCurrentPage("Menu");
    } else if (router.asPath === "/chat") {
      setCurrentPage("Chat");
    } else if (router.asPath === "/profile") {
      setCurrentPage("Profile");
    } else {
      setCurrentPage("Desktop");
    }
    return () => {};
  }, [router.asPath]);

  return (
    <ThemeProvider>
      <PageContext>
        <div className=" scroll-auto ">
          <Component {...pageProps} />
        </div>
        <TaskBar currentPage={currentPage} />
      </PageContext>
    </ThemeProvider>
  );
}
