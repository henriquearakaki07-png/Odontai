import subprocess,urllib.request,json,os,time,tempfile
p=os.path.dirname(__file__)
env=os.environ.copy();env.update(PORT='31987',SECRET='test-secret-123456789-123456789',DENTIST_PASSWORD='test-password-strong',DB_FILE=os.path.join(tempfile.mkdtemp(),'test.db'))
proc=subprocess.Popen(['node','server.js'],cwd=os.path.join(p,'backend'),env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
try:
 for i in range(30):
  try:
   urllib.request.urlopen('http://127.0.0.1:31987/').read();break
  except Exception:time.sleep(.2)
 def api(path,method='GET',data=None,auth=None):
  headers={'Content-Type':'application/json'}
  if auth:headers['Authorization']='Bearer '+auth
  req=urllib.request.Request('http://127.0.0.1:31987'+path,headers=headers,method=method,data=json.dumps(data).encode() if data is not None else None)
  with urllib.request.urlopen(req) as r:return json.load(r)
 from datetime import datetime,timedelta
 dt=datetime.now()+timedelta(days=3)
 while dt.weekday()==6:dt+=timedelta(days=1)
 day=dt.strftime('%Y-%m-%d')
 ap=api('/api/appts','POST',{'proc':0,'day':day,'time':'08:00','name':'Paciente Teste','phone':'14999999999'})
 own=api('/api/appts?mine='+ap['id']+':'+ap['key']);assert any(x.get('mine') for x in own)
 login=api('/api/login','POST',{'password':env['DENTIST_PASSWORD']})
 allr=api('/api/appts',auth=login['token']);assert len(allr)==1 and allr[0]['name']=='Paciente Teste'
 assert api('/api/appts/'+ap['id'],'PATCH',{'status':'concluída'},auth=login['token'])['ok']
 assert api('/api/appts',auth=login['token'])[0]['status']=='concluída'
 assert 'Pague na clínica' in urllib.request.urlopen('http://127.0.0.1:31987/').read().decode()
 # Exclusão do dado pessoal, também após consulta encerrada
 assert api('/api/appts/'+ap['id'],'DELETE',{'key':ap['key']})['ok']
 assert api('/api/appts',auth=login['token'])==[]
 # Data impossível deve ser rejeitada
 import urllib.error
 try:
  api('/api/appts','POST',{'proc':0,'day':'2027-02-30','time':'08:00','name':'Paciente Teste','phone':'14999999999'})
  raise AssertionError('Dia impossível aceito')
 except urllib.error.HTTPError as e:assert e.code==400
 print('APROVADO: agendamento, identificação do paciente, autenticação do dentista, conclusão da consulta e interface')
finally:
 proc.terminate();proc.wait(timeout=4)
