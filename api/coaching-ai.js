import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, step, client, variables } = req.body;
    
    // Erstelle Demo-JSON für deinen Assistant
    const demoPayload = {
      prompt: prompt,
      step: step,
      client: client,
      variables: variables,
      mode: "demo"
    };

    // Erstelle Thread
    const thread = await openai.beta.threads.create();
    
    // Sende Message
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: JSON.stringify(demoPayload)
    });

    // Starte Run mit deiner Assistant ID
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: process.env.ASSISTANT_ID  // Deine Assistant ID hier
    });

    // Warte auf Completion
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    
    while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    if (runStatus.status === 'completed') {
      // Hole Messages
      const messages = await openai.beta.threads.messages.list(thread.id);
      const assistantMessage = messages.data.find(msg => msg.role === 'assistant');
      
      if (assistantMessage) {
        const response = assistantMessage.content[0].text.value;
        
        return res.status(200).json({
          response: response,
          status: 'success'
        });
      }
    }

    throw new Error('Assistant run failed');

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Fallback Response
    return res.status(200).json({
      response: "Entschuldigung, die KI-Verbindung ist momentan nicht verfügbar. Die App läuft im Demo-Modus mit intelligenten Fallback-Antworten.",
      status: 'fallback',
      error: error.message
    });
  }
}