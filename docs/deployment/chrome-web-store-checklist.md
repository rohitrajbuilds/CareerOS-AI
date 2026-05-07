# Chrome Web Store Checklist

## Pre-submit

- Verify the extension is Manifest V3 only.
- Confirm all requested permissions are necessary and reflected in the product behavior.
- Confirm the privacy policy URL is public, accurate, and up to date.
- Complete the Chrome Web Store privacy disclosure fields and permission justifications.
- Ensure screenshots, descriptions, and promotional text match the implemented feature set.
- Test install, update, and uninstall flows on a fresh Chrome profile.
- Pack the production build and inspect the final permission warnings.
- Validate no development hosts remain in the production package.

## Listing assets

- Store icon
- At least one screenshot
- Short description
- Detailed description
- Support email
- Privacy policy URL

## Release checks

- Run CI green on `main`
- Build `apps/extension/dist`
- Zip the package
- Smoke test against Workday, LinkedIn, Greenhouse, and Lever
- Confirm backend production health before submitting
