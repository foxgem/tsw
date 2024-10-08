import React from "react";

import { Ellipsis, Info } from 'lucide-react';

import logo from "data-base64:~assets/icon.png"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import TSWIcon from "./TSWIcon";
import { ThemeToggle } from "./ThemeToggle";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const navigate = useNavigate()
  return (
    <div className="flex justify-between items-center flex-grow text-center py-2 px-5 h-[56px]">
      <div className="flex justify-start items-center">
        <img src={logo} className="w-6" />
        <p className="font-bold text-sm ml-1">TSW</p>
      </div>
      <div className="flex items-center">
        <ThemeToggle />
        <Menubar className="border-0">
          <MenubarMenu>
            <MenubarTrigger className="w-9 h-9" >
              <TSWIcon>
                <Ellipsis size={24} />
              </TSWIcon>
            </MenubarTrigger>
            <MenubarContent className="border-border bg-popover rounded-[16px] -right-12 -top-3 fixed p-3 ">
              <MenubarItem className="focus:bg-item rounded-full flex cursor-pointer p-4 h-10" onClick={() => navigate("/about", {})}>
                <Info className="mr-2" />About
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    </div>
  );
};

export default Header;
