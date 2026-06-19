import React, { useState, useEffect } from 'react';
import { CheckCircle, FileEdit, ArrowRight, Send, X, ClipboardList, Bell, Shield } from 'lucide-react';
import PhoneInput from '../components/PhoneInput';
const QuotePage = ({ onNavigate, initialCategory = null }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [view, setView] = useState(initialCategory ? 'form' : 'selection'); // 'selection', 'form', 'success'
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [completedCategories, setCompletedCategories] = useState([]);
  const [dbRecordId, setDbRecordId] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState('');

  // Handle case where user might navigate between quote routes
  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
      setView('form');
      setFormData(prev => ({
        ...prev,
        inquiryType: prev.inquiryType.includes(initialCategory) ? prev.inquiryType : [...prev.inquiryType, initialCategory]
      }));
    }
  }, [initialCategory]);

  const [formData, setFormData] = useState({
    initialContact: '',
    inquiryType: [],
    customInquiry: '',
    fullName: '',
    companyName: '',
    alternativeContact: '',
    location: '',
    message: '',
    budget: '',
    numCameras: '',
    timeframe: '',
    installedsystem: '',
    alarmPropertyType: '',
    numSensors: '',
    alarmSystemType: '',
    alarmTimeframe: '',
    alarmInstalledSystem: ''
  });
  const [isEmailInitial, setIsEmailInitial] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'fullName') {
      if (!value || !value.trim()) {
        error = 'Full name is required.';
      } else if (value.trim().length < 3) {
        error = 'Full name must be at least 3 characters.';
      }
    }
    if (name === 'initialContact') {
      if (!value || !value.trim()) {
        error = 'Contact information (email or phone) is required.';
      } else {
        const isEmail = value.includes('@');
        if (isEmail) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.trim())) {
            error = 'Please enter a valid email address.';
          }
        } else {
          const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;
          if (!phoneRegex.test(value.trim())) {
            error = 'Please enter a valid phone number.';
          }
        }
      }
    }
    if (name === 'customInquiry') {
      if (activeCategory === 'Other' && (!value || !value.trim())) {
        error = 'Please specify the service you need.';
      }
    }
    if (name === 'location') {
      if (!value || !value.trim()) {
        error = 'Project location is required.';
      }
    }
    if (name === 'alternativeContact') {
      if (!value || (typeof value === 'string' && !value.trim())) {
        error = isEmailInitial ? 'Phone number is required.' : 'Email address is required.';
      } else if (!isEmailInitial) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) {
          error = 'Please enter a valid email address.';
        }
      } else {
        const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;
        if (!phoneRegex.test(value.trim())) {
          error = 'Please enter a valid phone number.';
        }
      }
    }
    if (name === 'budget') {
      if (!value) {
        error = 'Estimated budget range is required.';
      }
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleCategorySelect = (category) => {
    if (category === 'CCTV Systems') {
      onNavigate('cctv-quote');
    } else if (category === 'Alarm Systems') {
      onNavigate('alarm-quote');
    } else {
      onNavigate('other-quote');
    }
    window.scrollTo(0, 0);
  };

  const handleContactSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmitError('');

    const step1Fields = ['fullName', 'initialContact'];
    if (activeCategory === 'Other') {
      step1Fields.push('customInquiry');
    }

    const newErrors = {};
    const newTouched = {};
    let hasError = false;

    step1Fields.forEach(field => {
      newTouched[field] = true;
      const err = validateField(field, formData[field]);
      newErrors[field] = err;
      if (err) hasError = true;
    });

    setTouched(prev => ({ ...prev, ...newTouched }));
    setErrors(prev => ({ ...prev, ...newErrors }));

    if (hasError) {
      return;
    }

    const hasAt = formData.initialContact.includes('@');
    setIsEmailInitial(hasAt);

    setSubmitting(true);
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: dbRecordId,
          source: 'quote',
          fullName: formData.fullName,
          initialContact: formData.initialContact,
          inquiryType: formData.inquiryType.includes(activeCategory) ? formData.inquiryType : [...formData.inquiryType, activeCategory],
          customInquiry: formData.customInquiry || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save form progress.');
      }
      setDbRecordId(data.id);
      setContactSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Autosave error:', err);
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAnother = async (targetCategory) => {
    setSubmitError('');
    const step2Fields = ['location', 'alternativeContact', 'budget'];
    const newErrors = {};
    const newTouched = {};
    let hasError = false;

    step2Fields.forEach(field => {
      newTouched[field] = true;
      const err = validateField(field, formData[field]);
      newErrors[field] = err;
      if (err) hasError = true;
    });

    setTouched(prev => ({ ...prev, ...newTouched }));
    setErrors(prev => ({ ...prev, ...newErrors }));

    if (hasError) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: dbRecordId,
          source: 'quote',
          ...formData,
          inquiryType: formData.inquiryType.includes(activeCategory) ? formData.inquiryType : [...formData.inquiryType, activeCategory]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save progress.');
      }

      setDbRecordId(data.id);

      setCompletedCategories(prev => {
        if (!prev.includes(activeCategory)) {
          return [...prev, activeCategory];
        }
        return prev;
      });

      setActiveCategory(targetCategory);
      setView('form');
      setContactSubmitted(true);

      setFormData(prev => ({
        ...prev,
        inquiryType: prev.inquiryType.includes(targetCategory) ? prev.inquiryType : [...prev.inquiryType, targetCategory]
      }));

      if (targetCategory === 'CCTV Systems') {
        onNavigate('cctv-quote');
      } else if (targetCategory === 'Alarm Systems') {
        onNavigate('alarm-quote');
      } else {
        onNavigate('other-quote');
      }

      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Autosave error:', err);
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmitError('');

    const step2Fields = ['location', 'alternativeContact', 'budget'];
    const newErrors = {};
    const newTouched = {};
    let hasError = false;

    step2Fields.forEach(field => {
      newTouched[field] = true;
      const err = validateField(field, formData[field]);
      newErrors[field] = err;
      if (err) hasError = true;
    });

    setTouched(prev => ({ ...prev, ...newTouched }));
    setErrors(prev => ({ ...prev, ...newErrors }));

    if (hasError) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: dbRecordId,
          source: 'quote',
          ...formData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit quote request.');
      }

      setSubmitted(true);
      setDbRecordId(null);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Submission error:', err);
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-light min-vh-100 pt-120 pb-120">
      <div className="container mb-5">
        <div className="mx-auto" style={{ maxWidth: '800px' }}>

          {submitted ? (
            <div className="bg-white rounded-32 shadow-lg p-5 text-center animate-fade-in" style={{ padding: '80px 40px' }}>
              <div className="quote-success-icon mx-auto mb-4" style={{ width: '80px', height: '80px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={48} />
              </div>
              <h1 className="display-4 font-weight-bold mb-3" style={{ color: '#0a2540' }}>Request Received!</h1>
              <p className="lead text-muted mb-5">
                Thank you, {formData.fullName}. Your security inquiry has been prioritized.
                Our experts will review your requirements and contact you within 24 hours.
              </p>
              <button
                className="btn-primary rounded-pill px-5 py-3"
                onClick={() => onNavigate('landing')}
              >
                Back to Home
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-32 shadow-lg overflow-hidden animate-slide-up">
              {/* Header */}
              <div className="p-5 text-white text-center" style={{ background: 'linear-gradient(135deg, #0a2540 0%, var(--primary) 100%)', position: 'relative' }}>


                {/* Decorative background glow */}
                <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99, 91, 255, 0.15) 0%, transparent 70%)', filter: 'blur(50px)' }}></div>
              </div>

              {/* Form Body */}
              <div className="p-5" style={{ padding: '50px' }}>
                {view === 'selection' ? (
                  /* --- SELECTION VIEW --- */
                  <div className="animate-fade-in">
                    <div className="text-center mb-5">
                      <h2 className="font-weight-bold mb-3" style={{ color: '#0a2540' }}>What do you need to secure?</h2>
                      <p className="text-muted">Select a category to start your tailored quote request.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                      {[
                        { id: 'CCTV Systems', name: 'CCTV Camera', icon: <Shield size={32} />, desc: 'High-definition surveillance' },
                        { id: 'Alarm Systems', name: 'Alarm System', icon: <Bell size={32} />, desc: 'Intrusion detection' },
                        { id: 'Other', name: 'Other Services', icon: <ClipboardList size={32} />, desc: 'Custom security solutions' }
                      ].map((cat) => (
                        <div
                          key={cat.id}
                          onClick={() => handleCategorySelect(cat.id)}
                          style={{
                            padding: '30px',
                            borderRadius: '24px',
                            border: `2.5px solid ${completedCategories.includes(cat.id) ? '#22c55e' : '#f1f5f9'}`,
                            background: completedCategories.includes(cat.id) ? 'rgba(34, 197, 94, 0.05)' : 'white',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
                          }}
                          className="category-card"
                        >
                          {completedCategories.includes(cat.id) && (
                            <div style={{ position: 'absolute', top: '15px', right: '15px', color: '#22c55e' }}>
                              <CheckCircle size={20} />
                            </div>
                          )}
                          <div style={{
                            width: '70px',
                            height: '70px',
                            borderRadius: '20px',
                            background: completedCategories.includes(cat.id) ? 'rgba(34, 197, 94, 0.05)' : 'rgba(226, 88, 34, 0.03)',
                            color: completedCategories.includes(cat.id) ? '#22c55e' : 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px'
                          }}>
                            {cat.icon}
                          </div>
                          <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>{cat.name}</h4>
                          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: 0 }}>{cat.desc}</p>
                        </div>
                      ))}
                    </div>

                    {completedCategories.length > 0 && (
                      <div className="mt-5 pt-4 border-top text-center">
                        <button
                          onClick={handleFinalSubmit}
                          disabled={submitting}
                          className="btn-primary px-5 py-4 rounded-20 shadow-primary"
                          style={{ fontSize: '18px', fontWeight: '700', minWidth: '280px', opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
                        >
                          {submitting ? 'Submitting...' : `Submit All Requests (${completedCategories.length})`} {!submitting && <Send size={20} className="ml-2" />}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* --- FORM VIEW --- */
                  <form onSubmit={handleFinalSubmit} className="animate-fade-in">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-4 mb-5 pb-3 border-bottom">
                      <div className="d-flex align-items-center gap-3">
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px rgba(226, 88, 34, 0.4)' }}></div>
                        <span style={{ fontWeight: '800', color: '#0a2540', fontSize: '20px', letterSpacing: '-0.5px' }}>{activeCategory}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setView('selection')}
                        style={{
                          background: '#fff3f0',
                          border: '2px solid var(--primary)',
                          color: 'var(--primary)',
                          fontWeight: '800',
                          padding: '10px 20px',
                          borderRadius: '12px',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.3s ease',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <X size={18} /> Back to Categories
                      </button>
                    </div>

                    {!contactSubmitted ? (
                      <div className="animate-slide-down">


                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                          <div className="qf-group">
                            <label className="mb-2 d-block font-weight-bold" style={{ fontSize: '14px' }}>Full Name<span className="req">*</span></label>
                            <input
                              type="text"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="Your Full Name"
                              required
                              style={{
                                border: touched.fullName
                                  ? (errors.fullName ? '2.5px solid #ef4444' : '2.5px solid #22c55e')
                                  : '2.5px solid #f1f5f9',
                                borderRadius: '16px',
                                padding: '18px 24px',
                                width: '100%',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                              }}
                            />
                            {touched.fullName && errors.fullName && (
                              <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: '600', marginTop: '6px', marginLeft: '4px' }}>
                                {errors.fullName}
                              </div>
                            )}
                          </div>
                          <div className="qf-group">
                            <label className="mb-2 d-block font-weight-bold" style={{ fontSize: '14px' }}>Email or Phone<span className="req">*</span></label>
                            <input
                              type="text"
                              name="initialContact"
                              value={formData.initialContact}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="Direct contact method"
                              required
                              style={{
                                border: touched.initialContact
                                  ? (errors.initialContact ? '2.5px solid #ef4444' : '2.5px solid #22c55e')
                                  : '2.5px solid #f1f5f9',
                                borderRadius: '16px',
                                padding: '18px 24px',
                                width: '100%',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                              }}
                            />
                            {touched.initialContact && errors.initialContact && (
                              <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: '600', marginTop: '6px', marginLeft: '4px' }}>
                                {errors.initialContact}
                              </div>
                            )}
                          </div>
                        </div>

                        {activeCategory === 'Other' && (
                          <div className="qf-group mb-4 animate-slide-down">
                            <label className="mb-2 d-block font-weight-bold" style={{ fontSize: '14px' }}>What service do you need?<span className="req">*</span></label>
                            <input
                              type="text"
                              name="customInquiry"
                              value={formData.customInquiry}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="e.g. Smart Lock, Intercom, etc."
                              required
                              style={{
                                border: touched.customInquiry
                                  ? (errors.customInquiry ? '2.5px solid #ef4444' : '2.5px solid #22c55e')
                                  : '2.5px solid #f1f5f9',
                                borderRadius: '16px',
                                padding: '18px 24px',
                                width: '100%',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                              }}
                            />
                            {touched.customInquiry && errors.customInquiry && (
                              <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: '600', marginTop: '6px', marginLeft: '4px' }}>
                                {errors.customInquiry}
                              </div>
                            )}
                          </div>
                        )}

                        {submitError && (
                          <div style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', padding: '12px 20px', fontWeight: '600', fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}>
                            Error: {submitError}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleContactSubmit}
                          disabled={submitting}
                          className="btn-primary w-100 py-4 rounded-24 shadow-primary"
                          style={{
                            fontSize: '18px',
                            fontWeight: '800',
                            background: 'linear-gradient(135deg, var(--primary) 0%, #ff7500 100%)',
                            border: 'none',
                            boxShadow: '0 10px 25px rgba(226, 88, 34, 0.35)',
                            opacity: submitting ? 0.7 : 1,
                            cursor: submitting ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {submitting ? 'Saving...' : 'Save & Continue'} {!submitting && <ArrowRight size={20} className="ml-2" />}
                        </button>
                      </div>
                    ) : (
                      <div className="animate-slide-up">
                        <div className="p-4 rounded-24 mb-5" style={{ background: 'rgba(226, 88, 34, 0.05)', border: '1px dashed var(--primary)' }}>
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-3">
                              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', background: 'var(--primary)', boxShadow: '0 4px 12px rgba(226, 88, 34, 0.2)' }}>
                                <CheckCircle size={20} />
                              </div>
                              <div>
                                <div style={{ fontSize: '15px', fontWeight: '800', color: '#0a2540' }}>{formData.fullName}</div>
                                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{formData.initialContact} • Lead Secured</div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setContactSubmitted(false)}
                              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '13px', fontWeight: '800', textDecoration: 'underline' }}
                            >
                              Edit Info
                            </button>
                          </div>
                        </div>

                        <div className="text-center mb-5">
                          <div className="badge-pill mb-3" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '8px 20px', borderRadius: '50px', fontSize: '11px', fontWeight: '800', display: 'inline-block', letterSpacing: '1px', textTransform: 'uppercase' }}>Step 2: Technical Specs</div>
                          <h3 style={{ fontWeight: '800', color: '#0a2540' }}>{activeCategory} Requirements</h3>
                        </div>

                        <div className="row mb-4">
                          <div className="col-md-6 mb-4 mb-md-0">
                            <label className="mb-2 d-block font-weight-bold" style={{ fontSize: '14px' }}>Project Location<span className="req">*</span></label>
                            <input
                              type="text"
                              name="location"
                              value={formData.location}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="e.g. Addis Ababa"
                              required
                              style={{
                                border: touched.location
                                  ? (errors.location ? '2.5px solid #ef4444' : '2.5px solid #22c55e')
                                  : '2.5px solid #f1f5f9',
                                borderRadius: '16px',
                                padding: '18px 24px',
                                width: '100%',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                              }}
                            />
                            {touched.location && errors.location && (
                              <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: '600', marginTop: '6px', marginLeft: '4px' }}>
                                {errors.location}
                              </div>
                            )}
                          </div>
                          <div className="col-md-6">
                            <label className="mb-2 d-block font-weight-bold" style={{ fontSize: '14px' }}>Company Name <span className="opacity-50" style={{ fontWeight: '400' }}>(Optional)</span></label>
                            <input
                              type="text"
                              name="companyName"
                              value={formData.companyName}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="Your Company"
                              style={{
                                border: touched.companyName && formData.companyName
                                  ? '2.5px solid #22c55e'
                                  : '2.5px solid #f1f5f9',
                                borderRadius: '16px',
                                padding: '18px 24px',
                                width: '100%',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                              }}
                            />
                          </div>
                        </div>

                        <div className="qf-group mb-5">
                          <label className="mb-2 d-block font-weight-bold" style={{ fontSize: '14px' }}>
                            {isEmailInitial ? 'Contact Phone Number' : 'Personal/Work Email'}
                            <span className="req">*</span>
                          </label>
                          {isEmailInitial ? (
                            <div style={{
                              border: touched.alternativeContact
                                ? (errors.alternativeContact ? '2.5px solid #ef4444' : '2.5px solid #22c55e')
                                : 'none',
                              borderRadius: '16px',
                              transition: 'all 0.3s ease'
                            }}>
                              <PhoneInput
                                name="alternativeContact"
                                value={formData.alternativeContact}
                                onChange={handleChange}
                                placeholder="With country code (e.g. +251...)"
                                size="lg"
                              />
                            </div>
                          ) : (
                            <input
                              type="email"
                              name="alternativeContact"
                              value={typeof formData.alternativeContact === 'object' ? '' : (formData.alternativeContact || '')}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="email@example.com"
                              required
                              style={{
                                border: touched.alternativeContact
                                  ? (errors.alternativeContact ? '2.5px solid #ef4444' : '2.5px solid #22c55e')
                                  : '2.5px solid #f1f5f9',
                                borderRadius: '16px',
                                padding: '18px 24px',
                                width: '100%',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                              }}
                            />
                          )}
                          {touched.alternativeContact && errors.alternativeContact && (
                            <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: '600', marginTop: '6px', marginLeft: '4px' }}>
                              {errors.alternativeContact}
                            </div>
                          )}
                          <p className="mt-2 text-muted" style={{ fontSize: '12px' }}>We need this to finalize your official quote document.</p>
                        </div>


                        {/* --- CATEGORY SPECIFIC FIELDS --- */}
                        {activeCategory === 'CCTV Systems' && (
                          <div className="animate-slide-down mb-5">
                            <div className="d-flex align-items-center gap-2 mb-4">
                              <Shield size={20} className="text-primary" />
                              <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: 0 }}>CCTV Requirements</h4>
                            </div>
                            <div className="row">
                              <div className="col-md-6 mb-4">
                                <label className="mb-2 d-block font-weight-bold">Estimated Number of Cameras needed?</label>
                                <input
                                  type="number"
                                  name="numCameras"
                                  value={formData.numCameras}
                                  onChange={handleChange}
                                  placeholder=" "
                                  style={{ border: '2.5px solid #f1f5f9', borderRadius: '16px', padding: '15px 20px', width: '100%' }}
                                />
                              </div>
                              <div className="col-md-6 mb-4">
                                <label className="mb-2 d-block font-weight-bold">Your estimate timeframe to complete the project?</label>
                                <select
                                  name="timeframe"
                                  value={formData.timeframe}
                                  onChange={handleChange}
                                  style={{ border: '2.5px solid #f1f5f9', borderRadius: '16px', padding: '15px 20px', width: '100%' }}
                                >
                                  <option value=""></option>
                                  <option value="Urgent">Urgent</option>
                                  <option value="Based on your schedule">Based on your schedule</option>
                                  <option value="With in a Week">With in a Week</option>
                                  <option value="With in a month">With in a Month</option>
                                </select>
                              </div>
                            </div>
                            <div className="mb-4">
                              <label className="mb-2 d-block font-weight-bold">If there was previously installed system type the brand here?</label>
                              <input
                                type="text"
                                name="installedsystem"
                                value={formData.installedsystem}
                                onChange={handleChange}
                                placeholder=""
                                style={{ border: '2.5px solid #f1f5f9', borderRadius: '16px', padding: '15px 20px', width: '100%' }}
                              />
                            </div>
                          </div>
                        )}

                        {activeCategory === 'Alarm Systems' && (
                          <div className="animate-slide-down mb-5">
                            <div className="d-flex align-items-center gap-2 mb-4">
                              <Bell size={20} className="text-primary" />
                              <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: 0 }}>Alarm System Specifications</h4>
                            </div>
                            <div className="row">
                              <div className="col-md-6 mb-4">
                                <label className="mb-2 d-block font-weight-bold">Property Type</label>
                                <select
                                  name="alarmPropertyType"
                                  value={formData.alarmPropertyType}
                                  onChange={handleChange}
                                  style={{ border: '2.5px solid #f1f5f9', borderRadius: '16px', padding: '15px 20px', width: '100%' }}
                                >
                                  <option value="">Select type</option>
                                  <option value="Residential">Residential</option>
                                  <option value="Commercial">Commercial</option>
                                  <option value="Industrial">Industrial</option>
                                </select>
                              </div>
                              <div className="col-md-6 mb-4">
                                <label className="mb-2 d-block font-weight-bold">Number of Sensors</label>
                                <input
                                  type="number"
                                  name="numSensors"
                                  value={formData.numSensors}
                                  onChange={handleChange}
                                  placeholder="e.g. 6"
                                  style={{ border: '2.5px solid #f1f5f9', borderRadius: '16px', padding: '15px 20px', width: '100%' }}
                                />
                              </div>
                            </div>
                            <div className="mb-4">
                              <label className="mb-2 d-block font-weight-bold">System Preference</label>
                              <select
                                name="alarmSystemType"
                                value={formData.alarmSystemType}
                                onChange={handleChange}
                                style={{ border: '2.5px solid #f1f5f9', borderRadius: '16px', padding: '15px 20px', width: '100%' }}
                              >
                                <option value="">Select preference</option>
                                <option value="Wireless (Ajax)">Wireless (Ajax)</option>
                                <option value="GSM Burglar Alarm">GSM Burglar Alarm</option>
                              </select>
                            </div>
                            <div className="row">
                              <div className="col-md-6 mb-4">
                                <label className="mb-2 d-block font-weight-bold">Your estimate timeframe to complete the project?</label>
                                <select
                                  name="alarmTimeframe"
                                  value={formData.alarmTimeframe}
                                  onChange={handleChange}
                                  style={{ border: '2.5px solid #f1f5f9', borderRadius: '16px', padding: '15px 20px', width: '100%' }}
                                >
                                  <option value="">select</option>
                                  <option value="Urgent">Urgent</option>
                                  <option value="Based on your schedule">Based on your schedule</option>
                                  <option value="With in a Week">With in a Week</option>
                                  <option value="With in a month">With in a Month</option>
                                </select>
                              </div>
                              <div className="col-md-6 mb-4">
                                <label className="mb-2 d-block font-weight-bold">If there was previously installed system type the brand here?</label>
                                <input
                                  type="text"
                                  name="alarmInstalledSystem"
                                  value={formData.alarmInstalledSystem}
                                  onChange={handleChange}
                                  placeholder=""
                                  style={{ border: '2.5px solid #f1f5f9', borderRadius: '16px', padding: '15px 20px', width: '100%' }}
                                />
                              </div>
                            </div>
                          </div>
                        )}



                        <div className="qf-group mb-4">
                          <label className="mb-2 d-block font-weight-bold">Estimated Budget<span className="req">*</span></label>
                          <select
                            name="budget"
                            value={formData.budget}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            style={{
                              border: touched.budget
                                ? (errors.budget ? '2.5px solid #ef4444' : '2.5px solid #22c55e')
                                : '2.5px solid #f1f5f9',
                              borderRadius: '16px',
                              padding: '15px 20px',
                              width: '100%',
                              fontSize: '16px',
                              outline: 'none',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <option value="">Select Budget Range</option>
                            <option value="Under 50,000 ETB">Under 50,000 ETB</option>
                            <option value="50,000 - 150,000 ETB">50,001 - 100,000 ETB</option>
                            <option value="50,000 - 150,000 ETB">100,001 - 250,000 ETB</option>
                            <option value="150,000 - 500,000 ETB">250,001 - 450,000 ETB</option>
                            <option value="150,000 - 500,000 ETB">450,001 - 700,000 ETB</option>
                            <option value="150,000 - 500,000 ETB">700,001 - 1,000,000 ETB</option>
                            <option value="150,000 - 500,000 ETB">1,000,001- 2,000,000 ETB</option>
                            <option value="500,000+ ETB">Above 2,000,000+ ETB</option>
                            <option value="Not sure">Not sure</option>

                          </select>
                          {touched.budget && errors.budget && (
                            <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: '600', marginTop: '6px', marginLeft: '4px' }}>
                              {errors.budget}
                            </div>
                          )}
                        </div>

                        <div className="qf-group mb-5">
                          <label className="mb-2 d-block font-weight-bold">Additional Details</label>
                          <textarea
                            rows="4"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Any specifics you'd like to share..."
                            style={{ border: '2.5px solid #f1f5f9', borderRadius: '16px', padding: '18px 24px', width: '100%', fontSize: '16px' }}
                          />
                        </div>

                        {submitError && (
                          <div style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', padding: '12px 20px', fontWeight: '600', fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}>
                            Error: {submitError}
                          </div>
                        )}

                        <div className="d-flex gap-3 mt-4 pt-2">
                          {!completedCategories.includes('Alarm Systems') && activeCategory === 'CCTV Systems' && (
                            <button
                              type="button"
                              onClick={() => handleAddAnother('Alarm Systems')}
                              style={{
                                background: '#fff3f0',
                                border: '2px solid var(--primary)',
                                color: 'var(--primary)',
                                fontWeight: '800',
                                padding: '16px 0',
                                borderRadius: '20px',
                                flex: 1,
                                fontSize: '15px',
                                letterSpacing: '0.5px',
                                transition: 'all 0.3s ease'
                              }}
                              className="hover-lift"
                            >
                              Add Alarm System +
                            </button>
                          )}
                          {activeCategory !== 'CCTV Systems' && !completedCategories.includes('CCTV Systems') && (
                            <button
                              type="button"
                              onClick={() => handleAddAnother('CCTV Systems')}
                              style={{
                                background: '#fff3f0',
                                border: '2px solid var(--primary)',
                                color: 'var(--primary)',
                                fontWeight: '800',
                                padding: '16px 0',
                                borderRadius: '20px',
                                flex: 1,
                                fontSize: '15px',
                                letterSpacing: '0.5px',
                                transition: 'all 0.3s ease'
                              }}
                              className="hover-lift"
                            >
                              Add CCTV Setup +
                            </button>
                          )}

                          <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary rounded-20 shadow-primary"
                            style={{
                              fontSize: '16px',
                              fontWeight: '800',
                              background: 'linear-gradient(135deg, var(--primary) 0%, #ff7500 100%)',
                              border: 'none',
                              boxShadow: '0 8px 20px rgba(226, 88, 34, 0.3)',
                              padding: '16px 0',
                              flex: 1.5,
                              opacity: submitting ? 0.7 : 1,
                              cursor: submitting ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {submitting ? 'Submitting...' : 'Submit Request'} {!submitting && <Send size={18} className="ml-2" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotePage;
