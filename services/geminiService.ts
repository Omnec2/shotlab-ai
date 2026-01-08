
import { GoogleGenAI, Type } from "@google/genai";
import { Shot, DPNotes } from "../types";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

/**
 * Génère la liste des plans à partir du script.
 */
export const generateShotList = async (script: string, directorStyle: string): Promise<Shot[]> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Agis comme un réalisateur professionnel avec le style : ${directorStyle}.
      Crée un découpage technique pour cette scène : "${script}".
      
      RÈGLES DE CADRAGE POUR 'visualPrompt' (en ANGLAIS) :
      - Plan Général -> "Extreme Wide Shot"
      - Plan Moyen -> "Medium Full Shot"
      - Plan Américain -> "Cowboy Shot"
      - Plan Taille -> "Medium Shot"
      - Plan Rapproché Poitrine -> "Medium Close-up"
      - Gros Plan -> "Close-up"
      - Très Gros Plan -> "Extreme Close-up"

      CONSIGNES :
      1. Rédige 'shotType', 'description', 'sound' et 'dialogue' en FRANÇAIS.
      2. 'visualPrompt' DOIT être en ANGLAIS, ultra-précis, commençant par le type de cadrage technique.
      3. Retourne TOUJOURS l'axe (axis) du sujet parmi: Face, Profil, Dos, 3/4 Face, 3/4 Dos.
      
      Retourne UNIQUEMENT un tableau JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.NUMBER },
            shotType: { type: Type.STRING },
            angle: { type: Type.STRING },
            axis: { type: Type.STRING },
            movement: { type: Type.STRING },
            sound: { type: Type.STRING },
            dialogue: { type: Type.STRING },
            description: { type: Type.STRING },
            visualPrompt: { type: Type.STRING },
          },
          required: ["id", "shotType", "angle", "axis", "movement", "sound", "dialogue", "description", "visualPrompt"],
        },
      },
    },
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Erreur JSON", e);
    return [];
  }
};

export const generateDirectorNotes = async (script: string): Promise<DPNotes> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyse la scène et fournis des notes de direction artistique en FRANÇAIS : "${script}".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          lighting: { type: Type.STRING },
          colors: { type: Type.STRING },
          sound: { type: Type.STRING },
        },
        required: ["lighting", "colors", "sound"],
      },
    },
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { lighting: "Lumière standard", colors: "Neutre", sound: "Ambiance" };
  }
};

/**
 * Génère une image de storyboard en style COMIC NOIR ET BLANC.
 */
export const generateShotImage = async (prompt: string, style: string): Promise<string | null> => {
  const comicStyle = "STRICT BLACK AND WHITE COMIC BOOK STYLE, professional ink sketch, bold lines, high contrast, ink wash, halftone patterns, cinematic comic panel, graphic novel aesthetic, no colors, pure b&w";

  let framingReinforcement = "";
  const p = prompt.toLowerCase();

  if (p.includes("général") || p.includes("ensemble") || p.includes("wide") || p.includes("pg") || p.includes("pge")) framingReinforcement = "EXTREME WIDE SHOT. ";
  else if (p.includes("moyen") || p.includes("pm")) framingReinforcement = "MEDIUM FULL SHOT. ";
  else if (p.includes("américain") || p.includes("pa")) framingReinforcement = "COWBOY SHOT. ";
  else if (p.includes("taille") || p.includes("pt")) framingReinforcement = "MEDIUM SHOT. ";
  else if (p.includes("poitrine") || p.includes("prp")) framingReinforcement = "MEDIUM CLOSE UP. ";
  else if (p.includes("gros plan") || p.includes("gp")) framingReinforcement = "CLOSE UP SHOT. ";
  else if (p.includes("très gros plan") || p.includes("tgp")) framingReinforcement = "EXTREME CLOSE UP. ";

  if (p.includes("plongée") && !p.includes("contre")) framingReinforcement += "High angle shot. ";
  if (p.includes("contre-plongée")) framingReinforcement += "Low angle shot. ";
  if (p.includes("profil")) framingReinforcement += "Side view. ";
  if (p.includes("dos")) framingReinforcement += "Back view. ";

  const fullPrompt = `${framingReinforcement}${prompt}. ${comicStyle}. Artistic influence: ${style}. Clean lines, no text, storyboard panel.`;

  const seed = Math.floor(Math.random() * 1000000);
  const width = 1280;
  const height = 720;

  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error("Pollination error");
    return imageUrl;
  } catch (e) {
    return null;
  }
};
