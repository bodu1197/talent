const https = require('https');

const PROJECT_ID = 'abroivxthindezdtdzmj';
const TOKEN = 'sbp_753b67c2411cad6320ef44d6626ac13ee2ba6296';

const approveFunctionSql = `
CREATE OR REPLACE FUNCTION public.approve_service_revision(revision_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_revision RECORD;
BEGIN
  SELECT * INTO v_revision
  FROM public.service_revisions
  WHERE id = revision_id_param;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Revision not found';
  END IF;

  UPDATE public.services
  SET
    title = v_revision.title,
    description = v_revision.description,
    thumbnail_url = v_revision.thumbnail_url,
    price = v_revision.price,
    delivery_days = COALESCE(v_revision.delivery_days, 7),
    revision_count = COALESCE(v_revision.revision_count, 0),
    location_address = COALESCE(v_revision.location_address, location_address),
    location_latitude = COALESCE(v_revision.location_latitude, location_latitude),
    location_longitude = COALESCE(v_revision.location_longitude, location_longitude),
    location_region = COALESCE(v_revision.location_region, location_region),
    delivery_method = COALESCE(v_revision.delivery_method, delivery_method),
    updated_at = now()
  WHERE id = v_revision.service_id;

  DELETE FROM public.service_categories
  WHERE service_id = v_revision.service_id;

  INSERT INTO public.service_categories (service_id, category_id, is_primary)
  SELECT DISTINCT
    v_revision.service_id,
    category_id,
    true
  FROM public.service_revision_categories
  WHERE revision_id = revision_id_param
  ON CONFLICT (service_id, category_id)
  DO UPDATE SET is_primary = EXCLUDED.is_primary;

  UPDATE public.service_revisions
  SET
    status = 'approved',
    reviewed_at = now(),
    reviewed_by = auth.uid()
  WHERE id = revision_id_param;
END;
$function$`;

function executeQuery(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });

    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1/projects/${PROJECT_ID}/database/query`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('Applying approve_service_revision function update...');

  try {
    await executeQuery(approveFunctionSql);
    console.log('✅ approve_service_revision 함수 업데이트 완료!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
