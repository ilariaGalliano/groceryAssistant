# AI Grocery Planner

Un'app che:

- Prende ricette in linguaggio naturale
- Capisce ingredienti e quantità
- Genera lista della spesa intelligente
- Organizza prodotti
- Suggerisce alternative
- Ottimizza acquisti
- Si ricorda preferenze utente

---

## Stack Consigliato

### Frontend

- Angular 22 (Standalone, Signals)
- TailwindCSS
- Angular CDK
- RxJS (solo async complessi)

### Backend

- NestJS

### Database

- MongoDB Atlas

### AI

- OpenAI Platform oppure Pi.ai Developer Platform

---

## Architettura

```
Angular App
    ↓
NestJS API
    ↓
 ┌──────────────┬─────────────┐
 ↓              ↓             ↓
AI Service    MongoDB     Vector Search
(OpenAI)        Atlas       Embeddings
```

---

## Struttura Reale delle Funzionalità

### 1. Input AI

**Funzione**

L'utente scrive:

> voglio fare carbonara per 4 persone e tiramisù

**Cosa deve fare l'AI**

Deve trasformare il testo in JSON strutturato:

```json
{
  "recipes": [
    {
      "name": "Carbonara",
      "people": 4
    },
    {
      "name": "Tiramisù",
      "people": 4
    }
  ]
}
```

---

### 2. Recipe Engine

**Funzione**

Recupera:

- Ingredienti
- Quantità
- Categorie

**Output**

```json
{
  "ingredient": "uova",
  "quantity": 6,
  "unit": "pz",
  "category": "latticini"
}
```

---

### 3. Shopping List Engine

**Feature IMPORTANTISSIMA:** Merge automatico ingredienti.

**Esempio**

Carbonara: 200g parmigiano  
Lasagna: 150g parmigiano

**Risultato finale**

> Parmigiano → 350g

---

### 4. AI Normalization

**Problema reale:**

L'utente scrive:

- "parmigiano"
- "parmigiano reggiano"
- "grana"

L'AI deve capire la similarità.

**Soluzioni:**

- Embeddings
- Vector Search

---

### 5. Categorizzazione Automatica

Lista divisa in:

- 🥩 Carne
- 🥛 Latticini
- 🥬 Verdure
- 🍝 Pasta
- 🧂 Spezie

---

### 6. Smart Suggestions

Esempi:

> Hai già uova in casa?

oppure:

> Vuoi sostituire pancetta con guanciale?

---

### 7. User Pantry

L'utente salva:

- Cosa ha già
- Quantità

La lista evita duplicati.

---

### 8. Vector Search

Serve per:

- **Similar recipes** → "fammi qualcosa simile alla carbonara"
- **Similar ingredients** → "alternative vegetariane"
- **Memory** → "l'utente compra spesso avocado"
