import type React from "react";

interface IconProps {
  children: React.ReactNode;
}

export default function IconWrapper({ children }: IconProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "9999px",
        cursor: "pointer",
        margin: "0 auto",
      }}
    >
      {children}
    </div>
  );
}
