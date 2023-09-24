import React from "react";
import Link from "next/link";
import { Button } from "@react95/core";

interface ButtonProps {
  to: string;
  children: React.ReactNode;
}

const LinkButton: React.FC<ButtonProps> = ({ to, children }) => {
  return (
    <div className="flex justify-center items-center">
      <Link href={to}>
        <Button className=" w-40 h-20">{children}</Button>
      </Link>
    </div>
  );
};

export default LinkButton;
