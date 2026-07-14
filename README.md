# Prince Dagogo Ekine — Portfolio

Static portfolio site with a Qwen Plus-powered AI chatbot and a Resend-powered
contact form, both served via Netlify Functions.

## Stack

- Static HTML/CSS/JS (no build step for the frontend)
- Netlify Functions (Node, `netlify/functions/`) for anything that needs a
  secret API key
- [Qwen Plus](https://www.alibabacloud.com/help/en/model-studio/) (DashScope
  OpenAI-compatible API) for the chatbot
- [Resend](https://resend.com) for transactional email (contact form + chatbot
  lead notifications)

## Local development

```bash
npm install -g netlify-cli   # if you don't have it
npm install
netlify dev
```

`netlify dev` serves the static site and runs the functions locally at
`/.netlify/functions/*`, reading env vars from a local `.env` file (see
below) or `netlify env:*` if the site is linked to Netlify.

## Environment variables

Set these in **Netlify → Site configuration → Environment variables** (or in
a local `.env` file, which is gitignored, for `netlify dev`):

| Variable            | Required | Description                                                                                     |
|---------------------|----------|---------------------------------------------------------------------------------------------------|
| `QWEN_API_KEY`      | Yes      | Your DashScope (Qwen) API key, used by `netlify/functions/chat.js`.                              |
| `QWEN_BASE_URL`     | No       | Defaults to `https://dashscope-intl.aliyuncs.com/compatible-mode/v1`. Use the mainland China endpoint (`https://dashscope.aliyuncs.com/compatible-mode/v1`) if your key is a mainland account. |
| `QWEN_MODEL`        | No       | Defaults to `qwen-plus`.                                                                          |
| `RESEND_API_KEY`    | Yes      | Your Resend API key, used by `netlify/functions/contact.js` and lead notifications in `chat.js`. |
| `RESEND_FROM_EMAIL` | No       | Verified sender, e.g. `Portfolio <hello@yourdomain.com>`. Defaults to Resend's shared test sender (`onboarding@resend.dev`), which works for testing but you should verify your own domain in Resend for production. |
| `CONTACT_EMAIL`     | No       | Where contact-form submissions and chatbot leads are sent. Defaults to `princedagogoekine@gmail.com`. |

None of these keys are ever exposed to the browser — they're only read inside
the Netlify Functions, which run server-side.

## Deploying

1. Push this repo to GitHub (already done) and connect it in Netlify as a new
   site ("Import an existing project").
2. Build settings are already defined in `netlify.toml` (publish dir `.`,
   functions dir `netlify/functions`).
3. Add the environment variables above in the Netlify dashboard.
4. Deploy. The chatbot widget and contact form will start working once
   `QWEN_API_KEY` and `RESEND_API_KEY` are set.

### Keeping GitHub Pages live too

GitHub Pages can still serve the static site — it just can't run the
functions (no way to store secrets there). `js/config.js` handles this: it
points chatbot/contact-form requests at your Netlify site whenever the page
isn't already being served from `*.netlify.app` (the Netlify functions send
permissive CORS headers, so cross-origin calls from GitHub Pages work fine).

To enable it:

1. Deploy to Netlify as above and note your site's URL (Site configuration →
   Domain management), e.g. `https://princeekine-portfolio.netlify.app`.
2. Edit `js/config.js` and replace `NETLIFY_SITE_URL` with that URL, then
   commit and push.
3. In the GitHub repo, go to **Settings → Pages** and set Source to "Deploy
   from a branch", branch `main`, folder `/ (root)`. GitHub Pages will then
   serve the site at `https://princeekine.github.io/portfolio/`, with the
   chatbot and contact form calling out to Netlify in the background.

## Features

- **AI chatbot** (bottom-right widget): answers visitor questions about
  Prince's skills, experience, and projects using a portfolio-specific system
  prompt, backed by Qwen Plus. If a visitor shares an email in the chat, an
  automatic lead notification is emailed via Resend.
- **Contact form**: submissions are sent server-side via Resend instead of
  the client-side EmailJS widget that was previously used.
