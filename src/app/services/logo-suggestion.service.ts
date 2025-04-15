import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogoSuggestionService {
  private readonly EMAILJS_PUBLIC_KEY = 'oEEoYpx8eQ5qKzpms';
  private readonly EMAILJS_SERVICE_ID = 'service_a29x388';
  private readonly ADMIN_TEMPLATE_ID = 'template_suggestion';
  private readonly THANK_YOU_TEMPLATE_ID = 'template_autoreply';
  private readonly ADMIN_EMAIL = 'stavroskiig@gmail.com';

  constructor() {
    emailjs.init(this.EMAILJS_PUBLIC_KEY);
  }

  submitSuggestion(formData: FormData): Observable<any> {
    return from(this.sendEmails(formData));
  }

  private async sendEmails(formData: FormData): Promise<any> {
    try {
      const submitterEmail = formData.get('senderEmail') as string;
      const teamName = formData.get('teamName') as string;
      const eps = formData.get('eps') as string;
      const url = formData.get('url') as string;

      // 1. Send notification to admin with all details
      const adminResponse = await this.sendAdminNotification(submitterEmail, teamName, eps, url);
      console.log('Admin notification sent:', adminResponse);

      try {
        // 2. Send thank you email to submitter
        const thankYouResponse = await this.sendThankYouEmail(submitterEmail, teamName, eps);
        console.log('Thank you email sent:', thankYouResponse);
      } catch (thankYouError) {
        // If thank you email fails, log it but don't fail the whole submission
        console.error('Failed to send thank you email:', thankYouError);
      }

      return { success: true, adminEmailSent: true };
    } catch (error) {
      console.error('Error in sendEmails:', error);
      throw error;
    }
  }

  private async sendAdminNotification(submitterEmail: string, teamName: string, eps: string, url: string): Promise<any> {
    const params = {
      to_email: this.ADMIN_EMAIL,
      from_name: 'Logo Submission System',
      submitter_email: submitterEmail,
      team_name: teamName,
      eps: eps,
      url: url,
      reply_to: submitterEmail // Ensure admin can reply to submitter
    };

    console.log('Sending admin notification with:', params);

    return emailjs.send(
      this.EMAILJS_SERVICE_ID,
      this.ADMIN_TEMPLATE_ID,
      params
    );
  }

  private async sendThankYouEmail(submitterEmail: string, teamName: string, eps: string): Promise<any> {
    const params = {
      to_email: submitterEmail,
      to_name: submitterEmail, // Use email as name if no name provided
      from_name: 'Greek Football Logos',
      team_name: teamName,
      eps: eps,
      reply_to: this.ADMIN_EMAIL // Ensure user can reply to admin
    };

    console.log('Sending thank you email with:', params);

    return emailjs.send(
      this.EMAILJS_SERVICE_ID,
      this.THANK_YOU_TEMPLATE_ID,
      params
    );
  }
} 