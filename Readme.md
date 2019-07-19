# Gitリポジトリの静的解析ツール

## 概要

解析設定ファイルに従ってGitリポジトリに対して解析を実行し、  
不正なブランチや、不正な運用を検知するツールです。

## 使い方

### ツールやモジュールの導入

```bash
mkdir work
cd work
git clone 
cd GitAnalyzer/app
yarn install
```

### 設定の更新

`GitAnalyzer/app/conf/config.yml`を開き、リポジトリ情報を登録します。

| パス | 説明 |
|:--|:--|
| repository.url | チェック対象のリポジトリURL |
| repository.name | リポジトリの名前（default: origin） |
| analyzer.analyzers | 解析ルールの配列 |
| analyzer.analyzers[n].type | 解析ルールタイプ（後述） |
| analyzer.analyzers[n].params | 解析ルールタイプごとのパラメータ（後述） |

※ work/tmp配下にリポジトリが作成されます

### 解析処理の実行

```bash
yarn dev
```

## 解析ルールタイプ

### BranchNameAnalyzer

ブランチの命名ルールをチェックします。  
有効な名称を定義し、マッチしないブランチを検出します。

- validBranches: string[]
    - 有効なブランチ名称の配列（正規表現利用可能）

### BranchLifespanAnalyzer

ブランチのマージされてない期間をチェックします。  
分岐した時点から、ブランチ元もしくはブランチ先のコミットが、  
指定日数経過しているブランチを検出します。

- srcBranch: string
    - ブランチ元となるブランチ名称
- targetBranches: string
    - ブランチ先となるブランチ名称（正規表現利用可能）
- lifespan: number
    - 指定日数

### DeadBranchAnalyzer

ブランチが活動しているかチェックします。  
指定日数コミットがないブランチを検出します。

- targetBranches: string[]
    - チェックするブランチ名称の配列（正規表現利用可能）
- deadline: number
    - 指定日数
