import { Storage } from "@google-cloud/storage";

const BUCKET_NAME = process.env.GCS_BUCKET_NAME ?? "pocker-studio";

let storage: Storage | null = null;

function getStorage(): Storage {
  if (storage) return storage;

  const credentialsRaw = process.env.GCS_SERVICE_ACCOUNT_KEY;
  const credentialsBase64 = process.env.GCS_SERVICE_ACCOUNT_KEY_BASE64;
  const keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  // Prefer Base64 (avoids .env escaping issues) or raw JSON
  const rawJson =
    credentialsBase64 != null
      ? Buffer.from(credentialsBase64, "base64").toString("utf8")
      : credentialsRaw;

  if (rawJson) {
    let credentials: object;
    try {
      credentials = JSON.parse(rawJson);
    } catch {
      // .env often truncates at the first newline; try compacting whitespace
      const compact = rawJson.replace(/\s+/g, " ").trim();
      try {
        credentials = JSON.parse(compact);
      } catch {
        throw new Error(
          "GCS credentials invalid. Use GCS_SERVICE_ACCOUNT_KEY_BASE64 (base64 of JSON) or GCS_SERVICE_ACCOUNT_KEY (full JSON on one line), or GOOGLE_APPLICATION_CREDENTIALS (path to key file)."
        );
      }
    }
    storage = new Storage({ credentials });
  } else if (keyFilePath) {
    storage = new Storage({ keyFilename: keyFilePath });
  } else {
    storage = new Storage();
  }

  return storage;
}

export function getBucket() {
  return getStorage().bucket(BUCKET_NAME);
}

export function getPublicUrl(gcsPath: string) {
  return `https://storage.googleapis.com/${BUCKET_NAME}/${gcsPath}`;
}

export async function uploadFile(
  buffer: Buffer,
  gcsPath: string,
  contentType: string
): Promise<{ url: string; gcsPath: string }> {
  try {
    const bucket = getBucket();
    const file = bucket.file(gcsPath);

    await file.save(buffer, {
      contentType,
      resumable: false,
      metadata: { cacheControl: "public, max-age=31536000" },
    });

    try {
      await file.makePublic();
    } catch {
      // Ignore if bucket uses "Uniform bucket-level access" — then make the bucket public in GCP Console (Bucket → Permissions → Add principal "allUsers", role "Storage Object Viewer")
    }

    return { url: getPublicUrl(gcsPath), gcsPath };
  } catch (e) {
    const err = e as Error & { code?: number };
    if (err.message?.includes("credentials") || err.code === 401) {
      throw new Error(
        "GCS credentials missing or invalid. Set GCS_SERVICE_ACCOUNT_KEY (full JSON key) or GOOGLE_APPLICATION_CREDENTIALS (path to key file)."
      );
    }
    if (err.code === 404 || err.message?.includes("No such bucket")) {
      throw new Error(
        `GCS bucket "${BUCKET_NAME}" not found. Create it in Google Cloud Console or set GCS_BUCKET_NAME.`
      );
    }
    if (err.code === 403) {
      throw new Error(
        "GCS permission denied. Ensure the service account has Storage Object Creator (or Owner) on the bucket."
      );
    }
    throw e;
  }
}

export async function deleteFile(gcsPath: string): Promise<void> {
  const bucket = getBucket();
  const file = bucket.file(gcsPath);
  await file.delete({ ignoreNotFound: true });
}

export async function listFiles(
  prefix?: string
): Promise<{ name: string; url: string }[]> {
  const bucket = getBucket();
  const [files] = await bucket.getFiles({ prefix });

  return files.map((file) => ({
    name: file.name,
    url: getPublicUrl(file.name),
  }));
}
