'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@/types/expense';
import {
  CloudProvider,
  ExportTemplate,
  CloudIntegration,
  ScheduledExport,
  ExportHistoryItem,
  ScheduleFrequency,
} from '@/types/cloud-export';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';
import {
  exportTemplates,
  getCloudIntegrations,
  saveCloudIntegrations,
  getScheduledExports,
  saveScheduledExports,
  getExportHistory,
  addToExportHistory,
  connectToCloudProvider,
  exportToCloud,
  sendEmailExport,
  generateShareableLink,
  generateQRCode,
  formatFileSize,
  calculateNextRun,
} from '@/lib/cloud-export-utils';
import { formatDate } from '@/lib/utils';

interface CloudExportHubProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
}

type TabView = 'templates' | 'integrations' | 'scheduled' | 'history' | 'share';

export function CloudExportHub({ isOpen, onClose, expenses }: CloudExportHubProps) {
  const [activeTab, setActiveTab] = useState<TabView>('templates');
  const [integrations, setIntegrations] = useState<CloudIntegration[]>([]);
  const [scheduledExports, setScheduledExports] = useState<ScheduledExport[]>([]);
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);

  // Email export state
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('Your Expense Report');
  const [selectedTemplate, setSelectedTemplate] = useState<ExportTemplate | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = () => {
    setIntegrations(getCloudIntegrations());
    setScheduledExports(getScheduledExports());
    setExportHistory(getExportHistory());
  };

  const handleConnectProvider = async (provider: CloudProvider) => {
    setIsProcessing(true);
    try {
      const result = await connectToCloudProvider(provider);
      const updated = integrations.map(int =>
        int.provider === provider
          ? { ...int, connected: true, email: result.email, lastSync: new Date().toISOString() }
          : int
      );
      setIntegrations(updated);
      saveCloudIntegrations(updated);
      alert(`Successfully connected to ${provider}!`);
    } catch (error) {
      alert('Connection failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisconnectProvider = (provider: CloudProvider) => {
    const updated = integrations.map(int =>
      int.provider === provider
        ? { ...int, connected: false, email: undefined, lastSync: undefined, autoSync: false }
        : int
    );
    setIntegrations(updated);
    saveCloudIntegrations(updated);
  };

  const handleToggleAutoSync = (provider: CloudProvider) => {
    const updated = integrations.map(int =>
      int.provider === provider ? { ...int, autoSync: !int.autoSync } : int
    );
    setIntegrations(updated);
    saveCloudIntegrations(updated);
  };

  const handleQuickExport = async (template: ExportTemplate, destination: CloudProvider) => {
    setIsProcessing(true);
    try {
      const templateConfig = exportTemplates.find(t => t.id === template)!;
      await exportToCloud(destination, templateConfig.format, expenses);

      const historyItem = addToExportHistory({
        template,
        destination: integrations.find(i => i.provider === destination)?.name || destination,
        recordCount: expenses.length,
        fileSize: formatFileSize(expenses.length),
      });

      setExportHistory([historyItem, ...exportHistory]);
      alert(`Successfully exported to ${destination}!`);
    } catch (error) {
      alert('Export failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmailExport = async () => {
    if (!emailTo || !selectedTemplate) {
      alert('Please fill in all fields');
      return;
    }

    setIsProcessing(true);
    try {
      await sendEmailExport(emailTo, emailSubject, selectedTemplate, expenses);

      addToExportHistory({
        template: selectedTemplate,
        destination: `Email (${emailTo})`,
        recordCount: expenses.length,
        fileSize: formatFileSize(expenses.length),
      });

      alert(`Email sent successfully to ${emailTo}!`);
      setEmailTo('');
      setEmailSubject('Your Expense Report');
      setSelectedTemplate(null);
    } catch (error) {
      alert('Email send failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateSchedule = () => {
    const newSchedule: ScheduledExport = {
      id: `schedule-${Date.now()}`,
      template: 'monthly-summary',
      frequency: 'monthly',
      destination: 'email',
      nextRun: calculateNextRun('monthly'),
      enabled: true,
      createdAt: new Date().toISOString(),
    };
    const updated = [...scheduledExports, newSchedule];
    setScheduledExports(updated);
    saveScheduledExports(updated);
  };

  const handleToggleSchedule = (id: string) => {
    const updated = scheduledExports.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    setScheduledExports(updated);
    saveScheduledExports(updated);
  };

  const handleDeleteSchedule = (id: string) => {
    const updated = scheduledExports.filter(s => s.id !== id);
    setScheduledExports(updated);
    saveScheduledExports(updated);
  };

  const handleGenerateShareLink = (exportId: string) => {
    const link = generateShareableLink(exportId);
    const qrCode = generateQRCode(link);
    setShowQRCode(qrCode);

    // Copy to clipboard
    navigator.clipboard.writeText(link);
    alert(`Link copied to clipboard!\n${link}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export & Share Hub" size="lg">
      <div className="space-y-4">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4">
            {[
              { id: 'templates', label: 'Templates', icon: '📋' },
              { id: 'integrations', label: 'Integrations', icon: '🔗' },
              { id: 'scheduled', label: 'Automation', icon: '⏰' },
              { id: 'history', label: 'History', icon: '📜' },
              { id: 'share', label: 'Share', icon: '🔗' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabView)}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="max-h-[500px] overflow-y-auto">
          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Choose a pre-configured export template optimized for different needs
              </p>
              {exportTemplates.map(template => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{template.icon}</span>
                        <h4 className="font-semibold text-gray-900">{template.name}</h4>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                          {template.format.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      <div className="text-xs text-gray-500">
                        Includes: {template.fields.join(', ')}
                      </div>
                    </div>
                    <div className="ml-4">
                      <select
                        className="text-sm border rounded px-2 py-1"
                        onChange={(e) => {
                          if (e.target.value) {
                            handleQuickExport(template.id, e.target.value as CloudProvider);
                            e.target.value = '';
                          }
                        }}
                        disabled={isProcessing}
                      >
                        <option value="">Export to...</option>
                        {integrations
                          .filter(i => i.connected)
                          .map(i => (
                            <option key={i.provider} value={i.provider}>
                              {i.icon} {i.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Connect your favorite cloud services for seamless data export
              </p>
              {integrations.map(integration => (
                <Card key={integration.provider} className="hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{integration.icon}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">{integration.name}</h4>
                        {integration.connected && integration.email && (
                          <p className="text-xs text-gray-600">{integration.email}</p>
                        )}
                        {integration.lastSync && (
                          <p className="text-xs text-gray-500">
                            Last sync: {formatDate(integration.lastSync)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {integration.connected && (
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={integration.autoSync}
                            onChange={() => handleToggleAutoSync(integration.provider)}
                            className="mr-1"
                          />
                          Auto-sync
                        </label>
                      )}
                      <Button
                        size="sm"
                        variant={integration.connected ? 'danger' : 'primary'}
                        onClick={() =>
                          integration.connected
                            ? handleDisconnectProvider(integration.provider)
                            : handleConnectProvider(integration.provider)
                        }
                        disabled={isProcessing}
                      >
                        {integration.connected ? 'Disconnect' : 'Connect'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Scheduled Exports Tab */}
          {activeTab === 'scheduled' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Automate recurring exports to stay organized
                </p>
                <Button size="sm" onClick={handleCreateSchedule}>
                  + New Schedule
                </Button>
              </div>
              {scheduledExports.length === 0 ? (
                <Card>
                  <div className="text-center py-8 text-gray-500">
                    <p>No scheduled exports yet</p>
                    <p className="text-sm mt-1">Create one to automate your reporting</p>
                  </div>
                </Card>
              ) : (
                scheduledExports.map(schedule => {
                  const template = exportTemplates.find(t => t.id === schedule.template);
                  return (
                    <Card key={schedule.id}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span>{template?.icon}</span>
                            <h4 className="font-semibold">{template?.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded ${schedule.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {schedule.enabled ? 'Active' : 'Paused'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)} to {integrations.find(i => i.provider === schedule.destination)?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Next run: {formatDate(schedule.nextRun)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleSchedule(schedule.id)}
                          >
                            {schedule.enabled ? 'Pause' : 'Resume'}
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDeleteSchedule(schedule.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                View and re-share your export history
              </p>
              {exportHistory.length === 0 ? (
                <Card>
                  <div className="text-center py-8 text-gray-500">
                    <p>No export history yet</p>
                    <p className="text-sm mt-1">Your exports will appear here</p>
                  </div>
                </Card>
              ) : (
                exportHistory.map(item => {
                  const template = exportTemplates.find(t => t.id === item.template);
                  return (
                    <Card key={item.id}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span>{template?.icon}</span>
                            <h4 className="font-medium">{template?.name}</h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            {item.destination} • {item.recordCount} records • {item.fileSize}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(item.exportedAt)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleGenerateShareLink(item.id)}
                        >
                          Share
                        </Button>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {/* Share Tab */}
          {activeTab === 'share' && (
            <div className="space-y-4">
              <Card title="Email Export">
                <div className="space-y-3">
                  <Input
                    type="email"
                    label="Recipient Email"
                    placeholder="colleague@company.com"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                  />
                  <Input
                    label="Subject"
                    placeholder="Your Expense Report"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={selectedTemplate || ''}
                      onChange={(e) => setSelectedTemplate(e.target.value as ExportTemplate)}
                    >
                      <option value="">Select template...</option>
                      {exportTemplates.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.icon} {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    onClick={handleEmailExport}
                    disabled={isProcessing || !emailTo || !selectedTemplate}
                    className="w-full"
                  >
                    {isProcessing ? 'Sending...' : 'Send Email'}
                  </Button>
                </div>
              </Card>

              {showQRCode && (
                <Card title="Shareable QR Code">
                  <div className="text-center">
                    <img src={showQRCode} alt="QR Code" className="mx-auto mb-3" />
                    <p className="text-sm text-gray-600">
                      Scan to access the export
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowQRCode(null)}
                      className="mt-2"
                    >
                      Close
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-xs text-gray-500">
            {expenses.length} expenses available • {integrations.filter(i => i.connected).length} services connected
          </div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
