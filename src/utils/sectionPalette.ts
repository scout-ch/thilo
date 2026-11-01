type RGB = [number, number, number];

const WHITE: RGB = [255, 255, 255];
const BLACK: RGB = [0, 0, 0];
// Content surfaces in variables.css. Aim above AA so tinted tables also
// retain readable accents, rather than treating brand fills as text colors.
const DARK_SURFACE: RGB = [23, 23, 23];

function parseHex(value: string): RGB {
  const hex = /^#[\da-f]{3}$/i.test(value)
    ? value.slice(1).split('').map(char => char + char).join('')
    : /^#[\da-f]{6}$/i.test(value) ? value.slice(1) : '521d3a';
  return [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16)) as RGB;
}

function hex(rgb: RGB): string {
  return '#' + rgb.map(channel => channel.toString(16).padStart(2, '0')).join('');
}

function luminance(rgb: RGB): number {
  const linear = rgb.map(channel => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function contrast(a: RGB, b: RGB): number {
  const values = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (values[1] + 0.05) / (values[0] + 0.05);
}

function textAccent(accent: RGB, surface: RGB, towards: RGB): string {
  for (let percent = 0; percent <= 100; percent++) {
    const mixed = accent.map((channel, index) =>
      Math.round(channel + (towards[index] - channel) * percent / 100)
    ) as RGB;
    if (contrast(mixed, surface) >= 7) return hex(mixed);
  }
  return hex(towards);
}

export function sectionPalette(color: string) {
  const accent = parseHex(color);
  return {
    lightText: textAccent(accent, WHITE, BLACK),
    darkText: textAccent(accent, DARK_SURFACE, WHITE),
    onPrimary: contrast(accent, WHITE) >= contrast(accent, BLACK) ? '#ffffff' : '#000000',
  };
}
