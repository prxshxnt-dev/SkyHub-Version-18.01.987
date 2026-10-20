'use client';
import { GoogleGenAI, Type } from "@google/genai";

const getApiKey = () => {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    if (key && !key.includes('placeholder') && !key.includes('MY_GEMINI_API_KEY')) {
        return key.trim();
    }
    return '';
};

export const EXTRACT_RESOURCES_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        roms: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Title of the ROM (rom_name)" },
                    version: { type: Type.STRING, description: "Version mentioned beside title" },
                    androidVersion: { type: Type.STRING, description: "Android OS Version (android_version)" },
                    size: { type: Type.STRING, description: "File size (e.g. 3.1 GB)" },
                    updated: { type: Type.STRING, description: "Update date (e.g. Nov 2025)" },
                    description: { type: Type.STRING, description: "Features and details (features)" },
                    downloadUrl: { type: Type.STRING, description: "Primary download link (download_link)" },
                    imageUrl: { type: Type.STRING, description: "Preview or header image (preview_image)" },
                    mirrors: { type: Type.ARRAY, items: { type: Type.STRING } },
                    screenshots: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["name", "downloadUrl", "description"]
            }
        }
    }
};

/**
 * Fallback parser for extracting ROMs and resource links from raw text/HTML
 * when Gemini API key is not configured.
 */
function fallbackExtraction(content: string) {
    const items: any[] = [];
    // Match common link patterns: <a href="...">...</a> or markdown [text](url)
    const linkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1[^>]*>(.*?)<\/a>/gi;
    let match;
    let index = 1;

    while ((match = linkRegex.exec(content)) !== null && items.length < 30) {
        const href = match[2];
        const text = match[3].replace(/<[^>]*>/g, '').trim();

        if (
            href.includes('.zip') || 
            href.includes('.img') || 
            href.includes('.tar') || 
            href.includes('github.com') || 
            href.includes('sourceforge.net') || 
            href.includes('drive.google.com') ||
            href.includes('mega.nz') ||
            href.includes('t.me')
        ) {
            items.push({
                name: text || `Package ${index}`,
                version: 'Latest',
                androidVersion: 'Android 14/15',
                size: 'Direct Download',
                updated: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                description: `Extracted download asset: ${text || href.split('/').pop()}`,
                downloadUrl: href,
                imageUrl: '/screenshots/AxionOS.jpg',
                mirrors: [],
                screenshots: []
            });
            index++;
        }
    }

    return { roms: items };
}

export async function extractFromContent(content: string, url: string = 'local-input') {
    const key = getApiKey();

    if (!key) {
        // Safe deterministic fallback when key is not provided in frontend
        return fallbackExtraction(content);
    }

    const ai = new GoogleGenAI({ apiKey: key });

    const prompt = `You are an intelligent data extraction AI.

Your task is to parse the provided content (HTML, Text, or Telegram) and extract structured data for all Custom ROMs/Modules.

FIELDS:
1. name (string) → Title of the ROM
2. version (string) → Version mentioned beside title
3. androidVersion (string)
4. size (string)
5. updated (string)
5. description (string) → Features, Smoothness, UI type, etc.
7. downloadUrl (URL)
8. imageUrl (URL)

RULES:
- Clean all text (remove extra spaces, symbols like **, etc.)
- LIMIT: Return at most 40 distinct items.

Content Source: ${url}
Content:
${content.substring(0, 35000)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: EXTRACT_RESOURCES_SCHEMA,
                temperature: 0.2
            }
        });

        const text = response.text?.trim() || "";
        if (!text) return fallbackExtraction(content);

        try {
            return JSON.parse(text);
        } catch {
            return fallbackExtraction(content);
        }
    } catch (error) {
        console.warn("AI extraction fallback triggered:", error);
        return fallbackExtraction(content);
    }
}
