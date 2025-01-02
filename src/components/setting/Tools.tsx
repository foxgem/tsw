import { useEffect, useState } from "react";
import { ZodError, type z } from "zod";
import type { Tool } from "~ai/tools";
import { toolRegistry } from "~ai/tools";
import { FilePenLineIcon } from "~components/ui/icons/file-pen-line";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type SchemaField = {
  type: string;
};

export const ToolsSetting: React.FC = () => {
  const [tools, setTools] = useState<Record<string, Tool> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTool, setCurrentTool] = useState<string>("");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingErrors, setSettingErrors] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = () => {
    const allTools = toolRegistry.getAllTools();
    setTools(allTools);
  };

  const getSchemaFields = (tool: Tool): Record<string, SchemaField> => {
    const schema = tool.settingsSchema();
    if (!schema) return {};

    const shape = (schema as z.ZodObject<any>).shape;
    const fields: Record<string, SchemaField> = {};

    for (const [key, field] of Object.entries(shape)) {
      if (field._def.typeName === "ZodString") {
        fields[key] = {
          type: "ZodString",
        };
      }
    }

    return fields;
  };

  const renderField = (key: string, value: string, field: SchemaField) => {
    return (
      <Input
        className="w-full"
        id={`setting-${key}`}
        type="text"
        value={value || ""}
        onChange={(e) => handleUpdateSetting(key, e.target.value)}
        placeholder={`Enter ${key}`}
      />
    );
  };

  const handleEdit = (toolName: string) => {
    setIsEditing(true);
    setCurrentTool(toolName);
    const toolSettings = toolRegistry.getToolSettings(toolName) || {};
    setSettings(toolSettings);
  };

  const handleUpdateSetting = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSettingErrors({});

      const tool = tools?.[currentTool];
      if (!tool) return;

      const schema = tool.settingsSchema();
      if (schema) {
        const validatedSettings = schema.parse(settings);
        await toolRegistry.updateToolSettings(tool.name, validatedSettings);
      }

      loadTools();
      resetForm();
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        for (const err of error.errors) {
          const path = err.path.join(".");
          newErrors[path] = err.message;
        }
        setSettingErrors(newErrors);
      }
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentTool("");
    setSettings({});
    setSettingErrors({});
  };

  const renderSettingsForm = () => {
    const tool = tools?.[currentTool];
    if (!tool) return null;

    const schemaFields = getSchemaFields(tool);

    return (
      <div className="space-y-4 w-2/3">
        <h2 className="text-lg font-semibold capitalize">{`Edit ${currentTool}`}</h2>
        {Object.entries(schemaFields).map(([key, field]) => (
          <div key={key} className="gap-2 flex items-center">
            <div className="w-1/3">
              <Label htmlFor={`setting-${key}`}>
                <div className="p-2">{key}</div>
              </Label>
            </div>
            <div className="w-2/3 flex gap-2">
              <div className="w-full">
                {renderField(key, settings[key], field)}
                {settingErrors[key] && (
                  <p className="text-red-500 text-xs mt-1">
                    {settingErrors[key]}
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
          <Button variant="outline" onClick={resetForm} className="w-[80px]">
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  if (!tools || Object.keys(tools).length === 0) {
    return (
      <div className="text-center space-y-4 py-8">
        <p className="text-gray-500 font-bold text-2xl">No tools available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {isEditing ? (
          renderSettingsForm()
        ) : (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Tools Configuration</h2>
              <p className="text-xs text-yellow-900">
                ⚠️ Note: If you changed the configuration, please refresh the
                page.
              </p>
            </div>
            {Object.entries(tools).map(([toolName, tool]) => (
              <div
                key={toolName}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium capitalize">{toolName}</p>
                  {tool.settingsSchema() && (
                    <p className="text-sm text-gray-500">Settings Required</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {tool.settingsSchema() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(toolName)}
                    >
                      <FilePenLineIcon size={20} />
                    </Button>
                  )}
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
