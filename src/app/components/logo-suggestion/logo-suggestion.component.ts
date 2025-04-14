import { Component } from '@angular/core';
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
          <label for="logoImage">Logo Image *</label>
          <input
            type="file"
            id="logoImage"
            (change)="onFileSelected($event)"
            accept="image/*"
            [class.error]="logoImage.invalid && logoImage.touched"
          >
          <div class="error-message" *ngIf="logoImage.invalid && logoImage.touched">
            Logo image is required
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

        <div class="form-group">
          <label for="url">Team Website (Optional)</label>
          <input
            type="url"
            id="url"
            formControlName="url"
            placeholder="Enter team website URL"
          >
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="submit-btn"
            [disabled]="suggestionForm.invalid || isSubmitting"
          >
            <span *ngIf="!isSubmitting">Submit Suggestion</span>
            <div class="loading-spinner" *ngIf="isSubmitting"></div>
          </button>
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
      margin-left: 0.5rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .suggestion-container {
        margin: 1rem auto;
      }

      .suggestion-form {
        padding: 1.5rem;
      }

      .submit-btn {
        width: 100%;
      }
    }
  `]
})
export class LogoSuggestionComponent {
  suggestionForm: FormGroup;
  previewUrl: string | null = null;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private suggestionService: LogoSuggestionService
  ) {
    this.suggestionForm = this.fb.group({
      teamName: ['', Validators.required],
      eps: ['', Validators.required],
      logoImage: [null, Validators.required],
      senderEmail: ['', [Validators.required, Validators.email]],
      url: ['']
    });
  }

  get teamName() { return this.suggestionForm.get('teamName')!; }
  get eps() { return this.suggestionForm.get('eps')!; }
  get logoImage() { return this.suggestionForm.get('logoImage')!; }
  get senderEmail() { return this.suggestionForm.get('senderEmail')!; }
  get url() { return this.suggestionForm.get('url')!; }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.suggestionForm.patchValue({ logoImage: file });
      this.suggestionForm.get('logoImage')?.updateValueAndValidity();

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.suggestionForm.valid) {
      this.isSubmitting = true;
      
      const formData = new FormData();
      formData.append('teamName', this.suggestionForm.value.teamName);
      formData.append('eps', this.suggestionForm.value.eps);
      formData.append('logoImage', this.suggestionForm.value.logoImage);
      formData.append('senderEmail', this.suggestionForm.value.senderEmail);
      if (this.suggestionForm.value.url) {
        formData.append('url', this.suggestionForm.value.url);
      }

      this.suggestionService.submitSuggestion(formData).subscribe({
        next: () => {
          this.suggestionForm.reset();
          this.previewUrl = null;
          this.isSubmitting = false;
          // Show success message
          alert('Thank you for your suggestion! We will review it soon.');
        },
        error: (error) => {
          console.error('Error submitting suggestion:', error);
          this.isSubmitting = false;
          // Show error message
          alert('There was an error submitting your suggestion. Please try again.');
        }
      });
    }
  }
} 