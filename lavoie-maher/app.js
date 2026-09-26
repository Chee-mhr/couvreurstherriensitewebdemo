/* =========================================================
   Projecteur — fenêtre interactive, données fictives.
   Tout est calculé dans le navigateur : aucune requête réseau.
   ========================================================= */
(() => {
"use strict";
const root = document.getElementById("app");
if (!root) return;
const EN = document.documentElement.lang.startsWith("en");
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r = root) => r.querySelector(s);
const $$ = (s, r = root) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const norm = s => { let o = ""; for (const c of s.toLowerCase()) { const d = c.normalize("NFD").replace(/[̀-ͯ]/g, ""); o += d.length === 1 ? d : c; } return o.replace(/[’‘]/g, "'"); };
const wait = ms => new Promise(r => setTimeout(r, RM ? 0 : ms));
const fmtN = n => n.toLocaleString(EN ? "en-CA" : "fr-CA");

/* ---------------------------------------------------------
   Textes et données (FR / EN)
   --------------------------------------------------------- */
const T = EN ? {
  sub: "Document analysis, on this machine", newConv: "+ New conversation", convs: "Conversations", noConv: "Your questions will appear here.",
  analyses: "Analyses", anName: "Examination — witness B", anDone: "completed", anRun: "in progress", anStop: "stopped", anGo: "See the result ↗",
  modelOff: "no model started", modelWarm: "starting the local model…", modelOn: "local model ready", modelPick: "Model on this machine", paper: "Light paper", dark: "Dark mode",
  dossier: "File", cmds: "Commands", offline: "Offline · nothing leaves here",
  eyebrow: "PROJECTEUR", h: "Your file,<br>read <em>line by line</em>.", p: "Everything is computed on this computer. No exhibit leaves the machine, no account, no cloud. Ask in one sentence.",
  tryIt: "Try it: click a card, type a question, or open", place: "Ask in one sentence…", send: "Send", hint: "Enter to send · fictional data · nothing is sent",
  palPh: "Search a command…", noModel: "no model", model: "local model", touches: "touches files", ms: "ms", viewFoot: "Link shown on screen only: deliverables never contain it.", close: "Close",
  switched: n => `File: ${n}`, attach: "Demo: files are not uploaded. Here is what conversion does on the sample file:",
  cards: [["FIND", "The passage, with its volume and page", "When was the formal notice sent?"], ["TARGET", "Search a single testimony", "Search water in Mr. Tremblay's testimony"], ["BINDER", "A whole witness, ready for the hearing", "The cross-examination binder for witness B"], ["UNDERTAKINGS", "What was promised and never provided", "Undertakings never followed up"], ["WITNESSES", "Who testified, and their non-answers", "The list of witnesses"], ["INVENTORY", "Every exhibit, its nature, its date", "What is in the file"]]
} : {
  sub: "Analyse documentaire, sur cette machine", newConv: "+ Nouvelle conversation", convs: "Conversations", noConv: "Vos questions apparaîtront ici.",
  analyses: "Analyses", anName: "Interrogatoire — témoin B", anDone: "terminée", anRun: "en cours", anStop: "arrêtée", anGo: "Voir le résultat ↗",
  modelOff: "aucun modèle démarré", modelWarm: "démarrage du modèle local…", modelOn: "modèle local prêt", modelPick: "Modèle sur cette machine", paper: "Papier clair", dark: "Mode sombre",
  dossier: "Dossier", cmds: "Commandes", offline: "Hors ligne · rien ne sort d'ici",
  eyebrow: "PROJECTEUR", h: "Votre dossier,<br>lu <em>ligne par ligne</em>.", p: "Tout est calculé sur cet ordinateur. Aucune pièce ne quitte la machine, aucun compte, aucun nuage. Demandez en une phrase.",
  tryIt: "Essayez : cliquez une carte, tapez une question, ou ouvrez", place: "Demandez en une phrase…", send: "Envoyer", hint: "Entrée pour envoyer · données fictives · rien n'est envoyé",
  palPh: "Chercher une commande…", noModel: "aucun modèle", model: "modèle local", touches: "touche aux fichiers", ms: "ms", viewFoot: "Lien affiché à l'écran seulement : les livrables n'en contiennent jamais.", close: "Fermer",
  switched: n => `Dossier : ${n}`, attach: "Démo : les fichiers ne sont pas téléversés. Voici ce que fait la conversion sur le dossier d'exemple :",
  cards: [["RETROUVER", "Le passage, avec son volume et sa page", "Quand la mise en demeure a-t-elle été envoyée ?"], ["CIBLER", "Chercher dans un seul témoignage", "Cherche eau dans le témoignage de M. Tremblay"], ["CAHIER", "Tout un témoin, prêt pour l'audience", "Le cahier de contre-interrogatoire du témoin B"], ["ENGAGEMENTS", "Ce qui a été promis et jamais fourni", "Les engagements jamais repris"], ["TÉMOINS", "Qui a témoigné, et leurs non-réponses", "La liste des témoins"], ["INVENTAIRE", "Chaque pièce, sa nature, sa date", "Qu'est-ce qu'il y a dans le dossier"]]
};

const DOSSIERS = EN
  ? { A: { name: "Construction site (sample)", meta: "12 exhibits · 1 recording · 7 volumes" }, B: { name: "Hearing (sample)", meta: "45 volumes · 8,622 pages · 50 examinations" } }
  : { A: { name: "Chantier (exemple)", meta: "12 pièces · 1 enregistrement · 7 volumes" }, B: { name: "Audience (exemple)", meta: "45 volumes · 8 622 pages · 50 interrogatoires" } };

// Dossier A : chantier. c = cote, t = titre, d = date, v = volume, pg = page, x = texte
const DOCS_A = EN ? [
  { c: "P-1", t: "Construction contract", n: "Contract", d: "2021-02-03", v: 1, pg: 3, x: "The parties agree that the Contractor will deliver the work no later than June 15, 2021. Failing that, a late penalty of $2,500 per day will be payable (s. 7.4). The French drain is included in the specifications (s. 7.2). Acceptance of the work will be recorded in writing (s. 9.1)." },
  { c: "P-4", t: "Email from Mr. Tremblay to Ms. Gagnon", n: "Email (.msg)", d: "2021-03-12", v: 2, pg: 9, x: "Ms. Gagnon, we note a delay of about three weeks on the site. Without a catch-up plan by Friday, I will send you a formal notice to meet the schedule." },
  { c: "P-7", t: "Formal notice", n: "Letter (.docx)", d: "2021-03-19", v: 2, pg: 14, x: "This constitutes a formal notice to deliver the work in accordance with the contract. We will claim the agreed late penalty, i.e. 29 days, for a total of $72,500." },
  { c: "D-2", t: "Email from Ms. Gagnon", n: "Email (.eml)", d: "2021-04-02", v: 2, pg: 21, x: "The delay is due exclusively to the exceptional rain in March. We saw no water infiltration before May. No penalty is justified." },
  { c: "D-9", t: "Site photos (automatic reading)", n: "Images (OCR)", d: "2021-04-20", v: 4, pg: 2, x: "Photo 14: open trench on the north side, standing water. Photo 15: membrane installed, no drain visible. Handwritten note: “rain, 2-day stoppage”." },
  { c: "P-12", t: "Site meeting minutes", n: "Minutes (.rtf)", d: "2021-05-04", v: 2, pg: 30, x: "Water infiltration noted in the basement, present since mid-March according to the superintendent. The French drain is not visible in the excavation. Photos attached." },
  { c: "P-21", t: "Text message from Ms. Gagnon", n: "Text message", d: "2021-06-02", v: 2, pg: 41, x: "We'll finish next week, promise. Finishing and landscaping are left. The rain held us up again." },
  { c: "D-5", t: "Final invoice", n: "Invoice (PDF)", d: "2021-06-30", v: 4, pg: 25, x: "Final invoice for work performed: $84,350.00 taxes included, payable upon acceptance of the work." },
  { c: "P-44", t: "Email from Mtre Roy", n: "Email (.msg)", d: "2021-07-14", v: 5, pg: 3, x: "Provisional acceptance granted with reservations: drainage, foundation cracks and incomplete landscaping. Signed today by the parties." },
  { c: "P-47", t: "Bank statement", n: "Statement (spreadsheet)", d: "2021-08-02", v: 5, pg: 9, x: "Final payment to the Contractor: $11,850.00. $72,500.00 withheld from the final payment as the late penalty." },
  { c: "P-15", t: "Expert report, eng.", n: "Report (scanned PDF)", d: "2022-01-20", v: 3, pg: 1, x: "The cracks observed in the foundation result from missing perimeter drainage, not from frost action. The planned French drain was never installed. Repairs estimated at $38,500." },
  { c: "P-33", t: "Examination on discovery of Mr. Tremblay", n: "Transcript", d: "2023-03-08", v: 7, pg: 212, x: "Q. The formal notice, you sent it on March 19? A. Yes. Q. The water infiltration, when did you see it? A. From mid-March, in the basement, after the cracks." }
] : [
  { c: "P-1", t: "Contrat d'entreprise", n: "Contrat", d: "2021-02-03", v: 1, pg: 3, x: "Les parties conviennent que l'Entrepreneur livrera l'ouvrage au plus tard le 15 juin 2021. À défaut, une pénalité de retard de 2 500 $ par jour sera exigible (art. 7.4). Le drain français est inclus au devis (art. 7.2). La réception des travaux sera constatée par écrit (art. 9.1)." },
  { c: "P-4", t: "Courriel de M. Tremblay à Mme Gagnon", n: "Courriel (.msg)", d: "2021-03-12", v: 2, pg: 9, x: "Madame Gagnon, nous constatons un retard d'environ trois semaines sur le chantier. Sans plan de rattrapage d'ici vendredi, je vous mettrai en demeure de respecter l'échéancier." },
  { c: "P-7", t: "Mise en demeure", n: "Lettre (.docx)", d: "2021-03-19", v: 2, pg: 14, x: "La présente constitue une mise en demeure formelle de livrer l'ouvrage conformément au contrat. Nous réclamerons la pénalité de retard prévue, soit 29 jours, pour un total de 72 500 $." },
  { c: "D-2", t: "Courriel de Mme Gagnon", n: "Courriel (.eml)", d: "2021-04-02", v: 2, pg: 21, x: "Le retard résulte exclusivement de la pluie exceptionnelle du mois de mars. Nous n'avons constaté aucune infiltration d'eau avant le mois de mai. Aucune pénalité n'est justifiée." },
  { c: "D-9", t: "Photos de chantier (lecture automatique)", n: "Images (OCR)", d: "2021-04-20", v: 4, pg: 2, x: "Photo 14 : tranchée ouverte côté nord, eau stagnante. Photo 15 : membrane posée, aucun drain visible. Note manuscrite : « pluie, arrêt 2 jours »." },
  { c: "P-12", t: "Procès-verbal de chantier", n: "Procès-verbal (.rtf)", d: "2021-05-04", v: 2, pg: 30, x: "Constat d'une infiltration d'eau au sous-sol, présente selon le surintendant depuis la mi-mars. Le drain français n'est pas visible à l'excavation. Photos annexées." },
  { c: "P-21", t: "Texto de Mme Gagnon", n: "Texto", d: "2021-06-02", v: 2, pg: 41, x: "On finit la semaine prochaine, promis. Il reste la finition et le terrassement. La pluie nous a encore retardés." },
  { c: "D-5", t: "Facture finale", n: "Facture (PDF)", d: "2021-06-30", v: 4, pg: 25, x: "Facture finale pour les travaux exécutés : 84 350,00 $ taxes incluses, payable sur réception des travaux." },
  { c: "P-44", t: "Courriel de Me Roy", n: "Courriel (.msg)", d: "2021-07-14", v: 5, pg: 3, x: "Réception provisoire acceptée avec réserves : drainage, fissures de fondation et terrassement incomplet. Signée ce jour par les parties." },
  { c: "P-47", t: "Relevé bancaire", n: "Relevé (tableur)", d: "2021-08-02", v: 5, pg: 9, x: "Paiement final à l'Entrepreneur : 11 850,00 $. Retenue de 72 500,00 $ sur le paiement final, au titre de la pénalité de retard." },
  { c: "P-15", t: "Rapport d'expertise, ing.", n: "Rapport (PDF numérisé)", d: "2022-01-20", v: 3, pg: 1, x: "Les fissures observées à la fondation résultent d'un drainage périphérique absent, et non de l'action du gel. Le drain français prévu n'a pas été installé. Correctifs estimés à 38 500 $." },
  { c: "P-33", t: "Interrogatoire préalable de M. Tremblay", n: "Transcription", d: "2023-03-08", v: 7, pg: 212, x: "Q. La mise en demeure, vous l'avez envoyée le 19 mars ? R. Oui. Q. L'infiltration d'eau, vous l'avez vue quand ? R. Dès la mi-mars, au sous-sol, après les fissures." }
];
const AUDIO = { f: "REC_2023-03-08.wav", t: EN ? "Mr. Tremblay's examination (audio, Whisper)" : "Interrogatoire de M. Tremblay (audio, Whisper)", u: EN ? [
  ["04:11:52", "04:11:58", "Q. I am showing you exhibit P-7. Do you recognize it?"], ["04:11:58", "04:12:08", "A. Yes. It is the formal notice sent to Ms. Gagnon."],
  ["04:12:08", "04:12:11", "Q. On what date did you send it?"], ["04:12:11", "04:12:20", "A. On March 19, 2021, by email."],
  ["04:12:20", "04:12:26", "Objection, service is not in evidence."], ["04:12:26", "04:12:33", "Q. What made you send it at that point?"],
  ["04:12:33", "04:12:44", "A. The water in the basement. We saw it from mid-March."], ["04:12:44", "04:12:47", "Q. So before May?"],
  ["04:12:47", "04:12:55", "A. Well before. The May minutes only confirmed it."], ["04:12:55", "04:13:01", "Q. And the French drain, did you see it installed?"], ["04:13:01", "04:13:04", "A. Never."]
] : [
  ["04:11:52", "04:11:58", "Q. Je vous montre la pièce P-7. Vous la reconnaissez ?"], ["04:11:58", "04:12:08", "R. Oui. C'est la mise en demeure envoyée à Mme Gagnon."],
  ["04:12:08", "04:12:11", "Q. À quelle date l'avez-vous envoyée ?"], ["04:12:11", "04:12:20", "R. Le 19 mars 2021, par courriel."],
  ["04:12:20", "04:12:26", "Objection, la signification n'est pas en preuve."], ["04:12:26", "04:12:33", "Q. Qu'est-ce qui vous a poussé à l'envoyer à ce moment-là ?"],
  ["04:12:33", "04:12:44", "R. L'eau au sous-sol. On l'a vue dès la mi-mars."], ["04:12:44", "04:12:47", "Q. Donc avant le mois de mai ?"],
  ["04:12:47", "04:12:55", "R. Bien avant. Le procès-verbal de mai ne faisait que le confirmer."], ["04:12:55", "04:13:01", "Q. Et le drain français, l'avez-vous vu installé ?"], ["04:13:01", "04:13:04", "R. Jamais."]
] };

// Dossier B : audience. Page 97 du volume 12 (contre-interrogatoire du témoin B) + passages ailleurs
const P97 = EN ? ["Q. Ma'am, you received the complaint on March 3?", "A. Yes, by email, late in the day.", "Q. What did you do next?", "A. I forwarded it to human resources the next day.", "Q. When did the investigation begin?", "A. A few weeks later, I believe.", "Q. Did you read the investigation report, exhibit P-40?", "A. No, I never read it.", "Q. Did the complaints register exist in March?", "A. I don't know.", "Q. Who was responsible for it?", "A. Human resources, I believe."]
  : ["Q. Madame, vous avez reçu la plainte le 3 mars ?", "R. Oui, par courriel, en fin de journée.", "Q. Qu'avez-vous fait ensuite ?", "R. Je l'ai transmise aux ressources humaines le lendemain.", "Q. L'enquête a commencé quand ?", "R. Quelques semaines plus tard, je crois.", "Q. Avez-vous lu le rapport d'enquête, la pièce P-40 ?", "R. Non, je ne l'ai jamais lu.", "Q. Le registre des plaintes existait-il en mars ?", "R. Je ne sais pas.", "Q. Qui en était responsable ?", "R. Les ressources humaines, je crois."];
const PASS_B = (EN ? [
  ["Vol. 12", 47, "witness B · in chief", "I am filing exhibit P-40, the internal investigation report, 14 pages."],
  ["Vol. 12", 52, "witness B · in chief", "Q. Does the report conclude there was harassment? A. It concludes the harassment complaint was partly founded."],
  ["Vol. 12", 118, "witness B · in chief", "Undertaking U-12: produce the harassment complaints register."],
  ["Vol. 12", 131, "witness B · in chief", "I am filing exhibit D-7, the harassment prevention policy."],
  ["Vol. 13", 8, "witness B · cross", "Q. On what date did the investigation begin? A. I no longer remember."],
  ["Vol. 14", 63, "witness B · re-examination", "Undertaking U-17: check the March timesheets."],
  ["Vol. 21", 310, "witness D · in chief", "A. Report P-40? No, I did not read it. Harassment was handled by human resources."]
] : [
  ["Vol. 12", 47, "témoin B · principal", "Je dépose la pièce P-40, le rapport d'enquête interne, 14 pages."],
  ["Vol. 12", 52, "témoin B · principal", "Q. Le rapport conclut-il à du harcèlement ? R. Il conclut que la plainte de harcèlement était fondée en partie."],
  ["Vol. 12", 118, "témoin B · principal", "Engagement E-12 : produire le registre des plaintes de harcèlement."],
  ["Vol. 12", 131, "témoin B · principal", "Je dépose la pièce D-7, la politique de prévention du harcèlement."],
  ["Vol. 13", 8, "témoin B · contre", "Q. À quelle date l'enquête a-t-elle commencé ? R. Je ne m'en souviens plus."],
  ["Vol. 14", 63, "témoin B · réinterrogatoire", "Engagement E-17 : vérifier les feuilles de temps de mars."],
  ["Vol. 21", 310, "témoin D · principal", "R. Le rapport P-40 ? Non, je ne l'ai pas lu. Le harcèlement relevait des ressources humaines."]
]).map(([vol, pg, who, x]) => ({ vol, pg, who, x }));

const COTES_B = ["P-40", "D-7", "P-52", "P-58", "D-14", "P-61"];
const W = [["A", 4, 120, 31, 180, 24, 9], ["B", 6, 150, 22, 160, 19, 12], ["C", 3, 90, 15, 110, 21, 10], ["D", 8, 200, 24, 210, 22, 15], ["E", 5, 80, 16, 95, 18, 11], ["F", 7, 140, 9, 150, 17, 16], ["G", 10, 160, 12, 170, 20, 19]];
const FILES = [
  ["scan_0042.pdf", "pdf", "2021-02-03", 2480], [EN ? "RE_ RE_ delay (2).msg" : "RE_ RE_ retard (2).msg", "msg", "2021-03-12", 86], [EN ? "NOTICE_final_FINAL.docx" : "MED_final_FINAL.docx", "docx", "2021-03-19", 142],
  ["Document (3).pdf", "pdf", "2021-04-02", 310], ["IMG_2231.jpg", "jpg", "2021-04-20", 3920], [EN ? "site minutes may.rtf" : "pv chantier mai.rtf", "rtf", "2021-05-04", 64],
  [EN ? "eng report v4.pdf" : "rapport ing v4.pdf", "pdf", "2022-01-20", 5210], ["REC_2023-03-08.wav", "wav", "2023-03-08", 812000]
];

/* ---------------------------------------------------------
   Commandes (la même liste que dans le logiciel)
   --------------------------------------------------------- */
const G = EN ? ["Find", "Hearing documents", "File index", "The file itself", "Employment law", "The machine"] : ["Trouver", "Documents d'audience", "Index du dossier", "Le dossier lui-même", "Droit du travail", "La machine"];
const CMDS = [
  ["question", 0, 1, 0, "Find a precise piece of information in a file's exhibits", "When was the formal notice sent?", "chercher une information précise dans les pièces d'un dossier", "Quand la mise en demeure a-t-elle été envoyée ?"],
  ["mentions", 0, 0, 0, "Which EXHIBITS discuss a topic (a list of exhibits, not a written answer)", "Where is the French drain discussed?", "quelles PIÈCES parlent d'un sujet (une liste de pièces, pas une réponse rédigée)", "Où parle-t-on du drain français ?"],
  ["cibler", 0, 0, 0, "Search a term IN a single exhibit, or in one witness's testimony", "Search water in Mr. Tremblay's testimony", "chercher un terme DANS une seule pièce, ou dans le témoignage d'un seul témoin", "Cherche eau dans le témoignage de M. Tremblay"],
  ["partout", 0, 0, 0, "Search a term in ALL files at once", "Search harassment in all my files", "chercher un terme dans TOUS les dossiers à la fois", "Cherche harcèlement dans tous mes dossiers"],
  ["chronologie", 0, 0, 0, "The list of dated moments as stated in the exhibits", "The timeline", "la liste des moments datés tels qu'énoncés dans les pièces", "La chronologie"],
  ["resume", 0, 1, 0, "Summarize a passage, an exhibit or a testimony, each point citing its source", "Summarize page 97 of volume 12", "résumer un passage, une pièce ou un témoignage, chaque point renvoyant à sa source", "Résume la page 97 du volume 12"],
  ["cahier", 1, 0, 0, "The cross-examination binder for ONE witness: volumes, phases, non-answers, exhibits and objections", "The cross-examination binder for witness B", "le cahier de contre-interrogatoire d'UN témoin : ses volumes, ses phases, ses non-réponses, les cotes et objections de son témoignage", "Le cahier de contre-interrogatoire du témoin B"],
  ["cote", 1, 0, 0, "The file on one exhibit: what it is and every time it is discussed", "What do we have on P-40", "le dossier d'une pièce cotée (E-1, S-12, U-3…) : ce qu'elle porte et chaque fois qu'on en parle", "Qu'est-ce qu'on a sur P-40"],
  ["engagements", 1, 0, 0, "Which undertakings were followed up, and which never were", "Undertakings never followed up", "quels engagements ont été repris et lesquels jamais", "Les engagements jamais repris"],
  ["cotes_manquantes", 1, 0, 0, "Exhibits discussed at the hearing that no list declares", "Which exhibits are not declared", "les cotes discutées à l'audience sans qu'aucune liste ne les déclare", "Quelles cotes ne sont pas déclarées"],
  ["index_interrogatoires", 2, 0, 0, "Where each examination of each witness begins, with volume and page", "Where does each examination begin", "où commence chaque interrogatoire de chaque témoin, avec le volume et la page", "Où commence chaque interrogatoire"],
  ["index_pieces", 2, 0, 0, "The index of exhibits: what each one is and where it was filed", "The index of exhibits", "l'index des pièces cotées : ce que porte chaque cote et où elle a été déposée", "L'index des pièces cotées"],
  ["index_incidents", 2, 0, 0, "Objections and undertakings, with their page", "Objections and undertakings with their page", "les objections et les engagements, avec leur page", "Les objections et engagements avec leur page"],
  ["temoins", 2, 0, 0, "Witnesses, their “I don't know / I don't remember” answers and their change of attitude in cross-examination", "The list of witnesses", "la liste des témoins avec le nombre de fois où ils ont répondu qu'ils ne savaient pas ou ne s'en souvenaient plus, et leur changement d'attitude au contre-interrogatoire", "La liste des témoins"],
  ["inventaire", 2, 0, 0, "What is in the file: each exhibit, its nature, date and volume", "What is in the file", "dire ce qu'il y a dans le dossier : chaque pièce, sa nature, sa date, son volume", "Qu'est-ce qu'il y a dans le dossier"],
  ["prendre", 3, 0, 1, "Take charge of a file: read, encrypt and index it so questions answer in a second", "Take charge of the file", "prendre un dossier en charge : le lire, le chiffrer et l'indexer, pour que les questions répondent à la seconde", "Prends en charge le dossier"],
  ["convertir", 3, 0, 1, "Make exhibits readable (PDF, .doc, .msg…)", "Convert the unreadable exhibits", "rendre les pièces lisibles (PDF, .doc, .msg…)", "Convertis les pièces illisibles"],
  ["classer", 3, 0, 1, "Put exhibits in order and rename them (date, name, type or size)", "Sort the exhibits by date", "mettre les pièces en ordre et les renommer (date, nom, type ou taille)", "Classe les pièces par date"],
  ["defaire_classement", 3, 0, 1, "Restore the exhibit names from before the last sort", "Undo the sort", "remettre les noms de pièces d'avant le dernier classement", "Défais le classement"],
  ["estimer", 3, 0, 0, "What READING this file involves (transcription and OCR), before launching it", "How long will reading take", "combien de temps la LECTURE de ce dossier prendrait (transcription et OCR), avant de la lancer", "Combien de temps la lecture va prendre"],
  ["lister", 3, 0, 0, "List the files in the database", "My files", "lister les dossiers en base", "Mes dossiers"],
  ["delais", 4, 0, 0, "Compute a recourse deadline from a date (45 days, s. 123 ALS, etc.)", "Deadline for a prohibited-practice complaint of January 15, 2024", "calculer l'échéance d'un recours à partir d'une date (45 jours art. 123 LNT, etc.)", "Échéance d'une plainte pour pratique interdite du 15 janvier 2024"],
  ["etat", 5, 0, 0, "The state of the models and files", "How is the machine doing", "l'état des modèles et des dossiers", "Où en est la machine"],
  ["etat_analyses", 5, 0, 0, "Where the launched analyses stand, and show the finished ones", "Where are my analyses", "dire où en sont les analyses lancées et montrer celles qui sont terminées", "Où en sont mes analyses"],
  ["arreter_analyse", 5, 0, 0, "STOP a running analysis", "Stop the analysis", "ARRÊTER une analyse en cours", "Arrête l'analyse"],
  ["relancer_analyse", 5, 0, 0, "RESTART a stopped or stuck analysis, restarting the model server if it no longer responds", "Restart the analysis", "RELANCER une analyse arrêtée ou bloquée, en redémarrant le serveur de modèle s'il ne répond plus", "Relance l'analyse"]
].map(([id, g, model, fs, dEn, exEn, dFr, exFr]) => ({ id, g, model, fs, d: EN ? dEn : dFr, ex: EN ? exEn : exFr }));
const CMD = Object.fromEntries(CMDS.map(c => [c.id, c]));

/* ---------------------------------------------------------
   Reconnaissance de la demande (phrase → commande)
   --------------------------------------------------------- */
const RULES = EN ? [
  ["defaire_classement", /\bundo\b|restore the (original )?names/], ["classer", /\bsort\b|\brenam|put .* in order/], ["convertir", /convert|unreadable/],
  ["prendre", /take charge|ingest|load the file/], ["estimer", /how long|estimat/], ["lister", /my files|list (the )?files/],
  ["delais", /deadline|time limit|45 days|\bals\b|prohibited practice/], ["arreter_analyse", /\bstop\b/], ["relancer_analyse", /restart|relaunch|resume the analysis/],
  ["etat_analyses", /my analys|where are (my )?analys|analyses status/], ["etat", /machine|status|state of/], ["partout", /all (my |the )?files|everywhere/],
  ["cibler", /(search|find|look for) .+ in (the )?(testimony|exhibit|[pdeu]-\d)|in .*'s testimony/], ["cahier", /binder/], ["cotes_manquantes", /not declared|undeclared|missing exhibits|never declared/],
  ["index_incidents", /objection/], ["engagements", /undertaking/], ["index_interrogatoires", /where (does )?each examination|examinations? begin/],
  ["index_pieces", /index of exhibits|exhibit index/], ["resume", /summar/], ["chronologie", /timeline|chronolog/], ["inventaire", /inventory|what is in the file|what's in the file/],
  ["temoins", /witnesses|attitude|non-answer/], ["cote", /\b(on|about|file on) [pdeosu]-\d+|^[pdeosu]-\d+\??$/], ["mentions", /where is .* (discussed|mentioned)|mentions?|which exhibits/]
] : [
  ["defaire_classement", /defai|defaire|annule le classement/], ["classer", /\bclass|renomm|mets? .* en ordre/], ["convertir", /convert|illisible/],
  ["prendre", /prends? en charge|prendre en charge/], ["estimer", /combien de temps|estim/], ["lister", /mes dossiers|liste des dossiers|lister/],
  ["delais", /echeance|delai|45 jours|\blnt\b|pratique interdite/], ["arreter_analyse", /\barrete|stoppe/], ["relancer_analyse", /relance|redemarre/],
  ["etat_analyses", /mes analyses|ou en sont/], ["etat", /machine|\betat\b/], ["partout", /tous (mes |les )?dossiers|partout/],
  ["cibler", /(cherche|trouve) .+ dans (le temoignage|la piece|[pdeu]-\d)/], ["cahier", /cahier/], ["cotes_manquantes", /pas declar|non declar|jamais declar|cotes manquantes/],
  ["index_incidents", /objection/], ["engagements", /engagement/], ["index_interrogatoires", /ou commence|debut de chaque interrogatoire/],
  ["index_pieces", /index des pieces|pieces cotees/], ["resume", /resum/], ["chronologie", /chronolog/], ["inventaire", /inventaire|qu'est-ce qu'il y a|contenu du dossier/],
  ["temoins", /temoins|attitude|non-reponse/], ["cote", /\bsur (la cote |la piece )?[pdeosu]-\d+|^[pdeosu]-\d+\s*\??$/], ["mentions", /ou parle-t-on|mentions?|quelles pieces/]
];
const route = q => { const n = norm(q); for (const [id, re] of RULES) if (re.test(n)) return id; return "question"; };

/* ---------------------------------------------------------
   Index de recherche (accents repliés, pluriels tolérés)
   --------------------------------------------------------- */
const STOP = new Set((EN ? "the a an of and in on at to for by with from is was were be it its this that what when where who which how did does do you your my me our we they he she his her their has have had not no any all there about into than then" : "les des une un la le de du et en au aux a qui que quoi quand est sur par pour dans avec son ses ce cette ont ete d l qu il elle nous vous ou dit on t y se ne pas plus tout tous mes mon ma").split(" "));
const terms = q => norm(q).split(/[^a-z0-9$]+/).filter(t => t.length > 2 && !STOP.has(t)).map(t => t.replace(/(s|x)$/, ""));
const termRe = t => new RegExp("\\b" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:e?s|x|e|ee|ees)?\\b", "g");
const phraseRe = ts => new RegExp("\\b" + ts.map(t => t + "(?:e?s|x)?").join("(?:[\\s']+[a-z]{1,3})?[\\s']+") + "\\b", "g");
const spans = (n, re) => { const out = []; let m; re.lastIndex = 0; while ((m = re.exec(n))) { out.push([m.index, m.index + m[0].length]); if (!m[0].length) re.lastIndex++; } return out; };
function hl(text, hits) {
  const mk = new Array(text.length).fill(false); hits.forEach(([a, b]) => { for (let k = a; k < b; k++) mk[k] = true; });
  let o = "", open = false;
  for (let i = 0; i < text.length; i++) { if (mk[i] && !open) { o += "<mark>"; open = true; } if (!mk[i] && open) { o += "</mark>"; open = false; } o += esc(text[i]); }
  return o + (open ? "</mark>" : "");
}
// Corpus : chaque entrée sait se citer et s'ouvrir à la bonne page
const loc = (v, p) => EN ? `Vol. ${v} · p. ${p}` : `Vol. ${v} · p. ${p}`;
const CORPUS = {
  A: [
    ...DOCS_A.map(d => ({ c: d.c, t: d.t, x: d.x, where: loc(d.v, d.pg), open: { k: "doc", c: d.c } })),
    ...AUDIO.u.map((s, i) => ({ c: "REC", t: AUDIO.t, x: s[2], where: `${AUDIO.f} · ${s[0]} → ${s[1]}`, open: { k: "audio", i } }))
  ],
  B: [
    ...P97.map((x, i) => ({ c: "Vol. 12", t: EN ? "Cross-examination, witness B" : "Contre-interrogatoire, témoin B", x, where: `p. 97, ${EN ? "l." : "l."} ${i + 1}`, open: { k: "p97", l: [i + 1, i + 1] } })),
    ...PASS_B.map((p, i) => ({ c: p.vol, t: p.who, x: p.x, where: `p. ${p.pg}`, open: { k: "pass", i } }))
  ]
};
function search(q, dos, opts = {}) {
  const ts = terms(q); if (!ts.length) return { ts, res: [] };
  const pool = opts.pool || CORPUS[dos];
  const pr = ts.length > 1 ? phraseRe(ts) : null;
  let res = pool.map(e => {
    const n = norm(e.x);
    const ph = pr ? spans(n, pr) : [];
    const per = ts.map(t => spans(n, termRe(t)));
    const cover = per.filter(x => x.length).length;
    return { e, ph: ph.length, cover, hits: ph.length ? ph : per.flat(), s: ph.length * 10 + cover * 3 + per.reduce((a, x) => a + x.length, 0) };
  });
  if (opts.phrase) res = res.filter(r => ts.length === 1 ? r.cover : r.ph);
  else { const need = ts.length <= 2 ? ts.length : Math.ceil(ts.length * .6); const best = Math.max(0, ...res.map(r => r.cover)); res = res.filter(r => r.cover >= Math.min(need, best) && r.cover > 0); }
  return { ts, res: res.sort((a, b) => b.s - a.s) };
}

/* ---------------------------------------------------------
   État de la fenêtre
   --------------------------------------------------------- */
const S = { dos: "A", model: "off", an: { st: "done", pct: 100 }, convs: [], sorted: null, busy: false };
let anTimer = 0;

/* ---------- gabarit ---------- */
root.innerHTML = `
<aside class="ap-side" aria-label="${EN ? "Sidebar" : "Barre latérale"}">
  <div class="ap-logo">Projecteur<i></i></div>
  <div class="ap-sub mono">${T.sub}</div>
  <div class="ap-lm"><img src="logo/symbole-simple.svg?v=bal1" alt="" width="20" height="20">Lavoie<b>&amp;</b>Maher<small>INC.</small></div>
  <button class="ap-new" type="button" data-act="new">${T.newConv}</button>
  <div class="ap-lbl">${T.convs}</div>
  <ul class="ap-convs"></ul>
  <div class="ap-an">
    <div class="ap-lbl">${T.analyses}</div>
    <div class="nm"><span>✓</span><span>${T.anName}</span></div>
    <div class="ap-bar"><i></i></div>
    <div class="st"></div>
    <button class="go" type="button" data-act="an">${T.anGo}</button>
  </div>
  <div class="ap-model">
    <div class="row"><span class="ap-dot"></span><span class="mt">${T.modelOff}</span></div>
    <select aria-label="${T.modelPick}"><option value="">${T.modelPick}</option><option value="llm">${EN ? "Local language model" : "Modèle de langue local"}</option><option value="ocr">Qwen3-VL · OCR</option><option value="asr">Whisper · audio</option></select>
    <button class="ap-paper" type="button" data-act="paper">◐ ${T.paper}</button>
  </div>
</aside>
<div class="ap-main">
  <div class="ap-top">
    <button class="ap-burger" type="button" data-act="side" aria-label="${EN ? "Show the sidebar" : "Afficher la barre latérale"}"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 4h12M2 8h12M2 12h12"/></svg></button>
    <button class="ap-dos" type="button" data-act="dos" aria-haspopup="true"><span class="mono">${T.dossier.toUpperCase()}</span><strong></strong><span class="car">▾</span></button>
    <span class="ap-sp"></span>
    <button class="ap-cmdk" type="button" data-act="pal"><span>${T.cmds}</span><kbd>⌘K</kbd></button>
    <div class="ap-off"><i></i><span>${T.offline}</span></div>
  </div>
  <div class="ap-body" tabindex="-1"></div>
  <div class="ap-comp">
    <form class="ap-form" autocomplete="off">
      <button class="ap-clip" type="button" data-act="clip" aria-label="${EN ? "Attach a file" : "Joindre un fichier"}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 11.5l-8.6 8.6a5 5 0 01-7.1-7.1l8.6-8.6a3.3 3.3 0 014.7 4.7l-8.6 8.6a1.7 1.7 0 01-2.4-2.4l7.9-7.9"/></svg></button>
      <input class="ap-in" type="text" maxlength="200" placeholder="${T.place}" aria-label="${T.place}">
      <button class="ap-send" type="submit">${T.send}</button>
    </form>
    <div class="ap-hint">${T.hint}</div>
  </div>
</div>`;
const body = $(".ap-body"), input = $(".ap-in"), convList = $(".ap-convs");

/* ---------- accueil ---------- */
function welcome() {
  body.innerHTML = `<div class="ap-welcome"><div class="ap-eb">${T.eyebrow}</div><h3 class="ap-h">${T.h}</h3><p class="ap-p">${T.p}</p>
  <div class="ap-cards">${T.cards.map(([b, s, q], i) => `<button class="ap-card" type="button" data-q="${esc(q)}"><b>${b}</b><span>${s}</span></button>`).join("")}</div>
  <p class="ap-try">${T.tryIt} <button type="button" data-act="pal">${T.cmds} ⌘K</button>.</p></div>`;
  body.scrollTop = 0;
}
let thread = null;
const ensureThread = () => { if (!thread || !body.contains(thread)) { body.innerHTML = ""; thread = document.createElement("div"); thread.className = "ap-thread"; body.append(thread); } return thread; };
const toBottom = () => { body.scrollTop = body.scrollHeight; };

/* ---------- barre latérale ---------- */
function setDos(d, silent) {
  S.dos = d; $(".ap-dos strong").textContent = DOSSIERS[d].name;
  if (!silent) closeMenu();
}
function renderAn() {
  const a = $(".ap-an"), st = S.an.st;
  a.classList.toggle("run", st === "run"); a.classList.toggle("stop", st === "stop");
  $(".nm span", a).textContent = st === "done" ? "✓" : st === "run" ? "●" : "■";
  $(".ap-bar i", a).style.width = S.an.pct + "%";
  $(".st", a).textContent = st === "done" ? T.anDone : st === "run" ? `${T.anRun} · ${Math.round(S.an.pct)} %` : `${T.anStop} · ${Math.round(S.an.pct)} %`;
  $(".go", a).hidden = st !== "done";
}
function setModel(m, label) {
  S.model = m; const dot = $(".ap-dot");
  dot.className = "ap-dot" + (m === "warm" ? " warm" : m === "on" ? " on" : "");
  $(".mt").textContent = label || (m === "off" ? T.modelOff : m === "warm" ? T.modelWarm : T.modelOn);
}
function addConv(q) {
  S.convs.unshift(q); if (S.convs.length > 12) S.convs.pop();
  convList.innerHTML = S.convs.map(c => `<li><button type="button" data-q="${esc(c)}" title="${esc(c)}">${esc(c)}</button></li>`).join("");
}
convList.innerHTML = `<li class="none">${T.noConv}</li>`;

/* ---------------------------------------------------------
   Exécution d'une demande
   --------------------------------------------------------- */
async function ask(q, forced) {
  q = q.trim(); if (!q) return;
  if (S.busy) { S.next = [q, forced]; return; } // une demande à la fois : la dernière attend son tour
  S.busy = true; root.classList.remove("side");
  const id = forced || route(q);
  const cmd = CMD[id];
  addConv(q);
  const th = ensureThread();
  const u = document.createElement("div"); u.className = "ap-u"; u.textContent = q; th.append(u);
  const r = document.createElement("div"); r.className = "ap-r";
  r.innerHTML = `<div class="ap-rh"><span class="ap-cmd">${cmd.id}</span><span class="ap-tag">${cmd.model ? T.model : T.noModel}</span>${cmd.fs ? `<span class="ap-tag fs">${T.touches}</span>` : ""}<span class="ap-meta"></span></div><div class="ap-rb"></div>`;
  th.append(r); toBottom();
  const rb = $(".ap-rb", r), meta = $(".ap-meta", r);
  let need = { cahier: "B", cote: null, engagements: "B", cotes_manquantes: "B", index_interrogatoires: "B", index_pieces: "B", index_incidents: "B", temoins: "B", resume: "B", convertir: "A", classer: "A", defaire_classement: "A", prendre: null }[id];
  if (id === "cote") { const m = norm(q).match(/\b([pdeosu])-(\d+)\b/); const c = m ? `${m[1].toUpperCase()}-${m[2]}` : "P-40"; const inA = DOCS_A.some(d => d.c === c), inB = COTES_B.includes(c); if (inA && !inB) need = "A"; else if (inB && !inA) need = "B"; }
  if (need && need !== S.dos) { setDos(need, true); meta.insertAdjacentHTML("beforebegin", `<span class="ap-tag">${esc(T.switched(DOSSIERS[need].name))}</span>`); }
  if (cmd.model && S.model !== "on") {
    setModel("warm"); rb.innerHTML = `<ul class="ap-steps"><li>${T.modelWarm}</li></ul>`; await wait(900); setModel("on");
  }
  try { await (RUN[id] || RUN.question)(q, rb, meta); }
  catch (e) { rb.innerHTML = `<p class="ap-sum">${EN ? "The demo could not process this request." : "La démo n'a pas pu traiter cette demande."}</p>`; }
  S.busy = false; toBottom();
  if (S.next) { const [nq, nf] = S.next; S.next = null; ask(nq, nf); }
}

// Étapes animées (« Lecture de l'index… » ✓)
async function steps(rb, list, dt = 380) {
  rb.innerHTML = `<ul class="ap-steps"></ul>`; const ul = $("ul", rb);
  for (const s of list) { const li = document.createElement("li"); li.textContent = s; ul.append(li); toBottom(); await wait(dt); li.classList.add("ok"); }
  await wait(160);
}
const timeIt = fn => { const t0 = performance.now(); const out = fn(); return [out, Math.max(.1, performance.now() - t0)]; };
const msTxt = ms => (EN ? `inverted index · ${ms.toFixed(1)} ms` : `index inversé · ${ms.toFixed(1).replace(".", ",")} ms`);
const hitHTML = (r, i) => `<div class="ap-hit" style="animation-delay:${i * .08}s"><span class="ap-c">${esc(r.e.c)}</span><span class="t">${esc(r.e.t)}</span><span class="loc">${esc(r.e.where)}</span><p>${hl(r.e.x, r.hits)}</p><button class="ap-open" type="button" data-open="${esc(JSON.stringify(r.e.open))}" data-hl="${esc(r.q || "")}">${r.e.open.k === "audio" ? (EN ? "Play the segment ↗" : "Écouter le segment ↗") : (EN ? "Open at this page ↗" : "Ouvrir à cette page ↗")}</button></div>`;
const table = (heads, rows) => `<div class="ap-tw"><table class="ap-tbl"><thead><tr>${heads.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r, i) => `<tr style="animation-delay:${i * .07}s">${r.map((c, k) => `<td data-l="${esc(heads[k].replace(/<[^>]+>/g, ""))}"><div>${c}</div></td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
const chips = list => `<div class="ap-chips">${list.map(q => `<button class="ap-chip" type="button" data-q="${esc(q)}">${esc(q)}</button>`).join("")}</div>`;
const subject = (q, res) => { let s = q; for (const re of res) s = s.replace(re, ""); return s.replace(/[?¿.!]+\s*$/, "").trim(); };
const dosCount = d => d === "A" ? DOSSIERS.A.meta : DOSSIERS.B.meta;

const RUN = {
  async question(q, rb, meta) {
    await steps(rb, EN ? ["Reading the index…", "Checking each passage against its exhibit…"] : ["Lecture de l'index…", "Vérification de chaque passage dans sa pièce…"], 420);
    let [{ res }, ms] = timeIt(() => search(q, S.dos));
    let note = "";
    if (!res.length) { const other = S.dos === "A" ? "B" : "A"; const o = search(q, other).res; if (o.length) { setDos(other, true); res = o; note = `<p class="ap-note">${EN ? "Nothing in the open file; found in" : "Rien dans le dossier ouvert ; trouvé dans"} « ${DOSSIERS[other].name} ».</p>`; } }
    meta.textContent = msTxt(ms);
    if (!res.length) { rb.innerHTML = `<p class="ap-sum">${EN ? "No exhibit in the file answers this question." : "Aucune pièce du dossier ne répond à cette question."} <strong>${EN ? "No source, no answer." : "Sans source, pas de réponse."}</strong></p>${chips(EN ? ["When was the formal notice sent?", "Did Ms. Gagnon see water before May?"] : ["Quand la mise en demeure a-t-elle été envoyée ?", "Mme Gagnon a-t-elle vu de l'eau avant mai ?"])}`; return; }
    res.forEach(r => r.q = q);
    const top = res.slice(0, 4);
    rb.innerHTML = `<p class="ap-sum"><strong>${top.length}</strong> ${EN ? (top.length > 1 ? "passages answer the question, each with its exhibit, volume and page." : "passage answers the question, with its exhibit, volume and page.") : (top.length > 1 ? "passages répondent à la question, chacun avec sa pièce, son volume et sa page." : "passage répond à la question, avec sa pièce, son volume et sa page.")}</p><div class="ap-hits">${top.map(hitHTML).join("")}</div>${note}<p class="ap-foot">${EN ? "Answer drawn only from the file. Links open the exact page on screen." : "Réponse tirée du dossier seulement. Les liens ouvrent la page exacte à l'écran."}</p>`;
  },
  async mentions(q, rb, meta) {
    const s = subject(q, EN ? [/^(where is|where are)\s+(the\s+)?/i, /\s+(discussed|mentioned)\s*\??$/i, /^mentions? of\s*/i, /^which exhibits (talk|speak) about\s*/i] : [/^o[uù] parle-t-on\s+(du|de la|de l'|des|de|d')\s*/i, /^mentions?\s+(du|de la|de l'|des|de|d')\s*/i, /^quelles pi[eè]ces parlent\s+(du|de la|de l'|des|de|d')\s*/i]);
    await steps(rb, [EN ? `Counting “${s}” in every exhibit…` : `Compte de « ${s} » dans chaque pièce…`], 360);
    const [{ res }, ms] = timeIt(() => search(s, S.dos, { phrase: true }));
    meta.textContent = msTxt(ms);
    const by = new Map(); res.forEach(r => { const k = r.e.c; const o = by.get(k) || { c: k, t: r.e.t, n: 0, where: r.e.where }; o.n += r.hits.length; by.set(k, o); });
    const rows = [...by.values()].sort((a, b) => b.n - a.n);
    if (!rows.length) { rb.innerHTML = `<p class="ap-sum">${EN ? `No exhibit mentions “${esc(s)}”.` : `Aucune pièce ne mentionne « ${esc(s)} ».`}</p>`; return; }
    const tot = rows.reduce((a, r) => a + r.n, 0);
    rb.innerHTML = `<p class="ap-sum"><strong>${rows.length}</strong> ${EN ? "exhibits" : "pièces"} · <strong>${tot}</strong> mentions</p>` + table(EN ? ["Exhibit", "Title", "Mentions"] : ["Pièce", "Titre", "Mentions"], rows.map(r => [`<span class="ap-c">${esc(r.c)}</span>`, esc(r.t), `<span class="num">${r.n}</span>`])) + `<p class="ap-foot">${EN ? "A list of exhibits, not a written answer. Accents folded, plurals included." : "Une liste de pièces, pas une réponse rédigée. Accents repliés, pluriels compris."}</p>`;
  },
  async cibler(q, rb, meta) {
    const m = EN ? q.match(/(?:search|find|look for)\s+(.+?)\s+in\s+(.+)$/i) : q.match(/(?:cherche|trouve)\s+(.+?)\s+dans\s+(.+)$/i);
    const term = m ? m[1].replace(/^["«“]\s*|\s*["»”]$/g, "") : q, target = norm(m ? m[2] : "");
    let pool, label;
    const cm = target.match(/\b([pd])-(\d+)\b/);
    if (cm) { const c = `${cm[1].toUpperCase()}-${cm[2]}`; pool = CORPUS.A.filter(e => e.c === c); if (!pool.length) pool = CORPUS.B.filter(e => norm(e.x).includes(norm(c))); label = c; }
    else if (/gagnon/.test(target)) { setDos("A", true); pool = CORPUS.A.filter(e => ["D-2", "P-21"].includes(e.c)); label = "Mme Gagnon"; }
    else if (/tremblay/.test(target)) { setDos("A", true); pool = CORPUS.A.filter(e => e.c === "P-33" || e.c === "REC"); label = EN ? "Mr. Tremblay" : "M. Tremblay"; }
    else { setDos("B", true); pool = CORPUS.B.filter(e => /\b(b|B)\b/.test(e.t) || e.c === "Vol. 12"); label = EN ? "witness B" : "témoin B"; }
    await steps(rb, [EN ? `Searching “${term}” only in: ${label}…` : `Recherche de « ${term} » seulement dans : ${label}…`], 360);
    const [{ res }, ms] = timeIt(() => search(term, S.dos, { pool, phrase: true }));
    meta.textContent = msTxt(ms);
    if (!res.length) { rb.innerHTML = `<p class="ap-sum">${EN ? `“${esc(term)}” does not appear in ${esc(label)}.` : `« ${esc(term)} » n'apparaît pas dans ${esc(label)}.`}</p>`; return; }
    res.forEach(r => r.q = term);
    rb.innerHTML = `<p class="ap-sum"><strong>${res.length}</strong> ${res.length > 1 ? (EN ? "passages in" : "passages dans") : (EN ? "passage in" : "passage dans")} ${esc(label)}</p><div class="ap-hits">${res.slice(0, 6).map(hitHTML).join("")}</div>`;
  },
  async partout(q, rb, meta) {
    const s = subject(q, EN ? [/^(search|find|look for)\s+/i, /\s+(in all( my| the)? files|everywhere)\s*\??$/i] : [/^(cherche|trouve)\s+/i, /\s+(dans tous (mes |les )?dossiers|partout)\s*\??$/i]);
    await steps(rb, [EN ? `Searching “${s}” in every file…` : `Recherche de « ${s} » dans tous les dossiers…`], 380);
    const [out, ms] = timeIt(() => ["A", "B"].map(d => ({ d, r: search(s, d, { phrase: true }).res })));
    meta.textContent = msTxt(ms);
    const rows = out.map(o => [esc(DOSSIERS[o.d].name), `<span class="num">${o.r.length}</span>`, o.r.length ? o.r.slice(0, 2).map(r => `<span class="ap-c">${esc(r.e.c)}</span> <small>${esc(r.e.where)}</small>`).join(" ") : "—"]);
    rb.innerHTML = `<p class="ap-sum">${EN ? `“${esc(s)}” · all files` : `« ${esc(s)} » · tous les dossiers`}</p>` + table(EN ? ["File", "Passages", "First results"] : ["Dossier", "Passages", "Premiers résultats"], rows);
  },
  async chronologie(q, rb, meta) {
    await steps(rb, [EN ? "Collecting dated moments as stated in the exhibits…" : "Relevé des moments datés tels qu'énoncés dans les pièces…"], 380);
    if (S.dos === "B") {
      rb.innerHTML = table(EN ? ["Date as stated", "Event", "Source"] : ["Date énoncée", "Événement", "Source"], (EN ? [["March 3", "Complaint received by email", "Vol. 12, p. 97, l. 1–2"], ["the next day", "Complaint forwarded to human resources", "Vol. 12, p. 97, l. 4"], ["“a few weeks later”", "Start of the investigation (not dated)", "Vol. 12, p. 97, l. 6"]] : [["3 mars", "Plainte reçue par courriel", "Vol. 12, p. 97, l. 1–2"], ["le lendemain", "Plainte transmise aux ressources humaines", "Vol. 12, p. 97, l. 4"], ["« quelques semaines plus tard »", "Début de l'enquête (non daté)", "Vol. 12, p. 97, l. 6"]]).map(r => [`<span class="num">${esc(r[0])}</span>`, esc(r[1]), `<small>${r[2]}</small>`])) + `<p class="ap-foot">${EN ? "Dates are shown as stated: nothing is guessed." : "Les dates sont reprises telles qu'énoncées : rien n'est deviné."}</p>`; return;
    }
    const ev = [...DOCS_A].sort((a, b) => a.d.localeCompare(b.d));
    rb.innerHTML = table(["Date", EN ? "Exhibit" : "Pièce", EN ? "What it says" : "Ce qu'elle dit", EN ? "Where" : "Où"], ev.map(d => [`<span class="num">${d.d}</span>`, `<span class="ap-c">${d.c}</span>`, esc(d.t), `<small>${loc(d.v, d.pg)}</small>`])) + `<p class="ap-foot">${EN ? "Built without a model: dates are read as written in each exhibit." : "Construite sans modèle : les dates sont lues telles qu'écrites dans chaque pièce."}</p>`;
  },
  async resume(q, rb, meta) {
    await steps(rb, EN ? ["Reading Vol. 12, p. 97 (12 lines)…", "Linking each point to its lines…"] : ["Lecture du Vol. 12, p. 97 (12 lignes)…", "Rattachement de chaque point à ses lignes…"], 450);
    const PTS = EN ? [["The witness received the complaint on March 3 and forwarded it to human resources the next day.", [1, 4]], ["She says she never read the investigation report (P-40).", [7, 8]], ["She does not know whether the complaints register existed in March; she believes human resources was responsible for it.", [9, 12]]]
      : [["La témoin a reçu la plainte le 3 mars et l'a transmise aux ressources humaines le lendemain.", [1, 4]], ["Elle dit n'avoir jamais lu le rapport d'enquête (P-40).", [7, 8]], ["Elle ignore si le registre des plaintes existait en mars; selon elle, les ressources humaines en étaient responsables.", [9, 12]]];
    const para = EN ? "In cross-examination, the witness confirms she received the complaint on March 3 and forwarded it to human resources the next day (l. 1–4). She states she never read investigation report P-40 (l. 7–8) and does not know whether the complaints register existed at that date, attributing it to human resources (l. 9–12)."
      : "Au contre-interrogatoire, la témoin confirme avoir reçu la plainte le 3 mars et l'avoir transmise aux ressources humaines le lendemain (l. 1–4). Elle affirme n'avoir jamais lu le rapport d'enquête P-40 (l. 7–8) et ignore si le registre des plaintes existait à cette date, qu'elle attribue aux ressources humaines (l. 9–12).";
    const pts = `<ol class="ap-pts">${PTS.map(([t, l], i) => `<li style="animation:apIn .35s ${i * .25}s ease both">${esc(t)}<button class="mono ap-open" type="button" data-open="${esc(JSON.stringify({ k: "p97", l }))}">Vol. 12, p. 97, l. ${l[0]}–${l[1]} ↗</button></li>`).join("")}</ol>`;
    rb.innerHTML = `<div class="ap-chips" role="group"><button class="ap-chip on" type="button" data-sum="pts">${EN ? "Key points" : "Points clés"}</button><button class="ap-chip" type="button" data-sum="para">${EN ? "Paragraph" : "Paragraphe"}</button></div><div class="ap-sumb" style="margin-top:12px">${pts}</div><p class="ap-foot">${EN ? "12 lines → 3 points · every point cites its source" : "12 lignes → 3 points · chaque point renvoie à sa source"}</p>`;
    rb.addEventListener("click", e => { const b = e.target.closest("[data-sum]"); if (!b) return; $$("[data-sum]", rb).forEach(x => x.classList.toggle("on", x === b)); $(".ap-sumb", rb).innerHTML = b.dataset.sum === "pts" ? pts : `<p style="margin:0">${esc(para)}</p>`; });
  },
  async cahier(q, rb, meta) {
    const w = (norm(q).match(/temoin ([a-g])\b|witness ([a-g])\b/) || []).slice(1).find(Boolean);
    await steps(rb, EN ? ["Finding the witness's volumes from the printed page headers…", "Counting non-answers by phase…", "Gathering exhibits and objections…"] : ["Repérage des volumes du témoin par les en-têtes imprimés…", "Compte des non-réponses par phase…", "Réunion des cotes et objections…"], 360);
    const who = (w || "b").toUpperCase();
    rb.innerHTML = (who !== "B" ? `<p class="ap-note">${EN ? `In this demo only witness B's binder is detailed.` : `Dans cette démo, seul le cahier du témoin B est détaillé.`}</p>` : "") + table(EN ? ["Section", "Witness B", "Where"] : ["Rubrique", "Témoin B", "Où"], (EN ? [
      ["Volumes", "3 transcript volumes", "Vol. 12 to 14"], ["Phases", "In chief, cross-examination, re-examination", "Vol. 12, p. 3 · p. 89 · p. 202"], ["Non-answers", "6 in chief, 19 in cross", "Page-by-page detail"],
      ["Exhibits", '<span class="ap-c">P-40</span> <span class="ap-c">D-7</span> <span class="ap-c">P-52</span>', "Vol. 12, p. 47 · p. 131 · Vol. 13, p. 22"], ["Objections", "4 objections", "Vol. 12, p. 97 · p. 160 · Vol. 13, p. 58 · p. 141"]]
      : [["Volumes", "3 volumes de transcription", "Vol. 12 à 14"], ["Phases", "Principal, contre-interrogatoire, réinterrogatoire", "Vol. 12, p. 3 · p. 89 · p. 202"], ["Non-réponses", "6 au principal, 19 au contre", "Détail page par page"],
      ["Cotes", '<span class="ap-c">P-40</span> <span class="ap-c">D-7</span> <span class="ap-c">P-52</span>', "Vol. 12, p. 47 · p. 131 · Vol. 13, p. 22"], ["Objections", "4 objections", "Vol. 12, p. 97 · p. 160 · Vol. 13, p. 58 · p. 141"]]).map(r => [`<strong>${r[0]}</strong>`, r[1], `<small>${r[2]}</small>`]))
      + `<p class="ap-foot">${EN ? "Deliverable without clickable links." : "Livrable sans lien cliquable."}</p>` + chips(EN ? ["Summarize page 97 of volume 12", "What do we have on P-40"] : ["Résume la page 97 du volume 12", "Qu'est-ce qu'on a sur P-40"]);
  },
  async cote(q, rb, meta) {
    const m = norm(q).match(/\b([pdeosu])-(\d+)\b/); const c = m ? `${m[1].toUpperCase()}-${m[2]}` : "P-40";
    await steps(rb, [EN ? `Gathering what ${c} is and every time it is discussed…` : `Réunion de ce que porte ${c} et de chaque fois qu'on en parle…`], 380);
    if (S.dos === "B" && c !== "P-40") {
      const pass = CORPUS.B.filter(e => norm(e.x).includes(norm(c)));
      rb.innerHTML = pass.length ? `<div class="ap-hits">${pass.map((e, i) => hitHTML({ e, hits: spans(norm(e.x), termRe(norm(c))), q: c }, i)).join("")}</div>` : `<p class="ap-sum">${EN ? `${c} is discussed in volumes not included in this demo.` : `${c} est discutée dans des volumes absents de cette démo.`}</p>` + chips([CMD.cotes_manquantes.ex]);
      return;
    }
    if (S.dos === "B" && c === "P-40") {
      rb.innerHTML = table(EN ? ["Where", "P-40 · Internal investigation report", "Context"] : ["Où", "P-40 · Rapport d'enquête interne", "Contexte"], (EN ? [["Vol. 12, p. 47", "Exhibit filed, 14 pages", "Examination-in-chief, witness B"], ["Vol. 12, p. 52", "Questions on the report's conclusions", "Examination-in-chief, witness B"], ["Vol. 13, p. 8", "Back to the date of the investigation", "Cross-examination, witness B"], ["Vol. 21, p. 310", "Witness says they never read the report", "Examination-in-chief, witness D"]]
        : [["Vol. 12, p. 47", "Dépôt de la pièce, 14 pages", "Interrogatoire principal, témoin B"], ["Vol. 12, p. 52", "Questions sur les conclusions du rapport", "Interrogatoire principal, témoin B"], ["Vol. 13, p. 8", "Retour sur la date de l'enquête", "Contre-interrogatoire, témoin B"], ["Vol. 21, p. 310", "Le témoin dit ne pas avoir lu le rapport", "Interrogatoire principal, témoin D"]]).map(r => [`<span class="num">${r[0]}</span>`, r[1], `<small>${r[2]}</small>`]));
      return;
    }
    const d = DOCS_A.find(x => x.c === c);
    if (!d) { rb.innerHTML = `<p class="ap-sum">${EN ? `No exhibit ${c} in the open file.` : `Aucune pièce ${c} dans le dossier ouvert.`}</p>` + chips(EN ? ["What do we have on P-7", "The index of exhibits"] : ["Qu'est-ce qu'on a sur P-7", "L'index des pièces cotées"]); return; }
    setDos("A", true);
    const cited = CORPUS.A.filter(e => e.c !== c && norm(e.x).includes(norm(c)));
    rb.innerHTML = `<div class="ap-hits">${hitHTML({ e: CORPUS.A.find(e => e.c === c), hits: [] }, 0)}</div>` + (cited.length ? `<p class="ap-sum" style="margin-top:12px">${EN ? "Discussed elsewhere:" : "On en parle ailleurs :"}</p><div class="ap-hits">${cited.map((e, i) => hitHTML({ e, hits: spans(norm(e.x), termRe(norm(c))), q: c }, i + 1)).join("")}</div>` : `<p class="ap-foot">${EN ? "Not discussed in any other exhibit of this file." : "Aucune autre pièce du dossier n'en parle."}</p>`);
  },
  async engagements(q, rb, meta) {
    await steps(rb, [EN ? "Matching each undertaking with its follow-up…" : "Rapprochement de chaque engagement avec sa reprise…"], 400);
    const rows = EN ? [["U-9", "Send the March emails", "Vol. 11, p. 204", "ok", "Followed up · Vol. 15, p. 4"], ["U-12", "Produce the complaints register", "Vol. 12, p. 118", "warn", "Never followed up"], ["U-13", "Provide the org chart", "Vol. 12, p. 176", "ok", "Followed up · Vol. 16, p. 2"], ["U-17", "Check the timesheets", "Vol. 14, p. 63", "warn", "Never followed up"]]
      : [["E-9", "Transmettre les courriels de mars", "Vol. 11, p. 204", "ok", "Repris · Vol. 15, p. 4"], ["E-12", "Produire le registre des plaintes", "Vol. 12, p. 118", "warn", "Jamais repris"], ["E-13", "Fournir l'organigramme", "Vol. 12, p. 176", "ok", "Repris · Vol. 16, p. 2"], ["E-17", "Vérifier les feuilles de temps", "Vol. 14, p. 63", "warn", "Jamais repris"]];
    const only = /jamais|never/.test(norm(q));
    const list = only ? rows.filter(r => r[3] === "warn") : rows;
    rb.innerHTML = `<p class="ap-sum"><strong>${list.length}</strong> ${only ? (EN ? "undertakings never followed up" : "engagements jamais repris") : (EN ? "undertakings" : "engagements")}</p>` + table(EN ? ["Undertaking", "Subject", "Given at", "Status"] : ["Engagement", "Objet", "Pris à", "Statut"], list.map(r => [`<span class="ap-c">${r[0]}</span>`, r[1], `<small>${r[2]}</small>`, `<span class="ap-pill ${r[3]}">${r[4]}</span>`])) + (only ? chips([EN ? "All undertakings" : "Tous les engagements"]) : "");
  },
  async cotes_manquantes(q, rb, meta) {
    await steps(rb, EN ? ["Listing every exhibit discussed in the transcripts…", "Comparing with the declared lists…"] : ["Relevé de chaque cote discutée dans les transcriptions…", "Comparaison avec les listes déclarées…"], 380);
    rb.innerHTML = `<p class="ap-sum"><strong>3</strong> ${EN ? "exhibits discussed that no list declares" : "cotes discutées qu'aucune liste ne déclare"}</p>` + table(EN ? ["Exhibit", "Discussed at", "Context", "Declared in a list"] : ["Cote", "Discutée à", "Contexte", "Déclarée dans une liste"], (EN ? [["P-58", "Vol. 19, p. 233", "Email shown to witness C"], ["D-14", "Vol. 27, p. 61", "Policy excerpt read aloud"], ["P-61", "Vol. 40, p. 12", "Photo discussed by witness F"]] : [["P-58", "Vol. 19, p. 233", "Courriel montré au témoin C"], ["D-14", "Vol. 27, p. 61", "Extrait de politique lu à voix haute"], ["P-61", "Vol. 40, p. 12", "Photo commentée par le témoin F"]]).map(r => [`<span class="ap-c">${r[0]}</span>`, `<small>${r[1]}</small>`, r[2], `<span class="ap-pill warn">${EN ? "None" : "Aucune"}</span>`]));
  },
  async index_interrogatoires(q, rb, meta) {
    await steps(rb, [EN ? "Reading the front-matter indexes of 45 volumes, as printed…" : "Lecture des index liminaires des 45 volumes, tels qu'imprimés…"], 420);
    meta.textContent = EN ? "0.1 s on the real file" : "0,1 s sur le dossier réel";
    rb.innerHTML = `<div class="ap-kpis"><div><strong>50</strong><span>${EN ? "examinations" : "interrogatoires"}</span></div><div><strong>45</strong><span>volumes</span></div><div><strong>8 622</strong><span>pages</span></div></div>` + table(EN ? ["Examination", "Where it begins"] : ["Interrogatoire", "Où il commence"], (EN ? [["Witness B · in chief", "Vol. 12, p. 3"], ["Witness B · cross", "Vol. 12, p. 89"], ["Witness B · re-examination", "Vol. 12, p. 202"]] : [["Témoin B · principal", "Vol. 12, p. 3"], ["Témoin B · contre", "Vol. 12, p. 89"], ["Témoin B · réinterrogatoire", "Vol. 12, p. 202"]]).map(r => [r[0], `<span class="num">${r[1]}</span>`])) + `<p class="ap-foot">${EN ? "Excerpt: volume 12. Indexes are read as printed, not guessed." : "Extrait : volume 12. Les index sont lus tels qu'imprimés, pas devinés."}</p>`;
  },
  async index_pieces(q, rb, meta) {
    await steps(rb, [EN ? "Reading the printed lists of exhibits…" : "Lecture des listes de pièces imprimées…"], 400);
    rb.innerHTML = `<div class="ap-kpis"><div><strong>349</strong><span>${EN ? "exhibits" : "cotes"}</span></div></div>` + table(EN ? ["Exhibit", "What it is", "Filed at"] : ["Cote", "Ce qu'elle porte", "Déposée à"], (EN ? [["P-40", "Internal investigation report", "Vol. 12, p. 47"], ["D-7", "Prevention policy", "Vol. 12, p. 131"], ["P-52", "Human resources emails", "Vol. 13, p. 22"]] : [["P-40", "Rapport d'enquête interne", "Vol. 12, p. 47"], ["D-7", "Politique de prévention", "Vol. 12, p. 131"], ["P-52", "Courriels des ressources humaines", "Vol. 13, p. 22"]]).map(r => [`<span class="ap-c">${r[0]}</span>`, r[1], `<span class="num">${r[2]}</span>`])) + `<p class="ap-foot">${EN ? "Excerpt of the index." : "Extrait de l'index."}</p>`;
  },
  async index_incidents(q, rb, meta) {
    await steps(rb, [EN ? "Reading objections and undertakings in the front matter…" : "Lecture des objections et engagements des pages liminaires…"], 400);
    rb.innerHTML = `<div class="ap-kpis"><div><strong>84</strong><span>objections</span></div><div><strong>98</strong><span>${EN ? "undertakings" : "engagements"}</span></div></div>` + table(["", EN ? "Subject" : "Objet", "Page"], (EN ? [["O-31", "Relevance", "Vol. 12, p. 97"], ["O-32", "Hearsay", "Vol. 12, p. 160"], ["U-12", "Complaints register", "Vol. 12, p. 118"]] : [["O-31", "Pertinence", "Vol. 12, p. 97"], ["O-32", "Ouï-dire", "Vol. 12, p. 160"], ["E-12", "Registre des plaintes", "Vol. 12, p. 118"]]).map(r => [`<span class="ap-c">${r[0]}</span>`, r[1], `<span class="num">${r[2]}</span>`])) + `<p class="ap-foot">${EN ? "Excerpt: volume 12." : "Extrait : volume 12."}</p>`;
  },
  async temoins(q, rb, meta) {
    await steps(rb, EN ? ["Identifying witnesses from the printed page headers…", "Counting “I don't know / I don't remember” by phase…", "Comparing in chief and cross (two-proportion z-test)…"] : ["Repérage des témoins par les en-têtes imprimés…", "Compte des « je ne sais pas / je ne m'en souviens plus » par phase…", "Comparaison principal et contre (test z de deux proportions)…"], 380);
    meta.textContent = EN ? "computed, not guessed" : "calculé, pas deviné";
    const pct = p => (p * 100).toFixed(1).replace(".", EN ? "." : ",") + " %";
    const rows = W.map(([n, x1, n1, x2, n2, l1, l2]) => { const p1 = x1 / n1, p2 = x2 / n2, pp = (x1 + x2) / (n1 + n2); const z = (p2 - p1) / Math.sqrt(pp * (1 - pp) * (1 / n1 + 1 / n2)); return { n, x1, n1, x2, n2, l1, l2, p1, p2, d: (p2 - p1) * 100, z }; }).sort((a, b) => b.d - a.d);
    const flag = rows.filter(r => Math.abs(r.z) >= 1.96).length;
    const of = EN ? "of" : "sur", num = v => v.toFixed(1).replace(".", EN ? "." : ",");
    rb.innerHTML = `<p class="ap-sum"><strong>${flag}</strong> ${EN ? `witnesses change attitude in cross-examination (${rows.length} shown)` : `témoins changent d'attitude au contre-interrogatoire (${rows.length} affichés)`}</p>` + table(EN ? ["Witness", "Non-answers in chief", "In cross", "Gap", "Answer length", "Verdict"] : ["Témoin", "Non-réponses au principal", "Au contre", "Écart", "Longueur des réponses", "Verdict"], rows.map(r => [
      `${EN ? "Witness" : "Témoin"} ${r.n}`, `<span class="num">${r.x1} ${of} ${r.n1} (${pct(r.p1)})</span>`, `<span class="num">${r.x2} ${of} ${r.n2} (${pct(r.p2)})</span>`, `<span class="num">+${num(r.d)} pts</span>`, `<span class="num">${r.l1} → ${r.l2} ${EN ? "words" : "mots"}</span>`,
      (Math.abs(r.z) >= 1.96 ? `<span class="ap-pill hit">${EN ? "Change of attitude" : "Changement d'attitude"}</span>` : `<span class="ap-pill">${EN ? "Stable attitude" : "Attitude stable"}</span>`) + `<small>z = ${r.z.toFixed(2).replace(".", EN ? "." : ",")} (${EN ? "threshold" : "seuil"} 1${EN ? "." : ","}96)</small>`]))
      + `<p class="ap-foot">${EN ? "Fictional example. A witness is flagged when |z| ≥ 1.96, alongside shorter answers." : "Exemple fictif. Un témoin est signalé quand |z| ≥ 1,96, avec des réponses qui raccourcissent."}</p>`;
  },
  async inventaire(q, rb, meta) {
    await steps(rb, [EN ? "Listing every exhibit…" : "Relevé de chaque pièce…"], 360);
    if (S.dos === "B") { rb.innerHTML = `<div class="ap-kpis"><div><strong>45</strong><span>volumes</span></div><div><strong>8 622</strong><span>pages</span></div><div><strong>349</strong><span>${EN ? "exhibits" : "cotes"}</span></div><div><strong>50</strong><span>${EN ? "examinations" : "interrogatoires"}</span></div><div><strong>17</strong><span>${EN ? "witnesses" : "témoins"}</span></div></div>` + chips(EN ? ["The index of exhibits", "The list of witnesses"] : ["L'index des pièces cotées", "La liste des témoins"]); return; }
    rb.innerHTML = `<p class="ap-sum"><strong>${DOCS_A.length}</strong> ${EN ? "exhibits" : "pièces"} + 1 ${EN ? "recording" : "enregistrement"}</p>` + table(EN ? ["Exhibit", "Nature", "Date", "Volume"] : ["Pièce", "Nature", "Date", "Volume"], [...DOCS_A.map(d => [`<span class="ap-c">${d.c}</span>`, `${esc(d.t)}<small>${esc(d.n)}</small>`, `<span class="num">${d.d}</span>`, `<span class="num">Vol. ${d.v}</span>`]), [`<span class="ap-c">REC</span>`, `${esc(AUDIO.t)}<small>${AUDIO.f}</small>`, `<span class="num">2023-03-08</span>`, `<span class="num">Vol. 7</span>`]]);
  },
  async prendre(q, rb, meta) {
    await steps(rb, EN ? ["Reading 12 exhibits (PDF, images, .docx, .eml, .msg read directly)…", "Converting .rtf and spreadsheets, no external dependency…", "OCR on scanned pages with Qwen3-VL, locally…", "Transcribing the recording with Whisper, locally (timestamped segments)…", "Encrypting the file…", "Indexing: accents folded, plurals indexed…"] : ["Lecture de 12 pièces (PDF, images, .docx, .eml, .msg lus directement)…", "Conversion des .rtf et tableurs, sans dépendance externe…", "OCR des pages numérisées avec Qwen3-VL, en local…", "Transcription de l'enregistrement avec Whisper, en local (segments horodatés)…", "Chiffrement du dossier…", "Indexation : accents repliés, pluriels indexés…"], 480);
    setDos("A", true);
    rb.innerHTML = `<p class="ap-sum"><strong>${EN ? "Ready." : "Prêt."}</strong> ${EN ? "The file is encrypted and indexed: questions now answer in a second." : "Le dossier est chiffré et indexé : les questions répondent maintenant à la seconde."}</p><p class="ap-foot">${EN ? "Demo: nothing was actually read. Nothing ever leaves the machine." : "Démo : rien n'a réellement été lu. Rien ne quitte jamais la machine."}</p>` + chips(EN ? ["What is in the file", "When was the formal notice sent?"] : ["Qu'est-ce qu'il y a dans le dossier", "Quand la mise en demeure a-t-elle été envoyée ?"]);
  },
  async convertir(q, rb, meta, pre) {
    const act = EN ? { pdf: "readable as is", msg: "read directly", docx: "read directly", jpg: "OCR · Qwen3-VL", rtf: "converted, no external dependency", wav: "Whisper · timestamped segments" } : { pdf: "lisible tel quel", msg: "lu directement", docx: "lu directement", jpg: "OCR · Qwen3-VL", rtf: "converti, sans dépendance externe", wav: "Whisper · segments horodatés" };
    rb.innerHTML = (pre ? `<p class="ap-note" style="margin:0 0 10px">${T.attach}</p>` : "") + `<div class="ap-files">${FILES.map(f => `<div class="ap-file"><span class="ext">${f[1].toUpperCase()}</span><span>${esc(f[0])}</span><span class="to">${act[f[1]]}</span></div>`).join("")}</div>`;
    const els = $$(".ap-file", rb);
    for (const el of els) { await wait(230); el.classList.add("on"); toBottom(); }
    rb.insertAdjacentHTML("beforeend", `<p class="ap-foot">${EN ? "8 files readable · processed on this machine" : "8 fichiers lisibles · traités sur cette machine"}</p>`);
  },
  async classer(q, rb, meta) {
    const n = norm(q), mode = /nom|name/.test(n) ? 1 : /type/.test(n) ? 2 : /taille|size/.test(n) ? 3 : 0;
    const keys = EN ? ["date", "name", "type", "size"] : ["date", "nom", "type", "taille"];
    const nn = i => String(i + 1).padStart(3, "0");
    const TY = EN ? { pdf: "PDF", msg: "Emails", docx: "Documents", rtf: "Documents", jpg: "Images", wav: "Audio" } : { pdf: "PDF", msg: "Courriels", docx: "Documents", rtf: "Documents", jpg: "Images", wav: "Audio" };
    const ids = FILES.map((_, i) => i), byName = (a, b) => FILES[a][0].localeCompare(FILES[b][0], EN ? "en" : "fr", { sensitivity: "base" });
    const order = [(a, b) => FILES[a][2].localeCompare(FILES[b][2]), byName, byName, (a, b) => FILES[b][3] - FILES[a][3]][mode];
    let groups;
    if (mode === 2) { const m = new Map(); ids.forEach(i => { const g = TY[FILES[i][1]]; if (!m.has(g)) m.set(g, []); m.get(g).push(i); }); groups = [...m.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([g, v]) => [g + "/", v.sort(order)]); }
    else groups = [[(EN ? "Sorted" : "Classé") + "/", ids.sort(order)]];
    const names = {}; groups.forEach(([, v]) => v.forEach((i, k) => names[i] = mode === 0 ? `${FILES[i][2]}_${FILES[i][0]}` : `${nn(k)}_${FILES[i][0]}`));
    S.sorted = keys[mode];
    meta.textContent = `mode${EN ? "" : " "}: ${keys[mode]}`;
    rb.innerHTML = groups.map(([g, v]) => `<div class="ap-folder">${esc(g)}</div><div class="ap-files">${v.map(i => `<div class="ap-file"><span class="ext">${FILES[i][1].toUpperCase()}</span><span data-to="${esc(names[i])}">${esc(FILES[i][0])}</span></div>`).join("")}</div>`).join("");
    for (const el of $$(".ap-file", rb)) { await wait(200); el.classList.add("on"); await scramble($("[data-to]", el)); toBottom(); }
    rb.insertAdjacentHTML("beforeend", `<p class="ap-foot">${EN ? "8 files sorted and renamed · reversible with" : "8 fichiers classés et renommés · réversible avec"} <code>defaire_classement</code></p>` + chips(EN ? ["Undo the sort", "Sort the exhibits by type", "Sort the exhibits by size"] : ["Défais le classement", "Classe les pièces par type", "Classe les pièces par taille"]));
  },
  async defaire_classement(q, rb, meta) {
    if (!S.sorted) { rb.innerHTML = `<p class="ap-sum">${EN ? "No sort to undo: the exhibits keep their original names." : "Aucun classement à défaire : les pièces ont leur nom d'origine."}</p>` + chips(EN ? ["Sort the exhibits by date"] : ["Classe les pièces par date"]); return; }
    rb.innerHTML = `<div class="ap-folder">${EN ? "Disclosure" : "Divulgation"}/</div><div class="ap-files">${FILES.map(f => `<div class="ap-file"><span class="ext">${f[1].toUpperCase()}</span><span data-to="${esc(f[0])}">…</span></div>`).join("")}</div>`;
    for (const el of $$(".ap-file", rb)) { await wait(150); el.classList.add("on"); await scramble($("[data-to]", el)); }
    S.sorted = null;
    rb.insertAdjacentHTML("beforeend", `<p class="ap-foot">${EN ? "Original names restored." : "Noms d'avant rétablis."}</p>`);
  },
  async estimer(q, rb, meta) {
    await steps(rb, [EN ? "Measuring what reading this file involves…" : "Mesure de ce que la lecture de ce dossier demande…"], 400);
    rb.innerHTML = table(EN ? ["To read", "Quantity", "Engine"] : ["À lire", "Quantité", "Moteur"], (EN ? [["Scanned pages", "22 pages", "OCR · Qwen3-VL, local"], ["Recordings", "1 recording", "Whisper, local"], ["Readable exhibits", "10 exhibits", "direct reading"]] : [["Pages numérisées", "22 pages", "OCR · Qwen3-VL, local"], ["Enregistrements", "1 enregistrement", "Whisper, local"], ["Pièces lisibles", "10 pièces", "lecture directe"]]).map(r => [r[0], `<span class="num">${r[1]}</span>`, `<small>${r[2]}</small>`])) + `<p class="ap-note">${EN ? "The duration is estimated from your own machine's speed, before launching. The demo does not measure it." : "La durée est estimée d'après la vitesse de votre propre poste, avant de lancer. La démo ne la mesure pas."}</p>` + chips(EN ? ["Take charge of the file"] : ["Prends en charge le dossier"]);
  },
  async lister(q, rb, meta) {
    rb.innerHTML = table(EN ? ["File", "Contents", "State"] : ["Dossier", "Contenu", "État"], ["A", "B"].map(d => [`<button class="ap-open" type="button" data-dos="${d}" style="font-size:.9rem!important">${esc(DOSSIERS[d].name)}</button>`, `<small>${DOSSIERS[d].meta}</small>`, `<span class="ap-pill ok">${EN ? "encrypted · indexed" : "chiffré · indexé"}</span>`]));
  },
  async delais(q, rb, meta) {
    meta.textContent = EN ? "calculated, not guessed" : "calculé, pas deviné";
    const MOIS = EN ? ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"] : ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre"];
    const n = norm(q); let dt = null;
    let m = n.match(/(\d{4})-(\d{1,2})-(\d{1,2})/); if (m) dt = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    if (!dt) { m = n.match(new RegExp(`(\\d{1,2})(?:er)?\\s+(${MOIS.join("|")})\\s+(\\d{4})`)); if (m) dt = new Date(Date.UTC(+m[3], MOIS.indexOf(m[2]), +m[1])); }
    if (!dt) { m = n.match(new RegExp(`(${MOIS.join("|")})\\s+(\\d{1,2}),?\\s+(\\d{4})`)); if (m) dt = new Date(Date.UTC(+m[3], MOIS.indexOf(m[1]), +m[2])); }
    const M = EN ? ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] : ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    const txt = d => EN ? `${M[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}` : `${d.getUTCDate() === 1 ? "1er" : d.getUTCDate()} ${M[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    if (!dt || isNaN(dt)) { rb.innerHTML = `<p class="ap-sum">${EN ? "Event date unknown: no deadline is calculated." : "Date de l'événement inconnue : aucune échéance n'est calculée."}</p>` + chips([CMD.delais.ex]); return; }
    const end = new Date(dt.getTime() + 45 * 86400000);
    rb.innerHTML = `<p class="ap-sum">${EN ? "Deadline to file the complaint (s. 123 ALS)" : "Échéance pour déposer la plainte (art. 123 LNT)"}</p><div class="ap-big">${txt(end)}</div><p class="ap-foot">${txt(dt)} + 45 ${EN ? "days" : "jours"} · ${EN ? "example calculation, for illustration" : "exemple de calcul, à titre d'illustration"}</p>` + chips(EN ? ["Deadline for a prohibited-practice complaint of March 1, 2024"] : ["Échéance d'une plainte pour pratique interdite du 1er mars 2024"]);
  },
  async etat(q, rb, meta) {
    const on = S.model === "on";
    rb.innerHTML = table(EN ? ["Component", "State"] : ["Élément", "État"], [
      [EN ? "Local language model" : "Modèle de langue local", `<span class="ap-pill ${on ? "ok" : ""}">${on ? (EN ? "ready" : "prêt") : (EN ? "stopped" : "arrêté")}</span>`],
      ["Qwen3-VL · OCR", `<span class="ap-pill">${EN ? "stopped" : "arrêté"}</span>`], ["Whisper · audio", `<span class="ap-pill">${EN ? "stopped" : "arrêté"}</span>`],
      [esc(DOSSIERS.A.name), `<span class="ap-pill ok">${EN ? "indexed" : "indexé"}</span>`], [esc(DOSSIERS.B.name), `<span class="ap-pill ok">${EN ? "indexed" : "indexé"}</span>`],
      [EN ? "Internet connection" : "Connexion Internet", `<span class="ap-pill ok">${EN ? "none required" : "aucune requise"}</span>`]]);
  },
  async etat_analyses(q, rb, meta) {
    const st = S.an.st;
    rb.innerHTML = table(EN ? ["Analysis", "State"] : ["Analyse", "État"], [[T.anName, `<span class="ap-pill ${st === "done" ? "ok" : st === "stop" ? "warn" : "hit"}">${st === "done" ? T.anDone : st === "run" ? `${T.anRun} · ${Math.round(S.an.pct)} %` : T.anStop}</span>`]]) + (st === "done" ? chips(EN ? ["The cross-examination binder for witness B", "Summarize page 97 of volume 12"] : ["Le cahier de contre-interrogatoire du témoin B", "Résume la page 97 du volume 12"]) : chips([st === "run" ? CMD.arreter_analyse.ex : CMD.relancer_analyse.ex]));
  },
  async arreter_analyse(q, rb, meta) {
    if (S.an.st !== "run") { rb.innerHTML = `<p class="ap-sum">${EN ? "No analysis is running." : "Aucune analyse n'est en cours."}</p>` + chips([CMD.relancer_analyse.ex]); return; }
    clearInterval(anTimer); S.an.st = "stop"; renderAn(); setModel("off");
    rb.innerHTML = `<p class="ap-sum">${EN ? "Analysis stopped at" : "Analyse arrêtée à"} <strong>${Math.round(S.an.pct)} %</strong>. ${EN ? "It can be restarted where it left off." : "Elle peut être relancée là où elle s'est arrêtée."}</p>` + chips([CMD.relancer_analyse.ex]);
  },
  async relancer_analyse(q, rb, meta) {
    if (S.an.st === "run") { rb.innerHTML = `<p class="ap-sum">${EN ? "The analysis is already running." : "L'analyse est déjà en cours."}</p>` + chips([CMD.arreter_analyse.ex]); return; }
    await steps(rb, EN ? ["Checking the model server…", "Restarting the model server (no response)…"] : ["Vérification du serveur de modèle…", "Redémarrage du serveur de modèle (aucune réponse)…"], 450);
    setModel("on");
    if (S.an.st === "done") S.an.pct = 0;
    S.an.st = "run"; renderAn();
    clearInterval(anTimer);
    anTimer = setInterval(() => { S.an.pct = Math.min(100, S.an.pct + 1.2); if (S.an.pct >= 100) { clearInterval(anTimer); S.an.st = "done"; } renderAn(); }, 120);
    rb.innerHTML = `<p class="ap-sum">${EN ? "Analysis restarted. Follow its progress in the sidebar." : "Analyse relancée. Suivez sa progression dans la barre latérale."}</p>` + chips([CMD.arreter_analyse.ex, CMD.etat_analyses.ex]);
  }
};

// Renommage animé (lettres qui défilent)
function scramble(el) {
  const text = el.dataset.to, GL = "abcdefghijklmnopqrstuvwxyz0123456789_-";
  if (RM) { el.textContent = text; return Promise.resolve(); }
  return new Promise(res => { let f = 0; const N = 10; const it = setInterval(() => { f++; const k = Math.floor(text.length * f / N); el.textContent = text.slice(0, k) + Array.from(text.slice(k), c => c === " " ? " " : GL[Math.random() * GL.length | 0]).join(""); if (f >= N) { clearInterval(it); el.textContent = text; res(); } }, 30); });
}

/* ---------------------------------------------------------
   Visionneuse : la page exacte, à l'écran seulement
   --------------------------------------------------------- */
function openView(o, q) {
  let head = "", html = "";
  const mark = (x, qq) => { if (!qq) return esc(x); const ts = terms(qq); const h = ts.flatMap(t => spans(norm(x), termRe(t))); return hl(x, h); };
  if (o.k === "doc") { const d = DOCS_A.find(x => x.c === o.c); head = `${d.c} · ${d.t} · ${loc(d.v, d.pg)}`; html = `<p>${mark(d.x, q)}</p>`; }
  else if (o.k === "audio") { head = `${AUDIO.f} · ${AUDIO.u[o.i][0]} → ${AUDIO.u[o.i][1]}`; html = AUDIO.u.map((s, i) => `<p style="opacity:${Math.abs(i - o.i) > 2 ? .45 : 1}"><span class="ts">${s[0]}</span>${i === o.i ? `<mark>${esc(s[2])}</mark>` : esc(s[2])}</p>`).join(""); }
  else if (o.k === "p97") { head = `Vol. 12 · p. 97 · ${EN ? "cross-examination, witness B" : "contre-interrogatoire, témoin B"}`; html = P97.map((x, i) => `<p><span class="ln">${String(i + 1).padStart(2, "0")}</span>${i + 1 >= o.l[0] && i + 1 <= o.l[1] ? `<mark>${esc(x)}</mark>` : (q ? mark(x, q) : esc(x))}</p>`).join(""); }
  else if (o.k === "pass") { const p = PASS_B[o.i]; head = `${p.vol} · p. ${p.pg} · ${p.who}`; html = `<p>${mark(p.x, q)}</p>`; }
  overlay(`<div class="ap-view" role="dialog" aria-label="${esc(head)}"><div class="ap-view-h"><span>${esc(head)}</span><button type="button" data-act="close" aria-label="${T.close}">×</button></div><div class="ap-view-b">${html}</div><div class="ap-view-f">${T.viewFoot}</div></div>`);
}
let ov = null, lastFocus = null;
function overlay(html) {
  closeOv(); lastFocus = document.activeElement;
  ov = document.createElement("div"); ov.className = "ap-ov"; ov.innerHTML = html; root.append(ov);
  ov.addEventListener("click", e => { if (e.target === ov) closeOv(); });
  const f = $("input,button", ov); f && f.focus({ preventScroll: true });
  // Tab reste dans la boîte ouverte
  ov.addEventListener("keydown", e => {
    if (e.key !== "Tab") return;
    const fs = $$("input,button", ov).filter(x => x.offsetParent !== null); if (!fs.length) return;
    const first = fs[0], last = fs[fs.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
}
const closeOv = () => { if (ov) { ov.remove(); ov = null; lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true }); } };

/* ---------- palette de commandes ---------- */
function palette() {
  overlay(`<div class="ap-pal" role="dialog" aria-label="${T.cmds}"><input type="text" placeholder="${T.palPh}" aria-label="${T.palPh}"><div class="ap-pal-l"></div></div>`);
  const inp = $("input", ov), list = $(".ap-pal-l", ov);
  const draw = f => {
    const n = norm(f || "");
    list.innerHTML = G.map((g, gi) => { const items = CMDS.filter(c => c.g === gi && (!n || norm(c.id + " " + c.d + " " + c.ex).includes(n))); if (!items.length) return ""; return `<h4>${g}</h4>` + items.map(c => `<button class="ap-pal-i" type="button" data-q="${esc(c.ex)}" data-id="${c.id}"><code>${c.id}</code><span>${esc(c.d)}${c.model ? "" : ` <small>(${T.noModel})</small>`}</span>${c.fs ? `<i class="fs">${T.touches}</i>` : ""}<em>${EN ? `“${esc(c.ex)}”` : `« ${esc(c.ex)} »`}</em></button>`).join(""); }).join("") || `<p class="ap-foot" style="padding:10px">—</p>`;
  };
  draw(""); inp.addEventListener("input", () => draw(inp.value));
  inp.addEventListener("keydown", e => { if (e.key === "Enter") { const b = $(".ap-pal-i", list); b && b.click(); } });
}

/* ---------- menu des dossiers ---------- */
let menu = null;
const closeMenu = () => { if (menu) { menu.remove(); menu = null; } };
function dosMenu() {
  if (menu) return closeMenu();
  menu = document.createElement("div"); menu.className = "ap-menu"; menu.setAttribute("role", "menu");
  menu.innerHTML = ["A", "B"].map(d => `<button type="button" role="menuitem" data-dos="${d}" class="${S.dos === d ? "on" : ""}"><span>${esc(DOSSIERS[d].name)}</span><small>${DOSSIERS[d].meta}</small></button>`).join("");
  root.append(menu);
}

/* ---------- événements ---------- */
root.addEventListener("click", e => {
  if (root.classList.contains("side") && !e.target.closest(".ap-side, .ap-burger")) root.classList.remove("side");
  const t = e.target.closest("button, [data-q]"); if (!t || !root.contains(t)) { closeMenu(); return; }
  if (!t.closest(".ap-menu") && t.dataset.act !== "dos") closeMenu();
  const act = t.dataset.act;
  if (t.dataset.dos) { setDos(t.dataset.dos); closeOv(); return; }
  if (t.dataset.open) { openView(JSON.parse(t.dataset.open), t.dataset.hl); return; }
  if (t.dataset.q) { closeOv(); if (t.dataset.id) ask(t.dataset.q, t.dataset.id); else ask(t.dataset.q); return; }
  if (act === "pal") return palette();
  if (act === "close") return closeOv();
  if (act === "dos") return dosMenu();
  if (act === "side") return root.classList.toggle("side");
  if (act === "new") { thread = null; welcome(); root.classList.remove("side"); return; }
  if (act === "paper") { const p = root.classList.toggle("paper"); t.textContent = "◐ " + (p ? T.dark : T.paper); return; }
  if (act === "an") return ask(EN ? "The cross-examination binder for witness B" : "Le cahier de contre-interrogatoire du témoin B", "cahier");
  if (act === "clip") { if (S.busy) return; S.busy = true; addConv(EN ? "Attach a file" : "Joindre un fichier"); const th = ensureThread(); const r = document.createElement("div"); r.className = "ap-r"; r.innerHTML = `<div class="ap-rh"><span class="ap-cmd">convertir</span><span class="ap-tag">${T.noModel}</span><span class="ap-tag fs">${T.touches}</span></div><div class="ap-rb"></div>`; th.append(r); setDos("A", true); RUN.convertir("", $(".ap-rb", r), null, true).then(() => { S.busy = false; toBottom(); }); }
});
$(".ap-form").addEventListener("submit", e => { e.preventDefault(); const q = input.value; input.value = ""; ask(q); });
$("select", root).addEventListener("change", e => { const v = e.target.value; if (!v) return setModel("off"); const lab = { llm: T.modelOn, ocr: "Qwen3-VL · " + (EN ? "ready" : "prêt"), asr: "Whisper · " + (EN ? "ready" : "prêt") }[v]; setModel("warm"); setTimeout(() => setModel("on", lab), RM ? 0 : 800); });
root.addEventListener("keydown", e => { if (e.key === "Escape") { closeOv(); closeMenu(); root.classList.remove("side"); } });
// ⌘K / Ctrl+K quand la fenêtre est à l'écran
let inView = false;
new IntersectionObserver(es => es.forEach(x => inView = x.isIntersecting), { threshold: .4 }).observe(root);
addEventListener("keydown", e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && inView) { e.preventDefault(); ov ? closeOv() : palette(); } });

// Boutons « Essayer dans Projecteur » des sections : remonter à la fenêtre et lancer la commande
document.addEventListener("click", e => {
  const b = e.target.closest("[data-try]"); if (!b) return;
  root.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "center" });
  setTimeout(() => ask(b.dataset.try), RM ? 0 : 700);
});

setDos("A", true); renderAn(); welcome();
})();
