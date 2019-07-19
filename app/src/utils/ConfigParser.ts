import yaml from 'js-yaml';
import fs from 'fs';

export class RepositoryConfig {
  constructor(private _repoDoc: any) {
  }
  get url(): string {
    return this._repoDoc.url;
  }
  get name(): string {
    return this._repoDoc.name;
  }
}

export class AnalyzerConfig {
  constructor(private _anaDoc: any) {
  }
  get analyzers(): any[] {
    return this._anaDoc.analyzers;
  }
}

export class Config {
  constructor(private _repository: RepositoryConfig, private _analyzer: AnalyzerConfig) {
  }

  get repository(): RepositoryConfig {
    return this._repository;
  }
  get analyzer(): AnalyzerConfig {
    return this._analyzer;
  }
}

export class ConfigParser {
  static loadConfig(configPath: string): Config {
    var doc = yaml.safeLoad(fs.readFileSync(configPath, 'utf8'));
    console.log(doc);
    const repo = new RepositoryConfig(doc.repository);
    const ana = new AnalyzerConfig(doc.analyzer);
    return new Config(repo, ana);
  }
}