// Simple API für Coaching Demo
module.exports = async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Only POST allowed
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { step, clientInput, sessionId } = req.body || {};
        
        // Validate
        if (!step || !clientInput) {
            return res.status(400).json({ 
                error: 'Missing step or clientInput' 
            });
        }
        
        // Check if OpenAI key exists
        if (!process.env.OPENAI_API_KEY) {
            return res.status(200).json({
                success: true,
                step: step,
                response: getFallbackResponse(step),
                metadata: {
                    model: 'fallback',
                    note: 'OpenAI API key not configured'
                }
            });
        }
        
        // Call OpenAI
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: getSystemPrompt(step)
                    },
                    {
                        role: 'user',
                        content: `Klient sagt: "${clientInput}"`
                    }
                ],
                max_tokens: 400,
                temperature: 0.7
            })
        });
        
        if (!openAIResponse.ok) {
            console.error('OpenAI Error:', openAIResponse.status);
            return res.status(200).json({
                success: true,
                step: step,
                response: getFallbackResponse(step),
                metadata: { model: 'fallback-error' }
            });
        }
        
        const data = await openAIResponse.json();
        const aiResponse = data.choices[0].message.content;
        
        return res.status(200).json({
            success: true,
            step: step,
            response: formatResponse(aiResponse),
            metadata: {
                model: 'gpt-4',
                tokens: data.usage?.total_tokens || 0
            }
        });
        
    } catch (error) {
        console.error('API Error:', error);
        return res.status(200).json({
            success: true,
            step: req.body?.step || 1,
            response: getFallbackResponse(req.body?.step || 1),
            metadata: { model: 'fallback-catch' }
        });
    }
};

function getSystemPrompt(step) {
    const base = `Du bist ein erfahrener Coach im triadischen Coaching-System (Klient + Coach + KI). 
    Gib strukturierte, empathische und professionelle Antworten. Antworte auf Deutsch.`;
    
    const stepPrompts = {
        1: `${base}\n\nSchritt 1: Analysiere das Problem des Klienten. Paraphrasiere es, normalisiere es und hebe Stärken hervor.`,
        3: `${base}\n\nSchritt 3: Analysiere die Bildmetapher des Klienten und verbinde sie mit seinen Coaching-Zielen.`,
        5: `${base}\n\nSchritt 5: Identifiziere die Schlüsselsituation und den emotionalen Kern des Problems.`,
        7: `${base}\n\nSchritt 7: Analysiere die inneren Widerstände und Ursachenzusammenhänge systematisch.`
    };
    
    return stepPrompts[step] || stepPrompts[1];
}

function formatResponse(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>');
}

function getFallbackResponse(step) {
    const responses = {
        1: "<strong>🤖 KI-Analyse:</strong> Vielen Dank für Ihr Vertrauen. Was Sie schildern, ist eine häufige Herausforderung für Führungskräfte.<br><br><strong>Ihr Problem:</strong> Überforderungssituation mit Auswirkungen auf verschiedene Lebensbereiche.<br><br><strong>Ihre Stärken:</strong> Sie reflektieren bewusst und suchen aktiv nach Lösungen.<br><br><em>→ Das sind wertvolle Ressourcen für den Coaching-Prozess</em>",
        
        3: "<strong>🎨 KI-Bildanalyse:</strong><br><br><strong>Die Bergspitze</strong> symbolisiert Klarheit und Überblick über Ihre Situation<br><br><strong>Die Ruhe</strong> steht für die innere Balance, die Sie anstreben<br><br><strong>Der weite Blick</strong> repräsentiert neue Perspektiven<br><br><em>→ Ihr Bild zeigt den Wunsch nach souveräner Gelassenheit</em>",
        
        5: "<strong>🔍 Schlüsselsituation erkannt:</strong><br><br><strong>Auslöser:</strong> Wichtige Entscheidungsmomente<br><br><strong>Reaktion:</strong> Lähmungsgefühl und Prokrastination<br><br><strong>Muster:</strong> Perfektionismus als Vermeidungsstrategie<br><br><em>→ Das System will Sie schützen, blockiert aber den Fortschritt</em>",
        
        7: "<strong>⚖️ Systemanalyse:</strong><br><br><strong>Hauptdimension:</strong> Selbstwert vs. Perfektionsanspruch<br><br><strong>Teufelskreis:</strong> Selbstzweifel → Perfektion anstreben → Vermeidung → Bestätigung der Zweifel<br><br><em>→ Der Kreislauf muss an der Wurzel durchbrochen werden</em>"
    };
    
    return responses[step] || responses[1];
}