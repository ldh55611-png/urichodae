// 메인 화면에서 세는 행동 이름: 만들기 누름, 안내창에서 바로 만들기, 안내창 닫고 둘러보기, 샘플 크게 보기, 안내 영상 재생
// 편집 화면: 발행 누름, 발행 눌렀는데 빈 칸이 있어 안내함, 카톡으로 이어하기 링크 받음, 이어하기 링크로 돌아옴
export const ACTIONS=['start','notice_start','notice_browse','sample','video','publish_click','publish_missing','resume_send','resume_back'] as const;
export type Action=typeof ACTIONS[number];
