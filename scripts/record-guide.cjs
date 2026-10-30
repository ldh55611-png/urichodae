// 메인 화면 제작 가이드 영상 녹화: BASE=https://urichodae.ldh55611.workers.dev node scripts/record-guide.cjs
// 결과 webm 두 개를 ffmpeg로 이어 public/guide/guide.mp4로 만듭니다(PROJECT-NOTES 참고). 실행하면 BASE 사이트에 데모 청첩장이 1건 발행됩니다.
const {chromium}=require('playwright');const fs=require('fs');
// 외부 글꼴이 막힌 환경에서만 로컬 @fontsource 사본으로 대신합니다.
const LOCAL_FONTS=!!process.env.LOCAL_FONTS;const OUT=process.env.OUT||'guide-rec';const FONT='/home/claude/fonts/node_modules/@fontsource/';
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:760},recordVideo:{dir:''+OUT+'/vid',size:{width:1280,height:760}}});const p=await ctx.newPage();
if(LOCAL_FONTS)await p.route(/fonts\.googleapis\.com/,r=>r.fulfill({contentType:'text/css',body:fs.readFileSync('/home/claude/fonts/all.css','utf8')}));
if(LOCAL_FONTS)await p.route(/fonts\.gstatic\.com\/fs\//,r=>{const m=r.request().url().match(/fs\/([^/]+)\/files\/(.+)$/);try{r.fulfill({body:fs.readFileSync(FONT+m[1]+'/files/'+m[2])})}catch{r.abort()}});
const cap=async(t)=>{await p.evaluate(t=>{let c=document.getElementById('guide-cap');if(!c){c=document.createElement('div');c.id='guide-cap';c.style.cssText='position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:99;background:#3f4a3bee;color:#fff;font:600 19px "Noto Sans KR",sans-serif;padding:13px 26px;border-radius:30px;box-shadow:0 8px 25px #0003;pointer-events:none;white-space:nowrap';document.body.appendChild(c)}c.textContent=t},t);await p.waitForTimeout(2600)};
const w=ms=>p.waitForTimeout(Math.round(ms*1.8));
await p.goto((process.env.BASE||'http://127.0.0.1:8799')+'/');await w(800);
await p.click('dialog.beta-notice button.primary');await w(500);
await cap('① 메인에서 ‘청첩장 만들기’를 누르세요');
await p.getByRole('button',{name:/청첩장 만들기/}).first().click();await p.waitForSelector('#sec-opening');await w(900);
await cap('② 스타일과 색상을 고르세요');
await p.locator('.style-options button',{hasText:'순백'}).click();await w(700);
await p.locator('.style-options button',{hasText:'로맨틱'}).click();await w(700);
await p.locator('.color-options button').nth(1).click();await w(900);
await p.locator('.editor-nav button',{hasText:'오프닝'}).first().click();await w(700);
await cap('③ 오프닝(표지) 글자를 넣으면 바로 보여요');
await p.locator('#sec-opening input[placeholder="M & S"]').click();await p.keyboard.type('M ♥ S',{delay:200});await w(1400);
await cap('④ 이름·날짜·문구를 입력하면 미리보기가 따라와요');
const info=p.locator('#sec-info');
await info.locator('input').nth(1).click();await p.keyboard.type('김민준 · 이서연',{delay:150});await w(500);
await info.locator('input[type=datetime-local]').fill('2027-05-22T13:00');await w(700);
await info.locator('textarea').first().click();await p.keyboard.press('End');await p.keyboard.type('\n함께해 주시면 큰 기쁨이겠습니다.',{delay:110});await w(1000);
await cap('⑤ 사진을 올리세요 (메인 세로 3:4 권장)');
await p.getByRole('button',{name:'사진',exact:true}).click();await w(700);
const [fc]=await Promise.all([p.waitForEvent('filechooser'),p.locator('#sec-photos .upload-zone').first().click()]);await fc.setFiles([''+__dirname+'/../public/photos/couple.jpg',''+__dirname+'/../public/photos/wedding.jpg']);
await p.waitForSelector('#sec-photos .photo-tile');await w(1600);
const [fc2]=await Promise.all([p.waitForEvent('filechooser'),p.locator('#sec-photos .upload-zone').nth(1).click()]);await fc2.setFiles([''+__dirname+'/../public/photos/flowers.jpg',''+__dirname+'/../public/photos/couple.jpg',''+__dirname+'/../public/photos/wedding.jpg']);
await w(2200);
await cap('⑥ 예식장과 주소를 넣으면 지도가 생겨요');
await p.locator('#sec-location input').nth(0).click();await p.keyboard.type('가든 웨딩홀',{delay:140});
await p.locator('#sec-location input').nth(2).click();await p.keyboard.type(process.env.ADDRESS||'서울특별시 중구 세종대로 110',{delay:110});await w(3500);
await cap('⑦ 참석 여부·방명록도 스위치 하나로');
await p.locator('#sec-rsvp input[type=checkbox]').first().check();await w(1400);
await cap('⑧ ‘무료로 발행하기’를 누르면 끝! (자동 저장돼요)');
await p.getByRole('button',{name:/무료로 발행하기/}).first().click();await p.waitForSelector('.link-dialog .success-icon',{timeout:20000});await w(2600);
const link=await p.locator('.link-dialog input').inputValue();await p.evaluate(()=>{const i=document.querySelector('.link-dialog input');i.value='https://urichodae.com/i/10dbe5ba-5598-44d7'});
await cap('완성! 주소를 복사해서 카톡으로 보내세요');await w(1200);
await ctx.close();console.log('link',link);
// mobile view of result
const ctx2=await b.newContext({viewport:{width:390,height:760},deviceScaleFactor:1,recordVideo:{dir:''+OUT+'/vid2',size:{width:390,height:760}}});const m=await ctx2.newPage();
if(LOCAL_FONTS)await m.route(/fonts\.googleapis\.com/,r=>r.fulfill({contentType:'text/css',body:fs.readFileSync('/home/claude/fonts/all.css','utf8')}));
if(LOCAL_FONTS)await m.route(/fonts\.gstatic\.com\/fs\//,r=>{const x=r.request().url().match(/fs\/([^/]+)\/files\/(.+)$/);try{r.fulfill({body:fs.readFileSync(FONT+x[1]+'/files/'+x[2])})}catch{r.abort()}});
await m.goto(link);await m.waitForTimeout(1800);await m.locator('.invite-opening button').click();await m.waitForTimeout(1000);
for(let i=0;i<16;i++){await m.mouse.wheel(0,380);await m.waitForTimeout(900)}
await m.waitForTimeout(600);await ctx2.close();await b.close()})().catch(e=>{console.error(e);process.exit(1)});
