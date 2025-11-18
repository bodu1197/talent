"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { FaFileInvoice, FaCalendarCheck, FaWonSign } from "react-icons/fa";

interface TaxInvoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  status: string;
  buyer_company_name: string;
  buyer_business_number: string;
  supply_amount: number;
  tax_amount: number;
  total_amount: number;
  created_at: string;
}

export default function AdminTaxInvoicesPage() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<TaxInvoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [stats, setStats] = useState({
    totalCount: 0,
    thisMonthAmount: 0,
    totalSupplyAmount: 0,
  });

  useEffect(() => {
    loadInvoices();
    loadStats();
  }, []);

  async function loadInvoices() {
    try {
      const supabase = createClient();

      const query = supabase
        .from("tax_invoices")
        .select("*")
        .order("issue_date", { ascending: false })
        .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error("세금계산서 로딩 실패:", error);
        return;
      }

      setInvoices(data || []);
    } catch (error) {
      console.error("세금계산서 로딩 중 오류:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const supabase = createClient();

      // 전체 건수
      const { count } = await supabase
        .from("tax_invoices")
        .select("*", { count: "exact", head: true });

      // 이번 달 발행 금액
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const { data: monthData } = await supabase
        .from("tax_invoices")
        .select("total_amount")
        .gte("issue_date", thisMonth.toISOString().split("T")[0]);

      const thisMonthAmount =
        monthData?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;

      // 총 공급가액
      const { data: allData } = await supabase
        .from("tax_invoices")
        .select("supply_amount");

      const totalSupplyAmount =
        allData?.reduce((sum, inv) => sum + inv.supply_amount, 0) || 0;

      setStats({
        totalCount: count || 0,
        thisMonthAmount,
        totalSupplyAmount,
      });
    } catch (error) {
      console.error("통계 로딩 실패:", error);
    }
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      !searchTerm ||
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.buyer_company_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      invoice.buyer_business_number.includes(searchTerm);

    const matchesDateFrom = !dateFrom || invoice.issue_date >= dateFrom;
    const matchesDateTo = !dateTo || invoice.issue_date <= dateTo;

    return matchesSearch && matchesDateFrom && matchesDateTo;
  });

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

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">세금계산서 관리</h1>
        <p className="text-gray-600 mt-2">
          광고 결제에 대한 세금계산서를 관리합니다
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              총 발행 건수
            </span>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <FaFileInvoice className="text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.totalCount}건
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              이번 달 발행 금액
            </span>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <FaCalendarCheck className="text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.thisMonthAmount.toLocaleString()}원
          </div>
          <p className="text-xs text-gray-500 mt-1">VAT 포함</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              총 공급가액
            </span>
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <FaWonSign className="text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.totalSupplyAmount.toLocaleString()}원
          </div>
          <p className="text-xs text-gray-500 mt-1">VAT 별도</p>
        </div>
      </div>

      {/* 필터 섹션 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              검색
            </label>
            <input
              type="text"
              placeholder="계산서번호, 회사명, 사업자번호"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              발행일 (시작)
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              발행일 (종료)
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  계산서번호
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  발행일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  공급받는자
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  공급가액
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  세액
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  합계금액
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {searchTerm || dateFrom || dateTo
                      ? "검색 결과가 없습니다"
                      : "발행된 세금계산서가 없습니다"}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.invoice_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(invoice.issue_date).toLocaleDateString(
                          "ko-KR",
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.buyer_company_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {invoice.buyer_business_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900">
                        {invoice.supply_amount.toLocaleString()}원
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900">
                        {invoice.tax_amount.toLocaleString()}원
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-bold text-gray-900">
                        {invoice.total_amount.toLocaleString()}원
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {invoice.status === "issued"
                          ? "발행완료"
                          : invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <Link
                        href={`/admin/tax-invoices/${invoice.id}`}
                        className="text-brand-primary hover:text-blue-700 mr-3"
                      >
                        상세보기
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 결과 개수 */}
      {filteredInvoices.length > 0 && (
        <div className="text-sm text-gray-600 text-center">
          총 {filteredInvoices.length}건의 세금계산서
        </div>
      )}
    </div>
  );
}
