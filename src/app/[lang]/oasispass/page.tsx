'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Lang = 'ko' | 'en';

type TransferLog = {
  _id: string;
  chain: string;
  transactionHash: string;
  amount: number;
  createdAt: string;
  from: {
    walletAddress: string;
    nickname?: string;
    memo?: string;
    bankInfo?: {
      bankName?: string;
      accountNumber?: string;
      accountHolder?: string;
      realAccountNumber?: string;
    };
  };
  to: {
    depositBankName?: string;
    depositBankAccountNumber?: string;
    depositName?: string;
    bankTransferMatched?: boolean;
    bankInfo?: {
      bankName?: string;
      accountNumber?: string;
      accountHolder?: string;
      realAccountNumber?: string;
    };
  };
};

type LiveLog = TransferLog & { arrivedAt: number };

const translations: Record<Lang, Record<string, string>> = {
  en: {
    'hero.badge1': 'USDT Conditional Settlement',
    'hero.badge2': 'API First',
    'hero.badge3': 'Audit Trail',
    'hero.title': 'Infrastructure for Conditional USDT Settlement',
    'hero.lead':
      'When external agreements are met, Release/Refund is executed automatically. No brokerage, no pricing feed, no fiat handling—just trusted settlement.',
    'hero.ctaPrimary': 'See how it works',
    'hero.ctaSecondary': 'Contact sales',
    'hero.trustTitle': 'Security and Compliance for Trust',
    'hero.trust1': 'Chainalysis KYT transaction monitoring',
    'hero.trust2': 'Immutable signing & settlement logs',
    'hero.trust3': 'Role-based access with multi-approval options',
    'hero.trust4': '24/7 visibility dashboard',

    'live.title': 'Live Settlement Feed',
    'live.caption': '',
    'live.badge.live': 'LIVE',
    'live.badge.matched': 'Settled',
    'live.badge.pending': 'Pending',
    'live.label.from': 'From',
    'live.label.to': 'To',
    'live.label.amount': 'Amount',
    'live.label.hash': 'Tx Hash',
    'live.label.time': 'Time',
    'live.status.updating': 'Updating…',
    'live.status.error': 'Sync issue, retrying',
    'live.updated': 'Updated',
    'live.empty': 'No transfers yet.',

    'about.title': 'What is Oasis Pass?',
    'about.body':
      'Oasis Pass is a conditional settlement infrastructure built on USDT for inter-company contracts. When agreed conditions are met, settlement executes automatically without brokering trades or handling fiat.',
    'about.card1.title': 'Conditional Settlement',
    'about.card1.desc': 'Auto Release/Refund based on external agreement',
    'about.card2.title': 'No Trade, No Fiat',
    'about.card2.desc': 'We do not broker trades, provide pricing, or touch fiat',
    'about.card3.title': 'Infrastructure Layer',
    'about.card3.desc': 'API-first design that plugs into ERP and platforms',
    'about.card4.title': 'Audit Ready',
    'about.card4.desc': 'Conditions, approvals, and settlements stored as evidence',

    'flow.title': 'How It Works',
    'flow.body': 'Once the pre-agreed condition is verified, settlement executes automatically.',
    'flow.step1.title': 'Parties Agreement',
    'flow.step1.desc': 'Conditions finalized outside the service',
    'flow.step2.title': 'USDT Escrow Lock',
    'flow.step2.desc': 'Funds locked in escrow',
    'flow.step3.title': 'Condition Pending',
    'flow.step3.desc': 'Awaiting proof of agreed conditions',
    'flow.step4.title': 'Auto Settlement',
    'flow.step4.desc': 'Release/Refund triggers on condition met',

    'scope.title': 'What We Do / Don’t',
    'scope.do.title': 'We Do',
    'scope.do.1': 'USDT escrow settlement',
    'scope.do.2': 'Conditional automated settlement',
    'scope.do.3': 'B2B settlement API',
    'scope.do.4': 'Settlement logs and evidence',
    'scope.dont.title': 'We Don’t',
    'scope.dont.1': 'Intermediate trades',
    'scope.dont.2': 'Provide price feeds',
    'scope.dont.3': 'Handle fiat currencies',
    'scope.dont.4': 'Solicit investment/returns',

    'use.title': 'Use Cases',
    'use.1.title': 'Enterprise Settlement',
    'use.1.desc': 'Milestone-based payouts for inter-company contracts',
    'use.2.title': 'Cross-border Contracts',
    'use.2.desc': 'Digital settlement across borders and time zones',
    'use.3.title': 'ERP Integration',
    'use.3.desc': 'API hookup to internal accounting/settlement systems',
    'use.4.title': 'Marketplace Escrow',
    'use.4.desc': 'Secure payments to raise platform trust',

    'footer.copy': '© 2026 Oasis Pass. All rights reserved.',
    'footer.disclaimer':
      'We operate settlement infrastructure only. We do not intermediate trades or handle fiat currency.',
  },
  ko: {
    'hero.badge1': 'USDT 조건부 정산',
    'hero.badge2': 'API First',
    'hero.badge3': 'Audit Trail',
    'hero.title': '조건부 USDT 정산을 위한 인프라',
    'hero.lead':
      '외부 합의가 충족되면 자동으로 Release/Refund가 실행되는 B2B 정산 레이어. 거래 중개, 시세 제공, 원화 취급 없이 안전하게 정산을 완료합니다.',
    'hero.ctaPrimary': '동작 방식 보기',
    'hero.ctaSecondary': '도입 문의',
    'hero.trustTitle': '신뢰를 담은 보안·컴플라이언스',
    'hero.trust1': 'Chainalysis KYT 기반 트랜잭션 모니터링',
    'hero.trust2': '서명·정산 로그 영구 보관',
    'hero.trust3': '역할 기반 권한, 다중 승인 옵션',
    'hero.trust4': '24/7 가시성 대시보드 제공',

    'live.title': '실시간 정산 피드',
    'live.caption': '',
    'live.badge.live': '실시간',
    'live.badge.matched': '정산 완료',
    'live.badge.pending': '매칭 대기',
    'live.label.from': '보낸 쪽',
    'live.label.to': '받는 쪽',
    'live.label.amount': '금액',
    'live.label.hash': '해시',
    'live.label.time': '시간',
    'live.status.updating': '업데이트 중…',
    'live.status.error': '동기화 오류, 재시도 중',
    'live.updated': '업데이트',
    'live.empty': '아직 전송 내역이 없습니다.',

    'about.title': 'Oasis Pass란?',
    'about.body':
      'Oasis Pass는 기업 간 계약 정산을 위해 설계된 USDT 기반 조건부 정산 인프라입니다. 합의된 조건이 충족되면 자동으로 정산을 실행하며, 거래를 중개하거나 원화·법정통화를 취급하지 않습니다.',
    'about.card1.title': 'Conditional Settlement',
    'about.card1.desc': '외부 합의에 따라 자동 Release/Refund 실행',
    'about.card2.title': 'No Trade, No Fiat',
    'about.card2.desc': '거래·시세 제공·법정통화 취급 없이 정산만 수행',
    'about.card3.title': 'Infrastructure Layer',
    'about.card3.desc': 'API 중심 설계로 ERP·플랫폼과 쉽게 연동',
    'about.card4.title': 'Audit Ready',
    'about.card4.desc': '모든 조건·승인·정산 기록을 증빙 가능 형태로 저장',

    'flow.title': 'How It Works',
    'flow.body': '사전 합의된 조건이 충족되면 자동으로 정산이 집행됩니다.',
    'flow.step1.title': 'Parties Agreement',
    'flow.step1.desc': '서비스 외부에서 조건 확정',
    'flow.step2.title': 'USDT Escrow Lock',
    'flow.step2.desc': '에스크로에 자금 잠금',
    'flow.step3.title': 'Condition Pending',
    'flow.step3.desc': '합의 조건 충족 여부 대기',
    'flow.step4.title': 'Auto Settlement',
    'flow.step4.desc': '조건 충족 시 Release/Refund 실행',

    'scope.title': 'What We Do / Don’t',
    'scope.do.title': 'We Do',
    'scope.do.1': 'USDT 에스크로 정산',
    'scope.do.2': '조건부 자동 정산',
    'scope.do.3': 'B2B 정산 API 제공',
    'scope.do.4': '정산 로그·증빙 제공',
    'scope.dont.title': 'We Don’t',
    'scope.dont.1': '거래 중개',
    'scope.dont.2': '시세 제공',
    'scope.dont.3': '원화·법정통화 취급',
    'scope.dont.4': '투자·수익 권유',

    'use.title': 'Use Cases',
    'use.1.title': 'Enterprise Settlement',
    'use.1.desc': '기업 간 계약 정산 및 마일스톤 기반 지급',
    'use.2.title': 'Cross-border Contracts',
    'use.2.desc': '시차·국경을 초월한 디지털 정산',
    'use.3.title': 'ERP Integration',
    'use.3.desc': '내부 회계·정산 시스템과 API 연동',
    'use.4.title': 'Marketplace Escrow',
    'use.4.desc': '플랫폼 신뢰도를 높이는 안전 결제/정산',

    'footer.copy': '© 2026 Oasis Pass. All rights reserved.',
    'footer.disclaimer':
      'Oasis Pass는 정산 인프라만 제공합니다. 거래를 중개하거나 원화 등 법정통화를 취급하지 않습니다.',
  },
};

type CopyKey = keyof typeof translations.en;

const ChainBadge = ({ chain }: { chain?: string }) => {
  const name = chain?.toLowerCase();
  if (name === 'bsc' || name === 'bnb' || name === 'binance smart chain') {
    return (
      <div className="chain chain-logo" aria-label="Binance Smart Chain">
        <svg viewBox="0 0 32 32" role="img" aria-hidden="true">
          <path
            fill="#F3BA2F"
            d="M16 2 9.2 8.8 12 11.6 16 7.6l4 4 2.8-2.8ZM7.6 10.4 4 14l2.8 2.8L10.4 14Zm16.8 0L21.6 14l3.6 3.6L28 14Zm-8.4 3.2-4 4 2.8 2.8 1.2-1.2 1.2 1.2 2.8-2.8Zm0 6.4-2.8 2.8L16 28l2.8-2.8Z"
          />
        </svg>
      </div>
    );
  }
  return <div className="chain">{chain?.toUpperCase() || 'CHAIN'}</div>;
};

export default function OasisPassPage() {
  const [lang, setLang] = useState<Lang>('ko');
  const [logs, setLogs] = useState<LiveLog[]>([]);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const inFlightRef = useRef(false);

  const POLL_MS = 8000;
  const NEW_HIGHLIGHT_MS = 6000;
  const MAX_ITEMS = 5;

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('oasispass-lang') : null;
    const browser = typeof navigator !== 'undefined' && navigator.language?.startsWith('en') ? 'en' : 'ko';
    if (saved === 'en' || saved === 'ko') {
      setLang(saved);
    } else {
      setLang(browser as Lang);
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('data-lang', lang);
    localStorage.setItem('oasispass-lang', lang);
  }, [lang]);

  const mask = (val?: string) => {
    if (!val) return '—';
    if (val.length <= 6) return val;
    return `${val.slice(0, 3)}•••${val.slice(-3)}`;
  };

  const maskName = (name?: string) => {
    if (!name) return '—';
    const trimmed = name.trim();
    if (trimmed.length <= 1) return trimmed;
    return `${trimmed[0]}${'*'.repeat(Math.min(3, trimmed.length - 1))}`;
  };

  const shorten = (val?: string, front = 6, back = 4) => {
    if (!val) return '—';
    if (val.length <= front + back) return val;
    return `${val.slice(0, front)}…${val.slice(-back)}`;
  };

  const formatClock = (iso: string) =>
    new Date(iso).toLocaleTimeString(lang === 'ko' ? 'ko-KR' : 'en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  const formatAmount = (amount: number) =>
    amount.toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatAgo = (iso: string) => {
    const diffMs = Date.now() - new Date(iso).getTime();
    const diffSec = Math.max(0, Math.floor(diffMs / 1000));
    if (diffSec < 45) return lang === 'ko' ? '방금 전' : 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return lang === 'ko' ? `${diffMin}분 전` : `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return lang === 'ko' ? `${diffHr}시간 전` : `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return lang === 'ko' ? `${diffDay}일 전` : `${diffDay}d ago`;
  };

  const explorerUrl = (chain?: string, hash?: string) => {
    if (!hash) return undefined;
    // 모든 트랜잭션을 Binance Smart Chain 스캔으로 안내
    return `https://bscscan.com/tx/${hash}`;
  };

  const fetchLogs = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setIsFetching(true);
    try {
      const res = await fetch('/api/transfer-logs', {
        cache: 'no-store',
      });
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      const data = await res.json();
      const now = Date.now();
      const incoming: TransferLog[] = Array.isArray(data?.result) ? data.result : [];

      setLogs((prev) => {
        const prevMap = new Map(prev.map((item) => [item.transactionHash, item]));
        return incoming.slice(0, MAX_ITEMS).map((item) => {
          const existing = prevMap.get(item.transactionHash);
          const arrivedAt = existing?.arrivedAt ?? now;
          return { ...item, arrivedAt };
        });
      });

      setLastUpdated(now);
      setError(null);
    } catch (err) {
      setError((err as Error).message || 'Unknown error');
    } finally {
      inFlightRef.current = false;
      setIsFetching(false);
    }
  }, [MAX_ITEMS]);

  useEffect(() => {
    fetchLogs();
    const id = setInterval(fetchLogs, POLL_MS);
    return () => clearInterval(id);
  }, [fetchLogs, POLL_MS]);

  const t = (key: CopyKey) => translations[lang][key];

  const badges = [t('hero.badge1'), t('hero.badge2'), t('hero.badge3')];

  return (
    <div className="oasis-page">
      <header>
        <nav className="nav">
          <div className="brand">
            <div className="logo">OP</div>
            <div>OASIS PASS</div>
          </div>
          <div className="lang-toggle" aria-label="Language selector">
            <button
              type="button"
              onClick={() => setLang('ko')}
              className={lang === 'ko' ? 'active' : ''}
            >
              한국어
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={lang === 'en' ? 'active' : ''}
            >
              English
            </button>
          </div>
        </nav>

        <div className="hero">
          <div>
            <div className="badge-row">
              {badges.map((text) => (
                <div className="badge" key={text}>
                  {text}
                </div>
              ))}
            </div>
            <h1>{t('hero.title')}</h1>
            <p>{t('hero.lead')}</p>
            <div className="cta-row">
              <a className="btn primary" href="#how">
                {t('hero.ctaPrimary')}
              </a>
              <a className="btn secondary" href="mailto:contact@oasispass.io">
                {t('hero.ctaSecondary')}
              </a>
            </div>
          </div>
          <div className="card trust">
            <h3>{t('hero.trustTitle')}</h3>
            <ul>
              <li>{t('hero.trust1')}</li>
              <li>{t('hero.trust2')}</li>
              <li>{t('hero.trust3')}</li>
              <li>{t('hero.trust4')}</li>
            </ul>
          </div>
        </div>
      </header>

      <main>
        <section className="live">
          <div className="live-head">
            <div>
              <div className="pill live-pill">{t('live.badge.live')}</div>
              <h2>{t('live.title')}</h2>
              {t('live.caption') && <p>{t('live.caption')}</p>}
            </div>
            <div className="live-meta">
              <span className={`status-dot ${error ? 'error' : 'ok'}`} aria-hidden />
              <span>{error ? t('live.status.error') : isFetching ? t('live.status.updating') : 'OK'}</span>
              {lastUpdated && (
                <span className="timestamp">
                  {t('live.updated')}{' '}
                  {new Date(lastUpdated).toLocaleTimeString(lang === 'ko' ? 'ko-KR' : 'en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              )}
            </div>
          </div>

          <div className="ticker" role="feed" aria-busy={isFetching}>
            {logs.length === 0 && <div className="empty">{t('live.empty')}</div>}
            {logs.map((log) => {
              const fresh = Date.now() - log.arrivedAt < NEW_HIGHLIGHT_MS;
              const rawFromName = log.from.bankInfo?.accountHolder ?? log.from.nickname ?? log.from.walletAddress;
              const fromHolder = maskName(rawFromName);
              const fromWallet = shorten(log.from.walletAddress, 6, 6);

              const rawToName = log.to.depositName ?? log.to.bankInfo?.accountHolder ?? '—';
              const toHolder = maskName(rawToName);
              const toWallet = log.to.bankInfo?.accountNumber ? shorten(log.to.bankInfo?.accountNumber, 3, 3) : '—';
              const matched = log.to.bankTransferMatched ?? true;
              const explorer = explorerUrl(log.chain, log.transactionHash);

              return (
                <div className={`row ${fresh ? 'fresh' : ''}`} key={log.transactionHash}>
                  <div className="row-left">
                    <ChainBadge chain={log.chain} />
                    {explorer ? (
                      <a className="hash link" href={explorer} target="_blank" rel="noopener noreferrer" title={log.transactionHash}>
                        {t('live.label.hash')}: {shorten(log.transactionHash, 8, 6)}
                      </a>
                    ) : (
                      <div className="hash" title={log.transactionHash}>
                        {t('live.label.hash')}: {shorten(log.transactionHash, 8, 6)}
                      </div>
                    )}
                    <div className="time">
                      {t('live.label.time')}: {formatAgo(log.createdAt)}
                    </div>
                  </div>

                  <div className="row-mid">
                    <div className="party">
                      <div className="label">{t('live.label.from')}</div>
                      <div className="value">{fromHolder}</div>
                      <div className="sub">{fromWallet}</div>
                    </div>
                    <div className="arrow" aria-hidden />
                    <div className="party">
                      <div className="label">{t('live.label.to')}</div>
                      <div className="value">{toHolder}</div>
                      <div className="sub">{toWallet}</div>
                    </div>
                  </div>

                  <div className="row-right">
                    <div className="amount">
                      <span className="amount-value">{formatAmount(log.amount)}</span>
                      <span className="amount-unit">USDT</span>
                    </div>
                    <div className={`match ${matched ? 'ok' : 'pending'}`}>
                      {matched ? t('live.badge.matched') : t('live.badge.pending')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2>{t('about.title')}</h2>
          <p>{t('about.body')}</p>
          <div className="grid">
            <div className="card">
              <h3>{t('about.card1.title')}</h3>
              <p>{t('about.card1.desc')}</p>
            </div>
            <div className="card">
              <h3>{t('about.card2.title')}</h3>
              <p>{t('about.card2.desc')}</p>
            </div>
            <div className="card">
              <h3>{t('about.card3.title')}</h3>
              <p>{t('about.card3.desc')}</p>
            </div>
            <div className="card">
              <h3>{t('about.card4.title')}</h3>
              <p>{t('about.card4.desc')}</p>
            </div>
          </div>
        </section>

        <section id="how">
          <h2>{t('flow.title')}</h2>
          <p>{t('flow.body')}</p>
          <div className="flow">
            <div className="step">
              <div className="num">1</div>
              <p>{t('flow.step1.title')}</p>
              <span>{t('flow.step1.desc')}</span>
            </div>
            <div className="step">
              <div className="num">2</div>
              <p>{t('flow.step2.title')}</p>
              <span>{t('flow.step2.desc')}</span>
            </div>
            <div className="step">
              <div className="num">3</div>
              <p>{t('flow.step3.title')}</p>
              <span>{t('flow.step3.desc')}</span>
            </div>
            <div className="step">
              <div className="num">4</div>
              <p>{t('flow.step4.title')}</p>
              <span>{t('flow.step4.desc')}</span>
            </div>
          </div>
        </section>

        <section>
          <h2>{t('scope.title')}</h2>
          <div className="split">
            <div className="card">
              <h3>{t('scope.do.title')}</h3>
              <ul>
                <li>{t('scope.do.1')}</li>
                <li>{t('scope.do.2')}</li>
                <li>{t('scope.do.3')}</li>
                <li>{t('scope.do.4')}</li>
              </ul>
            </div>
            <div className="card">
              <h3>{t('scope.dont.title')}</h3>
              <ul>
                <li>{t('scope.dont.1')}</li>
                <li>{t('scope.dont.2')}</li>
                <li>{t('scope.dont.3')}</li>
                <li>{t('scope.dont.4')}</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2>{t('use.title')}</h2>
          <div className="grid">
            <div className="card">
              <h3>{t('use.1.title')}</h3>
              <p>{t('use.1.desc')}</p>
            </div>
            <div className="card">
              <h3>{t('use.2.title')}</h3>
              <p>{t('use.2.desc')}</p>
            </div>
            <div className="card">
              <h3>{t('use.3.title')}</h3>
              <p>{t('use.3.desc')}</p>
            </div>
            <div className="card">
              <h3>{t('use.4.title')}</h3>
              <p>{t('use.4.desc')}</p>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="row">
          <div>{t('footer.copy')}</div>
          <div>{t('footer.disclaimer')}</div>
        </div>
      </footer>

      <style jsx global>{`
        .oasis-page {
          --navy: #0f172a;
          --deep: #0b2d45;
          --cyan: #2dd4bf;
          --aqua: #6ee7ff;
          --tether: #26a17b;
          --tether-soft: rgba(38, 161, 123, 0.16);
          --sand: #f3f4f6;
          --card: #0f1829;
          --text: #e5e7eb;
          --muted: #94a3b8;
          --border: #1f2937;
          --shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
          min-height: 100vh;
          background: radial-gradient(circle at 10% 20%, rgba(45, 212, 191, 0.08), transparent 30%),
            radial-gradient(circle at 90% 10%, rgba(110, 231, 255, 0.08), transparent 30%), var(--navy);
          color: var(--text);
          font-family: 'Inter', 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.7;
        }

        .oasis-page a {
          color: inherit;
          text-decoration: none;
        }

        .oasis-page header {
          padding: 28px 20px 96px;
          position: relative;
          overflow: hidden;
        }

        .oasis-page .nav {
          max-width: 1180px;
          margin: 0 auto 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .oasis-page .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
        }

        .oasis-page .brand .logo {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--cyan), var(--aqua));
          display: grid;
          place-items: center;
          color: var(--navy);
          font-weight: 800;
          box-shadow: var(--shadow);
        }

        .oasis-page .lang-toggle {
          display: inline-flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 999px;
          overflow: hidden;
          backdrop-filter: blur(8px);
        }

        .oasis-page .lang-toggle button {
          border: none;
          background: transparent;
          color: var(--text);
          padding: 10px 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .oasis-page .lang-toggle button.active {
          background: linear-gradient(135deg, var(--cyan), var(--aqua));
          color: var(--navy);
          box-shadow: 0 10px 30px rgba(45, 212, 191, 0.4);
        }

        .oasis-page .hero {
          max-width: 1180px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 32px;
          align-items: center;
        }

        .oasis-page .hero h1 {
          font-size: clamp(30px, 4.5vw, 42px);
          margin: 0 0 18px;
          letter-spacing: 0.02em;
          line-height: 1.15;
          white-space: nowrap;
        }

        .oasis-page .hero p {
          margin: 0 0 28px;
          color: var(--muted);
          font-size: 17px;
        }

        @media (max-width: 820px) {
          .oasis-page .hero h1 {
            white-space: normal;
          }
        }

        .oasis-page .badge-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin: 0 0 22px;
        }

        .oasis-page .badge {
          padding: 8px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text);
          background: rgba(255, 255, 255, 0.03);
          font-size: 13px;
        }

        .oasis-page .cta-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .oasis-page .btn {
          padding: 14px 20px;
          border-radius: 12px;
          font-weight: 700;
          border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
        }

        .oasis-page .btn.primary {
          background: linear-gradient(135deg, var(--cyan), var(--aqua));
          color: var(--navy);
          box-shadow: 0 14px 38px rgba(45, 212, 191, 0.45);
        }

        .oasis-page .btn.secondary {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text);
        }

        .oasis-page .btn:hover {
          transform: translateY(-2px);
        }

        .oasis-page main {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0));
          margin-top: -36px;
          border-top-left-radius: 28px;
          border-top-right-radius: 28px;
          padding: 28px 20px 80px;
        }

        .oasis-page section {
          max-width: 1180px;
          margin: 0 auto 64px;
          padding: 32px;
          background: rgba(13, 20, 36, 0.75);
          border: 1px solid var(--border);
          border-radius: 20px;
          box-shadow: var(--shadow);
          backdrop-filter: blur(8px);
        }

        .oasis-page section h2 {
          margin: 0 0 14px;
          font-size: 26px;
          letter-spacing: 0.01em;
        }

        .oasis-page section > p {
          margin: 0 0 26px;
          color: var(--muted);
          font-size: 16px;
        }

        .oasis-page .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }

        .oasis-page .card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px;
          min-height: 160px;
          position: relative;
          overflow: hidden;
        }

        .oasis-page .card h3 {
          margin: 0 0 10px;
          color: var(--aqua);
          font-size: 17px;
        }

        .oasis-page .card p,
        .oasis-page .card li {
          color: var(--muted);
          margin: 0 0 6px;
          font-size: 15px;
        }

        .oasis-page .card ul {
          padding-left: 18px;
          margin: 0;
        }

        .oasis-page .flow {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 14px;
        }

        .oasis-page .step {
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
        }

        .oasis-page .step .num {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--cyan), var(--aqua));
          display: grid;
          place-items: center;
          color: var(--navy);
          font-weight: 800;
          margin-bottom: 10px;
        }

        .oasis-page .step p {
          margin: 0;
          color: var(--text);
          font-weight: 600;
        }

        .oasis-page .step span {
          color: var(--muted);
          font-size: 14px;
          display: block;
        }

        .oasis-page .split {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 18px;
        }

        .oasis-page footer {
          max-width: 1180px;
          margin: 0 auto 60px;
          color: var(--muted);
          font-size: 14px;
          padding: 0 20px;
        }

        .oasis-page footer .row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }

        .oasis-page .trust {
          min-height: 240px;
        }

        .oasis-page .live {
          max-width: 1180px;
          margin: -40px auto 32px;
          padding: 16px;
          background: linear-gradient(135deg, rgba(38, 161, 123, 0.12), rgba(15, 23, 42, 0.8));
          border: 1px solid rgba(38, 161, 123, 0.28);
          border-radius: 14px;
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.16);
        }

        .oasis-page .live-head {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: center;
          margin-bottom: 10px;
        }

        .oasis-page .live h2 {
          margin: 2px 0;
        }

        .oasis-page .live p {
          margin: 0;
          color: var(--muted);
          font-size: 13px;
        }

        .oasis-page .live .pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 999px;
          font-weight: 700;
          letter-spacing: 0.03em;
          font-size: 10px;
          background: var(--tether-soft);
          color: #d8fff0;
          border: 1px solid rgba(38, 161, 123, 0.5);
        }

        .oasis-page .live .live-pill {
          box-shadow: none;
        }

        .oasis-page .live-meta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--muted);
          font-size: 11px;
          background: rgba(38, 161, 123, 0.08);
          padding: 6px 10px;
          border-radius: 10px;
          border: 1px solid rgba(38, 161, 123, 0.25);
        }

        .oasis-page .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--tether);
        }

        .oasis-page .status-dot.error {
          background: #fca5a5;
        }

        .oasis-page .timestamp {
          color: var(--text);
          font-weight: 600;
        }

        .oasis-page .ticker {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .oasis-page .ticker .empty {
          padding: 14px;
          text-align: center;
          color: var(--muted);
          border: 1px dashed rgba(255, 255, 255, 0.16);
          border-radius: 10px;
          font-size: 13px;
        }

        .oasis-page .ticker .row {
          display: grid;
          grid-template-columns: 1fr 1.35fr 0.7fr;
          gap: 10px;
          padding: 12px;
          border-radius: 12px;
          background: rgba(9, 18, 30, 0.68);
          border: 1px solid rgba(38, 161, 123, 0.28);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
          align-items: center;
          position: relative;
          overflow: hidden;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .oasis-page .ticker .row:before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, rgba(38, 161, 123, 0.12), transparent 55%);
          opacity: 0;
          transition: opacity 0.25s ease;
          pointer-events: none;
        }

        .oasis-page .ticker .row.fresh:before {
          opacity: 1;
          animation: sweep 0.8s ease;
        }

        .oasis-page .ticker .row.fresh {
          border-color: rgba(110, 231, 255, 0.4);
          animation: drop-in 0.6s cubic-bezier(0.14, 1.15, 0.4, 1), pulse 1.2s ease;
        }

        .oasis-page .row-left {
          display: grid;
          gap: 4px;
          font-size: 12px;
          color: var(--muted);
        }

        .oasis-page .chain {
          justify-self: start;
          padding: 4px 8px;
          border-radius: 8px;
          background: rgba(38, 161, 123, 0.14);
          color: #e6fff4;
          font-weight: 700;
          border: 1px solid rgba(38, 161, 123, 0.35);
          font-size: 11px;
        }

        .oasis-page .chain.chain-logo {
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: transparent;
          border: none;
        }

        .oasis-page .chain.chain-logo svg {
          width: 18px;
          height: 18px;
          display: block;
        }

        .oasis-page .hash {
          font-weight: 700;
          color: var(--text);
        }

        .oasis-page .hash.link {
          text-decoration: none;
          color: var(--aqua);
        }

        .oasis-page .hash.link:hover {
          text-decoration: underline;
        }

        .oasis-page .time {
          font-size: 12px;
        }

        .oasis-page .row-mid {
          display: grid;
          grid-template-columns: 1fr 20px 1fr;
          gap: 8px;
          align-items: center;
        }

        .oasis-page .party .label {
          font-size: 10px;
          color: var(--muted);
          letter-spacing: 0.02em;
        }

        .oasis-page .party .value {
          font-weight: 700;
          color: var(--text);
        }

        .oasis-page .party .sub {
          color: var(--muted);
          font-size: 11px;
        }

        .oasis-page .arrow {
          width: 22px;
          height: 22px;
          border-radius: 7px;
          border: 1px solid rgba(38, 161, 123, 0.3);
          display: grid;
          place-items: center;
          color: #d8fff0;
          font-weight: 800;
          font-size: 13px;
          background: rgba(38, 161, 123, 0.06);
        }

        .oasis-page .row-right {
          display: grid;
          gap: 4px;
          justify-items: end;
        }

        .oasis-page .amount {
          display: inline-flex;
          align-items: baseline;
          gap: 6px;
          font-weight: 800;
          color: var(--text);
          text-shadow: none;
        }

        .oasis-page .amount-value {
          font-size: 19px;
          letter-spacing: 0.01em;
          color: #26a17b; /* Tether green */
          text-shadow: 0 4px 12px rgba(38, 161, 123, 0.3);
          font-family: 'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace;
        }

        .oasis-page .amount-unit {
          font-size: 11px;
          font-weight: 700;
          color: var(--muted);
          padding: 3px 6px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(255, 255, 255, 0.03);
        }

        .oasis-page .match {
          padding: 5px 8px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 10px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .oasis-page .match.ok {
          background: rgba(38, 161, 123, 0.16);
          color: #d8fff0;
        }

        .oasis-page .match.pending {
          background: rgba(251, 191, 36, 0.12);
          color: #fcd34d;
          border-color: rgba(251, 191, 36, 0.24);
        }

        @keyframes sweep {
          from {
            transform: translateX(-20%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes drop-in {
          0% {
            transform: translateY(-18px) scale(0.98);
            opacity: 0;
          }
          55% {
            transform: translateY(6px) scale(1.02);
            opacity: 1;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 14px 34px rgba(38, 161, 123, 0.32);
          }
          100% {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
          }
        }

        @media (max-width: 920px) {
          .oasis-page .ticker .row {
            grid-template-columns: 1fr;
          }

          .oasis-page .row-mid {
            grid-template-columns: 1fr 28px 1fr;
          }

          .oasis-page .row-right {
            justify-items: start;
          }
        }

        @media (max-width: 640px) {
          .oasis-page .nav {
            flex-direction: column;
            align-items: flex-start;
          }

          .oasis-page .cta-row {
            width: 100%;
          }

          .oasis-page .btn {
            width: 100%;
            text-align: center;
          }

          .oasis-page section {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
}
