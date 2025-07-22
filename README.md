# 🚀 Triadisches KI-Coaching - Deployment Guide

## Schritt-für-Schritt Deployment auf Vercel

### 📋 **Schritt 1: Voraussetzungen**

1. **GitHub Account** erstellen (falls noch nicht vorhanden)
2. **Vercel Account** erstellen: [vercel.com](https://vercel.com)
3. **OpenAI Account** und API Key: [platform.openai.com](https://platform.openai.com)

### 📁 **Schritt 2: Repository erstellen**

1. **Neues GitHub Repository** erstellen:
   - Name: `triadisches-coaching-demo`
   - Visibility: Public (für kostenlose Vercel Nutzung)

2. **Dateien hochladen** (alle 4 Dateien aus diesem Chat):
   ```
   triadisches-coaching-demo/
   ├── index.html              (Haupt-Interface)
   ├── package.json            (Dependencies)
   ├── vercel.json             (Deployment Config)
   ├── api/
   │   └── coaching-ai.js      (OpenAI Integration)
   └── README.md               (Diese Anleitung)
   ```

### 🔑 **Schritt 3: OpenAI API Key besorgen**

1. Gehe zu [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Klicke **"Create new secret key"**
3. Name: `Coaching Demo`
4. **Key kopieren** (wird nur einmal angezeigt!)
5. **Sicher aufbewahren** 🔒

### ☁️ **Schritt 4: Vercel Deployment**

1. **Bei Vercel anmelden** mit GitHub Account
2. **"New Project"** klicken
3. **Dein Repository auswählen** (`triadisches-coaching-demo`)
4. **Framework**: Other (wird automatisch erkannt)
5. **Deploy** klicken

### 🔧 **Schritt 5: Environment Variables konfigurieren**

1. **Nach dem Deployment** → Gehe zu deinem Projekt Dashboard
2. **Settings** → **Environment Variables**
3. **Add New** klicken:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: [Dein OpenAI API Key einfügen]
   - **Environment**: Production ✅
4. **Save** klicken

### 🔄 **Schritt 6: Redeploy**

1. **Deployments** Tab öffnen
2. **Neuestes Deployment** auswählen
3. **⋯ Menü** → **Redeploy**
4. **Redeploy** bestätigen

### ✅ **Schritt 7: Testen**

1. **Deine Live-URL** öffnen (z.B. `https://dein-projekt.vercel.app`)
2. **Klient auswählen** und Session starten
3. **Prompt bearbeiten** und **"An KI senden"** testen
4. **Grüner Status** oben rechts = API funktioniert! 🟢

---

## 📊 **API Status Anzeigen**

Die App zeigt automatisch den Verbindungsstatus:

- 🟢 **OpenAI verbunden** = Echte KI-Antworten
- 🟡 **Demo-Modus** = Fallback-Antworten  
- 🔴 **Offline-Modus** = Keine Verbindung

---

## 💰 **Kosten & Limits**

### **OpenAI API Kosten** (Stand 2024):
- **GPT-4o-mini**: ~$0.15 per 1M input tokens
- **Pro Coaching-Session**: ~$0.05-0.20 
- **Monatliches Limit**: $5-20 für Demo-Zwecke

### **Vercel Kosten**:
- **Hobby Plan**: Kostenlos für kleine Projekte
- **Bandwidth**: 100GB/Monat kostenlos
- **Serverless Functions**: 100GB-hours/Monat

---

## 🔧 **Erweiterte Konfiguration**

### **Custom Domain** (optional):
1. **Vercel Dashboard** → **Settings** → **Domains**
2. **Custom Domain** hinzufügen
3. **DNS Settings** bei deinem Domain-Provider anpassen

### **Analytics** aktivieren:
1. **Vercel Dashboard** → **Analytics** Tab
2. **Enable Analytics** klicken
3. **Performance Monitoring** verfügbar

### **Error Monitoring**:
```javascript
// In coaching-ai.js hinzufügen
console.error('API Error:', error);
// Errors werden automatisch in Vercel Logs angezeigt
```

---

## 🛠️ **Troubleshooting**

### **Problem: API funktioniert nicht**
```bash
# Logs anschauen
vercel logs [dein-projekt-url]

# Häufige Lösungen:
1. OpenAI API Key nochmal prüfen
2. Environment Variables redeploy
3. CORS Headers prüfen
```

### **Problem: Deployment schlägt fehl**
```bash
# Lokales Testing
npm install
npm run dev

# Build testen
npm run build
```

### **Problem: Zu hohe API Kosten**
1. **Rate Limiting** in `coaching-ai.js` hinzufügen:
```javascript
// Max 10 requests pro Minute
const rateLimiter = new Map();
```

2. **Cheaper Model** verwenden:
```javascript
model: "gpt-3.5-turbo" // statt "gpt-4o-mini"
```

---

## 📈 **Nächste Schritte**

Nach erfolgreichem Deployment kannst du:

1. **🎯 Demo-Link teilen** mit anderen Coaches
2. **📊 Usage Analytics** überwachen  
3. **🔧 Features erweitern** (Avatar-Tool, Prompt-Repository)
4. **💾 Session-Speicherung** hinzufügen
5. **👥 Multi-User Support** implementieren

---

## 🆘 **Support**

Bei Problemen:
1. **Vercel Logs** prüfen: [vercel.com/dashboard](https://vercel.com/dashboard)
2. **OpenAI Status**: [status.openai.com](https://status.openai.com)
3. **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

---

**🎉 Viel Erfolg mit deinem Live-Coaching-Tool!**

*Die App läuft jetzt weltweit verfügbar mit echter KI-Integration!*