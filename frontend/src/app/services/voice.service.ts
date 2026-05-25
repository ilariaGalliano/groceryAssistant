import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class VoiceService {
  isListening = signal(false);
  isSupported = signal(false);
  transcript = signal('');

  private recognition: any = null;

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.isSupported.set(true);
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'it-IT';
      this.recognition.continuous = false;
      this.recognition.interimResults = true;

      this.recognition.onresult = (event: any) => {
        let final = '';
        let interim = '';
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        this.transcript.set(final || interim);
      };

      this.recognition.onend = () => {
        this.isListening.set(false);
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        this.isListening.set(false);
      };
    }
  }

  startListening(): void {
    if (!this.recognition || this.isListening()) return;
    this.transcript.set('');
    this.isListening.set(true);
    this.recognition.start();
  }

  stopListening(): void {
    if (!this.recognition || !this.isListening()) return;
    this.recognition.stop();
  }

  toggle(): void {
    if (this.isListening()) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }
}
