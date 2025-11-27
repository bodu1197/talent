'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

interface TaxInvoiceDetail {
  id: string;
  invoice_number: string;
  issue_date: string;
  status: string;

  // 공급자
  supplier_business_number: string;
  supplier_company_name: string;
  supplier_ceo_name: string;
  supplier_address: string;

  // 공급받는자
  buyer_business_number: string;
  buyer_company_name: string;
  buyer_ceo_name: string;
  buyer_address: string;
  buyer_email: string | null;

  // 금액
  supply_amount: number;
  tax_amount: number;
  total_amount: number;

  // 품목
  item_name: string;
  item_quantity: number;
  item_unit_price: number;

  remarks: string | null;
  created_at: string;
}

// Helper: Handle print
function handlePrint() {
  globalThis.print();
}

export default function TaxInvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<TaxInvoiceDetail | null>(null);

  useEffect(() => {
    loadInvoiceDetail();
  }, [invoiceId]);

  async function loadInvoiceDetail() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('tax_invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (error) {
        logger.error('세금계산서 로딩 실패:', error);
        toast.error('세금계산서를 불러올 수 없습니다');
        router.push('/admin/tax-invoices');
        return;
      }

      setInvoice(data);
    } catch (error) {
      logger.error('세금계산서 로딩 중 오류:', error);
      toast.error('세금계산서를 불러올 수 없습니다');
      router.push('/admin/tax-invoices');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">세금계산서를 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 액션 버튼 (인쇄 시 숨김) */}
      <div className="flex justify-between items-center print:hidden">
        <button
          onClick={() => router.push('/admin/tax-invoices')}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          목록으로
        </button>
        <button
          onClick={handlePrint}
          className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          인쇄하기
        </button>
      </div>

      {/* 세금계산서 */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-300 p-8 print:shadow-none print:border-black">
        {/* 제목 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-2">세 금 계 산 서</h1>
          <p className="text-sm text-gray-600">(공급받는자 보관용)</p>
        </div>

        {/* 계산서 번호 및 발행일 */}
        <div className="mb-6 flex justify-between text-sm">
          <div>
            <span className="font-medium">승인번호:</span> {invoice.invoice_number}
          </div>
          <div>
            <span className="font-medium">작성일자:</span>{' '}
            {new Date(invoice.issue_date).toLocaleDateString('ko-KR')}
          </div>
        </div>

        {/* 공급자/공급받는자 정보 */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* 공급자 (좌측) */}
          <div className="border-2 border-gray-300 p-4">
            <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-300">공급자</h3>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <span className="font-medium text-gray-600">사업자번호</span>
                <span className="col-span-2">{invoice.supplier_business_number}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-medium text-gray-600">상호</span>
                <span className="col-span-2 font-semibold">{invoice.supplier_company_name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-medium text-gray-600">대표자</span>
                <span className="col-span-2">{invoice.supplier_ceo_name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-medium text-gray-600">주소</span>
                <span className="col-span-2">{invoice.supplier_address}</span>
              </div>
            </div>
          </div>

          {/* 공급받는자 (우측) */}
          <div className="border-2 border-gray-300 p-4">
            <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-300">공급받는자</h3>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <span className="font-medium text-gray-600">사업자번호</span>
                <span className="col-span-2">{invoice.buyer_business_number}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-medium text-gray-600">상호</span>
                <span className="col-span-2 font-semibold">{invoice.buyer_company_name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-medium text-gray-600">대표자</span>
                <span className="col-span-2">{invoice.buyer_ceo_name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-medium text-gray-600">주소</span>
                <span className="col-span-2">{invoice.buyer_address}</span>
              </div>
              {invoice.buyer_email && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-medium text-gray-600">이메일</span>
                  <span className="col-span-2">{invoice.buyer_email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 품목 테이블 */}
        <div className="mb-8">
          <table className="w-full border-2 border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-sm font-medium">품목</th>
                <th className="border border-gray-300 px-4 py-2 text-sm font-medium">규격</th>
                <th className="border border-gray-300 px-4 py-2 text-sm font-medium">수량</th>
                <th className="border border-gray-300 px-4 py-2 text-sm font-medium">단가</th>
                <th className="border border-gray-300 px-4 py-2 text-sm font-medium">공급가액</th>
                <th className="border border-gray-300 px-4 py-2 text-sm font-medium">세액</th>
                <th className="border border-gray-300 px-4 py-2 text-sm font-medium">비고</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-3 text-sm">{invoice.item_name}</td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-center">-</td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-center">
                  {invoice.item_quantity}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-right">
                  {invoice.item_unit_price.toLocaleString()}원
                </td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-right font-medium">
                  {invoice.supply_amount.toLocaleString()}원
                </td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-right font-medium">
                  {invoice.tax_amount.toLocaleString()}원
                </td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-center">
                  {invoice.remarks || '-'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 합계 금액 */}
        <div className="border-2 border-gray-300 p-6 mb-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-600 mb-2">공급가액</div>
              <div className="text-2xl font-semibold text-gray-900">
                {invoice.supply_amount.toLocaleString()}원
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-2">세액 (10%)</div>
              <div className="text-2xl font-semibold text-gray-900">
                {invoice.tax_amount.toLocaleString()}원
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-sm text-gray-600 mb-2">합계금액</div>
              <div className="text-3xl font-semibold text-brand-primary">
                {invoice.total_amount.toLocaleString()}원
              </div>
            </div>
          </div>
        </div>

        {/* 하단 안내문 */}
        <div className="text-xs text-gray-500 text-center space-y-1 border-t pt-4">
          <p>이 세금계산서는 부가가치세법 제32조 및 제54조에 의거 발급되었습니다.</p>
          <p>본 세금계산서는 전자세금계산서 시스템을 통해 발행되었습니다.</p>
        </div>

        {/* 관리 정보 (인쇄 시 숨김) */}
        <div className="mt-8 pt-6 border-t border-gray-200 print:hidden">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">계산서 ID:</span> {invoice.id}
            </div>
            <div>
              <span className="font-medium">발행일시:</span>{' '}
              {new Date(invoice.created_at).toLocaleString('ko-KR')}
            </div>
            <div>
              <span className="font-medium">상태:</span>{' '}
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                {invoice.status === 'issued' ? '발행완료' : invoice.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
