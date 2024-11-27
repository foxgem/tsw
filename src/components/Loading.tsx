import panelStyles from "../css/panel.module.css";
interface LoadingProps {
  message: string;
}

export function Loading({ message }: LoadingProps) {
  return (
    <div className={panelStyles.tswLoadingContainer}>
      <div className={panelStyles.loadingSpinner} />
      <p>{message}...</p>
    </div>
  );
}
