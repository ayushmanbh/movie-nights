import React from 'react';

const SkeletonCard = () => {
    return (
        <div className="movie-card skeleton-card">
            <div className="poster-placeholder skeleton"></div>
            <div className="card-content">
                <div className="title-placeholder skeleton"></div>
                <div className="rating-placeholder skeleton"></div>
                <div className="meta-placeholder skeleton"></div>
            </div>
        </div>
    );
};

export default SkeletonCard;
