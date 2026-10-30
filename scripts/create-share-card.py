from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

root = Path(__file__).resolve().parents[1]
im = Image.new('RGB', (1200, 630), '#f7f2ea')
d = ImageDraw.Draw(im)
regular = 'C:/Windows/Fonts/malgun.ttf'
bold = 'C:/Windows/Fonts/malgunbd.ttf'
def label(x,y,text,size,color='#493b33',strong=False):
    d.text((x,y),text,font=ImageFont.truetype(bold if strong else regular,size),fill=color)
d.rounded_rectangle((30,30,1170,600),radius=24,outline='#d7c5b1',width=2)
label(78,76,'U R I C H O D A E',19,'#937c64')
label(72,156,'우리의 초대',70,strong=True)
label(78,268,'소중한 날을, 우리답게',31)
label(78,330,'모바일 청첩장 · 돌잔치 초대장',23,'#847568')
d.rounded_rectangle((78,437,391,488),radius=25,fill='#e9dfd2')
label(100,445,'무료 베타 · 로그인 없이 시작',19)
label(79,536,'urichodae.com',19,'#937c64')
# Original envelope illustration, kept within common preview crops.
d.ellipse((825,104,1095,374),fill='#eee3d6')
d.rounded_rectangle((793,196,1070,423),radius=12,fill='#fffdf9',outline='#c9b59f',width=2)
d.line([(820,245),(1040,245)],fill='#ded2c3',width=2)
d.line([(850,271),(1010,271)],fill='#ded2c3',width=2)
d.polygon([(757,307),(1095,307),(1095,503),(757,503)],fill='#e6d5c0',outline='#bba58b',width=2)
d.polygon([(757,307),(926,427),(1095,307)],fill='#f0e5d7',outline='#bba58b',width=2)
d.line([(757,503),(875,407)],fill='#bba58b',width=2)
d.line([(1095,503),(977,407)],fill='#bba58b',width=2)
d.ellipse((900,392,952,444),fill='#a47b66')
d.ellipse((916,407,926,417),fill='#f8eee1')
d.ellipse((926,407,936,417),fill='#f8eee1')
d.polygon([(916,413),(936,413),(926,426)],fill='#f8eee1')
im.save(root/'public'/'og-brand-v1.png', optimize=True)
