// 방문자가 어디서 들어왔는지 나누는 이름과 관리자 화면에 보일 한글 이름
export const SOURCES=['meta_ad','meta','naver_blog','naver','google','kakao','daum','threads','invite','direct','other'] as const;
export type Source=typeof SOURCES[number];
export const SOURCE_LABEL:Record<Source,string>={meta_ad:'메타 광고',meta:'인스타·페북(광고 아님)',naver_blog:'네이버 블로그',naver:'네이버 검색',google:'구글',kakao:'카카오톡',daum:'다음',threads:'스레드',invite:'남의 초대장 보고 들어옴',direct:'주소 직접 입력·즐겨찾기',other:'기타 사이트'};
