import React from 'react';

const ControlBar = ({ filters, setFilters, genres }) => {
    const handleSearchChange = (e) => {
        setFilters(prev => ({ ...prev, search: e.target.value }));
    };

    const handleActorChange = (e) => {
        setFilters(prev => ({ ...prev, actor: e.target.value }));
    };

    const handleGenreChange = (e) => {
        setFilters(prev => ({ ...prev, genre: e.target.value }));
    };

    const handleSortChange = (e) => {
        setFilters(prev => ({ ...prev, sort: e.target.value }));
    };

    return (
        <div className="control-bar">
            <div className="control-group">
                <input
                    type="text"
                    placeholder="Search movies..."
                    value={filters.search}
                    onChange={handleSearchChange}
                    className="control-input search-input"
                />
            </div>

            <div className="control-group">
                <input
                    type="text"
                    placeholder="Filter by Actor..."
                    value={filters.actor}
                    onChange={handleActorChange}
                    className="control-input"
                />
            </div>

            <div className="control-group">
                <select
                    value={filters.genre}
                    onChange={handleGenreChange}
                    className="control-select"
                >
                    <option value="">All Genres</option>
                    {genres.map(g => (
                        <option key={g} value={g}>{g}</option>
                    ))}
                </select>
            </div>

            <div className="control-group">
                <select
                    value={filters.sort}
                    onChange={handleSortChange}
                    className="control-select"
                >
                    <option value="">Sort By</option>
                    <option value="title-asc">Title (A-Z)</option>
                    <option value="title-desc">Title (Z-A)</option>
                    <option value="rating-desc">Rating (High to Low)</option>
                    <option value="rating-asc">Rating (Low to High)</option>
                    <option value="year-desc">Year (Newest)</option>
                    <option value="year-asc">Year (Oldest)</option>
                </select>
            </div>
        </div>
    );
};

export default ControlBar;
