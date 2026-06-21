import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Shield, ArrowRight, CheckCircle, Bell, XCircle } from 'lucide-react';
import PhoneInput from '../components/PhoneInput';

/* ─────────────────────────────────────────────
   Tiny helper – input border colour by state
───────────────────────────────────────────── */
const fieldBorder = (name, errors, touched) => {
  if (!touched[name]) return '1.5px solid #eef2f6';
  if (errors[name]) return '1.5px solid #ef4444';
  return '1.5px solid #22c55e';
};

const FieldMsg = ({ name, errors, touched }) => {
  if (!touched[name]) return null;
  if (errors[name])
    return <span style={{ display: 'block', fontSize: '12px', marginTop: '4px', color: '#ef4444', fontWeight: '600' }}>✗ {errors[name]}</span>;
  return <span style={{ display: 'block', fontSize: '12px', marginTop: '4px', color: '#22c55e', fontWeight: '600' }}>✓ Looks good</span>;
};

/* ─────────────────────────────────────────────
   Success Screen
───────────────────────────────────────────── */
const SuccessScreen = ({ name, onReset }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    textAlign: 'center', padding: '60px 30px', gap: '20px', minHeight: '400px'
  }}>
    <div style={{
      width: '80px', height: '80px', borderRadius: '50%',
      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 8px 30px rgba(34,197,94,0.35)',
      animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
    }}>
      <CheckCircle size={42} color="white" />
    </div>
    <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#0a2540', margin: 0 }}>
      Request Received!
    </h2>
    <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '360px', margin: 0, lineHeight: 1.6 }}>
      Thank you, <strong style={{ color: '#0a2540' }}>{name}</strong>! Our security experts will review your inquiry and get back to you within 24 hours.
    </p>
    <div style={{
      background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px',
      padding: '16px 24px', display: 'flex', gap: '10px', alignItems: 'center'
    }}>
      <CheckCircle size={18} color="#16a34a" />
      <span style={{ fontSize: '14px', color: '#15803d', fontWeight: '600' }}>
        Your inquiry has been saved to our system.
      </span>
    </div>
    <button
      onClick={onReset}
      style={{
        marginTop: '10px', padding: '14px 32px', borderRadius: '12px',
        background: 'var(--primary)', color: 'white', border: 'none',
        fontWeight: '700', fontSize: '15px', cursor: 'pointer',
        transition: 'opacity 0.2s'
      }}
      onMouseEnter={e => e.target.style.opacity = '0.85'}
      onMouseLeave={e => e.target.style.opacity = '1'}
    >
      Submit Another Request
    </button>
  </div>
);

/* ─────────────────────────────────────────────
   Error Banner
───────────────────────────────────────────── */
const ErrorBanner = ({ message }) => (
  <div style={{
    background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px',
    padding: '14px 18px', display: 'flex', gap: '10px', alignItems: 'center',
    marginBottom: '20px'
  }}>
    <XCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
    <span style={{ fontSize: '14px', color: '#dc2626', fontWeight: '600' }}>{message}</span>
  </div>
);

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const ContactPage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const emptyForm = {
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
    previousinstalled: '',
    cctvOther: '',
    alarmPropertyType: '',
    numSensors: '',
    alarmSystemType: ''
  };

  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState(emptyForm);
  const [isEmailInitial, setIsEmailInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dbRecordId, setDbRecordId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const autoSaveTimer = useRef(null);
  const formDataRef = useRef(emptyForm);

  /* ── Validation state ── */
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState('');

  /* ─── Validators ─── */
  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        return value.trim().length < 4 ? 'Full name is required (min 4 characters).' : '';
      case 'initialContact':
        if (!value.trim()) return 'Email or phone number is required.';
        const isEmail = value.includes('@');
        if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return 'Please enter a valid email address.';
        if (!isEmail && value.replace(/\D/g, '').length < 7)
          return 'Please enter a valid phone number.';
        return '';
      case 'customInquiry':
        return value.trim().length < 3 ? 'Please describe your service requirement.' : '';
      case 'alternativeContact':
        if (!value || (typeof value === 'string' && !value.trim()))
          return isEmailInitial ? 'Phone number is required.' : 'Email address is required.';
        if (!isEmailInitial && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return 'Please enter a valid email address.';
        return '';
      case 'location':
        return value.trim().length < 3 ? 'Project location is required.' : '';
      case 'budget':
        return !value ? 'Please select a budget range.' : '';
      case 'message':
        return value.trim().length < 10 ? 'Please describe your requirements (min 10 characters).' : '';
      default:
        return '';
    }
  };

  const markTouched = (name, value) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      formDataRef.current = updated;
      return updated;
    });
    if (touched[name]) setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));

    // Autosave on select field change in step 2
    const selectFields = ['budget', 'timeframe', 'previousinstalled', 'alarmPropertyType', 'alarmSystemType'];
    if (selectFields.includes(name) && formStep === 2 && formDataRef.current) {
      triggerAutoSave(formDataRef.current, dbRecordId);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    markTouched(name, value);
    // Trigger background autosave when in step 2
    if (formStep === 2 && formDataRef.current) {
      triggerAutoSave(formDataRef.current, dbRecordId);
    }
  };

  const handleCheckboxChange = (service) => {
    setFormData(prev => {
      const current = Array.isArray(prev.inquiryType) ? prev.inquiryType : [];
      let updated;
      if (current.includes(service))
        updated = { ...prev, inquiryType: current.filter(s => s !== service) };
      else
        updated = { ...prev, inquiryType: [...current, service] };
      formDataRef.current = updated;
      return updated;
    });
    setTouched(prev => ({ ...prev, inquiryType: true }));
    setErrors(prev => ({ ...prev, inquiryType: '' }));
  };

  // Background autosave — triggered silently after user leaves a field
  const triggerAutoSave = useCallback(async (currentFormData, currentDbRecordId) => {
    if (!currentFormData.fullName || !currentFormData.initialContact) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      try {
        setAutoSaving(true);
        const response = await fetch('/api/inquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: currentDbRecordId,
            source: 'contact',
            ...currentFormData
          })
        });
        const data = await response.json();
        if (response.ok && data.id) {
          setDbRecordId(data.id);
          setAutoSaved(true);
          setTimeout(() => setAutoSaved(false), 3000);
        }
      } catch (err) {
        console.warn('Background autosave failed silently:', err.message);
      } finally {
        setAutoSaving(false);
      }
    }, 1200);
  }, []);

  /* ─── Step 1 submit / autosave ─── */
  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Validate all step-1 fields
    const step1Fields = ['fullName', 'initialContact'];
    const newTouched = {};
    const newErrors = {};
    step1Fields.forEach(f => {
      newTouched[f] = true;
      newErrors[f] = validateField(f, formData[f]);
    });

    // Service check
    newTouched.inquiryType = true;
    if (formData.inquiryType.length === 0) {
      newErrors.inquiryType = 'Please select at least one service.';
    }
    if (formData.inquiryType.includes('Other')) {
      newTouched.customInquiry = true;
      newErrors.customInquiry = validateField('customInquiry', formData.customInquiry);
    }

    setTouched(prev => ({ ...prev, ...newTouched }));
    setErrors(prev => ({ ...prev, ...newErrors }));

    const hasErrors = Object.values(newErrors).some(v => v);
    if (hasErrors) return;

    const isEmail = formData.initialContact.includes('@');
    setIsEmailInitial(isEmail);

    setSubmitting(true);
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: dbRecordId,
          source: 'contact',
          fullName: formData.fullName,
          initialContact: formData.initialContact,
          inquiryType: formData.inquiryType,
          customInquiry: formData.customInquiry || null
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save form progress.');

      setDbRecordId(data.id);
      setFormStep(2);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Autosave error:', err);
      setSubmitError('Failed to save progress: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Step 2 final submit ─── */
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const step2Fields = ['alternativeContact', 'location', 'budget', 'message'];
    const newTouched = {};
    const newErrors = {};
    step2Fields.forEach(f => {
      newTouched[f] = true;
      newErrors[f] = validateField(f, formData[f]);
    });

    setTouched(prev => ({ ...prev, ...newTouched }));
    setErrors(prev => ({ ...prev, ...newErrors }));

    const hasErrors = Object.values(newErrors).some(v => v);
    if (hasErrors) {
      setSubmitError('Please fix the highlighted fields before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: dbRecordId,
          source: 'contact',
          ...formData
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to submit contact request.');

      setSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      setSubmitError('Submission failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormStep(1);
    setDbRecordId(null);
    setFormData(emptyForm);
    formDataRef.current = emptyForm;
    setErrors({});
    setTouched({});
    setSubmitError('');
    setSubmitted(false);
    setAutoSaved(false);
    window.scrollTo(0, 0);
  };

  /* ─────────── JSX ─────────── */
  return (
    <div className="contact-page pb-20">
      {/* Inject pop-in keyframe once */}
      <style>{`
        @keyframes popIn {
          0%   { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Hero Header */}
      <section className="contact-hero py-24 bg-dark text-white text-center rounded-32">
        <div className="container">
          <h1 className="display-4 font-weight-bold mb-4">How Can We Help You?</h1>
          <p className="lead opacity-70 mx-auto" style={{ maxWidth: '700px' }}>
            Whether you have a question about our services, need technical support, or want a free security consultation, our team is ready to assist.
          </p>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="container" style={{ marginTop: '80px', position: 'relative', zIndex: 5 }}>

        {/* Grid: left column (consultation info) + right column (form) */}
        <div className="contact-dual-grid" style={{ marginBottom: '40px' }}>

          {/* Left: Expert Consultation */}
          <div className="d-flex flex-column gap-4">
            <div className="bg-dark rounded-32 p-5 text-white h-100" style={{ padding: '60px 40px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                  <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', background: 'rgba(99, 91, 255, 0.2)' }}>
                    <Shield size={32} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-1" style={{ fontSize: '28px', color: 'white' }}>Expert Consultation</h3>
                    <p className="mb-0 opacity-70">Design your perfect hive</p>
                  </div>
                </div>

                <p className="lead opacity-70 mb-5" style={{ fontSize: '18px' }}>
                  Consult with our elite security engineers to get a tailored blueprint for your residential or commercial property.
                </p>

                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '40px', display: 'grid', gap: '20px' }}>
                  <li className="d-flex align-items-center gap-3">
                    <CheckCircle size={20} className="text-primary" />
                    <span style={{ fontSize: '16px' }}>Free Site Survey within 24 Hours</span>
                  </li>
                  <li className="d-flex align-items-center gap-3">
                    <CheckCircle size={20} className="text-primary" />
                    <span style={{ fontSize: '16px' }}>Professional Installation Experts</span>
                  </li>
                  <li className="d-flex align-items-center gap-3">
                    <CheckCircle size={20} className="text-primary" />
                    <span style={{ fontSize: '16px' }}>Technical Support</span>
                  </li>
                </ul>
              </div>

              {/* Decorative */}
              <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99, 91, 255, 0.1) 0%, transparent 70%)', filter: 'blur(50px)', zIndex: 1 }}></div>
              <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(0, 212, 255, 0.05) 0%, transparent 70%)', filter: 'blur(30px)', zIndex: 1 }}></div>
            </div>
          </div>

          {/* Right: Progressive Form */}
          <div className="bg-white rounded-32 shadow-lg p-5" style={{ padding: '60px', transition: 'all 0.4s ease' }}>

            {submitted ? (
              <SuccessScreen name={formData.fullName} onReset={handleReset} />
            ) : (
              <>
                <div className="mb-5">
                  <p className="text-muted">
                    {formStep === 1
                      ? 'Provide your basic contact method to get started.'
                      : 'Tell us a bit more so we can provide a tailored security blueprint.'}
                  </p>
                </div>

                {/* ── STEP 1 ── */}
                {formStep === 1 ? (
                  <form onSubmit={handleInitialSubmit} noValidate>
                    {submitError && <ErrorBanner message={submitError} />}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                      {/* Full Name */}
                      <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                          Full Name<span className="req">*</span>
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Your Full Name"
                          style={{ width: '100%', padding: '16px', borderRadius: '12px', border: fieldBorder('fullName', errors, touched), background: '#f8fafc', outline: 'none', transition: 'border 0.2s' }}
                        />
                        <FieldMsg name="fullName" errors={errors} touched={touched} />
                      </div>

                      {/* Email / Phone */}
                      <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                          Email Address or Phone Number<span className="req">*</span>
                        </label>
                        <input
                          type="text"
                          name="initialContact"
                          value={formData.initialContact}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Email or phone number"
                          style={{ width: '100%', padding: '16px', borderRadius: '12px', border: fieldBorder('initialContact', errors, touched), background: '#f8fafc', outline: 'none', transition: 'border 0.2s' }}
                        />
                        <FieldMsg name="initialContact" errors={errors} touched={touched} />
                      </div>
                    </div>

                    {/* Services checkboxes */}
                    <div className="form-group" style={{ marginBottom: '32px' }}>
                      <label style={{ display: 'block', marginBottom: '14px', fontWeight: '600', fontSize: '14px' }}>
                        Services Required<span className="req">*</span>{' '}
                        <span style={{ fontWeight: '400', color: '#94a3b8', fontSize: '12px' }}>(Select all that apply)</span>
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                        {['CCTV Systems', 'Alarm Systems', 'Other'].map((service) => (
                          <div
                            key={service}
                            onClick={() => handleCheckboxChange(service)}
                            style={{
                              padding: '14px',
                              borderRadius: '12px',
                              border: `2px solid ${formData.inquiryType.includes(service) ? 'var(--primary)' : (touched.inquiryType && errors.inquiryType ? '#ef4444' : '#f1f5f9')}`,
                              background: formData.inquiryType.includes(service) ? 'rgba(99, 91, 255, 0.05)' : '#f8fafc',
                              cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '10px',
                              transition: 'all 0.2s ease', userSelect: 'none'
                            }}
                          >
                            <div style={{
                              width: '18px', height: '18px', borderRadius: '4px',
                              border: `2px solid ${formData.inquiryType.includes(service) ? '#635bff' : '#cbd5e1'}`,
                              background: formData.inquiryType.includes(service) ? '#635bff' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.2s ease'
                            }}>
                              {formData.inquiryType.includes(service) && <CheckCircle size={12} color="white" />}
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: formData.inquiryType.includes(service) ? '#635bff' : '#475569' }}>
                              {service}
                            </span>
                          </div>
                        ))}
                      </div>
                      {touched.inquiryType && errors.inquiryType && (
                        <span style={{ display: 'block', fontSize: '12px', marginTop: '6px', color: '#ef4444', fontWeight: '600' }}>
                          ✗ {errors.inquiryType}
                        </span>
                      )}
                    </div>

                    {/* Custom service field */}
                    {formData.inquiryType.includes('Other') && (
                      <div className="form-group animate-slide-down" style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                          Please Specify Service<span className="req">*</span>
                        </label>
                        <input
                          type="text"
                          name="customInquiry"
                          value={formData.customInquiry}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Specify your security requirement..."
                          style={{ width: '100%', padding: '18px', borderRadius: '12px', border: fieldBorder('customInquiry', errors, touched), background: '#f8fafc', fontSize: '16px', outline: 'none' }}
                        />
                        <FieldMsg name="customInquiry" errors={errors} touched={touched} />
                      </div>
                    )}

                    <button
                      disabled={submitting}
                      className="btn-primary w-100"
                      style={{ padding: '20px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '16px', opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
                    >
                      {submitting ? 'Saving...' : 'Continue'} {!submitting && <ArrowRight size={18} />}
                    </button>
                  </form>
                ) : (
                  /* ── STEP 2 ── */
                  <form onSubmit={handleFinalSubmit} noValidate className="animate-fade-in">
                    {submitError && <ErrorBanner message={submitError} />}

                    {/* Company Name (optional) */}
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                        Company Name <span className="opacity-50" style={{ fontWeight: '400' }}>(Optional)</span>
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder=""
                        style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1.5px solid #eef2f6', background: '#f8fafc' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                      {/* Alternative contact */}
                      <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                          {isEmailInitial ? 'Phone Number' : 'Email Address'}<span className="req">*</span>
                        </label>
                        {isEmailInitial ? (
                          <PhoneInput
                            name="alternativeContact"
                            value={formData.alternativeContact}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder=""
                            required={true}
                            size="lg"
                          />
                        ) : (
                          <input
                            type="email"
                            name="alternativeContact"
                            value={typeof formData.alternativeContact === 'object' ? '' : (formData.alternativeContact || '')}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder=""
                            style={{ width: '100%', padding: '15px', borderRadius: '12px', border: fieldBorder('alternativeContact', errors, touched), background: '#f8fafc', outline: 'none' }}
                          />
                        )}
                        <FieldMsg name="alternativeContact" errors={errors} touched={touched} />
                      </div>

                      {/* Location */}
                      <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                          Project Location / Address<span className="req">*</span>
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder=""
                          style={{ width: '100%', padding: '15px', borderRadius: '12px', border: fieldBorder('location', errors, touched), background: '#f8fafc', outline: 'none' }}
                        />
                        <FieldMsg name="location" errors={errors} touched={touched} />
                      </div>
                    </div>

                    {/* Budget */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                      <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                          Estimated Budget<span className="req">*</span>
                        </label>
                        <select
                          name="budget"
                          value={formData.budget}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          style={{ width: '100%', padding: '15px', borderRadius: '12px', border: fieldBorder('budget', errors, touched), background: '#f8fafc', outline: 'none' }}
                        >
                          <option value="">Select Budget Range</option>
                          <option value="Under 50,000 ETB">Under 50,000 ETB</option>
                          <option value="50,001 - 100,000 ETB">50,001 - 100,000 ETB</option>
                          <option value="50,000 - 150,000 ETB">100,001 - 250,000 ETB</option>
                          <option value="250,001 - 450,000 ETB">250,001 - 450,000 ETB</option>
                          <option value="450,001 - 700,000 ETB">450,001 - 700,000 ETB</option>
                          <option value="700,001 - 1,000,000 ETB">700,001 - 1,000,000 ETB</option>
                          <option value="1,000,001 - 2,000,000 ETB">1,000,001 - 2,000,000 ETB</option>
                          <option value="Above 2,000,000 ETB">Above 2,000,000 ETB</option>
                          <option value="Not yet">Not yet</option>
                        </select>
                        <FieldMsg name="budget" errors={errors} touched={touched} />
                      </div>
                    </div>

                    {/* CCTV specifics */}
                    {formData.inquiryType.includes('CCTV Systems') && (
                      <div className="animate-slide-down" style={{ background: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #eef2f6', marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: '#0a2540', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Shield size={18} className="text-primary" /> CCTV Specific Details
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
                          <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px' }}>Number of required Cameras</label>
                            <input
                              type="number"
                              name="numCameras"
                              value={formData.numCameras}
                              onChange={handleChange}
                              placeholder="e.g. 4"
                              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #eef2f6', background: 'white' }}
                            />
                          </div>
                          <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px' }}>Estimate timeframe to complete the project?</label>
                            <select
                              name="timeframe"
                              value={formData.timeframe}
                              onChange={handleChange}
                              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #eef2f6', background: 'white' }}
                            >
                              <option value="">Select duration</option>
                              <option value="Urgent">Urgent</option>
                              <option value="Based on your schedule">Based on your schedule</option>
                              <option value="With in a week">With in a week</option>
                              <option value="With in a month">With in a month</option>

                            </select>
                          </div>


                          <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px' }}>Is there previously installed system?</label>
                            <select
                              name="previousinstalled"
                              value={formData.previousinstalled}
                              onChange={handleChange}
                              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #eef2f6', background: 'white' }}
                            >
                              <option value="">Select</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>

                            </select>
                          </div>
                        </div>
                        <div className="form-group" style={{ marginTop: '20px' }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px' }}>Other Requirements</label>
                          <input
                            type="text"
                            name="cctvOther"
                            value={formData.cctvOther}
                            onChange={handleChange}
                            placeholder=""
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #eef2f6', background: 'white' }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Alarm specifics */}
                    {formData.inquiryType.includes('Alarm Systems') && (
                      <div className="animate-slide-down" style={{ background: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #eef2f6', marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: '#0a2540', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Bell size={18} className="text-primary" /> Alarm System Specifications
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
                          <div className="form-group" style={{ marginBottom: '0' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px' }}>Property Type</label>
                            <select
                              name="alarmPropertyType"
                              value={formData.alarmPropertyType}
                              onChange={handleChange}
                              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #eef2f6', background: 'white' }}
                            >
                              <option value="">Select type</option>
                              <option value="Residential">Residential</option>
                              <option value="Commercial">Commercial</option>
                              <option value="Industrial">Industrial</option>
                            </select>
                          </div>
                          <div className="form-group" style={{ marginBottom: '0' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px' }}>Number of required Sensors</label>
                            <input
                              type="number"
                              name="numSensors"
                              value={formData.numSensors}
                              onChange={handleChange}
                              placeholder="e.g. 6"
                              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #eef2f6', background: 'white' }}
                            />
                          </div>
                        </div>
                        <div className="form-group" style={{ marginTop: '20px' }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px' }}>Preferred System Type</label>
                          <select
                            name="alarmSystemType"
                            value={formData.alarmSystemType}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #eef2f6', background: 'white' }}
                          >
                            <option value="">Select preference</option>
                            <option value="Wireless (Ajax)">Wireless (Ajax)</option>
                            <option value="GSM Burglar Alarm">GSM Burglar Alarm</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Message */}
                    <div className="form-group" style={{ marginBottom: '32px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                        Detail Your Requirements<span className="req">*</span>
                      </label>
                      <textarea
                        rows="4"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Tell us about the scope of your security project..."
                        style={{ width: '100%', padding: '15px', borderRadius: '12px', border: fieldBorder('message', errors, touched), background: '#f8fafc', outline: 'none', resize: 'vertical' }}
                      />
                      <FieldMsg name="message" errors={errors} touched={touched} />
                    </div>

                    {/* Buttons */}
                    <div className="d-flex gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setFormStep(1)}
                        className="btn-secondary"
                        style={{ background: '#f1f5f9', color: '#0a2540', padding: '16px 24px', borderRadius: '12px', flex: '1' }}
                      >
                        Back
                      </button>
                      <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {(autoSaving || autoSaved) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: autoSaving ? '#94a3b8' : '#22c55e', fontWeight: '600', transition: 'all 0.3s ease' }}>
                            <span>{autoSaving ? '⏳ Saving...' : '✓ Progress saved automatically'}</span>
                          </div>
                        )}
                        <button
                          disabled={submitting}
                          className="btn-primary"
                          style={{ padding: '18px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', minWidth: '200px', opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
                        >
                          {submitting ? 'Finalizing...' : 'Finalize Request'} {!submitting && <Send size={18} />}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>

        {/* Contact Info Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div className="bg-white rounded-24 shadow-sm p-4 border text-center">
            <div className="faq-icon-small mb-3 mx-auto" style={{ width: '50px', height: '50px' }}>
              <Phone size={30} className="text-primary" />
            </div>
            <h5 className="font-weight-bold mb-2">Call Us</h5>
            <p className="mb-1 font-weight-bold" style={{ color: '#0a2540' }}>+251 923 55 55 54</p>
          </div>
          <div className="bg-white rounded-24 shadow-sm p-4 border text-center">
            <div className="faq-icon-small mb-3 mx-auto" style={{ width: '50px', height: '50px' }}>
              <Mail size={30} className="text-primary" />
            </div>
            <h5 className="font-weight-bold mb-2">Email Us</h5>
            <p className="mb-1 font-weight-bold" style={{ color: '#0a2540' }}>info@safehive.com</p>
            <p className="text-muted mb-0" style={{ fontSize: '13px' }}>Online support</p>
          </div>
          <div className="bg-white rounded-24 shadow-sm p-4 border text-center">
            <div className="faq-icon-small mb-3 mx-auto" style={{ width: '50px', height: '50px' }}>
              <MapPin size={30} className="text-primary" />
            </div>
            <h5 className="font-weight-bold mb-2">Visit Us</h5>
            <p className="mb-1 font-weight-bold" style={{ color: '#0a2540' }}>22 Mazoriya MAF Building</p>
            <p className="text-muted mb-0" style={{ fontSize: '13px' }}>Ethiopia</p>
          </div>
          <div className="bg-white rounded-24 shadow-sm p-4 border text-center">
            <div className="faq-icon-small mb-3 mx-auto" style={{ width: '50px', height: '50px' }}>
              <Clock size={30} className="text-primary" />
            </div>
            <h5 className="font-weight-bold mb-2">Business Hours</h5>
            <p className="mb-1 font-weight-bold" style={{ color: '#0a2540' }}>Mon - Fri: 7:00 AM - 4:00 PM</p>
            <p className="text-muted mb-0" style={{ fontSize: '13px' }}>Saturday and Sunday: Closed</p>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="container mt-5" style={{ marginBottom: '60px' }}>
        <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
          <div style={{ background: 'linear-gradient(135deg, #0a2540, #1a3a5a)', padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MapPin size={28} color="#635bff" />
              <span style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>
                Megenagna 22 MAF Building, Addis Ababa, Ethiopia
              </span>
            </div>
            <a
              href="https://maps.google.com/?q=Megenagna,Addis+Ababa,Ethiopia"
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: 'rgba(99,91,255,0.2)', border: '1px solid rgba(99,91,255,0.4)', color: '#a5a1ff', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              Open in Google Maps ↗
            </a>
          </div>
          <iframe
            title="SafeHive Location"
            src="https://www.google.com/maps/place/Hexagon+Computer+Systems/@9.0171303,38.7907261,532m/data=!3m1!1e3!4m14!1m7!3m6!1s0x164b9b9f24f13f99:0xcbdcf9523ac82bd4!2sHexagon+Computer+Systems!8m2!3d9.0148912!4d38.7878398!16s%2Fg%2F11h75wgxbh!3m5!1s0x164b85d80cabe897:0x3579e089b0c95ef!8m2!3d9.0164128!4d38.7913093!16s%2Fg%2F11l38nvtmw?entry=ttu&g_ep=EgoyMDI2MDYxNi4wIKXMDSoASAFQAw%3D%3D"
            width="100%"
            height="420"
            style={{ border: 0, display: 'block' }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
