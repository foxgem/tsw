import React from "react";

interface IconProps {
  children: React.ReactNode;
}

export default function IconWrapper({ children }: IconProps) {
  return <div className="iconWrapper">{children}</div>;
}
