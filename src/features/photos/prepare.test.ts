jest.mock('expo-image-manipulator', () => ({ ImageManipulator: {}, SaveFormat: { JPEG: 'jpeg' } }));
jest.mock('expo-file-system', () => ({ File: class {} }));

import { fitWithin, MAX_EDGE } from './prepare';

describe('fitWithin', () => {
  it('leaves photos that already fit alone', () => {
    expect(fitWithin(1080, 1350)).toBeNull();
    expect(fitWithin(MAX_EDGE, MAX_EDGE)).toBeNull();
  });

  it('scales the longest side down to the limit', () => {
    expect(fitWithin(4032, 3024)).toEqual({ width: MAX_EDGE });
    expect(fitWithin(3024, 4032)).toEqual({ height: MAX_EDGE });
  });
});
