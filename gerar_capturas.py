import os
from datetime import datetime,timedelta
from playwright.sync_api import sync_playwright
root=os.path.dirname(__file__)
html=open(os.path.join(root,'backend','public','index.html')).read()
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':540,'height':960},device_scale_factor=2,is_mobile=True,has_touch=True)
 page.set_content(html,wait_until='load')
 page.evaluate("document.getElementById('toast').hidden=true")
 page.screenshot(path=os.path.join(root,'play_store','captura_1_agendamento.png'))
 d=(datetime.now()+timedelta(days=3)).strftime('%Y-%m-%d')
 page.evaluate('''(day)=>{window.tok='amostra';window.role='d';document.getElementById('bP').setAttribute('aria-pressed','false');document.getElementById('bD').setAttribute('aria-pressed','true');document.getElementById('toast').hidden=true;window.st.mes=day.slice(0,7);window.db=[{id:'exemplo1',name:'Paciente demonstrativo',phone:'14999999999',proc:'Limpeza e profilaxia',price:180,day:day,time:'09:00',status:'agendada'},{id:'exemplo2',name:'Consulta de exemplo',phone:'14999999999',proc:'Consulta e avaliação',price:120,day:day,time:'11:00',status:'concluída'}];render();}''',d)
 page.screenshot(path=os.path.join(root,'play_store','captura_2_painel.png'))
 browser.close()
print('Capturas de interface geradas; painel mostra dados de exemplo para demonstração')
