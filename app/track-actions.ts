// 메인 화면에서 세는 행동 이름: 만들기 누름, 안내창에서 바로 만들기, 안내창 닫고 둘러보기, 샘플 크게 보기, 안내 영상 재생
export const ACTIONS=['start','notice_start','notice_browse','sample','video'] as const;
export type Action=typeof ACTIONS[number];
