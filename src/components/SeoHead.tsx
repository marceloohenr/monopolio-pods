import * as React from "react";
import { useLocation } from "react-router-dom";
import {
  buildTitle,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_LOCALE,
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_TWITTER_HANDLE,
  toAbsoluteUrl,
} from "@/lib/site-config";

type SchemaInput = Record<string, unknown> | Array<Record<string, unknown>>;

interface SeoHeadProps {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article" | "product";
  keywords?: string[];
  noindex?: boolean;
  schema?: SchemaInput;
}

const DEFAULT_ROBOTS = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

function ensureMeta(attribute: "name" | "property", key: string) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  return element;
}

function ensureLink(rel: string) {
  let element = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }

  return element;
}

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  ensureMeta(attribute, key).setAttribute("content", content);
}

function normalizeSchema(schema?: SchemaInput) {
  if (!schema) return [];
  return Array.isArray(schema) ? schema : [schema];
}

export function SeoHead({
  title,
  description = SITE_DESCRIPTION,
  path,
  image = SITE_OG_IMAGE,
  type = "website",
  keywords = [],
  noindex = false,
  schema,
}: SeoHeadProps) {
  const location = useLocation();
  const resolvedPath = path || `${location.pathname}${location.search}`;

  React.useEffect(() => {
    const pageTitle = buildTitle(title);
    const canonicalUrl = toAbsoluteUrl(resolvedPath);
    const imageUrl = toAbsoluteUrl(image);
    const robots = noindex ? "noindex, nofollow" : DEFAULT_ROBOTS;
    const mergedKeywords = [...new Set([...SITE_KEYWORDS, ...keywords])].join(", ");

    document.title = pageTitle;

    upsertMeta("name", "description", description);
    upsertMeta("name", "keywords", mergedKeywords);
    upsertMeta("name", "author", SITE_NAME);
    upsertMeta("name", "robots", robots);
    upsertMeta("name", "googlebot", robots);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", pageTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", imageUrl);
    upsertMeta("name", "twitter:site", SITE_TWITTER_HANDLE);

    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:title", pageTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("property", "og:image", imageUrl);
    upsertMeta("property", "og:locale", SITE_LOCALE);
    upsertMeta("property", "og:site_name", SITE_NAME);

    ensureLink("canonical").setAttribute("href", canonicalUrl);
    ensureLink("alternate").setAttribute("href", canonicalUrl);
    ensureLink("alternate").setAttribute("hreflang", "pt-BR");

    document.head.querySelectorAll('script[data-seo-schema="true"]').forEach((node) => node.remove());

    normalizeSchema(schema).forEach((entry, index) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.seoSchema = "true";
      script.dataset.schemaIndex = String(index);
      script.textContent = JSON.stringify(entry);
      document.head.appendChild(script);
    });
  }, [description, image, keywords, noindex, path, resolvedPath, schema, title, type]);

  return null;
}
