'use strict';
const $ = selector => document.querySelector(selector);
const page = document.body.dataset.page;
$('#notes-toggle').addEventListener('click', () => {
  const open = $('#notes-toggle').getAttribute('aria-expanded') !== 'true';
  $('#notes-toggle').setAttribute('aria-expanded', String(open)); $('#handoff-notes').hidden = !open;
});
$('#menu-toggle').addEventListener('click', () => {
  const open = $('#menu-toggle').getAttribute('aria-expanded') !== 'true';
  $('#menu-toggle').setAttribute('aria-expanded', String(open)); $('#site-nav').classList.toggle('is-open', open);
});
document.querySelectorAll('#site-nav a').forEach(link => link.addEventListener('click', () => {
  $('#menu-toggle').setAttribute('aria-expanded', 'false'); $('#site-nav').classList.remove('is-open');
}));
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));

const infos = {
  discord: {title:'Website forum ↔ Discord',copy:'The proposed bot pairs this website discussion with one Discord forum thread. Questions and replies can appear on both surfaces, showing their author and origin. This wireframe does not send messages or connect to Discord. Gemu needs to confirm public visibility, posting permissions and moderation.'},
  docs: {title:'Documentation',copy:'A proposed route to Gemu’s getting-started guides and technical reference. Documentation availability, destination and access rules need confirmation with Gemu.'},
  privacy: {title:'Privacy and terms',copy:'Gemu’s actual privacy, community and asset terms belong here before launch. This demo sends no form data and stores no personal information. Sample questions and replies exist only in page memory until reload.'},
  updates: {title:'News and updates',copy:'Link to verified Gemu engine, studio and Bootcamp updates. Newsletter collection and its follow-up workflow are not connected in this wireframe.'},
  acquire: {title:'Getting an asset — preview',copy:'A connected marketplace would check the asset’s license, compatibility and any payment before delivering the file or adding it to a Gemu project. No purchase, download or engine connection occurs here.'}
};
function showInfo(key) {
  const info=infos[key]; if(!info) return;
  $('#info-title').textContent=info.title; $('#info-copy').textContent=info.copy; $('#info-dialog').showModal();
}
document.addEventListener('click',event=>{const trigger=event.target.closest('[data-info]');if(trigger)showInfo(trigger.dataset.info);});

const person = [{name:'name',label:'Your name',required:true},{name:'email',label:'Email',type:'email',required:true}];
const stage = {name:'stage',label:'Project stage',type:'select',required:true,options:['Exploring an idea','Building a prototype','Developing a game','Preparing to release']};
const configs = {
  engine:{title:'Request engine access',intro:'Tell Gemu who you are and what you want to build.',submit:'Preview access request',confirmation:'Access request preview',next:'The Gemu team would review your application and contact you with next steps. Approval, delivery and onboarding remain to confirm.',fields:[...person,{name:'studio',label:'Studio or project name (optional)'},stage,{name:'summary',label:'What would you like to build?',type:'textarea',required:true}]},
  publishing:{title:'Submit a game',intro:'Introduce your game and the support you are looking for.',submit:'Preview publishing pitch',confirmation:'Publishing pitch preview',next:'The Gemu team would review your game introduction and follow up. Publishing criteria and response timing remain to confirm.',fields:[...person,{name:'studio',label:'Studio or project name (optional)'},stage,{name:'summary',label:'Tell us about your game',type:'textarea',required:true},{name:'link',label:'Game or pitch link (optional)',type:'url'},{name:'support',label:'What support are you looking for?',type:'textarea',required:true}]},
  bootcamp:{title:'Register Bootcamp interest',intro:'Tell the team what you would like to learn.',submit:'Preview interest registration',confirmation:'Bootcamp interest preview',next:'Gemu would follow up with relevant program information. This is an interest flow; actual enrollment steps and program details remain to confirm.',fields:[...person,{name:'experience',label:'Experience level',type:'select',required:true,options:['New to game development','Student / learning','Independent developer','Working in a studio']},{name:'summary',label:'What would you like to learn?',type:'textarea',required:true}]},
  investment:{title:'Investment or game funding enquiry',intro:'Introduce your area of interest.',submit:'Preview partner enquiry',confirmation:'Partner enquiry preview',next:'The Gemu team would route this enquiry to the relevant person and continue the conversation.',fields:[...person,{name:'organization',label:'Organization (optional)'},{name:'summary',label:'What would you like to discuss?',type:'textarea',required:true}]},
  licensing:{title:'Technology licensing enquiry',intro:'Tell Gemu about your intended use of the technology.',submit:'Preview licensing enquiry',confirmation:'Licensing enquiry preview',next:'The Gemu team would follow up to discuss needs and available licensing options. No licensing terms are established in this demo.',fields:[...person,{name:'organization',label:'Organization (optional)'},{name:'summary',label:'What would you like to use the technology for?',type:'textarea',required:true}]},
  creator:{title:'Share or sell your work',intro:'Introduce a model, environment or tool for review.',submit:'Preview creator submission',confirmation:'Creator submission preview',next:'A real marketplace would review the files, compatibility and license before listing the work. This demo does not upload files or publish a product.',fields:[...person,{name:'title',label:'Asset name',required:true},{name:'category',label:'Category',type:'select',required:true,options:['Models','Environments','Tools']},{name:'summary',label:'Describe the asset',type:'textarea',required:true},{name:'link',label:'Portfolio or file link (optional)',type:'url'}]},
  question:{title:'Ask a question',intro:'Search existing discussions first, then describe your question.',submit:'Add sample question',confirmation:'Question added to this demo',next:'Your question appears in the sample forum for this browser page only. It has not been sent to Discord or saved to a server.',fields:[{name:'name',label:'Display name',required:true},{name:'title',label:'Question title',required:true},{name:'topic',label:'Topic',type:'select',required:true,options:['Getting started','Multiplayer','Assets']},{name:'summary',label:'Question details',type:'textarea',required:true}]},
  reply:{title:'Reply on website',intro:'Add a sample reply to the selected discussion.',submit:'Add sample reply',confirmation:'Reply added to this demo',next:'Your reply appears in the discussion for this browser page only. It has not been synced to Discord or saved to a server.',fields:[{name:'name',label:'Display name',required:true},{name:'summary',label:'Your reply',type:'textarea',required:true}]}
};
let intent='engine';
function openForm(key){
  const config=configs[key];if(!config)return;
  if(key==='reply'&&!selectedQuestion)return;
  intent=key;$('#flow-form').reset();$('#flow-fields').replaceChildren();$('#confirmation-summary').replaceChildren();
  $('#flow-title').textContent=config.title;$('#flow-intro').textContent=config.intro;$('#flow-submit').textContent=config.submit;
  config.fields.forEach(field=>{
    const wrapper=document.createElement('div'),label=document.createElement('label');label.htmlFor='field-'+field.name;label.textContent=field.label;
    let input;
    if(field.type==='select'){
      input=document.createElement('select');const empty=new Option('Choose an option','');input.append(empty);
      field.options.forEach(value=>input.append(new Option(value,value)));
    }else if(field.type==='textarea'){input=document.createElement('textarea');input.rows=3;input.maxLength=1400;}
    else{input=document.createElement('input');input.type=field.type||'text';input.maxLength=250;if(field.name==='email')input.autocomplete='email';if(field.name==='name')input.autocomplete='name';}
    input.id='field-'+field.name;input.name=field.name;input.required=Boolean(field.required);wrapper.append(label,input);$('#flow-fields').append(wrapper);
  });
  $('#flow-switch').replaceChildren();
  if(key==='engine'||key==='publishing'){
    const switcher=document.createElement('button');switcher.type='button';switcher.className='text-button';switcher.dataset.form=key==='engine'?'publishing':'engine';switcher.textContent=key==='engine'?'Looking for publishing? Submit a game':'Looking for the engine? Request access';$('#flow-switch').append(switcher);
  }
  $('#form-content').hidden=false;$('#confirmation').hidden=true;$('#flow-dialog').setAttribute('aria-labelledby','flow-title');$('#flow-dialog').showModal();$('#flow-fields input')?.focus();
}
document.addEventListener('click',event=>{const trigger=event.target.closest('[data-form]');if(trigger)openForm(trigger.dataset.form);});
$('#flow-form').addEventListener('submit',event=>{
  event.preventDefault();if(!$('#flow-form').reportValidity())return;
  const data=Object.fromEntries(new FormData($('#flow-form'))),config=configs[intent];
  if(intent==='question'){
    const question={id:'demo-'+Date.now(),title:data.title,topic:data.topic,name:data.name,body:data.summary,replies:[]};questions.unshift(question);selectedQuestion=question.id;$('#question-search').value='';$('#topic-filter').value='all';renderQuestions();
  }
  if(intent==='reply'){
    questions.find(q=>q.id===selectedQuestion)?.replies.push({name:data.name,origin:'Website',body:data.summary});renderQuestions();
  }
  $('#confirmation-title').textContent=config.confirmation;$('#confirmation-copy').textContent=config.next;
  config.fields.forEach(field=>{if(!data[field.name])return;const p=document.createElement('p'),strong=document.createElement('strong');strong.textContent=field.label+': ';p.append(strong,document.createTextNode(data[field.name]));$('#confirmation-summary').append(p);});
  $('#form-content').hidden=true;$('#confirmation').hidden=false;$('#flow-dialog').setAttribute('aria-labelledby','confirmation-title');$('#flow-dialog').scrollTop=0;$('#confirmation [data-close]').focus();
});
$('#flow-dialog').addEventListener('close',()=>{$('#flow-form').reset();$('#confirmation-summary').replaceChildren();});

const questions=[
  {id:'multiplayer',title:'How would I start a multiplayer project?',topic:'Multiplayer',name:'Sample creator',body:'I am planning a small co-op prototype. Which starting resources should I look for?',replies:[{name:'Sample responder',origin:'Discord',body:'Which engine version and target platform are you using? Share the steps you have tried so the community can help.'}]},
  {id:'voxel-import',title:'How would I bring a voxel model into my project?',topic:'Assets',name:'Sample creator',body:'What compatibility information should I check before choosing an asset?',replies:[{name:'Sample responder',origin:'Website',body:'This sample thread shows where a verified asset-import guide and a related Discord discussion would appear.'}]},
  {id:'access',title:'What should I include when requesting engine access?',topic:'Getting started',name:'Sample creator',body:'I have a prototype idea and would like to introduce it to the Gemu team.',replies:[{name:'Sample responder',origin:'Discord',body:'This demo suggests introducing yourself, your project and its stage. Gemu still needs to confirm its actual qualification fields.'}]}
];
let selectedQuestion=page==='community'?(new URLSearchParams(location.search).get('topic')||questions[0].id):null;
function renderQuestions(){
  const query=$('#question-search').value.toLowerCase().trim(),topic=$('#topic-filter').value;
  const filtered=questions.filter(q=>(topic==='all'||q.topic===topic)&&`${q.title} ${q.body} ${q.topic}`.toLowerCase().includes(query));
  $('#question-count').textContent=`${filtered.length} sample discussion${filtered.length===1?'':'s'}`;$('#question-list').replaceChildren();
  if(!filtered.length){const p=document.createElement('p');p.className='empty-state';p.textContent='No matching sample questions. Try another search or ask a question.';$('#question-list').append(p);selectedQuestion=null;renderDiscussion();return;}
  if(!filtered.some(q=>q.id===selectedQuestion))selectedQuestion=filtered[0].id;
  filtered.forEach(q=>{
    const button=document.createElement('button');button.type='button';button.className='question-card';button.setAttribute('aria-pressed',String(q.id===selectedQuestion));
    const tag=document.createElement('span');tag.className='tag';tag.textContent=q.topic;
    const title=document.createElement('strong');title.textContent=q.title;
    const meta=document.createElement('span');meta.className='small';meta.textContent=`${q.replies.length} sample repl${q.replies.length===1?'y':'ies'}`;
    button.append(tag,title,meta);button.addEventListener('click',()=>{selectedQuestion=q.id;renderQuestions();$('#discussion-title').focus();});$('#question-list').append(button);
  });renderDiscussion();
}
function renderDiscussion(){
  const question=questions.find(q=>q.id===selectedQuestion);$('#discussion-messages').replaceChildren();$('#discussion-actions').hidden=!question;
  $('#discussion-title').tabIndex=-1;
  if(!question){$('#discussion-title').textContent='Find a discussion';$('#discussion-meta').textContent='Choose another search or topic to see sample conversations.';return;}
  $('#discussion-title').textContent=question.title;$('#discussion-meta').textContent=`${question.topic} · Sample content`;
  const messages=[{name:question.name,origin:'Website',body:question.body},...question.replies];
  messages.forEach(message=>{const article=document.createElement('article');article.className='discussion-message';const meta=document.createElement('p');meta.className='message-meta';meta.textContent=`${message.name} · ${message.origin}`;const body=document.createElement('p');body.textContent=message.body;article.append(meta,body);$('#discussion-messages').append(article);});
}
if(page==='community'){$('#question-search').addEventListener('input',renderQuestions);$('#topic-filter').addEventListener('change',renderQuestions);renderQuestions();}

const assets=[
 {id:'cabin',name:'Timber cabin kit',category:'Models',image:'media/voxel-cabin.png',alt:'Voxel timber cabin and modular building pieces',description:'An illustrative modular cabin and building-piece set for a voxel world.'},
 {id:'forest',name:'Forest environment',category:'Environments',image:'media/voxel-world.png',alt:'Voxel pine forest, river and timber outpost',description:'An illustrative landscape concept with forest, terrain and water.'},
 {id:'robot',name:'Utility robot',category:'Models',image:'media/voxel-robot.png',alt:'Voxel utility robot on a neutral background',description:'An illustrative voxel character with a clear block-based silhouette.'},
 {id:'world-kit',name:'World-building toolkit',category:'Tools',image:'media/voxel-cabin.png',alt:'Modular voxel building pieces beside a cabin',description:'A sample listing to demonstrate how a creator tool could appear in the catalog. No tool is included.'}
];
let selectedAsset=null;
function renderAssets(){
  const query=$('#asset-search').value.toLowerCase().trim(),category=$('#asset-category').value;
  const filtered=assets.filter(a=>(category==='all'||category===a.category)&&`${a.name} ${a.category} ${a.description}`.toLowerCase().includes(query));
  $('#asset-count').textContent=`${filtered.length} sample listing${filtered.length===1?'':'s'}`;$('#asset-list').replaceChildren();
  if(!filtered.length){const p=document.createElement('p');p.className='empty-state';p.textContent='No matching sample assets. Try another search or category.';$('#asset-list').append(p);}
  if(selectedAsset&&!filtered.some(a=>a.id===selectedAsset))closeAsset();
  filtered.forEach(asset=>{
    const card=document.createElement('article');card.className='asset-card';const button=document.createElement('button');button.type='button';button.className='asset-select';button.setAttribute('aria-label',`View ${asset.name}`);
    const image=document.createElement('img');image.src=asset.image;image.alt=asset.alt;const text=document.createElement('div');text.className='asset-card-copy';const tag=document.createElement('span');tag.className='tag';tag.textContent=asset.category;
    const title=document.createElement('h3');title.textContent=asset.name;const note=document.createElement('p');note.className='small';note.textContent='Concept image · Sample listing';text.append(tag,title,note);button.append(image,text);button.addEventListener('click',()=>openAsset(asset));card.append(button);$('#asset-list').append(card);
  });
}
function openAsset(asset){
  selectedAsset=asset.id;$('#asset-title').textContent=asset.name;$('#asset-type').textContent=asset.category;$('#asset-description').textContent=asset.description;$('#asset-image').src=asset.image;$('#asset-image').alt=asset.alt;
  $('#asset-detail').hidden=false;$('#assets-layout').classList.add('has-detail');$('#asset-title').focus();
}
function closeAsset(){selectedAsset=null;$('#asset-detail').hidden=true;$('#assets-layout').classList.remove('has-detail');}
if(page==='assets'){
  $('#asset-search').addEventListener('input',renderAssets);$('#asset-category').addEventListener('change',renderAssets);$('#close-asset').addEventListener('click',closeAsset);renderAssets();
  const deepLink=assets.find(a=>a.id===new URLSearchParams(location.search).get('asset'));if(deepLink)openAsset(deepLink);
}
