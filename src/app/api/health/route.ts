import { NextResponse } from 'next/server';

export async function GET() {
  let azureStorageStatus: 'healthy' | 'unhealthy' = 'healthy';
  let errorMessage;

  try {
    

    const storageUrl = process.env.AZURE_STORAGE_URL || 'https://proposalcpqstb.blob.core.windows.net/propostas/';

    const response = await fetch(storageUrl);

    if (!response.ok) {
      // Even if not ok, the service is up. A 403 is fine for a health check.
      // We just need to know we can reach it.
    }

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
