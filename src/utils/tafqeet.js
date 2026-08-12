/**
 * Tafqeet Utility for Arabic & English Number-to-Words Conversion
 * Designed for Cheque Writing & Financial Documents
 */

const ARABIC_UNITS = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
const ARABIC_TEENS = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
const ARABIC_TENS = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
const ARABIC_HUNDREDS = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

function convertGroupArabic(num) {
  let result = '';
  const hundred = Math.floor(num / 100);
  const remainder = num % 100;
  const ten = Math.floor(remainder / 10);
  const unit = remainder % 10;

  if (hundred > 0) {
    result += ARABIC_HUNDREDS[hundred];
  }

  if (remainder > 0) {
    if (result.length > 0) result += ' و';
    if (remainder < 10) {
      result += ARABIC_UNITS[remainder];
    } else if (remainder >= 10 && remainder < 20) {
      result += ARABIC_TEENS[remainder - 10];
    } else {
      if (unit > 0) {
        result += ARABIC_UNITS[unit] + ' و';
      }
      result += ARABIC_TENS[ten];
    }
  }

  return result;
}

export function tafqeetArabic(num, currency = 'JOD') {
  if (isNaN(num) || num === null || num === undefined) return '';
  num = parseFloat(num);
  if (num === 0) return 'صفر';

  const integerPart = Math.floor(Math.abs(num));
  const decimalPart = Math.round((Math.abs(num) - integerPart) * 1000); // 3 decimals for Fils/Fractions

  let result = '';

  // Millions
  const millions = Math.floor(integerPart / 1000000);
  const thousands = Math.floor((integerPart % 1000000) / 1000);
  const ones = integerPart % 1000;

  let parts = [];

  if (millions > 0) {
    if (millions === 1) parts.push('مليون');
    else if (millions === 2) parts.push('مليونان');
    else if (millions >= 3 && millions <= 10) parts.push(convertGroupArabic(millions) + ' ملايين');
    else parts.push(convertGroupArabic(millions) + ' مليون');
  }

  if (thousands > 0) {
    if (thousands === 1) parts.push('ألف');
    else if (thousands === 2) parts.push('ألفان');
    else if (thousands >= 3 && thousands <= 10) parts.push(convertGroupArabic(thousands) + ' آلاف');
    else parts.push(convertGroupArabic(thousands) + ' ألف');
  }

  if (ones > 0) {
    parts.push(convertGroupArabic(ones));
  }

  result = parts.join(' و');

  // Currency Names (Arabic)
  const currencyNames = {
    JOD: { mainSingular: 'دينار أردني', mainPlural: 'دنانير أردنية', subSingular: 'فلس', subPlural: 'فلس' },
    USD: { mainSingular: 'دولار أمريكي', mainPlural: 'دولارات أمريكية', subSingular: 'سنت', subPlural: 'سنتاً' },
    SAR: { mainSingular: 'ريال سعودي', mainPlural: 'ريالات سعودية', subSingular: 'هللة', subPlural: 'هللة' },
    AED: { mainSingular: 'درهم إماراتي', mainPlural: 'دراهم إماراتية', subSingular: 'فلس', subPlural: 'فلس' },
    EGP: { mainSingular: 'جنيه مصري', mainPlural: 'جنيهات مصرية', subSingular: 'قرش', subPlural: 'قرش' },
    KWD: { mainSingular: 'دينار كويتي', mainPlural: 'دنانير كويتية', subSingular: 'فلس', subPlural: 'فلس' },
    EUR: { mainSingular: 'يورو', mainPlural: 'يورو', subSingular: 'سنت', subPlural: 'سنت' }
  };

  const curr = currencyNames[currency] || currencyNames['JOD'];

  let currencyText = '';
  if (integerPart > 0) {
    currencyText = integerPart >= 3 && integerPart <= 10 ? curr.mainPlural : curr.mainSingular;
  }

  let fullText = result ? `${result} ${currencyText}` : '';

  if (decimalPart > 0) {
    const fractionText = convertGroupArabic(decimalPart);
    const subCurrencyText = curr.subSingular;
    if (fullText) {
      fullText += ` و${fractionText} ${subCurrencyText}`;
    } else {
      fullText = `${fractionText} ${subCurrencyText}`;
    }
  }

  return fullText ? `فقط ${fullText} لا غير` : '';
}

export function tafqeetEnglish(num, currency = 'JOD') {
  if (isNaN(num) || num === null || num === undefined) return '';
  num = parseFloat(num);
  if (num === 0) return 'Zero';

  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n) {
    if ((n = n.toString()).length > 9) return 'overflow';
    let nArr = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!nArr) return '';
    let str = '';
    str += (nArr[1] != 0) ? (a[Number(nArr[1])] || b[nArr[1][0]] + ' ' + a[nArr[1][1]]) + 'Million ' : '';
    str += (nArr[3] != 0) ? (a[Number(nArr[3])] || b[nArr[3][0]] + ' ' + a[nArr[3][1]]) + 'Thousand ' : '';
    str += (nArr[4] != 0) ? (a[Number(nArr[4])] || b[nArr[4][0]] + ' ' + a[nArr[4][1]]) + 'Hundred ' : '';
    str += (nArr[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(nArr[5])] || b[nArr[5][0]] + ' ' + a[nArr[5][1]]) : '';
    return str.trim();
  }

  const integerPart = Math.floor(Math.abs(num));
  const decimalPart = Math.round((Math.abs(num) - integerPart) * (currency === 'JOD' || currency === 'KWD' ? 1000 : 100));

  const currenciesEn = {
    JOD: { main: 'Jordanian Dinars', sub: 'Fils' },
    USD: { main: 'US Dollars', sub: 'Cents' },
    SAR: { main: 'Saudi Riyals', sub: 'Halalas' },
    AED: { main: 'UAE Dirhams', sub: 'Fils' },
    EGP: { main: 'Egyptian Pounds', sub: 'Piastres' },
    KWD: { main: 'Kuwaiti Dinars', sub: 'Fils' },
    EUR: { main: 'Euros', sub: 'Cents' }
  };

  const cEn = currenciesEn[currency] || currenciesEn['JOD'];
  let mainWords = inWords(integerPart);
  let subWords = decimalPart > 0 ? inWords(decimalPart) : '';

  let res = mainWords ? `${mainWords} ${cEn.main}` : '';
  if (subWords) {
    res += res ? ` and ${subWords} ${cEn.sub}` : `${subWords} ${cEn.sub}`;
  }
  return res ? `${res} Only` : '';
}
