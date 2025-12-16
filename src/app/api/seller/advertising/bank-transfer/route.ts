import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/singleton';
import { logger } from '@/lib/logger';
import { requireLogin } from '@/lib/api/auth';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireLogin();
    if (!authResult.success) return authResult.error;

    const { supabase, user } = authResult;
    if (!supabase || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const serviceId = formData.get('serviceId') as string;
    const packageType = formData.get('packageType') as string;
    const depositorName = formData.get('depositorName') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const businessRegistrationNumber = formData.get('businessRegistrationNumber') as string;
    const taxInvoiceRequested = formData.get('taxInvoiceRequested') === 'true';
    const depositBank = formData.get('depositBank') as string;
    const depositDate = formData.get('depositDate') as string;
    const depositTime = formData.get('depositTime') as string;
    const amount = Number.parseInt(formData.get('amount') as string);
    const receiptFile = formData.get('receipt') as File | null;

    // Validate required fields
    if (
      !serviceId ||
      !packageType ||
      !depositorName ||
      !phone ||
      !email ||
      !depositBank ||
      !depositDate ||
      !depositTime ||
      !amount
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use Service Role Client for database operations
    const serviceSupabase = createServiceRoleClient();

    // Get seller ID
    const { data: seller } = await serviceSupabase
      .from('sellers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    // Upload receipt image if provided
    let receiptImageUrl: string | null = null;
    if (receiptFile) {
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${seller.id}_${Date.now()}.${fileExt}`;
      const filePath = `advertising-receipts/${fileName}`;

      const { error: uploadError } = await serviceSupabase.storage
        .from('public-files')
        .upload(filePath, receiptFile);

      if (uploadError) {
        logger.error('Failed to upload receipt:', uploadError);
      } else {
        const {
          data: { publicUrl },
        } = serviceSupabase.storage.from('public-files').getPublicUrl(filePath);
        receiptImageUrl = publicUrl;
      }
    }

    // Create advertising subscription
    const { data: subscription, error: subscriptionError } = await serviceSupabase
      .from('advertising_subscriptions')
      .insert({
        seller_id: seller.id,
        service_id: serviceId,
        monthly_price: amount,
        status: 'pending_payment',
        payment_method: 'bank_transfer',
        bank_transfer_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      })
      .select()
      .single();

    if (subscriptionError) {
      logger.error('Failed to create subscription:', subscriptionError);
      return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
    }

    // Store extra data in admin_memo as JSON
    const adminMemoData = {
      phone,
      email,
      businessRegistrationNumber,
      taxInvoiceRequested,
      packageType,
    };

    // Create payment record
    const { error: paymentError } = await serviceSupabase.from('advertising_payments').insert({
      subscription_id: subscription.id,
      seller_id: seller.id,
      amount: amount,
      payment_method: 'bank_transfer',
      status: 'pending',
      depositor_name: depositorName,
      bank_name: depositBank,
      deposit_date: depositDate,
      deposit_time: depositTime,
      receipt_image: receiptImageUrl,
      admin_memo: JSON.stringify(adminMemoData),
    });

    if (paymentError) {
      logger.error('Failed to create payment:', paymentError);
      // Rollback subscription
      await serviceSupabase.from('advertising_subscriptions').delete().eq('id', subscription.id);

      return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    logger.error('Bank transfer submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
