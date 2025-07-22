import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, step, client } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Demo-JSON für KI erstellen (damit sie Demo-Modus erkennt)
    const demoPayload = {
      prompt: prompt,
      step: step || 1,
      client: client || 'demo'
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: JSON.stringify(demoPayload)
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const response = completion.choices[0].message.content;

    return res.status(200).json({
      response: response,
      step: step,
      client: client
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Fallback response
    return res.status(200).json({
      response: `Liebe ${client === 'lisa' ? 'Frau Müller' : client === 'sarah' ? 'Frau Weber' : client === 'marcus' ? 'Herr Schmidt' : 'Herr Hoffmann'}, vielen Dank für Ihr Vertrauen. Als KI-Demo kann ich Ihnen zeigen, wie das triadische Coaching funktioniert. Ihre Herausforderung ist wichtig und verdient professionelle Begleitung. Ein echter Coach kann Ihnen noch viel gezielter helfen. Was beschäftigt Sie am meisten?`,
      step: step,
      client: client,
      fallback: true
    });
  }
}