export default function TermsPage() {
  return (
    <div className="container-1200 py-16">
      <h1 className="text-3xl font-semibold mb-8">이용약관</h1>
      <div className="prose max-w-none text-gray-700">
        <p className="text-sm text-gray-500 mb-8">시행일: 2024년 1월 1일</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">제1조 (목적)</h2>
          <p>
            본 약관은 (주)플랫폼몬스터(이하 &quot;회사&quot;)가 운영하는 돌파구 서비스(이하
            &quot;서비스&quot;)의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타
            필요한 사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">제2조 (정의)</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              &quot;서비스&quot;란 회사가 제공하는 전문가 매칭 플랫폼 및 관련 제반 서비스를
              의미합니다.
            </li>
            <li>
              &quot;이용자&quot;란 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.
            </li>
            <li>
              &quot;회원&quot;이란 서비스에 가입하여 아이디(ID)를 부여받은 자로서, 서비스를
              계속적으로 이용할 수 있는 자를 말합니다.
            </li>
            <li>
              &quot;전문가&quot;란 서비스를 통해 자신의 전문 서비스를 제공하는 회원을 말합니다.
            </li>
            <li>
              &quot;의뢰인&quot;이란 서비스를 통해 전문가의 서비스를 구매하는 회원을 말합니다.
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">제3조 (약관의 효력 및 변경)</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이
              발생합니다.
            </li>
            <li>
              회사는 합리적인 사유가 발생할 경우 관련 법령에 위배되지 않는 범위 내에서 약관을 변경할
              수 있으며, 변경된 약관은 적용일 7일 전부터 공지합니다.
            </li>
            <li>
              회원이 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있으며,
              변경된 약관의 효력 발생일 이후에도 서비스를 계속 이용할 경우 약관 변경에 동의한 것으로
              간주합니다.
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">제4조 (회원가입)</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              회원가입은 이용자가 본 약관에 동의하고 회사가 정한 절차에 따라 가입신청을 하면, 회사가
              이를 승낙함으로써 성립합니다.
            </li>
            <li>
              회사는 다음 각 호에 해당하는 경우 가입신청을 거부하거나 사후에 회원자격을 제한 또는
              상실시킬 수 있습니다.
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>타인의 명의를 도용한 경우</li>
                <li>허위 정보를 기재한 경우</li>
                <li>기타 회사가 정한 가입요건을 충족하지 못한 경우</li>
              </ul>
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">제5조 (서비스의 제공 및 변경)</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              회사는 다음과 같은 서비스를 제공합니다.
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>전문가와 의뢰인 간의 매칭 서비스</li>
                <li>전문가 서비스 결제 및 정산 서비스</li>
                <li>서비스 관련 정보 제공</li>
                <li>기타 회사가 정하는 서비스</li>
              </ul>
            </li>
            <li>회사는 서비스의 내용을 변경할 수 있으며, 변경 시 사전에 공지합니다.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">제6조 (서비스 이용요금)</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>서비스 이용에 대한 요금은 서비스 내 별도로 명시합니다.</li>
            <li>회사는 결제된 금액에서 수수료를 제한 후 전문가에게 정산합니다.</li>
            <li>수수료율 및 정산 주기는 회사 정책에 따르며, 변경 시 사전 공지합니다.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">제7조 (결제 및 환불)</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>의뢰인은 서비스 이용을 위해 회사가 정한 결제수단을 통해 결제할 수 있습니다.</li>
            <li>
              환불은 회사의 환불정책에 따르며, 서비스 특성상 작업이 시작된 이후에는 환불이 제한될 수
              있습니다.
            </li>
            <li>환불 요청 시 회사는 합리적인 범위 내에서 처리합니다.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">제8조 (회원의 의무)</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>회원은 관련 법령 및 본 약관의 규정을 준수해야 합니다.</li>
            <li>
              회원은 다음 행위를 해서는 안 됩니다.
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>타인의 정보 도용</li>
                <li>서비스 운영 방해</li>
                <li>불법적인 목적으로 서비스 이용</li>
                <li>타인의 명예 훼손 또는 권리 침해</li>
                <li>회사의 사전 동의 없는 영리 활동</li>
              </ul>
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">제9조 (회사의 의무)</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              회사는 관련 법령과 본 약관이 정하는 바에 따라 지속적이고 안정적인 서비스를 제공하기
              위해 노력합니다.
            </li>
            <li>회사는 회원의 개인정보를 보호하기 위해 보안시스템을 갖추어 운영합니다.</li>
            <li>회사는 회원의 불만사항을 접수하고 처리하기 위한 고객센터를 운영합니다.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">제10조 (면책조항)</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              회사는 통신판매중개자로서 전문가와 의뢰인 간의 거래를 중개하는 역할을 하며, 거래
              당사자가 아닙니다.
            </li>
            <li>상품, 상품정보, 거래에 관한 의무와 책임은 해당 전문가(판매회원)에게 있습니다.</li>
            <li>
              회사는 천재지변, 시스템 장애 등 불가항력적인 사유로 인해 서비스를 제공할 수 없는
              경우에는 책임을 지지 않습니다.
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">제11조 (분쟁해결)</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              본 약관과 관련하여 분쟁이 발생한 경우, 회사와 회원은 원만한 해결을 위해 성실히
              협의합니다.
            </li>
            <li>협의가 이루어지지 않을 경우, 관할 법원은 회사 소재지 관할 법원으로 합니다.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">부칙</h2>
          <p>본 약관은 2024년 1월 1일부터 시행됩니다.</p>
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
