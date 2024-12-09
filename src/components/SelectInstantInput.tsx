import textselectStyles from "../css/textselect.module.css";
import { DropdownMenuItem } from "./ui/dropdown-menu";

interface SelectInstantInputProps {
  instantInputs: string[];
  onSelect: (instantInput: string) => void;
}

export function SelectInstantInput({
  instantInputs,
  onSelect,
}: SelectInstantInputProps) {
  return (
    <>
      {instantInputs.map((instantInput) => (
        <DropdownMenuItem
          key={instantInput}
          className={textselectStyles.tswActionItem}
          onClick={() => onSelect(instantInput)}
        >
          {instantInput}
        </DropdownMenuItem>
      ))}
    </>
  );
}
