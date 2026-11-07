/** نغمة تنبيه بسيطة بدون ملفات صوت. المتصفح بيسمح بيها بعد أول ضغطة من المستخدم (تسجيل الدخول). */
export function beep(): void {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.setValueAtTime(1175, ctx.currentTime + 0.15);
    g.gain.value = 0.15;
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + 0.35);
    setTimeout(() => ctx.close(), 600);
  } catch { /* مش مشكلة لو الصوت مش متاح */ }
}
