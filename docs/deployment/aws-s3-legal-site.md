# AWS S3 Legal Site

## Goal

Host the public trust center, privacy policy, and permissions explanation from `apps/legal-site` as a static S3 website at the lowest cost.

## Bucket setup

1. Create one S3 bucket for the public site.
2. Disable block-public-access only for the website bucket if you are using public bucket hosting.
3. Enable static website hosting.
4. Set index document to `index.html`.
5. Upload the files from `apps/legal-site`.

## URLs

Use the direct object URLs for Chrome Web Store fields:

- `https://www.careeros.ai/privacy.html`
- `https://www.careeros.ai/permissions.html`

## Recommended improvement

If you later want cleaner URLs and better TLS/custom-domain behavior, place CloudFront in front of the bucket. For the initial low-cost launch, S3 static hosting is enough.
