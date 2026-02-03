const toPond = (v) => {
  if (v === 0) return -2;
  if (v === 0.5) return -1;
  if (v === 1) return 0;
  return v;
};

export const calcPuntuacion = (r) => {
  const ch = Number(r['or-ch']) || 0;
  const vol = Number(r['or-vol']) || 0;
  const chPond = toPond(ch);
  const volPond = toPond(vol);
  const mlk = Number(r['or-mlk']) || 0;
  const spv = Number(r['or-spv']) || 0;
  const mp = r['or-mp'] === 'no' || r['or-mp'] == null ? -1 : Number(r['or-mp']) || 0;
  const dol = Number(r['dol']) || 0;
  const score = chPond + volPond - 0.2 * mlk + 0.2 * spv - 2 * mp - dol;
  return Math.round(score * 10) / 10;
};

export const hasIngesta = (r) => r.ingesta && String(r.ingesta).trim() !== '';
