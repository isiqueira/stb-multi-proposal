import QuoteDetailPage from '@/components/quote-detail-page';
import { currentUser } from '@/data/user';
import QuoteDetailFooter from '@/components/quote-detail-footer';
import QuoteDetailHeader from '@/components/quote-detail-header';
import type { Quotation } from '@/types';
import logger from '@/lib/logger';

async function getQuoteData(id: string): Promise<Quotation | null> {
  const AZURE_STORAGE_URL = process.env.AZURE_STORAGE_URL || 'https://proposalcpqstb.blob.core.windows.net/propostas/';

  const url = `${AZURE_STORAGE_URL}multi-quote/quotes/${id}.json`;
  logger.info(`[QuotePage] Fetching quote data for ID: ${id} from ${url}`);

  try {
      const res = await fetch(url, { cache: 'no-store' });

      if (res.ok) {
        const data = await res.json();
        logger.info(`[QuotePage] Quote data fetched successfully for ID: ${id}`)
        return data as Quotation;
      }
      return null;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while fetching data.';
    logger.error({ err, id }, `[QuotePage] Error fetching or processing quotation data: ${errorMessage}`);
    return null;
  } 
}

export default async function QuotePage({ params }: { params: { id: string } }) {
  logger.info(`[QuotePage] Rendering quote page for ID: ${params.id}`);
  const quoteData = await getQuoteData(params.id);
  const user = currentUser;

  if (!quoteData) {
    logger.warn(`[Page] Quote not found. This should not happen with the current mock setup.`);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">Quote not found</h1>
        <p className="text-muted-foreground">Could not retrieve the quote details for ID: {params.id}.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      {quoteData.companyInfo && <QuoteDetailHeader companyInfo={quoteData.companyInfo} />}
      <main className="flex-grow">
        <QuoteDetailPage quote={quoteData} user={user} />
      </main>
      {quoteData.seller && <QuoteDetailFooter seller={quoteData.seller} />}
    </div>
  );
}
