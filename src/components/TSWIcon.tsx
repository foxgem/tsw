import type React from "react";

interface IconProps {
  children: React.ReactNode;
}

export default function TSWIcon({ children }: IconProps) {
  return <div className="iconWrapper">{children}</div>;
}
