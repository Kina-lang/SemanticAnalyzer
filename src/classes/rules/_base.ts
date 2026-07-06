import type { AnalysisContext } from '../AnalysisContext';
import type { Scope } from '../Scope';

export abstract class BaseRule {
  abstract validate(
    scope: Scope,
    context: AnalysisContext,
    isIncluded: boolean,
  ): void;
}
