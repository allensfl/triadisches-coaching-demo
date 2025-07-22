// api/coaching.js - OpenAI Integration für Triadisches Coaching
export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { step, clientInput, customPrompt, sessionId } = req.body;
        
        // Rate limiting (simple session-based)
        const rateLimitKey = sessionId || req.ip;
        const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '10');
        
        // Validate input
        if (!step || !clientInput) {
            return res.status(400).json({ 
                error: 'Missing required fields: step, clientInput' 
            });
        }
        
        // Get the appropriate system prompt for the step
        const systemPrompt = getSystemPromptForStep(step);
        
        // Create the full prompt
        const fullPrompt = customPrompt || getDefaultPromptForStep(step);
        
        // Call OpenAI API
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4', // oder 'gpt-3.5-turbo' für niedrigere Kosten
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user', 
                        content: `${fullPrompt}\n\nKlient sagt: "${clientInput}"`
                    }
                ],
                max_tokens: 500,
                temperature: 0.7,
                presence_penalty: 0.1,
                frequency_penalty: 0.1
            })
        });
        
        if (!openAIResponse.ok) {
            const error = await openAIResponse.json();
            console.error('OpenAI API Error:', error);
            return res.status(500).json({ 
                error: 'KI-Service temporär nicht verfügbar',
                fallback: getFallbackResponse(step)
            });
        }
        
        const data = await openAIResponse.json();
        const aiResponse = data.choices[0].message.content;
        
        // Format response for frontend
        const formattedResponse = formatResponseForStep(step, aiResponse);
        
        res.status(200).json({
            success: true,
            step: step,
            response: formattedResponse,
            metadata: {
                model: 'gpt-4',
                tokens: data.usage?.total_tokens || 0,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ 
            error: 'Interner Server-Fehler',
            fallback: getFallbackResponse(req.body.step || 1)
        });
    }
}

// System-Prompts für jeden Schritt
function getSystemPromptForStep(step) {
    const basePrompt = `Du bist ein erfahrener systemischer Coach mit Expertise im triadischen Coaching-System (ICH-DU-KONTEXT). 
    
Deine Aufgabe ist es, professionelle, einfühlsame und strukturierte Coaching-Antworten zu geben, die dem triadischen Ansatz folgen.

Grundprinzipien:
- ICH-Dimension: Innenwelt des Klienten (Gefühle, Gedanken, Glaubenssätze)
- DU-Dimension: Beziehungsebene (Kommunikation, Konflikte, Verbindungen)  
- KONTEXT-Dimension: Äußere Umstände (Beruf, Familie, Gesellschaft)

Antwortstil: Professionell, strukturiert, empathisch, lösungsorientiert.`;

    const stepSpecific = {
        1: `\nSchritt 1 - SYSTEMCHECK: Analysiere systematisch alle drei Dimensionen (ICH/DU/KONTEXT). Identifiziere Muster, Ressourcen und Entwicklungsfelder. Strukturiere deine Antwort klar nach den drei Dimensionen.`,
        
        3: `\nSchritt 3 - AVATAR-AUFSTELLUNG: Fokussiere auf die Beziehungsdynamiken und wichtigen Personen im System des Klienten. Erkenne Koalitionen, Distanzen und Machtstrukturen. Arbeite mit räumlichen Metaphern.`,
        
        5: `\nSchritt 5 - BILDARBEIT: Arbeite mit Metaphern, Symbolen und bildlichen Darstellungen. Erkunde die emotionale Landschaft des Klienten. Nutze kreative und intuitive Ansätze zur Problemexploration.`,
        
        7: `\nSchritt 7 - AUSBALANCIERUNG: Integriere die Erkenntnisse aus allen Dimensionen. Entwickle konkrete, umsetzbare Strategien für nachhaltige Balance. Fokussiere auf Rückfallprävention und Erfolgsmessung.`
    };
    
    return basePrompt + (stepSpecific[step] || stepSpecific[1]);
}

// Default-Prompts für jeden Schritt
function getDefaultPromptForStep(step) {
    const prompts = {
        1: `Analysiere die ICH-DU-KONTEXT-Dimensionen dieses Klienten systematisch:

1) ICH-Dimension: Emotionale Befindlichkeit, Glaubenssätze, Ressourcen, Blockaden
2) DU-Dimension: Beziehungsmuster, Kommunikationsstil, Konflikte, Bindungsqualität  
3) KONTEXT-Dimension: Berufliches Umfeld, familiäre Situation, äußere Belastungen

Strukturiere deine Antwort klar nach diesen drei Bereichen und gib konkrete Entwicklungsempfehlungen.`,

        3: `Führe eine Avatar-Aufstellung durch:

1) Identifiziere die wichtigsten Personen im System des Klienten
2) Analysiere deren Beziehungen und Positionen zueinander
3) Erkenne Koalitionen, Distanzen und Machtdynamiken
4) Arbeite mit räumlichen Metaphern ('nah', 'fern', 'zwischen')
5) Entwickle Empfehlungen für gewünschte Systemveränderungen

Fokussiere auf die Beziehungsdynamiken und deren Auswirkungen.`,

        5: `Leite eine Bildarbeit-Session an:

1) Lade den Klienten ein, seine Situation bildlich zu beschreiben
2) Erkunde Farben, Formen, Atmosphäre der inneren Landschaft
3) Frage nach Bewegung oder Stillstand im Bild
4) Erkunde die Rolle des Klienten im eigenen Bild
5) Entwickle gemeinsam ein Zielbild für die gewünschte Veränderung

Arbeite metaphorisch und intuitiv, um neue Perspektiven zu eröffnen.`,

        7: `Entwickle eine Ausbalancierungs-Strategie:

1) Integriere alle Erkenntnisse aus ICH-DU-KONTEXT
2) Identifiziere die wichtigsten Prioritäten  
3) Definiere konkrete, umsetzbare erste Schritte
4) Plane Rückfallprävention und Erfolgsmessung
5) Schaffe nachhaltige Balance zwischen allen drei Dimensionen

Achte auf Überforderungsschutz und realistische Umsetzbarkeit.`
    };
    
    return prompts[step] || prompts[1];
}

// Response-Formatierung für jeden Schritt
function formatResponseForStep(step, rawResponse) {
    // Basis-HTML-Formatierung
    let formatted = rawResponse
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>');
    
    // Schritt-spezifische Formatierung
    switch(step) {
        case 1:
            // ICH/DU/KONTEXT-Struktur hervorheben
            formatted = formatted
                .replace(/ICH-Dimension:/g, '<strong style="color: var(--apple-blue)">🧠 ICH-Dimension:</strong>')
                .replace(/DU-Dimension:/g, '<strong style="color: var(--apple-green)">👥 DU-Dimension:</strong>')
                .replace(/KONTEXT-Dimension:/g, '<strong style="color: var(--apple-orange)">🌍 KONTEXT-Dimension:</strong>');
            break;
            
        case 3:
            // Avatar-Elemente hervorheben
            formatted = formatted.replace(/🎭/g, '<span style="font-size: 1.2em;">🎭</span>');
            break;
            
        case 5:
            // Bildhafte Elemente hervorheben
            formatted = formatted.replace(/(🌲|🌿|👥|🎨|🖼️)/g, '<span style="font-size: 1.2em;">$1</span>');
            break;
            
        case 7:
            // Checkmarks und Strategien hervorheben
            formatted = formatted
                .replace(/✅/g, '<span style="color: var(--apple-green); font-size: 1.1em;">✅</span>')
                .replace(/→/g, '<span style="color: var(--apple-blue);">→</span>');
            break;
    }
    
    return formatted;
}

// Fallback-Responses falls API nicht verfügbar
function getFallbackResponse(step) {
    const fallbacks = {
        1: "<strong>🧠 ICH-Dimension:</strong> Überforderung und emotionale Belastung erkennbar<br><br><strong>👥 DU-Dimension:</strong> Kommunikationsprobleme im Team und privat<br><br><strong>🌍 KONTEXT-Dimension:</strong> Beruflicher Stress und Work-Life-Balance gestört<br><br><em>→ Empfehlung: Fokus auf Stressmanagement und Kommunikation</em>",
        
        3: "🎭 <strong>Wichtige Akteure identifiziert:</strong><br><br>• Team-Mitglieder: Verschiedene Rollen und Distanzen<br>• Führungsebene: Unterstützung unklar<br>• Privates Umfeld: Belastung spürbar<br><br><em>→ Empfehlung: Beziehungsqualität stärken</em>",
        
        5: "🎨 <strong>Bildhafte Darstellung:</strong><br><br>Die aktuelle Situation gleicht einem Labyrinth - viele Wege, aber der Ausgang ist nicht sichtbar. Die Wände repräsentieren Hindernisse und Blockaden.<br><br><em>→ Zielbild: Ein klarer Pfad mit Orientierungspunkten</em>",
        
        7: "✅ <strong>Ausbalancierungs-Plan:</strong><br><br>• Prioritäten neu definieren<br>• Kommunikationsroutinen etablieren<br>• Selbstfürsorge-Zeiten blocken<br>• Wöchentliche Reflexion einführen<br><br><em>→ Nachhaltigkeit durch kleine, konsequente Schritte</em>"
    };
    
    return fallbacks[step] || fallbacks[1];
}