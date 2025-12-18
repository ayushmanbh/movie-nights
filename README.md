# My Movie Night 🎬

**My Movie Night** is a "vibe coded" web application designed to help you discover cinematic masterpieces and hidden gems. With a futuristic, neon-accented interface, it offers a curated collection of movies stamped with personal recommendations.

![My Movie Night Screenshot](https://via.placeholder.com/800x400?text=My+Movie+Night+Preview) 
*(Note: Replace with actual screenshot)*

## ✨ Features

-   **Curated Collection**: Hand-picked movies organized by genre and recommendation level.
-   **Real-Time Data**: Powered by the OMDb API for up-to-date posters, ratings, and plots.
-   **Infinite Scroll**: Seamless browsing experience without pagination.
-   **Advanced Filtering**:
    -   Search by Title
    -   Filter by Actor
    -   Filter by Genre
    -   Sort by Title (A-Z, Z-A), Rating, or Year
-   **Community Suggestions**: A glassmorphism modal for users to suggest movies, featuring:
    -   **Bulk Submission**: Add multiple movies at once.
    -   **Duplicate Detection**: Real-time checking against the existing catalog.
    -   **Email Validation**: Rejects disposable/temporary email addresses for quality control.
-   **Back to Top**: Smooth scroll button for easy navigation.
-   **Responsive Design**: Fully optimized for mobile, tablet, and desktop.
-   **Vibe Coded Aesthetic**: Modern, dark-mode interface with glassmorphism and neon glows.

## 🧪 Testing

This project uses **Vitest** for robust unit testing.

### Running Tests
```bash
npm test
```
This will run the test suite, covering:
-   **MovieCard**: Rendering logic, fallbacks, and links.
-   **SuggestionForm**: Validation, state management, and API interactions.

## 🔄 CI/CD Pipeline

A GitHub Actions workflow (`.github/workflows/ci.yml`) is set up to ensure code quality.

-   **Dev Branch**: Pushing to `dev` triggers the test suite.
-   **Main Branch**: Pull Requests to `main` trigger tests. Merging to `main` is intended for production deployment (e.g., via Netlify).

## 🛠️ Tech Stack

-   **Frontend**: React, Vite
-   **Styling**: Vanilla CSS (Custom Design System)
-   **Testing**: Vitest, React Testing Library
-   **CI/CD**: GitHub Actions
-   **API**: OMDb API, Formbold (Submissions), Debounce API (Email Validation)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Built with 💻 and 🍿 by ayushmanbh*
