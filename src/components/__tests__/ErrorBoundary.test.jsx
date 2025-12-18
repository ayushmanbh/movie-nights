import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';
import { describe, it, expect, vi } from 'vitest';

// Component that throws an error
const ThrowError = () => {
    throw new Error('Test Error');
};

describe('ErrorBoundary Component', () => {
    it('renders children normally when no error occurs', () => {
        render(
            <ErrorBoundary>
                <div>Safe Component</div>
            </ErrorBoundary>
        );
        expect(screen.getByText('Safe Component')).toBeInTheDocument();
    });

    it('renders fallback UI when a child throws an error', () => {
        // Prevent console.error from cluttering test output
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        );

        expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
        expect(screen.getByText('Reload Page')).toBeInTheDocument();

        consoleSpy.mockRestore();
    });
});
