var validate = require('./raml-validator'),
    CompositeDisposable = require('atom').CompositeDisposable,
    packager = require('atom-package-deps'),
    path = require('path'),
    fs = require('fs');

module.exports = {
    config: {
        pathToRules: {
            type: 'string',
            title: 'Path to custom folder that will contain the rules',
            default: '../my-rules/'
        }
    },
    ruleLoader: null,
    active: false,
    subscriptions: null,
    parser: null,
    activate: function() {
        packager.install('linter-raml-myrules')
            .then(function() {
                console.log('All dependencies installed, good to go')
            })
        for(var module in require.cache) {
            if (require.cache.hasOwnProperty(module) && module.indexOf('raml-1-parser\\dist\\index.js') > -1) {
                this.parser = require(module);
            }
        }
        this.parser = this.parser || require('raml-1-parser');
        this.subscriptions = new CompositeDisposable;
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'linter-raml-myrules:toggle': (function(_this) {
                return function() {
                    return _this.toggle();
                };
            })(this)
        }));
        this.subscriptions.add(atom.config.observe('linter-raml-myrules.pathToRules', (function(_this) {
            return function(pathToRules) {
                var pathResolved;
                if(!path.isAbsolute(pathToRules)){
                    pathResolved = path.resolve(__dirname+'/'+pathToRules) + '/';
                } else {
                    pathResolved = path.resolve(pathToRules) + '/';
                }
                console.log('Path to rules changed: ', pathResolved);
                if(fs.existsSync(pathResolved)){
                    _this.ruleLoader = require('./rules-loader.js');
                    _this.ruleLoader.loadRules(pathResolved);
                } else if (_this.ruleLoader){
                    console.log('Path doesnt exist', pathResolved);
                    delete _this.ruleLoader;
                }
                return _this.pathToRules = pathResolved;
            };
        })(this)));
        this.active = true;
        console.log('Linter-Raml-MyRules Activated');
    },
    deactivate: function() {
        this.active = false;
        this.subscriptions.dispose();
        console.log('Linter-Raml-MyRules Deactivated');
    },
    provideLinter: function() {
        const provider = {
            name: 'RAML-BBVA',
            grammarScopes: ['source.raml'],
            scope: 'file',
            lintOnFly: false,
            lint: (function (_this) {
                return function (textEditor) {
                    if (_this.active && _this.ruleLoader) {
                        var filePath = textEditor.getPath();
                        var result = [];
                        var validator = validate(filePath, _this.ruleLoader.callbacks(), _this.parser);
                        return validator.parseApi()
                            .then(
                                function(){
                                    validator.executeCallbacks.bind(validator);
                                    return validator.executeCallbacks();
                                })
                            .then(
                                function () {
                                    return [];
                                },
                                function (errors) {
                                    if (errors && errors.length > 0) {
                                        errors.forEach(function (x) {
                                            var error = {
                                                type: 'Error',
                                                text: x.message,
                                                filePath: filePath
                                            }
                                            if (x.range[1]) error.range = [[x.range[0].line, x.range[0].column], [x.range[1].line, x.range[1].column]];
                                            result.push(error);
                                        });
                                    } else{
                                        console.log('linter-raml-myrules parser failed');
                                    }
                                    return result;
                                });
                    }
                }
            }(this))
        }
        return provider;
    },
    toggle: function(){
        if(this.active) {
            atom.confirm({
                message: 'Linter-Raml-MyRules is now INACTIVE'
            });
        } else {
            atom.confirm({
                message: 'Linter-Raml-MyRules is now ACTIVE'
            });
        }
        return this.active = !this.active;
    }
};