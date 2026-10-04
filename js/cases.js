const e = (id, title, type, summary, detail) => ({ id, title, type, summary, detail });

export const cases = [
  {
    id: 'C001',
    title: '03:17',
    subtitle: 'A login happened while the account owner was asleep.',
    tier: 'Entry investigation',
    brief: 'Mara Villanueva reports that her company account locked her out this morning. IT saw a successful login at 03:17. She says she was asleep and her laptop was at home. Determine what happened, how confident you are, and what should be done first.',
    environment: 'Northstar Design / identity + employee laptop snapshot',
    tools: ['overview','mail','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence: [
      e('ev1','Mara\'s statement','Interview','Mara says she did not work after 22:30 and did not approve any login prompt overnight.','Statement taken 08:42. Laptop was reportedly on her home Wi‑Fi. She remembers receiving an unexpected “shared payroll” email yesterday.'),
      e('ev2','03:17 successful sign-in','Identity log','Successful authentication from 185.203.118.42 followed by a token refresh.','User: mara.v@northstar.test\n03:17:08 SUCCESS password\n03:17:11 MFA challenge: not issued\n03:18:02 token refresh\nClient: Chrome / Windows'),
      e('ev3','Normal evening sign-in','Identity log','A 21:54 sign-in came from Mara\'s usual residential IP and known device.','User: mara.v@northstar.test\n21:54:33 SUCCESS\nIP: 49.145.22.18\nDevice ID: NV-LT-044\nMFA: satisfied'),
      e('ev4','Payroll share message','Email','An email from an external lookalike sender asked Mara to open a shared payroll sheet.','Display name: Northstar Payroll\nActual sender: payroll-share@northstarr-docs.test\nLink: https://northstarr-docs.test/share/8472'),
      e('ev5','Browser visit','Browser artifact','Mara\'s browser history contains a visit to northstarr-docs.test at 16:21.','16:21:11 GET /share/8472\n16:21:39 POST /session/validate\n16:22:04 redirect -> login.microsoftonline.example'),
    ],
    mails: [
      { id:'m1', from:'Northstar Payroll <payroll-share@northstarr-docs.test>', to:'Mara Villanueva <mara.v@northstar.test>', subject:'Payroll adjustment sheet — review today', date:'Yesterday 16:18', body:'Hi Mara,\n\nFinance updated the September adjustment sheet. Please review your row before 5 PM.\n\nOpen shared sheet: https://northstarr-docs.test/share/8472\n\nThanks,\nPayroll', raw:'Received-SPF: neutral\nAuthentication-Results: dkim=none; dmarc=fail\nReturn-Path: <bounce@northstarr-docs.test>\nX-Originating-IP: 185.203.118.19' },
      { id:'m2', from:'People Ops <people@northstar.test>', to:'Mara Villanueva <mara.v@northstar.test>', subject:'September payroll cutoff', date:'3 days ago', body:'Reminder: payroll corrections close Friday. Use the HR portal from the company intranet. People Ops will never send a separate external payroll login.', raw:'Authentication-Results: spf=pass; dkim=pass; dmarc=pass\nReturn-Path: <people@northstar.test>' }
    ],
    logs: [
      { id:'identity', name:'Identity', text:`2026-09-12T21:54:33Z user=mara.v result=SUCCESS ip=49.145.22.18 device=NV-LT-044 mfa=SATISFIED\n2026-09-13T03:17:08Z user=mara.v result=SUCCESS ip=185.203.118.42 device=UNKNOWN mfa=NOT_ISSUED\n2026-09-13T03:18:02Z user=mara.v event=TOKEN_REFRESH ip=185.203.118.42\n2026-09-13T03:20:44Z user=mara.v event=MAILBOX_RULE_CREATE ip=185.203.118.42 rule="archive security notices"\n2026-09-13T07:58:10Z user=mara.v result=FAILED ip=49.145.22.18 reason=PASSWORD_CHANGED` },
      { id:'browser', name:'Browser history', text:`16:18:52 mail.northstar.test/message/92831\n16:21:11 northstarr-docs.test/share/8472\n16:21:39 northstarr-docs.test/session/validate\n16:22:04 login.microsoftonline.example/common/oauth2\n16:24:12 docs.northstar.test/project/harbor` }
    ],
    terminal: [
      [/^help$/i, 'Try: whoami, pwd, ls, cat browser_history.txt, cat known_ips.txt, nslookup <domain>, grep <word> <file>'],
      [/^whoami$/i, 'analyst\\trainee'],
      [/^pwd$/i, '/cases/C001/snapshot'],
      [/^ls$/i, 'browser_history.txt  known_ips.txt  readme.txt'],
      [/^cat readme\.txt$/i, 'Read-only snapshot. No live production systems are connected to this training environment.'],
      [/^cat browser_history\.txt$/i, '16:21:11 northstarr-docs.test/share/8472\n16:21:39 northstarr-docs.test/session/validate\n16:22:04 login.microsoftonline.example/common/oauth2'],
      [/^cat known_ips\.txt$/i, '49.145.22.18  Mara home / seen 48 times\n203.177.12.40 office NAT / seen 122 times\n185.203.118.42 unknown / first seen 03:17'],
      [/^nslookup\s+northstarr-docs\.test$/i, 'Name: northstarr-docs.test\nAddress: 185.203.118.19\nNote: training-only fictional domain'],
      [/^nslookup\s+northstar\.test$/i, 'Name: northstar.test\nAddress: 10.20.0.10\nNote: internal training domain'],
      [/^grep\s+(.+)\s+(browser_history\.txt|known_ips\.txt)$/i, ({match}) => match[2] === 'known_ips.txt' ? '185.203.118.42 unknown / first seen 03:17' : '16:21:11 northstarr-docs.test/share/8472'],
    ],
    actions: [
      { id:'a1', label:'Preserve the identity and mailbox logs', description:'Take a read-only copy before making account changes.', outcome:'Evidence snapshot preserved with timestamps and source metadata.', quality:'good' },
      { id:'a2', label:'Revoke active sessions and reset credentials', description:'Invalidate current tokens after preserving evidence.', outcome:'Active sessions are revoked. The suspicious token can no longer refresh.', quality:'good' },
      { id:'a3', label:'Delete the suspicious email immediately', description:'Remove the message before preserving a copy or headers.', outcome:'The message is gone from the mailbox. You can still use gateway logs, but you discarded a convenient evidence source.', quality:'bad' },
      { id:'a4', label:'Block northstarr-docs.test at the web filter', description:'Prevent additional users from reaching the lookalike domain.', outcome:'The training web filter now blocks the lookalike domain.', quality:'good' },
    ],
    hints: [
      'Start by separating what Mara says from what the systems recorded. Neither source is automatically “the truth”; compare them.',
      'Compare the 21:54 and 03:17 sign-ins: IP, device, and authentication behavior. Then ask what happened before the overnight login.',
      'The lookalike payroll domain, browser visit, and later unknown-device login form a timeline. Preserve evidence before containment.'
    ],
    evaluation: [
      { label:'Initial access', groups:[['phish','lookalike','fake','payroll'],['credential','password','login']], supported:'Your theory connects the lookalike payroll workflow to credential capture.', partial:'You identified suspicious authentication, but the entry path needs stronger support.', missing:'Your conclusion does not explain how the attacker likely obtained account access.' },
      { label:'Account activity', groups:[['185.203.118.42','unknown ip','unknown device','03:17'],['token','mailbox rule','session']], supported:'You used post-login artifacts rather than relying on the login event alone.', partial:'You noticed the unusual login but did not account for what happened after authentication.', missing:'The 03:17 session and follow-on activity are not addressed.' },
      { label:'Response', groups:[['revoke','session','token'],['reset','password','credential'],['preserve','log','evidence']], supported:'Your response order preserves evidence and cuts off the active session.', partial:'Your response contains useful containment but misses either preservation or token/session revocation.', missing:'Your proposed response does not yet contain the compromised identity safely.' }
    ]
  },
  {
    id:'C002', title:'The Quiet Attachment', subtitle:'A workstation started talking to something it had never contacted before.', tier:'Host + email investigation',
    brief:'Accounting reports that one workstation became slow after opening a supplier document. Antivirus shows no detection. Decide whether the machine is compromised, identify the strongest evidence, and choose a safe first response.',
    environment:'Rook Logistics / accounting workstation image',
    tools:['overview','mail','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Supplier thread','Email','A real supplier thread contains a new reply with an attached file named Statement_Sept.pdf.lnk.','The reply visually matches previous messages, but the sender infrastructure changed.'),
      e('ev2','Process creation','Endpoint log','explorer.exe launched powershell.exe with an encoded-looking command shortly after the attachment opened.','Parent: explorer.exe\nChild: powershell.exe\nTime: 10:08:44\nUser: acct-02'),
      e('ev3','Outbound connection','Network log','The workstation made repeated TLS connections to 198.51.100.77 after 10:09.','Destination is fictional training infrastructure. Connections recur every 60 seconds.'),
      e('ev4','Startup persistence','Host artifact','A new Run key named OneDriveUpdate points to a script in AppData.','HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\OneDriveUpdate -> powershell -File C:\\Users\\acct-02\\AppData\\Roaming\\od.ps1'),
      e('ev5','No AV alert','Security console','The endpoint product shows no malware detection for the time window.','Absence of an alert is not proof of absence of malicious activity.')
    ],
    mails:[
      { id:'m1', from:'Lina / Bayline Paper <lina@bayline-paper.test>', to:'Accounting <acct@rook.test>', subject:'RE: September statement', date:'10:06', body:'Hi, attaching the corrected statement. The PDF viewer may ask you to enable the secure preview.\n\nRegards,\nLina\n\nAttachment: Statement_Sept.pdf.lnk', raw:'From: lina@bayline-paper.test\nReply-To: statements@bayline-docs.test\nSPF: fail\nDKIM: none\nAttachment-Type: application/x-ms-shortcut' },
      { id:'m2', from:'Lina / Bayline Paper <lina@bayline-paper.test>', to:'Accounting <acct@rook.test>', subject:'September statement', date:'Yesterday', body:'Standard statement attached as PDF.\nAttachment: Statement_Sept.pdf', raw:'SPF: pass\nDKIM: pass\nAttachment-Type: application/pdf' }
    ],
    logs:[
      {id:'endpoint',name:'Endpoint process log',text:`10:08:37 explorer.exe opened C:\\Users\\acct-02\\Downloads\\Statement_Sept.pdf.lnk\n10:08:44 parent=explorer.exe child=powershell.exe cmd="-w hidden -enc JAB..."\n10:08:47 powershell.exe wrote C:\\Users\\acct-02\\AppData\\Roaming\\od.ps1\n10:08:49 registry set HKCU\\...\\Run\\OneDriveUpdate\n10:09:02 powershell.exe network 198.51.100.77:443\n10:10:02 powershell.exe network 198.51.100.77:443\n10:11:02 powershell.exe network 198.51.100.77:443`},
      {id:'av',name:'AV console',text:`09:00-11:00 device=ROOK-ACCT-02 detections=0\nengine=healthy signatures=current`}
    ],
    terminal:[
      [/^help$/i,'Try: ls, cat autoruns.txt, cat connections.txt, cat process_tree.txt, grep powershell process_tree.txt'],
      [/^ls$/i,'autoruns.txt  connections.txt  process_tree.txt'],
      [/^cat autoruns\.txt$/i,'OneDriveUpdate -> powershell -File C:\\Users\\acct-02\\AppData\\Roaming\\od.ps1'],
      [/^cat connections\.txt$/i,'10:09:02 10.44.18.23 -> 198.51.100.77:443\n10:10:02 10.44.18.23 -> 198.51.100.77:443\n10:11:02 10.44.18.23 -> 198.51.100.77:443'],
      [/^cat process_tree\.txt$/i,'explorer.exe\n  \\_ powershell.exe -w hidden -enc JAB...\n       \\_ conhost.exe'],
      [/^grep\s+powershell\s+process_tree\.txt$/i,'  \\_ powershell.exe -w hidden -enc JAB...']
    ],
    actions:[
      {id:'a1',label:'Isolate the workstation from the network',description:'Keep the host powered on but cut normal network communication.',outcome:'The recurring outbound connection stops while volatile host state remains available.',quality:'good'},
      {id:'a2',label:'Power off the workstation immediately',description:'Hard power-off before collecting volatile information.',outcome:'The connection stops, but memory-resident state and some volatile context are lost.',quality:'bad'},
      {id:'a3',label:'Preserve process, autorun, and network telemetry',description:'Snapshot the host artifacts before cleanup.',outcome:'Process lineage, persistence, and connection history are preserved.',quality:'good'},
      {id:'a4',label:'Trust the antivirus result and close the incident',description:'Assume no detection means no compromise.',outcome:'The host continues beaconing every 60 seconds.',quality:'bad'}
    ],
    hints:['Treat the antivirus result as one sensor, not a verdict. Look for cause-and-effect around the time the file was opened.','A suspicious file becomes more meaningful when process lineage, persistence, and network behavior agree.','A safe early response often aims to stop attacker communication without destroying evidence you may still need.'],
    evaluation:[
      {label:'Compromise',groups:[['lnk','attachment','shortcut'],['powershell','script'],['198.51.100.77','beacon','connection']],supported:'Your theory ties user execution to suspicious process and network behavior.',partial:'You found suspicious host activity but the chain from attachment to execution is incomplete.',missing:'Your theory does not establish why this host should be treated as compromised.'},
      {label:'Persistence',groups:[['run key','autorun','onedriveupdate','od.ps1']],supported:'You identified the persistence mechanism recorded in the host artifacts.',partial:'You suspect persistence but did not identify the recorded mechanism.',missing:'Persistence is not considered.'},
      {label:'Response',groups:[['isolate','network'],['preserve','memory','telemetry','evidence']],supported:'Your first response contains the host while preserving investigative value.',partial:'You propose containment but the evidence-preservation plan is weak.',missing:'The response does not safely contain the host.'}
    ]
  },
  {
    id:'C003', title:'Room 204', subtitle:'A customer can see a record that should belong to someone else.', tier:'Web application assessment',
    brief:'A small booking application passed functional testing, but support received a screenshot of one customer viewing another customer\'s booking. You have a safe local copy of the application. Reproduce the flaw, explain why it happens, and propose the smallest effective fix.',
    environment:'Harbor Rooms / isolated training web app',
    tools:['overview','browser','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Support screenshot','User report','URL shown in the screenshot ends with /api/bookings/204 while the logged-in account belongs to booking 203.','The customer says they changed the number in the browser after noticing the pattern.'),
      e('ev2','API route','Code artifact','The booking endpoint fetches by numeric booking ID and returns the object.','The route checks that the requester is authenticated, but does not verify ownership of the requested booking.'),
      e('ev3','Session identity','App artifact','The session identifies user_id=17.','Booking 203 belongs to user 17. Booking 204 belongs to user 22.'),
      e('ev4','Sequential identifiers','API behavior','Booking IDs are easy to enumerate: 201, 202, 203, 204...','Predictable IDs are not the root cause by themselves; missing object-level authorization is.')
    ],
    browser:[
      {id:'b1',url:'https://harbor.local/account',title:'My booking',html:`<div class="fake-site"><h2>Harbor Rooms</h2><div class="box"><b>Signed in as:</b> alex@training.test<br><b>Your booking:</b> #203 — Room 118</div><p>API request observed: <code>GET /api/bookings/203</code></p></div>`},
      {id:'b2',url:'https://harbor.local/api/bookings/203',title:'API 203',html:`<div class="fake-site"><h2>200 OK</h2><div class="box"><pre>{ "id":203, "user_id":17, "room":"118", "guest":"Alex D." }</pre></div></div>`},
      {id:'b3',url:'https://harbor.local/api/bookings/204',title:'API 204',html:`<div class="fake-site"><h2>200 OK</h2><div class="box"><pre>{ "id":204, "user_id":22, "room":"204", "guest":"Jamie R." }</pre></div><p style="color:#a11">The server returned another user's record to the same authenticated session.</p></div>`},
      {id:'b4',url:'view-source://route',title:'Route source',html:`<div class="fake-site"><h2>Server route</h2><div class="box"><pre>const user = requireLogin(req)\nconst booking = db.bookings.find(req.params.id)\nreturn json(booking)</pre></div></div>`}
    ],
    terminal:[
      [/^help$/i,'Try: curl https://harbor.local/api/bookings/203 or /204; cat route.js'],
      [/^cat route\.js$/i,'const user = requireLogin(req)\nconst booking = db.bookings.find(req.params.id)\nreturn json(booking)'],
      [/^curl\s+https:\/\/harbor\.local\/api\/bookings\/203$/i,'HTTP/1.1 200 OK\n{"id":203,"user_id":17,"room":"118","guest":"Alex D."}'],
      [/^curl\s+https:\/\/harbor\.local\/api\/bookings\/204$/i,'HTTP/1.1 200 OK\n{"id":204,"user_id":22,"room":"204","guest":"Jamie R."}']
    ],
    actions:[
      {id:'a1',label:'Add ownership authorization to the query',description:'Fetch the object only when booking.user_id matches the authenticated user, unless a privileged role is explicitly allowed.',outcome:'The training route now returns 404/403 for booking 204 under user 17.',quality:'good'},
      {id:'a2',label:'Replace numeric IDs with UUIDs only',description:'Make identifiers harder to guess without adding authorization.',outcome:'Enumeration becomes less convenient, but a leaked or discovered identifier still exposes another user\'s record.',quality:'bad'},
      {id:'a3',label:'Add a UI check that hides other booking IDs',description:'Prevent the frontend from rendering records it believes are not owned by the user.',outcome:'Direct requests to the API still return the unauthorized object.',quality:'bad'},
      {id:'a4',label:'Add an authorization regression test',description:'Test that user 17 cannot fetch booking 204 directly.',outcome:'A repeatable test now protects the object-level access control requirement.',quality:'good'}
    ],
    hints:['Do not stop at “the IDs are predictable.” Ask what decision the server makes before returning an object.','Authentication answers “who are you?” Authorization answers “may you access this specific object?”','A client-side check cannot protect an API from a direct request. The server must enforce ownership or an explicit permission rule.'],
    evaluation:[
      {label:'Reproduction',groups:[['204','other user','another user'],['200','returned','access']],supported:'You reproduced cross-user object access rather than inferring it from the screenshot alone.',partial:'You describe the report but do not clearly demonstrate unauthorized object retrieval.',missing:'The flaw is not reproduced.'},
      {label:'Root cause',groups:[['authorization','ownership','object-level'],['authenticated','authentication']],supported:'You correctly separate authentication from object-level authorization.',partial:'You recognize access control is involved, but the server-side ownership failure is not explicit.',missing:'The root cause is misidentified.'},
      {label:'Fix',groups:[['user_id','owner','ownership'],['server','query','authorization'],['test','regression']],supported:'Your fix enforces authorization at the server and adds a test for the failure mode.',partial:'Your fix may reduce exposure but does not fully enforce object ownership.',missing:'The proposed fix does not address the authorization failure.'}
    ]
  },
  {
    id:'C004', title:'The Helpful API', subtitle:'An internal integration can do more than anyone intended.', tier:'API + secrets assessment',
    brief:'A support automation was given an API token to read tickets. During a routine review, you discover the same token can change user roles. Determine why the integration is dangerous and redesign the access without breaking its legitimate job.',
    environment:'SignalDesk / isolated API',
    tools:['overview','browser','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Automation requirement','Change ticket','The bot only needs to read open support tickets and add an internal note.','No user-management task is part of the integration.'),
      e('ev2','Token scope','API token','Token scope is admin:*.','The token was copied from an administrator\'s personal token during setup.'),
      e('ev3','Role endpoint','API behavior','PATCH /api/users/42 accepts the integration token.','Request body {"role":"admin"} returns 200 in the training environment.'),
      e('ev4','Token storage','Repository snapshot','The token is present in a committed config.example.json file.','Even if a repository is private, committed long-lived secrets create unnecessary exposure and rotation problems.')
    ],
    browser:[
      {id:'b1',url:'https://signal.local/docs/integration',title:'Integration docs',html:`<div class="fake-site"><h2>Support Bot</h2><div class="box">Required operations:<br>GET /api/tickets?status=open<br>POST /api/tickets/:id/notes</div></div>`},
      {id:'b2',url:'https://signal.local/docs/token',title:'Token inspector',html:`<div class="fake-site"><h2>Token metadata</h2><div class="box"><b>name</b>: support-bot<br><b>scope</b>: admin:*<br><b>expires</b>: never</div></div>`}
    ],
    terminal:[
      [/^help$/i,'Try: cat config.example.json, curl -X GET https://signal.local/api/tickets, curl -X PATCH https://signal.local/api/users/42'],
      [/^cat config\.example\.json$/i,'{"apiBase":"https://signal.local","token":"sd_live_training_admin_star"}'],
      [/^curl\s+-X\s+GET\s+https:\/\/signal\.local\/api\/tickets$/i,'HTTP/1.1 200 OK\n[{"id":811,"status":"open"}]'],
      [/^curl\s+-X\s+PATCH\s+https:\/\/signal\.local\/api\/users\/42$/i,'HTTP/1.1 200 OK\n{"id":42,"role":"admin"}\n(training simulation: body omitted)']
    ],
    actions:[
      {id:'a1',label:'Create a dedicated service identity',description:'Give the bot its own non-human identity.',outcome:'The automation is no longer coupled to a personal administrator token.',quality:'good'},
      {id:'a2',label:'Limit permissions to ticket read + note write',description:'Grant only the operations required by the integration.',outcome:'User-management calls now return 403 while ticket automation continues.',quality:'good'},
      {id:'a3',label:'Move the same admin token to an environment variable',description:'Remove it from source but keep its broad, non-expiring privileges.',outcome:'Source exposure is reduced, but a compromised bot still has administrator-level authority.',quality:'bad'},
      {id:'a4',label:'Rotate the exposed token',description:'Invalidate the committed token after replacing the integration design.',outcome:'The old token no longer works.',quality:'good'}
    ],
    hints:['There are two separate problems: where the token lives and what the token is allowed to do. Fixing only one leaves the other.','Start from the automation’s actual job. Every permission beyond that job increases blast radius.','A dedicated service identity, scoped privileges, rotation, and finite lifetime are stronger together than simply hiding a powerful token.'],
    evaluation:[
      {label:'Privilege',groups:[['admin:*','admin','overprivilege','least privilege'],['ticket','note']],supported:'You compare the integration’s actual job with the excessive token authority.',partial:'You call the token powerful but do not connect privilege to required operations.',missing:'The privilege problem is not explained.'},
      {label:'Secret handling',groups:[['committed','repository','config'],['rotate','rotation','expire']],supported:'You account for both exposure and the need to invalidate the old credential.',partial:'You move the secret but do not address rotation or lifetime.',missing:'Secret exposure is not addressed.'},
      {label:'Redesign',groups:[['service account','service identity'],['scope','least privilege'],['expire','short-lived','lifetime']],supported:'Your redesign reduces both privilege and credential persistence.',partial:'Your redesign improves one control but leaves broad or long-lived access.',missing:'The integration remains unnecessarily privileged.'}
    ]
  },
  {
    id:'C005', title:'Not an Admin', subtitle:'A maintenance shortcut quietly became a privilege boundary.', tier:'Linux host assessment',
    brief:'A Linux application server uses a maintenance script that junior operators may run with sudo. A reviewer suspects the permission is broader than intended. Inspect the host snapshot, determine whether the script creates a privilege-escalation path, and harden it without removing the maintenance capability.',
    environment:'Arcline / isolated Linux snapshot',
    tools:['overview','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Sudo rule','Host config','Operators may run /opt/arcline/bin/backup.sh as root without a password.','%operators ALL=(root) NOPASSWD: /opt/arcline/bin/backup.sh'),
      e('ev2','Script ownership','Filesystem','backup.sh is root-owned, but it executes /opt/arcline/hooks/pre-backup.sh.','The hook file is writable by group operators.'),
      e('ev3','Writable hook','Filesystem','pre-backup.sh mode is 0775 and group is operators.','An operator can modify code that the root-run backup script executes.'),
      e('ev4','Maintenance need','Operations note','Operators genuinely need to trigger backups, but they do not need arbitrary root shell access.','The business requirement is narrow: execute a known backup operation.')
    ],
    terminal:[
      [/^help$/i,'Try: whoami, id, sudo -l, ls -l /opt/arcline/bin/backup.sh, cat /opt/arcline/bin/backup.sh, ls -l /opt/arcline/hooks/pre-backup.sh'],
      [/^whoami$/i,'operator1'],
      [/^id$/i,'uid=1004(operator1) gid=1004(operator1) groups=1004(operator1),1102(operators)'],
      [/^sudo -l$/i,'(root) NOPASSWD: /opt/arcline/bin/backup.sh'],
      [/^ls -l \/opt\/arcline\/bin\/backup\.sh$/i,'-rwxr-xr-x 1 root root 612 Sep 10 12:04 /opt/arcline/bin/backup.sh'],
      [/^cat \/opt\/arcline\/bin\/backup\.sh$/i,'#!/bin/sh\n/opt/arcline/hooks/pre-backup.sh\n/usr/bin/tar -czf /var/backups/app.tgz /srv/app\n/opt/arcline/hooks/post-backup.sh'],
      [/^ls -l \/opt\/arcline\/hooks\/pre-backup\.sh$/i,'-rwxrwxr-x 1 root operators 88 Sep 10 12:04 /opt/arcline/hooks/pre-backup.sh'],
      [/^cat \/opt\/arcline\/hooks\/pre-backup\.sh$/i,'#!/bin/sh\necho "preparing backup"']
    ],
    actions:[
      {id:'a1',label:'Make all root-executed hooks root-writable only',description:'Operators may trigger them but cannot change their contents.',outcome:'The writable-code path into the privileged script is removed.',quality:'good'},
      {id:'a2',label:'Replace sudo with full root access for operators',description:'Avoid script complexity by making operators administrators.',outcome:'The maintenance requirement is met, but the privilege boundary is removed entirely.',quality:'bad'},
      {id:'a3',label:'Keep a narrow sudo command and validate dependencies',description:'Audit every file, executable, environment input, and path the privileged script trusts.',outcome:'The backup function remains available with a much smaller trusted surface.',quality:'good'},
      {id:'a4',label:'Rename the hook file',description:'Change the filename without changing permissions or trust.',outcome:'The same writable privileged execution path remains under a different name.',quality:'bad'}
    ],
    hints:['The sudo rule itself is narrow. Follow what that allowed program trusts and executes.','A root-owned script can still be unsafe if it executes something a lower-privileged user can modify.','Hardening here is about the whole trusted execution chain, not merely the file named in sudoers.'],
    evaluation:[
      {label:'Privilege path',groups:[['sudo','root'],['pre-backup','hook'],['writable','operators','0775']],supported:'You traced the privilege boundary through the root-run script into operator-writable code.',partial:'You found an unsafe permission but did not connect it to privileged execution.',missing:'The escalation path is not identified.'},
      {label:'Requirement',groups:[['trigger','backup','maintenance'],['not','root','arbitrary']],supported:'You preserve the real maintenance requirement without granting general root access.',partial:'Your fix may block legitimate operations or grant more privilege than necessary.',missing:'The operational requirement is not considered.'},
      {label:'Hardening',groups:[['root-writable','permission','ownership'],['dependencies','trusted','path']],supported:'Your hardening treats the entire privileged execution chain as trusted code.',partial:'You fix the known hook but do not consider other trusted dependencies.',missing:'The proposed fix does not close the privilege boundary.'}
    ]
  },
  {
    id:'C006', title:'The Long Session', subtitle:'The password was changed. The attacker stayed logged in.', tier:'Identity + response design',
    brief:'A SaaS company reset a compromised executive password and declared the incident contained. Twelve hours later, sensitive exports continued. Reconstruct why containment failed and design an identity response that actually terminates attacker access.',
    environment:'Kestrel Cloud / identity and app session telemetry',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Password reset','Identity event','The executive password changed at 09:12.','Existing application refresh tokens were not revoked by the reset workflow.'),
      e('ev2','Refresh token use','Session log','A previously issued refresh token continued minting access tokens after the reset.','Session ID sess_77b9 first created before password reset.'),
      e('ev3','Export activity','Application audit','Large customer exports occurred at 12:04 and 18:27 from sess_77b9.','The session stayed valid until explicit revocation.'),
      e('ev4','MFA enrollment','Identity event','A new authenticator was registered during the attacker session.','Recovery and MFA enrollment must be included in containment review.')
    ],
    logs:[
      {id:'identity',name:'Identity events',text:`08:44:02 login user=ceo session=sess_77b9 result=SUCCESS\n08:46:18 mfa_enroll user=ceo method=TOTP session=sess_77b9\n09:12:00 password_reset user=ceo actor=helpdesk\n09:13:01 access_token issued via refresh session=sess_77b9\n12:04:33 export customers.csv session=sess_77b9 rows=18422\n18:27:09 export contracts.csv session=sess_77b9 rows=802`}
    ],
    terminal:[
      [/^help$/i,'Try: cat session_policy.txt, grep sess_77b9 identity.log'],
      [/^cat session_policy\.txt$/i,'password_reset: does_not_revoke_refresh_tokens\nrefresh_token_lifetime: 30 days\nadmin_revoke_endpoint: enabled'],
      [/^grep\s+sess_77b9\s+identity\.log$/i,'08:44 login sess_77b9\n08:46 mfa_enroll sess_77b9\n09:13 token refresh sess_77b9\n12:04 export sess_77b9\n18:27 export sess_77b9']
    ],
    actions:[
      {id:'a1',label:'Revoke all sessions and refresh tokens',description:'Terminate current authenticated state, not just the password credential.',outcome:'sess_77b9 can no longer mint access tokens.',quality:'good'},
      {id:'a2',label:'Review and reset MFA/recovery methods',description:'Remove attacker-added authentication methods and verify trusted recovery channels.',outcome:'The newly enrolled TOTP method is removed pending re-verification.',quality:'good'},
      {id:'a3',label:'Reset the password again',description:'Repeat the original response without touching sessions.',outcome:'The already-issued refresh token remains usable.',quality:'bad'},
      {id:'a4',label:'Shorten future session lifetime and bind sensitive changes to re-authentication',description:'Reduce persistence and require stronger checks for security-sensitive operations.',outcome:'Future session theft has a smaller window and critical changes require fresh proof.',quality:'good'}
    ],
    hints:['A password is one credential. A logged-in session may have its own credentials and lifetime.','Follow the session ID across password reset, token refresh, MFA enrollment, and exports.','Containment should address passwords, active sessions, refresh tokens, MFA methods, recovery paths, and high-risk app actions.'],
    evaluation:[
      {label:'Why reset failed',groups:[['refresh token','session'],['password reset','did not','not revoke']],supported:'You explain why changing the password did not invalidate the attacker’s authenticated session.',partial:'You mention sessions but do not connect them to refresh-token persistence.',missing:'The containment failure is not explained.'},
      {label:'Continued access',groups:[['sess_77b9','export'],['12:04','18:27','after']],supported:'You tie post-reset exports to the same persistent session.',partial:'You note continued exports but do not attribute them to the session evidence.',missing:'Post-reset activity is not reconstructed.'},
      {label:'Identity containment',groups:[['revoke','session','refresh token'],['mfa','recovery'],['re-auth','session lifetime']],supported:'Your response closes the major identity persistence paths instead of repeating a password-only fix.',partial:'You revoke sessions but leave another identity persistence path untreated.',missing:'The response remains password-centric.'}
    ]
  },
  {
    id:'C007', title:'East-West', subtitle:'One compromised workstation reached systems it never needed.', tier:'Network + identity architecture',
    brief:'A design workstation was compromised through a browser exploit in the training environment. The initial host had no sensitive files, but the attacker later reached a finance file server. Determine what enabled the movement and redesign the environment to reduce blast radius.',
    environment:'Vela Manufacturing / segmented network simulation',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Flat workstation VLAN','Network config','Design and finance workstations share the same broad client network.','Client-to-client traffic is generally allowed.'),
      e('ev2','Cached admin credential','Host artifact','A shared IT support account was used interactively on the design workstation the previous day.','The same account is local administrator on many workstations and has access to the finance server.'),
      e('ev3','SMB authentication','Network log','The design host authenticated to FIN-FS01 using ITSUPPORT at 14:22.','This connection occurred after the design host compromise.'),
      e('ev4','Finance server ACL','Access config','FIN-FS01 permits ITSUPPORT because it is in a broad legacy support group.','The support path was never reduced after a migration.')
    ],
    logs:[
      {id:'net',name:'Network telemetry',text:`14:03 DES-WS14 -> web.training exploit simulation\n14:12 DES-WS14 -> DES-WS09:445 denied? no (allowed)\n14:18 DES-WS14 -> FIN-FS01:445 connection\n14:22 FIN-FS01 auth user=ITSUPPORT source=DES-WS14 result=SUCCESS\n14:25 FIN-FS01 file_read \\finance\\forecast.xlsx user=ITSUPPORT`},
      {id:'auth',name:'Admin usage',text:`Previous day 16:41 interactive logon user=ITSUPPORT host=DES-WS14 reason=printer troubleshooting\nAccount scope: local admin workstations + legacy finance support group`}
    ],
    terminal:[
      [/^help$/i,'Try: cat network.txt, cat admin_scope.txt, grep FIN-FS01 network.txt'],
      [/^cat network\.txt$/i,'DES-WS14 10.60.10.14 design\nFIN-FS01 10.60.20.10 finance\nFirewall: client zones permit SMB to FIN-FS01 legacy rule'],
      [/^cat admin_scope\.txt$/i,'ITSUPPORT: local-admin(workstations=*), group=legacy-finance-support'],
      [/^grep\s+FIN-FS01\s+network\.txt$/i,'FIN-FS01 10.60.20.10 finance\nFirewall: client zones permit SMB to FIN-FS01 legacy rule']
    ],
    actions:[
      {id:'a1',label:'Remove shared broad admin credentials',description:'Use unique or managed admin identities with narrow scope and no routine workstation browsing.',outcome:'A compromised user workstation no longer inherits a reusable support credential with broad reach.',quality:'good'},
      {id:'a2',label:'Restrict east-west workstation traffic',description:'Allow only required client-to-service paths, not broad client-to-client access.',outcome:'Unnecessary SMB movement between client systems is blocked.',quality:'good'},
      {id:'a3',label:'Restrict FIN-FS01 access to finance roles + dedicated admin path',description:'Remove the legacy support group from normal file access.',outcome:'Design workstations and generic support identities can no longer reach finance shares.',quality:'good'},
      {id:'a4',label:'Install another antivirus product on DES-WS14 only',description:'Add a second endpoint product without changing credential or network architecture.',outcome:'Detection coverage may change, but the same lateral movement paths still exist after a future host compromise.',quality:'bad'}
    ],
    hints:['Assume one workstation will eventually be compromised. Ask what the attacker inherits from that host.','Lateral movement here needs both a reachable path and usable authority. Trace network reachability and credential scope separately.','Strong architecture limits blast radius even when prevention fails: narrow admin scope, segmentation, dedicated admin paths, and service-specific access.'],
    evaluation:[
      {label:'Movement path',groups:[['DES-WS14','FIN-FS01'],['SMB','445'],['ITSUPPORT']],supported:'You reconstruct the path from compromised design host to finance server.',partial:'You identify either the network or credential path but not both.',missing:'The movement path is not reconstructed.'},
      {label:'Root causes',groups:[['shared','admin','credential'],['flat','segmentation','east-west'],['legacy','finance']],supported:'You identify interacting architecture weaknesses rather than a single bad host.',partial:'You identify one enabling weakness but miss the combined blast-radius problem.',missing:'The architecture causes are not addressed.'},
      {label:'Redesign',groups:[['unique','managed','dedicated admin'],['segment','restrict','firewall'],['least privilege','finance']],supported:'Your redesign reduces both reachability and reusable privilege.',partial:'Your redesign improves one control plane but leaves another broad path open.',missing:'The proposed redesign does not materially reduce lateral movement.'}
    ]
  },
  {
    id:'C008', title:'Build 4812', subtitle:'The application was clean. The release was not.', tier:'Software supply-chain investigation',
    brief:'A signed production release contains a small JavaScript change that is absent from the reviewed source branch. Engineering insists no developer committed it. Determine where the change entered the build and contain the path without destroying the release pipeline.',
    environment:'Morrow Labs / repository + CI telemetry',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Source branch','Repository','Reviewed commit 8f12c1 does not contain the injected analytics loader.','Code review and branch history are clean for this change.'),
      e('ev2','Build artifact','Artifact diff','dist/app.js in build 4812 contains an extra loader for metrics-cdn.training.','The modification appears after dependency installation and before signing.'),
      e('ev3','CI step change','Pipeline audit','A reusable build action changed from immutable commit pinning to tag @v3 three days ago.','The tag resolved to a different commit during build 4812.'),
      e('ev4','Runner token','CI metadata','The build runner can sign artifacts and publish releases.','The compromised build path therefore inherits high-impact release authority.')
    ],
    logs:[
      {id:'ci',name:'CI log',text:`build=4812 checkout commit=8f12c1\nstep setup-build uses=morrow/build-action@v3 resolved=3aa91e\nstep install deps=ok\nstep bundle=ok\nstep sign artifact=ok\nstep publish=ok`},
      {id:'audit',name:'Pipeline audit',text:`3 days ago pipeline.yml changed: uses morrow/build-action@b441ce -> morrow/build-action@v3\nbuild 4808 resolved @v3=1f0b7a\nbuild 4812 resolved @v3=3aa91e`}
    ],
    terminal:[
      [/^help$/i,'Try: cat pipeline.yml, diff source.js dist.js, cat action_resolution.txt'],
      [/^cat pipeline\.yml$/i,'steps:\n - uses: actions/checkout@<pinned>\n - uses: morrow/build-action@v3\n - run: npm run build\n - run: sign-and-publish'],
      [/^diff\s+source\.js\s+dist\.js$/i,'+ import("https://metrics-cdn.training/loader.js")'],
      [/^cat action_resolution\.txt$/i,'4808 @v3 -> 1f0b7a\n4812 @v3 -> 3aa91e']
    ],
    actions:[
      {id:'a1',label:'Stop releases from the affected pipeline and preserve build 4812 metadata',description:'Contain publication while keeping evidence for reconstruction.',outcome:'New releases are paused; logs, action digests, artifact hashes, and runner metadata are preserved.',quality:'good'},
      {id:'a2',label:'Pin reusable actions to reviewed immutable commits',description:'Prevent a mutable tag from silently changing executed build code.',outcome:'The pipeline now executes the exact reviewed action revision.',quality:'good'},
      {id:'a3',label:'Rotate signing/publishing credentials and narrow runner permissions',description:'Assume the high-privilege runner context may have been exposed.',outcome:'Old release credentials are invalidated and the build job receives narrower authority.',quality:'good'},
      {id:'a4',label:'Delete build 4812 and rerun immediately',description:'Remove the suspicious artifact before preserving CI evidence.',outcome:'The artifact disappears, but key evidence about the compromised build path is lost.',quality:'bad'}
    ],
    hints:['The reviewed source is not the only code that executes during a build. Treat the pipeline and reusable actions as production code too.','Compare what was reviewed with what the runner actually resolved and executed.','Build integrity also depends on the authority available to the runner: signing, publishing, secrets, and mutable dependencies.'],
    evaluation:[
      {label:'Injection point',groups:[['build-action','@v3','tag'],['3aa91e','mutable','resolved']],supported:'You locate the unreviewed change in the build dependency path, not the application branch.',partial:'You suspect CI but do not identify the mutable action resolution.',missing:'The artifact/source discrepancy is not explained.'},
      {label:'Impact',groups:[['sign','signed'],['publish','release'],['runner','credential','permission']],supported:'You recognize why CI compromise can produce trusted malicious releases.',partial:'You identify a pipeline issue but understate the runner’s release authority.',missing:'The impact of the build path is not assessed.'},
      {label:'Containment + hardening',groups:[['preserve','pause','stop release'],['pin','immutable'],['rotate','credential'],['least','narrow','permission']],supported:'Your response preserves evidence, stops the path, and reduces future supply-chain trust.',partial:'You harden the pipeline but miss containment or credential exposure.',missing:'The build path remains insufficiently contained.'}
    ]
  },
  {
    id:'C009', title:'No Ticket', subtitle:'Nothing tells you what kind of incident this is.', tier:'Open investigation',
    brief:'Greywell Cooperative reports only that “some files appeared in the wrong place” and staff are seeing intermittent sign-in prompts. You have a small organization snapshot: identity logs, a file server, a web portal, email, and network records. Build your own hypothesis, decide what to inspect first, and act only when your evidence supports it.',
    environment:'Greywell / multi-system organization simulation',
    tools:['overview','mail','logs','browser','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Intermittent sign-in prompts','Helpdesk pattern','Five staff reported unexpected sign-in prompts over two days.','Reports span finance and operations. Not all affected users clicked anything.'),
      e('ev2','New OAuth application','Identity audit','An app named “Document Sync Utility” received delegated mail.read and files.read permissions from one user.','Consent originated from 203.0.113.84 after a web login.'),
      e('ev3','Shared folder copies','File audit','Several contract files were copied into a newly created “Archive Sync” folder before being downloaded.','Actor is the consented cloud application, not an interactive user session.'),
      e('ev4','Real SSO domain','Web evidence','The consent flow used the legitimate identity provider domain after starting from a misleading email link.','The attacker did not need to host a fake password form to gain delegated access.'),
      e('ev5','Legacy admin portal','Web config','An old admin endpoint is internet-accessible but shows no evidence of use in the incident window.','It is a real weakness, but may be unrelated to this incident.'),
      e('ev6','Noisy failed logins','Identity logs','Hundreds of failed logins target disabled accounts from many IPs.','The noise predates the file activity and can distract from the delegated application path.')
    ],
    mails:[
      {id:'m1',from:'Greywell Files <share@greywell-docs.test>',to:'Sam P. <sam@greywell.test>',subject:'You were added to Contract Review',date:'2 days ago 14:11',body:'Open Contract Review and connect your company account to continue.\nhttps://greywell-docs.test/connect',raw:'SPF: none\nDKIM: none\nLink redirects to legitimate-idp.training/oauth/authorize?client_id=docsync-771'},
      {id:'m2',from:'IT <it@greywell.test>',to:'All Staff <all@greywell.test>',subject:'Reminder: app consent prompts',date:'Last month',body:'Only approve company apps listed in the internal catalog. If a page asks an app to read mail or files, verify the app name with IT.',raw:'SPF: pass\nDKIM: pass'}
    ],
    logs:[
      {id:'identity',name:'Identity + consent',text:`14:11:52 user=sam web_login ip=203.0.113.84 result=SUCCESS\n14:12:40 user=sam oauth_consent app=Document Sync Utility scopes=mail.read files.read ip=203.0.113.84\n14:13:02 app=Document Sync Utility token_issued delegated_user=sam\n15:01:10 app=Document Sync Utility api files.list\n15:03:44 app=Document Sync Utility api files.download count=8\n--- noise ---\n00:00-23:59 failed_logins disabled_users count=417 varied_ips`},
      {id:'files',name:'File audit',text:`15:01:55 actor=app:Document Sync Utility create_folder "Archive Sync"\n15:02:10 actor=app:Document Sync Utility copy contract_2026_a.pdf -> Archive Sync\n15:02:12 actor=app:Document Sync Utility copy contract_2026_b.pdf -> Archive Sync\n15:03:44 actor=app:Document Sync Utility download 8 objects`}
    ],
    browser:[
      {id:'b1',url:'https://greywell-docs.test/connect',title:'Shared document lure',html:`<div class="fake-site"><h2>Greywell Document Share</h2><div class="box">Continue with company account</div><p>Redirect target:<br><code>https://legitimate-idp.training/oauth/authorize?client_id=docsync-771&scope=mail.read%20files.read</code></p></div>`},
      {id:'b2',url:'https://portal.greywell.local/legacy-admin',title:'Legacy admin',html:`<div class="fake-site"><h2>Legacy Admin</h2><div class="box">Internet exposure: yes<br>Current incident access evidence: none found</div><p>This is a real finding. Decide whether it explains the reported file activity.</p></div>`}
    ],
    terminal:[
      [/^help$/i,'Try: cat app_inventory.txt, cat network_summary.txt, grep "Document Sync" cloud.log, grep legacy web.log'],
      [/^cat app_inventory\.txt$/i,'Approved apps: Payroll, HR Portal, Greywell Drive\nUnapproved: Document Sync Utility client_id=docsync-771'],
      [/^cat network_summary\.txt$/i,'No unusual SMB or SSH east-west traffic during file downloads. Cloud API activity dominates the incident window.'],
      [/^grep\s+["']?Document Sync["']?\s+cloud\.log$/i,'14:12 consent -> 15:03 files.download delegated user=sam'],
      [/^grep\s+legacy\s+web\.log$/i,'No authenticated requests to /legacy-admin during incident window.']
    ],
    actions:[
      {id:'a1',label:'Revoke the unapproved application grant and its tokens',description:'Terminate delegated API access.',outcome:'Document Sync Utility can no longer call Greywell cloud APIs as Sam.',quality:'good'},
      {id:'a2',label:'Preserve consent, cloud API, and file-audit records',description:'Capture the delegated-access chain before cleanup.',outcome:'The consent-to-download timeline is preserved for review.',quality:'good'},
      {id:'a3',label:'Disable the entire Greywell internet connection',description:'Take the organization offline before establishing scope.',outcome:'Business operations stop. The cloud app grant remains valid and will resume when connectivity returns.',quality:'bad'},
      {id:'a4',label:'Remediate the exposed legacy admin portal as a separate finding',description:'Track the weakness without claiming it caused this incident.',outcome:'The unrelated exposure is assigned for remediation without contaminating the incident conclusion.',quality:'good'},
      {id:'a5',label:'Restrict user app consent and require verified/approved applications',description:'Reduce future malicious delegated-consent paths.',outcome:'Future high-risk application grants require administrative review.',quality:'good'}
    ],
    hints:['This case contains at least one genuine weakness that is not necessarily the incident cause. Build a timeline before deciding what matters.','Look for an identity that can act without a normal interactive login. Cloud applications can hold delegated authority after a user leaves the browser.','The strongest story is the one that connects lure → consent → token → API activity → file movement with timestamps and actors.'],
    evaluation:[
      {label:'Incident chain',groups:[['email','lure','greywell-docs'],['oauth','consent','Document Sync Utility'],['files.read','download','Archive Sync']],supported:'You reconstruct the delegated-consent chain from lure to cloud file access.',partial:'You identify malicious app access but do not fully reconstruct how it was granted and used.',missing:'The main incident chain is not established.'},
      {label:'Evidence discipline',groups:[['legacy','unrelated','separate'],['failed login','noise','not related']],supported:'You distinguish real but unsupported findings from the evidence-backed incident path.',partial:'You mention distractors but do not clearly separate them from causation.',missing:'Your theory appears to treat unrelated weaknesses or noise as proof of the incident cause.'},
      {label:'Response',groups:[['revoke','app','grant','token'],['preserve','audit','log'],['consent','approved','verified']],supported:'Your response contains current delegated access and improves the control that allowed it.',partial:'You contain the app but do not improve consent governance or preserve the relevant records.',missing:'Delegated access remains insufficiently contained.'}
    ]
  },
  {
    id:'C010', title:'Authorized Window', subtitle:'You have written permission, a small scope, and no map.', tier:'Open penetration assessment + hardening',
    brief:'Greybox Systems has authorized a two-hour assessment of the fictional 10.90.0.0/24 training segment and the portal at portal.greybox.local. Your scope allows safe discovery and proof of access, but not destructive actions. Find the most meaningful security path, document the evidence that proves it, then redesign the controls that allowed it.',
    environment:'Greybox Systems / fully isolated assessment range',
    tools:['overview','browser','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Rules of engagement','Scope document','Authorized: 10.90.0.0/24, portal.greybox.local, non-destructive validation.','Do not delete data, change real passwords, or disrupt services. Training environment only.'),
      e('ev2','Discovery result','Network finding','10.90.0.21 exposes HTTP 8080 and SSH 22; 10.90.0.30 exposes only HTTPS 443.','The exposed HTTP service identifies itself as Build Console 2.4.'),
      e('ev3','Build console access','Web finding','The build console permits read access without login and exposes job metadata.','Job metadata includes a path to /artifacts/debug/config.txt.'),
      e('ev4','Debug artifact','Sensitive configuration','The debug artifact contains a training-only service credential for the portal API.','Credential: svc_reporter / training-report-27. This credential exists only inside the simulation.'),
      e('ev5','Portal API authorization','API behavior','The service credential can read reports but can also reach /api/admin/export because role checks trust any service account.','The credential is not an administrator, but the endpoint only checks account_type=service.'),
      e('ev6','Architecture note','Design artifact','Build artifacts are public to the internal segment and service credentials are long-lived.','A compromised workstation on the same segment could reproduce the same path.')
    ],
    browser:[
      {id:'b1',url:'http://10.90.0.21:8080',title:'Build Console',html:`<div class="fake-site"><h2>Build Console 2.4</h2><div class="box">Authentication: disabled (internal network)<br>Recent job: portal-release-771<br>Artifact index: <code>/artifacts/portal-release-771/</code></div></div>`},
      {id:'b2',url:'http://10.90.0.21:8080/artifacts/portal-release-771/',title:'Artifact index',html:`<div class="fake-site"><h2>portal-release-771</h2><div class="box">app.tar.gz<br>manifest.json<br><b>debug/config.txt</b></div></div>`},
      {id:'b3',url:'http://10.90.0.21:8080/artifacts/portal-release-771/debug/config.txt',title:'Debug config',html:`<div class="fake-site"><h2>debug/config.txt</h2><div class="box"><pre>PORTAL_API=https://portal.greybox.local/api
SERVICE_USER=svc_reporter
SERVICE_PASS=training-report-27</pre></div></div>`},
      {id:'b4',url:'https://portal.greybox.local/api/admin/export',title:'Admin export endpoint',html:`<div class="fake-site"><h2>Portal API</h2><div class="box">Unauthenticated request: 401<br>Service credential request: 200<br>Returned: training-only sample export manifest</div><p>The endpoint checks that the caller is a service account, not whether it has the admin.export permission.</p></div>`}
    ],
    terminal:[
      [/^help$/i,'Assessment scope is fictional and isolated. Try: cat scope.txt, nmap 10.90.0.0/24, nmap -sV 10.90.0.21, curl http://10.90.0.21:8080, curl https://portal.greybox.local/api/admin/export, cat findings.txt'],
      [/^cat scope\.txt$/i,'AUTHORIZED TRAINING RANGE: 10.90.0.0/24, portal.greybox.local\nAllowed: safe discovery, read-only validation, proof of access\nForbidden: destructive actions, denial of service'],
      [/^nmap 10\.90\.0\.0\/24$/i,'Nmap training scan\n10.90.0.21 up: 22/tcp open, 8080/tcp open\n10.90.0.30 up: 443/tcp open\n10.90.0.42 up: no exposed TCP services'],
      [/^nmap -sV 10\.90\.0\.21$/i,'22/tcp open ssh OpenSSH (training banner)\n8080/tcp open http Build Console 2.4'],
      [/^curl http:\/\/10\.90\.0\.21:8080\/?$/i,'HTTP/1.1 200 OK\nBuild Console 2.4\nAuth: disabled\nRecent artifact: /artifacts/portal-release-771/'],
      [/^curl https:\/\/portal\.greybox\.local\/api\/admin\/export$/i,'HTTP/1.1 401 Unauthorized\nHint: the browser evidence includes a training service credential discovered from the scoped build artifact.'],
      [/^cat findings\.txt$/i,'No findings are pre-written. Build the path yourself from discovery evidence.']
    ],
    actions:[
      {id:'a1',label:'Require authentication on the build console and artifact index',description:'Treat “internal” services as authenticated systems, not trusted by location alone.',outcome:'Unauthenticated users on the segment can no longer browse build metadata or artifacts.',quality:'good'},
      {id:'a2',label:'Remove credentials from build artifacts and rotate the exposed service credential',description:'Stop shipping long-lived secrets inside debug output.',outcome:'The discovered credential is invalidated and the build no longer emits it.',quality:'good'},
      {id:'a3',label:'Enforce explicit permission on /api/admin/export',description:'Require admin.export (or equivalent narrow authorization) rather than accepting every service identity.',outcome:'svc_reporter can read intended reports but receives 403 from the admin export endpoint.',quality:'good'},
      {id:'a4',label:'Hide port 8080 from the asset inventory',description:'Remove documentation without changing the service.',outcome:'The service remains reachable and discoverable from the scoped network.',quality:'bad'},
      {id:'a5',label:'Restrict build management to a dedicated administration segment',description:'Reduce which systems can even reach the management plane.',outcome:'Ordinary user segments no longer have a direct network path to the build console.',quality:'good'}
    ],
    hints:[
      'Start with scope, then discovery. Do not assume the web portal is the only useful target just because it has a friendly hostname.',
      'A meaningful penetration finding is usually a chain. Ask whether one exposure gives you information or authority that changes what you can reach next.',
      'For the final report, separate each weakness from the attack path: unauthenticated build console → exposed artifact secret → over-broad API authorization. Then harden every link, not only the last one.'
    ],
    evaluation:[
      {label:'Assessment path',groups:[['10.90.0.21','8080','build console'],['artifact','debug','config'],['svc_reporter','credential'],['admin/export','authorization']],supported:'You document a reproducible, non-destructive chain from discovery to unauthorized administrative data access.',partial:'You found one or more meaningful weaknesses but do not connect them into the strongest assessment path.',missing:'Your report does not yet demonstrate a meaningful scoped security path.'},
      {label:'Root causes',groups:[['authentication','build console','internal'],['secret','artifact','credential'],['authorization','permission','service account']],supported:'You distinguish three control failures instead of calling the entire path a single vulnerability.',partial:'You explain part of the chain but collapse different control failures together.',missing:'The underlying control failures are not clearly identified.'},
      {label:'Hardening',groups:[['authenticate','build console'],['rotate','remove','secret'],['admin.export','permission','authorization'],['segment','administration']],supported:'Your remediation breaks the path at multiple independent layers and preserves legitimate service function.',partial:'Your remediation closes one link but leaves another reusable path open.',missing:'The proposed changes do not reliably break the demonstrated path.'}
    ]
  },
  {
    id:'C011', title:'The Device in Reception', subtitle:'The inventory says printer. The network behavior says otherwise.', tier:'Network discovery + asset verification',
    brief:'Facilities asks why the reception printer keeps appearing in security alerts. The asset register lists one printer at reception, but DHCP shows two devices with similar names. Determine what is actually connected, which evidence distinguishes the devices, and what should be done without breaking reception operations.',
    environment:'Northstar Annex / isolated office LAN snapshot',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Asset register','Inventory','Reception should contain one managed printer: NS-PRN-01.','Expected MAC: 00:25:96:AA:11:10\nExpected address: reserved 10.40.2.50\nOwner: Facilities'),
      e('ev2','Second DHCP lease','DHCP','A device named NS-PRN-01-SETUP received 10.40.2.77 yesterday.','MAC: B8:27:EB:44:91:02\nVendor lookup in the training inventory: single-board computer manufacturer'),
      e('ev3','Unexpected services','Network scan','10.40.2.77 exposes SSH and a small HTTP service; the real printer exposes printing and management ports.','10.40.2.50: 80, 443, 9100\n10.40.2.77: 22, 8080'),
      e('ev4','Switch location','Network map','Both devices are connected to the reception access switch, but on different ports.','10.40.2.50 -> SW-RCP-01 Gi1/0/08\n10.40.2.77 -> SW-RCP-01 Gi1/0/11'),
      e('ev5','Setup page','HTTP banner','The unknown device serves a page titled Reception Queue Helper.','The page says it was installed temporarily for queue-number testing three months ago. There is no approved change record.')
    ],
    logs:[
      {id:'dhcp',name:'DHCP leases',text:`2026-09-12T08:00 lease 10.40.2.50 mac=00:25:96:AA:11:10 host=NS-PRN-01 reservation=yes\n2026-09-12T08:03 lease 10.40.2.77 mac=B8:27:EB:44:91:02 host=NS-PRN-01-SETUP reservation=no\n2026-09-13T07:58 renew 10.40.2.77 mac=B8:27:EB:44:91:02 host=NS-PRN-01-SETUP`},
      {id:'switch',name:'Switch MAC table',text:`SW-RCP-01 Gi1/0/08 00:25:96:AA:11:10 vlan=20 learned\nSW-RCP-01 Gi1/0/11 B8:27:EB:44:91:02 vlan=20 learned`}
    ],
    terminal:[
      [/^help$/i,'Try: cat inventory.txt, ip neigh, nmap 10.40.2.50, nmap 10.40.2.77, curl http://10.40.2.77:8080, grep 10.40.2.77 dhcp.log'],
      [/^cat inventory\.txt$/i,'NS-PRN-01 | printer | MAC 00:25:96:AA:11:10 | reserved 10.40.2.50 | reception'],
      [/^ip neigh$/i,'10.40.2.1 dev eth0 lladdr 00:11:22:33:44:01 REACHABLE\n10.40.2.50 dev eth0 lladdr 00:25:96:AA:11:10 REACHABLE\n10.40.2.77 dev eth0 lladdr B8:27:EB:44:91:02 REACHABLE'],
      [/^nmap 10\.40\.2\.50$/i,'10.40.2.50 up\n80/tcp open http\n443/tcp open https\n9100/tcp open jetdirect'],
      [/^nmap 10\.40\.2\.77$/i,'10.40.2.77 up\n22/tcp open ssh\n8080/tcp open http-alt'],
      [/^curl http:\/\/10\.40\.2\.77:8080\/?$/i,'HTTP/1.1 200 OK\nServer: queue-helper-training\nReception Queue Helper\nTemporary install — queue-number prototype'],
      [/^grep\s+10\.40\.2\.77\s+dhcp\.log$/i,'lease 10.40.2.77 mac=B8:27:EB:44:91:02 host=NS-PRN-01-SETUP reservation=no']
    ],
    actions:[
      {id:'a1',label:'Identify the physical owner before removal',description:'Confirm whether the unknown device supports a current business function.',outcome:'Facilities confirms the queue helper was a forgotten temporary prototype and is no longer required.',quality:'good'},
      {id:'a2',label:'Preserve its configuration and disconnect switch port Gi1/0/11',description:'Capture enough information for review, then remove the unmanaged host from the production VLAN.',outcome:'The unknown device is documented and isolated without touching the managed printer.',quality:'good'},
      {id:'a3',label:'Block 10.40.2.50 because it appears in printer alerts',description:'Disable the known printer address before validating which device generated the alert.',outcome:'Reception printing stops. The unknown device at 10.40.2.77 remains connected.',quality:'bad'},
      {id:'a4',label:'Require registration for new office devices',description:'Tie DHCP/switch access to an approved asset and owner.',outcome:'Future temporary devices must be inventoried or placed on a restricted onboarding network.',quality:'good'}
    ],
    hints:['Names are labels, not identity. Compare MAC addresses, expected services, leases, and switch ports.','Ask what behavior you would expect from a printer versus a small general-purpose computer.','The safe response targets the verified unknown device and preserves enough context to learn who placed it there and why.'],
    evaluation:[
      {label:'Asset identification',groups:[['10.40.2.77','B8:27:EB','unknown device','setup'],['10.40.2.50','00:25:96','real printer','managed printer']],supported:'You distinguish the managed printer from the unmanaged device using multiple identifiers.',partial:'You notice a second device but do not clearly prove which one is the managed printer.',missing:'The two devices are not reliably distinguished.'},
      {label:'Network reasoning',groups:[['22','ssh','8080'],['switch','Gi1/0/11','mac']],supported:'You use service behavior and switch/DHCP evidence rather than trusting hostnames.',partial:'You identify unusual services but do not tie the device to a physical/network location.',missing:'Your conclusion relies mainly on the device name.'},
      {label:'Response',groups:[['preserve','document'],['disconnect','isolate','Gi1/0/11'],['inventory','registration','onboarding']],supported:'You remove the unmanaged device safely and improve future asset control.',partial:'You isolate the device but do not address why it could appear unmanaged in the first place.',missing:'The proposed action risks disrupting the wrong device or leaves the unmanaged host connected.'}
    ]
  },
  {
    id:'C012', title:'Paid to the Wrong Account', subtitle:'The transfer was approved. The browser request was not.', tier:'Web request integrity + CSRF investigation',
    brief:'Finance changed a supplier bank account in the vendor portal, then discovered the new account was not the one the analyst typed. You have a safe copy of the portal, browser history, and HTTP logs. Determine whether the analyst account was directly compromised or whether the portal accepted an unwanted browser request.',
    environment:'Rook Logistics / isolated vendor portal',
    tools:['overview','mail','logs','browser','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Analyst statement','Interview','The analyst was logged in to the vendor portal and opened a supplier news link in another tab.','They did not see another login prompt and did not intentionally submit a bank-change form.'),
      e('ev2','Bank-change request','HTTP log','POST /vendors/88/bank succeeded from the analyst browser session.','Cookie session=valid was present. No anti-CSRF token or request-bound nonce was required.'),
      e('ev3','Cross-site origin','Browser artifact','The request was initiated immediately after a visit to supplier-weekly.test.','Referer: https://supplier-weekly.test/article/771\nOrigin header: https://supplier-weekly.test'),
      e('ev4','No new login','Identity log','There was no second login, new device, or token issuance around the bank change.','The existing authenticated browser session made the request.'),
      e('ev5','Portal form design','Code artifact','The server accepts the bank update based only on the session cookie and submitted fields.','No CSRF token validation and no Origin/Referer policy exists for state-changing requests.')
    ],
    mails:[
      {id:'m1',from:'Vendor Weekly <digest@supplier-weekly.test>',to:'Ari <ari@rook.test>',subject:'Supplier policy update',date:'Yesterday 13:42',body:'One of your suppliers updated its payment policy. Read the short notice here:\nhttps://supplier-weekly.test/article/771',raw:'SPF: pass\nDKIM: pass\nThis message is not itself a fake login page; the relevant behavior occurs after the link opens.'}
    ],
    logs:[
      {id:'http',name:'Portal HTTP',text:`13:46:01 GET /vendors/88 user=ari status=200 origin=https://portal.rook.local\n13:46:33 POST /vendors/88/bank user=ari status=200 origin=https://supplier-weekly.test referer=https://supplier-weekly.test/article/771 csrf=-\n13:46:35 GET /vendors/88 user=ari status=200 origin=https://portal.rook.local`},
      {id:'identity',name:'Identity',text:`12:09:17 user=ari login=SUCCESS device=ROOK-LT-19 mfa=SATISFIED\n13:00-15:00 user=ari new_login=NONE token_issue=NONE device_change=NONE`}
    ],
    browser:[
      {id:'b1',url:'https://portal.rook.local/vendors/88',title:'Vendor portal',html:`<div class="fake-site"><h2>Vendor #88</h2><div class="box">Bank account ending: 4408<br>Last changed: 13:46 by ari</div><p>The browser session is authenticated.</p></div>`},
      {id:'b2',url:'view-source://bank-form',title:'Bank update form',html:`<div class="fake-site"><h2>Form source</h2><div class="box"><pre>&lt;form method="POST" action="/vendors/88/bank"&gt;\n  &lt;input name="account"&gt;\n  &lt;button&gt;Save&lt;/button&gt;\n&lt;/form&gt;</pre></div><p>No anti-CSRF value is present.</p></div>`},
      {id:'b3',url:'https://supplier-weekly.test/article/771',title:'Supplier article',html:`<div class="fake-site"><h2>Supplier policy update</h2><p>Training snapshot shows a hidden cross-site form targeting <code>https://portal.rook.local/vendors/88/bank</code>.</p><div class="box">This is a simulated hostile page inside TRACE. No external request is made.</div></div>`}
    ],
    terminal:[
      [/^help$/i,'Try: cat bank_route.txt, grep POST portal.log, grep login identity.log, curl https://portal.rook.local/vendors/88/bank'],
      [/^cat bank_route\.txt$/i,'requireSession(req)\naccount = req.body.account\ndb.vendor(88).bank = account\nreturn 200\n// no CSRF token validation'],
      [/^grep\s+POST\s+portal\.log$/i,'13:46:33 POST /vendors/88/bank user=ari status=200 origin=https://supplier-weekly.test csrf=-'],
      [/^grep\s+login\s+identity\.log$/i,'12:09:17 login SUCCESS; no new login between 13:00 and 15:00'],
      [/^curl\s+https:\/\/portal\.rook\.local\/vendors\/88\/bank$/i,'HTTP/1.1 405 Method Not Allowed\nState change requires POST in this simulation. Inspect the recorded request instead of sending a destructive one.']
    ],
    actions:[
      {id:'a1',label:'Add server-validated anti-CSRF tokens to state-changing forms',description:'Bind sensitive requests to a value the hostile site cannot supply.',outcome:'Cross-site form submissions without the expected token are rejected.',quality:'good'},
      {id:'a2',label:'Validate Origin/Referer for sensitive browser requests',description:'Reject unexpected cross-origin state changes as an additional defense.',outcome:'Requests from supplier-weekly.test fail before the bank update logic runs.',quality:'good'},
      {id:'a3',label:'Force a password reset only',description:'Treat the event as stolen credentials without addressing the vulnerable request flow.',outcome:'The password changes, but the same cross-site request can succeed again while a user has an authenticated session.',quality:'bad'},
      {id:'a4',label:'Require step-up confirmation for bank-detail changes',description:'Add a deliberate confirmation boundary for high-impact changes.',outcome:'A background request cannot silently complete the change without the additional verification step.',quality:'good'}
    ],
    hints:['A successful request under a valid session does not prove someone stole the password. Look at how the request was initiated.','Compare Origin/Referer with the portal domain, and check whether a new login happened.','The root problem is request integrity: a different site could cause the authenticated browser to submit a sensitive action.'],
    evaluation:[
      {label:'Incident mechanism',groups:[['csrf','cross-site','cross site'],['supplier-weekly','origin','referer'],['session','cookie','existing session']],supported:'You explain how a hostile page used the already-authenticated browser rather than stealing a fresh login.',partial:'You identify a cross-site request issue but do not clearly distinguish it from account takeover.',missing:'The bank change is not tied to the recorded cross-site request.'},
      {label:'Evidence',groups:[['no new login','no second login','identity'],['13:46','POST','bank'],['csrf','missing token','no token']],supported:'You support the conclusion with identity and HTTP evidence.',partial:'You cite the request but do not use the identity evidence to rule down competing explanations.',missing:'The conclusion is not grounded in the available request and identity records.'},
      {label:'Hardening',groups:[['csrf token','anti-csrf'],['origin','referer'],['step-up','confirm','verification']],supported:'You harden both ordinary state-changing requests and the high-impact bank-change workflow.',partial:'You add one useful control but leave the workflow weaker than it needs to be.',missing:'The proposed fix does not reliably prevent unwanted cross-site state changes.'}
    ]
  },
  {
    id:'C013', title:'The Contractor Who Left', subtitle:'The badge was disabled. The account was not.', tier:'Identity lifecycle + remote access',
    brief:'A contractor left two months ago. Physical access was removed, but a weekend VPN session now appears under their name. Determine whether this is a logging error, legitimate retained access, or misuse of an account that should have been removed. Then fix the process that allowed it.',
    environment:'Harbor Engineering / identity + VPN snapshot',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Offboarding ticket','HR record','Contract ended 2026-07-11. Badge and equipment return are marked complete.','Identity deprovisioning field is blank. Manager approval expired with the contract.'),
      e('ev2','Active directory record','Identity','Account ext.mrivera remains enabled and is still a member of VPN-Contractors.','Password last changed 2026-05-02. MFA method: SMS to contractor-provided number.'),
      e('ev3','Weekend VPN session','VPN log','ext.mrivera connected Saturday at 02:14 from an address never previously seen for the account.','Session lasted 41 minutes and accessed the engineering file gateway.'),
      e('ev4','File access','Audit','The session read twelve project design files but made no changes.','Access is consistent with permissions the contractor legitimately had while employed.'),
      e('ev5','Manager confirmation','Interview','The former manager confirms no extension or weekend work was authorized.','The contractor should no longer have access to company systems.')
    ],
    logs:[
      {id:'vpn',name:'VPN',text:`2026-07-03T09:11 user=ext.mrivera result=SUCCESS ip=49.145.31.9 mfa=SMS\n2026-07-10T18:02 user=ext.mrivera result=SUCCESS ip=49.145.31.9 mfa=SMS\n2026-09-12T02:14 user=ext.mrivera result=SUCCESS ip=203.0.113.208 mfa=SMS\n2026-09-12T02:55 user=ext.mrivera disconnect bytes_out=184113922`},
      {id:'files',name:'Engineering file audit',text:`02:21 actor=ext.mrivera READ /engineering/atlas/design-v4.pdf\n02:22 actor=ext.mrivera READ /engineering/atlas/bom.xlsx\n02:23-02:48 actor=ext.mrivera READ count=10 path=/engineering/atlas/`}
    ],
    terminal:[
      [/^help$/i,'Try: cat offboarding.txt, id ext.mrivera, groups ext.mrivera, grep ext.mrivera vpn.log, grep ext.mrivera files.log'],
      [/^cat offboarding\.txt$/i,'Contract end: 2026-07-11\nBadge: disabled\nLaptop: returned\nIdentity account: [blank]\nManager extension: none'],
      [/^id\s+ext\.mrivera$/i,'ext.mrivera enabled=true type=contractor mfa=SMS password_last_changed=2026-05-02'],
      [/^groups\s+ext\.mrivera$/i,'VPN-Contractors Engineering-Atlas-Read'],
      [/^grep\s+ext\.mrivera\s+vpn\.log$/i,'2026-09-12 02:14 SUCCESS ip=203.0.113.208 mfa=SMS duration=41m'],
      [/^grep\s+ext\.mrivera\s+files\.log$/i,'02:21-02:48 READ 12 files under /engineering/atlas/']
    ],
    actions:[
      {id:'a1',label:'Disable the former contractor identity and revoke sessions',description:'Stop further use of the account after preserving the relevant records.',outcome:'The account is disabled and current remote-access sessions/tokens are invalidated.',quality:'good'},
      {id:'a2',label:'Preserve VPN, identity, and file-access records',description:'Keep the evidence needed to determine scope and ownership of the session.',outcome:'The offboarding gap and weekend activity are preserved for review.',quality:'good'},
      {id:'a3',label:'Delete the account immediately before collecting records',description:'Remove the identity object first.',outcome:'Access is stopped, but some easy-to-reference group and identity metadata is lost from the live directory view.',quality:'bad'},
      {id:'a4',label:'Automate contract-end deprovisioning with owner review',description:'Tie contractor identity expiration to the approved end date and require explicit extension.',outcome:'Contractor accounts now expire automatically unless a manager renews access before the end date.',quality:'good'},
      {id:'a5',label:'Replace SMS-only MFA for remote access',description:'Use a stronger phishing-resistant or app-based method appropriate to the environment.',outcome:'Remote access no longer relies on the former contractor phone number as the sole second factor.',quality:'good'}
    ],
    hints:['Do not start by guessing who used the account. First decide whether the account should have been usable at all.','Compare the contract end date with account state, group membership, and the VPN event.','The technical incident and the process failure are separate: investigate the session, then repair identity lifecycle controls.'],
    evaluation:[
      {label:'Access validity',groups:[['contract ended','offboarding','2026-07-11'],['enabled','VPN-Contractors','should have been disabled']],supported:'You establish that the identity remained active after authorization ended.',partial:'You notice a suspicious weekend login but do not tie it to the failed offboarding state.',missing:'Your conclusion does not establish whether the account should still have existed.'},
      {label:'Scope',groups:[['203.0.113.208','02:14','weekend'],['12','design files','atlas','file access']],supported:'You describe what the observed session actually did without claiming more than the logs show.',partial:'You identify the VPN use but not the file-access scope.',missing:'The activity performed during the session is not assessed.'},
      {label:'Lifecycle fix',groups:[['disable','revoke'],['expire','contract end','automatic'],['manager','renew','extension']],supported:'You contain the identity and repair the contractor lifecycle control that failed.',partial:'You disable this account but do not improve future contractor offboarding.',missing:'The account/process remains vulnerable to the same failure.'}
    ]
  },
  {
    id:'C014', title:'The Update That Runs at 09:05', subtitle:'The malware alert is gone. The behavior comes back every morning.', tier:'Windows persistence + host triage',
    brief:'A workstation was cleaned yesterday after a suspicious script was removed. At 09:05 today, the same outbound connection returned. Determine what restarts the behavior, what evidence proves persistence, and how to contain it without assuming the deleted script was the whole incident.',
    environment:'SignalDesk / Windows endpoint snapshot',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Recurring connection','Network','WS-23 connects to 198.51.100.91 at almost exactly 09:05 each morning.','Destination is fictional TRACE infrastructure. The pattern continued after yesterday\'s file deletion.'),
      e('ev2','Scheduled task','Host artifact','Task OfficeTelemetryCheck runs daily at 09:05 under the logged-in user.','Action: powershell.exe -ExecutionPolicy Bypass -File C:\\Users\\nina\\AppData\\Roaming\\telemetry.ps1'),
      e('ev3','Task creation event','Windows event','The task was created three days ago shortly after a document process launched PowerShell.','Creator: nina\nTime: 2026-09-10 14:22:11'),
      e('ev4','Deleted payload copy','File artifact','The original telemetry.ps1 was deleted during yesterday\'s cleanup, but a second copy exists under AppData\\Local\\Temp\\cache.ps1.','The scheduled command references telemetry.ps1, but another event shows cache.ps1 recreating it before task execution.'),
      e('ev5','No startup Run key','Host check','Common Run keys are clean.','The absence of one persistence method does not mean persistence is absent.')
    ],
    logs:[
      {id:'tasks',name:'Task Scheduler',text:`2026-09-10T14:22:11 Event=TaskCreated Name=OfficeTelemetryCheck User=nina\nTrigger=Daily 09:05\nAction=powershell.exe -ExecutionPolicy Bypass -File C:\\Users\\nina\\AppData\\Roaming\\telemetry.ps1\n2026-09-13T09:05:00 Event=TaskStarted Name=OfficeTelemetryCheck`},
      {id:'process',name:'Process events',text:`09:04:58 parent=wscript.exe child=powershell.exe cmd="-File C:\\Users\\nina\\AppData\\Local\\Temp\\cache.ps1"\n09:04:59 file_create=C:\\Users\\nina\\AppData\\Roaming\\telemetry.ps1\n09:05:00 parent=taskeng.exe child=powershell.exe cmd="-File C:\\Users\\nina\\AppData\\Roaming\\telemetry.ps1"\n09:05:04 network dest=198.51.100.91:443 process=powershell.exe`}
    ],
    terminal:[
      [/^help$/i,'Try: schtasks, cat task.txt, grep 09:05 process.log, cat startup.txt, cat hashes.txt'],
      [/^schtasks$/i,'OfficeTelemetryCheck | Daily 09:05 | Ready | user=nina'],
      [/^cat task\.txt$/i,'Task: OfficeTelemetryCheck\nAction: powershell.exe -ExecutionPolicy Bypass -File C:\\Users\\nina\\AppData\\Roaming\\telemetry.ps1\nCreated: 2026-09-10 14:22:11'],
      [/^grep\s+09:05\s+process\.log$/i,'09:05:00 taskeng.exe -> powershell.exe -> telemetry.ps1\n09:05:04 powershell.exe -> 198.51.100.91:443'],
      [/^cat startup\.txt$/i,'HKCU Run: clean\nHKLM Run: clean\nStartup folders: no new entries'],
      [/^cat hashes\.txt$/i,'telemetry.ps1 SHA256=training-aaa111\ncache.ps1 SHA256=training-bbb222\nBoth hashes are fictional TRACE artifacts.']
    ],
    actions:[
      {id:'a1',label:'Isolate WS-23 from the network',description:'Stop further outbound activity while preserving the endpoint for investigation.',outcome:'WS-23 can no longer reach the simulated external destination.',quality:'good'},
      {id:'a2',label:'Preserve task, process, and script artifacts before removal',description:'Capture the persistence chain rather than deleting only the visible payload.',outcome:'The scheduled task and script recreation sequence are preserved.',quality:'good'},
      {id:'a3',label:'Delete telemetry.ps1 again and close the ticket',description:'Repeat the prior cleanup without addressing the task or cache script.',outcome:'cache.ps1 recreates telemetry.ps1 before the next scheduled run.',quality:'bad'},
      {id:'a4',label:'Remove the scheduled task and both script locations after collection',description:'Break the observed persistence path after evidence capture.',outcome:'The 09:05 execution chain no longer occurs in the simulation.',quality:'good'},
      {id:'a5',label:'Add monitoring for new scheduled tasks invoking script interpreters',description:'Improve visibility into similar persistence behavior.',outcome:'Future unusual task creation generates a reviewable endpoint alert.',quality:'good'}
    ],
    hints:['A recurring time pattern often points to a trigger. Search for mechanisms that can launch something on a schedule.','Deleting the file did not explain why it reappeared. Build the process sequence immediately before 09:05.','The full chain is recreation script → scheduled task → PowerShell → outbound connection. Contain and preserve before cleaning it.'],
    evaluation:[
      {label:'Persistence',groups:[['scheduled task','OfficeTelemetryCheck','schtasks'],['09:05','taskeng','powershell']],supported:'You identify the scheduled task as the recurring execution trigger.',partial:'You identify suspicious PowerShell activity but not what reliably launches it.',missing:'The reason the behavior returns each morning is not established.'},
      {label:'Recreation chain',groups:[['cache.ps1','recreate','recreates'],['telemetry.ps1','AppData']],supported:'You explain why deleting the visible script did not permanently remove the behavior.',partial:'You know the payload returns but do not identify the second script involved.',missing:'The script reappearance remains unexplained.'},
      {label:'Response',groups:[['isolate','network'],['preserve','task','process'],['remove','scheduled task','both scripts']],supported:'You contain the host, preserve evidence, and remove the complete observed persistence chain.',partial:'You clean the host but do not clearly preserve or contain first.',missing:'Your response repeats the incomplete file-only cleanup.'}
    ]
  },
  {
    id:'C015', title:'The Empty Login Box', subtitle:'The database was “internal only.” So nobody configured authentication.', tier:'Authorized service assessment + hardening',
    brief:'You have written authorization to assess the fictional 10.66.5.0/24 lab segment. A development team says its cache service is safe because it is not published on the internet. Discover what is reachable from an ordinary workstation, validate impact without damaging data, and recommend a secure deployment pattern.',
    environment:'Greybox Dev / isolated service-assessment range',
    tools:['overview','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Rules of engagement','Scope','Authorized: 10.66.5.0/24, read-only validation, no destructive commands.','Goal: verify reachability and access controls from a standard user-segment vantage point.'),
      e('ev2','Service discovery','Network finding','10.66.5.18 exposes TCP 6379 to the user segment.','Training banner identifies a Redis-like cache service used by the portal.'),
      e('ev3','Authentication state','Service behavior','The service accepts read commands without authentication.','TRACE simulation exposes only safe read operations; no real Redis service is contacted.'),
      e('ev4','Sensitive cached value','Data exposure','A read-only key listing reveals password_reset:token:884 with a sample training token.','This demonstrates that the cache contains security-sensitive application state.'),
      e('ev5','Network intent','Architecture note','The service was intended to be reachable only by two application servers.','Actual firewall rule allows the entire 10.66.5.0/24 subnet.')
    ],
    terminal:[
      [/^help$/i,'Authorized TRACE range. Try: cat scope.txt, nmap 10.66.5.0/24, nmap -sV 10.66.5.18, redis-cli -h 10.66.5.18 PING, redis-cli -h 10.66.5.18 --scan, redis-cli -h 10.66.5.18 GET password_reset:token:884'],
      [/^cat scope\.txt$/i,'AUTHORIZED: 10.66.5.0/24\nAllowed: discovery and read-only validation\nDo not modify/delete keys or disrupt services.'],
      [/^nmap 10\.66\.5\.0\/24$/i,'10.66.5.18 up: 6379/tcp open\n10.66.5.21 up: 443/tcp open\n10.66.5.44 up: no exposed TCP services'],
      [/^nmap -sV 10\.66\.5\.18$/i,'6379/tcp open redis-like TRACE training service'],
      [/^redis-cli -h 10\.66\.5\.18 PING$/i,'PONG'],
      [/^redis-cli -h 10\.66\.5\.18 --scan$/i,'session:portal:441\npassword_reset:token:884\nfeature:banner'],
      [/^redis-cli -h 10\.66\.5\.18 GET password_reset:token:884$/i,'training-reset-token-884\n(read-only fictional value)']
    ],
    actions:[
      {id:'a1',label:'Restrict network access to the application servers only',description:'Remove user-segment reachability to the cache service.',outcome:'Ordinary workstations can no longer establish a connection to TCP 6379.',quality:'good'},
      {id:'a2',label:'Enable service authentication and rotate exposed sensitive values',description:'Require a dedicated application credential and invalidate data demonstrated during testing.',outcome:'Unauthenticated reads fail and the sample reset token is no longer valid.',quality:'good'},
      {id:'a3',label:'Move the service to a different port',description:'Keep the same exposure but make casual discovery slightly less obvious.',outcome:'The service remains reachable and unauthenticated from the user segment.',quality:'bad'},
      {id:'a4',label:'Stop caching password-reset tokens in plaintext where feasible',description:'Reduce the sensitivity of cache compromise by storing only what the application truly needs.',outcome:'The reset workflow is redesigned so a cache read alone does not reveal a reusable reset secret.',quality:'good'},
      {id:'a5',label:'Add a service exposure check to deployment reviews',description:'Verify intended source networks and authentication before internal services go live.',outcome:'Future deployments explicitly test whether management/data services are reachable from user networks.',quality:'good'}
    ],
    hints:['“Not on the internet” does not answer who can reach the service internally. Begin with scope and discovery.','You only need enough read-only proof to demonstrate impact. Do not turn validation into unnecessary modification.','The strongest remediation combines network restriction, service authentication, and reducing the sensitivity of what is stored.'],
    evaluation:[
      {label:'Validation',groups:[['10.66.5.18','6379'],['unauthenticated','no authentication','PING'],['password_reset','token','read']],supported:'You safely demonstrate that an ordinary user-segment host can read sensitive cache data without authentication.',partial:'You identify the exposed service but do not demonstrate why the exposure matters.',missing:'The assessment does not establish meaningful unauthorized access.'},
      {label:'Scope discipline',groups:[['read-only','non-destructive','no destructive'],['authorized','scope']],supported:'Your testing stays within the stated non-destructive authorization.',partial:'You mention scope but do not explain why your proof was sufficient without modifying data.',missing:'Your report does not show disciplined, scoped validation.'},
      {label:'Hardening',groups:[['restrict','application servers','firewall'],['authentication','credential'],['reset token','sensitive','plaintext']],supported:'You break the path at the network, service, and data-design layers.',partial:'You close one layer but leave another unnecessary exposure in place.',missing:'The recommended changes do not reliably prevent the demonstrated access.'}
    ]
  },
  {
    id:'C016', title:'One Trusted Header', subtitle:'The application trusts the proxy. It also trusts anyone who can imitate it.', tier:'Web trust-boundary assessment',
    brief:'An internal administration page is supposed to work only behind a reverse proxy. During a safe assessment, you find the application uses X-Forwarded-For to decide whether a request is “internal.” Determine whether a client can influence that decision and redesign the trust boundary.',
    environment:'Harbor Portal / isolated reverse-proxy lab',
    tools:['overview','browser','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Design note','Architecture','/admin/reports is intended for office users arriving through the trusted proxy.','The backend is also directly reachable on the training segment for maintenance.'),
      e('ev2','Authorization code','Code artifact','The route allows access when X-Forwarded-For starts with 10.20.','The application does not verify that the header was added by the trusted proxy.'),
      e('ev3','Direct request','HTTP behavior','A direct request to the backend without the header receives 403.','Client address: 10.90.0.44 in the training range.'),
      e('ev4','Spoofed header proof','HTTP behavior','The same direct request with X-Forwarded-For: 10.20.5.9 receives 200.','TRACE simulates the response; no external host is contacted.'),
      e('ev5','Proxy behavior','Config','The real reverse proxy overwrites X-Forwarded-For and authenticates office users.','The backend should trust only traffic from the proxy, not arbitrary header values from any reachable client.')
    ],
    browser:[
      {id:'b1',url:'https://portal.harbor.local/admin/reports',title:'Normal request',html:`<div class="fake-site"><h2>403 Forbidden</h2><div class="box">Direct backend request<br>X-Forwarded-For: absent</div></div>`},
      {id:'b2',url:'view-source://admin-route',title:'Route source',html:`<div class="fake-site"><h2>Authorization check</h2><div class="box"><pre>const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress\nif (!ip.startsWith('10.20.')) return 403\nreturn renderAdminReports()</pre></div></div>`},
      {id:'b3',url:'trace://request-with-header',title:'Safe spoof test',html:`<div class="fake-site"><h2>200 OK</h2><div class="box">Request header: X-Forwarded-For: 10.20.5.9<br>Backend accepted the request.</div><p>Training-only simulated request.</p></div>`}
    ],
    terminal:[
      [/^help$/i,'Try: cat proxy.conf, cat route.js, curl https://backend.harbor.local/admin/reports, curl -H "X-Forwarded-For: 10.20.5.9" https://backend.harbor.local/admin/reports'],
      [/^cat proxy\.conf$/i,'trusted_proxy=10.20.0.10\nproxy overwrites X-Forwarded-For\nproxy requires office SSO'],
      [/^cat route\.js$/i,"const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress\nif (!ip.startsWith('10.20.')) return 403\nreturn renderAdminReports()"],
      [/^curl\s+https:\/\/backend\.harbor\.local\/admin\/reports$/i,'HTTP/1.1 403 Forbidden'],
      [/^curl\s+-H\s+["']X-Forwarded-For:\s*10\.20\.5\.9["']\s+https:\/\/backend\.harbor\.local\/admin\/reports$/i,'HTTP/1.1 200 OK\n(training proof) admin report index']
    ],
    actions:[
      {id:'a1',label:'Block direct client access to the backend',description:'Allow backend connections only from the trusted reverse proxy and required management paths.',outcome:'Ordinary training-segment clients can no longer send requests directly to the application backend.',quality:'good'},
      {id:'a2',label:'Trust forwarded headers only from configured proxy addresses',description:'Ignore client-supplied forwarding headers unless the immediate peer is trusted.',outcome:'Spoofed X-Forwarded-For values from direct clients no longer influence authorization context.',quality:'good'},
      {id:'a3',label:'Use real application authorization for the admin route',description:'Require an authenticated principal with the reports-admin permission instead of treating source IP as sufficient authority.',outcome:'Office network location alone no longer grants administrative report access.',quality:'good'},
      {id:'a4',label:'Rename X-Forwarded-For to X-Office-IP',description:'Change the header name but continue trusting any client-provided value.',outcome:'A reachable client can supply the new header just as easily.',quality:'bad'}
    ],
    hints:['A header is data sent in a request. Ask who is allowed to set it and whether the backend can tell the difference.','The same check can be safe behind a strict proxy boundary and unsafe when the backend is directly reachable.','Fix the network path and the application authorization model; do not make an attacker-controlled header your security boundary.'],
    evaluation:[
      {label:'Trust-boundary flaw',groups:[['x-forwarded-for','header'],['direct','backend','reachable'],['spoof','10.20.5.9','200']],supported:'You demonstrate that a direct client can influence the header used for the internal-access decision.',partial:'You identify the risky header check but do not show why direct backend reachability makes it exploitable.',missing:'The trust-boundary failure is not established.'},
      {label:'Root cause',groups:[['proxy','trusted'],['header','client supplied','untrusted'],['authorization','ip']],supported:'You separate proxy metadata from actual authorization and identify the misplaced trust.',partial:'You know the IP check is weak but do not explain the proxy/header trust relationship.',missing:'The issue is described as a generic network problem rather than a trust-boundary failure.'},
      {label:'Hardening',groups:[['block direct','only proxy','firewall'],['trusted proxy','ignore header'],['permission','authenticated','admin']],supported:'You harden network reachability, forwarded-header handling, and application authorization.',partial:'You address one or two layers but leave a reusable trust shortcut.',missing:'The backend still relies on attacker-influenced location data for authorization.'}
    ]
  },
  {
    id:'C017', title:'Lunch-Time DNS', subtitle:'Every query resolves to nothing. The pattern still says something.', tier:'DNS telemetry + covert-channel investigation',
    brief:'The SOC notices a workstation generating hundreds of failed DNS lookups only during lunch. No malware alert exists, and normal browsing still works. Determine whether the traffic is random application noise or structured data movement, identify the host process involved, and choose a proportionate response.',
    environment:'Greywell / DNS + endpoint telemetry snapshot',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Query pattern','DNS','WS-FIN-07 sends long, unique subdomains to sync-check.training every 15 seconds from 12:05–12:34.','Examples contain 40–55 hexadecimal-looking characters before the domain.'),
      e('ev2','NXDOMAIN responses','DNS','The recursive resolver returns NXDOMAIN for almost every query.','The lack of successful resolution does not mean the requests carry no information.'),
      e('ev3','Process attribution','Endpoint','dnshelper.exe PID 4412 generates the DNS requests.','Binary path: C:\\Users\\lee\\AppData\\Roaming\\dnshelper.exe\nFirst seen yesterday.'),
      e('ev4','Encoded-looking sequence','Analyst artifact','The left-most labels change in a way that resembles chunked encoded data rather than normal hostnames.','TRACE does not require decoding the data to establish that the behavior is abnormal and structured.'),
      e('ev5','Normal software baseline','Inventory','Approved update agents query short, stable vendor hostnames and do not create hundreds of unique NXDOMAINs.','dnshelper.exe is not present in the software inventory.')
    ],
    logs:[
      {id:'dns',name:'DNS resolver',text:`12:05:01 client=10.30.8.47 q=4f524445522d3131.sync-check.training type=A rcode=NXDOMAIN\n12:05:16 client=10.30.8.47 q=2d46494e2d30372d41.sync-check.training type=A rcode=NXDOMAIN\n12:05:31 client=10.30.8.47 q=343132393837363531.sync-check.training type=A rcode=NXDOMAIN\n12:05:46 client=10.30.8.47 q=2d4348554e4b3031.sync-check.training type=A rcode=NXDOMAIN\n... repeated every ~15s ...\n12:34:58 client=10.30.8.47 q=454e442d4348554e4b.sync-check.training type=A rcode=NXDOMAIN`},
      {id:'endpoint',name:'Endpoint network attribution',text:`12:05:01 host=WS-FIN-07 pid=4412 process=dnshelper.exe query=4f524445522d3131.sync-check.training\n12:05:16 host=WS-FIN-07 pid=4412 process=dnshelper.exe query=2d46494e2d30372d41.sync-check.training\n12:35:02 host=WS-FIN-07 pid=4412 process=dnshelper.exe stopped`}
    ],
    terminal:[
      [/^help$/i,'Try: cat baseline.txt, grep sync-check dns.log, grep 4412 endpoint.log, cat process_4412.txt, nslookup sync-check.training'],
      [/^cat baseline\.txt$/i,'Approved update domains: update.vendor-a.test, cdn.vendor-b.test\nTypical labels: stable and short\nWS-FIN-07 unique NXDOMAIN queries yesterday: 3\nToday 12:05-12:35: 119'],
      [/^grep\s+sync-check\s+dns\.log$/i,'119 unique subdomain queries from 10.30.8.47 between 12:05 and 12:35; 117 NXDOMAIN'],
      [/^grep\s+4412\s+endpoint\.log$/i,'pid=4412 process=dnshelper.exe generated sync-check.training queries every ~15 seconds'],
      [/^cat process_4412\.txt$/i,'PID 4412\nImage: C:\\Users\\lee\\AppData\\Roaming\\dnshelper.exe\nSigner: none\nFirst seen: 2026-09-12 11:58\nInventory: not approved'],
      [/^nslookup\s+sync-check\.training$/i,'server cannot find sync-check.training: NXDOMAIN\nNote: the important evidence is the repeated query content and process attribution, not a successful resolution.']
    ],
    actions:[
      {id:'a1',label:'Isolate WS-FIN-07 and preserve endpoint/DNS telemetry',description:'Contain the suspicious host while keeping the process and query history for analysis.',outcome:'The workstation stops generating external DNS requests and its relevant telemetry is preserved.',quality:'good'},
      {id:'a2',label:'Block sync-check.training at the resolver',description:'Prevent additional clients from using the observed domain.',outcome:'Queries to the domain are blocked, but the infected host still requires investigation.',quality:'good'},
      {id:'a3',label:'Ignore the traffic because every lookup failed',description:'Treat NXDOMAIN as proof that no communication occurred.',outcome:'The encoded-looking query labels continue leaving the workstation even though the names do not resolve.',quality:'bad'},
      {id:'a4',label:'Hunt for dnshelper.exe and similar DNS patterns across endpoints',description:'Check whether the behavior exists beyond the first host.',outcome:'The wider training snapshot finds no second copy, narrowing current scope to WS-FIN-07.',quality:'good'},
      {id:'a5',label:'Add DNS analytics for high-entropy/unique subdomain bursts',description:'Improve visibility into unusual query shape and volume without blocking normal DNS globally.',outcome:'Future bursts of many long unique labels receive reviewable alerts.',quality:'good'}
    ],
    hints:['Do not judge DNS only by whether an answer comes back. The query itself leaves the endpoint and reaches the resolver.','Compare the shape, uniqueness, timing, and generating process with known-good DNS behavior.','You do not need to decode every label to justify containment when the process, timing, and structured query pattern agree.'],
    evaluation:[
      {label:'Traffic interpretation',groups:[['long','unique','subdomain'],['nxdomain'],['15 seconds','repeated','119']],supported:'You recognize the repeated unique query labels as structured abnormal traffic despite failed resolution.',partial:'You flag DNS as suspicious but do not explain what makes the pattern different from ordinary lookups.',missing:'The DNS pattern is not meaningfully interpreted.'},
      {label:'Host attribution',groups:[['dnshelper.exe','4412'],['AppData','unsigned','not approved']],supported:'You tie the DNS behavior to a specific unapproved endpoint process.',partial:'You identify the host but not the generating process.',missing:'The source process is not established.'},
      {label:'Response',groups:[['isolate','WS-FIN-07'],['preserve','dns','endpoint'],['hunt','other hosts','similar'],['block','sync-check']],supported:'You contain the host, preserve evidence, and check whether the pattern exists elsewhere.',partial:'You block the domain or isolate the host but do not investigate broader scope.',missing:'The response does not adequately contain or scope the suspicious behavior.'}
    ]
  },
  {
    id:'C018', title:'Fetch This for Me', subtitle:'The server can reach places the user cannot.', tier:'SSRF-style web assessment + egress control',
    brief:'A profile service lets users import an avatar from a URL. You have authorization to test the isolated application. Determine whether the server fetcher can be used to reach internal-only endpoints, demonstrate impact with a harmless read, and design controls that preserve legitimate image imports.',
    environment:'Signal Profile / isolated server-side fetch lab',
    tools:['overview','browser','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Avatar importer','Feature','POST /api/avatar/import accepts a user-supplied URL and downloads the resource from the application server.','Intended use: HTTPS images from approved public hosts.'),
      e('ev2','Internal status service','Architecture','http://127.0.0.1:9000/status is reachable only from the application host.','It returns build name and environment health. It is not intended for end users.'),
      e('ev3','Safe internal fetch proof','HTTP behavior','Supplying http://127.0.0.1:9000/status causes the importer to return the internal status body.','TRACE simulates this read-only request; it cannot access your machine or the public internet.'),
      e('ev4','No destination validation','Code artifact','The fetcher validates only that the input parses as a URL.','It does not restrict scheme, hostname, resolved address range, redirects, or response content type.'),
      e('ev5','Legitimate requirement','Product note','Users only need JPEG/PNG imports from a small set of image providers.','The feature does not require arbitrary network access.')
    ],
    browser:[
      {id:'b1',url:'https://profile.signal.local/avatar',title:'Avatar importer',html:`<div class="fake-site"><h2>Import avatar</h2><div class="box">URL: https://images.example.training/avatar/42.png<br>Result: imported image/png</div></div>`},
      {id:'b2',url:'trace://avatar-import-internal',title:'Internal fetch proof',html:`<div class="fake-site"><h2>Importer response</h2><div class="box"><pre>{ "service":"profile-worker", "build":"2026.09.11", "health":"ok" }</pre></div><p>Source URL used in the simulation: <code>http://127.0.0.1:9000/status</code></p></div>`},
      {id:'b3',url:'view-source://fetcher',title:'Fetcher source',html:`<div class="fake-site"><h2>Fetcher</h2><div class="box"><pre>const u = new URL(req.body.url)\nconst r = await fetch(u)\nreturn pipe(r.body)</pre></div><p>No host, scheme, IP-range, redirect, or content-type policy.</p></div>`}
    ],
    terminal:[
      [/^help$/i,'Authorized simulation. Try: cat scope.txt, cat fetcher.js, curl https://profile.signal.local/api/avatar/import, cat network_policy.txt'],
      [/^cat scope\.txt$/i,'Authorized: profile.signal.local training app\nAllowed: harmless read-only validation\nDo not attempt destructive internal actions.'],
      [/^cat fetcher\.js$/i,'const u = new URL(req.body.url)\nconst r = await fetch(u)\nreturn pipe(r.body)'],
      [/^curl\s+https:\/\/profile\.signal\.local\/api\/avatar\/import$/i,'HTTP/1.1 400 Bad Request\nExpected JSON body with image URL. Use the Browser evidence for the pre-recorded safe internal fetch proof.'],
      [/^cat network_policy\.txt$/i,'profile-worker outbound policy: ANY\n127.0.0.0/8 reachable locally\nApproved image hosts exist but are not enforced']
    ],
    actions:[
      {id:'a1',label:'Allowlist required image hosts and HTTPS only',description:'Permit only destinations needed by the product instead of arbitrary URLs.',outcome:'Unapproved hosts and non-HTTPS schemes are rejected before fetch.',quality:'good'},
      {id:'a2',label:'Block loopback, private, link-local, and other internal address ranges after DNS resolution',description:'Prevent the fetcher from reaching internal networks even when a hostname resolves there.',outcome:'Requests resolving to internal-only address space are denied.',quality:'good'},
      {id:'a3',label:'Revalidate every redirect destination',description:'Do not allow an approved public URL to redirect the server into an internal address.',outcome:'Redirect chains are checked against the same destination policy before each fetch.',quality:'good'},
      {id:'a4',label:'Restrict the worker egress at the network layer',description:'Give the image worker only the outbound network paths it actually requires.',outcome:'Even an application validation bug cannot freely reach arbitrary internal services.',quality:'good'},
      {id:'a5',label:'Block only the literal string 127.0.0.1',description:'Reject one representation while leaving equivalent internal destinations possible.',outcome:'The control is too narrow and does not establish a real destination policy.',quality:'bad'}
    ],
    hints:['The interesting question is not what the browser can reach. It is what the server fetcher can reach on the user’s behalf.','A safe proof can read a harmless internal status page; you do not need to target sensitive services to establish the trust problem.','A durable fix validates the destination after resolution and redirects, and also limits the worker’s network egress.'],
    evaluation:[
      {label:'Server-side reachability',groups:[['server','fetcher','avatar importer'],['127.0.0.1','9000','internal status'],['read-only','status','proof']],supported:'You demonstrate that user-controlled input can make the server retrieve an internal-only resource.',partial:'You identify SSRF-like behavior but do not clearly show the internal reachability proof.',missing:'The server-side network pivot is not established.'},
      {label:'Root cause',groups:[['no validation','arbitrary url','destination'],['dns','resolved address','redirect']],supported:'You identify the missing destination policy rather than focusing on one blocked string.',partial:'You suggest blocking localhost but do not address alternate internal destinations or redirects.',missing:'The cause is not framed as insufficient server-side destination control.'},
      {label:'Hardening',groups:[['allowlist','https'],['private','loopback','link-local'],['redirect'],['egress']],supported:'You combine application validation with network egress restrictions while preserving intended image imports.',partial:'You add useful filtering but leave a bypass class or unrestricted egress.',missing:'The importer can still reach arbitrary internal destinations.'}
    ]
  },
  {
    id:'C019', title:'The Service Account That Became a Person', subtitle:'Automation credentials started showing up in interactive logins.', tier:'Service identity + least privilege',
    brief:'A nightly reporting job uses svc_reports to query a database. The account now appears in an interactive remote-login event. Determine what changed, whether the service identity can be abused outside its intended job, and redesign it so automation can work without behaving like a normal human account.',
    environment:'Northstar Analytics / identity + server snapshot',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Job requirement','Operations','svc_reports needs read-only database access from REPORT-01 between 01:00 and 02:00.','No interactive desktop, VPN, shell, or file-share access is required.'),
      e('ev2','Identity configuration','Directory','svc_reports is a normal enabled user with password logon and membership in Remote Desktop Users.','Password expires never. Last changed 287 days ago.'),
      e('ev3','Interactive login','Windows log','svc_reports logged on interactively to APP-02 at 18:44 from WS-14.','Logon type indicates remote interactive use, not a scheduled service execution.'),
      e('ev4','Credential location','Config audit','The password exists in plain text inside C:\\Reports\\job.ini on REPORT-01.','ACL permits local Users read access.'),
      e('ev5','Database role','Database','svc_reports has SELECT on reporting views and also db_owner inherited from an old troubleshooting change.','db_owner is not required by the reporting job.')
    ],
    logs:[
      {id:'auth',name:'Windows authentication',text:`01:10:00 host=REPORT-01 user=svc_reports logon_type=SERVICE result=SUCCESS\n01:12:44 host=REPORT-01 user=svc_reports db_connect=SUCCESS\n18:44:11 host=APP-02 user=svc_reports logon_type=REMOTE_INTERACTIVE source=WS-14 result=SUCCESS`},
      {id:'db',name:'Database audit',text:`01:12-01:39 principal=svc_reports SELECT reporting.* count=22\n18:51 principal=svc_reports SELECT sys.tables\n18:52 principal=svc_reports ALTER role=test_role add member=svc_reports -- permitted by inherited db_owner (training snapshot)`}
    ],
    terminal:[
      [/^help$/i,'Try: cat job.ini, id svc_reports, groups svc_reports, grep svc_reports auth.log, cat db_roles.txt'],
      [/^cat job\.ini$/i,'DB_USER=svc_reports\nDB_PASSWORD=training-long-lived-password\nDB_HOST=db01.analytics.local\n# fictional TRACE credential'],
      [/^id\s+svc_reports$/i,'svc_reports type=user enabled=true interactive_logon=true password_age=287d expires=never'],
      [/^groups\s+svc_reports$/i,'Remote Desktop Users Reporting-Jobs'],
      [/^grep\s+svc_reports\s+auth\.log$/i,'01:10 SERVICE REPORT-01\n18:44 REMOTE_INTERACTIVE APP-02 source=WS-14'],
      [/^cat db_roles\.txt$/i,'Required: SELECT reporting views\nCurrent: reporting_reader + db_owner\nReason for db_owner: temporary troubleshooting, never removed']
    ],
    actions:[
      {id:'a1',label:'Disable interactive login for the service identity',description:'Prevent RDP/VPN/shell-style use while preserving the scheduled job path.',outcome:'svc_reports can no longer be used as a normal human login.',quality:'good'},
      {id:'a2',label:'Move the secret to a protected service-secret mechanism and rotate it',description:'Remove the plain-text credential from a broadly readable config file.',outcome:'The old credential is invalidated and the job retrieves a protected replacement at runtime.',quality:'good'},
      {id:'a3',label:'Remove db_owner and keep only reporting read permissions',description:'Return the database identity to the minimum privileges the job needs.',outcome:'The job continues to read reports but cannot administer the database.',quality:'good'},
      {id:'a4',label:'Rename svc_reports to svc_reports_hidden',description:'Change the account name without changing how it can authenticate or what it can do.',outcome:'The same credential and privileges remain usable under a different name.',quality:'bad'},
      {id:'a5',label:'Alert on service identities used interactively',description:'Detect automation accounts behaving like people.',outcome:'Future remote-interactive use of non-human identities generates an investigation signal.',quality:'good'}
    ],
    hints:['Start from intended behavior: where, when, and how should this identity authenticate?','A service account becomes risky when it combines reusable human-style credentials, interactive access, and privileges beyond its job.','Hardening should preserve the nightly report while removing unnecessary ways to reuse the identity.'],
    evaluation:[
      {label:'Misuse evidence',groups:[['remote interactive','18:44','APP-02'],['WS-14','interactive login']],supported:'You distinguish the abnormal human-style login from the normal scheduled service use.',partial:'You notice the account was used oddly but do not explain why the logon type matters.',missing:'The interactive misuse is not established.'},
      {label:'Privilege/secret problems',groups:[['job.ini','plain text','password'],['db_owner','too much','least privilege']],supported:'You identify both credential exposure and excess database authority.',partial:'You identify one major control failure but miss the other.',missing:'The service identity weaknesses are not fully assessed.'},
      {label:'Redesign',groups:[['disable interactive','non-interactive'],['rotate','secret','protected'],['remove db_owner','read-only'],['alert','interactive']],supported:'You redesign the identity around its actual automation task while improving detection.',partial:'You fix one weakness but leave the account reusable as a person or over-privileged.',missing:'The service account remains broadly reusable outside its intended job.'}
    ]
  },
  {
    id:'C020', title:'Monday, 08:12', subtitle:'One complaint, four systems, and no label telling you what kind of incident this is.', tier:'Open small-office compromise investigation',
    brief:'At 08:12 Monday, a five-person architecture studio reports that shared files are opening slowly and one employee saw a browser security warning. You receive a snapshot of email, endpoint, DNS, identity, file access, and a small internal web service. There is no declared incident type. Build the timeline, separate cause from unrelated weaknesses, contain what is actually compromised, and leave the studio safer than you found it.',
    environment:'Morrow Studio / multi-system capstone simulation',
    tools:['overview','mail','logs','browser','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Security warning report','Helpdesk','Jules saw a certificate warning after opening a project-share link Friday afternoon.','Jules closed the warning page but had already downloaded a file named Morrow_Project_Update.zip from the same email thread.'),
      e('ev2','Archive execution chain','Endpoint','Inside the ZIP, project_viewer.lnk launched PowerShell on JULES-LT.','PowerShell wrote updater.ps1 and created scheduled task ProjectSync at 08:00 weekdays.'),
      e('ev3','Monday DNS burst','DNS','At 08:00 JULES-LT began repeated unique subdomain queries to assets-sync.training.','Queries were generated by powershell.exe started by ProjectSync.'),
      e('ev4','File-share access','File audit','At 08:04 Jules\' existing domain session read 63 project files from NAS-01.','No delete/encrypt operations are recorded. Reads are higher than Jules\' normal baseline.'),
      e('ev5','Separate web weakness','Web finding','The internal timesheet app exposes /debug/config to any office user.','It contains only a training database hostname and feature flags. Logs show no request to the debug route during the incident window.'),
      e('ev6','Identity evidence','Identity','No new external cloud login appears for Jules.','The activity is currently better explained by execution on Jules\' workstation using her existing local/domain context.'),
      e('ev7','Persistence trigger','Host artifact','ProjectSync task runs powershell.exe -File C:\\Users\\Jules\\AppData\\Roaming\\updater.ps1 every weekday at 08:00.','Created Friday 16:38, two minutes after project_viewer.lnk executed.')
    ],
    mails:[
      {id:'m1',from:'Theo / Build Partner <theo@build-partner.test>',to:'Jules <jules@morrow.test>',subject:'RE: Morrow project package',date:'Friday 16:31',body:'Jules,\n\nThe preview tool is included because the drawings are too large for the web viewer.\n\nDownload: https://project-share.test/Morrow_Project_Update.zip\n\nTheo',raw:'Reply-To: packages@project-share.test\nSPF: fail\nDKIM: none\nThread subject matches a real project, but sender infrastructure differs from prior messages.'},
      {id:'m2',from:'Theo / Build Partner <theo@build-partner.test>',to:'Jules <jules@morrow.test>',subject:'RE: Morrow project package',date:'Previous week',body:'Jules, the updated PDF set is in our normal portal. No extra viewer is required.\n\nTheo',raw:'SPF: pass\nDKIM: pass\nReturn-Path: theo@build-partner.test'}
    ],
    logs:[
      {id:'endpoint',name:'JULES-LT endpoint',text:`Fri 16:36:11 explorer.exe opened Morrow_Project_Update.zip\nFri 16:36:42 explorer.exe -> project_viewer.lnk\nFri 16:36:43 project_viewer.lnk -> powershell.exe\nFri 16:36:45 file_create C:\\Users\\Jules\\AppData\\Roaming\\updater.ps1\nFri 16:38:02 task_create ProjectSync trigger=weekdays 08:00\nMon 08:00:00 task_start ProjectSync\nMon 08:00:01 powershell.exe -File updater.ps1`},
      {id:'dns',name:'DNS',text:`08:00:05 client=10.12.4.23 q=4d4f52524f572d3031.assets-sync.training NXDOMAIN\n08:00:20 client=10.12.4.23 q=50524f4a4543542d41.assets-sync.training NXDOMAIN\n08:00:35 client=10.12.4.23 q=4348554e4b2d3031.assets-sync.training NXDOMAIN\n... unique label every ~15s ...`},
      {id:'files',name:'NAS-01 audit',text:`07:50-08:00 actor=jules READ count=3\n08:04-08:09 actor=jules READ count=63 path=/projects/active/\nDELETE count=0\nWRITE count=0`},
      {id:'identity',name:'Identity',text:`Fri 09:02 cloud_login user=jules device=JULES-LT mfa=SATISFIED\nFri 16:00-Mon 09:00 new_external_login user=jules NONE\nMon 08:04 SMB auth user=jules source=JULES-LT SUCCESS`},
      {id:'web',name:'Timesheet web',text:`/debug/config requests in incident window: 0\nNormal app traffic from office users: 184 requests\nNo evidence linking /debug/config to JULES-LT activity`}
    ],
    browser:[
      {id:'b1',url:'https://timesheet.morrow.local/debug/config',title:'Separate weakness',html:`<div class="fake-site"><h2>debug/config</h2><div class="box"><pre>DB_HOST=db-timesheet.morrow.local\nFEATURE_OVERTIME=true\nENV=production</pre></div><p>This is a real exposure. The incident logs show no access to it during the compromise window.</p></div>`},
      {id:'b2',url:'https://project-share.test/Morrow_Project_Update.zip',title:'Project-share lure',html:`<div class="fake-site"><h2>Project Share</h2><div class="box">Morrow_Project_Update.zip<br>Contains: project_viewer.lnk</div><p>Fictional training artifact only.</p></div>`}
    ],
    terminal:[
      [/^help$/i,'Try: cat triage.txt, grep ProjectSync endpoint.log, grep assets-sync dns.log, grep jules files.log, grep jules identity.log, grep debug web.log, cat network_map.txt'],
      [/^cat triage\.txt$/i,'Host under review: JULES-LT 10.12.4.23\nUser: jules\nKnown business systems: NAS-01, timesheet.morrow.local, mail'],
      [/^grep\s+ProjectSync\s+endpoint\.log$/i,'Fri 16:38:02 task_create ProjectSync\nMon 08:00:00 task_start ProjectSync -> powershell.exe -> updater.ps1'],
      [/^grep\s+assets-sync\s+dns\.log$/i,'Mon 08:00-08:30 repeated unique subdomain queries from 10.12.4.23 every ~15 seconds'],
      [/^grep\s+jules\s+files\.log$/i,'08:04-08:09 user=jules source=JULES-LT READ 63 files /projects/active/; writes=0 deletes=0'],
      [/^grep\s+jules\s+identity\.log$/i,'No new external cloud login; SMB auth at 08:04 came from JULES-LT using existing jules context'],
      [/^grep\s+debug\s+web\.log$/i,'/debug/config requests during incident window: 0'],
      [/^cat network_map\.txt$/i,'JULES-LT -> office VLAN\nNAS-01 -> file VLAN reachable from office users\nTimesheet -> internal web\nDNS -> office resolver\nNo evidence of additional compromised hosts in current snapshot']
    ],
    actions:[
      {id:'a1',label:'Preserve JULES-LT endpoint, DNS, and NAS audit evidence',description:'Capture the timeline before cleaning the workstation or changing account state.',outcome:'The execution, persistence, DNS, and file-access sequence is preserved.',quality:'good'},
      {id:'a2',label:'Isolate JULES-LT from the network',description:'Stop further DNS and file-share activity from the compromised workstation.',outcome:'JULES-LT loses production network access while remaining available for local analysis.',quality:'good'},
      {id:'a3',label:'Remove ProjectSync and updater.ps1 after evidence collection',description:'Break the observed persistence mechanism on the endpoint.',outcome:'The weekday 08:00 execution no longer occurs in the simulation.',quality:'good'},
      {id:'a4',label:'Reset Jules’ credentials and invalidate sessions after endpoint containment',description:'Reduce risk that captured credentials or tokens could be reused even though no external login is currently observed.',outcome:'Jules receives fresh credentials and existing sessions are invalidated after the host is contained.',quality:'good'},
      {id:'a5',label:'Take the NAS offline immediately',description:'Stop all studio file access despite no evidence of encryption or destructive writes.',outcome:'The studio loses shared-file access. The compromised workstation was the observed source, so this is unnecessarily disruptive at the current evidence level.',quality:'bad'},
      {id:'a6',label:'Track and fix /debug/config as a separate finding',description:'Remediate the exposed debug endpoint without claiming it caused this incident.',outcome:'The timesheet exposure is assigned for hardening while remaining separate from the evidence-backed compromise chain.',quality:'good'},
      {id:'a7',label:'Block the project-share and assets-sync domains in the training controls',description:'Reduce repeat exposure while endpoint and email scoping continues.',outcome:'The known lure and DNS destination are blocked for the rest of the simulated office.',quality:'good'}
    ],
    hints:['Build a timeline before naming the incident. Friday email/ZIP activity and Monday 08:00 behavior may connect.','Separate execution, persistence, communication, and file access. Then ask whether identity logs support a separate external account takeover.','The timesheet debug page is a real weakness, but the strongest incident theory should explain the timestamps across email → LNK → PowerShell → task → DNS → NAS reads.'],
    evaluation:[
      {label:'Compromise timeline',groups:[['project_viewer.lnk','zip','email'],['powershell','updater.ps1'],['ProjectSync','08:00'],['assets-sync','dns'],['63','file','NAS']],supported:'You reconstruct the multi-stage endpoint compromise from initial execution through persistence, DNS activity, and unusual file reads.',partial:'You identify the compromised workstation but omit one or more major stages in the timeline.',missing:'The observed artifacts are not connected into a defensible incident chain.'},
      {label:'Evidence discipline',groups:[['no new external login','existing context','local'],['debug','separate','unrelated','no access']],supported:'You use the identity evidence to avoid overclaiming account takeover and keep the unrelated web weakness separate.',partial:'You notice the distractor or identity evidence but do not clearly separate it from the incident cause.',missing:'Your theory overstates unsupported paths or treats every weakness as causation.'},
      {label:'Containment + recovery',groups:[['preserve','evidence'],['isolate','JULES-LT'],['remove','ProjectSync','updater'],['reset','session'],['block','domain']],supported:'You preserve evidence, contain the compromised endpoint, remove persistence, reduce credential risk, and block observed infrastructure.',partial:'You contain the host but leave either persistence or identity/session risk insufficiently addressed.',missing:'The compromised workstation remains able to repeat the observed behavior.'},
      {label:'Security improvement',groups:[['debug','separate','fix'],['attachment','lnk','email','filter','training'],['dns','monitor','task']],supported:'You leave the studio safer by addressing both the incident path and the independent debug exposure without conflating them.',partial:'You remediate the immediate host but do not capture broader preventive improvements.',missing:'The response ends at cleanup without meaningful hardening.'}
    ]
  }
  ,{
    id:'C021', title:'Everyone Can Read It', subtitle:'The share was meant for backups. Guest access made it a data source.', tier:'Internal exposure assessment',
    brief:'During an authorized review of a small office network, you find a file server with several SMB shares. One share appears intended for automated backups. Determine whether an ordinary user-segment device can read sensitive material without credentials, prove only the minimum necessary impact, and recommend a fix that preserves the backup workflow.',
    environment:'Lattice Works / isolated file-server snapshot',
    tools:['overview','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Reachable SMB service','Network observation','10.31.20.12 exposes SMB to the office user VLAN.','TCP 445 is reachable from the authorized analyst workstation on 10.31.10.44.'),
      e('ev2','Guest-readable backup share','Share listing','ops-backup allows guest read access.','Share: ops-backup\nRead: Everyone\nWrite: BackupSvc only\nGuest: enabled'),
      e('ev3','Configuration archive','File listing','The share contains a recent application configuration archive.','app-config-2026-09-12.zip is readable without authentication in the simulation.'),
      e('ev4','Plaintext credential artifact','Archive preview','A .env file inside the archive contains a database password used by the staging application.','DB_USER=stage_app\nDB_PASSWORD=violet-river-training-only\nFictional credential; no external system exists.'),
      e('ev5','Business requirement','Operations note','BackupSvc must continue writing nightly archives to the file server.','Office users do not need interactive access to the backup share.')
    ],
    terminal:[
      [/^help$/i,'Try: ip addr, nc -zv 10.31.20.12 445, smbclient -L //10.31.20.12 -N, smbclient //10.31.20.12/ops-backup -N -c "ls", smbclient //10.31.20.12/ops-backup -N -c "get app-config-2026-09-12.zip -"'],
      [/^ip addr$/i,'eth0 10.31.10.44/24  (authorized analyst workstation)'],
      [/^nc -zv 10\.31\.20\.12 445$/i,'Connection to 10.31.20.12 445 port [tcp/microsoft-ds] succeeded!'],
      [/^smbclient -L \/\/10\.31\.20\.12 -N$/i,'Sharename       Type\nops-backup      Disk\npublic          Disk\nIPC$            IPC\nGuest session accepted.'],
      [/^smbclient \/\/10\.31\.20\.12\/ops-backup -N -c ["']ls["']$/i,'  app-config-2026-09-12.zip   42 KB\n  db-dump-2026-09-12.sql.gz   3.1 MB'],
      [/^smbclient \/\/10\.31\.20\.12\/ops-backup -N -c ["']get app-config-2026-09-12\.zip -["']$/i,'[training preview only]\n.env -> DB_USER=stage_app\n.env -> DB_PASSWORD=violet-river-training-only\nRead-only proof complete; archive not retained outside the simulation.']
    ],
    actions:[
      {id:'a1',label:'Disable guest access on ops-backup',description:'Require an authenticated identity for the backup share.',outcome:'Anonymous office devices can no longer read the share.',quality:'good'},
      {id:'a2',label:'Restrict share ACLs to BackupSvc and administrators',description:'Remove broad read permissions while preserving the service workflow.',outcome:'Nightly backups still work; ordinary users lose access.',quality:'good'},
      {id:'a3',label:'Rotate the exposed staging credential',description:'Invalidate the secret found in the archive after access is closed.',outcome:'The credential observed in the backup is no longer useful.',quality:'good'},
      {id:'a4',label:'Download every backup for deeper review',description:'Copy all available data even though one file already proves the exposure.',outcome:'You collect unnecessary sensitive data beyond what the assessment needs.',quality:'bad'},
      {id:'a5',label:'Remove secrets from backupable configuration where practical',description:'Use a secret store or runtime injection instead of plaintext credentials in archived config.',outcome:'Future configuration backups carry less reusable secret material.',quality:'good'}
    ],
    hints:['First prove reachability and the access model. You do not need to copy an entire database to show impact.','A guest-readable archive containing one live-looking secret is already strong evidence of confidentiality risk.','Fix both the access boundary and the exposed credential. Then reduce the chance that future backups contain reusable secrets.'],
    evaluation:[
      {label:'Exposure proof',groups:[['445','smb','share'],['guest','anonymous','no authentication'],['app-config','env','password']],supported:'You demonstrate unauthenticated read access and prove sensitive content with a minimal read-only sample.',partial:'You find the share or the sensitive file but do not fully connect access and impact.',missing:'Your conclusion does not establish that an ordinary device can read sensitive backup material.'},
      {label:'Assessment discipline',groups:[['read-only','minimum','minimal','non-destructive'],['authorized','scope']],supported:'Your proof is sufficient without collecting unnecessary backup data.',partial:'You mention scope but do not explain why additional data collection is unnecessary.',missing:'The testing approach does not show disciplined proof-of-impact.'},
      {label:'Hardening',groups:[['disable guest','authentication'],['acl','BackupSvc','restrict'],['rotate','credential','secret']],supported:'You close anonymous access, narrow authorization, and invalidate the exposed secret.',partial:'You fix only one layer of the exposure.',missing:'The proposed response leaves either broad access or the exposed credential unresolved.'}
    ]
  },
  {
    id:'C022', title:'Admin by Request', subtitle:'The server accepted a field the interface never showed.', tier:'API authorization assessment',
    brief:'A staff portal lets users update their display name and phone number. During an authorized application assessment, you notice the API accepts a larger JSON object than the form sends. Determine whether a normal user can change a server-controlled privilege field, demonstrate the issue safely in the training tenant, and redesign the update path.',
    environment:'Northbridge Staff / isolated API lab',
    tools:['overview','browser','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Normal profile request','HTTP trace','The browser sends name and phone fields to PATCH /api/me.','{"displayName":"Ari","phone":"555-0141"}'),
      e('ev2','User record schema','Developer artifact','The backend model also contains role and canApproveRefunds fields.','role is intended to be assigned only by the admin service.'),
      e('ev3','Unsafe binding code','Code artifact','The handler copies the complete request body into the user record.','await users.update(req.user.id, req.body)'),
      e('ev4','Training proof','API response','A normal training user can send role:"admin" and receives a record showing role=admin.','This occurs only in the fictional lab tenant.'),
      e('ev5','Admin route behavior','Application behavior','After the unsafe update, the same session can open /admin/refunds.','No other account is modified during validation.')
    ],
    browser:[
      {id:'b1',url:'https://staff.northbridge.local/profile',title:'Profile form',html:`<div class="fake-site"><h2>My profile</h2><div class="box">Fields shown: display name, phone</div><p>No role control is present in the user interface.</p></div>`},
      {id:'b2',url:'trace://profile-patch',title:'Observed request',html:`<div class="fake-site"><h2>PATCH /api/me</h2><div class="box"><pre>{"displayName":"Ari","phone":"555-0141"}</pre></div></div>`},
      {id:'b3',url:'trace://safe-role-proof',title:'Authorized proof',html:`<div class="fake-site"><h2>Training response</h2><div class="box"><pre>PATCH /api/me
{"displayName":"Ari","role":"admin"}

200 OK
{"id":42,"displayName":"Ari","role":"admin"}</pre></div><p>Isolated fictional tenant.</p></div>`}
    ],
    terminal:[
      [/^help$/i,'Try: cat handler.js, cat schema.txt, curl -X PATCH https://staff.northbridge.local/api/me -d \'{"displayName":"Ari"}\', curl -X PATCH https://staff.northbridge.local/api/me -d \'{"displayName":"Ari","role":"admin"}\''],
      [/^cat handler\.js$/i,'router.patch("/api/me", auth, async (req,res) => {\n  const user = await users.update(req.user.id, req.body)\n  res.json(user)\n})'],
      [/^cat schema\.txt$/i,'User: id, displayName, phone, role, canApproveRefunds\nClient-editable: displayName, phone\nServer-controlled: role, canApproveRefunds'],
      [/^curl -X PATCH https:\/\/staff\.northbridge\.local\/api\/me -d ["']\{"displayName":"Ari"\}["']$/i,'200 OK {"id":42,"displayName":"Ari","role":"user"}'],
      [/^curl -X PATCH https:\/\/staff\.northbridge\.local\/api\/me -d ["']\{"displayName":"Ari","role":"admin"\}["']$/i,'200 OK {"id":42,"displayName":"Ari","role":"admin"}\nTraining proof only.']
    ],
    actions:[
      {id:'a1',label:'Allowlist editable fields server-side',description:'Build the update object from displayName and phone only.',outcome:'Client-supplied privilege fields are ignored or rejected.',quality:'good'},
      {id:'a2',label:'Enforce authorization again on admin routes',description:'Keep privileged actions protected even if profile data becomes malformed.',outcome:'Administrative actions require a verified authorized principal.',quality:'good'},
      {id:'a3',label:'Hide role fields more carefully in the frontend',description:'Rely on the user interface to prevent clients from sending sensitive fields.',outcome:'A client can still construct its own request; the server remains vulnerable.',quality:'bad'},
      {id:'a4',label:'Audit for other mass-updatable server fields',description:'Review similar update handlers for privilege, ownership, billing, or workflow fields.',outcome:'The same binding pattern is checked across the application.',quality:'good'}
    ],
    hints:['The form is not the security boundary. Compare what the interface sends with what the server is willing to accept.','Look at how req.body is used. Ask whether the server distinguishes user-editable fields from server-controlled fields.','A durable fix is explicit server-side field selection plus independent authorization on privileged routes.'],
    evaluation:[
      {label:'Vulnerability',groups:[['req.body','mass assignment','binding'],['role','admin','server-controlled'],['PATCH','api/me','200']],supported:'You identify unsafe object binding and prove that a normal user can change a server-controlled privilege field.',partial:'You notice the role field or unsafe handler but do not connect it to privilege change.',missing:'The privilege escalation path through the profile update is not identified.'},
      {label:'Safe validation',groups:[['training','isolated','authorized'],['own account','normal user','minimal']],supported:'You keep the proof inside the isolated tenant and change only the training user needed to demonstrate impact.',partial:'You mention authorization but not the minimal proof boundary.',missing:'The validation approach does not show scope discipline.'},
      {label:'Remediation',groups:[['allowlist','displayName','phone'],['authorization','admin route'],['audit','other handlers']],supported:'You fix input binding, preserve independent authorization, and look for the same pattern elsewhere.',partial:'You patch the immediate endpoint but leave related authorization or pattern risk unaddressed.',missing:'The proposed fix relies mainly on hiding fields in the client.'}
    ]
  },
  {
    id:'C023', title:'5985', subtitle:'A management port crossed a boundary it was never meant to cross.', tier:'Windows remote-management assessment',
    brief:'An office segmentation review shows TCP 5985 reachable from ordinary user devices to a group of Windows application servers. Administrators use remote management legitimately from a jump host. Determine whether the current network path violates the intended trust boundary and harden access without disabling operations.',
    environment:'Marrow Retail / Windows management network snapshot',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Intended design','Architecture note','WinRM should accept connections only from the admin jump host 10.52.5.20.','Application servers live in 10.52.40.0/24; users live in 10.52.10.0/24.'),
      e('ev2','Unexpected reachability','Network test','A user-VLAN workstation can reach APP-03 on TCP 5985.','Source 10.52.10.77 -> 10.52.40.23:5985 succeeds.'),
      e('ev3','Listener configuration','Host config','APP-03 listens on HTTP WinRM for the entire server interface.','Listener Address=* Transport=HTTP Port=5985'),
      e('ev4','Firewall rule','Network config','A broad rule allows user VLAN to application-server management ports.','Rule label: TEMP-DEPLOY-2025; source 10.52.10.0/24; destination server VLAN; port 5985.'),
      e('ev5','Authentication still required','Service behavior','The service does not allow anonymous command execution.','The issue proven here is unnecessary exposure of a privileged management plane, not unauthenticated remote control.')
    ],
    logs:[
      {id:'firewall',name:'Firewall policy',text:`allow TEMP-DEPLOY-2025 src=10.52.10.0/24 dst=10.52.40.0/24 tcp/5985\nallow ADMIN-WINRM src=10.52.5.20/32 dst=10.52.40.0/24 tcp/5985\ndefault deny`},
      {id:'winrm',name:'APP-03 WinRM',text:`Listener\n  Address = *\n  Transport = HTTP\n  Port = 5985\nAuthentication\n  Kerberos = true\n  Negotiate = true\n  Basic = false\n  AllowUnencrypted = false`}
    ],
    terminal:[
      [/^help$/i,'Try: ipconfig, Test-NetConnection 10.52.40.23 -Port 5985, cat network.txt, cat winrm.txt'],
      [/^ipconfig$/i,'IPv4 Address . . . . . . . . . : 10.52.10.77\nDefault Gateway . . . . . . . . : 10.52.10.1'],
      [/^Test-NetConnection 10\.52\.40\.23 -Port 5985$/i,'ComputerName : 10.52.40.23\nRemotePort   : 5985\nTcpTestSucceeded : True'],
      [/^cat network\.txt$/i,'Expected management source: 10.52.5.20 jump host only\nObserved extra rule: TEMP-DEPLOY-2025 from 10.52.10.0/24'],
      [/^cat winrm\.txt$/i,'APP-03 listener Address=* Transport=HTTP Port=5985\nKerberos=true Negotiate=true Basic=false AllowUnencrypted=false']
    ],
    actions:[
      {id:'a1',label:'Remove TEMP-DEPLOY-2025 broad firewall rule',description:'Restore the intended network boundary around the management plane.',outcome:'User-VLAN devices can no longer reach server WinRM.',quality:'good'},
      {id:'a2',label:'Keep the jump-host rule only',description:'Allow remote management from the documented administrative source.',outcome:'Operations retain approved management access.',quality:'good'},
      {id:'a3',label:'Disable WinRM on every server',description:'Remove the service entirely even though administrators rely on it.',outcome:'Exposure disappears, but normal administration is disrupted unnecessarily.',quality:'bad'},
      {id:'a4',label:'Review temporary network rules for expiration',description:'Find similar deployment exceptions that outlived their purpose.',outcome:'Other stale trust-boundary exceptions are identified for cleanup.',quality:'good'},
      {id:'a5',label:'Require authenticated encrypted management',description:'Preserve Kerberos/Negotiate and avoid weaker transport or authentication fallback.',outcome:'The remaining approved management path keeps strong authentication expectations.',quality:'good'}
    ],
    hints:['Reachability alone is not the same as remote code execution. State exactly what you can prove.','Compare the intended source network with the firewall policy. One temporary rule changes the trust boundary.','A good fix restores the intended path through the jump host instead of deleting a legitimate management capability.'],
    evaluation:[
      {label:'Boundary finding',groups:[['5985','winrm'],['user vlan','10.52.10'],['TEMP-DEPLOY-2025','broad rule']],supported:'You show that a stale firewall exception exposes the server management plane to ordinary user devices.',partial:'You notice WinRM exposure but do not identify the network rule that creates it.',missing:'The management-plane trust-boundary problem is not established.'},
      {label:'Evidence precision',groups:[['authentication required','not anonymous','cannot prove execution'],['reachability','exposure']],supported:'You distinguish unnecessary management exposure from unsupported claims of unauthenticated compromise.',partial:'You identify risk but overstate or underspecify what the evidence proves.',missing:'Your theory treats reachability as proof of full compromise.'},
      {label:'Hardening',groups:[['remove','TEMP-DEPLOY'],['jump host','10.52.5.20'],['temporary','expiration','review']],supported:'You restore the jump-host boundary and address the process failure that left the exception behind.',partial:'You close the port but do not preserve the intended management path or review stale exceptions.',missing:'The remediation either leaves broad access or unnecessarily breaks administration.'}
    ]
  },
  {
    id:'C024', title:'The Green Lock That Wasn’t', subtitle:'The client encrypted traffic but stopped verifying who was on the other end.', tier:'TLS trust + client hardening',
    brief:'A desktop inventory agent sends device data to an internal HTTPS API. Security monitoring found one workstation talking through an unexpected proxy. The agent still reported “HTTPS connected.” Determine whether transport confidentiality alone was enough, explain the trust failure, and harden the client.',
    environment:'Orchid Inventory / client + proxy lab',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Client setting','Application config','The inventory agent uses verify_tls=false because of an old certificate problem.','endpoint=https://inventory.orchid.local/api\nverify_tls=false'),
      e('ev2','Unexpected issuer','TLS observation','The workstation received a certificate issued by Lab Intercept CA instead of Orchid Internal CA.','Hostname shown: inventory.orchid.local; issuer differs from the expected chain.'),
      e('ev3','Proxy path','Network telemetry','Only WS-118 routed inventory traffic through 10.61.30.9 during the incident window.','10.61.30.9 is not an approved enterprise proxy.'),
      e('ev4','Successful application exchange','Agent log','The agent uploaded inventory normally despite the unexpected certificate.','Because verification was disabled, the TLS handshake did not fail on trust.'),
      e('ev5','Valid server certificate','PKI record','The real inventory service has a valid certificate from Orchid Internal CA.','Clients should be able to validate hostname and chain without disabling verification.')
    ],
    logs:[
      {id:'agent',name:'Agent log',text:`14:12:01 connecting https://inventory.orchid.local/api\n14:12:01 tls verify=false\n14:12:02 connected peer_issuer="Lab Intercept CA"\n14:12:03 POST /api/inventory 200`},
      {id:'network',name:'Network flow',text:`WS-118 -> 10.61.30.9:443\n10.61.30.9 -> inventory.orchid.local:443\nOther workstations -> inventory.orchid.local:443 direct`}
    ],
    terminal:[
      [/^help$/i,'Try: cat agent.conf, openssl s_client -connect inventory.orchid.local:443 -servername inventory.orchid.local, cat expected_cert.txt'],
      [/^cat agent\.conf$/i,'endpoint=https://inventory.orchid.local/api\nverify_tls=false'],
      [/^openssl s_client -connect inventory\.orchid\.local:443 -servername inventory\.orchid\.local$/i,'subject=CN=inventory.orchid.local\nissuer=CN=Lab Intercept CA\nVerify return code: 20 (unable to get local issuer certificate)\nSimulation snapshot from WS-118 path.'],
      [/^cat expected_cert\.txt$/i,'Expected subject: CN=inventory.orchid.local\nExpected issuer: Orchid Internal CA\nHostname validation: required\nChain validation: required']
    ],
    actions:[
      {id:'a1',label:'Restore certificate verification',description:'Require hostname and certificate-chain validation in the client.',outcome:'Unexpected issuers or invalid chains now fail closed.',quality:'good'},
      {id:'a2',label:'Fix trust distribution for Orchid Internal CA',description:'Install the intended internal CA trust correctly rather than suppressing verification.',outcome:'The real service validates successfully without insecure overrides.',quality:'good'},
      {id:'a3',label:'Keep verify_tls=false but pin the URL string',description:'Assume the correct hostname guarantees the peer identity.',outcome:'A proxy can still present a different certificate for the same hostname; trust remains broken.',quality:'bad'},
      {id:'a4',label:'Investigate the unapproved proxy path on WS-118',description:'Treat the path change as a separate host/network finding after preserving evidence.',outcome:'The workstation-specific routing anomaly is assigned for follow-up.',quality:'good'}
    ],
    hints:['HTTPS means encryption is being used; it does not help if the client refuses to verify the peer identity.','Compare the observed certificate issuer with the expected CA, then read the client setting that determines whether that mismatch matters.','The right fix is to repair trust configuration and fail closed, not to suppress verification because certificates are inconvenient.'],
    evaluation:[
      {label:'Trust failure',groups:[['verify_tls=false','verification disabled'],['Lab Intercept CA','issuer'],['expected','Orchid Internal CA']],supported:'You explain that the client encrypted traffic but accepted an untrusted peer because certificate verification was disabled.',partial:'You notice the certificate mismatch or insecure setting without connecting them.',missing:'The TLS identity-verification failure is not identified.'},
      {label:'Evidence scope',groups:[['WS-118','10.61.30.9','proxy'],['unexpected path','separate']],supported:'You tie the anomalous proxy path to the affected workstation without claiming every device was intercepted.',partial:'You mention the proxy but do not scope it to the observed host.',missing:'The network evidence is not incorporated accurately.'},
      {label:'Hardening',groups:[['restore','verify','hostname'],['Orchid Internal CA','trust'],['fail closed','validation']],supported:'You restore certificate and hostname validation while fixing the legitimate internal trust chain.',partial:'You enable some validation but do not address why the client disabled it originally.',missing:'The remediation leaves the client willing to trust arbitrary certificates.'}
    ]
  },
  {
    id:'C025', title:'Service: AudioHelper', subtitle:'The executable looked ordinary. The service path did not.', tier:'Windows persistence investigation',
    brief:'A Windows engineering workstation shows a new service named AudioHelper. The user does not remember installing audio software. Reconstruct when it appeared, determine whether it behaves like persistence, preserve the right evidence, and remove it safely after scoping.',
    environment:'Keystone Engineering / Windows host snapshot',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','New service','Windows event','Service Control Manager recorded creation of AudioHelper at 18:42 yesterday.','ImagePath=C:\\ProgramData\\AudioCache\\audiohelper.exe\nStartType=Auto'),
      e('ev2','Unsigned binary','File metadata','audiohelper.exe has no trusted signature and was created two seconds before the service.','SHA256 training value: 8d3f...77ab'),
      e('ev3','Parent process','Endpoint telemetry','powershell.exe wrote the binary after wscript.exe launched from a downloaded .js file.','download.js -> wscript.exe -> powershell.exe -> audiohelper.exe'),
      e('ev4','Boot execution','Host timeline','AudioHelper starts automatically at boot and launches before the user signs in.','Service start event appears at 07:51 this morning.'),
      e('ev5','Outbound connection','Network telemetry','audiohelper.exe connects to 198.51.100.88:443 every five minutes.','Fictional training destination; no other host uses it in the current snapshot.'),
      e('ev6','No widespread detection','Fleet search','The service name and binary hash appear only on ENG-22.','Current evidence supports a single-host scope, subject to continued review.')
    ],
    logs:[
      {id:'system',name:'Windows System',text:`18:42:19 Service Control Manager: service installed name=AudioHelper image=C:\\ProgramData\\AudioCache\\audiohelper.exe start=auto\n07:51:04 Service Control Manager: service AudioHelper entered running state`},
      {id:'endpoint',name:'Endpoint process',text:`18:41:51 chrome.exe downloaded C:\\Users\\Nico\\Downloads\\download.js\n18:41:58 wscript.exe download.js\n18:42:03 wscript.exe -> powershell.exe\n18:42:17 file_create C:\\ProgramData\\AudioCache\\audiohelper.exe\n18:42:19 service_create AudioHelper\n07:51:05 audiohelper.exe -> 198.51.100.88:443`}
    ],
    terminal:[
      [/^help$/i,'Try: whoami, sc qc AudioHelper, Get-Item C:\\ProgramData\\AudioCache\\audiohelper.exe, Get-AuthenticodeSignature C:\\ProgramData\\AudioCache\\audiohelper.exe, cat fleet.txt'],
      [/^whoami$/i,'KEYSTONE\\nico'],
      [/^sc qc AudioHelper$/i,'SERVICE_NAME: AudioHelper\nSTART_TYPE: 2 AUTO_START\nBINARY_PATH_NAME: C:\\ProgramData\\AudioCache\\audiohelper.exe\nSERVICE_START_NAME: LocalSystem'],
      [/^Get-Item C:\\\\ProgramData\\\\AudioCache\\\\audiohelper\.exe$/i,'Name: audiohelper.exe\nCreationTime: 18:42:17\nLength: 184320 bytes'],
      [/^Get-AuthenticodeSignature C:\\\\ProgramData\\\\AudioCache\\\\audiohelper\.exe$/i,'Status: NotSigned\nSignerCertificate: null'],
      [/^cat fleet\.txt$/i,'AudioHelper service matches: ENG-22 only\nSHA256 8d3f...77ab matches: ENG-22 only']
    ],
    actions:[
      {id:'a1',label:'Preserve service configuration and binary metadata',description:'Capture path, start type, hash, signature state, and creation timeline before removal.',outcome:'The persistence evidence remains available for investigation.',quality:'good'},
      {id:'a2',label:'Isolate ENG-22',description:'Stop the recurring outbound connection while retaining the host for analysis.',outcome:'ENG-22 is network-contained in the simulation.',quality:'good'},
      {id:'a3',label:'Disable and remove AudioHelper after preservation',description:'Break the observed auto-start persistence mechanism.',outcome:'The service no longer starts at boot.',quality:'good'},
      {id:'a4',label:'Delete audiohelper.exe immediately before collecting metadata',description:'Remove the suspicious file as fast as possible.',outcome:'Persistence stops, but useful provenance and file evidence are discarded.',quality:'bad'},
      {id:'a5',label:'Scope the initial download path',description:'Review the downloaded script and browser/source context for the initial execution chain.',outcome:'The response expands from persistence cleanup to root-cause investigation.',quality:'good'}
    ],
    hints:['A service is legitimate Windows functionality. The question is who created this one, what it runs, and when.','Line up the download, script execution, file creation, service creation, boot start, and network activity.','Preserve the service and binary details before removal; otherwise you can clean the symptom and lose the explanation.'],
    evaluation:[
      {label:'Persistence chain',groups:[['download.js','wscript'],['powershell'],['AudioHelper','service'],['auto','boot'],['198.51.100.88','outbound']],supported:'You reconstruct the execution chain into an auto-start LocalSystem service with recurring outbound activity.',partial:'You identify the suspicious service but omit key provenance or behavior.',missing:'The new service is not connected to a defensible persistence timeline.'},
      {label:'Scope',groups:[['ENG-22','single host'],['fleet','only']],supported:'You keep the current scope evidence-based while acknowledging continued review may be needed.',partial:'You mention the host but do not use fleet evidence to bound the finding.',missing:'Your conclusion either ignores scope or assumes widespread compromise without support.'},
      {label:'Response order',groups:[['preserve','metadata','hash'],['isolate'],['disable','remove'],['download','root cause']],supported:'You preserve evidence, contain the host, remove persistence, and continue toward initial access.',partial:'You contain and clean but skip preservation or root-cause review.',missing:'The response risks destroying evidence or leaving the persistence mechanism active.'}
    ]
  },
  {
    id:'C026', title:'The Token in the Address Bar', subtitle:'The reset flow worked exactly as designed—and shared too much with a third party.', tier:'Web account-recovery investigation',
    brief:'A user reports that their password was changed minutes after they requested a legitimate reset email. The reset message came from the real service. Investigate how a valid reset token may have escaped the application, determine what the logs support, and redesign the flow.',
    environment:'CanvasPay / isolated password-reset lab',
    tools:['overview','mail','logs','browser','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Legitimate reset email','Email','CanvasPay sent a valid password-reset link after the user requested it.','Link format: https://account.canvaspay.local/reset?token=RSET-7f31-training'),
      e('ev2','Reset page dependency','Web source','The reset page loads analytics.js from metrics.thirdparty.local.','The page has no restrictive Referrer-Policy header.'),
      e('ev3','Third-party request log','HTTP telemetry','metrics.thirdparty.local received the full reset-page URL in the Referer header.','Referer: https://account.canvaspay.local/reset?token=RSET-7f31-training'),
      e('ev4','Second reset submission','Application audit','The token was redeemed from a different IP four minutes after the user opened the page.','The user had not yet submitted a new password.'),
      e('ev5','Single-use behavior','Application design','The token becomes invalid after successful redemption.','This explains why the user later saw “link expired.”'),
      e('ev6','No email compromise evidence','Mail audit','No unknown mailbox login or forwarding rule is present in the available evidence.','Current evidence points toward token leakage from the reset page rather than stolen email access.')
    ],
    mails:[
      {id:'m1',from:'CanvasPay Security <security@canvaspay.local>',to:'Mika <mika@example.test>',subject:'Reset your CanvasPay password',date:'14:02',body:'A password reset was requested for your account.\n\nReset password: https://account.canvaspay.local/reset?token=RSET-7f31-training\n\nIf this was not you, ignore this message.',raw:'SPF: pass\nDKIM: pass\nDMARC: pass\nMessage-ID: <reset-8821@canvaspay.local>'}
    ],
    logs:[
      {id:'web',name:'Account service',text:`14:02:11 reset_requested user=mika\n14:03:02 GET /reset?token=RSET-7f31-training ip=49.145.10.11\n14:07:18 POST /api/reset token=RSET-7f31-training ip=203.0.113.75 result=SUCCESS\n14:09:03 POST /api/reset token=RSET-7f31-training ip=49.145.10.11 result=TOKEN_USED`},
      {id:'metrics',name:'Third-party metrics',text:`14:03:02 GET /analytics.js\nHost: metrics.thirdparty.local\nReferer: https://account.canvaspay.local/reset?token=RSET-7f31-training\nClient-IP: 49.145.10.11`},
      {id:'mail',name:'Mailbox audit',text:`Unknown sign-ins: 0\nForwarding-rule changes: 0\nOAuth grants: 0\nAvailable evidence does not show mailbox takeover.`}
    ],
    browser:[
      {id:'b1',url:'https://account.canvaspay.local/reset?token=RSET-7f31-training',title:'Reset page source',html:`<div class="fake-site"><h2>Choose a new password</h2><div class="box"><pre>&lt;script src="https://metrics.thirdparty.local/analytics.js"&gt;&lt;/script&gt;</pre></div><p>Response header: Referrer-Policy not set</p></div>`},
      {id:'b2',url:'trace://metrics-request',title:'Analytics request',html:`<div class="fake-site"><h2>Outgoing request</h2><div class="box"><pre>GET /analytics.js
Host: metrics.thirdparty.local
Referer: https://account.canvaspay.local/reset?token=RSET-7f31-training</pre></div></div>`}
    ],
    terminal:[
      [/^help$/i,'Try: cat reset.html, cat headers.txt, grep RSET-7f31 web.log, grep RSET-7f31 metrics.log'],
      [/^cat reset\.html$/i,'<script src="https://metrics.thirdparty.local/analytics.js"></script>\n<form action="/api/reset" method="post">...</form>'],
      [/^cat headers\.txt$/i,'Content-Type: text/html\nCache-Control: no-store\nReferrer-Policy: (not set)'],
      [/^grep RSET-7f31 web\.log$/i,'14:03 user opens reset link from 49.145.10.11\n14:07 token redeemed from 203.0.113.75\n14:09 original user receives TOKEN_USED'],
      [/^grep RSET-7f31 metrics\.log$/i,'14:03 analytics.js request Referer includes token=RSET-7f31-training']
    ],
    actions:[
      {id:'a1',label:'Remove third-party content from sensitive reset pages',description:'Keep account-recovery pages self-contained where practical.',outcome:'Reset tokens are no longer exposed to analytics dependencies through page requests.',quality:'good'},
      {id:'a2',label:'Set a restrictive Referrer-Policy',description:'Prevent sensitive reset URLs from being sent as referrers.',outcome:'Cross-origin requests no longer receive the reset-page URL.',quality:'good'},
      {id:'a3',label:'Exchange the URL token immediately for a server-side reset session',description:'Consume the emailed token on first arrival, then redirect to a clean URL without the secret.',outcome:'The browser address bar and later subresource requests no longer carry the original reset token.',quality:'good'},
      {id:'a4',label:'Make reset tokens reusable for 24 hours',description:'Reduce support issues when users open the link twice.',outcome:'A leaked token becomes useful for longer and can be replayed repeatedly.',quality:'bad'},
      {id:'a5',label:'Invalidate active sessions after a password reset',description:'Make recovery revoke existing account sessions where appropriate.',outcome:'Successful recovery also cuts off existing sessions that may be unsafe.',quality:'good'}
    ],
    hints:['The email is legitimate, so do not assume phishing. Follow the token after the user opens the real page.','Look at what the reset page loads and what a browser normally sends in the Referer header.','A strong redesign removes secrets from long-lived URLs as early as possible and keeps recovery pages free of unnecessary third-party requests.'],
    evaluation:[
      {label:'Leak mechanism',groups:[['reset','token'],['analytics','thirdparty','third-party'],['Referer','referrer'],['14:07','different ip','203.0.113.75']],supported:'You connect the legitimate reset URL to third-party referrer leakage and later token redemption from another IP.',partial:'You identify token leakage or suspicious redemption but do not connect the browser behavior that exposed it.',missing:'Your theory does not explain how a legitimate reset token left the application.'},
      {label:'Competing hypothesis',groups:[['no email compromise','mailbox','unknown sign-ins 0'],['current evidence','not prove']],supported:'You use the mailbox audit to avoid claiming an email takeover that the evidence does not support.',partial:'You mention mailbox compromise but do not weigh the available evidence.',missing:'Your explanation assumes phishing or email compromise despite stronger application evidence.'},
      {label:'Recovery hardening',groups:[['Referrer-Policy','referrer'],['remove third-party','analytics'],['exchange','clean url','session'],['single-use','revoke']],supported:'You redesign the reset flow to minimize token exposure and preserve strong recovery containment.',partial:'You add one useful control but leave the secret exposed in the page lifecycle.',missing:'The reset token remains unnecessarily exposed to browser or third-party requests.'}
    ]
  },
  {
    id:'C027', title:'Cleartext at 02:14', subtitle:'The credentials were correct. The protocol was the problem.', tier:'Packet analysis + protocol hardening',
    brief:'A legacy manufacturing controller uploads nightly reports to an internal server using FTP. During an authorized packet review, you are asked whether the transfer exposes reusable credentials to anyone who can observe the network path. Analyze the training capture, prove only what is visible, and propose a migration plan.',
    environment:'Forge Plant / isolated packet-capture lab',
    tools:['overview','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Legacy workflow','Operations note','PLC-GW-2 uploads production.csv to FILE-LEGACY every night at 02:14 using FTP.','The controller firmware also supports SFTP after a configuration update.'),
      e('ev2','Capture metadata','Packet capture','The training capture contains a TCP session from 10.70.8.12 to 10.70.20.5:21.','Capture was collected from an authorized monitoring point.'),
      e('ev3','FTP commands','Packet payload','USER forge_upload and PASS cobalt-training-only appear in readable payload bytes.','Credentials are fictional and exist only in the lab.'),
      e('ev4','File content exposure','Packet payload','A portion of production.csv is also readable in the data session.','FTP does not encrypt control credentials or file content.'),
      e('ev5','Network location','Topology','Office users cannot normally reach the plant VLAN, but monitoring devices and compromised devices on the path could observe traffic.','Segmentation reduces who can observe the traffic; it does not encrypt it.')
    ],
    terminal:[
      [/^help$/i,'Try: tshark -r night.pcap -q -z conv,tcp, tshark -r night.pcap -Y "ftp" -T fields -e ftp.request.command -e ftp.request.arg, strings night.pcap | grep -E "USER|PASS|production"'],
      [/^tshark -r night\.pcap -q -z conv,tcp$/i,'10.70.8.12:49822 <-> 10.70.20.5:21   18 packets\n10.70.8.12:49823 <-> 10.70.20.5:41022  42 packets'],
      [/^tshark -r night\.pcap -Y ["']ftp["'] -T fields -e ftp\.request\.command -e ftp\.request\.arg$/i,'USER\tforge_upload\nPASS\tcobalt-training-only\nSTOR\tproduction.csv\nQUIT'],
      [/^strings night\.pcap \| grep -E ["']USER\|PASS\|production["']$/i,'USER forge_upload\nPASS cobalt-training-only\nSTOR production.csv\nproduction_line,total_units,rejects']
    ],
    actions:[
      {id:'a1',label:'Migrate the workflow to SFTP',description:'Use the controller-supported encrypted file-transfer option.',outcome:'Authentication and file contents are protected in transit by SSH.',quality:'good'},
      {id:'a2',label:'Rotate the observed FTP credential after migration',description:'Invalidate the credential exposed in historical cleartext traffic.',outcome:'The captured password is no longer reusable.',quality:'good'},
      {id:'a3',label:'Keep FTP but change the password monthly',description:'Reduce credential lifetime without encrypting the protocol.',outcome:'Every new password is still transmitted in cleartext.',quality:'bad'},
      {id:'a4',label:'Keep segmentation around the plant path',description:'Preserve network controls even after encryption is introduced.',outcome:'Fewer systems can reach or observe the workflow, complementing transport security.',quality:'good'},
      {id:'a5',label:'Validate the controller update in a maintenance window',description:'Plan the protocol change without disrupting production.',outcome:'The secure migration is staged with operational constraints in mind.',quality:'good'}
    ],
    hints:['Do not infer cryptography from the word “internal.” Inspect what is actually visible in the packet payload.','FTP separates control and data connections, but neither is encrypted by default. Look for USER, PASS, and file content.','The fix should protect the transport and invalidate anything already exposed, while respecting the plant maintenance window.'],
    evaluation:[
      {label:'Packet finding',groups:[['FTP','21'],['USER','forge_upload'],['PASS','cobalt'],['production.csv','cleartext']],supported:'You prove that both reusable credentials and file content are visible in the authorized capture.',partial:'You identify FTP risk but do not cite the actual payload evidence.',missing:'Your conclusion does not establish what the capture exposes.'},
      {label:'Risk framing',groups:[['segmentation','internal'],['does not encrypt','observer','path']],supported:'You explain that segmentation limits exposure but does not provide confidentiality on the path.',partial:'You mention segmentation without distinguishing it from encryption.',missing:'Your risk model assumes internal traffic is inherently confidential.'},
      {label:'Migration',groups:[['SFTP','SSH'],['rotate','credential'],['maintenance','validate']],supported:'You move to encrypted transfer, invalidate the observed secret, and plan the change around operations.',partial:'You recommend encryption but omit credential rotation or operational rollout.',missing:'The proposed fix leaves cleartext authentication in use.'}
    ]
  },
  {
    id:'C028', title:'Shadow Admin', subtitle:'Nobody added Priya to Server Admins. Three nested groups did.', tier:'Directory privilege investigation',
    brief:'A helpdesk technician unexpectedly has administrative access to two Windows servers. Direct membership checks show she is not in Server Admins. Trace the effective group path, determine whether it came from a temporary project exception, and redesign access so short-term work does not quietly become permanent privilege.',
    environment:'Raven Health / fictional directory snapshot',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Direct membership','Directory query','priya is directly in Helpdesk-L1 and Project-Orion-Temp.','She is not directly listed in Server-Admins.'),
      e('ev2','Nested membership 1','Directory query','Project-Orion-Temp is a member of App-Support.','Created for a weekend migration six months ago.'),
      e('ev3','Nested membership 2','Directory query','App-Support is a member of Server-Operators.','Server-Operators is delegated local admin on APP-01 and APP-02.'),
      e('ev4','Expired change record','Change ticket','The Orion exception was supposed to expire after 72 hours.','No automated expiration or review task was attached to the group membership.'),
      e('ev5','Observed admin access','Server audit','priya successfully opened an administrative PowerShell session on APP-02 using her normal account.','Access was discovered during routine support work, not an attacker event.'),
      e('ev6','Business need','Manager note','Priya no longer works on Orion and needs only standard helpdesk privileges.','No current task requires server administration.')
    ],
    logs:[
      {id:'directory',name:'Directory graph',text:`user priya -> Helpdesk-L1\nuser priya -> Project-Orion-Temp\nProject-Orion-Temp -> App-Support\nApp-Support -> Server-Operators\nServer-Operators -> local Administrators on APP-01, APP-02`},
      {id:'ticket',name:'Change ticket ORN-228',text:`Purpose: migration weekend\nAdd: migration staff to Project-Orion-Temp\nExpected expiry: 72 hours\nActual automated expiry: none\nTicket closed: 2026-03-12`}
    ],
    terminal:[
      [/^help$/i,'Try: whoami /groups, dirgraph priya, dirgraph Project-Orion-Temp, cat ticket.txt'],
      [/^whoami \/groups$/i,'RAVEN\\priya\nDirect groups: Helpdesk-L1, Project-Orion-Temp\nEffective server role: Server-Operators (nested)'],
      [/^dirgraph priya$/i,'priya -> Project-Orion-Temp -> App-Support -> Server-Operators -> APP-01/APP-02 local Administrators'],
      [/^dirgraph Project-Orion-Temp$/i,'Project-Orion-Temp memberOf App-Support\nCreated 2026-03-09\nNo expiration metadata'],
      [/^cat ticket\.txt$/i,'ORN-228 temporary migration access\nExpected expiry: 72 hours\nNo automatic removal configured\nPriya no longer assigned to Orion']
    ],
    actions:[
      {id:'a1',label:'Remove Priya from Project-Orion-Temp',description:'Eliminate the obsolete privilege path confirmed by the directory graph.',outcome:'Priya returns to standard helpdesk access.',quality:'good'},
      {id:'a2',label:'Review other members of Project-Orion-Temp',description:'Find additional users who may have inherited the same stale privilege.',outcome:'The temporary group is scoped for other unintended access.',quality:'good'},
      {id:'a3',label:'Add expiry/JIT controls for temporary privileged access',description:'Make project access time-bound and automatically revocable.',outcome:'Future temporary access is less likely to become permanent.',quality:'good'},
      {id:'a4',label:'Remove Server-Operators from every server immediately',description:'Delete the entire support model because one temporary membership was stale.',outcome:'Legitimate application support is disrupted even though the nested design can be governed safely.',quality:'bad'},
      {id:'a5',label:'Run periodic effective-access reviews',description:'Review nested privilege, not only direct group membership.',outcome:'Hidden inheritance paths become visible in routine governance.',quality:'good'}
    ],
    hints:['Direct membership is only one layer. Effective access can arrive through groups that contain groups.','Follow the chain from Priya to Project-Orion-Temp, then upward until you reach the server-local administrator assignment.','The technical issue and the process issue are connected: temporary privilege had no automatic expiry or effective-access review.'],
    evaluation:[
      {label:'Privilege path',groups:[['Project-Orion-Temp'],['App-Support'],['Server-Operators'],['APP-01','APP-02','local admin']],supported:'You trace the complete nested group chain that produces Priya’s effective server-admin access.',partial:'You identify a temporary group or server role but not the full inheritance path.',missing:'Your explanation does not account for how Priya became an effective administrator.'},
      {label:'Cause',groups:[['72 hours','temporary'],['no expiration','stale'],['ticket','six months']],supported:'You connect the excessive privilege to a temporary exception that lacked automatic expiry and review.',partial:'You call the access stale but do not identify why it persisted.',missing:'The governance failure behind the privilege is not addressed.'},
      {label:'Remediation',groups:[['remove','Priya','Project-Orion-Temp'],['review','other members'],['JIT','expiry','time-bound'],['effective access','nested']],supported:'You remove the obsolete path, scope similar exposure, and improve temporary privileged-access governance.',partial:'You remove the user but do not prevent recurrence.',missing:'The response either leaves stale privilege or breaks legitimate support unnecessarily.'}
    ]
  },
  {
    id:'C029', title:'Seven-Day Link', subtitle:'The backup was private. The link to it was not treated like a secret.', tier:'Cloud storage + signed URL investigation',
    brief:'Support uploaded a diagnostic archive to a private object store and generated a seven-day signed download URL for a vendor. Hours later the archive was downloaded from an unrelated network. Determine how the access most likely happened, what the storage controls did and did not guarantee, and redesign the sharing workflow.',
    environment:'Sable Commerce / fictional object-storage audit',
    tools:['overview','mail','logs','browser','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Private bucket','Cloud config','The diagnostics bucket does not allow public listing or anonymous object access.','Bucket policy requires authentication or a valid signed URL.'),
      e('ev2','Long-lived signed link','Support action','A download URL for diag-8841.zip was created with a seven-day expiry.','Anyone possessing the full signed URL can use it until expiry unless revoked.'),
      e('ev3','Ticket copy','Support system','The full signed URL was pasted into a vendor ticket visible to a broad contractor group.','The ticket system itself is authenticated, but many external contractor accounts can view the queue.'),
      e('ev4','Unexpected download','Storage audit','diag-8841.zip was downloaded from 203.0.113.144 three hours later.','The request authenticated with the signed URL, not a named cloud identity.'),
      e('ev5','Archive contents','Data classification','The diagnostic archive contains application logs with customer email addresses and internal hostnames.','The file was more sensitive than the sharing workflow assumed.'),
      e('ev6','Vendor statement','Communication','The intended vendor says they had not opened the ticket or downloaded the archive yet.','This does not identify who used the link, but it weakens the intended-user explanation.')
    ],
    mails:[
      {id:'m1',from:'Support <support@sable.local>',to:'Vendor Queue <vendor-queue@example.test>',subject:'Diagnostic archive for CASE-8841',date:'09:10',body:'The requested diagnostic archive is available here for seven days:\n\nhttps://objects.sable.local/diag/diag-8841.zip?sig=TRAINING-SIGNED-TOKEN&exp=7d\n\nPlease confirm after download.',raw:'Internal support notification copied to vendor queue. Full signed URL appears in message body.'}
    ],
    logs:[
      {id:'storage',name:'Object storage audit',text:`09:08 signed_url_created object=diag-8841.zip expiry=7d actor=support-agent-14\n12:17 GET object=diag-8841.zip auth=signed_url src=203.0.113.144 result=200\nIntended vendor named-identity access: none`},
      {id:'ticket',name:'Ticket access',text:`CASE-8841 viewers since 09:10: 18 contractor accounts, 4 support staff\nFull signed URL stored in ticket body\nNo per-viewer download binding`}
    ],
    browser:[
      {id:'b1',url:'https://support.sable.local/case/8841',title:'Vendor ticket',html:`<div class="fake-site"><h2>CASE-8841</h2><div class="box">Diagnostic link<br>https://objects.sable.local/diag/diag-8841.zip?sig=TRAINING-SIGNED-TOKEN&amp;exp=7d</div><p>Queue visibility: broad contractor group</p></div>`},
      {id:'b2',url:'trace://bucket-policy',title:'Bucket policy',html:`<div class="fake-site"><h2>Diagnostics bucket</h2><div class="box"><pre>public_list = false
anonymous_get = false
signed_url_get = true</pre></div><p>A signed URL acts like a bearer credential for its lifetime.</p></div>`}
    ],
    terminal:[
      [/^help$/i,'Try: cat bucket.txt, cat signed_url.txt, grep diag-8841 storage.log, cat classification.txt'],
      [/^cat bucket\.txt$/i,'public_list=false\nanonymous_get=false\nsigned_url_get=true'],
      [/^cat signed_url\.txt$/i,'object=diag-8841.zip\ncreated=09:08\nexpiry=7 days\nbound_identity=none\nrevocation=manual'],
      [/^grep diag-8841 storage\.log$/i,'12:17 GET diag-8841.zip src=203.0.113.144 auth=signed_url result=200'],
      [/^cat classification\.txt$/i,'diag-8841.zip contains: customer email addresses, internal hostnames, application error traces\nclassification: confidential support data']
    ],
    actions:[
      {id:'a1',label:'Revoke the signed URL',description:'Invalidate the bearer link while the access is investigated.',outcome:'The seven-day link can no longer be used.',quality:'good'},
      {id:'a2',label:'Generate shorter-lived links',description:'Reduce the exposure window for diagnostic downloads.',outcome:'Future bearer links expire quickly.',quality:'good'},
      {id:'a3',label:'Use identity-bound vendor access for sensitive archives',description:'Require the intended external user to authenticate rather than relying only on possession of a URL.',outcome:'Access can be attributed and limited to an intended principal.',quality:'good'},
      {id:'a4',label:'Keep seven-day links but hide them behind ticket text',description:'Assume the support system makes the bearer URL safe enough.',outcome:'Anyone who can view or copy the ticket can still use the link.',quality:'bad'},
      {id:'a5',label:'Minimize diagnostic archive contents',description:'Remove unnecessary customer data and secrets before external sharing.',outcome:'A future sharing mistake has less confidentiality impact.',quality:'good'}
    ],
    hints:['A private bucket can still intentionally authorize access through a signed URL. Ask what possession of that URL means.','The storage log shows signed_url authentication, not a named vendor identity. Then check where the full link was stored.','Treat long-lived signed URLs as bearer credentials: shorten, revoke, bind access to identity when sensitivity warrants it, and minimize the shared data.'],
    evaluation:[
      {label:'Access explanation',groups:[['signed url','bearer','link'],['ticket','contractor','broad'],['203.0.113.144','unexpected download']],supported:'You explain that the object stayed non-public while a broadly exposed bearer URL still enabled unauthorized-looking access.',partial:'You identify the signed URL or ticket exposure but do not connect it to the observed download.',missing:'Your conclusion treats the private bucket as proof that the file could not have leaked.'},
      {label:'Evidence precision',groups:[['not identify who','cannot attribute','named identity none'],['vendor','not opened','statement']],supported:'You distinguish a likely link-leak path from unsupported attribution of a specific contractor.',partial:'You identify the access path but overstate who used it.',missing:'Your theory assigns an attacker identity that the storage evidence cannot prove.'},
      {label:'Sharing redesign',groups:[['revoke'],['short','expiry'],['identity-bound','authenticate'],['minimize','diagnostic']],supported:'You reduce bearer-link lifetime, improve attribution, and limit the sensitivity of future shared archives.',partial:'You improve link lifetime but leave sensitive sharing broadly bearer-based.',missing:'The redesign continues to depend on long-lived, broadly visible signed URLs.'}
    ]
  },
  {
    id:'C030', title:'The Reset That Opened the Office', subtitle:'Three individually understandable choices combined into one incident path.', tier:'Intermediate open investigation capstone',
    brief:'Finance analyst Lena reports that her password stopped working at 15:22. Minutes later, an external VPN session authenticated as her account and read files from a finance share. You have identity, web, directory, file, and support telemetry. Reconstruct the strongest evidence-backed chain, separate contributing control failures from unsupported guesses, contain the incident, and propose fixes in the right places.',
    environment:'Morrow & Vale / multi-system training organization',
    tools:['overview','mail','logs','browser','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Legitimate recovery request','Account log','Lena requested a password reset at 15:08 from her normal workstation.','The reset email was generated by the real identity service.'),
      e('ev2','Reset-page referrer leak','Web telemetry','At 15:09 the reset page loaded help-widget.js and sent the full tokenized URL in the Referer header.','Referer contained token=RST-LENA-991-training.'),
      e('ev3','Remote token redemption','Identity log','The reset token was redeemed at 15:13 from 203.0.113.90, not Lena’s office IP.','Password changed successfully; Lena’s own later submission failed because the token was already used.'),
      e('ev4','VPN entitlement','Directory graph','Lena is in Finance-Analysts, which is nested into Project-Lighthouse-Temp, which is nested into Remote-Partners.','Remote-Partners is allowed VPN access. The temporary project membership should have expired two months ago.'),
      e('ev5','External VPN login','VPN log','At 15:16, lena authenticated from 203.0.113.90 using the newly reset password.','The VPN did not require MFA for Remote-Partners because of an old partner exception.'),
      e('ev6','Finance share permissions','File server config','FIN-EXPORTS grants read access to Finance-Analysts.','This access is legitimate for Lena during work; the issue is the compromised identity reaching it remotely.'),
      e('ev7','File reads','File audit','The VPN session read 27 quarterly export files between 15:18 and 15:21.','No delete or write operations are recorded.'),
      e('ev8','Unrelated printer finding','Network note','A printer still exposes an old web admin page to the office VLAN.','No traffic connects the printer to Lena, the VPN, or the finance share during this incident.'),
      e('ev9','Support widget scope','Web config','The password-reset page includes a third-party support widget despite being an account-recovery page.','No restrictive Referrer-Policy is configured.'),
      e('ev10','No mailbox takeover evidence','Mail audit','Lena’s mailbox shows no unknown login, forwarding rule, or OAuth grant.','Current evidence better supports reset-token leakage than stolen email access.')
    ],
    mails:[
      {id:'m1',from:'Morrow & Vale Identity <identity@morrowvale.local>',to:'Lena <lena@morrowvale.test>',subject:'Password reset requested',date:'15:08',body:'Use this link to reset your password:\nhttps://id.morrowvale.local/reset?token=RST-LENA-991-training\n\nThis link can be used once.',raw:'SPF: pass\nDKIM: pass\nDMARC: pass\nGenerated by internal identity service.'}
    ],
    logs:[
      {id:'identity',name:'Identity + reset',text:`15:08:04 reset_requested user=lena src=10.88.10.31\n15:09:02 GET /reset?token=RST-LENA-991-training src=10.88.10.31\n15:13:44 reset_redeemed user=lena token=RST-LENA-991-training src=203.0.113.90 SUCCESS\n15:14:18 reset_submit user=lena src=10.88.10.31 TOKEN_USED`},
      {id:'widget',name:'Support widget',text:`15:09:02 GET /help-widget.js\nHost: widget.support-thirdparty.local\nReferer: https://id.morrowvale.local/reset?token=RST-LENA-991-training\nClient-IP: 10.88.10.31`},
      {id:'vpn',name:'VPN',text:`15:16:09 user=lena src=203.0.113.90 auth=password result=SUCCESS policy=Remote-Partners MFA=NOT_REQUIRED\n15:22:02 session_revoked? false`},
      {id:'files',name:'FIN-FS audit',text:`15:18:01-15:21:47 user=lena source=VPN-POOL READ count=27 path=\\FIN-FS\\FIN-EXPORTS\\Q3\nWRITE count=0\nDELETE count=0`},
      {id:'mail',name:'Mailbox audit',text:`Unknown logins: 0\nForwarding changes: 0\nOAuth grants: 0`},
      {id:'printer',name:'Printer telemetry',text:`Printer admin page office-VLAN exposure confirmed\nRequests from lena account: 0\nConnections to VPN pool: 0\nConnections to FIN-FS: 0`}
    ],
    browser:[
      {id:'b1',url:'https://id.morrowvale.local/reset?token=RST-LENA-991-training',title:'Recovery page source',html:`<div class="fake-site"><h2>Reset password</h2><div class="box"><pre>&lt;script src="https://widget.support-thirdparty.local/help-widget.js"&gt;&lt;/script&gt;</pre></div><p>Referrer-Policy: not set</p></div>`},
      {id:'b2',url:'trace://directory-path',title:'Effective group path',html:`<div class="fake-site"><h2>Lena effective access</h2><div class="box"><pre>lena
 └─ Finance-Analysts
     └─ Project-Lighthouse-Temp
         └─ Remote-Partners
             └─ VPN allowed / MFA exception</pre></div></div>`},
      {id:'b3',url:'http://printer-07.local/admin',title:'Separate finding',html:`<div class="fake-site"><h2>Printer 07 Admin</h2><div class="box">Legacy admin interface reachable from office VLAN.</div><p>Real weakness, but current incident telemetry does not connect it to the compromise.</p></div>`}
    ],
    terminal:[
      [/^help$/i,'Try: grep RST-LENA identity.log, grep RST-LENA widget.log, dirgraph lena, grep lena vpn.log, grep lena files.log, grep lena mail.log, grep lena printer.log'],
      [/^grep RST-LENA identity\.log$/i,'15:09 token page opened by Lena office IP\n15:13 token redeemed from 203.0.113.90\n15:14 Lena receives TOKEN_USED'],
      [/^grep RST-LENA widget\.log$/i,'15:09 widget request Referer contains full token=RST-LENA-991-training'],
      [/^dirgraph lena$/i,'lena -> Finance-Analysts -> Project-Lighthouse-Temp -> Remote-Partners -> VPN allowed; MFA not required under old partner exception'],
      [/^grep lena vpn\.log$/i,'15:16 user=lena src=203.0.113.90 password SUCCESS policy=Remote-Partners MFA=NOT_REQUIRED'],
      [/^grep lena files\.log$/i,'15:18-15:21 user=lena source=VPN-POOL READ 27 files \\FIN-FS\\FIN-EXPORTS\\Q3'],
      [/^grep lena mail\.log$/i,'Unknown sign-ins 0; forwarding changes 0; OAuth grants 0'],
      [/^grep lena printer\.log$/i,'No lena, VPN pool, or FIN-FS activity associated with printer admin exposure']
    ],
    actions:[
      {id:'a1',label:'Preserve identity, widget, VPN, directory, and file logs',description:'Capture the cross-system timeline before changing account and access state.',outcome:'The reset-to-VPN-to-file-access evidence chain is preserved.',quality:'good'},
      {id:'a2',label:'Revoke Lena’s VPN and application sessions, then reset credentials',description:'Contain the compromised identity after preserving the relevant telemetry.',outcome:'The active remote session is terminated and the attacker’s password loses value.',quality:'good'},
      {id:'a3',label:'Remove stale Project-Lighthouse-Temp membership',description:'Eliminate the obsolete nested path into Remote-Partners.',outcome:'Lena no longer inherits the old partner VPN entitlement.',quality:'good'},
      {id:'a4',label:'Require MFA for remote access',description:'Remove the old Remote-Partners password-only exception.',outcome:'A stolen or reset password alone is no longer sufficient for VPN authentication.',quality:'good'},
      {id:'a5',label:'Harden the reset page',description:'Remove third-party widgets, set restrictive referrer policy, and exchange reset tokens into clean server-side sessions.',outcome:'Future recovery tokens are less likely to leak through browser requests.',quality:'good'},
      {id:'a6',label:'Take FIN-FS offline for the day',description:'Stop all finance file access despite evidence showing read-only misuse through one compromised identity.',outcome:'Business operations are heavily disrupted while the identity path, not the file server itself, was the observed control failure.',quality:'bad'},
      {id:'a7',label:'Track the printer admin page as a separate finding',description:'Remediate it without using it to explain this incident.',outcome:'The printer weakness is assigned for hardening and kept separate from the evidence-backed compromise chain.',quality:'good'},
      {id:'a8',label:'Review other stale temporary-group memberships',description:'Search for additional users who may inherit remote-access exceptions unexpectedly.',outcome:'The organization scopes the same identity-governance failure beyond Lena.',quality:'good'}
    ],
    hints:['Build the timeline across systems: legitimate reset request → browser behavior → remote redemption → VPN authentication → file reads.','Then ask why Lena was allowed to use the VPN at all and why one password was enough. Effective group membership matters more than direct membership.','The printer is a real weakness, but causation requires evidence. Keep contributing failures and unrelated findings separate.'],
    evaluation:[
      {label:'Incident chain',groups:[['reset','token'],['Referer','widget','third-party'],['203.0.113.90','redeemed'],['VPN','15:16'],['27','FIN-EXPORTS','file']],supported:'You reconstruct the strongest evidence-backed chain from reset-token leakage through external VPN access to finance-file reads.',partial:'You identify the compromised identity but omit one or more major steps linking recovery, VPN, and file access.',missing:'Your theory does not connect the cross-system events into a defensible incident timeline.'},
      {label:'Access-control contributors',groups:[['Project-Lighthouse-Temp'],['Remote-Partners'],['stale','expired'],['MFA','not required','password-only']],supported:'You identify both stale nested VPN entitlement and the password-only remote-access exception as major contributors.',partial:'You find one identity-control weakness but miss the other.',missing:'Your explanation does not account for why the compromised password could reach the office remotely.'},
      {label:'Evidence discipline',groups:[['printer','separate','unrelated'],['mailbox','no unknown','not compromised'],['read-only','no write','27']],supported:'You separate unrelated findings and unsupported hypotheses from what the current logs actually prove.',partial:'You avoid one distractor but still overstate another part of the evidence.',missing:'Your conclusion treats unrelated weaknesses or unproven mailbox compromise as causation.'},
      {label:'Containment + hardening',groups:[['preserve','logs'],['revoke','session'],['reset','credential'],['remove','Project-Lighthouse'],['MFA'],['referrer','widget','reset page'],['review','temporary']],supported:'Your response contains the active identity, removes stale access, strengthens remote authentication, fixes the token leak, and scopes similar governance failures.',partial:'You contain Lena’s account but leave one or more structural causes in place.',missing:'The response does not reliably break the observed path or prevent recurrence.'}
    ]
  }
,
  {
    id:'C031', title:'Consent Granted', subtitle:'The password was never stolen, but the mailbox was still read.', tier:'Intermediate identity investigation',
    brief:'A sales lead reports that messages disappeared from her mailbox and a strange calendar invite was sent from her account. Password-reset and MFA logs look normal. Determine how access was obtained, what the attacker could do, and how to contain the access without destroying evidence.',
    environment:'Grayline Systems / cloud identity + mailbox audit',
    tools:['overview','mail','logs','browser','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Normal authentication history','Identity log','No unknown password login or MFA bypass is recorded for Priya during the incident window.','Known laptop GL-LT-203 authenticated at 08:11 from office NAT. No new device sign-ins appear.'),
      e('ev2','New OAuth grant','Cloud audit','Priya granted Mail.ReadWrite and Calendars.ReadWrite to an application named Meeting Notes Pro.','App ID: app-meetingnotes-771\nPublisher verification: none\nConsent type: user\nGranted 09:42'),
      e('ev3','Lookalike consent email','Email','A message claiming to be from the conferencing team linked to an authorization screen.','The link opened the real identity provider authorization endpoint but requested permissions for an unverified third-party application.'),
      e('ev4','Mailbox API activity','Mailbox audit','The new application read 184 messages and deleted six security-related messages using API access.','Actor: app-meetingnotes-771 on behalf of priya\nNo interactive browser session was required after consent.'),
      e('ev5','Calendar creation','Calendar audit','The same application created an external invite from Priya’s calendar.','Subject: Updated customer review\nCreated by OAuth app token at 10:07.'),
      e('ev6','Password reset absent','Identity audit','No reset, password change, or failed MFA sequence is associated with Priya.','This weakens the hypothesis of ordinary credential theft.'),
      e('ev7','Legitimate app with similar name','App catalog','Grayline has an approved application named Meeting Notes Enterprise.','Approved app ID differs from the newly consented app and is publisher-verified.')
    ],
    mails:[
      {id:'m1',from:'Collaboration Team <updates@meeting-tools.test>',to:'Priya Shah <priya@grayline.test>',subject:'Reconnect meeting notes integration',date:'09:39',body:'Your meeting notes integration needs renewed access. Review permissions and continue:\nhttps://login.identity.local/oauth/authorize?client_id=app-meetingnotes-771',raw:'SPF: pass for meeting-tools.test\nDKIM: pass\nDMARC: pass\nSender domain is external to Grayline.'}
    ],
    logs:[
      {id:'identity',name:'Identity audit',text:`08:11 user=priya login=SUCCESS device=GL-LT-203 src=office-nat MFA=SATISFIED\n09:42 user=priya event=CONSENT app=app-meetingnotes-771 scopes="Mail.ReadWrite Calendars.ReadWrite" publisher=UNVERIFIED\n09:42 token_issued grant_type=authorization_code app=app-meetingnotes-771 user=priya\nPassword changes: 0\nUnknown interactive sign-ins: 0`},
      {id:'mailbox',name:'Mailbox API audit',text:`09:44-10:05 actor=app-meetingnotes-771 user=priya operation=Mail.Read count=184\n09:49 actor=app-meetingnotes-771 operation=Mail.Delete count=6 folder=Security\n10:07 actor=app-meetingnotes-771 operation=Calendar.Create count=1 target=external`},
      {id:'catalog',name:'Application catalog',text:`Approved: Meeting Notes Enterprise app_id=app-mne-220 publisher=VERIFIED\nObserved: Meeting Notes Pro app_id=app-meetingnotes-771 publisher=UNVERIFIED user_consent=09:42`}
    ],
    browser:[
      {id:'b1',url:'https://login.identity.local/oauth/authorize?client_id=app-meetingnotes-771',title:'Consent screen snapshot',html:`<div class="fake-site"><h2>Meeting Notes Pro</h2><p>Requests permission to:</p><div class="box">Read and modify your mail<br>Read and modify your calendars</div><p>Publisher: Not verified</p></div>`},
      {id:'b2',url:'trace://app-catalog',title:'Approved integration catalog',html:`<div class="fake-site"><h2>Grayline approved apps</h2><div class="box">Meeting Notes Enterprise — Verified publisher — app-mne-220</div><p>No approved entry exists for app-meetingnotes-771.</p></div>`}
    ],
    terminal:[
      [/^help$/i,'Try: grep priya identity.log, grep app-meetingnotes-771 mailbox.log, appshow app-meetingnotes-771, appshow app-mne-220'],
      [/^grep priya identity\.log$/i,'08:11 normal login GL-LT-203; 09:42 CONSENT app-meetingnotes-771; unknown interactive sign-ins=0; password changes=0'],
      [/^grep app-meetingnotes-771 mailbox\.log$/i,'Read 184 messages; deleted 6 Security messages; created 1 external calendar invite'],
      [/^appshow app-meetingnotes-771$/i,'Meeting Notes Pro\npublisher=UNVERIFIED\nscopes=Mail.ReadWrite Calendars.ReadWrite\nconsent=user / priya'],
      [/^appshow app-mne-220$/i,'Meeting Notes Enterprise\npublisher=VERIFIED\nstatus=APPROVED']
    ],
    actions:[
      {id:'a1',label:'Preserve consent and mailbox audit logs',description:'Capture the grant, token issuance, and API operations before revoking access.',outcome:'The application-access timeline is preserved for review.',quality:'good'},
      {id:'a2',label:'Revoke the malicious app grant and active tokens',description:'Remove Priya’s consent and invalidate the application’s delegated access.',outcome:'Meeting Notes Pro can no longer use Priya’s delegated mailbox and calendar permissions.',quality:'good'},
      {id:'a3',label:'Reset Priya’s password only',description:'Change the password but leave the OAuth grant and app tokens untouched.',outcome:'The password changes, but delegated application access remains valid until separately revoked.',quality:'bad'},
      {id:'a4',label:'Restrict user consent to approved applications',description:'Require verified/approved apps or admin review for sensitive scopes.',outcome:'Future users cannot casually grant high-impact mailbox permissions to arbitrary apps.',quality:'good'},
      {id:'a5',label:'Review other users who consented to the same app',description:'Scope whether the campaign affected additional identities.',outcome:'A tenant-wide search is queued for app-meetingnotes-771 grants.',quality:'good'}
    ],
    hints:['If authentication looks normal, ask what other mechanisms can authorize access without a new password login.','The key event is not a sign-in. Compare the consent grant with later mailbox API operations.','Contain the authorization mechanism itself. A password reset does not automatically revoke delegated application permissions.'],
    evaluation:[
      {label:'Access mechanism',groups:[['oauth','consent','app'],['Mail.ReadWrite','mailbox','delegated']],supported:'You correctly identify malicious OAuth consent as the access path rather than ordinary password theft.',partial:'You recognize third-party application access but do not clearly connect the consent grant to delegated mailbox permissions.',missing:'Your theory still relies on an unsupported password-compromise explanation.'},
      {label:'Evidence chain',groups:[['09:42','consent'],['184','messages','mail'],['deleted','security'],['calendar']],supported:'You connect the grant to the concrete mailbox and calendar actions it enabled.',partial:'You cite suspicious app activity but omit important post-consent evidence.',missing:'The application operations are not used to support your conclusion.'},
      {label:'Containment + prevention',groups:[['preserve','audit','logs'],['revoke','grant','token'],['restrict','consent','approved'],['review','other users','scope']],supported:'You preserve evidence, revoke the actual access path, reduce future risky consent, and scope the campaign.',partial:'You contain the user but leave either the delegated grant or tenant-wide control gap unresolved.',missing:'Your response would not reliably stop or prevent the observed authorization path.'}
    ]
  },
  {
    id:'C032', title:'Wrong Audience', subtitle:'A valid token is accepted by the wrong application.', tier:'Intermediate authorized web assessment',
    brief:'You are conducting an authorized assessment of two fictional internal applications: Helpdesk and Inventory. Both use the same identity provider. Determine whether Inventory correctly validates tokens intended for it, prove impact using the lab tools, and recommend a precise fix.',
    environment:'Fathom Retail / isolated API authorization lab',
    tools:['overview','browser','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Helpdesk token','Token sample','A user token issued for the Helpdesk API contains aud=helpdesk-api.','Subject: analyst01\nIssuer: id.fathom.local\nAudience: helpdesk-api\nRole: user'),
      e('ev2','Inventory endpoint behavior','API test','Inventory accepts the Helpdesk token and returns stock data.','The signature and issuer are valid, but the token audience does not match inventory-api.'),
      e('ev3','Expected Inventory token','Token sample','A normal Inventory token uses aud=inventory-api.','Same issuer, different audience.'),
      e('ev4','Gateway validation config','Configuration','The Inventory gateway checks signature and issuer but not audience.','validate_signature=true\nvalidate_issuer=true\nvalidate_audience=false'),
      e('ev5','Admin endpoint protected separately','API test','The mismatched user token cannot access /admin/reconcile because role=user.','This limits demonstrated impact but does not make cross-API token acceptance safe.'),
      e('ev6','Helpdesk compromise not required','Assessment note','The test uses a legitimately issued Helpdesk token belonging to the assessment account.','The weakness is a trust-boundary validation failure, not stolen credentials.')
    ],
    logs:[
      {id:'gateway',name:'Inventory gateway',text:`10:01 request=/api/stock token_iss=id.fathom.local token_aud=helpdesk-api signature=VALID issuer=VALID audience_check=SKIPPED response=200\n10:03 request=/admin/reconcile token_aud=helpdesk-api role=user response=403\n10:06 request=/api/stock token_aud=inventory-api response=200`}
    ],
    browser:[
      {id:'b1',url:'trace://token/helpdesk',title:'Helpdesk token',html:`<div class="fake-site"><h2>Decoded lab token</h2><pre>{ "sub":"analyst01", "iss":"id.fathom.local", "aud":"helpdesk-api", "role":"user" }</pre></div>`},
      {id:'b2',url:'https://inventory.fathom.local/api/stock',title:'Inventory API test',html:`<div class="fake-site"><h2>Inventory API</h2><div class="box">Authorization: Bearer [Helpdesk token]<br><br>HTTP 200<br>{"sku":"FR-188","qty":42}</div></div>`},
      {id:'b3',url:'trace://config/inventory-gateway',title:'Validation config',html:`<div class="fake-site"><h2>Inventory token validation</h2><pre>signature = required\nissuer = id.fathom.local\naudience = not validated</pre></div>`}
    ],
    terminal:[
      [/^help$/i,'Try: token inspect helpdesk.token, token inspect inventory.token, apitest stock helpdesk.token, apitest admin helpdesk.token, show gateway.conf'],
      [/^token inspect helpdesk\.token$/i,'sub=analyst01\niss=id.fathom.local\naud=helpdesk-api\nrole=user\nsignature=VALID'],
      [/^token inspect inventory\.token$/i,'sub=analyst01\niss=id.fathom.local\naud=inventory-api\nrole=user\nsignature=VALID'],
      [/^apitest stock helpdesk\.token$/i,'HTTP 200\nInventory accepted token with aud=helpdesk-api\n{"sku":"FR-188","qty":42}'],
      [/^apitest admin helpdesk\.token$/i,'HTTP 403\nRole user is not allowed on /admin/reconcile'],
      [/^show gateway\.conf$/i,'validate_signature=true\nvalidate_issuer=true\nvalidate_audience=false\nexpected_audience=inventory-api']
    ],
    actions:[
      {id:'a1',label:'Preserve request/response evidence',description:'Save the mismatched token claims and successful Inventory response.',outcome:'The authorization-boundary failure is documented reproducibly.',quality:'good'},
      {id:'a2',label:'Enable strict audience validation',description:'Require aud=inventory-api for Inventory endpoints.',outcome:'Tokens issued for Helpdesk are rejected by Inventory.',quality:'good'},
      {id:'a3',label:'Rotate every user password',description:'Treat the validation flaw as if credentials were stolen.',outcome:'User disruption occurs without correcting the token-validation defect.',quality:'bad'},
      {id:'a4',label:'Add cross-service token tests to CI',description:'Test that each API rejects tokens minted for sibling services.',outcome:'Regression coverage now verifies the intended trust boundary.',quality:'good'}
    ],
    hints:['A token can be cryptographically valid and still be invalid for a particular service.','Compare the aud claim in both token samples with what Inventory expects.','The precise fix belongs at validation time: signature, issuer, expiration, and intended audience all matter.'],
    evaluation:[
      {label:'Finding',groups:[['audience','aud'],['helpdesk-api'],['inventory','accepted','200']],supported:'You demonstrate that Inventory accepts a valid token intended for Helpdesk because audience validation is skipped.',partial:'You identify token-validation weakness but do not prove the cross-service acceptance clearly.',missing:'Your conclusion does not identify the broken trust boundary.'},
      {label:'Impact discipline',groups:[['stock','inventory','data'],['admin','403','role']],supported:'You state the demonstrated impact accurately and avoid claiming admin access that the lab did not prove.',partial:'You identify data exposure but overstate or omit the role-based limit observed on the admin endpoint.',missing:'The impact statement is not grounded in the actual API responses.'},
      {label:'Remediation',groups:[['validate','audience','inventory-api'],['CI','test','cross-service']],supported:'You propose strict audience validation and a regression test that protects the boundary long-term.',partial:'You fix validation but do not address regression prevention.',missing:'Your remediation does not correct the token audience defect.'}
    ]
  },
  {
    id:'C033', title:'Backup Helper', subtitle:'A convenience permission quietly bypasses normal file access.', tier:'Intermediate Linux privilege assessment',
    brief:'An authorized Linux assessment finds a custom backup helper installed for junior operators. Determine whether its assigned capability creates unintended read access, prove the boundary violation in the fictional host snapshot, and harden the design without simply removing backups.',
    environment:'Vale Research / isolated Linux host',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Operator account','Host identity','The assessment account operator1 has no sudo rights and cannot normally read /srv/finance.','Groups: operators, backup-readers\nNo sudoers entry.'),
      e('ev2','Backup helper capability','File metadata','/usr/local/bin/backup-viewer has cap_dac_read_search+ep.','This capability can bypass ordinary discretionary read/search checks for the process.'),
      e('ev3','Protected finance file','Permission check','/srv/finance/payroll.csv is mode 640 root:finance and unreadable directly by operator1.','Direct cat returns Permission denied.'),
      e('ev4','Helper reads arbitrary path','Application behavior','backup-viewer accepts a user-supplied path outside the intended /srv/backups directory.','No allowlist or path boundary is enforced.'),
      e('ev5','Sensitive read proof','Assessment result','Using the helper on /srv/finance/payroll.csv returns the first rows to operator1.','The lab records only fictional data.'),
      e('ev6','Backup use case','Operations note','Operators legitimately need to inspect completed backup manifests under /srv/backups.','A replacement should preserve that workflow without arbitrary filesystem access.')
    ],
    logs:[
      {id:'audit',name:'Host audit',text:`user=operator1 direct_read=/srv/finance/payroll.csv result=DENIED\nuser=operator1 exec=/usr/local/bin/backup-viewer arg=/srv/finance/payroll.csv result=SUCCESS bytes=812\ncapability=/usr/local/bin/backup-viewer cap_dac_read_search+ep`}
    ],
    terminal:[
      [/^help$/i,'Try: whoami, id, getcap /usr/local/bin/backup-viewer, ls -l /srv/finance/payroll.csv, cat /srv/finance/payroll.csv, backup-viewer /srv/backups/manifest.txt, backup-viewer /srv/finance/payroll.csv'],
      [/^whoami$/i,'operator1'],
      [/^id$/i,'uid=1102(operator1) gid=1102(operator1) groups=1102(operator1),1170(operators),1188(backup-readers)'],
      [/^getcap \/usr\/local\/bin\/backup-viewer$/i,'/usr/local/bin/backup-viewer cap_dac_read_search=ep'],
      [/^ls -l \/srv\/finance\/payroll\.csv$/i,'-rw-r----- 1 root finance 812 Sep 13 09:10 /srv/finance/payroll.csv'],
      [/^cat \/srv\/finance\/payroll\.csv$/i,'cat: /srv/finance/payroll.csv: Permission denied'],
      [/^backup-viewer \/srv\/backups\/manifest\.txt$/i,'backup-2026-09-13.tar.zst  OK\nbackup-2026-09-12.tar.zst  OK'],
      [/^backup-viewer \/srv\/finance\/payroll\.csv$/i,'employee_id,department,gross\nFICT-001,Finance,72000\nFICT-002,Finance,68000\n[training data truncated]']
    ],
    actions:[
      {id:'a1',label:'Document the direct-denied / helper-allowed contrast',description:'Preserve the permission, capability, and helper-output evidence.',outcome:'The privilege-boundary bypass is reproducible and clearly scoped.',quality:'good'},
      {id:'a2',label:'Remove the broad filesystem capability',description:'Stop granting cap_dac_read_search to the general helper.',outcome:'The helper no longer bypasses arbitrary file permissions.',quality:'good'},
      {id:'a3',label:'Restrict the helper to a fixed backup directory',description:'Use a narrow service or allowlisted path with ordinary group permissions.',outcome:'Operators retain manifest access without arbitrary path reads.',quality:'good'},
      {id:'a4',label:'Grant operator1 sudo cat instead',description:'Replace one broad read bypass with another broad privileged read mechanism.',outcome:'The practical exposure remains broad and the trust boundary is not improved.',quality:'bad'},
      {id:'a5',label:'Add a capability audit to host baseline checks',description:'Track unexpected file capabilities during configuration review.',outcome:'Future capability drift becomes visible during host hardening.',quality:'good'}
    ],
    hints:['First prove the normal boundary: can operator1 read the finance file directly?','Then inspect special privileges attached to the helper itself, not just the user account.','The best remediation preserves the legitimate backup workflow while narrowing what the privileged component can read.'],
    evaluation:[
      {label:'Privilege path',groups:[['cap_dac_read_search','capability'],['backup-viewer'],['payroll','finance','arbitrary path']],supported:'You prove that the file capability plus unrestricted path input lets a low-privilege operator bypass normal read permissions.',partial:'You identify the privileged helper but do not clearly explain why it crosses the intended filesystem boundary.',missing:'Your theory does not identify the capability-driven privilege path.'},
      {label:'Proof quality',groups:[['permission denied','direct'],['helper','success','reads']],supported:'You compare direct denial with helper-assisted success, providing a clean boundary test.',partial:'You show sensitive output but omit the direct-access baseline.',missing:'The claimed privilege issue is not demonstrated with contrasting access results.'},
      {label:'Hardening',groups:[['remove','capability'],['restrict','allowlist','backup directory'],['audit','capability']],supported:'You remove the broad capability, preserve legitimate backup access through a narrower design, and add drift detection.',partial:'You remove the immediate issue but do not preserve the workflow safely or detect recurrence.',missing:'Your remediation leaves broad privileged read capability in place.'}
    ]
  },
  {
    id:'C034', title:'Path of Least Resistance', subtitle:'A Windows service trusts a path that ordinary users can influence.', tier:'Intermediate Windows privilege assessment',
    brief:'During an authorized workstation assessment, you discover a custom updater service running as LocalSystem. Determine whether its executable search path and directory permissions allow a standard user to influence service startup, document the impact safely, and fix the service configuration.',
    environment:'Orchid Manufacturing / isolated Windows service lab',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Updater service','Service config','OrchidUpdater runs as LocalSystem and has an unquoted executable path containing spaces.','ImagePath: C:\\Program Files\\Orchid Tools\\Updater Service\\updater.exe'),
      e('ev2','Writable parent location','ACL check','Authenticated Users can create files in C:\\Program Files\\Orchid Tools due to a packaging mistake.','CreateFiles/WriteData inherited unexpectedly.'),
      e('ev3','Search-path candidate','Service analysis','Because the path is unquoted, Windows can test earlier path fragments when resolving the executable.','The fictional lab identifies C:\\Program Files\\Orchid.exe as a candidate.'),
      e('ev4','Safe canary proof','Assessment result','A harmless lab canary placed at the candidate path is recorded as selected during simulated service resolution.','No real payload or arbitrary command is executed.'),
      e('ev5','Service restart rights','Control check','Standard users cannot restart the service directly.','The service restarts automatically during the nightly maintenance cycle, so exploitation would not require restart rights.'),
      e('ev6','Vendor binary itself clean','File hash note','The legitimate updater.exe matches the approved vendor hash.','The defect is configuration + ACL, not evidence that the vendor binary is malicious.')
    ],
    logs:[
      {id:'service',name:'Service configuration',text:`SERVICE_NAME: OrchidUpdater\nSTART_NAME: LocalSystem\nIMAGE_PATH: C:\\Program Files\\Orchid Tools\\Updater Service\\updater.exe\nSTART_TYPE: AUTO_START\nPATH_QUOTED: false`},
      {id:'acl',name:'Directory ACL',text:`C:\\Program Files\\Orchid Tools\nAuthenticated Users: CreateFiles, WriteData\nAdministrators: FullControl\nSYSTEM: FullControl`},
      {id:'resolution',name:'Safe resolution test',text:`candidate_1=C:\\Program.exe not writable\ncandidate_2=C:\\Program Files\\Orchid.exe writable=YES canary=FOUND\nselected_in_simulation=C:\\Program Files\\Orchid.exe\nNo executable payload launched.`}
    ],
    terminal:[
      [/^help$/i,'Try: service show OrchidUpdater, acl "C:\\Program Files\\Orchid Tools", pathcheck OrchidUpdater, restart-rights OrchidUpdater, hash updater.exe'],
      [/^service show OrchidUpdater$/i,'run_as=LocalSystem\nimage=C:\\Program Files\\Orchid Tools\\Updater Service\\updater.exe\nquoted=false\nauto_start=true'],
      [/^acl "C:\\Program Files\\Orchid Tools"$/i,'Authenticated Users: CreateFiles, WriteData\nAdministrators: FullControl\nSYSTEM: FullControl'],
      [/^pathcheck OrchidUpdater$/i,'Unquoted path with spaces detected\nCandidate: C:\\Program Files\\Orchid.exe\nDirectory influence: YES\nSafe canary selected in simulation: YES'],
      [/^restart-rights OrchidUpdater$/i,'operator1: SERVICE_START denied\noperator1: SERVICE_STOP denied\nNightly maintenance automatically restarts service'],
      [/^hash updater\.exe$/i,'SHA256: approved-training-hash-77\nStatus: matches vendor baseline']
    ],
    actions:[
      {id:'a1',label:'Record service config, ACL, and safe canary result',description:'Preserve enough evidence to demonstrate the path-resolution issue without executing a payload.',outcome:'The privilege path is documented safely and reproducibly.',quality:'good'},
      {id:'a2',label:'Quote the service executable path',description:'Set the ImagePath to the exact quoted executable location.',outcome:'Ambiguous executable resolution is removed.',quality:'good'},
      {id:'a3',label:'Remove user write access from the program directory',description:'Restore restrictive ACLs on the service’s parent directories.',outcome:'Standard users can no longer place candidate executables in the service path.',quality:'good'},
      {id:'a4',label:'Disable the updater permanently',description:'Remove a business-required service instead of correcting the unsafe configuration.',outcome:'Updates stop and the root configuration lesson is bypassed rather than fixed cleanly.',quality:'bad'},
      {id:'a5',label:'Audit other LocalSystem services for path + ACL combinations',description:'Search for similar configuration patterns across managed endpoints.',outcome:'The organization scopes the misconfiguration class beyond one service.',quality:'good'}
    ],
    hints:['Do not start with the vendor executable. Inspect how Windows is told to find it and who can write along that path.','Two conditions matter together: ambiguous path resolution and a writable candidate location.','A strong fix closes both sides: exact executable quoting and restrictive directory ACLs.'],
    evaluation:[
      {label:'Privilege condition',groups:[['unquoted','path'],['LocalSystem','system'],['writable','Authenticated Users','Orchid.exe']],supported:'You identify the combination of a high-privilege unquoted service path and user-writable candidate location.',partial:'You identify either path ambiguity or writable ACLs but not why the combination matters.',missing:'Your theory does not explain the service privilege boundary.'},
      {label:'Safe proof',groups:[['canary','simulation'],['nightly','restart'],['no payload','harmless']],supported:'You demonstrate the condition safely and account for how the service would eventually restart without claiming direct restart rights.',partial:'You identify exploitability but omit an important constraint or rely on an unsafe proof.',missing:'The assessment conclusion is not grounded in the lab’s safe validation evidence.'},
      {label:'Hardening',groups:[['quote','ImagePath','executable'],['remove','write','ACL'],['audit','other services']],supported:'You fix both path resolution and directory permissions, then scope similar services.',partial:'You fix only one half of the condition.',missing:'The unsafe service configuration remains materially exploitable.'}
    ]
  },
  {
    id:'C035', title:'Signed, Not Safe', subtitle:'Trusted Windows binaries form an untrusted process chain.', tier:'Intermediate endpoint investigation',
    brief:'A workstation alert shows only Microsoft-signed binaries. The user reports a browser tab briefly flashed and disappeared. Determine whether the activity is benign administration or suspicious living-off-the-land behavior, reconstruct the process chain, and choose evidence-preserving containment.',
    environment:'Northbank Legal / endpoint + proxy telemetry',
    tools:['overview','mail','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Browser download','Browser artifact','Edge downloaded meeting_update.hta from an external domain shortly before the alert.','File saved to Downloads at 11:22:14.'),
      e('ev2','Process chain','Endpoint telemetry','msedge.exe launched mshta.exe, which launched powershell.exe, which launched rundll32.exe.','All child binaries are Microsoft-signed; the chain and arguments are unusual for normal browsing.'),
      e('ev3','Outbound callback','Proxy log','rundll32.exe initiated HTTPS traffic to 198.51.100.144 every 90 seconds.','Destination is fictional lab infrastructure and was not previously seen in the organization.'),
      e('ev4','Persistence clue','Registry audit','A Run value named TeamsHealth references powershell with a script under AppData.','Created two minutes after the initial HTA execution.'),
      e('ev5','Admin maintenance schedule','IT note','No remote support or software deployment was scheduled for this endpoint during the time window.','This weakens the benign-administration hypothesis.'),
      e('ev6','Signed binaries','File trust result','mshta.exe, powershell.exe, and rundll32.exe all have valid Microsoft signatures.','A valid signature describes file provenance, not whether its use in this context is safe.')
    ],
    mails:[
      {id:'m1',from:'Video Conference <notices@meet-update.test>',to:'Atty. Dela Cruz <dc@northbank.test>',subject:'Meeting component update required',date:'11:21',body:'Your browser meeting component requires a compatibility update before the 11:30 call.\nOpen: https://meet-update.test/client',raw:'External sender\nSPF: pass\nDKIM: none\nDomain first seen in organization today.'}
    ],
    logs:[
      {id:'process',name:'Endpoint process tree',text:`11:22:14 msedge.exe -> download meeting_update.hta\n11:22:19 msedge.exe -> mshta.exe C:\\Users\\dc\\Downloads\\meeting_update.hta\n11:22:20 mshta.exe -> powershell.exe [arguments redacted in training view]\n11:22:22 powershell.exe -> rundll32.exe [lab module]\n11:24:03 reg.exe creates HKCU\\...\\Run\\TeamsHealth`},
      {id:'proxy',name:'Proxy telemetry',text:`11:22:26 process=rundll32.exe dst=198.51.100.144:443 action=ALLOW\n11:23:56 process=rundll32.exe dst=198.51.100.144:443 action=ALLOW\n11:25:26 process=rundll32.exe dst=198.51.100.144:443 action=ALLOW`},
      {id:'registry',name:'Registry audit',text:`11:24:03 user=dc key=HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run name=TeamsHealth value="powershell -File C:\\Users\\dc\\AppData\\Roaming\\teamshealth.ps1"`}
    ],
    terminal:[
      [/^help$/i,'Try: proctree 11:22, grep 198.51.100.144 proxy.log, regquery TeamsHealth, sigcheck mshta.exe, sigcheck rundll32.exe, maintenance-status NB-LT-118'],
      [/^proctree 11:22$/i,'msedge.exe\n └─ mshta.exe meeting_update.hta\n     └─ powershell.exe [training arguments hidden]\n         └─ rundll32.exe [lab module]'],
      [/^grep 198\.51\.100\.144 proxy\.log$/i,'rundll32.exe -> 198.51.100.144:443 at 11:22:26, 11:23:56, 11:25:26'],
      [/^regquery TeamsHealth$/i,'HKCU\\...\\Run\\TeamsHealth -> powershell -File C:\\Users\\dc\\AppData\\Roaming\\teamshealth.ps1'],
      [/^sigcheck mshta\.exe$/i,'Publisher: Microsoft Windows\nSignature: VALID'],
      [/^sigcheck rundll32\.exe$/i,'Publisher: Microsoft Windows\nSignature: VALID'],
      [/^maintenance-status NB-LT-118$/i,'Scheduled support/deployment at 11:00-12:00: NONE']
    ],
    actions:[
      {id:'a1',label:'Preserve process, proxy, registry, and downloaded-file metadata',description:'Capture the volatile timeline before cleanup.',outcome:'The execution chain and persistence evidence are preserved.',quality:'good'},
      {id:'a2',label:'Isolate the workstation from normal network access',description:'Contain callback traffic while preserving the endpoint for investigation.',outcome:'The recurring outbound connection stops while the host remains available for controlled analysis.',quality:'good'},
      {id:'a3',label:'Delete every Microsoft-signed utility involved',description:'Remove core Windows binaries because they appeared in the chain.',outcome:'The workstation is damaged and the actual misuse/persistence mechanism is not addressed correctly.',quality:'bad'},
      {id:'a4',label:'Remove the persistence after evidence capture and rebuild trust',description:'Clean or reimage according to incident policy after collecting artifacts.',outcome:'The suspicious Run entry and associated user-space artifacts are removed in a controlled sequence.',quality:'good'},
      {id:'a5',label:'Create detections for suspicious parent-child combinations',description:'Alert on browser→mshta and mshta→PowerShell chains plus unusual rundll32 network activity.',outcome:'Future signed-binary abuse becomes easier to identify by behavior rather than signature alone.',quality:'good'}
    ],
    hints:['A trusted signature does not tell you whether the process was launched for a legitimate reason. Reconstruct parent-child relationships.','Correlate the process tree with network activity and persistence creation.','Contain the host based on behavior, preserve the chain, then detect the behavioral pattern rather than banning core Windows binaries.'],
    evaluation:[
      {label:'Execution chain',groups:[['msedge','browser'],['mshta'],['powershell'],['rundll32']],supported:'You reconstruct the unusual browser-to-signed-binary execution chain.',partial:'You identify suspicious signed binaries but do not establish the parent-child chain.',missing:'Your theory does not explain how the suspicious execution began.'},
      {label:'Compromise evidence',groups:[['198.51.100.144','callback','outbound'],['TeamsHealth','Run','persistence'],['no maintenance','none']],supported:'You combine recurring network traffic, persistence, and lack of scheduled administration to distinguish malicious behavior from normal tooling.',partial:'You use some behavioral evidence but omit a major corroborating artifact.',missing:'Your conclusion relies mainly on file names or signatures rather than behavior.'},
      {label:'Response + detection',groups:[['preserve','process','proxy','registry'],['isolate'],['remove','persistence','reimage'],['parent-child','detection','behavior']],supported:'You preserve evidence, isolate the endpoint, restore trust, and build behavior-based detections.',partial:'You contain the endpoint but do not improve future detection or preserve enough evidence.',missing:'Your response is destructive or fails to address the observed behavior safely.'}
    ]
  },
  {
    id:'C036', title:'Trusted Workflow', subtitle:'A cloud role trusts more repositories than anyone intended.', tier:'Intermediate cloud assessment',
    brief:'An authorized review of a fictional CI/CD environment finds that a deployment role can be assumed through repository-issued OIDC tokens. Determine whether the trust policy is scoped tightly enough, prove the unintended path using lab token claims, and harden the pipeline.',
    environment:'Juniper Cloud / CI identity + deployment role',
    tools:['overview','browser','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Deployment role trust policy','Cloud IAM','Role deploy-prod trusts the CI OIDC provider when repository subject starts with repo:juniper/.','The wildcard includes both approved production repositories and unrelated repositories in the same organization.'),
      e('ev2','Approved repository token','OIDC claim sample','Token from repo:juniper/payments:ref:refs/heads/main can assume deploy-prod.','This is intended.'),
      e('ev3','Unrelated repository token','OIDC claim sample','Token from repo:juniper/docs-site:ref:refs/heads/feature can also assume deploy-prod.','This is unintended but matches the broad subject wildcard.'),
      e('ev4','Safe assumption proof','Cloud audit','The lab assessment token from docs-site successfully receives a simulated deploy-prod session.','No production resources exist in the training environment.'),
      e('ev5','Role permissions','IAM policy','deploy-prod can update the fictional production application and read deployment secrets.','The demonstrated trust issue therefore crosses a meaningful environment boundary.'),
      e('ev6','No long-lived cloud key','Pipeline note','Repositories use short-lived OIDC sessions; no static cloud secret is stored in the repository.','The weakness is trust-policy scoping, not exposed long-lived credentials.')
    ],
    logs:[
      {id:'cloud',name:'Cloud audit',text:`12:02 AssumeRole role=deploy-prod oidc_sub=repo:juniper/payments:ref:refs/heads/main result=SUCCESS\n12:18 AssumeRole role=deploy-prod oidc_sub=repo:juniper/docs-site:ref:refs/heads/feature result=SUCCESS session=trace-assessment\n12:19 GetDeploymentSecret session=trace-assessment result=SIMULATED_SUCCESS`},
      {id:'iam',name:'Trust policy summary',text:`principal=ci-oidc.juniper.local\ncondition.sub=StringLike "repo:juniper/*"\ncondition.aud="cloud-sts"\nrole=deploy-prod`}
    ],
    browser:[
      {id:'b1',url:'trace://iam/deploy-prod',title:'deploy-prod trust policy',html:`<div class="fake-site"><h2>Trust policy</h2><pre>provider: ci-oidc.juniper.local\naud: cloud-sts\nsub: repo:juniper/*</pre></div>`},
      {id:'b2',url:'trace://oidc/docs-site',title:'docs-site token claims',html:`<div class="fake-site"><h2>OIDC claims</h2><pre>sub = repo:juniper/docs-site:ref:refs/heads/feature\naud = cloud-sts\nrepository = juniper/docs-site</pre></div>`}
    ],
    terminal:[
      [/^help$/i,'Try: trustshow deploy-prod, token inspect payments.oidc, token inspect docs-site.oidc, assume deploy-prod docs-site.oidc, permissions deploy-prod'],
      [/^trustshow deploy-prod$/i,'provider=ci-oidc.juniper.local\naud=cloud-sts\nsub=StringLike repo:juniper/*'],
      [/^token inspect payments\.oidc$/i,'sub=repo:juniper/payments:ref:refs/heads/main\naud=cloud-sts'],
      [/^token inspect docs-site\.oidc$/i,'sub=repo:juniper/docs-site:ref:refs/heads/feature\naud=cloud-sts'],
      [/^assume deploy-prod docs-site\.oidc$/i,'SIMULATED SUCCESS\nrole_session=deploy-prod/trace-assessment\nReason: subject matches repo:juniper/*'],
      [/^permissions deploy-prod$/i,'app:UpdateProduction\nsecret:GetDeployment\nlogs:ReadDeployments']
    ],
    actions:[
      {id:'a1',label:'Preserve trust policy and assumption audit evidence',description:'Record the unintended repository claim and successful role assumption.',outcome:'The CI-to-cloud trust failure is documented with reproducible claims.',quality:'good'},
      {id:'a2',label:'Restrict the subject to approved repository + branch',description:'Require the exact production repository and protected deployment context.',outcome:'Unrelated Juniper repositories can no longer assume deploy-prod.',quality:'good'},
      {id:'a3',label:'Reduce deploy-prod permissions to deployment necessities',description:'Apply least privilege to what the production role can do after assumption.',outcome:'The blast radius of any future CI trust mistake is reduced.',quality:'good'},
      {id:'a4',label:'Replace OIDC with a static cloud key in repository secrets',description:'Avoid trust-policy complexity by using a long-lived credential.',outcome:'A new high-value long-lived secret is introduced and the design becomes less resilient.',quality:'bad'},
      {id:'a5',label:'Add automated trust-policy tests',description:'Verify that approved claims succeed and unrelated repository claims fail.',outcome:'CI identity boundaries are now tested as part of infrastructure changes.',quality:'good'}
    ],
    hints:['Short-lived credentials are good, but the system still needs to decide which workload identities may receive them.','Compare the exact sub claim of the unrelated repository with the StringLike condition in the role trust policy.','Harden both sides of risk: narrow who can assume the role and narrow what the role can do.'],
    evaluation:[
      {label:'Trust failure',groups:[['repo:juniper/*','wildcard'],['docs-site'],['assume','deploy-prod','success']],supported:'You prove that the role trust policy accepts an unintended repository because its subject condition is too broad.',partial:'You identify an overly broad trust policy but do not connect it to the successful unrelated-repository assumption.',missing:'Your theory does not identify the workload identity trust failure.'},
      {label:'Impact',groups:[['update','production','app'],['deployment secret','secret']],supported:'You correctly scope the role’s meaningful production capabilities without inventing resources beyond the lab.',partial:'You recognize production impact but do not tie it to the role permissions.',missing:'The consequence of unintended role assumption is not explained.'},
      {label:'Hardening',groups:[['exact','repository','branch','subject'],['least privilege','permissions'],['automated','test']],supported:'You narrow trust to approved workload claims, reduce role privilege, and add regression tests.',partial:'You narrow the trust policy but omit blast-radius reduction or validation tests.',missing:'Your remediation does not establish a durable CI-to-cloud trust boundary.'}
    ]
  },
  {
    id:'C037', title:'Service Ticket', subtitle:'A service identity is stronger than its password deserves.', tier:'Intermediate identity + Windows assessment',
    brief:'You are authorized to review a fictional Windows domain for service-account risk. One reporting service uses a traditional domain user with an SPN and a weak password policy. Determine why the configuration is risky, validate the exposure using the lab’s safe credential-audit result, and redesign the account.',
    environment:'Beacon Health / isolated directory service lab',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Service account','Directory object','svc_reports is a normal domain user used by the Reporting Scheduler service.','SPN: MSSQLSvc/reportdb.beacon.local:1433\nPasswordNeverExpires: true'),
      e('ev2','Delegated privileges','Group membership','svc_reports is a member of Report-DB-Readers and Legacy-App-Operators.','Legacy-App-Operators can restart one internal application service but is not a domain-admin group.'),
      e('ev3','Safe password audit','Credential audit','An approved offline audit flags svc_reports as matching a weak password pattern from the organization’s service-account dictionary.','The lab does not reveal or crack a real password.'),
      e('ev4','SPN exposure','Directory behavior','Authenticated domain users can request a service ticket for the registered SPN.','This is normal Kerberos behavior; risk rises when service-account credentials are weak and long-lived.'),
      e('ev5','No gMSA','Configuration note','The service supports a group managed service account but has not been migrated.','gMSA would provide managed rotation and reduce human-chosen password risk.'),
      e('ev6','No interactive need','Operations note','svc_reports never needs human interactive sign-in.','Interactive logon remains enabled unnecessarily.')
    ],
    logs:[
      {id:'directory',name:'Directory audit',text:`account=svc_reports enabled=true\nspn=MSSQLSvc/reportdb.beacon.local:1433\nPasswordNeverExpires=true\nInteractiveLogonAllowed=true\ngroups=Report-DB-Readers,Legacy-App-Operators`},
      {id:'audit',name:'Approved credential audit',text:`account=svc_reports classification=WEAK_PATTERN_MATCH source=offline-approved-audit\nplaintext_password=NOT_DISPLAYED\nrecommendation=migrate_managed_identity_or_rotate_random_secret`}
    ],
    terminal:[
      [/^help$/i,'Try: account show svc_reports, spn show svc_reports, groups svc_reports, credential-audit svc_reports, compatibility gmsa ReportingScheduler'],
      [/^account show svc_reports$/i,'type=domain_user\nPasswordNeverExpires=true\nInteractiveLogonAllowed=true'],
      [/^spn show svc_reports$/i,'MSSQLSvc/reportdb.beacon.local:1433'],
      [/^groups svc_reports$/i,'Report-DB-Readers\nLegacy-App-Operators'],
      [/^credential-audit svc_reports$/i,'SAFE AUDIT RESULT: weak service-account password pattern detected\nPassword value intentionally not displayed'],
      [/^compatibility gmsa ReportingScheduler$/i,'SUPPORTED\nService can run under managed service account with automatic password rotation']
    ],
    actions:[
      {id:'a1',label:'Document account, SPN, privileges, and audit result',description:'Capture the service identity’s risk factors without attempting uncontrolled credential recovery.',outcome:'The finding is supported by directory metadata and an approved password-strength audit.',quality:'good'},
      {id:'a2',label:'Migrate Reporting Scheduler to a managed service account',description:'Use gMSA with automatic credential rotation where supported.',outcome:'The service no longer depends on a human-chosen static domain password.',quality:'good'},
      {id:'a3',label:'Remove unnecessary interactive logon and group rights',description:'Keep only the service permissions actually required.',outcome:'The service identity has a smaller abuse surface and blast radius.',quality:'good'},
      {id:'a4',label:'Set a new memorable password and keep PasswordNeverExpires',description:'Retain a manually managed long-lived secret for convenience.',outcome:'The underlying service-account password management weakness remains.',quality:'bad'},
      {id:'a5',label:'Inventory other SPN-bearing user accounts',description:'Find similar legacy service identities for migration or rotation.',outcome:'The assessment expands from one account to the wider service-account hygiene problem.',quality:'good'}
    ],
    hints:['The presence of an SPN is not itself a vulnerability. Ask what protects the credential behind the service identity.','Combine long-lived password policy, the safe weak-password audit, and unnecessary account capabilities.','A durable fix changes how the service identity is managed, not merely the current password value.'],
    evaluation:[
      {label:'Risk explanation',groups:[['SPN','service ticket'],['weak','password','audit'],['PasswordNeverExpires','long-lived']],supported:'You explain why a ticket-addressable service account with a weak, non-rotating password creates avoidable credential exposure.',partial:'You identify the weak service account but miss how the SPN and long-lived credential model combine.',missing:'Your theory treats the SPN alone as the problem or fails to explain the credential risk.'},
      {label:'Privilege scope',groups:[['Report-DB-Readers'],['Legacy-App-Operators'],['not domain admin','limited']],supported:'You scope the account’s actual privileges instead of exaggerating it into full domain compromise.',partial:'You identify group memberships but do not distinguish their real scope.',missing:'The potential impact is not grounded in the directory permissions provided.'},
      {label:'Redesign',groups:[['gMSA','managed service'],['interactive','disable','remove'],['least privilege','group'],['inventory','other SPN']],supported:'You replace the static password model, remove unnecessary use modes, minimize privileges, and scope similar accounts.',partial:'You improve the account but retain one or more unnecessary legacy risks.',missing:'Your remediation remains dependent on a manually managed long-lived service password.'}
    ]
  },
  {
    id:'C038', title:'Origin Story', subtitle:'A partner portal trusts a hostname pattern more than the organization controls.', tier:'Intermediate web security assessment',
    brief:'An authorized assessment of a fictional customer API finds credentialed cross-origin requests enabled for “trusted” partner subdomains. Determine whether the origin validation is safe when an abandoned partner hostname can be claimed, prove the exposure with the lab browser, and fix the trust model.',
    environment:'Helix Commerce / browser + API trust lab',
    tools:['overview','browser','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','CORS rule','API configuration','api.helix.local reflects origins ending in .partners.helix.test and allows credentials.','Access-Control-Allow-Credentials: true'),
      e('ev2','Abandoned hostname','DNS inventory','oldpromo.partners.helix.test points to an unclaimed fictional hosting target.','The hostname is still within the suffix trusted by the API.'),
      e('ev3','Assessment claim','Lab control','The authorized lab simulates control of oldpromo.partners.helix.test.','No public domain or real hosting provider is involved.'),
      e('ev4','Credentialed read proof','Browser test','From the simulated oldpromo origin, a logged-in test user’s browser can read /api/profile.','The API returns Access-Control-Allow-Origin matching the attacker-controlled trusted suffix and allows credentials.'),
      e('ev5','SameSite cookie','Cookie config','Session cookie is SameSite=None; Secure because legitimate partner integrations require cross-site requests.','Cookie configuration is intentional; the origin allowlist must therefore be trustworthy.'),
      e('ev6','No wildcard star','Config note','The server does not use Access-Control-Allow-Origin: *.','The bug is unsafe origin-matching plus abandoned subdomain ownership, not a literal wildcard header.')
    ],
    logs:[
      {id:'api',name:'API request log',text:`Origin=https://portal.active-partner.partners.helix.test -> ACAO reflected / credentials=true / 200\nOrigin=https://oldpromo.partners.helix.test -> ACAO reflected / credentials=true / 200\nOrigin=https://evil.example -> no ACAO / browser blocked`},
      {id:'dns',name:'DNS inventory',text:`portal.active-partner.partners.helix.test -> managed partner gateway ACTIVE\noldpromo.partners.helix.test -> hosting-slot-884 TRAINING_UNCLAIMED\nlegacy.partners.helix.test -> decommissioned / DNS removed`}
    ],
    browser:[
      {id:'b1',url:'https://oldpromo.partners.helix.test',title:'Authorized lab origin',html:`<div class="fake-site"><h2>oldpromo.partners.helix.test</h2><p>Training control: simulated claimed partner hostname.</p><div class="box">Test: fetch https://api.helix.local/api/profile with credentials</div><pre>HTTP 200\nAccess-Control-Allow-Origin: https://oldpromo.partners.helix.test\nAccess-Control-Allow-Credentials: true\n{ "name":"Test Customer", "tier":"Gold" }</pre></div>`},
      {id:'b2',url:'trace://cors-config',title:'API CORS configuration',html:`<div class="fake-site"><h2>Origin policy</h2><pre>if origin.endsWith(".partners.helix.test"):\n  allow_origin(origin)\n  allow_credentials(true)</pre></div>`}
    ],
    terminal:[
      [/^help$/i,'Try: corscheck https://oldpromo.partners.helix.test, corscheck https://evil.example, dns oldpromo.partners.helix.test, show cookie.conf'],
      [/^corscheck https:\/\/oldpromo\.partners\.helix\.test$/i,'HTTP 200\nAccess-Control-Allow-Origin: https://oldpromo.partners.helix.test\nAccess-Control-Allow-Credentials: true\nReadable response: YES'],
      [/^corscheck https:\/\/evil\.example$/i,'HTTP 200 server-side, but no Access-Control-Allow-Origin header\nBrowser readable response: NO'],
      [/^dns oldpromo\.partners\.helix\.test$/i,'CNAME -> hosting-slot-884\nState: TRAINING_UNCLAIMED / simulated claimable'],
      [/^show cookie\.conf$/i,'session: Secure; HttpOnly; SameSite=None\nRequired for approved cross-site partner workflow']
    ],
    actions:[
      {id:'a1',label:'Preserve origin-policy and DNS ownership evidence',description:'Document both the API trust rule and the abandoned trusted hostname.',outcome:'The browser trust-chain failure is clearly evidenced.',quality:'good'},
      {id:'a2',label:'Replace suffix matching with exact approved origins',description:'Allow only explicit partner origins whose ownership is actively managed.',outcome:'Unrelated or abandoned subdomains no longer inherit API trust automatically.',quality:'good'},
      {id:'a3',label:'Remove abandoned DNS records and track ownership lifecycle',description:'Prevent decommissioned partner hostnames from remaining trusted accidentally.',outcome:'The risky hostname is removed and domain lifecycle becomes part of offboarding.',quality:'good'},
      {id:'a4',label:'Set Access-Control-Allow-Origin to *',description:'Simplify CORS configuration while keeping credentialed partner behavior.',outcome:'This does not create a valid credentialed CORS design and would broaden trust rather than fix it.',quality:'bad'},
      {id:'a5',label:'Add browser-based CORS regression tests',description:'Verify approved origins can read responses and unapproved/retired origins cannot.',outcome:'The expected browser trust boundary is now continuously tested.',quality:'good'}
    ],
    hints:['The API rejects evil.example, so the problem is subtler than “CORS allows everyone.”','Ask whether every hostname matching the trusted suffix is still controlled by a trusted party.','The durable fix combines exact origin trust with DNS/partner lifecycle hygiene.'],
    evaluation:[
      {label:'Trust-chain flaw',groups:[['endsWith','suffix','partners.helix.test'],['oldpromo','unclaimed','claim'],['credentials','profile','200']],supported:'You prove that suffix-based trusted-origin logic becomes unsafe when an abandoned matching hostname can be controlled.',partial:'You identify CORS risk or abandoned DNS but do not connect them into the browser-readable data path.',missing:'Your theory does not identify the origin-ownership trust failure.'},
      {label:'Impact precision',groups:[['profile','customer','read'],['SameSite=None','credentials'],['evil.example','blocked','not wildcard']],supported:'You accurately describe the demonstrated credentialed read and distinguish the flaw from a literal allow-all CORS policy.',partial:'You identify cross-origin data exposure but overgeneralize the server policy.',missing:'The impact statement is not grounded in the provided browser behavior.'},
      {label:'Hardening',groups:[['exact','approved origins'],['remove','DNS','abandoned'],['lifecycle','ownership'],['regression','test']],supported:'You narrow origin trust, eliminate abandoned trusted names, manage lifecycle, and test the boundary.',partial:'You fix the API rule but ignore hostname ownership lifecycle or regression coverage.',missing:'Your remediation leaves a broad or unmanaged trusted-origin model.'}
    ]
  },
  {
    id:'C039', title:'Build the Signal', subtitle:'The incident is known; your job is to make the next one detectable.', tier:'Early-advanced detection engineering',
    brief:'A prior fictional endpoint incident used a browser-launched script host followed by PowerShell and recurring outbound traffic. The compromise has already been contained. Your task is to build a practical detection strategy from available telemetry, test it against benign examples, and reduce obvious false positives.',
    environment:'Aster SOC / process + network telemetry lab',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Malicious chain sample','Historical telemetry','msedge.exe → mshta.exe → powershell.exe appeared on the compromised workstation.','The sequence occurred within four seconds.'),
      e('ev2','Network behavior','Proxy telemetry','The descendant process connected to a previously unseen external destination every 90 seconds.','Three repeated connections were observed before isolation.'),
      e('ev3','Benign PowerShell use','Baseline sample','IT automation launches powershell.exe from taskeng.exe and signed management agents.','PowerShell alone would generate many false positives.'),
      e('ev4','Benign mshta use','Legacy app sample','One approved legacy application launches mshta.exe from LegacyClaims.exe on three kiosks.','The parent is stable and no external network child activity follows.'),
      e('ev5','Available fields','SIEM schema','Process parent, process name, host, user, command-line category, destination rarity, and time correlation are available.','Full command-line text is restricted for privacy; detection must work with available metadata.'),
      e('ev6','Test dataset','Detection harness','The lab contains 1 malicious sequence and 24 benign automation/legacy sequences.','A good rule should find the malicious sample without flagging all ordinary PowerShell usage.')
    ],
    logs:[
      {id:'malicious',name:'Known bad sample',text:`11:22:19 host=NB-LT-118 parent=msedge.exe process=mshta.exe\n11:22:20 host=NB-LT-118 parent=mshta.exe process=powershell.exe\n11:22:22 host=NB-LT-118 parent=powershell.exe process=rundll32.exe\n11:22:26 host=NB-LT-118 process=rundll32.exe dst=198.51.100.144 rarity=NEW\n11:23:56 same dst\n11:25:26 same dst`},
      {id:'baseline',name:'Benign baseline',text:`kiosk-01 parent=LegacyClaims.exe process=mshta.exe external_net_child=false\nmgmt-12 parent=taskeng.exe process=powershell.exe destination=internal-mgmt.local\nmgmt-14 parent=AgentSvc.exe process=powershell.exe destination=internal-mgmt.local\n[21 additional benign samples omitted]`}
    ],
    terminal:[
      [/^help$/i,'Try: hunt parent=msedge.exe child=mshta.exe, hunt process=powershell.exe, hunt chain browser-mshta-powershell, hunt rare-network descendant, test-rule basic-powershell, test-rule browser-chain, test-rule browser-chain-plus-network'],
      [/^hunt parent=msedge\.exe child=mshta\.exe$/i,'Matches: 1\nNB-LT-118 11:22:19 msedge.exe -> mshta.exe'],
      [/^hunt process=powershell\.exe$/i,'Matches: 19\nResult too broad for a high-confidence alert in this environment.'],
      [/^hunt chain browser-mshta-powershell$/i,'Matches: 1\nNB-LT-118 sequence within 4 seconds'],
      [/^hunt rare-network descendant$/i,'Matches: 1\nNB-LT-118 descendant rundll32.exe -> new external destination repeated 3x'],
      [/^test-rule basic-powershell$/i,'malicious_detected=YES\nbenign_alerts=18\nAssessment: noisy'],
      [/^test-rule browser-chain$/i,'malicious_detected=YES\nbenign_alerts=0\nAssessment: strong sequence signal in current dataset'],
      [/^test-rule browser-chain-plus-network$/i,'malicious_detected=YES\nbenign_alerts=0\nconfidence=HIGH\nAdds descendant network rarity as corroboration']
    ],
    actions:[
      {id:'a1',label:'Create a sequence-based detection',description:'Alert on browser→mshta→PowerShell within a short time window.',outcome:'The known malicious sample is detected without flagging routine PowerShell automation in the lab baseline.',quality:'good'},
      {id:'a2',label:'Add descendant rare-network correlation',description:'Raise confidence when the sequence is followed by a new recurring external destination.',outcome:'The alert gains a second behavioral signal tied to the incident pattern.',quality:'good'},
      {id:'a3',label:'Alert on every PowerShell process',description:'Use the presence of PowerShell alone as the primary high-severity rule.',outcome:'The test dataset produces 18 benign alerts and the rule is too noisy for reliable triage.',quality:'bad'},
      {id:'a4',label:'Document the approved kiosk mshta baseline',description:'Keep LegacyClaims.exe→mshta.exe as a known pattern and monitor for deviations.',outcome:'The legitimate legacy use is accounted for without globally suppressing mshta activity.',quality:'good'},
      {id:'a5',label:'Define validation metrics and retest after telemetry changes',description:'Track malicious detection, benign alert volume, and field availability.',outcome:'The rule has an explicit maintenance and quality-check process.',quality:'good'}
    ],
    hints:['Start from a behavior chain that is rare in this environment, not from a tool name that administrators also use.','Parent-child sequence plus time correlation is more selective than “PowerShell happened.”','Add corroborating network behavior for confidence, then validate against the benign dataset instead of assuming the rule is good.'],
    evaluation:[
      {label:'Detection logic',groups:[['browser','msedge'],['mshta'],['powershell'],['sequence','time']],supported:'You design a sequence-based rule around the rare execution chain rather than a single common utility.',partial:'You use some process relationships but do not define a coherent correlated sequence.',missing:'Your detection strategy is primarily based on a noisy single process name.'},
      {label:'Corroboration + false positives',groups:[['rare','new','network'],['90','repeated','external'],['LegacyClaims','kiosk','benign'],['PowerShell','noisy','baseline']],supported:'You add network corroboration and explicitly account for known benign process patterns and noisy PowerShell use.',partial:'You consider either corroboration or false positives but not both.',missing:'The rule is not tested against realistic benign activity.'},
      {label:'Operationalization',groups:[['test','dataset','validation'],['metrics','benign alerts'],['retest','telemetry','maintenance']],supported:'You treat detection as an engineered control that requires validation and maintenance.',partial:'You propose a rule but not a way to measure or maintain it.',missing:'The response stops at a one-time query rather than an operational detection.'}
    ]
  },
  {
    id:'C040', title:'Quiet Release', subtitle:'A deployment looked routine until customer exports began leaving through the wrong identity.', tier:'Early-advanced cross-system capstone',
    brief:'A fictional SaaS company notices an unusual spike in customer-export downloads shortly after a routine release. Engineering sees no obvious endpoint malware and initially blames a developer laptop. Investigate across repository identity, CI cloud trust, deployment secrets, application audit, and endpoint telemetry. Separate the real compromise chain from unrelated weaknesses, contain it, and harden the system.',
    environment:'SableWorks / repo + CI + cloud + SaaS + endpoint telemetry',
    tools:['overview','mail','logs','browser','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Developer OAuth grant','Repository audit','Developer Nico granted an unverified “Build Insights” OAuth app read access to repositories three days earlier.','The app read repository metadata and workflow files but did not receive cloud credentials directly.'),
      e('ev2','Workflow discovery','Repository audit','Build Insights read .ci/deploy-prod.yml, revealing that production deployments use OIDC role deploy-prod.','No static cloud key is present in the repository.'),
      e('ev3','Overbroad CI trust','Cloud IAM','deploy-prod trusts any repository subject under repo:sableworks/*.','This includes the low-sensitivity sandbox-tools repository.'),
      e('ev4','Unexpected role assumption','Cloud audit','A workflow from sableworks/sandbox-tools assumed deploy-prod at 02:14.','The repository is not approved for production deployment.'),
      e('ev5','Deployment secret access','Cloud audit','The unexpected session read SaaS_DEPLOY_TOKEN and used it against the production application API.','The token belongs to deployment automation and can call export-management endpoints.'),
      e('ev6','Export creation','Application audit','The deployment token created 14 customer exports and downloaded them from a CI egress address.','This is the strongest evidence of data access in the incident.'),
      e('ev7','Developer laptop alert','Endpoint telemetry','Nico’s laptop generated a medium-severity alert for unsigned browser extension files.','The alert predates the incident by two weeks; no process/network chain ties the laptop to the 02:14 cloud session.'),
      e('ev8','Stale admin account','Identity review','A disabled former admin account still appears in an old application role table.','The identity provider blocks the account and there is no authentication event for it.'),
      e('ev9','OAuth app campaign','Repository audit','Two other developers also granted Build Insights read access, but neither had write access to sandbox-tools.','The incident scope includes potential reconnaissance exposure even if their accounts did not execute the production path.'),
      e('ev10','Release integrity','Deployment log','The legitimate 01:58 release from payments-api used the same deploy-prod role but a different repository subject and normal change ticket.','This helps distinguish expected OIDC use from the later unauthorized assumption.')
    ],
    mails:[
      {id:'m1',from:'Developer Tools <hello@build-insights.test>',to:'Nico Ramos <nico@sableworks.test>',subject:'Free CI insights for your repositories',date:'3 days ago',body:'Connect Build Insights to visualize slow workflows and deployment bottlenecks.\nAuthorize: https://repos.sableworks.local/oauth/authorize?client=build-insights-44',raw:'External sender\nOAuth app publisher: unverified\nRequested scope: repo:read'}
    ],
    logs:[
      {id:'repo',name:'Repository audit',text:`2026-09-10 14:22 user=nico oauth_grant app=build-insights-44 scope=repo:read\n2026-09-10 14:24 app=build-insights-44 read=.ci/deploy-prod.yml repo=payments-api\n2026-09-13 02:11 repo=sandbox-tools workflow=nightly-report oidc_token_requested sub=repo:sableworks/sandbox-tools:ref:refs/heads/main`},
      {id:'cloud',name:'Cloud audit',text:`01:58 AssumeRole deploy-prod sub=repo:sableworks/payments-api:ref:refs/heads/main SUCCESS ticket=REL-881\n02:14 AssumeRole deploy-prod sub=repo:sableworks/sandbox-tools:ref:refs/heads/main SUCCESS session=ci-8841\n02:15 GetSecret name=SaaS_DEPLOY_TOKEN session=ci-8841 SUCCESS`},
      {id:'app',name:'Application audit',text:`02:17 actor=deploy-token endpoint=/exports/create count=14\n02:18-02:26 actor=deploy-token endpoint=/exports/download count=14 source=CI-EGRESS-02\nCustomer rows exported: 18,420\nDelete/write operations on customer records: 0`},
      {id:'endpoint',name:'Nico endpoint',text:`2026-08-30 medium_alert browser_extension unsigned_component=true\n2026-09-13 01:30-03:00 suspicious process chains: 0\nConnections to CI-EGRESS-02: 0\nConnections to cloud STS: 0`},
      {id:'identity',name:'Identity review',text:`former_admin account=disabled idp_login_attempts=0\napplication_role_row=stale status=orphaned\nNo session issued.`}
    ],
    browser:[
      {id:'b1',url:'trace://oauth/build-insights-44',title:'Build Insights grant',html:`<div class="fake-site"><h2>Build Insights</h2><p>Publisher: Unverified</p><div class="box">Repository permission: Read repository contents and workflow files</div></div>`},
      {id:'b2',url:'trace://iam/deploy-prod',title:'deploy-prod trust',html:`<div class="fake-site"><h2>Production deployment role</h2><pre>OIDC provider: repos.sableworks.local\nsub: repo:sableworks/*\naud: cloud-sts</pre></div>`},
      {id:'b3',url:'trace://export-audit',title:'Customer export activity',html:`<div class="fake-site"><h2>Export audit</h2><div class="box">14 exports created by deploy-token<br>14 downloads from CI-EGRESS-02<br>18,420 customer rows</div></div>`}
    ],
    terminal:[
      [/^help$/i,'Try: timeline 01:50-02:30, oauth show build-insights-44, trustshow deploy-prod, grep sandbox-tools cloud.log, grep deploy-token app.log, correlate nico 02:14, account show former_admin'],
      [/^timeline 01:50-02:30$/i,'01:58 legitimate payments-api deploy-prod assumption REL-881\n02:11 sandbox-tools requests OIDC token\n02:14 sandbox-tools assumes deploy-prod\n02:15 session reads SaaS_DEPLOY_TOKEN\n02:17 deploy-token creates 14 exports\n02:18-02:26 14 export downloads from CI-EGRESS-02'],
      [/^oauth show build-insights-44$/i,'publisher=UNVERIFIED\nscope=repo:read\nread workflow file .ci/deploy-prod.yml from payments-api'],
      [/^trustshow deploy-prod$/i,'provider=repos.sableworks.local\nsub=StringLike repo:sableworks/*\naud=cloud-sts'],
      [/^grep sandbox-tools cloud\.log$/i,'02:14 AssumeRole deploy-prod sub=repo:sableworks/sandbox-tools:ref:refs/heads/main SUCCESS session=ci-8841'],
      [/^grep deploy-token app\.log$/i,'02:17 create exports=14\n02:18-02:26 downloads=14 source=CI-EGRESS-02 rows=18420'],
      [/^correlate nico 02:14$/i,'Nico endpoint suspicious process chain: NONE\nNico -> cloud STS connection: NONE\nNico -> CI-EGRESS-02 connection: NONE\nDirect laptop execution not supported by current telemetry'],
      [/^account show former_admin$/i,'identity_provider=DISABLED\nlogin_events=0\nold application role row=ORPHANED / cleanup needed but no incident linkage']
    ],
    actions:[
      {id:'a1',label:'Preserve repository, OIDC, cloud, secret, and export logs',description:'Capture the complete cross-system timeline before changing trust and tokens.',outcome:'The evidence chain from repository reconnaissance through customer export access is preserved.',quality:'good'},
      {id:'a2',label:'Revoke Build Insights grants and review affected developers',description:'Remove the unverified repository app and scope its access across users.',outcome:'The reconnaissance path is cut off and additional exposed repository metadata can be assessed.',quality:'good'},
      {id:'a3',label:'Restrict deploy-prod trust to approved repositories and deployment contexts',description:'Replace repo:sableworks/* with explicit production workload claims.',outcome:'sandbox-tools can no longer assume the production deployment role.',quality:'good'},
      {id:'a4',label:'Rotate SaaS_DEPLOY_TOKEN and revoke active automation sessions',description:'Invalidate the secret accessed by the unauthorized CI role session.',outcome:'The observed application-level access token can no longer create or download exports.',quality:'good'},
      {id:'a5',label:'Reduce deployment-token API permissions',description:'Separate deployment operations from customer-export capabilities.',outcome:'A future deployment credential compromise has less access to customer-data workflows.',quality:'good'},
      {id:'a6',label:'Reimage Nico’s laptop as the primary containment action',description:'Treat the old browser-extension alert as the root cause despite missing correlation to the 02:14 path.',outcome:'Developer productivity is disrupted while the CI/cloud path remains active.',quality:'bad'},
      {id:'a7',label:'Clean the orphaned former-admin role entry separately',description:'Remediate stale authorization data without claiming it caused this incident.',outcome:'The hygiene issue is corrected and tracked separately from the evidence-backed compromise chain.',quality:'good'},
      {id:'a8',label:'Add CI trust and OAuth-app monitoring',description:'Alert on unapproved repository app grants and production role assumptions from non-approved repositories.',outcome:'The two major control-plane warning signals become detectable earlier.',quality:'good'}
    ],
    hints:['Do not start from the loudest endpoint alert. Build a timestamped cross-system timeline around the export spike.','The repository app did not directly hold cloud credentials. Ask what useful information it exposed and what trust decision made that information actionable.','Separate root cause, enabling control failures, demonstrated data impact, and unrelated hygiene findings. Then contain each part of the real chain.'],
    evaluation:[
      {label:'Compromise chain',groups:[['Build Insights','oauth','repo'],['workflow','deploy-prod','OIDC'],['sandbox-tools'],['AssumeRole','02:14'],['SaaS_DEPLOY_TOKEN','secret'],['14','exports','18420']],supported:'You reconstruct the full evidence-backed path from repository OAuth reconnaissance to overbroad CI trust, cloud role assumption, deployment-token access, and customer export downloads.',partial:'You identify several correct components but leave important gaps in how the attacker moved from repository access to customer data.',missing:'Your theory does not establish a defensible cross-system compromise chain.'},
      {label:'Evidence discipline',groups:[['Nico','not supported','no process','old alert'],['former_admin','disabled','unrelated','orphaned'],['legitimate','01:58','payments-api']],supported:'You distinguish the real 02:14 path from the stale admin entry, old endpoint alert, and legitimate earlier deployment.',partial:'You avoid one distractor but still treat another unrelated finding as causal.',missing:'Your conclusion is driven by unrelated findings rather than the cross-system timeline.'},
      {label:'Impact',groups:[['14','downloads'],['18420','customer rows'],['no delete','no write']],supported:'You state the demonstrated data-access impact precisely and preserve what remains unproven.',partial:'You identify customer export exposure but omit scope or overstate destructive activity.',missing:'The impact statement is not tied to the application audit evidence.'},
      {label:'Containment + redesign',groups:[['preserve','logs'],['revoke','Build Insights','oauth'],['restrict','deploy-prod','repository'],['rotate','SaaS_DEPLOY_TOKEN'],['least privilege','export'],['monitor','OIDC','OAuth']],supported:'You contain every active link in the observed chain and redesign both authorization and detection controls.',partial:'You stop some access but leave a major trust or token weakness in place.',missing:'Your response would not reliably break the observed compromise chain or prevent recurrence.'}
    ]
  },
  {
    id:'C041', title:'Borrowed Ticket', subtitle:'A web service requested access to a file share as someone who never touched the web server.', tier:'Advanced identity investigation',
    brief:'FerroWorks sees confidential archive access attributed to engineer Alina Reyes at 02:26. Alina was offline, but the request originated from the WEB-PORTAL service host. Determine how the service identity was able to act on her behalf, whether the access was legitimate, and how to reduce the trust boundary.',
    environment:'FerroWorks / directory services + Kerberos + web application tier',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Archive access','File audit','FILE-ARCHIVE recorded a successful read as alina.reyes from WEB-PORTAL at 02:26.','Alina had no interactive session on WEB-PORTAL and her workstation was powered off.'),
      e('ev2','Service ticket activity','Kerberos audit','WEB-PORTAL$ requested a service ticket for cifs/FILE-ARCHIVE while impersonating alina.reyes.','The ticket request was accepted because the portal service account is configured for protocol transition and constrained delegation to that SPN.'),
      e('ev3','Delegation configuration','Directory object','svc_portal has TrustedToAuthForDelegation enabled and msDS-AllowedToDelegateTo includes cifs/FILE-ARCHIVE.','The setting was added during a legacy document-preview integration.'),
      e('ev4','Portal compromise indicator','Web host telemetry','A vulnerable legacy plugin on WEB-PORTAL spawned the portal worker under svc_portal shortly before the delegated ticket request.','The training environment does not expose arbitrary exploit execution; the compromise is represented through recorded telemetry.'),
      e('ev5','Business requirement review','Architecture note','Current portal features no longer require server-side access to FILE-ARCHIVE as arbitrary users.','The delegation survives from a retired feature and is broader than current business need.'),
      e('ev6','Alina activity','Endpoint + identity','No sign-in, VPN session, or endpoint activity from Alina exists during 01:50–03:00.','Her identity was used through service delegation rather than an interactive login.')
    ],
    logs:[
      {id:'kdc',name:'Kerberos / KDC audit',text:`02:25:58 service=svc_portal event=S4U2Self user=alina.reyes result=SUCCESS\n02:26:00 service=svc_portal event=S4U2Proxy target=cifs/FILE-ARCHIVE user=alina.reyes result=SUCCESS\n02:26:03 host=FILE-ARCHIVE action=READ path=\\\\FILE-ARCHIVE\\legal\\merger.pdf user=alina.reyes source=WEB-PORTAL`},
      {id:'directory',name:'Directory configuration',text:`account=svc_portal\nTrustedToAuthForDelegation=TRUE\nAllowedToDelegateTo=cifs/FILE-ARCHIVE\npassword_age=411d\nowner=Legacy Portal Team`},
      {id:'endpoint',name:'Alina endpoint telemetry',text:`01:50-03:00 device=FW-LT-227 power=OFF\ninteractive_logons=0\nvpn_sessions=0`}
    ],
    terminal:[
      [/^help$/i,'Try: klist trace 02:25-02:27, adquery svc_portal, correlate alina 02:26, delegation simulate svc_portal alina.reyes cifs\/FILE-ARCHIVE, requirement show portal-archive'],
      [/^klist trace 02:25-02:27$/i,'02:25:58 S4U2Self svc_portal -> alina.reyes SUCCESS\n02:26:00 S4U2Proxy svc_portal -> cifs/FILE-ARCHIVE as alina.reyes SUCCESS'],
      [/^adquery svc_portal$/i,'TrustedToAuthForDelegation=TRUE\nAllowedToDelegateTo=cifs/FILE-ARCHIVE\npassword_age=411d\ninteractive_logon=DENIED'],
      [/^correlate alina 02:26$/i,'Alina endpoint activity: NONE\nVPN: NONE\nWEB-PORTAL interactive session: NONE\nDelegated service ticket: PRESENT'],
      [/^delegation simulate svc_portal alina\.reyes cifs\/FILE-ARCHIVE$/i,'SIMULATED SUCCESS\nThe current directory policy permits svc_portal to obtain a delegated CIFS ticket as alina.reyes for FILE-ARCHIVE.'],
      [/^requirement show portal-archive$/i,'Current requirement: portal does NOT need user-delegated access to FILE-ARCHIVE. Legacy preview feature retired 2025-11-04.']
    ],
    actions:[
      {id:'a1',label:'Preserve KDC, file-server, and portal-host telemetry',description:'Capture the delegated ticket chain before changing directory settings.',outcome:'The identity-to-service-to-file timeline remains defensible after containment.',quality:'good'},
      {id:'a2',label:'Remove obsolete delegation from svc_portal',description:'Delete protocol-transition/delegation rights that are no longer required.',outcome:'The portal service can no longer obtain FILE-ARCHIVE tickets on behalf of arbitrary users.',quality:'good'},
      {id:'a3',label:'Rotate the service credential and move to a managed service identity',description:'Replace the aged manually managed secret after the host compromise.',outcome:'The compromised service credential is invalidated and future credential lifecycle risk is reduced.',quality:'good'},
      {id:'a4',label:'Disable Alina’s account as the primary fix',description:'Treat the file audit username as proof that Alina personally authenticated.',outcome:'An innocent user is disrupted while the service delegation path remains available for other identities.',quality:'bad'},
      {id:'a5',label:'Patch/rebuild the compromised portal tier',description:'Restore trust in the service host that initiated the delegated ticket request.',outcome:'The initial service-host compromise is contained alongside the directory trust fix.',quality:'good'}
    ],
    hints:['A file audit username can describe the delegated identity, not necessarily the machine or person that authenticated interactively.','Follow the ticket chain: which account asked the KDC to act as Alina, and what directory setting allowed it?','Separate initial host compromise from the privilege/trust mechanism that turned a service-host compromise into access as another user.'],
    evaluation:[
      {label:'Identity path',groups:[['svc_portal','WEB-PORTAL'],['S4U2Self','S4U2Proxy','delegation'],['alina.reyes'],['cifs/FILE-ARCHIVE']],supported:'You reconstruct the delegated Kerberos path rather than blaming an interactive Alina login.',partial:'You identify service-account involvement but do not explain the delegation mechanism.',missing:'Your theory treats the archive username as proof that Alina directly accessed the file.'},
      {label:'Root cause',groups:[['legacy','obsolete'],['TrustedToAuthForDelegation','constrained delegation','AllowedToDelegateTo'],['portal compromise']],supported:'You distinguish the portal compromise from the obsolete directory trust that amplified its impact.',partial:'You identify either the host compromise or delegation issue but not how they combine.',missing:'The control failure enabling impersonated file access is not established.'},
      {label:'Hardening',groups:[['preserve'],['remove','delegation'],['rotate','managed service'],['patch','rebuild']],supported:'You preserve evidence, remove unnecessary delegation, rotate the service identity, and restore the compromised host.',partial:'You contain some elements but leave a major trust path intact.',missing:'The proposed response does not close the observed service-to-user impersonation path.'}
    ]
  },
  {
    id:'C042', title:'Certificate Shortcut', subtitle:'A certificate template proves identity more broadly than its owners realized.', tier:'Advanced directory security assessment',
    brief:'During an authorized directory review at Calder Health, a certificate template named RemoteSupport allows a large helpdesk group to enroll. Determine whether the template can produce an authentication certificate for identities the requester should not control, prove the risk using the simulator, and redesign the template safely.',
    environment:'Calder Health / enterprise certificate services + directory authentication',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Template permissions','Certificate services','RemoteSupport grants Enroll to CALDER\\Helpdesk-Level1.','The group contains 63 ordinary support technicians.'),
      e('ev2','Subject handling','Template configuration','ENROLLEE_SUPPLIES_SUBJECT is enabled.','A requester can submit identity information instead of having the CA derive the subject only from their directory account.'),
      e('ev3','Authentication purpose','Extended key usage','The template includes Client Authentication.','Certificates from this template are accepted by the fictional directory authentication broker.'),
      e('ev4','Approval controls','Issuance policy','Manager approval and authorized-signature requirements are disabled.','Enrollment is issued automatically to users with Enroll permission.'),
      e('ev5','Safe proof','Assessment record','The simulator accepts a Level1 helpdesk request for administrator@calder.test and returns a training-only authentication certificate.','No real CA or production identity is contacted.'),
      e('ev6','Business requirement','PKI owner note','RemoteSupport only needs machine-bound certificates for managed support laptops.','User-supplied identity subjects and general client-authentication use are unnecessary.')
    ],
    logs:[
      {id:'ca',name:'CA enrollment audit',text:`10:14 requester=CALDER\\tech.lee template=RemoteSupport subject=CN=administrator@calder.test result=SIMULATED_ISSUED\n10:15 auth_broker certificate_subject=administrator@calder.test template=RemoteSupport result=SIMULATED_ACCEPTED`},
      {id:'template',name:'Template configuration',text:`name=RemoteSupport\nenroll=CALDER\\Helpdesk-Level1\nsubject=SUPPLIED_BY_REQUESTER\nEKU=Client Authentication\nmanager_approval=FALSE\nauthorized_signatures=0`}
    ],
    terminal:[
      [/^help$/i,'Try: certtemplate show RemoteSupport, group members Helpdesk-Level1, enroll simulate RemoteSupport administrator@calder.test, certauth simulate assessment-cert, requirement show RemoteSupport'],
      [/^certtemplate show RemoteSupport$/i,'Enroll: CALDER\\Helpdesk-Level1\nSubject: requester supplied\nEKU: Client Authentication\nApproval: none\nAuthorized signatures: 0'],
      [/^group members Helpdesk-Level1$/i,'63 members\nRole: standard support technicians\nPrivileged-admin membership: none required'],
      [/^enroll simulate RemoteSupport administrator@calder\.test$/i,'SIMULATED ISSUED\ncertificate_id=training-cert-442\nsubject=administrator@calder.test\nrequester=CALDER\\tech.lee'],
      [/^certauth simulate assessment-cert$/i,'SIMULATED AUTHENTICATION SUCCESS\naccepted_subject=administrator@calder.test\nsource_template=RemoteSupport'],
      [/^requirement show RemoteSupport$/i,'Need: device-bound certificate for managed support laptops\nNeed requester-supplied user identity: NO\nNeed general user client authentication: NO']
    ],
    actions:[
      {id:'a1',label:'Preserve template configuration and assessment proof',description:'Document the exact permissions, EKUs, subject flags, and simulator result.',outcome:'The finding is reproducible without touching production identities.',quality:'good'},
      {id:'a2',label:'Disable requester-supplied identity on the template',description:'Have the CA derive identity from the approved device/account context.',outcome:'A requester can no longer choose an arbitrary authentication subject.',quality:'good'},
      {id:'a3',label:'Create a purpose-specific device template',description:'Limit enrollment to managed support devices and only the EKUs actually required.',outcome:'The certificate use case is narrowed to the stated business requirement.',quality:'good'},
      {id:'a4',label:'Require stronger enrollment approval for sensitive templates',description:'Add approval/signature controls where privileged authentication remains necessary.',outcome:'Sensitive certificate issuance requires an additional authorization boundary.',quality:'good'},
      {id:'a5',label:'Remove certificate services entirely',description:'Eliminate the CA because one template is unsafe.',outcome:'Required enterprise certificate functions break instead of correcting the misconfigured template.',quality:'bad'}
    ],
    hints:['Do not evaluate only who can click Enroll. Ask what identity the resulting certificate can claim and what that certificate is trusted to do.','Three settings matter together here: who may enroll, who controls the subject, and whether the certificate is valid for authentication.','The smallest durable fix should preserve the legitimate device-certificate use case while removing arbitrary identity assertion.'],
    evaluation:[
      {label:'Template risk',groups:[['Helpdesk-Level1','Enroll'],['supplied','subject'],['Client Authentication'],['no approval','automatic']],supported:'You explain why the combination of broad enrollment, requester-controlled subject, authentication EKU, and no approval creates an identity-escalation path.',partial:'You identify risky template settings but do not connect them into a complete authentication path.',missing:'The finding is reduced to broad enrollment without explaining certificate identity impact.'},
      {label:'Validation',groups:[['simulate','administrator@calder.test'],['authentication','accepted','training']],supported:'You use the safe simulator to prove impact without interacting with a real privileged identity.',partial:'You identify theoretical impact but do not reference the reproducible assessment evidence.',missing:'Your conclusion lacks evidence that the template can create a trusted authentication identity.'},
      {label:'Remediation',groups:[['disable','requester','subject'],['device','purpose-specific'],['approval','signature'],['least privilege']],supported:'You redesign enrollment around the actual device use case and add stronger controls only where privileged authentication is necessary.',partial:'You recommend one useful template change but leave another major identity-control weakness.',missing:'The remediation would preserve arbitrary authentication identity issuance or unnecessarily remove the entire PKI.'}
    ]
  },
  {
    id:'C043', title:'Sidecar Keys', subtitle:'A harmless-looking web pod can ask the cluster for secrets it never needed.', tier:'Advanced container security assessment',
    brief:'A fictional Kubernetes application named catalog-web has no application feature that reads platform secrets, yet its pod automatically receives a service-account token. Determine what the identity can access, prove the excess permission safely, and harden the workload without breaking deployment.',
    environment:'Morrow Retail / Kubernetes application namespace',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Mounted workload identity','Pod specification','catalog-web automatically mounts service account catalog-runtime.','The application does not call the Kubernetes API during normal operation.'),
      e('ev2','Role binding','RBAC configuration','catalog-runtime is bound to role catalog-ops.','catalog-ops allows get/list on pods, configmaps, and secrets in namespace catalog.'),
      e('ev3','Secret inventory','Namespace metadata','catalog contains payment-api-key and registry-pull credentials.','The web application only needs a database connection injected through a dedicated runtime secret.'),
      e('ev4','Safe permission proof','Assessment simulator','The pod identity can list secret names and read payment-api-key in the isolated simulator.','The proof returns synthetic values only.'),
      e('ev5','Application requirement','Owner interview','catalog-web needs no cluster API calls and should not enumerate pods, config maps, or secrets.','Its deployment controller—not the running web pod—handles rollout operations.'),
      e('ev6','Network policy','Cluster control','The pod can currently reach the cluster API service.','No egress policy blocks unnecessary control-plane access.')
    ],
    logs:[
      {id:'audit',name:'Kubernetes audit',text:`13:02 user=system:serviceaccount:catalog:catalog-runtime verb=list resource=secrets result=ALLOW source=assessment\n13:03 user=system:serviceaccount:catalog:catalog-runtime verb=get resource=secrets name=payment-api-key result=ALLOW source=assessment`},
      {id:'rbac',name:'RBAC summary',text:`ServiceAccount catalog-runtime\nRole catalog-ops: pods[get,list], configmaps[get,list], secrets[get,list]\nRoleBinding catalog-web -> catalog-ops`}
    ],
    terminal:[
      [/^help$/i,'Try: kube whoami, kube automount, rbac can list secrets, rbac can get secret payment-api-key, app requirement catalog-web, netcheck kube-api'],
      [/^kube whoami$/i,'system:serviceaccount:catalog:catalog-runtime'],
      [/^kube automount$/i,'automountServiceAccountToken=true\ntoken_path=/var/run/secrets/kubernetes.io/serviceaccount/token'],
      [/^rbac can list secrets$/i,'YES (namespace=catalog) via Role/catalog-ops'],
      [/^rbac can get secret payment-api-key$/i,'YES (SIMULATED)\nvalue=<synthetic-redacted-training-value>'],
      [/^app requirement catalog-web$/i,'Kubernetes API calls required at runtime: NONE'],
      [/^netcheck kube-api$/i,'catalog-web -> kubernetes.default.svc:443 = ALLOWED']
    ],
    actions:[
      {id:'a1',label:'Preserve pod, RBAC, and audit configuration',description:'Record the effective identity and permissions before modifying them.',outcome:'The assessment finding remains reproducible after hardening.',quality:'good'},
      {id:'a2',label:'Disable service-account token automount for catalog-web',description:'Stop injecting a cluster API credential into a workload that does not use it.',outcome:'The running web pod no longer receives a Kubernetes API token.',quality:'good'},
      {id:'a3',label:'Remove unnecessary secret permissions',description:'Delete the catalog-runtime binding or replace it with the minimum permissions actually required.',outcome:'The web workload can no longer enumerate or read namespace secrets.',quality:'good'},
      {id:'a4',label:'Restrict control-plane egress',description:'Add policy so the workload cannot reach the Kubernetes API unless explicitly required.',outcome:'A second control now limits unnecessary access to the API surface.',quality:'good'},
      {id:'a5',label:'Move every application secret into the container image',description:'Avoid Kubernetes secrets by baking credentials into the image.',outcome:'Long-lived secrets become part of image layers and distribution history, creating a worse secret-management problem.',quality:'bad'}
    ],
    hints:['Start with identity: what credential exists inside the pod even though the application never requested one?','Then evaluate effective authorization, not just the service-account name. What can that identity actually ask the API server to return?','The best fix can remove both the unnecessary credential and the unnecessary permission, with network policy as an additional boundary.'],
    evaluation:[
      {label:'Workload identity',groups:[['catalog-runtime','service account'],['automount','token']],supported:'You identify the automatically mounted service-account credential as an unnecessary runtime identity.',partial:'You notice the service account but do not explain how the credential reaches the pod.',missing:'The pod identity and token exposure are not established.'},
      {label:'Authorization impact',groups:[['get','list'],['secrets'],['payment-api-key'],['RBAC','catalog-ops']],supported:'You prove that the workload identity can enumerate/read namespace secrets beyond its application need.',partial:'You identify broad RBAC but do not tie it to a meaningful secret-access proof.',missing:'Your theory does not establish what excess permission the workload can exercise.'},
      {label:'Hardening',groups:[['disable','automount'],['remove','secret','permission'],['network','API','egress']],supported:'You remove the unnecessary token, least-privilege the role, and add a control-plane network boundary.',partial:'You fix either token exposure or RBAC but leave the other major control gap.',missing:'The workload remains able to authenticate to or access the cluster API unnecessarily.'}
    ]
  },
  {
    id:'C044', title:'After Midnight', subtitle:'Production ran the same image tag but not the same image.', tier:'Advanced software-supply-chain investigation',
    brief:'Morrow Retail redeployed inventory-api at 00:18 using image tag inventory-api:stable. The deployment manifest did not change, yet outbound traffic began immediately afterward. Determine how an unchanged tag delivered different code, identify the control gaps, and redesign release integrity.',
    environment:'Morrow Retail / CI + container registry + Kubernetes deployment',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Deployment manifest','Kubernetes','Deployment references registry.morrow.test/inventory-api:stable.','The manifest stores a mutable tag rather than an immutable digest.'),
      e('ev2','Registry history','Container registry','The stable tag pointed to digest sha256:AAA at 23:40 and was moved to sha256:BAD at 00:14.','Tag movement does not change the deployment YAML text.'),
      e('ev3','Unexpected push','Registry audit','sha256:BAD was pushed by ci-legacy-token from runner OLD-CI-03.','OLD-CI-03 was retired but its long-lived registry token remained valid.'),
      e('ev4','Image provenance','Build system','sha256:AAA has a signed provenance record tied to release REL-992; sha256:BAD has none.','The cluster does not enforce provenance/signature verification.'),
      e('ev5','Runtime behavior','Network telemetry','Pods using sha256:BAD began connecting to 198.51.100.211:443 every 90 seconds.','The prior digest had no such destination.'),
      e('ev6','Approved source','Release record','No approved source commit or release corresponds to sha256:BAD.','The registry push bypassed the current CI release pipeline.')
    ],
    logs:[
      {id:'registry',name:'Registry audit',text:`23:40 tag=inventory-api:stable digest=sha256:AAA actor=release-bot\n00:14 push digest=sha256:BAD actor=ci-legacy-token runner=OLD-CI-03\n00:15 tag_move stable sha256:AAA -> sha256:BAD actor=ci-legacy-token`},
      {id:'cluster',name:'Cluster rollout',text:`00:18 deployment=inventory-api image=registry.morrow.test/inventory-api:stable resolved_digest=sha256:BAD\n00:19-00:29 pod egress dst=198.51.100.211:443 interval≈90s`},
      {id:'provenance',name:'Provenance verification',text:`sha256:AAA signature=VALID release=REL-992 commit=8a11c2e\nsha256:BAD signature=NONE release=NONE commit=UNKNOWN`}
    ],
    terminal:[
      [/^help$/i,'Try: registry tag-history inventory-api:stable, registry inspect sha256:BAD, provenance verify sha256:AAA, provenance verify sha256:BAD, token show ci-legacy-token, pod digest inventory-api'],
      [/^registry tag-history inventory-api:stable$/i,'23:40 sha256:AAA\n00:15 sha256:BAD (tag moved by ci-legacy-token)'],
      [/^registry inspect sha256:BAD$/i,'pushed=00:14\nactor=ci-legacy-token\nrunner=OLD-CI-03\nsignature=NONE\napproved_release=NONE'],
      [/^provenance verify sha256:AAA$/i,'VALID\nrelease=REL-992\nsource_commit=8a11c2e'],
      [/^provenance verify sha256:BAD$/i,'FAILED: no signed provenance record'],
      [/^token show ci-legacy-token$/i,'status=ACTIVE\ncreated=2024-02-10\nlast_used=00:15 OLD-CI-03\npermissions=registry:push,tag:update'],
      [/^pod digest inventory-api$/i,'current_resolved_digest=sha256:BAD']
    ],
    actions:[
      {id:'a1',label:'Preserve registry, rollout, provenance, and egress evidence',description:'Snapshot the chain before retagging or deleting artifacts.',outcome:'The tag mutation and runtime impact remain provable.',quality:'good'},
      {id:'a2',label:'Revoke the legacy registry token',description:'Invalidate credentials for the retired CI runner.',outcome:'OLD-CI-03 can no longer push or move production image tags.',quality:'good'},
      {id:'a3',label:'Redeploy an approved immutable digest',description:'Pin inventory-api to the known-good signed digest after preservation.',outcome:'The compromised image is removed from runtime without relying on a mutable tag.',quality:'good'},
      {id:'a4',label:'Require signed provenance for production admission',description:'Block production workloads whose image digest lacks an approved signature/provenance record.',outcome:'An unsigned registry push cannot become a production workload through tag movement alone.',quality:'good'},
      {id:'a5',label:'Keep stable tags but rotate them more often',description:'Continue mutable-tag deployment while frequently changing tag names.',outcome:'The integrity problem remains because release identity is still mutable and admission does not verify provenance.',quality:'bad'}
    ],
    hints:['A deployment file can stay unchanged while the bytes behind a mutable tag change. Compare tag history with the digest actually pulled.','Then ask who was allowed to move the tag and whether the new digest has any approved build provenance.','Contain the credential and runtime image, then redesign release identity around immutable digests plus verification—not naming conventions.'],
    evaluation:[
      {label:'Supply-chain path',groups:[['stable','mutable','tag'],['sha256:BAD'],['ci-legacy-token','OLD-CI-03'],['00:14','00:15']],supported:'You show how a retired CI credential changed the bytes behind an unchanged production tag.',partial:'You identify an unexpected image but do not explain how it replaced the approved release without a manifest change.',missing:'The role of mutable tags and the legacy registry token is not established.'},
      {label:'Runtime impact',groups:[['198.51.100.211'],['90','egress','beacon'],['sha256:BAD']],supported:'You correlate the unauthorized digest with the new outbound behavior.',partial:'You note suspicious egress but do not tie it to the changed image digest.',missing:'The runtime consequence of the unauthorized release is not addressed.'},
      {label:'Release hardening',groups:[['revoke','legacy','token'],['digest','immutable','pin'],['signed','provenance','admission']],supported:'You remove the stale credential, restore a known-good immutable release, and enforce provenance at admission.',partial:'You contain the bad image but leave release integrity dependent on mutable tags or unverified pushes.',missing:'The same unauthorized tag replacement could succeed again.'}
    ]
  },
  {
    id:'C045', title:'Backup Lane', subtitle:'A management interface is reachable from a network that should never see it.', tier:'Advanced network security assessment',
    brief:'An authorized segmentation review at Alder Manufacturing finds that a user workstation can reach a backup appliance management interface. Prove the route safely, identify the ACL logic error, estimate blast radius, and redesign access without breaking backup jobs.',
    environment:'Alder Manufacturing / user VLAN + management VLAN + backup services',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Intended architecture','Network design','Backup appliance management port 8443 should be reachable only from ADMIN-JUMP and backup controllers.','User VLAN 10.40.20.0/24 is explicitly marked untrusted for management access.'),
      e('ev2','Reachability proof','Assessment trace','Workstation USER-117 can establish TCP/8443 to 10.70.5.12.','The simulator performs connection validation only; it does not attack a real device.'),
      e('ev3','Firewall rule order','ACL export','Rule 18 allows 10.40.0.0/16 to MGMT-SERVICES before Rule 42 denies USER-VLAN to MANAGEMENT.','First-match processing means the broader allow wins.'),
      e('ev4','Service exposure','Backup appliance','8443 is the administrative web interface; 9443 is the backup data API.','Backup jobs use 9443 from backup controllers, not 8443 from user workstations.'),
      e('ev5','Authentication posture','Configuration review','The management UI uses MFA, but reachable management surfaces still increase attack opportunities and dependency on application-layer controls.','Segmentation is intended as an independent boundary.'),
      e('ev6','Blast-radius sample','Route analysis','All five user subnets inside 10.40.0.0/16 match Rule 18.','The issue is broader than USER-117.')
    ],
    logs:[
      {id:'firewall',name:'Firewall decision log',text:`14:33 src=10.40.20.117 dst=10.70.5.12 dport=8443 rule=18 action=ALLOW\n14:34 src=10.40.20.117 dst=10.70.5.12 dport=9443 rule=18 action=ALLOW`},
      {id:'acl',name:'ACL excerpt',text:`18 ALLOW src=10.40.0.0/16 dst=MGMT-SERVICES ports=8443,9443 note="temporary migration"\n42 DENY src=USER-VLAN dst=MANAGEMENT any\n55 ALLOW src=BACKUP-CONTROLLERS dst=10.70.5.12 port=9443\n56 ALLOW src=ADMIN-JUMP dst=10.70.5.12 port=8443`}
    ],
    terminal:[
      [/^help$/i,'Try: routecheck USER-117 10.70.5.12 8443, service 10.70.5.12, acl explain 10.40.20.117 10.70.5.12 8443, blast 10.40.0.0/16 rule18, requirement backup-appliance'],
      [/^routecheck USER-117 10.70.5.12 8443$/i,'REACHABLE\nTCP handshake simulated successfully\nmatched_firewall_rule=18'],
      [/^service 10.70.5.12$/i,'8443/tcp management-ui\n9443/tcp backup-data-api'],
      [/^acl explain 10.40.20.117 10.70.5.12 8443$/i,'Rule 18 matches first: ALLOW 10.40.0.0/16 -> MGMT-SERVICES ports 8443,9443\nRule 42 deny is never evaluated.'],
      [/^blast 10.40.0.0\/16 rule18$/i,'Matched user subnets: 5\nApprox endpoints: 612'],
      [/^requirement backup-appliance$/i,'Admin UI 8443: ADMIN-JUMP only\nBackup API 9443: BACKUP-CONTROLLERS only\nUser VLAN access: NONE']
    ],
    actions:[
      {id:'a1',label:'Preserve ACL and reachability evidence',description:'Capture the first-match decision and tested source/destination before modifying rules.',outcome:'The segmentation finding remains reproducible after remediation.',quality:'good'},
      {id:'a2',label:'Remove the temporary broad allow rule',description:'Delete Rule 18 after validating no current dependency requires user-subnet access.',outcome:'User networks no longer bypass the intended management deny.',quality:'good'},
      {id:'a3',label:'Keep explicit ADMIN-JUMP and backup-controller permits',description:'Allow only the management and data flows documented by the application owners.',outcome:'Backup jobs continue while administrative access remains isolated.',quality:'good'},
      {id:'a4',label:'Add segmentation regression tests',description:'Continuously verify that representative user subnets cannot reach management interfaces.',outcome:'Future firewall changes are checked against the intended trust boundary.',quality:'good'},
      {id:'a5',label:'Disable MFA because the firewall will be fixed',description:'Rely entirely on network segmentation after remediation.',outcome:'Defense in depth is reduced unnecessarily; reachable authorized paths still benefit from strong authentication.',quality:'bad'}
    ],
    hints:['Do not stop at “the port is open.” Explain why the firewall permitted it even though a deny rule appears later.','First-match rule order and subnet scope determine the actual boundary. Then separate the admin flow from the backup-data flow.','A durable fix preserves required controller/jump-host access and adds tests so a future temporary rule cannot silently reopen the management plane.'],
    evaluation:[
      {label:'Reachability proof',groups:[['USER-117','10.40.20.117'],['10.70.5.12'],['8443'],['rule 18']],supported:'You safely prove user-to-management reachability and identify the firewall decision responsible.',partial:'You identify the exposed management port but not the exact policy path that permits it.',missing:'The segmentation failure is not demonstrated from an untrusted source.'},
      {label:'Policy logic',groups:[['10.40.0.0/16'],['first match','before','rule 42'],['temporary','broad allow']],supported:'You explain why the broad earlier allow defeats the later user-to-management deny across multiple subnets.',partial:'You notice a broad rule but do not explain ordering or blast radius.',missing:'The ACL root cause remains unclear.'},
      {label:'Hardening',groups:[['remove','rule 18'],['ADMIN-JUMP'],['BACKUP-CONTROLLERS'],['regression','test'],['MFA']],supported:'You restore least-privilege network paths while retaining MFA and adding boundary regression testing.',partial:'You close the immediate route but do not preserve the intended service flows or prevent recurrence.',missing:'The remediation either breaks required backup access or leaves user networks able to reach management services.'}
    ]
  },
  {
    id:'C046', title:'History Remembers', subtitle:'The secret disappeared from the current branch but not from the repository.', tier:'Advanced source-control security investigation',
    brief:'A payment provider reports use of an old API credential belonging to Finch Market. The current repository contains no key. Determine whether source-control history explains the exposure, establish whether deletion was sufficient, and perform the full remediation sequence.',
    environment:'Finch Market / Git repository + CI secret inventory + payment API audit',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Current tree','Repository','No payment API key appears in the current main branch files.','.env was deleted six months ago.'),
      e('ev2','Historical commit','Git history','Commit 19ac7f1 contains .env with PAYMENTS_API_KEY=finch_live_old_7K2TRAIN.','The value is a fictional training credential.'),
      e('ev3','Provider audit','Payment service','The old key was used from 203.0.113.88 yesterday to list merchant metadata.','No charge creation or refund action succeeded.'),
      e('ev4','Credential status','Secret inventory','finch_live_old_7K2TRAIN remains ACTIVE because the team replaced the application config but never revoked the old provider key.','Removing a secret from code does not invalidate the credential at its issuer.'),
      e('ev5','Repository exposure','Access review','The repository was private but accessible to 37 employees and two external CI integrations during the six months the key existed in history.','The exact accessor cannot be proven from available logs.'),
      e('ev6','Current key','Runtime config','Production now uses a different provider credential from the secret manager.','Rotating/revoking the old key should not require downtime.')
    ],
    logs:[
      {id:'provider',name:'Payment API audit',text:`2026-09-13T22:11Z key_id=finch_live_old_7K2TRAIN src=203.0.113.88 action=merchant.list result=SUCCESS\n2026-09-13T22:12Z key_id=finch_live_old_7K2TRAIN src=203.0.113.88 action=charge.create result=DENIED scope=read-only`},
      {id:'git',name:'Repository timeline',text:`2026-03-02 commit=19ac7f1 add .env with payment key\n2026-03-04 commit=2d81ba9 delete .env\nCurrent branch: no .env\nHistory rewrite: never performed`}
    ],
    terminal:[
      [/^help$/i,'Try: git log --all -- .env, git show 19ac7f1:.env, secret status finch_live_old_7K2TRAIN, provider audit old-key, repo access-window 2026-03'],
      [/^git log --all -- \.env$/i,'2d81ba9 Delete .env\n19ac7f1 Add payment configuration'],
      [/^git show 19ac7f1:\.env$/i,'PAYMENTS_API_KEY=finch_live_old_7K2TRAIN\n# fictional training value'],
      [/^secret status finch_live_old_7K2TRAIN$/i,'ACTIVE\nprovider=FinchPay training service\nscope=merchant:read\nlast_used=2026-09-13T22:12Z'],
      [/^provider audit old-key$/i,'merchant.list SUCCESS from 203.0.113.88\ncharge.create DENIED\nrefund.create NONE'],
      [/^repo access-window 2026-03$/i,'Employees with repository access: 37\nExternal CI integrations: 2\nHistorical per-object read audit: unavailable']
    ],
    actions:[
      {id:'a1',label:'Revoke the exposed provider credential',description:'Invalidate the old API key at the service that issued it.',outcome:'The historical secret can no longer authenticate even if copies remain elsewhere.',quality:'good'},
      {id:'a2',label:'Preserve the commit and provider-use evidence',description:'Record the exposure and observed API use before rewriting repository history.',outcome:'The incident timeline remains defensible after cleanup.',quality:'good'},
      {id:'a3',label:'Rewrite repository history and coordinate clone cleanup',description:'Remove the secret from reachable Git history after the key is revoked and evidence preserved.',outcome:'Casual future discovery in normal repository history is reduced, while recognizing existing copies cannot be recalled.',quality:'good'},
      {id:'a4',label:'Add secret scanning to commit and CI workflows',description:'Detect likely credentials before merge and during repository history scans.',outcome:'Future accidental commits are more likely to be caught before long-term exposure.',quality:'good'},
      {id:'a5',label:'Only delete .env again from the latest branch',description:'Treat current-tree deletion as equivalent to revocation and history cleanup.',outcome:'The key remains active and recoverable from history; the observed abuse path remains open.',quality:'bad'}
    ],
    hints:['The current working tree answers “what is present now,” not “what has ever been committed.”','Even after you find the historical secret, repository cleanup is not the first security boundary. Ask whether the credential itself is still valid at the issuer.','A complete response separates evidence preservation, credential revocation, repository-history cleanup, and prevention controls.'],
    evaluation:[
      {label:'Exposure path',groups:[['19ac7f1'],['.env'],['history','git'],['finch_live_old_7K2TRAIN']],supported:'You establish that the supposedly deleted credential remained recoverable from repository history.',partial:'You identify historical exposure but do not tie it to the specific active provider credential.',missing:'Your theory assumes the absent current file means the key could not have come from source control.'},
      {label:'Observed impact',groups:[['203.0.113.88'],['merchant.list'],['read-only','charge.create denied']],supported:'You state exactly what the old key was observed doing and avoid claiming unsupported payment modification.',partial:'You identify unauthorized key use but overstate or omit the demonstrated scope.',missing:'The provider audit is not incorporated into the impact statement.'},
      {label:'Remediation sequence',groups:[['preserve'],['revoke'],['rewrite','history'],['secret scanning']],supported:'You revoke the credential first, preserve evidence, clean history, and add controls to prevent recurrence.',partial:'You perform useful cleanup but miss either credential invalidation or prevention.',missing:'The exposed credential remains usable or the response relies only on deleting the latest file.'}
    ]
  },
  {
    id:'C047', title:'Shadow Resolver', subtitle:'Employees reached the right hostname through the wrong DNS path.', tier:'Advanced network + identity investigation',
    brief:'Several employees report that intranet.alder.test briefly displayed a convincing login page with a certificate warning. The real intranet server was healthy. Determine why only one floor was affected, trace the name-resolution path, and restore trust without assuming DNS itself authenticated the fake site.',
    environment:'Alder Manufacturing / DHCP + DNS + client network controls',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Affected scope','Helpdesk','Reports come only from Floor 3 workstations on subnet 10.40.30.0/24.','Other floors resolve the intranet normally.'),
      e('ev2','Client DNS config','Endpoint snapshot','Affected client USER-331 received DNS server 10.40.30.254 by DHCP.','Approved corporate DNS for that subnet is 10.20.0.53.'),
      e('ev3','Rogue DHCP offer','Switch telemetry','An unmanaged device on access port Gi3/18 offered DHCP options including DNS=10.40.30.254.','The legitimate DHCP server also responded, creating inconsistent client outcomes.'),
      e('ev4','Resolver answer','DNS capture','10.40.30.254 answered intranet.alder.test with 198.51.100.244; approved DNS answers 10.20.5.30.','The rogue resolver redirected the hostname.'),
      e('ev5','TLS warning','Browser telemetry','The fake endpoint presented a certificate for portal-support.test, not intranet.alder.test.','Users who ignored the warning could still submit credentials to the lookalike page.'),
      e('ev6','Switch protection','Network configuration','DHCP snooping is disabled on Floor 3 access switches.','All access ports can currently send DHCP server responses.')
    ],
    logs:[
      {id:'dhcp',name:'DHCP exchange',text:`08:41 client=USER-331 discover\n08:41 offer server=10.20.0.10 dns=10.20.0.53\n08:41 offer server=10.40.30.254 dns=10.40.30.254 switch_port=Gi3/18\n08:41 client=USER-331 selected=10.40.30.254`},
      {id:'dns',name:'DNS comparison',text:`resolver=10.20.0.53 name=intranet.alder.test answer=10.20.5.30\nresolver=10.40.30.254 name=intranet.alder.test answer=198.51.100.244`},
      {id:'tls',name:'Browser certificate telemetry',text:`host=intranet.alder.test destination=198.51.100.244 certificate_subject=portal-support.test validation=NAME_MISMATCH user_bypass=3`}
    ],
    terminal:[
      [/^help$/i,'Try: ipconfig USER-331, dhcp trace USER-331, dig @10.20.0.53 intranet.alder.test, dig @10.40.30.254 intranet.alder.test, switch locate 10.40.30.254, tls inspect 198.51.100.244'],
      [/^ipconfig USER-331$/i,'IP=10.40.30.131 (training notation)\nDNS=10.40.30.254\nDHCP_selected=10.40.30.254'],
      [/^dhcp trace USER-331$/i,'Two offers received. Legitimate: 10.20.0.10. Unauthorized: 10.40.30.254 on Gi3/18. Client selected unauthorized offer.'],
      [/^dig @10.20.0.53 intranet\.alder\.test$/i,'intranet.alder.test -> 10.20.5.30'],
      [/^dig @10.40.30.254 intranet\.alder\.test$/i,'intranet.alder.test -> 198.51.100.244'],
      [/^switch locate 10.40.30.254$/i,'MAC=02:AA:30:FE:10:22\nport=Gi3/18\nasset_registration=NONE'],
      [/^tls inspect 198.51.100.244$/i,'certificate_subject=portal-support.test\nrequested_name=intranet.alder.test\nvalidation=NAME_MISMATCH']
    ],
    actions:[
      {id:'a1',label:'Preserve DHCP, DNS, switch, and browser telemetry',description:'Capture the redirection path and affected clients before network cleanup.',outcome:'The incident scope and name-resolution chain remain available for investigation.',quality:'good'},
      {id:'a2',label:'Remove/quarantine the unauthorized DHCP device',description:'Stop the rogue server from supplying DNS configuration to additional clients.',outcome:'New DHCP leases no longer receive the shadow resolver.' ,quality:'good'},
      {id:'a3',label:'Enable DHCP snooping with trusted uplinks',description:'Allow DHCP server responses only from designated infrastructure ports.',outcome:'Ordinary access ports can no longer act as unauthorized DHCP servers.',quality:'good'},
      {id:'a4',label:'Force lease renewal and verify approved DNS on affected clients',description:'Return Floor 3 clients to the corporate resolver and validate name resolution.',outcome:'Affected workstations resolve intranet.alder.test to the approved internal address.',quality:'good'},
      {id:'a5',label:'Tell users certificate warnings are harmless on the intranet',description:'Normalize bypassing TLS identity warnings because the hostname is internal.',outcome:'A critical independent identity check is weakened and future redirection attacks become easier to exploit.',quality:'bad'}
    ],
    hints:['Why would only one subnet see a different answer for the same hostname? Start before DNS queries—with how the client chose its resolver.','Compare the approved and unauthorized resolver answers, then locate who supplied the unauthorized DNS setting.','The redirect and the TLS warning are two different controls: DNS influenced destination, while certificate validation still warned that the endpoint identity did not match.'],
    evaluation:[
      {label:'Network path',groups:[['Floor 3','10.40.30'],['DHCP','10.40.30.254'],['Gi3/18']],supported:'You trace the affected scope back to an unauthorized DHCP offer that changed client DNS configuration.',partial:'You identify a rogue resolver but do not explain how affected clients were configured to use it.',missing:'The reason only one floor was affected is not established.'},
      {label:'Redirection evidence',groups:[['10.40.30.254'],['198.51.100.244'],['10.20.0.53'],['10.20.5.30'],['certificate','mismatch']],supported:'You compare resolver answers and TLS identity evidence to show the hostname was redirected to a lookalike endpoint.',partial:'You identify differing DNS answers but omit the independent TLS mismatch evidence.',missing:'The fake intranet destination is not tied to the unauthorized resolver.'},
      {label:'Hardening',groups:[['quarantine','remove'],['DHCP snooping'],['trusted uplink'],['renew','approved DNS'],['certificate warning']],supported:'You remove the rogue source, enforce DHCP trust, restore client resolver configuration, and retain TLS validation as defense in depth.',partial:'You fix the immediate client configuration but do not prevent future rogue DHCP responses.',missing:'The network remains vulnerable to the same resolver-redirection path.'}
    ]
  },
  {
    id:'C048', title:'Recovery Task', subtitle:'A SYSTEM maintenance task executes a script that ordinary support staff can modify.', tier:'Advanced Windows privilege assessment',
    brief:'An authorized endpoint review finds a scheduled recovery task running as SYSTEM every five minutes. Determine whether a non-admin helpdesk user can influence what SYSTEM executes, prove the boundary failure with a harmless marker in the simulator, and correct the design.',
    environment:'Stonebridge / Windows workstation hardening lab',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Scheduled task','Windows configuration','RecoveryHealth runs C:\\ProgramData\\Stonebridge\\Support\\health.ps1 as SYSTEM every five minutes.','The task itself can be modified only by administrators.'),
      e('ev2','Directory ACL','Filesystem permissions','STONE\\Helpdesk has Modify permission on C:\\ProgramData\\Stonebridge\\Support.','That permission includes replacing health.ps1.'),
      e('ev3','Helpdesk role','Directory group','Level1 support users are standard users on endpoints and are not intended to gain local administrator/SYSTEM privileges.','The writable script path crosses that privilege boundary.'),
      e('ev4','Safe marker proof','Assessment simulator','A training helpdesk identity replaces health.ps1 with a harmless marker action; the next scheduled execution creates C:\\ProgramData\\trace-system-marker.txt owned by SYSTEM.','The simulator blocks arbitrary payload execution and only demonstrates execution context.'),
      e('ev5','Business requirement','Endpoint owner','Helpdesk should be able to read task logs and trigger a health check, but should not edit the executable script.','Support usability does not require write permission on the SYSTEM-executed content.'),
      e('ev6','Signature state','Script inventory','health.ps1 is unsigned and the task performs no hash/signature validation.','Filesystem ACL is therefore the primary integrity boundary today.')
    ],
    logs:[
      {id:'task',name:'Task Scheduler history',text:`09:00 task=RecoveryHealth account=SYSTEM action=health.ps1 result=0\n09:05 task=RecoveryHealth account=SYSTEM action=health.ps1 result=0\n09:10 task=RecoveryHealth account=SYSTEM action=health.ps1 result=0 marker_created=trace-system-marker.txt`},
      {id:'acl',name:'ACL summary',text:`C:\\ProgramData\\Stonebridge\\Support\nSYSTEM: FullControl\nAdministrators: FullControl\nSTONE\\Helpdesk: Modify\nUsers: Read`}
    ],
    terminal:[
      [/^help$/i,'Try: task show RecoveryHealth, icacls C:\\ProgramData\\Stonebridge\\Support, role show Helpdesk, task simulate-marker RecoveryHealth, file owner C:\\ProgramData\\trace-system-marker.txt, requirement support-health'],
      [/^task show RecoveryHealth$/i,'RunAs=SYSTEM\nSchedule=every 5 minutes\nAction=powershell.exe -File C:\\ProgramData\\Stonebridge\\Support\\health.ps1'],
      [/^icacls C:\\ProgramData\\Stonebridge\\Support$/i,'SYSTEM:(F)\nAdministrators:(F)\nSTONE\\Helpdesk:(M)\nUsers:(RX)'],
      [/^role show Helpdesk$/i,'Endpoint local-admin entitlement: NO\nIntended capability: read health logs, trigger approved health check'],
      [/^task simulate-marker RecoveryHealth$/i,'SIMULATED SUCCESS\nHelpdesk-modified script executed at next task run\nCreated marker only: C:\\ProgramData\\trace-system-marker.txt'],
      [/^file owner C:\\ProgramData\\trace-system-marker\.txt$/i,'Owner=NT AUTHORITY\\SYSTEM\nCreatedByProcessContext=SYSTEM'],
      [/^requirement support-health$/i,'Helpdesk needs: read logs + trigger task\nHelpdesk needs: modify SYSTEM-executed script = NO']
    ],
    actions:[
      {id:'a1',label:'Preserve task definition and ACL evidence',description:'Capture the execution context, script path, and effective permissions before hardening.',outcome:'The privilege-boundary finding remains reproducible.',quality:'good'},
      {id:'a2',label:'Remove Helpdesk write access from the SYSTEM script directory',description:'Restrict modification of health.ps1 to administrators/SYSTEM or the deployment service.',outcome:'Standard support users can no longer alter code executed by SYSTEM.',quality:'good'},
      {id:'a3',label:'Provide a separate approved trigger interface',description:'Let helpdesk start the health check without granting script modification rights.',outcome:'The support workflow remains usable while the integrity boundary is preserved.',quality:'good'},
      {id:'a4',label:'Add signed-script or integrity validation',description:'Verify trusted maintenance content before privileged execution.',outcome:'A second integrity control protects the privileged task content.',quality:'good'},
      {id:'a5',label:'Make Helpdesk local administrators instead',description:'Resolve permission friction by officially granting the privilege they could indirectly reach.',outcome:'The intended least-privilege boundary is abandoned and endpoint attack surface expands significantly.',quality:'bad'}
    ],
    hints:['The task definition can be perfectly locked down while the file it launches is not. Follow the execution dependency.','Compare the privilege of the scheduled task with the privilege of users who can modify its script.','The practical fix should preserve the support function—read logs and trigger checks—without letting support staff write privileged executable content.'],
    evaluation:[
      {label:'Privilege boundary',groups:[['SYSTEM'],['health.ps1'],['Helpdesk','Modify'],['scheduled task']],supported:'You identify that a standard helpdesk user controls content later executed by SYSTEM.',partial:'You find weak file permissions but do not connect them to the privileged scheduled-task context.',missing:'The privilege-escalation boundary is not explained.'},
      {label:'Safe proof',groups:[['marker'],['trace-system-marker'],['SYSTEM','owner']],supported:'You use the simulator’s harmless marker to prove execution context without arbitrary payload execution.',partial:'You describe theoretical privilege impact without referencing the reproducible marker evidence.',missing:'Your finding lacks a safe demonstration that writable content executes as SYSTEM.'},
      {label:'Hardening',groups:[['remove','write','Modify'],['trigger','interface'],['signed','integrity']],supported:'You protect privileged content while preserving a narrow helpdesk trigger workflow and adding integrity validation.',partial:'You fix write permissions but do not preserve the operational support need or add defense in depth.',missing:'Helpdesk can still influence SYSTEM-executed content or is unnecessarily promoted to administrator.'}
    ]
  },
  {
    id:'C049', title:'Still Signed In', subtitle:'The identity provider disabled the user, but the SaaS application kept trusting an old session.', tier:'Advanced identity lifecycle investigation',
    brief:'A contractor was offboarded at 17:00 Friday. On Saturday, a SaaS analytics platform exported internal reports under that contractor’s account even though the identity provider shows the account disabled. Determine how access survived offboarding and redesign session revocation across the identity chain.',
    environment:'Palisade Labs / IdP + SSO broker + analytics SaaS',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','IdP offboarding','Identity provider','contractor.jules was disabled Friday at 17:00 and cannot obtain new SSO assertions.','The IdP action succeeded.'),
      e('ev2','SaaS session','Application session store','A 30-day refresh session issued Thursday remains active until October 12.','The SaaS does not currently receive logout/session-revocation events from the IdP.'),
      e('ev3','Saturday export','SaaS audit','At 09:14 Saturday the existing SaaS refresh session minted a new app access token and exported three internal reports.','No new IdP authentication occurred.'),
      e('ev4','Broker configuration','SSO integration','Provisioning disables users through SCIM, but session revocation is not configured and the SaaS account status updates only on next provisioning cycle.','Identity lifecycle and session lifecycle are partially disconnected.'),
      e('ev5','Device posture','Endpoint inventory','The contractor’s managed laptop was returned Friday; the surviving browser session was previously established on a personal tablet approved for temporary access.','Device return alone did not invalidate the SaaS refresh session.'),
      e('ev6','Current control','Application policy','Refresh sessions are allowed for 30 days regardless of contractor employment type.','No continuous access evaluation or forced reauthentication exists for offboarding events.')
    ],
    logs:[
      {id:'idp',name:'Identity provider',text:`Fri 17:00 user=contractor.jules action=DISABLE result=SUCCESS\nSat 09:14 authentication_events=0`},
      {id:'saas',name:'Analytics SaaS audit',text:`Thu 15:22 session=s_774 issued user=contractor.jules refresh_exp=Oct12\nSat 09:14 session=s_774 event=REFRESH result=SUCCESS\nSat 09:15 export report=market-plan\nSat 09:16 export report=customer-segments\nSat 09:17 export report=forecast`},
      {id:'scim',name:'Provisioning',text:`Fri 17:00 IdP disable queued\nFri 18:00 SCIM sync delayed vendor outage\nSat 10:00 SCIM user status -> inactive`}
    ],
    terminal:[
      [/^help$/i,'Try: idp show contractor.jules, saas sessions contractor.jules, saas audit contractor.jules, sso revocation-status analytics, device sessions contractor.jules, policy refresh analytics'],
      [/^idp show contractor\.jules$/i,'status=DISABLED since Fri 17:00\nnew_authentication=DENIED'],
      [/^saas sessions contractor\.jules$/i,'s_774 ACTIVE\nissued=Thu 15:22\nrefresh_exp=Oct12\nlast_refresh=Sat 09:14'],
      [/^saas audit contractor\.jules$/i,'Sat 09:14 token refresh via s_774\nSat 09:15-09:17 three report exports'],
      [/^sso revocation-status analytics$/i,'IdP logout/revocation events -> SaaS: NOT CONFIGURED\nSCIM disable: hourly sync only'],
      [/^device sessions contractor\.jules$/i,'managed laptop session=revoked Fri\npersonal tablet session=s_774 still active Sat'],
      [/^policy refresh analytics$/i,'refresh lifetime=30 days\ncontractor override=NONE\ncontinuous access evaluation=DISABLED']
    ],
    actions:[
      {id:'a1',label:'Preserve IdP, SCIM, and SaaS session evidence',description:'Capture both the successful IdP disable and the surviving application-session timeline.',outcome:'The control gap remains clear after session termination.',quality:'good'},
      {id:'a2',label:'Revoke all active SaaS sessions for the contractor',description:'Invalidate refresh and access tokens directly at the application.',outcome:'The surviving tablet session can no longer mint new app tokens.',quality:'good'},
      {id:'a3',label:'Integrate offboarding with application-session revocation',description:'Trigger SaaS session termination when the identity is disabled, not only eventual SCIM account status changes.',outcome:'Future offboarding events cut both new authentication and existing app sessions.',quality:'good'},
      {id:'a4',label:'Shorten or condition refresh lifetime for contractors',description:'Require more frequent reauthentication or continuous access evaluation for higher-churn external identities.',outcome:'A missed revocation event has a smaller window of exposure.',quality:'good'},
      {id:'a5',label:'Conclude the IdP disable failed',description:'Treat Saturday SaaS activity as proof the identity provider ignored the disable request.',outcome:'Investigation focuses on the wrong control; the IdP correctly blocked new authentication while the independent SaaS session stayed valid.',quality:'bad'}
    ],
    hints:['Ask whether Saturday activity required a new identity-provider login at all. Existing sessions can be their own authorization state.','Compare the IdP disable timestamp with the SaaS session’s original issue time and refresh behavior.','Offboarding must terminate both the ability to authenticate again and already-issued application sessions—especially on devices the organization does not control.'],
    evaluation:[
      {label:'Session survival',groups:[['s_774'],['30-day','refresh'],['no new','IdP','authentication'],['Saturday','09:14']],supported:'You show that a previously issued SaaS refresh session survived the successful IdP disable and minted new application access.',partial:'You identify a stale SaaS session but do not distinguish it from a new IdP login.',missing:'Your theory incorrectly assumes the IdP had to authenticate the Saturday activity.'},
      {label:'Lifecycle gap',groups:[['SCIM'],['revocation','not configured'],['offboarding'],['personal tablet']],supported:'You identify the disconnect between identity disablement, delayed provisioning, and application-session revocation across an unmanaged device.',partial:'You note delayed SCIM or the tablet but not the broader session-lifecycle control gap.',missing:'The reason offboarding failed to terminate existing application access is not established.'},
      {label:'Hardening',groups:[['revoke','sessions'],['integrate','offboarding'],['shorten','refresh','continuous']],supported:'You immediately revoke sessions and redesign offboarding so existing application tokens are terminated, with shorter/conditional session lifetimes.',partial:'You revoke the current session but do not fix the lifecycle integration that allowed it to survive.',missing:'Existing SaaS sessions could continue after future identity disablement.'}
    ]
  },
  {
    id:'C050', title:'Cold Route', subtitle:'A former contractor, a management route, and an overpowered workload identity form one quiet path.', tier:'Advanced multi-domain capstone',
    brief:'Northbridge Foods detects unusual downloads from a private object store at 04:20. No employee account shows a fresh login. You have directory, VPN certificate, firewall, Kubernetes, registry, and storage telemetry. Reconstruct the most defensible attack path, separate enabling weaknesses from unrelated noise, contain it in the correct order, and redesign the boundaries that failed.',
    environment:'Northbridge Foods / certificate VPN + management network + Kubernetes + registry + object storage',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Former contractor record','Identity lifecycle','vendor.sam was disabled in the IdP twelve days ago after the contract ended.','No fresh IdP login exists during the incident.'),
      e('ev2','VPN certificate','Remote access','Client certificate VPN-SAM-221 remains valid for 21 more days and certificate revocation is not integrated with contractor offboarding.','The VPN gateway accepts the certificate independently of current IdP account status.'),
      e('ev3','VPN session','Gateway audit','At 03:48 VPN-SAM-221 established a session from 203.0.113.141 into CONTRACTOR-VPN 10.61.8.0/24.','The certificate maps to former contractor vendor.sam.'),
      e('ev4','Management route','Firewall telemetry','The contractor VPN subnet can reach K8S-MGMT 10.70.12.20:443 through temporary Rule 27.','Rule 27 was added for a migration and never removed.'),
      e('ev5','Dashboard identity','Kubernetes config','The management dashboard runs as service account dashboard-runtime with get/list permissions on secrets across namespace operations.','The dashboard only needs pod and deployment read access for its intended use.'),
      e('ev6','Assessment-equivalent audit','Kubernetes audit','At 04:02 dashboard-runtime read registry-deploy-token and objectstore-export-key.','The requests originated from the management dashboard session tied to the VPN source.'),
      e('ev7','Registry use','Registry audit','At 04:07 object-exporter:stable moved from approved digest sha256:GOOD50 to unsigned sha256:COLD50 using registry-deploy-token.','The production job references the mutable stable tag.'),
      e('ev8','Workload behavior','Cluster + storage','At 04:12 object-exporter restarted on sha256:COLD50; at 04:20 it used objectstore-export-key to download 6,240 private inventory records to a staging archive.','No delete/write operations occurred in the object store.'),
      e('ev9','Distractor: failed admin logins','Identity logs','An employee administrator had five failed password attempts at 03:30 from the office NAT.','The attempts ended before the VPN session and have no matching successful login or downstream activity.'),
      e('ev10','Distractor: old vulnerable service','Scanner report','An internal print server still exposes an outdated management page.','No traffic from the incident source or affected systems touches the print server.')
    ],
    logs:[
      {id:'timeline',name:'Cross-system timeline',text:`03:30 admin failed logins x5 office NAT / no success\n03:48 VPN cert=VPN-SAM-221 user=vendor.sam src=203.0.113.141 session=vpn-884\n03:51 firewall src=10.61.8.14 dst=10.70.12.20:443 rule=27 ALLOW\n04:02 k8s user=dashboard-runtime get secret=registry-deploy-token source_session=vpn-884\n04:02 k8s user=dashboard-runtime get secret=objectstore-export-key source_session=vpn-884\n04:07 registry actor=registry-deploy-token tag_move object-exporter:stable GOOD50 -> COLD50\n04:12 cluster rollout object-exporter resolved=sha256:COLD50 signature=NONE\n04:20 objectstore key=objectstore-export-key download_records=6240 destination=staging/export-0914.tar`},
      {id:'vpn',name:'VPN + certificate',text:`cert=VPN-SAM-221 subject=vendor.sam status=VALID expires=+21d\nIdP user vendor.sam status=DISABLED -12d\nVPN auth mode=certificate-only for contractor profile\nrevocation_feed_from_offboarding=NONE`},
      {id:'firewall',name:'Management ACL',text:`27 ALLOW src=10.61.8.0/24 dst=K8S-MGMT:443 note="migration temporary"\n60 DENY src=CONTRACTOR-VPN dst=MANAGEMENT any`},
      {id:'k8s',name:'Dashboard RBAC',text:`serviceaccount=operations:dashboard-runtime\npermissions=pods[get,list], deployments[get,list], secrets[get,list]\nautomount_token=true`},
      {id:'registry',name:'Image integrity',text:`sha256:GOOD50 signature=VALID release=REL-1050\nsha256:COLD50 signature=NONE actor=registry-deploy-token\nproduction_ref=object-exporter:stable`}
    ],
    terminal:[
      [/^help$/i,'Try: timeline 03:30-04:25, cert show VPN-SAM-221, idp show vendor.sam, acl explain 10.61.8.14 10.70.12.20 443, rbac show dashboard-runtime, grep vpn-884 k8s.log, registry tag-history object-exporter:stable, provenance verify sha256:COLD50, objectstore audit 04:20, correlate admin-failures'],
      [/^timeline 03:30-04:25$/i,'03:30 failed admin logins only\n03:48 stale contractor VPN certificate accepted\n03:51 contractor VPN -> K8S management allowed by Rule 27\n04:02 dashboard-runtime reads two secrets\n04:07 registry stable tag moved to unsigned digest\n04:12 exporter restarts on unsigned digest\n04:20 6,240 inventory records downloaded'],
      [/^cert show VPN-SAM-221$/i,'subject=vendor.sam\nstatus=VALID\nexpires_in=21d\noffboarding_revocation=NOT CONNECTED'],
      [/^idp show vendor\.sam$/i,'status=DISABLED since 12 days ago\nfresh_logins_during_incident=0'],
      [/^acl explain 10.61.8.14 10.70.12.20 443$/i,'Rule 27 first-match ALLOW contractor VPN -> K8S-MGMT:443\nLater deny not evaluated'],
      [/^rbac show dashboard-runtime$/i,'pods:get,list\ndeployments:get,list\nsecrets:get,list\nautomount_token=true'],
      [/^grep vpn-884 k8s\.log$/i,'04:02 dashboard-runtime get secret registry-deploy-token session=vpn-884\n04:02 dashboard-runtime get secret objectstore-export-key session=vpn-884'],
      [/^registry tag-history object-exporter:stable$/i,'03:00 sha256:GOOD50\n04:07 sha256:COLD50 actor=registry-deploy-token'],
      [/^provenance verify sha256:COLD50$/i,'FAILED: no approved signature/provenance'],
      [/^objectstore audit 04:20$/i,'credential=objectstore-export-key\noperation=READ\nrecords=6240\nwrite/delete=NONE\ndestination=staging/export-0914.tar'],
      [/^correlate admin-failures$/i,'Failed logins ended 03:30\nsuccessful admin auth=NONE\nVPN correlation=NONE\nK8S correlation=NONE\nTreat as separate signal unless new evidence appears.']
    ],
    actions:[
      {id:'a1',label:'Preserve VPN, firewall, Kubernetes, registry, and object-store telemetry',description:'Capture the full cross-domain chain before invalidating credentials and routes.',outcome:'The incident timeline and demonstrated data impact remain defensible.',quality:'good'},
      {id:'a2',label:'Revoke VPN-SAM-221 and all contractor certificates tied to the offboarded identity',description:'Terminate the remote-access foothold and review other stale contractor certificates.',outcome:'The former contractor certificate can no longer establish VPN sessions.',quality:'good'},
      {id:'a3',label:'Remove temporary Rule 27 and restore contractor-to-management deny',description:'Close the route from contractor VPN space to the Kubernetes management plane.',outcome:'Remote contractor subnets can no longer directly reach K8S-MGMT.' ,quality:'good'},
      {id:'a4',label:'Restrict dashboard-runtime RBAC and disable unnecessary token access',description:'Remove secret read/list permissions and narrow the dashboard workload identity to its read-only operational need.',outcome:'Compromise of the dashboard no longer grants namespace secret access.',quality:'good'},
      {id:'a5',label:'Rotate registry-deploy-token and objectstore-export-key',description:'Invalidate both secrets observed being read through the dashboard identity.',outcome:'The credentials used for tag mutation and object-store access are no longer valid.',quality:'good'},
      {id:'a6',label:'Restore object-exporter to signed immutable digest and enforce provenance',description:'Redeploy the approved image by digest and reject unsigned production artifacts.',outcome:'The altered exporter is removed and the same registry-tag trick cannot silently redeploy unsigned code.',quality:'good'},
      {id:'a7',label:'Integrate contractor offboarding with certificate revocation',description:'Tie identity lifecycle events to VPN certificate invalidation rather than waiting for expiry.',outcome:'Future disabled contractors lose both identity-provider access and certificate-based remote access.',quality:'good'},
      {id:'a8',label:'Reset the employee administrator password as the primary containment',description:'Treat the earlier failed logins as the incident root cause despite no successful authentication or downstream correlation.',outcome:'The evidence-backed certificate/VPN path remains active while response effort targets an unrelated signal.',quality:'bad'},
      {id:'a9',label:'Patch the old print server first',description:'Prioritize a known vulnerability with no traffic or timeline connection to the incident.',outcome:'General hygiene improves, but the active compromise chain is not contained.',quality:'bad'}
    ],
    hints:['Begin with the first successful access event, not the loudest alert. Which identity mechanism actually created a session at 03:48?','Then follow source continuity across firewall, Kubernetes audit, registry use, and object-store access. Each transition should have evidence—not just a plausible story.','Your final response should break every active link: stale certificate, management route, overprivileged workload identity, exposed secrets, and mutable/unverified production image. Keep unrelated findings separate.'],
    evaluation:[
      {label:'Initial access',groups:[['VPN-SAM-221'],['vendor.sam'],['certificate'],['03:48'],['IdP','disabled']],supported:'You correctly identify a still-valid contractor VPN certificate—not a fresh IdP login—as the remote-access foothold.',partial:'You identify the former contractor but do not explain how access survived IdP disablement.',missing:'Your theory does not establish the 03:48 entry mechanism.'},
      {label:'Cross-domain path',groups:[['rule 27','K8S-MGMT'],['dashboard-runtime'],['secrets'],['registry-deploy-token'],['objectstore-export-key'],['sha256:COLD50'],['6240']],supported:'You reconstruct the evidence-backed chain from VPN routing to Kubernetes secret access, registry tag mutation, unsigned workload deployment, and object-store reads.',partial:'You identify several correct components but leave major transitions unsupported or unexplained.',missing:'The incident is not reconstructed across network, workload identity, registry, and storage evidence.'},
      {label:'Evidence discipline',groups:[['admin','failed','unrelated','no success'],['print server','unrelated','no traffic']],supported:'You explicitly separate the failed admin logins and old print-server finding from the demonstrated compromise chain.',partial:'You avoid one distractor but still treat another unrelated finding as causal.',missing:'Your conclusion is driven by unrelated alerts rather than the correlated timeline.'},
      {label:'Impact',groups:[['6240'],['read','download'],['no delete','no write'],['inventory records']],supported:'You state the demonstrated object-store impact precisely without claiming unsupported destructive activity.',partial:'You identify data access but omit scope or overstate what the attacker did.',missing:'The final impact is not tied to storage audit evidence.'},
      {label:'Containment + redesign',groups:[['preserve'],['revoke','certificate'],['remove','rule 27'],['RBAC','secret'],['rotate','token','key'],['digest','provenance'],['offboarding','revocation']],supported:'You break every active link in the observed chain and redesign identity, network, workload, secret, and release boundaries to prevent recurrence.',partial:'You contain part of the path but leave at least one major trust boundary reusable.',missing:'The proposed response would not reliably stop the demonstrated cross-domain attack path.'}
    ]
  },

  {
    id:'C051', title:'Inherited Authority', subtitle:'A helpdesk delegation quietly reaches a privileged server group.', tier:'Advanced directory attack-path assessment',
    brief:'During an authorized Active Directory review, a helpdesk operator appears to have no direct administrator membership. A graph of delegated rights suggests the operator can still alter a group that eventually controls production servers. Prove or disprove the path, show the minimum impact, and redesign the delegation without breaking password-reset duties.',
    environment:'Alder Manufacturing / fictional directory snapshot',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Operator identity','Directory','helpdesk.jules is a member of Helpdesk-L1 only.','No direct membership exists in Server-Admins, Domain Admins, or other privileged groups.'),
      e('ev2','Delegated ACL','Directory ACL','Helpdesk-L1 has WriteMembers on App-Support.','The ACE was added during a migration and inherited from an old OU delegation template.'),
      e('ev3','Nested group','Group graph','App-Support is nested inside Tier1-Server-Admins.','Tier1-Server-Admins grants local administrator rights on APP-PROD-01 and APP-PROD-02 through policy.'),
      e('ev4','Safe proof account','Assessment scope','trace-proof is an inert training account approved for membership tests.','The rules permit adding/removing trace-proof only; production identities must not be modified.'),
      e('ev5','Password-reset duty','Business requirement','Helpdesk-L1 legitimately needs ResetPassword on standard employee accounts.','The team does not need group-management rights for application or server administration groups.'),
      e('ev6','Audit gap','Directory logging','Group membership changes are logged, but no alert exists for changes to groups nested into privileged server roles.','A noisy focus on Domain Admins would miss this path.')
    ],
    logs:[
      {id:'acl',name:'Directory ACL snapshot',text:`principal=Helpdesk-L1 target=OU=Users right=ResetPassword inherited=true\nprincipal=Helpdesk-L1 target=CN=App-Support right=WriteMembers inherited=true\nprincipal=App-Support memberOf=Tier1-Server-Admins\nprincipal=Tier1-Server-Admins policy=LocalAdmins:APP-PROD-01,APP-PROD-02`},
      {id:'audit',name:'Group audit',text:`12:10 actor=helpdesk.jules group=Printer-Support action=ADD member=user.aria\n12:14 actor=svc-directory group=App-Support action=SYNC\nNo alert rule currently evaluates transitive privilege of changed groups.`}
    ],
    terminal:[
      [/^help$/i,'Try: ad whoami helpdesk.jules, ad rights helpdesk.jules, ad acl App-Support, ad path helpdesk.jules Tier1-Server-Admins, ad effective App-Support, ad test-add trace-proof App-Support, ad test-remove trace-proof App-Support'],
      [/^ad whoami helpdesk\.jules$/i,'user=helpdesk.jules\ndirect_groups=Helpdesk-L1\nprivileged_direct_membership=NONE'],
      [/^ad rights helpdesk\.jules$/i,'via Helpdesk-L1:\nResetPassword -> standard employee OU\nWriteMembers -> App-Support (inherited)'],
      [/^ad acl App-Support$/i,'ACE principal=Helpdesk-L1 right=WriteMembers inherited=true source=Legacy-Helpdesk-Delegation'],
      [/^ad path helpdesk\.jules Tier1-Server-Admins$/i,'helpdesk.jules -> Helpdesk-L1 --WriteMembers--> App-Support --memberOf--> Tier1-Server-Admins -> LocalAdmins(APP-PROD-01,APP-PROD-02)'],
      [/^ad effective App-Support$/i,'transitive_effect=local administrator on APP-PROD-01, APP-PROD-02 via Tier1-Server-Admins'],
      [/^ad test-add trace-proof App-Support$/i,'SIMULATED CHANGE OK: trace-proof added to App-Support. Effective membership would include Tier1-Server-Admins. No production identity changed.'],
      [/^ad test-remove trace-proof App-Support$/i,'SIMULATED CHANGE OK: trace-proof removed. Directory returned to baseline.']
    ],
    actions:[
      {id:'a1',label:'Preserve ACL and nested-group evidence',description:'Export the relevant ACEs, inheritance source, group nesting, and server policy before changing delegation.',outcome:'The privilege path remains defensible after remediation.',quality:'good'},
      {id:'a2',label:'Remove Helpdesk-L1 WriteMembers from App-Support',description:'Keep password-reset delegation but remove unrelated group-management authority.',outcome:'Helpdesk can still reset ordinary user passwords but can no longer modify the privileged nested group.',quality:'good'},
      {id:'a3',label:'Add transitive privileged-group monitoring',description:'Alert when membership changes affect groups that lead to administrative rights, not just famous top-level groups.',outcome:'Future changes to hidden privilege paths become visible.',quality:'good'},
      {id:'a4',label:'Remove Helpdesk password-reset rights too',description:'Delete all helpdesk delegation to eliminate risk.',outcome:'The privilege path disappears, but legitimate support operations are unnecessarily broken.',quality:'bad'},
      {id:'a5',label:'Rename App-Support',description:'Make the group less obvious to attackers while keeping the same ACL and nesting.',outcome:'The effective privilege path is unchanged.',quality:'bad'}
    ],
    hints:['Start from effective rights, not group names. A harmless-looking group can become privileged through nesting.','Prove every edge: operator -> delegated right -> modifiable group -> nested privileged group -> server effect.','The redesign should remove only the dangerous authority while preserving the legitimate password-reset function.'],
    evaluation:[
      {label:'Privilege path',groups:[['helpdesk.jules'],['Helpdesk-L1'],['WriteMembers'],['App-Support'],['Tier1-Server-Admins'],['APP-PROD']],supported:'You reconstruct the complete transitive path from helpdesk delegation to production-server local administrator rights.',partial:'You identify a dangerous group permission but do not carry the path through nesting to server impact.',missing:'The effective privilege path is not established.'},
      {label:'Safe validation',groups:[['trace-proof'],['add','remove'],['safe','inert','approved']],supported:'You validate the right with the approved inert account and return the directory to baseline.',partial:'You describe how the right could be tested but omit the scoped proof or cleanup.',missing:'The assessment relies on assumption instead of a controlled proof.'},
      {label:'Least privilege',groups:[['remove','WriteMembers'],['keep','ResetPassword'],['monitor','transitive']],supported:'You remove the unnecessary group-write right while preserving helpdesk password-reset duties and improve monitoring of transitive privilege.',partial:'You remove the path but also break legitimate duties or omit detection improvements.',missing:'The proposed redesign does not preserve required function safely.'}
    ]
  },
  {
    id:'C052', title:'Memory Echo', subtitle:'An endpoint alert says a process touched LSASS. Decide whether credentials were actually at risk.', tier:'Endpoint telemetry + credential exposure investigation',
    brief:'EDR raises a high-severity alert on FIN-WS-22 for suspicious access to the Windows authentication process. Reconstruct what executed, determine whether a credential-material dump was created or moved, separate the confirmed facts from assumptions, then contain and harden the endpoint.',
    environment:'Northstar Finance / fictional Windows endpoint telemetry',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Process start','EDR','supportdiag.exe launched from C:\\Users\\Public\\Tools under user fin.lara.','The binary is unsigned and not part of the approved support toolkit.'),
      e('ev2','Sensitive process access','EDR','supportdiag.exe requested high-risk access to lsass.exe.','The event records PROCESS_VM_READ and QUERY_INFORMATION against PID 676.'),
      e('ev3','Dump artifact','File telemetry','C:\\Users\\Public\\diag_0914.dmp was created 11 seconds later.','Size: 84 MB. The file was created by supportdiag.exe.'),
      e('ev4','Archive movement','File + network','diag_0914.dmp was added to support_bundle.zip, then uploaded to fileshare-temp.test.','The destination is not approved by Northstar and first appeared in DNS logs today.'),
      e('ev5','Session context','Identity','fin.lara had an interactive session; an IT admin had used remote support on the device two hours earlier.','The investigation must not assume which credentials were resident in memory without evidence.'),
      e('ev6','Protection state','Endpoint config','Credential Guard is disabled on this finance workstation.','The baseline requires it on compatible finance endpoints, but deployment coverage is incomplete.')
    ],
    logs:[
      {id:'edr',name:'EDR process timeline',text:`10:42:01 user=fin.lara process=supportdiag.exe parent=explorer.exe path=C:\\Users\\Public\\Tools\\supportdiag.exe signer=NONE\n10:42:07 process=supportdiag.exe target=lsass.exe rights=PROCESS_VM_READ,QUERY_INFORMATION\n10:42:18 file_create=C:\\Users\\Public\\diag_0914.dmp size=84MB creator=supportdiag.exe\n10:43:02 process=7z.exe parent=supportdiag.exe output=C:\\Users\\Public\\support_bundle.zip`},
      {id:'network',name:'Network telemetry',text:`10:44:10 host=FIN-WS-22 dns=fileshare-temp.test answer=198.51.100.188\n10:44:16 host=FIN-WS-22 dst=198.51.100.188:443 bytes_out=88100412 process=supportdiag.exe`}
    ],
    terminal:[
      [/^help$/i,'Try: host timeline FIN-WS-22, process tree supportdiag.exe, edr access lsass.exe, file inspect diag_0914.dmp, net correlate supportdiag.exe, security credential-guard FIN-WS-22'],
      [/^host timeline FIN-WS-22$/i,'10:42 supportdiag.exe start -> LSASS access -> diag_0914.dmp create -> archive -> 10:44 outbound upload'],
      [/^process tree supportdiag\.exe$/i,'explorer.exe (fin.lara)\n  └─ supportdiag.exe [unsigned]\n      └─ 7z.exe -> support_bundle.zip'],
      [/^edr access lsass\.exe$/i,'source=supportdiag.exe target=lsass.exe rights=PROCESS_VM_READ,QUERY_INFORMATION classification=credential-access-like'],
      [/^file inspect diag_0914\.dmp$/i,'size=84MB\ncreator=supportdiag.exe\ncontent_class=process memory dump\ntraining note: raw credential material is not exposed in this simulation'],
      [/^net correlate supportdiag\.exe$/i,'fileshare-temp.test -> 198.51.100.188\nbytes_out=88,100,412\nprocess=supportdiag.exe\napproved_destination=false'],
      [/^security credential-guard FIN-WS-22$/i,'CredentialGuard=DISABLED\nBaseline=REQUIRED where compatible\nCoverage exception ticket=NONE']
    ],
    actions:[
      {id:'a1',label:'Isolate FIN-WS-22 after preserving volatile telemetry',description:'Retain EDR/process/network evidence, then prevent further outbound communication.',outcome:'The endpoint is contained without losing the key timeline.',quality:'good'},
      {id:'a2',label:'Invalidate credentials used on the workstation during the exposure window',description:'Rotate affected user/admin credentials based on confirmed session records and investigate associated sessions.',outcome:'Potentially exposed credentials from the affected window are no longer trusted.',quality:'good'},
      {id:'a3',label:'Enable Credential Guard where supported',description:'Bring the endpoint back to the finance security baseline and audit similar coverage gaps.',outcome:'Credential material is better isolated from ordinary user-mode processes.',quality:'good'},
      {id:'a4',label:'Claim every domain credential was stolen',description:'Treat LSASS access as proof that every possible credential was successfully recovered.',outcome:'The report overstates evidence and makes scoping less reliable.',quality:'bad'},
      {id:'a5',label:'Delete the dump before collecting metadata',description:'Remove the suspicious file immediately without preserving its metadata or related telemetry.',outcome:'Containment is faster but evidence supporting creation, size, and provenance is weakened.',quality:'bad'}
    ],
    hints:['An LSASS access alert is important, but your conclusion should follow the timeline: process start, requested rights, dump creation, archive, and outbound transfer.','Separate “credential material was placed at risk” from “I can prove exactly which secrets were recovered.” The second claim needs stronger evidence.','Contain the endpoint, invalidate credentials tied to the exposure window, and fix the control gap that allowed ordinary process access to sensitive authentication memory.'],
    evaluation:[
      {label:'Execution chain',groups:[['supportdiag.exe'],['lsass'],['diag_0914.dmp'],['support_bundle.zip'],['fileshare-temp.test']],supported:'You reconstruct the process-to-memory-dump-to-upload sequence using endpoint and network telemetry.',partial:'You identify suspicious LSASS access but omit either the dump artifact or outbound movement.',missing:'The endpoint timeline is not reconstructed.'},
      {label:'Evidence discipline',groups:[['at risk','exposed','credential material'],['not prove','cannot prove','which credentials','every']],supported:'You distinguish confirmed credential-memory exposure from unsupported claims about exactly which credentials were recovered.',partial:'You recognize uncertainty but still overstate the scope of credential theft.',missing:'You treat the alert as proof of facts the telemetry does not establish.'},
      {label:'Response',groups:[['isolate'],['rotate','invalidate'],['Credential Guard'],['preserve']],supported:'You preserve evidence, isolate the host, invalidate credentials from the relevant window, and close the credential-isolation gap.',partial:'You contain the host but omit either credential response or baseline hardening.',missing:'The response leaves the demonstrated exposure path reusable.'}
    ]
  },
  {
    id:'C053', title:'The Quiet Parent', subtitle:'A trusted Windows utility launches an unexpected child process after every login.', tier:'Advanced endpoint persistence hunting',
    brief:'Several engineering laptops show no obvious malware file, but EDR records the same unusual process chain shortly after user logon. Determine the persistence mechanism, identify the controlling artifact, prove the scope, and remove it without destroying the evidence needed to explain how it survived reboots.',
    environment:'Aster Engineering / fictional Windows fleet',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Repeated process chain','EDR','userinit.exe -> explorer.exe -> wscript.exe -> updater.vbs occurs within 20 seconds of login on three hosts.','The script path is C:\\ProgramData\\AsterCache\\updater.vbs.'),
      e('ev2','Registry value','Endpoint artifact','HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run contains AsterUpdate = wscript.exe C:\\ProgramData\\AsterCache\\updater.vbs.','The value exists in three affected user profiles and was created within the same 12-minute window.'),
      e('ev3','Script behavior','Static inspection','updater.vbs launches powershell.exe with an encoded-looking argument that resolves in the simulation to a request for config.json from sync-node.test.','The training environment does not execute arbitrary PowerShell; decoded intent is provided as evidence.'),
      e('ev4','Scope','Fleet query','ENG-LT-14, ENG-LT-19, and ENG-LT-27 share the same Run value and script hash.','Other engineering endpoints do not contain the value.'),
      e('ev5','Installer history','Software deployment','All three affected users installed the same unofficial diagram-template pack yesterday.','The installer wrote the Run value under each user context.'),
      e('ev6','Distractor service','Host config','A legitimate Aster Update service runs as SYSTEM on every engineering laptop.','Its signed binary, path, and hash match the approved baseline and are not linked to updater.vbs.')
    ],
    logs:[
      {id:'process',name:'EDR process chains',text:`ENG-LT-14 08:01 userinit.exe > explorer.exe > wscript.exe C:\\ProgramData\\AsterCache\\updater.vbs > powershell.exe\nENG-LT-19 08:05 userinit.exe > explorer.exe > wscript.exe C:\\ProgramData\\AsterCache\\updater.vbs > powershell.exe\nENG-LT-27 08:11 userinit.exe > explorer.exe > wscript.exe C:\\ProgramData\\AsterCache\\updater.vbs > powershell.exe`},
      {id:'registry',name:'Registry audit',text:`07:42 ENG-LT-14 user=eng.mika key=HKCU...\\Run value=AsterUpdate creator=TemplatePackSetup.exe\n07:49 ENG-LT-19 user=eng.roy key=HKCU...\\Run value=AsterUpdate creator=TemplatePackSetup.exe\n07:54 ENG-LT-27 user=eng.ina key=HKCU...\\Run value=AsterUpdate creator=TemplatePackSetup.exe`}
    ],
    terminal:[
      [/^help$/i,'Try: fleet hunt AsterUpdate, reg query ENG-LT-14 Run, process chain ENG-LT-14, hash updater.vbs, script inspect updater.vbs, installer trace TemplatePackSetup.exe, service verify AsterUpdateSvc'],
      [/^fleet hunt AsterUpdate$/i,'ENG-LT-14 FOUND\nENG-LT-19 FOUND\nENG-LT-27 FOUND\nother_hosts=0'],
      [/^reg query ENG-LT-14 Run$/i,'AsterUpdate = wscript.exe C:\\ProgramData\\AsterCache\\updater.vbs'],
      [/^process chain ENG-LT-14$/i,'userinit.exe -> explorer.exe -> wscript.exe updater.vbs -> powershell.exe'],
      [/^hash updater\.vbs$/i,'sha256=TRACE53E0F8 SAME_ON=ENG-LT-14,ENG-LT-19,ENG-LT-27'],
      [/^script inspect updater\.vbs$/i,'behavior=launches PowerShell to request https://sync-node.test/config.json\nraw executable payload not provided in training simulation'],
      [/^installer trace TemplatePackSetup\.exe$/i,'unsigned=true\nsource=downloads\nwrote=HKCU Run:AsterUpdate\nwrote=C:\\ProgramData\\AsterCache\\updater.vbs'],
      [/^service verify AsterUpdateSvc$/i,'signer=Aster Engineering\npath=C:\\Program Files\\Aster\\Updater\\service.exe\nhash=BASELINE_MATCH\nrelationship_to_updater.vbs=NONE']
    ],
    actions:[
      {id:'a1',label:'Export the Run value, script, hashes, and process telemetry',description:'Preserve the persistence artifact and execution chain before cleanup.',outcome:'The mechanism and scope remain explainable after remediation.',quality:'good'},
      {id:'a2',label:'Remove the malicious Run value and quarantine updater.vbs on affected profiles',description:'Break the logon persistence after evidence capture.',outcome:'The script no longer launches at user sign-in on the three affected hosts.',quality:'good'},
      {id:'a3',label:'Block the unofficial template-pack hash and source',description:'Prevent the same installer from creating new persistence while the source is investigated.',outcome:'Additional endpoints cannot install the known unwanted package.',quality:'good'},
      {id:'a4',label:'Disable the legitimate Aster Update service fleet-wide',description:'Respond to the similar name instead of the evidence-backed artifact.',outcome:'Production update functionality breaks while the real HKCU persistence remains.',quality:'bad'},
      {id:'a5',label:'Add a hunt for unusual logon-child chains and new Run values',description:'Detect future persistence that follows the same behavioral pattern, not only this exact filename.',outcome:'Coverage improves beyond a single hash or script path.',quality:'good'}
    ],
    hints:['Follow the process parentage backward, then ask what causes wscript.exe to start after each logon.','The shared registry value and script hash explain persistence and scope. The similarly named signed service is a distractor unless evidence connects it.','Good remediation removes the artifact, blocks the installer source, and adds behavior-focused hunting so renaming the script does not defeat detection.'],
    evaluation:[
      {label:'Persistence mechanism',groups:[['HKCU','Run'],['AsterUpdate'],['wscript'],['updater.vbs']],supported:'You identify the per-user Run value as the persistence mechanism that launches the script after logon.',partial:'You identify the script but not what reliably starts it after reboot/logon.',missing:'The persistence mechanism is not established.'},
      {label:'Scope + origin',groups:[['ENG-LT-14'],['ENG-LT-19'],['ENG-LT-27'],['TemplatePackSetup']],supported:'You scope the three affected hosts and connect creation of the shared artifact to the unofficial template installer.',partial:'You find affected systems but do not establish the common origin.',missing:'The case remains a single-host observation.'},
      {label:'Remediation',groups:[['preserve'],['remove','Run'],['quarantine'],['block','installer'],['hunt','behavior']],supported:'You preserve evidence, remove persistence, control the installer source, and add reusable behavioral detection.',partial:'You clean the known hosts but omit prevention or future hunting.',missing:'The proposed response does not reliably eliminate or detect recurrence.'}
    ]
  },
  {
    id:'C054', title:'Role Too Large', subtitle:'A cloud VM only needs one storage bucket, but its workload identity can reach far more.', tier:'Cloud workload identity assessment',
    brief:'An authorized cloud review finds a reporting VM with a broad instance role. The application needs to read one report bucket, yet the attached role can enumerate secrets and modify compute resources. Validate effective permissions safely, determine realistic blast radius, and redesign the role around the workload’s actual job.',
    environment:'Meridian Cloud / fictional compute + IAM control plane',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Workload purpose','Architecture','report-vm-02 generates dashboards from s3://meridian-reports-prod/input/.','The service reads report objects and writes rendered output only to s3://meridian-reports-prod/rendered/.'),
      e('ev2','Attached role','Cloud IAM','report-vm-02 uses role ReportWorkerLegacy.','The role predates the current reporting application.'),
      e('ev3','Effective policy','IAM simulator','ReportWorkerLegacy allows storage:*, secrets:List/Get, compute:Describe/Start/Stop on * resources.','No production task requires secrets access or compute lifecycle control.'),
      e('ev4','Metadata posture','VM config','Instance metadata requires session-bound v2 tokens; v1 requests are disabled.','The metadata hardening is good, but it does not reduce permissions of credentials legitimately issued to the workload.'),
      e('ev5','Safe validation','Assessment scope','The training IAM simulator permits permission checks and access to a decoy object only.','Do not change real-like compute state or retrieve secret values; prove authorization with simulation.'),
      e('ev6','Application logs','Workload telemetry','In the last 30 days the application used only report-bucket GetObject, PutObject, and ListBucket equivalents.','No legitimate use of secrets or compute control appears.')
    ],
    logs:[
      {id:'usage',name:'Role usage',text:`30d role=ReportWorkerLegacy\nused storage:ListBucket resource=meridian-reports-prod\nused storage:GetObject resource=meridian-reports-prod/input/*\nused storage:PutObject resource=meridian-reports-prod/rendered/*\nunused_allowed secrets:List,secrets:Get,compute:Describe,compute:Start,compute:Stop`},
      {id:'metadata',name:'Metadata configuration',text:`instance=report-vm-02\nmetadata_tokens=required\nmetadata_v1=disabled\nrole=ReportWorkerLegacy`}
    ],
    terminal:[
      [/^help$/i,'Try: cloud role report-vm-02, iam simulate ReportWorkerLegacy storage:GetObject meridian-reports-prod/input/sample.csv, iam simulate ReportWorkerLegacy secrets:Get decoy/reporting-test, iam simulate ReportWorkerLegacy compute:Stop vm-decoy, usage ReportWorkerLegacy 30d, metadata report-vm-02'],
      [/^cloud role report-vm-02$/i,'instance=report-vm-02\nrole=ReportWorkerLegacy'],
      [/^iam simulate ReportWorkerLegacy storage:GetObject meridian-reports-prod\/input\/sample\.csv$/i,'decision=ALLOW\nrequired_by_workload=true'],
      [/^iam simulate ReportWorkerLegacy secrets:Get decoy\/reporting-test$/i,'decision=ALLOW\nrequired_by_workload=false\nvalue=NOT_RETURNED (simulation only)'],
      [/^iam simulate ReportWorkerLegacy compute:Stop vm-decoy$/i,'decision=ALLOW\nrequired_by_workload=false\nstate_change=NOT_EXECUTED (simulation only)'],
      [/^usage ReportWorkerLegacy 30d$/i,'USED: storage List/Get/Put on meridian-reports-prod\nNOT USED: secrets List/Get, compute Describe/Start/Stop'],
      [/^metadata report-vm-02$/i,'IMDSv2/token-required=true\nIMDSv1=false\nThis protects metadata access conditions but does not make an overprivileged role least-privilege.']
    ],
    actions:[
      {id:'a1',label:'Create a purpose-built ReportWorker role',description:'Allow only ListBucket on the report bucket, read from input/, and write to rendered/.',outcome:'The application keeps its required workflow without secrets or compute-management authority.',quality:'good'},
      {id:'a2',label:'Attach the new role and monitor denied calls during rollout',description:'Deploy least privilege with observability and rollback readiness.',outcome:'Normal reporting succeeds; unexpected permissions requests become visible instead of silently allowed.',quality:'good'},
      {id:'a3',label:'Keep IMDSv2 and call the role secure enough',description:'Rely on hardened metadata delivery while retaining broad workload permissions.',outcome:'Credential delivery is better protected, but any compromise of the workload still receives excessive authority.',quality:'bad'},
      {id:'a4',label:'Remove all instance-role access and embed a static storage key',description:'Avoid role complexity by placing long-lived credentials in application configuration.',outcome:'The workload gains a harder-to-rotate secret and loses the security benefits of managed identity.',quality:'bad'},
      {id:'a5',label:'Add periodic permission-usage review',description:'Compare granted permissions with observed workload behavior and architecture requirements.',outcome:'Privilege drift is more likely to be caught before legacy permissions accumulate again.',quality:'good'}
    ],
    hints:['Do not confuse “metadata delivery is hardened” with “the delivered identity is appropriately scoped.” They are separate controls.','Use the permission simulator to prove unnecessary authority without performing destructive actions. Then compare grants to 30-day actual use.','The target role should express the application’s exact data path: list the bucket, read input/, write rendered/, and little else.'],
    evaluation:[
      {label:'Effective permissions',groups:[['ReportWorkerLegacy'],['secrets'],['compute'],['storage']],supported:'You demonstrate that the VM role grants secrets and compute authority beyond the reporting workload’s storage needs.',partial:'You call the role broad but do not prove specific unnecessary permissions.',missing:'The privilege excess is not established.'},
      {label:'Control distinction',groups:[['IMDSv2','metadata'],['does not','still','role'],['least privilege']],supported:'You correctly explain that strong metadata protections do not compensate for an overprivileged workload identity.',partial:'You mention both controls but blur their distinct purposes.',missing:'You treat metadata hardening as sufficient remediation.'},
      {label:'Redesign',groups:[['input'],['rendered'],['List','Get','Put'],['usage review','monitor']],supported:'You replace the legacy role with resource-scoped permissions matching the application’s real read/write paths and add ongoing privilege review.',partial:'You narrow the role but leave broad resource scope or omit safe rollout/monitoring.',missing:'The redesigned access remains unnecessarily broad.'}
    ]
  },
  {
    id:'C055', title:'Trusted Too Far', subtitle:'An application trusts authentication headers from requests that did not come through its proxy.', tier:'Reverse proxy + identity boundary assessment',
    brief:'A staging application is designed to trust X-Authenticated-User only when the corporate reverse proxy sets it. A network change accidentally exposed the app directly to an internal user VLAN. Determine whether the application can distinguish proxy-originated requests, demonstrate the authorization impact with a decoy identity, and redesign both the network and application trust boundary.',
    environment:'Harbor Portal / fictional reverse proxy + application',
    tools:['overview','browser','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Normal architecture','Diagram','Users -> auth-proxy.harbor.test -> portal-app:8080.','The proxy authenticates the user and replaces inbound identity headers before forwarding.'),
      e('ev2','Direct route','Firewall','10.52.40.0/24 user VLAN can reach portal-app:8080 due temporary migration rule 18.','The rule was meant for health checks but covers the entire user subnet.'),
      e('ev3','Application trust','Config','Portal trusts X-Authenticated-User whenever the header is present.','It does not verify the source address, mTLS identity, or a cryptographic assertion from the proxy.'),
      e('ev4','Proxy behavior','Config','The proxy strips client-supplied X-Authenticated-User and inserts the authenticated subject.','Normal proxied traffic is not vulnerable to simple header injection at the external edge.'),
      e('ev5','Safe decoy account','Assessment scope','user=trace.viewer and decoy-admin are synthetic training identities.','Validation must use only these identities and the staging environment.'),
      e('ev6','Admin endpoint','Application','/admin/audit is limited to admin subjects by the app’s identity mapping.','If the trusted header is spoofable on a direct route, the endpoint may be reachable without real proxy authentication.')
    ],
    browser:[
      {id:'b1',url:'https://auth-proxy.harbor.test/portal',title:'Harbor Portal',html:`<div class="fake-site"><h2>Harbor Portal</h2><div class="box">Authenticated through corporate proxy.<br>User: trace.viewer<br>Role: viewer</div></div>`},
      {id:'b2',url:'http://portal-app:8080/health',title:'Direct app health',html:`<div class="fake-site"><h2>portal-app</h2><div class="box">status=ok<br>Direct staging route is reachable from assessment subnet.</div></div>`}
    ],
    logs:[
      {id:'firewall',name:'Firewall rules',text:`10 ALLOW src=PROXY-SUBNET dst=portal-app:8080\n18 ALLOW src=10.52.40.0/24 dst=portal-app:8080 note="migration health checks"\n90 DENY src=ANY dst=portal-app:8080`},
      {id:'app',name:'Application requests',text:`09:10 src=10.50.1.20 path=/portal header_user=trace.viewer result=200 via_proxy=true\n09:22 src=10.52.40.71 path=/health header_user=- result=200 via_proxy=false`}
    ],
    terminal:[
      [/^help$/i,'Try: route test 10.52.40.71 portal-app 8080, proxy headers trace.viewer, app trust-config, http direct /admin/audit user=trace.viewer, http direct /admin/audit user=decoy-admin, http proxy /admin/audit user=trace.viewer'],
      [/^route test 10.52.40.71 portal-app 8080$/i,'ALLOW via firewall rule 18'],
      [/^proxy headers trace\.viewer$/i,'client X-Authenticated-User=REMOVED\ninserted X-Authenticated-User=trace.viewer\nsource_to_app=10.50.1.20'],
      [/^app trust-config$/i,'identity_source=X-Authenticated-User\nsource_validation=NONE\nproxy_mTLS=NONE\nsigned_assertion=NONE'],
      [/^http direct \/admin\/audit user=trace\.viewer$/i,'HTTP 403\nsource=10.52.40.71\ntrusted_header=trace.viewer\nrole=viewer'],
      [/^http direct \/admin\/audit user=decoy-admin$/i,'HTTP 200\nsource=10.52.40.71\ntrusted_header=decoy-admin\nrole=admin\nSIMULATION: decoy audit data only'],
      [/^http proxy \/admin\/audit user=trace\.viewer$/i,'HTTP 403\nproxy authenticated trace.viewer and replaced identity header\nrole=viewer']
    ],
    actions:[
      {id:'a1',label:'Remove direct user-VLAN access to portal-app:8080',description:'Limit application ingress to the reverse-proxy network and explicit health-monitor sources.',outcome:'Ordinary user subnets can no longer bypass the authentication proxy.',quality:'good'},
      {id:'a2',label:'Make the application authenticate the proxy assertion',description:'Use a verifiable proxy identity mechanism such as mTLS-bound ingress plus signed/validated identity context instead of trusting any header.',outcome:'A direct request cannot become authenticated merely by supplying a header.',quality:'good'},
      {id:'a3',label:'Keep the direct route but rename the header',description:'Change X-Authenticated-User to X-Harbor-Identity.',outcome:'Anyone who discovers the new header can still assert an arbitrary identity on the bypass route.',quality:'bad'},
      {id:'a4',label:'Preserve firewall, proxy, and app request evidence',description:'Capture the trust-boundary failure and the safe decoy reproduction before remediation.',outcome:'The bypass mechanism remains demonstrable after the route is closed.',quality:'good'},
      {id:'a5',label:'Add regression tests for direct-origin requests',description:'Verify that non-proxy sources are rejected even when they supply identity headers.',outcome:'Future network or application changes are less likely to silently recreate the bypass.',quality:'good'}
    ],
    hints:['There are two controls to examine: who can reach the app directly, and why the app believes an identity header. Either one can become a bypass if the other is weak.','Compare a proxied viewer request with a direct request that supplies the decoy admin identity. The proof should stay inside the staging/decoy scope.','Strong remediation closes the bypass route and gives the application a way to verify that identity context really came from the trusted proxy.'],
    evaluation:[
      {label:'Bypass proof',groups:[['rule 18'],['direct'],['decoy-admin'],['200']],supported:'You demonstrate that the user VLAN can reach the app directly and that a decoy admin identity header is accepted on that bypass path.',partial:'You identify either direct reachability or blind header trust but do not safely prove the authorization impact.',missing:'The authentication bypass is not established.'},
      {label:'Root cause',groups:[['header','trust'],['source','validation'],['proxy'],['network']],supported:'You identify the combined trust failure: direct network exposure plus an application that does not authenticate the origin of identity headers.',partial:'You focus on only the firewall or only the application header behavior.',missing:'The trust boundary is misidentified.'},
      {label:'Defense in depth',groups:[['limit','ingress'],['mTLS','signed','validated'],['regression']],supported:'You close direct ingress, make proxy identity verifiable, and add a regression test for bypass attempts.',partial:'You fix one layer but leave the other capable of recreating the same class of failure.',missing:'The proposed fix relies on obscurity or a single fragile control.'}
    ]
  },

  {
    id:'C056', title:'One Extra Key', subtitle:'A Linux admin account has one SSH key nobody recognizes.', tier:'Linux persistence + access-control investigation',
    brief:'A hardened Linux application server shows no unusual packages or services, but an access review finds an extra public key in an administrator account. Determine when and how the key appeared, identify whether it was used, preserve attribution evidence, and redesign administrative SSH access so a single forgotten key cannot silently persist.',
    environment:'Cedar Apps / fictional Linux server snapshot',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Authorized keys','Filesystem','/home/opsadmin/.ssh/authorized_keys contains three keys; two match the inventory, one labeled temp-migration does not.','Unknown key fingerprint: SHA256:TRACE56MIGRATE.'),
      e('ev2','File metadata','Filesystem','authorized_keys changed at 2026-09-11 22:14.','Shell history and sudo audit show contractor account migrate.sam edited the file at the same time.'),
      e('ev3','SSH authentication','Auth log','The unknown key successfully authenticated as opsadmin twice after the migration ended.','Source addresses: 203.0.113.56 and 203.0.113.57; neither belongs to the approved admin VPN range.'),
      e('ev4','Migration closeout','Change record','Contractor migrate.sam was offboarded on September 12.','The closeout checklist disabled the contractor account but did not inventory or remove keys the contractor had installed for other accounts.'),
      e('ev5','SSH daemon policy','Config','PasswordAuthentication no; PermitRootLogin no; public-key authentication yes.','The daemon configuration is reasonable, but decentralized key lifecycle creates persistence risk.'),
      e('ev6','Approved keys','Inventory','opsadmin should have only fingerprints SHA256:OPS-A and SHA256:OPS-B.','Both approved keys map to current named administrators.')
    ],
    logs:[
      {id:'auth',name:'SSH auth log',text:`Sep 11 22:14:06 sudo actor=migrate.sam command="vi /home/opsadmin/.ssh/authorized_keys"\nSep 13 01:12:44 sshd user=opsadmin method=publickey fingerprint=SHA256:TRACE56MIGRATE src=203.0.113.56 result=ACCEPT\nSep 13 02:08:19 sshd user=opsadmin method=publickey fingerprint=SHA256:TRACE56MIGRATE src=203.0.113.57 result=ACCEPT`},
      {id:'inventory',name:'SSH key inventory',text:`opsadmin SHA256:OPS-A owner=mina.r status=ACTIVE\nopsadmin SHA256:OPS-B owner=joel.p status=ACTIVE\nopsadmin SHA256:TRACE56MIGRATE owner=UNKNOWN status=NOT_IN_INVENTORY`}
    ],
    terminal:[
      [/^help$/i,'Try: ssh keys opsadmin, stat authorized_keys, audit file authorized_keys, ssh usage SHA256:TRACE56MIGRATE, account show migrate.sam, sshd policy'],
      [/^ssh keys opsadmin$/i,'SHA256:OPS-A label=mina-admin\nSHA256:OPS-B label=joel-admin\nSHA256:TRACE56MIGRATE label=temp-migration [UNINVENTORIED]'],
      [/^stat authorized_keys$/i,'path=/home/opsadmin/.ssh/authorized_keys\nmtime=2026-09-11 22:14:06\nowner=opsadmin mode=0600'],
      [/^audit file authorized_keys$/i,'22:14:06 actor=migrate.sam via sudo edited /home/opsadmin/.ssh/authorized_keys'],
      [/^ssh usage SHA256:TRACE56MIGRATE$/i,'ACCEPT Sep13 01:12 src=203.0.113.56\nACCEPT Sep13 02:08 src=203.0.113.57\napproved_admin_vpn=false'],
      [/^account show migrate\.sam$/i,'type=contractor\nstatus=DISABLED Sep12\nkey_cleanup_workflow=NONE'],
      [/^sshd policy$/i,'PasswordAuthentication=no\nPermitRootLogin=no\nPubkeyAuthentication=yes\nAuthorizedKeysFile=.ssh/authorized_keys']
    ],
    actions:[
      {id:'a1',label:'Preserve authorized_keys, fingerprints, audit, and SSH logs',description:'Capture the key material and usage metadata before removal.',outcome:'The persistence mechanism and successful use remain attributable after containment.',quality:'good'},
      {id:'a2',label:'Remove the unapproved key and terminate related sessions',description:'Delete only SHA256:TRACE56MIGRATE after preservation and end sessions authenticated with it.',outcome:'The unknown key can no longer authenticate as opsadmin.',quality:'good'},
      {id:'a3',label:'Move privileged SSH keys to managed lifecycle control',description:'Require named ownership, approval, expiry/review, and centralized removal during offboarding.',outcome:'Future contractor or temporary keys cannot silently outlive their business purpose.',quality:'good'},
      {id:'a4',label:'Enable passwords again as a fallback',description:'Make access easier if managed key processes cause trouble.',outcome:'A second weaker authentication path is introduced without solving key lifecycle.',quality:'bad'},
      {id:'a5',label:'Rotate approved administrator keys just because an unknown key existed',description:'Replace every known-good key without evidence it was compromised.',outcome:'Administrative disruption increases while the root lifecycle failure remains unless the unknown key is specifically removed and managed.',quality:'bad'}
    ],
    hints:['The suspicious artifact is not merely “an extra key.” Establish who changed the file and whether that key actually authenticated afterward.','Disabling the contractor account does not invalidate a public key placed into a different account’s authorized_keys file.','Contain the specific key, preserve its usage evidence, then fix the lifecycle process that allowed temporary access to persist beyond offboarding.'],
    evaluation:[
      {label:'Persistence + use',groups:[['TRACE56MIGRATE'],['migrate.sam'],['authorized_keys'],['203.0.113.56','203.0.113.57'],['ACCEPT','authenticated']],supported:'You tie the unapproved key to the contractor-era edit and prove it was later used for successful opsadmin authentication.',partial:'You find the extra key but do not establish either creation context or later use.',missing:'The SSH persistence mechanism is not established.'},
      {label:'Containment',groups:[['preserve'],['remove','key'],['session']],supported:'You preserve the relevant key/log evidence, remove the unauthorized key, and terminate sessions derived from it.',partial:'You remove the key but omit evidence preservation or active-session handling.',missing:'The unauthorized access path remains usable.'},
      {label:'Lifecycle redesign',groups:[['managed','centralized'],['owner','ownership'],['expiry','review'],['offboarding']],supported:'You replace ad-hoc privileged keys with a managed ownership/review/offboarding lifecycle.',partial:'You improve documentation but leave key removal dependent on manual memory.',missing:'The process can recreate the same persistence failure.'}
    ]
  },
  {
    id:'C057', title:'Policy From a Share', subtitle:'A domain policy runs a startup script from a location ordinary users can modify.', tier:'Windows policy-distribution hardening assessment',
    brief:'An authorized domain review finds a computer startup policy that launches \\files\\deploy\\baseline.cmd as SYSTEM. The policy object itself is protected, but the deployment share may not be. Verify effective write permissions with a harmless marker file, determine the resulting privilege boundary, and redesign the software-distribution path.',
    environment:'Northstar Lab Domain / fictional GPO + file share',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Startup policy','Group Policy','GPO Workstation-Baseline runs \\files\\deploy\\baseline.cmd at computer startup.','Startup scripts execute under Local System on targeted workstations.'),
      e('ev2','Share permission','ACL','Domain Users have Change permission on \\files\\deploy.','The permission was added years ago so staff could upload printer packages.'),
      e('ev3','File permission','NTFS ACL','baseline.cmd inherits Modify for Domain Users.','The file has no signature validation or hash pinning before execution.'),
      e('ev4','Scope','GPO','Workstation-Baseline applies to 146 standard workstations.','Servers are excluded.'),
      e('ev5','Safe proof rule','Assessment scope','You may create/delete \\files\\deploy\\trace57.txt only.','Do not modify baseline.cmd or any executable script in the training scenario.'),
      e('ev6','Legitimate requirement','Operations','Users no longer need write access to the deployment root; printer uploads moved to \\files\\printer-drop.','The legacy ACL is unnecessary.')
    ],
    logs:[
      {id:'gpo',name:'GPO details',text:`GPO=Workstation-Baseline\nComputer Startup Script=\\\\files\\deploy\\baseline.cmd\nTarget=Workstations-Standard count=146\nExecutionContext=LOCAL SYSTEM`},
      {id:'acl',name:'Share + NTFS ACL',text:`share \\\\files\\deploy Domain Users=CHANGE\nntfs D:\\deploy Domain Users=MODIFY inherited\nfile baseline.cmd inherits Domain Users=MODIFY`}
    ],
    terminal:[
      [/^help$/i,'Try: gpo show Workstation-Baseline, share acl \\\\files\\deploy, file acl baseline.cmd, share test-write trace57.txt, share cleanup trace57.txt, gpo scope Workstation-Baseline'],
      [/^gpo show Workstation-Baseline$/i,'startup_script=\\\\files\\deploy\\baseline.cmd\ncontext=LOCAL SYSTEM\ntarget=Workstations-Standard'],
      [/^share acl \\\\files\\deploy$/i,'Domain Users=CHANGE\nIT-Deployment=FULL\nEveryone=NONE'],
      [/^file acl baseline\.cmd$/i,'SYSTEM=FULL\nIT-Deployment=MODIFY\nDomain Users=MODIFY (inherited)'],
      [/^share test-write trace57\.txt$/i,'SUCCESS: harmless marker \\\\files\\deploy\\trace57.txt created as trace.user\nNo executable content modified.'],
      [/^share cleanup trace57\.txt$/i,'SUCCESS: trace57.txt removed; share returned to baseline.'],
      [/^gpo scope Workstation-Baseline$/i,'workstations=146\nservers=0\nstartup_context=SYSTEM']
    ],
    actions:[
      {id:'a1',label:'Preserve the GPO and effective share/file ACLs',description:'Export the policy reference and both permission layers before changing them.',outcome:'The privilege boundary can still be demonstrated after remediation.',quality:'good'},
      {id:'a2',label:'Remove Domain Users write/modify from the deployment path',description:'Restrict script content to a dedicated deployment-admin group and SYSTEM read access.',outcome:'Standard users can no longer change content executed as SYSTEM by policy.',quality:'good'},
      {id:'a3',label:'Move user-upload workflows to a separate non-executable share',description:'Keep printer/package intake away from trusted startup-script locations.',outcome:'Business upload needs no longer require weakening an executable policy path.',quality:'good'},
      {id:'a4',label:'Add integrity validation for startup content',description:'Use controlled publishing plus signing or approved hashes for policy-executed scripts.',outcome:'Unauthorized content changes are more likely to be rejected or detected.',quality:'good'},
      {id:'a5',label:'Hide the share from browsing',description:'Append $ to the share name but keep Domain Users Modify rights.',outcome:'The path is less visible but the privilege boundary remains unchanged.',quality:'bad'}
    ],
    hints:['The GPO ACL can be perfect while the content it launches is still writable. Follow the execution reference to the file share.','You do not need to replace a SYSTEM script to prove the risk. A harmless marker demonstrates ordinary-user write access; combine that with the documented execution context.','Separate upload/storage functions from trusted executable distribution, then protect both share and NTFS permissions and validate published content.'],
    evaluation:[
      {label:'Privilege boundary',groups:[['Domain Users'],['Modify','Change'],['baseline.cmd'],['SYSTEM'],['146']],supported:'You establish that standard users can modify content executed as SYSTEM across the 146-workstation policy scope.',partial:'You find a writable share but do not connect it to SYSTEM startup execution or scope.',missing:'The policy-distribution privilege boundary is not established.'},
      {label:'Safe proof',groups:[['trace57.txt'],['harmless','marker'],['cleanup','removed']],supported:'You validate write access with the allowed marker file and clean it up without altering executable policy content.',partial:'You describe a safe proof but omit cleanup or explicit scope compliance.',missing:'The validation approach would unnecessarily modify trusted executable content or provides no proof.'},
      {label:'Hardening',groups:[['remove','Domain Users'],['deployment-admin','IT-Deployment'],['separate','printer'],['sign','hash','integrity']],supported:'You separate upload and executable distribution, restrict write access, and add content-integrity controls.',partial:'You fix permissions but omit workflow separation or integrity protection.',missing:'The trusted startup content remains writable by ordinary users.'}
    ]
  },
  {
    id:'C058', title:'The Group That Crossed Clouds', subtitle:'A nested directory group unexpectedly maps to a production cloud role.', tier:'Hybrid identity + cloud federation assessment',
    brief:'A company federates directory groups into cloud roles. A support user has no direct cloud-admin assignment, yet the authorization graph says a nested group may map them into ProdSupport. Prove the effective federation path with a synthetic user, determine what the cloud role can actually do, and redesign both the directory nesting and role trust.',
    environment:'Alder Hybrid / fictional directory + SAML cloud federation',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Directory nesting','Identity','App-Support is nested inside Cloud-Support-Eligible.','The nesting was added during a temporary migration and never removed.'),
      e('ev2','Federation mapping','SAML configuration','Members of Cloud-Support-Eligible receive role claim arn:trace:iam::prod:role/ProdSupport.','The mapping evaluates transitive group membership.'),
      e('ev3','ProdSupport permissions','Cloud IAM','ProdSupport can describe production compute, restart app instances, and read deployment-status metadata.','It cannot read customer objects, secrets, or modify IAM.'),
      e('ev4','Support user','Directory','helpdesk.jules can modify App-Support membership because of the inherited delegation identified in C051.','This creates a potential chain from helpdesk delegation into cloud role eligibility.'),
      e('ev5','Synthetic validation identity','Assessment scope','trace-cloud-proof may be temporarily added to App-Support and used to request a training federation assertion.','Remove the account from the group after testing; do not alter production-like users.'),
      e('ev6','Cloud logs','Audit','No evidence shows helpdesk.jules used ProdSupport during the current review.','The case is an exposure assessment; do not claim exploitation without an audit event.')
    ],
    logs:[
      {id:'federation',name:'Federation config',text:`directory_group=Cloud-Support-Eligible\ntransitive_membership=true\nrole_claim=arn:trace:iam::prod:role/ProdSupport\nMFA_required=true`},
      {id:'cloud',name:'ProdSupport policy',text:`ALLOW compute:Describe *\nALLOW compute:Restart resource=prod-app-*\nALLOW deploy:GetStatus resource=prod/*\nDENY secrets:*\nDENY storage:CustomerData\nDENY iam:*`}
    ],
    terminal:[
      [/^help$/i,'Try: ad path helpdesk.jules Cloud-Support-Eligible, federation map Cloud-Support-Eligible, cloud role ProdSupport, ad test-add trace-cloud-proof App-Support, federation assert trace-cloud-proof, ad test-remove trace-cloud-proof App-Support, cloud audit helpdesk.jules'],
      [/^ad path helpdesk\.jules Cloud-Support-Eligible$/i,'helpdesk.jules -> Helpdesk-L1 --WriteMembers--> App-Support --memberOf--> Cloud-Support-Eligible'],
      [/^federation map Cloud-Support-Eligible$/i,'transitive=true\nclaim=arn:trace:iam::prod:role/ProdSupport\nMFA=true'],
      [/^cloud role ProdSupport$/i,'compute:Describe=*\ncompute:Restart=prod-app-*\ndeploy:GetStatus=prod/*\nsecrets=DENY\ncustomer_storage=DENY\niam=DENY'],
      [/^ad test-add trace-cloud-proof App-Support$/i,'SIMULATED CHANGE OK: trace-cloud-proof added to App-Support. Transitive Cloud-Support-Eligible membership=true.'],
      [/^federation assert trace-cloud-proof$/i,'MFA=SATISFIED (training)\nrole_claim=arn:trace:iam::prod:role/ProdSupport\nassertion=ISSUED\nNo production action executed.'],
      [/^ad test-remove trace-cloud-proof App-Support$/i,'SIMULATED CHANGE OK: trace-cloud-proof removed; membership returned to baseline.'],
      [/^cloud audit helpdesk\.jules$/i,'ProdSupport assumptions by helpdesk.jules=0\nThis review proves exposure, not historical exploitation.']
    ],
    actions:[
      {id:'a1',label:'Remove stale App-Support nesting from Cloud-Support-Eligible',description:'Break the unintended directory path into cloud-role eligibility.',outcome:'Application support membership no longer creates a production cloud role claim.',quality:'good'},
      {id:'a2',label:'Fix the underlying Helpdesk-L1 group-write delegation',description:'Remove the ability to self-create the App-Support membership path while preserving legitimate helpdesk duties.',outcome:'The directory-side escalation edge is removed rather than only hidden at federation.',quality:'good'},
      {id:'a3',label:'Require direct approved membership for ProdSupport federation',description:'Map the role from a dedicated group that does not accept broad/transitive nesting.',outcome:'Cloud role eligibility becomes explicit and reviewable.',quality:'good'},
      {id:'a4',label:'Claim production was compromised because the path exists',description:'Write the finding as a confirmed cloud intrusion without any role-assumption audit event.',outcome:'The report confuses exploitable exposure with demonstrated historical exploitation.',quality:'bad'},
      {id:'a5',label:'Keep the nesting and rely only on MFA',description:'Assume MFA alone makes unintended privilege mapping acceptable.',outcome:'A compromised or malicious eligible identity can still receive a role it should never have been entitled to request.',quality:'bad'}
    ],
    hints:['Treat this as a graph: who can change which group, how federation evaluates nesting, and what role claim results.','A safe proof can demonstrate eligibility without restarting a real-like production instance. Role issuance itself is enough to validate the trust path.','Be precise in the report: an exploitable path is not evidence that it was historically used. Fix both the directory edge and the federation design.'],
    evaluation:[
      {label:'Hybrid path',groups:[['helpdesk.jules'],['WriteMembers'],['App-Support'],['Cloud-Support-Eligible'],['ProdSupport']],supported:'You reconstruct the directory-to-federation path that can turn helpdesk group-write authority into production cloud-role eligibility.',partial:'You identify a risky cloud mapping but omit the directory delegation that makes it reachable.',missing:'The effective hybrid privilege path is not established.'},
      {label:'Safe validation',groups:[['trace-cloud-proof'],['assertion'],['issued'],['remove']],supported:'You prove the role claim with the synthetic identity and return group membership to baseline without changing production state.',partial:'You describe the eligibility but do not perform or clean up the scoped proof.',missing:'The conclusion is not safely validated.'},
      {label:'Evidence discipline + redesign',groups:[['no evidence','0','not exploited'],['remove','nesting'],['direct','approved'],['delegation']],supported:'You distinguish exposure from historical compromise and remove both the directory escalation edge and loose federation mapping.',partial:'You remediate one layer or overstate historical use.',missing:'The redesign leaves the hybrid privilege path intact or the report claims unsupported exploitation.'}
    ]
  },
  {
    id:'C059', title:'The Blind Folder', subtitle:'An endpoint exclusion created for builds became a safe place for anything to run unseen.', tier:'Endpoint protection + secure operations hardening',
    brief:'Developers complain that endpoint protection slows a build cache, so an old policy excludes C:\\BuildCache\\ from real-time scanning. An investigation finds an unsigned executable launched from that folder. Determine whether the exclusion contributed to the blind spot, scope actual execution, and redesign the exception without crippling builds.',
    environment:'Aster Dev / fictional Windows endpoint security policy',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Security exclusion','Endpoint policy','Real-time scanning excludes C:\\BuildCache\\* on all developer workstations.','The exclusion covers source archives, temporary scripts, extracted tools, and executable files.'),
      e('ev2','Suspicious binary','File telemetry','C:\\BuildCache\\tools\\sync-helper.exe is unsigned and absent from the approved build-tool manifest.','Hash TRACE59BAD appears on DEV-07 and DEV-12.'),
      e('ev3','Execution','EDR','sync-helper.exe executed on DEV-07 and DEV-12, spawned cmd.exe, then contacted update-check.test.','Behavioral EDR still recorded process/network events even though file scanning was excluded.'),
      e('ev4','Build requirement','Performance test','The actual performance problem comes from scanning millions of immutable object-cache files under C:\\BuildCache\\objects\\.','Excluding the entire parent directory is not required.'),
      e('ev5','Approved tools','Build manifest','Approved executables live under C:\\Program Files\\AsterBuild\\ and are signed by Aster Engineering.','BuildCache should contain data/cache artifacts, not runnable tooling.'),
      e('ev6','Distractor detection','EDR','DEV-09 ran signed compiler.exe from the approved tools directory at high CPU.','The event is normal build activity and not related to TRACE59BAD.')
    ],
    logs:[
      {id:'edr',name:'Endpoint events',text:`DEV-07 13:11 C:\\BuildCache\\tools\\sync-helper.exe hash=TRACE59BAD signer=NONE\nDEV-07 13:11 sync-helper.exe > cmd.exe\nDEV-07 13:12 dst=update-check.test:443 process=sync-helper.exe\nDEV-12 13:18 C:\\BuildCache\\tools\\sync-helper.exe hash=TRACE59BAD signer=NONE\nDEV-09 13:20 C:\\Program Files\\AsterBuild\\compiler.exe signer=Aster Engineering baseline=KNOWN`},
      {id:'policy',name:'Endpoint policy',text:`realtime_exclusion=C:\\BuildCache\\*\nbehavior_monitoring=ON\nnetwork_monitoring=ON\nreason="build performance 2024"`}
    ],
    terminal:[
      [/^help$/i,'Try: endpoint exclusions DEV-07, fleet hash TRACE59BAD, process tree TRACE59BAD, build perf-test narrow, manifest check sync-helper.exe, signer check compiler.exe'],
      [/^endpoint exclusions DEV-07$/i,'C:\\BuildCache\\* realtime_scan=EXCLUDED\nbehavior_monitoring=ON\nnetwork_monitoring=ON'],
      [/^fleet hash TRACE59BAD$/i,'DEV-07 FOUND executed=true\nDEV-12 FOUND executed=true\nother_hosts=0'],
      [/^process tree TRACE59BAD$/i,'sync-helper.exe [unsigned] -> cmd.exe\nnetwork=update-check.test:443'],
      [/^build perf-test narrow$/i,'full BuildCache exclusion: build=4m12s\nobjects-only exclusion: build=4m15s\nno exclusion: build=6m48s\nRecommended performance scope=C:\\BuildCache\\objects\\ immutable-cache only'],
      [/^manifest check sync-helper\.exe$/i,'approved=false\nexpected executable location=C:\\Program Files\\AsterBuild\\\nexpected signer=Aster Engineering'],
      [/^signer check compiler\.exe$/i,'signer=Aster Engineering\nhash=BASELINE_MATCH\npath=approved\nclassification=normal build activity']
    ],
    actions:[
      {id:'a1',label:'Preserve hash, process, network, and policy evidence',description:'Capture what executed and why the path was under-scanned before changing endpoint policy.',outcome:'The blind spot and actual affected-host scope remain explainable.',quality:'good'},
      {id:'a2',label:'Quarantine TRACE59BAD on DEV-07 and DEV-12',description:'Remove the known unapproved binary after evidence collection and investigate its arrival path.',outcome:'The observed executable can no longer run on the two affected hosts.',quality:'good'},
      {id:'a3',label:'Narrow the exclusion to immutable object-cache data',description:'Exclude only C:\\BuildCache\\objects\\ where testing shows the performance benefit is needed, and prevent execution from cache locations.',outcome:'Build performance is retained while the broad executable blind spot is removed.',quality:'good'},
      {id:'a4',label:'Enforce signed approved tools from the managed tools directory',description:'Keep executable build tooling under the managed signed path instead of the cache tree.',outcome:'Unapproved binaries in cache locations are less able to blend into normal build activity.',quality:'good'},
      {id:'a5',label:'Disable endpoint protection on developer machines during builds',description:'Avoid performance complaints by removing protection whenever compilation is active.',outcome:'The blind period becomes broader and predictable, substantially increasing risk.',quality:'bad'}
    ],
    hints:['An exclusion does not mean “no telemetry at all.” Use the behavioral events to prove actual execution and network activity, then connect that to the scanning blind spot.','Measure the business need instead of choosing between security and performance as absolutes. Which subdirectory actually causes the scan cost?','A good redesign narrows the data exclusion and also separates executable tooling from cache content so the exception cannot become an execution sanctuary.'],
    evaluation:[
      {label:'Observed execution',groups:[['TRACE59BAD'],['DEV-07'],['DEV-12'],['cmd.exe'],['update-check.test']],supported:'You scope the unapproved binary to two hosts and reconstruct its observed child-process and network behavior.',partial:'You identify the file but do not establish actual execution or affected-host scope.',missing:'The suspicious activity is not grounded in telemetry.'},
      {label:'Control analysis',groups:[['BuildCache'],['exclusion'],['real-time'],['behavior']],supported:'You explain that the broad real-time exclusion reduced file inspection while behavioral telemetry still exposed execution.',partial:'You call the folder blind but do not distinguish scanning from other endpoint telemetry.',missing:'The role of the endpoint-policy exception is not established.'},
      {label:'Operational hardening',groups:[['objects'],['narrow'],['signed'],['Program Files'],['prevent execution','execution']],supported:'You preserve build performance with a narrow data-only exception and keep executable tools signed, managed, and outside the cache path.',partial:'You narrow the exclusion but omit executable separation or application control.',missing:'The workaround remains broad enough to serve as an untrusted execution area.'}
    ]
  },
  {
    id:'C060', title:'Quarter-End', subtitle:'A routine support account appears in directory, server, portal, and cloud logs within forty minutes.', tier:'Advanced hybrid capstone',
    brief:'Quarter-end reporting is disrupted. Security sees a helpdesk identity involved in a privileged group change, an application-server login, direct requests to an internal portal, and a cloud support-role assumption. Reconstruct what is actually connected, prove the privilege transitions, identify two downstream impacts, and propose containment that removes the root trust paths instead of chasing unrelated alerts.',
    environment:'Alder Hybrid / directory + Windows + portal + cloud federation',
    tools:['overview','browser','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Initial identity event','Identity','helpdesk.jules authenticated to the support VPN at 01:58 from an unfamiliar but allowed contractor-range address using valid credentials and MFA.','This establishes access as the helpdesk identity but does not by itself prove how the credentials were obtained.'),
      e('ev2','Privileged group change','Directory','At 02:04 helpdesk.jules added temp.sync to App-Support.','Helpdesk-L1 inherited WriteMembers on App-Support. App-Support nests into both Tier1-Server-Admins and Cloud-Support-Eligible.'),
      e('ev3','Server access','Windows','temp.sync logged onto APP-PROD-02 at 02:11 and received local administrator rights through Tier1-Server-Admins.','No direct Domain Admin membership exists.'),
      e('ev4','Endpoint blind path','Endpoint','APP-PROD-02 has a temporary real-time exclusion C:\\OpsCache\\*. At 02:16 unsigned collect.exe executed from that path and accessed lsass.exe.','A memory artifact was created, but telemetry cannot prove exactly which credentials it contained.'),
      e('ev5','Direct portal route','Network','APP-PROD-02 can reach portal-app:8080 directly due migration rule 18.','The portal trusts X-Authenticated-User without verifying proxy origin on direct requests.'),
      e('ev6','Portal impact','Application','At 02:23 a direct request from APP-PROD-02 supplied X-Authenticated-User=report-admin and exported 312 internal audit records.','The request did not pass through auth-proxy.harbor.test.'),
      e('ev7','Cloud federation','Hybrid identity','Because App-Support is nested in Cloud-Support-Eligible, temp.sync received the ProdSupport role claim after MFA at 02:28.','ProdSupport can restart prod-app-* and read deployment status but cannot access customer storage or secrets.'),
      e('ev8','Cloud impact','Cloud audit','At 02:31 ProdSupport restarted prod-app-03 and read current deployment status.','No object-store, secrets, or IAM access occurred.'),
      e('ev9','Distractor: database alert','Database','A query-latency alert fired at 01:44, before the support VPN session.','It resolved automatically and has no matching identity, host, or network correlation.'),
      e('ev10','Distractor: unsigned printer utility','Endpoint','PRINT-04 contains an unrelated unsigned vendor utility installed months ago.','No process, login, or network relationship exists to the quarter-end incident.')
    ],
    browser:[
      {id:'b1',url:'http://portal-app:8080/admin/audit',title:'Portal direct route',html:`<div class="fake-site"><h2>Portal Audit</h2><div class="box">Training snapshot<br>02:23 source=APP-PROD-02<br>identity=report-admin<br>via_proxy=false<br>records_exported=312</div></div>`},
      {id:'b2',url:'https://auth-proxy.harbor.test/portal',title:'Expected portal path',html:`<div class="fake-site"><h2>Harbor Auth Proxy</h2><div class="box">Expected production access path authenticates users and replaces identity context before forwarding.</div></div>`}
    ],
    logs:[
      {id:'timeline',name:'Cross-system timeline',text:`01:44 database latency alert / auto-resolved / no correlation\n01:58 VPN user=helpdesk.jules auth=valid+MFA src=203.0.113.90\n02:04 AD actor=helpdesk.jules add member=temp.sync group=App-Support\n02:11 Windows logon user=temp.sync host=APP-PROD-02 local_admin=true via=Tier1-Server-Admins\n02:16 APP-PROD-02 process=C:\\OpsCache\\collect.exe signer=NONE target=lsass.exe\n02:23 portal src=APP-PROD-02 via_proxy=false header_user=report-admin export=312\n02:28 federation user=temp.sync transitive_group=Cloud-Support-Eligible role=ProdSupport MFA=SATISFIED\n02:31 cloud actor=ProdSupport action=Restart resource=prod-app-03\n02:32 cloud actor=ProdSupport action=GetDeploymentStatus resource=prod/current`},
      {id:'directory',name:'Directory graph',text:`helpdesk.jules -> Helpdesk-L1 --WriteMembers--> App-Support\nApp-Support -> Tier1-Server-Admins -> LocalAdmins(APP-PROD-01,APP-PROD-02)\nApp-Support -> Cloud-Support-Eligible -> SAML role ProdSupport`},
      {id:'portal',name:'Portal requests',text:`02:23 src=10.70.12.22 host=APP-PROD-02 dst=portal-app:8080 via_proxy=false X-Authenticated-User=report-admin result=200 export_records=312`},
      {id:'cloud',name:'Cloud audit',text:`02:28 principal=temp.sync role=ProdSupport event=AssumeRoleWithSAML mfa=true\n02:31 actor=ProdSupport action=compute:Restart target=prod-app-03 result=SUCCESS\n02:32 actor=ProdSupport action=deploy:GetStatus target=prod/current result=SUCCESS\nsecrets_access=0 storage_customer_access=0 iam_changes=0`}
    ],
    terminal:[
      [/^help$/i,'Try: timeline 01:40-02:35, ad path helpdesk.jules App-Support, ad effective temp.sync, host timeline APP-PROD-02, edr inspect collect.exe, route test APP-PROD-02 portal-app 8080, portal request 02:23, federation path temp.sync ProdSupport, cloud audit 02:28-02:35, correlate database-alert'],
      [/^timeline 01:40-02:35$/i,'01:44 unrelated DB latency\n01:58 helpdesk VPN\n02:04 temp.sync added to App-Support\n02:11 temp.sync admin logon APP-PROD-02\n02:16 collect.exe LSASS access\n02:23 direct portal admin-header export 312\n02:28 ProdSupport federation\n02:31 cloud restart\n02:32 deploy status read'],
      [/^ad path helpdesk\.jules App-Support$/i,'helpdesk.jules -> Helpdesk-L1 --WriteMembers--> App-Support'],
      [/^ad effective temp\.sync$/i,'via App-Support:\nTier1-Server-Admins -> local admin APP-PROD-01/02\nCloud-Support-Eligible -> SAML ProdSupport eligibility'],
      [/^host timeline APP-PROD-02$/i,'02:11 temp.sync interactive logon local_admin=true\n02:16 C:\\OpsCache\\collect.exe unsigned -> lsass.exe access -> memory artifact'],
      [/^edr inspect collect\.exe$/i,'path=C:\\OpsCache\\collect.exe\nsigner=NONE\nrealtime_scan=EXCLUDED_BY_PATH\nbehavior=LSASS access\nexact_credentials_recovered=UNKNOWN'],
      [/^route test APP-PROD-02 portal-app 8080$/i,'ALLOW via migration rule 18; proxy not required on this route'],
      [/^portal request 02:23$/i,'src=APP-PROD-02\nvia_proxy=false\nX-Authenticated-User=report-admin\nresult=200\nexport_records=312'],
      [/^federation path temp\.sync ProdSupport$/i,'temp.sync -> App-Support -> Cloud-Support-Eligible -> SAML claim ProdSupport\nMFA=SATISFIED'],
      [/^cloud audit 02:28-02:35$/i,'ProdSupport assumed by temp.sync\nrestart prod-app-03 SUCCESS\ndeploy status read SUCCESS\ncustomer storage=0\nsecrets=0\nIAM changes=0'],
      [/^correlate database-alert$/i,'DB latency alert occurred 14 minutes before VPN session; no shared identity, host, network source, or downstream event. Treat as unrelated unless new evidence appears.']
    ],
    actions:[
      {id:'a1',label:'Preserve directory, host, portal, federation, and cloud evidence',description:'Capture the cross-system timeline before membership, sessions, routes, and exclusions are changed.',outcome:'The privilege transitions and demonstrated impacts remain defensible.',quality:'good'},
      {id:'a2',label:'Disable temp.sync and remove unauthorized App-Support membership',description:'Terminate the identity created/used through the delegated group path.',outcome:'The immediate server-admin and cloud-eligibility memberships are removed.',quality:'good'},
      {id:'a3',label:'Remove Helpdesk-L1 WriteMembers and stale App-Support nesting',description:'Break the directory root cause and both downstream transitive privilege branches.',outcome:'Helpdesk password-reset duties remain, but App-Support can no longer be self-populated or transitively grant server/cloud privilege.',quality:'good'},
      {id:'a4',label:'Close direct portal ingress and authenticate proxy identity context',description:'Require traffic through the trusted proxy path and verify its identity assertion.',outcome:'A compromised internal server can no longer become portal admin by supplying an identity header directly.',quality:'good'},
      {id:'a5',label:'Remove broad OpsCache exclusion and preserve only a narrow data exception',description:'Eliminate the executable blind path on APP-PROD-02 while retaining any measured operational need.',outcome:'Unsigned tools in the operations cache no longer receive broad real-time scanning exemption.',quality:'good'},
      {id:'a6',label:'Revoke active federation/cloud sessions derived from temp.sync',description:'Invalidate current ProdSupport sessions after preserving cloud audit evidence.',outcome:'The cloud role can no longer be used by the incident identity.',quality:'good'},
      {id:'a7',label:'Report customer data theft from cloud storage',description:'Assume ProdSupport must have accessed customer objects because it is a production role.',outcome:'The report contradicts cloud audit evidence showing zero customer-storage access.',quality:'bad'},
      {id:'a8',label:'Prioritize the database latency alert as initial access',description:'Treat the earlier noisy operational alert as causal despite no correlation.',outcome:'Response effort moves away from the evidence-backed identity and privilege timeline.',quality:'bad'}
    ],
    hints:['Build the graph before writing the story. The 02:04 membership change creates two transitive branches: server administration and cloud-role eligibility.','On the server branch, distinguish confirmed facts from uncertain ones: LSASS access happened, but exact recovered credentials are unknown; the portal bypass at 02:23 is directly evidenced.','Your final theory should state two demonstrated downstream impacts precisely: 312 portal audit records exported and prod-app-03 restarted/deployment status read. Do not invent customer-storage access.'],
    evaluation:[
      {label:'Root privilege path',groups:[['helpdesk.jules'],['WriteMembers'],['temp.sync'],['App-Support'],['Tier1-Server-Admins'],['Cloud-Support-Eligible']],supported:'You identify the delegated group-write action as the root privilege transition and show both server and cloud transitive branches.',partial:'You identify the suspicious membership but fail to explain one of its effective privilege branches.',missing:'The root trust path is not reconstructed.'},
      {label:'Server + portal branch',groups:[['APP-PROD-02'],['collect.exe'],['lsass'],['rule 18','direct'],['report-admin'],['312']],supported:'You reconstruct the server-admin session, endpoint blind-path activity, and directly evidenced portal-header bypass that exported 312 records.',partial:'You identify server compromise or portal abuse but leave the transition between them unsupported.',missing:'The demonstrated portal impact is not tied to the compromised server branch.'},
      {label:'Cloud branch',groups:[['ProdSupport'],['02:28'],['prod-app-03'],['restart'],['deployment status'],['no','storage','secrets']],supported:'You show the transitive federation path and state the cloud impact accurately without inventing storage, secrets, or IAM access.',partial:'You identify ProdSupport use but overstate or underspecify what the audit proves.',missing:'The cloud branch is not reconstructed from federation and audit evidence.'},
      {label:'Evidence discipline',groups:[['credentials','unknown','cannot prove'],['database','unrelated'],['printer','unrelated']],supported:'You keep uncertain credential recovery and unrelated alerts separate from the evidence-backed incident chain.',partial:'You avoid some speculation but still incorporate at least one unsupported causal claim.',missing:'The theory is driven by speculation or distractors.'},
      {label:'Containment + redesign',groups:[['preserve'],['remove','WriteMembers'],['nesting'],['portal','proxy'],['OpsCache','exclusion'],['revoke','cloud','session']],supported:'You preserve evidence, remove the identity and directory root cause, close portal trust bypass, narrow endpoint exclusions, and revoke cloud sessions.',partial:'You contain immediate identities but leave one major reusable trust path in place.',missing:'The response does not break the demonstrated cross-system privilege paths.'}
    ]
  },
  {
    id:'C061', title:'Who Can Read the Secret', subtitle:'A managed service identity is secure only if the right people can read its password material.', tier:'Advanced directory service-identity assessment',
    brief:'A finance application uses a managed domain service account. During an access review, a helpdesk analyst appears in the account\'s password-reader list through nested groups. Determine the effective path, whether there is evidence of misuse, and how to reduce access without breaking the service.',
    environment:'Meridian Finance / directory + service host snapshot',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Managed service account','Directory','FIN-REPORT$ runs the finance report service on FIN-APP-02.','The service account is managed automatically; interactive logon is disabled.'),
      e('ev2','Password-reader ACL','Directory ACL','Group FIN-SVC-READERS may retrieve managed password material.','The ACL is intentional, but its nested membership has not been reviewed recently.'),
      e('ev3','Unexpected nested path','Directory graph','Helpdesk-L2 is nested into Legacy-Ops, which is nested into FIN-SVC-READERS.','This makes Helpdesk-L2 an effective reader even though it is not directly listed.'),
      e('ev4','Service logons','Security log','FIN-REPORT$ authenticated from FIN-APP-02 during the review window.','No interactive logon or use from another host is recorded.'),
      e('ev5','Old migration note','Change record','Legacy-Ops was added during a migration six months ago.','The migration is complete; the nested grant was never removed.')
    ],
    logs:[
      {id:'directory',name:'Directory membership',text:`FIN-SVC-READERS <- Legacy-Ops <- Helpdesk-L2\nFIN-SVC-READERS permission=ReadManagedPassword target=FIN-REPORT$`},
      {id:'auth',name:'Authentication',text:`08:00-12:00 principal=FIN-REPORT$ source=FIN-APP-02 logon_type=SERVICE\ninteractive_logons=0\nother_sources=0`}
    ],
    terminal:[
      [/^help$/i,'Try: ad path Helpdesk-L2 FIN-SVC-READERS, ad acl FIN-REPORT$, ad effective Helpdesk-L2 FIN-REPORT$, auth principal FIN-REPORT$, service host FIN-REPORT$'],
      [/^ad path Helpdesk-L2 FIN-SVC-READERS$/i,'Helpdesk-L2 -> Legacy-Ops -> FIN-SVC-READERS'],
      [/^ad acl FIN-REPORT\$$/i,'FIN-SVC-READERS: ReadManagedPassword\nDomain Admins: FullControl'],
      [/^ad effective Helpdesk-L2 FIN-REPORT\$$/i,'effective=ReadManagedPassword via Helpdesk-L2 -> Legacy-Ops -> FIN-SVC-READERS'],
      [/^auth principal FIN-REPORT\$$/i,'service logons only from FIN-APP-02; no interactive or alternate-host use observed'],
      [/^service host FIN-REPORT\$$/i,'FIN-APP-02 / FinanceReportService / startup=automatic']
    ],
    actions:[
      {id:'a1',label:'Preserve ACL and membership evidence',description:'Capture the effective path before changing nested groups.',outcome:'The overbroad reader path remains auditable.',quality:'good'},
      {id:'a2',label:'Remove Legacy-Ops from FIN-SVC-READERS',description:'Break the stale migration nesting while keeping the intended service account.',outcome:'Helpdesk-L2 no longer inherits managed-password read access.',quality:'good'},
      {id:'a3',label:'Review and rotate the managed credential after access reduction',description:'Reduce readers first, then refresh credential material.',outcome:'The account continues operating with a new managed secret and smaller reader set.',quality:'good'},
      {id:'a4',label:'Disable FIN-REPORT$ immediately',description:'Stop the account without evidence of misuse or a replacement service identity.',outcome:'Finance reporting stops even though the review found exposure, not confirmed compromise.',quality:'bad'}
    ],
    hints:['Start with effective access, not direct membership.','Separate exposure from compromise: the ACL proves who could read the secret, while authentication logs show how the identity was actually used.','A good fix removes the stale nesting and refreshes the credential without unnecessarily breaking the application.'],
    evaluation:[
      {label:'Effective access path',groups:[['Helpdesk-L2'],['Legacy-Ops'],['FIN-SVC-READERS'],['ReadManagedPassword']],supported:'You reconstruct the nested path that grants managed-password read access.',partial:'You identify the broad reader group but miss the nesting that exposes it to helpdesk.',missing:'The effective reader path is not established.'},
      {label:'Evidence discipline',groups:[['no','misuse'],['service','FIN-APP-02'],['exposure','not compromise']],supported:'You distinguish overbroad secret access from confirmed credential misuse.',partial:'You notice normal service logons but still overstate compromise.',missing:'You treat potential access as proven abuse.'},
      {label:'Remediation',groups:[['remove','Legacy-Ops'],['rotate','credential'],['preserve']],supported:'You preserve evidence, remove the stale nested grant, and refresh credential material safely.',partial:'You reduce access but omit either evidence preservation or credential refresh.',missing:'The proposed response leaves the reader path intact or needlessly breaks the service.'}
    ]
  },
  {
    id:'C062', title:'Acting for the Server', subtitle:'A low-tier provisioning group can change who is trusted to act as a production server.', tier:'Advanced directory delegation assessment',
    brief:'A directory review finds that Workstation-Provisioners has write access to one production computer object. That computer also has a delegation setting controlling which machine identities may act on its behalf. Determine the real risk, whether the setting changed, and what control should be redesigned.',
    environment:'Northbridge / Active Directory computer-object control review',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Computer object ACL','Directory ACL','Workstation-Provisioners has GenericWrite on APP-SRV-07$.','The grant predates the server being reclassified from test to production.'),
      e('ev2','Delegation attribute','Directory','APP-SRV-07$ has an attribute defining which computer identities may act for it.','The current value contains BUILD-HELPER-03$.'),
      e('ev3','Change event','Directory audit','The delegation attribute changed yesterday under account prov.mika.','prov.mika is a member of Workstation-Provisioners.'),
      e('ev4','Kerberos service use','Authentication','BUILD-HELPER-03$ requested service tickets for APP-SRV-07 shortly after the change.','The training snapshot confirms use of the trust relation but not any specific application data theft.'),
      e('ev5','Classification drift','Asset record','APP-SRV-07 moved from QA to production two months ago.','Its computer-object ACL was not re-baselined during promotion.')
    ],
    logs:[
      {id:'dir',name:'Directory audit',text:`2026-09-13T14:08 actor=prov.mika object=APP-SRV-07$ attribute=delegation old=[] new=[BUILD-HELPER-03$]\nactor_group=Workstation-Provisioners`},
      {id:'kerberos',name:'Kerberos summary',text:`14:11 client=BUILD-HELPER-03$ service=HTTP/APP-SRV-07 result=SUCCESS\n14:12 client=BUILD-HELPER-03$ service=HOST/APP-SRV-07 result=SUCCESS`}
    ],
    terminal:[
      [/^help$/i,'Try: ad acl APP-SRV-07$, ad member prov.mika, ad delegation APP-SRV-07$, ad changes APP-SRV-07$, kerberos client BUILD-HELPER-03$'],
      [/^ad acl APP-SRV-07\$$/i,'Workstation-Provisioners: GenericWrite\nServer-Admins: FullControl'],
      [/^ad member prov\.mika$/i,'Workstation-Provisioners'],
      [/^ad delegation APP-SRV-07\$$/i,'allowed_actor=BUILD-HELPER-03$'],
      [/^ad changes APP-SRV-07\$$/i,'14:08 prov.mika modified delegation attribute -> BUILD-HELPER-03$'],
      [/^kerberos client BUILD-HELPER-03\$$/i,'HTTP/APP-SRV-07 SUCCESS\nHOST/APP-SRV-07 SUCCESS']
    ],
    actions:[
      {id:'a1',label:'Preserve directory change and ticket evidence',description:'Capture object ACL, attribute history, and service-ticket records first.',outcome:'The trust change remains reconstructable.',quality:'good'},
      {id:'a2',label:'Remove the unauthorized delegation value',description:'Restore the computer object to its approved trust configuration.',outcome:'BUILD-HELPER-03$ is no longer trusted to act for APP-SRV-07.',quality:'good'},
      {id:'a3',label:'Remove workstation-provisioning write rights from production server objects',description:'Separate workstation lifecycle permissions from production server identity controls.',outcome:'The root privilege path is removed for future production systems.',quality:'good'},
      {id:'a4',label:'Claim database theft occurred',description:'Infer data theft solely from successful service tickets.',outcome:'The conclusion exceeds the evidence; service access is proven, database theft is not.',quality:'bad'}
    ],
    hints:['The important question is not “who is an admin?” but “who can change the server identity object?”','The audit log proves a trust-setting change and the Kerberos log proves that the new trust was used. Do not invent downstream impact you cannot see.','Fix both the changed attribute and the stale ACL that allowed a workstation team to alter a production server object.'],
    evaluation:[
      {label:'Control path',groups:[['Workstation-Provisioners'],['GenericWrite'],['APP-SRV-07'],['delegation']],supported:'You identify computer-object write control as the privilege boundary that enabled the delegation change.',partial:'You identify the changed trust but not why prov.mika could make it.',missing:'The directory control path is not explained.'},
      {label:'Observed use',groups:[['BUILD-HELPER-03'],['Kerberos','ticket'],['HTTP','HOST']],supported:'You use the ticket evidence to show the new trust was exercised without overstating application impact.',partial:'You note ticket activity but make unsupported claims about what happened next.',missing:'The post-change use of the trust is ignored.'},
      {label:'Redesign',groups:[['remove','delegation'],['remove','GenericWrite'],['production','ACL']],supported:'You reverse the unauthorized trust and re-baseline production computer-object permissions.',partial:'You repair the attribute but leave the underlying write delegation in place.',missing:'The response does not remove the reusable privilege path.'}
    ]
  },
  {
    id:'C063', title:'The Runtime Socket', subtitle:'A support pod can talk directly to the container runtime on its node.', tier:'Advanced Kubernetes runtime-boundary assessment',
    brief:'A diagnostics pod in a production cluster was created for emergency support. Its manifest mounts a host runtime socket and runs with elevated container privileges. Determine what boundary this breaks, whether the pod used the socket, and how to retain diagnostics without exposing node control.',
    environment:'Atlas Commerce / Kubernetes cluster snapshot',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Diagnostics manifest','Kubernetes manifest','diag-shell mounts /run/containerd/containerd.sock from the node.','securityContext.privileged=true; hostPath mount is read-write.'),
      e('ev2','Namespace purpose','Cluster policy','ops-diagnostics is intended for read-only troubleshooting.','The namespace policy does not explicitly forbid hostPath or privileged containers.'),
      e('ev3','Runtime audit','Node telemetry','diag-shell opened the containerd socket and listed containers on NODE-04.','No container start, exec, or image modification is recorded.'),
      e('ev4','Service account','Kubernetes RBAC','The pod service account itself has only read access to pods and logs.','RBAC appears narrow, but the host socket creates a separate control path.'),
      e('ev5','Approved need','Runbook','Support only needs logs, metrics, and network diagnostics.','Direct runtime control is not part of the approved workflow.')
    ],
    logs:[
      {id:'runtime',name:'Node runtime telemetry',text:`10:02 pod=ops-diagnostics/diag-shell node=NODE-04 open=/run/containerd/containerd.sock\n10:03 api=ListContainers result=SUCCESS\nstart=0 exec=0 delete=0 image_write=0`},
      {id:'kube',name:'Kubernetes audit',text:`serviceaccount=ops-diagnostics:diag-sa verbs=get,list resources=pods,pods/log\nprivileged_admission=allowed legacy_exception=ops-diagnostics`}
    ],
    terminal:[
      [/^help$/i,'Try: kube manifest diag-shell, kube rbac diag-sa, node socket activity diag-shell, policy namespace ops-diagnostics, runbook diagnostics'],
      [/^kube manifest diag-shell$/i,'privileged=true\nhostPath=/run/containerd/containerd.sock -> /run/containerd/containerd.sock rw\nserviceAccount=diag-sa'],
      [/^kube rbac diag-sa$/i,'pods:get,list\npods/log:get\nsecrets:none\nexec:none'],
      [/^node socket activity diag-shell$/i,'opened containerd socket; ListContainers succeeded; no start/exec/delete/image-write events observed'],
      [/^policy namespace ops-diagnostics$/i,'legacy privileged exception=true; hostPath restriction=none'],
      [/^runbook diagnostics$/i,'required=logs, metrics, packet capture through approved collector; runtime control=not required']
    ],
    actions:[
      {id:'a1',label:'Preserve pod manifest and node runtime telemetry',description:'Capture what the pod could do and what it actually did.',outcome:'Capability and observed use remain distinguishable.',quality:'good'},
      {id:'a2',label:'Remove the runtime socket mount and privileged mode',description:'Rebuild diagnostics around approved read-only telemetry interfaces.',outcome:'Support retains logs and metrics without direct node-runtime control.',quality:'good'},
      {id:'a3',label:'Add admission policy blocking privileged and runtime-socket mounts',description:'Prevent future emergency pods from silently recreating the same boundary break.',outcome:'The unsafe pattern is rejected at admission.',quality:'good'},
      {id:'a4',label:'Report confirmed node takeover',description:'Treat socket access capability as proof the node was modified.',outcome:'The report overstates the evidence: listing containers is proven, node takeover is not.',quality:'bad'}
    ],
    hints:['RBAC is only one security boundary. Ask what the hostPath mount gives the pod outside Kubernetes API permissions.','Separate capability from observed use: the pod reached the runtime socket and listed containers, but the telemetry shows no exec/start/delete actions.','The durable fix is to remove both the dangerous pod configuration and the admission exception that allowed it.'],
    evaluation:[
      {label:'Boundary analysis',groups:[['containerd','socket'],['privileged'],['hostPath'],['node','runtime']],supported:'You identify the host runtime socket as a separate control path that bypasses narrow Kubernetes RBAC.',partial:'You notice privileged mode but do not explain why the runtime mount matters.',missing:'The node-control boundary is not identified.'},
      {label:'Observed impact',groups:[['ListContainers','list'],['no','exec'],['no','start']],supported:'You state exactly what runtime telemetry proves and what it does not prove.',partial:'You identify socket use but overstate or omit the observed operation.',missing:'Capability and activity are conflated.'},
      {label:'Hardening',groups:[['remove','socket'],['remove','privileged'],['admission','policy']],supported:'You redesign diagnostics and enforce the safer configuration at admission.',partial:'You fix the one pod but leave the cluster policy gap.',missing:'The unsafe runtime access remains reusable.'}
    ]
  },
  {
    id:'C064', title:'Two Permissions, One Secret', subtitle:'No single role can read the backup, but two inherited permissions combine into full access.', tier:'Advanced cloud IAM + encryption assessment',
    brief:'A backup archive is encrypted with a customer-managed key. Storage review says analysts cannot decrypt it; key review says analysts cannot list the bucket. Yet one analyst appears able to retrieve readable backup content through inherited permissions. Reconstruct the effective permission set and fix the split-control failure.',
    environment:'Blue Lantern / object storage + KMS policy snapshot',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Storage role','Cloud IAM','Data-Audit grants GetObject on backup-prod/* but not ListBucket.','The role was intended for targeted evidence retrieval.'),
      e('ev2','Key role','KMS policy','Security-Readers grants Decrypt on key/backup-prod.','It was intended for security tooling, not human analysts.'),
      e('ev3','Nested identity groups','Identity','analyst.ren is in Data-Audit and Security-Readers through separate group memberships.','Neither team realized the other permission completed the access path.'),
      e('ev4','Object access event','Cloud audit','analyst.ren retrieved backup-prod/db-2026-09-13.enc and KMS decrypted its data key.','Both events occur under the same session.'),
      e('ev5','No bucket listing','Cloud audit','No ListBucket call exists for the session.','Knowledge of a specific object name was sufficient for direct retrieval.')
    ],
    logs:[
      {id:'iam',name:'Effective permissions',text:`principal=analyst.ren\nvia Data-Audit: storage:GetObject backup-prod/*\nvia Security-Readers: kms:Decrypt key/backup-prod\nstorage:ListBucket=DENY`},
      {id:'audit',name:'Cloud audit',text:`11:14 storage:GetObject backup-prod/db-2026-09-13.enc SUCCESS\n11:14 kms:Decrypt key/backup-prod SUCCESS\n11:15 storage:ListBucket backup-prod DENIED`}
    ],
    terminal:[
      [/^help$/i,'Try: cloud groups analyst.ren, cloud effective analyst.ren, storage audit analyst.ren, kms audit analyst.ren, policy explain backup-prod'],
      [/^cloud groups analyst\.ren$/i,'Data-Audit (direct)\nSecurity-Readers (via SecOps-Contractors)'],
      [/^cloud effective analyst\.ren$/i,'GetObject backup-prod/* ALLOW\nKMS Decrypt key/backup-prod ALLOW\nListBucket DENY'],
      [/^storage audit analyst\.ren$/i,'GetObject backup-prod/db-2026-09-13.enc SUCCESS\nListBucket DENIED'],
      [/^kms audit analyst\.ren$/i,'Decrypt key/backup-prod SUCCESS same session as object retrieval'],
      [/^policy explain backup-prod$/i,'Readable plaintext requires both object read and key decrypt; listing is not required when object key is known.']
    ],
    actions:[
      {id:'a1',label:'Preserve storage and KMS audit correlation',description:'Keep both halves of the effective access event.',outcome:'The combined permission path is documented.',quality:'good'},
      {id:'a2',label:'Remove human analysts from Security-Readers',description:'Restrict key decrypt to approved workload identities or tightly scoped break-glass access.',outcome:'Object-read permission alone no longer yields readable backup content.',quality:'good'},
      {id:'a3',label:'Add explicit key policy conditions for approved principals and contexts',description:'Make decrypt eligibility independent of broad group nesting.',outcome:'The KMS key enforces the intended split control.',quality:'good'},
      {id:'a4',label:'Treat denied ListBucket as proof the backup was protected',description:'Assume inability to browse prevents direct object retrieval.',outcome:'The conclusion ignores the successful GetObject + Decrypt events.',quality:'bad'}
    ],
    hints:['Think in terms of effective permissions across services, not what each team sees in its own policy.','ListBucket and GetObject are different. If the object key is known, listing is not necessary.','The fix belongs at the identity and KMS boundary so storage read alone cannot silently combine with decrypt.'],
    evaluation:[
      {label:'Combined permission path',groups:[['GetObject'],['Decrypt'],['Data-Audit'],['Security-Readers']],supported:'You reconstruct the two-role combination that produced readable backup access.',partial:'You identify one permission but not how the second completed the path.',missing:'The cross-service effective permission set is not explained.'},
      {label:'Audit interpretation',groups:[['db-2026-09-13.enc'],['same session'],['ListBucket','denied']],supported:'You use the successful object/decrypt events and correctly explain why denied listing did not prevent access.',partial:'You notice the access but misinterpret the listing denial.',missing:'The audit evidence is not reconciled.'},
      {label:'Control redesign',groups:[['remove','analyst'],['KMS','condition'],['workload','break-glass']],supported:'You restore split control by narrowing who can decrypt and adding key-level conditions.',partial:'You remove one membership but leave the key policy broadly reusable.',missing:'The combined permission path remains possible.'}
    ]
  },
  {
    id:'C065', title:'Fallback', subtitle:'A critical server still accepts a legacy authentication path the rest of the tier stopped using.', tier:'Advanced Windows authentication hardening assessment',
    brief:'An identity-hardening review shows one legacy management endpoint still accepts NTLM fallback while peer servers require modern Kerberos and stronger directory protections. Determine where fallback is occurring, whether it is actually used, and how to phase it out without breaking the one dependency that still needs attention.',
    environment:'Cedar Health / Windows server tier authentication review',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Authentication policy','Server baseline','Production servers should prefer Kerberos and reject NTLM except approved compatibility exceptions.','Only MED-APP-06 remains exempt.'),
      e('ev2','Legacy endpoint','Service inventory','MED-APP-06 exposes an old management listener used by scanner-v2.','scanner-v2 cannot currently use Kerberos.'),
      e('ev3','NTLM events','Authentication log','MED-APP-06 records recurring NTLM authentication from scanner-v2 and one unexpected workstation WS-113.','The workstation event is outside the approved exception.'),
      e('ev4','Directory protections','Domain policy','LDAP signing and channel binding are required on domain controllers.','No directory-controller exception is present.'),
      e('ev5','Replacement agent','Change plan','scanner-v3 supports Kerberos and is already validated in staging.','Migration is scheduled but not yet deployed to production.')
    ],
    logs:[
      {id:'auth',name:'Authentication protocol summary',text:`MED-APP-06 NTLM source=scanner-v2 count=144 approved=true\nMED-APP-06 NTLM source=WS-113 count=1 approved=false\nMED-APP-01..05 NTLM count=0\nKerberos MED-APP tier count=1842`},
      {id:'policy',name:'Baseline',text:`NTLM=deny on production except MED-APP-06 compatibility exception\nLDAP signing=required\nchannel binding=required`}
    ],
    terminal:[
      [/^help$/i,'Try: auth protocol MED-APP-06, auth source WS-113, policy server MED-APP-06, inventory scanner-v2, inventory scanner-v3'],
      [/^auth protocol MED-APP-06$/i,'NTLM scanner-v2=144 approved\nNTLM WS-113=1 unapproved\nKerberos other management=318'],
      [/^auth source WS-113$/i,'single NTLM authentication to MED-APP-06 at 09:41; no approved exception'],
      [/^policy server MED-APP-06$/i,'temporary NTLM compatibility exception=true; owner=ClinicalIT; expiry=2026-10-01'],
      [/^inventory scanner-v2$/i,'legacy; Kerberos unsupported; production dependency'],
      [/^inventory scanner-v3$/i,'Kerberos supported; staging validation passed']
    ],
    actions:[
      {id:'a1',label:'Preserve protocol-use evidence and exception ownership',description:'Document both approved and unexpected NTLM use before changing policy.',outcome:'The migration can be measured against a known baseline.',quality:'good'},
      {id:'a2',label:'Investigate and block the unapproved WS-113 use',description:'Treat the one workstation fallback as a separate unauthorized path.',outcome:'The unexpected client is removed from the exception path.',quality:'good'},
      {id:'a3',label:'Migrate scanner-v2 to scanner-v3, then remove the server exception',description:'Eliminate the remaining business dependency before enforcing the baseline.',outcome:'MED-APP-06 joins the rest of the tier with no NTLM fallback.',quality:'good'},
      {id:'a4',label:'Disable NTLM immediately with no dependency check',description:'Enforce the final state before replacing scanner-v2.',outcome:'Clinical scanning fails even though a staged compatible replacement was available.',quality:'bad'}
    ],
    hints:['Inventory actual protocol use before changing authentication policy.','There are two different problems: one approved compatibility dependency and one unexpected workstation event.','The practical hardening path is migration, measurement, then removal of the exception—not breaking the service first.'],
    evaluation:[
      {label:'Protocol mapping',groups:[['MED-APP-06'],['NTLM'],['scanner-v2'],['WS-113']],supported:'You identify the one server exception and distinguish approved scanner use from the unexpected workstation event.',partial:'You find NTLM use but treat all clients the same.',missing:'The actual fallback path is not mapped.'},
      {label:'Dependency-aware hardening',groups:[['scanner-v3'],['Kerberos'],['remove','exception']],supported:'You migrate the known dependency to Kerberos before removing the compatibility exception.',partial:'You propose disabling fallback but do not address the production dependency.',missing:'The plan either leaves legacy auth indefinitely or breaks the service.'},
      {label:'Evidence + scope',groups:[['LDAP','signing'],['channel binding'],['no','domain controller exception']],supported:'You keep the issue scoped to the server fallback and do not incorrectly claim directory controllers are unprotected.',partial:'You mention broader Windows auth controls without tying them to evidence.',missing:'The conclusion confuses endpoint fallback with unrelated directory policy.'}
    ]
  },
  {
    id:'C066', title:'Outside the Mesh', subtitle:'One namespace is exempt from service-mesh enforcement, and an internal API trusts mesh identity.', tier:'Advanced service-mesh + workload identity assessment',
    brief:'A payments API authorizes internal callers based on authenticated workload identity supplied by the service mesh. A legacy namespace is excluded from strict mTLS enforcement. Determine whether traffic from that namespace can reach the API without an authenticated workload identity and how to close the gap without blocking approved batch traffic.',
    environment:'Orbit Pay / Kubernetes service mesh policy snapshot',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Payments policy','Mesh policy','payments-api expects strict mTLS and allows identities batch-settlement and checkout-api.','Authorization depends on verified mesh identity.'),
      e('ev2','Legacy namespace exception','Mesh config','legacy-jobs is PERMISSIVE rather than STRICT.','The exception was created during migration.'),
      e('ev3','Network policy','Kubernetes','legacy-jobs can connect to payments-api:8443.','Network reachability exists for nightly settlement jobs.'),
      e('ev4','Request telemetry','Service mesh','A request from legacy-jobs reached payments-api with peer identity missing.','The application returned 403, so authorization held on this request.'),
      e('ev5','Batch migration','Change plan','batch-settlement has already been moved to a sidecar-enabled deployment in ops-batch.','The old legacy-jobs path is no longer required for settlement.')
    ],
    logs:[
      {id:'mesh',name:'Mesh access log',text:`12:09 src_namespace=legacy-jobs dst=payments-api:8443 mtls=false peer_identity=NONE status=403\n12:12 src_identity=spiffe://cluster/ns/ops-batch/sa/batch-settlement mtls=true status=200`},
      {id:'policy',name:'Policy state',text:`payments-api PeerAuthentication=STRICT\nlegacy-jobs namespace exception=PERMISSIVE\nNetworkPolicy legacy-jobs -> payments-api:8443 ALLOW`}
    ],
    terminal:[
      [/^help$/i,'Try: mesh policy payments-api, mesh policy namespace legacy-jobs, netpol path legacy-jobs payments-api, mesh requests payments-api, migration batch-settlement'],
      [/^mesh policy payments-api$/i,'strict mTLS expected; allowed identities=batch-settlement,checkout-api'],
      [/^mesh policy namespace legacy-jobs$/i,'PERMISSIVE migration exception active'],
      [/^netpol path legacy-jobs payments-api$/i,'ALLOW tcp/8443'],
      [/^mesh requests payments-api$/i,'legacy-jobs mtls=false identity=NONE status=403\nops-batch/batch-settlement mtls=true identity=verified status=200'],
      [/^migration batch-settlement$/i,'new deployment in ops-batch uses sidecar and verified workload identity; production validation passed']
    ],
    actions:[
      {id:'a1',label:'Preserve mesh and application request evidence',description:'Capture both reachability and authorization result.',outcome:'The assessment records a reachable unauthenticated path without falsely claiming successful API authorization.',quality:'good'},
      {id:'a2',label:'Remove the legacy-jobs permissive mesh exception',description:'Require authenticated mesh traffic now that settlement moved.',outcome:'The namespace can no longer originate plaintext/non-mTLS traffic into the mesh.',quality:'good'},
      {id:'a3',label:'Remove obsolete network reachability to payments-api',description:'Delete the legacy-jobs network-policy allowance.',outcome:'The old path is blocked at both network and identity layers.',quality:'good'},
      {id:'a4',label:'Report unauthorized payment changes',description:'Assume the reachable 403 request modified payment data.',outcome:'The report contradicts telemetry showing authorization denied the request.',quality:'bad'}
    ],
    hints:['Reachability is not the same as authorization success. Read both the mesh identity field and HTTP status.','The real weakness is a stale exception plus unnecessary network path, even though the application denied the observed request.','Because the batch workload already migrated, you can remove both the permissive identity exception and the legacy network allowance.'],
    evaluation:[
      {label:'Trust-boundary analysis',groups:[['legacy-jobs'],['PERMISSIVE'],['mtls=false'],['identity','NONE']],supported:'You identify the stale namespace exception as an unauthenticated path to a service that expects verified workload identity.',partial:'You notice the exception but do not connect it to the missing peer identity.',missing:'The mesh trust boundary is not explained.'},
      {label:'Observed result',groups:[['403'],['denied'],['no','payment change']],supported:'You state that the request reached the API but was denied, avoiding unsupported impact claims.',partial:'You mention 403 but still imply successful authorization.',missing:'You treat reachability as compromise.'},
      {label:'Hardening',groups:[['remove','PERMISSIVE'],['network policy'],['batch-settlement','ops-batch']],supported:'You remove the stale mesh exception and obsolete network path after validating the migrated workload.',partial:'You fix one layer but leave the other unnecessary path in place.',missing:'The legacy path remains reachable or unauthenticated.'}
    ]
  },
  {
    id:'C067', title:'One Unit Too Many', subtitle:'A Linux jump host starts a user-level service nobody remembers installing.', tier:'Advanced Linux persistence investigation',
    brief:'A privileged operations jump host shows a recurring outbound connection every time analyst.dev logs in. System services look clean. Determine what starts the process, whether it persists across user sessions, and how to remove it while preserving enough evidence to explain the mechanism.',
    environment:'Glass Harbor / Linux jump host forensic snapshot',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Process tree','Host telemetry','systemd --user launches sync-watch, which launches curl-like network activity.','The process belongs to analyst.dev, not root.'),
      e('ev2','User unit file','Filesystem','~/.config/systemd/user/sync-watch.service exists with WantedBy=default.target.','ExecStart points to ~/.local/bin/sync-watch.'),
      e('ev3','Linger state','Host config','loginctl shows linger enabled for analyst.dev.','The user manager may continue even when the user is not interactively logged in.'),
      e('ev4','Journal history','User journal','The unit starts after enablement two days ago and restarts on failure.','The same destination appears repeatedly.'),
      e('ev5','System service review','Host config','No matching system-level unit exists in /etc/systemd/system.','The persistence mechanism is user-scoped.')
    ],
    logs:[
      {id:'journal',name:'User journal',text:`Sep 12 18:42 systemd[1844]: Started sync-watch.service\nSep 12 18:42 sync-watch[1911]: connect telemetry-cache.test:443\nSep 13 07:51 systemd[1844]: sync-watch.service: Scheduled restart job\nSep 13 07:51 systemd[1844]: Started sync-watch.service`},
      {id:'auth',name:'Login + linger',text:`analyst.dev linger=yes\nlast interactive login=Sep 13 07:49`}
    ],
    terminal:[
      [/^help$/i,'Try: ps tree analyst.dev, systemctl --user list, cat ~/.config/systemd/user/sync-watch.service, loginctl show-user analyst.dev, journal sync-watch'],
      [/^ps tree analyst\.dev$/i,'systemd --user\n  └─ sync-watch\n      └─ network client -> telemetry-cache.test:443'],
      [/^systemctl --user list$/i,'sync-watch.service enabled active running'],
      [/^cat ~\/\.config\/systemd\/user\/sync-watch\.service$/i,'[Service]\nExecStart=/home/analyst.dev/.local/bin/sync-watch\nRestart=always\n[Install]\nWantedBy=default.target'],
      [/^loginctl show-user analyst\.dev$/i,'Linger=yes'],
      [/^journal sync-watch$/i,'enabled Sep 12 18:41; repeated starts and outbound connections; no root-owned unit involved']
    ],
    actions:[
      {id:'a1',label:'Preserve the unit file, binary hash, journal, and process tree',description:'Capture the persistence mechanism before disabling it.',outcome:'The user-level startup chain remains explainable.',quality:'good'},
      {id:'a2',label:'Disable and remove sync-watch.service',description:'Stop the user unit and remove its enablement symlink and executable after preservation.',outcome:'The recurring user-level process no longer starts.',quality:'good'},
      {id:'a3',label:'Review whether analyst.dev needs linger',description:'Disable linger if it is not operationally required.',outcome:'The user manager no longer persists beyond interactive sessions without justification.',quality:'good'},
      {id:'a4',label:'Reinstall all system services',description:'Treat the issue as a root-level systemd compromise despite evidence of a user-scoped unit.',outcome:'The response disrupts the host and misses the actual persistence mechanism.',quality:'bad'}
    ],
    hints:['Systemd can run at both system and user scope. The parent process tells you which one matters.','WantedBy=default.target plus enablement explains startup; linger explains why the user manager may stay alive without an active shell.','Preserve the unit and journal first, then remove the specific user persistence and review whether linger is actually needed.'],
    evaluation:[
      {label:'Persistence mechanism',groups:[['systemd --user','user-level'],['sync-watch.service'],['WantedBy','default.target']],supported:'You identify the enabled user-level systemd unit as the startup mechanism.',partial:'You find the unit but describe it as a system/root service.',missing:'The process startup path is not explained.'},
      {label:'Session persistence',groups:[['Linger','yes'],['continue','logout','session']],supported:'You explain why linger allows the user manager to continue beyond an interactive login.',partial:'You note linger but do not connect it to persistence behavior.',missing:'The host behavior across sessions is unexplained.'},
      {label:'Response',groups:[['preserve'],['disable','remove'],['review','linger']],supported:'You preserve the artifacts, remove the unit safely, and review the lingering user-manager setting.',partial:'You stop the process but leave the startup or linger condition behind.',missing:'The persistence mechanism remains active or evidence is discarded.'}
    ]
  },
  {
    id:'C068', title:'The Parser Went Quiet', subtitle:'Authentication logs still arrive, but the SIEM stopped recognizing failed logons after a schema change.', tier:'Advanced detection engineering + telemetry validation',
    brief:'The SOC reports an impossible drop in failed sign-ins after an identity-provider update. Raw events are still being ingested. Determine why the detection stopped, quantify what is being missed, and repair the pipeline without creating a flood of false positives.',
    environment:'SignalWorks / SIEM ingestion and detection lab',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Old parser','Detection config','The parser expects result="FAILURE" and source_ip.','This matched the previous identity event schema.'),
      e('ev2','New schema sample','Raw log','The provider now emits outcome="DENIED" and client.ip.','The change began at 00:00 UTC.'),
      e('ev3','Ingestion health','Pipeline metric','Raw event volume is normal.','The collection pipeline is not down.'),
      e('ev4','Detection trend','SOC metric','Failed-login alerts fell from ~180/day to 0 exactly at the schema cutover.','Other unrelated detections continue firing.'),
      e('ev5','Benign denial type','Raw log','Policy-based geofence denials also use outcome="DENIED" but event.reason="GEO_POLICY".','A naive rule on DENIED alone would create noise.')
    ],
    logs:[
      {id:'raw',name:'Raw identity events',text:`old: result="FAILURE" source_ip=198.51.100.12 reason=BAD_PASSWORD\nnew: outcome="DENIED" client.ip=198.51.100.12 event.reason="BAD_PASSWORD"\nnew: outcome="DENIED" client.ip=203.0.113.77 event.reason="GEO_POLICY"`},
      {id:'metrics',name:'Pipeline metrics',text:`raw_ingest=normal\nparsed.auth_failed=0 after 00:00\nparsed.auth_success=normal\nalert.auth_bruteforce=0 after 00:00`}
    ],
    terminal:[
      [/^help$/i,'Try: parser show auth, sample old, sample new, count raw DENIED, count raw BAD_PASSWORD, test rule outcome=DENIED, test rule BAD_PASSWORD'],
      [/^parser show auth$/i,'expected fields: result, source_ip, reason\nfailed condition: result==FAILURE'],
      [/^sample old$/i,'result=FAILURE source_ip=198.51.100.12 reason=BAD_PASSWORD'],
      [/^sample new$/i,'outcome=DENIED client.ip=198.51.100.12 event.reason=BAD_PASSWORD'],
      [/^count raw DENIED$/i,'DENIED total=264; BAD_PASSWORD=176; GEO_POLICY=88'],
      [/^count raw BAD_PASSWORD$/i,'176 events since schema cutover'],
      [/^test rule outcome=DENIED$/i,'matches=264; false-positive risk=88 GEO_POLICY events'],
      [/^test rule BAD_PASSWORD$/i,'matches=176; expected failed-password population restored']
    ],
    actions:[
      {id:'a1',label:'Preserve old/new samples and detection metrics',description:'Document the schema cutover and impact before editing the parser.',outcome:'The failure mode and missed interval are measurable.',quality:'good'},
      {id:'a2',label:'Map new fields into the normalized authentication schema',description:'Translate outcome/client.ip/event.reason into the expected normalized fields.',outcome:'Downstream detections receive consistent fields again.',quality:'good'},
      {id:'a3',label:'Backtest the corrected rule against BAD_PASSWORD and GEO_POLICY',description:'Verify coverage and noise before production rollout.',outcome:'The rule restores 176 failed-password events without counting 88 geofence denials.',quality:'good'},
      {id:'a4',label:'Alert on every DENIED event',description:'Use the new outcome field without reason filtering.',outcome:'The SOC receives avoidable geofence-policy noise and loses signal quality.',quality:'bad'}
    ],
    hints:['First decide whether collection failed or normalization failed. Raw volume is your clue.','Schema drift changed both field names and values. Then look at reason codes so you do not turn every denial into a failed-password alert.','A complete repair includes field mapping, backtesting, and documenting the blind interval.'],
    evaluation:[
      {label:'Failure diagnosis',groups:[['schema','change'],['outcome'],['client.ip'],['parser']],supported:'You identify schema drift in normalization rather than an ingestion outage.',partial:'You notice changed fields but do not explain why downstream detections went to zero.',missing:'The pipeline failure mode is not identified.'},
      {label:'Detection quality',groups:[['BAD_PASSWORD'],['GEO_POLICY'],['176'],['88']],supported:'You distinguish malicious-relevant failed passwords from benign policy denials and quantify both populations.',partial:'You restore matches but do not account for false positives.',missing:'The repaired logic would alert on all denials or miss real failures.'},
      {label:'Operational repair',groups:[['normalize','map'],['backtest'],['blind interval','missed']],supported:'You fix the parser, backtest the detection, and document the period of missed visibility.',partial:'You fix the rule but omit testing or historical impact.',missing:'The pipeline remains unreliable or unvalidated.'}
    ]
  },
  {
    id:'C069', title:'Admin Until Logout', subtitle:'A just-in-time admin assignment expired, but the privileged session kept working.', tier:'Advanced privileged-access + session-lifetime assessment',
    brief:'An engineer received a 30-minute just-in-time production admin role. The directory shows the assignment expired on time, yet cloud audit records privileged actions for another 22 minutes from the same session. Determine why the authorization outlived the assignment and how to make future expiry enforceable.',
    environment:'Helix Labs / JIT privileged-access control review',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','JIT assignment','Privileged access','engineer.kai received ProdAdmin from 13:00 to 13:30.','Approval and MFA requirements were satisfied.'),
      e('ev2','Session token','Identity','A privileged session token was issued at 13:04 with a one-hour lifetime.','The token was not revoked when the role assignment expired.'),
      e('ev3','Post-expiry actions','Cloud audit','ProdAdmin actions continue at 13:41 and 13:52 under the same session.','Both actions are within token lifetime but after assignment expiry.'),
      e('ev4','No new elevation','Privileged access log','There is no second JIT approval or role extension.','The continued access came from session lifetime, not a new grant.'),
      e('ev5','Policy option','Identity config','Continuous authorization / token revocation on role expiry is supported but disabled for ProdAdmin.','A pilot has already passed in staging.')
    ],
    logs:[
      {id:'jit',name:'JIT assignment',text:`13:00 role=ProdAdmin user=engineer.kai start\n13:30 role=ProdAdmin user=engineer.kai expired\nextension=none`},
      {id:'audit',name:'Privileged session',text:`13:04 token=session-771 scope=ProdAdmin exp=14:04\n13:18 action=RestartService SUCCESS\n13:41 action=ReadSecretMetadata SUCCESS\n13:52 action=UpdateScaling SUCCESS`}
    ],
    terminal:[
      [/^help$/i,'Try: jit show engineer.kai, token show session-771, cloud audit session-771, policy ProdAdmin, pilot continuous-auth'],
      [/^jit show engineer\.kai$/i,'ProdAdmin 13:00-13:30; MFA=yes; extension=none'],
      [/^token show session-771$/i,'issued=13:04 expires=14:04 role_claim=ProdAdmin revocation_on_role_expiry=false'],
      [/^cloud audit session-771$/i,'13:18 RestartService\n13:41 ReadSecretMetadata\n13:52 UpdateScaling'],
      [/^policy ProdAdmin$/i,'JIT max=30m\ncontinuous authorization=disabled\nsession token max=60m'],
      [/^pilot continuous-auth$/i,'staging result=pass; privileged token revoked within 60s of role expiry']
    ],
    actions:[
      {id:'a1',label:'Preserve assignment, token, and audit correlation',description:'Keep the evidence proving expiry and continued session use.',outcome:'The authorization-lifetime mismatch is documented.',quality:'good'},
      {id:'a2',label:'Revoke the active privileged session',description:'Terminate the session that outlived its assignment.',outcome:'The expired JIT elevation can no longer be exercised.',quality:'good'},
      {id:'a3',label:'Enable revocation/continuous authorization on role expiry',description:'Bind session validity to current privileged assignment state.',outcome:'Future ProdAdmin expiry is enforced instead of waiting for token expiration.',quality:'good'},
      {id:'a4',label:'Increase JIT duration to match one-hour tokens',description:'Make the role assignment as long as the existing token instead of fixing enforcement.',outcome:'The control becomes less restrictive and preserves the root problem.',quality:'bad'}
    ],
    hints:['The directory assignment and the session token have separate lifetimes. Compare their clocks.','No second elevation occurred. The same token simply remained valid after the role assignment expired.','The durable fix is not a longer JIT window; it is revoking or continuously re-evaluating privileged sessions when the grant ends.'],
    evaluation:[
      {label:'Lifetime mismatch',groups:[['13:30'],['14:04'],['token'],['assignment','expired']],supported:'You identify the mismatch between JIT role expiry and the longer-lived privileged session token.',partial:'You notice post-expiry actions but do not explain why they remained authorized.',missing:'The authorization lifetime issue is not reconstructed.'},
      {label:'Evidence discipline',groups:[['no','extension'],['same session','session-771'],['13:41','13:52']],supported:'You use the audit trail to show continued access came from the original session, not a new grant.',partial:'You identify the session but imply an unsupported second elevation.',missing:'The post-expiry activity is not tied to the existing token.'},
      {label:'Control redesign',groups:[['revoke'],['continuous authorization'],['role expiry']],supported:'You terminate the active token and make future privileged sessions track assignment expiry.',partial:'You revoke this session but leave the policy mismatch unchanged.',missing:'The proposed fix leaves privileged access valid beyond JIT expiry.'}
    ]
  },
  {
    id:'C070', title:'Maintenance Window', subtitle:'Three teams saw three different anomalies. Build one evidence-backed incident from identity, cluster, and cloud control-plane data.', tier:'Advanced multi-boundary capstone',
    brief:'During a scheduled maintenance window, operations reports an unusual service-account change, platform engineering notices a diagnostics pod on a production node, and cloud security sees a backup object decrypted. Some events are legitimate maintenance; others are not. Reconstruct the causal chain, separate capability from demonstrated impact, and design containment that closes the reusable trust paths without taking the whole platform offline.',
    environment:'Aster Manufacturing / hybrid identity + Kubernetes + cloud encryption capstone',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Maintenance ticket','Change record','Approved maintenance covers APP-SRV-12 patching and batch-settlement rollout from 22:00–23:00.','It does not include directory delegation changes, privileged diagnostics pods, or backup retrieval.'),
      e('ev2','Directory control change','Directory audit','Account prov.lena changed APP-SRV-12$ delegation to BUILD-NODE-02$ at 22:07.','prov.lena belongs to Workstation-Provisioners, which still has GenericWrite on the promoted production server object.'),
      e('ev3','Server service activity','Authentication','BUILD-NODE-02$ requested service tickets for APP-SRV-12 at 22:10.','This proves use of the new trust relation, not what application data was accessed.'),
      e('ev4','Diagnostics pod','Kubernetes','At 22:18, diag-shell-9 launched on NODE-04 with privileged=true and the containerd socket mounted.','The pod service account itself has read-only Kubernetes RBAC.'),
      e('ev5','Runtime telemetry','Node telemetry','diag-shell-9 listed containers and inspected one container metadata record.','No exec/start/delete action is recorded.'),
      e('ev6','Cloud permission combination','Cloud IAM','Account analyst.ren has GetObject on backup-prod/* and inherited KMS Decrypt through Security-Readers.','Neither permission set is sufficient alone.'),
      e('ev7','Backup access','Cloud audit','At 22:31, analyst.ren retrieved backup-prod/erp-2026-09-14.enc and decrypted its data key.','No bucket listing, IAM changes, or other storage access is recorded.'),
      e('ev8','Legitimate change','Deployment log','batch-settlement deployment to ops-batch completed at 22:42 with verified mesh identity.','This event matches the approved ticket and is not part of the suspicious chain.'),
      e('ev9','Distractor alert','Monitoring','CPU on APP-SRV-09 spiked to 92% at 21:56 and normalized at 22:03.','No identity, node, cloud, or network correlation exists with the later events.')
    ],
    logs:[
      {id:'timeline',name:'Cross-system timeline',text:`21:56 APP-SRV-09 CPU 92% (unrelated, auto-resolved)\n22:07 prov.lena modifies APP-SRV-12$ delegation -> BUILD-NODE-02$\n22:10 BUILD-NODE-02$ service tickets -> APP-SRV-12\n22:18 diag-shell-9 scheduled NODE-04 privileged=true runtime-socket=rw\n22:19 diag-shell-9 ListContainers + InspectContainerMetadata\n22:31 analyst.ren GetObject backup-prod/erp-2026-09-14.enc\n22:31 analyst.ren KMS Decrypt key/backup-prod\n22:42 approved batch-settlement rollout complete`},
      {id:'identity',name:'Directory + cloud identities',text:`prov.lena -> Workstation-Provisioners --GenericWrite--> APP-SRV-12$\nanalyst.ren -> Data-Audit => GetObject backup-prod/*\nanalyst.ren -> SecOps-Contractors -> Security-Readers => KMS Decrypt key/backup-prod`},
      {id:'cluster',name:'Cluster audit',text:`diag-shell-9 namespace=ops-diagnostics privileged=true hostPath=/run/containerd/containerd.sock rw serviceAccount=diag-sa\ndiag-sa RBAC=get,list pods + pods/log only`}
    ],
    terminal:[
      [/^help$/i,'Try: timeline 21:50-22:45, ticket maintenance, ad path prov.lena APP-SRV-12$, ad changes APP-SRV-12$, kerberos client BUILD-NODE-02$, kube manifest diag-shell-9, runtime activity diag-shell-9, cloud effective analyst.ren, cloud audit analyst.ren, correlate APP-SRV-09'],
      [/^timeline 21:50-22:45$/i,'21:56 unrelated CPU alert\n22:07 delegation change\n22:10 new machine trust used\n22:18 privileged diagnostics pod\n22:19 runtime list/inspect\n22:31 backup GetObject + Decrypt\n22:42 approved batch rollout'],
      [/^ticket maintenance$/i,'approved=APP-SRV-12 patching + batch-settlement rollout\nnot approved=delegation changes, privileged runtime pod, backup retrieval'],
      [/^ad path prov\.lena APP-SRV-12\$$/i,'prov.lena -> Workstation-Provisioners --GenericWrite--> APP-SRV-12$'],
      [/^ad changes APP-SRV-12\$$/i,'22:07 delegation [] -> [BUILD-NODE-02$] by prov.lena'],
      [/^kerberos client BUILD-NODE-02\$$/i,'22:10 HTTP/APP-SRV-12 SUCCESS\n22:10 HOST/APP-SRV-12 SUCCESS'],
      [/^kube manifest diag-shell-9$/i,'privileged=true\nhostPath=/run/containerd/containerd.sock rw\nserviceAccount=diag-sa'],
      [/^runtime activity diag-shell-9$/i,'ListContainers SUCCESS\nInspectContainerMetadata SUCCESS\nexec=0 start=0 delete=0'],
      [/^cloud effective analyst\.ren$/i,'GetObject backup-prod/* ALLOW\nKMS Decrypt key/backup-prod ALLOW\nListBucket DENY'],
      [/^cloud audit analyst\.ren$/i,'22:31 GetObject backup-prod/erp-2026-09-14.enc SUCCESS\n22:31 KMS Decrypt key/backup-prod SUCCESS\nother_storage=0 IAM_changes=0'],
      [/^correlate APP-SRV-09$/i,'CPU alert ended before suspicious identity activity; no shared principal, host path, node, cloud session, or network correlation. Treat as unrelated unless new evidence appears.']
    ],
    actions:[
      {id:'a1',label:'Preserve cross-system evidence before changing trust',description:'Capture directory history, Kerberos tickets, pod manifest/runtime telemetry, and cloud IAM/audit records.',outcome:'Each branch remains independently defensible.',quality:'good'},
      {id:'a2',label:'Remove unauthorized server delegation and production GenericWrite path',description:'Restore APP-SRV-12$ and separate workstation provisioning from production server-object control.',outcome:'The machine-trust path is closed at both immediate and root-cause layers.',quality:'good'},
      {id:'a3',label:'Delete the privileged diagnostics pod and block runtime-socket mounts by policy',description:'Remove the live risky workload after preservation and enforce admission controls.',outcome:'The node runtime boundary cannot be recreated through the diagnostics namespace.',quality:'good'},
      {id:'a4',label:'Remove human KMS decrypt access and add key-policy conditions',description:'Break the GetObject + Decrypt combination while preserving approved backup workloads.',outcome:'Analyst object read no longer yields plaintext backup access.',quality:'good'},
      {id:'a5',label:'Keep the approved batch-settlement deployment in service',description:'Do not roll back the verified maintenance change without evidence tying it to the incident.',outcome:'Containment avoids unnecessary outage of a legitimate change.',quality:'good'},
      {id:'a6',label:'Declare full node takeover and enterprise data theft',description:'Generalize from runtime capability and one proven backup retrieval to broader compromise.',outcome:'The report exceeds the evidence and weakens the investigation.',quality:'bad'},
      {id:'a7',label:'Treat the CPU spike as initial access',description:'Anchor the timeline on the earliest alert despite no correlation.',outcome:'The investigation is diverted toward an unrelated performance event.',quality:'bad'}
    ],
    hints:['Start by labeling every event as approved change, suspicious control change, demonstrated use, or unrelated noise. Do not force everything into one story.','There are three independent security-control failures: production computer-object write delegation, a Kubernetes runtime-socket exception, and combined storage/KMS permissions. The evidence does not prove they were all executed by one human actor.','For each branch, separate capability from observed impact: Kerberos tickets show trust use; the pod only listed/inspected runtime metadata; cloud audit proves one specific backup object was retrieved and decrypted.','A strong conclusion can say “coincident suspicious branches during the same window” without inventing a single attacker when identity linkage is absent.','Contain by closing reusable trust paths while preserving the legitimate batch-settlement change and avoiding claims not supported by telemetry.'],
    evaluation:[
      {label:'Timeline + scoping',groups:[['22:07'],['22:18'],['22:31'],['22:42'],['CPU','unrelated']],supported:'You separate the suspicious branches, legitimate deployment, and unrelated CPU alert into a defensible timeline.',partial:'You build most of the timeline but incorrectly include either the CPU alert or approved deployment as causal.',missing:'The incident timeline mixes unrelated and approved activity with suspicious events.'},
      {label:'Directory branch',groups:[['prov.lena'],['Workstation-Provisioners'],['GenericWrite'],['BUILD-NODE-02'],['Kerberos']],supported:'You reconstruct the production computer-object control failure and show the new machine trust was exercised.',partial:'You find the delegation change but miss either its write-permission root cause or ticket use.',missing:'The directory trust branch is not explained.'},
      {label:'Cluster branch',groups:[['diag-shell-9'],['privileged'],['containerd'],['ListContainers'],['no','exec']],supported:'You identify the runtime boundary break and accurately limit observed impact to list/metadata operations.',partial:'You identify the dangerous pod but overstate node takeover or omit what runtime telemetry shows.',missing:'The cluster control failure is not assessed from both configuration and activity.'},
      {label:'Cloud branch',groups:[['GetObject'],['Decrypt'],['erp-2026-09-14.enc'],['ListBucket','DENY']],supported:'You reconstruct the combined cloud permissions and state the one proven backup retrieval/decrypt event precisely.',partial:'You identify backup access but miss how separate roles combined or overstate broader data access.',missing:'The cloud exposure and demonstrated impact are not connected.'},
      {label:'Containment + evidence discipline',groups:[['preserve'],['remove','GenericWrite'],['admission','runtime'],['KMS','condition'],['keep','batch'],['not prove','single attacker']],supported:'You preserve evidence, close each reusable trust path, keep the legitimate deployment, and avoid claiming a unified attacker without linkage.',partial:'You contain most branches but either disrupt legitimate maintenance or make an unsupported attribution/impact claim.',missing:'The response is broad, destructive, or leaves one of the demonstrated trust failures reusable.'}
    ]
  },

  {
    id:'C071', title:'The Second Name', subtitle:'A disabled administrator account still authenticates with a certificate mapped to an identity that nobody reviewed.', tier:'Advanced identity + certificate mapping',
    brief:'A former infrastructure administrator was disabled in the directory after an internal transfer, yet a certificate-authenticated VPN session appeared under the same human identity two days later. Determine which identity object actually authenticated, why normal offboarding missed it, and how to fix certificate mapping without breaking legitimate smart-card users.',
    environment:'Northbridge Energy / directory certificate authentication lab',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Disabled user','Directory state','User admin.ines is disabled and has no active password sign-ins after the transfer.','The normal user object was disabled correctly at 17:10 on September 11.'),
      e('ev2','Certificate VPN session','VPN log','A certificate-authenticated VPN session at 08:22 resolved to admin.ines.','Authentication method is certificate. No password, MFA push, or refresh token event exists.'),
      e('ev3','Shadow service identity','Directory object','svc-netops-old remains enabled and has an explicit certificate identity mapping left from a migration.','The mapped certificate subject still contains CN=Ines-Ramos-Admin.'),
      e('ev4','Group membership','Directory ACL','svc-netops-old is still a member of Remote-Network-Admins.','The service identity was excluded from the normal HR offboarding workflow.'),
      e('ev5','Certificate inventory','PKI record','Certificate serial 44A19 is valid until December and was never revoked.','The certificate was issued for migration testing and should have been retired.'),
      e('ev6','Usage limit','VPN telemetry','The certificate session opened the network console and read device configuration.','No configuration changes or additional sessions are recorded.')
    ],
    logs:[
      {id:'vpn',name:'VPN authentication',text:`08:22:14 cert serial=44A19 subject="CN=Ines-Ramos-Admin" mapped_account=svc-netops-old result=SUCCESS\n08:22:19 effective_group=Remote-Network-Admins\n08:26:04 app=network-console action=ReadRunningConfig device=EDGE-03\n08:31:44 session=DISCONNECT`},
      {id:'directory',name:'Directory state',text:`admin.ines enabled=false groups=[]\nsvc-netops-old enabled=true groups=[Remote-Network-Admins]\nsvc-netops-old certificate_mapping="CN=Ines-Ramos-Admin"`},
      {id:'pki',name:'Certificate registry',text:`serial=44A19 issued_to=Migration NetOps expires=2026-12-15 revoked=false purpose=client-auth`}
    ],
    terminal:[
      [/^help$/i,'Try: user show admin.ines, user show svc-netops-old, cert show 44A19, cert mappings svc-netops-old, vpn session 08:22, groups svc-netops-old'],
      [/^user show admin\.ines$/i,'enabled=false\npassword_signins_after_transfer=0\ncertificate_mappings=none'],
      [/^user show svc-netops-old$/i,'enabled=true\ntype=service\ngroups=Remote-Network-Admins\nowner=unassigned'],
      [/^cert show 44A19$/i,'serial=44A19\nsubject=CN=Ines-Ramos-Admin\nclientAuth=true\nrevoked=false\nexpires=2026-12-15'],
      [/^cert mappings svc-netops-old$/i,'explicit mapping: CN=Ines-Ramos-Admin -> svc-netops-old'],
      [/^vpn session 08:22$/i,'certificate 44A19 -> svc-netops-old -> Remote-Network-Admins\nactions=ReadRunningConfig EDGE-03 only'],
      [/^groups svc-netops-old$/i,'Remote-Network-Admins']
    ],
    actions:[
      {id:'a1',label:'Preserve VPN, mapping, and certificate records',description:'Capture the exact certificate-to-account resolution before modifying identity state.',outcome:'The authentication chain remains provable after containment.',quality:'good'},
      {id:'a2',label:'Revoke certificate 44A19 and disable svc-netops-old',description:'Terminate the live certificate path and retire the orphaned identity.',outcome:'The stale mapped credential can no longer authenticate.',quality:'good'},
      {id:'a3',label:'Inventory explicit certificate mappings and identity owners',description:'Find similar service or migration identities outside human offboarding.',outcome:'Other certificate-backed shadow identities can be reviewed before expiry becomes the only control.',quality:'good'},
      {id:'a4',label:'Disable certificate authentication for every user',description:'Remove the entire authentication method to avoid reviewing mappings.',outcome:'Legitimate smart-card workflows break and the root governance failure is not fixed.',quality:'bad'},
      {id:'a5',label:'Remove privileged group membership from orphaned service identities',description:'Require named ownership and current business justification for certificate-authenticated admin groups.',outcome:'Future stale mappings have less useful privilege even before revocation.',quality:'good'}
    ],
    hints:['The disabled human account is not the object the VPN actually authenticated. Follow the certificate mapping.','Certificate identity, directory identity, and displayed human name are three different things here.','The durable fix needs certificate revocation plus lifecycle governance for explicit mappings and non-human privileged identities.'],
    evaluation:[
      {label:'Authentication chain',groups:[['44A19'],['svc-netops-old'],['certificate','mapping'],['Remote-Network-Admins']],supported:'You reconstruct certificate 44A19 mapping to the still-enabled service identity and inheriting its privileged group.',partial:'You identify the stale certificate but do not trace the mapped account and effective privilege.',missing:'The certificate-backed identity path is not reconstructed.'},
      {label:'Offboarding gap',groups:[['service identity','orphan'],['HR','offboarding'],['owner','unassigned']],supported:'You explain why disabling the human account did not retire the non-human mapped identity.',partial:'You call it stale access without identifying the lifecycle boundary that missed it.',missing:'The lifecycle failure is not explained.'},
      {label:'Impact discipline',groups:[['ReadRunningConfig','read'],['no','change'],['one session']],supported:'You limit observed impact to the configuration read actually recorded.',partial:'You identify the privileged session but overstate device modification.',missing:'Observed post-authentication activity is not scoped.'},
      {label:'Remediation',groups:[['revoke','44A19'],['disable','svc-netops-old'],['inventory','mapping'],['ownership','group']],supported:'You close the immediate certificate path and redesign mapping/ownership governance.',partial:'You contain the one certificate but leave the same lifecycle pattern reusable.',missing:'The proposed fix does not close the certificate identity problem.'}
    ]
  },
  {
    id:'C072', title:'Passport Pattern', subtitle:'A cloud role trusts a workload pattern that matches more identities than the team intended.', tier:'Advanced cloud workload identity assessment',
    brief:'During an authorized review, a staging deployment can obtain a production-read cloud role even though no static cloud keys exist. Determine how the federated trust rule expands access, prove the condition using the lab simulator, and redesign the trust boundary without replacing workload identity with long-lived secrets.',
    environment:'Lattice Health / CI OIDC + cloud IAM simulation',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Federated role','Cloud IAM','Role ProdArtifactReader accepts OIDC tokens from the company CI provider.','The role itself only reads production release artifacts.'),
      e('ev2','Broad subject rule','Trust policy','The subject condition is repo:platform/*:environment:* instead of the intended production release workflow.','Any repository under platform and any environment string can satisfy the wildcard.'),
      e('ev3','Staging token','OIDC claim set','A staging job in platform/tools presents subject repo:platform/tools:environment:staging.','Issuer and audience are valid for the cloud provider.'),
      e('ev4','Safe simulation','IAM simulator','The staging claim set is allowed to assume ProdArtifactReader.','No real artifact is downloaded during the assessment.'),
      e('ev5','Intended production claim','Deployment config','The only approved subject is repo:platform/release:environment:production.','Production release also uses a dedicated workflow reference claim.'),
      e('ev6','No static keys','Secrets inventory','The pipeline contains no long-lived cloud access key.','Replacing OIDC with static keys would make credential hygiene worse.')
    ],
    logs:[
      {id:'oidc',name:'OIDC claims',text:`staging: iss=https://ci.lattice.test aud=cloud-sts sub=repo:platform/tools:environment:staging workflow_ref=tools/test.yml@main\nproduction: iss=https://ci.lattice.test aud=cloud-sts sub=repo:platform/release:environment:production workflow_ref=release/deploy.yml@refs/tags/*`},
      {id:'iam',name:'Trust policy summary',text:`Role=ProdArtifactReader\nissuer=https://ci.lattice.test\naud=cloud-sts\nsubject=repo:platform/*:environment:*\nworkflow_ref condition=none`}
    ],
    terminal:[
      [/^help$/i,'Try: oidc show staging, role trust ProdArtifactReader, iam simulate staging ProdArtifactReader, oidc show production, policy intended'],
      [/^oidc show staging$/i,'iss=https://ci.lattice.test\naud=cloud-sts\nsub=repo:platform/tools:environment:staging\nworkflow_ref=tools/test.yml@main'],
      [/^role trust ProdArtifactReader$/i,'issuer exact\naudience exact\nsubject=repo:platform/*:environment:*\nworkflow_ref=not checked'],
      [/^iam simulate staging ProdArtifactReader$/i,'ALLOW assume-role\nreason=subject wildcard matched staging job'],
      [/^oidc show production$/i,'sub=repo:platform/release:environment:production\nworkflow_ref=release/deploy.yml@refs/tags/v4.8.1'],
      [/^policy intended$/i,'subject must equal repo:platform/release:environment:production\nworkflow_ref must match release/deploy.yml@refs/tags/*']
    ],
    actions:[
      {id:'a1',label:'Preserve current claims and trust policy',description:'Record the exact staging and production claim sets before policy changes.',outcome:'The overbroad match is reproducible and reviewable.',quality:'good'},
      {id:'a2',label:'Constrain subject and workflow reference claims',description:'Bind the role to the exact production repository, environment, and approved workflow.',outcome:'Staging workloads no longer satisfy the production role trust.',quality:'good'},
      {id:'a3',label:'Keep OIDC and remove static cloud credentials',description:'Retain short-lived federation rather than introducing long-lived keys.',outcome:'The credential model remains short-lived while trust scope is corrected.',quality:'good'},
      {id:'a4',label:'Trust every repository under the organization',description:'Simplify the policy by making the wildcard broader.',outcome:'More CI workloads gain production role eligibility.',quality:'bad'},
      {id:'a5',label:'Regression-test denied and approved claim sets',description:'Verify staging is denied while the production release workflow remains allowed.',outcome:'The policy change proves both security and operational continuity.',quality:'good'}
    ],
    hints:['There is no leaked key in this case. The credential is minted from a trust decision.','Compare the staging subject with the wildcard in the role trust policy.','A strong fix keeps short-lived workload federation and narrows which claims are allowed to mint the production role.'],
    evaluation:[
      {label:'Trust expansion',groups:[['repo:platform/*'],['staging'],['wildcard'],['ALLOW']],supported:'You show that the wildcard subject rule admits the staging workload.',partial:'You identify a broad trust rule without proving which staging claim matches it.',missing:'The workload identity trust failure is not demonstrated.'},
      {label:'Credential model',groups:[['OIDC','short-lived'],['no','static key']],supported:'You distinguish the trust-policy flaw from the otherwise desirable short-lived credential model.',partial:'You fix the role but imply static credentials are preferable.',missing:'The credential architecture is misunderstood.'},
      {label:'Hardening',groups:[['exact','production'],['workflow_ref'],['regression','deny']],supported:'You narrow the trust to the intended production workflow and test allowed/denied paths.',partial:'You narrow only one claim and leave another broad route.',missing:'The proposed trust policy remains overbroad.'}
    ]
  },
  {
    id:'C073', title:'Rotated', subtitle:'Everyone says the secret was rotated. One old version still works.', tier:'Advanced secret lifecycle + application security',
    brief:'A database credential was rotated after exposure in a test log. Security expects the old password to be dead, but authentication telemetry shows successful use from a retired worker. Reconstruct why rotation was incomplete and design a zero-surprise rotation process that does not cause unnecessary outage.',
    environment:'Quill Commerce / secret manager + database authentication lab',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','New secret version','Secret manager','db/orders/service has current version v19 created at 10:00.','Applications in the main cluster refreshed successfully.'),
      e('ev2','Old database principal','Database auth','Password generation v18 remains valid on database account orders_svc_legacy.','The database migration created a second principal instead of replacing the old one.'),
      e('ev3','Retired worker config','Host snapshot','WORKER-07 still references orders_svc_legacy from a local environment file.','The worker was removed from orchestration but never decommissioned.'),
      e('ev4','Successful old login','Database log','WORKER-07 authenticated as orders_svc_legacy at 13:14 after v19 became current.','It ran one SELECT health query and disconnected.'),
      e('ev5','Rotation runbook','Operations note','The runbook rotates the secret-manager value but does not inventory parallel database principals or offline hosts.','Rotation success is currently defined as “new app pods healthy.”'),
      e('ev6','Dependency test','Staging result','Disabling orders_svc_legacy in staging does not affect supported workloads.','The identity is no longer required by the current architecture.')
    ],
    logs:[
      {id:'db',name:'Database authentication',text:`10:00 v19 activated for principal orders_svc\n10:03 main-cluster orders_svc SUCCESS\n13:14 WORKER-07 principal=orders_svc_legacy SUCCESS\n13:14 query="SELECT 1"\n13:15 disconnect`},
      {id:'inventory',name:'Credential inventory',text:`orders_svc -> secret-manager db/orders/service v19\norders_svc_legacy -> local env /opt/worker/.env generation=v18\nWORKER-07 state=retired powered_on=true`}
    ],
    terminal:[
      [/^help$/i,'Try: secret versions db/orders/service, db principals orders, host show WORKER-07, db audit orders_svc_legacy, rotation runbook'],
      [/^secret versions db\/orders\/service$/i,'v19 CURRENT created=10:00\nv18 PREVIOUS disabled_in_secret_manager=true'],
      [/^db principals orders$/i,'orders_svc active auth=managed-current\norders_svc_legacy active auth=legacy-password generation=v18'],
      [/^host show WORKER-07$/i,'state=retired powered_on=true\nconfig=/opt/worker/.env\nprincipal=orders_svc_legacy'],
      [/^db audit orders_svc_legacy$/i,'13:14 source=WORKER-07 login=SUCCESS\nquery=SELECT 1\nother_queries=0'],
      [/^rotation runbook$/i,'1 create new secret version\n2 restart supported pods\n3 verify health\nmissing: principal inventory, stale-host inventory, old-credential disablement test']
    ],
    actions:[
      {id:'a1',label:'Preserve old-principal and host evidence',description:'Capture database authentication and WORKER-07 configuration before shutdown.',outcome:'The post-rotation use of the stale credential remains provable.',quality:'good'},
      {id:'a2',label:'Disable orders_svc_legacy after dependency validation',description:'Remove the old database authentication path that staging proved unnecessary.',outcome:'Generation v18 can no longer authenticate to the database.',quality:'good'},
      {id:'a3',label:'Decommission retired WORKER-07',description:'Remove the unmanaged host after preserving its configuration and activity.',outcome:'The stale worker can no longer reuse local credentials.',quality:'good'},
      {id:'a4',label:'Define rotation as revocation plus dependency verification',description:'Inventory all principals/consumers, activate the new credential, validate them, then invalidate every superseded credential.',outcome:'Future rotations end with old access paths provably dead.',quality:'good'},
      {id:'a5',label:'Rotate v19 again without touching the legacy principal',description:'Generate another current secret-manager value.',outcome:'orders_svc_legacy remains valid and the root problem persists.',quality:'bad'}
    ],
    hints:['“Current in the secret manager” does not mean every credential accepted by the database has changed.','Trace authentication by database principal, not just secret-manager version number.','A complete rotation ends when every superseded credential and forgotten consumer is either disabled or explicitly justified.'],
    evaluation:[
      {label:'Incomplete rotation',groups:[['orders_svc_legacy'],['v18'],['still','valid'],['database principal']],supported:'You identify the parallel legacy database principal as the surviving credential path.',partial:'You know an old credential works but do not explain why secret-manager rotation failed to revoke it.',missing:'The incomplete rotation mechanism is not explained.'},
      {label:'Observed use',groups:[['WORKER-07'],['13:14'],['SELECT 1']],supported:'You scope post-rotation use to the retired worker and the one recorded health query.',partial:'You identify the old login but overstate database activity.',missing:'The stale credential use is not tied to evidence.'},
      {label:'Lifecycle redesign',groups:[['inventory','principal'],['consumer','host'],['disable','revoke'],['verify','dependency']],supported:'You redesign rotation around both new-secret rollout and provable invalidation of old consumers/credentials.',partial:'You disable this instance without improving the rotation process.',missing:'Future rotations would repeat the same blind spot.'}
    ]
  },
  {
    id:'C074', title:'Green Console', subtitle:'The endpoint dashboard says healthy. The host telemetry says the sensor stopped seeing a protected path.', tier:'Advanced endpoint control validation',
    brief:'An engineering laptop is shown as healthy in the endpoint console, but process telemetry disappears whenever tools run from one build directory. Determine whether this is malware, sensor failure, or policy behavior; validate the control safely; and harden the exception without breaking compiler performance.',
    environment:'Helix Robotics / endpoint telemetry + policy lab',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Healthy sensor','EDR status','Sensor service remained online and checked in every five minutes.','There is no service-stop or uninstall event.'),
      e('ev2','Broad exclusion','Endpoint policy','C:\\BuildCache\\* is excluded from file scanning and process telemetry because of an old performance workaround.','The exclusion applies to all files and executables under the directory.'),
      e('ev3','Benign reproduction','Validation run','A signed internal test executable produces telemetry from C:\\Tools but not from C:\\BuildCache.','The same binary and arguments are used in both locations.'),
      e('ev4','Performance data','Engineering metric','Only compiler object files need reduced scanning; executable content does not require exclusion.','A narrower extension/path policy passes performance testing.'),
      e('ev5','Suspicious artifact','Host snapshot','unknown-helper.exe exists in C:\\BuildCache\\tmp but there is no execution evidence retained because of the telemetry exception.','Hash reputation is unknown in the isolated lab. Presence alone does not prove execution.'),
      e('ev6','No service tamper','Windows event','No administrative policy-change event originates from the laptop.','The exclusion was centrally deployed three months ago.')
    ],
    logs:[
      {id:'edr',name:'Endpoint status',text:`09:00 sensor=online policy=v183\n09:05 heartbeat ok\n09:10 heartbeat ok\n09:15 heartbeat ok\nprocess telemetry: C:\\Tools\\trace-test.exe PRESENT\nprocess telemetry: C:\\BuildCache\\trace-test.exe ABSENT`},
      {id:'policy',name:'Policy',text:`exclusion path=C:\\BuildCache\\*\nfile_scan=off\nprocess_telemetry=off\nreason=compiler performance workaround 2025-11`}
    ],
    terminal:[
      [/^help$/i,'Try: sensor status, policy exclusions, validate telemetry C:\\Tools, validate telemetry C:\\BuildCache, perf test narrow, file show unknown-helper.exe'],
      [/^sensor status$/i,'service=running\nheartbeat=healthy\nlast_policy=v183'],
      [/^policy exclusions$/i,'C:\\BuildCache\\* => file_scan off; process_telemetry off'],
      [/^validate telemetry C:\\Tools$/i,'signed trace-test.exe -> process event PRESENT'],
      [/^validate telemetry C:\\BuildCache$/i,'signed trace-test.exe -> process event ABSENT due to policy exclusion'],
      [/^perf test narrow$/i,'exclude object-cache *.obj/*.pch scanning only; retain process telemetry => build time +0.7% PASS'],
      [/^file show unknown-helper\.exe$/i,'path=C:\\BuildCache\\tmp\\unknown-helper.exe\nhash=training-unknown\nexecution_evidence=unavailable\nconclusion=presence only']
    ],
    actions:[
      {id:'a1',label:'Preserve policy and host artifacts',description:'Capture the exclusion configuration and unknown file before changing coverage.',outcome:'The detection gap and artifact state remain reviewable.',quality:'good'},
      {id:'a2',label:'Replace broad path exclusion with narrow file-type/performance controls',description:'Keep only the compiler cache optimization that testing shows is needed.',outcome:'Executable process telemetry returns while acceptable build performance is preserved.',quality:'good'},
      {id:'a3',label:'Backtest other hosts using the same exclusion',description:'Find executions/artifacts under BuildCache using whatever independent telemetry remains.',outcome:'Fleet scope can be assessed rather than assuming a single-laptop issue.',quality:'good'},
      {id:'a4',label:'Declare unknown-helper.exe confirmed malware',description:'Treat file presence as proof of malicious execution.',outcome:'The report exceeds the available evidence.',quality:'bad'},
      {id:'a5',label:'Disable endpoint protection during builds',description:'Avoid performance impact by turning the sensor off entirely.',outcome:'The detection gap becomes larger and intentional.',quality:'bad'}
    ],
    hints:['The sensor is online. Ask whether a policy can make “healthy” coexist with missing telemetry.','Use the same benign executable in two paths to isolate the variable.','Do not turn the unknown file into a story the evidence cannot support. The proven issue is a broad visibility exception.'],
    evaluation:[
      {label:'Root cause',groups:[['BuildCache'],['exclusion'],['process telemetry','off'],['sensor','online']],supported:'You show that policy—not sensor shutdown—created the blind path.',partial:'You identify missing telemetry but not why the console remained healthy.',missing:'The endpoint visibility failure is not explained.'},
      {label:'Safe validation',groups:[['trace-test'],['Tools'],['BuildCache'],['same binary']],supported:'You use the controlled reproduction to prove the path-dependent detection gap.',partial:'You infer the exclusion effect without using the available comparison.',missing:'The control condition is not validated.'},
      {label:'Evidence discipline',groups:[['unknown-helper'],['presence'],['not prove','execution']],supported:'You explicitly separate suspicious file presence from unobserved execution.',partial:'You hedge but still imply confirmed compromise.',missing:'The conclusion overstates the unknown artifact.'},
      {label:'Hardening',groups:[['narrow','file type'],['retain','process telemetry'],['performance'],['backtest']],supported:'You restore executable visibility while preserving the measured build requirement and scope the fleet.',partial:'You remove the exclusion without considering performance or fleet scope.',missing:'The policy remains broadly blind or operationally unusable.'}
    ]
  },
  {
    id:'C075', title:'Caller ID', subtitle:'A backend accepts a service identity header from any host that can reach it.', tier:'Advanced service-to-service authorization assessment',
    brief:'An internal payments API is supposed to accept requests only from the settlement service. During an authorized test, a diagnostic host can reach the backend directly. Determine whether network reachability alone is enough to impersonate the service, prove the authorization weakness with the simulator, and redesign identity verification without depending on a spoofable header.',
    environment:'Cinder Payments / internal API + service identity lab',
    tools:['overview','browser','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Expected architecture','Service diagram','Gateway authenticates workloads and adds X-Service-Identity=settlement before forwarding to payments-api.','The backend team assumes only the gateway can reach port 8443.'),
      e('ev2','Direct route','Network test','DIAG-02 can connect directly to payments-api:8443 due to a temporary troubleshooting ACL.','The ACL was never removed.'),
      e('ev3','Header authorization','Application config','payments-api authorizes /internal/reconcile when X-Service-Identity equals settlement.','The backend does not verify that the header was inserted by an authenticated gateway.'),
      e('ev4','Safe request simulation','Training request','A diagnostic-host request with the settlement header receives 200 DRY_RUN for reconcile preview.','The simulator prevents state-changing settlement operations.'),
      e('ev5','Gateway identity','Gateway config','The gateway supports mTLS client identity and strips inbound identity headers.','The secure path already has stronger identity data available.'),
      e('ev6','No production change','Audit','The assessment produced preview data only.','No payment or reconciliation state was changed.')
    ],
    browser:[
      {id:'b1',title:'Architecture note',url:'https://docs.cinder.test/payments-identity',body:'Expected: workload mTLS -> gateway -> payments-api. Gateway derives service identity and strips caller-supplied identity headers.'},
      {id:'b2',title:'Dry-run API response',url:'https://payments-api.internal/reconcile?dry_run=1',body:'200 OK\nmode=DRY_RUN\ncaller=settlement\npreview_batches=3\ntraining environment: no state change allowed'}
    ],
    logs:[
      {id:'net',name:'Network reachability',text:`DIAG-02 -> gateway:443 ALLOW\nDIAG-02 -> payments-api:8443 ALLOW temporary-rule NET-991\nnormal app networks -> payments-api:8443 gateway-only expected`},
      {id:'app',name:'Application decision',text:`request source=DIAG-02 direct=true header[X-Service-Identity]=settlement\nauthorization rule: header == settlement => allow /internal/reconcile\nresponse=200 mode=DRY_RUN`}
    ],
    terminal:[
      [/^help$/i,'Try: route test DIAG-02 payments-api 8443, api auth rule reconcile, request dryrun no-header, request dryrun settlement-header, gateway identity config, acl show NET-991'],
      [/^route test DIAG-02 payments-api 8443$/i,'ALLOW via temporary ACL NET-991'],
      [/^api auth rule reconcile$/i,'if X-Service-Identity == settlement => ALLOW\nsource/gateway proof=none'],
      [/^request dryrun no-header$/i,'403 Forbidden'],
      [/^request dryrun settlement-header$/i,'200 OK DRY_RUN preview_batches=3'],
      [/^gateway identity config$/i,'mTLS client verified=true\nstrip inbound X-Service-Identity=true\nderive identity from verified workload cert=true'],
      [/^acl show NET-991$/i,'source=diagnostics subnet destination=payments-api:8443 action=ALLOW expires=none owner=former-contractor']
    ],
    actions:[
      {id:'a1',label:'Preserve request and ACL evidence',description:'Capture the direct route and dry-run authorization decision.',outcome:'The weakness is demonstrated without changing settlement state.',quality:'good'},
      {id:'a2',label:'Remove the stale direct diagnostic ACL',description:'Restore the expected gateway-only network path.',outcome:'DIAG-02 can no longer bypass the identity-aware gateway.',quality:'good'},
      {id:'a3',label:'Bind backend authorization to verified workload identity',description:'Use authenticated gateway/mTLS identity, not caller-controlled header text.',outcome:'A direct caller cannot impersonate settlement by supplying a header.',quality:'good'},
      {id:'a4',label:'Rename X-Service-Identity to a secret-looking header',description:'Keep trusting user-supplied text but make the name less obvious.',outcome:'The authorization remains spoofable by any caller that learns the header.',quality:'bad'},
      {id:'a5',label:'Add a regression test for direct-route denial and header stripping',description:'Verify both network and application trust boundaries in CI/staging.',outcome:'Future troubleshooting exceptions are less likely to silently recreate the bypass.',quality:'good'}
    ],
    hints:['There are two independent assumptions: who can reach the backend, and how the backend knows who the caller is.','The safe dry-run proves that caller-controlled text is enough for authorization when the gateway is bypassed.','Defense in depth means removing the direct route and making the backend rely on cryptographically verified workload identity.'],
    evaluation:[
      {label:'Bypass path',groups:[['DIAG-02'],['NET-991'],['8443'],['direct']],supported:'You identify the stale diagnostic route that bypasses the intended gateway.',partial:'You find direct reachability but not the specific stale control that enables it.',missing:'The network bypass is not reconstructed.'},
      {label:'Impersonation flaw',groups:[['X-Service-Identity'],['settlement'],['200'],['spoof','caller-controlled']],supported:'You prove the backend trusts a caller-supplied service identity value.',partial:'You identify weak header trust but do not connect it to the dry-run result.',missing:'The authorization flaw is not demonstrated.'},
      {label:'Hardening',groups:[['mTLS','verified'],['remove','ACL'],['strip','header'],['regression']],supported:'You restore gateway-only reachability and bind authorization to verified workload identity with regression coverage.',partial:'You fix only routing or only identity verification.',missing:'The service can still be impersonated through one of the trust paths.'}
    ]
  },
  {
    id:'C076', title:'No Way Out', subtitle:'A server that should only talk to three dependencies can reach almost anything.', tier:'Advanced network egress assessment',
    brief:'A claims-processing server is considered low risk because inbound access is tightly restricted. During an authorized architecture review, test whether outbound policy actually limits where a compromised service could communicate, distinguish DNS from direct egress controls, and build a least-privilege rule set without breaking required dependencies.',
    environment:'Mosaic Insurance / application egress simulation',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Declared dependencies','Architecture','CLAIMS-APP needs db.internal:5432, queue.internal:5671, and updates.vendor.test:443.','No other outbound destination is required by the service owner.'),
      e('ev2','Firewall policy','Network config','Outbound rule allows any destination on TCP 443 plus internal networks.','The team assumed “HTTPS only” was sufficient containment.'),
      e('ev3','Controlled external probe','Assessment result','CLAIMS-APP reaches sink.training.test:443 successfully.','The sink is a fictional test endpoint that records only connection metadata.'),
      e('ev4','Direct-IP probe','Assessment result','CLAIMS-APP reaches 203.0.113.77:443 even when DNS is bypassed.','Blocking suspicious DNS alone would not enforce destination restrictions.'),
      e('ev5','Required vendor','Dependency test','updates.vendor.test resolves to a documented vendor range and passes certificate validation.','A destination allowlist can preserve the update path.'),
      e('ev6','Internal scope','Network design','Database and queue are reachable only on their required ports.','The main gap is broad internet egress, not east-west access in this case.')
    ],
    logs:[
      {id:'fw',name:'Firewall decisions',text:`CLAIMS-APP -> db.internal:5432 ALLOW required\nCLAIMS-APP -> queue.internal:5671 ALLOW required\nCLAIMS-APP -> updates.vendor.test:443 ALLOW required\nCLAIMS-APP -> sink.training.test:443 ALLOW broad-https\nCLAIMS-APP -> 203.0.113.77:443 ALLOW broad-https`},
      {id:'dns',name:'Resolver log',text:`updates.vendor.test -> 198.51.100.40\nsink.training.test -> 203.0.113.77\nDirect-IP test generated no DNS query`}
    ],
    terminal:[
      [/^help$/i,'Try: deps CLAIMS-APP, egress test sink.training.test 443, egress test 203.0.113.77 443, firewall outbound CLAIMS-APP, vendor ranges updates.vendor.test, regression required'],
      [/^deps CLAIMS-APP$/i,'db.internal:5432\nqueue.internal:5671\nupdates.vendor.test:443'],
      [/^egress test sink\.training\.test 443$/i,'ALLOW connection established to training sink'],
      [/^egress test 203\.0\.113\.77 443$/i,'ALLOW direct-IP connection established'],
      [/^firewall outbound CLAIMS-APP$/i,'internal required ports + ANY destination tcp/443'],
      [/^vendor ranges updates\.vendor\.test$/i,'198.51.100.32/28 documented; TLS hostname verification required'],
      [/^regression required$/i,'db PASS\nqueue PASS\nvendor update PASS\ntraining sink expected DENY after proposed policy']
    ],
    actions:[
      {id:'a1',label:'Preserve current firewall and probe results',description:'Record the exact broad rule and controlled test outcomes.',outcome:'The egress exposure is documented without using arbitrary external systems.',quality:'good'},
      {id:'a2',label:'Replace any-HTTPS with destination-specific egress',description:'Allow required internal services and documented vendor endpoints only.',outcome:'The server loses generic outbound internet reachability while dependencies remain available.',quality:'good'},
      {id:'a3',label:'Control DNS and direct-IP paths',description:'Use resolver policy plus network destination enforcement rather than DNS filtering alone.',outcome:'Bypassing DNS no longer bypasses egress policy.',quality:'good'},
      {id:'a4',label:'Block all outbound traffic permanently',description:'Treat zero egress as the only safe design.',outcome:'Required queue, database, and update dependencies fail.',quality:'bad'},
      {id:'a5',label:'Monitor denied egress after rollout',description:'Alert on unexpected destinations and review exceptions through a change process.',outcome:'New dependency needs become visible instead of silently reopening any-HTTPS.',quality:'good'}
    ],
    hints:['Inbound restrictions do not tell you what a compromised workload can send outbound.','“HTTPS only” constrains a port, not a destination. Test both hostname and direct-IP paths.','A practical fix starts from the three real dependencies and adds monitored exceptions deliberately.'],
    evaluation:[
      {label:'Egress gap',groups:[['ANY','443'],['sink.training.test'],['203.0.113.77'],['ALLOW']],supported:'You demonstrate that broad TCP/443 egress permits arbitrary destinations, including direct IP.',partial:'You find external HTTPS access but miss the direct-IP implication.',missing:'The outbound trust boundary is not assessed.'},
      {label:'DNS distinction',groups:[['DNS'],['direct IP'],['not enough','alone']],supported:'You explain why DNS filtering alone cannot enforce the required destination policy.',partial:'You recommend DNS controls without addressing direct egress enforcement.',missing:'The DNS/network-control distinction is absent.'},
      {label:'Least privilege',groups:[['db.internal','5432'],['queue.internal','5671'],['updates.vendor.test','443'],['deny','other']],supported:'You derive egress policy from real dependencies and preserve required traffic.',partial:'You restrict egress but omit a required dependency or leave broad HTTPS.',missing:'The proposed policy is either broad or breaks the application.'}
    ]
  },
  {
    id:'C077', title:'Environment', subtitle:'A root service is protected. One of the files it trusts is not.', tier:'Advanced Linux privilege boundary assessment',
    brief:'A deployment team can edit an environment file used by a root-running systemd service. They cannot modify the service binary or unit file. Determine whether that still crosses a privilege boundary, validate the risk with a harmless training variable, and redesign permissions while preserving deploy-time configuration changes.',
    environment:'Orchid Data / Linux systemd service lab',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Root service','systemd config','orchid-exporter.service runs as root.','The binary is root-owned and not writable by deployers.'),
      e('ev2','Environment file','systemd config','The unit loads EnvironmentFile=/etc/orchid/exporter.env.','systemd reads the file when the service starts.'),
      e('ev3','Writable configuration','Filesystem','exporter.env is group-writable by deployers.','Deployers legitimately need to change LOG_LEVEL and EXPORT_REGION.'),
      e('ev4','Unsafe variable','Application behavior','Exporter supports PRE_HOOK as a command path executed during startup.','The deployment documentation never intended deployers to control PRE_HOOK.'),
      e('ev5','Harmless proof','Training restart','Setting PRE_HOOK=/usr/local/bin/proof-marker causes root-owned marker /var/lib/orchid/proof.txt to be created in the simulator.','The proof-marker binary only writes the fixed marker and cannot execute arbitrary input.'),
      e('ev6','Safer configuration path','Design note','LOG_LEVEL and EXPORT_REGION can be moved into a validated drop-in generator owned by root.','The deployment UI already supports an allowlist of approved keys.')
    ],
    logs:[
      {id:'systemd',name:'Service startup',text:`10:41 systemd start orchid-exporter.service uid=0\n10:41 load EnvironmentFile=/etc/orchid/exporter.env\n10:41 PRE_HOOK=/usr/local/bin/proof-marker\n10:41 proof-marker created /var/lib/orchid/proof.txt owner=root\n10:41 exporter started`},
      {id:'fs',name:'Permissions',text:`/usr/local/bin/orchid-exporter root:root 0755\n/etc/systemd/system/orchid-exporter.service root:root 0644\n/etc/orchid/exporter.env root:deployers 0664`}
    ],
    terminal:[
      [/^help$/i,'Try: systemctl cat orchid-exporter, ls -l /etc/orchid/exporter.env, cat /etc/orchid/exporter.env, app config keys, proof show, design safe-config'],
      [/^systemctl cat orchid-exporter$/i,'User=root\nEnvironmentFile=/etc/orchid/exporter.env\nExecStart=/usr/local/bin/orchid-exporter'],
      [/^ls -l \/etc\/orchid\/exporter\.env$/i,'-rw-rw-r-- root deployers /etc/orchid/exporter.env'],
      [/^cat \/etc\/orchid\/exporter\.env$/i,'LOG_LEVEL=info\nEXPORT_REGION=ap-southeast\nPRE_HOOK=/usr/local/bin/proof-marker'],
      [/^app config keys$/i,'LOG_LEVEL safe runtime setting\nEXPORT_REGION safe runtime setting\nPRE_HOOK startup command path privileged-sensitive'],
      [/^proof show$/i,'/var/lib/orchid/proof.txt owner=root content="training proof"'],
      [/^design safe-config$/i,'deployment UI -> allowlist {LOG_LEVEL, EXPORT_REGION} -> root-owned generated env\nPRE_HOOK fixed in root-owned config']
    ],
    actions:[
      {id:'a1',label:'Preserve unit, environment, and proof evidence',description:'Capture the trusted-file chain before permission changes.',outcome:'The privilege boundary is documented with a non-destructive proof.',quality:'good'},
      {id:'a2',label:'Make privileged-sensitive configuration root-controlled',description:'Remove deployer write access to variables that influence root-executed startup behavior.',outcome:'Deployers cannot control PRE_HOOK or equivalent privileged settings.',quality:'good'},
      {id:'a3',label:'Expose only validated deployment settings',description:'Allow deployers to change LOG_LEVEL and EXPORT_REGION through an allowlisted generator.',outcome:'Operational configuration remains self-service without writable privileged code paths.',quality:'good'},
      {id:'a4',label:'Run the entire exporter as a normal user if technically possible',description:'Evaluate whether root is actually required and reduce service privilege where supported.',outcome:'The blast radius of future configuration mistakes can shrink further.',quality:'good'},
      {id:'a5',label:'Remove all deployer ability to configure the service',description:'Make every change require unrestricted root access by operations.',outcome:'The immediate path closes, but normal deployment workflow becomes unnecessarily privileged and slow.',quality:'bad'}
    ],
    hints:['The binary and unit can be read-only while a root service still trusts writable input.','Classify environment variables by what they control, not by the fact that they are “configuration.”','The goal is to preserve safe self-service settings while removing lower-privilege control over root-executed behavior.'],
    evaluation:[
      {label:'Trusted input path',groups:[['EnvironmentFile'],['deployers','writable'],['PRE_HOOK'],['root']],supported:'You trace deployer-writable environment input into root startup behavior.',partial:'You notice the writable file but do not identify why one variable crosses the privilege boundary.',missing:'The privileged trust path is not reconstructed.'},
      {label:'Safe proof',groups:[['proof-marker'],['proof.txt'],['root-owned'],['harmless']],supported:'You use the fixed training marker as evidence without turning the exercise into arbitrary root command execution.',partial:'You recognize the proof but do not explain what it establishes.',missing:'The privilege condition is not safely validated.'},
      {label:'Operational hardening',groups:[['allowlist'],['LOG_LEVEL'],['EXPORT_REGION'],['root-owned'],['least privilege']],supported:'You preserve legitimate configuration changes while isolating privileged-sensitive settings.',partial:'You close the path but make normal operations unnecessarily privileged.',missing:'The proposed fix either leaves the path open or breaks the deployment model.'}
    ]
  },
  {
    id:'C078', title:'Cutover', subtitle:'Containment worked for one account and accidentally erased the best live evidence.', tier:'Advanced incident-response sequencing',
    brief:'A responder saw suspicious cloud activity from svc-reporting and immediately deleted the service account. Access stopped, but investigators lost token metadata and the application automatically failed over to a more privileged break-glass credential. Reconstruct what went wrong and design a safer containment sequence for active service identities.',
    environment:'Peregrine Media / cloud incident-response simulation',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Suspicious session','Cloud audit','svc-reporting read an unusual analytics export from a new workload identity at 14:02.','The event is suspicious but attribution is not yet established.'),
      e('ev2','Immediate deletion','Response log','Responder deleted svc-reporting at 14:06.','The provider no longer exposes the original identity session page after deletion in this simulation.'),
      e('ev3','Automatic fallback','Application config','Reporting jobs fail over to breakglass-reporting when primary identity lookup fails.','The fallback role has broader storage access than svc-reporting.'),
      e('ev4','Fallback activation','Cloud audit','breakglass-reporting began at 14:07 from the same workload and accessed two additional reporting prefixes.','The deletion changed the application authentication path instead of isolating the workload.'),
      e('ev5','Available containment','Cloud control','The platform supports session revocation and role deny policy without deleting the identity object.','Those controls preserve identity metadata for investigation.'),
      e('ev6','Snapshot option','Workload control','The reporting worker can be network-isolated after a memory/config snapshot.','A queued replacement can keep approved reporting available.')
    ],
    logs:[
      {id:'timeline',name:'Response timeline',text:`14:02 svc-reporting GetObject analytics/export-0914.csv source=worker-22\n14:06 responder DeleteIdentity svc-reporting\n14:07 worker-22 fallback -> breakglass-reporting\n14:08 breakglass-reporting GetObject reports/monthly/*\n14:09 breakglass-reporting GetObject reports/archive/*\n14:12 responder notices fallback`},
      {id:'config',name:'Application auth logic',text:`primary=svc-reporting\non primary identity lookup failure => use breakglass-reporting\nbreakglass role scope=reports/* + archive/*\nintended use=manual disaster recovery only`}
    ],
    terminal:[
      [/^help$/i,'Try: timeline 14:00-14:12, app auth reporting, cloud containment options, worker show worker-22, audit breakglass-reporting, ir sequence proposed'],
      [/^timeline 14:00-14:12$/i,'14:02 suspicious svc-reporting read\n14:06 identity deleted\n14:07 automatic breakglass fallback\n14:08-14:09 broader reads'],
      [/^app auth reporting$/i,'primary svc-reporting; automatic fallback breakglass-reporting on identity lookup failure'],
      [/^cloud containment options$/i,'revoke active sessions; attach temporary deny; disable role assumption; preserve identity metadata'],
      [/^worker show worker-22$/i,'state=running\nnetwork_isolation=supported\nsnapshot=supported\nreplacement queue available'],
      [/^audit breakglass-reporting$/i,'14:07 assumed by worker-22\n14:08 reports/monthly/* read\n14:09 reports/archive/* read'],
      [/^ir sequence proposed$/i,'1 preserve audit/session + workload snapshot\n2 deny/revoke suspicious identity\n3 isolate worker-22\n4 disable automatic breakglass fallback\n5 restore service with known-good replacement']
    ],
    actions:[
      {id:'a1',label:'Preserve audit/session and workload evidence first',description:'Snapshot identity metadata and worker state before destructive changes.',outcome:'The investigation retains the data needed to determine how the session was obtained.',quality:'good'},
      {id:'a2',label:'Revoke/deny the suspicious identity without deleting it',description:'Stop access while preserving the identity object and its metadata.',outcome:'svc-reporting access stops without destroying its investigation context.',quality:'good'},
      {id:'a3',label:'Isolate worker-22 after snapshot',description:'Prevent the suspected workload from switching to another credential path.',outcome:'The same runtime can no longer continue through alternative identities.',quality:'good'},
      {id:'a4',label:'Disable automatic break-glass fallback',description:'Require explicit operator approval for emergency credential use.',outcome:'Failure of a primary identity no longer silently expands privilege.',quality:'good'},
      {id:'a5',label:'Delete breakglass-reporting immediately too',description:'Repeat destructive deletion before preserving its new session evidence.',outcome:'More metadata is lost and reporting may fail without proving the underlying cause.',quality:'bad'}
    ],
    hints:['Containment is not only “did access stop?” Ask what the application does after the credential disappears.','Deleting an identity can be more destructive to evidence than revoking its active ability to act.','A strong sequence preserves evidence, blocks the suspicious path, isolates the workload, and prevents credential fallback before restoration.'],
    evaluation:[
      {label:'Response failure',groups:[['DeleteIdentity'],['fallback'],['breakglass-reporting'],['broader']],supported:'You explain how destructive identity deletion triggered a more privileged automatic fallback.',partial:'You identify the fallback but not why the initial containment action caused it.',missing:'The containment-induced escalation is not reconstructed.'},
      {label:'Evidence loss',groups:[['session','metadata'],['delete'],['preserve','before']],supported:'You identify the investigation cost of deleting the identity before capturing its session context.',partial:'You prefer preservation but do not name what was lost.',missing:'Evidence preservation is not part of the response analysis.'},
      {label:'Safer sequence',groups:[['revoke','deny'],['snapshot'],['isolate','worker-22'],['disable','fallback'],['replacement']],supported:'You propose staged containment that preserves evidence, blocks all credential paths, and restores service safely.',partial:'You contain the identity but leave the workload or fallback route active.',missing:'The revised response can still continue through another credential or destroys evidence.'}
    ]
  },
  {
    id:'C079', title:'Vaulted', subtitle:'The password is in a secret manager. A retired machine can still ask for it.', tier:'Advanced machine identity + secret authorization',
    brief:'A team moved database passwords into a central vault and removed plaintext copies from servers. An audit still finds that a retired application VM can retrieve the production secret. Determine what authorization survived the migration, whether retrieval was actually used, and redesign the vault policy around current workload identity.',
    environment:'Sable Foods / vault + machine identity lab',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Vault migration','Architecture','Production DB credentials are stored only in Vault path secret/prod/orders.','Applications fetch them at runtime through machine identity.'),
      e('ev2','Retired VM identity','Asset inventory','APP-OLD-03 is retired but its machine certificate remains valid.','The VM is powered off in normal operation but its disk snapshot still exists.'),
      e('ev3','Broad vault role','Vault policy','Role orders-app allows any certificate with OU=OrdersApp to read secret/prod/orders.','The role does not bind to current asset IDs or an active workload inventory.'),
      e('ev4','Certificate match','PKI record','APP-OLD-03 certificate has OU=OrdersApp and remains unrevoked.','It therefore satisfies the vault role condition.'),
      e('ev5','No recent retrieval','Vault audit','APP-OLD-03 has not retrieved the production secret in the last 90 days.','This is a demonstrated exposure, not evidence of recent secret theft.'),
      e('ev6','Current workloads','Inventory','Only APP-12 and APP-13 are approved production consumers.','Both support short-lived workload identity tied to orchestrator instance IDs.')
    ],
    logs:[
      {id:'vault',name:'Vault policy + audit',text:`role=orders-app match cert.OU == OrdersApp => read secret/prod/orders\nAPP-12 last_read=09:31 today\nAPP-13 last_read=09:33 today\nAPP-OLD-03 last_read=none in 90d`},
      {id:'pki',name:'Machine certificate state',text:`APP-OLD-03 serial=7F22 OU=OrdersApp revoked=false expires=2027-01-10\nAPP-12 serial=9B11 active\nAPP-13 serial=9B12 active`}
    ],
    terminal:[
      [/^help$/i,'Try: asset show APP-OLD-03, cert show 7F22, vault policy orders-app, vault simulate APP-OLD-03, vault audit APP-OLD-03, inventory approved orders'],
      [/^asset show APP-OLD-03$/i,'state=retired\npowered_on=false\nsnapshot_exists=true\nowner=orders-platform'],
      [/^cert show 7F22$/i,'OU=OrdersApp\nrevoked=false\nexpires=2027-01-10'],
      [/^vault policy orders-app$/i,'allow read secret/prod/orders if client certificate OU == OrdersApp'],
      [/^vault simulate APP-OLD-03$/i,'ALLOW by OU match (simulation only; secret value not returned)'],
      [/^vault audit APP-OLD-03$/i,'no secret reads in last 90 days'],
      [/^inventory approved orders$/i,'APP-12 active workload-id=orders/app-12\nAPP-13 active workload-id=orders/app-13']
    ],
    actions:[
      {id:'a1',label:'Preserve certificate, vault policy, and audit evidence',description:'Record the eligibility condition and absence of recent retrieval.',outcome:'The report can distinguish exposure from observed secret access.',quality:'good'},
      {id:'a2',label:'Revoke retired machine certificates',description:'Tie asset retirement to machine-identity revocation.',outcome:'APP-OLD-03 can no longer authenticate with its stale certificate.',quality:'good'},
      {id:'a3',label:'Bind vault access to current workload identities',description:'Allow only approved orchestrator/workload identities rather than a broad certificate OU.',outcome:'Retired assets that share historical naming attributes no longer qualify.',quality:'good'},
      {id:'a4',label:'Rotate the production DB secret immediately as confirmed stolen',description:'Treat eligibility as proof that APP-OLD-03 recently retrieved the secret.',outcome:'The response may be unnecessarily disruptive and the report overstates the evidence.',quality:'bad'},
      {id:'a5',label:'Add retirement checks to identity and vault policy reviews',description:'Remove credentials and authorization when assets leave service.',outcome:'Future retired machines lose both authentication material and authorization eligibility.',quality:'good'}
    ],
    hints:['Centralizing a secret fixes storage, not necessarily who is authorized to retrieve it.','The simulator can prove eligibility without returning the secret. Then check audit logs before claiming use.','The durable model ties authorization to current workload identity and asset lifecycle, not a broad historical certificate attribute.'],
    evaluation:[
      {label:'Authorization exposure',groups:[['OU=OrdersApp'],['APP-OLD-03'],['ALLOW'],['secret/prod/orders']],supported:'You show that the retired machine still satisfies the vault role despite the secret being centralized.',partial:'You identify stale certificate access but not the broad policy condition that grants it.',missing:'The vault authorization flaw is not reconstructed.'},
      {label:'Impact discipline',groups:[['no','90 days'],['exposure'],['not','retrieval']],supported:'You explicitly distinguish the ability to retrieve the secret from evidence that it was recently retrieved.',partial:'You hedge but still imply confirmed secret theft.',missing:'Eligibility is incorrectly reported as observed access.'},
      {label:'Lifecycle hardening',groups:[['revoke','certificate'],['workload identity'],['APP-12','APP-13'],['retirement']],supported:'You couple machine-certificate revocation with precise current-workload authorization.',partial:'You revoke the one certificate but keep the broad OU-based vault policy.',missing:'Retired or similarly named assets can still qualify for production secrets.'}
    ]
  },
  {
    id:'C080', title:'Third Credential', subtitle:'One incident crosses endpoint visibility, workload identity, egress, and secret lifecycle. Not every weakness was used.', tier:'Advanced compound-trust capstone',
    brief:'A release worker contacted an unapproved training sink shortly before a production artifact manifest was read. At the same time, an engineering endpoint has a telemetry blind directory and an old database principal remains valid. Reconstruct which paths are actually linked, prove the minimum demonstrated attack chain, separate unused exposures from observed activity, and choose a containment order that preserves release availability.',
    environment:'Argent Systems / endpoint + CI federation + egress + secret lifecycle capstone',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Endpoint exclusion','Endpoint policy','ENG-44 has the same broad C:\\BuildCache telemetry exclusion used by an old engineering policy.','A suspicious helper file exists there, but no execution event is available.'),
      e('ev2','CI subject claim','OIDC telemetry','release-worker-staging presented sub=repo:release/tools:environment:staging.','Its issuer and audience are valid.'),
      e('ev3','Overbroad production trust','Cloud IAM','ProdManifestReader accepts subject repo:release/*:environment:* and does not check workflow_ref.','The staging worker therefore qualifies for the production read role.'),
      e('ev4','Role assumption','Cloud audit','At 16:18 the staging worker assumed ProdManifestReader and read prod/manifests/4.9.0.json.','No artifact binary or signing key access is recorded.'),
      e('ev5','Broad egress','Firewall log','At 16:15 release-worker-staging connected to sink.training.test:443 under an any-HTTPS outbound rule.','The connection occurred before role assumption and transferred 812 bytes in the simulator.'),
      e('ev6','Retired DB principal','Database state','orders_svc_legacy remains valid after the latest rotation.','No authentication by that principal appears during the incident window.'),
      e('ev7','Current release dependency','Operations note','Production release uses repo:release/main:environment:production through release/deploy.yml and must keep manifest-read access.','The response should not disable the entire CI identity provider.'),
      e('ev8','No identity linkage to endpoint','Correlation','ENG-44 user/session identifiers do not overlap the release worker workload identity.','The endpoint blind spot is a separate exposure unless new evidence links it.'),
      e('ev9','Training sink semantics','Assessment service','sink.training.test records only connection metadata and a fixed marker payload.','It is safe to use for simulated exfiltration-control validation; no external target is contacted.')
    ],
    logs:[
      {id:'timeline',name:'Cross-system timeline',text:`15:52 ENG-44 unknown-helper.exe present under BuildCache; execution unknown\n16:15 release-worker-staging -> sink.training.test:443 ALLOW bytes_out=812 marker=TRACE-EGRESS\n16:18 OIDC sub=repo:release/tools:environment:staging -> assume ProdManifestReader SUCCESS\n16:19 GetObject prod/manifests/4.9.0.json SUCCESS\n16:21 job complete\nincident-window db auth orders_svc_legacy = 0`},
      {id:'trust',name:'Trust and policy',text:`ProdManifestReader: issuer=ci.argent.test aud=cloud-sts sub=repo:release/*:environment:* workflow_ref=unchecked\nrelease-worker-staging: sub=repo:release/tools:environment:staging workflow_ref=tools/verify.yml@main\nproduction: sub=repo:release/main:environment:production workflow_ref=release/deploy.yml@refs/tags/*`},
      {id:'endpoint',name:'Endpoint policy',text:`ENG-44 sensor=healthy\nC:\\BuildCache\\* process_telemetry=off\nunknown-helper.exe present; execution evidence unavailable`},
      {id:'db',name:'Database state',text:`orders_svc current active\norders_svc_legacy active generation=v18\nincident-window logins orders_svc_legacy=0`}
    ],
    terminal:[
      [/^help$/i,'Try: timeline 15:45-16:25, oidc show release-worker-staging, role trust ProdManifestReader, iam simulate release-worker-staging ProdManifestReader, cloud audit release-worker-staging, egress audit release-worker-staging, endpoint show ENG-44, db audit orders_svc_legacy, correlate ENG-44 release-worker-staging, response regression'],
      [/^timeline 15:45-16:25$/i,'15:52 endpoint artifact presence only\n16:15 staging release worker reached training sink\n16:18 staging OIDC assumed production manifest role\n16:19 one production manifest read\nDB legacy principal unused in window'],
      [/^oidc show release-worker-staging$/i,'iss=ci.argent.test\naud=cloud-sts\nsub=repo:release/tools:environment:staging\nworkflow_ref=tools/verify.yml@main'],
      [/^role trust ProdManifestReader$/i,'sub=repo:release/*:environment:*\nworkflow_ref=unchecked'],
      [/^iam simulate release-worker-staging ProdManifestReader$/i,'ALLOW due wildcard subject'],
      [/^cloud audit release-worker-staging$/i,'16:18 AssumeRole ProdManifestReader SUCCESS\n16:19 GetObject prod/manifests/4.9.0.json SUCCESS\nother_prod_reads=0 signing_key_actions=0'],
      [/^egress audit release-worker-staging$/i,'16:15 sink.training.test:443 ALLOW bytes_out=812 payload=TRACE-EGRESS marker'],
      [/^endpoint show ENG-44$/i,'sensor online; BuildCache process telemetry excluded; unknown-helper.exe presence only'],
      [/^db audit orders_svc_legacy$/i,'incident window authentications=0'],
      [/^correlate ENG-44 release-worker-staging$/i,'shared user/session/token/host identifiers=none; no evidence linking ENG-44 artifact to release worker'],
      [/^response regression$/i,'proposed: staging OIDC DENY; production release OIDC ALLOW; vendor/release dependencies ALLOW; training sink DENY; current db app PASS']
    ],
    actions:[
      {id:'a1',label:'Preserve CI claims, cloud audit, egress logs, and endpoint policy',description:'Capture all branches before modifying trust or host state.',outcome:'The proven chain and separate exposures remain independently reviewable.',quality:'good'},
      {id:'a2',label:'Narrow ProdManifestReader to the production release subject + workflow',description:'Keep workload federation but require the exact approved production claim set.',outcome:'The staging worker can no longer assume the production manifest role.',quality:'good'},
      {id:'a3',label:'Restrict release-worker egress to documented dependencies',description:'Remove any-HTTPS and deny the training sink after evidence capture.',outcome:'Unexpected outbound destinations are blocked without breaking the approved release path.',quality:'good'},
      {id:'a4',label:'Repair the endpoint exclusion and scope ENG-44 separately',description:'Restore process telemetry under BuildCache and investigate the file without asserting linkage.',outcome:'The visibility gap closes while the capstone conclusion stays evidence-bounded.',quality:'good'},
      {id:'a5',label:'Disable the unused legacy DB principal after dependency validation',description:'Fix the separate rotation exposure even though it was not used in this incident.',outcome:'A known stale credential path is removed without being mislabeled as part of the observed chain.',quality:'good'},
      {id:'a6',label:'Disable the entire CI identity provider',description:'Stop all workload federation immediately.',outcome:'Production releases fail even though the flaw is a narrow role trust policy.',quality:'bad'},
      {id:'a7',label:'Declare ENG-44 the source of the CI incident',description:'Use temporal proximity and a suspicious file as proof of linkage.',outcome:'The report invents a relationship absent from the identity and host evidence.',quality:'bad'},
      {id:'a8',label:'Rotate every database credential as confirmed compromised',description:'Treat the unused legacy principal as evidence of database access.',outcome:'The response is disruptive and exceeds the incident evidence.',quality:'bad'}
    ],
    hints:['Build separate evidence branches first: endpoint, CI identity/cloud, egress, and database. Only connect branches when an identifier or event actually links them.','The strongest demonstrated chain is inside the release-worker branch: unexpected outbound reachability plus a staging OIDC claim that was allowed to assume a production manifest role.','The endpoint blind spot and stale DB principal are real weaknesses, but the provided evidence does not connect either one to the production manifest read.','Contain narrowly: preserve evidence, correct the production trust rule, restrict egress, then remediate the separate endpoint and database exposures without claiming they caused the incident.','A high-quality final theory should state both what happened and what remains unknown.'],
    evaluation:[
      {label:'Demonstrated CI/cloud chain',groups:[['release-worker-staging'],['repo:release/tools'],['ProdManifestReader'],['16:18'],['4.9.0.json']],supported:'You reconstruct the staging workload assuming the overbroad production role and reading one specific manifest.',partial:'You identify the role trust issue but omit the observed role assumption/read or overstate artifact access.',missing:'The demonstrated production access path is not reconstructed.'},
      {label:'Egress finding',groups:[['sink.training.test'],['16:15'],['812'],['any-HTTPS','egress']],supported:'You identify the broad egress rule and the controlled outbound connection before cloud access.',partial:'You note unusual outbound traffic without connecting it to the permissive rule.',missing:'The egress control failure is not assessed.'},
      {label:'Unlinked endpoint branch',groups:[['ENG-44'],['BuildCache'],['presence'],['no','link'],['execution','unknown']],supported:'You treat the endpoint blind spot as a separate exposure and avoid inventing linkage or execution.',partial:'You acknowledge uncertainty but still imply ENG-44 caused the CI activity.',missing:'The endpoint artifact is incorrectly made part of the proven chain.'},
      {label:'Unused DB exposure',groups:[['orders_svc_legacy'],['0','authentication'],['separate','rotation']],supported:'You identify the stale database principal as a real but unused exposure during this incident window.',partial:'You mention the stale credential without clearly separating it from the observed incident.',missing:'The unused DB path is reported as demonstrated compromise or ignored entirely.'},
      {label:'Containment + continuity',groups:[['preserve'],['narrow','subject'],['workflow_ref'],['restrict','egress'],['production','ALLOW'],['repair','endpoint'],['disable','legacy']],supported:'You close the demonstrated CI/egress path, preserve production release operation, and remediate separate weaknesses without overstating causality.',partial:'You contain the main path but either disrupt production unnecessarily or leave one major known exposure untreated.',missing:'The response is broad, evidence-destructive, or leaves the demonstrated trust path open.'}
    ]
  },

  {
    id:'C081', title:'The Second Assertion', subtitle:'The identity provider accepted the user. The service accepted the wrong destination.', tier:'Advanced federation trust assessment',
    brief:'A finance SaaS application received a validly signed SAML assertion for a privileged user, but the assertion was originally issued for a different internal service. Determine why the signature alone was not enough, prove the acceptance flaw in the training environment, and redesign validation without breaking legitimate SSO.',
    environment:'Northbridge Finance / isolated SAML relying-party lab',
    tools:['overview','logs','browser','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Valid IdP signature','Federation trace','The captured assertion is signed by the organization\'s trusted identity provider.','Signature validation succeeds. This establishes issuer authenticity, not necessarily that this service should accept the assertion.'),
      e('ev2','Audience value','SAML assertion','Audience is urn:northbridge:travel, not urn:northbridge:finance.','The assertion was issued for the travel portal.'),
      e('ev3','Recipient value','SAML assertion','Recipient is https://travel.northbridge.local/saml/acs.','The finance ACS is https://finance.northbridge.local/saml/acs.'),
      e('ev4','Finance validation config','Application config','The finance service validates issuer and signature but ignores AudienceRestriction and Recipient.','This allows a valid assertion intended for another relying party to be replayed to finance.'),
      e('ev5','Training replay result','Assessment log','A captured travel assertion was accepted by the finance lab and created a privileged session.','No production service is contacted; the replay occurs only inside the simulator.'),
      e('ev6','Legitimate SSO dependency','Operations note','Finance users legitimately sign in through the same IdP with finance-specific audience and recipient values.','The correct fix should preserve shared IdP use while enforcing relying-party binding.')
    ],
    logs:[
      {id:'saml',name:'SAML trace',text:`issuer=https://idp.northbridge.local\nsignature=VALID\nsubject=fin.admin\naudience=urn:northbridge:travel\nrecipient=https://travel.northbridge.local/saml/acs\nnot_on_or_after=2026-09-14T05:00:00Z`},
      {id:'finance',name:'Finance ACS',text:`04:42 POST /saml/acs assertion_id=_tr-7721\nissuer_check=PASS signature_check=PASS audience_check=SKIPPED recipient_check=SKIPPED\nsession role=finance-admin result=CREATED`}
    ],
    browser:[
      {id:'b1',url:'trace://saml-assertion',title:'Captured assertion summary',html:`<div class="fake-site"><h2>SAML assertion</h2><div class="box"><pre>Issuer: https://idp.northbridge.local\nAudience: urn:northbridge:travel\nRecipient: https://travel.northbridge.local/saml/acs\nSignature: VALID</pre></div></div>`},
      {id:'b2',url:'https://finance.northbridge.local/saml/config',title:'Finance relying-party config',html:`<div class="fake-site"><h2>Finance SSO validation</h2><div class="box"><pre>issuer = required\nsignature = required\naudience = unchecked\nrecipient = unchecked</pre></div></div>`}
    ],
    terminal:[
      [/^help$/i,'Try: saml show assertion, saml app finance, saml app travel, saml replay travel-to-finance, saml regression'],
      [/^saml show assertion$/i,'issuer=idp.northbridge.local\nsignature=VALID\naudience=urn:northbridge:travel\nrecipient=https://travel.northbridge.local/saml/acs'],
      [/^saml app finance$/i,'expected_audience=urn:northbridge:finance\nexpected_recipient=https://finance.northbridge.local/saml/acs\ncurrent validation: issuer=yes signature=yes audience=no recipient=no'],
      [/^saml app travel$/i,'expected_audience=urn:northbridge:travel\nexpected_recipient=https://travel.northbridge.local/saml/acs'],
      [/^saml replay travel-to-finance$/i,'TRAINING RESULT: assertion accepted; finance-admin session created because audience/recipient checks are disabled'],
      [/^saml regression$/i,'finance assertion -> finance ACS ALLOW\ntravel assertion -> finance ACS DENY\nfinance assertion -> travel ACS DENY']
    ],
    actions:[
      {id:'a1',label:'Preserve the assertion and ACS decision log',description:'Capture the exact claims and validation result before changing federation settings.',outcome:'The acceptance flaw remains demonstrable after remediation.',quality:'good'},
      {id:'a2',label:'Require exact audience and recipient validation',description:'Bind finance sessions to assertions explicitly issued for the finance relying party.',outcome:'Travel assertions are rejected while legitimate finance assertions still work.',quality:'good'},
      {id:'a3',label:'Add replay/identifier controls and short assertion lifetime',description:'Reduce reuse opportunities in addition to correct relying-party validation.',outcome:'A stolen assertion has a smaller and more constrained replay window.',quality:'good'},
      {id:'a4',label:'Rotate the IdP signing key as the primary fix',description:'Treat the valid signature as evidence the signing key is compromised.',outcome:'SSO is disrupted without addressing the actual relying-party validation flaw.',quality:'bad'}
    ],
    hints:['A valid signature answers “who issued this?” It does not automatically answer “was this issued for me?”','Compare Audience and Recipient in the assertion with the finance service\'s own identifiers.','The best fix keeps the shared IdP but enforces exact relying-party binding and regression-tests both allowed and denied combinations.'],
    evaluation:[
      {label:'Trust flaw',groups:[['audience'],['recipient'],['travel'],['finance'],['signature']],supported:'You explain that finance trusted issuer/signature but failed to bind the assertion to its own audience and ACS.',partial:'You identify replay or SAML validation generally but not the exact relying-party checks.',missing:'The cross-service acceptance flaw is not explained.'},
      {label:'Proof',groups:[['replay'],['finance-admin','session'],['training']],supported:'You use the isolated replay result to demonstrate impact without claiming IdP key compromise.',partial:'You identify the unsafe config but omit the observed acceptance.',missing:'The practical impact is not established.'},
      {label:'Hardening',groups:[['exact','audience'],['exact','recipient'],['replay','identifier'],['regression']],supported:'You bind assertions to the correct relying party and preserve legitimate SSO with negative tests.',partial:'You add one validation control but leave another cross-service acceptance path.',missing:'The federation trust remains broadly reusable.'}
    ]
  },
  {
    id:'C082', title:'The Brokered Role', subtitle:'A harmless-looking account could not reach production directly. It could ask another account to do it.', tier:'Advanced cloud cross-account privilege assessment',
    brief:'A development account has no direct permissions in production. During an authorized review, however, a CI role in development can assume a shared-services broker role, and the broker can assume a production deployment role. Reconstruct the effective path, prove only the allowed training action, and redesign the trust chain.',
    environment:'Helix Media / fictional multi-account cloud IAM lab',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Development role','Cloud IAM','DevBuildRole can assume arn:shared:role/DeployBroker.','The role itself has no production resource permissions.'),
      e('ev2','Broker permissions','Cloud IAM','DeployBroker can assume ProdDeployRole in the production account.','The broker was created years ago for a migration and is still trusted by development CI.'),
      e('ev3','Production trust','Cloud IAM','ProdDeployRole trusts DeployBroker and can read deployment manifests plus update a training deployment marker.','The simulator limits proof to a harmless marker resource.'),
      e('ev4','Observed chain','Cloud audit','DevBuildRole assumed DeployBroker, then ProdDeployRole, then read prod-release.json.','No production code update is recorded.'),
      e('ev5','Approved path','Architecture note','Only ReleaseMainRole in the dedicated release account should reach ProdDeployRole.','Development CI has no current business need for the broker path.'),
      e('ev6','Session source','Cloud audit','The initiating session is a legitimate development CI workload, not a human console login.','The issue is excessive trust, not proof that a developer stole credentials.')
    ],
    logs:[
      {id:'cloud',name:'Cloud audit',text:`11:02 principal=DevBuildRole action=AssumeRole target=DeployBroker result=SUCCESS\n11:03 principal=DeployBroker action=AssumeRole target=ProdDeployRole result=SUCCESS\n11:04 principal=ProdDeployRole action=GetObject prod-release.json result=SUCCESS\nprod deployment updates=0`},
      {id:'iam',name:'IAM trust graph',text:`DevBuildRole -> DeployBroker -> ProdDeployRole\nReleaseMainRole -> ProdDeployRole (approved)\nDirect DevBuildRole -> ProdDeployRole = DENY`}
    ],
    terminal:[
      [/^help$/i,'Try: iam path DevBuildRole ProdDeployRole, iam role DevBuildRole, iam role DeployBroker, iam role ProdDeployRole, cloud audit DevBuildRole, iam regression'],
      [/^iam path DevBuildRole ProdDeployRole$/i,'DevBuildRole --AssumeRole--> DeployBroker --AssumeRole--> ProdDeployRole'],
      [/^iam role DevBuildRole$/i,'allowed assume_role: DeployBroker\nprod direct permissions: none'],
      [/^iam role DeployBroker$/i,'allowed assume_role: ProdDeployRole\ntrusted principals include DevBuildRole'],
      [/^iam role ProdDeployRole$/i,'trusted: DeployBroker, ReleaseMainRole\npermissions: read deployment manifests; update training deployment marker'],
      [/^cloud audit DevBuildRole$/i,'11:02 DevBuildRole -> DeployBroker\n11:03 DeployBroker -> ProdDeployRole\n11:04 GetObject prod-release.json SUCCESS'],
      [/^iam regression$/i,'DevBuildRole -> DeployBroker DENY\nReleaseMainRole -> ProdDeployRole ALLOW\nProdDeployRole direct dev trust DENY']
    ],
    actions:[
      {id:'a1',label:'Preserve STS chain and trust policies',description:'Capture role session lineage and both trust documents before edits.',outcome:'The transitive production path stays auditable.',quality:'good'},
      {id:'a2',label:'Remove development CI from the broker trust',description:'Break the obsolete first hop while retaining the approved release path.',outcome:'DevBuildRole can no longer reach production through DeployBroker.',quality:'good'},
      {id:'a3',label:'Restrict production trust to the dedicated release identity',description:'Reduce brokered trust where it is no longer required.',outcome:'ProdDeployRole accepts only the current approved deployment workflow.',quality:'good'},
      {id:'a4',label:'Delete every cross-account role',description:'Eliminate all role assumption to guarantee isolation.',outcome:'Legitimate release automation fails unnecessarily.',quality:'bad'}
    ],
    hints:['Do not stop at direct permissions. Effective privilege can be transitive across assume-role relationships.','Use the audit trail to distinguish a possible path from a path that was actually exercised.','Fix the obsolete trust edge while preserving the dedicated release-account workflow.'],
    evaluation:[
      {label:'Effective path',groups:[['DevBuildRole'],['DeployBroker'],['ProdDeployRole'],['AssumeRole']],supported:'You reconstruct the full two-hop role chain into production.',partial:'You identify one role edge but not the effective end-to-end path.',missing:'The transitive cloud privilege path is not explained.'},
      {label:'Observed use',groups:[['11:02','11:03'],['prod-release.json'],['no','update']],supported:'You cite the observed assumptions and manifest read while avoiding unsupported production-change claims.',partial:'You note role assumption but overstate or omit the observed action.',missing:'The cloud audit evidence is not used.'},
      {label:'Trust redesign',groups:[['remove','development'],['release','approved'],['restrict','trust']],supported:'You remove the obsolete broker path and preserve the intended release identity.',partial:'You block the immediate path but do not simplify the production trust boundary.',missing:'Development can still reach the production role.'}
    ]
  },
  {
    id:'C083', title:'The Quiet Sensor', subtitle:'The endpoint agent was healthy. Its anti-tamper policy was not.', tier:'Advanced endpoint control assessment',
    brief:'A workstation shows a healthy security sensor, yet process telemetry stops for six minutes around a suspicious script launch. Investigate whether the agent crashed, was deliberately muted through an authorized maintenance control, or simply failed to collect data, and harden the control path.',
    environment:'Vale Research / endpoint telemetry + policy lab',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Sensor health','EDR console','The endpoint agent remained online and heartbeating throughout the six-minute gap.','No crash or uninstall event appears.'),
      e('ev2','Maintenance token','Policy audit','A local support group can request a six-minute telemetry pause using a signed maintenance token.','The feature exists for performance troubleshooting.'),
      e('ev3','Token use','Endpoint audit','support.local used a valid maintenance token at 09:31; full process telemetry resumed at 09:37.','The token was issued by the legitimate policy service.'),
      e('ev4','Suspicious artifact','Filesystem artifact','collect_diag.ps1 appeared at 09:32 and remained after telemetry resumed.','File presence is proven; execution during the blind window is not directly recorded.'),
      e('ev5','Support scope','Directory policy','All members of Desktop-Support can request maintenance tokens for any workstation.','The scope is broader than the documented troubleshooting process requires.'),
      e('ev6','Approved need','Runbook','Only Tier-3 endpoint engineers should pause telemetry, and each pause should be tied to an incident/change ticket.','The current control is not aligned with the runbook.')
    ],
    logs:[
      {id:'edr',name:'EDR health',text:`09:30 sensor heartbeat OK\n09:31 maintenance_pause actor=support.local duration=6m token=VALID\n09:31-09:37 process telemetry SUPPRESSED\n09:37 telemetry RESUMED\n09:38 sensor heartbeat OK`},
      {id:'files',name:'Filesystem timeline',text:`09:32 C:\ProgramData\Support\collect_diag.ps1 created\n09:40 file still present\nexecution event during 09:31-09:37: unavailable`}
    ],
    terminal:[
      [/^help$/i,'Try: edr health WS-17, edr maintenance WS-17, file timeline collect_diag.ps1, policy maintenance-token, directory members Desktop-Support, edr regression'],
      [/^edr health WS-17$/i,'agent online; heartbeats continuous; uninstall=0 crash=0'],
      [/^edr maintenance WS-17$/i,'09:31 actor=support.local token=VALID duration=6m; telemetry resumed 09:37'],
      [/^file timeline collect_diag\.ps1$/i,'created 09:32; present 09:40; execution during blind window UNKNOWN'],
      [/^policy maintenance-token$/i,'requesters=Desktop-Support; target=ANY_WORKSTATION; ticket binding=none; approval=none'],
      [/^directory members Desktop-Support$/i,'support.local, tech.jules, tech.mina, vendor.temp'],
      [/^edr regression$/i,'Tier-1 support pause request DENY\nTier-3 + approved ticket ALLOW\nagent health visibility remains ON during pause']
    ],
    actions:[
      {id:'a1',label:'Preserve policy issuance and endpoint timeline',description:'Capture maintenance-token logs, sensor health, and file metadata.',outcome:'The blind interval remains reconstructable.',quality:'good'},
      {id:'a2',label:'Restrict maintenance pause to Tier-3 with ticket-bound approval',description:'Reduce who can intentionally suppress telemetry and require a documented reason.',outcome:'Routine support accounts can no longer create arbitrary blind windows.',quality:'good'},
      {id:'a3',label:'Keep tamper/maintenance audit visible even during pauses',description:'Ensure the security control reports that collection was intentionally reduced.',outcome:'Future blind windows remain detectable and attributable.',quality:'good'},
      {id:'a4',label:'Report collect_diag.ps1 as confirmed executed malware',description:'Treat file creation during a telemetry gap as proof of execution and malicious intent.',outcome:'The conclusion exceeds the evidence available in the lab.',quality:'bad'}
    ],
    hints:['Continuous heartbeats make a sensor crash less likely. Look for a control that changes collection without taking the agent offline.','Separate what is proven about collect_diag.ps1 from what is missing because telemetry was intentionally paused.','The durable fix is governance of the maintenance path, not just deleting one script.'],
    evaluation:[
      {label:'Blind-window cause',groups:[['maintenance'],['token'],['09:31'],['telemetry','suppressed']],supported:'You identify the legitimate maintenance mechanism as the direct cause of the six-minute visibility gap.',partial:'You identify a telemetry gap but not the control that caused it.',missing:'The sensor behavior is misdiagnosed.'},
      {label:'Evidence discipline',groups:[['collect_diag.ps1'],['created'],['execution','unknown']],supported:'You distinguish file presence from unobserved execution during the blind interval.',partial:'You acknowledge uncertainty but still imply execution as fact.',missing:'The artifact is incorrectly treated as confirmed execution.'},
      {label:'Control redesign',groups:[['Tier-3'],['ticket','approval'],['audit','visible']],supported:'You narrow pause authority and make every blind interval explicitly governed and observable.',partial:'You restrict the group but leave unaudited/unticketed suppression possible.',missing:'The maintenance mechanism remains broadly abusable.'}
    ]
  },
  {
    id:'C084', title:'One Cache Key Short', subtitle:'Two users requested different pages. The proxy considered them the same object.', tier:'Advanced web edge/cache assessment',
    brief:'A customer portal places a reverse-proxy cache in front of an account summary page. During an authorized test, a response containing one user\'s masked account details is served to a different lab user. Determine which request component is missing from the cache key, prove the exposure safely, and redesign caching for authenticated content.',
    environment:'Pine Bank / isolated reverse-proxy cache lab',
    tools:['overview','logs','browser','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Cached route','Proxy config','GET /account/summary is cacheable for 60 seconds.','The application itself marks the response private, but the edge rule overrides this route.'),
      e('ev2','Cache key','Proxy config','Key = scheme + host + path. Authorization/session identity is not included.','Query parameters are absent too, but this route does not use them for account selection.'),
      e('ev3','User A request','Edge log','lab-alice requested /account/summary and received MISS -> cached response object R881.','Response includes masked account ending 1042.'),
      e('ev4','User B request','Edge log','lab-bob requested the same path 12 seconds later and received HIT object R881.','Bob sees Alice\'s masked account summary in the simulator.'),
      e('ev5','No origin auth bypass','Origin log','The origin never received Bob\'s second request because the proxy served the cached object.','The flaw is at the caching layer, not an origin authorization decision.'),
      e('ev6','Safe design option','Architecture note','Authenticated account pages can bypass shared cache; static assets may remain globally cached.','Performance can be preserved without sharing user-specific responses.')
    ],
    logs:[
      {id:'edge',name:'Edge cache',text:`13:04:01 user=lab-alice GET /account/summary cache=MISS object=R881\n13:04:13 user=lab-bob GET /account/summary cache=HIT object=R881\ncache_key=https|portal.pine.local|/account/summary`},
      {id:'origin',name:'Origin access',text:`13:04:01 user=lab-alice GET /account/summary 200 account=****1042\n13:04:13 origin request for lab-bob = NONE`}
    ],
    browser:[
      {id:'b1',url:'https://portal.pine.local/account/summary?as=lab-alice',title:'Alice lab session',html:`<div class="fake-site"><h2>Account summary</h2><div class="box">User: lab-alice<br>Account: ****1042<br>Edge: MISS / object R881</div></div>`},
      {id:'b2',url:'https://portal.pine.local/account/summary?as=lab-bob',title:'Bob lab session',html:`<div class="fake-site"><h2>Account summary</h2><div class="box">User: lab-bob<br>Displayed account: ****1042<br>Edge: HIT / object R881</div></div>`}
    ],
    terminal:[
      [/^help$/i,'Try: cache config account-summary, cache trace lab-alice, cache trace lab-bob, origin trace lab-bob, cache regression'],
      [/^cache config account-summary$/i,'ttl=60s\nkey=scheme|host|path\nauth/session excluded\norigin Cache-Control private overridden=true'],
      [/^cache trace lab-alice$/i,'MISS -> origin -> object R881 -> account ****1042'],
      [/^cache trace lab-bob$/i,'HIT object R881 -> displayed account ****1042; origin not contacted'],
      [/^origin trace lab-bob$/i,'no origin request at 13:04:13'],
      [/^cache regression$/i,'authenticated /account/summary BYPASS shared cache\n/static/app.js HIT shared cache\nuser-specific response cross-session test PASS']
    ],
    actions:[
      {id:'a1',label:'Preserve edge and origin traces',description:'Capture the shared cache object and both lab requests before purging.',outcome:'The cross-session exposure remains provable.',quality:'good'},
      {id:'a2',label:'Bypass shared caching for authenticated account responses',description:'Honor private/no-store semantics for user-specific pages.',outcome:'Account summaries are generated per authenticated request.',quality:'good'},
      {id:'a3',label:'Keep shared caching for static public assets only',description:'Preserve performance where responses are truly common across users.',outcome:'The portal retains safe caching benefits.',quality:'good'},
      {id:'a4',label:'Fix the application authorization layer only',description:'Change origin checks without changing the proxy behavior.',outcome:'The proxy can still serve a previously cached private response without contacting origin.',quality:'bad'}
    ],
    hints:['Ask whether Bob\'s request reached the application at all.','The cache key decides whether two requests are considered the same object. User identity is missing here.','For authenticated personalized pages, the simplest safe design is usually not to use a shared cache at all.'],
    evaluation:[
      {label:'Exposure mechanism',groups:[['cache'],['key'],['identity','session','authorization'],['R881']],supported:'You explain that the shared cache key omitted user identity and reused Alice\'s response for Bob.',partial:'You identify caching generally but not why the requests collided.',missing:'The cross-session response reuse is not explained.'},
      {label:'Layer attribution',groups:[['origin','not contacted'],['proxy','edge']],supported:'You correctly attribute the demonstrated exposure to the edge cache rather than an origin authorization bypass.',partial:'You identify both layers but do not distinguish which one served Bob.',missing:'The wrong control layer is blamed.'},
      {label:'Safe redesign',groups:[['bypass','authenticated'],['private','no-store'],['static','cache']],supported:'You prevent shared caching of personalized responses while preserving safe caching for static content.',partial:'You modify the key but keep unnecessary shared caching of sensitive pages.',missing:'User-specific responses can still be shared across sessions.'}
    ]
  },
  {
    id:'C085', title:'Fail Open Friday', subtitle:'The policy service disappeared, so the cluster decided to trust everything.', tier:'Advanced Kubernetes admission-control assessment',
    brief:'A Kubernetes admission webhook that blocks privileged workloads became unavailable during maintenance. Its failurePolicy is Ignore. During that window, a privileged lab pod was admitted even though the same manifest is normally denied. Determine the exact control failure and redesign maintenance so policy outages do not silently become security bypasses.',
    environment:'Orchid Cloud / Kubernetes admission-policy lab',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Webhook policy','Kubernetes config','security-policy webhook rejects privileged=true and hostPath runtime sockets.','Under normal operation, the tested manifest is denied.'),
      e('ev2','Failure mode','Kubernetes config','failurePolicy: Ignore.','If the webhook cannot be reached, the API server continues admission without its decision.'),
      e('ev3','Maintenance outage','Platform log','The webhook had zero ready replicas from 22:01 to 22:06 during a node drain.','No alternate replica was available.'),
      e('ev4','Admission event','Audit log','At 22:03 diag-root was admitted with privileged=true while the webhook call timed out.','The pod only writes a harmless training marker.'),
      e('ev5','Normal regression','Policy test','The same manifest is denied when the webhook is healthy.','This isolates the bypass to availability/failure behavior rather than rule content.'),
      e('ev6','Availability requirement','SRE note','Cluster control-plane maintenance must continue even if the policy service is being rolled.','The redesign needs high availability and explicit emergency procedure, not accidental fail-open.')
    ],
    logs:[
      {id:'admission',name:'Admission audit',text:`22:00 diag-root CREATE -> webhook DENY privileged=true\n22:01 security-policy ready_replicas=0\n22:03 diag-root CREATE -> webhook TIMEOUT failurePolicy=Ignore -> ADMIT\n22:06 security-policy ready_replicas=2\n22:07 diag-root CREATE -> webhook DENY`},
      {id:'pod',name:'Training pod activity',text:`22:03 pod=diag-root privileged=true\n22:04 wrote /training/TRACE-POLICY-BYPASS\nnode/runtime mutation=0`}
    ],
    terminal:[
      [/^help$/i,'Try: kube webhook security-policy, kube availability security-policy, kube audit diag-root, kube test privileged, kube regression'],
      [/^kube webhook security-policy$/i,'rules=deny privileged, deny runtime hostPath\nfailurePolicy=Ignore\ntimeoutSeconds=2'],
      [/^kube availability security-policy$/i,'22:01-22:06 ready_replicas=0 during node drain'],
      [/^kube audit diag-root$/i,'22:03 webhook timeout; failurePolicy Ignore; admission ALLOW; marker write only'],
      [/^kube test privileged$/i,'webhook healthy -> DENY\nwebhook unavailable -> ALLOW (current config)'],
      [/^kube regression$/i,'one webhook replica unavailable -> policy decision still available\nall policy replicas unavailable -> privileged CREATE DENY\napproved break-glass namespace -> separately governed ALLOW']
    ],
    actions:[
      {id:'a1',label:'Preserve admission and webhook availability logs',description:'Capture the exact timeout and failure-policy decision before rollout changes.',outcome:'The bypass remains reconstructable.',quality:'good'},
      {id:'a2',label:'Make the security webhook highly available',description:'Run replicas across failure domains with safe disruption settings.',outcome:'Routine node maintenance no longer removes the policy decision point.',quality:'good'},
      {id:'a3',label:'Fail closed for protected workload classes with governed break-glass',description:'Do not silently admit privileged workloads when the policy service is unavailable.',outcome:'Policy outage becomes visible denial instead of an accidental bypass.',quality:'good'},
      {id:'a4',label:'Remove admission controls because they can fail',description:'Rely only on engineer review of manifests.',outcome:'A known automated enforcement boundary is discarded rather than made reliable.',quality:'bad'}
    ],
    hints:['The policy rules themselves work when the webhook is reachable. Focus on what the API server does when it is not.','The 22:03 audit event contains both the timeout and the explicit fail-open decision.','A safe redesign combines policy availability with deliberate failure behavior and a separately governed emergency path.'],
    evaluation:[
      {label:'Bypass cause',groups:[['failurePolicy'],['Ignore'],['timeout'],['22:03']],supported:'You identify fail-open admission during webhook unavailability as the exact bypass.',partial:'You identify webhook downtime but not the API server failure behavior.',missing:'The privileged pod admission is not explained.'},
      {label:'Impact scope',groups:[['privileged'],['marker'],['no','runtime mutation']],supported:'You prove privileged admission but keep impact bounded to the harmless lab marker.',partial:'You identify admission but overstate node takeover.',missing:'The observed lab impact is not scoped.'},
      {label:'Resilient enforcement',groups:[['high availability','replica'],['fail closed'],['break-glass']],supported:'You make policy enforcement both available and deliberately fail-safe.',partial:'You change failurePolicy without addressing webhook availability or emergency operations.',missing:'Maintenance can still silently bypass policy.'}
    ]
  },
  {
    id:'C086', title:'Included as Root', subtitle:'The main sudoers file was locked down. One included directory was not.', tier:'Advanced Linux privilege-boundary assessment',
    brief:'A Linux application host has a well-protected /etc/sudoers file. An authorized permissions review finds that /etc/sudoers.d is root-owned, but one included file is group-writable by app-deploy. Determine the practical privilege implication using only a harmless lab rule, and repair both the file and the deployment process.',
    environment:'Morrow Apps / isolated Linux authorization lab',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Main sudoers permissions','Filesystem','/etc/sudoers is root:root mode 0440.','The primary file is not writable by deployment users.'),
      e('ev2','Include directive','Sudo config','@includedir /etc/sudoers.d is active.','Files in the included directory become part of sudo policy.'),
      e('ev3','Writable include','Filesystem','/etc/sudoers.d/app-maint is root:app-deploy mode 0660.','Members of app-deploy can modify this policy file.'),
      e('ev4','Deployment membership','Directory','user deploy.mika is a member of app-deploy.','Mika is not otherwise a sudo administrator.'),
      e('ev5','Harmless proof','Training audit','A lab-only rule allowing /usr/local/bin/trace-marker as root was added and successfully invoked.','The command writes only /tmp/TRACE-SUDO-PROOF and performs no system change.'),
      e('ev6','Process cause','Deployment runbook','The file became group-writable so a legacy deployment job could update maintenance commands directly.','Policy generation and application deployment are improperly coupled.')
    ],
    logs:[
      {id:'sudo',name:'Sudo audit',text:`17:12 deploy.mika edited /etc/sudoers.d/app-maint in training snapshot\n17:13 sudo /usr/local/bin/trace-marker -> SUCCESS uid=0\n17:13 /tmp/TRACE-SUDO-PROOF created\nother root commands=0`},
      {id:'files',name:'Permissions',text:`-r--r----- root root /etc/sudoers\ndrwxr-xr-x root root /etc/sudoers.d\n-rw-rw---- root app-deploy /etc/sudoers.d/app-maint`}
    ],
    terminal:[
      [/^help$/i,'Try: stat /etc/sudoers, grep includedir /etc/sudoers, stat /etc/sudoers.d/app-maint, id deploy.mika, sudo proof, sudo regression'],
      [/^stat \/etc\/sudoers$/i,'root:root mode=0440'],
      [/^grep includedir \/etc\/sudoers$/i,'@includedir /etc/sudoers.d'],
      [/^stat \/etc\/sudoers\.d\/app-maint$/i,'root:app-deploy mode=0660'],
      [/^id deploy\.mika$/i,'groups=deploy.mika,app-deploy'],
      [/^sudo proof$/i,'TRAINING: lab-only trace-marker rule accepted; /tmp/TRACE-SUDO-PROOF created as uid 0'],
      [/^sudo regression$/i,'deploy.mika cannot modify sudo policy\napproved maintenance command still available through managed root-owned policy']
    ],
    actions:[
      {id:'a1',label:'Preserve sudo policy and audit evidence',description:'Capture file ownership, include chain, and harmless proof before changing permissions.',outcome:'The privilege path remains documented.',quality:'good'},
      {id:'a2',label:'Make all sudo policy root-owned and non-writable by deploy groups',description:'Restore sudoers.d files to an administrative trust boundary.',outcome:'Application deployers can no longer alter root authorization policy.',quality:'good'},
      {id:'a3',label:'Move policy generation into a privileged reviewed configuration pipeline',description:'Separate application deployment from sudo policy ownership.',outcome:'Maintenance rules can change through controlled review without group write access.',quality:'good'},
      {id:'a4',label:'Delete sudo entirely from the host',description:'Remove the tool instead of fixing the unsafe policy ownership.',outcome:'Operational administration breaks while the underlying configuration-management problem remains unresolved.',quality:'bad'}
    ],
    hints:['The security of /etc/sudoers alone is not enough if it includes other writable policy files.','Ask whether a user who can edit an included sudoers file can define a new permitted command. Use only the provided harmless marker proof.','Fix both the permission and the reason a deployment group was allowed to edit root authorization policy in the first place.'],
    evaluation:[
      {label:'Privilege boundary',groups:[['sudoers.d'],['app-maint'],['0660','writable'],['includedir']],supported:'You identify the writable included sudo policy as an effective root-authorization control path.',partial:'You notice unsafe permissions but do not connect them to sudo policy inclusion.',missing:'The privilege implication is not established.'},
      {label:'Safe proof',groups:[['trace-marker'],['TRACE-SUDO-PROOF'],['root','uid 0']],supported:'You use the harmless marker command to demonstrate effective privileged execution without destructive action.',partial:'You state privilege is possible but omit the lab proof.',missing:'No practical validation is described.'},
      {label:'Remediation',groups:[['root-owned'],['non-writable'],['pipeline','review']],supported:'You restore policy ownership and separate privileged authorization from normal deployment changes.',partial:'You chmod the file but leave the unsafe operational process.',missing:'Deploy users can still influence sudo policy.'}
    ]
  },
  {
    id:'C087', title:'The Trusted Extension', subtitle:'The browser extension was company-approved. Its update source was no longer company-controlled.', tier:'Advanced browser supply-chain investigation',
    brief:'An enterprise browser extension used for internal ticket shortcuts begins making requests to an unfamiliar domain. The extension ID is still allowlisted and its package signature is valid. Determine how the update channel changed ownership, what the browser actually installed, and how to secure extension governance without blocking all extensions.',
    environment:'Juniper Works / enterprise browser policy + extension lab',
    tools:['overview','logs','browser','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Enterprise allowlist','Browser policy','Extension ID abcd-ticket-helper is force-installed on support workstations.','The ID is trusted by policy.'),
      e('ev2','Custom update URL','Extension manifest','Updates come from https://updates.ticket-helper.test/extension.xml.','The domain was originally operated by an internal tools vendor.'),
      e('ev3','Domain ownership change','Asset record','The vendor retired the product and allowed ticket-helper.test registration to lapse.','The organization kept the extension force-install policy.'),
      e('ev4','New package','Browser update log','Version 4.8.2 was downloaded from the same update URL and installed under the same extension ID.','Package signature validates for the extension publisher key in the lab.'),
      e('ev5','New behavior','Network telemetry','After update, the extension requested https://collector.ticket-helper.test/ping with browser version and workstation label.','The simulator contains only fixed training metadata; no real user content is transmitted.'),
      e('ev6','Approved replacement','IT plan','A new internal shortcut app exists and does not require a browser extension.','The old extension can be retired after evidence and fleet scoping.')
    ],
    logs:[
      {id:'browser',name:'Browser extension update',text:`08:14 extension=abcd-ticket-helper current=4.7.9 update_url=https://updates.ticket-helper.test/extension.xml\n08:15 package=4.8.2 signature=VALID installed=YES\n08:16 request=https://collector.ticket-helper.test/ping bytes=146`},
      {id:'asset',name:'Asset history',text:`ticket-helper.test vendor-controlled until 2026-08-20\nrenewal=missed\ninternal force-install policy still active\nreplacement app available`}
    ],
    browser:[
      {id:'b1',url:'trace://extension-manifest',title:'Ticket Helper manifest',html:`<div class="fake-site"><h2>Ticket Helper 4.8.2</h2><div class="box"><pre>id: abcd-ticket-helper\nupdate_url: https://updates.ticket-helper.test/extension.xml\npermissions: storage, activeTab</pre></div></div>`}
    ],
    terminal:[
      [/^help$/i,'Try: browser policy extension, extension manifest, extension update-log, domain asset ticket-helper.test, network extension, fleet extension-scope'],
      [/^browser policy extension$/i,'force_install=abcd-ticket-helper\nupdate_url=custom vendor domain'],
      [/^extension manifest$/i,'id=abcd-ticket-helper version=4.8.2 update_url=https://updates.ticket-helper.test/extension.xml'],
      [/^extension update-log$/i,'4.8.2 fetched 08:15; signature valid; installed under existing ID'],
      [/^domain asset ticket-helper\.test$/i,'vendor retired; registration lapsed; internal policy not removed'],
      [/^network extension$/i,'collector.ticket-helper.test/ping bytes=146 fixed training metadata'],
      [/^fleet extension-scope$/i,'installed workstations=84; support OU only']
    ],
    actions:[
      {id:'a1',label:'Preserve extension package, update metadata, and policy',description:'Capture the installed version and update-chain evidence before removal.',outcome:'The supply-chain sequence remains reviewable.',quality:'good'},
      {id:'a2',label:'Disable and remove the retired extension from the force-install policy',description:'Stop further updates from the abandoned channel.',outcome:'Managed browsers stop trusting the obsolete extension distribution path.',quality:'good'},
      {id:'a3',label:'Inventory custom extension update domains and ownership lifecycle',description:'Treat update infrastructure as a managed software-supply-chain dependency.',outcome:'Future vendor/domain retirement can trigger policy removal before trust is orphaned.',quality:'good'},
      {id:'a4',label:'Ban every browser extension organization-wide',description:'Remove all extensions regardless of owner, need, or update source.',outcome:'Legitimate workflows are disrupted without addressing lifecycle governance specifically.',quality:'bad'}
    ],
    hints:['The extension ID and signature can still be valid while the organization loses control of where updates come from.','Follow the trust chain from enterprise policy -> update URL -> domain ownership -> installed package.','The durable control is lifecycle governance for extension publishers and update infrastructure, not a blanket extension ban.'],
    evaluation:[
      {label:'Supply-chain path',groups:[['force-install','allowlist'],['update_url','update URL'],['ticket-helper.test'],['lapse','retired']],supported:'You reconstruct how an approved extension remained trusted after its update infrastructure left organizational control.',partial:'You identify the suspicious extension but not the abandoned update-channel trust.',missing:'The update supply chain is not explained.'},
      {label:'Observed behavior',groups:[['4.8.2'],['collector.ticket-helper.test'],['146']],supported:'You cite the installed update and the limited observed network behavior without inventing data theft.',partial:'You note the request but overstate what was sent.',missing:'The browser telemetry is not used.'},
      {label:'Governance',groups:[['remove','policy'],['inventory','update domain'],['ownership','lifecycle']],supported:'You retire the unsafe extension and add lifecycle controls around custom update infrastructure.',partial:'You remove the extension but do not prevent similar orphaned trust.',missing:'The enterprise browser remains exposed to unmanaged update channels.'}
    ]
  },
  {
    id:'C088', title:'Dead Letter, Live Secret', subtitle:'The primary queue was protected. Its failure queue kept the original payload forever.', tier:'Advanced application messaging + secret-handling assessment',
    brief:'A payments service publishes encrypted jobs to a protected queue. Failed jobs are copied into a dead-letter queue for debugging. During an authorized review, you find that the DLQ stores the fully decoded job body, including a short-lived API token that sometimes remains valid for several minutes. Determine the leakage path and redesign failure handling.',
    environment:'Kestrel Pay / isolated messaging pipeline lab',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Primary queue','Messaging config','payments-jobs uses transport encryption and access limited to the payments workers.','The primary queue is not the exposure.'),
      e('ev2','Worker behavior','Application config','The worker decodes the job, then on repeated failure writes the decoded JSON body to payments-jobs-dlq.','The DLQ is meant for troubleshooting.'),
      e('ev3','Payload field','Job schema','api_token is a five-minute service token embedded in the job body.','It should not be persisted in diagnostic storage.'),
      e('ev4','DLQ permissions','IAM','Support-Developers can read DLQ messages to debug failures.','They do not have permission to mint payment service tokens directly.'),
      e('ev5','Observed message','DLQ snapshot','One failed job contains api_token=paytok-training-441 with 96 seconds remaining at the time it entered the DLQ.','The token is fictional and only accepted by the simulator.'),
      e('ev6','Safer data available','Schema note','job_id, error_code, retry_count, and trace_id are sufficient for most troubleshooting.','Full decoded payload retention is unnecessary.')
    ],
    logs:[
      {id:'worker',name:'Worker failures',text:`18:20 job=J441 retry=3 error=UPSTREAM_TIMEOUT\n18:20 decoded body written to payments-jobs-dlq\napi_token expiry remaining=96s`},
      {id:'iam',name:'Queue access',text:`payments-jobs read: PaymentsWorker only\npayments-jobs-dlq read: PaymentsWorker, Support-Developers`}
    ],
    terminal:[
      [/^help$/i,'Try: queue config payments-jobs, queue config payments-jobs-dlq, dlq show J441, token simulate paytok-training-441, schema debug-minimum, queue regression'],
      [/^queue config payments-jobs$/i,'encrypted transit=yes; readers=PaymentsWorker'],
      [/^queue config payments-jobs-dlq$/i,'writer=PaymentsWorker; readers=PaymentsWorker,Support-Developers; retention=14d; body=decoded JSON'],
      [/^dlq show J441$/i,'job_id=J441 error=UPSTREAM_TIMEOUT retry=3 api_token=paytok-training-441 remaining_at_enqueue=96s'],
      [/^token simulate paytok-training-441$/i,'TRAINING RESULT at enqueue+30s: token valid for payments status endpoint only'],
      [/^schema debug-minimum$/i,'job_id,error_code,retry_count,trace_id'],
      [/^queue regression$/i,'DLQ message contains no api_token\nsupport debugging fields present\nworker retry diagnostics preserved']
    ],
    actions:[
      {id:'a1',label:'Preserve one sanitized example and queue configuration',description:'Capture the leakage mechanism without copying live-like token material further.',outcome:'The design flaw remains demonstrable with reduced secret spread.',quality:'good'},
      {id:'a2',label:'Redact secrets before DLQ serialization',description:'Store only the minimum troubleshooting fields needed for failure analysis.',outcome:'Failure handling no longer persists reusable service tokens.',quality:'good'},
      {id:'a3',label:'Reduce DLQ reader scope and retention',description:'Limit diagnostic data to teams and durations that actually need it.',outcome:'Residual failure data has a smaller exposure window.',quality:'good'},
      {id:'a4',label:'Remove encryption from the primary queue because the DLQ leaked data',description:'Treat transport encryption as ineffective and simplify the system.',outcome:'The primary path becomes weaker while the actual decoded-payload issue remains.',quality:'bad'}
    ],
    hints:['The protected primary queue can still lead to secret exposure after the application decodes the message.','Follow the data transformation: encrypted transport -> decoded worker object -> copied failure payload.','Good failure telemetry records identifiers and error context, not reusable credentials.'],
    evaluation:[
      {label:'Leak path',groups:[['decoded'],['DLQ','dead-letter'],['api_token'],['Support-Developers']],supported:'You trace the secret from decoded worker memory into a broader diagnostic queue.',partial:'You identify DLQ exposure but not why the primary queue controls did not prevent it.',missing:'The messaging data-flow failure is not explained.'},
      {label:'Practical impact',groups:[['96'],['valid'],['status endpoint','training']],supported:'You show that at least one DLQ token remained usable briefly while keeping the proof inside the simulator.',partial:'You identify token presence but not its residual validity.',missing:'The practical consequence of persisted token material is not assessed.'},
      {label:'Failure-data redesign',groups:[['redact'],['job_id'],['trace_id'],['retention','reader']],supported:'You minimize DLQ payloads and narrow access/retention without losing troubleshooting value.',partial:'You redact the token but leave unnecessarily broad diagnostic access or retention.',missing:'Reusable secrets remain in failure storage.'}
    ]
  },
  {
    id:'C089', title:'Before the Reboot', subtitle:'The easiest containment action would erase the evidence you need most.', tier:'Advanced incident response + volatile evidence',
    brief:'A Windows server is making an unexplained outbound connection and holds a suspicious in-memory PowerShell runspace. Operations wants an immediate reboot. Decide what evidence must be captured first, what can safely wait, and how to isolate the host without preserving attacker access.',
    environment:'Cinder Manufacturing / isolated live-response lab',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Outbound session','Network telemetry','APP-09 maintains a TLS connection to 198.51.100.88:443.','The destination is fictional training infrastructure.'),
      e('ev2','Memory indicator','EDR telemetry','powershell.exe PID 4120 hosts an in-memory runspace with no corresponding script file on disk.','Command content is not yet captured.'),
      e('ev3','Short-lived token','Process metadata','PID 4120 holds a cloud access token expiring in 14 minutes.','The token will disappear on process termination or reboot.'),
      e('ev4','Disk evidence','Filesystem','A suspicious scheduled-task XML and prefetch entry exist on disk.','These artifacts are persistent and can be collected after immediate volatile capture.'),
      e('ev5','Isolation capability','EDR control','Network isolation can block normal traffic while preserving EDR management connectivity.','This allows live-response capture without leaving the host broadly connected.'),
      e('ev6','Operations pressure','Incident chat','The application team requests reboot first because it is the fastest way to stop the connection.','Availability matters, but evidence and containment can be sequenced better.')
    ],
    logs:[
      {id:'edr',name:'Live endpoint state',text:`PID=4120 powershell.exe runspace=in-memory\nnetwork=198.51.100.88:443 ESTABLISHED\ncloud_token ttl=14m\nscheduled task artifact on disk=yes`},
      {id:'response',name:'Response options',text:`EDR isolate: preserves management channel and process state\nReboot: terminates connection and processes; volatile memory/token/runspace lost`}
    ],
    terminal:[
      [/^help$/i,'Try: live net APP-09, live process 4120, live token 4120, disk artifacts APP-09, response isolate APP-09, response sequence'],
      [/^live net APP-09$/i,'powershell.exe PID 4120 -> 198.51.100.88:443 ESTABLISHED'],
      [/^live process 4120$/i,'powershell.exe; in-memory runspace present; backing script file=none'],
      [/^live token 4120$/i,'cloud access token present; ttl=14m; scope not yet collected'],
      [/^disk artifacts APP-09$/i,'scheduled task XML present; prefetch present; safe to collect after volatile state'],
      [/^response isolate APP-09$/i,'TRAINING: normal network blocked; EDR management retained; process state preserved'],
      [/^response sequence$/i,'1 preserve timestamps\n2 isolate through EDR\n3 capture memory/process/network/token metadata\n4 collect persistent disk artifacts\n5 terminate/revoke as needed\n6 rebuild or reboot after evidence capture']
    ],
    actions:[
      {id:'a1',label:'Isolate APP-09 through EDR first',description:'Stop ordinary network communication while retaining live-response management.',outcome:'The outbound session is contained without immediately destroying volatile state.',quality:'good'},
      {id:'a2',label:'Capture process, memory, network, and token metadata',description:'Collect the evidence that will vanish when the process ends.',outcome:'The in-memory runspace and short-lived credential context are preserved for analysis.',quality:'good'},
      {id:'a3',label:'Collect persistent artifacts, then revoke/terminate and rebuild as needed',description:'Finish evidence capture before destructive containment.',outcome:'Response removes attacker opportunity while retaining a usable incident record.',quality:'good'},
      {id:'a4',label:'Reboot immediately before any collection',description:'Stop the connection as fast as possible.',outcome:'The live session stops, but memory, process state, and token context are irretrievably lost.',quality:'bad'}
    ],
    hints:['Classify evidence by volatility. Ask what disappears when a process ends or the machine reboots.','You can contain network access without immediately killing the process if your response platform supports isolation.','A mature response sequence balances containment, evidence preservation, and availability rather than choosing only one.'],
    evaluation:[
      {label:'Volatile evidence',groups:[['memory','runspace'],['token'],['network','process'],['14']],supported:'You prioritize evidence that would disappear on reboot or process termination.',partial:'You mention memory collection but omit other short-lived context.',missing:'The response treats all evidence as equally persistent.'},
      {label:'Containment sequence',groups:[['isolate'],['EDR'],['before','reboot','terminate']],supported:'You contain communications while preserving live state long enough to collect it.',partial:'You propose isolation but do not sequence evidence capture clearly.',missing:'The first action destroys important volatile evidence.'},
      {label:'Persistent follow-up',groups:[['scheduled task'],['prefetch','disk'],['revoke','rebuild','reboot']],supported:'You collect durable artifacts and then complete destructive containment/recovery.',partial:'You preserve memory but omit the later cleanup/recovery path.',missing:'The host is left either uncontained or unanalyzed after volatile collection.'}
    ]
  },
  {
    id:'C090', title:'The Recovery Window', subtitle:'Three trust failures overlap during a recovery event. Only one chain is proven end to end.', tier:'Advanced multi-system capstone',
    brief:'After a regional outage, several emergency controls were relaxed to restore service. The next morning, a finance application shows an unexpected privileged session, a production cluster admitted one privileged diagnostics pod, and a cloud manifest was read through a brokered role chain. Reconstruct what is proven, separate independent exposures, preserve volatile identity evidence, and contain each path without breaking the restored production service.',
    environment:'Northbridge Recovery / federation + cloud + Kubernetes capstone',
    tools:['overview','logs','browser','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Finance SAML session','Federation log','At 06:12 finance created a privileged session from assertion _tr-9091.','The assertion signature is valid but its audience and recipient are for the travel service.'),
      e('ev2','Finance validation','Application config','During recovery, finance temporarily disabled audience and recipient checks after an SSO routing problem.','This relaxation is still active.'),
      e('ev3','Session token','Finance runtime','The privileged finance session is still active with 18 minutes remaining when investigation begins.','Revoking it before capture would remove useful session metadata.'),
      e('ev4','Kubernetes recovery exception','Cluster config','security-policy webhook ran with failurePolicy=Ignore while one replica was being rebuilt.','At 05:58 diag-recover was admitted privileged after a webhook timeout.'),
      e('ev5','Kubernetes observed activity','Node telemetry','diag-recover wrote /training/RECOVERY-DIAG and listed containers.','No exec into other containers, image change, or runtime write is recorded.'),
      e('ev6','Cloud broker chain','Cloud audit','At 06:20 DevBuildRole assumed DeployBroker, then ProdDeployRole, and read prod/recovery-manifest.json.','This path is obsolete but still trusted.'),
      e('ev7','Cloud change scope','Cloud audit','No production deployment update, signing-key action, or object write occurred through ProdDeployRole.','Only the manifest read is proven.'),
      e('ev8','Legitimate recovery identity','Operations note','ReleaseMainRole performed the approved 05:40 production recovery deployment.','Its actions match the change ticket and should not be conflated with later DevBuildRole access.'),
      e('ev9','Cross-branch correlation','Correlation report','No shared token, host, user, or workload identifier connects the finance SAML event, diag-recover pod, and DevBuildRole cloud chain.','All three are real control failures; the evidence does not prove one actor caused all three.'),
      e('ev10','Business constraint','Recovery plan','Finance SSO, production release automation, and diagnostics capability must remain available.','Containment should narrow broken trust instead of disabling whole platforms.')
    ],
    logs:[
      {id:'timeline',name:'Recovery timeline',text:`05:40 ReleaseMainRole approved recovery deployment SUCCESS\n05:57 security-policy webhook replicas=0/1\n05:58 diag-recover privileged CREATE -> webhook TIMEOUT -> Ignore -> ADMIT\n06:05 security-policy replicas=2/2\n06:12 finance assertion _tr-9091 signature VALID audience=travel recipient=travel-acs -> session CREATED\n06:20 DevBuildRole -> DeployBroker -> ProdDeployRole\n06:21 GetObject prod/recovery-manifest.json SUCCESS\n06:22 prod updates=0`},
      {id:'finance',name:'Finance session',text:`session=FIN-991 user=fin.admin source_assertion=_tr-9091 ttl=18m\nvalidation issuer=PASS signature=PASS audience=SKIPPED recipient=SKIPPED`},
      {id:'kube',name:'Cluster evidence',text:`diag-recover privileged=true\ncontainer runtime ListContainers=SUCCESS\nmarker=/training/RECOVERY-DIAG\nexec/start/delete/image_write=0`},
      {id:'cloud',name:'Cloud chain',text:`DevBuildRole -> DeployBroker SUCCESS\nDeployBroker -> ProdDeployRole SUCCESS\nGetObject prod/recovery-manifest.json SUCCESS\nPutObject/Deploy/Sign=0`}
    ],
    browser:[
      {id:'b1',url:'trace://recovery-board',title:'Recovery change board',html:`<div class="fake-site"><h2>Approved recovery change</h2><div class="box"><pre>05:40 ReleaseMainRole production recovery deployment\nTicket: REC-2201\nExpected: manifest read + deployment update\nStatus: completed</pre></div><p>Later DevBuildRole activity is not part of this approved change.</p></div>`}
    ],
    terminal:[
      [/^help$/i,'Try: timeline recovery, finance session FIN-991, saml assertion _tr-9091, kube audit diag-recover, kube webhook security-policy, iam path DevBuildRole ProdDeployRole, cloud audit DevBuildRole, correlate branches, response regression'],
      [/^timeline recovery$/i,'05:40 approved ReleaseMainRole recovery\n05:58 privileged pod admitted fail-open\n06:12 cross-service SAML assertion accepted by finance\n06:20-06:21 DevBuildRole brokered to ProdDeployRole and read one manifest'],
      [/^finance session FIN-991$/i,'active ttl=18m; source_assertion=_tr-9091; capture metadata before revoke'],
      [/^saml assertion _tr-9091$/i,'signature=VALID\naudience=urn:northbridge:travel\nrecipient=https://travel.northbridge.local/saml/acs\nfinance expected audience=urn:northbridge:finance'],
      [/^kube audit diag-recover$/i,'05:58 webhook TIMEOUT; failurePolicy Ignore; privileged pod admitted; ListContainers + marker only'],
      [/^kube webhook security-policy$/i,'current replicas=2; failurePolicy=Ignore; normal privileged rule=DENY'],
      [/^iam path DevBuildRole ProdDeployRole$/i,'DevBuildRole -> DeployBroker -> ProdDeployRole'],
      [/^cloud audit DevBuildRole$/i,'06:20 AssumeRole DeployBroker\n06:20 AssumeRole ProdDeployRole\n06:21 GetObject prod/recovery-manifest.json\nwrites=0'],
      [/^correlate branches$/i,'shared user/session/token/host/workload identifiers across finance,kube,cloud = NONE'],
      [/^response regression$/i,'finance valid finance assertion ALLOW; travel assertion DENY\nprivileged pod denied when webhook unavailable except governed break-glass\nDevBuildRole broker path DENY; ReleaseMainRole production path ALLOW']
    ],
    actions:[
      {id:'a1',label:'Preserve finance assertion and active session metadata',description:'Capture the still-live session context before revoking it.',outcome:'The cross-service SAML acceptance remains fully reconstructable.',quality:'good'},
      {id:'a2',label:'Restore exact finance audience/recipient checks, then revoke FIN-991',description:'Close the demonstrated SSO path without disabling the identity provider.',outcome:'Travel assertions stop working at finance and the active unsafe session is removed.',quality:'good'},
      {id:'a3',label:'Preserve pod/runtime evidence and harden admission availability/failure behavior',description:'Keep diagnostics through governed controls while preventing silent privileged admission.',outcome:'The cluster no longer fails open during webhook maintenance.',quality:'good'},
      {id:'a4',label:'Remove DevBuildRole from the obsolete broker trust',description:'Break the demonstrated development-to-production cloud path while retaining ReleaseMainRole.',outcome:'Production recovery automation remains functional through the approved identity.',quality:'good'},
      {id:'a5',label:'Declare one coordinated attacker caused all three findings',description:'Use timing alone to merge unrelated evidence branches.',outcome:'The incident narrative exceeds the available correlation evidence.',quality:'bad'},
      {id:'a6',label:'Disable the IdP, Kubernetes API, and all cross-account role assumption',description:'Shut down every affected control plane at once.',outcome:'Production recovery services fail despite narrower containment options.',quality:'bad'}
    ],
    hints:['Build three evidence branches first: finance federation, Kubernetes admission, and cloud role trust. Do not connect them unless a shared identifier exists.','The finance branch has volatile session metadata; capture it before revocation. The Kubernetes and cloud branches have persistent audit evidence.','Each branch contains a real control failure, but the correlation report explicitly says the provided evidence does not prove a single actor caused all three.','Contain narrowly: restore relying-party validation, make admission fail safely, and remove the obsolete broker edge while preserving approved recovery paths.','A strong conclusion distinguishes the legitimate 05:40 recovery deployment from the later unapproved DevBuildRole manifest read.'],
    evaluation:[
      {label:'Finance branch',groups:[['FIN-991'],['_tr-9091'],['travel'],['audience','recipient'],['revoke']],supported:'You reconstruct the cross-service assertion acceptance, preserve the live session evidence, restore binding checks, and revoke the unsafe session.',partial:'You identify the SAML flaw but miss evidence-preservation order or exact relying-party binding.',missing:'The finance privileged session is not correctly explained or contained.'},
      {label:'Kubernetes branch',groups:[['diag-recover'],['failurePolicy'],['Ignore'],['privileged'],['ListContainers','marker']],supported:'You identify fail-open admission and scope observed pod activity without inventing node compromise.',partial:'You identify the privileged pod but not the webhook failure behavior or impact limits.',missing:'The Kubernetes control failure is not reconstructed.'},
      {label:'Cloud branch',groups:[['DevBuildRole'],['DeployBroker'],['ProdDeployRole'],['recovery-manifest.json'],['no','write']],supported:'You reconstruct the brokered production read and keep its impact limited to the observed manifest access.',partial:'You identify the role chain but overstate production modification.',missing:'The cloud privilege path is not explained.'},
      {label:'Correlation discipline',groups:[['no shared','none'],['separate','branches'],['not prove','single actor'],['05:40','ReleaseMainRole']],supported:'You separate three real exposures, avoid unsupported actor linkage, and distinguish the approved recovery deployment.',partial:'You acknowledge uncertainty but still imply a unified intrusion without evidence.',missing:'The theory incorrectly merges the branches or labels approved recovery work malicious.'},
      {label:'Continuity-aware containment',groups:[['preserve'],['exact','audience'],['fail closed','high availability'],['remove','broker'],['ReleaseMainRole','ALLOW']],supported:'You close each broken trust path while keeping legitimate SSO, diagnostics, and release operations available.',partial:'You contain the findings but cause avoidable platform-wide disruption or leave one major path open.',missing:'The response is either evidence-destructive, overly broad, or incomplete.'}
    ]
  },

  {
    id:'C091', title:'Two Parsers', subtitle:'The edge and the application both accepted the request. They did not agree where it ended.', tier:'Expert web protocol assessment',
    brief:'An authorized review of a fictional customer portal finds occasional cross-request contamination behind its reverse proxy. Determine whether the edge and origin parse request boundaries differently, prove the condition with a harmless training canary, scope the impact, and fix the protocol boundary without relying on input blacklists.',
    environment:'Northbridge Portal / reverse proxy + application server training stack',
    tools:['overview','browser','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Proxy parser','Edge configuration','The edge prefers Content-Length when both length and transfer-coding metadata are present.','The backend training server normalizes the same ambiguous request differently.'),
      e('ev2','Origin parser','Application trace','The origin honors chunked transfer framing and leaves trailing bytes for the next request.','No arbitrary external host is involved; this is an isolated fictional lab.'),
      e('ev3','Canary contamination','Lab capture','A harmless X-TRACE-CANARY header appears on the next synthetic request after the crafted training probe.','This proves request-boundary desynchronization without targeting another user.'),
      e('ev4','No account impact observed','Session audit','The test environment recorded no authenticated victim session, data read, or state-changing request.','Impact remains a protocol weakness plus demonstrated cross-request influence in the lab.'),
      e('ev5','HTTP/2 front path','Architecture note','Client-to-edge traffic already supports HTTP/2, but edge-to-origin downgrades to HTTP/1.1.','The downgrade boundary is where ambiguous framing becomes relevant.'),
      e('ev6','Parser hardening option','Engineering plan','The origin can reject ambiguous framing and the proxy can use one normalized framing model.','Regression tests can verify that a canary never survives into the next request.')
    ],
    browser:[
      {id:'b1',url:'trace://portal/proxy-lab',title:'Proxy parser lab',html:`<div class="fake-site"><h2>Authorized parser lab</h2><div class="box"><pre>edge: HTTP/2 -> HTTP/1.1 origin\nambiguous framing test: enabled\nexternal forwarding: disabled</pre></div><p>Use the terminal to compare edge and origin traces.</p></div>`}
    ],
    logs:[
      {id:'edge',name:'Edge trace',text:`req=R-901 edge_boundary=84 decision=CONTENT_LENGTH next_req=R-902`},
      {id:'origin',name:'Origin trace',text:`req=R-901 origin_boundary=63 decision=CHUNKED trailing_bytes=21\nreq=R-902 header.X-TRACE-CANARY=alpha`},
      {id:'sessions',name:'Session audit',text:`victim_sessions=0 data_reads=0 state_changes=0 synthetic_requests=2`}
    ],
    terminal:[
      [/^help$/i,'Try: trace edge R-901, trace origin R-901, compare boundary R-901, canary result alpha, audit impact R-901, design regression parser'],
      [/^trace edge R-901$/i,'edge boundary=84 parser=Content-Length'],
      [/^trace origin R-901$/i,'origin boundary=63 parser=chunked trailing=21'],
      [/^compare boundary R-901$/i,'MISMATCH edge=84 origin=63 -> desynchronization condition'],
      [/^canary result alpha$/i,'X-TRACE-CANARY=alpha observed on synthetic next request R-902'],
      [/^audit impact R-901$/i,'authenticated victims=0 data reads=0 state changes=0'],
      [/^design regression parser$/i,'reject ambiguous framing; normalize edge/origin parser behavior; assert canary isolation across sequential requests']
    ],
    actions:[
      {id:'a1',label:'Preserve both parser traces',description:'Keep the edge and origin interpretation of the same request.',outcome:'The boundary mismatch remains independently reviewable.',quality:'good'},
      {id:'a2',label:'Reject ambiguous framing and align parser behavior',description:'Make the proxy/origin boundary use one unambiguous request model.',outcome:'The desynchronization condition is removed at the trust boundary.',quality:'good'},
      {id:'a3',label:'Add sequential-request regression tests',description:'Verify harmless canaries cannot bleed into later synthetic requests.',outcome:'Future parser changes are tested for the same class of failure.',quality:'good'},
      {id:'a4',label:'Block the exact canary string',description:'Filter the proof marker instead of fixing request parsing.',outcome:'The protocol weakness remains exploitable with different content.',quality:'bad'}
    ],
    hints:['Compare where the edge thinks R-901 ends with where the origin thinks it ends.','The canary matters because it proves cross-request influence without needing a victim session.','Fix the parser boundary, not the test string.'],
    evaluation:[
      {label:'Protocol diagnosis',groups:[['edge'],['origin'],['boundary','mismatch'],['Content-Length','chunked']],supported:'You identify the edge/origin request-boundary disagreement as the root condition.',partial:'You recognize a proxy issue but do not explain the parser mismatch.',missing:'The desynchronization cause is not identified.'},
      {label:'Safe proof and impact',groups:[['canary'],['R-902'],['no','victim'],['no','state change']],supported:'You use the harmless canary to prove influence while keeping observed impact bounded.',partial:'You prove the parser issue but overstate user compromise.',missing:'The proof or its impact limits are not explained.'},
      {label:'Remediation',groups:[['reject','ambiguous'],['align','parser'],['regression']],supported:'You fix framing semantics and add regression coverage.',partial:'You propose one hardening measure but leave parser disagreement possible.',missing:'The proposal relies on content filtering or leaves the trust boundary unchanged.'}
    ]
  },
  {
    id:'C092', title:'No Password Required', subtitle:'The credential was never cracked. A trusted protocol carried it somewhere it should not have.', tier:'Expert Windows authentication assessment',
    brief:'A fictional internal Windows assessment finds that a user authentication can be forwarded from one training service to another because signing/binding protections are inconsistent. Reconstruct the relay preconditions from configuration and logs, distinguish exposure from observed use, and harden the environment without disabling integrated authentication everywhere.',
    environment:'Aster Manufacturing / Windows file + directory services training domain',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','File service policy','SMB policy','FILE-07 allows inbound SMB sessions without mandatory signing.','Clients support signing, but the server does not require it.'),
      e('ev2','Directory policy','LDAP policy','DC-02 requires neither LDAP signing nor channel binding on one legacy endpoint.','A second endpoint already enforces both controls.'),
      e('ev3','Forwarded authentication','Authentication trace','Training account lab.user authenticated to FILE-07 and a correlated directory bind followed from the relay host.','The password itself was never exposed in the lab evidence.'),
      e('ev4','Harmless directory proof','Directory audit','The relayed session created only a training marker attribute on LAB-OBJECT-17.','No group membership, password, or production object was changed.'),
      e('ev5','Legacy dependency','Application inventory','One approved scanner still uses the legacy LDAP endpoint.','Hardening needs a migration plan rather than an immediate global shutdown.'),
      e('ev6','Modern path','Regression inventory','Modern Windows clients and the replacement scanner already work with SMB signing and LDAP binding enforced.','The safer settings are operationally viable for most systems.')
    ],
    logs:[
      {id:'auth',name:'Authentication chain',text:`10:14 lab.user -> FILE-07 SMB auth SUCCESS signing=optional\n10:14 relay-host -> DC-02 LDAP bind as lab.user binding=none\n10:15 LAB-OBJECT-17 attribute trainingMarker=relay-proof`},
      {id:'policy',name:'Protocol policy',text:`FILE-07 smb.signing.required=false\nDC-02 ldap.signing.required=false channelBinding=disabled\nDC-03 ldap.signing.required=true channelBinding=required`}
    ],
    terminal:[
      [/^help$/i,'Try: smb policy FILE-07, ldap policy DC-02, auth chain lab.user, directory changes LAB-OBJECT-17, inventory legacy ldap, regression modern'],
      [/^smb policy FILE-07$/i,'signing supported=true required=false'],
      [/^ldap policy DC-02$/i,'signing required=false; channel binding=disabled'],
      [/^auth chain lab\.user$/i,'SMB auth FILE-07 -> correlated LDAP bind from relay-host as lab.user'],
      [/^directory changes LAB-OBJECT-17$/i,'trainingMarker=relay-proof only; privileged changes=0'],
      [/^inventory legacy ldap$/i,'legacy-scanner-02 depends on DC-02 legacy endpoint'],
      [/^regression modern$/i,'modern clients + replacement scanner PASS with SMB signing and LDAP binding required']
    ],
    actions:[
      {id:'a1',label:'Preserve the correlated authentication and directory audit',description:'Keep both sides of the relay evidence before changing policy.',outcome:'The proof remains attributable without exposing credentials.',quality:'good'},
      {id:'a2',label:'Require SMB signing on the file service',description:'Prevent unauthenticated forwarding of unsigned SMB sessions.',outcome:'The demonstrated file-service relay precondition is removed.',quality:'good'},
      {id:'a3',label:'Migrate the legacy LDAP dependency, then require signing/binding',description:'Close the directory relay path in stages.',outcome:'Integrated auth remains available through protected protocol paths.',quality:'good'},
      {id:'a4',label:'Force password resets for every domain user',description:'Treat a relay weakness as if passwords were stolen.',outcome:'High operational impact with no fix for the relay preconditions.',quality:'bad'}
    ],
    hints:['A relay can succeed without learning the password. Look at protocol protections on both destination services.','Observed use is limited to the training marker; do not invent privileged directory changes.','The legacy scanner explains why a staged migration is better than disabling all integrated authentication.'],
    evaluation:[
      {label:'Relay preconditions',groups:[['SMB'],['signing'],['LDAP'],['binding']],supported:'You identify the missing protocol integrity/binding controls that make forwarding possible.',partial:'You name relay risk without tying it to the actual policies.',missing:'The authentication-path weakness is not reconstructed.'},
      {label:'Evidence discipline',groups:[['lab.user'],['trainingMarker'],['password','not'],['privileged','0']],supported:'You distinguish relayed authentication from password theft and bound the observed changes.',partial:'You recognize the proof but overstate credential exposure or directory impact.',missing:'The demonstrated activity is mischaracterized.'},
      {label:'Hardening plan',groups:[['require','SMB signing'],['LDAP signing','channel binding'],['migrate','legacy']],supported:'You close both relay preconditions while accounting for the legacy dependency.',partial:'You harden only one protocol or ignore migration sequencing.',missing:'The proposed response does not remove the relay path.'}
    ]
  },
  {
    id:'C093', title:'Thread 4820', subtitle:'The process was signed. One of its memory regions did not belong there.', tier:'Expert endpoint forensics',
    brief:'Endpoint telemetry flags a signed productivity process with an unusual private executable memory region and a remote-thread event. Determine whether the evidence supports process injection, reconstruct the responsible process chain, preserve volatile evidence, and avoid blaming the signed application itself without proof.',
    environment:'Northbridge Finance / Windows endpoint memory-triage snapshot',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Signed host process','Process metadata','FINAPP.EXE is correctly signed and launched from its expected path.','Signature and file hash match the approved deployment.'),
      e('ev2','Unexpected memory region','Memory map','FINAPP.EXE contains a private RWX region at 0x4A700000 not backed by a module file.','The region appeared after process start.'),
      e('ev3','Remote thread event','Endpoint telemetry','SCRIPT-HOST.EXE opened FINAPP.EXE and created thread 4820 with a start address inside the private region.','This is stronger evidence than the signed host process alone.'),
      e('ev4','Network timing','Socket telemetry','FINAPP.EXE opened a new outbound training connection 4 seconds after thread 4820 began.','The destination is a fictional lab collector.'),
      e('ev5','No persistence found yet','Host triage','Run keys, scheduled tasks, services, and startup folders show no new persistence artifact.','Absence of these artifacts does not prove the event was memory-only.'),
      e('ev6','Volatile evidence warning','IR note','Terminating FINAPP.EXE before capture would remove the private region and thread context.','Network isolation can occur without killing the process.')
    ],
    logs:[
      {id:'process',name:'Process timeline',text:`09:02 explorer.exe -> FINAPP.EXE signed=valid\n09:11 powershell-host.exe -> SCRIPT-HOST.EXE\n09:11 SCRIPT-HOST.EXE OpenProcess FINAPP.EXE\n09:11 SCRIPT-HOST.EXE CreateRemoteThread target=FINAPP.EXE tid=4820 start=0x4A700120`},
      {id:'memory',name:'Memory summary',text:`FINAPP.EXE region 0x4A700000-0x4A70FFFF private=true protect=RWX module=NONE\nthread 4820 start=0x4A700120`},
      {id:'network',name:'Socket timeline',text:`09:11:44 FINAPP.EXE -> 198.51.100.77:443 training-collector\nprior FINAPP.EXE connections to destination=0`}
    ],
    terminal:[
      [/^help$/i,'Try: proc tree FINAPP.EXE, mem map FINAPP.EXE, thread 4820, handles SCRIPT-HOST.EXE, sockets FINAPP.EXE, persistence scan, response volatile'],
      [/^proc tree FINAPP\.EXE$/i,'explorer.exe -> FINAPP.EXE; separate chain powershell-host.exe -> SCRIPT-HOST.EXE'],
      [/^mem map FINAPP\.EXE$/i,'private RWX 0x4A700000-0x4A70FFFF module=NONE'],
      [/^thread 4820$/i,'owner=FINAPP.EXE start=0x4A700120 inside private RWX region creator=SCRIPT-HOST.EXE'],
      [/^handles SCRIPT-HOST\.EXE$/i,'OpenProcess target=FINAPP.EXE rights=VM_WRITE|CREATE_THREAD'],
      [/^sockets FINAPP\.EXE$/i,'09:11:44 -> 198.51.100.77:443 training collector'],
      [/^persistence scan$/i,'new services=0 tasks=0 runkeys=0 startup=0'],
      [/^response volatile$/i,'isolate host; capture memory/process/thread/network state; then terminate/remediate']
    ],
    actions:[
      {id:'a1',label:'Isolate the endpoint without killing FINAPP.EXE',description:'Stop external communication while preserving memory state.',outcome:'The suspicious process remains available for volatile capture.',quality:'good'},
      {id:'a2',label:'Capture memory and thread metadata',description:'Preserve the private region, thread start address, and process handles.',outcome:'The injection evidence survives later remediation.',quality:'good'},
      {id:'a3',label:'Investigate SCRIPT-HOST.EXE as the initiating process',description:'Follow the process that wrote/started code instead of blaming the signed host.',outcome:'The causal process chain is scoped more accurately.',quality:'good'},
      {id:'a4',label:'Immediately delete FINAPP.EXE because it made the connection',description:'Destroy the signed application before memory capture.',outcome:'Volatile injection evidence is lost and the wrong binary may be blamed.',quality:'bad'}
    ],
    hints:['A valid signature on FINAPP.EXE does not explain how thread 4820 began inside private RWX memory.','The strongest causal artifact is which process opened FINAPP.EXE and created the thread.','Preserve volatile state before terminating the injected process.'],
    evaluation:[
      {label:'Injection evidence',groups:[['RWX'],['thread 4820'],['SCRIPT-HOST.EXE'],['CreateRemoteThread']],supported:'You tie the private executable region and remote-thread creation to SCRIPT-HOST.EXE.',partial:'You suspect injection but do not reconstruct the creator/thread evidence.',missing:'The memory/process evidence is not correctly interpreted.'},
      {label:'Impact scope',groups:[['outbound'],['198.51.100.77'],['persistence','0'],['not','signed app']],supported:'You note the new outbound connection and lack of observed persistence without treating FINAPP.EXE itself as the root cause.',partial:'You identify the connection but overstate persistence or binary compromise.',missing:'Observed impact is not bounded.'},
      {label:'Response order',groups:[['isolate'],['capture memory'],['then','terminate']],supported:'You preserve volatile evidence before destructive remediation.',partial:'You contain the host but do not explicitly preserve memory/thread state first.',missing:'The response destroys key evidence.'}
    ]
  },
  {
    id:'C094', title:'Public Name, Private Intent', subtitle:'The package name was internal. The resolver did not know that.', tier:'Expert software supply-chain assessment',
    brief:'A fictional build pipeline unexpectedly downloads a package with the same name as an internal dependency from a public registry. Determine why resolution escaped the private registry, prove the issue with a benign training package, scope affected builds, and redesign dependency trust so package names alone are not security boundaries.',
    environment:'Aster Analytics / package registry + CI training pipeline',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Internal dependency','Manifest','analytics-core depends on corp-math 2.x, historically published only to the internal registry.','The dependency name is unscoped.'),
      e('ev2','Resolver configuration','CI config','The pipeline checks the internal registry and then falls back to the public registry for unresolved unscoped packages.','No namespace reservation blocks public resolution.'),
      e('ev3','Public higher version','Registry snapshot','A benign training package corp-math 9.9.9 exists in the fictional public registry.','Its install script writes only /training/DEP-CONFUSION-PROOF.'),
      e('ev4','Build evidence','CI log','Build 5512 resolved corp-math 9.9.9 from public and executed the harmless proof script.','No secret access or network egress occurred in the proof.'),
      e('ev5','Affected jobs','Build inventory','Three legacy pipelines share the same fallback configuration; newer pipelines use scoped private packages.','The issue is configuration-wide, not limited to one repository.'),
      e('ev6','Provenance control','Platform note','The build system supports lockfile integrity, private namespaces, registry pinning, and signed provenance.','These controls can prevent recurrence without blocking all third-party packages.')
    ],
    logs:[
      {id:'build',name:'Build 5512',text:`resolve corp-math constraint=^2.4\ninternal registry: no matching package metadata returned\npublic registry: corp-math@9.9.9 selected\ninstall: wrote /training/DEP-CONFUSION-PROOF\nnetwork_after_install=0 secret_reads=0`},
      {id:'inventory',name:'Pipeline inventory',text:`legacy-a fallback_public=true\nlegacy-b fallback_public=true\nlegacy-c fallback_public=true\nmodern-x scoped_packages=true private_registry_only_for_scope=true`}
    ],
    terminal:[
      [/^help$/i,'Try: manifest analytics-core, resolver legacy-a, registry corp-math, build 5512, scope pipelines fallback_public, controls packages'],
      [/^manifest analytics-core$/i,'corp-math ^2.4 (unscoped internal dependency)'],
      [/^resolver legacy-a$/i,'internal first; public fallback enabled for unresolved unscoped names'],
      [/^registry corp-math$/i,'internal expected 2.x; fictional public 9.9.9 training package available'],
      [/^build 5512$/i,'selected public corp-math@9.9.9; proof marker written; secret reads=0; egress=0'],
      [/^scope pipelines fallback_public$/i,'legacy-a legacy-b legacy-c'],
      [/^controls packages$/i,'private namespace + registry pinning + lockfile integrity + provenance verification']
    ],
    actions:[
      {id:'a1',label:'Preserve resolver and build logs',description:'Keep evidence of where the package came from and what executed.',outcome:'The dependency path remains auditable.',quality:'good'},
      {id:'a2',label:'Move internal dependencies to a reserved private namespace',description:'Make ownership explicit instead of relying on an unscoped name.',outcome:'Public packages cannot silently satisfy internal dependency names.',quality:'good'},
      {id:'a3',label:'Pin registries and verify lock/provenance data',description:'Require expected source and integrity for builds.',outcome:'The pipeline rejects unexpected package origins and artifacts.',quality:'good'},
      {id:'a4',label:'Ban all public dependencies',description:'Remove every third-party package regardless of provenance.',outcome:'Development breaks unnecessarily and the root resolver design is not addressed precisely.',quality:'bad'}
    ],
    hints:['The important question is not just “which version won?” but “why was the public registry allowed to answer for an internal name?”','The proof package is intentionally benign; keep impact limited to what the build log shows.','A reserved namespace plus source/integrity enforcement is stronger than trying to reserve every possible unscoped package name manually.'],
    evaluation:[
      {label:'Resolver diagnosis',groups:[['unscoped'],['public','fallback'],['corp-math'],['9.9.9']],supported:'You explain how an internal dependency name escaped to public resolution.',partial:'You identify the malicious-looking package but not the resolver policy that selected it.',missing:'The supply-chain root cause is not identified.'},
      {label:'Scope and impact',groups:[['legacy-a','legacy-b','legacy-c'],['proof marker'],['no','secret'],['no','egress']],supported:'You scope affected pipelines and keep the proof impact bounded.',partial:'You identify multiple pipelines but overstate compromise.',missing:'Affected scope or observed impact is not supported.'},
      {label:'Dependency trust redesign',groups:[['private namespace'],['registry pin'],['lockfile','integrity'],['provenance']],supported:'You replace name-based trust with explicit source and integrity controls.',partial:'You propose only one control and leave fallback ambiguity.',missing:'The build remains vulnerable to unexpected registry resolution.'}
    ]
  },
  {
    id:'C095', title:'The Tag That Became a Key', subtitle:'The policy looked least-privileged until one permission could rewrite the condition.', tier:'Expert cloud IAM assessment',
    brief:'An authorized cloud IAM review finds a role that may assume production access only when its own Environment tag equals Prod. A developer cannot directly assume production, but can edit tags on the intermediary role. Determine whether this turns metadata control into privilege control, prove it through the simulator, and redesign authorization so users cannot satisfy their own eligibility conditions.',
    environment:'Northbridge Cloud / conditional IAM training account',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Production trust condition','IAM policy','ProdDeployRole trusts BuildBroker only when aws:PrincipalTag/Environment equals Prod.','The condition assumes role tags are controlled by administrators.'),
      e('ev2','Developer permission','IAM effective access','dev.mira cannot AssumeRole ProdDeployRole directly but can TagRole BuildBroker.','TagRole is not constrained by allowed tag keys or values.'),
      e('ev3','Simulation before tag','Policy simulator','BuildBroker with Environment=Dev is denied production assumption.','This is the intended baseline.'),
      e('ev4','Harmless tag proof','Policy simulator','After setting Environment=Prod on BuildBroker in the simulator, the production assumption becomes allowed.','No real production session is created.'),
      e('ev5','Audit history','Cloud trail','No real TagRole change or ProdDeployRole session by dev.mira is present in the production audit window.','The issue is proven exposure, not observed exploitation.'),
      e('ev6','Safer authorization option','IAM design','Eligibility can be based on immutable workload identity or an administrator-controlled assignment path.','Tag mutation can be separated from privilege eligibility.')
    ],
    logs:[
      {id:'iam',name:'IAM graph',text:`dev.mira -> iam:TagRole BuildBroker\nBuildBroker [Environment=Dev] -> ProdDeployRole condition PrincipalTag Environment=Prod`},
      {id:'sim',name:'Simulator',text:`before: AssumeRole ProdDeployRole DENY\nafter simulated TagRole Environment=Prod: AssumeRole ProdDeployRole ALLOW\nreal sessions created=0`}
    ],
    terminal:[
      [/^help$/i,'Try: iam effective dev.mira, iam trust ProdDeployRole, simulate assume before, simulate tag BuildBroker Environment Prod, simulate assume after, audit dev.mira, redesign condition'],
      [/^iam effective dev\.mira$/i,'TagRole BuildBroker=ALLOW; AssumeRole ProdDeployRole=DIRECT DENY'],
      [/^iam trust ProdDeployRole$/i,'principal=BuildBroker condition PrincipalTag/Environment == Prod'],
      [/^simulate assume before$/i,'DENY BuildBroker Environment=Dev'],
      [/^simulate tag BuildBroker Environment Prod$/i,'SIMULATED tag update accepted'],
      [/^simulate assume after$/i,'ALLOW due to PrincipalTag Environment=Prod'],
      [/^audit dev\.mira$/i,'real TagRole changes=0; real ProdDeployRole sessions=0'],
      [/^redesign condition$/i,'use immutable workload identity or admin-controlled entitlement; deny self-service mutation of authorization attributes']
    ],
    actions:[
      {id:'a1',label:'Preserve the effective policy graph and simulator result',description:'Document both the mutation permission and conditional trust.',outcome:'The privilege path is reproducible without creating a production session.',quality:'good'},
      {id:'a2',label:'Remove self-service control of authorization tags',description:'Prevent developers from setting values that satisfy privileged trust.',outcome:'Metadata mutation can no longer manufacture production eligibility.',quality:'good'},
      {id:'a3',label:'Bind production trust to immutable or admin-controlled identity',description:'Make privilege depend on a boundary the subject cannot rewrite.',outcome:'The conditional role path becomes defensible.',quality:'good'},
      {id:'a4',label:'Rotate every cloud access key',description:'Respond as if long-lived credentials were stolen.',outcome:'The conditional authorization flaw remains and unnecessary rotations occur.',quality:'bad'}
    ],
    hints:['Ask who controls the attribute used by the trust condition.','The simulator proves reachability; the audit log explicitly says no real production session occurred.','Authorization attributes should not be writable by the identity whose privilege they decide.'],
    evaluation:[
      {label:'Privilege path',groups:[['TagRole'],['BuildBroker'],['Environment=Prod'],['ProdDeployRole']],supported:'You show how tag mutation can satisfy the production trust condition.',partial:'You notice broad tag permissions but do not connect them to role assumption.',missing:'The conditional IAM path is not reconstructed.'},
      {label:'Exposure vs use',groups:[['simulator'],['real sessions','0'],['no','exploitation']],supported:'You correctly classify the finding as proven privilege exposure without observed production use.',partial:'You mention the simulator but still imply real compromise.',missing:'The evidence is overstated or ignored.'},
      {label:'Authorization redesign',groups:[['remove','self-service'],['immutable','admin-controlled'],['authorization attribute']],supported:'You move eligibility to attributes the subject cannot rewrite.',partial:'You restrict tag values but leave privilege conditions under subject control.',missing:'The trust model remains self-satisfiable.'}
    ]
  },
  {
    id:'C096', title:'Restored With Yesterday\'s Trust', subtitle:'The server was rebuilt from a clean backup. The backup faithfully restored an old secret too.', tier:'Expert recovery + credential lifecycle investigation',
    brief:'A recovered Linux service begins accepting an SSH key that was retired months ago. Determine whether the key arrived through compromise or through backup restore, scope any observed use, and redesign restore procedures so recovery does not resurrect revoked access.',
    environment:'Aster Research / Linux backup + recovery training environment',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Retired key record','Access registry','Key fingerprint SHA256:OLD-44 was revoked from asset SERVICE-12 three months ago.','The central registry no longer lists it as valid.'),
      e('ev2','Backup timestamp','Recovery metadata','SERVICE-12 was restored yesterday from a snapshot created four months ago.','The snapshot predates the key revocation.'),
      e('ev3','Restored authorized_keys','File metadata','The restored home directory contains SHA256:OLD-44 with file birth time matching the restore operation.','No post-restore editor process modified the file.'),
      e('ev4','One successful use','SSH log','The retired key authenticated once from the recovery VLAN during validation.','Source host is the approved recovery jump box operated by admin.sora.'),
      e('ev5','No external use','Network/auth audit','No authentication using OLD-44 occurred from outside the recovery VLAN.','The only proven use is the approved validation session.'),
      e('ev6','Post-restore control gap','Recovery checklist','The restore process validates package integrity and service health but does not reconcile access material against current revocation state.','A post-restore identity reconciliation step is missing.')
    ],
    logs:[
      {id:'restore',name:'Restore timeline',text:`snapshot_date=2026-05-10\nkey_revoked=2026-06-21\nrestore=2026-09-13 18:04\nauthorized_keys created_from_snapshot=18:05`},
      {id:'ssh',name:'SSH audit',text:`18:22 fingerprint=SHA256:OLD-44 source=recovery-jump-01 user=svcapp result=SUCCESS actor=admin.sora\nother OLD-44 events=0`}
    ],
    terminal:[
      [/^help$/i,'Try: key registry OLD-44, snapshot SERVICE-12, file meta authorized_keys, ssh fingerprint OLD-44, scope source OLD-44, checklist restore access'],
      [/^key registry OLD-44$/i,'revoked 2026-06-21; current valid=false'],
      [/^snapshot SERVICE-12$/i,'created 2026-05-10; restored 2026-09-13'],
      [/^file meta authorized_keys$/i,'created during restore; contains SHA256:OLD-44; post-restore edits=0'],
      [/^ssh fingerprint OLD-44$/i,'one SUCCESS from recovery-jump-01 actor=admin.sora'],
      [/^scope source OLD-44$/i,'external=0 production_vlan=0 recovery_vlan=1'],
      [/^checklist restore access$/i,'missing step: reconcile restored credentials/keys/tokens with current identity revocation state']
    ],
    actions:[
      {id:'a1',label:'Remove the retired key after preserving restore evidence',description:'Delete the resurrected credential only after recording how it returned.',outcome:'Current access matches the revocation registry.',quality:'good'},
      {id:'a2',label:'Add post-restore access reconciliation',description:'Compare restored keys, local accounts, tokens, and trust files against current identity state.',outcome:'Recovery no longer blindly restores revoked access.',quality:'good'},
      {id:'a3',label:'Rebuild future snapshots after access changes',description:'Reduce the amount of stale authorization state carried in backups.',outcome:'Recovery images better reflect current trust without replacing reconciliation.',quality:'good'},
      {id:'a4',label:'Declare the recovery jump box compromised',description:'Treat the approved validation session as attacker use.',outcome:'The conclusion exceeds the authentication and change records.',quality:'bad'}
    ],
    hints:['Compare snapshot date, revocation date, and restore time before assuming a post-restore attacker modified the key file.','The one successful key use came from an approved recovery host and actor.','The durable fix is a restore-time identity reconciliation process, not just deleting this one key.'],
    evaluation:[
      {label:'Root cause',groups:[['snapshot'],['predates','revocation'],['restore'],['authorized_keys']],supported:'You show that the retired key was resurrected by an older snapshot, not a post-restore edit.',partial:'You notice the stale key but do not prove how it returned.',missing:'The recovery mechanism is not identified as the source.'},
      {label:'Observed use',groups:[['recovery-jump-01'],['admin.sora'],['one'],['external','0']],supported:'You correctly scope the only key use as approved recovery validation.',partial:'You identify the session but imply broader malicious use.',missing:'The authentication evidence is misread.'},
      {label:'Recovery hardening',groups:[['post-restore'],['reconcile'],['revocation'],['current identity']],supported:'You add a systematic current-state access reconciliation after restore.',partial:'You remove the key but leave the restore process unchanged.',missing:'Future restores can still resurrect revoked trust.'}
    ]
  },
  {
    id:'C097', title:'Message From Parent', subtitle:'The browser trusted a message because it looked right, not because it came from the right place.', tier:'Expert browser trust assessment',
    brief:'An authorized review of a fictional finance dashboard finds that an embedded report frame accepts postMessage commands from any origin as long as the message has the expected shape. Prove the issue with a benign sibling-origin page, determine what actions are actually reachable, and harden both origin and message validation.',
    environment:'Northbridge Finance / browser messaging training application',
    tools:['overview','browser','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Message handler','Frontend source','The report frame listens for message events and validates event.data.type but never checks event.origin.','The handler supports exportPreview and setTheme.'),
      e('ev2','Sibling origin','Application inventory','marketing.northbridge.test is a separate application origin that can embed the report frame.','It is not authorized to control finance exports.'),
      e('ev3','Benign proof','Browser trace','A training page on the sibling origin sends exportPreview and the finance frame generates a redacted preview artifact.','The proof does not trigger a real export or access customer data.'),
      e('ev4','Privileged action guard','Frontend/API trace','finalExport requires a server-side CSRF token and finance permission; postMessage alone cannot satisfy it.','Impact is limited to the client-side preview behavior shown.'),
      e('ev5','Schema weakness','Frontend source','The handler accepts additional unrecognized fields and coerces some values.','Strict schema validation would reduce parser ambiguity.'),
      e('ev6','Expected parent origin','Deployment config','The legitimate parent is exactly https://finance.northbridge.test.','An explicit origin allowlist can be narrow.')
    ],
    browser:[
      {id:'b1',url:'trace://browser/message-lab',title:'postMessage lab',html:`<div class="fake-site"><h2>Browser messaging lab</h2><div class="box"><pre>legit parent: https://finance.northbridge.test\nsibling test: https://marketing.northbridge.test\nreal exports: disabled in lab</pre></div></div>`}
    ],
    logs:[
      {id:'browser',name:'Browser event trace',text:`source=https://marketing.northbridge.test type=exportPreview accepted=true\nartifact=preview-redacted.pdf\nfinalExport attempts=0`},
      {id:'api',name:'API authorization',text:`POST /final-export requires finance permission + CSRF token\nlab sibling origin has neither`}
    ],
    terminal:[
      [/^help$/i,'Try: source handler, config parent, replay sibling exportPreview, audit finalExport, schema handler, regression message'],
      [/^source handler$/i,'checks data.type; origin check=MISSING; accepts extra fields'],
      [/^config parent$/i,'expected origin=https://finance.northbridge.test'],
      [/^replay sibling exportPreview$/i,'ACCEPTED from https://marketing.northbridge.test -> preview-redacted.pdf'],
      [/^audit finalExport$/i,'attempts=0; server requires finance permission + CSRF token'],
      [/^schema handler$/i,'unknown fields accepted; coercion enabled'],
      [/^regression message$/i,'finance origin + valid schema ALLOW; sibling origin DENY; malformed message DENY']
    ],
    actions:[
      {id:'a1',label:'Require the exact finance parent origin',description:'Validate event.origin before processing commands.',outcome:'Sibling origins can no longer drive the finance frame.',quality:'good'},
      {id:'a2',label:'Validate a strict message schema',description:'Reject unknown fields, coercion, and unsupported commands.',outcome:'The message boundary becomes explicit and testable.',quality:'good'},
      {id:'a3',label:'Keep server authorization on final exports',description:'Preserve the independent backend control even after client hardening.',outcome:'Sensitive actions remain protected by defense in depth.',quality:'good'},
      {id:'a4',label:'Remove all iframe support',description:'Break the reporting workflow instead of fixing the trust check.',outcome:'Functionality is lost unnecessarily.',quality:'bad'}
    ],
    hints:['The message type is validated; the sender is not.','The proof demonstrates preview generation only. The server trace limits what you can claim about final exports.','Use both exact origin validation and strict message schema checks.'],
    evaluation:[
      {label:'Browser trust flaw',groups:[['postMessage'],['event.origin'],['marketing.northbridge.test'],['exportPreview']],supported:'You identify missing sender-origin validation and demonstrate the sibling-origin preview action.',partial:'You find the message handler issue but do not tie it to the sibling origin.',missing:'The client trust boundary is not reconstructed.'},
      {label:'Impact discipline',groups:[['preview'],['redacted'],['finalExport'],['requires','permission']],supported:'You keep impact limited to the demonstrated preview behavior and preserve server-side authorization boundaries.',partial:'You identify server controls but still imply a real customer export.',missing:'The browser proof is overstated.'},
      {label:'Hardening',groups:[['exact origin'],['strict schema'],['server authorization']],supported:'You harden sender identity, message parsing, and retain backend authorization.',partial:'You fix only one layer.',missing:'The messaging boundary remains broadly trusted.'}
    ]
  },
  {
    id:'C098', title:'Replication Was Not Backup', subtitle:'A service account had directory replication rights for a migration that ended last year.', tier:'Expert Active Directory privilege investigation',
    brief:'Directory monitoring detects a non-domain-controller service account requesting replication data. Determine why the account can do this, whether the observed request used the privilege, what evidence justifies credential-response actions, and how to remove the stale directory control safely.',
    environment:'Aster Manufacturing / Active Directory replication training domain',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Stale migration group','Directory ACL','svc-migrate remains in Legacy-Directory-Migration, which has directory replication extended rights at the domain root.','The migration project closed eleven months ago.'),
      e('ev2','Replication event','Directory telemetry','svc-migrate requested replication data from DC-01 at 03:22 from APP-LEGACY-04.','APP-LEGACY-04 is not a domain controller.'),
      e('ev3','Scope of request','Directory telemetry','The request covered credential-bearing directory attributes for a small object set in the training domain.','The lab records the replication operation, not plaintext password recovery.'),
      e('ev4','No backup job','Scheduler inventory','No approved migration or backup job runs as svc-migrate at 03:22.','The last approved use was eleven months ago.'),
      e('ev5','Host state','Endpoint evidence','APP-LEGACY-04 shows an interactive service-account logon at 03:18 from an unapproved admin jump host.','This connects the stale privilege to suspicious observed use.'),
      e('ev6','Containment dependency','Application inventory','One legacy export service still runs as svc-migrate but does not require directory replication rights.','The account can remain temporarily while the privilege is removed and credentials are rotated.')
    ],
    logs:[
      {id:'directory',name:'Directory events',text:`03:22 principal=svc-migrate source=APP-LEGACY-04 operation=directory-replication object_count=14\napproved_job=NONE`},
      {id:'acl',name:'Effective rights',text:`svc-migrate -> Legacy-Directory-Migration -> Replicating Directory Changes + Replicating Directory Changes All`},
      {id:'host',name:'Host authentication',text:`03:18 svc-migrate interactive logon APP-LEGACY-04 source=admin-jump-09 approved=false`}
    ],
    terminal:[
      [/^help$/i,'Try: ad rights svc-migrate, ad replication svc-migrate, jobs svc-migrate, auth svc-migrate APP-LEGACY-04, app dependency svc-migrate, response directory'],
      [/^ad rights svc-migrate$/i,'Legacy-Directory-Migration -> domain replication extended rights'],
      [/^ad replication svc-migrate$/i,'03:22 source=APP-LEGACY-04 objects=14 credential-bearing attributes included'],
      [/^jobs svc-migrate$/i,'approved migration/backup jobs at 03:22 = 0'],
      [/^auth svc-migrate APP-LEGACY-04$/i,'03:18 interactive logon from admin-jump-09 approved=false'],
      [/^app dependency svc-migrate$/i,'legacy export service requires account login but NOT replication rights'],
      [/^response directory$/i,'preserve events; remove replication rights; rotate svc-migrate; investigate source host/session; review exposed credential scope']
    ],
    actions:[
      {id:'a1',label:'Preserve replication and source-host evidence',description:'Capture the directory operation and preceding service-account session.',outcome:'The suspicious privilege use remains reconstructable.',quality:'good'},
      {id:'a2',label:'Remove stale replication rights immediately',description:'Detach the legacy migration group from domain replication control.',outcome:'The account can no longer request privileged directory replication data.',quality:'good'},
      {id:'a3',label:'Rotate svc-migrate and investigate the source session',description:'Treat the observed unapproved use as a credential incident while keeping the export service migration planned.',outcome:'The account is contained and the actual entry path is investigated.',quality:'good'},
      {id:'a4',label:'Delete the entire export service and domain account before evidence capture',description:'Destroy the dependency and identity immediately.',outcome:'Operations fail and useful source/session evidence may be lost.',quality:'bad'}
    ],
    hints:['Effective rights come from a stale migration group, not from domain-controller membership.','Unlike a mere exposure finding, this case has an observed replication request plus an unapproved service-account logon.','The application needs the account, but not the replication privilege; separate service continuity from privilege containment.'],
    evaluation:[
      {label:'Privilege origin',groups:[['Legacy-Directory-Migration'],['replication'],['domain root'],['stale']],supported:'You trace svc-migrate replication capability to the stale migration group rights.',partial:'You identify powerful rights but not how they are inherited.',missing:'The effective directory privilege is not explained.'},
      {label:'Observed suspicious use',groups:[['03:22'],['APP-LEGACY-04'],['14'],['03:18','admin-jump-09']],supported:'You connect the actual replication request to the unapproved preceding service-account session.',partial:'You identify one suspicious event but not the chain.',missing:'The evidence of use is not reconstructed.'},
      {label:'Containment',groups:[['preserve'],['remove','replication rights'],['rotate'],['investigate']],supported:'You preserve evidence, remove the dangerous privilege, rotate the account, and investigate the source without unnecessarily killing the dependent service.',partial:'You contain the privilege but omit source investigation or service continuity.',missing:'The response leaves the replication path open or destroys evidence needlessly.'}
    ]
  },
  {
    id:'C099', title:'Signed After the Wrong Build', subtitle:'The artifact was signed correctly. The signer trusted the wrong thing upstream.', tier:'Expert CI/CD provenance investigation',
    brief:'A release artifact has a valid corporate signature but its dependency provenance points to an unexpected build input. Determine whether signing alone establishes trust, reconstruct the build-to-sign path, prove where policy failed, and redesign release authorization so only attested inputs can reach the signer.',
    environment:'Northbridge Software / CI provenance + release-signing training pipeline',
    tools:['overview','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Valid release signature','Artifact metadata','release-7.4.2.bin has a valid corporate code-signing signature.','The signer proves who signed the artifact, not whether its inputs were approved.'),
      e('ev2','Unexpected build input','Provenance record','The artifact was built from dependency bundle dep-bundle-991, generated by legacy-builder-3.','Approved releases should use hermetic-builder-1.'),
      e('ev3','Signer policy gap','Signing service policy','The signer checks release branch and requester identity but does not verify build provenance attestation.','Any artifact from the release job can reach signing if those two checks pass.'),
      e('ev4','Legacy builder event','CI audit','legacy-builder-3 was manually selected by maint.lee during an outage workaround.','The change had a ticket for availability, but not approval to bypass provenance.'),
      e('ev5','No malicious payload proven','Artifact comparison','The training artifact differs in one embedded build marker; no credential theft, persistence, or unauthorized network behavior is observed.','The trust failure is real even without a malicious payload.'),
      e('ev6','Attestation support','Platform capability','The signing service can require a signed build attestation naming builder identity, source revision, and dependency digest.','A policy can reject artifacts from unapproved builders.')
    ],
    logs:[
      {id:'release',name:'Release chain',text:`source=rev-a81\nbuilder=legacy-builder-3\ndep_bundle=dep-bundle-991\nrelease_job requester=maint.lee branch=release/7.4\nsigner policy branch=PASS requester=PASS provenance=NOT_CHECKED\nsignature=VALID`},
      {id:'artifact',name:'Artifact analysis',text:`difference=embedded marker BUILDER=legacy-builder-3\ncredential behavior=0 persistence=0 unauthorized network=0`}
    ],
    terminal:[
      [/^help$/i,'Try: verify signature release-7.4.2.bin, provenance release-7.4.2.bin, policy signer, audit legacy-builder-3, compare artifact, design attestation'],
      [/^verify signature release-7.4.2\.bin$/i,'VALID corporate signer'],
      [/^provenance release-7.4.2\.bin$/i,'builder=legacy-builder-3 dependency_bundle=dep-bundle-991 source=rev-a81'],
      [/^policy signer$/i,'checks branch + requester; provenance attestation NOT CHECKED'],
      [/^audit legacy-builder-3$/i,'manual selection by maint.lee under outage ticket; provenance bypass not approved'],
      [/^compare artifact$/i,'only observed difference=build marker; malicious behavior=0'],
      [/^design attestation$/i,'signer require signed attestation: approved builder identity + source revision + dependency digest']
    ],
    actions:[
      {id:'a1',label:'Quarantine the release pending provenance review',description:'Pause distribution without claiming malicious payload behavior.',outcome:'The trust problem is contained while evidence is preserved.',quality:'good'},
      {id:'a2',label:'Require verified build attestation before signing',description:'Bind the signer to approved builder identity and dependency/source digests.',outcome:'A valid signature now represents an approved build path, not just a signer action.',quality:'good'},
      {id:'a3',label:'Separate emergency builder use from release-sign eligibility',description:'Allow recovery builds but prevent them from automatically becoming signed production releases.',outcome:'Availability workarounds no longer silently bypass release trust.',quality:'good'},
      {id:'a4',label:'Revoke the corporate signing key because the signature was valid',description:'Treat policy misuse as proof the signing key itself was stolen.',outcome:'Major disruption without evidence of key compromise.',quality:'bad'}
    ],
    hints:['A valid signature answers “who signed this?” It does not automatically answer “was this built from approved inputs?”','The artifact analysis intentionally does not prove a malicious payload.','Move provenance verification into the authorization decision at the signer.'],
    evaluation:[
      {label:'Trust-chain diagnosis',groups:[['valid signature'],['legacy-builder-3'],['provenance'],['NOT_CHECKED']],supported:'You explain why the signed artifact is still untrusted because the signer ignored provenance.',partial:'You notice the legacy builder but treat signature validity as sufficient or irrelevant.',missing:'The CI-to-sign trust gap is not reconstructed.'},
      {label:'Impact discipline',groups:[['build marker'],['no','credential'],['no','persistence'],['quarantine']],supported:'You contain the release while keeping payload claims limited to observed differences.',partial:'You quarantine correctly but imply malicious behavior not present in evidence.',missing:'The artifact is either trusted blindly or described with unsupported impact.'},
      {label:'Release redesign',groups:[['attestation'],['approved builder'],['source revision'],['dependency digest']],supported:'You require verifiable provenance before signing and separate emergency builds from release authorization.',partial:'You add provenance records but do not enforce them at signing.',missing:'The signer can still approve artifacts from untrusted build paths.'}
    ]
  },
  {
    id:'C100', title:'The Quiet Quarter', subtitle:'A public package, a mutable cloud tag, and a signed release form one proven chain. Two scary findings do not.', tier:'Expert enterprise capstone',
    brief:'Quarter-end security review finds five serious-looking anomalies across CI, cloud IAM, endpoint telemetry, and disaster recovery. Reconstruct the one evidence-backed path from a dependency-resolution failure to production data access, separate two unrelated control weaknesses, preserve evidence in the right order, and design containment that keeps release and recovery operations available.',
    environment:'Northbridge Group / enterprise CI + cloud + endpoint + recovery capstone',
    tools:['overview','browser','logs','terminal','evidence','board','actions','notes','hints','theory'],
    evidence:[
      e('ev1','Unexpected package resolution','CI provenance','Build 771 resolved internal package corp-forecast from the fictional public registry because the legacy pipeline allowed unscoped fallback.','The package executed in the CI job and wrote a benign proof marker plus one cloud API call in the training trace.'),
      e('ev2','CI identity permission','Cloud IAM','The CI role cannot assume ProdAnalyticsRole directly, but it can TagRole on BuildBroker.','ProdAnalyticsRole trusts BuildBroker only when Environment=Prod.'),
      e('ev3','Observed tag mutation','Cloud trail','During build 771, BuildBroker changed Environment from Dev to Prod, then a ProdAnalyticsRole session was created through the broker.','Unlike C095, this capstone contains observed use, not just simulator reachability.'),
      e('ev4','Production data access','Object audit','The brokered production session read analytics-prod/q3-summary.parquet and no other production object.','Writes, deletes, bucket listing, and key-management actions are zero.'),
      e('ev5','Signed artifact','Release metadata','The build artifact from 771 received a valid corporate signature because the signer checked branch/requester but not provenance.','The release was quarantined before customer deployment.'),
      e('ev6','Endpoint anomaly','Endpoint telemetry','FIN-WS-22 shows a signed profiler creating a private executable memory region during an approved performance investigation.','Ticket PERF-441 and tool hash match the approved profiler; there is no relation to build 771 identities or timing.'),
      e('ev7','Restored stale SSH key','Recovery audit','RECOVERY-DB-02 restored an old SSH key from a six-month snapshot.','The key was used once by the approved recovery jump host; there is no shared identity, host, or token with the CI/cloud chain.'),
      e('ev8','Package provenance','Registry audit','corp-forecast 8.8.8 came from the fictional public registry; approved internal version is 3.6.2.','Legacy pipeline `quarterly-forecast` is the only pipeline that resolved this package publicly.'),
      e('ev9','Cross-system correlation','Correlation report','Build 771 job identity, BuildBroker tag event, ProdAnalyticsRole session, and object read share trace ID Q771.','FIN-WS-22 and RECOVERY-DB-02 have no Q771 identifier or overlapping identity.'),
      e('ev10','Business continuity','Operations constraint','Quarter-end forecast generation, production analytics reads, signing, endpoint performance testing, and recovery must remain available through corrected paths.','The response should remove broken trust without disabling whole platforms.')
    ],
    browser:[
      {id:'b1',url:'trace://quarter-review',title:'Quarter review board',html:`<div class="fake-site"><h2>Quarter-end review</h2><div class="box"><pre>trace Q771: CI -> tag mutation -> broker -> prod read -> signed artifact\nPERF-441: approved endpoint profiler\nREC-882: approved recovery validation with stale restored key</pre></div><p>Correlation is evidence, not coincidence.</p></div>`}
    ],
    logs:[
      {id:'timeline',name:'Enterprise timeline',text:`01:02 build 771 resolves public corp-forecast@8.8.8 trace=Q771\n01:03 Q771 TagRole BuildBroker Environment=Prod\n01:04 Q771 BuildBroker -> ProdAnalyticsRole SUCCESS\n01:05 Q771 GetObject analytics-prod/q3-summary.parquet SUCCESS\n01:09 build 771 artifact signed; provenance check=SKIPPED\n01:14 release QUARANTINED\n02:20 PERF-441 approved profiler activity FIN-WS-22\n03:40 REC-882 stale key restored on RECOVERY-DB-02\n03:55 approved recovery-jump key validation`},
      {id:'ci',name:'CI and provenance',text:`pipeline=quarterly-forecast public_fallback=true\npackage=corp-forecast@8.8.8 source=public-training-registry\ntrace=Q771\nsigner branch=PASS requester=PASS provenance=NOT_CHECKED`},
      {id:'cloud',name:'Cloud trail',text:`Q771 ci-role TagRole BuildBroker Environment=Prod\nQ771 BuildBroker AssumeRole ProdAnalyticsRole\nQ771 ProdAnalyticsRole GetObject analytics-prod/q3-summary.parquet\nwrites=0 deletes=0 list=0 kms=0`},
      {id:'noise',name:'Independent findings',text:`PERF-441 approved profiler hash=VALID relation_to_Q771=NONE\nREC-882 restored key source=snapshot; only use=recovery-jump; relation_to_Q771=NONE`}
    ],
    terminal:[
      [/^help$/i,'Try: timeline Q771, package corp-forecast, resolver quarterly-forecast, iam path Q771, object audit Q771, signer build 771, correlate PERF-441 Q771, correlate REC-882 Q771, response quarter'],
      [/^timeline Q771$/i,'01:02 public package -> 01:03 broker tag mutation -> 01:04 production role -> 01:05 one prod object read -> 01:09 signed artifact -> quarantine'],
      [/^package corp-forecast$/i,'internal approved=3.6.2; resolved public=8.8.8 in build 771'],
      [/^resolver quarterly-forecast$/i,'unscoped internal name; public fallback enabled'],
      [/^iam path Q771$/i,'ci-role --TagRole--> BuildBroker Environment=Prod -> ProdAnalyticsRole'],
      [/^object audit Q771$/i,'GetObject analytics-prod/q3-summary.parquet=1; writes/deletes/list/kms=0'],
      [/^signer build 771$/i,'signature valid; provenance attestation NOT CHECKED; release quarantined before deployment'],
      [/^correlate PERF-441 Q771$/i,'shared identity/host/token/trace=NONE; PERF-441 approved'],
      [/^correlate REC-882 Q771$/i,'shared identity/host/token/trace=NONE; restored-key finding independent'],
      [/^response quarter$/i,'preserve Q771 CI/cloud/signing logs; pin private package source; remove CI tag authority; bind prod trust to immutable/admin entitlement; require provenance before signing; rotate/review impacted cloud session; separately fix restore reconciliation; leave approved profiler path intact']
    ],
    actions:[
      {id:'a1',label:'Preserve the complete Q771 evidence chain',description:'Capture package resolution, build logs, tag mutation, role session, object audit, and signing metadata.',outcome:'The proven path remains reconstructable end to end.',quality:'good'},
      {id:'a2',label:'Pin internal package resolution and require provenance at signing',description:'Close both the initial dependency trust failure and downstream release authorization gap.',outcome:'Unexpected public package inputs cannot silently become signed releases.',quality:'good'},
      {id:'a3',label:'Remove CI control of production-eligibility tags',description:'Separate role metadata mutation from production authorization.',outcome:'The Q771 cloud privilege path is broken while approved production roles remain usable.',quality:'good'},
      {id:'a4',label:'Review and revoke the Q771 production session after evidence capture',description:'Contain the observed production access and assess the one object read.',outcome:'The demonstrated cloud session is closed without disabling analytics globally.',quality:'good'},
      {id:'a5',label:'Fix restore-time credential reconciliation as a separate finding',description:'Remove the stale recovery key and add current-state reconciliation.',outcome:'The recovery weakness is corrected without falsely merging it into Q771.',quality:'good'},
      {id:'a6',label:'Declare the approved profiler part of the CI intrusion',description:'Connect the endpoint memory event based on severity rather than shared evidence.',outcome:'The investigation mixes an approved performance event into the attack narrative.',quality:'bad'},
      {id:'a7',label:'Disable all package registries, cloud role assumption, signing, and recovery',description:'Shut down every involved platform.',outcome:'Quarter-end operations fail despite precise containment options.',quality:'bad'}
    ],
    hints:['Start with identifiers. Q771 is shared by package resolution, tag mutation, the production session, and the object read.','The valid signature is downstream of the compromised build path because provenance was not enforced. It does not prove the signing key was stolen.','PERF-441 and REC-882 are real findings, but neither shares identity, host, token, or trace data with Q771.','Observed production impact is one object read. Do not turn it into bucket-wide exfiltration or write access.','A strong containment plan breaks package-source trust, self-satisfiable cloud authorization, and signer provenance while treating recovery reconciliation separately.'],
    evaluation:[
      {label:'Proven Q771 chain',groups:[['corp-forecast'],['public'],['Q771'],['TagRole','BuildBroker'],['ProdAnalyticsRole'],['q3-summary.parquet']],supported:'You reconstruct the evidence-backed chain from public dependency resolution through mutable cloud authorization to the single production object read.',partial:'You identify major components but miss how one step enabled the next.',missing:'The central enterprise attack path is not reconstructed.'},
      {label:'Release trust',groups:[['valid signature'],['provenance','NOT_CHECKED'],['quarantined'],['before','deployment']],supported:'You explain why the artifact signature did not rescue an untrusted build and correctly note it was quarantined before deployment.',partial:'You recognize the signer gap but imply customer deployment or signing-key theft.',missing:'The release evidence is misinterpreted.'},
      {label:'Impact scope',groups:[['one','object'],['writes','0'],['deletes','0'],['list','0']],supported:'You bound production impact to the single observed object read.',partial:'You find the object access but overstate broader storage impact.',missing:'Production impact is unsupported or ignored.'},
      {label:'Correlation discipline',groups:[['PERF-441'],['REC-882'],['no shared','NONE'],['separate']],supported:'You keep the approved profiler and stale restored-key finding separate from Q771 while still treating the recovery control gap as real.',partial:'You acknowledge uncertainty but still imply a unified intrusion.',missing:'Unrelated findings are merged into the Q771 narrative.'},
      {label:'Enterprise containment',groups:[['pin','package'],['remove','tag authority'],['immutable','authorization'],['provenance','signing'],['revoke','Q771'],['restore','reconcile']],supported:'You close the proven chain, preserve business continuity, and remediate the independent recovery weakness separately.',partial:'You contain the incident but leave one major trust edge open or cause avoidable broad outage.',missing:'The response is incomplete, evidence-destructive, or unnecessarily platform-wide.'}
    ]
  },

];

export const caseById = id => cases.find(c => c.id === id) || cases[0];
