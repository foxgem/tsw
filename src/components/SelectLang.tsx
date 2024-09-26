import React from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { LANG_LIST } from "@/utils/constants";
interface selectLangProps {
  lang?: string;
  onLanguageChange: (language: string) => void;
}

export default function SelectLang({ lang = "Java", onLanguageChange }: selectLangProps) {


  return (
    <Select defaultValue={lang} onValueChange={onLanguageChange}>
      <SelectTrigger className="tsw-select-trigger">
        <span>Language: </span>
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent className="tsw-select-content">
        <SelectGroup>
          {LANG_LIST.map((language) => (
            <SelectItem key={language} value={language} className="tsw-select-item">
              {language}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

