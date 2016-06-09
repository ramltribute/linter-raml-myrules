var validate = require('./raml-validator'),
    callbacks = require('../my-rules/index.js').callbacks,
    CompositeDisposable = require('atom').CompositeDisposable,
    package = require('atom-package-deps');

module.exports = {
    active: false,
    subscriptions: null,
    parser: null,
    activate: function() {
        package.install('linter-raml-myrules')
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
                    if (_this.active) {
                        var filePath = textEditor.getPath();
                        var result = [];
                        var validator = validate(filePath, callbacks, _this.parser);
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