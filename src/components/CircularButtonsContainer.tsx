import TSWIcon from "@/components/TSWIcon";
import { LOGO_SVG } from "@/utils/constants";
import { AnimatePresence, motion } from "framer-motion";
import React, { useRef, useEffect } from "react";

interface IconBtn {
  name: string;
  svg: string;
  action: () => void;
}

interface CircularButtonsProps {
  id: string;
  iconBtns: IconBtn[];
}

const CircularButtonsContainer: React.FC<CircularButtonsProps> = ({ id, iconBtns }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => setIsOpen(!isOpen);

  const calculateFanRadius = (count: number) => Math.max(100, count * 20);
  const fanRadius = calculateFanRadius(iconBtns.length);
  const buttonSize = 48;
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div id={id} ref={containerRef}>
      <motion.div
        style={{
          position: "fixed",
          top: "50%",
          right: buttonSize / 2,
          transform: "translateY(-50%)",
          zIndex: 10001,
        }}
        whileHover={{ right: 48 }}
        onHoverStart={() => setIsOpen(true)}
      >
        <motion.button
          onClick={(e) => {
            toggleOpen();
            e.stopPropagation();
          }}
          style={{
            width: buttonSize,
            height: buttonSize*2,
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderTopLeftRadius: "10px",
            borderBottomLeftRadius: "10px",
            cursor: "pointer",
            position: "absolute",
            top: 0,
            left: 0,
            padding: 0,
            overflow: "hidden",
          }}
          whileHover={{ scale: 1 }}
          whileTap={{ scale: 1 }}
        >
          TSW
          <TSWIcon>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="100%"
              height="100%"
              fill="currentColor"
              dangerouslySetInnerHTML={{ __html: LOGO_SVG }}
            />
          </TSWIcon>
        </motion.button>
      </motion.div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: "50%",
              right: buttonSize + 20,
              zIndex: 10001,
            }}
          >
            {iconBtns.map((icon, index) => (
              <motion.button
                key={icon.name}
                onClick={() => {
                  icon.action();
                  setIsOpen(false);
                }}
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                  position: "absolute",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{
                  x: isOpen
                    ? -fanRadius * Math.cos((index * Math.PI) / (2 * (iconBtns.length - 1)))
                    : 0,
                  y: isOpen
                    ? -fanRadius * Math.sin((index * Math.PI) / (2 * (iconBtns.length - 1)))
                    : 0,
                  opacity: 1,
                }}
                exit={{
                  x: 0,
                  y: 0,
                  opacity: 0,
                  transition: { duration: 0.2 },
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                whileHover={{
                  scale: 1.1,
                  backgroundColor: "#0056b3",
                  boxShadow: "0 0 0 2px rgba(0, 123, 255, 0.5)",
                }}
                whileTap={{ scale: 0.9 }}
              >

                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  dangerouslySetInnerHTML={{ __html: icon.svg }}
                />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CircularButtonsContainer;
