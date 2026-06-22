# ToolCanvas Project Rules

## SEO & Page Metadata Guidelines
For every new page added to the project, the page metadata must conform to the following standards:

1. **Page Title (`<title>` and `og:title`)**:
   - Keep the title length under **60 characters**.
   - Put the **main target keyword first** (e.g., "Image to JPG Converter").
   - Mention the core benefits clearly (e.g., "Free & Private").
   - Format: `[Main Keyword] – [Benefits] | ToolCanvas`.

2. **Meta Description (`<meta name="description">` and `og:description`)**:
   - Keep the description length under **155 characters**.
   - Highlight the real benefit people care about:
     - **Free** (completely free of charge)
     - **No Signup** (no registration or sign-in needed)
     - **Private / No Upload** (files processed locally in the browser, never uploaded to a server)
     - **Works Offline** (accessible offline or runs entirely on the client side)

3. **Social Sharing Assets (`og:image` and `twitter:image`)**:
   - Always include the custom Open Graph preview image:
     ```html
     <meta property="og:image" content="https://toolcanvas.online/logo/social-share.png">
     <meta property="og:image:width" content="1200">
     <meta property="og:image:height" content="630">
     ```
   - Always include the Twitter Card preview tag:
     ```html
     <meta name="twitter:card" content="summary_large_image">
     <meta name="twitter:image" content="https://toolcanvas.online/logo/social-share.png">
     ```
