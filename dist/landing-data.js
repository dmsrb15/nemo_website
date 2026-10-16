(function(root){
 const regions=[
  ['seoul','서울',26.48,23.14],['incheon','인천',22,25],['suwon','수원',28,29],['chuncheon','춘천',42,18],['gangneung','강릉',56.41,20.03],['cheongju','청주',37,38],['daejeon','대전',32.81,42.87],['jeonju','전주',27,53],['gwangju','광주',24.4,62.27],['mokpo','목포',19,68],['daegu','대구',52.06,50.67],['andong','안동',52,39],['ulsan','울산',61,55],['busan','부산',59.56,61.94],['changwon','창원',50,63],['jeju','제주',19.32,89.31]
 ].map(([id,label,x,y])=>({id,label,x,y}));
 const defaults={reviewEyebrow:'LIFE IN A NEW SPACE',reviewTitle:'공간에 담고 싶은,\n우리의 이야기.',totalLabel:'Total Projects',totalProjects:'200+',overseasLabel:'Abroad',overseasProjects:'5+',dataSource:'Data - NEMO',
 marquee:[{text:'집에 돌아오는 시간이 기다려지는 공간을 원해요.',label:'주거 공간'},{text:'말로 설명하기 어려운 취향도 공간에 담고 싶어요.',label:'주거 공간'},{text:'작은 매장에도 우리 브랜드의 분위기를 담고 싶어요.',label:'상업 공간'},{text:'편한 동선으로 매일의 생활이 달라졌으면 해요.',label:'주거 공간'},{text:'손님이 편하게 머물다 가는 공간을 만들고 싶어요.',label:'상업 공간'}],
 domestic:[
  {id:'seoul',region:'seoul',mapLabel:'서울',kind:'주거 공간',person:'김** 님',quote:'좋아하는 색과 소재를 하나씩 이야기했는데, 완성된 공간에 제 취향이 자연스럽게 담겼어요.'},
  {id:'gangneung',region:'gangneung',mapLabel:'강릉',kind:'카페',person:'박** 님',quote:'창밖 풍경과 실내 분위기가 이어져요. 손님들이 편하게 머무는 모습을 보면 기분이 좋아요.'},
  {id:'daejeon',region:'daejeon',mapLabel:'대전',kind:'주거 공간',person:'이** 님',quote:'수납과 동선을 함께 바꾸니 집이 훨씬 편해졌어요. 같은 면적인데도 더 넓게 느껴져요.'},
  {id:'daegu',region:'daegu',mapLabel:'대구',kind:'브랜드 매장',person:'정** 님',quote:'작은 매장 안에서도 우리 브랜드의 색이 또렷하게 보여요. 처음 들어오는 순간부터 분위기가 달라졌어요.'},
  {id:'busan',region:'busan',mapLabel:'부산',kind:'주거 공간',person:'최** 님',quote:'빛이 들어오는 방향까지 생각해주셨어요. 아침마다 거실에 앉아 있는 시간이 즐거워졌어요.'},
  {id:'gwangju',region:'gwangju',mapLabel:'광주',kind:'작업 공간',person:'한** 님',quote:'작업에 집중하는 자리와 쉬는 자리를 나누니 하루의 리듬이 더 좋아졌어요.'},
  {id:'jeju',region:'jeju',mapLabel:'제주',kind:'숙박 공간',person:'오** 님',quote:'자연스러운 소재와 따뜻한 조명 덕분에, 잠깐 머물러도 오래 기억되는 공간이 됐어요.'}
 ],overseas:[{id:'australia',country:'호주',title:'향수매장',description:''}]};
 function pickProjects(pool,category='전체',limit=6,random=Math.random){const seen=new Set(),items=pool.filter(p=>p&&p.id&&!seen.has(p.id)&&(seen.add(p.id),true)&&(category==='전체'||p.category===category));for(let i=items.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[items[i],items[j]]=[items[j],items[i]];}return items.slice(0,limit);}
 function groupReviews(items){const groups=new Map();for(const review of items){const region=regions.find(r=>r.id===review.region);if(!region)continue;if(!groups.has(region.id))groups.set(region.id,{...region,label:review.mapLabel||region.label,reviews:[]});groups.get(region.id).reviews.push(review);}return [...groups.values()];}
 function nearestRegion(x,y){return regions.reduce((best,r)=>Math.hypot(r.x-x,r.y-y)<Math.hypot(best.x-x,best.y-y)?r:best,regions[0]);}
 const api={regions,defaults,pickProjects,groupReviews,nearestRegion};if(typeof module==='object'&&module.exports)module.exports=api;else root.NEMO_LANDING=api;
})(typeof window==='object'?window:globalThis);
