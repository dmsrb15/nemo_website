import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / '.tools/logo-python'))
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
font = TTFont('C:/Users/dmsrb/AppData/Local/Microsoft/Windows/Fonts/Pretendard-Black.otf')
glyphs, cmap = font.getGlyphSet(), font.getBestCmap()
scale = 54 / font['head'].unitsPerEm
x, paths = 0, []
for char in 'NEMO':
 name = cmap[ord(char)]
 pen = SVGPathPen(glyphs); glyphs[name].draw(pen)
 paths.append(f'<path id="letter-{char}" transform="translate({x:.5f},43.8) scale({scale:.8f},-{scale:.8f})" d="{pen.getCommands()}"/>')
 x += font['hmtx'].metrics[name][0] * scale - 4
svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{x+14:.5f}" height="54" viewBox="0 0 {x+14:.5f} 54"><g fill="#20211f">'+''.join(paths)+f'</g><rect x="{x+5:.5f}" y="38" width="9" height="9" fill="#feeb8f"/></svg>'
out = Path(__file__).resolve().parents[1] / 'dist/assets/nemo-logo.svg'
out.write_text(svg, encoding='utf-8')
print(svg)
