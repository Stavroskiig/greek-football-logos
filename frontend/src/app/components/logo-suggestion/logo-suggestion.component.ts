import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LogoSuggestionService } from '../../services/logo-suggestion.service';

@Component({
  selector: 'app-logo-suggestion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './logo-suggestion.component.html'
})
export class LogoSuggestionComponent implements OnInit {
  suggestionForm: FormGroup;
  isSubmitting = false;
  submitError: string | null = null;
  submitSuccess: string | null = null;

  constructor(
    private fb: FormBuilder,
    private suggestionService: LogoSuggestionService
  ) {
    this.suggestionForm = this.fb.group({
      teamName: ['', Validators.required],
      eps: ['', Validators.required],
      senderEmail: ['', [Validators.required, Validators.email]],
      url: ['', [Validators.required, this.urlValidator()]]
    });
  }

  ngOnInit() {}

  get teamName() { return this.suggestionForm.get('teamName')!; }
  get eps() { return this.suggestionForm.get('eps')!; }
  get senderEmail() { return this.suggestionForm.get('senderEmail')!; }
  get url() { return this.suggestionForm.get('url')!; }

  // Method to validate URL format
  isValidUrl(url: string): boolean {
    const urlPattern = /^https?:\/\/.*\.(png|jpg|jpeg|gif|svg|webp)$/i;
    return urlPattern.test(url);
  }

  // URL validator
  urlValidator() {
    return (control: any): {[key: string]: any} | null => {
      const url = control.value;
      if (!url) {
        return { 'required': true };
      }
      
      if (!this.isValidUrl(url)) {
        return { 'invalidUrl': true };
      }
      
      return null;
    };
  }

  isFormValid(): boolean {
    return this.suggestionForm.valid;
  }

  async onSubmit() {
    if (!this.isFormValid()) {
      console.log('Form validation failed:', this.suggestionForm.errors);
      console.log('Form validation details:', {
        teamNameValid: this.teamName.valid,
        epsValid: this.eps.valid,
        emailValid: this.senderEmail.valid,
        urlValue: this.url.value,
        urlValid: this.url.valid
      });
      return;
    }
    
    this.isSubmitting = true;
    this.submitError = null;
    this.submitSuccess = null;

    try {
      const formData = new FormData();
      formData.append('teamName', this.teamName.value.trim());
      formData.append('eps', this.eps.value.trim());
      formData.append('senderEmail', this.senderEmail.value.trim());
      formData.append('url', this.url.value.trim());
      formData.append('hasUrl', 'true');
      formData.append('hasFile', 'false');
      
      console.log('Submitting with URL:', this.url.value.trim());
      
      const response = await this.suggestionService.submitSuggestion(formData).toPromise();
      console.log('Submission response:', response);
      
      // Reset form after successful submission
      this.suggestionForm.reset();
      this.submitSuccess = 'Logo suggestion submitted successfully! We will review it and get back to you soon.';
      console.log('Success message set:', this.submitSuccess);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        this.submitSuccess = null;
        console.log('Success message cleared');
      }, 5000);
      
    } catch (error) {
      console.error('Error in form submission:', error);
      if (error instanceof Error) {
        this.submitError = `Submission failed: ${error.message}`;
      } else {
        this.submitError = 'Failed to submit logo suggestion. Please try again.';
      }
    } finally {
      this.isSubmitting = false;
      console.log('Form submission completed, isSubmitting set to false');
    }
  }
} 