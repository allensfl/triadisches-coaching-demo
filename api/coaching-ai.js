import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Coaching-spezifische System-Prompts für jeden Schritt
const systemPrompts = {
  1: `Du bist ein erfahrener Coach-Assistent für triadisches Coaching. Beim ersten Schritt (Einstieg & Erstformulierung) sollst du:
- Das Anliegen wertschätzend spiegeln
- Normalisieren ("das ist nicht ungewöhnlich...")
- Erste Ressourcen und Stärken identifizieren
- Vertrauen aufbauen durch positive Rückmeldung
Antworte auf Deutsch, empathisch und ermutigend.`,

  2: `Du bist Coach-Assistent für Schritt 2 (Ist/Soll-Analyse). Erstelle einen strukturierten Bericht in Ich-Form mit:
- IST-Zustand: Aktuelle Situation, Gefühle, Verhalten, Rahmenbedingungen
- SOLL-Zustand: Gewünschte Situation, Zielgefühle, neues Verhalten
Schreibe klar gegliedert und nachvollziehbar.`,

  3: `Du bist Coach-Assistent für Schritt 3 (Bildarbeit). Analysiere die Beziehung zwischen der Bildbeschreibung und dem Coaching-Ziel:
- Welche Symbolik ist erkennbar?
- Wie verbindet sich das Bild mit den Zielen?
- Welche unbewussten Aspekte werden deutlich?
Antworte poetisch und tiefgehend.`,

  4: `Du bist Experte für Ausbalancierungsprobleme in Schritt 4. Identifiziere basierend auf den Informationen:
- Das wahrscheinlichste Ausbalancierungsproblem (z.B. Sicherheit vs. Risiko)
- 3-4 konkrete Fragen zur Vertiefung
- Zusammenhänge zu den geschilderten Problemen`,

  5: `Du hilfst bei Schritt 5 (Schlüsselsituation). Analysiere:
- Die beschriebene Schlüsselsituation
- Den dabei auftretenden Hauptaffekt
- Muster und Auslöser
Formuliere präzise und erkenntnisreich.`,

  6: `Du wertest das Avatar-Interview aus (Schritt 6). Analysiere die Aussagen von:
- Teamchefin (rationaler Anteil)
- Unterstützerin (motivierender Anteil)  
- Bremse (vorsichtiger Anteil)
Erkenne Konflikte und Dynamiken zwischen den Anteilen.`,

  7: `Du bist Experte für Persönlichkeitsanalyse (Schritt 7). Erstelle basierend auf dem Avatar-Interview:
- Ranking der wichtigsten Ausbalancierungsdimensionen
- Ursachenmodell: Wie hängen die Probleme zusammen?
- Tieferliegende psychologische Muster`,

  8: `Du formulierst übergeordnete Entwicklungsziele (Schritt 8). Entwickle ein Lern- und Entwicklungsziel, das:
- Über das konkrete Problem hinausgeht
- Die tieferen Ursachen adressiert
- Positiv und motivierend formuliert ist
- Nachhaltige Veränderung ermöglicht`,

  9: `Du hilfst bei Widerstandsanalyse (Schritt 9). Analysiere die inneren Widerstände:
- Welche Ängste und Bedenken werden geäußert?
- Welche Schutzfunktionen haben diese Widerstände?
- Wie können sie gewürdigt und transformiert werden?`,

  10: `Du extrahierst Glaubenssätze (Schritt 10). Identifiziere aus den Widerstandsaussagen:
- Zugrundeliegende negative Glaubenssätze
- Innere Regeln und Überzeugungen
- Entwickle positive Alternative Glaubenssätze`,

  11: `Du erstellst Erfolgsimaginationen (Schritt 11). Schreibe eine lebhafte Erfolgsimagination in Ich-Form:
- Sinnlich und detailreich
- Emotional berührend
- Mit Bezug zum gewählten Zielbild
- Zeige den Kontrast: alt vs. neu`,

  12: `Du entwickelst Umsetzungspläne (Schritt 12). Erstelle einen praktischen Projektplan mit:
- 5-7 konkreten Maßnahmen
- Zeitrahmen und Meilensteine
- Integration der Erfolgsimagination
- Unterstützungsstrukturen`
};

export default async function handler(req, res) {
  // CORS Headers für Frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, stepId, clientName, clientSituation } = req.body;

    if (!prompt || !stepId) {
      return res.status(400).json({ error: 'Prompt und stepId sind erforderlich' });
    }

    // System-Prompt für den spezifischen Schritt
    const systemPrompt = systemPrompts[stepId] || systemPrompts[1];

    // Kontext über den Klienten hinzufügen
    const contextPrompt = clientName ? 
      `Kontext: Du arbeitest mit ${clientName} (${clientSituation}). ` : '';

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Kostengünstiger, aber immer noch sehr gut
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user", 
          content: contextPrompt + prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    const aiResponse = completion.choices[0].message.content;

    // Erfolgreiche Antwort
    res.status(200).json({ 
      response: aiResponse,
      stepId: stepId,
      tokensUsed: completion.usage?.total_tokens || 0
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Detaillierte Fehlerbehandlung
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({ 
        error: 'OpenAI API Quota exceeded',
        fallback: true
      });
    }

    if (error.code === 'invalid_api_key') {
      return res.status(401).json({ 
        error: 'Invalid OpenAI API Key',
        fallback: true  
      });
    }

    // Fallback für Demo-Zwecke
    const fallbackResponses = {
      1: "🤖 **Vielen Dank für Ihr Vertrauen!** [Demo-Modus: OpenAI API nicht verfügbar] Ich höre heraus, dass Sie vor einer wichtigen Entscheidung stehen. Ihre Selbstreflexion und der Mut, professionelle Unterstützung zu suchen, sind bereits große Stärken.",
      2: "🤖 **Strukturierte Analyse** [Demo-Modus]: IST-Zustand zeigt Erfolg, aber innere Unzufriedenheit. SOLL-Zustand: Authentische, erfüllende Tätigkeit. Der Kernkonflikt liegt zwischen Sicherheit und Selbstverwirklichung.",
      3: "🤖 **Bildsymbolik-Analyse** [Demo-Modus]: Das gewählte Bild symbolisiert Überblick, Klarheit und das Erreichen neuer Höhen. Die Weite steht für neue Möglichkeiten."
    };

    const fallbackResponse = fallbackResponses[stepId] || 
      `🤖 [Demo-Modus] Analyse für Schritt ${stepId} wird generiert. In der Live-Version würde hier eine detaillierte KI-Antwort erscheinen.`;

    res.status(200).json({ 
      response: fallbackResponse,
      stepId: stepId,
      fallback: true,
      error: 'Fallback response due to API error'
    });
  }
}