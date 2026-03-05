# GCS key: single line for .env

In `.env`, `GCS_SERVICE_ACCOUNT_KEY` must be **one line**. Multi-line values are truncated at the first newline.

**Option 1 — Single line in .env**

Paste the key as one continuous line (no line breaks). Example format:

```
GCS_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...",...}
```

**Option 2 — Use a key file (recommended)**

1. Save your service account JSON to a file, e.g. `gcs-key.json` in the project root.
2. Add `gcs-key.json` to `.gitignore`.
3. In `.env` set:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./gcs-key.json
   ```
4. Remove or comment out `GCS_SERVICE_ACCOUNT_KEY` so the app uses the file path instead.

The code in `src/lib/gcs.ts` supports both `GCS_SERVICE_ACCOUNT_KEY` (single-line JSON) and `GOOGLE_APPLICATION_CREDENTIALS` (path to key file).
