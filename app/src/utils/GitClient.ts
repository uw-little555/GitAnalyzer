import fs from "fs";
import path from "path";
import simplegit, {SimpleGit, Options} from 'simple-git/promise';

import { RepositoryConfig } from "./configParser";
import { StringUtils } from "./StringUtils";

export interface Ibranch {
  current: string;
  name: string;
  commit: string;
  label: string;
  commitDateTime: Date;
}

// export interface IMergeSummary {
//   PullSummary?: IPullSummary;
//   Error?: string;
// }

// export interface IPullSummary {
//   files: string[];
//   insertions: any;
//   deletions: any;
//   summary: any;
//   created: string[];
//   deleted: string[];
//   conflicts: IMergeConflict[];
//   merges: string[];
//   reason: string;
// }

// export interface IMergeConflict {
//   reason: string;
//   file: string;
// }

export class GitClient{
  private _git!: SimpleGit;
  private _cache: any = {
    commitDateTime: {},
    conflictFiles: {},
    branchedHash: {}
  };
  constructor(private _repo: RepositoryConfig){}

  async init() {
    const repoName = this._repo.url.split('/').slice(-1)[0].slice(0, -4);
    const repoDir = this.createProjectDir(repoName);
    this._git = simplegit(repoDir);

    if(await this._git.checkIsRepo()) {
      await this._git.removeRemote(this._repo.name);
    } else {
      await this._git.init();
    }
    await this._git.addRemote(this._repo.name, this._repo.url);
    const fetchOpt: Options = {
      '--prune': null
    };
    await this._git.fetch(this._repo.name, undefined, fetchOpt);
  }

  clearCache() {
    this._cache = {};
  }

  async branch(): Promise<Ibranch[]> {
    if (this._cache.branches !== undefined) {
      return this._cache.branches;
    }

    const branchOpt: Options = {
      '--remote': null
    }
    const summary = await this._git.branch(branchOpt);
    let branches: Ibranch[] = [];
    for (let key in summary.branches) {
      const branche = summary.branches[key];
      // console.log(branche.name);
      const commitDateTime = await this.getCommitDateTime(branche.commit);
      if (commitDateTime != undefined) {
        branches.push({
          ...branche,
          commitDateTime: commitDateTime,
        });
      } else {
        console.error(`Commit date get faild. [${branche.name}: ${branche.commit}]`);
      }
    }

    this._cache.branches = branches;
    return branches;
  }

  async getCommitDateTime(commitHash: string) : Promise<Date | undefined> {
    if (this._cache.commitDateTime[commitHash] !== undefined) {
      return this._cache.commitDateTime[commitHash];
    }

    var commitLog = await this._git.show([commitHash]);
    const DateRegex = new RegExp("^Date: ");
    const commitDateStr = commitLog.split('\n').find(str => DateRegex.test(str));
    if (commitDateStr !== undefined) {
      const date = new Date(commitDateStr.slice(8));
      this._cache.commitDateTime[commitHash] = date;
      return date;
    }
  }

  async searchBranchedHash(srcBranchName: string, branchName: string) : Promise<string> {
    if (this._cache.branchedHash[srcBranchName + branchName] !== undefined) {
      return this._cache.branchedHash[srcBranchName + branchName];
    }

    const graph = await this._git.raw(["show-branch", "--sha1-name", srcBranchName, branchName]);
    const commitHash = graph.split('\n').slice(-2, -1)[0].slice(4, 11);

    this._cache.branchedHash[srcBranchName + branchName] = commitHash;
    return commitHash;
  }

  async getConflictFiles(srcBranch: Ibranch, branch: Ibranch): Promise<string[]> {
    const cacheKey = srcBranch.name + branch.name;
    if (this._cache.conflictFiles[cacheKey] !== undefined) {
      return this._cache.conflictFiles[cacheKey];
    }

    // console.log(`### ${branch.name} ###`);
    const branchedHash = await this.searchBranchedHash(srcBranch.name, branch.name);
    if (branchedHash === srcBranch.commit || branchedHash === branch.commit) {
      return [];
    }

    await this._git.checkout(srcBranch.name);
    await this._git.reset("hard");

    let files: string[] = [];
    this._git.silent(true);
    const mergeSummary = await this._git.merge([branch.name, '--no-ff', '--no-commit']).catch(p => p);
    await this._git.merge(['--abort']);
    if (mergeSummary.conflicts === undefined) {
      const errorStr = `${mergeSummary}`;
      const confFiles = errorStr.replace('Error: CONFLICTS: ', '').split(', ').map(s => s.replace(':content', ''));
      files = files.concat(confFiles);
    }
    this._cache.conflictFiles[cacheKey] = files;
    return files;
  }

  private createProjectDir(repoName: string) :string {
    const tmpDir = path.join('..', '..', 'tmp');
    try {
      fs.statSync(tmpDir);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`mkdir ${tmpDir}`);
        fs.mkdirSync(tmpDir);
      }
    }

    const repoDir = path.join(tmpDir, repoName);
    try {
      fs.statSync(repoDir);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`mkdir ${repoDir}`);
        fs.mkdirSync(repoDir);
      }
    }
    return repoDir;
  }
}