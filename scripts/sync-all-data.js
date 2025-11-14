require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function syncAllData() {
  console.log('\n=== 모든 결제-구독 데이터 자동 동기화 ===\n');

  try {
    // 1. 모든 결제 데이터 가져오기
    const { data: allPayments, error: paymentsError } = await supabase
      .from('advertising_payments')
      .select('id, subscription_id, status');

    if (paymentsError) throw paymentsError;

    console.log(`총 ${allPayments?.length || 0}건의 결제 발견`);

    if (!allPayments || allPayments.length === 0) {
      console.log('처리할 결제가 없습니다.');
      return;
    }

    const subscriptionIds = allPayments.map(p => p.subscription_id).filter(Boolean);

    if (subscriptionIds.length === 0) {
      console.log('subscription_id가 있는 결제가 없습니다.');
      return;
    }

    // 2. 모든 구독 데이터 가져오기
    const { data: allSubscriptions, error: subsError } = await supabase
      .from('advertising_subscriptions')
      .select('id, status')
      .in('id', subscriptionIds);

    if (subsError) throw subsError;

    // 3. 상태 매핑 및 업데이트할 구독 찾기
    const subsToUpdate = [];

    allPayments.forEach(payment => {
      const subscription = allSubscriptions?.find(s => s.id === payment.subscription_id);

      if (!subscription) return;

      let targetStatus = null;

      // 결제 상태에 따른 구독 상태 결정
      if (payment.status === 'completed' || payment.status === 'confirmed') {
        if (subscription.status !== 'active') {
          targetStatus = 'active';
        }
      } else if (payment.status === 'cancelled') {
        if (subscription.status !== 'cancelled') {
          targetStatus = 'cancelled';
        }
      } else if (payment.status === 'pending') {
        if (subscription.status !== 'pending_payment') {
          targetStatus = 'pending_payment';
        }
      }

      if (targetStatus) {
        subsToUpdate.push({
          id: subscription.id,
          currentStatus: subscription.status,
          targetStatus: targetStatus,
          paymentStatus: payment.status
        });
      }
    });

    console.log(`\n불일치 발견: ${subsToUpdate.length}건`);

    if (subsToUpdate.length === 0) {
      console.log('✓ 모든 데이터가 이미 동기화되어 있습니다!');
      return;
    }

    console.table(subsToUpdate);

    // 4. 배치 업데이트 (상태별로 그룹화)
    const activeIds = subsToUpdate.filter(s => s.targetStatus === 'active').map(s => s.id);
    const cancelledIds = subsToUpdate.filter(s => s.targetStatus === 'cancelled').map(s => s.id);
    const pendingIds = subsToUpdate.filter(s => s.targetStatus === 'pending_payment').map(s => s.id);

    let totalUpdated = 0;

    // active로 변경
    if (activeIds.length > 0) {
      const { data, error } = await supabase
        .from('advertising_subscriptions')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .in('id', activeIds);

      if (error) {
        console.error('active 업데이트 실패:', error);
      } else {
        totalUpdated += activeIds.length;
        console.log(`✓ ${activeIds.length}건을 active로 업데이트`);
      }
    }

    // cancelled로 변경
    if (cancelledIds.length > 0) {
      const { data, error } = await supabase
        .from('advertising_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .in('id', cancelledIds);

      if (error) {
        console.error('cancelled 업데이트 실패:', error);
      } else {
        totalUpdated += cancelledIds.length;
        console.log(`✓ ${cancelledIds.length}건을 cancelled로 업데이트`);
      }
    }

    // pending_payment로 변경
    if (pendingIds.length > 0) {
      const { data, error } = await supabase
        .from('advertising_subscriptions')
        .update({
          status: 'pending_payment',
          updated_at: new Date().toISOString()
        })
        .in('id', pendingIds);

      if (error) {
        console.error('pending_payment 업데이트 실패:', error);
      } else {
        totalUpdated += pendingIds.length;
        console.log(`✓ ${pendingIds.length}건을 pending_payment로 업데이트`);
      }
    }

    console.log(`\n=== 완료: 총 ${totalUpdated}건 동기화됨 ===\n`);

  } catch (error) {
    console.error('동기화 실패:', error);
  }
}

syncAllData();
