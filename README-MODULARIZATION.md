# Synagogue deployment files

## Files

- `index.html` contains the shared application UI and business logic.
- `app-init.js` initializes Firebase from the settings loaded by `app-config.js`.
- `app-config.js` contains the settings for one synagogue deployment.

## Create another synagogue instance

1. Copy all three files into the new GitHub Pages repository.
2. Edit only the new repository's `app-config.js` first.
3. Set `siteId` to a unique value, for example `betkneset-002`.
4. Replace the `firebase` object with the web-app configuration from the second synagogue's Firebase project.
5. Set `functions.region` to the region where that project's Cloud Functions are deployed.
6. Set `googleDrive.clientId` to the OAuth client ID authorized for that deployment. It may be shared if the Google OAuth configuration intentionally serves both sites.
7. Set `siteName` as a fallback title, and update `phoneAuth.countryCallingCode` / `nationalPrefix` if the site serves another country.
8. Keep the `firestore.collections` names and callable function names aligned with the deployed Cloud Functions and database schema. Change them only when the backend schema/function names were changed too.
9. Deploy the three files together. Do not deploy `index.html` without its matching `app-config.js` and `app-init.js`.

## Browser storage isolation

All application `localStorage` keys and the Google Drive session token in `sessionStorage` are prefixed with `siteId`. Thus `betkneset-001_dark_mode` and `betkneset-002_dark_mode` are independent, even in the same browser profile.

Changing `siteId` after deployment creates a new local-storage namespace. The old unprefixed browser preferences are not automatically imported.

## SMS authentication

The current application uses Firebase Phone Authentication (`signInWithPhoneNumber` and `RecaptchaVerifier`). There is no separate SMS vendor API key or provider URL in this HTML file. The phone calling code is configurable here, while enabling Phone Authentication, authorized domains, quotas, and billing are managed in the Firebase Console for each project.

## Security note

Firebase web API keys and Google OAuth client IDs are public client identifiers. Do not place service-account private keys, OAuth client secrets, or Google Drive refresh tokens in `app-config.js`; those belong on the server in Firebase Functions / Secret Manager.

## Validation performed

- JavaScript syntax checked for `app-config.js` and `app-init.js`.
- Extracted inline application JavaScript from `index.html` and checked its syntax.
- Checked that all browser storage read/write/delete operations use the site-specific key helper.
