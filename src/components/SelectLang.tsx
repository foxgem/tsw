import styles from "~/css/wrapper.module.css";
import { LANG_LIST } from "~/utils/constants";

interface selectLangProps {
  lang?: string;
  onLanguageChange: (language: string) => void;
}

export default function SelectLang({
  lang = "Java",
  onLanguageChange,
}: selectLangProps) {
  return (
    <div className={styles.langContainer}>
      {LANG_LIST.map((language) => (
        <button
          type="button"
          className={styles.tswSelectLangItem}
          key={language}
          onClick={() => onLanguageChange(language)}
        >
          {language}
        </button>
      ))}
    </div>
  );
}
