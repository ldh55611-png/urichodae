// 메인 화면에서 세는 행동 이름: 만들기 누름, 안내창에서 바로 만들기, 안내창 닫고 둘러보기, 샘플 크게 보기, 안내 영상 재생
// 편집 화면: 발행 누름, 발행 눌렀는데 빈 칸이 있어 안내함, 카톡으로 이어하기 링크 받음, 이어하기 링크로 돌아옴
// 종류별 만들기 누름: 청첩장 wedding_start, 돌잔치 baby_start (커플·파티는 아래 이름 그대로)
// 들어온 경로(하루 1번): src_메타광고 등. 이름은 source-names.ts
// 커플청첩장: 만들기 누름(메인·청첩장 하단 '우리도 만들기'), 하객이 '승낙' 누름
export const ACTIONS=['start','notice_start','notice_browse','sample','video','publish_click','publish_missing','resume_send','resume_back','made','make_fail','couple_start','couple_yes','party_start','party_going','wedding_start','baby_start','src_meta_ad','src_meta','src_naver_blog','src_naver','src_google','src_kakao','src_daum','src_threads','src_invite','src_direct','src_other'] as const;
export type Action=typeof ACTIONS[number];
