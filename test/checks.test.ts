/**
 * What the checks themselves are held to. A check that fails for the
 * machine's reasons, and not the game's, is not believed the next time it
 * fails, and every game copied from here found one that did. What they
 * found is held here, so a game that rewrites its config is told what it
 * has dropped.
 */
import { describe, expect, it } from 'vitest';

describe('the checks', () => {
  it('give a test thirty seconds, so one that is only slow on a busy machine does not fail', ({ task }) => {
    // read from the runner and not from the config: what is held is the limit this test is itself run under
    expect(task.timeout).toBe(30_000);
  });
});
