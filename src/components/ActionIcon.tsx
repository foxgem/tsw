export interface ActionIconProps {
  name: string;
}

export function ActionIcon({ name }: ActionIconProps) {
  return (
    <>
      {name === "Summary" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-list"
          aria-label={name}
          style={{ minWidth: "24px", width: "24px" }}
        >
          <title>{name} icon</title>
          <line x1="8" x2="21" y1="6" y2="6" />
          <line x1="8" x2="21" y1="12" y2="12" />
          <line x1="8" x2="21" y1="18" y2="18" />
          <line x1="3" x2="3.01" y1="6" y2="6" />
          <line x1="3" x2="3.01" y1="12" y2="12" />
          <line x1="3" x2="3.01" y1="18" y2="18" />
        </svg>
      )}
      {name === "Chat" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-message-square-text"
          aria-label={name}
          style={{ minWidth: "24px", width: "24px" }}
        >
          <title>{name} icon</title>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M13 8H7" />
          <path d="M17 12H7" />
        </svg>
      )}
      {name === "History" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-history"
          aria-label={name}
          style={{ minWidth: "24px", width: "24px" }}
        >
          <title>{name} icon</title>
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M12 7v5l4 2" />
        </svg>
      )}
      {name === "Wand" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-wand rotate"
          aria-label={name}
          style={{ minWidth: "24px", width: "24px" }}
        >
          <title>{name} icon</title>
          <path d="M15 4V2" />
          <path d="M15 16v-2" />
          <path d="M8 9h2" />
          <path d="M20 9h2" />
          <path d="M17.8 11.8 19 13" />
          <path d="M15 9h.01" />
          <path d="M17.8 6.2 19 5" />
          <path d="m3 21 9-9" />
          <path d="M12.2 6.2 11 5" />
        </svg>
      )}

      {name === "Close" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-chevron-right"
          aria-label={name}
          style={{ minWidth: "24px", width: "24px" }}
        >
          <title>{name} icon</title>
          <path d="m9 18 6-6-6-6" />
        </svg>
      )}

      {name === "Explain" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-message-square-more"
          aria-label={name}
        >
          <title>{name} icon</title>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 10h.01" />
          <path d="M12 10h.01" />
          <path d="M16 10h.01" />
        </svg>
      )}
      {name === "Rewrite" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-clipboard-pen-line"
          aria-label={name}
        >
          <title>{name} icon</title>
          <rect width="8" height="4" x="8" y="2" rx="1" />
          <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-.5" />
          <path d="M16 4h2a2 2 0 0 1 1.73 1" />
          <path d="M8 18h1" />
          <path d="M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
        </svg>
      )}

      {name === "Logo" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="36"
          height="36"
          viewBox="0 0 100 100"
          aria-label={name}
        >
          <title>{name} icon</title>
          <circle cx="50" cy="50" r="45" fill="#4A90E2" />
          <rect x="30" y="25" width="40" height="45" rx="7" fill="white" />
          <line
            x1="50"
            y1="12"
            x2="50"
            y2="25"
            stroke="white"
            strokeWidth="4"
          />
          <circle cx="50" cy="10" r="3" fill="white" />
          <circle cx="40" cy="40" r="4" fill="#4A90E2" />
          <circle cx="60" cy="40" r="4" fill="#4A90E2" />
          <path
            d="M 38 55 Q 50 65 62 55"
            stroke="#4A90E2"
            strokeWidth="3"
            fill="none"
          />
        </svg>
      )}

      {name === "OCR" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-eye"
        >
          <title>{name} icon</title>
          <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}

      {name === "Translate" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-languages"
        >
          <title>{name} icon</title>
          <path d="m5 8 6 6" />
          <path d="m4 14 6-6 2-3" />
          <path d="M2 5h12" />
          <path d="M7 2h1" />
          <path d="m22 22-5-10-5 10" />
          <path d="M14 18h6" />
        </svg>
      )}

      {name === "User" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-user-round tsw-small-icon"
        >
          <circle cx="12" cy="8" r="5" />
          <path d="M20 21a8 8 0 0 0-16 0" />
        </svg>
      )}
      {name === "Assistant" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="36"
          height="36"
          viewBox="0 0 100 100"
          aria-label={name}
        >
          <title>{name} icon</title>
          <circle cx="50" cy="50" r="45" fill="#4A90E2" />
          <rect x="30" y="25" width="40" height="45" rx="7" fill="white" />
          <line
            x1="50"
            y1="12"
            x2="50"
            y2="25"
            stroke="white"
            strokeWidth="4"
          />
          <circle cx="50" cy="10" r="3" fill="white" />
          <circle cx="40" cy="40" r="4" fill="#4A90E2" />
          <circle cx="60" cy="40" r="4" fill="#4A90E2" />
          <path
            d="M 38 55 Q 50 65 62 55"
            stroke="#4A90E2"
            strokeWidth="3"
            fill="none"
          />
        </svg>
      )}
    </>
  );
}
