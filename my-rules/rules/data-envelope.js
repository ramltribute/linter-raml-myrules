'use strict'

var helper = require('../index.js');

function rule(api){
    var errors = [];
    function processResponse(method){
        var responses = method.responses();
        responses.forEach(function(response){
            var code = response.code().value();
            if(code === '200' || code === '201' || code === '202') {
                var bodies = response.body();
                bodies.forEach(function(body){
                    body.properties().forEach(function(prop){
                        if(prop.name() !== 'data'){
                            errors.push(helper.generateError(prop, 'data is the only envelope possible'));
                        }
                    });
                });
            }
        });
    }
    api.allResources().forEach(function(resource){
        resource.methods().forEach(function(method){
            processResponse(method);
        });
    });
    return errors;
}

module.exports = rule;