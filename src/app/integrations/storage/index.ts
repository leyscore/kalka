export { S3_STORAGE_PROVIDER, storageProviderRegistry } from './providers'
export { defineStorageProvider, StorageProviderRegistry } from './registry'
export { createS3StorageAdapter } from './s3/adapter'
export type { S3StorageAdapter } from './s3/adapter'
export type { S3CompatibleConfig, S3ConnectionResult } from './s3/types'
export type {
  StorageAdapter,
  StorageAdapterContext,
  StorageConnectionResult,
  StorageCredentialField,
  StorageDocument,
  StorageDocumentMetadata,
  StorageFieldID,
  StoragePreferenceField,
  StorageProviderID,
  StorageProviderRegistration,
  StorageProviderRuntime,
  StorageTransferProgress,
  StorageUsage
} from './types'
