import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { FilePenLineIcon } from "~components/ui/icons/file-pen-line";
import { type ApiKeyEntry, readApiKeys, upsertApiKeys } from "~utils/storage";
import { Input } from "../ui/input";

export function ServiceSettings() {
  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
  const [message, setMessage] = useState("");
  const [editingKey, setEditingKey] = useState<ApiKeyEntry | null>(null);
  const [newKey, setNewKey] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    const savedApiKeys = await readApiKeys();
    if (savedApiKeys && savedApiKeys.length > 0) {
      setApiKeys(savedApiKeys);
    }
  };

  const handleSave = async () => {
    if (!newKey.trim()) {
      setError("API Key cannot be empty");
      return;
    }

    if (!editingKey) return;

    const updatedKeys = apiKeys.map((key) =>
      key.name === editingKey.name ? { ...key, key: newKey } : key,
    );

    await upsertApiKeys(updatedKeys);
    setApiKeys(updatedKeys);
    reset();
    setMessage("API Key saved successfully!");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleEditKey = (entry: ApiKeyEntry) => {
    setEditingKey(entry);
    setNewKey(entry.key);
  };

  const handleCancel = () => {
    reset();
  };

  const reset = () => {
    setNewKey("");
    setEditingKey(null);
    setError(null);
  };

  const renderKeyInput = () => (
    <div className="p-4 space-y-4 mb-4">
      <div className="space-y-2">
        <h3 className="font-medium">{editingKey?.name}</h3>
        <Input
          type="text"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="Enter API Key"
        />
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </div>

      <div className="flex justify-start space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="w-[80px]"
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          className="hover:opacity-75 hover:bg-primary w-[80px]"
          onClick={handleSave}
        >
          Save
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Service Settings</h2>
      </div>

      {editingKey && renderKeyInput()}
      {apiKeys.length > 0 && (
        <div className="space-y-2">
          {apiKeys.map((entry) => (
            <div
              key={entry.name}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <p className="font-medium w-[150px]">{entry.name}</p>
              <p className="text-sm text-gray-500">
                {entry.key ? "**********************" : "Not set"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditKey(entry)}
              >
                <FilePenLineIcon
                  size={20}
                  className="cursor-pointer select-none hover:bg-accent rounded-md transition-colors duration-200 flex items-center justify-center"
                />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {message && (
          <p className="text-green-500 text-center mt-2">{message}</p>
        )}
      </div>
    </div>
  );
}
