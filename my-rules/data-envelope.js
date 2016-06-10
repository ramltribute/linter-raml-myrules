'use strict'

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
                            errors.push(generateError(prop, 'data is the only envelope possible'));
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

function generateError(node, message){
    var lowLevel = node.highLevel().lowLevel();
    var lm = lowLevel.unit().lineMapper();
    var starts = lm.position(lowLevel.keyStart());
    var ends = lm.position(lowLevel.keyEnd());
    return {
        column: starts.column,
        end: ends.position,
        line: starts.line,
        message: message,
        path: 'api.raml',
        range: [{column:starts.column,line:starts.line,position:starts.position},{column:ends.column,line:ends.line,position:ends.position}],
        start: starts.position};
}

module.exports = rule;