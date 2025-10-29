import {initializeBlock, useBase, useRecords} from '@airtable/blocks/ui';
import React, { useState, useRef, useEffect } from 'react';
import ContactsView from './components/ContactsView';
import EmailListView from './components/EmailListView';
import EmailDetailView from './components/EmailDetailView';
import './style.css';

// ============================================
// CONSTANTS
// ============================================

const WEBHOOK_URL = 'https://v1.ops2.cc/webhook/bf30d550-f2c4-49bc-a671-02b6461b33c5';

const VIEWS = {
  CONTACTS: 'contacts',
  EMAILS: 'emails',
  EMAIL_DETAIL: 'email-detail'
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

function EmailViewerApp() {
    // ============================================
    // STATE MANAGEMENT
    // ============================================
    
    const [state, setState] = useState({
        view: VIEWS.CONTACTS,
        selectedContact: null,
        emails: null,
        selectedEmail: null,
        loading: false,
        error: null
    });
    
    // ============================================
    // CACHE UTILITIES
    // ============================================
    
    const emailCache = useRef(new Map());
    
    const getCachedEmails = (email) => {
        const cached = emailCache.current.get(email);
        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
            return cached.data;
        }
        return null;
    };
    
    const setCachedEmails = (email, data) => {
        emailCache.current.set(email, {
            data,
            timestamp: Date.now()
        });
    };
    
    // ============================================
    // AIRTABLE DATA
    // ============================================
    
    const base = useBase();
    const contactsTable = base.getTableByNameIfExists('Contacts');
    const contacts = useRecords(contactsTable);
    
    // ============================================
    // CACHE CLEANUP
    // ============================================
    
    useEffect(() => {
        const cleanup = setInterval(() => {
            const now = Date.now();
            emailCache.current.forEach((value, key) => {
                if (now - value.timestamp > CACHE_DURATION) {
                    emailCache.current.delete(key);
                }
            });
        }, 60000);

        return () => clearInterval(cleanup);
    }, []);
    
    // ============================================
    // API: FETCH EMAILS
    // ============================================
    
    const fetchEmails = async (contactEmail) => {
        try {
            const cached = getCachedEmails(contactEmail);
            if (cached) {
                setState(prev => ({
                    ...prev,
                    emails: cached,
                    view: VIEWS.EMAILS,
                    loading: false
                }));
                return;
            }

            const url = `${WEBHOOK_URL}?email=${encodeURIComponent(contactEmail)}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const emailData = await response.json();
            
            if (!Array.isArray(emailData)) {
                throw new Error('Invalid response: Expected array of emails');
            }
            
            
            setCachedEmails(contactEmail, emailData);
            
            setState(prev => ({
                ...prev,
                emails: emailData,
                view: VIEWS.EMAILS,
                loading: false,
                error: null
            }));

        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error.message || 'Failed to fetch emails'
            }));
        }
    };
    
    // ============================================
    // HANDLERS
    // ============================================
    
    const handleContactClick = async (contact) => {
        const contactEmail = contact.getCellValueAsString('Email');
        const contactName = contact.getCellValueAsString('Name');
        
        
        setState(prev => ({
            ...prev,
            selectedContact: {
                id: contact.id,
                name: contactName,
                email: contactEmail
            },
            view: VIEWS.EMAILS,
            emails: [],
            loading: true,
            error: null
        }));
        
        await fetchEmails(contactEmail);
    };
    
    const handleEmailClick = (email) => {
        setState(prev => ({
            ...prev,
            selectedEmail: email,
            view: VIEWS.EMAIL_DETAIL
        }));
    };
    
    const handleBackToContacts = () => {
        setState(prev => ({
            ...prev,
            view: VIEWS.CONTACTS,
            selectedContact: null,
            emails: null,
            selectedEmail: null,
            error: null
        }));
    };
    
    const handleBackToEmails = () => {
        setState(prev => ({
            ...prev,
            view: VIEWS.EMAILS,
            selectedEmail: null
        }));
    };
    
    const handleRetry = () => {
        if (state.selectedContact) {
            fetchEmails(state.selectedContact.email);
        }
    };
    
    const handleRefresh = () => {
        if (state.selectedContact) {
            // Clear cache for this contact
            emailCache.current.delete(state.selectedContact.email);
            
            // Set loading state and fetch fresh emails
            setState(prev => ({
                ...prev,
                loading: true,
                error: null
            }));
            
            fetchEmails(state.selectedContact.email);
        }
    };
    
    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };
    
    const extractPlainText = (htmlOrText) => {
        if (!htmlOrText) return '';
        
        // Remove style tags and their contents
        let cleaned = htmlOrText.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
        
        // Remove script tags and their contents
        cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
        
        // Remove HTML comments
        cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
        
        // Strip all remaining HTML tags
        cleaned = cleaned.replace(/<[^>]*>/g, ' ');
        
        // Decode HTML entities
        const textarea = document.createElement('textarea');
        textarea.innerHTML = cleaned;
        const decoded = textarea.value;
        
        // Remove extra whitespace and trim to 150 characters
        return decoded.replace(/\s+/g, ' ').trim().substring(0, 150);
    };
    
    
    // ============================================
    // ERROR HANDLING
    // ============================================
    
    if (!contactsTable) {
        return (
            <div style={{padding: '20px', textAlign: 'center'}}>
                <div style={{
                    padding: '20px',
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500'
                }}>
                    ❌ Error: "Contacts" table not found. Please create a table named "Contacts".
                </div>
            </div>
        );
    }
    
    // ============================================
    // RENDER VIEWS
    // ============================================
    
    // Email Detail View
    if (state.view === VIEWS.EMAIL_DETAIL && state.selectedEmail) {
        return (
            <EmailDetailView 
                email={state.selectedEmail}
                onBack={handleBackToEmails}
            />
        );
    }
    
    // Email List View
    if (state.view === VIEWS.EMAILS) {
        return (
            <EmailListView
                emails={state.emails}
                selectedContact={state.selectedContact}
                onEmailClick={handleEmailClick}
                onBack={handleBackToContacts}
                onRefresh={handleRefresh}
                formatDate={formatDate}
                extractPlainText={extractPlainText}
                loading={state.loading}
            />
        );
    }
    
    // Contacts View (default)
    return (
        <ContactsView
            contacts={contacts}
            selectedContact={state.selectedContact}
            onContactClick={handleContactClick}
            loading={state.loading}
            error={state.error}
            emails={state.emails}
            onRetry={handleRetry}
        />
    );
}

initializeBlock(() => <EmailViewerApp />);
