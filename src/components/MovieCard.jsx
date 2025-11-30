import React, { useState } from 'react';

const MovieCard = ({ title, type, data }) => {
    const [imgError, setImgError] = useState(false);

    const isMustWatch = type === 'must-watch';
    const isRecommended = type === 'recommended';

    // Data from JSON
    const posterUrl = data?.poster && data.poster !== 'N/A'
        ? data.poster
        : `https://tse2.mm.bing.net/th?q=${encodeURIComponent(title + " movie poster")}&w=300&h=450&c=7&rs=1&p=0`;

    const rating = data?.imdbRating && data.imdbRating !== 'N/A' ? data.imdbRating : 'N/A';
    const plot = data?.description || 'Loading details...';
    const year = data?.year || '';
    const actors = data?.actors || '';
    const imdbUrl = data?.imdbUrl || `https://www.imdb.com/find?q=${encodeURIComponent(title)}`;

    // Streaming info is now directly in the data object
    const streamingInfo = data?.streaming;

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
                    {streamingInfo && (
                        <a href={streamingInfo.url} target="_blank" rel="noopener noreferrer" className="badge badge-green streaming-link">
                            WATCH ON {streamingInfo.service.toUpperCase()}
                        </a>
                    )}
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
