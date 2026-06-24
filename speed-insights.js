/**
 * Vercel Speed Insights Integration
 * This script injects the Vercel Speed Insights tracker into the page.
 */
import { injectSpeedInsights } from 'https://cdn.jsdelivr.net/npm/@vercel/speed-insights@2.0.0/dist/index.mjs';

// Inject Speed Insights when the page loads
injectSpeedInsights();
