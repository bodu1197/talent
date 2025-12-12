#!/bin/bash

# Update Vercel environment variables with correct API keys

ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicm9pdnh0aGluZGV6ZHRkem1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1Mzg5MjcsImV4cCI6MjA4MTExNDkyN30.gn5LpB2VFeE778IT-nIZlOUk7XHjR0pYHstDSVukgcY"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicm9pdnh0aGluZGV6ZHRkem1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTUzODkyNywiZXhwIjoyMDgxMTE0OTI3fQ.6dk7o_z9Bp5MoG06obd4dk6fl_nRFiTJjLysfd-7Xo8"

echo "🔄 Updating Vercel environment variables..."
echo ""

# Update ANON KEY
echo "Updating NEXT_PUBLIC_SUPABASE_ANON_KEY..."
vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production --yes
echo "$ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY preview --yes
echo "$ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview

vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY development --yes
echo "$ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development

echo ""

# Update SERVICE ROLE KEY
echo "Updating SUPABASE_SERVICE_ROLE_KEY..."
vercel env rm SUPABASE_SERVICE_ROLE_KEY production --yes
echo "$SERVICE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production

vercel env rm SUPABASE_SERVICE_ROLE_KEY preview --yes
echo "$SERVICE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY preview

vercel env rm SUPABASE_SERVICE_ROLE_KEY development --yes
echo "$SERVICE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY development

echo ""
echo "✅ Vercel environment variables updated!"
echo ""
echo "🚀 Deploying to production..."
vercel --prod
