# How to Publish "Movie Nights" 🚀

Your application is built and ready to go! Since this is a static website, you have several free and easy options to publish it to the internet.

## Option 1: Netlify Drop (Easiest & Fastest)
**Best for:** Quick preview or permanent hosting without setting up Git integration immediately.

1.  **Locate the Build Folder**:
    -   Go to your project folder: `e:\Web Application development\Antigravity-apps`
    -   Find the folder named **`dist`**. This folder contains your production-ready website.

2.  **Upload to Netlify**:
    -   Open your web browser and go to [app.netlify.com/drop](https://app.netlify.com/drop).
    -   Drag and drop the **`dist`** folder onto the page area that says "Drag and drop your site folder here".

3.  **Done!**:
    -   Netlify will upload and publish your site in seconds.
    -   You will get a unique URL (e.g., `https://vibrant-movie-nights.netlify.app`) that you can share with anyone.

## Option 2: Vercel (Recommended for Long Term)
**Best for:** Continuous deployment (updates automatically when you push to Git).

1.  **Push to GitHub**:
    -   Create a new repository on GitHub.
    -   Push your local code to the new repository.

2.  **Deploy on Vercel**:
    -   Go to [vercel.com](https://vercel.com) and sign up/login.
    -   Click "Add New..." -> "Project".
    -   Import your `movie-nights` repository from GitHub.
    -   Vercel will detect it's a Vite project. Click **Deploy**.

## Option 3: GitHub Pages
1.  Update `vite.config.js` to set `base: '/repo-name/'`.
2.  Run `npm run build`.
3.  Push the `dist` folder to a `gh-pages` branch.

---
**Recommendation**: Start with **Option 1 (Netlify Drop)** to see your site live immediately!
