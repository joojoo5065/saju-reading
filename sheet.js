/* 사주 명식 렌더러 — skills/saju-myeongsik/scripts/report.html 에서 기계 추출. 손으로 고치지 말 것.
   입력 IN = {year,month,day,hour,minute,gender:'F'|'M',name}  ·  #app 과 #digest 요소가 있어야 한다. */
window.renderSheet = function (IN) {
  'use strict';
  var R = window.SajuEngine.computeAll(IN);
  var T = R.tables, E = window.SajuEngine;
  var EL_IDX = {'목':0,'화':1,'토':2,'금':3,'수':4};
  function esc(s){ return String(s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];}); }
  function elc(k){ return 'el-'+EL_IDX[k]; }
  var H = [];
  function w(s){ H.push(s); }

  /* ---------- 헤더 ---------- */
  var ord = ['시','일','월','연'];
  var byLab = {}; R.cells.forEach(function(c){ byLab[c.label]=c; });
  var gzLine = ord.map(function(l){ return byLab[l] ? byLab[l].stem+byLab[l].branch : '□□'; }).join(' ');
  var hhmm = R.input.hourKnown ? (('0'+R.input.hour).slice(-2)+':'+('0'+R.input.minute).slice(-2)) : '시간 미상';
  w('<header class="top"><div class="eyebrow">사주 명식 시트 · 궁성론 계산층</div>');
  w('<h1>'+(IN.name?esc(IN.name)+' — ':'')+'<span class="gz">'+gzLine+'</span></h1>');
  w('<p class="sub">'+R.input.y+'년 '+R.input.m+'월 '+R.input.d+'일 '+hhmm+' · '
    +(R.input.female?'여성':'남성')+' · <b>일간 '+R.dayMaster.c+'('+R.dayMaster.k+')</b> '
    +R.dayMaster.el+' '+(R.dayMaster.yin?'음':'양')+' · '+R.zodiac+'띠 · 시주 순서는 시·일·월·연</p></header>');

  /* ---------- 0. 원국 확정 경고 ---------- */
  w('<h2><span class="no">00</span>원국 확정 — 먼저 볼 것</h2>');
  if(!R.input.hourKnown){
    w('<div class="notice risk"><span class="nt">시주 없음</span><p>태어난 시각이 없어 <b>삼주(연·월·일)로만</b> 계산했습니다. 시주가 결정하는 항목 — 자식궁·말년·결과물, 그리고 시지에 걸리는 형충회합 — 은 전부 비어 있습니다. 오행 분포와 신강신약도 시주 유무로 흔들립니다.</p></div>');
  } else if(R.correction && (R.correction.hourChanged || R.correction.dayChanged)){
    var c=R.correction, alt=c.saju;
    w('<div class="notice risk"><span class="nt">태어난 시각 갈림길 — 보정 여부로 시주가 바뀝니다</span>'
      +'<p>한국 표준시는 동경 135°인데 서울 실제 경도는 약 127°라, 진태양시가 <b>32분</b> 이릅니다. 이 사주는 그 경계에 걸립니다.</p>'
      +'<table><tr><th>구분</th><th>적용 시각</th><th>시주</th><th>일주</th></tr>'
      +'<tr><td>보정 안 함 <span class="chip">앱 기본값 · 현재 표시</span></td><td>'+hhmm+'</td><td class="gz">'
        +(byLab['시']?byLab['시'].stem+byLab['시'].branch:'—')+'</td><td class="gz">'+byLab['일'].stem+byLab['일'].branch+'</td></tr>'
      +'<tr><td>보정 적용 (−32분)</td><td>'+c.time+(c.dayShift?' (전날)':'')+'</td><td class="gz">'
        +(c.gz||'—')+'</td><td class="gz">'+T.STEM_C[alt.day.s]+T.BR_C[alt.day.b]+'</td></tr></table>'
      +'<p><b>바뀌는 것</b> — 시주'+(c.dayChanged?'와 일주':'')+', 그에 딸린 십성·지장간·궁 배치. '
      +'<b>안 바뀌는 것</b> — 연주·월주, 따라서 격국과 계절(조후)의 뼈대는 그대로입니다.</p>'
      +'<p>아래 시트는 <b>보정 안 한 쪽</b>으로 계산돼 있습니다. 어느 쪽으로 볼지 정해주세요.</p></div>');
  } else {
    w('<div class="notice good"><span class="nt">시각 경계 안전</span><p>진태양시 −32분을 적용해도 시주가 '
      +(R.correction?'<span class="gz">'+R.correction.gz+'</span>로 ':'')+'그대로입니다. 보정 여부를 따질 필요가 없습니다.</p></div>');
  }
  var lamDeg = Math.round(R.saju.lambda*100)/100;
  var into = ((lamDeg-315)%360+360)%360 % 30;
  if(into < 1 || into > 29){
    w('<div class="notice warn"><span class="nt">절입일 경계</span><p>출생 시점의 태양 황경이 '+lamDeg+'°로, 절입 경계에서 '
      +(into<1? '갓 지난':'거의 닿은')+' 위치입니다. 월주가 갈릴 수 있으니 만세력 앱의 절입 시각과 대조해주세요.</p></div>');
  }

  /* ---------- 1. 명식 ---------- */
  w('<h2><span class="no">01</span>명식 — 천간 · 지지 · 지장간</h2>');
  w('<div class="pillars">');
  ord.forEach(function(l){
    var c=byLab[l];
    if(!c){ w('<div class="pil"><div class="plab">'+l+'주</div><div class="pgung">시각 미상</div>'
      +'<div class="pc" style="color:var(--faint)">□</div><div class="pk">—</div>'
      +'<div class="pc" style="color:var(--faint)">□</div><div class="pk">—</div>'
      +'<div class="hid">—</div></div>'); return; }
    w('<div class="pil'+(l==='일'?' dm':'')+'">');
    w('<div class="plab">'+l+'주'+(l==='일'?' · 나':'')+'</div>');
    w('<div class="pgung">'+c.gung.time+'</div>');
    w('<div class="ptg">'+c.stemTenGod+'</div>');
    w('<div class="pc '+elc(c.stemEl)+'">'+c.stem+'</div><div class="pk">'+c.stemK+' · '+c.stemEl+'</div>');
    w('<div class="pc '+elc(c.branchEl)+'">'+c.branch+'</div><div class="pk">'+c.branchK+' · '+c.branchEl+'</div>');
    w('<div class="ptg">'+c.branchTenGod+'</div>');
    w('<div class="hid">'+c.hidden.map(function(h){
        return '<span class="'+(h.jeonggi?'jg':'')+'">'+h.stem+'</span> '+h.days+(h.tuchul?'<sup>투</sup>':'');
      }).join(' · ')+'</div>');
    w('<div class="meta">'+c.stage+(c.gongmang?' · <span style="color:var(--risk-fg)">공망</span>':'')+'</div>');
    w('</div>');
  });
  w('</div>');
  w('<p class="sub" style="font-size:11.5px;margin-top:8px;color:var(--faint)">지장간 칸의 <b>굵은 글자</b>=정기(正氣), 숫자=일수, <sup>투</sup>=천간에 투출(뿌리로 연결돼 힘을 씀) · 맨 아래=일간 기준 십이운성 · 공망 지지 '+R.gongmang.join('·')+'</p>');

  /* ---------- 1.5 글자의 처지 ---------- */
  w('<h2><span class="no">01b</span>글자의 처지 — 통근 · 개두/절각 · 글자별 십이운성</h2>');
  w('<div class="scroll"><table><tr><th>천간</th><th>앉은 지지</th><th>통근</th><th>개두 / 절각</th><th>그 글자의 십이운성</th><th>실질 힘</th></tr>');
  R.charStatus.forEach(function(c){
    var vc = c.verdict==='튼튼'?'hit':(c.verdict==='위태'?'bad':(c.verdict==='약함'?'miss':''));
    w('<tr><td><b class="gz">'+c.stem+'</b> <span style="font-size:11px;color:var(--faint)">'+c.label+'간</span></td>'
     +'<td class="gz">'+c.branch+'</td>'
     +'<td>'+(c.rooted
        ? c.roots.map(function(r){return '<span class="chip'+(r.jeonggi?' hit':'')+'">'+r.at+r.branch+' '+r.stem+r.days+'일'+(r.own?'·자좌':'')+'</span>';}).join('')
          +' <span style="font-size:11px;color:var(--muted)">계 '+c.rootDays+'일</span>'
        : '<span class="chip bad">무근(無根)</span>')+'</td>'
     +'<td>'+(c.jeolgak?'<span class="chip bad">절각 — 앉은 자리에 극당함</span>':(c.gaedu?'<span class="chip">개두 — 지지를 극함</span>':'—'))+'</td>'
     +'<td>'+c.stage+'</td>'
     +'<td><span class="chip '+vc+'">'+c.verdict+'</span></td></tr>');
  });
  w('</table></div>');
  w('<div class="notice"><span class="nt">읽는 법</span><p>천간에 있다고 힘이 있는 것이 아닙니다. '
    +'<b>무근</b>이면 간판만 있고 실체가 약하고, <b>절각</b>이면 존재하지만 힘을 못 씁니다. '
    +'뿌리가 지장간 며칠치뿐이면 「있다」고 세지 말고 <b>위태롭게 버티는 것</b>으로 읽습니다.</p></div>');

  /* ---------- 2. 십성 ---------- */
  w('<h2><span class="no">02</span>십성 분포 — 편(偏) · 정(正)</h2>');
  w('<div class="grid2"><div>');
  w('<div class="scroll"><table><tr><th>그룹</th><th>쉬운 말</th><th>편</th><th>정</th><th class="n">계</th><th class="n">앱 기준</th></tr>');
  var pairs=[[0,'비겁',['비견','겁재']],[1,'식상',['식신','상관']],[2,'재성',['편재','정재']],[3,'관성',['편관','정관']],[4,'인성',['편인','정인']]];
  pairs.forEach(function(p){
    var a=R.tenGodCount[p[2][0]], b=R.tenGodCount[p[2][1]];
    w('<tr><td><b>'+p[1]+'</b></td><td style="color:var(--muted);font-size:12px">'+T.GROUP_PLAIN[p[0]]+'</td>'
     +'<td>'+p[2][0]+' '+a+'</td><td>'+p[2][1]+' '+b+'</td><td class="n"><b>'+(a+b)+'</b></td>'
     +'<td class="n"'+(R.groupCountApp[p[0]]!==a+b?' style="color:var(--warn-fg)"':'')+'>'+R.groupCountApp[p[0]]+'</td></tr>');
  });
  w('</table></div>');
  w('<p class="sub" style="font-size:11.5px;color:var(--faint)">「계」는 <b>일간을 뺀 '+R.cellsCounted+'칸</b> 기준입니다. 만세력 앱은 대개 <b>일간 자신을 비견으로 세어 '+R.cellsCountedApp+'칸</b>으로 내므로, 앱과 대조하면 비겁이 1 차이 납니다 — 마지막 열이 그 앱 기준값입니다.</p>');
  w('</div><div>');
  w('<div class="bars">');
  var maxG = Math.max.apply(null,R.groupCount)||1;
  // 막대 색 = 이 사람 기준 그 십성의 실제 오행 색.
  // 비겁=일간오행, 식상=+1, 재성=+2, 관성=+3, 인성=+4 (일간마다 달라진다)
  var dmEl = EL_IDX[R.dayMaster.el];
  pairs.forEach(function(p){
    var v=R.groupCount[p[0]], pct=Math.round(v/R.cellsCounted*1000)/10, gEl=(dmEl+p[0])%5;
    w('<div class="bar"><div class="bl">'+p[1]+'</div><div class="bt"><div class="bf f-'
      +gEl+'" style="width:'+(v/maxG*100)+'%"></div></div>'
      +'<div class="bv">'+v+' · '+pct+'%</div></div>');
  });
  w('</div>');
  w('<p class="sub" style="font-size:11.5px;color:var(--faint);margin-top:6px">막대 색은 '
    +'<b>'+R.dayMaster.c+'('+R.dayMaster.el+') 기준 그 십성의 실제 오행</b>입니다 — '
    +pairs.map(function(p){return p[1]+'='+T.EL_K[(dmEl+p[0])%5];}).join(' · ')
    +'. 색만 봐도 어느 오행이 몰렸는지 보입니다.</p>');
  // 칸 수가 5~7로 적어 「차이 N 이상」은 기준이 되지 못한다. 비율로 본다.
  var pj=R.pyeonJeong, pjHi=Math.max(pj.pyeon,pj.jeong), pjLo=Math.min(pj.pyeon,pj.jeong);
  var skew = (pj.pyeon+pj.jeong)>=4 && (pjLo===0 || pjHi/pjLo>=2);
  w('<div class="notice'+(skew?' warn':'')+'" style="margin-top:14px"><span class="nt">편 / 정 분포</span>'
    +'<p>편(偏) <b>'+pj.pyeon+'</b> · 정(正) <b>'+pj.jeong+'</b>'
    +(!skew ? ' — 편·정이 비교적 고릅니다.'
      : pj.pyeon>pj.jeong ? ' — 표면이 <b>편(偏)으로 몰려</b> 있습니다. 치우친 강점으로 승부하는 구조이고, 안정적 경로를 기본값으로 깔면 어긋납니다.'
      : ' — <b>정(正)이 우세</b>합니다. 안정적 경로가 구조적으로 맞습니다.')
    +'</p><p style="font-size:11.5px">이 한 줄이 커리어·관계 해석의 방향을 결정합니다. 결론을 내기 전에 먼저 확인할 것.</p></div>');
  w('</div></div>');

  /* ---------- 3. 오행 ---------- */
  w('<h2><span class="no">03</span>오행 — 개수와 실제 세력</h2>');
  w('<div class="grid2"><div><h3>표면 8자 개수</h3><div class="bars">');
  var maxC=Math.max.apply(null,R.power.count)||1;
  T.EL_K.forEach(function(k,i){
    w('<div class="bar"><div class="bl">'+T.EL_FULL[i]+'</div><div class="bt"><div class="bf f-'+i+'" style="width:'+(R.power.count[i]/maxC*100)+'%"></div></div><div class="bv">'+R.power.count[i]+'</div></div>');
  });
  w('</div></div><div><h3>자리 가중 세력 (월지 3 · 일지 2 · 연 1 · 시 1)</h3><div class="bars">');
  var maxW=Math.max.apply(null,R.power.weighted)||1;
  T.EL_K.forEach(function(k,i){
    w('<div class="bar"><div class="bl">'+T.EL_FULL[i]+'</div><div class="bt"><div class="bf f-'+i+'" style="width:'+(R.power.weighted[i]/maxW*100)+'%"></div></div><div class="bv">'+(Math.round(R.power.weighted[i]*10)/10)+'</div></div>');
  });
  w('</div></div></div>');
  // 순위가 아니라 점유율(%p)로 비교한다 — 개수는 동점이 흔해서 순위 비교는 헛짚는다.
  var sumC=R.power.count.reduce(function(a,b){return a+b;},0)||1;
  var sumW=R.power.weighted.reduce(function(a,b){return a+b;},0)||1;
  var gaps=[];
  T.EL_K.forEach(function(k,i){
    var dc=R.power.count[i]/sumC*100, dw=R.power.weighted[i]/sumW*100;
    if(Math.abs(dc-dw)>=10) gaps.push(T.EL_FULL[i]+'('+(dw>dc?'세력이 개수보다 큼 ':'개수보다 약함 ')
      +Math.round(dc)+'%→'+Math.round(dw)+'%)');
  });
  w('<div class="notice'+(gaps.length?' warn':'')+'"><span class="nt">개수 ≠ 세력</span><p>'
    +(gaps.length? '<b>'+gaps.join(', ')+'</b> — 점 개수만 보면 판단이 뒤집히는 지점입니다.'
                 : '개수 점유율과 세력 점유율이 대체로 일치합니다 (차이 10%p 미만).')
    +' 지장간까지 합산한 잠재 세력은 ['+T.EL_K.map(function(k,i){return k+' '+(Math.round(R.power.hidden[i]*10)/10);}).join(' · ')+'] 입니다.</p></div>');

  /* ---------- 3.5 유통 ---------- */
  w('<h2><span class="no">03b</span>유통(流通) — 어디까지 뚫려 있고 어디서 막히나</h2>');
  w('<div class="scroll"><table><tr><th>단계</th><th class="n">표면</th><th class="n">지장간</th><th>실어 나르는 글자</th><th>상태</th><th>막히면 나타나는 것</th></tr>');
  R.flow.stages.forEach(function(s,i){
    w('<tr'+(!s.open?' style="background:var(--warn-bg)"':'')+'>'
     +'<td><b>'+s.group+'</b> <span style="font-size:11px;color:var(--faint)">'+T.GROUP_PLAIN[i]+'</span></td>'
     +'<td class="n">'+s.surface+'</td><td class="n">'+s.hidden+'</td>'
     +'<td>'+(s.carriers.length
        ? s.carriers.map(function(c){
            var cc = c.weak?'bad':(c.strained?'miss':'hit');
            return '<span class="chip '+cc+'">'+c.where+' '+c.ch+((c.weak||c.strained)&&c.why?'·'+c.why:'')+'</span>';
          }).join('')
        : '<span style="color:var(--faint)">—</span>')+'</td>'
     +'<td>'+(s.weakened?'<span class="chip bad">글자는 있으나 전부 무력화</span>'
              :(s.strainedOnly?'<span class="chip miss">살아 있으나 전부 형·파·해</span>'
              :(s.open?'<span class="chip hit">온전</span>'
              :(s.detour?'<span class="chip miss">표면 없음 · 지장간 우회로</span>':'<span class="chip bad">끊김</span>'))))+'</td>'
     +'<td style="font-size:12px;color:var(--muted)">'+(s.open?'—':s.meaning)+'</td></tr>');
  });
  w('</table></div>');
  w('<div class="notice'+(R.flow.broken.length?' warn':' good')+'"><span class="nt">순환 판정</span><p>'
    +R.flow.verdict+'</p><p style="font-size:11.5px">비겁 → 식상 → 재성 → 관성 → 인성 → 비겁 순환입니다. '
    +'<b>완전히 막힌 것과 좁은 통로로 겨우 도는 것은 처방이 다릅니다.</b> 지장간 우회로가 살아 있으면 운에서 그 오행이 올 때 뚫립니다.</p></div>');

  /* ---------- 4. 궁성 대조 ---------- */
  w('<h2><span class="no">04</span>궁성 대조 — 자리(宮)와 별(星)</h2>');
  w('<div class="scroll"><table><tr><th>기둥</th><th>시기</th><th>영역</th><th>천간 (드러남)</th><th>지지 (뿌리)</th></tr>');
  ['연','월','일','시'].forEach(function(l){
    var c=byLab[l];
    if(!c){ w('<tr><td><b>시주</b></td><td>말년</td><td>자식 · 결과물 · 노후</td><td colspan="2" style="color:var(--faint)">시각 미상 — 비어 있음</td></tr>'); return; }
    w('<tr><td><b>'+l+'주</b></td><td>'+c.gung.time+'</td><td>'+c.gung.area+'</td>'
     +'<td><span class="gz">'+c.stem+'</span> '+c.stemTenGod+'</td>'
     +'<td><span class="gz">'+c.branch+'</span> '+c.branchTenGod+'</td></tr>');
  });
  w('</table></div>');
  w('<h3>궁 ↔ 성 일치 여부</h3><div class="scroll"><table><tr><th>궁(자리)</th><th>통상 기대</th><th>실제</th><th>판정</th></tr>');
  R.gungMatch.forEach(function(g){
    w('<tr><td>'+g.gung+'</td><td>'+g.expect+'</td><td>'+g.actual+'</td><td>'
      +(g.match===null?'<span class="chip">판정 불가</span>'
        :g.match?'<span class="chip hit">일치</span>':'<span class="chip miss">어긋남</span>')+'</td></tr>');
  });
  w('</table></div>');
  w('<h3>육친성이 어느 자리에 있나</h3><div class="scroll"><table><tr><th>대상</th><th>해당 십성</th><th>원국 내 위치</th></tr>');
  R.yukchin.forEach(function(r){
    w('<tr><td>'+r.who+'</td><td>'+r.star+' <span style="color:var(--faint);font-size:11.5px">'+r.plain+'</span></td><td>'
      +(r.at.length? r.at.map(function(x){return '<span class="chip">'+x+'</span>';}).join('')
                   : '<span class="chip bad">원국에 없음 (지장간·운에서만)</span>')+'</td></tr>');
  });
  w('</table></div>');
  w('<div class="notice"><span class="nt">읽는 법</span><p><b>어긋남을 흉으로 단정하지 않습니다.</b> 통상적이지 않은 배치라는 정보일 뿐이고, 거기서 이야기가 나옵니다. 배우자궁·자식궁 틀 자체가 여성의 삶이 남편 지위에 종속되던 시대에 만들어진 것이라, 인연의 길흉을 예측하는 용도로는 쓰지 않습니다.</p></div>');

  /* ---------- 5. 형충회합 ---------- */
  w('<h2><span class="no">05</span>형 · 충 · 회합 · 공망</h2>');
  if(R.relations.length){
    w('<div class="scroll"><table><tr><th>종류</th><th>내용</th><th>걸리는 자리</th><th>합화 오행</th></tr>');
    R.relations.forEach(function(r){
      w('<tr><td>'+r.t+'</td><td class="gz">'+r.k+'</td><td>'+r.w+'</td><td>'+(r.el!==undefined?T.EL_FULL[r.el]:'—')+'</td></tr>');
    });
    w('</table></div>');
  } else w('<div class="notice"><p>원국 내 형·충·합 관계가 없습니다.</p></div>');
  w('<p class="sub" style="font-size:12px;color:var(--faint)">공망 = <b class="gz">'+R.gongmang.join(' · ')+'</b> — 해당 지지가 원국에 있으면 그 궁의 힘이 허하게 작동합니다. 충(沖)은 무조건 흉이 아니라 <b>정체를 깨는 힘</b>이라 정리·전환에는 오히려 유리합니다.</p>');
  if(R.gongmangShock.length){
    w('<div class="notice warn"><span class="nt">해공(解空) 논쟁 — 단정하지 말 것</span>'
      +R.gongmangShock.map(function(g){return '<p>· <b>'+g.at+'지 '+g.branch+'</b>가 공망인데 <b>'+g.by+'</b>를 동시에 맞고 있습니다.</p>';}).join('')
      +'<p style="font-size:11.5px">공망 지지가 충이나 합을 맞으면 <b>공망이 풀린다는 설</b>이 있습니다. 유파가 갈리는 지점이라 한쪽으로 단정하지 않고, 두 가능성을 모두 열어둔 채 읽습니다.</p></div>');
  }
  if(R.earth.length){
    w('<p class="sub" style="font-size:12px;color:var(--faint)">토(土)의 성질 — '
      +R.earth.map(function(e){return '<span class="chip'+(e.kind==='습토'?' hit':' miss')+'">'+e.at+'지 '+e.branch+' '+e.kind+'</span>';}).join('')
      +' · <b>辰·丑은 습토라 水를 저장하고, 未·戌은 조토라 火에 가담합니다.</b> 오행 개수에서 「토」로 뭉뚱그리면 조후 판단이 뒤집힙니다.</p>');
  }

  /* ---------- 6. 신강신약 · 용신 ---------- */
  w('<h2><span class="no">06</span>신강 · 신약과 용신 3종</h2>');
  var st=R.strength;
  w('<div class="card"><dl class="kv">');
  w('<dt>판정</dt><dd><b style="font-size:16px">'+st.category+'</b> · 돕는 쪽 '+st.score+'% (돕는 힘 '+st.self+' vs 빼가는 힘 '+st.other+')</dd>');
  w('<dt>근거</dt><dd style="font-size:12.5px;color:var(--muted)">'
    +st.detail.map(function(d){return '<span class="chip">'+d[1]+' '+d[2]+' '+d[0]+d[3]+'</span>';}).join('')+'</dd>');
  w('</dl>');
  if(st.borderline) w('<div class="notice warn" style="margin-bottom:0"><span class="nt">경계값</span><p>'+st.score+'%는 중화 경계에 가깝습니다. 가중치를 조금만 달리 잡아도 <b>신강/신약이 뒤집힙니다.</b> 이 판정 하나에 기대어 결론을 내지 마세요.</p></div>');
  w('</div>');
  var yo=R.yongsin;
  w('<div class="scroll"><table><tr><th>진단</th><th>결과</th><th>근거 · 비고</th></tr>');
  w('<tr><td><b>① 조후</b><br><span style="font-size:11px;color:var(--faint)">사주의 기후</span></td><td>'
    +(yo.johu.use!==null?'<b>'+T.EL_FULL[yo.johu.use]+'</b>':'<span style="color:var(--faint)">해당 없음</span>')
    +(yo.johu.extreme?' <span class="chip bad">극단</span>':'')+'</td><td>'+yo.johu.note+'</td></tr>');
  w('<tr><td><b>② 억부</b><br><span style="font-size:11px;color:var(--faint)">일간의 강약</span></td><td>'
    +(yo.eokbu.primary!==null?'<b>'+T.EL_FULL[yo.eokbu.primary]+'</b>':'<span style="color:var(--faint)">보류</span>')
    +'</td><td>'+yo.eokbu.note
    +(yo.eokbu.use.length?'<br><span style="font-size:11.5px;color:var(--muted)">쓸 것 '+yo.eokbu.use.map(function(i){return T.EL_K[i];}).join('·')
      +' / 피할 것 '+yo.eokbu.avoid.map(function(i){return T.EL_K[i];}).join('·')+'</span>':'')+'</td></tr>');
  w('<tr><td><b>③ 격국</b><br><span style="font-size:11px;color:var(--faint)">월지로 잡는 격</span></td><td><b>'
    +yo.gyeokguk.name+'</b> '+(yo.gyeokguk.tuchul?'<span class="chip hit">투출</span>':'<span class="chip miss">미투출</span>')
    +'</td><td>'+yo.gyeokguk.note+'</td></tr>');
  w('</table></div>');
  if(yo.conflict.length)
    w('<div class="notice warn"><span class="nt">세 진단이 어긋나는 지점</span>'+yo.conflict.map(function(c){return '<p>· '+c+'</p>';}).join('')+'</div>');
  if(yo.primary!==null)
    w('<div class="notice good"><span class="nt">종합</span><p>용신 <b>'+T.EL_FULL[yo.primary]+'</b> · 희신(수원) <b>'
      +T.EL_FULL[yo.suwon]+'</b> — 희신은 그 자체가 목적이 아니라 용신을 만들어내는 공급원입니다.</p></div>');

  /* ---------- 7. 급소 ---------- */
  w('<h2><span class="no">07</span>급소 — 용신이 딛고 선 자리</h2>');
  if(!R.geupso){ w('<div class="notice"><p>용신이 확정되지 않아 급소를 지정할 수 없습니다.</p></div>'); }
  else{
    var g=R.geupso;
    w('<div class="notice'+(g.roots.length<=1?' risk':'')+'"><span class="nt">'+g.verdict+'</span>');
    if(g.surface.length) w('<p>천간 노출 — '+g.surface.map(function(x){return '<span class="chip">'+x+'</span>';}).join('')+'</p>');
    if(g.roots.length){
      w('<table style="margin-top:8px"><tr><th>자리</th><th>지지</th><th>지장간</th><th class="n">일수</th><th>정기</th><th>공망</th></tr>');
      g.roots.forEach(function(r){
        w('<tr'+(g.critical&&g.critical.pillar===r.pillar?' class="cur"':'')+'><td>'+r.pillar+'주</td><td class="gz">'+r.branch+'</td>'
         +'<td class="gz">'+r.stem+'</td><td class="n">'+r.days+'</td><td>'+(r.jeonggi?'정기':'여기')+'</td>'
         +'<td>'+(r.gongmang?'<span class="chip bad">공망</span>':'—')+'</td></tr>');
      });
      w('</table>');
    }
    if(g.critical)
      w('<p style="margin-top:8px"><b>급소 = '+g.critical.pillar+'지 '+g.critical.branch+'</b> — 용신의 뿌리가 여기 '
        +g.critical.days+'일치뿐입니다'+(g.critical.gongmang?' (공망까지 걸림)':'')
        +'. 운에서 이 글자가 합으로 살아나면 기회, 충으로 흔들리면 위험이 됩니다. <b>같은 한 자리를 두고 달에 따라 기회와 위험이 갈립니다.</b></p>');
    w('</div>');
  }

  /* ---------- 8. 대운 ---------- */
  w('<h2><span class="no">08</span>대운 — 10년 배경 기조</h2>');
  var du=R.daeun, nowY=new Date().getFullYear(), age=nowY-R.input.y;
  w('<div class="card"><dl class="kv">');
  w('<dt>방향</dt><dd><b>'+du.direction+'</b> — '+(du.yangYear?'양':'음')+'년생 '+(du.male?'남성':'여성')+'</dd>');
  w('<dt>대운수</dt><dd>'+du.startAge+'세 시작 (절입까지 '+du.daysToBoundary+'일 ÷ 3)</dd>');
  w('</dl></div>');
  var dm=R.saju.day.s;
  function relChips(rs,giban){
    var out = rs.slice().sort(function(a,b){ return (b.geupso?2:0)+(b.near?1:0)-((a.geupso?2:0)+(a.near?1:0)); })
      .map(function(r){
        var cls = r.geupso ? (r.t.indexOf('충')>=0||r.t.indexOf('형')>=0?'bad':'hit') : '';
        return '<span class="chip '+cls+'">'+r.k+(r.at?'·'+r.at:'')+(r.geupso?' ★급소':'')+'</span>';
      }).join('');
    if(giban) out += '<span class="chip bad">기반 — 용신 '+giban+'이 합으로 묶임</span>';
    return out || '<span style="color:var(--faint)">—</span>';
  }
  w('<div class="scroll"><table><tr><th class="n">나이</th><th class="n">연도</th><th>간지</th><th>천간</th><th>지지</th><th>십이운성</th><th>원국 전수 대조</th></tr>');
  du.list.forEach(function(x){
    var cur = (age>=x.age && age<x.age+10);
    w('<tr'+(cur?' class="cur"':'')+'><td class="n">'+x.age+(cur?' ◀':'')+'</td><td class="n">'+x.year+'</td>'
     +'<td class="gz"><b>'+x.gz+'</b></td><td>'+T.TENGOD[E.stemTenGod(dm,x.s)]+'</td><td>'+T.TENGOD[E.branchTenGod(dm,x.b)]+'</td>'
     +'<td>'+E.twelveStage(dm,x.b)+'</td><td>'+relChips(x.rel,x.giban)+'</td></tr>');
  });
  w('</table></div>');
  w('<div class="notice warn"><span class="nt">나이 라벨 주의</span><p>위 나이는 <b>만 나이</b> 기준입니다. 만세력 앱은 세는나이로 표기하는 경우가 많아 <b>대운 시작이 1년 밀려 보일 수 있습니다.</b> 앱과 대조할 때 이 차이를 먼저 확인하세요.</p></div>');

  /* ---------- 9. 세운 ---------- */
  w('<h2><span class="no">09</span>세운 — 연도별</h2>');
  w('<div class="scroll"><table><tr><th class="n">연도</th><th>간지</th><th>천간</th><th>지지</th><th>십이운성</th><th>원국 전수 대조</th></tr>');
  var gb = R.geupso && R.geupso.critical ? R.geupso.critical.bi : null;
  R.seun.forEach(function(x){
    w('<tr'+(x.year===nowY?' class="cur"':'')+'><td class="n">'+x.year+(x.year===nowY?' ◀':'')+'</td><td class="gz"><b>'+x.gz+'</b></td>'
     +'<td>'+T.TENGOD[E.stemTenGod(dm,x.s)]+'</td><td>'+T.TENGOD[E.branchTenGod(dm,x.b)]+'</td>'
     +'<td>'+E.twelveStage(dm,x.b)+'</td><td>'+relChips(x.rel,x.giban)+'</td></tr>');
  });
  w('</table></div>');
  w('<div class="notice"><span class="nt">표 읽는 법</span><p>대운·세운 간지를 <b>원국 네 기둥 전부와 전수 대조</b>한 결과입니다. '
    +'★급소 표시가 붙은 것이 최우선이고, 그다음이 일·시주(인접)와 걸린 관계입니다. '
    +'<b>인접한 기둥의 충합이 멀리 떨어진 것보다 작용이 강합니다.</b> '
    +'「기반」은 용신이 천간합으로 묶여 <b>있어도 역할을 못 하는</b> 상태를 말합니다.</p></div>');

  w('<footer>이 시트는 <b>계산층</b>입니다 — 원국·십성·지장간·궁 배치·용신 후보·급소까지만 냅니다. 해석(궁성 대조를 읽어내고 시기를 판단하는 것)은 이 값들을 근거로 별도로 이루어집니다.<br>'
    +'검증 출처 — 절기: 태양황경 계산(Meeus 저정밀) · 일주 앵커: 1900-01-01 = 甲戌 · 지지 십성: 지장간 <b>본기(本氣) 음양</b> 기준.<br>'
    +'사주는 성향과 경향의 지도이지 결정된 미래가 아닙니다. 건강·법률·금전의 구체적 판단에는 쓰지 않습니다.</footer>');

  document.getElementById('app').innerHTML = H.join('');

  /* ---------- digest (헤드리스가 읽어갈 요약) ---------- */
  var D=[];
  D.push('=== SAJU DIGEST ===');
  D.push('INPUT '+R.input.y+'-'+R.input.m+'-'+R.input.d+' '+hhmm+' '+(R.input.female?'F':'M')+' hourKnown='+R.input.hourKnown);
  D.push('PILLARS(시일월연) '+gzLine);
  D.push('DAYMASTER '+R.dayMaster.c+'('+R.dayMaster.k+') '+R.dayMaster.el+' '+(R.dayMaster.yin?'음':'양')+' / 띠 '+R.zodiac);
  if(R.correction) D.push('CORRECTION(-32m) time='+R.correction.time+' hourChanged='+R.correction.hourChanged
    +' dayChanged='+R.correction.dayChanged+' altHour='+(R.correction.gz||'-'));
  D.push('LAMBDA '+lamDeg+'deg  (절입경계까지 '+(Math.round(into*100)/100)+'deg)');
  ['연','月','월','일','시'].filter(function(x,i){return ['연','월','일','시'].indexOf(x)>=0;}).forEach(function(){});
  ['연','월','일','시'].forEach(function(l){
    var c=byLab[l]; if(!c){ D.push('  '+l+'주 —(없음)'); return; }
    D.push('  '+l+'주 '+c.stem+c.branch+' | 천간십성 '+c.stemTenGod+' | 지지십성 '+c.branchTenGod
      +' | 십이운성 '+c.stage+(c.gongmang?' | 공망':'')
      +' | 지장간 '+c.hidden.map(function(h){return h.stem+h.days+(h.jeonggi?'(정기)':'')+(h.tuchul?'(투출)':'')+'='+h.tenGod;}).join(', ')
      +' | 궁 '+c.gung.time+'/'+c.gung.area);
  });
  D.push('GONGMANG '+R.gongmang.join(','));
  R.charStatus.forEach(function(c){
    D.push('CHAR '+c.label+'간 '+c.stem+'@'+c.branch+' | '+(c.rooted?'통근 '+c.rootDays+'일('
      +c.roots.map(function(r){return r.at+r.branch+r.stem+r.days+(r.jeonggi?'정기':'')+(r.own?'자좌':'');}).join(',')+')':'무근')
      +' | '+(c.jeolgak?'절각':(c.gaedu?'개두':'—'))+' | 12운성 '+c.stage+' | 실질 '+c.verdict+'(score '+c.score+')');
  });
  D.push('FLOW '+R.flow.verdict);
  R.flow.stages.forEach(function(s){
    D.push('  '+s.group+' 표면'+s.surface+' 지장간'+s.hidden+' ['
      +s.carriers.map(function(c){return c.where+c.ch+(c.weak?'(무력:'+(c.why||'충')+')':(c.strained?'(긴장:'+(c.why||'형')+')':''));}).join(' ')+'] '
      +(s.weakened?'전부무력화':(s.strainedOnly?'살아있으나전부형파해':(s.open?'온전':(s.detour?'표면없음·우회로있음':'끊김'))))
      +(s.open?'':' ⇒ '+s.meaning));
  });
  if(R.earth.length) D.push('EARTH '+R.earth.map(function(e){return e.at+e.branch+'='+e.kind;}).join(' '));
  if(R.gongmangShock.length) D.push('HAEGONG(해공논쟁) '+R.gongmangShock.map(function(g){return g.at+g.branch+'←'+g.by;}).join(' | '));
  D.push('TENGOD '+Object.keys(R.tenGodCount).map(function(k){return k+':'+R.tenGodCount[k];}).join(' '));
  D.push('GROUP('+R.cellsCounted+'칸,일간제외) '+T.GROUP_K.map(function(k,i){return k+':'+R.groupCount[i];}).join(' ')+' | 편'+pj.pyeon+' 정'+pj.jeong);
  D.push('GROUP('+R.cellsCountedApp+'칸,앱기준=일간을비견으로포함) '+T.GROUP_K.map(function(k,i){return k+':'+R.groupCountApp[i];}).join(' '));
  D.push('ELEMENT count '+T.EL_K.map(function(k,i){return k+':'+R.power.count[i];}).join(' '));
  D.push('ELEMENT weighted '+T.EL_K.map(function(k,i){return k+':'+(Math.round(R.power.weighted[i]*10)/10);}).join(' '));
  D.push('ELEMENT hidden '+T.EL_K.map(function(k,i){return k+':'+(Math.round(R.power.hidden[i]*10)/10);}).join(' '));
  D.push('STRENGTH '+st.category+' '+st.score+'% self='+st.self+' other='+st.other+(st.borderline?' [BORDERLINE]':''));
  D.push('YONGSIN johu='+(yo.johu.use!==null?T.EL_K[yo.johu.use]:'-')+(yo.johu.extreme?'(극단)':'')
    +' eokbu='+(yo.eokbu.primary!==null?T.EL_K[yo.eokbu.primary]:'-')
    +' gyeokguk='+yo.gyeokguk.name+(yo.gyeokguk.tuchul?'(투출)':'(미투출)')
    +' => primary='+(yo.primary!==null?T.EL_K[yo.primary]:'-')+' suwon='+(yo.suwon!==null?T.EL_K[yo.suwon]:'-'));
  if(yo.conflict.length) D.push('CONFLICT '+yo.conflict.join(' || '));
  if(R.geupso){ D.push('GEUPSO '+R.geupso.verdict
    +(R.geupso.critical?' => '+R.geupso.critical.pillar+'지 '+R.geupso.critical.branch+' ('+R.geupso.critical.stem+R.geupso.critical.days+'일'+(R.geupso.critical.gongmang?', 공망':'')+')':'')
    +' | roots='+R.geupso.roots.map(function(r){return r.pillar+r.branch+'/'+r.stem+r.days;}).join(',')); }
  D.push('RELATIONS '+(R.relations.length? R.relations.map(function(r){return r.t+':'+r.k+'@'+r.w;}).join(' | '):'없음'));
  R.gungMatch.forEach(function(g){ D.push('GUNGMATCH '+g.gung+' 기대='+g.expect+' 실제='+g.actual+' '+(g.match===null?'판정불가':g.match?'일치':'어긋남')); });
  R.yukchin.forEach(function(r){ D.push('YUKCHIN '+r.who+'='+r.star+' @ '+(r.at.length?r.at.join(','):'없음')); });
  D.push('DAEUN '+du.direction+' start='+du.startAge+'세 (절입까지 '+du.daysToBoundary+'일)');
  function relTxt(rs,giban){
    var a = rs.map(function(r){ return r.k+(r.at?'@'+r.at:'')+(r.geupso?'★급소':'')+(r.near?'(인접)':''); });
    if(giban) a.push('기반:용신 '+giban+' 합으로 묶임');
    return a.length? a.join(', ') : '-';
  }
  du.list.forEach(function(x){
    var cur=(age>=x.age && age<x.age+10);
    D.push('  '+(cur?'▶':' ')+x.age+'세~ '+x.year+' '+x.gz+' 천간'+T.TENGOD[E.stemTenGod(dm,x.s)]+' 지지'+T.TENGOD[E.branchTenGod(dm,x.b)]+' '+E.twelveStage(dm,x.b)
      +' || '+relTxt(x.rel,x.giban));
  });
  R.seun.forEach(function(x){
    D.push('SEUN '+x.year+' '+x.gz+' 천간'+T.TENGOD[E.stemTenGod(dm,x.s)]+' 지지'+T.TENGOD[E.branchTenGod(dm,x.b)]+' '+E.twelveStage(dm,x.b)
      +' || '+relTxt(x.rel,x.giban));
  });
  D.push('=== END ===');
  document.getElementById('digest').textContent = D.join('\n');
  document.title = '사주 명식 · '+gzLine;

  return R;
};
