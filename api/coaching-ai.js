import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Deine Assistant ID hier eintragen
const ASSISTANT_ID = process.env.ASSISTANT_ID || 'asst-deine-assistant-id';

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

    // Demo-JSON für Assistant erstellen (damit er Demo-Modus erkennt)
    const demoPayload = {
      prompt: prompt,
      step: step || 1,
      client: client || 'demo'
    };

    // Thread erstellen
    const thread = await openai.beta.threads.create();

    // Message zu Thread hinzufügen
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: JSON.stringify(demoPayload, null, 2)
    });

    // Run mit deinem Assistant starten
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID
    });

    // Warten bis Run completed
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    
    // Polling bis fertig (max 30 Sekunden)
    let attempts = 0;
    while (runStatus.status === 'running' && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      attempts++;
    }

    if (runStatus.status === 'completed') {
      // Messages aus Thread holen
      const messages = await openai.beta.threads.messages.list(thread.id);
      const assistantMessage = messages.data.find(msg => msg.role === 'assistant');
      
      if (assistantMessage && assistantMessage.content[0]?.text) {
        return res.status(200).json({
          response: assistantMessage.content[0].text.value,
          step: step,
          client: client,
          success: true
        });
      }
    }

    throw new Error(`Assistant run failed: ${runStatus.status}`);

  } catch (error) {
    console.error('OpenAI Assistant Error:', error);
    
    // Fallback response
    return res.status(200).json({
      response: `Liebe ${client === 'lisa' ? 'Frau Müller' : client === 'sarah' ? 'Frau Weber' : client === 'marcus' ? 'Herr Schmidt' : 'Herr Hoffmann'}, vielen Dank für Ihr Vertrauen. Als KI-Demo kann ich Ihnen zeigen, wie das triadische Coaching funktioniert. Ihre Herausforderung ist wichtig und verdient professionelle Begleitung. Ein echter Coach kann Ihnen noch viel gezielter helfen. Was beschäftigt Sie am meisten?`,
      step: step,
      client: client,
      fallback: true,
      error: error.message
    });
  }
}
