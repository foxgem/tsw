import { useEffect, useState } from "react";
import { ZodError } from "zod";
import { DeleteIcon } from "~components/ui/icons/delete";
import { FilePenLineIcon } from "~components/ui/icons/file-pen-line";
import { cn } from "~lib/utils";
import { TIMER_COUNT_LIMIT } from "~utils/constants";
import {
  type TimerForDomain,
  deleteTimerForDomain,
  getAllTimersForDomains,
  timerSchema,
  upsertTimerForDomain,
} from "~utils/storage";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function Timers() {
  const [domain, setDomain] = useState("");
  const [time, setTime] = useState<number>(300);
  const [error, setError] = useState<string>("");
  const [timerForDomains, setTimerForDomains] = useState<TimerForDomain[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [domainError, setDomainError] = useState<string | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [timerToDelete, setTimerToDelete] = useState<TimerForDomain | null>(
    null,
  );
  const [originalDomain, setOriginalDomain] = useState<string>("");

  useEffect(() => {
    loadTimerForDomains();
  }, []);

  const loadTimerForDomains = async () => {
    const timerForDomains: TimerForDomain[] = await getAllTimersForDomains();
    setTimerForDomains(timerForDomains);
  };

  const handleEdit = (timer: TimerForDomain) => {
    setIsEditing(true);
    setDomain(timer.domain);
    setOriginalDomain(timer.domain);
    setTime(timer.time);
    setError("");
    setIsAdding(true);
  };
  const resetError = () => {
    setDomainError(null);
    setTimeError(null);
  };
  const handleUpsertTimer = async () => {
    try {
      if (!isEditing && timerForDomains.length === TIMER_COUNT_LIMIT) {
        return;
      }

      if (
        isEditing &&
        domain !== originalDomain &&
        timerForDomains.length >= TIMER_COUNT_LIMIT
      ) {
        setError(
          `Cannot create new timer. Maximum limit of ${TIMER_COUNT_LIMIT} reached.`,
        );
        return;
      }

      resetError();
      timerSchema.parse({ domain: domain, time: time });

      await upsertTimerForDomain({ domain, time });
      await loadTimerForDomains();
      resetForm();
    } catch (e) {
      if (e instanceof ZodError) {
        for (const err of e.errors) {
          if (err.path.includes("domain")) {
            setDomainError(err.message);
          } else if (err.path.includes("time")) {
            setTimeError(err.message);
          }
        }
      } else {
        console.error("Unknown Error:", e);
      }
    }
  };

  const handleDeleteClick = (timer: TimerForDomain) => {
    setTimerToDelete(timer);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (timerToDelete) {
      await deleteTimerForDomain(timerToDelete.domain);
      await loadTimerForDomains();
      setDeleteConfirmOpen(false);
      setTimerToDelete(null);
    }
  };

  const resetForm = () => {
    setDomain("");
    setTime(300);
    setError("");
    setIsEditing(false);
    setIsAdding(false);
    setOriginalDomain("");
    resetError();
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`);

    return parts.length > 0 ? parts.join(" ") : "0s";
  };

  const canAddMore = timerForDomains.length < TIMER_COUNT_LIMIT;
  const remainingCount = TIMER_COUNT_LIMIT - timerForDomains.length;

  if (!isAdding && timerForDomains.length === 0) {
    return (
      <div className="text-center space-y-4 py-8">
        <p className="text-gray-500 font-bold text-2xl">
          No timer, please add one.
        </p>
        <p className="text-sm text-gray-500">
          You can add up to {TIMER_COUNT_LIMIT} timers
        </p>
        <Button
          onClick={() => setIsAdding(true)}
          className={cn(
            "px-4 py-2 border-0 justify-start",
            "cursor-pointer",
            "transition-colors duration-300",
            "bg-primary hover:opacity-75 hover:bg-primary text-white justify-center",
          )}
        >
          Add Timer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isAdding ? (
        <div className="space-y-4 w-1/2">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              {isEditing ? "Edit Timer" : "Add Timer"}
            </h2>
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              type="text"
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value.toLowerCase());
                setError("");
              }}
              placeholder="example.com"
            />
            {domainError && (
              <p className="text-red-500 text-xs mt-1">{domainError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Timer (seconds)</Label>
            <Input
              id="time"
              type="number"
              min={10}
              max={3600}
              value={time}
              onChange={(e) => {
                setTime(Number.parseInt(e.target.value));
                setError("");
              }}
              placeholder="Enter time in seconds"
            />
            {timeError && (
              <p className="text-red-500 text-xs mt-1">{timeError}</p>
            )}
            <p className="text-sm text-gray-500">
              Current: {time ? formatTime(time) : 0}
            </p>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleUpsertTimer}
              className="hover:opacity-75 hover:bg-primary w-[80px]"
            >
              {isEditing ? "Update" : "Add"}
            </Button>

            <Button variant="outline" onClick={resetForm} className="w-[80px]">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Timers</h2>
            {remainingCount > 0 && (
              <p className="text-sm text-gray-500">
                {remainingCount} {remainingCount === 1 ? "timer" : "timers"}{" "}
                remaining
              </p>
            )}
          </div>
          {canAddMore && (
            <Button
              onClick={() => setIsAdding(true)}
              className="hover:opacity-75 hover:bg-primary"
            >
              Add Timer
            </Button>
          )}
        </div>
      )}

      {timerForDomains.length > 0 && (
        <div className="space-y-2">
          {!isAdding && (
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Existing Timers</h3>
              {!canAddMore && (
                <p className="text-sm text-red-500">Maximum limit reached</p>
              )}
            </div>
          )}
          {timerForDomains.map((timer) => (
            <div
              key={timer.domain}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div>
                <p className="font-medium">{timer.domain}</p>
                <p className="text-sm text-gray-500">
                  {formatTime(timer.time)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(timer)}
                >
                  <FilePenLineIcon
                    size={20}
                    className="cursor-pointer select-none hover:bg-accent rounded-md transition-colors duration-200 flex items-center justify-center"
                  />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteClick(timer)}
                >
                  {/* <Trash2 className="h-4 w-4" /> */}
                  <DeleteIcon
                    size={20}
                    className="cursor-pointer select-none transition-colors duration-200 flex items-center justify-center"
                  />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete the timer for{" "}
              <span className="font-medium">{timerToDelete?.domain}</span>?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
