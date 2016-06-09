# linter-raml-myrules
New Linter for Atom editor (and console) that validates your RAML files and is expandable with your own personal rules!

The atom package is https://atom.io/packages/linter-raml-myrules.

This package allow to create custom functional rules that raml standard coverage rules doesn’t cover. It comes with a template, and a data envelope example (this means that every correct answer should have an envelope with data key).

It uses raml-js-parser-2 by default https://github.com/raml-org/raml-js-parser-2 to parse the raml, and uses its API to navigate through all the raml:
https://raml-org.github.io/raml-js-parser-2/modules/_src_index_.html. 

Check more examples in: 
https://github.com/raml-org/raml-js-parser-2/blob/master/documentation/GettingStarted.md

If api-workbench is installed in ATOM too, it checks npm require cache to use same parser as workbench, if its not installed, it uses raml-js-parser-2 that is defined in package.json (This is done because raml-js-parser-2 is not prepared to be required twice). In order to customize the linter with new rules, it is required to create new callbacks.

Callback files are created in my-rules folder. It receives the API parser from the parser, and return an array of errors that callback generates. The error structure needed is:

```
{
column: column where error starts,
end: position where error ends,
line: line where error is,
message: error message,
path: 'api.raml',
range: This is the array structure:  [{column:starts.column,line:starts.line,position:starts.position},{column:ends.column,line:ends.line,position:ends.position}],
start: position where error starts,
};
```

Also it has an auxiliary helper to resolve errors in RAML into ATOM using the parser, it is in my-rules/index.js.

