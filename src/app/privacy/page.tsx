export default function PrivacyPage() {
  return (
    <div className="container-1200 py-16">
      <h1 className="text-3xl font-semibold mb-8">개인정보처리방침</h1>
      <div className="prose max-w-none text-gray-700">
        <p className="text-sm text-gray-500 mb-8">시행일: 2024년 1월 1일</p>

        <p className="mb-8">
          (주)플랫폼몬스터(이하 &quot;회사&quot;)는 개인정보보호법 등 관련 법령에 따라 이용자의
          개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여
          다음과 같이 개인정보처리방침을 수립·공개합니다.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">제1조 (개인정보의 수집 항목 및 수집 방법)</h2>
          <h3 className="text-lg font-medium mb-2">1. 수집하는 개인정보 항목</h3>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>
              <strong>필수항목:</strong> 이메일, 비밀번호, 이름(닉네임), 휴대폰번호
            </li>
            <li>
              <strong>선택항목:</strong> 프로필 사진, 주소, 계좌정보(전문가의 경우)
            </li>
            <li>
              <strong>서비스 이용 과정에서 자동 수집되는 정보:</strong> IP주소, 쿠키, 서비스
              이용기록, 접속 로그
            </li>
          </ul>
          <h3 className="text-lg font-medium mb-2">2. 개인정보 수집 방법</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>홈페이지 회원가입 및 서비스 이용</li>
            <li>전문가 등록 신청</li>
            <li>고객센터 문의</li>
            <li>이벤트 및 설문조사 참여</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">제2조 (개인정보의 수집 및 이용 목적)</h2>
          <p>회사는 수집한 개인정보를 다음의 목적을 위해 이용합니다.</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>
              <strong>회원 관리:</strong> 회원제 서비스 이용, 본인확인, 불량회원 부정이용 방지,
              가입의사 확인, 분쟁 조정을 위한 기록보존, 고지사항 전달
            </li>
            <li>
              <strong>서비스 제공:</strong> 전문가 매칭 서비스, 결제 및 정산, 콘텐츠 제공
            </li>
            <li>
              <strong>마케팅 및 광고:</strong> 이벤트 및 광고성 정보 제공(선택 동의 시)
            </li>
            <li>
              <strong>서비스 개선:</strong> 서비스 이용 통계, 서비스 개선 및 신규 서비스 개발
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">제3조 (개인정보의 보유 및 이용 기간)</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보 수집 시에 동의
              받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
            </li>
            <li>
              회원 탈퇴 시 개인정보는 즉시 파기합니다. 단, 관련 법령에 따라 보존이 필요한 경우 해당
              기간 동안 보관합니다.
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
                <li>대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)</li>
                <li>소비자 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)</li>
                <li>로그인 기록: 3개월 (통신비밀보호법)</li>
              </ul>
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">제4조 (개인정보의 제3자 제공)</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              회사는 이용자의 개인정보를 제2조에서 명시한 범위 내에서만 처리하며, 정보주체의 동의
              또는 법률의 특별한 규정 등이 있는 경우에만 제3자에게 개인정보를 제공합니다.
            </li>
            <li>
              서비스 제공을 위해 다음과 같이 개인정보를 제공할 수 있습니다.
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  <strong>제공받는 자:</strong> 결제대행사(포트원 등)
                </li>
                <li>
                  <strong>제공 항목:</strong> 결제정보
                </li>
                <li>
                  <strong>제공 목적:</strong> 결제 처리
                </li>
                <li>
                  <strong>보유 기간:</strong> 결제 완료 후 5년
                </li>
              </ul>
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">제5조 (개인정보 처리의 위탁)</h2>
          <p>회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">수탁업체</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">위탁업무 내용</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">AWS</td>
                  <td className="border border-gray-300 px-4 py-2">데이터 보관 및 서버 운영</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">포트원</td>
                  <td className="border border-gray-300 px-4 py-2">결제 처리</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">제6조 (정보주체의 권리·의무 및 행사방법)</h2>
          <p>이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.</p>
          <ol className="list-decimal pl-5 space-y-2 mt-2">
            <li>개인정보 열람 요구</li>
            <li>개인정보 정정·삭제 요구</li>
            <li>개인정보 처리정지 요구</li>
          </ol>
          <p className="mt-4">
            위 권리 행사는 회사에 대해 서면, 이메일 등을 통하여 하실 수 있으며 회사는 이에 대해
            지체없이 조치하겠습니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">제7조 (개인정보의 파기)</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는
              지체없이 해당 개인정보를 파기합니다.
            </li>
            <li>
              <strong>파기절차:</strong> 불필요한 개인정보는 개인정보관리책임자의 승인을 받아
              파기합니다.
            </li>
            <li>
              <strong>파기방법:</strong> 전자적 파일은 복구 불가능한 방법으로 삭제하고, 종이 문서는
              분쇄하거나 소각합니다.
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">제8조 (개인정보의 안전성 확보조치)</h2>
          <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>개인정보 취급 직원의 최소화 및 교육</li>
            <li>개인정보에 대한 접근 제한</li>
            <li>비밀번호 등 개인정보의 암호화</li>
            <li>보안프로그램 설치 및 주기적 갱신</li>
            <li>개인정보의 암호화 전송(SSL)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">제9조 (쿠키의 설치·운영 및 거부)</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              회사는 이용자에게 개별적인 맞춤 서비스를 제공하기 위해 이용정보를 저장하고 수시로
              불러오는 &apos;쿠키(cookie)&apos;를 사용합니다.
            </li>
            <li>
              이용자는 쿠키 설치에 대한 선택권을 가지고 있으며, 웹브라우저 설정을 통해 쿠키 허용
              또는 거부를 할 수 있습니다.
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">제10조 (개인정보 보호책임자)</h2>
          <p>
            회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의
            불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
          </p>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p>
              <strong>개인정보 보호책임자</strong>
              <br />
              성명: 배미미
              <br />
              직책: 대표이사
              <br />
              이메일: dolpagu@dolpagu.com
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">제11조 (권익침해 구제방법)</h2>
          <p>
            정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회,
            한국인터넷진흥원 개인정보침해신고센터 등에 분쟁해결이나 상담 등을 신청할 수 있습니다.
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4">
            <li>개인정보분쟁조정위원회: 1833-6972 (www.kopico.go.kr)</li>
            <li>개인정보침해신고센터: 118 (privacy.kisa.or.kr)</li>
            <li>대검찰청: 1301 (www.spo.go.kr)</li>
            <li>경찰청: 182 (ecrm.cyber.go.kr)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">제12조 (개인정보처리방침의 변경)</h2>
          <p>
            이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제
            및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">부칙</h2>
          <p>본 개인정보처리방침은 2024년 1월 1일부터 시행됩니다.</p>
        </section>

        <div className="mt-12 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>(주)플랫폼몬스터</strong>
            <br />
            사업자등록번호: 363-06-01936
            <br />
            대표: 배미미
            <br />
            주소: 서울시 마포구 월드컵로 81 3층
            <br />
            고객센터: dolpagu@dolpagu.com
          </p>
        </div>
      </div>
    </div>
  );
}
