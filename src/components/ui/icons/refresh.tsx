"use client";

import { motion, useAnimation } from "framer-motion";

const RefreshIcon = ({ size = 28, className }: IconProps) => {
  const controls = useAnimation();
  return (
    <div
      className={className}
      onMouseEnter={() => controls.start("animate")}
      onMouseLeave={() => controls.start("normal")}
    >
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        transition={{ type: "spring", stiffness: 250, damping: 25 }}
        variants={{
          normal: {
            rotate: "0deg",
          },
          animate: {
            rotate: "-50deg",
          },
        }}
        animate={controls}
      >
        <title>Refresh</title>
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 16h5v5" />
      </motion.svg>
    </div>
  );
};

export { RefreshIcon };
