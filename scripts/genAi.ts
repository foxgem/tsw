import { rewriteCode } from "../src/utils/ai";

rewriteCode(
  `
  // For debugging
  setInterval(async () => {
    console.log(await chrome.storage.local.get());
    console.log(timerStartedMap);
    console.log(await storage.getAll());
  }, 3000);
  `,
  "rust"
).then(console.log);
