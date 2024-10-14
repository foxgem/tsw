import React from "react";
import { LANG_LIST } from "@/utils/constants";
interface selectLangProps {
    lang?: string;
    onLanguageChange: (language: string) => void;
}

export default function SelectLang({ lang = "Java", onLanguageChange }: selectLangProps) {


    return (
        <div className="lang-container">
            {LANG_LIST.map((language) => (
                <div className="tsw-select-lang-item" key={language} onClick={()=>onLanguageChange(language)}>
                    {language}
                </div>
            ))}
        </div>
    );
};

