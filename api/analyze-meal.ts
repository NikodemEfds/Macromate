import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

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
const delay = Math.min(
  1000 * Math.pow(2, attempt),
  8000
);

console.log(
  `Gemini API busy. Retrying in ${delay}ms...`
);

await new Promise((resolve) =>
  setTimeout(resolve, delay)
);
      } else {
        throw error;
      }
    }
  }

  throw new Error("Gemini request failed");
}

export default async function handler(
  req: any,
  res: any
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const {
      imageBase64,
      mimeType,
      description,
    } = req.body;

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
      "Analyze this meal. Be concise. Give accurate estimated nutritional totals and a component breakdown.";

    if (description) {
      textPrompt += ` User description: "${description}".`;
    }

    parts.push({
      text: textPrompt,
    });

    const response =
      await generateContentWithRetry({
       model: "gemini-3.5-flash-lite",

        contents: {
          parts,
        },

          config: {
    thinkingConfig: {
      thinkingLevel: "low",
    },
    responseMimeType: "application/json",

          responseSchema: {
            type: Type.OBJECT,

            properties: {
              name: {
                type: Type.STRING,
              },

              calories: {
                type: Type.NUMBER,
              },

              protein: {
                type: Type.NUMBER,
              },

              carbs: {
                type: Type.NUMBER,
              },

              fat: {
                type: Type.NUMBER,
              },

              micronutrients: {
                type: Type.ARRAY,

                items: {
                  type: Type.STRING,
                },
              },

              components: {
                type: Type.ARRAY,

                items: {
                  type: Type.OBJECT,

                  properties: {
                    name: {
                      type: Type.STRING,
                    },

                    calories: {
                      type: Type.NUMBER,
                    },

                    protein: {
                      type: Type.NUMBER,
                    },

                    carbs: {
                      type: Type.NUMBER,
                    },

                    fat: {
                      type: Type.NUMBER,
                    },
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

    const data = JSON.parse(
      response.text || "{}"
    );

    return res.status(200).json(data);

  } catch (error: any) {
    console.error(
      "Error analyzing meal:",
      error
    );

    return res.status(500).json({
      error:
        error?.message ||
        "Failed to analyze meal",
    });
  }
}
