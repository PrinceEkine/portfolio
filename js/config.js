// The chatbot and contact form call Netlify Functions for anything that
// needs a secret API key (Qwen, Resend). Those functions only exist on the
// Netlify deployment, so when this site is served from somewhere that can't
// run them (e.g. GitHub Pages), point requests at the Netlify site instead.
const NETLIFY_SITE_URL = "https://princedagogoekine.netlify.app";

const API_BASE_URL = window.location.hostname.endsWith("netlify.app")
    ? ""
    : NETLIFY_SITE_URL;
