import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LogoSuggestionService } from '../../services/logo-suggestion.service';

@Component({
  selector: 'app-logo-suggestion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="suggestion-container">
      <h1>Suggest a New Logo</h1>
      
      <form [formGroup]="suggestionForm" (ngSubmit)="onSubmit()" class="suggestion-form">
        <div class="form-group">
          <label for="teamName">Team Name *</label>
          <input
            type="text"
            id="teamName"
            formControlName="teamName"
            placeholder="Enter team name"
            [class.error]="teamName.invalid && teamName.touched"
          >
          <div class="error-message" *ngIf="teamName.invalid && teamName.touched">
            Team name is required
          </div>
        </div>

        <div class="form-group">
          <label for="eps">EPS *</label>
          <input
            type="text"
            id="eps"
            formControlName="eps"
            placeholder="Enter EPS name"
            [class.error]="eps.invalid && eps.touched"
          >
          <div class="error-message" *ngIf="eps.invalid && eps.touched">
            EPS is required
          </div>
        </div>

        <div class="form-group">
          <label for="url">Logo URL *</label>
          <input
            type="url"
            id="url"
            formControlName="url"
            placeholder="Enter direct URL to the logo image"
            [class.error]="url.invalid && url.touched"
          >
          <div class="error-message" *ngIf="url.invalid && url.touched">
            Please provide a valid URL to the logo image
          </div>
          <div class="help-text">
            Please provide a direct link to the logo image (e.g., ending in .png, .jpg, etc.)
          </div>
        </div>

        <div class="form-group">
          <label for="logoImage">Preview Image (Optional)</label>
          <input
            type="file"
            id="logoImage"
            (change)="onFileSelected($event)"
            accept="image/*"
          >
          <div class="help-text">
            This is only for preview purposes. The actual logo will be downloaded from the URL provided above.
          </div>
          <div class="preview-container" *ngIf="previewUrl">
            <img [src]="previewUrl" alt="Logo preview" class="preview-image">
          </div>
        </div>

        <div class="form-group">
          <label for="senderEmail">Your Email *</label>
          <input
            type="email"
            id="senderEmail"
            formControlName="senderEmail"
            placeholder="Enter your email"
            [class.error]="senderEmail.invalid && senderEmail.touched"
          >
          <div class="error-message" *ngIf="senderEmail.invalid && senderEmail.touched">
            Please enter a valid email
          </div>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="submit-btn"
            [disabled]="!isFormValid() || isSubmitting"
          >
            <span *ngIf="!isSubmitting">Submit Suggestion</span>
            <div class="loading-spinner" *ngIf="isSubmitting"></div>
          </button>
        </div>

        <div class="error-message" *ngIf="submitError">
          {{ submitError }}
        </div>
      </form>
    </div>
  `,
  styles: [`
    .suggestion-container {
      max-width: 600px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 2rem;
    }

    .suggestion-form {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #333;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    input:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
    }

    input.error {
      border-color: #dc3545;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .help-text {
      color: #666;
      font-size: 0.875rem;
      margin-top: 0.25rem;
      font-style: italic;
    }

    .preview-container {
      margin-top: 1rem;
      text-align: center;
    }

    .preview-image {
      max-width: 200px;
      max-height: 200px;
      object-fit: contain;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .form-actions {
      margin-top: 2rem;
      text-align: center;
    }

    .submit-btn {
      background-color: #007bff;
      color: white;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 200px;
    }

    .submit-btn:hover:not(:disabled) {
      background-color: #0056b3;
      transform: translateY(-1px);
    }

    .submit-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LogoSuggestionComponent implements OnInit {
  suggestionForm: FormGroup;
  previewUrl: string | null = null;
  isSubmitting = false;
  selectedFile: File | null = null;
  submitError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private suggestionService: LogoSuggestionService
  ) {
    this.suggestionForm = this.fb.group({
      teamName: ['', Validators.required],
      eps: ['', Validators.required],
      senderEmail: ['', [Validators.required, Validators.email]],
      url: ['', [Validators.required, Validators.pattern('https?://.*\\.(png|jpg|jpeg|gif|svg|webp)$')]]
    });
  }

  ngOnInit() {}

  get teamName() { return this.suggestionForm.get('teamName')!; }
  get eps() { return this.suggestionForm.get('eps')!; }
  get senderEmail() { return this.suggestionForm.get('senderEmail')!; }
  get url() { return this.suggestionForm.get('url')!; }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.previewUrl = URL.createObjectURL(this.selectedFile);
    } else {
      this.selectedFile = null;
      this.previewUrl = null;
    }
  }

  isFormValid(): boolean {
    return this.suggestionForm.valid;
  }

  async onSubmit() {
    if (!this.isFormValid()) return;
    
    this.isSubmitting = true;
    this.submitError = null;

    try {
      const formData = new FormData();
      formData.append('teamName', this.teamName.value);
      formData.append('eps', this.eps.value);
      formData.append('senderEmail', this.senderEmail.value);
      formData.append('url', this.url.value);
      
      const response = await this.suggestionService.submitSuggestion(formData).toPromise();
      console.log('Submission response:', response);
      
      // Reset form after successful submission
      this.suggestionForm.reset();
      this.selectedFile = null;
      this.previewUrl = null;
      alert('Logo suggestion submitted successfully!');
    } catch (error) {
      console.error('Error in form submission:', error);
      if (error instanceof Error) {
        this.submitError = `Error: ${error.message}`;
      } else {
        this.submitError = 'Failed to submit logo suggestion. Please try again.';
      }
    } finally {
      this.isSubmitting = false;
    }
  }
} 