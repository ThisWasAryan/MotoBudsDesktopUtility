# Moto Buds Desktop Utility - Website

This branch (`gh-pages`) contains the source code for the official landing page and promotional website for the Moto Buds Desktop Utility.

## About This Branch

- **Purpose**: This branch is dedicated strictly to the frontend web assets (HTML, CSS, JS, and images) that showcase the application's features, protocol documentation, and download links.
- **Deployment**: The contents of this branch are served via GitHub Pages. 
- **Separation of Concerns**: Please note that the actual source code for the Electron desktop application resides on the `main` branch. This `gh-pages` branch is completely independent and should not contain application code.

## Development

The website is a static HTML/CSS/JS project. You can run it locally by starting a simple HTTP server in the root directory:

```bash
python3 -m http.server 8000
```

Then navigate to `http://localhost:8000` in your web browser.
