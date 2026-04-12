import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import MovieCard from './components/MovieCard';
import SkeletonCard from './components/SkeletonCard';
import ControlBar from './components/ControlBar';
const SuggestionForm = React.lazy(() => import('./components/SuggestionForm'));


import BackToTop from './components/BackToTop';
import moviesData from './data/movies.json';
import { themeConfig } from './config/theme';
import { APP_CONTENT } from './constants/content';

const App = () => {
    const [allMovies, setAllMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        genre: '',
        actor: '',
        sort: ''
    });

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Infinite Scroll State
    const [visibleCount, setVisibleCount] = useState(12);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const observerTarget = useRef(null);

    const ITEMS_PER_PAGE = 12;

    // Load initial movie list
    useEffect(() => {
        // Simulate a small delay for the "loading" feel or just set immediately
        setAllMovies(moviesData);
        setLoading(false);
    }, []);

    // Filter Movies
    const filteredMovies = useMemo(() => {
        return allMovies.filter(movie => {
            // Search
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const matchesTitle = movie.title.toLowerCase().includes(searchLower);
                const matchesActor = movie.actors && movie.actors.toLowerCase().includes(searchLower);
                if (!matchesTitle && !matchesActor) return false;
            }

            // Genre
            if (filters.genre && filters.genre !== 'All Genres') {
                if (!movie.genre || !movie.genre.includes(filters.genre)) return false;
            }

            // Actor
            if (filters.actor) {
                if (!movie.actors || !movie.actors.toLowerCase().includes(filters.actor.toLowerCase())) return false;
            }

            return true;
        }).sort((a, b) => {
            switch (filters.sort) {
                case 'rating-desc':
                    return (parseFloat(b.imdbRating) || 0) - (parseFloat(a.imdbRating) || 0);
                case 'rating-asc':
                    return (parseFloat(a.imdbRating) || 0) - (parseFloat(b.imdbRating) || 0);
                case 'year-desc':
                    return (parseInt(b.year) || 0) - (parseInt(a.year) || 0);
                case 'year-asc':
                    return (parseInt(a.year) || 0) - (parseInt(b.year) || 0);
                case 'title-desc':
                    return b.title.localeCompare(a.title);
                case 'title-asc':
                default:
                    return a.title.localeCompare(b.title);
            }
        });
    }, [allMovies, filters]);

    // Infinite Scroll
    const visibleMovies = useMemo(() => {
        return filteredMovies.slice(0, visibleCount);
    }, [filteredMovies, visibleCount]);

    const loadMore = useCallback(() => {
        if (isLoadingMore || visibleCount >= filteredMovies.length) return;
        setIsLoadingMore(true);
        setTimeout(() => {
            setVisibleCount(prev => prev + ITEMS_PER_PAGE);
            setIsLoadingMore(false);
        }, 500);
    }, [isLoadingMore, visibleCount, filteredMovies.length]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            { threshold: 0.5 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [loadMore]);

    // Extract unique genres for filter dropdown
    const genres = useMemo(() => {
        const allGenres = new Set();
        allMovies.forEach(movie => {
            if (movie.genre) {
                movie.genre.split(', ').forEach(g => allGenres.add(g));
            }
        });
        return Array.from(allGenres).sort();
    }, [allMovies]);

    return (
        <div className={`app-container ${themeConfig.enableChristmasTheme ? 'christmas-theme' : ''}`}>
            {/* Christmas Corners */}
            {themeConfig.enableChristmasTheme && (
                <>
                    <div className="christmas-corner christmas-corner-left"></div>
                    <div className="christmas-corner christmas-corner-right"></div>
                </>
            )}
            {/* Christmas Snowfall - Controlled by config */}
            {themeConfig.enableChristmasTheme && (
                <div className="snowflakes" aria-hidden="true">
                    <div className="snowflake">❅</div>
                    <div className="snowflake">❆</div>
                    <div className="snowflake">❅</div>
                    <div className="snowflake">❆</div>
                    <div className="snowflake">❅</div>
                    <div className="snowflake">❆</div>
                    <div className="snowflake">❅</div>
                    <div className="snowflake">❆</div>
                    <div className="snowflake">❅</div>
                    <div className="snowflake">❆</div>
                </div>
            )}
            <header className="main-header">
                <h1>My Movie <span className="highlight">Night</span></h1>
                <p className="subtitle">{APP_CONTENT.subtitle}</p>
                <p className="site-description">
                    {APP_CONTENT.description}
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
                            visibleMovies.map((movie) => (
                                <MovieCard
                                    key={movie.id}
                                    title={movie.title}
                                    type={movie.tags.includes('must-watch') ? 'must-watch' : movie.tags.includes('recommended') ? 'recommended' : 'normal'}
                                    data={movie}
                                />
                            ))
                        )}
                    </div>

                    {!isFiltering && visibleMovies.length === 0 && (
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

            {isModalOpen && (
                <React.Suspense fallback={<div className="modal-overlay"><div className="loading-spinner"></div></div>}>
                    <SuggestionForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
                </React.Suspense>
            )}

            <button className="floating-suggest-btn" onClick={() => setIsModalOpen(true)}>
                <span className="icon">{themeConfig.enableChristmasTheme ? '❄️' : '+'}</span>
                <span className="text">Suggest a Movie</span>
            </button>

            <BackToTop />

            <footer className="main-footer">
                <p>{APP_CONTENT.footer.copyright}{themeConfig.enableChristmasTheme && ' 🎄 Happy Holidays! 🎁'}</p>
                <div className="disclaimer">
                    {APP_CONTENT.footer.disclaimer}
                </div>
            </footer>
        </div>
    );
};

export default App;
