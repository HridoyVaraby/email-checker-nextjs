/**
 * Disposable Email Domains List
 * 
 * This file contains a comprehensive list of disposable/temporary email domains
 * that are commonly used for spam or temporary accounts.
 */

export const disposableDomains: Set<string> = new Set([
  // Popular disposable email services
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.org',
  'guerrillamail.net',
  'guerrillamail.biz',
  'guerrillamail.de',
  'sharklasers.com',
  'grr.la',
  'pokemail.net',
  'spam4.me',
  
  // 10 Minute Mail variants
  '10minutemail.com',
  '10minutemail.net',
  '10minutemail.org',
  '10minutemail.co.uk',
  '10minutemail.de',
  '10minmail.com',
  '10mail.org',
  
  // Yopmail variants
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'cool.fr.nf',
  'nospam.ze.tc',
  'nomail.xl.cx',
  'mega.zik.dj',
  'speed.1s.fr',
  'courriel.fr.nf',
  
  // Temp Mail services
  'tempmail.com',
  'temp-mail.org',
  'temp-mail.io',
  'tempail.com',
  'tempr.email',
  'tempmailo.com',
  'tempmailaddress.com',
  
  // Throwaway Mail
  'throwawaymail.com',
  'throwaway.email',
  'throwam.com',
  
  // Fake Mail
  'fakeinbox.com',
  'fakemailgenerator.com',
  'fakemail.fr',
  'fakemailgenerator.net',
  
  // Maildrop
  'maildrop.cc',
  'maildrop.ml',
  
  // Other popular services
  'mailnesia.com',
  'mailnator.com',
  'getairmail.com',
  'dispostable.com',
  'spamgourmet.com',
  'trashmail.com',
  'trashmail.net',
  'trashmail.org',
  'trashmail.me',
  'mytrashmail.com',
  'mt2009.com',
  'thankyou2010.com',
  
  // Burner mail
  'burnermail.io',
  'burnermails.com',
  
  // Proton mail temp services
  'protonmail.com', // Note: While ProtonMail is legit, some businesses flag it
  
  // Anonymous mail
  'anonymbox.com',
  'anonymail.de',
  'anonymize.com',
  'anonymized.org',
  'anonymousemail.me',
  
  // Minute mail
  'minutemail.com',
  'minutemail.net',
  
  // Mohmal
  'mohmal.com',
  'mohmal.im',
  'mohmal.in',
  'mohmal.tech',
  
  // Getnada
  'getnada.com',
  'abyssmail.com',
  'boximail.com',
  'clrmail.com',
  'dropjar.com',
  'getairmail.com',
  'givmail.com',
  'inboxbear.com',
  'robot-mail.com',
  'tafmail.com',
  'vomoto.com',
  'zetmail.com',
  
  // Mailcatch
  'mailcatch.com',
  'sogetthis.com',
  'verifymail.win',
  
  // Email on Deck
  'emailondeck.com',
  
  // Receiveee
  'receiveee.com',
  
  // Tempinbox
  'tempinbox.com',
  'tempinbox.co.uk',
  
  // PookMail
  'pookmail.com',
  
  // SpamBox
  'spambox.us',
  'spambox.xyz',
  'spambox.irishspringrealty.com',
  
  // Incognitomail
  'incognitomail.com',
  'incognitomail.net',
  'incognitomail.org',
  
  // Crazymailing
  'crazymailing.com',
  
  // Discard email
  'discardmail.com',
  'discardmail.de',
  
  // Forward mail
  'fmail.co.uk',
  
  // Additional services
  'spamfree24.org',
  'spamfree24.de',
  'spamfree24.eu',
  'spamfree24.info',
  'spamfree24.net',
  'spamherelots.com',
  'spamhereplease.com',
  'spaml.com',
  'spaml.de',
  'spamoff.de',
  'spamslicer.com',
  'spamspot.com',
  'spamthis.co.uk',
  'spamthisplease.com',
  'superrito.com',
  'suremail.info',
  'teleworm.com',
  'teleworm.us',
  'tempemail.biz',
  'tempemail.com',
  'tempemail.net',
  'tempmail.de',
  'tempmail.eu',
  'tempmail.it',
  'tempmail.net',
  'tempmail.us',
  'tempomail.fr',
  'temporaryemail.net',
  'temporaryemail.us',
  'temporaryforwarding.com',
  'temporaryinbox.com',
  'thankyou2010.com',
  'thisisnotmyrealemail.com',
  'tm.slippery.email',
  'topranklist.de',
  'tradermail.info',
  'trash-amil.com',
  'trash-mail.at',
  'trash-mail.com',
  'trash-mail.de',
  'trash2009.com',
  'trashdevil.com',
  'trashdevil.de',
  'trashmail.at',
  'trashmail.de',
  'trashmail.ws',
  'trashmailer.com',
  'wegwerfmail.de',
  'wegwerfmail.net',
  'wegwerfmail.org',
  'willhackforfood.biz',
  'willselfdestruct.com',
  'wuzupmail.net',
  'xoxy.net',
  'yopmail.pp.ua',
  'zehnminuten.de',
  'zehnminutenmail.de',
  'zippymail.info',
  'zoaxe.com',
  'zoemail.net',
  'zoemail.org',
]);

/**
 * Check if an email domain is a known disposable email provider
 * @param domain - The email domain to check
 * @returns true if the domain is disposable
 */
export function isDisposableDomain(domain: string): boolean {
  return disposableDomains.has(domain.toLowerCase());
}
