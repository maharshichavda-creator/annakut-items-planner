import { Capacitor } from '@capacitor/core';

// Base URL for the Spring Boot backend. During `ng serve` this points at the
// local API; once deployed (e.g. on Render), the same build automatically
// targets the deployed backend based on the page's hostname.
function resolveApiBaseUrl(): string {
  // The Capacitor Android app is served from https://localhost, so it must be detected explicitly.
  if (Capacitor.isNativePlatform() || (typeof window !== 'undefined' && window.location.hostname !== 'localhost')) {
    return 'https://annakut-items-planner-backend.onrender.com/api';
  }
  return 'http://localhost:8080/api';
}

export const API_BASE_URL = resolveApiBaseUrl();
