'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function LootPage() {
  const [activeTab, setActiveTab] = useState('home');

  const tiles = [
    {
      id: 1,
      title: '지출 디톡스',
      desc: '이번 주 새는 지출 TOP3를 찾아 제한 룰을 만들어요.',
      icon: (
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <path d="M3 13.5 5.5 8.8A2 2 0 0 1 7.3 7.7h9.4a2 2 0 0 1 1.8 1.1L21 13.5" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
          <path d="M4 13.5h16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4Z" stroke="#111" strokeWidth="2"/>
          <path d="M7 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" fill="#111"/>
          <path d="M17 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" fill="#111"/>
        </svg>
      ),
    },
    {
      id: 2,
      title: '예약',
      desc: '월급날/매주 자동 저축 루틴을 만들고 실행해요.',
      icon: (
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <path d="M7 2v3M17 2v3" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
          <path d="M5 6h14a2 2 0 0 1 2 2v3H3V8a2 2 0 0 1 2-2Z" stroke="#111" strokeWidth="2"/>
          <path d="M6 22h12a2 2 0 0 0 2-2v-9H4v9a2 2 0 0 0 2 2Z" stroke="#111" strokeWidth="2"/>
          <path d="M12 14v3l2 1" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 3,
      title: 'Uber 틴즈',
      desc: '목표 비중을 설정하고 편차가 커지면 알림을 줘요.',
      icon: (
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <path d="M4 19V5" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
          <path d="M4 19h16" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
          <path d="M7 15l3-3 3 2 5-6" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18 8h2v2" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 4,
      title: '시니어',
      desc: '큰 글씨/단순 화면으로 가족도 쉽게 쓰게 해요.',
      icon: (
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <path d="M12 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" fill="#111"/>
          <path d="M4 8h16" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 8v12" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
          <path d="M7 21l2-7M17 21l-2-7" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
  ];

  const handleTileClick = (title: string, desc: string) => {
    alert(`${title}\n\n${desc}`);
  };

  const handleLaterClick = () => {
    alert('나중에\n\n예약/리마인드(스케줄 실행)로 연결하면 됩니다.');
  };

  const handleMoreClick = () => {
    alert('더보기\n\n제안 사항 전체 목록 화면으로 연결하면 됩니다.');
  };

  return (
    <div className="min-h-screen bg-white relative pb-20">
      <div className="max-w-[430px] mx-auto min-h-screen relative">
        {/* Header */}
        <header className="px-4 pt-2.5">
          <div className="flex justify-center items-center h-14 mt-1.5 mb-1">
            <Image
              src="/logo-loot.png"
              alt="돈벼락 로고"
              width={200}
              height={36}
              className="h-9 w-auto object-contain"
            />
            <div className="text-3xl font-black">돈벼락</div>
          </div>

          {/* Search Row */}
          <div className="mt-2.5 flex gap-2.5 items-center">
            <div className="flex-1 flex items-center gap-2.5 px-3.5 py-3.5 rounded-full bg-white shadow-[0_10px_24px_rgba(0,0,0,0.10)] border border-black/[0.06]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="#111" strokeWidth="2"/>
                <path d="M16.5 16.5 21 21" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="어떤 돈 메뉴 할까요?"
                className="border-0 outline-none w-full text-base font-bold tracking-tight placeholder:text-[#111] placeholder:opacity-65 placeholder:font-extrabold"
              />
            </div>

            <button
              onClick={handleLaterClick}
              className="flex items-center gap-2 px-3.5 py-3 rounded-full bg-white border border-black/[0.06] shadow-[0_10px_24px_rgba(0,0,0,0.10)] font-extrabold whitespace-nowrap active:translate-y-px"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M7 2v3M17 2v3" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
                <path d="M3.5 9h17" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
                <path d="M6 6h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" stroke="#111" strokeWidth="2"/>
              </svg>
              나중에
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="px-4 pt-3.5">
          {/* Title Row */}
          <div className="mt-3.5 flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight">제안 사항</h2>
            <button
              onClick={handleMoreClick}
              className="w-9 h-9 rounded-full border-0 bg-[#f5f5f5] grid place-items-center active:translate-y-px"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 6l6 6-6 6" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Tiles */}
          <section className="mt-3 grid grid-cols-4 gap-3">
            {tiles.map((tile) => (
              <div
                key={tile.id}
                onClick={() => handleTileClick(tile.title, tile.desc)}
                className="bg-white border border-black/[0.06] rounded-[18px] p-3 px-2 text-center cursor-pointer shadow-[0_6px_16px_rgba(0,0,0,0.08)] transition-transform duration-[120ms] hover:-translate-y-0.5 active:translate-y-0"
              >
                <div className="w-[58px] h-[58px] rounded-2xl bg-[#f3f4f6] mx-auto mb-2.5 grid place-items-center">
                  {tile.icon}
                </div>
                <div className="text-sm font-black tracking-tight">{tile.title}</div>
              </div>
            ))}
          </section>

          {/* YouTube Video */}
          <div className="mt-6">
            <iframe
              width="100%"
              height="215"
              src="https://www.youtube.com/embed/ktzAq7wjJgs?si=vEMK2izzprsH3A5C"
              title="돈벼락 Uber 스타일 UI 데모"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="rounded-lg"
            />
          </div>

          {/* CTA Buttons */}
          <div className="mt-6 text-center">
            <a
              href="https://loot.menu/ko/buyer/buyorder"
              className="inline-flex items-center px-6 py-3.5 bg-[#111] text-white rounded-full font-extrabold text-base no-underline"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mr-2">
                <path d="M6 6h15l-1.5 9h-13L6 6Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" fill="#fff"/>
                <path d="M18 22a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" fill="#fff"/>
                <path d="M4 4h2l3 9h11" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              테더 구매하러 가기
            </a>
          </div>

          <div className="mt-4 text-center">
            <a
              href="https://loot.menu/ko/seller/buyorder"
              className="inline-flex items-center px-6 py-3.5 bg-white text-[#111] border-2 border-[#111] rounded-full font-extrabold text-base no-underline"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mr-2">
                <path d="M12 2l7 7-7 7-7-7 7-7Z" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 9v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              테더 판매하러 가기
            </a>
          </div>

          <div className="h-[360px]" />
        </main>
      </div>

      {/* Bottom Tab Bar */}
      <nav className="fixed left-1/2 -translate-x-1/2 bottom-0 w-full max-w-[430px] bg-white border-t border-black/10 px-2 pt-2 pb-2.5">
        <div className="grid grid-cols-4 gap-1.5">
          <button
            onClick={() => setActiveTab('home')}
            className={`py-2 px-1.5 rounded-[14px] text-center text-xs font-black ${
              activeTab === 'home' ? 'text-[#111]' : 'text-[#6b7280]'
            }`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="mx-auto mb-1.5">
              <path d="M4 10.5 12 4l8 6.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9.5Z" stroke={activeTab === 'home' ? '#111' : '#6b7280'} strokeWidth="2" strokeLinejoin="round"/>
            </svg>
            홈
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`py-2 px-1.5 rounded-[14px] text-center text-xs font-black ${
              activeTab === 'services' ? 'text-[#111]' : 'text-[#6b7280]'
            }`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="mx-auto mb-1.5">
              <path d="M4 6h7v7H4V6Zm9 0h7v7h-7V6ZM4 15h7v7H4v-7Zm9 0h7v7h-7v-7Z" stroke={activeTab === 'services' ? '#111' : '#6b7280'} strokeWidth="2"/>
            </svg>
            서비스
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`py-2 px-1.5 rounded-[14px] text-center text-xs font-black ${
              activeTab === 'activity' ? 'text-[#111]' : 'text-[#6b7280]'
            }`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="mx-auto mb-1.5">
              <path d="M6 4h12a2 2 0 0 1 2 2v14l-4-2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke={activeTab === 'activity' ? '#111' : '#6b7280'} strokeWidth="2"/>
            </svg>
            활동
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`py-2 px-1.5 rounded-[14px] text-center text-xs font-black ${
              activeTab === 'account' ? 'text-[#111]' : 'text-[#6b7280]'
            }`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="mx-auto mb-1.5">
              <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke={activeTab === 'account' ? '#111' : '#6b7280'} strokeWidth="2"/>
              <path d="M4 21a8 8 0 0 1 16 0" stroke={activeTab === 'account' ? '#111' : '#6b7280'} strokeWidth="2" strokeLinecap="round"/>
            </svg>
            계정
          </button>
        </div>
      </nav>
    </div>
  );
}
