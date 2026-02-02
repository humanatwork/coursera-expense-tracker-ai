import {
  ExportTemplateConfig,
  CloudIntegration,
  ScheduledExport,
  ExportHistoryItem,
  CloudProvider,
} from '@/types/cloud-export';
import { Expense } from '@/types/expense';

// Export Templates Configuration
export const exportTemplates: ExportTemplateConfig[] = [
  {
    id: 'tax-report',
    name: 'Tax Report',
    description: 'IRS-ready expense report with category totals',
    icon: '📋',
    fields: ['Date', 'Category', 'Amount', 'Description', 'Tax Deductible'],
    groupBy: 'category',
    includeSummary: true,
    format: 'pdf',
  },
  {
    id: 'monthly-summary',
    name: 'Monthly Summary',
    description: 'Month-by-month breakdown with trends',
    icon: '📊',
    fields: ['Month', 'Category', 'Total', 'Transaction Count'],
    groupBy: 'month',
    includeSummary: true,
    format: 'excel',
  },
  {
    id: 'category-analysis',
    name: 'Category Analysis',
    description: 'Deep dive into spending by category',
    icon: '🎯',
    fields: ['Category', 'Total', 'Average', 'Count', 'Percentage'],
    groupBy: 'category',
    includeSummary: true,
    format: 'pdf',
  },
  {
    id: 'yearly-overview',
    name: 'Yearly Overview',
    description: 'Annual summary for financial planning',
    icon: '📅',
    fields: ['Quarter', 'Month', 'Total', 'Top Category'],
    groupBy: 'month',
    includeSummary: true,
    format: 'pdf',
  },
  {
    id: 'quick-export',
    name: 'Quick Export',
    description: 'Simple CSV for spreadsheet import',
    icon: '⚡',
    fields: ['Date', 'Amount', 'Category', 'Description'],
    groupBy: 'none',
    includeSummary: false,
    format: 'csv',
  },
];

// Mock Cloud Integrations
export const getCloudIntegrations = (): CloudIntegration[] => {
  const stored = localStorage.getItem('cloud-integrations');
  if (stored) {
    return JSON.parse(stored);
  }

  return [
    {
      provider: 'google-drive',
      name: 'Google Drive',
      icon: '📁',
      connected: false,
      autoSync: false,
    },
    {
      provider: 'dropbox',
      name: 'Dropbox',
      icon: '📦',
      connected: false,
      autoSync: false,
    },
    {
      provider: 'onedrive',
      name: 'OneDrive',
      icon: '☁️',
      connected: false,
      autoSync: false,
    },
    {
      provider: 'email',
      name: 'Email',
      icon: '✉️',
      connected: false,
      autoSync: false,
    },
    {
      provider: 'google-sheets',
      name: 'Google Sheets',
      icon: '📈',
      connected: false,
      autoSync: false,
    },
  ];
};

export const saveCloudIntegrations = (integrations: CloudIntegration[]) => {
  localStorage.setItem('cloud-integrations', JSON.stringify(integrations));
};

// Scheduled Exports
export const getScheduledExports = (): ScheduledExport[] => {
  const stored = localStorage.getItem('scheduled-exports');
  return stored ? JSON.parse(stored) : [];
};

export const saveScheduledExports = (exports: ScheduledExport[]) => {
  localStorage.setItem('scheduled-exports', JSON.stringify(exports));
};

// Export History
export const getExportHistory = (): ExportHistoryItem[] => {
  const stored = localStorage.getItem('export-history');
  return stored ? JSON.parse(stored) : [];
};

export const saveExportHistory = (history: ExportHistoryItem[]) => {
  localStorage.setItem('export-history', JSON.stringify(history));
};

export const addToExportHistory = (item: Omit<ExportHistoryItem, 'id' | 'exportedAt'>) => {
  const history = getExportHistory();
  const newItem: ExportHistoryItem = {
    ...item,
    id: `export-${Date.now()}`,
    exportedAt: new Date().toISOString(),
  };
  history.unshift(newItem);
  saveExportHistory(history.slice(0, 50)); // Keep last 50
  return newItem;
};

// Generate Shareable Link
export const generateShareableLink = (exportId: string): string => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://app.example.com';
  const linkId = Math.random().toString(36).substring(2, 15);
  return `${baseUrl}/shared/${linkId}`;
};

// Generate QR Code (mock - returns data URL for QR code SVG)
export const generateQRCode = (url: string): string => {
  // In a real app, you'd use a library like qrcode.react or qrcode
  // For now, return a placeholder SVG
  const size = 200;
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="white"/>
      <text x="50%" y="50%" font-size="12" text-anchor="middle" fill="black">QR Code</text>
      <text x="50%" y="60%" font-size="10" text-anchor="middle" fill="gray">${url.substring(0, 30)}...</text>
    </svg>
  `)}`;
};

// Simulate Cloud Connection
export const connectToCloudProvider = async (provider: CloudProvider): Promise<{ email?: string }> => {
  // Simulate OAuth flow
  await new Promise(resolve => setTimeout(resolve, 1500));

  const mockEmails = {
    'google-drive': 'user@gmail.com',
    'dropbox': 'user@dropbox.com',
    'onedrive': 'user@outlook.com',
    'email': 'user@email.com',
    'google-sheets': 'user@gmail.com',
  };

  return { email: mockEmails[provider] };
};

// Simulate Export to Cloud
export const exportToCloud = async (
  provider: CloudProvider,
  template: string,
  expenses: Expense[]
): Promise<{ success: boolean; fileUrl?: string }> => {
  // Simulate upload
  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    success: true,
    fileUrl: `https://${provider}.com/files/expense-export-${Date.now()}.${template.includes('pdf') ? 'pdf' : 'csv'}`,
  };
};

// Simulate Email Send
export const sendEmailExport = async (
  to: string,
  subject: string,
  template: string,
  expenses: Expense[]
): Promise<{ success: boolean; messageId?: string }> => {
  // Simulate email send
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    success: true,
    messageId: `msg-${Date.now()}`,
  };
};

// Format file size
export const formatFileSize = (recordCount: number): string => {
  const baseSize = recordCount * 150; // Approximate 150 bytes per record
  if (baseSize < 1024) return `${baseSize} B`;
  if (baseSize < 1024 * 1024) return `${(baseSize / 1024).toFixed(1)} KB`;
  return `${(baseSize / (1024 * 1024)).toFixed(1)} MB`;
};

// Calculate next run time for scheduled exports
export const calculateNextRun = (frequency: string): string => {
  const now = new Date();
  switch (frequency) {
    case 'daily':
      now.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      now.setDate(now.getDate() + 7);
      break;
    case 'monthly':
      now.setMonth(now.getMonth() + 1);
      break;
    default:
      now.setDate(now.getDate() + 1);
  }
  return now.toISOString();
};
