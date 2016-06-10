'use strict'

var q = require('q'),
    path = require('path'),
    fs = require('fs');

class RamlValidator {

    constructor (ramlPath, customCallbacks, customParser){
        this.raml = ramlPath;
        this.callbacks = customCallbacks;
        if(customParser) {
            this.parser = customParser;
        } else {
            this.parser = require('raml-1-parser');
        }
    }

    parseApi(){
        var self = this;
        var deferred = q.defer();
        var promise = this.parser.loadApi(path.resolve(this.raml));
        promise.then(function(api){
            self.api = api.expand();
            deferred.resolve();
        }, function(){
            deferred.reject();
        });
        return deferred.promise;
    }

    executeCallbacks(){
        var deferred = q.defer();
        var cbErrors = [];
        var _api = this.api;
        if(this.callbacks){
            this.callbacks.forEach(function(cb){
                var errors = cb(_api);
                if(errors){
                    cbErrors = cbErrors.concat(errors);
                }
            });
        }
        deferred.reject(cbErrors);
        return deferred.promise;
    }

    apiErrors(){
        var deferred = q.defer();
        var errors = this.api.errors();
        if(errors.length > 0){
            deferred.reject(errors);
        } else {
            deferred.resolve();
        }
        return deferred.promise;
    }
}

function validate(filePath, customCallbacks, customParser) {
    return new RamlValidator(filePath, customCallbacks, customParser);
}

module.exports = validate;