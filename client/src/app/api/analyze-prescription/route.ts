import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json(); // base64 image
    
    if (!process.env.GEMINI_API_KEY) {
      // Fallback for demo if no API key is provided
      return NextResponse.json({
        medicines: [
          { name: "Paracetamol", dosage: "500mg", frequency: "Twice a day", duration: "5 days", instructions: "After food" },
          { name: "Amoxicillin", dosage: "250mg", frequency: "Thrice a day", duration: "7 days", instructions: "Complete the course" }
        ],
        summary: "Demo result: Please set GEMINI_API_KEY for real AI analysis."
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Analyze this medical prescription image. Extract all medicines mentioned. For each medicine, provide: name, dosage (e.g. 500mg), frequency (e.g. twice daily), duration (e.g. 5 days), and specific instructions. Return ONLY a JSON object with a 'medicines' array containing these objects.";

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: image.split(',')[1],
          mimeType: "image/jpeg"
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const data = jsonMatch ? JSON.parse(jsonMatch[0]) : { medicines: [] };

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('AI Analysis Error:', error);
    return NextResponse.json({ error: 'Failed to analyze prescription' }, { status: 500 });
  }
}
