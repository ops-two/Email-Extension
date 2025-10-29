import React from 'react';
import {Box, Heading, Text} from '@airtable/blocks/ui';

export default function EmailDetailView({ email, onBack }) {
    const formatFullDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

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
                padding={3}
                backgroundColor="white"
                borderBottom="thick"
                flexShrink={0}
            >
                <Box display="flex" alignItems="center" gap={2} marginBottom={3}>
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
                        ← Back to List
                    </button>
                </Box>
                
                {/* Email Subject */}
                <Heading size="default" marginBottom={2}>
                    {email.subject}
                </Heading>

                {/* Email Metadata */}
                <Box>
                    <Box display="flex" gap={1} marginBottom={1} alignItems="center">
                        <Text size="small" textColor="light" style={{ minWidth: '50px' }}>From:</Text>
                        <Text size="small" fontWeight="strong">{email.from.text}</Text>
                    </Box>
                    <Box display="flex" gap={1} marginBottom={1} alignItems="center">
                        <Text size="small" textColor="light" style={{ minWidth: '50px' }}>To:</Text>
                        <Text size="small">{email.to.text}</Text>
                    </Box>
                    <Box display="flex" gap={1} alignItems="center">
                        <Text size="small" textColor="light" style={{ minWidth: '50px' }}>Date:</Text>
                        <Text size="small">{formatFullDate(email.date)}</Text>
                    </Box>
                </Box>
            </Box>

            {/* Email Body */}
            <Box flex={1} overflow="auto" backgroundColor="#f9fafb">
                <Box padding={4}>
                    {email.html ? (
                        <Box
                            backgroundColor="white"
                            borderRadius="default"
                            border="default"
                            overflow="hidden"
                        >
                            <iframe
                                srcDoc={email.html}
                                style={{
                                    width: '100%',
                                    minHeight: '600px',
                                    border: 'none',
                                    backgroundColor: 'white'
                                }}
                                sandbox="allow-same-origin allow-popups"
                                title="Email Content"
                            />
                        </Box>
                    ) : (
                        <Box
                            padding={3}
                            backgroundColor="white"
                            borderRadius="default"
                            border="default"
                        >
                            <Text style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '14px' }}>
                                {email.text || 'No content available'}
                            </Text>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
