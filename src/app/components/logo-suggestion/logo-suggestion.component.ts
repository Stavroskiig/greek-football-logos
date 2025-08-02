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

  isFormValid(): boolean {
    return this.suggestionForm.valid;
  }

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