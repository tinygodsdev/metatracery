import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { absoluteUrl, getSiteOrigin } from './siteUrl';
import { getUseCaseByPath } from './useCases';

const HOME_TITLE = 'Generative Grammar Engine — names, prompts, SVG & markdown';
const HOME_DESCRIPTION =
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

/**
 * Updates document title and social/meta tags for the current route (client-side SPA).
 */
export function SeoHead() {
  const { pathname } = useLocation();

  useEffect(() => {
    const useCase = getUseCaseByPath(pathname);
    const title = useCase?.pageTitle ?? HOME_TITLE;
    const description = useCase?.metaDescription ?? HOME_DESCRIPTION;
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
  }, [pathname]);

  return null;
}
