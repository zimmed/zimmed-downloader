# zimmed-downloader

## Downloader server instance to be used with web service.

The downloader is part of a cluster of services that communicate with a master web-service so users can share the same
file crawler and file-sharing accounts securely, which are sent to be downloaded by their own servers (usually to the
home NAS).

### Setup

To deploy, first install all the CLI requirements:
- expect - Most linux distros come with this, on OSX you will need to install the package manually with homebrew.
- plowshare - This is the utility that parses filesharing links into useful download links. It can be installed through
            most package managers. e.g., sudo yum install plowshare
- plowshare modules - Plowshare requires external modules for specific file sharing sites you intend to use.
            This has only been tested for rapidgator.net and uploaded.net. Use of other shares may require modifications
            to the core code. See: https://github.com/mcrapet/plowshare-modules-legacy
- aria2 - The download utility which utlizies multiple connections (beneficial for premium downloads).

Test the following commands to make sure all packages were properly installed (you can use `$ which <cmd>`):
- unbuffer
- plowprobe
- plowdown
- aria2c

Next, add [custom node package repo](https://repo.fury.io/zimmed/) to NPM source. Recommended to use proxy which passes
through package requests to global npm repo: `$ npm config set registry https://npm-proxy.fury.io/zimmed/ && npm config set ca ""`

Then install javascript dependencies: `zimmed-downloader$ npm i`

Update configuration in `src/config.js` and `src/test-config.js`

[Optional] Run unit tests: `zimmed-downloader$ npm test`

Test server from CLI: `zimmed-downloader$ npm start`

_Or if you have previously installed bunyan globally `$ npm i -g bunyan` you can use `zimmed-downloader$ npm run pretty`._

It is recommended to use a utility for managing the node service, like [pm2](https://github.com/Unitech/pm2 "pm2"), for deployment stability.

### Legal

This code is licensed under the MIT Software License, and may be re-used freely, at your own risk. I am not liable for
any damages that come from using this software, nor am I responsible for any mis-use of this software to download
copyrighted material. This service is designed to only be compatible with legitimate file-sharing hosts that comply
with DMCA regulations.

If an individual decides to ignore my public advice and use this software in conjunction with a warez community that
abuses these hosts to share copyrighted material (such as warez-bb.org or tehparadox.com), they are doing so at their
own will and risk, and such actions are not condoned by myself, or any contributor to this project.
