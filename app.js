const SB_URL='https://wyffeifapgjyndsickzw.supabase.co';
const SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5ZmZlaWZhcGdqeW5kc2lja3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwNzM3NjgsImV4cCI6MjEwOTY0OTc2OH0.AXafD7_W1P5VsxagcBbFzX1oYZ3sewuLIEvrbaIaogQ';
const sb=supabase.createClient(SB_URL,SB_KEY);
const GV={
  user:null,profile:null,
  async init(){
    const {data:{session}}=await sb.auth.getSession();
    this.user=session?session.user:null;
    if(this.user)await this.loadProfile();
    sb.auth.onAuthStateChange((ev,s)=>{if(ev==='SIGNED_OUT'&&location.pathname!=='/index.html'&&location.pathname!=='/'){location.href='index.html';}});
    return this.user;
  },
  async loadProfile(){
    if(!this.user)return null;
    const {data}=await sb.from('givya_profiles').select('*').eq('id',this.user.id).maybeSingle();
    this.profile=data;return data;
  },
  async refreshPoints(){await this.loadProfile();return this.profile?(this.profile.points||0):0;},
  initials(n){return (n||'G').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase()||'G';},
  pts(n){return Number(n||0).toLocaleString('en-NG');},
  naira(n){if(n===null||n===undefined||n==='')return '';return '\u20A6'+Number(n).toLocaleString('en-NG');},
  toast(msg){let t=document.getElementById('gvtoast');if(!t){t=document.createElement('div');t.id='gvtoast';t.className='toast';document.body.appendChild(t);}t.textContent=msg;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),2800);},
  async needAuth(){
    await this.init();
    if(this.user)return true;
    let g=document.getElementById('gvgate');
    if(!g){document.body.insertAdjacentHTML('beforeend',this.gateHTML());g=document.getElementById('gvgate');}
    g.style.display='flex';return false;
  },
  gateHTML(){return '<div id="gvgate" class="modal" style="display:none"><div class="sheet" style="text-align:center"><div style="font-size:40px">\uD83C\uDF81</div><h2 style="margin:8px 0 6px">Join GIVYA first</h2><p class="sub" style="margin-bottom:18px">Create a free account to use this. It takes a minute, and you start with 100 points.</p><a class="btn" href="index.html?auth=1">Create account / Sign in</a></div></div>';},
  shareLink(path,q){return location.origin+'/'+path+'?'+q;}
};
async function gvInitHeader(){
  const u=await GV.init();
  const av=document.getElementById('gvAvatar'),nm=document.getElementById('gvName'),hi=document.getElementById('gvHello'),pt=document.getElementById('gvPts');
  const name=u?(GV.profile&&GV.profile.display_name?GV.profile.display_name:(u.user_metadata&&u.user_metadata.display_name)||'Friend'):'';
  if(av)av.textContent=GV.initials(name);
  if(nm)nm.textContent=name;
  if(hi)hi.textContent=gvGreeting()+(name?', '+name.split(' ')[0]:'')+' \uD83D\uDC4B';
  if(pt)pt.textContent=GV.profile?GV.pts(GV.profile.points)+' pts':'Sign in';
  return u;
}
function gvGreeting(){const h=new Date().getHours();return h<12?'Good morning':h<17?'Good afternoon':'Good evening';}
function gvShare(text){if(navigator.share){navigator.share({text}).catch(()=>{});}else{navigator.clipboard.writeText(text);GV.toast('Link copied');}}
