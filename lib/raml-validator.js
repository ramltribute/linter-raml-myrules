'use strict'

var q = require('q'),
    path = require('path'),
    fs = require('fs');

class RamlValidator {

    constructor (ramlPath, customCallbacks, customParser, customPostProcessor){
        this.raml = ramlPath;
        this.callbacks = customCallbacks;
        if(customParser) {
            this.parser = customParser;
        } else {
            this.parser = require('raml-1-parser');
        }
        if(customPostProcessor) {
            this.postProcessor = customPostProcessor;
        } else {
            // this.postProcessor = require('../../raml-postprocessor/app');
        }
    }

    parseApi(){
        var self = this;
        var deferred = q.defer();
        var promise = this.parser.loadApi(path.resolve(this.raml));
        promise.then(function(api){
            self.api = api.expand();
            deferred.resolve();
        }, function(error){
            deferred.reject();
        });
        return deferred.promise;
    }

    executeCallbacks(){
        var deferred = q.defer();
        var cbErrors = [];
        var _api = this.api;
        this.callbacks.forEach(function(cb){
            var errors = cb(_api);
            if(errors){
                cbErrors = cbErrors.concat(errors);
            }
        });
        deferred.reject(cbErrors);
        return deferred.promise;
    }
}

function validate(filePath, customCallbacks, customParser, customPostProcessor) {
    var validator = new RamlValidator(filePath, customCallbacks, customParser, customPostProcessor);
    return validator.parseApi()
        .then(
            function(){
                validator.executeCallbacks.bind(validator);
                return validator.executeCallbacks();
            });
}

module.exports = validate;
