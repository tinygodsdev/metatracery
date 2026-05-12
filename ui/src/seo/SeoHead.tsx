import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FAQ_ITEMS } from '../components/landing/LandingFAQ';
import { absoluteUrl, getSiteOrigin } from './siteUrl';
import { LANDING_META_DESCRIPTION, LANDING_PAGE_TITLE } from './homeLandingMeta';
import {
  EDITOR_META_DESCRIPTION,
  EDITOR_PAGE_TITLE,
  FLEXIBLE_EDITOR_PATH,
  PRIVACY_META_DESCRIPTION,
  PRIVACY_PAGE_TITLE,
  PRIVACY_PATH,
  getUseCaseByPath,
} from './useCases';
import {
  breadcrumbLabelForEditor,
  breadcrumbLabelForUseCase,
  landingPageGraph,
  toolRouteGraph,
} from './structuredData';

const FALLBACK_SITE_TITLE = 'Generative Grammar Engine — names, prompts, SVG & markdown';
const FALLBACK_SITE_DESCRIPTION =
  'Browser-based generative grammar engine: random names, writing prompts, sentences, place names, NPC sheets, and SVG patterns from your own rules.';

/** Prefer /og.png; fallback to large PWA icon until a dedicated 1200×630 asset exists. */
function ogImageUrl(): string {
  const origin = getSiteOrigin();
  return `${origin}/og.png`;
}

function setMetaProperty(name: string, content: string) {
  let el = document.querySelector(`meta[property="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setMetaName(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLinkCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

const JSON_LD_SCRIPT_ID = 'app-jsonld';

function setJsonLd(payload: Record<string, unknown> | null) {
  const existing = document.getElementById(JSON_LD_SCRIPT_ID);
  if (!payload) {
    existing?.remove();
    return;
  }
  let el = existing as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = JSON_LD_SCRIPT_ID;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(payload);
}

/**
 * Updates document title and social/meta tags for the current route (client-side SPA).
 */
export function SeoHead() {
  const { pathname } = useLocation();

  useEffect(() => {
    const useCase = getUseCaseByPath(pathname);

    const title =
      pathname === '/'
        ? LANDING_PAGE_TITLE
        : pathname === FLEXIBLE_EDITOR_PATH
          ? EDITOR_PAGE_TITLE
          : pathname === PRIVACY_PATH
            ? PRIVACY_PAGE_TITLE
            : (useCase?.pageTitle ?? FALLBACK_SITE_TITLE);
    const description =
      pathname === '/'
        ? LANDING_META_DESCRIPTION
        : pathname === FLEXIBLE_EDITOR_PATH
          ? EDITOR_META_DESCRIPTION
          : pathname === PRIVACY_PATH
            ? PRIVACY_META_DESCRIPTION
            : (useCase?.metaDescription ?? FALLBACK_SITE_DESCRIPTION);
    const url = absoluteUrl(pathname === '/' ? '/' : pathname);

    document.title = title;
    setMetaName('description', description);
    setMetaProperty('og:title', title);
    setMetaProperty('og:description', description);
    setMetaProperty('og:url', url);
    setMetaProperty('og:type', 'website');
    setMetaProperty('og:locale', 'en_US');
    setMetaProperty('og:image', ogImageUrl());
    setMetaName('twitter:card', 'summary_large_image');
    setMetaName('twitter:title', title);
    setMetaName('twitter:description', description);
    setMetaName('twitter:image', ogImageUrl());
    setLinkCanonical(url);

    if (pathname === '/') {
      setJsonLd(landingPageGraph(LANDING_META_DESCRIPTION, FAQ_ITEMS));
    } else if (pathname === FLEXIBLE_EDITOR_PATH) {
      setJsonLd(
        toolRouteGraph(EDITOR_META_DESCRIPTION, breadcrumbLabelForEditor(), FLEXIBLE_EDITOR_PATH),
      );
    } else if (useCase) {
      setJsonLd(
        toolRouteGraph(useCase.metaDescription, breadcrumbLabelForUseCase(useCase), useCase.path),
      );
    } else {
      setJsonLd(null);
    }
  }, [pathname]);

  return null;
}
