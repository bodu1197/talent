require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('seller_profiles 뷰에 위치 필드 추가 마이그레이션 시작...\n');

  // First, check if columns already exist
  const { data: testData, error: testError } = await supabase
    .from('seller_profiles')
    .select('id, location_latitude')
    .limit(1);

  if (!testError) {
    console.log('✅ seller_profiles 뷰에 이미 location_latitude 필드가 있습니다.');
    console.log('테스트 데이터:', testData);
    return;
  }

  console.log('❌ 현재 seller_profiles 뷰에 위치 필드가 없습니다.');
  console.log('에러:', testError.message);
  console.log('\n📝 Supabase Dashboard에서 다음 SQL을 실행해주세요:\n');

  const sql = `
-- ============================================
-- Add location fields to seller_profiles VIEW
-- ============================================
CREATE OR REPLACE VIEW public.seller_profiles
WITH (security_invoker=true) AS
SELECT
  s.id,
  s.user_id,
  s.business_name,
  s.business_number,
  s.business_registration_file,
  s.bank_name,
  s.account_number,
  s.account_holder,
  s.is_verified,
  s.verification_status,
  s.verified_at,
  s.rejection_reason,
  s.total_sales,
  s.total_revenue,
  s.service_count,
  s.rating,
  s.review_count,
  s.last_sale_at,
  s.is_active,
  s.created_at,
  s.updated_at,
  p.name as display_name,
  p.profile_image,
  p.bio,
  s.phone,
  s.show_phone,
  s.kakao_id,
  s.kakao_openchat,
  s.whatsapp,
  s.website,
  s.preferred_contact,
  s.certificates,
  s.experience,
  s.is_business,
  s.status,
  s.real_name,
  s.contact_hours,
  s.tax_invoice_available,
  s.verified,
  s.verified_name,
  s.verified_phone,
  -- NEW: Location fields
  s.location_latitude,
  s.location_longitude,
  s.location_region,
  s.location_address
FROM public.sellers s
LEFT JOIN public.profiles p ON s.user_id = p.user_id;

-- Grant permissions
GRANT SELECT ON public.seller_profiles TO authenticated, anon;
`;

  console.log(sql);
  console.log('\n===========================================');
  console.log('위 SQL을 Supabase Dashboard > SQL Editor에서 실행하세요:');
  console.log('https://supabase.com/dashboard/project/[PROJECT_ID]/sql');
  console.log('===========================================\n');
}

main().catch(console.error);
