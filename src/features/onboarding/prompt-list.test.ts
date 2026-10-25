import { withAnswer, withoutSlot } from './prompt-list';

const a = { promptId: 'a', answer: 'one' };
const b = { promptId: 'b', answer: 'two' };

describe('prompt list edits', () => {
  it('appends when writing past the end', () => {
    expect(withAnswer([a], 1, 'b', ' two ')).toEqual([a, { promptId: 'b', answer: 'two' }]);
    expect(withAnswer([], 2, 'a', 'one')).toEqual([a]);
  });

  it('replaces the answer (or the prompt) in an existing slot', () => {
    expect(withAnswer([a, b], 0, 'a', 'new')).toEqual([{ promptId: 'a', answer: 'new' }, b]);
    expect(withAnswer([a, b], 1, 'c', 'three')).toEqual([a, { promptId: 'c', answer: 'three' }]);
  });

  it('never keeps the same prompt twice', () => {
    expect(withAnswer([a, b], 1, 'a', 'moved')).toEqual([{ promptId: 'a', answer: 'moved' }]);
  });

  it('removes a slot and moves later answers up', () => {
    expect(withoutSlot([a, b], 0)).toEqual([b]);
  });
});
