// odontai: servidor sem dependências (Node 22+). Banco SQLite em arquivo.
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const {DatabaseSync}=require('node:sqlite');
const E=process.env,PORT=E.PORT||3000;
if(!E.DENTIST_PASSWORD||!E.SECRET){console.error('Defina DENTIST_PASSWORD e SECRET.');process.exit(1)}
const PROC=[["Consulta e avaliação",120],["Limpeza e profilaxia",180],["Clareamento",450],["Restauração",260],["Tratamento de canal",700]];
const HOURS=["08:00","09:00","10:00","11:00","14:00","15:00","16:00","17:00"];
const db=new DatabaseSync(E.DB_FILE||'odontai.db');
db.exec(`create table if not exists appts(id text primary key,key text,name text,phone text,proc text,price integer,day text,time text,pay text,status text default 'agendada',paid integer default 0,created text);
create unique index if not exists slot on appts(day,time) where status!='cancelada';`);
const sign=s=>crypto.createHmac('sha256',E.SECRET).update(s).digest('hex');
const eq=(a,b)=>{a=Buffer.from(String(a));b=Buffer.from(String(b));return a.length===b.length&&crypto.timingSafeEqual(a,b)};
const token=()=>{const x=Date.now()+12*3600e3;return x+'.'+sign('d'+x)};
const isDentist=req=>{const t=(req.headers.authorization||'').slice(7),[x,s]=t.split('.');return !!s&&+x>Date.now()&&eq(s,sign('d'+x))};
const tries={};
const send=(res,c,o)=>{res.writeHead(c,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'"});res.end(JSON.stringify(o))};
const body=req=>new Promise((ok,no)=>{let d='';req.on('data',c=>{d+=c;if(d.length>10000){no();req.destroy()}});req.on('end',()=>{try{ok(JSON.parse(d||'{}'))}catch{no()}})});
const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Sao_Paulo'});
const validDay=s=>{if(typeof s!=='string'||!/^(\d{4})-(\d{2})-(\d{2})$/.test(s))return false;const d=new Date(s+'T12:00:00Z');return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===s&&d.getUTCDay()!==0&&s>=today()};
const clean=r=>{const{key,phone,...o}=r;return o};

http.createServer(async(req,res)=>{
 try{
  const u=new URL(req.url,'http://x'),p=u.pathname,ip=req.socket.remoteAddress;
  if(p.startsWith('/api/')){
   if(p==='/api/login'&&req.method==='POST'){
    const t=tries[ip]=(tries[ip]||[]).filter(x=>x>Date.now()-6e5);
    if(t.length>=5)return send(res,429,{error:'Muitas tentativas. Aguarde 10 minutos.'});
    const b=await body(req);
    if(!eq(b.password||'',E.DENTIST_PASSWORD)){t.push(Date.now());return send(res,401,{error:'Senha incorreta.'})}
    return send(res,200,{token:token()});
   }
   if(p==='/api/appts'&&req.method==='GET'){
    const rows=db.prepare('select * from appts order by day,time').all();
    if(isDentist(req))return send(res,200,rows.map(r=>{const{key,...o}=r;return o}));
    const mine=(u.searchParams.get('mine')||'').split(',').map(s=>s.split(':'));
    return send(res,200,rows.filter(r=>r.status!=='cancelada'||mine.some(m=>m[0]===r.id)).map(r=>
     mine.some(m=>m[0]===r.id&&eq(m[1]||'',r.key))?{...clean(r),mine:true}:{day:r.day,time:r.time,status:r.status}));
   }
   if(p==='/api/appts'&&req.method==='POST'){
    const b=await body(req),pr=PROC[b.proc],ph=String(b.phone||'').replace(/\D/g,''),nm=String(b.name||'').trim().slice(0,80);
    if(!pr||!validDay(b.day)||!HOURS.includes(b.time)||nm.length<3||ph.length<10)
     return send(res,400,{error:'Dados inválidos. Confira o formulário.'});
    const id=crypto.randomUUID(),key=crypto.randomBytes(16).toString('hex');
    try{db.prepare('insert into appts(id,key,name,phone,proc,price,day,time,created) values(?,?,?,?,?,?,?,?,?)').run(id,key,nm,ph,pr[0],pr[1],b.day,b.time,new Date().toISOString())}
    catch{return send(res,409,{error:'Esse horário acabou de ser ocupado. Escolha outro.'})}
    return send(res,201,{id,key});
   }
   // Exclusão definitiva do registro mediante chave secreta entregue no agendamento.
   const deletion=p.match(/^\/api\/appts\/([\w-]+)$/);
   if(deletion&&req.method==='DELETE'){
     const b=await body(req),r=db.prepare('select id,key from appts where id=?').get(deletion[1]);
     if(!r||!eq(b.key||'',r.key))return send(res,403,{error:'Sem permissão.'});
     db.prepare('delete from appts where id=?').run(deletion[1]);
     return send(res,200,{ok:true});
   }
   const m=p.match(/^\/api\/appts\/([\w-]+)$/);
   if(m&&req.method==='PATCH'){
    const b=await body(req),r=db.prepare('select * from appts where id=?').get(m[1]),dent=isDentist(req);
    if(!r||(!dent&&!eq(b.key||'',r.key)))return send(res,403,{error:'Sem permissão.'});
    if(r.status!=='agendada')return send(res,409,{error:'Essa consulta já foi encerrada.'});
    if(!['cancelada','concluída'].includes(b.status)||(!dent&&b.status!=='cancelada'))return send(res,400,{error:'Ação inválida.'});
    db.prepare('update appts set status=? where id=?').run(b.status,m[1]);
    return send(res,200,{ok:true});
   }
   return send(res,404,{error:'Não encontrado.'});
  }
  const f={'/':'index.html','/privacidade':'privacidade.html'}[p];
  if(!f)return send(res,404,{error:'Não encontrado.'});
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; object-src 'none'; frame-ancestors 'none'; base-uri 'none'"});
  res.end(fs.readFileSync(path.join(__dirname,'public',f)));
 }catch(e){send(res,400,{error:'Requisição inválida.'})}
}).listen(PORT,()=>console.log('odontai em http://localhost:'+PORT));
