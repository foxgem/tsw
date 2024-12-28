import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";

export interface KnowledgeCardData {
  title: string;
  keywords: string[];
  keyPoints: string[];
  originalLink: string;
  references: {
    tools?: { title: string; link: string }[];
    attachments: { title: string; link: string }[];
  };
}

interface KnowledgeCardProps {
  data: KnowledgeCardData;
}

const styles = {
  container: {
    width: "95%",
    margin: "0 auto",
    height: "600px",
    perspective: "1000px",
  },
  cardWrapper: {
    position: "relative",
    width: "100%",
    height: "100%",
    transformStyle: "preserve-3d",
    borderRadius: "20px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    overflow: "auto",
  },
  cardSide: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
    borderRadius: "20px",
    backgroundColor: "white",
    transition: "transform 0.6s ease-in-out",
  },
  cardHeader: {
    padding: "10px",
    backgroundImage:
      "linear-gradient(to right, rgb(221 214 254), rgb(251 207 232))",
  },
  cardHeaderDark: {
    backgroundImage:
      "linear-gradient(to right, rgb(76 29 149), rgb(131 24 67))",
  },
  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "rgb(51, 51, 51)",
  },
  cardContent: {
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    overflowY: "scroll",
    maxHeight: "calc(100% - 80px)",
    fontSize: "14px",
  },
  section: {
    marginBottom: "8px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "rgb(51, 51, 51)",
    margin: "5px",
  },
  keywordContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  pointsList: {
    listStyle: "disc",
    listStylePosition: "inside",
    color: "rgb(115, 115, 115)",
  },
  listItem: {
    marginBottom: "4px",
  },
  link: {
    color: "rgb(37 99 235)",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  originallink: {
    display: "inline-flex",
    alignItems: "center",
    color: "rgb(37 99 235)",
    "&:hover": {
      textDecoration: "underline",
    },
    justifyContent: "flex-end",
    width: "100%",
  },
  linkIcon: {
    marginLeft: "4px",
    width: "16px",
    height: "16px",
  },
  backHeader: {
    padding: "10px",
    backgroundImage:
      "linear-gradient(to right, rgb(167 243 208), rgb(153 246 228))",
  },
  backHeaderDark: {
    backgroundImage: "linear-gradient(to right, rgb(6 78 59), rgb(19 78 74))",
  },
  backSide: {
    transform: "rotateY(180deg)",
  },
  referencesList: {
    listStyle: "decimal",
    listStylePosition: "inside",
    color: "rgb(115, 115, 115)",
  },
  badge: {
    padding: "2px 8px",
    borderRadius: "9999px",
    backgroundColor: "rgb(243, 244, 246)",
    color: "rgb(59 130 246)",
    fontSize: "14px",
  },
  button: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "4px",
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.1)",
    },
  },
  dotsContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    padding: "16px",
    alignItems: "center",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#111827",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  activeDot: {
    width: "9px",
    height: "9px",
    backgroundColor: "transparent",
    border: "2px solid #111827",
  },
} as const;

const KnowledgeCard: React.FC<KnowledgeCardProps> = ({ data }) => {
  const [currentCard, setCurrentCard] = useState(0);
  const { title, keyPoints, keywords, references, originalLink } = data;
  const [mounted, setMounted] = useState(false); // 添加mounted状态

  useEffect(() => {
    setMounted(true);
  }, []);
  const totalCards =
    1 +
    (references?.tools?.length ? 1 : 0) +
    (references?.attachments?.length ? 1 : 0);

  const handleCardChange = (index: number) => {
    setCurrentCard(index);
  };

  const getCardStyle = (cardIndex: number): React.CSSProperties => {
    return {
      ...styles.cardSide,
      opacity: mounted ? (currentCard === cardIndex ? 1 : 0) : 0,
      transform: `scale(${mounted ? (currentCard === cardIndex ? 1 : 0.9) : 0.9})`,
      transition: mounted ? "all 0.3s ease-in-out" : "none",
      visibility: Math.abs(currentCard - cardIndex) <= 1 ? "visible" : "hidden",
      position: "absolute",
      pointerEvents: currentCard === cardIndex ? "auto" : "none",
    };
  };

  return (
    <div style={styles.container}>
      <div style={styles.cardWrapper}>
        {/* Main Card */}
        <div style={getCardStyle(0)}>
          <div style={styles.cardHeader}>
            <div style={styles.headerContent}>
              <h2 style={styles.title}>{title}</h2>
            </div>
          </div>
          {/* Main Card Content */}
          <div style={styles.cardContent}>
            <div style={styles.section}>
              <div style={styles.keywordContainer}>
                {keywords.map((keyword) => (
                  <span key={keyword} style={styles.badge}>
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Key Points</h3>
              <ul style={styles.pointsList}>
                {keyPoints.map((point) => (
                  <li key={point} style={styles.listItem}>
                    {point}
                  </li>
                ))}
              </ul>
              <a
                href={originalLink}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.originallink}
              >
                Original Link
                <ArrowUpRight style={styles.linkIcon} />
              </a>
            </div>
          </div>
        </div>

        {/* Tools Card */}
        {references?.tools?.length > 0 && (
          <div style={getCardStyle(1)}>
            <div style={styles.backHeader}>
              <div style={styles.headerContent}>
                <h2 style={styles.title}>{title}</h2>
              </div>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Tools</h3>
                <ul style={styles.referencesList}>
                  {references.tools.map((tool) => (
                    <li key={tool.title} style={styles.listItem}>
                      <a
                        href={tool.link}
                        target="_blank"
                        style={styles.link}
                        rel="noreferrer"
                      >
                        {tool.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Attachments Card */}
        {references?.attachments?.length > 0 && (
          <div style={getCardStyle(references?.tools?.length ? 2 : 1)}>
            <div
              style={{
                ...styles.backHeader,
                backgroundImage:
                  "linear-gradient(to right, rgb(147 197 253), rgb(196 181 253))",
              }}
            >
              <div style={styles.headerContent}>
                <h2 style={styles.title}>{title}</h2>
              </div>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>References</h3>
                <ul style={styles.referencesList}>
                  {references.attachments.map((attachment) => (
                    <li key={attachment.title} style={styles.listItem}>
                      <a
                        href={attachment.link}
                        target="_blank"
                        style={styles.link}
                        rel="noreferrer"
                      >
                        {attachment.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* navigation */}
      {totalCards > 1 && (
        <div style={styles.dotsContainer}>
          {["main", "tools", "attachments"]
            .slice(0, totalCards)
            .map((type, index) => (
              <div
                key={type}
                style={{
                  ...styles.dot,
                  ...(currentCard === index ? styles.activeDot : {}),
                }}
                onClick={() => handleCardChange(index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleCardChange(index);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Go to card ${index + 1}`}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default KnowledgeCard;
