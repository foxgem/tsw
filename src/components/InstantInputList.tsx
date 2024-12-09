import { motion } from "framer-motion";
import styles from "~/css/instantInputs.module.css";

interface InstantInputsProps {
  label: string;
  onSelect: (message: string) => void;
  instantInputs: string[];
}

export function InstantInputList({
  label,
  onSelect,
  instantInputs,
}: InstantInputsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.container}
    >
      <div>
        <motion.div
          className={styles.titleContain}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className={styles.title}>{label}</h2>
          <span className={styles.sparkle}>✨</span>
        </motion.div>

        <div className={styles.InstantInputsContainer}>
          {instantInputs.map((instantInput, index) => (
            <motion.button
              key={instantInput}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelect(instantInput)}
              className={styles.instantInputButton}
            >
              {instantInput}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
