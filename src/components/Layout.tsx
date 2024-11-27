import { ChevronLeft } from "lucide-react";
import type React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import IconWrapper from "./IconWrapper";

interface LayoutProps {
  title: string;
  footerPosition?: string;
  children: React.ReactNode;
  headerRightElement?: React.ReactNode;
}

export default function Layout({
  title,
  children,
  headerRightElement,
  footerPosition,
}: LayoutProps) {
  const navigate = useNavigate();
  return (
    <div className="w-[350px] min-h-[300px] max-h-[600px]">
      <div className="flex items-center justify-between px-5 py-2 border">
        <IconWrapper>
          <ChevronLeft size={20} onClick={() => navigate("/")} />
        </IconWrapper>
        <div className="flex-grow text-center">
          <p className="font-bold text-sm">{title}</p>
        </div>
        {headerRightElement ? headerRightElement : <div className="w-10" />}
      </div>
      <div className="px-5"> {children}</div>

      <Footer />
    </div>
  );
}
