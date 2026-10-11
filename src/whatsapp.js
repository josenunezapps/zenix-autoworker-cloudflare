// Build a WhatsApp click-to-chat link only for reasonably parseable Argentine phones.
// A telephone listing does not prove WhatsApp is active. Nothing is auto-sent.
export function argentinaWhatsAppNumber(phone){
 if(typeof phone!=='string'||phone.length>55||!phone.trim()||/[;\/]|(?:ext\.?|interno|anexo|int\.)/i.test(phone))return null;
 if(!/^\+?[\d()\s.-]+$/.test(phone))return null;
 let digits=phone.replace(/\D/g,'');
 if(digits.startsWith('00'))digits=digits.slice(2);
 if(digits.startsWith('0'))digits=digits.slice(1); // 011... => 11...
 if(!digits.startsWith('54'))digits='54'+digits;
 if(/^54\d{10}$/.test(digits)||/^549\d{10}$/.test(digits))return digits;
 return null;
}
export function whatsAppDraftUrl(phone,message){
 const digits=argentinaWhatsAppNumber(phone);
 if(!digits||typeof message!=='string'||!message.trim())return null;
 return 'https://wa.me/'+digits+'?text='+encodeURIComponent(message.slice(0,1200));
}
