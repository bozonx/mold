# libs-manage
Manage own custom libs, used in project.

## Install

    nvm install
    nvm use
    npm i -g
    bower i


## Add it to your project

* copy `project_conf.example.js` to you project as `project_conf.js`
* edit `project_conf.js`
* add line to you gulpfile: `require('libs-manage/gulp_libs');`
* add to package.json in dependencies: `"libs-manage": "git://git@github.com:ipkozyrin/libs-manage.git"`
* at now you can use gulp libs_** commands


## Commands

### libs:install
Install repos specified in your config and update specified links.
If you use git source, then command will be update node modules and bower components.


### libs:pull
Run git pull on all repos and install lib if need.


## Config
* libsRoot - dir for install libs. By default './libs'
* libs - you libs. See "project_conf.example.js".



