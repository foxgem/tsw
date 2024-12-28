import { useEffect, useState } from "react";
import { ZodError, z } from "zod";
import { FilePenLineIcon } from "~components/ui/icons/file-pen-line";
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
    const updatedTools = Object.entries(tools).reduce((acc, [name, config]) => {
      acc[name] = {
        ...config,
        checked: newState,
      };
      return acc;
    }, {} as Tools);

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
      setApiKeyErrors(currentApiKeys.map(() => ({ name: null, key: null })));

      const hasEmptyKeys = currentApiKeys.some((key) => !key.key.trim());
      if (hasEmptyKeys) {
        setApiKeyErrors(
          currentApiKeys.map((key) => ({
            name: null,
            key: !key.key.trim() ? "API Key value is required" : null,
          })),
        );
        return;
      }

      const validationResult = toolSchema.parse({
        name: currentTool,
        apiKeys: currentApiKeys,
      });

      const currentTools = tools || {};

      if (isEditing && currentTool) {
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
        for (const err of error.errors) {
          const path = err.path;
          if (path[0] === "name") {
          } else if (path[0] === "apiKeys") {
            if (path.length === 1) {
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
        }
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

  const resetForm = () => {
    setIsEditing(false);
    setCurrentTool("");
    setCurrentApiKeys([]);
  };

  if (!tools || Object.keys(tools).length === 0) {
    return (
      <div className="text-center space-y-4 py-8">
        <p className="text-gray-500 font-bold text-2xl">
          No tools, please add one.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {isEditing ? (
          <div className="space-y-4 w-2/3">
            <h2 className="text-lg font-semibold">
              {isEditing && `Edit ${currentTool}`}
            </h2>
            {currentApiKeys?.map((apiKey, index) => (
              <div key={apiKey.name} className="gap-2 flex items-center">
                <div className="w-1/3">
                  <Label htmlFor={`apiKey-${index}`}>
                    {isEditing && <div className="p-2">{apiKey.name}</div>}
                  </Label>
                </div>
                <div className="w-2/3 flex gap-2">
                  <div className="w-full">
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
                            newErrors[index] = {
                              ...newErrors[index],
                              key: null,
                            };
                          }
                          return newErrors;
                        });
                      }}
                      placeholder="Enter API Key"
                    />
                    {apiKeyErrors[index]?.key && (
                      <p className="text-red-500 text-xs mt-1">
                        {apiKeyErrors[index].key}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                className="hover:opacity-75 hover:bg-primary w-[80px]"
              >
                Save
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
              </div>
            </div>
            {Object.entries(tools).map(([toolName, config]) => (
              <div
                key={toolName}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium capitalize">{toolName}</p>
                  {config.apiKeys && (
                    <p className="text-sm text-gray-500">
                      {config.apiKeys?.length} API Keys Required
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {config.apiKeys && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(toolName, config)}
                    >
                      <FilePenLineIcon size={20} />
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleEnable(toolName)}
                  >
                    {config.checked ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsSetting;
