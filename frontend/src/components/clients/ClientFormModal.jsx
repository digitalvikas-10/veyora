import React, { useState, useEffect } from 'react';
import { Building2, Mail, Phone, Globe, MapPin, Tag, FileText, Check, AlertCircle } from 'lucide-react';
import { Modal, Button, Input, Select, Textarea, Checkbox } from '../ui';

export const ClientFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  client = null,
  loading = false,
}) => {
  const isEdit = Boolean(client);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    status: 'active',
    currency: 'USD',
    portalAccess: false,
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'USA',
    },
    tags: [],
    notes: '',
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        company: client.company || '',
        email: client.email || '',
        phone: client.phone || '',
        website: client.website || '',
        status: client.status || 'active',
        currency: client.currency || 'USD',
        portalAccess: Boolean(client.portalAccess),
        address: {
          street: client.address?.street || '',
          city: client.address?.city || '',
          state: client.address?.state || '',
          postalCode: client.address?.postalCode || '',
          country: client.address?.country || 'USA',
        },
        tags: Array.isArray(client.tags) ? [...client.tags] : [],
        notes: client.notes || '',
      });
    } else {
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        website: '',
        status: 'active',
        currency: 'USD',
        portalAccess: false,
        address: {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'USA',
        },
        tags: [],
        notes: '',
      });
    }
    setTagInput('');
    setErrors({});
  }, [client, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleAddressChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '');
      if (clean && !formData.tags.includes(clean)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, clean],
        }));
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Contact / Client name is required';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Client name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      errs.email = 'Please provide a valid email format';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      if (err.message) {
        setErrors((prev) => ({ ...prev, api: err.message }));
      }
    }
  };

  const STATUS_OPTIONS = [
    { value: 'active', label: 'Active Retainer' },
    { value: 'lead', label: 'Lead Prospect' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'archived', label: 'Archived' },
  ];

  const CURRENCY_OPTIONS = [
    { value: 'USD', label: 'USD ($) - US Dollar' },
    { value: 'EUR', label: 'EUR (€) - Euro' },
    { value: 'GBP', label: 'GBP (£) - British Pound' },
    { value: 'CAD', label: 'CAD ($) - Canadian Dollar' },
    { value: 'AUD', label: 'AUD ($) - Australian Dollar' },
    { value: 'SGD', label: 'SGD ($) - Singapore Dollar' },
    { value: 'INR', label: 'INR (₹) - Indian Rupee' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Client: ${client?.name}` : 'Register New Client'}
      size="lg"
      className="bg-neutral-900 border border-neutral-800"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {errors.api && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.api}</span>
          </div>
        )}

        {/* Section 1: Basic Information */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Primary Contact Name <span className="text-rose-400">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Sarah Connor"
                error={errors.name}
                className="bg-neutral-950"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">Company / Organization</label>
              <Input
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                placeholder="e.g. Cyberdyne Systems"
                className="bg-neutral-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="sarah@cyberdyne.io"
                error={errors.email}
                className="bg-neutral-950"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">Phone Number</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 (555) 019-2834"
                className="bg-neutral-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-neutral-300 font-medium mb-1">Client Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-neutral-200 focus:outline-none focus:border-indigo-500"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-1">
              <label className="block text-neutral-300 font-medium mb-1">Billing Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-neutral-200 focus:outline-none focus:border-indigo-500 font-mono"
              >
                {CURRENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-1">
              <label className="block text-neutral-300 font-medium mb-1">Website</label>
              <Input
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="cyberdyne.io"
                className="bg-neutral-950"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Address Information */}
        <div className="pt-3 border-t border-neutral-800 space-y-2.5">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
            Billing & Physical Address
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Input
                value={formData.address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                placeholder="Street Address (e.g. 181 Fremont St)"
                className="bg-neutral-950"
              />
            </div>
            <div>
              <Input
                value={formData.address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                placeholder="City (e.g. San Francisco)"
                className="bg-neutral-950"
              />
            </div>
            <div>
              <Input
                value={formData.address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                placeholder="State / Region (e.g. CA)"
                className="bg-neutral-950"
              />
            </div>
            <div>
              <Input
                value={formData.address.postalCode}
                onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                placeholder="Postal / ZIP (e.g. 94105)"
                className="bg-neutral-950"
              />
            </div>
            <div>
              <Input
                value={formData.address.country}
                onChange={(e) => handleAddressChange('country', e.target.value)}
                placeholder="Country (e.g. USA)"
                className="bg-neutral-950"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Portal Access & Tags */}
        <div className="pt-3 border-t border-neutral-800 space-y-3">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.portalAccess}
              onChange={(e) => handleChange('portalAccess', e.target.checked)}
              className="rounded border-neutral-700 bg-neutral-950 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span className="text-neutral-200 font-medium">Enable Client Self-Service Portal Access</span>
          </label>

          {/* Tags Input */}
          <div>
            <label className="block text-neutral-300 font-medium mb-1">
              Account Tags (Press Enter or comma to add)
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg bg-neutral-950 border border-neutral-800 min-h-[38px]">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-neutral-800 text-neutral-200 border border-neutral-700"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-neutral-400 hover:text-rose-400"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={formData.tags.length === 0 ? "Type tag (e.g. VIP, Retainer) and press Enter" : ""}
                className="flex-1 min-w-[120px] bg-transparent text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Internal Notes */}
          <div>
            <label className="block text-neutral-300 font-medium mb-1">Internal Notes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Important nuances, billing preferences, key stakeholders, NDA terms..."
              className="w-full p-2.5 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Client'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
