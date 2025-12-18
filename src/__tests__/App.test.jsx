import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { describe, it, expect, vi } from 'vitest';

// Mock IntersectionObserver is handled in setup.js

// Mock fetch for movies data if needed, or rely on internal JSON import (which is mocked automatically by Vite in tests usually if distinct)
// Actually App imports movies.json directly. 
// We should check that "SuggestionForm" text is NOT present initially.

describe('App Component', () => {
    it('renders the main layout without crashing', () => {
        render(<App />);
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Search movies...')).toBeInTheDocument();
    });

    it('does not render Suggestion Modal initially (Lazy Loading)', () => {
        render(<App />);
        // The modal text "Suggest Movies" should not be in the document
        // because it is conditionally rendered behind a Suspense boundary and isOpen is false.
        expect(screen.queryByText('Suggest Movies')).not.toBeInTheDocument();
        expect(screen.queryByText('Email (Required)')).not.toBeInTheDocument();
    });

    it('opens Suggestion Modal when button is clicked', async () => {
        render(<App />);

        const suggestBtn = screen.getByText('+ Suggest a Movie');
        fireEvent.click(suggestBtn);

        // It might take a moment to resolve the lazy import
        await waitFor(() => {
            // We look for the header in the modal
            expect(screen.getByRole('heading', { name: /Suggest/i })).toBeInTheDocument();
        });
    });
});
