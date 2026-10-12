// Public Freelancer.com project discovery. READ ONLY: client listings are not
// signed contracts, funded milestones, permission for autonomous bids, or earnings.
const WEB=/(?:\b(?:website|web\s*(?:site|design|designer|page|development|app|template)|landing\s*page|wordpress|woocommerce|shopify|e-?commerce\s*(?:store|site|website)|frontend|front.end|html|css|responsive\s+(?:site|website|page)|webflow|squarespace|wix)\b|p[aá]gina(?:s)?\s+web|sitio\s+web|tienda\s+online|dise[nñ]o\s+web)/i;
const SOFTWARE=/(?:\b(?:software|saas|mobile\s+app|app\s+development|android|ios\s+app|flutter|react(?:\s+native)?|next\.js|node\.js|api\s+(?:integration|development)|automation|automate|python|typescript|javascript|bug\s+fix|database|custom\s+plugin|plugin\s+(?:development|integration)|dashboard|chatbot|crm\s+(?:system|development)|desktop\s+app)\b|aplicaci[oó]n|automatizaci[oó]n|programaci[oó]n|desarrollador|programador)/i;
const DESIGN=/(?:\b(?:logo|branding|brand\s+identity|graphic\s+design|flyer|brochure|poster|illustrat(?:ion|or)|packag(?:e|ing)\s+design|label\s+design|banner\s+design|ui\/ux|ux\/ui|figma|product\s+design|business\s+card|social\s+media\s+graphics)\b|dise[nñ]o\s+gr[aá]fico|logotipo|ilustraci[oó]n|identidad\s+visual|folleto|cartel)/i;
const UNWANTED=/(?:\b(?:casino|gambling|sportsbook|betting|bookmaker|fake\s+reviews?|captcha|watch\s+ads?|click\s+ads?|buy\s+followers|fake\s+accounts?|pay\s+first|deposit\s+first|escort|adult\s+content)\b)/i;
const MARKETING_ONLY=/\b(?:marketing|social\s+media\s+marketing|seo\s+specialist|facebook\s+ads?|google\s+ads?|sales\s+growth|lead\s+generation|marketing\s+campaign|ad\s+campaign|influencer\s+marketing)\b/i;
// Job titles often mention software because the client wants to SELL it, not build it.
const SALES_ROLE=/(?:\b(?:commission[- ]only|commission[- ]based|on\s+commission|sales\s+(?:partner|agent|agents|executive|representative|closer)|appointment\s+setter|business\s+development\s+(?:executive|manager|representative)|cold\s+call(?:er|ing)|telemarketing|lead\s+generation|outbound\s+sales|sales\s+appointment|independent\s+sales\s+partner)\b)/i;
const CAMPAIGN_ROLE=/(?:\b(?:social\s+media\s+campaign|app\s+launch\s+(?:social\s+media\s+)?campaign|marketing\s+campaign|digital\s+marketing|seo\s+campaign|influencer\s+campaign|media\s+buyer)\b)/i;
const VISUAL_DELIVERABLE=/(?:\b(?:logo|brochure|flyer|poster|graphic\s+design|branding\s+design|design\s+graphics|brand\s+identity|illustration|marketing\s+brochure|marketing\s+flyer)\b)/i;
const TECH_DESIGN=/(?:\b(?:mechanical|industrial\s+design|solidworks|autocad|cad\s+(?:drawing|model|engineer)|product\s+design\s+engineer|3d\s+cad)\b)/i;
const QUICK_SCOPE=/(?:\b(?:simple|small|minor|quick|one.page|landing\s+page|bug\s+fix|tweaks|logo|brochure|template|fix\s+(?:my|the)|responsive|wordpress)\b)/i;
const COMPLEX_SCOPE=/(?:\b(?:enterprise|full.stack\s+platform|real.time\s+face\s+swapp?ing|complex\s+backend|full\s+system\s+from\s+scratch|mission.critical|24\/7\s+support)\b)/i;
const SEO=/^[a-z0-9_-]+(?:\/[a-z0-9_-]+){1,3}$/i;
const CURRENCY=/^[A-Z]{3}$/;
const validText=(v,n=160)=>String(v||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,n);
export const FREELANCER_SEARCHES=['website','software','mobile app','logo','graphic design'];
export function freelanceFeedUrl(term){
 if(!FREELANCER_SEARCHES.includes(term))throw Error('Categoría no configurada');
 const u=new URL('https://www.freelancer.com/api/projects/0.1/projects/active/');
 u.searchParams.set('limit','35');
 u.searchParams.set('query',term);
 u.searchParams.set('sort_field','submitdate');
 return u.toString();
}
export function screenFreelancerProjects(payload,now=Date.now()){
 if(payload?.status!=='success'||!Array.isArray(payload?.result?.projects))
  throw Error('Freelancer.com cambió su formato público');
 const result=[];
 for(const p of payload.result.projects.slice(0,70)){
  const id=Number(p?.id),seo=String(p?.seo_url||'');
  const title=validText(p?.title,170),brief=validText(p?.preview_description||p?.description,1250);
  const published=Number(p?.submitdate)*1000;
  const min=Number(p?.budget?.minimum),max=Number(p?.budget?.maximum);
  const currency=String(p?.currency?.code||'').toUpperCase();
  if(!Number.isSafeInteger(id)||id<=0||!SEO.test(seo)||
    p?.status!=='active'||p?.frontend_project_status!=='open'||
    p?.deleted===true||p?.nonpublic===true||p?.local===true||p?.hireme===true||
    !['fixed','hourly'].includes(String(p?.type))||
    !Number.isFinite(published)||published>now+3600000||now-published>7*86400000||
    title.length<9||brief.length<35||!Number.isFinite(min)||!Number.isFinite(max)||
    min<=0||max<min||max>50000||!CURRENCY.test(currency))continue;
  const combined=title+' '+brief;
  if(UNWANTED.test(combined)||SALES_ROLE.test(title)||
    (CAMPAIGN_ROLE.test(title)&&!VISUAL_DELIVERABLE.test(title)))continue;
  // Classify from the client request title first: a description may mention unrelated tools.
  // Exclude pure marketing jobs even if they mention web platforms such as Shopify.
  let category='';
  if(TECH_DESIGN.test(title))category='Diseño técnico/CAD';
  else if(SOFTWARE.test(title))category='Software y apps';
  else if(WEB.test(title))category='Páginas web';
  else if(DESIGN.test(title))category='Diseño gráfico';
  else if(SOFTWARE.test(brief)&&!MARKETING_ONLY.test(title))category='Software y apps';
  else if(WEB.test(brief)&&!MARKETING_ONLY.test(title))category='Páginas web';
  else if(DESIGN.test(brief)&&!MARKETING_ONLY.test(title))category='Diseño gráfico';
  if(!category||MARKETING_ONLY.test(title)&&!VISUAL_DELIVERABLE.test(title)&&
    !/(?:\b(?:build|develop|implement|program|integration|code|coding|technical\s+design)\b)/i.test(title))continue;
  const bidCount=Number(p?.bid_stats?.bid_count);
  const bids=Number.isInteger(bidCount)&&bidCount>=0?bidCount:null;
  const competition=bids===null?'Por verificar':bids>=50?'Alta':bids>=15?'Media':'Baja';
  // Comparing raw INR, USD, AUD etc. would incorrectly reward high numeric amounts.
  const valueWeight=['USD','EUR','GBP','AUD','CAD'].includes(currency)?Math.min(7,Math.round(Math.log10(Math.max(1,max))*2)):0;
  const competitionPenalty=bids===null?3:Math.min(30,Math.floor(bids/5));
  const scopeBoost=QUICK_SCOPE.test(title)?9:0;
  const complexityPenalty=COMPLEX_SCOPE.test(combined)?10:0;
  const score=40+valueWeight-competitionPenalty+(now-published<86400000?10:0)+
    (p.type==='fixed'?5:0)+scopeBoost-complexityPenalty-(category==='Diseño técnico/CAD'?5:0);
  result.push({id:'freelancer:'+id,source:'Freelancer.com',title,description:brief,
    category,url:'https://www.freelancer.com/projects/'+seo,
    budgetMin:min,budgetMax:max,currency,priceModel:p.type==='hourly'?'por hora':'precio fijo',
    proposals:bids,competition,publishedAt:new Date(published).toISOString(),score,
    status:'publicado_sin_postular',
    note:'Proyecto anunciado por un cliente. Requiere cuenta, propuesta, aceptación y comprobación de pago. El uso de IA y la elegibilidad se verifican en la plataforma.'});
 }
 return [...new Map(result.map(x=>[x.id,x])).values()].sort((a,b)=>b.score-a.score||b.budgetMax-a.budgetMax);
}
