# Every narration line of a deck -> one wav each, in a single process. The model
# is ~325 MB and takes seconds to load, so loading it per line would dominate
# the build. Job list on stdin: [{"text": ..., "out": ...}, ...]
import os, sys, json, soundfile as sf
from kokoro_onnx import Kokoro

# The container bakes the model in at a fixed path; a laptop does not.
HOME = os.environ.get('KOKORO_HOME', '/opt/kokoro')
MODEL = os.environ.get('KOKORO_MODEL', os.path.join(HOME, 'kokoro-v1.0.onnx'))
VOICES = os.environ.get('KOKORO_VOICES', os.path.join(HOME, 'voices-v1.0.bin'))

voice, speed = sys.argv[1], float(sys.argv[2])
jobs = json.load(sys.stdin)
k = Kokoro(MODEL, VOICES)
for j in jobs:
    samples, sr = k.create(j['text'], voice=voice, speed=speed, lang='en-gb')
    sf.write(j['out'], samples, sr)
    print(j['out'], flush=True)
