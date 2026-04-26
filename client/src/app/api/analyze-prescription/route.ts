import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
    }

    let base64Data = image;
    if (image.includes(';base64,')) {
      base64Data = image.split(';base64,')[1];
    } else if (image.includes(',')) {
      base64Data = image.split(',')[1];
    }

    const prompt = `Analyze this medical prescription image and extract a JSON schedule:
    {
      "patient_name": "string",
      "medicines": [{"name": "string", "dosage": "string", "frequency": "string", "duration": "string"}]
    }
    Return ONLY JSON.`;

    // Advanced Triple-Retry Logic
    const modelsToTry = ["gemini-1.5-pro", "gemini-1.5-pro-latest", "gemini-1.5-flash"];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          prompt,
          { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
        ]);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return NextResponse.json(JSON.parse(jsonMatch[0]));
      } catch (err: any) {
        console.error(`Model ${modelName} failed:`, err.message);
        lastError = err.message;
      }
    }

    return NextResponse.json({ 
      error: `All AI models failed. Last error: ${lastError}`,
      help: "Please check if your Gemini API key is active in your Google AI Studio dashboard."
    }, { status: 500 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
