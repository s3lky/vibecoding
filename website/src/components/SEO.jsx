import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://serenia.io';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

const defaults = {
  title: 'SerenIA — Automatización con n8n, IA y Calidad de Datos | ETL/ELT',
  description: 'Servicios profesionales de automatización con n8n e IA: calidad de datos, pipelines ETL/ELT, curado y observabilidad. En producción desde la primera semana.',
  image: DEFAULT_IMAGE,
  type: 'website',
};

export default function SEO({ title, description, path = '', image, type, noindex = false }) {
  const seo = {
    title: title ? `${title} | SerenIA` : defaults.title,
    description: description || defaults.description,
    image: image || defaults.image,
    url: `${SITE_URL}${path}`,
    type: type || defaults.type,
  };

  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={seo.url} />

      {/* Open Graph */}
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:type" content={seo.type} />

      {/* Twitter */}
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
    </Helmet>
  );
}
