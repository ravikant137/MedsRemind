import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseAdmin as supabase } from '@/lib/supabase';

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

    const prompt = `You are an expert Medical Pharmacist and OCR Specialist. 
    Analyze this prescription image with extreme precision. 
    
    RULES:
    1. EXTRACT MEDICINES: Use your vast medical knowledge to correctly identify medicine names even if handwriting is messy. Cross-reference characters with known drug names.
    2. DOSAGE & SCHEDULE: Strictly identify schedules like "1-0-1" (Morning-Afternoon-Night) or "Twice daily". 
    3. TIMING: Note if it is "Before Food" (AC) or "After Food" (PC).
    
    Return a structured JSON object:
    {
      "patient_name": "string",
      "medicines": [
        {
          "name": "Full Scientific Name",
          "dosage": "e.g. 500mg",
          "frequency": "e.g. 1-0-1",
          "duration": "e.g. 5 Days",
          "timing": "e.g. After Food",
          "instructions": "e.g. Swallow whole"
        }
      ],
      "advice": "General medical advice from the prescription"
    }
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
    
    // --- VALIDATION LAYER ---
    // Cross-reference extracted medicines with our real inventory
    const { data: dbMeds } = await supabase.from('medicines').select('name, id, price');
    
    if (data.medicines && dbMeds) {
      data.medicines = data.medicines.map((m: any) => {
        const match = dbMeds.find((dbM: any) => 
          dbM.name.toLowerCase().includes(m.name.toLowerCase()) || 
          m.name.toLowerCase().includes(dbM.name.toLowerCase())
        );
        return {
          ...m,
          validated: !!match,
          inventory_id: match ? match.id : null,
          price: match ? match.price : null,
          confidence_score: match ? 98 : 75 // Rule-based confidence simulation
        };
      });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Enterprise AI Error:', error);
    return NextResponse.json({ 
      error: `Enterprise Pipeline Error: ${error.message || 'Analysis failed'}`,
    }, { status: 500 });
  }
}
