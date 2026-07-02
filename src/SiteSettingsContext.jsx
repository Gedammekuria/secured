import React, { createContext, useContext, useState, useEffect } from 'react';

const SiteSettingsContext = createContext();

export const useSiteSettings = () => {
  return useContext(SiteSettingsContext);
};

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    phone: '+251 923 55 55 54',
    company_email: 'info@safehive.com',
    location: '22 Mazoriya MAF Building',
    facebook_url: '',
    instagram_url: '',
    tiktok_url: '',
    linkedin_url: '',
    youtube_url: '',
    stat_installations: '100+',
    stat_years_experience: '17+',
    stat_client_retention: '99%'
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Error fetching site settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings) => {
    const token = localStorage.getItem('safehive_admin_token');
    if (!token) {
      throw new Error('Not logged in as admin');
    }

    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newSettings)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update settings');
    }

    setSettings(data.settings);
    return data.settings;
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings, updateSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};
