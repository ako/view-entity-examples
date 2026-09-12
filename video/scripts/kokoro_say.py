# Every narration line of a deck -> one wav each, in a single process. The model
# is ~325 MB and takes seconds to load, so loading it per line would dominate
# the build. Job list on stdin: [{"text": ..., "out": ...}, ...]
import sys, json, soundfile as sf
from kokoro_onnx import Kokoro

voice, speed = sys.argv[1], float(sys.argv[2])
jobs = json.load(sys.stdin)
k = Kokoro('/opt/kokoro/kokoro-v1.0.onnx', '/opt/kokoro/voices-v1.0.bin')
for j in jobs:
    samples, sr = k.create(j['text'], voice=voice, speed=speed, lang='en-gb')
    sf.write(j['out'], samples, sr)
    print(j['out'], flush=True)
