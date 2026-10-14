(() => {
 const target=document.querySelector('#preview-content');
 target.innerHTML='<p class="preview-waiting">편집 중인 내용을 불러오고 있습니다.</p>';
 addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==parent||event.data?.type!=='nemo-draft-preview')return;const {post,postType,pool}=event.data;if(!post||!['portfolio','news'].includes(postType)||!Array.isArray(pool))return;target.innerHTML=window.NEMO_RENDER.render(post,postType,pool,false);window.NEMO_RENDER.layout(target);document.title=(post.title||'새 글')+' · 최종 미리보기';});
 document.addEventListener('click',event=>{const a=event.target.closest('a');if(a&&!a.getAttribute('href')?.startsWith('#'))event.preventDefault();});
 parent.postMessage({type:'nemo-preview-ready'},location.origin);
})();
