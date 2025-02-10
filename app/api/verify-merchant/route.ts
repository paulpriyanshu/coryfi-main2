import { NextResponse } from 'next/server';
import db  from '@/db'; // Your Prisma instance

// Server action to verify if the user is a merchant
export const verifyMerchant = async (userId: number) => {
    try {
        const isMerchant = await db.merchant.findFirst({
            where: { userId },
        });

        return !!isMerchant; // Return true if merchant exists, else false
    } catch (error) {
        console.error('Error verifying merchant:', error);
        throw new Error('Unable to verify merchant');
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId || isNaN(Number(userId))) {
        return NextResponse.json({ error: 'User ID is required and must be a number' }, { status: 400 });
    }

    try {
        const isMerchant = await verifyMerchant(Number(userId));

        return NextResponse.json({ isMerchant });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to verify merchant' }, { status: 500 });
    }
}