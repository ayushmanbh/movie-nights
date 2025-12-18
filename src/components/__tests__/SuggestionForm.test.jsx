import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SuggestionForm from '../SuggestionForm';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

describe('SuggestionForm Component', () => {
    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('does not render when isOpen is false', () => {
        render(<SuggestionForm isOpen={false} onClose={mockOnClose} />);
        expect(screen.queryByText('Suggest Movies')).not.toBeInTheDocument();
    });

    it('renders correctly when isOpen is true', () => {
        render(<SuggestionForm isOpen={true} onClose={mockOnClose} />);
        expect(screen.getByRole('heading', { name: /Suggest/i })).toBeInTheDocument();
        expect(screen.getAllByPlaceholderText('Movie Title')[0]).toBeInTheDocument();
    });

    it('validates required email format', async () => {
        render(<SuggestionForm isOpen={true} onClose={mockOnClose} />);
        const emailInput = screen.getByPlaceholderText('your@email.com');

        // Invalid email
        await userEvent.type(emailInput, 'invalid-email');
        fireEvent.blur(emailInput);

        expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        render(<SuggestionForm isOpen={true} onClose={mockOnClose} />);
        const closeBtn = screen.getByRole('button', { name: /Close Modal/i });
        fireEvent.click(closeBtn);
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('adds a new suggestion row when "Add Another Movie" is clicked', () => {
        render(<SuggestionForm isOpen={true} onClose={mockOnClose} />);
        const addBtn = screen.getByText('+ Add Another Movie');

        fireEvent.click(addBtn);

        const inputs = screen.getAllByPlaceholderText('Movie Title');
        expect(inputs).toHaveLength(2);
    });

    it('blocks disposable emails', async () => {
        // Mock Debounce API response
        fetch.mockResolvedValueOnce({
            json: async () => ({ disposable: 'true' })
        });

        render(<SuggestionForm isOpen={true} onClose={mockOnClose} />);
        const emailInput = screen.getByPlaceholderText('your@email.com');

        await userEvent.type(emailInput, 'temp@mailinator.com');
        fireEvent.blur(emailInput);

        await waitFor(() => {
            expect(screen.getByText('Temporary email addresses are not allowed.')).toBeInTheDocument();
        });
    });

    it('submits form successfully with valid data', async () => {
        // Mock Debounce API (Valid)
        fetch.mockResolvedValueOnce({
            json: async () => ({ disposable: 'false' })
        });
        // Mock Formbold API (Success)
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({})
        });

        render(<SuggestionForm isOpen={true} onClose={mockOnClose} />);

        // Fill Title
        await userEvent.type(screen.getByPlaceholderText('Movie Title'), 'Inception 2');

        // Fill Email
        const emailInput = screen.getByPlaceholderText('your@email.com');
        await userEvent.type(emailInput, 'valid@gmail.com');
        fireEvent.blur(emailInput); // Trigger validation

        // Wait for validation to pass (API calls)
        await waitFor(() => {
            expect(screen.queryByText('Checking...')).not.toBeInTheDocument();
        });

        // Submit
        const submitBtn = screen.getByText('Submit Suggestions');
        expect(submitBtn).toBeEnabled();
        fireEvent.click(submitBtn);

        // Verify Success Message
        await waitFor(() => {
            expect(screen.getByText(/Thanks for the suggestions!/i)).toBeInTheDocument();
        });
    });
});
