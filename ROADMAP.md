# Grocery Assistant - Roadmap

## 1. Setup del progetto Angular

Crea un'app standalone con Angular CLI, scegliendo il routing e TailwindCSS.

## 2. Componenti di base

Crea un componente standalone per il form di input (dove inserisci le ricette) e un componente per la lista della spesa.

## 3. Servizio API

Crea un servizio che richiama il backend per salvare ricette e generare la lista della spesa (includendo chiamate a Pi.dev o OpenAI se vuoi suggerimenti).

## 4. Backend NestJS

Imposta un progetto NestJS. Crea endpoint per salvare ricette, recuperare la lista della spesa e integra l'AI.

## 5. Database MongoDB

Crea la struttura (ricette, ingredienti, liste della spesa) e connettiti al backend.

## 6. Logica AI

Integra Pi.dev (o OpenAI) per generare suggerimenti di ingredienti o ottimizzare la lista.

## 7. UI dinamica

Aggiungi componenti dinamici (es. lista ingredienti, quantificatori, categorie) che si adattano all'input.

## 8. Autenticazione (opzionale)

Se vuoi salvare ricette personali, aggiungi login con OAuth o JWT.

## 9. Responsive e testing

Assicura che funzioni su mobile, fai test end-to-end (es. con Cypress) e unit test con Jest.

## 10. Deployment

Pubblica il frontend (ad esempio su Vercel) e il backend su un provider come Render o Vercel.
