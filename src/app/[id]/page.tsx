import QuoteApp from '@/components/quote-app';
import { currentUser } from '@/data/user';
import AppHeader from '@/components/app-header';
import AppFooter from '@/components/app-footer';
import type { Quotation, User } from '@/types';
import logger from '@/lib/logger';

async function getProposalData(id: string): Promise<{quotations: Quotation[], user: User} | null> {
    const AZURE_STORAGE_URL = process.env.AZURE_STORAGE_URL || 'https://proposalcpqstb.blob.core.windows.net/propostas/';
    const url = `${AZURE_STORAGE_URL}multi-quote/proposals/${id}.json`;
    logger.info(`[ProposalPage] Fetching proposal data for ID: ${id} from ${url}`);

    try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) {
            logger.warn({ status: res.status, statusText: res.statusText }, 'Failed to fetch proposal data from URL.');
            return null;
        }

        const data = await res.json();
        
        if (!Array.isArray(data) || data.length === 0) {
            logger.warn(`[ProposalPage] Proposal data is not a valid array or is empty for ID: ${id}`);
            return null;
        }
        
        const seller = data[0]?.seller;
        const user: User = seller ? {
            name: seller.name || currentUser.name,
            email: seller.email || currentUser.email,
            avatarUrl: seller.photo || currentUser.avatarUrl,
            avatarFallback: seller.name ? seller.name.substring(0,2) : currentUser.avatarFallback,
            phone: seller.phone || currentUser.phone,
        } : currentUser;
        
        logger.info(`[ProposalPage] Proposal data fetched successfully for ID: ${id}`);
        return { quotations: data, user };

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while fetching data.';
        logger.error({ err, id }, `[ProposalPage] Error fetching or processing proposal data: ${errorMessage}`);
        return null;
    } 
}


export default async function Home({ params }: { params: { id: string } }) {
    const proposalData = await getProposalData(params?.id);

    if (!proposalData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-2xl font-bold">Proposal not found</h1>
                <p className="text-muted-foreground">Could not retrieve the proposal details for ID: {params?.id}.</p>
            </div>
        );
    }

    const { quotations, user } = proposalData;

    return (
        <div className="flex flex-col min-h-screen">
            <AppHeader user={user} />
            <main className="flex-grow">
                <QuoteApp initialQuotations={quotations} user={user} />
            </main>
            <AppFooter />
        </div>
    );
}
