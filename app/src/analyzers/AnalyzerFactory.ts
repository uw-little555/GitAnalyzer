import { AnalyzerConfig } from "../utils/configParser";
import { IAnalyzer } from "./Analyzer";
import { GitClient } from "../utils/GitClient";
import { BranchNameAnalyzer } from "./BranchNameAnalyzer";
import { BranchLifespanAnalyzer } from "./BranchLifespanAnalyzer";
import { DeadBranchAnalyzer } from "./DeadBranchAnalyzer";
import { ConflictAnalyzer } from "./ConflictAnalyzer";

interface IAnalyzerData {
  type: string,
  params: any
}

export class AnalyzerFactory {
  static createAnalyzers(gitClient: GitClient, analyzerConfig: AnalyzerConfig): IAnalyzer[] {
    const analyzers: IAnalyzer[] = [];
    for (const analyzerData of analyzerConfig.analyzers) {
      let a: IAnalyzer | undefined = AnalyzerFactory.createAnalyzer(gitClient, analyzerData);
      if (a !== undefined) {
        analyzers.push(a);
      }
    }
    return analyzers;
  }

  private static createAnalyzer(gitClient: GitClient, analyzerData: IAnalyzerData): IAnalyzer | undefined {
    switch(analyzerData.type) {
      case 'BranchNameAnalyzer':
        return new BranchNameAnalyzer(gitClient, analyzerData.params);
      case 'BranchLifespanAnalyzer':
        return new BranchLifespanAnalyzer(gitClient, analyzerData.params);
        case 'DeadBranchAnalyzer':
          const date = new Date();
          return new DeadBranchAnalyzer(gitClient, {...analyzerData.params, toDay: date});
        case 'ConflictAnalyzer':
          return new ConflictAnalyzer(gitClient, analyzerData.params);
      default:
        console.warn(`unknown analyzer "${analyzerData.type}"`);
    }
  }
}