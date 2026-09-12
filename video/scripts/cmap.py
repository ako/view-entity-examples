# The banned glyph set is a property of the file we ship, so derive it from the
# file. Re-run after changing the font.
from fontTools.ttLib import TTFont
import json, sys
cm = sorted(set(TTFont('fonts/Recursive_VF.woff2').getBestCmap()))
json.dump(cm, open('fonts/cmap.json', 'w'))
print(f'{len(cm)} code points -> fonts/cmap.json')
