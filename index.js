import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import readLine from "node:readline";
import { SYSTEM_PROMPT } from "./config/ai.config.js";
import TOOLS from "./tools/index.js";

dotenv.config();

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

  return lines.at(-1) ? JSON.parse(lines.at(-1)) : {};
};

const runAgent = async (msg) => {
  try {
    const data = await talkToAI(msg);
    const type = data?.type;

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
        console.log(data?.output);
        break;

      default:
        console.warn("Unknown response type:", type);
    }
  } catch (error) {
    console.error("Error in agent flow:", error.message);
  }
};

const main = async () => {
  rl.question("Prompt: ", async (inputCity) => {
    try {
      const userPrompt = capitalizeCityName(inputCity.trim());

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
