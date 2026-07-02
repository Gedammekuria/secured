import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, FileEdit, ArrowRight, Send, X, ClipboardList, Bell, Shield, Save } from 'lucide-react';
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
  const [categoryBudgets, setCategoryBudgets] = useState({});
  const [autoSaving, setAutoSaving] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const autoSaveTimer = useRef(null);
  const formDataRef = useRef(null);

  // Sync budget when activeCategory changes
  useEffect(() => {
    if (activeCategory) {
      setFormData(prev => ({
        ...prev,
        budget: categoryBudgets[activeCategory] || ''
      }));
      setTouched(prev => ({ ...prev, budget: false }));
    }
  }, [activeCategory]);

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

  // Keep a ref in sync with formData for use in async autosave
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Background pre-save — fires as user types so the button click is instant
  const triggerAutoSave = useCallback(async (currentFormData, currentDbRecordId, currentCategoryBudgets, currentActiveCategory) => {
    // Need at least name + contact to save anything meaningful
    if (!currentFormData.fullName || !currentFormData.initialContact) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      try {
        setAutoSaving(true);
        const updatedBudgets = { ...(currentCategoryBudgets || {}) };
        if (currentFormData.budget && currentActiveCategory) {
          updatedBudgets[currentActiveCategory] = currentFormData.budget;
        }
        const combinedBudget = Object.entries(updatedBudgets).length > 0
          ? Object.entries(updatedBudgets).map(([cat, b]) => `${cat}: ${b}`).join(' | ')
          : (currentFormData.budget || null);

        const response = await fetch('/api/inquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: currentDbRecordId,
            source: 'quote',
            ...currentFormData,
            budget: combinedBudget,
            inquiryType: currentFormData.inquiryType.includes(currentActiveCategory)
              ? currentFormData.inquiryType
              : [...(currentFormData.inquiryType || []), currentActiveCategory]
          })
        });
        const data = await response.json();
        if (response.ok && data.id) {
          setDbRecordId(data.id);
          setAutoSaved(true);
          setTimeout(() => setAutoSaved(false), 2500);
        }
      } catch (err) {
        console.warn('Background pre-save failed silently:', err.message);
      } finally {
        setAutoSaving(false);
      }
    }, 800); // 0.8s debounce — fast enough to save before user clicks button
  }, []);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'fullName') {
      if (!value || !value.trim()) {
        error = 'Full name is required.';
      } else if (value.trim().length < 5) {
        error = 'Full name must be at least 5 characters.';
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
    const updatedBudgets = name === 'budget'
      ? { ...categoryBudgets, [activeCategory]: value }
      : categoryBudgets;

    let latestFormData;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      formDataRef.current = updated;
      latestFormData = updated;
      return updated;
    });
    if (name === 'budget') {
      setCategoryBudgets(updatedBudgets);
    }

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }

    // Pre-save DURING step 1 typing so the button click is instant
    const step1Fields = ['fullName', 'initialContact', 'customInquiry'];
    if (step1Fields.includes(name) && !contactSubmitted) {
      // Use a short timeout to get the latest state after setState
      const fd = formDataRef.current || {};
      const updatedFd = { ...fd, [name]: value };
      if (updatedFd.fullName && updatedFd.initialContact) {
        triggerAutoSave(updatedFd, dbRecordId, categoryBudgets, activeCategory);
      }
      return;
    }

    // Auto-save for select/dropdown changes in step 2
    const selectFields = ['budget', 'timeframe', 'installedsystem', 'alarmPropertyType', 'alarmSystemType', 'alarmTimeframe'];
    if (selectFields.includes(name) && contactSubmitted && formDataRef.current) {
      triggerAutoSave(formDataRef.current, dbRecordId, updatedBudgets, activeCategory);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
    // Pre-save on blur too — catches copy-paste and tab-navigation
    const fd = formDataRef.current || {};
    if (fd.fullName && fd.initialContact) {
      triggerAutoSave(fd, dbRecordId, categoryBudgets, activeCategory);
    }
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

    // Validate fields
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

    if (hasError) return;

    const hasAt = formData.initialContact.includes('@');
    setIsEmailInitial(hasAt);

    // If already pre-saved in background, transition instantly with no DB wait
    if (dbRecordId) {
      setContactSubmitted(true);
      window.scrollTo(0, 0);
      return;
    }

    // Fallback: save now (only if background pre-save hadn't fired yet)
    setSubmitting(true);
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: dbRecordId,
          source: 'quote',
          fullName: formData.fullName,
          initialContact: formData.initialContact,
          inquiryType: formData.inquiryType.includes(activeCategory)
            ? formData.inquiryType
            : [...formData.inquiryType, activeCategory],
          customInquiry: formData.customInquiry || null
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save form progress.');
      setDbRecordId(data.id);
      setContactSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Save error:', err);
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

    const updatedBudgets = { ...categoryBudgets, [activeCategory]: formData.budget };
    const combinedBudget = Object.entries(updatedBudgets)
      .map(([cat, b]) => `${cat}: ${b}`)
      .join(' | ');

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
          budget: combinedBudget,
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

      setCategoryBudgets(updatedBudgets);

      setActiveCategory(targetCategory);
      setView('form');
      setContactSubmitted(true);

      setFormData(prev => ({
        ...prev,
        budget: '',
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

    const updatedBudgets = { ...categoryBudgets, [activeCategory]: formData.budget };
    const combinedBudget = Object.entries(updatedBudgets)
      .map(([cat, b]) => `${cat}: ${b}`)
      .join(' | ');

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
          budget: combinedBudget
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit quote request.');
      }

      setSubmitted(true);
      setDbRecordId(null);
      setCategoryBudgets({});
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
              <h1 className="display-2 font-weight-bold mb-3" style={{ color: '#0a2540' }}>Request Received!</h1>
              <p style={{ textAlign: 'center', justifyContent: 'center', fontSize: '13px', color: '#64748b', maxWidth: '360px', margin: '0 auto', lineHeight: 1.6 }}>
                Thank you, <strong style={{ color: '#0a2540' }}>{formData.fullName}</strong>! Our security experts will review your inquiry and get back to you within 24 hours.
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
                              placeholder=" "
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
                              placeholder=" "
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
                              placeholder=" "
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
                                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{formData.initialContact}</div>
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
                              placeholder=" "
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
                              placeholder=" "
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
                            {isEmailInitial ? 'Contact Phone Number' : 'Email'}
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
                                placeholder=" "
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
                              placeholder=" "
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

                            <div className="row">
                              <div className="qf-group mb-4">
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
                              <div className="qf-group mb-4">
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
                            <div className=" qf-group mb-4">
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

                            <div className="row">
                              <div className="qf-group mb-4">
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
                              <div className="qf-group mb-4">
                                <label className="mb-2 d-block font-weight-bold">Number of required Sensors</label>
                                <input
                                  type="number"
                                  name="numSensors"
                                  value={formData.numSensors}
                                  onChange={handleChange}
                                  placeholder=" "
                                  style={{ border: '2.5px solid #f1f5f9', borderRadius: '16px', padding: '15px 20px', width: '100%' }}
                                />
                              </div>
                            </div>
                            <div className="qf-group mb-4">
                              <label className="mb-2 d-block font-weight-bold">System preference</label>
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
                              <div className="qf-group mb-4">
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
                              <div className="qf-group mb-4">
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
                            <option value="50,001 - 100,000 ETB">50,001 - 100,000 ETB</option>
                            <option value="100,001 - 250,000 ETB">100,001 - 250,000 ETB</option>
                            <option value="250,001 - 450,000 ETB">250,001 - 450,000 ETB</option>
                            <option value="450,001 - 700,000 ETB">450,001 - 700,000 ETB</option>
                            <option value="700,001 - 1,000,000 ETB">700,001 - 1,000,000 ETB</option>
                            <option value="1,000,001 - 2,000,000 ETB">1,000,001 - 2,000,000 ETB</option>
                            <option value="Above 2,000,000 ETB">Above 2,000,000 ETB</option>
                            <option value="Not sure">Not sure</option>
                          </select>
                          {touched.budget && errors.budget && (
                            <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: '600', marginTop: '6px', marginLeft: '4px' }}>
                              {errors.budget}
                            </div>
                          )}
                        </div>

                        {/* Autosave indicator */}
                        {(autoSaving || autoSaved) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: autoSaving ? '#94a3b8' : '#22c55e', fontWeight: '600', marginBottom: '12px', transition: 'all 0.3s ease' }}>
                            <Save size={13} />
                            {autoSaving ? 'Saving...' : '✓ Progress saved automatically'}
                          </div>
                        )}

                        <div className="qf-group mb-5">
                          <label className="mb-2 d-block font-weight-bold">Additional Details</label>
                          <textarea
                            rows="4"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder=" "
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
                              Add Alarm System
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
                              Add CCTV System
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
