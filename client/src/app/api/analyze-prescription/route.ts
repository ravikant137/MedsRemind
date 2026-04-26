import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json(); // base64 image
    
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ 
        error: 'Open Source AI Error: Missing GROQ_API_KEY. Please add it to your .env file to use Llama 3.2 Vision.',
        missing_key: true
      }, { status: 500 });
    }

    // Prepare the image for Llama 3.2 Vision
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
      "model": "llama-3.2-11b-vision-preview",
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
      console.error('Llama Response Text:', result);
      return NextResponse.json({ 
        error: `Llama Processing Failed: ${parseErr.message}`,
        raw: result?.substring(0, 100)
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Open Source AI Error:', error);
    return NextResponse.json({ 
      error: `Open Source Engine Error: ${error.message || 'Unknown failure'}`,
      details: error.stack?.substring(0, 50)
    }, { status: 500 });
  }
}
