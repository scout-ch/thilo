import test from 'node:test';
import assert from 'node:assert/strict';
import { sectionPalette } from '../src/utils/sectionPalette.ts';

function luminance(hex) {
  const channels = hex.match(/[a-f\d]{2}/gi).map(value => parseInt(value, 16) / 255)
    .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
}
function contrast(a, b) {
  const [low, high] = [luminance(a), luminance(b)].sort((a, b) => a - b);
  return (high + .05) / (low + .05);
}

test('all published section accents meet text contrast in both themes', () => {
  const colors = ['#632949', '#d84e23', '#e6924e', '#e6c36a', '#cabba1', '#536424', '#a4bb98'];
  for (const color of colors) {
    const palette = sectionPalette(color);
    assert.ok(contrast(palette.lightText, '#ffffff') >= 7, color + ' on light');
    assert.ok(contrast(palette.darkText, '#171717') >= 7, color + ' on dark');
    assert.ok(contrast(palette.onPrimary, color) >= 4.5, color + ' title fill');
  }
});

test('already-readable text accents stay unchanged', () => {
  assert.equal(sectionPalette('#632949').lightText, '#632949');
  assert.equal(sectionPalette('#e6c36a').darkText, '#e6c36a');
});

test('shorthand colors and invalid CMS values are handled consistently', () => {
  assert.deepEqual(sectionPalette('#fff'), sectionPalette('#ffffff'));
  assert.deepEqual(sectionPalette(''), sectionPalette('#521d3a'));
});
