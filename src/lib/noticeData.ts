export type NoticeItem = {
  id: string;
  title: string;
  date: string;
  summary: string;
  content: string[];
};

export const NOTICE_ITEMS: NoticeItem[] = [
  {
    id: '2026-01-20-escrow-update',
    title: '에스크로 안전성 고도화 안내',
    date: '2026-01-20',
    summary: '에스크로 보관·정산 절차를 개선하여 거래 안정성을 강화했습니다.',
    content: [
      '에스크로 보관 단계의 검증 로직을 강화했습니다.',
      '정산 처리 과정에서 이중 확인 절차가 추가되었습니다.',
      '문제 발생 시 고객지원 대응 시간이 단축됩니다.',
    ],
  },
  {
    id: '2026-01-15-partner-banner',
    title: '제휴 배너 노출 정책 변경',
    date: '2026-01-15',
    summary: '플레이스먼트 기준으로 배너 노출이 세분화됩니다.',
    content: [
      'P2P 홈, 구매자 가이드, 판매자 가이드에 각각 배너를 설정할 수 있습니다.',
      '배너 관리 페이지에서 플레이스먼트를 선택해 등록하세요.',
      '정렬 순서(order) 값이 낮을수록 먼저 노출됩니다.',
    ],
  },
  {
    id: '2026-01-08-chat-policy',
    title: '채팅 알림 정책 안내',
    date: '2026-01-08',
    summary: '새 메시지가 있을 때만 채팅 창이 자동으로 열립니다.',
    content: [
      '초기 접속 시 채팅 창은 닫힌 상태로 시작합니다.',
      '미읽음 메시지가 새로 도착하면 자동으로 채팅이 열립니다.',
      '필요 시 채팅 창을 수동으로 열고 닫을 수 있습니다.',
    ],
  },
];
