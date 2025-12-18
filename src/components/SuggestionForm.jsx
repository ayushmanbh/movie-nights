import React, { useState, useEffect } from 'react';
import moviesData from '../data/movies.json';

const SuggestionForm = ({ isOpen, onClose }) => {
    const [status, setStatus] = useState('');
    const [suggestions, setSuggestions] = useState([
        { id: 1, title: '', reason: '', error: '' }
    ]);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');

    // Email Validation State
    const [emailStatus, setEmailStatus] = useState('idle'); // idle, validating, valid, invalid
    const [emailError, setEmailError] = useState('');

    const YOUR_FORM_ID = '3ARMD';

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setStatus('');
            setSuggestions([{ id: 1, title: '', reason: '', error: '' }]);
            setUserName('');
            setUserEmail('');
            setEmailStatus('idle');
            setEmailError('');
        }
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    // Check if movie exists (case-insensitive)
    const checkDuplicate = (title) => {
        if (!title) return '';
        const lowerTitle = title.toLowerCase().trim();
        const exists = moviesData.some(m => m.title.toLowerCase() === lowerTitle);
        return exists ? 'This movie is already in the collection!' : '';
    };

    const validateEmail = async (email) => {
        if (!email) {
            setEmailStatus('idle');
            setEmailError('');
            return false;
        }

        // 1. Regex Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailStatus('invalid');
            setEmailError('Please enter a valid email address.');
            return false;
        }

        // 2. Block test/example domains
        const testDomains = ['example.com', 'example.org', 'example.net', 'test.com', 'localhost'];
        const domain = email.split('@')[1]?.toLowerCase();
        if (testDomains.includes(domain)) {
            setEmailStatus('invalid');
            setEmailError('Please use a real email address.');
            return false;
        }

        // 3. Disposable Email Check (API)
        setEmailStatus('validating');
        setEmailError('');

        try {
            const response = await fetch(`https://disposable.debounce.io/?email=${email}`);
            const data = await response.json();

            if (data.disposable === 'true') {
                setEmailStatus('invalid');
                setEmailError('Temporary email addresses are not allowed.');
                return false;
            } else {
                setEmailStatus('valid');
                setEmailError('');
                return true;
            }
        } catch (error) {
            // Fallback if API fails: just accept it if regex passed
            console.error('Validation API Error:', error);
            setEmailStatus('valid');
            return true;
        }
    };

    const handleChange = (id, field, value) => {
        setSuggestions(prev => prev.map(item => {
            if (item.id === id) {
                const updates = { [field]: value };
                if (field === 'title') {
                    updates.error = checkDuplicate(value);
                }
                return { ...item, ...updates };
            }
            return item;
        }));
    };

    const addSuggestion = () => {
        setSuggestions(prev => [
            ...prev,
            { id: Date.now(), title: '', reason: '', error: '' }
        ]);
    };

    const removeSuggestion = (id) => {
        if (suggestions.length === 1) return;
        setSuggestions(prev => prev.filter(item => item.id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check for duplicate errors
        if (suggestions.some(s => s.error)) return;

        // Ensure email is validated before submission
        if (emailStatus !== 'valid') {
            // If email hasn't been validated yet, validate it now
            const isValid = await validateEmail(userEmail);
            if (!isValid) return;
        }

        setStatus('sending');

        const messageBody = suggestions.map((s) =>
            `Title: ${s.title}\nReason: ${s.reason || 'N/A'}`
        ).join('\n\n---\n\n');

        const formData = new FormData();
        formData.append('name', userName);
        formData.append('email', userEmail);
        formData.append('suggestions', messageBody);

        try {
            const response = await fetch(`https://formbold.com/s/${YOUR_FORM_ID}`, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Close Modal">&times;</button>

                <div className="suggestion-header">
                    <h2>Suggest <span className="highlight">Movies</span></h2>
                    <p>Help grow the collection! Bulk suggestions welcome.</p>
                </div>

                {status === 'success' ? (
                    <div className="success-message">
                        <h3>Thanks for the suggestions! 🎬</h3>
                        <p>I'll review them and add the ones that fit the vibe.</p>
                        <button onClick={onClose} className="btn-reset">Close</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="suggestion-form">
                        <div className="suggestions-list">
                            {suggestions.map((item) => (
                                <div key={item.id} className="suggestion-item">
                                    {suggestions.length > 1 && (
                                        <div className="item-header" style={{ justifyContent: 'flex-end' }}>
                                            <button
                                                type="button"
                                                onClick={() => removeSuggestion(item.id)}
                                                className="btn-remove"
                                                title="Remove this suggestion"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <input
                                            type="text"
                                            value={item.title}
                                            onChange={(e) => handleChange(item.id, 'title', e.target.value)}
                                            placeholder="Movie Title"
                                            required
                                            className={item.error ? 'input-error' : ''}
                                        />
                                        {item.error && <span className="validation-error">{item.error}</span>}
                                    </div>

                                    <div className="form-group">
                                        <textarea
                                            value={item.reason}
                                            onChange={(e) => handleChange(item.id, 'reason', e.target.value)}
                                            placeholder="Why should I watch it? (Optional)"
                                            rows="2"
                                        ></textarea>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button type="button" onClick={addSuggestion} className="btn-add">
                            + Add Another Movie
                        </button>

                        <div className="form-divider"></div>

                        <div className="user-details-group">
                            <div className="form-group">
                                <label htmlFor="email">Email (Required)</label>
                                <div className="input-wrapper">
                                    <input
                                        type="email"
                                        id="email"
                                        value={userEmail}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setUserEmail(val);
                                            // Validate on every keystroke, but relying on user pause would be better.
                                            // For simplicity in this functional component without refs for debouncing:
                                        }}
                                        onKeyUp={(e) => {
                                            // Simple debounce effect could be here, or use timeout in state
                                            // Using the simplified approach below for clarity
                                        }}
                                        onBlur={(e) => validateEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        required
                                        className={emailStatus === 'invalid' ? 'input-error' : emailStatus === 'valid' ? 'input-success' : ''}
                                    />
                                    {emailStatus === 'validating' && <span className="loading-indicator">Checking...</span>}
                                </div>
                                {emailError && <span className="validation-error">{emailError}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="name">Name (Optional)</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    placeholder="Your Name"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={status === 'sending' || suggestions.some(s => s.error) || emailStatus !== 'valid'}
                        >
                            {status === 'sending' ? 'Sending...' : 'Submit Suggestions'}
                        </button>

                        {status === 'error' && (
                            <p className="error-message">Oops! Something went wrong. Please try again.</p>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
};

export default SuggestionForm;
