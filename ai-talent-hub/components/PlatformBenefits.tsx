import React from 'react';

// Icons using Heroicons SVG paths for visual appeal
const UserGroupIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 00-12 0v-2.25a9.094 9.094 0 0012 0v2.25zM13.5 12.75a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM13.5 12.75V15M6.75 12.75V15m10.5-6.75a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM17.25 8.25V15" />
    </svg>
);
const WalletIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m15 3a3 3 0 11-6 0m6 0a3 3 0 10-6 0" />
    </svg>
);
const ShieldCheckIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />
    </svg>
);
const RocketLaunchIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.81m5.84-2.57a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 2.45m5.96 5.96a14.926 14.926 0 01-5.841 2.57m0 0a14.926 14.926 0 01-2.57-5.841m2.57 5.841A14.926 14.926 0 017.5 15.59m6.16-7.38a14.926 14.926 0 01-2.57 5.84m0 0a14.926 14.926 0 015.84 2.57m-5.84-2.57v4.81" />
    </svg>
);
const ClockIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const BriefcaseIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.05a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.25a2.25 2.25 0 012.25-2.25h15a2.25 2.25 0 012.25 2.25v.75M2.25 9l1.28-2.285A2.25 2.25 0 015.884 6h12.232a2.25 2.25 0 011.943 1.285L21.75 9M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


interface BenefitItemProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}
const BenefitItem: React.FC<BenefitItemProps> = ({ icon, title, children }) => (
    <li className="flex items-start space-x-4">
        <div className="flex-shrink-0">{icon}</div>
        <div>
            <h4 className="font-semibold text-gray-100 text-lg">{title}</h4>
            <p className="text-gray-400 mt-1">{children}</p>
        </div>
    </li>
);

const PlatformBenefits: React.FC = () => {
    return (
        <section className="py-24 bg-gray-900 bg-gradient-to-b from-gray-900 to-gray-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                        왜 돌파구를 선택해야 할까요?
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
                        구매자와 전문가 모두를 위한 최고의 AI 재능 마켓플레이스
                    </p>
                </div>
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    {/* For Buyers */}
                    <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-blue-500/50 hover:bg-gray-800/80 transition-all duration-300 transform hover:-translate-y-1">
                        <h3 className="text-2xl font-bold text-blue-400">구매자 (Clients)</h3>
                        <p className="mt-2 text-gray-400 text-lg">필요한 모든 재능을 한 곳에서, 빠르고 안전하게 만나보세요.</p>
                        <ul className="mt-8 space-y-6">
                            <BenefitItem icon={<UserGroupIcon className="w-8 h-8 text-blue-400" />} title="폭넓은 전문가 풀">
                                AI부터 생활 서비스까지, 각 분야에서 검증된 전문가들을 손쉽게 찾아 프로젝트를 의뢰할 수 있습니다.
                            </BenefitItem>
                            <BenefitItem icon={<WalletIcon className="w-8 h-8 text-blue-400" />} title="투명한 가격 정책">
                                숨은 비용이나 추가 수수료 걱정 없이, 예산에 맞춰 합리적으로 서비스를 이용하세요.
                            </BenefitItem>
                            <BenefitItem icon={<ShieldCheckIcon className="w-8 h-8 text-blue-400" />} title="안전 결제 시스템">
                                작업이 만족스럽게 완료될 때까지 결제 대금은 돌파구가 안전하게 보호합니다.
                            </BenefitItem>
                        </ul>
                        <a href="#" className="mt-10 inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20">
                           최고의 전문가 찾기
                        </a>
                    </div>
                    {/* For Sellers */}
                    <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-gray-500/50 hover:bg-gray-800/80 transition-all duration-300 transform hover:-translate-y-1">
                        <h3 className="text-2xl font-bold text-gray-200">판매자 (Experts)</h3>
                        <p className="mt-2 text-gray-400 text-lg">당신의 재능과 전문성을 가치로 바꾸고, 새로운 기회를 만드세요.</p>
                        <ul className="mt-8 space-y-6">
                             <BenefitItem icon={<RocketLaunchIcon className="w-8 h-8 text-gray-300" />} title="새로운 수익 창출">
                                재능을 상품으로 등록하고 판매하여 안정적인 부가 수익을 만들 수 있는 기회를 잡으세요.
                            </BenefitItem>
                            <BenefitItem icon={<ClockIcon className="w-8 h-8 text-gray-300" />} title="유연한 근무 환경">
                                원하는 시간과 장소에서 자유롭게 일하며 '워라밸'을 실현하고 경력을 관리할 수 있습니다.
                            </BenefitItem>
                            <BenefitItem icon={<BriefcaseIcon className="w-8 h-8 text-gray-300" />} title="성장과 기회">
                                다양한 프로젝트를 통해 포트폴리오를 쌓고 전문가로서 당신의 가치를 더욱 높일 수 있습니다.
                            </BenefitItem>
                        </ul>
                         <a href="#" className="mt-10 inline-block bg-white text-gray-800 font-semibold px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors shadow-lg shadow-white/10">
                            재능 판매 시작하기
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PlatformBenefits;