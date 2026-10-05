import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.use(express.json({ limit: "50mb" }));

// --------------------------------------------------
// Health check
// --------------------------------------------------

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// --------------------------------------------------
// Gemini helpers
// --------------------------------------------------

async function generateContentWithRetry(
  request: any,
  maxRetries = 3
) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(request);
    } catch (error: any) {
      if (attempt === maxRetries - 1) {
        throw error;
      }

      const isRetryable =
        error?.status === 503 ||
        error?.status === 429 ||
        error?.message?.includes("429") ||
        error?.message?.includes("503");

      if (isRetryable) {
        console.log(
          `Gemini API busy (attempt ${attempt + 1}/${maxRetries}). Retrying in ${
            2 * (attempt + 1)
          }s...`
        );

        await new Promise((resolve) =>
          setTimeout(resolve, 2000 * (attempt + 1))
        );
      } else {
        throw error;
      }
    }
  }
}

function getErrorMessage(error: any) {
  if (error?.status === 503) {
    return "The AI model is currently experiencing high demand. Please try again in a few moments.";
  }

  if (error?.status === 429) {
    return "The AI model quota has been exceeded. Please wait a minute and try again.";
  }

  return error?.message || "An unexpected error occurred.";
}

// --------------------------------------------------
// Analyze meal
// --------------------------------------------------

app.post("/api/analyze-meal", async (req, res) => {
  try {
    const { imageBase64, mimeType, description } = req.body;

    const parts: any[] = [];

    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: imageBase64.replace(
            /^data:image\/\w+;base64,/,
            ""
          ),
        },
      });
    }

    let textPrompt =
      "Analyze meal. Be extremely concise. Give totals and component breakdown.";

    if (description) {
      textPrompt += ` User text: "${description}".`;
    }

    parts.push({ text: textPrompt });

    const response = await generateContentWithRetry({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fat: { type: Type.NUMBER },

            micronutrients: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },

            components: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  calories: { type: Type.NUMBER },
                  protein: { type: Type.NUMBER },
                  carbs: { type: Type.NUMBER },
                  fat: { type: Type.NUMBER },
                },
                required: [
                  "name",
                  "calories",
                  "protein",
                  "carbs",
                  "fat",
                ],
              },
            },
          },

          required: [
            "name",
            "calories",
            "protein",
            "carbs",
            "fat",
            "micronutrients",
            "components",
          ],
        },
      },
    });

    const textResponse = response.text || "{}";
    const data = JSON.parse(textResponse);

    res.json(data);
  } catch (error: any) {
    console.error("Error analyzing meal:", error);

    const statusCode =
      typeof error?.status === "number"
        ? error.status
        : 500;

    res
      .status(statusCode)
      .json({ error: getErrorMessage(error) });
  }
});

// --------------------------------------------------
// Generate meal plan
// --------------------------------------------------

app.post("/api/generate-meal-plan", async (req, res) => {
  try {
    const { goals } = req.body;

    const response = await generateContentWithRetry({
      model: "gemini-2.5-flash",
      contents: `1-day meal plan for: ${goals}. Concise.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              mealType: {
                type: Type.STRING,
                description: "e.g., Breakfast, Lunch",
              },
              name: {
                type: Type.STRING,
                description: "Name of the meal",
              },
              description: {
                type: Type.STRING,
                description: "Brief description of the meal",
              },
              calories: {
                type: Type.NUMBER,
                description: "Estimated calories",
              },
              protein: {
                type: Type.NUMBER,
                description: "Estimated protein (g)",
              },
              carbs: {
                type: Type.NUMBER,
                description: "Estimated carbs (g)",
              },
              fat: {
                type: Type.NUMBER,
                description: "Estimated fat (g)",
              },
            },

            required: [
              "mealType",
              "name",
              "description",
              "calories",
              "protein",
              "carbs",
              "fat",
            ],
          },
        },
      },
    });

    const data = JSON.parse(response.text || "[]");

    res.json(data);
  } catch (error: any) {
    console.error("Error generating meal plan:", error);

    const statusCode =
      typeof error?.status === "number"
        ? error.status
        : 500;

    res
      .status(statusCode)
      .json({ error: getErrorMessage(error) });
  }
});

// --------------------------------------------------
// Daily advice
// --------------------------------------------------

app.post("/api/daily-advice", async (req, res) => {
  try {
    const { logSummary } = req.body;

    const response = await generateContentWithRetry({
      model: "gemini-2.5-flash",
      contents: `Analyze log & give 1-sentence advice, 2 strengths, 2 improvements.
Log: ${JSON.stringify(logSummary)}`,

      config: {
        responseMimeType: "application/json",

        responseSchema: {
          type: Type.OBJECT,

          properties: {
            advice: {
              type: Type.STRING,
              description: "The actionable advice text.",
            },

            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description:
                "List of things they did well today",
            },

            areasForImprovement: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description:
                "List of things to improve tomorrow",
            },
          },

          required: [
            "advice",
            "strengths",
            "areasForImprovement",
          ],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");

    res.json(data);
  } catch (error: any) {
    console.error("Error generating advice:", error);

    const statusCode =
      typeof error?.status === "number"
        ? error.status
        : 500;

    res
      .status(statusCode)
      .json({ error: getErrorMessage(error) });
  }
});

// --------------------------------------------------
// Serve Vite frontend
// --------------------------------------------------

const distPath = path.join(process.cwd(), "dist");

app.use(express.static(distPath));

// React/Vite SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

export default app;
