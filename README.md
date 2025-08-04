# GreekFootballLogos

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.1.8.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Tag Management Server

The application includes a Node.js backend server for managing tag data. The server handles saving and loading team tags and available tags to/from JSON files.

### Starting the Backend Server

To start the backend server, run:

```bash
node server.js
```

The server will start on `http://localhost:3000` and provide the following endpoints:
- `POST /api/team-tags` - Save team tags
- `GET /api/team-tags` - Get team tags
- `POST /api/available-tags` - Save available tags
- `GET /api/available-tags` - Get available tags
- `GET /api/health` - Health check

### Server Offline Mode

When the backend server is offline:
- Tag data is loaded from the included JSON files in `src/assets/data/`
- Changes are saved to browser localStorage only
- A server status indicator appears in the bottom-right corner
- The application continues to work normally, but changes won't persist to files

### Data Files

The application uses these data files:
- `src/assets/data/team-tags.json` - Team-specific tags
- `src/assets/data/available-tags.json` - Available tags for selection

## Production Deployment

### Building for Production

```bash
ng build --configuration production
```

This creates optimized files in the `dist/greek-football-logos/` directory.

### Deployment Options

#### Option 1: Express Web Server (Recommended)

1. Install dependencies:
```bash
npm install express
```

2. Start the web server:
```bash
node web-server.js
```

The server will serve the Angular app with proper MIME types for sitemap.xml and robots.txt.

#### Option 2: Nginx Configuration

Use the provided `nginx.conf` file for nginx deployment:

1. Copy the built files to your web server directory
2. Configure nginx using the provided `nginx.conf`
3. Restart nginx

#### Option 3: Static Hosting (Netlify, Vercel, etc.)

For static hosting services:
1. Build the project: `ng build --configuration production`
2. Upload the contents of `dist/greek-football-logos/` to your hosting service
3. Configure the hosting service to serve sitemap.xml with `application/xml` MIME type
4. Configure the hosting service to serve robots.txt with `text/plain` MIME type

### SEO Files

The following SEO files are automatically included in the build:
- `sitemap.xml` - XML sitemap for search engines
- `robots.txt` - Crawling instructions for search engines

### Verifying SEO Setup

After deployment, verify your SEO setup:

1. **Sitemap**: Visit `https://greek-football-logos.site/sitemap.xml`
   - Should return XML content with `Content-Type: application/xml`

2. **Robots**: Visit `https://greek-football-logos.site/robots.txt`
   - Should return text content with `Content-Type: text/plain`

3. **Google Search Console**: Submit your sitemap URL

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
