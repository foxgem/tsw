import { Storage } from "@plasmohq/storage";
const storage = new Storage();

export type ToolApiKey = {
  name?: string;
  key?: string;
};

// Tool configuration type definitions
export type ToolConfig = {
  apiKeys: ToolApiKey[];
  checked: boolean;
};

export type Tools = {
  [key: string]: ToolConfig;
};

const initializeWeatherTool = (): ToolConfig => {
  return {
    apiKeys: [
      {
        name: "Geocode Map API",
        key: "your api key",
      },
      {
        name: "Weather API",
        key: "your api key",
      },
    ],
    checked: false,
  };
};

const initializeGeoMapTool = (): ToolConfig => {
  return {
    apiKeys: [
      {
        name: "Geocode Map API",
        key: "your api key",
      },
    ],
    checked: false,
  };
};

export async function initializeTools(): Promise<Tools> {
  const tools = await storage.get<Tools>("tools");

  if (!tools || !tools.weather) {
    const initialTools: Tools = {
      ...tools,
      weather: initializeWeatherTool(),
      geomap: initializeGeoMapTool(),
    };
    await storage.set("tools", initialTools);
    return initialTools;
  }

  return tools;
}

export async function readToolConfigs(): Promise<Tools> {
  const tools = await storage.get<Tools>("tools");
  return tools;
}

export async function upsertToolConfigs(tools: Tools) {
  await storage.set("tools", tools);
}

export async function getEnabledTools(): Promise<string[]> {
  const tools = await readToolConfigs();
  return Object.entries(tools)
    .filter(([_, config]) => config.checked)
    .map(([name]) => name);
}

export async function enableTools(toolNames: string[]): Promise<void> {
  const tools = await readToolConfigs();

  const newTools = toolNames.reduce((acc, name) => {
    if (!tools[name]) {
      acc[name] = {
        apiKeys: [],
        checked: true,
      };
    }
    return acc;
  }, {} as Tools);

  const updatedTools = Object.entries({ ...tools, ...newTools }).reduce(
    (acc, [name, config]) => ({
      ...acc,
      [name]: {
        ...config,
        checked: toolNames.includes(name),
      },
    }),
    {} as Tools,
  );

  await upsertToolConfigs(updatedTools);
}

export async function getToolApiKey(
  toolName: string,
  apiKeyName: string,
): Promise<string> {
  const tools = await readToolConfigs();
  const tool = tools[toolName];

  if (!tool) {
    return "";
  }

  const apiKey = tool.apiKeys.find((key) => key.name === apiKeyName);
  return apiKey?.key || "";
}
