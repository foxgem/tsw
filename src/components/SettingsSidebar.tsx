import { cn } from "~lib/utils";
import "../css/extention.css";
import { Key, NotebookIcon, TimerReset } from "lucide-react";
const links = [
  { key: "timers", label: "Site Timers", icon: <TimerReset size="20" /> },
  { key: "keys", label: "Service Settings", icon: <Key size="20" /> },
  {
    key: "instant-inputs",
    label: "Instant Inputs",
    icon: <NotebookIcon size="20" />,
  },
];

interface SettingsSidebarProps {
  onSelect?: (key: string) => void;
  selected?: string;
}
export function SettingsSidebar({ onSelect, selected }: SettingsSidebarProps) {
  return (
    <nav className="space-y-1 w-1/4 ">
      {links.map((link) => (
        <div
          onClick={() => onSelect?.(link.key)}
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left cursor-pointer gap-2",
            selected === link.key
              ? "bg-secondary text-secondary-foreground"
              : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
          )}
        >
          {link.icon} {link.label}
        </div>
      ))}
    </nav>
  );
}
