/* ============================================================
   사주 명식 엔진 — 궁성론 해석용 계산층
   검증 출처:
     · solarLongitude / monthBranch / 연월일시주  ← saju-today (self-test 13/13)
     · 일주 앵커 1900-01-01 = 甲戌(60갑자 idx 10)  ← 天文 JDN 대조 검증본
     · tenGod(편/정 10종)                          ← saju-personal, 단 지지 음양을 本氣 기준으로 교정
   해석은 하지 않는다. 숫자와 배치만 낸다.
   ============================================================ */
(function (root) {
  'use strict';

  // ---------- 기본 테이블 ----------
  var STEM_C = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  var STEM_K = ['갑','을','병','정','무','기','경','신','임','계'];
  var BR_C   = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  var BR_K   = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
  var ZODIAC = ['쥐','소','호랑이','토끼','용','뱀','말','양','원숭이','닭','개','돼지'];

  var EL_K   = ['목','화','토','금','수'];
  var EL_FULL= ['나무(목)','불(화)','흙(토)','쇠(금)','물(수)'];
  var STEM_EL = [0,0,1,1,2,2,3,3,4,4];
  var BR_EL   = [4,2,0,0,2,1,1,2,3,3,2,4];

  // 지장간: [천간idx, 일수] … 배열 마지막이 정기(正氣)
  // 출처 표기: 궁성론 문서의 辰 = 乙9·癸3·戊18 표기와 동일 계열
  var HIDDEN = {
    0:  [[8,10],[9,20]],                 // 子 壬10 癸20
    1:  [[9,9],[7,3],[5,18]],            // 丑 癸9 辛3 己18
    2:  [[4,7],[2,7],[0,16]],            // 寅 戊7 丙7 甲16
    3:  [[0,10],[1,20]],                 // 卯 甲10 乙20
    4:  [[1,9],[9,3],[4,18]],            // 辰 乙9 癸3 戊18
    5:  [[4,7],[6,7],[2,16]],            // 巳 戊7 庚7 丙16
    6:  [[2,10],[5,9],[3,11]],           // 午 丙10 己9 丁11
    7:  [[3,9],[1,3],[5,18]],            // 未 丁9 乙3 己18
    8:  [[4,7],[8,7],[6,16]],            // 申 戊7 壬7 庚16
    9:  [[6,10],[7,20]],                 // 酉 庚10 辛20
    10: [[7,9],[3,3],[4,18]],            // 戌 辛9 丁3 戊18
    11: [[4,7],[0,7],[8,16]]             // 亥 戊7 甲7 壬16
  };
  function jeonggi(b) { var h = HIDDEN[b]; return h[h.length - 1][0]; }

  var TENGOD = ['비견','겁재','식신','상관','편재','정재','편관','정관','편인','정인'];
  var GROUP_OF = [0,0,1,1,2,2,3,3,4,4];
  var GROUP_K  = ['비겁','식상','재성','관성','인성'];
  var GROUP_PLAIN = ['버티는 힘','내보내는 힘','쓰는 힘','붙잡는 틀','받아들이는 힘'];

  var STAGES = ['장생','목욕','관대','건록','제왕','쇠','병','사','묘','절','태','양'];
  var JANGSAENG = [11,6,2,9,2,9,5,0,8,3];   // 천간별 장생 지지

  // ---------- 절기 · 사주 (검증본 이식) ----------
  function solarLongitude(y, m, d, hour, minute) {
    hour = (hour == null) ? 12 : hour; minute = minute || 0;
    var a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3;
    var JDN = d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4)
            - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
    var JD = JDN + (hour + minute / 60 - 21) / 24;
    var T = (JD - 2451545.0) / 36525, rad = Math.PI / 180;
    var L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    var M  = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    var Mr = (((M % 360) + 360) % 360) * rad;
    var C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * Mr)
          + 0.000289 * Math.sin(3 * Mr);
    var Om = 125.04 - 1934.136 * T;
    var lam = (L0 + C) - 0.00569 - 0.00478 * Math.sin(Om * rad);
    return ((lam % 360) + 360) % 360;
  }
  function monthBranchFromLon(lam) { return (2 + Math.floor((((lam - 315) % 360 + 360) % 360) / 30)) % 12; }
  function yearPillar(y, m, lam)  { var yr = y; if (m <= 2 && lam < 315) yr = y - 1;
                                    var i = ((yr - 4) % 60 + 60) % 60; return { s: i % 10, b: i % 12 }; }
  function monthPillar(lam, ys)   { var b = monthBranchFromLon(lam), f = ((ys % 5) * 2 + 2) % 10;
                                    return { s: (f + (b - 2 + 12) % 12) % 10, b: b }; }
  function dayPillar(y, m, d)     { var n = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1900, 0, 1)) / 86400000);
                                    var i = ((10 + n) % 60 + 60) % 60; return { s: i % 10, b: i % 12 }; }
  function hourPillar(h, ds)      { var b = (h === 23) ? 0 : Math.floor((h + 1) / 2);
                                    return { s: (((ds % 5) * 2) % 10 + b) % 10, b: b }; }

  function computeSaju(y, m, d, h, mi) {
    var lam = solarLongitude(y, m, d, h, mi);
    var yp = yearPillar(y, m, lam);
    var mp = monthPillar(lam, yp.s);
    var dp = dayPillar(y, m, d);
    var hp = (h == null) ? null : hourPillar(h, dp.s);
    return { year: yp, month: mp, day: dp, hour: hp, lambda: lam };
  }

  // ---------- 십성 (지지는 本氣 음양 기준) ----------
  function tenGodBy(dm, el, pol) {
    var dmEl = STEM_EL[dm], same = (dm % 2) === pol, g;
    if (el === dmEl) g = 0;
    else if ((dmEl + 1) % 5 === el) g = 1;
    else if ((dmEl + 2) % 5 === el) g = 2;
    else if ((dmEl + 3) % 5 === el) g = 3;
    else g = 4;
    return g * 2 + (same ? 0 : 1);
  }
  function stemTenGod(dm, s) { return tenGodBy(dm, STEM_EL[s], s % 2); }
  function branchTenGod(dm, b) { var jg = jeonggi(b); return tenGodBy(dm, STEM_EL[jg], jg % 2); }

  // ---------- 십이운성 · 공망 ----------
  function twelveStage(stem, br) {
    var start = JANGSAENG[stem], dir = (stem % 2 === 0) ? 1 : -1;
    return STAGES[((br - start) * dir % 12 + 12) % 12];
  }
  function gongmang(ds, db) {
    var idx = -1, i;
    for (i = 0; i < 60; i++) if (i % 10 === ds && i % 12 === db) { idx = i; break; }
    var head = idx - (idx % 10), hb = head % 12;
    return [(hb + 10) % 12, (hb + 11) % 12];
  }

  // ---------- 형충회합 ----------
  var SIXHAP_EL = { 0: 2, 2: 0, 3: 1, 4: 3, 5: 4, 6: 1 };  // key=min(a,b)
  var SAMHAP = [ { b: [8, 0, 4], el: 4, nm: '수국(水局)' }, { b: [2, 6, 10], el: 1, nm: '화국(火局)' },
                 { b: [5, 9, 1], el: 3, nm: '금국(金局)' }, { b: [11, 3, 7], el: 0, nm: '목국(木局)' } ];
  var BANGHAP = [ { b: [2, 3, 4], el: 0, nm: '목방(木方)' }, { b: [5, 6, 7], el: 1, nm: '화방(火方)' },
                  { b: [8, 9, 10], el: 3, nm: '금방(金方)' }, { b: [11, 0, 1], el: 4, nm: '수방(水方)' } ];
  var PA  = [[0,9],[6,3],[8,5],[2,11],[4,1],[10,7]];
  var HAE = [[0,7],[1,6],[2,5],[3,4],[8,11],[9,10]];
  // 원진(怨嗔) · 귀문(鬼門) — 네 쌍이 겹친다(丑午·卯申·辰亥·巳戌). 겹치면 한 줄로 낸다.
  var WONJIN = [[0,7],[1,6],[2,9],[3,8],[4,11],[5,10]];
  var GWIMUN = [[0,9],[1,6],[2,7],[3,8],[4,11],[5,10]];
  function inPairs(tbl, a, b) {
    for (var z = 0; z < tbl.length; z++)
      if ((tbl[z][0] === a && tbl[z][1] === b) || (tbl[z][0] === b && tbl[z][1] === a)) return true;
    return false;
  }
  var STEMHAP_EL = { 0: 2, 1: 3, 2: 4, 3: 0, 4: 1 };       // key=min(a,b)%5 → 합화 오행

  function relations(pillars) {
    var out = [], i, j, k, P = pillars;
    function nm(i2) { return P[i2].label; }
    for (i = 0; i < P.length; i++) for (j = i + 1; j < P.length; j++) {
      var a = P[i].b, b = P[j].b, lo = Math.min(a, b), hi = Math.max(a, b);
      if (hi - lo === 6) out.push({ t: '충', k: BR_C[a] + BR_C[b] + '충', w: nm(i) + '·' + nm(j) });
      if ((a + b) % 12 === 1 && SIXHAP_EL[lo] !== undefined)
        out.push({ t: '육합', k: BR_C[a] + BR_C[b] + '합', el: SIXHAP_EL[lo], w: nm(i) + '·' + nm(j) });
      if (a === b && (a === 4 || a === 6 || a === 9 || a === 11))
        out.push({ t: '자형', k: BR_C[a] + BR_C[b] + ' 자형', w: nm(i) + '·' + nm(j) });
      if ((lo === 0 && hi === 3)) out.push({ t: '형', k: '子卯 상형', w: nm(i) + '·' + nm(j) });
      for (k = 0; k < PA.length; k++)  if ((PA[k][0]===a&&PA[k][1]===b)||(PA[k][0]===b&&PA[k][1]===a))
        out.push({ t: '파', k: BR_C[a] + BR_C[b] + '파', w: nm(i) + '·' + nm(j) });
      for (k = 0; k < HAE.length; k++) if ((HAE[k][0]===a&&HAE[k][1]===b)||(HAE[k][0]===b&&HAE[k][1]===a))
        out.push({ t: '해', k: BR_C[a] + BR_C[b] + '해', w: nm(i) + '·' + nm(j) });
      var wj = inPairs(WONJIN, a, b), gw = inPairs(GWIMUN, a, b);
      if (wj || gw) out.push({ t: wj && gw ? '원진·귀문' : (wj ? '원진' : '귀문'),
        k: BR_C[a] + BR_C[b] + ' ' + (wj && gw ? '원진·귀문' : (wj ? '원진' : '귀문')), w: nm(i) + '·' + nm(j) });
    }
    var bs = P.map(function (p) { return p.b; });
    [[2,5,8],[1,10,7]].forEach(function (tri) {
      var hit = tri.filter(function (x) { return bs.indexOf(x) >= 0; });
      if (hit.length === 3) out.push({ t: '삼형', k: hit.map(function(x){return BR_C[x];}).join('') + ' 삼형', w: '지지 전체' });
    });
    SAMHAP.concat(BANGHAP).forEach(function (g) {
      var hit = g.b.filter(function (x) { return bs.indexOf(x) >= 0; });
      if (hit.length === 3) out.push({ t: g.nm.indexOf('방') > 0 ? '방합' : '삼합', k: g.nm + ' 성립', el: g.el, w: '지지 전체' });
      else if (hit.length === 2 && hit.indexOf(g.b[1]) >= 0 && g.nm.indexOf('방') < 0)
        out.push({ t: '반합', k: hit.map(function(x){return BR_C[x];}).join('') + ' 반합', el: g.el, w: '왕지 포함' });
    });
    for (i = 0; i < P.length; i++) for (j = i + 1; j < P.length; j++) {
      var s1 = P[i].s, s2 = P[j].s, df = Math.abs(s1 - s2);
      if (df === 5) out.push({ t: '천간합', k: STEM_C[s1] + STEM_C[s2] + '합', el: STEMHAP_EL[Math.min(s1, s2) % 5], w: nm(i) + '·' + nm(j) });
      if (df === 6 && Math.min(s1, s2) !== 4) out.push({ t: '천간충', k: STEM_C[s1] + STEM_C[s2] + '충', w: nm(i) + '·' + nm(j) });
    }
    return out;
  }

  // ---------- 오행 세력 ----------
  function elementPower(pillars) {
    var surf = [0,0,0,0,0], deep = [0,0,0,0,0], cnt = [0,0,0,0,0], i;
    for (i = 0; i < pillars.length; i++) {
      var p = pillars[i];
      surf[STEM_EL[p.s]] += 1; cnt[STEM_EL[p.s]] += 1;
      surf[BR_EL[p.b]]   += 1; cnt[BR_EL[p.b]]   += 1;
      HIDDEN[p.b].forEach(function (h) { deep[STEM_EL[h[0]]] += h[1] / 30; });
    }
    var w = [3.0, 2.0, 1.0, 1.0];   // 월지 > 일지 > 연 > 시 (자리 가중)
    var wt = [0,0,0,0,0];
    var order = { '월': 0, '일': 1, '연': 2, '시': 3 };
    for (i = 0; i < pillars.length; i++) {
      var q = pillars[i], ww = w[order[q.label]] || 1;
      wt[STEM_EL[q.s]] += ww * 0.6;
      wt[BR_EL[q.b]]   += ww * 1.0;
    }
    return { count: cnt, surface: surf, hidden: deep, weighted: wt };
  }

  // ---------- 신강 / 신약 ----------
  function strength(s) {
    var dm = s.day.s, self = 0, other = 0, detail = [];
    function add(g, w, where) {
      if (g === 0 || g === 4) { self += w; detail.push(['+', where, GROUP_K[g], w]); }
      else { other += w; detail.push(['-', where, GROUP_K[g], w]); }
    }
    add(GROUP_OF[branchTenGod(dm, s.month.b)], 3.0, '월지');
    add(GROUP_OF[branchTenGod(dm, s.day.b)],   2.0, '일지');
    add(GROUP_OF[stemTenGod(dm, s.month.s)],   1.5, '월간');
    add(GROUP_OF[stemTenGod(dm, s.year.s)],    1.0, '연간');
    add(GROUP_OF[branchTenGod(dm, s.year.b)],  1.0, '연지');
    if (s.hour) { add(GROUP_OF[stemTenGod(dm, s.hour.s)], 1.0, '시간');
                  add(GROUP_OF[branchTenGod(dm, s.hour.b)], 1.0, '시지'); }
    var sc = Math.round(1000 * self / (self + other)) / 10;
    var cat = sc >= 58 ? '신강' : (sc <= 42 ? '신약' : '중화');
    var near = (sc > 42 && sc < 58) || Math.abs(sc - 50) < 8;
    return { score: sc, category: cat, borderline: near, self: self, other: other, detail: detail };
  }

  // ---------- 용신 3종 ----------
  function yongsin(s, pw, st) {
    var dm = s.day.s, dmEl = STEM_EL[dm], mb = s.month.b;
    var res = {};

    // ① 조후 — 월지 계절 + 화/수 세력
    var hot = pw.weighted[1] + pw.weighted[2] * 0.4, cold = pw.weighted[4] + pw.weighted[3] * 0.4;
    var summer = [4,5,6].indexOf(mb) >= 0 || mb === 7, winter = [10,11,0,1].indexOf(mb) >= 0;
    var joUse = null, joNote = '';
    if (summer && hot - cold >= 3)      { joUse = 4; joNote = '巳午未 계절 + 화토 편중 → 조열. 水 급선무'; }
    else if (winter && cold - hot >= 3) { joUse = 1; joNote = '亥子丑 계절 + 수금 편중 → 한습. 火 급선무'; }
    else if (summer)                    { joUse = 4; joNote = '여름 생. 水로 식히는 것이 기본'; }
    else if (winter)                    { joUse = 1; joNote = '겨울 생. 火로 덥히는 것이 기본'; }
    else                                { joNote = '한난이 극단으로 치우치지 않음 → 조후 우선순위 낮음'; }
    res.johu = { use: joUse, note: joNote, extreme: Math.abs(hot - cold) >= 6 };

    // ② 억부
    var inseong = (dmEl + 4) % 5, bigeop = dmEl, siksang = (dmEl + 1) % 5,
        jaeseong = (dmEl + 2) % 5, gwanseong = (dmEl + 3) % 5;
    res.eokbu = st.category === '신강'
      ? { use: [siksang, jaeseong, gwanseong], avoid: [inseong, bigeop], primary: siksang, note: '신강 → 덜어내는 쪽' }
      : (st.category === '신약'
        // 신약을 힘들게 하는 것은 극하는 관성·모산하는 재성만이 아니다. 기운을 빼가는 식상도 포함이다.
        // (신강 쪽 use 와 대칭이어야 한다. 식상이 빠져 있으면 식상 과다 신약에서 기신이 통째로 안 잡힌다.)
        ? { use: [inseong, bigeop], avoid: [siksang, gwanseong, jaeseong], primary: inseong, note: '신약 → 받치는 쪽' }
        : { use: [], avoid: [], primary: null, note: '중화 → 억부 단독 판정 보류. 조후·격국과 대조 필요' });
    // 신약 + 식상 과다 → 상관패인
    if (st.category === '신약' && pw.weighted[siksang] >= pw.weighted[dmEl] * 1.4)
      res.eokbu.note += ' / 식상 과다 → 상관패인(인성으로 제어)';

    // ③ 격국 — 월지 정기의 투출 여부
    var jg = jeonggi(mb), tg = branchTenGod(dm, mb);
    var tuchul = [s.year.s, s.month.s, (s.hour ? s.hour.s : -1)].indexOf(jg) >= 0;
    res.gyeokguk = {
      name: TENGOD[tg] + '격', jeonggi: STEM_C[jg], tuchul: tuchul,
      note: tuchul ? '월지 정기 ' + STEM_C[jg] + ' 천간 투출 → 격이 선명'
                   : '월지 정기 ' + STEM_C[jg] + ' 미투출 → 격국을 그대로 신뢰하지 말고 억부 우선'
    };

    // 충돌 판정
    var conflict = [];
    if (res.johu.use !== null && res.eokbu.primary !== null && res.johu.use !== res.eokbu.primary)
      conflict.push('조후(' + EL_K[res.johu.use] + ')와 억부(' + EL_K[res.eokbu.primary] + ')가 다름'
        + (res.johu.extreme ? ' → 한난이 극단이므로 조후 우선' : ' → 억부 우선, 조후는 보조'));
    if (!res.gyeokguk.tuchul) conflict.push('격국용신은 참고 수준으로 낮춤 (정기 미투출)');
    res.conflict = conflict;

    // 최종 후보
    var primary = (res.johu.use !== null && res.johu.extreme) ? res.johu.use
                : (res.eokbu.primary !== null ? res.eokbu.primary : res.johu.use);
    res.primary = primary;
    res.suwon = (primary === null) ? null : (primary + 4) % 5;   // 용신을 생하는 오행 = 희신
    return res;
  }

  // ---------- 급소 — 용신의 뿌리 ----------
  function geupso(s, yong, pillars, gm) {
    if (yong.primary === null) return null;
    var roots = [];
    pillars.forEach(function (p) {
      HIDDEN[p.b].forEach(function (h) {
        if (STEM_EL[h[0]] === yong.primary)
          roots.push({ pillar: p.label, branch: BR_C[p.b], bi: p.b, stem: STEM_C[h[0]],
                       days: h[1], jeonggi: h[0] === jeonggi(p.b),
                       gongmang: gm.indexOf(p.b) >= 0 });
      });
    });
    var surface = pillars.filter(function (p) { return STEM_EL[p.s] === yong.primary; })
                         .map(function (p) { return p.label + '간 ' + STEM_C[p.s]; });
    roots.sort(function (a, b) { return b.days - a.days; });
    var weak = roots.length === 0 ? null
             : (roots.length === 1 ? roots[0] : (roots[0].days <= 4 ? roots[0] : null));
    return { roots: roots, surface: surface, critical: weak,
             verdict: roots.length === 0 ? '용신 오행의 뿌리가 지지에 전혀 없음 — 운에서 들어와야만 작동'
                    : (roots.length === 1 ? '뿌리가 단 하나 — 이 지지가 급소'
                    : '뿌리 ' + roots.length + '개') };
  }

  // ---------- 대운 ----------
  function findBoundary(y, m, d, h, mi, dir) {
    var base = monthBranchFromLon(solarLongitude(y, m, d, h, mi));
    var t = Date.UTC(y, m - 1, d, h == null ? 12 : h, mi || 0);
    var step = 3600000 * 6, guard = 0;
    while (guard++ < 200) {
      t += dir * step;
      var D = new Date(t);
      if (monthBranchFromLon(solarLongitude(D.getUTCFullYear(), D.getUTCMonth() + 1, D.getUTCDate(),
          D.getUTCHours(), D.getUTCMinutes())) !== base) break;
    }
    var lo = t - dir * step, hi = t;
    for (var i = 0; i < 40; i++) {
      var mid = (lo + hi) / 2, Dm = new Date(mid);
      if (monthBranchFromLon(solarLongitude(Dm.getUTCFullYear(), Dm.getUTCMonth() + 1, Dm.getUTCDate(),
          Dm.getUTCHours(), Dm.getUTCMinutes())) !== base) hi = mid; else lo = mid;
    }
    var birth = Date.UTC(y, m - 1, d, h == null ? 12 : h, mi || 0);
    return Math.abs(hi - birth) / 86400000;
  }

  function daeun(s, y, m, d, h, mi, gender) {
    var yangYear = s.year.s % 2 === 0;
    var male = (gender === 'M' || gender === 'male' || gender === '남');
    var forward = (yangYear && male) || (!yangYear && !male);
    var days = findBoundary(y, m, d, h, mi, forward ? 1 : -1);
    var startAge = days / 3;
    var list = [], si = s.month.s, bi = s.month.b, i;
    for (i = 1; i <= 10; i++) {
      var st2 = ((si + (forward ? i : -i)) % 10 + 10) % 10;
      var br2 = ((bi + (forward ? i : -i)) % 12 + 12) % 12;
      list.push({ n: i, age: Math.round((startAge + (i - 1) * 10) * 10) / 10,
                  year: y + Math.floor(startAge + (i - 1) * 10),
                  s: st2, b: br2, gz: STEM_C[st2] + BR_C[br2] });
    }
    return { forward: forward, direction: forward ? '순행' : '역행', male: male, yangYear: yangYear,
             daysToBoundary: Math.round(days * 100) / 100,
             startAge: Math.round(startAge * 10) / 10, list: list };
  }

  function seun(fromYear, n) {
    var out = [];
    for (var i = 0; i < n; i++) {
      var yr = fromYear + i, idx = ((yr - 4) % 60 + 60) % 60;
      out.push({ year: yr, s: idx % 10, b: idx % 12, gz: STEM_C[idx % 10] + BR_C[idx % 12] });
    }
    return out;
  }

  // ---------- 글자의 처지 (통근 · 개두/절각 · 글자별 12운성) ----------
  // 십성 라벨만으로는 해석이 평면이 된다. 같은 십성도 처지에 따라 강약과 발현이 갈린다.
  var STRONG_STAGE = ['장생','관대','건록','제왕'];
  var WEAK_STAGE   = ['사','묘','절','태'];
  function charStatus(pillars) {
    return pillars.map(function (p) {
      var sEl = STEM_EL[p.s], bEl = BR_EL[p.b];
      var roots = [];
      pillars.forEach(function (q) {
        HIDDEN[q.b].forEach(function (h) {
          if (STEM_EL[h[0]] === sEl)
            roots.push({ at: q.label, branch: BR_C[q.b], stem: STEM_C[h[0]], days: h[1],
                         jeonggi: h[0] === jeonggi(q.b), own: q.label === p.label });
        });
      });
      var days = roots.reduce(function (a, r) { return a + r.days; }, 0);
      var own  = roots.filter(function (r) { return r.own; });
      var gaedu   = (sEl + 2) % 5 === bEl;   // 蓋頭 — 천간이 자기 지지를 극
      var jeolgak = (bEl + 2) % 5 === sEl;   // 截脚 — 지지가 천간을 극 (다리가 잘림)
      var stage = twelveStage(p.s, p.b);
      var sc = 0;
      if (roots.length) sc += 2;
      if (own.length) sc += 1;
      if (days >= 18) sc += 1;
      if (roots.some(function (r) { return r.jeonggi; })) sc += 1;
      if (jeolgak) sc -= 2;
      if (STRONG_STAGE.indexOf(stage) >= 0) sc += 1;
      if (WEAK_STAGE.indexOf(stage) >= 0) sc -= 1;
      var verdict = sc >= 4 ? '튼튼' : sc >= 2 ? '보통' : sc >= 0 ? '약함' : '위태';
      return {
        label: p.label, stem: STEM_C[p.s], branch: BR_C[p.b],
        rooted: roots.length > 0, roots: roots, rootDays: days, ownRoot: own.length > 0,
        gaedu: gaedu, jeolgak: jeolgak, stage: stage, score: sc, verdict: verdict
      };
    });
  }

  // ---------- 유통(流通) — 비겁→식상→재성→관성→인성→비겁 ----------
  // 개수 분포만으로는 안 나오는 정보. 어디까지 뚫려 있고 어디서 막히는지가 핵심이다.
  var FLOW_BREAK = [
    '버틸 힘을 스스로 만들지 못해 외부 공급에 의존한다',
    '만들어낸 것이 밖으로 나가는 통로가 없다',
    '내보낸 것이 실물·성과로 맺히지 않는다',
    '성과가 지위나 역할로 전환되지 않는다',
    '성과가 나를 키우는 자산으로 쌓이지 않는다'
  ];
  // 2단계로 판정한다. ①글자가 있는가 ②있어도 무력화되었는가.
  // 있는데 힘이 없는 것과 아예 없는 것은 처방이 다르므로 반드시 갈라서 낸다.
  function flow(pillars, dm, cst, rel) {
    var surf = [0,0,0,0,0], hid = [0,0,0,0,0], carry = [[],[],[],[],[]];
    pillars.forEach(function (p) {
      if (p.label !== '일') {
        var gi = GROUP_OF[stemTenGod(dm, p.s)];
        surf[gi]++;
        var cs = cst.filter(function (c) { return c.label === p.label; })[0];
        carry[gi].push({ where: p.label + '간', ch: STEM_C[p.s], kind: '천간',
                         weak: cs && (cs.verdict === '약함' || cs.verdict === '위태'),
                         why: cs ? (cs.jeolgak ? '절각' : (!cs.rooted ? '무근' : (cs.rootDays <= 4 ? '뿌리 ' + cs.rootDays + '일' : ''))) : '' });
      }
      // 충(沖)은 글자를 부수고, 형·파·해는 긴장시킨다. 같은 무게로 세면 안 된다.
      // 월지는 득령(得令) 자리라 계절의 힘을 그대로 받으므로 충을 맞아도 무력화로 보지 않는다.
      var gb2 = GROUP_OF[branchTenGod(dm, p.b)];
      surf[gb2]++;
      var broke  = rel.filter(function (r) { return r.w && r.w.indexOf(p.label) >= 0 && r.t === '충'; });
      var strain = rel.filter(function (r) { return r.w && r.w.indexOf(p.label) >= 0 &&
                              (r.t === '형' || r.t === '자형' || r.t === '삼형' || r.t === '파' || r.t === '해'); });
      var ruling = p.label === '월';
      carry[gb2].push({ where: p.label + '지', ch: BR_C[p.b], kind: '지지',
                        weak: broke.length > 0 && !ruling,
                        strained: strain.length > 0 || (broke.length > 0 && ruling),
                        ruling: ruling,
                        why: broke.concat(strain).map(function (r) { return r.k; }).join(',')
                             + (ruling ? (broke.length ? ' (단 월지=득령)' : '') : '') });
      HIDDEN[p.b].forEach(function (h) { hid[GROUP_OF[tenGodBy(dm, STEM_EL[h[0]], h[0] % 2)]] += h[1] / 30; });
    });
    var stages = GROUP_K.map(function (k, i) {
      var alive = carry[i].filter(function (c) { return !c.weak; });
      var clean = carry[i].filter(function (c) { return !c.weak && !c.strained; });
      return { group: k, surface: surf[i], hidden: Math.round(hid[i] * 10) / 10,
               carriers: carry[i], intact: clean.length,
               open: surf[i] > 0 && alive.length > 0,
               strainedOnly: surf[i] > 0 && alive.length > 0 && clean.length === 0,
               weakened: surf[i] > 0 && alive.length === 0,
               detour: surf[i] === 0 && hid[i] >= 0.2,
               meaning: FLOW_BREAK[i] };
    });
    var broken   = stages.filter(function (s) { return s.surface === 0; });
    var weakened = stages.filter(function (s) { return s.weakened; });
    var strained = stages.filter(function (s) { return s.strainedOnly; });
    var parts = [];
    if (broken.length)   parts.push(broken.map(function (s) { return s.group; }).join('·') + ' 단계가 표면에 없음'
                                   + (broken.every(function (s) { return s.detour; }) ? '(지장간 우회로 있음)' : ''));
    if (weakened.length) parts.push(weakened.map(function (s) { return s.group; }).join('·')
                                   + ' 단계는 글자는 있으나 전부 무력화됨 — 「있다」고 세면 안 되는 자리');
    if (strained.length) parts.push(strained.map(function (s) { return s.group; }).join('·')
                                   + ' 단계는 살아 있으나 전부 형·파·해에 걸림 — 돌긴 도는데 마찰이 있는 구간');
    return { stages: stages, broken: broken, weakened: weakened, strained: strained,
             verdict: parts.length ? parts.join(' / ') : '다섯 단계가 모두 온전 — 순환이 끊기지 않음' };
  }

  // ---------- 운(運) 간지 × 원국 전수 대조 ----------
  // 눈에 띄는 것만 집으면 누락이 난다. 4기둥 전부와 대조하고 중요도는 뒤에 판정한다.
  var ADJ = { '연': 0, '월': 1, '일': 2, '시': 3 };
  function transitRelations(ts, tb, pillars, gbi) {
    var out = [], bs = pillars.map(function (p) { return p.b; }), k;
    pillars.forEach(function (p) {
      var lo = Math.min(p.b, tb), hi = Math.max(p.b, tb), near = ADJ[p.label] >= 2;
      function add(t, kk, el) { out.push({ t: t, k: kk, at: p.label + '주', near: near,
                                           geupso: gbi !== null && p.b === gbi, el: el }); }
      if (hi - lo === 6) add('충', BR_C[p.b] + BR_C[tb] + '충');
      if ((p.b + tb) % 12 === 1 && SIXHAP_EL[lo] !== undefined) add('육합', BR_C[p.b] + BR_C[tb] + '합', SIXHAP_EL[lo]);
      if (p.b === tb && [4,6,9,11].indexOf(tb) >= 0) add('자형', BR_C[tb] + BR_C[tb] + ' 자형');
      if (lo === 0 && hi === 3) add('형', '子卯 상형');
      for (k = 0; k < PA.length; k++)  if ((PA[k][0]===p.b&&PA[k][1]===tb)||(PA[k][0]===tb&&PA[k][1]===p.b)) add('파', BR_C[p.b]+BR_C[tb]+'파');
      for (k = 0; k < HAE.length; k++) if ((HAE[k][0]===p.b&&HAE[k][1]===tb)||(HAE[k][0]===tb&&HAE[k][1]===p.b)) add('해', BR_C[p.b]+BR_C[tb]+'해');
      var df = Math.abs(p.s - ts);
      if (df === 5) add('천간합', STEM_C[p.s] + STEM_C[ts] + '합', STEMHAP_EL[Math.min(p.s, ts) % 5]);
      if (df === 6 && Math.min(p.s, ts) !== 4) add('천간충', STEM_C[p.s] + STEM_C[ts] + '충');
    });
    // 삼형 완성
    [[2,5,8],[1,10,7]].forEach(function (tri) {
      if (tri.indexOf(tb) < 0) return;
      var others = tri.filter(function (x) { return x !== tb; });
      if (others.every(function (x) { return bs.indexOf(x) >= 0; }))
        out.push({ t: '삼형 완성', k: tri.map(function(x){return BR_C[x];}).join('') + ' 삼형', at: '지지 전체', near: true, geupso: false });
    });
    // 삼합·방합 — 완성과 반합은 체감이 다르므로 구분한다
    SAMHAP.concat(BANGHAP).forEach(function (g) {
      if (g.b.indexOf(tb) < 0) return;
      var others = g.b.filter(function (x) { return x !== tb; });
      var have = others.filter(function (x) { return bs.indexOf(x) >= 0; });
      var bang = g.nm.indexOf('방') > 0;
      if (have.length === 2)
        out.push({ t: (bang ? '방합' : '삼합') + ' 완성', k: g.nm + ' 완성', at: '지지 전체', near: true, geupso: false, el: g.el });
      else if (have.length === 1 && !bang && (tb === g.b[1] || have[0] === g.b[1]))
        out.push({ t: '반합', k: BR_C[have[0]] + BR_C[tb] + ' 반합', at: '지지', near: false, geupso: false, el: g.el });
    });
    return out;
  }

  // ---------- 조토 / 습토 ----------
  // 같은 土라도 辰丑은 습토(水 저장), 未戌은 조토(火에 가담). 개수로 뭉뚱그리지 않는다.
  var WET_EARTH = [1, 4], DRY_EARTH = [7, 10];
  function earthKind(b) { return WET_EARTH.indexOf(b) >= 0 ? '습토' : (DRY_EARTH.indexOf(b) >= 0 ? '조토' : null); }

  // ---------- 궁(宮) ----------
  var GUNG = {
    '연': { time: '초년', area: '조상 · 가문 · 사회적 배경' },
    '월': { time: '청년~중년', area: '부모 · 형제 · 직업 · 사회활동' },
    '일': { time: '중년', area: '나 자신 · 배우자 · 가정' },
    '시': { time: '말년', area: '자식 · 결과물 · 노후' }
  };
  function yukchin(female) {
    return [ { who: '어머니', g: 4 }, { who: '아버지', g: 2 }, { who: '형제·동료', g: 0 },
             { who: '배우자', g: female ? 3 : 2 }, { who: '자식', g: female ? 1 : 3 } ];
  }

  // ---------- 메인 ----------
  function computeAll(inp) {
    var y = inp.year, m = inp.month, d = inp.day;
    var h = (inp.hour == null) ? null : inp.hour, mi = inp.minute || 0;
    var female = (inp.gender === 'F' || inp.gender === 'female' || inp.gender === '여');

    var s = computeSaju(y, m, d, h, mi);
    var dm = s.day.s;

    // 진태양시 보정 (동경 135° 기준 → 서울 126.978° : −32분)
    var corr = null;
    if (h != null) {
      var tot = h * 60 + mi - 32, dayShift = 0;
      if (tot < 0) { tot += 1440; dayShift = -1; }
      var ch = Math.floor(tot / 60), cm = tot % 60;
      var cd = new Date(Date.UTC(y, m - 1, d + dayShift));
      var s2 = computeSaju(cd.getUTCFullYear(), cd.getUTCMonth() + 1, cd.getUTCDate(), ch, cm);
      corr = {
        time: (ch < 10 ? '0' : '') + ch + ':' + (cm < 10 ? '0' : '') + cm,
        dayShift: dayShift,
        hourChanged: !s.hour || !s2.hour || (s2.hour.s !== s.hour.s || s2.hour.b !== s.hour.b),
        dayChanged: (s2.day.s !== s.day.s || s2.day.b !== s.day.b),
        saju: s2,
        gz: s2.hour ? STEM_C[s2.hour.s] + BR_C[s2.hour.b] : null
      };
    }

    var pillars = [];
    function push(lab, p) { if (p) pillars.push({ label: lab, s: p.s, b: p.b }); }
    push('연', s.year); push('월', s.month); push('일', s.day); push('시', s.hour);

    var gm = gongmang(s.day.s, s.day.b);
    var pw = elementPower(pillars);
    var st = strength(s);
    var yo = yongsin(s, pw, st);
    var gs = geupso(s, yo, pillars, gm);
    var rel = relations(pillars);
    var du = daeun(s, y, m, d, h, mi, female ? 'F' : 'M');
    var cst = charStatus(pillars);
    var flw = flow(pillars, dm, cst, rel);
    var gbi = (gs && gs.critical) ? gs.critical.bi : null;

    // 운 간지 전수 대조 — 대운·세운 각 행에 붙인다
    du.list.forEach(function (x) { x.rel = transitRelations(x.s, x.b, pillars, gbi); });
    var se = seun(new Date().getFullYear() - 1, 12);
    se.forEach(function (x) { x.rel = transitRelations(x.s, x.b, pillars, gbi); });

    // 용신이 천간합으로 묶이는가 (기반, 羈絆) — 있어도 역할을 못 한다
    function gibanCheck(ts) {
      if (yo.primary === null) return null;
      var hit = pillars.filter(function (p) { return STEM_EL[p.s] === yo.primary && Math.abs(p.s - ts) === 5; });
      return hit.length ? hit.map(function (p) { return p.label + '간 ' + STEM_C[p.s]; }).join('·') : null;
    }
    du.list.forEach(function (x) { x.giban = gibanCheck(x.s); });
    se.forEach(function (x) { x.giban = gibanCheck(x.s); });

    // 기둥별 상세
    var cells = pillars.map(function (p) {
      var hid = HIDDEN[p.b].map(function (x) {
        return { stem: STEM_C[x[0]], days: x[1], jeonggi: x[0] === jeonggi(p.b),
                 tenGod: TENGOD[tenGodBy(dm, STEM_EL[x[0]], x[0] % 2)],
                 tuchul: [s.year.s, s.month.s, s.day.s, (s.hour ? s.hour.s : -1)].indexOf(x[0]) >= 0 };
      });
      return {
        label: p.label, gung: GUNG[p.label],
        stem: STEM_C[p.s], stemK: STEM_K[p.s], stemEl: EL_K[STEM_EL[p.s]],
        branch: BR_C[p.b], branchK: BR_K[p.b], branchEl: EL_K[BR_EL[p.b]],
        stemTenGod: p.label === '일' ? '—(일간)' : TENGOD[stemTenGod(dm, p.s)],
        branchTenGod: TENGOD[branchTenGod(dm, p.b)],
        stage: twelveStage(dm, p.b),
        gongmang: gm.indexOf(p.b) >= 0,
        hidden: hid
      };
    });

    // 십성 분포
    // 두 기준을 같이 낸다:
    //   ours = 일간 제외 (일간은 기준점이지 십성이 아니다)  → 시주 있으면 7칸
    //   app  = 일간을 비견으로 포함 (포스텔러 등 만세력 앱 관행) → 시주 있으면 8칸
    // 앱과 대조할 때 비겁 1칸이 어긋나 보이는 원인이 이것뿐이라, 양쪽을 다 표기한다.
    var tgCount = {}, grCount = [0,0,0,0,0];
    var tgCountApp = {}, grCountApp = [0,0,0,0,0];
    TENGOD.forEach(function (t) { tgCount[t] = 0; tgCountApp[t] = 0; });
    pillars.forEach(function (p) {
      if (!(p.label === '일')) { var a = stemTenGod(dm, p.s); tgCount[TENGOD[a]]++; grCount[GROUP_OF[a]]++;
                                 tgCountApp[TENGOD[a]]++; grCountApp[GROUP_OF[a]]++; }
      var b2 = branchTenGod(dm, p.b); tgCount[TENGOD[b2]]++; grCount[GROUP_OF[b2]]++;
                                      tgCountApp[TENGOD[b2]]++; grCountApp[GROUP_OF[b2]]++;
    });
    tgCountApp['비견']++; grCountApp[0]++;   // 일간 자신
    var cellsN = pillars.length * 2 - 1;      // 일간 제외 칸 수 (시주 없으면 5)
    // 편(偏) 계열 = 겁재·상관·편재·편관·편인 / 정(正) 계열 = 비견·식신·정재·정관·정인
    // ⚠ 십성 인덱스 홀짝으로 가르면 상관이 정으로 넘어간다. 상관·겁재는 편이다.
    var PYEON_IDX = [1,3,4,6,8], pyeon = 0, jeong = 0;
    Object.keys(tgCount).forEach(function (k) {
      var i = TENGOD.indexOf(k);
      if (PYEON_IDX.indexOf(i) >= 0) pyeon += tgCount[k]; else jeong += tgCount[k];
    });

    // 궁성 대조
    var yc = yukchin(female).map(function (r) {
      var found = [];
      cells.forEach(function (c) {
        if (GROUP_OF[TENGOD.indexOf(c.branchTenGod)] === r.g) found.push(c.label + '지 ' + c.branch);
        if (c.stemTenGod !== '—(일간)' && GROUP_OF[TENGOD.indexOf(c.stemTenGod)] === r.g)
          found.push(c.label + '간 ' + c.stem);
      });
      return { who: r.who, star: GROUP_K[r.g], plain: GROUP_PLAIN[r.g], at: found };
    });
    var gungMatch = [
      { gung: '부모궁(월간)', expect: '인성', actual: cells[1] ? cells[1].stemTenGod : '—' },
      { gung: '배우자궁(일지)', expect: female ? '관성' : '재성', actual: cells[2].branchTenGod },
      { gung: '자식궁(시지)', expect: female ? '식상' : '관성', actual: cells[3] ? cells[3].branchTenGod : '—(시주 없음)' }
    ].map(function (r) {
      r.match = (r.actual !== '—' && r.actual.indexOf('—') < 0)
        ? (GROUP_K[GROUP_OF[TENGOD.indexOf(r.actual)]] === r.expect) : null;
      return r;
    });

    return {
      input: { y: y, m: m, d: d, hour: h, minute: mi, female: female, hourKnown: h != null },
      saju: s, pillars: pillars, cells: cells, correction: corr,
      dayMaster: { c: STEM_C[dm], k: STEM_K[dm], el: EL_K[STEM_EL[dm]], yin: dm % 2 === 1 },
      zodiac: ZODIAC[s.year.b],
      gongmang: gm.map(function (b) { return BR_C[b]; }),
      power: pw, strength: st, yongsin: yo, geupso: gs, relations: rel, sinsal: sinsal(pillars), daeun: du,
      seun: se, charStatus: cst, flow: flw,
      earth: pillars.filter(function (p) { return BR_EL[p.b] === 2; })
                    .map(function (p) { return { at: p.label, branch: BR_C[p.b], kind: earthKind(p.b) }; }),
      gongmangShock: (function () {   // 공망 지지가 충·합을 맞으면 해공(解空) 논쟁이 붙는다
        var out = [];
        pillars.forEach(function (p) {
          if (gm.indexOf(p.b) < 0) return;
          var hits = rel.filter(function (r) { return r.w && r.w.indexOf(p.label) >= 0 &&
                                (r.t === '충' || r.t === '육합' || r.t === '삼합' || r.t === '반합'); });
          if (hits.length) out.push({ at: p.label, branch: BR_C[p.b],
                                      by: hits.map(function (r) { return r.k; }).join(', ') });
        });
        return out;
      })(),
      tenGodCount: tgCount, groupCount: grCount, cellsCounted: cellsN,
      tenGodCountApp: tgCountApp, groupCountApp: grCountApp, cellsCountedApp: cellsN + 1,
      pyeonJeong: { pyeon: pyeon, jeong: jeong },
      yukchin: yc, gungMatch: gungMatch,
      tables: { STEM_C: STEM_C, BR_C: BR_C, EL_K: EL_K, EL_FULL: EL_FULL,
                TENGOD: TENGOD, GROUP_K: GROUP_K, GROUP_PLAIN: GROUP_PLAIN, HIDDEN: HIDDEN }
    };
  }

  /* ============================================================
     신살 — 도화 · 역마 · 화개
     SAMHAP 배열이 [생지, 왕지, 고지] 순이라 표 없이 공식으로 낸다.
       도화 = (왕지+9)%12  … 국(局)의 목욕지
       역마 = (생지+6)%12  … 생지의 충
       화개 = 고지
     기준은 연지·일지 둘 다 본다. 양쪽에서 잡히면 두 줄로 나오고, 그게 곧 강도다.
     ============================================================ */
  function sinsalTable(baseBranch) {
    for (var i = 0; i < SAMHAP.length; i++) {
      var g = SAMHAP[i].b;
      if (g.indexOf(baseBranch) >= 0)
        return { group: SAMHAP[i].nm, 도화: (g[1] + 9) % 12, 역마: (g[0] + 6) % 12, 화개: g[2] };
    }
    return null;
  }
  function sinsal(pillars) {
    var out = [];
    ['연', '일'].forEach(function (baseLab) {
      var base = null;
      pillars.forEach(function (p) { if (p.label === baseLab) base = p.b; });
      if (base === null) return;
      var t = sinsalTable(base);
      if (!t) return;
      ['도화', '역마', '화개'].forEach(function (kind) {
        pillars.forEach(function (p) {
          if (p.b === t[kind])
            out.push({ kind: kind, base: baseLab + '지 ' + BR_C[base], group: t.group,
                       at: p.label, branch: BR_C[p.b] });
        });
      });
    });
    return out;
  }

  /* ============================================================
     궁합 — 두 사주 교차 계산
     relations() 는 한 사람 원국 안쪽만 본다. 궁합은 A의 여덟 글자와 B의 여덟 글자
     사이를 봐야 하므로 쌍 판정을 따로 둔다. 기존 relations() 는 건드리지 않는다
     (검증된 코드이고, 개별 시트의 출력이 흔들리면 안 된다).
     ============================================================ */
  function branchPair(a, b) {
    var out = [], lo = Math.min(a, b), hi = Math.max(a, b);
    if (hi - lo === 6) out.push({ t: '충', k: BR_C[a] + BR_C[b] + '충' });
    if ((a + b) % 12 === 1 && SIXHAP_EL[lo] !== undefined)
      out.push({ t: '육합', k: BR_C[a] + BR_C[b] + '합', el: SIXHAP_EL[lo] });
    if (a === b && (a === 4 || a === 6 || a === 9 || a === 11))
      out.push({ t: '자형', k: BR_C[a] + BR_C[b] + ' 자형' });
    if (lo === 0 && hi === 3) out.push({ t: '형', k: '子卯 상형' });
    if (inPairs(PA, a, b))  out.push({ t: '파', k: BR_C[a] + BR_C[b] + '파' });
    if (inPairs(HAE, a, b)) out.push({ t: '해', k: BR_C[a] + BR_C[b] + '해' });
    var wj = inPairs(WONJIN, a, b), gw = inPairs(GWIMUN, a, b);
    if (wj || gw) out.push({ t: wj && gw ? '원진·귀문' : (wj ? '원진' : '귀문'),
      k: BR_C[a] + BR_C[b] + ' ' + (wj && gw ? '원진·귀문' : (wj ? '원진' : '귀문')) });
    SAMHAP.forEach(function (g) {   // 왕지를 낀 두 글자 = 반합
      if (a !== b && g.b.indexOf(a) >= 0 && g.b.indexOf(b) >= 0 && (a === g.b[1] || b === g.b[1]))
        out.push({ t: '반합', k: BR_C[a] + BR_C[b] + ' 반합', el: g.el });
    });
    return out;
  }
  function stemPair(s1, s2) {
    var out = [], df = Math.abs(s1 - s2);
    if (df === 5) out.push({ t: '천간합', k: STEM_C[s1] + STEM_C[s2] + '합', el: STEMHAP_EL[Math.min(s1, s2) % 5] });
    if (df === 6 && Math.min(s1, s2) !== 4) out.push({ t: '천간충', k: STEM_C[s1] + STEM_C[s2] + '충' });
    return out;
  }
  function crossRelations(pa, pb) {
    var out = [];
    pa.forEach(function (x) {
      pb.forEach(function (y) {
        var isDay = (x.label === '일' && y.label === '일');
        branchPair(x.b, y.b).forEach(function (r) {
          out.push({ side: '지지', t: r.t, k: r.k, el: r.el, aAt: x.label, bAt: y.label, day: isDay });
        });
        stemPair(x.s, y.s).forEach(function (r) {
          out.push({ side: '천간', t: r.t, k: r.k, el: r.el, aAt: x.label, bAt: y.label, day: isDay });
        });
      });
    });
    return out;
  }
  // 둘을 합쳤을 때 비로소 완성되는 삼합·방합. 한쪽만으로 이미 성립한 것은 newly=false.
  function mergedHap(pa, pb) {
    var ab = pa.map(function (p) { return p.b; }), bb = pb.map(function (p) { return p.b; });
    var all = ab.concat(bb), out = [];
    SAMHAP.concat(BANGHAP).forEach(function (g) {
      if (g.b.filter(function (x) { return all.indexOf(x) >= 0; }).length < 3) return;
      var aHit = g.b.filter(function (x) { return ab.indexOf(x) >= 0; }).length;
      var bHit = g.b.filter(function (x) { return bb.indexOf(x) >= 0; }).length;
      out.push({ nm: g.nm, el: g.el, kind: g.nm.indexOf('방') > 0 ? '방합' : '삼합',
                 newly: aHit < 3 && bHit < 3, aHit: aHit, bHit: bHit });
    });
    return out;
  }
  // 어떤 오행이 상대 원국 어디에 몇 개나 있는가 (용신 교환 판정용)
  function locateEl(el, R) {
    var at = [], surface = 0, hidden = 0, monthRooted = false;
    R.pillars.forEach(function (p) {
      if (STEM_EL[p.s] === el) { at.push({ where: p.label + '간', ch: STEM_C[p.s] }); surface++; }
      if (BR_EL[p.b] === el) {
        at.push({ where: p.label + '지', ch: BR_C[p.b] }); surface++;
        if (p.label === '월') monthRooted = true;
      }
      HIDDEN[p.b].forEach(function (h) { if (STEM_EL[h[0]] === el) hidden += h[1] / 30; });
    });
    return { el: el, surface: surface, at: at, monthRooted: monthRooted,
             hiddenScore: Math.round(hidden * 10) / 10,
             weighted: Math.round(R.power.weighted[el] * 10) / 10 };
  }
  // 어떤 간지가 그 사람에게 유리한가 (대운 동조 판정용)
  function favorOf(R, s, b) {
    var use = (R.yongsin.eokbu && R.yongsin.eokbu.use ? R.yongsin.eokbu.use : []).slice();
    var avoid = (R.yongsin.eokbu && R.yongsin.eokbu.avoid ? R.yongsin.eokbu.avoid : []).slice();
    if (R.yongsin.primary !== null && use.indexOf(R.yongsin.primary) < 0) use.push(R.yongsin.primary);
    if (R.yongsin.suwon !== null && use.indexOf(R.yongsin.suwon) < 0) use.push(R.yongsin.suwon);
    var els = [STEM_EL[s], BR_EL[b]];
    var good = els.filter(function (e) { return use.indexOf(e) >= 0; }).length;
    var bad  = els.filter(function (e) { return avoid.indexOf(e) >= 0; }).length;
    return good > bad ? '유리' : (bad > good ? '불리' : '중립');
  }
  function daeunSync(A, B, years) {
    var nowY = new Date().getFullYear(), out = [], y;
    function atYear(R, yy) {
      var cur = null;
      R.daeun.list.forEach(function (x) { if (yy >= x.year && yy < x.year + 10) cur = x; });
      return cur;
    }
    for (y = nowY; y < nowY + (years || 20); y++) {
      var da = atYear(A, y), db = atYear(B, y);
      out.push({ year: y,
        a: da ? { age: da.age, gz: da.gz, favor: favorOf(A, da.s, da.b) } : null,
        b: db ? { age: db.age, gz: db.gz, favor: favorOf(B, db.s, db.b) } : null });
    }
    return out;
  }

  function computePair(inpA, inpB, opt) {
    var A = computeAll(inpA), B = computeAll(inpB);
    var cnt = [0,0,0,0,0], wgt = [0,0,0,0,0], i;
    [A, B].forEach(function (R) {
      for (i = 0; i < 5; i++) { cnt[i] += R.power.count[i]; wgt[i] += R.power.weighted[i]; }
    });
    var missing = [];
    for (i = 0; i < 5; i++) if (cnt[i] === 0) missing.push(i);
    var cross = crossRelations(A.pillars, B.pillars);
    return {
      a: A, b: B,
      cross: cross,
      dayCross: cross.filter(function (r) { return r.day; }),
      mergedHap: mergedHap(A.pillars, B.pillars),
      yongsinSwap: {
        aNeeds: A.yongsin.primary !== null ? locateEl(A.yongsin.primary, B) : null,
        bNeeds: B.yongsin.primary !== null ? locateEl(B.yongsin.primary, A) : null
      },
      mutualTenGod: {
        bInA: TENGOD[stemTenGod(A.saju.day.s, B.saju.day.s)],
        aInB: TENGOD[stemTenGod(B.saju.day.s, A.saju.day.s)]
      },
      merged: { count: cnt, weighted: wgt.map(function (v) { return Math.round(v * 10) / 10; }),
                missing: missing },
      daeunSync: daeunSync(A, B, (opt && opt.years) || 20),
      tables: { STEM_C: STEM_C, BR_C: BR_C, EL_K: EL_K, EL_FULL: EL_FULL,
                TENGOD: TENGOD, GROUP_K: GROUP_K, GROUP_PLAIN: GROUP_PLAIN }
    };
  }

  root.SajuEngine = {
    computePair: computePair, crossRelations: crossRelations, mergedHap: mergedHap,
    locateEl: locateEl, favorOf: favorOf, daeunSync: daeunSync, sinsal: sinsal,
    computeAll: computeAll, computeSaju: computeSaju, solarLongitude: solarLongitude,
    tenGodBy: tenGodBy, stemTenGod: stemTenGod, branchTenGod: branchTenGod,
    twelveStage: twelveStage, gongmang: gongmang, jeonggi: jeonggi, transitRelations: transitRelations,
    STEM_C: STEM_C, BR_C: BR_C, EL_K: EL_K, TENGOD: TENGOD, HIDDEN: HIDDEN
  };
})(typeof window !== 'undefined' ? window : globalThis);
