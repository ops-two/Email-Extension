import React from 'react';
import {Box, Heading, Text} from '@airtable/blocks/ui';

export default function EmailListView({ 
    emails, 
    selectedContact, 
    onEmailClick, 
    onBack,
    onRefresh,
    formatDate,
    extractPlainText,
    loading 
}) {
    return (
        <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            display="flex"
            flexDirection="column"
            backgroundColor="white"
            overflow="hidden"
        >
            {/* Header with Back Button */}
            <Box
                padding={4}
                backgroundColor="white"
                borderBottom="thick"
                flexShrink={0}
                display="flex"
                alignItems="center"
                gap={3}
            >
                <button
                    onClick={onBack}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: '#f3f4f6',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                >
                    ← Back
                </button>
                <Box flex={1}>
                    <Heading size="small">{selectedContact?.name}</Heading>
                    <Text size="small" textColor="light">{emails?.length || 0} emails</Text>
                </Box>
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    style={{
                        padding: '10px 16px',
                        backgroundColor: loading ? '#f3f4f6' : '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: loading ? '#9ca3af' : '#64748b',
                        transition: 'all 0.2s ease',
                        opacity: loading ? 0.6 : 1
                    }}
                    onMouseOver={(e) => {
                        if (!loading) {
                            e.target.style.backgroundColor = '#f1f5f9';
                            e.target.style.borderColor = '#cbd5e1';
                        }
                    }}
                    onMouseOut={(e) => {
                        if (!loading) {
                            e.target.style.backgroundColor = '#f8fafc';
                            e.target.style.borderColor = '#e2e8f0';
                        }
                    }}
                >
                    🔄 Refresh
                </button>
            </Box>

            {/* Email List */}
            <Box flex={1} overflow="auto">
                {loading ? (
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" paddingY={6}>
                        <div 
                            className="spinner" 
                            style={{
                                width: '48px',
                                height: '48px',
                                border: '4px solid #f3f4f6',
                                borderTop: '4px solid #3b82f6',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                marginBottom: '16px'
                            }}
                        ></div>
                        <Text size="default" fontWeight="strong">Loading emails...</Text>
                        <Text size="small" textColor="gray">Fetching from webhook</Text>
                    </Box>
                ) : !emails || emails.length === 0 ? (
                    <Box textAlign="center" paddingY={4}>
                        <Text fontSize="64px">📦</Text>
                        <Text size="large" fontWeight="strong" marginTop={2}>No emails found</Text>
                        <Text textColor="light" marginTop={1}>This contact has no emails yet</Text>
                    </Box>
                ) : (
                    (emails || []).map(email => (
                        <Box
                            key={email.id}
                            padding={3}
                            borderBottom="default"
                            onClick={() => onEmailClick(email)}
                            style={{
                                cursor: 'pointer',
                                transition: 'background-color 0.15s ease',
                                willChange: 'background-color'
                            }}
                            className="email-list-item"
                        >
                            <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={1}>
                                <Text fontWeight="strong" style={{ fontSize: '15px' }}>
                                    {email.subject}
                                </Text>
                                <Text size="small" textColor="light" style={{ flexShrink: 0, marginLeft: '12px' }}>
                                    {formatDate(email.date)}
                                </Text>
                            </Box>
                            <Text
                                size="small"
                                textColor="light"
                                style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    lineHeight: '1.4'
                                }}
                            >
                                {extractPlainText(email.html || email.text)}
                            </Text>
                        </Box>
                    ))
                )}
            </Box>
        </Box>
    );
}
