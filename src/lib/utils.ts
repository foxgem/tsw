import { Octokit } from "@octokit/rest";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  DEFAULT_MODEL_PROVIDER,
  MODELS,
  type ModelProvider,
} from "~utils/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function upperCaseFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getProviderFromModel(model: string) {
  for (const [provider, models] of Object.entries(MODELS)) {
    if (models.includes(model)) {
      return provider as ModelProvider;
    }
  }
  return DEFAULT_MODEL_PROVIDER;
}

export const formatMessageContent = (content: string | object) => {
  return typeof content === "object"
    ? `\`\`\`json\n${JSON.stringify(content, null, 2)}\n\`\`\``
    : content;
};

export async function saveToGithub(
  token: string,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
): Promise<void> {
  const octokit = new Octokit({ auth: token });

  try {
    const { data: repoData } = await octokit.repos.get({
      owner,
      repo,
    });
    const defaultBranch = repoData.default_branch;

    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
    });
    const latestCommitSha = refData.object.sha;

    const { data: blobData } = await octokit.git.createBlob({
      owner,
      repo,
      content: Buffer.from(content).toString("base64"),
      encoding: "base64",
    });

    const { data: treeData } = await octokit.git.createTree({
      owner,
      repo,
      base_tree: latestCommitSha,
      tree: [
        {
          path,
          mode: "100644",
          type: "blob",
          sha: blobData.sha,
        },
      ],
    });

    const { data: commitData } = await octokit.git.createCommit({
      owner,
      repo,
      message,
      tree: treeData.sha,
      parents: [latestCommitSha],
    });

    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
      sha: commitData.sha,
    });

    console.log(`File ${path} successfully committed!`);
  } catch (error) {
    console.error("Error committing file:", error);
    throw error;
  }
}
