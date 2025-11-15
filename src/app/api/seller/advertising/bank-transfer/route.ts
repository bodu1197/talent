import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/singleton'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const serviceId = formData.get('serviceId') as string
    const packageType = formData.get('packageType') as string
    const depositorName = formData.get('depositorName') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const businessRegistrationNumber = formData.get('businessRegistrationNumber') as string
    const taxInvoiceRequested = formData.get('taxInvoiceRequested') === 'true'
    const depositBank = formData.get('depositBank') as string
    const depositDate = formData.get('depositDate') as string
    const depositTime = formData.get('depositTime') as string
    const amount = parseInt(formData.get('amount') as string)
    const receiptFile = formData.get('receipt') as File | null

    // Validate required fields
    if (!serviceId || !packageType || !depositorName || !phone || !email || !depositBank || !depositDate || !depositTime || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Use Service Role Client for database operations
    const serviceSupabase = createServiceRoleClient()

    // Get seller ID
    const { data: seller } = await serviceSupabase
      .from('sellers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      )
    }

    // Upload receipt image if provided
    let receiptImageUrl: string | null = null
    if (receiptFile) {
      const fileExt = receiptFile.name.split('.').pop()
      const fileName = `${seller.id}_${Date.now()}.${fileExt}`
      const filePath = `advertising-receipts/${fileName}`

      const { data: _uploadData, error: uploadError } = await serviceSupabase
        .storage
        .from('public-files')
        .upload(filePath, receiptFile)

      if (uploadError) {
        console.error('Failed to upload receipt:', uploadError)
      } else {
        const { data: { publicUrl } } = serviceSupabase
          .storage
          .from('public-files')
          .getPublicUrl(filePath)
        receiptImageUrl = publicUrl
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
      .single()

    if (subscriptionError) {
      console.error('Failed to create subscription:', subscriptionError)
      return NextResponse.json(
        { error: 'Failed to create subscription' },
        { status: 500 }
      )
    }

    // Store extra data in admin_memo as JSON
    const adminMemoData = {
      phone,
      email,
      businessRegistrationNumber,
      taxInvoiceRequested,
      packageType
    }

    // Create payment record
    const { error: paymentError } = await serviceSupabase
      .from('advertising_payments')
      .insert({
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
        admin_memo: JSON.stringify(adminMemoData)
      })

    if (paymentError) {
      console.error('Failed to create payment:', paymentError)
      // Rollback subscription
      await serviceSupabase
        .from('advertising_subscriptions')
        .delete()
        .eq('id', subscription.id)

      return NextResponse.json(
        { error: 'Failed to create payment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id
    })

  } catch (error) {
    console.error('Bank transfer submission error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
