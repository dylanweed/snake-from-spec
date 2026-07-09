import { describe, expect, it } from "vitest";
import { step } from "./step";
import type { Direction, GameState } from "./types";
import cases from "../../../spec-step.cases.json";

interface Case {
  name: string;
  description: string;
  input: GameState & { new_direction: Direction | null };
  expect: { result: "state"; value: GameState } | { result: "assertion_error" };
}

interface Group {
  name: string;
  description: string;
  cases: Case[];
}

const groups = (cases as { groups: Group[] }).groups;

describe("step()", () => {
  for (const group of groups) {
    describe(group.name, () => {
      for (const testCase of group.cases) {
        it(testCase.name, () => {
          const { new_direction, ...state } = testCase.input;
          if (testCase.expect.result === "assertion_error") {
            expect(() => step(state, new_direction)).toThrow();
          } else {
            expect(step(state, new_direction)).toEqual(testCase.expect.value);
          }
        });
      }
    });
  }
});
