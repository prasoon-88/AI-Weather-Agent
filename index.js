import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import readLine from "node:readline";
import { SYSTEM_PROMPT } from "./config/ai.config.js";
import TOOLS from "./tools/index.js";

dotenv.config();

// Readline setup for interactive input/output
const rl = readLine.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Initialize Google Generative AI with the API key
const googleAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = googleAI.getGenerativeModel({ model: "gemini-pro" });

let chats = [`${SYSTEM_PROMPT}\nSTART`];

const capitalizeCityName = (name) => {
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const talkToAI = async (msg) => {
  chats.push(JSON.stringify(msg));
  const prompt = chats.join("\n");
  const response = await model.generateContent(prompt);
  const lines = response.response.text().trim().split("\n");

  // Parse the AI's response from the last line
  return lines.at(-1) ? JSON.parse(lines.at(-1)) : {};
};

const runAgent = async (msg) => {
  try {
    const data = await talkToAI(msg);
    const type = data?.type;

    console.log("\n--- Agent Debug Info ---");
    console.log("Received Data:", data);
    console.log("-------------------------\n");

    switch (type) {
      case "plan":
        // Run the agent recursively with the plan
        await runAgent(data);
        break;

      case "action":
        const func = TOOLS[data?.function];
        const input = data?.input;

        if (func && input) {
          const output = await func(input);
          await runAgent({
            type: "observation",
            observation: output,
          });
        }
        break;

      case "output":
        console.log("\n>>> AI Response <<<");
        console.log(data?.output);
        console.log(">>> End of Response <<<\n");
        break;

      default:
        console.warn("Unknown response type:", type);
    }
  } catch (error) {
    console.error("Error in agent flow:", error.message);
  }
};

const main = async () => {
  rl.question("Enter City Name to Get Weather: ", async (inputCity) => {
    try {
      const cityName = capitalizeCityName(inputCity.trim());
      const userPrompt = `What is the full weather info of ${cityName} currently?`;

      const msg = {
        type: "user",
        user: userPrompt,
      };

      await runAgent(msg);
      chats = [`${SYSTEM_PROMPT}\nSTART`];
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      main(); // Continue interaction
    }
  });
};

main();
