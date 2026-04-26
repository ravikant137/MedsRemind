import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Cloud-based Open Source AI Engine
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json(); // base64 image
    
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ 
        error: 'Cloud AI Error: Missing GROQ_API_KEY.',
        instructions: 'For Cloud-based Open Source AI, a key is required. 1. Get a free key at console.groq.com 2. Add it to your .env file as GROQ_API_KEY.',
        missing_key: true
      }, { status: 500 });
    }

    // Clean image data for Cloud transmission
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
    1. If handwriting is unclear, suggest the most likely medicine name based on context.
    2. Return ONLY valid JSON. No conversational text.`;

    // Cloud-based Inference (Llama 3.2 Vision)
    const chatCompletion = await groq.chat.completions.create({
      "messages": [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": prompt
            },
            {
              "type": "image_url",
              "image_url": {
                "url": `data:image/jpeg;base64,${base64Data}`
              }
            }
          ]
        }
      ],
      "model": "llama-3.2-90b-vision-preview",
      "temperature": 0.1,
      "max_tokens": 1024,
      "top_p": 1,
      "stream": false,
      "response_format": { "type": "json_object" },
      "stop": null
    });

    const result = chatCompletion.choices[0].message.content;
    
    try {
      const data = JSON.parse(result || '{}');
      return NextResponse.json(data);
    } catch (parseErr: any) {
      console.error('Cloud Llama Response:', result);
      return NextResponse.json({ 
        error: `Cloud Processing Error: ${parseErr.message}`,
        raw: result?.substring(0, 100)
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Cloud AI Error:', error);
    return NextResponse.json({ 
      error: `Cloud Engine Error: ${error.message || 'Unknown failure'}`,
    }, { status: 500 });
  }
}
