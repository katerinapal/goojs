'use strict';

/**
 Main file
 + parses comment line args
 + gets the source files to be processed
 + gets data for the index (nav bar)
 + gets the processed documentation
 + generates every -doc file
 + generates an index file (in this case Entity.js)
 + generates the changelog in a pretty format
 */

var fs = require('fs');
var childProcess = require('child_process');
var glob = require('glob');
var mustache = require('mustache');
var marked = require('marked');
var _ = require('underscore');

var extractor = require('./extractor');
var indoctrinate = require('./indoctrinate');
var indexBuilder = require('./indexBuilder');
var util = require('./util');


function processArguments() {
	if (process.argv.length < 6) {
		console.log('Usage: node modoc.js <sourcePath> <templatesPath> <staticsPath> <outPath>');
	}

	var sourcePath = process.argv[2];
	var templatesPath = process.argv[3];
	var staticsPath = process.argv[4];
	var outPath = process.argv[5];

	return {
		sourcePath: sourcePath,
		templatesPath: templatesPath,
		staticsPath: staticsPath,
		outPath: outPath
	};
}

var getFiles = function (sourcePath, ignore) {
	if (/\.js$/.test(sourcePath)) {
		return [sourcePath];
	}

	return glob.sync(sourcePath + '/**/*.js').filter(function (file) {
		return ignore.every(function (term) {
			return file.indexOf(term) === -1;
		});
	});
};

var HTML_SUFFIX = '-doc.html';

var args = processArguments();

var template = fs.readFileSync(args.templatesPath + '/t1.mustache', { encoding: 'utf8' });

var files = getFiles(args.sourcePath, ['goo.js', 'pack', '+']);

var indexAndMapping = indexBuilder.getIndex(files, 'goo');
var index = indexAndMapping.index;
var mapping = indexAndMapping.mapping;

function copyStaticFiles(callback) {
	childProcess.exec(
		'cp -r ' + args.staticsPath + '/. ' + args.outPath,
		function (error, stdout, stderr) {
			console.log('stdout: ' + stdout);
			console.log('stderr: ' + stderr);
			if (error !== null) {
				console.log('exec error: ' + error);
			}
			callback();
		});
}

function buildStartPage(page, callback) {
	// just copy over Entity.js since it's the central piece
	childProcess.exec(
		'cp ' + args.outPath + '/' + page + ' ' + args.outPath + '/index.html',
		function (error, stdout, stderr) {
			console.log('stdout: ' + stdout);
			console.log('stderr: ' + stderr);
			if (error !== null) {
				console.log('exec error: ' + error);
			}
			callback();
		});
}

function filterPrivates(class_) {
	var predicate = function (entry) {
		return entry.comment && !(entry.comment.private || entry.comment.hidden);
	};

	class_.members = class_.members.filter(predicate);
	class_.staticMembers = class_.staticMembers.filter(predicate);
	class_.methods = class_.methods.filter(predicate);
	class_.staticMethods = class_.staticMethods.filter(predicate);

	class_.hasMembers = class_.members.length > 0;
	class_.hasStaticMethods = class_.staticMethods.length > 0;
	class_.hasStaticMembers = class_.staticMembers.length > 0;
	class_.hasMethods = class_.methods.length > 0;
}

function compileDoc(files) {
	var classes = {};

	// extract information from classes
	files.forEach(function (file) {
		console.log('compiling doc for ' + util.getFileName(file));

		var source = fs.readFileSync(file, { encoding: 'utf8' });

		var class_ = extractor.extract(source, file);

		if (class_.constructor) {
			indoctrinate.all(class_, files);

			filterPrivates(class_);

			class_.path = mapping[file].path;

			classes[class_.constructor.name] = class_;
		}
	});

	// --- should stay elsewhere
	var constructorFromComment = function (comment) {
		indoctrinate.link(comment);
		return {
			name: comment.targetClass.itemName,
			params: _.pluck(comment.param, 'name'),
			comment: comment
		};
	};

	var memberFromComment = function (comment) {
		indoctrinate.link(comment);
		return {
			name: comment.targetClass.itemName,
			comment: comment
		};
	};

	var methodFromComment = constructorFromComment;
	var staticMethodFromComment = constructorFromComment;
	var staticMemberFromComment = memberFromComment;
	// ---

	// copy over the extra info from other classes
	Object.keys(classes).forEach(function (className) {
		var class_ = classes[className];

		var extraComments = class_.extraComments.map(indoctrinate.compileComment);

		// adding extras mentioned in @target-class
		extraComments.forEach(function (extraComment) {
			var targetClassName = extraComment.targetClass.className;
			var targetClass = classes[targetClassName];

			if (!targetClass) {
				classes[targetClassName] = {
					constructor: null,
					staticMethods: [],
					staticMembers: [],
					methods: [],
					members: []
				};
			}

			switch (extraComment.targetClass.itemType) {
				case 'constructor':
					targetClass.constructor = constructorFromComment(extraComment);
					break;
				case 'member':
					targetClass.members.push(memberFromComment(extraComment));
					break;
				case 'method':
					targetClass.methods.push(methodFromComment(extraComment));
					break;
				case 'static-member':
					targetClass.staticMembers.push(staticMemberFromComment(extraComment));
					break;
				case 'static-method':
					targetClass.staticMethods.push(staticMethodFromComment(extraComment));
					break;
			}
		});
	});

	return classes;
}

function renderDoc(files, classes) {
	files.forEach(function (file) {
		var fileName = util.getFileName(file);

		var data = {
			index: index,
			class_: classes[fileName]
		};

		if (classes[fileName] && data.class_.constructor) {
			mapping[file].current = true;
			var result = mustache.render(template, data);
			mapping[file].current = false;

			fs.writeFileSync(args.outPath + '/' + data.class_.constructor.name + HTML_SUFFIX, result);
		}
	});
}

function buildChangelog(file) {
	var changelog = fs.readFileSync(file, { encoding: 'utf8' });
	var formatted = marked(changelog);

	var template = fs.readFileSync(args.templatesPath + '/changelog.mustache', { encoding: 'utf8' });
	var data = { content: formatted };
	var result = mustache.render(template, data);

	fs.writeFileSync(args.outPath + '/changelog.html', result);
}

copyStaticFiles(function () {
	var classes = compileDoc(files);
	renderDoc(files, classes);
	buildChangelog('CHANGES');
	buildStartPage('Entity-doc.html', function () {
		console.log('documentation built');
	});
});