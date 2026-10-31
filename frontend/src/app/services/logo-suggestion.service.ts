import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import emailjs from '@emailjs/browser';
import { Observable, from, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LogoSuggestion {
  id?: number;
  teamName: string;
  eps?: string;
  senderEmail: string;
  url?: string;
  isNewTeam?: boolean;
  teamId?: string;
  createdAt?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface SuggestionAuditLog {
  id?: number;
  suggestionId?: number;
  teamName?: string;
  action: string;
  performedBy?: string;
  details?: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class LogoSuggestionService {
  private readonly EMAILJS_PUBLIC_KEY = 'oEEoYpx8eQ5qKzpms';
  private readonly EMAILJS_SERVICE_ID = 'service_a29x388';
  private readonly ADMIN_TEMPLATE_ID = 'template_suggestion';
  private readonly THANK_YOU_TEMPLATE_ID = 'template_autoreply';
  private readonly ADMIN_EMAIL = 'stavroskiig@gmail.com';
  private apiUrl = `${environment.apiUrl}/suggestions`;

  constructor(private http: HttpClient) {
    emailjs.init(this.EMAILJS_PUBLIC_KEY);
  }

  getSuggestions(pendingOnly: boolean = false): Observable<LogoSuggestion[]> {
    return this.http.get<LogoSuggestion[]>(`${this.apiUrl}?pendingOnly=${pendingOnly}`);
  }

  updateSuggestionStatus(id: number, status: 'PENDING' | 'APPROVED' | 'REJECTED'): Observable<LogoSuggestion> {
    return this.http.put<LogoSuggestion>(`${this.apiUrl}/${id}/status?status=${status}`, {});
  }

  deleteSuggestion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAuditLogs(suggestionId?: number): Observable<SuggestionAuditLog[]> {
    const params = suggestionId ? `?suggestionId=${suggestionId}` : '';
    return this.http.get<SuggestionAuditLog[]>(`${this.apiUrl}/audit-logs${params}`);
  }

  submitSuggestion(formData: FormData): Observable<any> {
    return from(this.sendEmailsAndSave(formData));
  }

  private async sendEmailsAndSave(formData: FormData): Promise<any> {
    const submitterEmail = formData.get('senderEmail') as string;
    const teamName = formData.get('teamName') as string;
    const eps = formData.get('eps') as string;
    const url = formData.get('url') as string;
    const isNewTeam = formData.get('isNewTeam') === 'true';
    const teamId = formData.get('teamId') as string || undefined;

    console.log('Processing submission:', { submitterEmail, teamName, eps, url, isNewTeam, teamId });

    // Save suggestion to backend
    const suggestionPayload: LogoSuggestion = {
      teamName,
      eps,
      senderEmail: submitterEmail,
      url,
      isNewTeam,
      teamId,
      status: 'PENDING'
    };

    let savedToDb = false;
    try {
      await firstValueFrom(this.http.post(this.apiUrl, suggestionPayload));
      savedToDb = true;
      console.log('Suggestion successfully saved to backend database.');
    } catch (dbError) {
      console.error('Failed to save suggestion to backend database:', dbError);
    }

    // 1. Send notification to admin with all details (resilient - don't block submission if email provider fails)
    let adminEmailSent = false;
    try {
      const adminResponse = await this.sendAdminNotification(
        submitterEmail,
        teamName,
        eps,
        url
      );
      adminEmailSent = true;
      console.log('Admin notification sent:', adminResponse);
    } catch (emailError) {
      console.warn('Failed to send admin notification email via EmailJS (check EmailJS Gmail connection):', emailError);
    }

    // 2. Send thank you email to submitter (resilient)
    try {
      const thankYouResponse = await this.sendThankYouEmail(submitterEmail, teamName, eps);
      console.log('Thank you email sent:', thankYouResponse);
    } catch (thankYouError) {
      console.warn('Failed to send thank you email:', thankYouError);
    }

    if (!savedToDb && !adminEmailSent) {
      throw new Error('Failed to save suggestion to database and email notification failed.');
    }

    return { success: true, adminEmailSent, savedToDb };
  }

  private async sendAdminNotification(
    submitterEmail: string,
    teamName: string,
    eps: string,
    url: string
  ): Promise<any> {
    const params: any = {
      to_email: this.ADMIN_EMAIL,
      from_name: 'Logo Submission System',
      submitter_email: submitterEmail,
      team_name: teamName,
      eps: eps,
      url: url
    };

    console.log('Sending admin notification with params:', params);

    try {
      const result = await emailjs.send(
        this.EMAILJS_SERVICE_ID,
        this.ADMIN_TEMPLATE_ID,
        params
      );
      console.log('EmailJS send result:', result);
      return result;
    } catch (error) {
      console.error('EmailJS send error:', error);
      throw error;
    }
  }

  private async sendThankYouEmail(submitterEmail: string, teamName: string, eps: string): Promise<any> {
    const params = {
      to_email: submitterEmail,
      to_name: submitterEmail,
      from_name: 'Greek Football Logos',
      team_name: teamName,
      eps: eps
    };

    console.log('Sending thank you email with:', params);

    try {
      const result = await emailjs.send(
        this.EMAILJS_SERVICE_ID,
        this.THANK_YOU_TEMPLATE_ID,
        params
      );
      console.log('Thank you email result:', result);
      return result;
    } catch (error) {
      console.error('Thank you email error:', error);
      throw error;
    }
  }
}
