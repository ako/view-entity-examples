# Experiment, on a scratch copy of ako/TestApp: give an mxcli-created association
# the Source that Studio Pro gives one, and see whether mxbuild then accepts it.
#
# Studio Pro writes, for a view entity that selects a persistent entity's id:
#
#   DomainModels$CrossAssociation
#     Name:   persistent_order
#     Source: DomainModels$OqlViewAssociationSource { Reference: "persistent_order" }
#
# mxcli writes the same CrossAssociation with Source: null, and mxbuild refuses it
# ("It is not possible to create associations to/from View Entities"). This adds
# the one missing subdocument, and nothing else. It does not touch the .mpr.
import struct, sys, secrets

PATH, ALIAS = sys.argv[1], sys.argv[2]
b = bytearray(open(PATH, 'rb').read())
spans = []                                   # (start, end) of every BSON document


def rd_cstr(i):
    j = b.index(b'\x00', i)
    return b[i:j], j + 1


def walk(i):
    size = struct.unpack_from('<i', b, i)[0]
    start, end = i, i + size
    spans.append((start, end))
    i += 4
    while i < end - 1:
        t = b[i]; i += 1
        _, i = rd_cstr(i)
        i = val(i, t)
    return end


def val(i, t):
    if t == 0x01: return i + 8
    if t == 0x02: return i + 4 + struct.unpack_from('<i', b, i)[0]
    if t in (0x03, 0x04): return walk(i)
    if t == 0x05: return i + 5 + struct.unpack_from('<i', b, i)[0]
    if t == 0x07: return i + 12
    if t == 0x08: return i + 1
    if t == 0x09: return i + 8
    if t == 0x0A: return i
    if t == 0x10: return i + 4
    if t == 0x12: return i + 8
    raise ValueError(f'unhandled BSON type {t:#x} at {i}')


walk(0)

name_field = b'\x02Name\x00' + struct.pack('<i', len(ALIAS) + 1) + ALIAS.encode() + b'\x00'
at = b.find(name_field)
assert at >= 0, f'no element named {ALIAS}'
src = b.find(b'\x0aSource\x00', at)
assert src >= 0, 'no null Source field after that name'


def cstr(s):
    return s.encode() + b'\x00'


def strf(name, s):
    v = s.encode() + b'\x00'
    return b'\x02' + cstr(name) + struct.pack('<i', len(v)) + v


body = b'\x05' + cstr('$ID') + struct.pack('<i', 16) + b'\x00' + secrets.token_bytes(16)
body += strf('$Type', 'DomainModels$OqlViewAssociationSource')
body += strf('Reference', ALIAS)
doc = struct.pack('<i', len(body) + 5) + body + b'\x00'

old = b'\x0aSource\x00'
new = b'\x03' + cstr('Source') + doc
delta = len(new) - len(old)

out = bytearray(b[:src] + new + b[src + len(old):])
for start, end in spans:                     # every enclosing document grows
    if start <= src < end:
        size = struct.unpack_from('<i', out, start)[0]
        struct.pack_into('<i', out, start, size + delta)

open(PATH, 'wb').write(out)
print(f'{ALIAS}: added OqlViewAssociationSource, +{delta} bytes, '
      f'{sum(1 for s, e in spans if s <= src < e)} enclosing documents resized')
