/**
 * Mock Data for Demonstration
 * 
 * Sample email data with various verification scenarios
 * to test and demonstrate the email verification tool.
 */

export interface MockEmailRecord {
    id: number;
    name: string;
    email: string;
    company?: string;
    phone?: string;
}

// Sample email data with various scenarios
export const mockEmailData: MockEmailRecord[] = [
    // Valid emails (real domains)
    { id: 1, name: 'Alice Johnson', email: 'alice.johnson@gmail.com', company: 'Tech Corp', phone: '+1-555-0101' },
    { id: 2, name: 'Bob Smith', email: 'bob.smith@yahoo.com', company: 'Marketing Inc', phone: '+1-555-0102' },
    { id: 3, name: 'Carol Williams', email: 'carol.w@outlook.com', company: 'Design Studio', phone: '+1-555-0103' },
    { id: 4, name: 'David Brown', email: 'david.brown@hotmail.com', company: 'Sales Team', phone: '+1-555-0104' },
    { id: 5, name: 'Emma Davis', email: 'emma.davis@proton.me', company: 'Privacy Co', phone: '+1-555-0105' },

    // Disposable email addresses (Risky)
    { id: 6, name: 'Test User 1', email: 'testuser1@mailinator.com', company: 'Unknown', phone: '' },
    { id: 7, name: 'Test User 2', email: 'tempmail@yopmail.com', company: 'Temp Inc', phone: '' },
    { id: 8, name: 'Test User 3', email: 'throwaway@10minutemail.com', company: '', phone: '' },
    { id: 9, name: 'Fake Person', email: 'fake@guerrillamail.com', company: 'Spam Co', phone: '' },

    // Role-based addresses (Risky)
    { id: 10, name: 'Support Team', email: 'support@techcompany.com', company: 'Tech Company', phone: '+1-555-0110' },
    { id: 11, name: 'Info Desk', email: 'info@businesscorp.com', company: 'Business Corp', phone: '+1-555-0111' },
    { id: 12, name: 'Admin Account', email: 'admin@enterprise.org', company: 'Enterprise Org', phone: '+1-555-0112' },
    { id: 13, name: 'Sales Department', email: 'sales@retailstore.com', company: 'Retail Store', phone: '+1-555-0113' },
    { id: 14, name: 'Contact Us', email: 'contact@startup.io', company: 'Startup IO', phone: '+1-555-0114' },

    // Invalid emails (syntax errors)
    { id: 15, name: 'Invalid User 1', email: 'missing-at-sign.com', company: 'N/A', phone: '' },
    { id: 16, name: 'Invalid User 2', email: 'double@@signs.com', company: 'N/A', phone: '' },
    { id: 17, name: 'Invalid User 3', email: 'spaces in@email.com', company: 'N/A', phone: '' },
    { id: 18, name: 'Invalid User 4', email: '@nodomain.com', company: 'N/A', phone: '' },
    { id: 19, name: 'Invalid User 5', email: 'noextension@domain', company: 'N/A', phone: '' },

    // Invalid emails (non-existent domains)
    { id: 20, name: 'Bad Domain 1', email: 'user@thisdoesnotexist123456.com', company: 'Ghost Co', phone: '' },
    { id: 21, name: 'Bad Domain 2', email: 'test@fakedomainxyz987.net', company: 'Phantom Inc', phone: '' },
    { id: 22, name: 'Bad Domain 3', email: 'hello@invalidwebsite999.org', company: 'Shadow LLC', phone: '' },

    // More valid emails
    { id: 23, name: 'Grace Lee', email: 'grace.lee@icloud.com', company: 'Apple Fan', phone: '+1-555-0123' },
    { id: 24, name: 'Henry Wilson', email: 'henry.wilson@aol.com', company: 'Classic Email', phone: '+1-555-0124' },
    { id: 25, name: 'Ivy Chen', email: 'ivy.chen@live.com', company: 'Microsoft Team', phone: '+1-555-0125' },

    // More role-based (Risky)
    { id: 26, name: 'Help Desk', email: 'help@customersupport.com', company: 'Support Inc', phone: '+1-555-0126' },
    { id: 27, name: 'HR Department', email: 'hr@bigcorporation.com', company: 'Big Corp', phone: '+1-555-0127' },
    { id: 28, name: 'No Reply', email: 'noreply@newsletter.com', company: 'Newsletter Co', phone: '' },

    // Edge cases
    { id: 29, name: 'Plus Sign', email: 'user+tag@gmail.com', company: 'Gmail User', phone: '+1-555-0129' },
    { id: 30, name: 'Dot Variations', email: 'first.middle.last@company.com', company: 'Long Name Co', phone: '+1-555-0130' },
];

// Export as CSV string for testing
export function getMockCSV(): string {
    const headers = ['id', 'name', 'email', 'company', 'phone'];
    const rows = mockEmailData.map(row =>
        [row.id, row.name, row.email, row.company || '', row.phone || ''].join(',')
    );
    return [headers.join(','), ...rows].join('\n');
}

// Export summary statistics for expected results
export const expectedStats = {
    total: 30,
    expectedValid: 10,      // IDs: 1-5, 23-25, 29-30
    expectedRisky: 12,      // Disposable: 6-9, Role-based: 10-14, 26-28
    expectedInvalid: 8,     // Syntax errors: 15-19, Bad domains: 20-22
    expectedUnknown: 0
};
