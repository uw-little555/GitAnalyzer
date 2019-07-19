import { BaseAnalyzer } from "./Analyzer";
import { IBug, Bug } from "./Bug";
import { GitClient, Ibranch } from "../utils/GitClient";

interface IParams {
  srcBranch: string
  targetBranches: string[]
}

export class ConflictAnalyzer extends BaseAnalyzer {
  constructor(gitClient: GitClient, private params: IParams){
    super(gitClient);
  }

  async analyze(): Promise<IBug[]> {
    console.log(`run ${this.constructor.name}`);
    console.log(this.params);

    const branches = await this.gitClient.branch();
    const targetReg = new RegExp(this.params.targetBranches.join('|'));
    let srcBranch: Ibranch | undefined;
    const targetBranches: Ibranch[] = [];
    for (const branch of branches) {
      if (this.params.srcBranch === branch.name) {
        srcBranch = branch;
      } else if (targetReg.test(branch.name)) {
        targetBranches.push(branch);
      }
    }

    let bugs :IBug[]  = [];
    if (srcBranch !== undefined) {
      for (const branch of targetBranches) {
        bugs = bugs.concat(await this.analyzeBranch(srcBranch, branch));
      }
    }
    return bugs;
  }

  private async analyzeBranch(srcBranch: Ibranch, branch: Ibranch): Promise<IBug[]> {
    let bugs :IBug[]  = [];
    const conflictFiles: string[] = await this.gitClient.getConflictFiles(srcBranch, branch);
    if (conflictFiles.length > 0) {
      bugs.push(new Bug(`has conflict files. [${conflictFiles}]`, this.constructor.name));
    }
    return bugs;
  }
}