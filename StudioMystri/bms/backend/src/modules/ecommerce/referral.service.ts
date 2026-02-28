import { PrismaClient, PaymentStatus, OrderStatus } from '@prisma/client';
import crypto from 'crypto';
import { sendReferralReward } from '../../utils/email.service';

const prisma = new PrismaClient();

// ─── Generate unique referral code for a user ────────────
export async function generateReferralCode(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    // Generate a unique code based on user name + random
    const base = user.name.replace(/\s+/g, '').substring(0, 4).toUpperCase();
    const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const code = `SM-${base}-${suffix}`;

    return code;
}

// ─── Apply referral on order (called during checkout) ────
export async function applyReferral(referralCode: string, userId: string, orderId: string) {
    // Prevent self-referral
    const existingReferral = await prisma.referral.findFirst({
        where: { referralCode },
    });

    // Find the referrer by looking at who created this code
    const referrer = await prisma.user.findFirst({
        where: {
            referralsMade: {
                some: { referralCode },
            },
        },
    });

    if (!referrer) {
        throw new Error('Invalid referral code');
    }

    if (referrer.id === userId) {
        throw new Error('Cannot use your own referral code');
    }

    // Check if this user already used this referral code
    const alreadyUsed = await prisma.referral.findFirst({
        where: {
            referredUserId: userId,
            referralCode,
        },
    });

    if (alreadyUsed) {
        throw new Error('Referral code already used by this user');
    }

    // Create referral record (reward issued after payment)
    const referral = await prisma.referral.create({
        data: {
            referrerUserId: referrer.id,
            referredUserId: userId,
            referralCode,
            orderId,
            rewardIssued: false,
            rewardType: 'CASHBACK',
            rewardValue: 100, // Default: ₹100 cashback
        },
    });

    return referral;
}

// ─── Issue referral reward after confirmed payment ───────
export async function issueReferralReward(orderId: string) {
    const referrals = await prisma.referral.findMany({
        where: {
            orderId,
            rewardIssued: false,
        },
    });

    for (const referral of referrals) {
        // Verify order is paid and not cancelled
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order || order.paymentStatus !== PaymentStatus.PAID || order.orderStatus === OrderStatus.CANCELLED) {
            continue;
        }

        // Mark reward as issued
        await prisma.referral.update({
            where: { id: referral.id },
            data: { rewardIssued: true },
        });

        // Send reward email to referrer
        try {
            const referrer = await prisma.user.findUnique({ where: { id: referral.referrerUserId } });
            if (referrer) {
                await sendReferralReward(
                    referrer.email,
                    referrer.name,
                    referral.rewardType || 'CASHBACK',
                    referral.rewardValue || 0,
                    referrer.id
                );
            }
        } catch (err) {
            console.error('Failed to send referral reward email:', err);
        }
    }
}
