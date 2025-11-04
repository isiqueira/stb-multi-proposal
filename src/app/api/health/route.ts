import { NextResponse } from 'next/server';
import { BlobServiceClient } from '@azure/storage-blob';

export async function GET() {
  let azureStorageStatus: 'healthy' | 'unhealthy' = 'healthy';
  let errorMessage;

  try {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error('Azure Storage connection string is not configured.');
    }
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    await blobServiceClient.getProperties();
  } catch (error: any) {
    azureStorageStatus = 'unhealthy';
    errorMessage = error.message;
  }

  if (azureStorageStatus === 'unhealthy') {
    return NextResponse.json(
      {
        status: 'error',
        azure_storage: azureStorageStatus,
        error: errorMessage,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    status: 'ok',
    azure_storage: azureStorageStatus,
  });
}
