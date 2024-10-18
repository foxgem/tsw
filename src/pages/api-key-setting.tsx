import Layout from "@/components/Layout";
import TSWIcon from "@/components/TSWIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Storage } from "@plasmohq/storage";
import { Check, X } from "lucide-react";
import React, { useState, useEffect } from "react";

const storage = new Storage();

function SettingApiKey() {
  const [apiKey, setApiKey] = useState("");
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    const savedApiKey = await storage.get("apiKey");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError("API Key cannot be empty");
      return;
    }
    await storage.set("apiKey", apiKey);
    setMessage("API Key saved successfully!");
    setIsEditing(false);
    setError(null);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadApiKey();
    setError(null);
  };

  return (
    <Layout title="Setting API KEY">
      <Card className="overflow-y-auto mx-auto border-0 shadow-none">
        <CardContent className="p-4">
          {isEditing ? (
            <div className="bg-gray-100 p-4 rounded">
              <textarea
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API Key"
                className={cn(
                  "p-2 border-0 border-b w-full box-border bg-white text-black resize-none",
                  error ? "border-red-500" : "border-gray-300",
                )}
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              <div className="flex justify-end space-x-2 mt-2">
                <TSWIcon>
                  <Check
                    size={20}
                    onClick={handleSave}
                    className="text-green-500"
                  />
                </TSWIcon>
                <TSWIcon>
                  <X
                    size={20}
                    onClick={handleCancel}
                    className="text-red-500"
                  />
                </TSWIcon>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <p className="text-sm">
                API Key: {apiKey ? "********" : "Not set"}
              </p>
              <Button
                onClick={handleEdit}
                variant="outline"
                size="sm"
                className="rounded"
              >
                Edit
              </Button>
            </div>
          )}
          {message && (
            <p className="text-green-500 text-center mt-2">{message}</p>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}

export default SettingApiKey;
