// Template Repository Data
const templateRepository = [
    {
        title: "🌐 Systemische Zirkuläre Frage",
        keywords: ["systemisch", "zirkulär", "umfeld", "beziehung"],
        preview: "Wer in Ihrem Umfeld würde sagen...",
        prompt: "Entwickle 3-5 systemische zirkuläre Fragen für [PROBLEM]. Format: 'Wer würde...' oder 'Was würde [Person] sagen...'"
    },
    {
        title: "💪 Ressourcen-Aktivierung", 
        keywords: ["ressourcen", "stärken", "erfolg", "potentiale"],
        preview: "Erzählen Sie von einem Erfolg...",
        prompt: "Analysiere Stärken und Ressourcen in [SITUATION]. Erfolgsgeschichten, Bewältigungsstrategien, soziale Unterstützung."
    },
    {
        title: "⚖️ Skalierungsfrage",
        keywords: ["skalierung", "skala", "grad", "bewertung"], 
        preview: "Auf einer Skala von 1-10...",
        prompt: "Entwickle Skalierungsfragen für [THEMA]. Dimensionen: Klarheit, Motivation, Selbstvertrauen."
    },
    {
        title: "🎨 Metaphern-Arbeit",
        keywords: ["metapher", "bild", "symbol", "landschaft"],
        preview: "Wenn Ihre Situation ein Bild wäre...", 
        prompt: "Entwickle Metaphern-Fragen für [SITUATION]. Landschaft, Wetter, Reise, Gebäude, Tiere."
    },
    {
        title: "✨ Wunderfrage",
        keywords: ["wunder", "zukunft", "veränderung", "lösung"],
        preview: "Über Nacht geschieht ein Wunder...",
        prompt: "Formuliere detaillierte Wunderfrage für [PROBLEM]. Was wäre anders? Wer würde es merken?"
    },
    {
        title: "👥 Teile-Arbeit",
        keywords: ["teile", "anteile", "ambivalenz", "konflikt"],
        preview: "Ein Teil von Ihnen möchte...",
        prompt: "Analysiere innere Anteile bei [KONFLIKT]. Welche Stimmen? Welche Bedürfnisse?"
    },
    {
        title: "🔍 Ausnahmen erforschen",
        keywords: ["ausnahme", "unterschied", "besser", "anders"],
        preview: "Wann war es schon mal anders?",
        prompt: "Erfrage Ausnahmen vom Problem bei [SITUATION]. Wann besser? Was anders?"
    },
    {
        title: "🎯 Zielfokussierung",
        keywords: ["ziel", "fokus", "richtung", "zeichen"],
        preview: "Was wäre das erste Zeichen...",
        prompt: "Entwickle zielgerichtete Fragen für [ZIEL]. Konkrete Schritte, messbare Ergebnisse."
    },
    {
        title: "🔄 Reframing-Techniken",
        keywords: ["reframing", "perspektive", "umdeutung", "sichtweise"],
        preview: "Betrachten wir das aus einem anderen Blickwinkel...",
        prompt: "Entwickle Reframing-Optionen für [PROBLEM]. Alternative Sichtweisen, positive Umdeutungen."
    },
    {
        title: "🌱 Entwicklungsschritte",
        keywords: ["entwicklung", "wachstum", "schritte", "prozess"],
        preview: "Welcher kleine Schritt könnte der erste sein?",
        prompt: "Definiere konkrete Entwicklungsschritte für [ZIEL]. Kleine, erreichbare Meilensteine."
    }
];

// Client Data
const clients = {
    sarah: {
        name: "Sarah Weber",
        age: "35 Jahre, Marketing-Managerin", 
        problem: "Karrierewechsel-Entscheidung zwischen Sicherheit und Nachhaltigkeit",
        background: "10 Jahre Marketing-Erfahrung, träumt von nachhaltiger Arbeit"
    },
    marcus: {
        name: "Marcus Schmidt",
        age: "48 Jahre, Ingenieur",
        problem: "Midlife-Krise und Wunsch nach beruflicher Neuorientierung", 
        background: "20 Jahre in derselben Firma, fühlt sich unterfordert"
    },
    lisa: {
        name: "Dr. Lisa Müller",
        age: "42 Jahre, Ärztin",
        problem: "Work-Life-Balance als Chirurgin mit Familie",
        background: "Burnout-Symptome, liebt ihren Beruf aber Familie leidet"
    },
    werner: {
        name: "Werner Hoffmann", 
        age: "62 Jahre, Abteilungsleiter",
        problem: "Übergang in den Ruhestand und neue Lebenssinn-Findung",
        background: "Jahrzehntelange Führungsrolle, Angst vor Identitätsverlust"
    }
};

// 12 Coaching Steps
const coachingSteps = [
    { 
        id: 1, 
        title: "Ziel & Problem", 
        description: "Klares Coaching-Ziel definieren", 
        prompt: "Analysiere das Problem '[PROBLEM]' und entwickle präzise Fragen für ein messbares Coaching-Ziel." 
    },
    { 
        id: 2, 
        title: "IST-Zustand", 
        description: "Aktuelle Situation erfassen", 
        prompt: "Erfasse den IST-Zustand für '[PROBLEM]'. Auswirkungen auf Lebensbereiche identifizieren." 
    },
    { 
        id: 3, 
        title: "SOLL-Zustand", 
        description: "Gewünschte Zukunft konkretisieren", 
        prompt: "Entwickle den SOLL-Zustand für '[PROBLEM]'. Konkrete Vision mit messbaren Kriterien." 
    },
    { 
        id: 4, 
        title: "Hindernisse", 
        description: "Blockaden identifizieren", 
        prompt: "Identifiziere Hindernisse für '[PROBLEM]'. Interne Blockaden und externe Barrieren." 
    },
    { 
        id: 5, 
        title: "Ressourcen", 
        description: "Stärken erkennen", 
        prompt: "Analysiere Ressourcen für '[PROBLEM]'. Persönliche Stärken, Netzwerk, materielle Ressourcen." 
    },
    { 
        id: 6, 
        title: "Innere Stimmen", 
        description: "Persönlichkeitsanteile erforschen", 
        prompt: "Identifiziere innere Anteile bei '[PROBLEM]'. Ängstliche, mutige, rationale Stimmen." 
    },
    { 
        id: 7, 
        title: "Optionen", 
        description: "Lösungswege entwickeln", 
        prompt: "Entwickle 4-5 Optionen für '[PROBLEM]'. Von konservativ bis mutig." 
    },
    { 
        id: 8, 
        title: "Bewertung", 
        description: "Optionen abwägen", 
        prompt: "Pro/Contra-Analyse für '[PROBLEM]'. Umsetzbarkeit, Risiko, Erfolgschance." 
    },
    { 
        id: 9, 
        title: "Entscheidung", 
        description: "Beste Option wählen", 
        prompt: "Unterstütze Entscheidung für '[PROBLEM]'. Was passt zu Werten und Zielen?" 
    },
    { 
        id: 10, 
        title: "Maßnahmen", 
        description: "Konkrete Schritte planen", 
        prompt: "Maßnahmenplanung für '[PROBLEM]'. SMART-Ziele, erste Schritte." 
    },
    { 
        id: 11, 
        title: "Timeline", 
        description: "Zeitplan festlegen", 
        prompt: "Timeline für '[PROBLEM]'. Meilensteine, Deadlines, Pufferzeiten." 
    },
    { 
        id: 12, 
        title: "Commitment", 
        description: "Verbindlichkeit schaffen", 
        prompt: "Stärke Commitment für '[PROBLEM]'. Accountability, nächste Schritte." 
    }
];

// Client Response Templates
const clientResponses = {
    sarah: {
        1: "Ja, das ist genau mein Problem. Ich bin unsicher, ob ich den Wechsel in den nachhaltigen Sektor wagen soll. Die Sicherheit ist wichtig, aber ich fühle mich nicht mehr erfüllt.",
        2: "Aktuell bin ich Marketing-Managerin in einem großen Konzern. Das Gehalt ist gut, aber ich arbeite für Produkte, hinter denen ich nicht stehe.",
        3: "Mein Traum wäre es, für ein Unternehmen zu arbeiten, das wirklich etwas Positives bewegt. Vielleicht im Bereich erneuerbare Energien oder nachhaltige Mobilität.",
        4: "Meine größte Angst ist der Gehaltseinbruch. Und ich kenne mich in der nachhaltigen Branche noch nicht so gut aus.",
        5: "Ich habe ein gutes Netzwerk, bin kreativ und kann komplexe Themen gut kommunizieren. Das sollte übertragbar sein."
    },
    marcus: {
        1: "Ich fühle mich seit Monaten unzufrieden und gefangen. 20 Jahre in derselben Firma - das war mal mein Traumjob, aber jetzt langweile ich mich.",
        2: "Meine Aufgaben sind Routine geworden. Ich mache sie mit links, aber dabei fühle ich mich leer.",
        3: "Ich würde gerne wieder Herausforderungen haben, vielleicht sogar ein eigenes Team leiten oder in einem innovativeren Umfeld arbeiten.",
        4: "Das Alter ist ein Problem. Mit 48 stellt einen nicht jeder ein. Und ich habe Angst vor dem Unbekannten.",
        5: "Ich habe sehr viel Erfahrung, bin zuverlässig und kenne die Branche in- und auswendig."
    },
    lisa: {
        1: "Die Balance wird immer schwieriger. Ich liebe meinen Beruf als Chirurgin, aber die Familie leidet und ich merke, wie erschöpft ich werde.",
        2: "60-70 Stunden Wochen sind normal. Meine Kinder sehe ich oft nur abends kurz.",
        3: "Ich möchte weiterhin Chirurgin sein, aber mehr Zeit für meine Familie haben. Vielleicht weniger Notdienste oder eine andere Spezialisierung.",
        4: "Der Druck im Krankenhaus ist enorm. Und als Mutter hat man oft ein schlechtes Gewissen, wenn man nicht da ist.",
        5: "Ich bin sehr kompetent in meinem Fach, organisiert und kann unter Druck arbeiten. Meine Familie unterstützt mich."
    },
    werner: {
        1: "Der Ruhestand kommt näher und ich weiß nicht, ob ich mich freuen oder fürchten soll. 40 Jahre war meine Arbeit meine Identität.",
        2: "Als Abteilungsleiter war ich immer derjenige, der Entscheidungen getroffen hat. Wer bin ich ohne meinen Job?",
        3: "Ich würde gerne aktiv bleiben, vielleicht ehrenamtlich arbeiten oder jüngere Kollegen mentoren.",
        4: "Ich habe Angst vor der Langeweile und davor, nicht mehr gebraucht zu werden.",
        5: "Ich habe jahrzehntelange Führungserfahrung, ein großes Netzwerk und könnte mein Wissen gerne weitergeben."
    }
};

// Coaching Techniques
const coachingTechniques = {
    'Nachfrage': 'Das ist wichtig. Können Sie das genauer erklären?',
    'Spiegelung': 'Was ich höre ist, dass Sie sich in einem Konflikt befinden zwischen...',
    'Ressourcen': 'Was hat Ihnen in ähnlichen Situationen geholfen?',
    'Skalierung': 'Auf einer Skala von 1-10, wo stehen Sie heute bei diesem Thema?',
    'Wunderfrage': 'Stellen Sie sich vor, über Nacht geschieht ein Wunder...',
    'Reframing': 'Lassen Sie uns das mal aus einem anderen Blickwinkel betrachten...',
    'Ausnahmen': 'Wann war es schon mal anders? Was war in diesen Momenten anders?',
    'Teile': 'Ein Teil von Ihnen möchte... ein anderer Teil...',
    'Zielfokus': 'Was wäre das erste Zeichen dafür, dass Sie auf dem richtigen Weg sind?',
    'Metapher': 'Wenn Ihre Situation ein Wetter wäre, welches wäre das?'
};

// KI Response Templates
const kiResponseTemplates = {
    1: {
        title: "🎯 KI-Coaching-Analyse für {CLIENT}",
        content: `<strong>Zentrale Herausforderung:</strong> {PROBLEM}<br><br>
        <strong>Empfohlene Coaching-Fragen:</strong><br>
        • "Was würde sich für Sie wie ein Erfolg anfühlen?"<br>
        • "Welche Rolle spielt Sicherheit vs. Sinnhaftigkeit?"<br>
        • "In 5 Jahren - worauf möchten Sie zurückblicken?"<br><br>
        <strong>Coach-Strategie:</strong> Schaffen Sie Vertrauen und normalisieren Sie die Ambivalenz. Diese Unsicherheit ist völlig natürlich bei wichtigen Lebensentscheidungen.`
    },
    2: {
        title: "🔍 IST-Zustand Analyse für {CLIENT}",
        content: `<strong>Aktuelle Situation:</strong> Klassisches Übergangsdilemma zwischen bewährtem Pfad und neuen Möglichkeiten.<br><br>
        <strong>Zentrale Spannungsfelder:</strong><br>
        • Finanzielle Sicherheit ↔ Persönliche Werte<br>
        • Bewährtes ↔ Unbekanntes<br>
        • Externe Erwartungen ↔ Innere Stimme<br><br>
        <strong>Coach-Hinweis:</strong> Würdigen Sie die Komplexität dieser Entscheidung. Vermeiden Sie vorschnelle Lösungsvorschläge.`
    },
    3: {
        title: "🌟 SOLL-Zustand Vision für {CLIENT}",
        content: `<strong>Idealszenario:</strong><br>
        • Berufliche Tätigkeit in Übereinstimmung mit Werten<br>
        • Ausreichende finanzielle Sicherheit<br>
        • Tägliches Gefühl von Sinnhaftigkeit<br>
        • Langfristige Erfüllung und Wachstum<br><br>
        <strong>Coach-Tipp:</strong> Lassen Sie konkrete, sinnliche Bilder entstehen. "Beschreiben Sie einen typischen Arbeitstag in Ihrer Idealzukunft."`
    },
    4: {
        title: "🚧 Hindernisanalyse für {CLIENT}",
        content: `<strong>Identifizierte Barrieren:</strong><br>
        • Innere Blockaden: Ängste, Selbstzweifel, Komfortzone<br>
        • Externe Faktoren: Marktbedingungen, Alter, Qualifikationen<br>
        • Systemische Hürden: Familienerwartungen, finanzielle Verpflichtungen<br><br>
        <strong>Coach-Strategie:</strong> Trennen Sie beeinflussbare von nicht-beeinflussbaren Faktoren. Entwickeln Sie Strategien für überwindbare Hindernisse.`
    },
    5: {
        title: "💪 Ressourcen-Inventur für {CLIENT}",
        content: `<strong>Verfügbare Stärken:</strong><br>
        • Fachkompetenz und Erfahrung<br>
        • Persönliche Eigenschaften und Soft Skills<br>
        • Soziales Netzwerk und Unterstützung<br>
        • Materielle und finanzielle Ressourcen<br><br>
        <strong>Coach-Hinweis:</strong> Helfen Sie dabei, "unsichtbare" Ressourcen sichtbar zu machen. Viele Stärken werden als selbstverständlich betrachtet.`
    }
};

// Export configuration
const exportConfig = {
    formats: {
        markdown: {
            extension: '.md',
            mimeType: 'text/markdown'
        },
        json: {
            extension: '.json',
            mimeType: 'application/json'
        },
        pdf: {
            extension: '.pdf',
            mimeType: 'application/pdf'
        }
    },
    templates: {
        sessionReport: {
            title: 'Coach Mission Control - Session Report',
            sections: ['meta', 'notes', 'steps', 'collaboration']
        },
        managementReport: {
            title: 'Coach Mission Control - Management Summary',
            sections: ['executive', 'features', 'roi', 'recommendation']
        }
    }
};

// Application configuration
const appConfig = {
    version: '3.0',
    name: 'Coach Mission Control',
    description: 'Triadisches KI-Coaching System',
    collaboration: {
        urlParam: 'session',
        autoSaveInterval: 10000, // 10 seconds
        syncInterval: 1000 // 1 second
    },
    ui: {
        maxNotesDisplay: 5,
        chatMessagesHeight: 350,
        autoScrollDelay: 1000
    },
    sales: {
        earlyBirdPrice: 197,
        regularPrice: 497,
        currency: '€',
        contactEmail: 'info@coachmissioncontrol.com'
    }
};