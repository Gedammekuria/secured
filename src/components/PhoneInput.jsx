import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const COUNTRIES = [
  { iso: 'et', code: '+251', name: 'Ethiopia', length: 9, contactPattern: /^[79]\d{0,8}$/ },
  { iso: 'us', code: '+1',   name: 'USA', length: 10, contactPattern: /^\d{0,10}$/ },
  { iso: 'gb', code: '+44',  name: 'UK', length: 10, contactPattern: /^\d{0,10}$/ },
  { iso: 'ae', code: '+971', name: 'UAE', length: 9, contactPattern: /^\d{0,9}$/ },
  { iso: 'sa', code: '+966', name: 'Saudi Arabia', length: 9, contactPattern: /^\d{0,9}$/ },
  { iso: 'ke', code: '+254', name: 'Kenya', length: 9, contactPattern: /^\d{0,9}$/ },
  { iso: 'ng', code: '+234', name: 'Nigeria', length: 10, contactPattern: /^\d{0,10}$/ },
  { iso: 'za', code: '+27',  name: 'South Africa', length: 9, contactPattern: /^\d{0,9}$/ },
  { iso: 'in', code: '+91',  name: 'India', length: 10, contactPattern: /^\d{0,10}$/ },
  { iso: 'de', code: '+49',  name: 'Germany', length: 11, contactPattern: /^\d{0,11}$/ },
  { iso: 'fr', code: '+33',  name: 'France', length: 9, contactPattern: /^\d{0,9}$/ },
  { iso: 'cn', code: '+86',  name: 'China', length: 11, contactPattern: /^\d{0,11}$/ },
  { iso: 'ru', code: '+7',   name: 'Russia', length: 10, contactPattern: /^\d{0,10}$/ },
  { iso: 'ca', code: '+1',   name: 'Canada', length: 10, contactPattern: /^\d{0,10}$/ },
  { iso: 'eg', code: '+20',  name: 'Egypt', length: 10, contactPattern: /^\d{0,10}$/ },
  { iso: 'sd', code: '+249', name: 'Sudan', length: 9, contactPattern: /^\d{0,9}$/ },
  { iso: 'tr', code: '+90',  name: 'Turkey', length: 10, contactPattern: /^\d{0,10}$/ },
  { iso: 'it', code: '+39',  name: 'Italy', length: 10, contactPattern: /^\d{0,10}$/ },
];

const PhoneInput = ({ name, value, onChange, placeholder = 'Your Phone Number', required = false, size = 'md' }) => {
  const [selected, setSelected] = useState(COUNTRIES[0]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 260 });
  const btnRef = useRef(null);
  const searchRef = useRef(null);

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.code.includes(search)
  );

  const getFlagUrl = (iso) => `https://flagcdn.com/w40/${iso.toLowerCase()}.png`;

  // Calculate fixed position from button's bounding rect so it escapes overflow:hidden
  const openDropdown = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 6,
        left: rect.left,
        width: Math.max(240, rect.width + 80),
      });
    }
    setOpen(true);
    setSearch('');
    setTimeout(() => searchRef.current?.focus(), 50);
  };

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      const portal = document.getElementById('phone-dropdown-portal');
      const wrapper = btnRef.current?.closest('.phone-input-wrapper');
      if (
        (wrapper && wrapper.contains(e.target)) ||
        (portal && portal.contains(e.target))
      ) return;
      setOpen(false);
      setSearch('');
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSelect = (country) => {
    setSelected(country);
    setOpen(false);
    setSearch('');
  };

  const handleInputChange = (e) => {
    const rawVal = e.target.value;
    const digitsOnly = rawVal.replace(/\D/g, ''); // Only allow numbers
    
    // If input is empty, allow it
    if (digitsOnly === '') {
      onChange({ target: { name, value: '' } });
      return;
    }

    // Check if it matches the country's pattern (starts with right digits, length check, etc)
    if (selected.contactPattern.test(digitsOnly)) {
      onChange({ target: { name, value: digitsOnly } });
    }
  };

  const inputPad  = size === 'lg' ? '18px 16px' : '14px 16px';
  const codePad   = size === 'lg' ? '0 18px'    : '0 12px';

  return (
    <>
      {/* Input row */}
      <div className="phone-input-wrapper" style={{ position: 'relative' }}>
        <button
          ref={btnRef}
          type="button"
          onClick={() => open ? setOpen(false) : openDropdown()}
          aria-label="Select country code"
          aria-expanded={open}
          style={{
            padding: codePad,
            border: 'none',
            background: '#f1f5f9',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            flexShrink: 0,
            height: 'auto',
            minHeight: '100%',
            borderRight: '1.5px solid #eef2f6',
            transition: 'background 0.2s ease',
            minWidth: size === 'lg' ? '110px' : '95px',
            margin: 0
          }}
        >
          <div style={{ width: '22px', height: '14px', borderRadius: '2px', overflow: 'hidden', display: 'flex', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', flexShrink: 0 }}>
            <img src={getFlagUrl(selected.iso)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#0a2540', display: 'flex', alignItems: 'center', lineHeight: 'normal' }}>{selected.code}</span>
          <ChevronDown
            size={14}
            style={{
              color: '#94a3b8',
              transition: 'transform 0.2s ease',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              flexShrink: 0,
              marginLeft: '-2px'
            }}
          />
        </button>

        <input
          type="tel"
          name={name}
          value={typeof value === 'object' ? '' : (value || '')}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          style={{ padding: inputPad }}
        />
      </div>

      {/* Fixed-position dropdown — escapes any overflow:hidden ancestor */}
      {open && (
        <div
          id="phone-dropdown-portal"
          style={{
            position: 'fixed',
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: `${dropdownPos.width}px`,
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
            border: '1px solid #eef2f6',
            zIndex: 99999,
            overflow: 'hidden',
          }}
        >
          {/* Search box */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search country..."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #eef2f6',
                background: '#f8fafc',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Country list */}
          <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                No results
              </div>
            ) : filtered.map((country, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(country)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 16px',
                  background: selected.name === country.name ? 'rgba(99, 91, 255, 0.07)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '14px',
                  color: '#0a2540',
                  boxSizing: 'border-box',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = selected.name === country.name
                    ? 'rgba(99, 91, 255, 0.07)'
                    : 'transparent';
                }}
              >
                <div style={{ width: '22px', height: '15px', borderRadius: '2px', overflow: 'hidden', display: 'flex', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                  <img src={getFlagUrl(country.iso)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <span style={{ flex: 1, display: 'flex', alignItems: 'center', fontWeight: '500' }}>{country.name}</span>
                <span style={{ fontWeight: 700, color: '#635bff', fontSize: '13px', display: 'flex', alignItems: 'center' }}>{country.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default PhoneInput;
