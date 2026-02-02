import { Expense, ExpenseCategory } from './expense';

export type CloudProvider = 'google-drive' | 'dropbox' | 'onedrive' | 'email' | 'google-sheets';

export type ExportTemplate =
  | 'tax-report'
  | 'monthly-summary'
  | 'category-analysis'
  | 'yearly-overview'
  | 'quick-export';

export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface ExportTemplateConfig {
  id: ExportTemplate;
  name: string;
  description: string;
  icon: string;
  fields: string[];
  groupBy?: 'category' | 'month' | 'none';
  includeSummary: boolean;
  format: 'csv' | 'pdf' | 'excel';
}

export interface CloudIntegration {
  provider: CloudProvider;
  name: string;
  icon: string;
  connected: boolean;
  email?: string;
  lastSync?: string;
  autoSync: boolean;
}

export interface ScheduledExport {
  id: string;
  template: ExportTemplate;
  frequency: ScheduleFrequency;
  destination: CloudProvider;
  nextRun: string;
  enabled: boolean;
  createdAt: string;
}

export interface ExportHistoryItem {
  id: string;
  template: ExportTemplate;
  destination: string;
  recordCount: number;
  fileSize: string;
  exportedAt: string;
  shareableLink?: string;
  qrCode?: string;
}

export interface ShareableLink {
  id: string;
  url: string;
  expiresAt: string;
  accessCount: number;
  password?: string;
}
