import { Button } from "./button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string | React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "danger";
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger",
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="w-[400px] whitespace-pre-wrap break-words text-sm">
            {description}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onCancel?.();
                onOpenChange(false);
              }}
            >
              {cancelText}
            </Button>
            <Button variant={confirmVariant} onClick={onConfirm}>
              {confirmText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
