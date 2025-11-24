import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import MovieCard from './components/MovieCard';
import SkeletonCard from './components/SkeletonCard';
import ControlBar from './components/ControlBar';

const App = () => {
    const [allMovies, setAllMovies] = useState([]);
    const [movieData, setMovieData] = useState({});
    const [loading, setLoading] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        genre: '',
        actor: '',
        sort: ''
    });

    // Infinite Scroll State
    const [visibleCount, setVisibleCount] = useState(12);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const observerTarget = useRef(null);

    const ITEMS_PER_PAGE = 12;

    // Load initial movie list
    useEffect(() => {
        fetch('/movies.txt')
            .then(response => response.text())
            .then(text => {
                const lines = text.split('\n');
                const movies = [];
                const seenTitles = new Set();
                let currentCategory = 'General';

                lines.forEach(line => {
                    const trimmed = line.trim();
                    if (!trimmed) return;
                    if (trimmed.startsWith('---')) return;
                    if (trimmed.startsWith('*') || trimmed.startsWith('Note:')) return;

                    if (trimmed.endsWith(':')) {
                        currentCategory = trimmed.slice(0, -1);
                    } else {
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

                        if (!seenTitles.has(cleanTitle.toLowerCase())) {
                            seenTitles.add(cleanTitle.toLowerCase());
                            movies.push({
                                title: cleanTitle,
                                type: type,
                                category: currentCategory
                            });
                        }
                    }
                });

                // Sort alphabetically by default
                movies.sort((a, b) => a.title.localeCompare(b.title));

                setAllMovies(movies);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load movies", err);
                setLoading(false);
            });
    }, []);

    // Background Data Fetching (Slowly fetch all data for filtering)
    useEffect(() => {
        if (allMovies.length === 0) return;

        const fetchQueue = allMovies.filter(m => !movieData[m.title]);
        if (fetchQueue.length === 0) return;

        const fetchNext = async () => {
            if (fetchQueue.length === 0) return;
            const movie = fetchQueue.shift();

            // Check local storage first
            const cached = localStorage.getItem(`omdb_${movie.title}`);
            if (cached) {
                setMovieData(prev => ({ ...prev, [movie.title]: JSON.parse(cached) }));
            } else {
                try {
                    const res = await fetch(`https://www.omdbapi.com/?apikey=trilogy&t=${encodeURIComponent(movie.title)}`);
                    const data = await res.json();
                    if (data.Response === 'True') {
                        setMovieData(prev => ({ ...prev, [movie.title]: data }));
                        localStorage.setItem(`omdb_${movie.title}`, JSON.stringify(data));
                    }
                } catch (err) {
                    console.error(`Background fetch failed for ${movie.title}`, err);
                }
            }

            // Schedule next fetch with delay to be nice to API
            setTimeout(fetchNext, 500);
        };

        // Start background fetching
        const timeoutId = setTimeout(fetchNext, 1000);
        return () => clearTimeout(timeoutId);
    }, [allMovies]); // Run once when movies are loaded

    // Filter and Sort Logic
    const filteredMovies = useMemo(() => {
        let result = [...allMovies];

        if (filters.search) {
            const q = filters.search.toLowerCase();
            result = result.filter(m => m.title.toLowerCase().includes(q));
        }

        if (filters.genre) {
            result = result.filter(m => {
                const data = movieData[m.title];
                return data && data.Genre && data.Genre.includes(filters.genre);
            });
        }

        if (filters.actor) {
            const q = filters.actor.toLowerCase();
            result = result.filter(m => {
                const data = movieData[m.title];
                return data && data.Actors && data.Actors.toLowerCase().includes(q);
            });
        }

        if (filters.sort) {
            result.sort((a, b) => {
                const dataA = movieData[a.title];
                const dataB = movieData[b.title];

                if (filters.sort === 'title-asc') {
                    return a.title.localeCompare(b.title);
                }
                if (filters.sort === 'title-desc') {
                    return b.title.localeCompare(a.title);
                }

                if (!dataA || !dataB) return 0;

                if (filters.sort === 'rating-desc') {
                    return parseFloat(dataB.imdbRating || 0) - parseFloat(dataA.imdbRating || 0);
                }
                if (filters.sort === 'rating-asc') {
                    return parseFloat(dataA.imdbRating || 0) - parseFloat(dataB.imdbRating || 0);
                }
                if (filters.sort === 'year-desc') {
                    return parseInt(dataB.Year || 0) - parseInt(dataA.Year || 0);
                }
                if (filters.sort === 'year-asc') {
                    return parseInt(dataA.Year || 0) - parseInt(dataB.Year || 0);
                }
                return 0;
            });
        }

        return result;
    }, [allMovies, filters, movieData]);

    // Handle Filter Changes with Skeleton Loader
    useEffect(() => {
        setIsFiltering(true);
        setVisibleCount(ITEMS_PER_PAGE);
        window.scrollTo(0, 0);

        const timer = setTimeout(() => {
            setIsFiltering(false);
        }, 800); // 800ms delay for the visual effect

        return () => clearTimeout(timer);
    }, [filters]);

    // Infinite Scroll Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !isLoadingMore && visibleCount < filteredMovies.length && !isFiltering) {
                    setIsLoadingMore(true);
                    // Simulate a small network delay for better UX or real loading
                    setTimeout(() => {
                        setVisibleCount(prev => prev + ITEMS_PER_PAGE);
                        setIsLoadingMore(false);
                    }, 500);
                }
            },
            { threshold: 0.5 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [visibleCount, filteredMovies.length, isLoadingMore, isFiltering]);

    // Fetch data for visible movies immediately
    useEffect(() => {
        if (isFiltering) return; // Don't fetch while showing skeletons

        const visible = filteredMovies.slice(0, visibleCount);
        visible.forEach(movie => {
            if (!movieData[movie.title]) {
                // Immediate fetch for visible items
                const cached = localStorage.getItem(`omdb_${movie.title}`);
                if (cached) {
                    setMovieData(prev => ({ ...prev, [movie.title]: JSON.parse(cached) }));
                } else {
                    fetch(`https://www.omdbapi.com/?apikey=trilogy&t=${encodeURIComponent(movie.title)}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.Response === 'True') {
                                setMovieData(prev => ({ ...prev, [movie.title]: data }));
                                localStorage.setItem(`omdb_${movie.title}`, JSON.stringify(data));
                            }
                        })
                        .catch(err => console.error(err));
                }
            }
        });
    }, [visibleCount, filteredMovies, isFiltering]); // Depend on visible slice

    // Extract unique genres for filter
    const genres = useMemo(() => {
        const allGenres = new Set();
        Object.values(movieData).forEach(data => {
            if (data.Genre) {
                data.Genre.split(', ').forEach(g => allGenres.add(g));
            }
        });
        return Array.from(allGenres).sort();
    }, [movieData]);

    const displayedMovies = filteredMovies.slice(0, visibleCount);

    return (
        <div className="app-container">
            <header className="main-header">
                <h1>My Movie <span className="highlight">Night</span></h1>
                <p className="subtitle">Curated Collection</p>
                <p className="site-description">
                    Welcome to My Movie Night, a hand-picked collection of cinematic masterpieces and hidden gems.
                    This list is curated to help you find your next great watch, organized by genre and stamped with our personal recommendations.
                </p>
            </header>

            <ControlBar
                filters={filters}
                setFilters={setFilters}
                genres={genres}
            />

            {loading ? (
                <div className="loading">Initializing System...</div>
            ) : (
                <>
                    <div className="movie-grid">
                        {isFiltering ? (
                            // Show Skeleton Cards while filtering
                            Array.from({ length: 12 }).map((_, index) => (
                                <SkeletonCard key={`skeleton-${index}`} />
                            ))
                        ) : (
                            // Show Real Movie Cards
                            displayedMovies.map((movie, index) => (
                                <MovieCard
                                    key={`${movie.title}-${index}`}
                                    title={movie.title}
                                    type={movie.type}
                                    data={movieData[movie.title]}
                                />
                            ))
                        )}
                    </div>

                    {!isFiltering && displayedMovies.length === 0 && (
                        <div className="no-results">No movies found matching your criteria.</div>
                    )}

                    {/* Infinite Scroll Loader / Trigger */}
                    {!isFiltering && visibleCount < filteredMovies.length && (
                        <div ref={observerTarget} className="loading-more">
                            <div className="loading-spinner"></div>
                            <span>Loading more movies...</span>
                        </div>
                    )}
                </>
            )}

            <footer className="main-footer">
                <p>© 2025 My Movie Night. All rights reserved.</p>
                <div className="disclaimer">
                    Disclaimer: This application is developed for educational and entertainment purposes.
                    All movie metadata and posters are properties of their respective owners (OMDb API).
                    This is a 'vibe coded' application designed to explore modern web aesthetics and is not intended for commercial use.
                </div>
            </footer>
        </div>
    );
};

export default App;
