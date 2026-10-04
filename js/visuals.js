const ASSET_ROOT = '/assets';

function haystack(parts) {
  return parts.filter(Boolean).join(' ').toLowerCase();
}

function byKeyword(text, map, fallback='server') {
  for (const [kind, words] of Object.entries(map)) {
    if (words.some(word => text.includes(word))) return kind;
  }
  return fallback;
}

const CASE_KEYWORDS = {
  login: ['login','password','mfa','session','credential','token','badge','identity','auth','saml','oidc','kerberos'],
  mail: ['mail','email','inbox','attachment','invoice','phish','phishing','message','reply-to'],
  network: ['network','dns','route','traffic','printer','device','east-west','proxy','header','segment','router','firewall','ip '],
  cloud: ['cloud','iam','role','aws','gcp','azure','bucket','service account','assumerole','policy'],
  server: ['build','host','process','malware','workstation','server','runner','pipeline','container','kubernetes','pod','docker'],
  phone: ['phone','sms','mobile','telegram','whatsapp','sim','ios','android'],
  database: ['record','database','table','backup','snapshot','cache','customer','data'],
  browser: ['browser','page','website','web','api','request','http','form','portal'],
};

const EVIDENCE_KEYWORDS = {
  login: ['login','account','session','identity','ticket','mfa'],
  mail: ['mail','email','message','attachment','phish'],
  network: ['ip','dns','traffic','device','port','network','proxy','route'],
  cloud: ['cloud','bucket','iam','role','service account','policy'],
  server: ['process','host','terminal','command','build','script','binary'],
  phone: ['phone','mobile','sms','chat'],
  database: ['record','database','backup','snapshot','table','cache'],
  browser: ['browser','page','link','request','website'],
};

const EVIDENCE_TYPE_MAP = {
  Interview: 'login',
  Mail: 'mail',
  Email: 'mail',
  Browser: 'browser',
  Web: 'browser',
  DNS: 'network',
  Log: 'network',
  Network: 'network',
  Host: 'server',
  Process: 'server',
  Endpoint: 'server',
  Cloud: 'cloud',
  IAM: 'cloud',
  Database: 'database',
  Record: 'database',
  Mobile: 'phone',
  Chat: 'phone'
};

export function caseSceneAsset(c) {
  const text = haystack([c.title, c.subtitle, c.brief, c.environment, ...(c.tools||[])]);
  const kind = byKeyword(text, CASE_KEYWORDS, 'server');
  return `${ASSET_ROOT}/scene-${kind}.svg`;
}

export function caseSceneKind(c) {
  const text = haystack([c.title, c.subtitle, c.brief, c.environment]);
  return byKeyword(text, CASE_KEYWORDS, 'server');
}

export function evidenceSceneAsset(e={}) {
  const typeKind = EVIDENCE_TYPE_MAP[e.type] || null;
  const text = haystack([e.type, e.title, e.summary, e.detail]);
  const keywordKind = byKeyword(text, EVIDENCE_KEYWORDS, typeKind || 'server');
  return `${ASSET_ROOT}/scene-${keywordKind}.svg`;
}

export function caseVisualBadges(c) {
  const out = [];
  if ((c.tools||[]).includes('mail')) out.push('Inbox clues');
  if ((c.tools||[]).includes('logs')) out.push('Timeline traces');
  if ((c.tools||[]).includes('browser')) out.push('Web surface');
  if ((c.tools||[]).includes('terminal')) out.push('Machine snapshot');
  return out.slice(0,3);
}

export function caseMoodCopy(c) {
  const kind = caseSceneKind(c);
  return {
    login: 'Identity trail / trust broken',
    mail: 'Social engineering / message trail',
    network: 'Hidden movement / path analysis',
    cloud: 'Permissions drift / cloud trust',
    server: 'Execution chain / host behavior',
    phone: 'Mobile signal / chat artifacts',
    database: 'Records out of place / data exposure',
    browser: 'Web request / browser truth'
  }[kind];
}

export function caseGallery(c) {
  const primary = caseSceneAsset(c);
  const extras = [];
  const tools = c.tools || [];
  if (tools.includes('mail')) extras.push({label:'Inbox clue', asset:`${ASSET_ROOT}/scene-mail.svg`});
  if (tools.includes('browser')) extras.push({label:'Web surface', asset:`${ASSET_ROOT}/scene-browser.svg`});
  if (tools.includes('logs')) extras.push({label:'Trace path', asset:`${ASSET_ROOT}/scene-network.svg`});
  if (tools.includes('terminal')) extras.push({label:'Machine state', asset:`${ASSET_ROOT}/scene-server.svg`});
  if (!extras.length) extras.push({label:'Case visual', asset:primary});
  const uniq = [];
  const seen = new Set();
  [{label:'Case visual', asset:primary}, ...extras].forEach(item => {
    if (seen.has(item.asset)) return;
    seen.add(item.asset);
    uniq.push(item);
  });
  return uniq.slice(0,3);
}
