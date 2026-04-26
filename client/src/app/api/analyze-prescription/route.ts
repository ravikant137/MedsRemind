import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json(); // base64 image
    
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'Enterprise AI Error: Missing OPENAI_API_KEY. Please add it to your environment variables.',
        missing_key: true
      }, { status: 500 });
    }

    let base64Data = image;
    if (image.includes(';base64,')) {
      base64Data = image.split(';base64,')[1];
    } else if (image.includes(',')) {
      base64Data = image.split(',')[1];
    }

    const prompt = `You are a medical OCR and prescription analysis expert. 
    Analyze this prescription image with 100% accuracy. 
    Return a structured JSON object in this format:
    {
      "patient_name": "string",
      "medicines": [
        {
          "name": "string",
          "dosage": "string",
          "frequency": "string (e.g. 1-0-1)",
          "duration": "string",
          "timing": "string"
        }
      ],
      "advice": "string"
    }
    If handwriting is messy, use medical context to determine the correct medicine name.
    RETURN ONLY JSON.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Data}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = response.choices[0].message.content;
    const data = JSON.parse(result || '{}');
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Enterprise AI Error:', error);
    return NextResponse.json({ 
      error: `Enterprise Pipeline Error: ${error.message || 'Analysis failed'}`,
    }, { status: 500 });
  }
}
