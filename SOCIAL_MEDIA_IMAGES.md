# Social Media Preview Images Guide

## 🎯 Current Status

Your site currently uses the existing app logo (`src/assets/app-logo/app-logo.png`) for social media previews. This works but isn't optimal for social sharing.

## 📐 Recommended Image Specifications

### Open Graph Image (Facebook, LinkedIn, WhatsApp)
- **Size**: 1200 x 630 pixels
- **Format**: JPG or PNG
- **Aspect Ratio**: 1.91:1
- **File**: `src/assets/images/og-image.jpg`

### Twitter Card Image
- **Size**: 1200 x 600 pixels
- **Format**: JPG or PNG
- **Aspect Ratio**: 2:1
- **File**: `src/assets/images/twitter-image.jpg`

### LinkedIn Company Logo
- **Size**: 300 x 300 pixels
- **Format**: PNG
- **File**: `src/assets/images/linkedin-logo.png`

## 🎨 Design Recommendations

### Content Elements
1. **Main Title**: "Greek Football Logos"
2. **Subtitle**: "Ελληνικά Λογότυπα Ποδοσφαίρου"
3. **Sample Logos**: 3-4 popular team logos (Panathinaikos, Olympiacos, AEK, PAOK)
4. **Background**: Greek flag colors or football-themed background
5. **Call to Action**: "Explore 100+ Team Logos"

### Color Scheme
- **Primary**: #0D47A1 (Greek Blue)
- **Secondary**: #1B5E20 (Greek Green)
- **Accent**: #FFD700 (Gold)
- **Text**: White or #F5F5F5

### Typography
- **Main Title**: Bold, 48-60px
- **Subtitle**: Regular, 24-32px
- **Description**: Light, 18-24px

## 🛠️ Tools to Create Images

### Free Options
1. **Canva** (Recommended)
   - Free templates for social media
   - Easy to use drag-and-drop interface
   - Professional templates available

2. **Figma**
   - Free for basic use
   - Great for design collaboration
   - Vector-based design

3. **GIMP**
   - Free Photoshop alternative
   - More advanced features
   - Steeper learning curve

### Online Generators
1. **OG Image Generator**
   - https://og-image-generator.com/
   - Quick templates

2. **Social Media Image Maker**
   - https://www.socialmediaimagemaker.com/
   - Pre-built templates

## 📱 Testing Your Images

### Facebook Debugger
- https://developers.facebook.com/tools/debug/
- Test Open Graph tags
- Clear cache if needed

### Twitter Card Validator
- https://cards-dev.twitter.com/validator
- Test Twitter Card appearance
- Preview how it looks

### LinkedIn Post Inspector
- https://www.linkedin.com/post-inspector/
- Test LinkedIn sharing

## 🔄 Implementation Steps

### Step 1: Create the Images
1. Use Canva or your preferred tool
2. Create 1200x630 image for Open Graph
3. Create 1200x600 image for Twitter
4. Save as JPG or PNG

### Step 2: Add to Project
1. Place images in `src/assets/images/`
2. Name them:
   - `og-image.jpg` (Open Graph)
   - `twitter-image.jpg` (Twitter Card)

### Step 3: Update Meta Tags
The meta tags are already configured in `src/index.html` to use these files.

### Step 4: Test
1. Deploy your changes
2. Test with Facebook Debugger
3. Test with Twitter Card Validator
4. Share on social media to verify

## 🎯 Quick Fix (Current Setup)

If you want to use your existing app logo temporarily:

1. **Copy your app logo** to the images directory:
   ```bash
   cp src/assets/app-logo/app-logo.png src/assets/images/og-image.jpg
   cp src/assets/app-logo/app-logo.png src/assets/images/twitter-image.jpg
   ```

2. **Update meta tags** in `src/index.html`:
   ```html
   <meta property="og:image" content="https://greek-football-logos.site/assets/images/og-image.jpg">
   <meta name="twitter:image" content="https://greek-football-logos.site/assets/images/twitter-image.jpg">
   ```

## 📊 Expected Results

After implementing proper social media images:

- ✅ **Facebook**: Rich preview with image, title, and description
- ✅ **Twitter**: Card with image and text
- ✅ **LinkedIn**: Professional preview with logo
- ✅ **WhatsApp**: Image preview when sharing links
- ✅ **Discord**: Rich embed with image

## 🚀 Advanced Features

### Dynamic Images
For team-specific pages, you can generate dynamic Open Graph images:
- Use team logos as the image
- Include team name in the title
- Add team-specific descriptions

### A/B Testing
Create multiple versions of your social media images and test which ones get better engagement.

---

**Next Steps**: Create the recommended images and test them with the social media debuggers! 