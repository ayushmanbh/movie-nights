import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MOVIES_TXT_PATH = path.join(__dirname, '../public/movies.txt');
const OUTPUT_PATH = path.join(__dirname, '../src/data/movies.json');

// Cloud URL for movies.txt (e.g. GitHub Gist raw URL)
const MOVIES_TXT_URL = process.env.MOVIES_TXT_URL;

// OMDb API Key
const API_KEY = 'trilogy';

// Helper to delay (to avoid rate limits)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch movies.txt content — from cloud URL if available, otherwise local file
async function fetchMoviesTxt() {
    if (MOVIES_TXT_URL) {
        try {
            console.log(`Fetching movies.txt from: ${MOVIES_TXT_URL}`);
            const res = await fetch(MOVIES_TXT_URL);
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            const content = await res.text();
            console.log(`Successfully fetched movies.txt from cloud (${content.length} bytes)`);
            return content;
        } catch (e) {
            console.warn(`Failed to fetch from URL: ${e.message}`);
            console.warn('Falling back to local movies.txt...');
        }
    } else {
        console.log('No MOVIES_TXT_URL set, using local movies.txt');
    }

    return fs.readFileSync(MOVIES_TXT_PATH, 'utf-8');
}

async function fetchMovieData(title) {
    try {
        const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&t=${encodeURIComponent(title)}`);
        const data = await res.json();
        if (data.Response === 'True') {
            return data;
        }
    } catch (e) {
        console.error(`Failed to fetch ${title}:`, e);
    }
    return null;
}

async function main() {
    console.log("Starting movie data generation...");

    // Load existing data if it exists
    let existingMovies = [];
    if (fs.existsSync(OUTPUT_PATH)) {
        try {
            existingMovies = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
            console.log(`Loaded ${existingMovies.length} existing movies from cache.`);
        } catch (e) {
            console.error("Failed to parse existing movies.json, starting fresh.");
        }
    }

    const movieMap = new Map(existingMovies.map(m => [m.title.toLowerCase(), m]));

    const txtContent = await fetchMoviesTxt();
    const lines = txtContent.split('\n');

    const movies = [];
    let currentCategory = 'General';
    let idCounter = Math.max(0, ...existingMovies.map(m => m.id)) + 1;
    let skippedCount = 0;
    let fetchedCount = 0;

    // Process lines
    const uniqueTitles = new Set();

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith('---')) continue;
        if (trimmed.startsWith('Note:')) continue;

        if (trimmed.endsWith(':')) {
            currentCategory = trimmed.slice(0, -1);
            console.log(`Processing Category: ${currentCategory}`);
            continue;
        }

        // Parse title and type
        let type = 'normal';
        let cleanTitle = trimmed;

        if (trimmed.endsWith('**')) {
            type = 'must-watch';
            cleanTitle = trimmed.slice(0, -2);
        } else if (trimmed.endsWith('*')) {
            type = 'recommended';
            cleanTitle = trimmed.slice(0, -1);
        }

        cleanTitle = cleanTitle.trim();

        if (uniqueTitles.has(cleanTitle.toLowerCase())) continue;
        uniqueTitles.add(cleanTitle.toLowerCase());

        // Check if we already have this movie
        const existing = movieMap.get(cleanTitle.toLowerCase());

        if (existing) {
            // Update fields that might have changed in TXT (category, tags)
            existing.category = currentCategory;
            existing.tags = [];
            if (type === 'must-watch') existing.tags.push('must-watch');
            if (type === 'recommended') existing.tags.push('recommended');

            movies.push(existing);
            skippedCount++;
            continue;
        }

        console.log(`Fetching: ${cleanTitle}...`);

        // Fetch OMDb Data
        const omdbData = await fetchMovieData(cleanTitle);
        fetchedCount++;
        await delay(100); // 100ms delay to be nice to the API

        const movieEntry = {
            id: idCounter++,
            title: cleanTitle,
            category: currentCategory,
            tags: [],
            // OMDb Data
            year: omdbData?.Year || '',
            poster: (omdbData?.Poster && omdbData.Poster !== 'N/A') ? omdbData.Poster : null,
            description: (omdbData?.Plot && omdbData.Plot !== 'N/A') ? omdbData.Plot : 'No description available.',
            imdbRating: (omdbData?.imdbRating && omdbData.imdbRating !== 'N/A') ? omdbData.imdbRating : 'N/A',
            imdbId: omdbData?.imdbID || '',
            imdbUrl: omdbData?.imdbID ? `https://www.imdb.com/title/${omdbData.imdbID}/` : `https://www.imdb.com/find?q=${encodeURIComponent(cleanTitle)}`,
            actors: omdbData?.Actors || '',
            director: omdbData?.Director || '',
            genre: omdbData?.Genre || '',
            // Streaming (can be added manually to movies.json later)
            streaming: existing?.streaming || null
        };

        if (type === 'must-watch') movieEntry.tags.push('must-watch');
        if (type === 'recommended') movieEntry.tags.push('recommended');

        movies.push(movieEntry);
    }

    // Write to file
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(movies, null, 2));
    console.log(`\nSuccess! Processed ${movies.length} movies.`);
    console.log(`- Skipped (already in cache): ${skippedCount}`);
    console.log(`- Newly fetched: ${fetchedCount}`);
    console.log(`Output: ${OUTPUT_PATH}`);
}

main().catch(console.error);
