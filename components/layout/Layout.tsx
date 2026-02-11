import React, { ReactNode } from "react";
import Header from "../header/Header";
import Footer from "../footer/Footer";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col justify-between">
      <div>
        <Header />
        {children}
      </div>
      <Footer />
    </div>
  );
}
