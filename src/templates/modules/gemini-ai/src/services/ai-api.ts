import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

async function callGemini(model : string = "gemini-2.5-flash", prompt : string, data : any) {
  const response = await ai.models.generateContent({
    model: model,
    contents: `{ "prompt":${prompt} , "data":${data} }`,
  });
  return response.text;
}

export default callGemini;