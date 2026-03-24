import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

let cachedSettings = null;
let listeners = [];

export function useSiteSettings() {
  const [settings, setSettings] = useState(cachedSettings);
  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    listeners.push(setSettings);
    if (!cachedSettings) {
      base44.entities.SiteSettings.list().then((list) => {
        const s = list[0] || {};
        cachedSettings = s;
        listeners.forEach(fn => fn(s));
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
    return () => {
      listeners = listeners.filter(fn => fn !== setSettings);
    };
  }, []);

  return { settings: settings || {}, loading };
}

export function invalidateSettings() {
  cachedSettings = null;
}