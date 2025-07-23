// Global Variables
let selectedClient = null;
let currentStep = 1;
let currentEditingStep = 1;
let sessionStartTime = null;
let sessionNotes = [];
let sessionId = null;

// Check if we're in collaboration mode
const urlParams = new URLSearchParams(window.location.search);
const isCollaborationMode = urlParams.has('session') || window.location.pathname.includes('/session/');

if (isCollaborationMode) {
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('collaborationMode').style.display = 'block';
    document.body.className = 'collaboration-mode';
    initCollaborationMode();
}

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    if (!isCollaborationMode) {
        updateTime();
        setInterval(updateTime, 1000);
        generateStepsNavigation();
        loadTemplates();
        generateSessionId();
        initializeAutoSave();
    }
});

// Session Management
function generateSessionId() {
    sessionId = 'CMC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    updateCollaborationLink();
}

function updateCollaborationLink() {
    const baseUrl = window.location.origin + window.location.pathname;
    const collaborationUrl = `${baseUrl}?session=${sessionId}`;
    const linkElement = document.getElementById('collaborationLink');
    if (linkElement) {
        linkElement.textContent = collaborationUrl;
    }
}

function copyCollaborationLink() {
    const linkElement = document.getElementById('collaborationLink');
    if (!linkElement) return;
    
    navigator.clipboard.writeText(linkElement.textContent).then(() => {
        // Visual feedback
        const originalText = linkElement.textContent;
        const originalBg = linkElement.style.background;
        
        linkElement.textContent = '✅ Link kopiert!';
        linkElement.style.background = 'rgba(16, 185, 129, 0.3)';
        
        setTimeout(() => {
            linkElement.textContent = originalText;
            linkElement.style.background = originalBg;
        }, 2000);
    }).catch(() => {
        // Fallback for older browsers
        alert('Link: ' + linkElement.textContent);
    });
}

function openCollaborationWindow() {
    const collaborationUrl = document.getElementById('collaborationLink').textContent;
    window.open(collaborationUrl, 'CoachingCollaboration', 'width=900,height=700,scrollbars=yes,resizable=yes');
}

// Collaboration Mode Functions
function initCollaborationMode() {
    const sessionParam = urlParams.get('session') || window.location.pathname.split('/session/')[1];
    const sessionIdElement = document.getElementById('collaborationSessionId');
    if (sessionIdElement) {
        sessionIdElement.textContent = sessionParam || 'DEMO';
    }
    
    startCollaborationListener();
}

function startCollaborationListener() {
    setInterval(() => {
        checkForCollaborationUpdates();
    }, appConfig.collaboration.syncInterval);
}

function checkForCollaborationUpdates() {
    try {
        const collaborationData = localStorage.getItem('collaborationData');
        if (collaborationData) {
            const data = JSON.parse(collaborationData);
            updateCollaborationDisplay(data);
        }
    } catch (e) {
        console.warn('Collaboration sync error:', e);
    }
}

function updateCollaborationDisplay(data) {
    const promptElement = document.getElementById('collaborationPromptText');
    const responseElement = document.getElementById('collaborationResponseText');
    
    if (data.prompt && promptElement) {
        promptElement.innerHTML = `
            <div style="background: #f8faff; padding: 15px; border-radius: 8px; border: 1px solid #667eea;">
                ${data.prompt.replace(/\n/g, '<br>')}
            </div>
        `;
    }
    
    if (data.response && responseElement) {
        responseElement.innerHTML = `
            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #10b981;">
                ${data.response}
            </div>
        `;
    } else if (data.loading && responseElement) {
        responseElement.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>KI analysiert den Prompt...</p>
            </div>
        `;
    }
}

// Client Selection
function selectClient(clientId) {
    if (!clients[clientId]) return;
    
    // Remove previous selection
    document.querySelectorAll('.client-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Add selection to clicked card
    const selectedCard = document.querySelector(`[onclick="selectClient('${clientId}')"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    selectedClient = clientId;
    
    // Activate start button
    const startButton = document.getElementById('startButton');
    if (startButton) {
        startButton.classList.add('active');
        startButton.textContent = `🚀 Demo mit ${clients[clientId].name} starten`;
    }
}

function startSession() {
    if (!selectedClient) return;

    sessionStartTime = new Date();
    
    // Hide client selection, show dashboard
    document.getElementById('clientSelection').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    
    // Update session title
    const titleElement = document.getElementById('sessionTitle');
    if (titleElement) {
        titleElement.textContent = `Coach Mission Control - Demo mit ${clients[selectedClient].name}`;
    }

    // Initialize chat
    addChatMessage('coach', `Hallo ${clients[selectedClient].name}, willkommen zu unserem Coaching! Lassen Sie uns mit der Zieldefinition beginnen.`);
    
    setTimeout(() => {
        addChatMessage('client', getClientResponse(1));
    }, 2000);

    // Set current step and add welcome note
    setCurrentStep(1);
    addSystemNote('Demo-Session gestartet mit ' + clients[selectedClient].name, 'custom');
}

// Steps Navigation
function generateStepsNavigation() {
    const stepsGrid = document.getElementById('stepsGrid');
    if (!stepsGrid) return;
    
    stepsGrid.innerHTML = '';

    coachingSteps.forEach(step => {
        const stepButton = document.createElement('div');
        stepButton.className = 'step-button';
        stepButton.dataset.step = step.id;
        stepButton.innerHTML = `<strong>${step.id}</strong><br>${step.title}`;
        stepButton.addEventListener('click', () => setCurrentStep(step.id));
        stepsGrid.appendChild(stepButton);
    });
}

function setCurrentStep(stepId) {
    if (stepId < 1 || stepId > 12) return;
    
    currentStep = stepId;
    
    // Update step buttons
    document.querySelectorAll('.step-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[data-step="${stepId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // Update current step info
    const step = coachingSteps.find(s => s.id === stepId);
    if (step) {
        updateCurrentStepInfo(step);
        updateCoachTools(step);
    }
}

function updateCurrentStepInfo(step) {
    const stepInfo = document.getElementById('currentStepInfo');
    if (!stepInfo) return;
    
    stepInfo.innerHTML = `
        <div class="step-title">Schritt ${step.id}: ${step.title}</div>
        <div class="step-description">${step.description}</div>
        <div class="action-buttons">
            <button class="btn btn-primary" onclick="editPrompt(${step.id})">✏️ KI-Prompt mit Coachee bearbeiten</button>
            <button class="btn btn-secondary" onclick="nextStep()">⏭️ Nächster Schritt</button>
        </div>
    `;
}

function updateCoachTools(step) {
    const coachTools = document.getElementById('coachTools');
    if (!coachTools) return;
    
    coachTools.innerHTML = `
        <div class="tool-section">
            <h4>🎯 Aktueller Fokus: ${step.title}</h4>
            <p style="font-size: 0.8em; color: #666;">${step.description}</p>
        </div>
        <div class="tool-section">
            <h4>💡 Coach-Techniken</h4>
            <button class="btn btn-secondary" onclick="addCoachNote('Nachfrage')" style="width:100%; margin-bottom:5px; font-size:0.8em;">❓ Nachfragen</button>
            <button class="btn btn-secondary" onclick="addCoachNote('Spiegelung')" style="width:100%; margin-bottom:5px; font-size:0.8em;">🪞 Spiegeln</button>
            <button class="btn btn-secondary" onclick="addCoachNote('Ressourcen')" style="width:100%; margin-bottom:5px; font-size:0.8em;">💪 Ressourcen</button>
        </div>
        <div class="tool-section">
            <h4>📊 Session-Info</h4>
            <p style="font-size: 0.8em;">Client: ${selectedClient ? clients[selectedClient].name : 'Nicht gewählt'}</p>
            <p style="font-size: 0.8em;">Schritt: ${step.id}/12</p>
            <p style="font-size: 0.8em;">Notizen: ${sessionNotes.length}</p>
            <p style="font-size: 0.8em;">Session: ${sessionId || 'Nicht gestartet'}</p>
        </div>
    `;
}

function nextStep() {
    if (currentStep < 12) {
        setCurrentStep(currentStep + 1);
        addChatMessage('coach', `Gut, dann gehen wir zu Schritt ${currentStep} über.`);
    }
}

// Template System
function loadTemplates() {
    const templateList = document.getElementById('templateList');
    if (!templateList) return;
    
    templateList.innerHTML = templateRepository.map(template => `
        <div class="template-item" onclick="useTemplate('${template.title}')">
            <div class="template-title">${template.title}</div>
            <div class="template-preview">${template.preview}</div>
        </div>
    `).join('');
}

function filterTemplates() {
    const searchTerm = document.getElementById('templateSearch')?.value.toLowerCase() || '';
    const templateList = document.getElementById('templateList');
    if (!templateList) return;
    
    const filteredTemplates = templateRepository.filter(template => 
        template.keywords.some(keyword => keyword.includes(searchTerm)) ||
        template.title.toLowerCase().includes(searchTerm) ||
        template.preview.toLowerCase().includes(searchTerm)
    );
    
    templateList.innerHTML = filteredTemplates.map(template => `
        <div class="template-item" onclick="useTemplate('${template.title}')">
            <div class="template-title">${template.title}</div>
            <div class="template-preview">${template.preview}</div>
        </div>
    `).join('');
}

function useTemplate(title) {
    const template = templateRepository.find(t => t.title === title);
    if (template) {
        addChatMessage('coach', `🎯 [${template.title}] ${template.preview}`);
        addSystemNote(`Template verwendet: ${template.title}`, 'intervention');
    }
}

// Notes System
function addQuickNote(type) {
    const prompts = {
        observation: 'Was beobachten Sie beim Klienten?',
        intervention: 'Welche Intervention setzen Sie ein?', 
        resource: 'Welche Ressource wird sichtbar?',
        hypothesis: 'Welche Hypothese entwickeln Sie?'
    };
    
    const userInput = prompt(prompts[type]);
    if (userInput && userInput.trim()) {
        addSystemNote(userInput.trim(), type);
    }
}

function addSystemNote(text, type) {
    const note = {
        id: Date.now() + Math.random(),
        timestamp: new Date(),
        type: type,
        text: text,
        step: currentStep
    };
    
    sessionNotes.push(note);
    renderNotes();
}

function renderNotes() {
    const notesList = document.getElementById('notesList');
    if (!notesList) return;
    
    if (sessionNotes.length === 0) {
        notesList.innerHTML = '<div style="text-align: center; color: #666; font-style: italic; font-size: 0.8em;">Noch keine Notizen...</div>';
        return;
    }
    
    const notesHTML = sessionNotes
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, appConfig.ui.maxNotesDisplay)
        .map(note => {
            const timeStr = note.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
            const typeIcon = {
                observation: '👁️',
                intervention: '⚡',
                resource: '💪',
                hypothesis: '🧠',
                custom: '📝'
            };
            
            return `
                <div class="note-item note-${note.type}">
                    <div class="note-timestamp">
                        ${typeIcon[note.type] || '📝'} ${timeStr} - S${note.step}
                    </div>
                    <div style="margin-top: 4px; font-size: 0.8em;">${note.text}</div>
                </div>
            `;
        }).join('');
    
    notesList.innerHTML = notesHTML;
}

// Chat System
function addChatMessage(sender, message) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const timestamp = new Date().toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageDiv.innerHTML = `
        <div class="timestamp">${timestamp}</div>
        <div class="text">${message}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getClientResponse(step) {
    if (!selectedClient || !clientResponses[selectedClient]) {
        return "Das ist ein wichtiger Punkt. Darüber muss ich nachdenken.";
    }
    
    return clientResponses[selectedClient][step] || 
           "Das ist interessant. Lassen Sie mich darüber nachdenken.";
}

function addCoachNote(technique) {
    if (!coachingTechniques[technique]) return;
    
    const message = coachingTechniques[technique];
    addChatMessage('coach', message);
    addSystemNote(`Technik: ${technique}`, 'intervention');
}

// Collaborative Prompt System
function editPrompt(stepId) {
    currentEditingStep = stepId;
    const step = coachingSteps.find(s => s.id === stepId);
    if (!step) return;
    
    const promptTextElement = document.getElementById('promptText');
    if (promptTextElement) {
        promptTextElement.value = step.prompt;
    }
    
    // Clear variables
    ['var1', 'var2', 'var3'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
    
    // Hide response section and show modal
    const responseSection = document.getElementById('kiResponseSection');
    if (responseSection) responseSection.style.display = 'none';
    
    const modal = document.getElementById('promptModal');
    if (modal) modal.style.display = 'block';
    
    // Update collaboration display immediately
    updateCollaborationPrompt();
}

function updateCollaborationPrompt() {
    const promptText = document.getElementById('promptText')?.value || '';
    const var1 = document.getElementById('var1')?.value || '';
    const var2 = document.getElementById('var2')?.value || '';
    const var3 = document.getElementById('var3')?.value || '';

    let finalPrompt = promptText
        .replace(/\[PROBLEM\]/g, var1 || `[Problem: ${selectedClient ? clients[selectedClient].problem : 'wird noch definiert'}]`)
        .replace(/\[DETAILS\]/g, var2 || '[Details: werden noch ergänzt]')
        .replace(/\[KONTEXT\]/g, var3 || '[Kontext: wird noch spezifiziert]');

    // Save to localStorage for collaboration window
    try {
        localStorage.setItem('collaborationData', JSON.stringify({
            prompt: finalPrompt,
            timestamp: new Date(),
            step: currentEditingStep
        }));
    } catch (e) {
        console.warn('Could not save collaboration data:', e);
    }
}

function closePromptModal() {
    const modal = document.getElementById('promptModal');
    if (modal) modal.style.display = 'none';
}

function resetPrompt() {
    const step = coachingSteps.find(s => s.id === currentEditingStep);
    if (!step) return;
    
    const promptTextElement = document.getElementById('promptText');
    if (promptTextElement) {
        promptTextElement.value = step.prompt;
    }
    
    ['var1', 'var2', 'var3'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
    
    updateCollaborationPrompt();
}

async function sendCollaborativePromptToKI() {
    const promptText = document.getElementById('promptText')?.value || '';
    const var1 = document.getElementById('var1')?.value || '';
    const var2 = document.getElementById('var2')?.value || '';
    const var3 = document.getElementById('var3')?.value || '';

    let finalPrompt = promptText
        .replace(/\[PROBLEM\]/g, var1 || (selectedClient ? clients[selectedClient].problem : 'Unbekanntes Problem'))
        .replace(/\[DETAILS\]/g, var2 || (selectedClient ? clients[selectedClient].background : 'Keine Details'))
        .replace(/\[KONTEXT\]/g, var3 || 'Coaching-Kontext');

    // Show loading in both windows
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) loadingIndicator.classList.add('show');
    
    const responseSection = document.getElementById('kiResponseSection');
    if (responseSection) responseSection.style.display = 'none';
    
    // Update collaboration window with loading state
    try {
        localStorage.setItem('collaborationData', JSON.stringify({
            prompt: finalPrompt,
            loading: true,
            timestamp: new Date()
        }));
    } catch (e) {}

    try {
        // Simulate API call with realistic delay
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
        
        const response = generateSmartResponse(currentEditingStep, selectedClient, var1, var2, var3);
        
        if (loadingIndicator) loadingIndicator.classList.remove('show');
        
        const responseText = document.getElementById('kiResponseText');
        if (responseText) responseText.innerHTML = response;
        
        if (responseSection) responseSection.style.display = 'block';
        
        // Update collaboration window with response
        try {
            localStorage.setItem('collaborationData', JSON.stringify({
                prompt: finalPrompt,
                response: response,
                timestamp: new Date()
            }));
        } catch (e) {}
        
    } catch (error) {
        console.error('KI request error:', error);
        
        if (loadingIndicator) loadingIndicator.classList.remove('show');
        
        const responseText = document.getElementById('kiResponseText');
        if (responseText) {
            responseText.innerHTML = 'Fehler bei der KI-Anfrage. Bitte versuchen Sie es erneut.';
        }
        
        if (responseSection) responseSection.style.display = 'block';
    }
}

function generateSmartResponse(step, client, var1, var2, var3) {
    if (!client || !clients[client]) {
        return `<strong>🤖 KI-Coaching-Analyse Schritt ${step}:</strong><br><br>
        Professionelle Unterstützung für Ihren Coaching-Prozess.<br><br>
        <em>In der Vollversion erhalten Sie hier detaillierte, personalisierte KI-Analysen.</em>`;
    }
    
    const clientName = clients[client].name;
    const problem = var1 || clients[client].problem;
    
    const responses = {
        1: `<strong>🎯 KI-Coaching-Analyse für ${clientName}:</strong><br><br>
        <strong>Zentrale Herausforderung:</strong> ${problem}<br><br>
        <strong>Empfohlene Coaching-Fragen:</strong><br>
        • "Was würde sich für Sie wie ein Erfolg anfühlen?"<br>
        • "Welche Rolle spielt Sicherheit vs. Sinnhaftigkeit?"<br>
        • "In 5 Jahren - worauf möchten Sie zurückblicken?"<br><br>
        <strong>Coach-Strategie:</strong> Schaffen Sie Vertrauen und normalisieren Sie die Ambivalenz. Diese Unsicherheit ist völlig natürlich bei wichtigen Lebensentscheidungen.`,
        
        2: `<strong>🔍 IST-Zustand Analyse für ${clientName}:</strong><br><br>
        <strong>Aktuelle Situation:</strong> Klassisches Übergangsdilemma zwischen bewährtem Pfad und neuen Möglichkeiten.<br><br>
        <strong>Zentrale Spannungsfelder:</strong><br>
        • Finanzielle Sicherheit ↔ Persönliche Werte<br>
        • Bewährtes ↔ Unbekanntes<br>
        • Externe Erwartungen ↔ Innere Stimme<br><br>
        <strong>Coach-Hinweis:</strong> Würdigen Sie die Komplexität dieser Entscheidung. Vermeiden Sie vorschnelle Lösungsvorschläge.`,
        
        3: `<strong>🌟 SOLL-Zustand Vision für ${clientName}:</strong><br><br>
        <strong>Idealszenario:</strong><br>
        • Berufliche Tätigkeit in Übereinstimmung mit Werten<br>
        • Ausreichende finanzielle Sicherheit<br>
        • Tägliches Gefühl von Sinnhaftigkeit<br>
        • Langfristige Erfüllung und Wachstum<br><br>
        <strong>Coach-Tipp:</strong> Lassen Sie konkrete, sinnliche Bilder entstehen. "Beschreiben Sie einen typischen Arbeitstag in Ihrer Idealzukunft."`
    };
    
    return responses[step] || `<strong>🤖 KI-Coaching-Analyse Schritt ${step}:</strong><br><br>
    Professionelle Unterstützung für ${clientName} bei der Herausforderung "${problem}".<br><br>
    <strong>In der Vollversion:</strong> Hier erhalten Sie detaillierte, personalisierte KI-Analysen basierend auf modernsten Coaching-Methoden.<br><br>
    <em>Diese Demo zeigt nur einen kleinen Ausschnitt der Möglichkeiten.</em>`;
}

function adoptCollaborativeResponse() {
    const responseText = document.getElementById('kiResponseText');
    if (!responseText) return;
    
    const response = responseText.innerHTML;
    addChatMessage('ai', response);
    
    // Update coach instructions
    const instructionsDiv = document.getElementById('coachInstructions');
    if (instructionsDiv && selectedClient) {
        instructionsDiv.innerHTML = `<strong>🎯 Coaching-Strategie:</strong><br>
        Die KI-Analyse ist nun für ${clients[selectedClient].name} sichtbar. 
        Beobachten Sie die Reaktion und vertiefen Sie die wichtigsten Punkte durch gezielte Nachfragen.
        <br><br><strong>Nächste Schritte:</strong><br>
        • Reaktion abwarten und spiegeln<br>
        • Einen Aspekt vertiefen<br>
        • Bei Bedarf konkretisieren`;
    }
    
    closePromptModal();
    addSystemNote(`KI-Analyse für Schritt ${currentEditingStep} gemeinsam erarbeitet`, 'intervention');
    
    setTimeout(() => {
        if (currentStep < 12) {
            setCurrentStep(currentStep + 1);
        }
    }, appConfig.ui.autoScrollDelay);
}

function retryPrompt() {
    sendCollaborativePromptToKI();
}

// Modal Functions
function showSalesModal() {
    const modal = document.getElementById('salesModal');
    if (modal) modal.style.display = 'block';
}

function closeSalesModal() {
    const modal = document.getElementById('salesModal');
    if (modal) modal.style.display = 'none';
}

function showExportModal() {
    const modal = document.getElementById('exportModal');
    if (modal) modal.style.display = 'block';
}

function closeExportModal() {
    const modal = document.getElementById('exportModal');
    if (modal) modal.style.display = 'none';
}

// Export Functions
function exportNotes() {
    if (sessionNotes.length === 0) {
        alert('Keine Notizen zum Exportieren vorhanden.');
        return;
    }
    
    const sessionDuration = sessionStartTime ? Math.round((new Date() - sessionStartTime) / 60000) : 0;
    
    let markdown = `# Coach Mission Control - Demo Session\n\n`;
    markdown += `**Klient:** ${selectedClient ? clients[selectedClient].name : 'Unbekannt'}\n`;
    markdown += `**Session-ID:** ${sessionId}\n`;
    markdown += `**Datum:** ${new Date().toLocaleDateString('de-DE')}\n`;
    markdown += `**Dauer:** ${sessionDuration} Minuten\n`;
    markdown += `**Schritt:** ${currentStep}/12\n\n`;
    
    markdown += `## 📝 Session-Notizen\n\n`;
    
    sessionNotes.forEach(note => {
        const timeStr = note.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        const typeIcon = { observation: '👁️', intervention: '⚡', resource: '💪', hypothesis: '🧠', custom: '📝' };
        markdown += `**${timeStr} (S${note.step}) ${typeIcon[note.type] || '📝'}:** ${note.text}\n\n`;
    });
    
    markdown += `---\n*Erstellt mit Coach Mission Control Demo - Triadisches Coaching*`;
    
    downloadFile(markdown, `Coach-Demo-${selectedClient || 'session'}-${sessionId}-${new Date().toISOString().split('T')[0]}.md`, 'text/markdown');
    closeExportModal();
}

function exportSession() {
    const sessionData = {
        meta: {
            sessionId: sessionId,
            client: selectedClient ? clients[selectedClient] : null,
            startTime: sessionStartTime,
            currentStep: currentStep,
            duration: sessionStartTime ? Math.round((new Date() - sessionStartTime) / 60000) : 0,
            version: appConfig.version
        },
        notes: sessionNotes,
        collaboration: {
            linkGenerated: !!sessionId,
            collaborationData: (() => {
                try {
                    return JSON.parse(localStorage.getItem('collaborationData') || '{}');
                } catch (e) {
                    return {};
                }
            })()
        },
        messages: Array.from(document.querySelectorAll('.message')).map(msg => ({
            sender: msg.className.replace('message ', ''),
            text: msg.querySelector('.text')?.textContent || '',
            timestamp: msg.querySelector('.timestamp')?.textContent || ''
        }))
    };
    
    downloadFile(
        JSON.stringify(sessionData, null, 2), 
        `Coach-Session-${selectedClient || 'demo'}-${sessionId}-${new Date().toISOString().split('T')[0]}.json`, 
        'application/json'
    );
    closeExportModal();
}

function exportDemo() {
    const sessionDuration = sessionStartTime ? Math.round((new Date() - sessionStartTime) / 60000) : 0;
    
    let report = `# Coach Mission Control - Triadisches Coaching Demo\n\n`;
    report += `## 🎯 Management Summary\n\n`;
    report += `**System:** Coach Mission Control - Triadisches KI-Coaching mit Real-Time Kollaboration\n`;
    report += `**Demo-Klient:** ${selectedClient ? clients[selectedClient].name : 'Nicht gewählt'}\n`;
    report += `**Session-ID:** ${sessionId}\n`;
    report += `**Demo-Dauer:** ${sessionDuration} Minuten\n`;
    report += `**Durchgeführte Schritte:** ${currentStep}/12\n\n`;
    
    report += `## ✅ Getestete Kernfunktionen:\n\n`;
    report += `**🔗 Triadisches Coaching:** Coach + Klient + KI in separaten Fenstern\n`;
    report += `**📱 Real-Time Kollaboration:** Live-Synchronisation zwischen Coach und Coachee\n`;
    report += `**🎛️ 12-Schritte-Methodik:** Strukturierter Coaching-Prozess\n`;
    report += `**🤖 KI-Integration:** Gemeinsame Prompt-Entwicklung und Analyse\n`;
    report += `**📚 Template-Repository:** Professionelle Coaching-Techniken\n`;
    report += `**📝 Live-Notizen-System:** Dokumentation während der Session\n`;
    report += `**📊 Export-Funktionen:** Professionelle Dokumentation\n\n`;
    
    report += `## 🚀 Innovations-Vorteile:\n\n`;
    report += `• **Revolutionärer Ansatz:** Weltweit erstes triadisches Coaching-System\n`;
    report += `• **Transparency:** Coachee sieht KI-Prompts und Analysen live\n`;
    report += `• **Collaboration:** Gemeinsame Entwicklung der Coaching-Fragen\n`;
    report += `• **Trust Building:** Transparenz schafft Vertrauen und Buy-In\n`;
    report += `• **Efficiency:** 60% weniger Vorbereitungszeit durch KI-Unterstützung\n\n`;
    
    report += `## 💰 ROI-Potentiale:\n\n`;
    report += `• **Zeitersparnis:** 40% weniger Vorbereitung durch Templates\n`;
    report += `• **Qualitätssteigerung:** KI-unterstützte Interventionsvorschläge\n`;
    report += `• **Transparenz:** Höhere Kundenzufriedenheit durch Einbeziehung\n`;
    report += `• **Skalierung:** Mehr Klienten bei gleichbleibend hoher Qualität\n`;
    report += `• **Differenzierung:** Einzigartiges Angebot am Markt\n\n`;
    
    report += `## 🎯 Strategische Empfehlung:\n\n`;
    report += `Coach Mission Control ist ein **Game Changer** für die Coaching-Branche. `;
    report += `Das triadische System schafft eine neue Qualität der Zusammenarbeit zwischen Coach, Klient und KI.\n\n`;
    
    report += `**Investment:** ${appConfig.sales.earlyBirdPrice}${appConfig.sales.currency} einmalig (Early-Bird, später ${appConfig.sales.regularPrice}${appConfig.sales.currency})\n`;
    report += `**ROI:** Break-even bereits nach 1-2 Coaching-Sessions\n`;
    report += `**Competitive Advantage:** 12-18 Monate Vorsprung vor Konkurrenz\n\n`;
    
    report += `**🚀 Empfehlung:** Sofortige Implementierung für Marktführerschaft in KI-gestütztem Coaching.\n\n`;
    
    report += `---\n*Demo durchgeführt am ${new Date().toLocaleDateString('de-DE')} | Session: ${sessionId}*`;
    
    downloadFile(report, `Coach-Mission-Control-Triadisch-Demo-Bericht-${new Date().toISOString().split('T')[0]}.md`, 'text/markdown');
    closeExportModal();
}

// Utility Functions
function downloadFile(content, filename, mimeType) {
    try {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download error:', error);
        alert('Fehler beim Download. Bitte versuchen Sie es erneut.');
    }
}

function updateTime() {
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = new Date().toLocaleTimeString('de-DE');
    }
}

// Auto-save functionality
function initializeAutoSave() {
    setInterval(function() {
        if (sessionNotes.length > 0 && sessionId) {
            try {
                localStorage.setItem('coachMissionControlSession', JSON.stringify({
                    sessionId: sessionId,
                    notes: sessionNotes,
                    client: selectedClient,
                    step: currentStep,
                    timestamp: new Date()
                }));
            } catch (e) {
                console.warn('Auto-save failed:', e);
            }
        }
    }, appConfig.collaboration.autoSaveInterval);
}

// Load auto-saved session data
function loadAutoSavedSession() {
    try {
        const savedSession = localStorage.getItem('coachMissionControlSession');
        if (savedSession) {
            const data = JSON.parse(savedSession);
            const timeDiff = new Date() - new Date(data.timestamp);
            
            // If data is less than 2 hours old, offer to restore
            if (timeDiff < 7200000 && data.sessionId && confirm('Eine vorherige Session wurde gefunden. Wiederherstellen?')) {
                sessionNotes = data.notes || [];
                selectedClient = data.client;
                currentStep = data.step || 1;
                sessionId = data.sessionId;
                
                if (selectedClient) {
                    selectClient(selectedClient);
                }
                
                updateCollaborationLink();
                renderNotes();
                
                return true;
            }
        }
    } catch (e) {
        console.warn('Could not load auto-saved session:', e);
    }
    return false;
}

// Keyboard Shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+S: Export session
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        exportSession();
    }
    
    // Escape: Close modals
    if (e.key === 'Escape') {
        closePromptModal();
        closeSalesModal();
        closeExportModal();
    }
    
    // Ctrl+K: Copy collaboration link
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        copyCollaborationLink();
    }
    
    // Ctrl+N: Add quick note
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        addQuickNote('custom');
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    try {
        localStorage.removeItem('collaborationData');
    } catch (e) {
        // Ignore errors
    }
});

// Initialize auto-saved session on load
document.addEventListener('DOMContentLoaded', function() {
    if (!isCollaborationMode) {
        loadAutoSavedSession();
    }
});