import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="privacy-container">
      <h1>Privacy Policy - FoodEasyList</h1>
      <p class="update-date">Ultimo aggiornamento: 22 Giugno 2026</p>

      <section>
        <h2>1. Introduzione</h2>
        <p>
          Benvenuto in FoodEasyList. La tua privacy è importante per noi. Questa Privacy Policy
          spiega come raccogliamo, utilizziamo e proteggiamo le tue informazioni personali.
        </p>
      </section>

      <section>
        <h2>2. Dati raccolti</h2>
        <p>Raccogliamo i seguenti dati:</p>
        <ul>
          <li><strong>Dati di registrazione:</strong> email e password (criptata) per creare il tuo account</li>
          <li><strong>Dati dell'app:</strong> ricette salvate, liste della spesa, pianificazione settimanale</li>
          <li><strong>Dati tecnici:</strong> tipo di dispositivo, sistema operativo, per migliorare l'esperienza utente</li>
        </ul>
      </section>

      <section>
        <h2>3. Come utilizziamo i tuoi dati</h2>
        <p>I tuoi dati vengono utilizzati per:</p>
        <ul>
          <li>Permetterti di accedere al tuo account</li>
          <li>Salvare e sincronizzare le tue ricette e liste della spesa</li>
          <li>Migliorare le funzionalità dell'app</li>
          <li>Fornirti suggerimenti personalizzati tramite AI</li>
        </ul>
      </section>

      <section>
        <h2>4. Condivisione dei dati</h2>
        <p>
          Non vendiamo né condividiamo i tuoi dati personali con terze parti per scopi di marketing.
          I dati possono essere condivisi solo con:
        </p>
        <ul>
          <li>Provider di servizi cloud (MongoDB Atlas) per l'archiviazione sicura</li>
          <li>Servizi AI (OpenAI) per generare suggerimenti di ricette (solo dati anonimi)</li>
        </ul>
      </section>

      <section>
        <h2>5. Sicurezza dei dati</h2>
        <p>
          Adottiamo misure di sicurezza tecniche e organizzative per proteggere i tuoi dati,
          inclusa la crittografia delle password e connessioni HTTPS sicure.
        </p>
      </section>

      <section>
        <h2>6. I tuoi diritti</h2>
        <p>Hai il diritto di:</p>
        <ul>
          <li>Accedere ai tuoi dati personali</li>
          <li>Richiedere la correzione di dati inesatti</li>
          <li>Richiedere la cancellazione del tuo account e dei dati associati</li>
          <li>Esportare i tuoi dati</li>
        </ul>
      </section>

      <section>
        <h2>7. Conservazione dei dati</h2>
        <p>
          I tuoi dati vengono conservati finché mantieni un account attivo.
          Puoi richiedere la cancellazione in qualsiasi momento contattandoci.
        </p>
      </section>

      <section>
        <h2>8. Contatti</h2>
        <p>
          Per domande sulla privacy o per esercitare i tuoi diritti, contattaci a:
          <br><strong>Email:</strong> privacy&#64;foodeasylist.app
        </p>
      </section>

      <section>
        <h2>9. Modifiche alla Privacy Policy</h2>
        <p>
          Potremmo aggiornare questa policy periodicamente. Ti informeremo di eventuali
          modifiche significative tramite l'app o via email.
        </p>
      </section>
    </div>
  `,
  styles: [`
    .privacy-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #fff;
      min-height: 100vh;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 0.5rem;
    }
    h2 {
      color: #2980b9;
      margin-top: 2rem;
    }
    .update-date {
      color: #7f8c8d;
      font-style: italic;
    }
    section {
      margin-bottom: 1.5rem;
    }
    ul {
      padding-left: 1.5rem;
    }
    li {
      margin-bottom: 0.5rem;
    }
  `]
})
export class PrivacyPolicyComponent {}
