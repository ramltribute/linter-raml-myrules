'use strict'

/* Error structure:
 {
 column: column where error starts,
 end: position where error ends,
 line: line where error is,
 message: error message,
 path: 'api.raml',
 range: This is the array structure: [{column:starts.column,line:starts.line,position:starts.position},{column:ends.column,line:ends.line,position:ends.position}],
 start: position where error starts,
 };
 */
function rule(api){
    var errors = [];
    return errors;
}

module.exports = rule;