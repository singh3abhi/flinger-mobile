export interface PromptAnswer {
  promptId: string;
  answer: string;
}

/**
 * The full prompt list after writing `answer` for `promptId` in slot `slot` (0-based).
 * A slot past the end appends; using a prompt that sits in another slot moves it here.
 */
export function withAnswer(
  current: readonly PromptAnswer[],
  slot: number,
  promptId: string,
  answer: string,
): PromptAnswer[] {
  const next = current.map(({ promptId: id, answer: a }) => ({ promptId: id, answer: a }));
  const entry = { promptId, answer: answer.trim() };
  if (slot < next.length) next[slot] = entry;
  else next.push(entry);
  // A prompt can appear once: drop it from any other slot.
  return next.filter((p, i) => p.promptId !== promptId || i === Math.min(slot, next.length - 1));
}

/** The list without slot `slot`; later answers move up. */
export function withoutSlot(current: readonly PromptAnswer[], slot: number): PromptAnswer[] {
  return current
    .filter((_, i) => i !== slot)
    .map(({ promptId, answer }) => ({ promptId, answer }));
}
