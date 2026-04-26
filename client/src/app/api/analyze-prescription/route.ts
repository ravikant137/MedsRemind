import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json(); // base64 image
    
    // Prepare the image for Ollama (Local AI)
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
    2. Return ONLY the JSON object. No other text.`;

    try {
      // Talking to local Ollama instance
      const ollamaResponse = await axios.post('http://localhost:11434/api/generate', {
        model: "llama3.2-vision", // or "llava"
        prompt: prompt,
        images: [base64Data],
        stream: false,
        format: "json"
      }, {
        timeout: 60000 // 60 seconds for local processing
      });

      const result = ollamaResponse.data.response;
      const data = JSON.parse(result);
      return NextResponse.json(data);
      
    } catch (ollamaErr: any) {
      console.error('Ollama Error:', ollamaErr.message);
      
      // If Ollama is not running, provide a helpful guide
      return NextResponse.json({ 
        error: 'Local AI (Ollama) not detected.',
        instructions: 'To use without a key, please: 1. Install Ollama (ollama.com) 2. Run "ollama run llama3.2-vision" in your terminal 3. Keep Ollama running while using the app.',
        is_local_error: true
      }, { status: 503 });
    }

  } catch (error: any) {
    console.error('Prescription Analysis Error:', error);
    return NextResponse.json({ 
      error: `Processing Error: ${error.message || 'Unknown failure'}`,
    }, { status: 500 });
  }
}
