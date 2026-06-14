/* ================================================================
   SANTA FE TIJUANA — Shared JS
   Used by: index.html, directory.html, about.html
================================================================ */
'use strict';

/* ════ CONFIG — update GAS_URL after each new GAS deployment ════ */
window.SFT = window.SFT || {};
SFT.GAS_URL    = 'https://script.google.com/macros/s/AKfycbzhp36hAmu3Jxy7N6KbvsOPBvesFG5TxEGQ2rVEDLlRIPPMzF93bhfamx3lSamAHvPqMw/exec';
SFT.SITE_NAME  = 'Santafetijuana.com';
SFT.SITE_URL   = 'https://santafetijuana.com';
SFT.FAVICON_URL = 'https://static.wixstatic.com/shapes/49ea47_c66ce2c314d141f6b444d9c1616d1524.svg';
SFT.LOGO_URL    = 'https://static.wixstatic.com/media/49ea47_e8709539ce4a48caaa44d7629e3679c4~mv2.png';
SFT.PAGE_SIZE  = 12;

/* ════ API ════ */
const IS_GAS = (typeof google !== 'undefined' && google.script && google.script.run);

async function api(action, payload) {
  payload = payload || {};
  if (IS_GAS) {
    return new Promise(r => {
      google.script.run
        .withSuccessHandler(r)
        .withFailureHandler(e => r({ success: false, error: e.message }))
        .handleRequest(action, payload);
    });
  }

  /* Read-only actions: use GET — avoids CORS preflight & redirect stripping */
  const READ_ONLY = ['getBusinesses','getRequests','getOffers','getActiveBannerAds','getCategories','searchArchived','getBusinessById'];

  if (READ_ONLY.includes(action)) {
    try {
      const p = new URLSearchParams({ action, payload: JSON.stringify(payload) });
      const res = await fetch(SFT.GAS_URL + '?' + p, { redirect: 'follow' });
      const text = await res.text();
      return JSON.parse(text);
    } catch (e) {
      return { success: false, error: T('errNetwork') + ' (GET)' };
    }
  }

  /* Write actions: POST via XMLHttpRequest.
     GAS web apps redirect POST → GET when using fetch(redirect:'follow'),
     which drops the request body. XHR follows the 302 chain and re-sends
     the body, making it reliable for registration + image uploads. */
  return new Promise(resolve => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', SFT.GAS_URL, true);
      xhr.setRequestHeader('Content-Type', 'text/plain');
      xhr.timeout = 60000; // 60s — allows time for image upload to Drive
      xhr.onload = () => {
        try { resolve(JSON.parse(xhr.responseText)); }
        catch (e) { resolve({ success: false, error: 'Invalid response from server.' }); }
      };
      xhr.onerror   = () => resolve({ success: false, error: T('errNetwork') + ' (POST)' });
      xhr.ontimeout = () => resolve({ success: false, error: 'Request timed out. Try again.' });
      xhr.send(JSON.stringify({ action, payload }));
    } catch (e) {
      resolve({ success: false, error: T('errNetwork') + ' (POST)' });
    }
  });
}

/* ════ i18n ════ */
let LANG = 'es';
const STRINGS = {
  en: {
    portalSub:'Community Directory', heroBadge:'SANTA FE TIJUANA · OFFICIAL DIRECTORY',
    heroLine1:'In Santa Fe', heroLine2:'We Have It All',
    heroTagline:'Connect · Publish · Quote · Grow',
    heroSub:'Your trusted platform to advertise businesses, offer services, and request quotes in the Santa Fe Tijuana community.',
    statBiz:'Businesses', statReq:'Requests', statOff:'Active Offers',
    ctaRegister:'Register Your Business', ctaDir:'Browse Directory', scrollLabel:'VIEW DIRECTORY',
    howLabel:'How it works', howTitle:'Simple, fast and free',
    howSub:'Three steps to connect with the entire Santa Fe Tijuana community.',
    step1Title:'Register Your Business', step1Desc:'Create your free listing in under 2 minutes. Upload photos, add your phone and service description.', step1Cta:'Register now',
    step2Title:'Publish or Request', step2Desc:'Need a service? Post your request. Have something to offer? Create your free listing with photos and price.', step2Cta:'Post a request',
    step3Title:'Connect and Grow', step3Desc:'Share your listing via WhatsApp, receive direct calls and be visible to the whole community 24/7.', step3Cta:'Explore directory',
    catsLabel:'Categories', catsTitle:'Find what you need', catsViewAll:'View all',
    photosLabel:'The community', photosTitle:'Santa Fe Tijuana in action',
    photo1:'Local Businesses', photo2:'Home Services', photo3:'Local Gastronomy', photo4:'Beauty & Care', photo5:'Home Repairs',
    trustLabel:'Testimonials', trustTitle:'What the community says',
    quote1:'"I registered my tamale business in 5 minutes and that same week I had 3 new orders."',
    quote2:'"I posted a repair request and by the next day had 4 people contacting me."',
    quote3:'"The featured banner was worth every cent. My salon now has permanent visibility."',
    trustBiz1:'Tamales La Esperanza', trustBiz2:'Santa Fe Resident', trustBiz3:'Studio Belleza AR',
    ctaBannerTitle:'Ready to grow?',
    ctaBannerSub:'Join hundreds of businesses already part of the most complete directory in Santa Fe Tijuana.',
    featuredBiz:'Featured Businesses', tabDir:'Directory', tabReq:'Requests', tabOff:'Offers & Products',
    navDir:'Directory', navReq:'Requests', navOff:'Offers', navAbout:'About', navRegister:'Register Business',
    onboardTitle:'Do you have a business in Santa Fe Tijuana?',
    onboardSub:'Register it for free and reach the whole community. Takes just 2 minutes.', onboardCta:'Register free',
    dirTitle:'Business Directory', dirDesc:'Newest first · Updated today',
    reqTitle:'Service Requests', reqDesc:'People looking for services · Expires after 60 days',
    offTitle:'Offers & Products', offDesc:'Services and products from the community',
    btnAddBiz:'Add Business', btnPostReq:'Post Request', btnPostOff:'Post Offer',
    btnRegister:'Register Business', fabLabel:'Register your Business',
    all:'All', loading:'Loading…',
    modalBizTitle:'Register Your Business', fBizName:'Business Name', fOwner:'Owner Name',
    fCategory:'Category', fServiceType:'Service Type', fDesc:'Description', fPhone:'Phone',
    fEmail:'Email', fAddress:'Address', fWebsite:'Website / Social', fPhoto:'Business Photo / Logo',
    uploadHint:'Click to upload · JPG/PNG · max 5 MB',
    bannerTitle:'Get Featured in the Banner!',
    bannerDesc:'Promote your business at the top of every page for <strong>30 days</strong> — $29.99 USD via PayPal.',
    bannerCheck:'Yes! Feature my business — <strong>$29.99 USD</strong> / 30 days',
    bannerNote:"After registration you'll be redirected to PayPal. Banner goes live after admin approval (within 24 hours).",
    btnSubmitBiz:'Register Business', modalReqTitle:'Post a Service Request',
    reqHint:'Tell the community what you need. Listing expires in 60 days.',
    fReqTitle:'Request Title', fBudgetMin:'Budget Min (MXN)', fBudgetMax:'Budget Max (MXN)',
    fYourName:'Your Name', fEmailOpt:'Email (optional)', btnPostReqSubmit:'Post Request',
    modalOffTitle:'Post an Offer', offHint:'Offer your services or products. Expires in 60 days.',
    fOffTitle:'Offer Title', fPrice:'Price (MXN)', fBizYourName:'Business / Your Name',
    fPhotoOpt:'Photo (optional)', btnPostOffSubmit:'Post Offer',
    modalArchTitle:'Archived Posts', archHint:'Search expired posts kept for 60 additional days.',
    btnSearch:'Search', archEmpty:'Enter a search term', archEmptySub:'Search through archived posts',
    noBizFound:'No businesses found', noBizFoundSub:'Try a different search — or be the first to register!',
    noReq:'No requests found', noReqSub:'Be the first to post what you need!',
    noOff:'No offers yet', noOffSub:'Post your first offer!',
    noArch:'No archived results', noArchSub:'Nothing found for',
    budget:'Budget', price:'Price', negotiable:'Negotiable', priceOnRequest:'Price on request',
    dLeft:'d left', share:'Share', linkCopied:'Link copied!',
    errRequired:'Please fill in all required fields.',
    errNetwork:'Network error — please check your connection and try again.',
    submitting:'Registering…', submitBizOk:'Business registered! It will appear in the directory shortly.',
    submitBizBannerOk:'Business registered! Click below to complete your PayPal payment.',
    submitFail:'Registration failed. Please try again.',
    posting:'Posting…', submitReqOk:'Request posted! Visible for 60 days.',
    submitOffOk:'Offer posted! Visible for 60 days.', postFail:'Failed to post. Please try again.',
    justNow:'Just now', ago:'ago', archived:'Archived',
    footerTagline:'The official business directory and marketplace for the Santa Fe Tijuana community.',
    footerRights:'All rights reserved.',
    footerExpiry:'Listings expire after 60 days · Archived items kept 60 additional days',
    footerBy:'Designed by YATELASA',
    catOptSel:'Select category…', REQUEST:'REQUEST', OFFER:'OFFER', ARCHIVED_LABEL:'ARCHIVED',
    dtPhone:'Phone', dtEmail:'Email', dtAddress:'Address', dtWebsite:'Website',
    dtBudget:'Budget', dtPrice:'Price', dtExpires:'Expires', dtCategory:'Category',
    dtPosted:'Posted', dtContact:'Contact',
    btnCall:'Call', btnWA:'WhatsApp', btnWeb:'Website', btnShareDet:'Share',
    dtYourBiz:'Your Business Here', dtYourBizCat:'$29.99/mo · Click to feature',
    errLoadBiz:'Could not load businesses.', retryBtn:'Try again',
    dtBusiness:'Business', featuredBadge:'Featured',
    aboutHero:'About Santa Fe Tijuana', aboutSub:'The story behind the community',
    featuredTitle:'Supported by the community', featuredSub:'Businesses that invest in visibility to better serve Santa Fe Tijuana.',
    featuredUpsell:'Want to appear here? Feature your business for just', featuredUpsellBtn:'Feature my business',
    featPlaceholderType:'$29.99 USD · 30 days · PayPal', featPlaceholderDesc:'Be the first to get featured and reach every visitor of Santa Fe Tijuana.', featPlaceholderCta:'Feature now →',
    aHeroTitle:'Connecting our <span class="accent">community</span>',
    aHeroSub:'We are the community directory that connects local businesses with Santa Fe Tijuana residents — free, easy, and built to grow with you.',
    aMissionLabel:'Our Mission', aMissionTitle:'Making visible what already exists in Santa Fe',
    aMissionBody1:'Santa Fe Tijuana has incredible businesses, real talent, and a community that wants to support each other. The problem was always visibility: residents did not know what was available, and businesses had no place to advertise without spending on social media or flyers.',
    aMissionBody2:'We created this directory to solve exactly that — a free, clean, easy-to-use space where any business can be listed and any resident can find what they need.',
    aStatBiz:'Registered Businesses', aStatReq:'Active Requests', aStatOff:'Published Offers', aStatCats:'Categories',
    aValuesLabel:'Our Values', aValuesTitle:'What guides us every day',
    aValuesSub:'We built this platform with clear principles that go beyond technology.',
    aVal1Title:'Community First', aVal1Desc:'We are from Santa Fe Tijuana. Every decision we make is designed to benefit local residents and businesses — not outside investors.',
    aVal2Title:'Free Access', aVal2Desc:'Registering your business, posting requests, and creating offers is completely free. It always will be. Our model is sustainable through optional banners.',
    aVal3Title:'Quality & Trust', aVal3Desc:'We review every registration to maintain directory quality. Verified businesses generate more trust and more customers for the whole community.',
    aVal4Title:'Local Growth', aVal4Desc:'Every business that registers helps the entire local economy. More visibility means more customers, more jobs, and a more prosperous community.',
    aVal5Title:'Bilingual', aVal5Desc:'Santa Fe Tijuana is a diverse community. That is why our platform works equally well in Spanish and English — no language barriers.',
    aVal6Title:'Easy to Share', aVal6Desc:'Every business, request, and offer has its own direct link. Share via WhatsApp, Instagram, or wherever you want with one click.',
    aOriginLabel:'The Origin', aOriginTitle:'Born from a real need',
    aOriginBody1:'It all started when a Santa Fe resident needed a plumber and did not know who to call. There was no local directory, no organized group, no easy way to find services in the neighborhood.',
    aOriginBody2:'At the same time, there were plumbers, electricians, seamstresses, and cooks in Santa Fe with no way to advertise beyond posting flyers on poles.',
    aOriginBody3:'The solution was simple: create the space Santa Fe Tijuana deserved. A place where both sides — the seeker and the provider — could easily find each other.',
    aTeamLabel:'The Team', aTeamTitle:'Made by neighbors, for neighbors',
    aTeamSub:'We are a small team committed to making Santa Fe Tijuana a more connected and prosperous community.',
    aTeam1Role:'Founder & Development', aTeam2Name:'SFT Community', aTeam2Role:'Businesses & Residents',
    aTeam3Name:'Your spot here', aTeam3Role:'Join the team',
    aFaqLabel:'Frequently Asked Questions', aFaqTitle:'Everything you need to know',
    aCtaTitle:'Do you have a business in Santa Fe?', aCtaSub:'Register it for free today and start connecting with your community.',
    aCollabTitle:'Want to collaborate?', aCollabDesc:'Write to us and let\'s build something great together.', aCollabBtn:'Contact us',
  },
  es: {
    portalSub:'Directorio Comunitario', heroBadge:'SANTA FE TIJUANA · DIRECTORIO OFICIAL',
    heroLine1:'En Santa Fe', heroLine2:'Lo Tenemos Todo',
    heroTagline:'Conecta · Publica · Cotiza · Crece',
    heroSub:'Tu plataforma confiable para anunciar negocios, ofrecer servicios y solicitar cotizaciones en la comunidad Santa Fe Tijuana.',
    statBiz:'Negocios', statReq:'Solicitudes', statOff:'Ofertas Activas',
    ctaRegister:'Registra tu Negocio', ctaDir:'Ver Directorio', scrollLabel:'VER DIRECTORIO',
    howLabel:'Cómo funciona', howTitle:'Simple, rápido y gratuito',
    howSub:'Tres pasos para conectar con toda la comunidad de Santa Fe Tijuana.',
    step1Title:'Registra tu Negocio', step1Desc:'Crea tu ficha gratuita en menos de 2 minutos. Sube fotos, agrega tu teléfono y descripción de servicios.', step1Cta:'Registrar ahora',
    step2Title:'Publica o Solicita', step2Desc:'¿Necesitas un servicio? Publica tu solicitud. ¿Tienes algo que ofrecer? Crea tu anuncio gratis con fotos y precio.', step2Cta:'Publicar solicitud',
    step3Title:'Conecta y Crece', step3Desc:'Comparte tu ficha por WhatsApp, recibe llamadas directas y hazte visible en toda la comunidad 24/7.', step3Cta:'Explorar directorio',
    catsLabel:'Categorías', catsTitle:'Encuentra lo que buscas', catsViewAll:'Ver todo',
    photosLabel:'La comunidad', photosTitle:'Santa Fe Tijuana en acción',
    photo1:'Negocios Locales', photo2:'Servicios a Domicilio', photo3:'Gastronomía Local', photo4:'Belleza y Cuidado', photo5:'Reparaciones del Hogar',
    trustLabel:'Testimonios', trustTitle:'Lo que dice la comunidad',
    quote1:'"Registré mi negocio de tamales en 5 minutos y esa misma semana tuve 3 pedidos nuevos."',
    quote2:'"Publiqué una solicitud y al día siguiente ya tenía 4 personas contactándome."',
    quote3:'"El banner destacado valió cada centavo. Mi salón ahora tiene visibilidad permanente."',
    trustBiz1:'Tamales La Esperanza', trustBiz2:'Residente Santa Fe', trustBiz3:'Studio Belleza AR',
    ctaBannerTitle:'¿Listo para crecer?',
    ctaBannerSub:'Únete a cientos de negocios que ya forman parte del directorio más completo de Santa Fe Tijuana.',
    featuredBiz:'Negocios Destacados', tabDir:'Directorio', tabReq:'Solicitudes', tabOff:'Ofertas y Productos',
    navDir:'Directorio', navReq:'Solicitudes', navOff:'Ofertas', navAbout:'Nosotros', navRegister:'Registrar Negocio',
    onboardTitle:'¿Tienes un negocio en Santa Fe Tijuana?',
    onboardSub:'Regístralo gratis y llega a toda la comunidad. Solo toma 2 minutos.', onboardCta:'Registrar gratis',
    dirTitle:'Directorio de Negocios', dirDesc:'Los más recientes primero · Actualizado hoy',
    reqTitle:'Solicitudes de Servicio', reqDesc:'Personas buscando servicios · Expira en 60 días',
    offTitle:'Ofertas y Productos', offDesc:'Servicios y productos de la comunidad',
    btnAddBiz:'Agregar Negocio', btnPostReq:'Publicar Solicitud', btnPostOff:'Publicar Oferta',
    btnRegister:'Registrar Negocio', fabLabel:'Registra tu Negocio',
    all:'Todos', loading:'Cargando…',
    modalBizTitle:'Registra Tu Negocio', fBizName:'Nombre del Negocio', fOwner:'Nombre del Dueño',
    fCategory:'Categoría', fServiceType:'Tipo de Servicio', fDesc:'Descripción', fPhone:'Teléfono',
    fEmail:'Correo', fAddress:'Dirección', fWebsite:'Sitio Web / Redes', fPhoto:'Foto del Negocio / Logo',
    uploadHint:'Haz clic para subir · JPG/PNG · máx 5 MB',
    bannerTitle:'¡Destaca tu Negocio en el Banner!',
    bannerDesc:'Promociona tu negocio en la parte superior de cada página por <strong>30 días</strong> — $29.99 USD vía PayPal.',
    bannerCheck:'¡Sí! Destacar mi negocio — <strong>$29.99 USD</strong> / 30 días',
    bannerNote:'Al registrarte serás redirigido a PayPal. Tu banner se activa tras la aprobación (normalmente en 24 horas).',
    btnSubmitBiz:'Registrar Negocio', modalReqTitle:'Publicar Solicitud de Servicio',
    reqHint:'Dile a la comunidad qué necesitas. La publicación expira en 60 días.',
    fReqTitle:'Título de la Solicitud', fBudgetMin:'Presupuesto Mín (MXN)', fBudgetMax:'Presupuesto Máx (MXN)',
    fYourName:'Tu Nombre', fEmailOpt:'Correo (opcional)', btnPostReqSubmit:'Publicar Solicitud',
    modalOffTitle:'Publicar Oferta o Producto', offHint:'Ofrece tus servicios o productos a la comunidad. Expira en 60 días.',
    fOffTitle:'Título de la Oferta', fPrice:'Precio (MXN)', fBizYourName:'Negocio / Tu Nombre',
    fPhotoOpt:'Foto (opcional)', btnPostOffSubmit:'Publicar Oferta',
    modalArchTitle:'Publicaciones Archivadas', archHint:'Busca publicaciones expiradas conservadas 60 días adicionales.',
    btnSearch:'Buscar', archEmpty:'Ingresa un término', archEmptySub:'Busca entre publicaciones archivadas',
    noBizFound:'No se encontraron negocios', noBizFoundSub:'Intenta otra búsqueda — ¡o sé el primero en registrarse!',
    noReq:'No se encontraron solicitudes', noReqSub:'¡Sé el primero en publicar!',
    noOff:'Aún no hay ofertas', noOffSub:'¡Publica tu primera oferta!',
    noArch:'Sin resultados archivados', noArchSub:'Nada encontrado para',
    budget:'Presupuesto', price:'Precio', negotiable:'Negociable', priceOnRequest:'Precio a convenir',
    dLeft:'d restantes', share:'Compartir', linkCopied:'¡Enlace copiado!',
    errRequired:'Por favor completa todos los campos requeridos.',
    errNetwork:'Error de red — verifica tu conexión e intenta de nuevo.',
    submitting:'Registrando…', submitBizOk:'¡Negocio registrado! Aparecerá en el directorio en breve.',
    submitBizBannerOk:'¡Negocio registrado! Haz clic abajo para completar tu pago en PayPal.',
    submitFail:'Error al registrar. Por favor intenta de nuevo.',
    posting:'Publicando…', submitReqOk:'¡Solicitud publicada! Será visible por 60 días.',
    submitOffOk:'¡Oferta publicada! Será visible por 60 días.', postFail:'Error al publicar. Intenta de nuevo.',
    justNow:'Ahora mismo', ago:'', archived:'Archivado',
    footerTagline:'El directorio oficial de negocios y mercado de la comunidad Santa Fe Tijuana.',
    footerRights:'Todos los derechos reservados.',
    footerExpiry:'Las publicaciones expiran en 60 días · Los archivados se conservan 60 días adicionales',
    footerBy:'Diseñado por YATELASA',
    catOptSel:'Selecciona categoría…', REQUEST:'SOLICITUD', OFFER:'OFERTA', ARCHIVED_LABEL:'ARCHIVADO',
    dtPhone:'Teléfono', dtEmail:'Correo', dtAddress:'Dirección', dtWebsite:'Sitio Web',
    dtBudget:'Presupuesto', dtPrice:'Precio', dtExpires:'Expira', dtCategory:'Categoría',
    dtPosted:'Publicado', dtContact:'Contacto',
    btnCall:'Llamar', btnWA:'WhatsApp', btnWeb:'Sitio Web', btnShareDet:'Compartir',
    dtYourBiz:'Tu Negocio Aquí', dtYourBizCat:'$29.99/mes · Clic para destacar',
    errLoadBiz:'No se pudieron cargar los negocios.', retryBtn:'Reintentar',
    dtBusiness:'Negocio', featuredBadge:'Destacado',
    aboutHero:'Acerca de Santa Fe Tijuana', aboutSub:'La historia detrás de la comunidad',
    featuredTitle:'Apoyados por la comunidad', featuredSub:'Los negocios que invierten en visibilidad para servir mejor a Santa Fe Tijuana.',
    featuredUpsell:'¿Quieres aparecer aquí? Destaca tu negocio por solo', featuredUpsellBtn:'Destacar mi negocio',
    featPlaceholderType:'$29.99 USD · 30 días · PayPal', featPlaceholderDesc:'Sé el primero en destacarse y llega a todos los visitantes de Santa Fe Tijuana.', featPlaceholderCta:'Destacar ahora →',
    aHeroTitle:'Conectando a <span class="accent">nuestra comunidad</span>',
    aHeroSub:'Somos el directorio comunitario que une a los negocios locales con los vecinos de Santa Fe Tijuana — gratis, fácil y construido para crecer contigo.',
    aMissionLabel:'Nuestra Misión', aMissionTitle:'Hacer visible lo que ya existe en Santa Fe',
    aMissionBody1:'Santa Fe Tijuana tiene negocios increíbles, talento real y una comunidad que quiere apoyarse. El problema siempre fue la visibilidad: los vecinos no sabían qué había disponible, y los negocios no tenían dónde anunciarse sin gastar en redes sociales o volantes.',
    aMissionBody2:'Creamos este directorio para resolver exactamente eso — un espacio gratuito, limpio y fácil de usar donde cualquier negocio puede publicarse y cualquier vecino puede encontrar lo que necesita.',
    aStatBiz:'Negocios Registrados', aStatReq:'Solicitudes Activas', aStatOff:'Ofertas Publicadas', aStatCats:'Categorías',
    aValuesLabel:'Nuestros Valores', aValuesTitle:'Lo que nos guía cada día',
    aValuesSub:'Construimos esta plataforma con principios claros que van más allá de la tecnología.',
    aVal1Title:'Comunidad Primero', aVal1Desc:'Somos de Santa Fe Tijuana. Cada decisión que tomamos está pensada para beneficiar a los vecinos y negocios locales — no a inversionistas externos.',
    aVal2Title:'Acceso Gratuito', aVal2Desc:'Registrar tu negocio, publicar solicitudes y crear ofertas es completamente gratis. Siempre lo será. Nuestro modelo es sostenible a través de banners opcionales.',
    aVal3Title:'Calidad y Confianza', aVal3Desc:'Revisamos cada registro para mantener la calidad del directorio. Los negocios verificados generan más confianza y más clientes para toda la comunidad.',
    aVal4Title:'Crecimiento Local', aVal4Desc:'Cada negocio que se registra ayuda a toda la economía local. Más visibilidad significa más clientes, más empleos y una comunidad más próspera.',
    aVal5Title:'Bilingüe', aVal5Desc:'Santa Fe Tijuana es una comunidad diversa. Por eso nuestra plataforma funciona igual de bien en español que en inglés — sin barreras de idioma.',
    aVal6Title:'Fácil de Compartir', aVal6Desc:'Cada negocio, solicitud y oferta tiene su propio enlace directo. Comparte por WhatsApp, Instagram o donde quieras con un solo clic.',
    aOriginLabel:'El Origen', aOriginTitle:'Nació de una necesidad real',
    aOriginBody1:'Todo empezó cuando un vecino de Santa Fe necesitaba un plomero y no sabía a quién llamar. No había ningún directorio local, ningún grupo organizado, ninguna forma fácil de encontrar servicios en la colonia.',
    aOriginBody2:'Al mismo tiempo, había plomeros, electricistas, costureras y cocineras en Santa Fe sin manera de anunciarse más allá de pegar carteles en postes.',
    aOriginBody3:'La solución fue simple: crear el espacio que Santa Fe Tijuana merecía. Un lugar donde los dos lados — el que busca y el que ofrece — pudieran encontrarse fácilmente.',
    aTeamLabel:'El Equipo', aTeamTitle:'Hecho por vecinos, para vecinos',
    aTeamSub:'Somos un equipo pequeño pero comprometido con hacer de Santa Fe Tijuana una comunidad más conectada y próspera.',
    aTeam1Role:'Fundador y Desarrollo', aTeam2Name:'Comunidad SFT', aTeam2Role:'Negocios y Vecinos',
    aTeam3Name:'Tu lugar aquí', aTeam3Role:'Únete al equipo',
    aFaqLabel:'Preguntas Frecuentes', aFaqTitle:'Todo lo que necesitas saber',
    aCtaTitle:'¿Tienes un negocio en Santa Fe?', aCtaSub:'Regístralo gratis hoy y empieza a conectar con tu comunidad.',
    aCollabTitle:'¿Quieres colaborar?', aCollabDesc:'Escríbenos y hagamos algo grande juntos.', aCollabBtn:'Contáctanos',
  }
};

function T(k) { return (STRINGS[LANG] || STRINGS.es)[k] || k; }

function setLang(lang) {
  LANG = lang;
  const root = document.getElementById('htmlRoot');
  if (root) root.lang = lang;
  const en = document.getElementById('langEN'), es = document.getElementById('langES');
  if (en) en.classList.toggle('active', lang === 'en');
  if (es) es.classList.toggle('active', lang === 'es');
  document.querySelectorAll('[data-t]').forEach(el => {
    const v = T(el.dataset.t);
    if (v.includes('<')) el.innerHTML = v; else el.textContent = v;
  });
  if (typeof onLangChange === 'function') onLangChange();
}

/* ════ BRANDING ════ */
function applyBranding() {
  if (SFT.FAVICON_URL) {
    const tag = document.getElementById('faviconTag');
    if (tag) tag.href = SFT.FAVICON_URL;
  }
  if (SFT.LOGO_URL) {
    const wrap = document.getElementById('logoIconWrap');
    if (wrap) {
      wrap.innerHTML = '';
      const img = document.createElement('img');
      img.src = SFT.LOGO_URL; img.alt = SFT.SITE_NAME;
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;';
      wrap.appendChild(img);
    }
  }
}

/* ════ CAT ICONS ════ */
const CAT_ICONS = {
  'Food & Beverages':'ic-food','Beauty & Personal Care':'ic-scissors',
  'Home Services':'ic-wrench','Auto Services':'ic-car',
  'Health & Wellness':'ic-heart','Education & Tutoring':'ic-book',
  'Technology & IT':'ic-monitor','Professional Services':'ic-briefcase',
  'Arts & Crafts':'ic-star','Fashion & Clothing':'ic-tag',
  'Entertainment':'ic-star','Retail & Shopping':'ic-tag',
  'Construction & Repairs':'ic-wrench','Transportation':'ic-car',
  'Pet Services':'ic-heart','Other':'ic-building'
};
function catIcon(cat) { return CAT_ICONS[cat] || 'ic-building'; }

/* ════ CATEGORY TRANSLATIONS ════
   Category values stored in the sheet / sent to the API are always the
   English canonical names below (must match CATEGORIES in Code.gs and
   the keys of CAT_ICONS). CAT_LABELS provides the DISPLAY label only —
   filter chips, select options, and category tags show the translated
   label while filtering/storage still use the English key. */
const CAT_LABELS = {
  en: {
    'Food & Beverages':'Food & Beverages','Beauty & Personal Care':'Beauty & Personal Care',
    'Home Services':'Home Services','Auto Services':'Auto Services',
    'Health & Wellness':'Health & Wellness','Education & Tutoring':'Education & Tutoring',
    'Technology & IT':'Technology & IT','Arts & Crafts':'Arts & Crafts',
    'Fashion & Clothing':'Fashion & Clothing','Professional Services':'Professional Services',
    'Entertainment':'Entertainment','Retail & Shopping':'Retail & Shopping',
    'Construction & Repairs':'Construction & Repairs','Transportation':'Transportation',
    'Pet Services':'Pet Services','Other':'Other'
  },
  es: {
    'Food & Beverages':'Comida y Bebidas','Beauty & Personal Care':'Belleza y Cuidado Personal',
    'Home Services':'Servicios para el Hogar','Auto Services':'Servicios Automotrices',
    'Health & Wellness':'Salud y Bienestar','Education & Tutoring':'Educación y Tutorías',
    'Technology & IT':'Tecnología e Informática','Arts & Crafts':'Arte y Manualidades',
    'Fashion & Clothing':'Moda y Ropa','Professional Services':'Servicios Profesionales',
    'Entertainment':'Entretenimiento','Retail & Shopping':'Tiendas y Comercio',
    'Construction & Repairs':'Construcción y Reparaciones','Transportation':'Transporte',
    'Pet Services':'Servicios para Mascotas','Other':'Otro'
  }
};
// Translate a category's canonical (English) name into the current language's
// display label. Falls back to the raw value if the category is unrecognized
// (e.g. a legacy/custom category not in the map).
function T_CAT(cat) {
  if (!cat) return '';
  const map = CAT_LABELS[LANG] || CAT_LABELS.es;
  return map[cat] || cat;
}
function svgIcon(id, size, cls) {
  /* cls can be a CSS class name OR a hex/rgba color string for direct styling */
  const isColor = cls && (cls.startsWith('#') || cls.startsWith('rgba') || cls.startsWith('rgb') || cls.startsWith('var('));
  const colorAttr = isColor ? ` style="color:${cls}"` : '';
  const classAttr = (!isColor && cls) ? ` class="${cls}"` : '';
  return `<svg width="${size}" height="${size}"${classAttr}${colorAttr}><use href="#${id}"/></svg>`;
}

/* ════ MODALS ════ */
function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.remove('open');
  document.body.style.overflow = '';
  if (id === 'modalBusiness') {
    const pp = document.getElementById('paypalBtn');
    if (pp) { pp.style.display = 'none'; pp.href = '#'; }
    const r = document.getElementById('bizResult');
    if (r) { r.className = 'submit-result'; r.textContent = ''; }
    const btn = document.getElementById('btnSubmitBiz');
    if (btn) setBtnState(btn, false, null);
  }
}
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) closeModal(m.id); });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
      if (typeof closeDetail === 'function') closeDetail();
    }
  });
});

/* ════ FORM HELPERS ════ */
function setBtnState(btn, disabled, text) {
  if (!btn) return;
  btn.disabled = disabled;
  if (text !== null) {
    const span = btn.querySelector('span[data-t]');
    if (span) span.textContent = text;
  }
}
function gv(id) { return (document.getElementById(id)?.value || '').trim(); }
function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function safeUrl(url) {
  if (!url) return '#';
  const u = url.trim();
  return /^https?:\/\//i.test(u) ? u : 'https://' + u;
}
function emptyHtml(iconId, title, msg) {
  return `<div class="empty-state">
    <div class="empty-state-icon"><svg width="24" height="24" style="color:rgba(30,30,30,0.38)"><use href="#${iconId}"/></svg></div>
    <h3>${title}</h3><p>${msg}</p>
  </div>`;
}
function timeAgo(d) {
  if (!d) return '';
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return T('justNow');
  if (m < 60) return m + 'm';
  const h = Math.floor(m / 60); if (h < 24) return h + 'h';
  const dy = Math.floor(h / 24); if (dy < 30) return dy + 'd';
  return Math.floor(dy / 30) + 'mo';
}
function showResult(id, type, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'submit-result ' + type;
  el.textContent = msg;
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function showProgress(p, pct) {
  const w = document.getElementById(p + '_progress'), b = document.getElementById(p + '_bar');
  if (w && b) { w.style.display = 'block'; b.style.width = pct + '%'; }
}
function hideProgress(p) { const w = document.getElementById(p + '_progress'); if (w) w.style.display = 'none'; }
function toggleBannerNote() {
  const n = document.getElementById('bannerNote'), cb = document.getElementById('biz_banner');
  if (n && cb) n.style.display = cb.checked ? 'block' : 'none';
}
function previewImg(input, prevId, delId) {
  if (!input.files?.length) return;
  const r = new FileReader();
  r.onload = e => {
    const img = document.getElementById(prevId);
    if (img) { img.src = e.target.result; img.style.display = 'block'; }
    const d = document.getElementById(delId);
    if (d) d.classList.add('show');
  };
  r.readAsDataURL(input.files[0]);
}
function clearImg(prefix) {
  const i = document.getElementById(prefix + '_img');
  const p = document.getElementById(prefix + '_prev');
  const d = document.getElementById(prefix + '_del');
  if (i) i.value = '';
  if (p) { p.src = ''; p.style.display = 'none'; }
  if (d) d.classList.remove('show');
}
async function getBase64(inputId) {
  const input = document.getElementById(inputId);
  if (!input?.files?.length) return null;
  return new Promise(resolve => {
    const r = new FileReader();
    r.onerror = () => resolve(null); // FileReader failed — never hang
    r.onload = e => {
      const img = new Image();
      img.onerror = () => resolve(null); // bad/unsupported image format
      img.onload = () => {
        try {
          const MAX = 1400; let { width: w, height: h } = img;
          if (w > MAX || h > MAX) { const ratio = MAX / Math.max(w, h); w = Math.round(w * ratio); h = Math.round(h * ratio); }
          const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        } catch (err) { resolve(null); }
      };
      img.src = e.target.result;
    };
    r.readAsDataURL(input.files[0]);
  });
}

/* ════ SHARE ════ */
function shareItem(type, slug, title) {
  const base = window.location.origin;
  const url = base + '/directory.html?' + type + '=' + encodeURIComponent(slug);
  if (navigator.share) {
    navigator.share({ title: title + ' — ' + SFT.SITE_NAME, url }).catch(() => copyUrl(url));
  } else { copyUrl(url); }
}
function copyUrl(url) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => showToast(T('linkCopied'))).catch(() => fallbackCopy(url));
  } else { fallbackCopy(url); }
}
function fallbackCopy(url) {
  const t = document.createElement('textarea'); t.value = url;
  document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t);
  showToast(T('linkCopied'));
}
function showToast(msg) {
  const t = document.getElementById('shareToast');
  if (!t) return;
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

/* ════ POPULATE CATEGORY SELECTS ════ */
function populateCategorySelects(categories) {
  ['biz_category', 'req_category', 'off_category'].forEach(id => {
    const el = document.getElementById(id); if (!el) return;
    const prev = el.value;
    el.innerHTML = '<option value="">' + T('catOptSel') + '</option>';
    categories.forEach(c => {
      const o = document.createElement('option');
      o.value = c;            // canonical English value — used for storage/filtering
      o.textContent = T_CAT(c); // translated display label
      el.appendChild(o);
    });
    if (prev) el.value = prev;
  });
}

/* ════ SUBMIT FORMS ════ */
async function submitBusiness(btn) {
  const name=gv('biz_name'),owner=gv('biz_owner'),cat=gv('biz_category'),service=gv('biz_service'),desc=gv('biz_desc'),phone=gv('biz_phone'),email=gv('biz_email');
  if (!name||!owner||!cat||!service||!desc||!phone||!email) { showResult('bizResult','error',T('errRequired')); return; }
  setBtnState(btn,true,T('submitting'));
  showProgress('biz', 20);

  /* Read + resize image to max 1400px, JPEG 82% quality (returns null if no file) */
  const img64 = await getBase64('biz_img');
  showProgress('biz', 50);

  /* Single POST via XHR — sends imageBase64 + all fields together.
     XHR re-sends the body through GAS redirect chains; fetch does not.
     GAS registerBusiness calls uploadImage() internally and stores the lh3 URL. */
  const res = await api('registerBusiness', {
    businessName: name,
    ownerName:    owner,
    category:     cat,
    serviceType:  service,
    description:  desc,
    phone,
    email,
    website:      gv('biz_website'),
    address:      gv('biz_address'),
    imageBase64:  img64 || null,
    wantsBanner:  document.getElementById('biz_banner')?.checked
  });
  showProgress('biz', 100);
  setBtnState(btn, false, null);

  if (res.success) {
    if (res.redirectToBanner && res.paypalUrl) {
      showResult('bizResult','success',T('submitBizBannerOk'));
      const pp = document.getElementById('paypalBtn');
      if (pp) { pp.href = res.paypalUrl; pp.style.display = 'flex'; pp.scrollIntoView({behavior:'smooth',block:'nearest'}); }
    } else {
      showResult('bizResult','success',T('submitBizOk'));
      setTimeout(() => { closeModal('modalBusiness'); if (typeof loadBiz==='function') loadBiz(); }, 2800);
    }
  } else { showResult('bizResult','error',res.error||T('submitFail')); }
  setTimeout(() => hideProgress('biz'), 1500);
}

async function submitRequest(btn) {
  const title=gv('req_title'),cat=gv('req_category'),desc=gv('req_desc'),name=gv('req_name'),phone=gv('req_phone');
  if (!title||!cat||!desc||!name||!phone) { showResult('reqResult','error',T('errRequired')); return; }
  setBtnState(btn,true,T('posting'));
  const res = await api('postRequest',{title,category:cat,description:desc,budgetMin:gv('req_min')||0,budgetMax:gv('req_max')||0,contactName:name,contactPhone:phone,contactEmail:gv('req_email')});
  setBtnState(btn,false,null);
  if (res.success) {
    showResult('reqResult','success',T('submitReqOk'));
    setTimeout(() => { closeModal('modalRequest'); if (typeof loadReq==='function') loadReq(); }, 2800);
  } else { showResult('reqResult','error',res.error||T('postFail')); }
}

async function submitOffer(btn) {
  const title=gv('off_title'),cat=gv('off_category'),desc=gv('off_desc'),biz=gv('off_biz'),phone=gv('off_phone');
  if (!title||!cat||!desc||!biz||!phone) { showResult('offResult','error',T('errRequired')); return; }
  setBtnState(btn,true,T('posting'));
  showProgress('off',30);
  const img64 = await getBase64('off_img');
  showProgress('off',70);
  const res = await api('postOffer',{title,category:cat,description:desc,price:gv('off_price')||0,businessName:biz,contactPhone:phone,contactEmail:gv('off_email'),imageBase64:img64});
  showProgress('off',100);
  setBtnState(btn,false,null);
  if (res.success) {
    showResult('offResult','success',T('submitOffOk'));
    setTimeout(() => { closeModal('modalOffer'); if (typeof loadOff==='function') loadOff(); }, 2800);
  } else { showResult('offResult','error',res.error||T('postFail')); }
  setTimeout(() => hideProgress('off'), 1500);
}

async function searchArchive() {
  const q = gv('arch_query'), type = gv('arch_type');
  if (!q) return;
  document.getElementById('archResults').innerHTML = '<div class="loading"><div class="spinner"></div><span>' + T('loading') + '</span></div>';
  const r = await api('searchArchived', { query: q, type });
  if (!r.success || !r.data?.length) {
    document.getElementById('archResults').innerHTML = emptyHtml('ic-archive', T('noArch'), T('noArchSub') + ' "' + esc(q) + '"');
    return;
  }
  document.getElementById('archResults').innerHTML = r.data.map(item => `
    <div class="arch-item">
      <div class="arch-item-type">${T('ARCHIVED_LABEL')}</div>
      <div class="arch-item-title">${esc(item.title)}</div>
      <div class="arch-item-desc">${esc(item.description)}</div>
    </div>`).join('');
}

/* ════ NAV ACTIVE STATE ════ */
function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-page-link').forEach(a => {
    const href = a.getAttribute('href') || '';
    const isActive = href.includes(path) || (path === 'index.html' && href === 'index.html') || (path === '' && href === 'index.html');
    a.classList.toggle('active', isActive);
  });
}

/* ════ DETAIL OVERLAY ════ */
function openDetail(type, item, allItems) {
  if (!item) return;
  const ov = document.getElementById('detailOverlay');
  if (!ov) return;
  const hero = document.getElementById('dtHero');
  const oldImg = hero.querySelector('img.detail-img');
  if (oldImg) oldImg.remove();
  const iconEl = document.getElementById('dtIcon');
  const imgUrl = item.imageUrl || '';
  const iconId = type==='biz'?catIcon(item.category||''):type==='req'?'ic-clipboard':'ic-tag';
  if (imgUrl) {
    const img = document.createElement('img');
    img.className = 'detail-img'; img.src = imgUrl; img.alt = '';
    img.onerror = () => { img.remove(); iconEl.innerHTML = svgIcon(iconId, 28, '#fff'); };
    hero.insertBefore(img, hero.querySelector('.detail-close-btn'));
    iconEl.innerHTML = '';
  } else {
    iconEl.innerHTML = svgIcon(iconId, 28, '#fff');
  }
  let badge = hero.querySelector('.detail-type-badge');
  if (!badge) { badge = document.createElement('div'); badge.className = 'detail-type-badge'; hero.insertBefore(badge, hero.querySelector('.detail-close-btn')); }
  badge.className = 'detail-type-badge ' + (type==='biz'?'dtb-biz':type==='req'?'dtb-req':'dtb-off');
  badge.textContent = type==='biz'?'Negocio':type==='req'?T('REQUEST'):T('OFFER');
  document.getElementById('dtName').textContent = item.businessName || item.title || '';
  document.getElementById('dtSub').textContent = type==='biz'?(item.serviceType||T_CAT(item.category)||''):(T_CAT(item.category)||'');
  document.getElementById('dtDesc').textContent = item.description || '';
  const metaItems = [];
  if (type === 'biz') {
    if (item.phone) metaItems.push([T('dtPhone'), `<a href="tel:${esc(item.phone)}">${esc(item.phone)}</a>`]);
    if (item.email) metaItems.push([T('dtEmail'), `<a href="mailto:${esc(item.email)}">${esc(item.email)}</a>`]);
    if (item.address) metaItems.push([T('dtAddress'), esc(item.address)]);
    if (item.website) metaItems.push([T('dtWebsite'), `<a href="${safeUrl(item.website)}" target="_blank" rel="noopener">${esc(item.website)}</a>`]);
    if (item.category) metaItems.push([T('dtCategory'), esc(T_CAT(item.category))]);
    if (item.registeredDate) metaItems.push([T('dtPosted'), new Date(item.registeredDate).toLocaleDateString()]);
  } else if (type === 'req') {
    const budget = (item.budgetMin||item.budgetMax) ? `$${item.budgetMin||0}${item.budgetMax&&item.budgetMax!=item.budgetMin?' – $'+item.budgetMax:''} MXN` : T('negotiable');
    metaItems.push([T('dtBudget'), budget]);
    if (item.category) metaItems.push([T('dtCategory'), esc(T_CAT(item.category))]);
    metaItems.push([T('dtContact'), esc(item.contactName)]);
    if (item.contactPhone) metaItems.push([T('dtPhone'), `<a href="tel:${esc(item.contactPhone)}">${esc(item.contactPhone)}</a>`]);
    if (item.expiryDate) metaItems.push([T('dtExpires'), new Date(item.expiryDate).toLocaleDateString()]);
  } else {
    const price = item.price ? `$${Number(item.price).toLocaleString()} MXN` : T('priceOnRequest');
    metaItems.push([T('dtPrice'), price]);
    if (item.category) metaItems.push([T('dtCategory'), esc(T_CAT(item.category))]);
    if (item.businessName) metaItems.push([T('dtBusiness'), esc(item.businessName)]);
    if (item.contactPhone) metaItems.push([T('dtPhone'), `<a href="tel:${esc(item.contactPhone)}">${esc(item.contactPhone)}</a>`]);
    if (item.expiryDate) metaItems.push([T('dtExpires'), new Date(item.expiryDate).toLocaleDateString()]);
  }
  document.getElementById('dtMeta').innerHTML = metaItems.map(([l,v]) => `<div class="detail-meta-item"><div class="dmi-label">${l}</div><div class="dmi-val">${v}</div></div>`).join('');
  const actions = [];
  const slug = item.slug||item.id||'', nameStr = item.businessName||item.title||'';
  const typeKey = type==='biz'?'business':type==='req'?'request':'offer';
  const phone = item.phone||item.contactPhone||'';
  if (phone) actions.push(`<a class="btn btn-dark" href="tel:${esc(phone)}">${svgIcon('ic-phone',14,'#fff')} ${T('btnCall')}</a>`);
  if (phone) actions.push(`<a class="btn btn-crimson" href="https://wa.me/${phone.replace(/\D/g,'')}" target="_blank" rel="noopener">${svgIcon('ic-whatsapp',14,'#fff')} ${T('btnWA')}</a>`);
  if (type==='biz' && item.website) actions.push(`<a class="btn btn-dark" href="${safeUrl(item.website)}" target="_blank" rel="noopener">${svgIcon('ic-globe',14,'#fff')} ${T('btnWeb')}</a>`);
  actions.push(`<button class="btn btn-light" onclick="shareItem('${typeKey}','${esc(slug)}','${esc(nameStr)}')">${svgIcon('ic-share',14,'var(--black)')} ${T('btnShareDet')}</button>`);
  document.getElementById('dtActions').innerHTML = actions.join('');

  /* ── QR Code: only shown for businesses ───────────────────────
     Computed client-side using Google Chart API — no backend call.
     QR encodes the business page URL so scanning redirects to
     santafetijuana.com, driving all traffic through the website.
     Hidden for requests/offers since they are temporary listings.
  ─────────────────────────────────────────────────────────────── */
  var qrWrap = document.getElementById('dtQr');
  if (qrWrap) {
    if (type === 'biz' && slug) {
      var bizPageUrl = window.location.origin + '/directory.html?business=' + encodeURIComponent(slug);
      var qrSrc = 'https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=' +
                  encodeURIComponent(bizPageUrl) + '&choe=UTF-8&chld=M|2';
      qrWrap.innerHTML =
        '<div class="dt-qr-inner">' +
          '<img class="dt-qr-img" src="' + qrSrc + '" alt="QR ' + esc(nameStr) + '" loading="lazy">' +
          '<div class="dt-qr-label">' +
            '<div class="dt-qr-title">Comparte este negocio</div>' +
            '<div class="dt-qr-sub">Escanea para abrir en ' + SFT.SITE_NAME + '</div>' +
          '</div>' +
        '</div>';
      qrWrap.style.display = 'block';
    } else {
      qrWrap.style.display = 'none';
      qrWrap.innerHTML = '';
    }
  }

  ov.classList.add('open'); document.body.style.overflow = 'hidden';
}
function closeDetail() {
  const ov = document.getElementById('detailOverlay');
  if (ov) ov.classList.remove('open');
  document.body.style.overflow = '';
}
