import React from 'react';
import { useFormBuilder } from '../../context/FormBuilderContext';
import { Mail, Clock, MessageSquare, Palette, Type, CheckSquare, Calendar, Power } from 'lucide-react';

const FONT_OPTIONS = [
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Outfit', value: 'Outfit, sans-serif' },
  { label: 'Merriweather', value: 'Merriweather, serif' },
  { label: 'Lato', value: 'Lato, sans-serif' },
];

const COLOR_PRESETS = [
  { label: 'Indigo', value: '#4F46E5' },
  { label: 'Blue', value: '#2563EB' },
  { label: 'Purple', value: '#7C3AED' },
  { label: 'Rose', value: '#E11D48' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Amber', value: '#D97706' },
  { label: 'Slate', value: '#475569' },
];

const ToggleSetting = ({ label, description, icon: Icon, value, onChange }) => (
  <div className="flex items-start justify-between py-5 border-b border-gray-100 last:border-0">
    <div className="flex items-start gap-3">
      <div className="mt-0.5 p-2 bg-indigo-50 rounded-lg">
        <Icon size={16} className="text-indigo-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
    </div>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${value ? 'bg-indigo-600' : 'bg-gray-200'}`}
      role="switch"
      aria-checked={value}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${value ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  </div>
);

const SettingsPanel = () => {
  const { form, updateFormMetadata } = useFormBuilder();
  const settings = form.settings || {};
  const theme = settings.theme || {};

  const updateSetting = (key, value) => {
    updateFormMetadata('settings', { ...settings, [key]: value });
  };

  const updateTheme = (key, value) => {
    updateSetting('theme', { ...theme, [key]: value });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Response Settings */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <CheckSquare size={18} className="text-indigo-600" />
            Response Settings
          </h3>
        </div>
        <div className="px-6">
          <ToggleSetting
            label="Accepting Responses"
            description="Turn off to close this form and prevent new submissions."
            icon={Power}
            value={settings.acceptingResponses ?? true}
            onChange={(v) => updateSetting('acceptingResponses', v)}
          />
          <ToggleSetting
            label="Collect Email Addresses"
            description="Respondents must sign in and their email will be recorded."
            icon={Mail}
            value={!!settings.collectEmail}
            onChange={(v) => updateSetting('collectEmail', v)}
          />
          <ToggleSetting
            label="Limit to 1 Response"
            description="Requires sign-in. Each user can only submit once."
            icon={Clock}
            value={!!settings.limitOneResponse}
            onChange={(v) => updateSetting('limitOneResponse', v)}
          />
          <ToggleSetting
            label="Allow Response Editing"
            description="Respondents can edit their response after submitting."
            icon={MessageSquare}
            value={!!settings.allowEditing}
            onChange={(v) => updateSetting('allowEditing', v)}
          />
          <div className="flex items-center justify-between py-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 bg-indigo-50 rounded-lg">
                <Calendar size={16} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Close Form Automatically On</p>
                <p className="text-xs text-gray-500 mt-0.5">Set a date and time to automatically stop accepting responses.</p>
              </div>
            </div>
            <input
              type="datetime-local"
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 bg-gray-50 hover:bg-white transition-all text-gray-700"
              value={settings.expiresAt || ''}
              onChange={(e) => updateSetting('expiresAt', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Confirmation Message */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare size={18} className="text-emerald-600" />
            Confirmation Message
          </h3>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-gray-500 mb-3">Shown to respondents after they submit the form.</p>
          <textarea
            className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition resize-none"
            rows={3}
            value={settings.confirmationMessage || ''}
            onChange={(e) => updateSetting('confirmationMessage', e.target.value)}
            placeholder="Your response has been recorded. Thank you!"
          />
        </div>
      </div>

      {/* Theme */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-pink-50 to-rose-50 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Palette size={18} className="text-rose-600" />
            Theme & Appearance
          </h3>
        </div>
        <div className="px-6 py-5 space-y-6">
          {/* Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Primary Color</label>
              <div className="flex items-center gap-3 flex-wrap">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c.value}
                    title={c.label}
                    onClick={() => updateTheme('primaryColor', c.value)}
                    className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${theme.primaryColor === c.value ? 'ring-4 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
                <div className="flex items-center gap-2 ml-1">
                  <label className="text-xs text-gray-500">Hex:</label>
                  <input
                    type="color"
                    value={theme.primaryColor || '#4F46E5'}
                    onChange={(e) => updateTheme('primaryColor', e.target.value)}
                    className="w-8 h-8 rounded-full border border-gray-200 cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.backgroundColor || '#f9fafb'}
                  onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                  className="w-8 h-8 rounded-full border border-gray-200 cursor-pointer"
                />
                <span className="text-sm font-mono text-gray-500 uppercase">{theme.backgroundColor || '#F9FAFB'}</span>
              </div>
            </div>
          </div>

          {/* Font */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Type size={14} /> Font Family
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {FONT_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => updateTheme('fontFamily', f.value)}
                  style={{ fontFamily: f.value }}
                  className={`px-4 py-2 rounded-lg border text-sm transition-all ${theme.fontFamily === f.value ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold' : 'border-gray-200 text-gray-700 hover:border-gray-400'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div
            className="mt-4 p-5 rounded-xl border-t-8 border border-gray-100 shadow-inner"
            style={{
              borderTopColor: theme.primaryColor || '#4F46E5',
              fontFamily: theme.fontFamily || 'Inter, sans-serif',
            }}
          >
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-mono">Live Preview</p>
            <h2 className="text-2xl font-bold text-gray-900">{form.title || 'Untitled Form'}</h2>
            <p className="text-gray-500 mt-1 text-sm">{form.description || 'Your form description here.'}</p>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-800">Sample Question</p>
              <div
                className="mt-2 h-2 w-full rounded-full"
                style={{ backgroundColor: theme.primaryColor || '#4F46E5', opacity: 0.2 }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
