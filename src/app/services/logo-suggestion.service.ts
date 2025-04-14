import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { Observable, from } from 'rxjs';
import { LogoSuggestion } from '../models/logo-suggestion';

@Injectable({
  providedIn: 'root'
})
export class LogoSuggestionService {
  private readonly EMAILJS_PUBLIC_KEY = 'oEEoYpx8eQ5qKzpms'; // Replace with your EmailJS public key
  private readonly EMAILJS_SERVICE_ID = 'service_a29x388'; // Replace with your EmailJS service ID
  private readonly EMAILJS_TEMPLATE_ID = 'template_u1fg7fv'; // Replace with your EmailJS template ID
  private readonly RECIPIENT_EMAIL = 'stavroskiig@gmail.com'; // Replace with your email

  constructor() {
    emailjs.init(this.EMAILJS_PUBLIC_KEY);
  }

  submitSuggestion(formData: FormData): Observable<any> {
    return from(this.sendEmail(formData));
  }

  private async sendEmail(formData: FormData): Promise<any> {
    try {
      const templateParams = {
        to_email: this.RECIPIENT_EMAIL,
        team_name: formData.get('teamName'),
        eps: formData.get('eps'),
        sender_email: formData.get('senderEmail'),
        url: formData.get('url'),
        logo_image: formData.get('logoImage')
      };

      return await emailjs.send(
        this.EMAILJS_SERVICE_ID,
        this.EMAILJS_TEMPLATE_ID,
        templateParams
      );
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
} 