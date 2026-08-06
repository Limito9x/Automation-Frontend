import axios from "axios";
import { requestUpload, confirmUpload } from "@/gen/endpoints/assets/assets";

/**
 * Calculates the SHA-256 hash of a File or Blob as a hex string.
 */
export async function calculateFileHash(file: File | Blob): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

/**
 * Orchestrates the full presigned URL upload flow for a single file.
 * Returns the confirmed AssetId on success.
 */
export async function uploadAssetFlow(file: File): Promise<string> {
  // 1. Calculate file hash
  const hashSha256 = await calculateFileHash(file);

  // 2. Extract extension without dot (e.g., "png")
  const fileNameParts = file.name.split(".");
  const extension = fileNameParts.length > 1 ? fileNameParts.pop()! : "";

  if (!extension) {
    throw new Error("File must have an extension");
  }

  // 3. Request upload
  const requestPayload = {
    items: [
      {
        hashSha256,
        extension: `.${extension.toLowerCase()}`,
        sizeBytes: file.size,
        contentType: file.type,
      },
    ],
  };

  const uploadRequests = await requestUpload(requestPayload);
  if (!uploadRequests || uploadRequests.length === 0) {
    throw new Error("Failed to get upload request details from server");
  }

  const { assetId, isAlreadyExists, presignedUrl } = uploadRequests[0];

  // 4. Upload file if it doesn't already exist
  if (!isAlreadyExists && presignedUrl) {
    await axios.put(presignedUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
    });
  }

  // 5. Confirm upload
  await confirmUpload({ assetIds: [assetId] });

  return assetId;
}
