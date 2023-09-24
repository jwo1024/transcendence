import React from "react";
import Link from "next/link";

const NavBar: React.FC = () => {
  return (
    <nav className="bg-gray-500 m-2 p-2">
      <div>
        <Link href="/">
          <div className="text-right text-gray-100 font-bold pr-10">PONG</div>
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;
