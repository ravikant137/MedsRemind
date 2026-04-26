import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json(); // base64 image
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: 'AI Analysis Configuration Error: Missing GEMINI_API_KEY. Please add it to your environment variables.',
        missing_key: true
      }, { status: 500 });
    }

    // High-Accuracy Production Model (with self-healing fallback)
    let model;
    try {
      model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    } catch (e) {
      model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    }

    // Clean image data
    let base64Data = image;
    if (image.includes(';base64,')) {
      base64Data = image.split(';base64,')[1];
    } else if (image.includes(',')) {
      base64Data = image.split(',')[1];
    }

    const prompt = `Analyze this medical prescription image with maximum accuracy. 
    Extract a detailed medication schedule in the following JSON format:
    {
      "patient_name": "string or unknown",
      "medicines": [
        {
          "name": "string",
          "dosage": "string (e.g. 500mg)",
          "frequency": "string (e.g. 1-0-1 or Twice a day)",
          "timing": "string (e.g. Before Food)",
          "duration": "string (e.g. 5 days)",
          "purpose": "string (e.g. Fever)"
        }
      ],
      "advice": "string (general instructions)"
    }
    
    Important: 
    1. If handwriting is unclear, use your medical knowledge to suggest the most likely medicine name based on context.
    2. Be extremely precise with the 1-0-1 (Morning-Afternoon-Night) schedule if visible.
    Return ONLY valid JSON.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg"
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in AI response");
      const data = JSON.parse(jsonMatch[0]);
      return NextResponse.json(data);
    } catch (parseErr: any) {
      console.error('Gemini Response Text:', text);
      return NextResponse.json({ 
        error: `AI Processing Failed: ${parseErr.message}`,
        raw: text.substring(0, 100)
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Gemini Analysis Error:', error);
    return NextResponse.json({ 
      error: `Gemini Pro Error: ${error.message || 'Unknown failure during analysis'}`,
    }, { status: 500 });
  }
}
