var assert = require('assert');
var fs = require('fs');
var karel = require('../js/karel.js');
var DOMParser = require('xmldom').DOMParser;

describe('problems', function() {
  var problems = fs.readdirSync('test/problems');

  problems.forEach(function(problem) {
    it(problem, function() {
      // 10s timeout per problem.
      this.timeout(10000);

      var problemDir = 'test/problems/' + problem + '/';
      var file = fs.readFileSync(problemDir + 'sol.txt', {encoding: 'utf-8'});
      var compiled = karel.compile(file);
      fs.readdirSync(problemDir + 'cases')
          .forEach(function(casename) {
            if (!casename.endsWith('.in')) return;
            var inPath = problemDir + 'cases/' + casename;
            var outPath = inPath.slice(0, -3) + '.out';

            var worldXml = new DOMParser().parseFromString(
                fs.readFileSync(inPath, {encoding: 'utf-8'}), 'text/xml');
            var world = new karel.World(100, 100);
            world.load(worldXml);
            world.runtime.load(compiled);
            while (world.runtime.step()) {
              // Keep going...
            }
            var output = world.output().replace(/\s+/g, '');

            var expectedOutput = fs.readFileSync(outPath, {encoding: 'utf-8'})
                                     .replace(/\s+/g, '');
            assert.equal(output, expectedOutput);
          });
    });
  });
});
