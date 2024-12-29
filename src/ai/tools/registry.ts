import { Storage } from "@plasmohq/storage";
import { geomap } from "./geomap";
import type { Tool, ToolConfig, Tools } from "./types";
import { weather } from "./weather";

export class ToolRegistry {
  private storage: Storage;
  private tools: Tools;
  private configurations: Record<string, ToolConfig>;

  constructor() {
    this.storage = new Storage();
    this.tools = {};
    this.configurations = {};
  }

  private registerTool(tool: Tool) {
    if (Object.keys(this.tools).includes(tool.name)) {
      throw new Error(`Tool ${tool.name} already registered`);
    }
    this.tools[tool.name] = tool;
  }

  async initialize() {
    this.registerTool(weather);
    this.registerTool(geomap);

    const storedConfigs =
      await this.storage.get<Record<string, ToolConfig>>("tools");

    if (!storedConfigs) {
      const defaultConfigs = Array.from(Object.keys(this.tools)).reduce(
        (acc, name) => {
          acc[name] = { enabled: false };
          return acc;
        },
        {} as Record<string, ToolConfig>,
      );

      await this.storage.set("tools", defaultConfigs);
      this.configurations = defaultConfigs;
    } else {
      this.configurations = storedConfigs;
    }
  }

  async enableTool(name: string, enabled: boolean): Promise<void> {
    this.configurations[name] = {
      ...(this.configurations[name] ?? {}),
      enabled,
    };
    await this.saveConfigurations();
  }

  async updateToolSettings(
    name: string,
    settings: Record<string, any>,
  ): Promise<void> {
    const tool = this.tools[name];
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }

    const settingsSchema = tool.settingsSchema();
    if (settingsSchema && !settingsSchema.parse(settings)) {
      throw new Error(`Invalid settings for tool ${name}`);
    }

    this.configurations[name] = {
      ...(this.configurations[name] ?? { enabled: false }),
      settings,
    };
    await this.saveConfigurations();
  }

  private async saveConfigurations() {
    await this.storage.set("tools", this.configurations);
  }

  getEnabledTools(): Tools {
    return Array.from(Object.entries(this.tools))
      .filter(([name]) => this.configurations[name]?.enabled)
      .reduce(
        (acc, [name, tool]) => {
          acc[name] = tool;
          return acc;
        },
        {} as Record<string, Tool>,
      );
  }

  getToolSettings(name: string) {
    return this.configurations[name]?.settings;
  }

  getAllTools() {
    return this.tools;
  }

  getTool(name: string) {
    return this.tools[name];
  }
}
