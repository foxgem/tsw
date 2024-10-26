import Layout from "@/components/Layout";
import TSWIcon from "@/components/TSWIcon";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { TIMER_COUNT_LIMIT } from "@/utils/constants";
import { Check, FilePenLine, Plus, Trash2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { ZodError } from "zod";
import {
  type TimerForDomain,
  deleteTimerForDomain,
  getAllTimersForDomains,
  timerSchema,
  upsertTimerForDomain,
} from "../utils/db";

function TimerSettingPage() {
  const [TimerForDomains, setTimerForDomains] = useState<TimerForDomain[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [newTime, setNewTime] = useState(0);
  const [editingTimer, setEditingTimer] = useState<TimerForDomain | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [domainError, setDomainError] = useState<string | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);

  useEffect(() => {
    loadTimerForDomains();
  }, []);

  const loadTimerForDomains = async () => {
    const timerForDomains: TimerForDomain[] = await getAllTimersForDomains();
    setTimerForDomains(timerForDomains);
  };

  const handleUpsertTimer = async () => {
    try {
      if (TimerForDomains.length === TIMER_COUNT_LIMIT) {
        return;
      }
      resetError();
      timerSchema.parse({ domain: newDomain, time: newTime });

      await upsertTimerForDomain({
        domain: newDomain,
        time: newTime,
      });
      loadTimerForDomains();
      setIsAdding(false);
      reset();
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

  const handleRemoveTimer = async (domain: string) => {
    deleteTimerForDomain(domain).then(() => {
      loadTimerForDomains();
    });
  };

  const handleEditTimer = (timer: TimerForDomain) => {
    setEditingTimer(timer);
    setNewDomain(timer.domain);
    setNewTime(timer.time);
    setIsAdding(false);
  };

  const handleAddTimer = () => {
    setIsAdding(true);
    reset();
  };

  const handleCancel = () => {
    setIsAdding(false);
    reset();
  };

  const reset = () => {
    setNewDomain("");
    setNewTime(0);
    setEditingTimer(null);
    resetError();
  };

  const resetError = () => {
    setDomainError(null);
    setTimeError(null);
  };

  const renderTimerInput = () => (
    <div className="bg-gray-100">
      <div>
        <Input
          type="text"
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          placeholder="Enter domain (e.g., example.com)"
          className={cn(
            "p-0 pl-2 border-0 border-b w-[234px] box-border mr-4 bg-gray-100 text-black",
            domainError ? "border-red-500" : "border-gray-300",
          )}
        />
        {domainError && (
          <p className="text-red-500 text-xs mt-1">{domainError}</p>
        )}
      </div>
      <div className="flex justify-between items-center mt-2">
        <div className="flex-grow">
          <Input
            type="number"
            value={newTime}
            onChange={(e) => setNewTime(Number.parseInt(e.target.value))}
            placeholder="Enter time (seconds)"
            className={cn(
              "p-0 pl-2 border-0 border-b w-full box-border bg-gray-100  text-black",
              timeError ? "border-red-500" : "border-gray-300",
            )}
          />
          {timeError && (
            <p className="text-red-500 text-xs mt-1">{timeError}</p>
          )}
        </div>
        <div className="flex space-x-1 ml-2">
          <TSWIcon>
            <Check
              size={20}
              onClick={handleUpsertTimer}
              className="text-green-500"
            />
          </TSWIcon>
          <TSWIcon>
            <X
              size={20}
              onClick={() => handleCancel()}
              className="text-red-500"
            />
          </TSWIcon>
        </div>
      </div>
    </div>
  );

  const addElement = () => (
    <button type="button" onClick={() => handleAddTimer()}>
      <TSWIcon>
        <Plus size={20} />
      </TSWIcon>
    </button>
  );

  return (
    <Layout
      title="Time Spend Watcher"
      headerRightElement={
        TimerForDomains.length < TIMER_COUNT_LIMIT ? (
          addElement()
        ) : (
          <div className="font-bold">Limited</div>
        )
      }
      footerPosition="fixed"
    >
      <Card className="overflow-y-auto mx-auto border-0 shadow-none">
        <CardContent className="p-0 shadow-none pb-4">
          {isAdding && renderTimerInput()}
          <ScrollArea className="">
            <ul className="">
              {TimerForDomains.map((timer) => (
                <Card
                  key={timer.domain}
                  className={cn(
                    "py-2 shadow-none border-0",
                    editingTimer && editingTimer.domain === timer.domain
                      ? ""
                      : "border-b hover:bg-accent rounded",
                  )}
                >
                  {editingTimer && editingTimer.domain === timer.domain ? (
                    renderTimerInput()
                  ) : (
                    <div className="flex justify-between items-center px-2">
                      <p className="text-sm w-[40%]">{timer.domain}</p>
                      <p className="text-sm w-[20%]">{timer.time}s</p>

                      <div className="flex space-x-1">
                        <TSWIcon>
                          <FilePenLine
                            size={20}
                            onClick={() => handleEditTimer(timer)}
                            className="text-primary"
                          />
                        </TSWIcon>
                        <TSWIcon>
                          <Trash2
                            size={20}
                            onClick={() => handleRemoveTimer(timer.domain)}
                            className="text-red-500"
                          />
                        </TSWIcon>
                      </div>
                    </div>
                  )}
                </Card>
              ))}

              {TimerForDomains.length === 0 && !isAdding && (
                <div className="w-full text-center font-bold text-xl mt-8">
                  No timer, please add one.
                </div>
              )}
            </ul>
            {TimerForDomains.length > 0 &&
              TIMER_COUNT_LIMIT - TimerForDomains.length > 0 && (
                <div className="text-right w-full font-bold py-2 text-base">
                  Left: {TIMER_COUNT_LIMIT - TimerForDomains.length}
                </div>
              )}
          </ScrollArea>
        </CardContent>
      </Card>
    </Layout>
  );
}

export default TimerSettingPage;
