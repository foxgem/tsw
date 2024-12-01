import { Check, FilePenLine, X } from "lucide-react";
import { useEffect, useState } from "react";
import IconWrapper from "~/components/IconWrapper";
import Layout from "~/components/Layout";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import { readApiKeys, upsertApiKeys, type ApiKeyEntry } from "~utils/db";

function SettingApiKey() {
  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
  const [message, setMessage] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKeyEntry | null>(null);
  const [newName, setNewName] = useState("");
  const [newKey, setNewKey] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    const savedApiKeys = await readApiKeys();
    if (savedApiKeys) {
      setApiKeys(savedApiKeys);
    }
  };

  const handleSave = async () => {
    if (!newName.trim() || !newKey.trim()) {
      setError("Name and API Key cannot be empty");
      return;
    }

    const updatedKeys = editingKey
      ? apiKeys.map((key) =>
          key.name === editingKey.name ? { name: newName, key: newKey } : key,
        )
      : [...apiKeys, { name: newName, key: newKey }];

    await upsertApiKeys(updatedKeys);
    setApiKeys(updatedKeys);
    reset();
    setMessage("API Key saved successfully!");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleEditKey = (entry: ApiKeyEntry) => {
    setEditingKey(entry);
    setNewName(entry.name);
    setNewKey(entry.key);
    setIsAdding(false);
  };

  const handleAddKey = () => {
    setIsAdding(true);
    reset();
  };

  const handleCancel = () => {
    setIsAdding(false);
    reset();
  };

  const reset = () => {
    setNewName("");
    setNewKey("");
    setEditingKey(null);
    setError(null);
  };

  const renderKeyInput = () => (
    <div className="bg-gray-100 p-2">
      <div>
        <Input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Enter key name"
          className={cn(
            "p-0 pl-2 border-0 border-b w-full box-border bg-gray-100 text-black",
            error ? "border-red-500" : "border-gray-300",
          )}
        />
      </div>
      <div className="flex justify-between items-center mt-2">
        <div className="flex-grow">
          <Input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Enter API Key"
            className={cn(
              "p-0 pl-2 border-0 border-b w-full box-border bg-gray-100 text-black",
              error ? "border-red-500" : "border-gray-300",
            )}
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
        <div className="flex space-x-1 ml-2">
          <IconWrapper>
            <Check size={20} onClick={handleSave} className="text-green-500" />
          </IconWrapper>
          <IconWrapper>
            <X size={20} onClick={handleCancel} className="text-red-500" />
          </IconWrapper>
        </div>
      </div>
    </div>
  );

  return (
    <Layout title="Setting API KEYS" footerPosition="fixed">
      <Card className="overflow-y-auto mx-auto border-0 shadow-none">
        <CardContent className="p-0 shadow-none pb-4">
          {isAdding && renderKeyInput()}
          <ScrollArea>
            <ul>
              {apiKeys.map((entry) => (
                <Card
                  key={entry.name}
                  className={cn(
                    "py-2 shadow-none border-0",
                    editingKey && editingKey.name === entry.name
                      ? ""
                      : "border-b hover:bg-accent rounded",
                  )}
                >
                  {editingKey && editingKey.name === entry.name ? (
                    renderKeyInput()
                  ) : (
                    <div className="flex justify-between items-center px-2">
                      <p className="text-sm w-[40%]">{entry.name}</p>
                      <p className="text-sm w-[40%]">
                        {entry.key ? "********" : "Not set"}
                      </p>
                      <div className="flex space-x-2">
                        <IconWrapper>
                          <FilePenLine
                            size={20}
                            onClick={() => handleEditKey(entry)}
                            className="text-primary mr-2"
                          />
                        </IconWrapper>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
              {apiKeys.length === 0 && !isAdding && (
                <div className="w-full text-center font-bold text-xl mt-8">
                  No API keys, please add one.
                </div>
              )}
            </ul>
          </ScrollArea>
          {message && (
            <p className="text-green-500 text-center mt-2">{message}</p>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}

export default SettingApiKey;
