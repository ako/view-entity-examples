#!/bin/sh
# A spacious, low bed - two sustained partials a fifth apart with a slow
# amplitude drift, lowpassed so nothing competes with the voice. Rendered once
# as a 90s loop; assemble.js cuts a segment per scene and sets the level there.
set -e
ffmpeg -y -hide_banner -loglevel error \
  -f lavfi -i "sine=frequency=110:duration=90:sample_rate=48000" \
  -f lavfi -i "sine=frequency=164.8:duration=90:sample_rate=48000" \
  -f lavfi -i "sine=frequency=220:duration=90:sample_rate=48000" \
  -filter_complex "\
    [0:a]volume=0.55,tremolo=f=0.11:d=0.30[a];\
    [1:a]volume=0.30,tremolo=f=0.13:d=0.36[b];\
    [2:a]volume=0.10,tremolo=f=0.17:d=0.45[c];\
    [a][b][c]amix=inputs=3:normalize=0,\
    lowpass=f=520,highpass=f=60,aformat=channel_layouts=stereo,\
    afade=t=in:st=0:d=6,afade=t=out:st=84:d=6,\
    loudnorm=I=-32:TP=-9:LRA=7" \
  -ar 48000 -ac 2 audio/bed.wav
ffmpeg -hide_banner -i audio/bed.wav -af loudnorm=I=-32:TP=-9:print_format=json -f null - 2>&1 \
  | grep -E '"output_i"|"output_tp"'
