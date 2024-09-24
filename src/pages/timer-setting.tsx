import React, { useState, useEffect } from "react";
import {
  deleteTimerForDomain,
  getAllTimersForDomains,
  TimerForDomain,
  timerSchema,
  upsertTimerForDomain,
} from "../utils/db";
import { Check, ChevronLeft, FilePenLine, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import TSWIcon from "@/components/TSWIcon";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Layout from "@/components/Layout";

function TimerSettingPage() {
  const navigate = useNavigate()
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
      resetError();
      timerSchema.parse({ domain: newDomain, time: newTime });

      await upsertTimerForDomain({
        domain: newDomain,
        time: newTime,
      });
      loadTimerForDomains();
      setIsAdding(false);
      reset();

    } catch (e: any) {
      e.errors.forEach((err: any) => {
        if (err.path.includes("domain")) {
          setDomainError(err.message);
        } else if (err.path.includes("time")) {
          setTimeError(err.message);
        }
      });

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
    reset()
  }

  const reset = () => {
    setNewDomain("");
    setNewTime(0);
    setEditingTimer(null);
    resetError();
  }

  const resetError = () => {
    setDomainError(null);
    setTimeError(null);
  }

  const renderTimerInput = () => (
    <div className=" bg-gray-100">
      <div>
        <Input
          type="text"
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          placeholder="Enter domain (e.g., example.com)"
          className={cn("p-0 pl-2 border-0 border-b w-[234px] box-border mr-4 bg-gray-100", domainError ? 'border-red-500' : 'border-gray-300')}
        />
      </div>
      <div className="flex justify-between items-center">
        <Input
          type="number"
          value={newTime}
          onChange={(e) => setNewTime(parseInt(e.target.value))}
          placeholder="Enter time (seconds)"
          className={cn("p-0 pl-2 border-0 border-b w-full box-border bg-gray-100", timeError ? 'border-red-500' : 'border-gray-300')}
        />
        <div className="flex space-x-1">
          <TSWIcon><Check size={20} onClick={handleUpsertTimer} className="text-green-500" /></TSWIcon>
          <TSWIcon><X size={20} onClick={() => handleCancel()} className="text-red-500" /></TSWIcon>
        </div>
      </div>
    </div>
  );

  const addElement = () => (
    <div className="" onClick={() => handleAddTimer()}>
      <TSWIcon><Plus size={20} /></TSWIcon>
    </div>
  )

  return (
    <Layout title="Time Spend Watcher" headerRightElement={addElement()} footerPosition={TimerForDomains.length > 3 ? "" : "fixed"}>
      <Card className="overflow-y-auto mx-auto border-0 shadow-none">
        <CardContent className="p-0 shadow-none pb-4">
          {isAdding && renderTimerInput()}
          <ScrollArea className="">
            <ul className="">
              {TimerForDomains.map((timer) => (
                <Card key={timer.domain} className={cn("py-2 shadow-none border-0", editingTimer && editingTimer.domain === timer.domain ? '' : "border-b hover:bg-accent rounded")}>
                  {editingTimer && editingTimer.domain === timer.domain ? renderTimerInput() : (
                    <div className="flex justify-between items-center px-2">

                      <p className="text-sm w-[40%]">
                        {timer.domain}
                      </p>
                      <p className="text-sm w-[20%]">{timer.time}s
                      </p>

                      <div className="flex space-x-1">
                        <TSWIcon><FilePenLine size={20} onClick={() => handleEditTimer(timer)} className="text-primary" /></TSWIcon>
                        <TSWIcon><Trash2 size={20} onClick={() => handleRemoveTimer(timer.domain)} className="text-red-500" /></TSWIcon>
                      </div>
                    </div>
                  )}
                </Card>
              ))}

              {TimerForDomains.length === 0 && !isAdding && (
                <div className="w-full text-center font-bold text-xl mt-8">No timer, please add one.</div>
              )}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
    </Layout>
  )
}


export default TimerSettingPage;