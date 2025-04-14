import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogoSuggestionService {
  private readonly EMAILJS_PUBLIC_KEY = 'oEEoYpx8eQ5qKzpms';
  private readonly EMAILJS_SERVICE_ID = 'service_a29x388';
  private readonly EMAILJS_TEMPLATE_ID = 'template_u1fg7fv';

  constructor() {
    emailjs.init(this.EMAILJS_PUBLIC_KEY);
  }

  submitSuggestion(formData: FormData): Observable<any> {
    return from(this.sendEmail(formData));
  }

  private async sendEmail(formData: FormData): Promise<any> {
    try {
      // Create template parameters
      const templateParams = {
        to_name: 'stavroskiig@gmail.com',
        team_name: formData.get('teamName'),
        eps: formData.get('eps'),
        sender_email: formData.get('senderEmail'),
        url: formData.get('url')
      };

      console.log('Sending email with params:', templateParams);

      // Send the email
      const response = await emailjs.send(
        this.EMAILJS_SERVICE_ID,
        this.EMAILJS_TEMPLATE_ID,
        templateParams
      );

      console.log('EmailJS Response:', response);
      return response;
    } catch (error) {
      console.error('Detailed error in sendEmail:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        throw new Error(error.message || 'Failed to send email');
      }
      throw error;
    }
  }
} 