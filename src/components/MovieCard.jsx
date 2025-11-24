import React, { useState } from 'react';

const MovieCard = ({ title, type, data }) => {
    const [imgError, setImgError] = useState(false);

    const isMustWatch = type === 'must-watch';
    const isRecommended = type === 'recommended';

    // Use OMDb data if available, otherwise fallbacks
    const posterUrl = data?.Poster && data.Poster !== 'N/A'
        ? data.Poster
        : `https://tse2.mm.bing.net/th?q=${encodeURIComponent(title + " movie poster")}&w=300&h=450&c=7&rs=1&p=0`;

    const rating = data?.imdbRating && data.imdbRating !== 'N/A' ? data.imdbRating : 'N/A';
    const plot = data?.Plot && data.Plot !== 'N/A' ? data.Plot : 'Loading details...';
    const year = data?.Year || '';
    const actors = data?.Actors || '';

    const imdbUrl = `https://www.imdb.com/find?q=${encodeURIComponent(title)}`;

    return (
        <div className={`movie-card ${isMustWatch ? 'glow-red' : isRecommended ? 'glow-blue' : ''}`}>
            <div className="poster-wrapper">
                {!imgError ? (
                    <img
                        src={posterUrl}
                        alt={`${title} poster`}
                        className="poster-image"
                        onError={() => setImgError(true)}
                        loading="lazy"
                    />
                ) : (
                    <div className="poster-fallback">
                        <span>{title}</span>
                    </div>
                )}
                <div className="overlay">
                    <a href={imdbUrl} target="_blank" rel="noopener noreferrer" className="imdb-link">
                        View on IMDb
                    </a>
                </div>
            </div>

            <div className="card-content">
                <div className="card-header">
                    <h3 className="movie-title">{title}</h3>
                    <span className="rating">IMDB {rating}</span>
                </div>

                {year && <div className="movie-meta">{year}</div>}

                <div className="badges">
                    {isMustWatch && <span className="badge badge-red">MUST WATCH</span>}
                    {isRecommended && <span className="badge badge-blue">RECOMMENDED</span>}
                </div>

                <p className="description" title={plot}>
                    {plot.length > 100 ? plot.substring(0, 100) + '...' : plot}
                </p>

                {actors && (
                    <div className="actors">
                        <strong>Starring:</strong> {actors}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovieCard;
