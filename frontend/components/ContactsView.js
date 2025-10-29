import React from 'react';
import {Box, Heading, Text} from '@airtable/blocks/ui';

export default function ContactsView({ 
    contacts, 
    selectedContact, 
    onContactClick, 
    loading, 
    error, 
    emails,
    onRetry 
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
            backgroundColor="#f9fafb"
            overflow="hidden"
        >
            {/* Header - Fixed */}
            <Box
                padding={3}
                backgroundColor="white"
                borderBottom="thick"
                flexShrink={0}
            >
                <Heading size="large">Email Viewer</Heading>
                <Text textColor="light">Select a contact to view their emails</Text>
            </Box>
            
            {/* Scrollable Content Area */}
            <Box
                flex={1}
                overflow="auto"
                padding={4}
            >
            
                {/* Selected Contact Banner */}
                {selectedContact && (
                    <Box
                        backgroundColor="lightBlue1"
                        padding={4}
                        marginBottom={4}
                        borderRadius="large"
                        style={{
                            border: '2px solid #3b82f6',
                            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)'
                        }}
                    >
                        <Box display="flex" alignItems="center" gap={4}>
                            <Box
                                width="48px"
                                height="48px"
                                borderRadius="50%"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                style={{
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    color: 'white',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                }}
                            >
                                {selectedContact.name.charAt(0).toUpperCase()}
                            </Box>
                            <Box flex={1} style={{ marginLeft: '4px' }}>
                                <Text size="large" fontWeight="strong">{selectedContact.name}</Text>
                                <Text textColor="blue">{selectedContact.email}</Text>
                            </Box>
                        </Box>
                        {loading && (
                            <Box
                                marginTop={2}
                                padding={2}
                                backgroundColor="white"
                                borderRadius="default"
                                display="flex"
                                alignItems="center"
                                gap={2}
                            >
                                <Text className="spinner">🔄</Text>
                                <Text textColor="light">Fetching emails from webhook...</Text>
                            </Box>
                        )}
                        {!loading && !error && emails && (
                            <Box
                                marginTop={2}
                                padding={2}
                                backgroundColor="lightGreen1"
                                borderRadius="default"
                                border="thick"
                                borderColor="green"
                            >
                                <Text textColor="green" fontWeight="strong">
                                    ✅ Successfully fetched {emails.length} emails!
                                </Text>
                                <Text size="small" textColor="light" marginTop={1}>
                                    View will transition automatically
                                </Text>
                            </Box>
                        )}
                        {error && (
                            <Box
                                marginTop={2}
                                padding={2}
                                backgroundColor="lightRed1"
                                borderRadius="default"
                                border="thick"
                                borderColor="red"
                            >
                                <Text textColor="red" fontWeight="strong">❌ Error: {error}</Text>
                                <Box marginTop={2}>
                                    <button 
                                        onClick={onRetry}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        🔄 Retry
                                    </button>
                                </Box>
                            </Box>
                        )}
                    </Box>
                )}
                
                {/* Contacts Grid */}
                {contacts && contacts.length > 0 ? (
                    <Box display="grid" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px'}}>
                            {contacts.map(contact => {
                                const isSelected = selectedContact?.id === contact.id;
                                return (
                                    <Box
                                        key={contact.id}
                                        padding={4}
                                        backgroundColor={isSelected ? 'lightBlue1' : 'white'}
                                        borderRadius="large"
                                        style={{
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            position: 'relative',
                                            boxShadow: isSelected ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
                                            border: isSelected ? '2px solid #3b82f6' : '1px solid #e5e7eb'
                                        }}
                                        onClick={() => onContactClick(contact)}
                                        className="contact-card-hover"
                                    >
                                        <Box display="flex" alignItems="center" gap={4}>
                                            <Box
                                                width="56px"
                                                height="56px"
                                                borderRadius="50%"
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                flexShrink={0}
                                                style={{
                                                    fontSize: '24px',
                                                    fontWeight: '600',
                                                    color: 'white',
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                }}
                                            >
                                                {contact.getCellValueAsString('Name').charAt(0).toUpperCase()}
                                            </Box>
                                            <Box flex={1} minWidth={0} style={{ marginLeft: '4px' }}>
                                                <Text 
                                                    fontWeight="strong" 
                                                    size="default"
                                                    style={{
                                                        overflow: 'hidden', 
                                                        textOverflow: 'ellipsis', 
                                                        whiteSpace: 'nowrap',
                                                        marginBottom: '4px'
                                                    }}
                                                >
                                                    {contact.getCellValueAsString('Name')}
                                                </Text>
                                                <Text 
                                                    size="small" 
                                                    textColor="gray" 
                                                    style={{
                                                        overflow: 'hidden', 
                                                        textOverflow: 'ellipsis', 
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {contact.getCellValueAsString('Email')}
                                                </Text>
                                            </Box>
                                        </Box>
                                        {isSelected && (
                                            <Box
                                                position="absolute"
                                                top="16px"
                                                right="16px"
                                                backgroundColor="green"
                                                paddingX={3}
                                                paddingY={1}
                                                borderRadius="large"
                                            >
                                                <Text size="small" fontWeight="strong" style={{color: 'white'}}>✓</Text>
                                            </Box>
                                        )}
                                    </Box>
                                );
                            })}
                    </Box>
                ) : (
                    <Box textAlign="center" paddingY={6}>
                        <Text fontSize="80px">📭</Text>
                        <Text size="large" fontWeight="strong" marginTop={3}>No contacts found</Text>
                        <Text textColor="gray" marginTop={2}>Add contacts to your Contacts table to get started</Text>
                    </Box>
                )}
                
            </Box>
        </Box>
    );
}
