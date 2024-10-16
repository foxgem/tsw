import React from "react";
import logo from "data-base64:~assets/icon.png"
import { ThemeToggle } from "./ThemeToggle";

const Header: React.FC = () => {
  return (
    <div className="flex justify-between items-center flex-grow text-center py-2 px-5 h-[56px]">
      <div className="flex justify-start items-center">
        <img src={logo} className="w-6" />
        <p className="font-bold text-sm ml-1">TSW</p>
      </div>
      <div className="flex items-center">
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Header;
