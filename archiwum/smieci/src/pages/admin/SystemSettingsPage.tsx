// @ts-nocheck
/**
 * SystemSettingsPage
 * Admin panel for system configuration and platform settings
 */

import React, { useState } from 'react';

export const SystemSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'email' | 'payments' | 'security' | 'features'>('general');
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'ZZP Werkplaats',
    siteUrl: 'https://zzp-werkplaats.nl',
    supportEmail: 'support@zzp-werkplaats.nl',
    timezone: 'Europe/Amsterdam',
    language: 'nl',
    maintenanceMode: false,
    
    // Email Settings
    emailProvider: 'sendgrid',
    emailFrom: 'noreply@zzp-werkplaats.nl',
    emailFromName: 'ZZP Werkplaats',
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: '587',
    emailNotifications: true,
    
    // Payment Settings
    paymentProvider: 'stripe',
    stripePublicKey: 'pk_live_51H3***',
    stripeCurrency: 'EUR',
    taxRate: '21',
    invoicePrefix: 'INV-',
    paymentNotifications: true,
    
    // Security Settings
    twoFactorAuth: true,
    sessionTimeout: '30',
    maxLoginAttempts: '5',
    passwordMinLength: '8',
    requireStrongPassword: true,
    allowedDomains: 'zzp-werkplaats.nl',
    
    // Feature Flags
    enableBlog: true,
    enableCertificates: true,
    enablePayments: true,
    enableAnalytics: true,
    enableMessaging: true,
    enableNotifications: true
  });

  const handleSaveSettings = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSaving(false);
    alert('Settings saved successfully!');
  };

  const handleResetSettings = () => {
    if (confirm('Reset all settings to defaults? This action cannot be undone.')) {
      alert('Settings reset to defaults');
    }
  };

  const handleTestEmail = async () => {
    alert('Sending test email to ' + settings.supportEmail + '...');
  };

  const handleTestPayment = () => {
    alert('Opening Stripe test mode...');
  };

  const updateSetting = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">⚙️ System Settings</h1>
            <p className="text-gray-600">Platform configuration and system preferences</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleResetSettings}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Reset to Defaults
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? '⏳ Saving...' : '💾 Save Settings'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-2 px-4 ${activeTab === 'general' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`pb-2 px-4 ${activeTab === 'email' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Email
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-2 px-4 ${activeTab === 'payments' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Payments
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-2 px-4 ${activeTab === 'security' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`pb-2 px-4 ${activeTab === 'features' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Features
          </button>
        </div>

        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">General Settings</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => updateSetting('siteName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site URL</label>
                  <input
                    type="url"
                    value={settings.siteUrl}
                    onChange={(e) => updateSetting('siteUrl', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => updateSetting('supportEmail', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => updateSetting('timezone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Europe/Amsterdam">Europe/Amsterdam (CET)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New York (EST)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => updateSetting('language', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="nl">Nederlands</option>
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
                <div className="flex items-center h-full pt-8">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => updateSetting('maintenanceMode', e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Maintenance Mode</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Settings Tab */}
        {activeTab === 'email' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Email Settings</h3>
              <button
                onClick={handleTestEmail}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                📧 Send Test Email
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Provider</label>
                  <select
                    value={settings.emailProvider}
                    onChange={(e) => updateSetting('emailProvider', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="sendgrid">SendGrid</option>
                    <option value="mailgun">Mailgun</option>
                    <option value="ses">Amazon SES</option>
                    <option value="smtp">Custom SMTP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                  <input
                    type="email"
                    value={settings.emailFrom}
                    onChange={(e) => updateSetting('emailFrom', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
                  <input
                    type="text"
                    value={settings.emailFromName}
                    onChange={(e) => updateSetting('emailFromName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex items-center h-full pt-8">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Enable Email Notifications</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">SMTP Configuration</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                    <input
                      type="text"
                      value={settings.smtpHost}
                      onChange={(e) => updateSetting('smtpHost', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                    <input
                      type="text"
                      value={settings.smtpPort}
                      onChange={(e) => updateSetting('smtpPort', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Settings Tab */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Payment Settings</h3>
              <button
                onClick={handleTestPayment}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                💳 Test Payment
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Provider</label>
                  <select
                    value={settings.paymentProvider}
                    onChange={(e) => updateSetting('paymentProvider', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="stripe">Stripe</option>
                    <option value="mollie">Mollie</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stripe Public Key</label>
                  <input
                    type="text"
                    value={settings.stripePublicKey}
                    onChange={(e) => updateSetting('stripePublicKey', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select
                    value={settings.stripeCurrency}
                    onChange={(e) => updateSetting('stripeCurrency', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                  <input
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) => updateSetting('taxRate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Prefix</label>
                  <input
                    type="text"
                    value={settings.invoicePrefix}
                    onChange={(e) => updateSetting('invoicePrefix', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.paymentNotifications}
                    onChange={(e) => updateSetting('paymentNotifications', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Send Payment Notifications</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings Tab */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.twoFactorAuth}
                      onChange={(e) => updateSetting('twoFactorAuth', e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Enable Two-Factor Authentication</span>
                  </label>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.requireStrongPassword}
                      onChange={(e) => updateSetting('requireStrongPassword', e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Require Strong Passwords</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSetting('sessionTimeout', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                  <input
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => updateSetting('maxLoginAttempts', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Password Length</label>
                  <input
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => updateSetting('passwordMinLength', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Email Domains</label>
                <input
                  type="text"
                  value={settings.allowedDomains}
                  onChange={(e) => updateSetting('allowedDomains', e.target.value)}
                  placeholder="example.com, company.nl"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">Comma-separated list of allowed domains (leave empty for all)</p>
              </div>
            </div>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Feature Flags</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={settings.enableBlog}
                    onChange={(e) => updateSetting('enableBlog', e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Blog System</div>
                    <div className="text-sm text-gray-500">Enable blog posts and CMS</div>
                  </div>
                </label>
              </div>

              <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={settings.enableCertificates}
                    onChange={(e) => updateSetting('enableCertificates', e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Certificates</div>
                    <div className="text-sm text-gray-500">Enable certificate management</div>
                  </div>
                </label>
              </div>

              <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={settings.enablePayments}
                    onChange={(e) => updateSetting('enablePayments', e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Payments</div>
                    <div className="text-sm text-gray-500">Enable payment processing</div>
                  </div>
                </label>
              </div>

              <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={settings.enableAnalytics}
                    onChange={(e) => updateSetting('enableAnalytics', e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Analytics</div>
                    <div className="text-sm text-gray-500">Enable analytics tracking</div>
                  </div>
                </label>
              </div>

              <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={settings.enableMessaging}
                    onChange={(e) => updateSetting('enableMessaging', e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Messaging</div>
                    <div className="text-sm text-gray-500">Enable user messaging system</div>
                  </div>
                </label>
              </div>

              <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={settings.enableNotifications}
                    onChange={(e) => updateSetting('enableNotifications', e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Notifications</div>
                    <div className="text-sm text-gray-500">Enable push notifications</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemSettingsPage;
