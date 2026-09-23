// If the given version matches a template (essentially, semver-style, but with
// a bounded number of digits per number part, and with no restriction on the
// amount of number parts, and some restrictions on legal prerelease labels),
// then return a magnitude for it. Otherwise return null.
//
// This conventional magnitude pads each part (with 0s for numbers, and ! for
// prerelease tags), and appends a $. (Because ! sorts before $, this means that
// the prerelease for a given release will sort before it. Because $ sorts
// before '.', this means that 1.2 will sort before 1.2.3.)
export function versionMagnitude(v) {
  const m = v.match(/^(\d{1,4}(?:[._]\d{1,4})*)(?:-([-A-Za-z.]{1,15})(\d{0,4}))?$/);
  if (!m) return null;
  const [, numberPart, prereleaseTag, prereleaseNumber] = m;

  // Versions must have no redundant leading zeroes, or else this encoding would
  // be ambiguous.
  const hasRedundantLeadingZero = x => x.length > 1 && x[0] === '0';
  const numbers = numberPart.split(/[._]/);
  if (numbers.some(hasRedundantLeadingZero)) return null;
  if (prereleaseNumber && hasRedundantLeadingZero(prereleaseNumber)) return null;

  // First, put together the non-prerelease part.
  let ret = numbers.map(n => n.padStart(4, '0')).join('.');
  if (!prereleaseTag) return ret + '$';

  ret += '!' + prereleaseTag.padEnd(15, '!');
  if (prereleaseNumber) ret += prereleaseNumber.padStart(4, '0');
  return ret + '$';
}
