var fs = require('fs');

var callbacks = [];

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

(function (){
    var files = fs.readdirSync(__dirname+'/rules');
    files.forEach(function(file){
        var cb = require('./rules/'+file);
        callbacks.push(cb);
    });
    return callbacks;
})(this);

module.exports.generateError = generateError;
module.exports.callbacks = callbacks;
