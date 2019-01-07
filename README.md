# mcfly-semantic-release

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][downloads-url]   
[![Build Status][travis-image]][travis-url] [![Coverage percentage][coveralls-image]][coveralls-url]    
[![Dependency Status][daviddm-image]][daviddm-url] [![Dependency Dev Status][daviddm-dev-image]][daviddm-dev-url]    

[![NPM][npm-nodei-image]][npm-nodei-url]


## Installation
```bash
npm i --save-dev mcfly-semantic-release
```

## Usage
In your `package.json`
```json
"scripts": {
  "release": "mcfly-semantic-release"
}
```

Running release will do the following: 
- Bumps version. By default, this will publish a patch version, if you want to control the semver option you can pass an optional 'prerelease', 'patch', 'minor' or 'major' to the `--type` argument. The prerelease versions will be in the format of `2.3.2-4`. 
- Updates version in files: by default it will only update the root level `package.json`. Optionnaly use `--file` to specify file paths or files patterns (globs) that can have their version updated as well.  Files can be `package.json` files or `config.xml` files
- Commit the changed files with a standard commit message. Default message is `chore(app): Version <version number>`. Use `--production` to suffix the commit message with the work `production` (can be later used in CI)
- Generates changlog based on Angular standard commit messages.
- Generate a tag with the version number. 
- Generates a github release with the version number.

```json
"scripts": {
  "release": "mcfly-semantic-release.js --files ./package.json ./bower.json ./config.xml ./projects/**/package.json"
}
```

> **NOTE**    
> the path for the `--files` option is relative to your current root directory

Then, to publish a new version execute the following command:

```bash
npm run release
```

**Example :**

```bash
npm run release -- --type=minor
```

> **NOTE**    
> The double `--` is necessary, this is how npm script propagates its arguments

#### Alternate github authentication methods

By default `mcfly-semantic-release` uses basic username & password auth to communicate with github. Whem it runs, you will be prompted for your github username and password before the release will run. If your username for github is available in your git config, `mcfly-semantic-release` will find it and not prompt you to enter it.

As an alternative to basic auth, you can provide an oauth token (see [github oauth](https://developer.github.com/v3/oauth/)). To use a token, make sure it is valid and has the correct scopes for the repo and then pass it as `$GITHUB_TOKEN`. Then, when prompted for your password, just leave it blank and hit enter and the token will be used for the authentication!
```sh
~/dev/mcfly-io/mcfly-semantic-release $> GITHUB_TOKEN=<oauth_token> npm run release

> mcfly-semantic-release@1.0.15 release /Users/marty/dev/mcfly-io/mcfly-semantic-release
> node bin/mcfly-semantic-release.js

Hello marty@mcfly.io, let's publish a new version...
? Please enter your GitHub password (leave blank to use $GITHUB_TOKEN)
Github authentication...
Generating changelog...
Bumping files...
Committing version...
Publishing version...
Release v1.0.16 successfully published!
```

[npm-image]: https://badge.fury.io/js/mcfly-semantic-release.svg
[npm-url]: https://npmjs.org/package/mcfly-semantic-release
[npm-nodei-image]: https://nodei.co/npm/mcfly-semantic-release.png?downloads=false&downloadRank=false&stars=false
[npm-nodei-url]: https://nodei.co/npm/mcfly-semantic-release
[downloads-image]: http://img.shields.io/npm/dm/mcfly-semantic-release.svg
[downloads-url]: http://badge.fury.io/js/mcfly-semantic-release
[travis-image]: https://travis-ci.org/mcfly-io/mcfly-semantic-release.svg?branch=master
[travis-url]: https://travis-ci.org/mcfly-io/mcfly-semantic-release
[daviddm-image]: https://david-dm.org/mcfly-io/mcfly-semantic-release.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/mcfly-io/mcfly-semantic-release
[daviddm-dev-image]: https://david-dm.org/mcfly-io/mcfly-semantic-release/dev-status.svg?theme=shields.io
[daviddm-dev-url]: https://david-dm.org/mcfly-io/mcfly-semantic-release#info=devDependencies
[coveralls-image]: https://coveralls.io/repos/mcfly-io/mcfly-semantic-release/badge.svg
[coveralls-url]: https://coveralls.io/r/mcfly-io/mcfly-semantic-release
[gitter-image]: https://badges.gitter.im/Join%20Chat.svg
[gitter-url]: https://gitter.im/mcfly-io/mcfly-semantic-release?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge


