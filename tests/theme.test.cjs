const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync(require('node:path').join(__dirname,'../dist/theme.js'),'utf8');
function run({saved=null,systemDark=false,blocked=false}={}){
 const events={},mediaEvents={},root={dataset:{},style:{}};
 const media={matches:systemDark,addEventListener:(name,fn)=>mediaEvents[name]=fn};
 const document={documentElement:root,readyState:'loading',querySelector:()=>null,querySelectorAll:()=>[],addEventListener:(name,fn)=>events[name]=fn};
 vm.runInNewContext(source,{document,matchMedia:()=>media,localStorage:{getItem:()=>{if(blocked)throw Error('Storage blocked');return saved;}},addEventListener:(name,fn)=>events[name]=fn});
 return {root,events,media,mediaEvents};
}
test('first visit follows system preference and later system changes',()=>{
 const s=run({systemDark:true});assert.equal(s.root.dataset.theme,'dark');
 s.media.matches=false;s.mediaEvents.change();assert.equal(s.root.dataset.theme,'light');
});
test('saved light preference stays light when the operating system is dark',()=>{
 const s=run({saved:'light',systemDark:true});assert.equal(s.root.dataset.theme,'light');
 s.mediaEvents.change();assert.equal(s.root.dataset.theme,'light');
});
test('saved dark preference stays dark on a light system',()=>assert.equal(run({saved:'dark'}).root.dataset.theme,'dark'));
test('unknown preferences and unavailable storage safely fall back to the system',()=>{
 assert.equal(run({saved:'invalid',systemDark:true}).root.dataset.theme,'dark');
 assert.equal(run({blocked:true,systemDark:true}).root.dataset.theme,'dark');
});
test('theme changes in another tab are synchronized and clearing the preference restores system mode',()=>{
 const s=run({systemDark:false});s.events.storage({key:'nemo-color-theme',newValue:'dark'});assert.equal(s.root.dataset.theme,'dark');
 s.events.storage({key:'nemo-color-theme',newValue:null});assert.equal(s.root.dataset.theme,'light');
});
