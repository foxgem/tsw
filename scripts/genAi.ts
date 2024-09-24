import { explainCode } from "../src/utils/ai";

explainCode(`
  // For debugging
  setInterval(async () => {
    console.log(await chrome.storage.local.get());
    console.log(timerStartedMap);
    console.log(await storage.getAll());
  }, 3000);
  `).then(console.log);
