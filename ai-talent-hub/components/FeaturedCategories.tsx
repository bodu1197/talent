import React from 'react';

const CheckIcon: React.FC = () => (
    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
);

interface FeatureItemProps {
    children: React.ReactNode;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ children }) => (
    <li className="flex items-start space-x-3">
        <div className="flex-shrink-0 pt-1">
            <CheckIcon />
        </div>
        <span className="text-gray-600">{children}</span>
    </li>
);

const FeaturedCategories: React.FC = () => {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-24">

                {/* AI Services Section */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1">
                        <span className="text-sm font-bold uppercase text-blue-600">AI Services</span>
                        <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                            미래를 여는 기술, AI 전문가와 함께
                        </h2>
                        <p className="mt-4 text-lg text-gray-600">
                            최신 인공지능 기술을 비즈니스에 접목하여 혁신을 가속화하세요. 데이터 분석부터 머신러닝 모델 개발, 자동화 챗봇 구축까지 최고의 AI 전문가들이 당신의 성공을 돕습니다.
                        </p>
                        <ul className="mt-6 space-y-4 text-lg">
                            <FeatureItem>AI 기반 데이터 분석 및 예측 모델링</FeatureItem>
                            <FeatureItem>자연어 처리(NLP) 및 챗봇 개발</FeatureItem>
                            <FeatureItem>컴퓨터 비전 및 이미지 인식 솔루션</FeatureItem>
                        </ul>
                        <a href="#" className="mt-8 inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
                            AI 서비스 둘러보기
                        </a>
                    </div>
                    <div className="order-1 md:order-2">
                        <img 
                            src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=800&auto=format&fit=crop"
                            alt="AI Technology" 
                            className="rounded-2xl shadow-2xl object-cover w-full h-[500px]"
                        />
                    </div>
                </div>

                {/* Life Services Section */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                         <img 
                            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=800&auto=format&fit=crop"
                            alt="Life Services" 
                            className="rounded-2xl shadow-2xl object-cover w-full h-[500px]"
                        />
                    </div>
                    <div>
                        <span className="text-sm font-bold uppercase text-purple-600">Life Services</span>
                        <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                            당신의 일상을 더 편리하고 풍요롭게
                        </h2>
                        <p className="mt-4 text-lg text-gray-600">
                            바쁜 일상 속 도움이 필요한 모든 순간, 생활 서비스 전문가가 해결해 드립니다. 청소, 심부름, 반려동물 돌봄, 개인 레슨 등 삶의 질을 높이는 다양한 서비스를 만나보세요.
                        </p>
                        <ul className="mt-6 space-y-4 text-lg">
                            <FeatureItem>전문적인 홈 클리닝 및 정리 정돈</FeatureItem>
                            <FeatureItem>맞춤형 취미 및 외국어 레슨</FeatureItem>
                            <FeatureItem>신뢰할 수 있는 펫시터 및 산책 서비스</FeatureItem>
                        </ul>
                         <a href="#" className="mt-8 inline-block bg-purple-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors shadow-lg">
                            생활 서비스 찾아보기
                        </a>
                    </div>
                </div>

                {/* IT/Programming Section */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1">
                        <span className="text-sm font-bold uppercase text-green-600">IT & Programming</span>
                        <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                            아이디어를 현실로, 최고의 개발자 군단
                        </h2>
                        <p className="mt-4 text-lg text-gray-600">
                           웹사이트, 모바일 앱, 맞춤형 소프트웨어 개발까지. 검증된 실력의 IT 전문가들이 당신의 아이디어를 완벽한 결과물로 만들어 드립니다.
                        </p>
                        <ul className="mt-6 space-y-4 text-lg">
                            <FeatureItem>최신 기술 스택을 활용한 웹/앱 개발</FeatureItem>
                            <FeatureItem>안정적인 서버 구축 및 유지보수</FeatureItem>
                            <FeatureItem>비즈니스 자동화를 위한 프로그램 제작</FeatureItem>
                        </ul>
                         <a href="#" className="mt-8 inline-block bg-green-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-lg">
                            개발자 찾기
                        </a>
                    </div>
                    <div className="order-1 md:order-2">
                        <img 
                            src="https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=800&auto=format&fit=crop"
                            alt="IT and Programming" 
                            className="rounded-2xl shadow-2xl object-cover w-full h-[500px]"
                        />
                    </div>
                </div>
                
                {/* Design Section */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                         <img 
                            src="https://images.unsplash.com/photo-1522199670076-2852f80289c3?q=80&w=800&auto=format&fit=crop"
                            alt="Creative Design" 
                            className="rounded-2xl shadow-2xl object-cover w-full h-[500px]"
                        />
                    </div>
                    <div>
                        <span className="text-sm font-bold uppercase text-orange-500">Design</span>
                        <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                            브랜드를 빛내는, 감각적인 디자인
                        </h2>
                        <p className="mt-4 text-lg text-gray-600">
                            로고, 웹사이트, 마케팅 자료까지. 당신의 비즈니스에 특별한 가치를 더할 디자인 전문가를 만나보세요. 시선을 사로잡는 디자인으로 고객의 마음을 움직입니다.
                        </p>
                        <ul className="mt-6 space-y-4 text-lg">
                            <FeatureItem>로고 및 브랜딩 디자인</FeatureItem>
                            <FeatureItem>UI/UX 웹 및 모바일 디자인</FeatureItem>
                            <FeatureItem>상세페이지 및 광고 콘텐츠 제작</FeatureItem>
                        </ul>
                         <a href="#" className="mt-8 inline-block bg-orange-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors shadow-lg">
                            디자이너 포트폴리오 보기
                        </a>
                    </div>
                </div>

                {/* Marketing Section */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1">
                        <span className="text-sm font-bold uppercase text-pink-500">Marketing</span>
                        <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                           성공적인 비즈니스를 위한, 전략적 마케팅
                        </h2>
                        <p className="mt-4 text-lg text-gray-600">
                           디지털 마케팅, SEO, SNS 관리 등 각 분야 최고의 마케팅 전문가들이 매출 증대를 위한 맞춤형 전략을 제공합니다. 이제 비즈니스 성장에만 집중하세요.
                        </p>
                        <ul className="mt-6 space-y-4 text-lg">
                            <FeatureItem>검색 엔진 최적화(SEO) 및 광고</FeatureItem>
                            <FeatureItem>소셜 미디어 채널 관리 및 콘텐츠 제작</FeatureItem>
                            <FeatureItem>블로그 및 인플루언서 마케팅</FeatureItem>
                        </ul>
                         <a href="#" className="mt-8 inline-block bg-pink-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-pink-600 transition-colors shadow-lg">
                            마케팅 전문가와 상담하기
                        </a>
                    </div>
                    <div className="order-1 md:order-2">
                        <img 
                            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop"
                            alt="Digital Marketing" 
                            className="rounded-2xl shadow-2xl object-cover w-full h-[500px]"
                        />
                    </div>
                </div>

            </div>
        </section>
    );
};

export default FeaturedCategories;