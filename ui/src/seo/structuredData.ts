import { absoluteUrl, getSiteOrigin } from './siteUrl';
import type { UseCaseDefinition } from './useCases';

export interface FaqSchemaItem {
  question: string;
  answer: string;
}

export function webApplicationLd(description: string): Record<string, unknown> {
  const origin = getSiteOrigin();
  return {
    '@type': 'WebApplication',
    name: 'Generative Grammar Engine',
    url: origin,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    description,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    browserRequirements: 'Requires JavaScript.',
  };
}

export function websiteLd(siteName: string, description: string): Record<string, unknown> {
  const origin = getSiteOrigin();
  return {
    '@type': 'WebSite',
    name: siteName,
    url: origin,
    description,
    publisher: {
      '@type': 'Organization',
      name: 'TinyGods.Dev',
      url: 'https://tinygods.dev',
    },
  };
}

export function faqPageLd(items: FaqSchemaItem[]): Record<string, unknown> {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbLd(entries: { name: string; path: string }[]): Record<string, unknown> {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: entries.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      item: absoluteUrl(entry.path),
    })),
  };
}

/** JSON-LD @graph for marketing `/`. */
export function landingPageGraph(description: string, faq: FaqSchemaItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [webApplicationLd(description), websiteLd('Generative Grammar Engine', description), faqPageLd(faq)],
  };
}

/** Tool routes: WebApplication + breadcrumbs (Home → current). */
export function toolRouteGraph(description: string, breadcrumbName: string, pathname: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      webApplicationLd(description),
      breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: breadcrumbName, path: pathname },
      ]),
    ],
  };
}

export function breadcrumbLabelForUseCase(uc: UseCaseDefinition): string {
  return uc.pageTitle.split(' —')[0].trim();
}

export function breadcrumbLabelForEditor(): string {
  return 'Grammar editor';
}
