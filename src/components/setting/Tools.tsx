import { useEffect, useState } from "react";
import { ZodError, z } from "zod";
import { ConfirmDialog } from "~components/ui/confirm-dialog";
import { DeleteIcon } from "~components/ui/icons/delete";
import { FilePenLineIcon } from "~components/ui/icons/file-pen-line";
import { cn } from "~lib/utils";
import {
  type ToolApiKey,
  type ToolConfig,
  type Tools,
  readToolConfigs,
  upsertToolConfigs,
} from "~utils/toolsstorage";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export const ToolsSetting: React.FC = () => {
  const [tools, setTools] = useState<Tools | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTool, setCurrentTool] = useState<string>("");
  const [currentApiKeys, setCurrentApiKeys] = useState<ToolApiKey[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [toolToDelete, setToolToDelete] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  const [toolNameError, setToolNameError] = useState<string | null>(null);
  const [apiKeyErrors, setApiKeyErrors] = useState<
    { name: string | null; key: string | null }[]
  >([]);
  const [isAllEnabled, setIsAllEnabled] = useState(false);

  const toolApiKeySchema = z.object({
    name: z.string().min(1, "API Key name is required"),
    key: z.string().min(1, "API Key value is required"),
  });

  const toolSchema = z.object({
    name: z.string().min(1, "Tool name is required"),
    apiKeys: z
      .array(toolApiKeySchema)
      .optional()
      .default([])
      .refine(
        (apiKeys) => {
          if (apiKeys.length > 0) {
            const names = apiKeys.map((key) => key.name);
            return new Set(names).size === names.length;
          }
          return true;
        },
        {
          message: "API Key names must be unique",
        },
      ),
  });

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    const toolsData = await readToolConfigs();
    setTools(toolsData || {});
  };

  useEffect(() => {
    if (tools) {
      const allEnabled = Object.values(tools).every((tool) => tool.checked);
      setIsAllEnabled(allEnabled);
    }
  }, [tools]);

  const handleToggleAll = async () => {
    if (!tools) return;

    const newState = !isAllEnabled;
    const updatedTools = Object.entries(tools).reduce(
      (acc, [name, config]) => ({
        ...acc,
        [name]: {
          ...config,
          checked: newState,
        },
      }),
      {},
    );

    await upsertToolConfigs(updatedTools);
    await loadTools();
  };

  const handleEdit = (toolName: string, config: ToolConfig) => {
    setIsEditing(true);
    setCurrentTool(toolName);
    setCurrentApiKeys(config.apiKeys);
  };

  const handleUpdateApiKey = (index: number, value: string) => {
    const newApiKeys = [...currentApiKeys];
    newApiKeys[index] = { ...newApiKeys[index], key: value };
    setCurrentApiKeys(newApiKeys);
  };

  const handleSave = async () => {
    try {
      setToolNameError(null);
      setApiKeyErrors(currentApiKeys.map(() => ({ name: null, key: null })));

      const validationResult = toolSchema.parse({
        name: currentTool,
        apiKeys: currentApiKeys,
      });

      const currentTools = tools || {};

      if (isAdding && currentTools[currentTool]) {
        setToolNameError("Tool name already exists");
        return;
      }

      if (isAdding) {
        const updatedTools = {
          ...currentTools,
          [validationResult.name]: {
            apiKeys: validationResult.apiKeys || [],
            checked: false,
          },
        };
        await upsertToolConfigs(updatedTools);
      } else if (isEditing && currentTool) {
        const updatedTools = {
          ...currentTools,
          [currentTool]: {
            ...currentTools[currentTool],
            apiKeys: validationResult.apiKeys || [],
          },
        };
        await upsertToolConfigs(updatedTools);
      }

      await loadTools();
      resetForm();
    } catch (error) {
      if (error instanceof ZodError) {
        error.errors.forEach((err) => {
          const path = err.path;
          if (path[0] === "name") {
            setToolNameError(err.message);
          } else if (path[0] === "apiKeys") {
            if (path.length === 1) {
              setToolNameError(err.message);
            } else {
              const index = Number.parseInt(path[1] as string);
              const field = path[2] as string;
              setApiKeyErrors((prev) => {
                const newErrors = [...prev];
                if (!newErrors[index]) {
                  newErrors[index] = { name: null, key: null };
                }
                newErrors[index] = {
                  ...newErrors[index],
                  [field]: err.message,
                };
                return newErrors;
              });
            }
          }
        });
      }
    }
  };

  const handleToggleEnable = async (toolName: string) => {
    if (!tools) return;

    const updatedTools = {
      ...tools,
      [toolName]: {
        ...tools[toolName],
        checked: !tools[toolName].checked,
      },
    };

    await upsertToolConfigs(updatedTools);
    await loadTools();
  };

  const handleAdd = () => {
    setIsAdding(true);
    setCurrentTool("");
  };

  const handleAddApiKey = () => {
    setCurrentApiKeys([...currentApiKeys, { name: "", key: "" }]);
  };

  const handleDeleteApiKey = (indexToDelete: number) => {
    setCurrentApiKeys(
      currentApiKeys.filter((_, index) => index !== indexToDelete),
    );
    setApiKeyErrors((prev) =>
      prev.filter((_, index) => index !== indexToDelete),
    );
  };

  const resetForm = () => {
    setIsEditing(false);
    setIsAdding(false);
    setCurrentTool("");
    setCurrentApiKeys([]);
  };

  const handleDeleteClick = (toolName: string) => {
    setToolToDelete(toolName);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!toolToDelete || !tools) return;

    const updatedTools = { ...tools };
    delete updatedTools[toolToDelete];

    await upsertToolConfigs(updatedTools);
    await loadTools();
    setDeleteConfirmOpen(false);
    setToolToDelete("");
  };

  if ((!tools || Object.keys(tools).length === 0) && !isAdding) {
    return (
      <div className="text-center space-y-4 py-8">
        <p className="text-gray-500 font-bold text-2xl">
          No tools, please add one.
        </p>
        <Button
          onClick={handleAdd}
          className={cn(
            "px-4 py-2 border-0 justify-start",
            "cursor-pointer",
            "transition-colors duration-300",
            "bg-primary hover:opacity-75 hover:bg-primary text-white justify-center",
          )}
        >
          Add Tool
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {isEditing || isAdding ? (
          <div className="space-y-4 w-2/3">
            <h2 className="text-lg font-semibold">
              {isEditing ? `Edit ${currentTool}` : "Add New Tool"}
            </h2>
            <div className="space-y-2">
              <Label htmlFor="toolName">Tool Name</Label>
              <Input
                id="toolName"
                type="text"
                value={currentTool}
                onChange={(e) => {
                  setCurrentTool(e.target.value);
                  setToolNameError(null);
                }}
                placeholder="Enter tool name"
              />
              {toolNameError && (
                <p className="text-red-500 text-xs mt-1">{toolNameError}</p>
              )}
            </div>
            {currentApiKeys.map((apiKey, index) => (
              <div key={index} className="gap-2 flex items-center">
                <div className="w-1/3">
                  <Label htmlFor={`apiKey-${index}`}>
                    <Input
                      placeholder="API Key Name"
                      value={apiKey.name}
                      onChange={(e) => {
                        const newApiKeys = [...currentApiKeys];
                        newApiKeys[index] = { ...apiKey, name: e.target.value };
                        setCurrentApiKeys(newApiKeys);
                        setApiKeyErrors((prev) => {
                          const newErrors = [...prev];
                          if (newErrors[index]) {
                            newErrors[index] = {
                              ...newErrors[index],
                              name: null,
                            };
                          }
                          return newErrors;
                        });
                      }}
                    />
                    {apiKeyErrors[index]?.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {apiKeyErrors[index].name}
                      </p>
                    )}
                  </Label>
                </div>
                <div className="w-2/3 flex gap-2">
                  <Input
                    className="m-0 w-full"
                    id={`apiKey-${index}`}
                    type="text"
                    value={apiKey.key}
                    onChange={(e) => {
                      handleUpdateApiKey(index, e.target.value);
                      setApiKeyErrors((prev) => {
                        const newErrors = [...prev];
                        if (newErrors[index]) {
                          newErrors[index] = { ...newErrors[index], key: null };
                        }
                        return newErrors;
                      });
                    }}
                    placeholder="Enter API Key"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteApiKey(index)}
                    className="shrink-0"
                  >
                    <DeleteIcon size={20} />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={handleAddApiKey}
              className="w-full mt-2"
            >
              + API Key
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                className="hover:opacity-75 hover:bg-primary w-[80px]"
              >
                {isEditing ? "Save" : "Add"}
              </Button>
              <Button
                variant="outline"
                onClick={resetForm}
                className="w-[80px]"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Tools Configuration</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleToggleAll}
                  className="text-sm"
                >
                  {isAllEnabled ? "Disable All" : "Enable All"}
                </Button>
                <Button
                  onClick={handleAdd}
                  className="hover:opacity-75 hover:bg-primary"
                >
                  Add Tool
                </Button>
              </div>
            </div>
            {Object.entries(tools).map(([toolName, config]) => (
              <div
                key={toolName}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium capitalize">{toolName}</p>
                  <p className="text-sm text-gray-500">
                    {config.apiKeys.length} API Keys Required
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(toolName, config)}
                  >
                    <FilePenLineIcon size={20} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleEnable(toolName)}
                  >
                    {config.checked ? "Enabled" : "Disabled"}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteClick(toolName)}
                  >
                    <DeleteIcon size={20} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Confirm Delete"
        description={
          <>
            Are you sure you want to delete the tool{" "}
            <span className="font-medium italic">{toolToDelete}</span>?
          </>
        }
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default ToolsSetting;
