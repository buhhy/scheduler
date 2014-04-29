//WKHTMLTOPDF
var spawn = require('child_process').spawn;
var slang = require('slang');

var OBJ_CONSTRUCTOR = {}.constructor;
var pdfCommand = "wkhtmltopdf";
var imageCommand = "wkhtmltoimage";

function pushArgument (aArgs, aValue) {
	if (typeof aValue !== 'boolean') {
		// stringify the json value
		if (aValue.constructor === OBJ_CONSTRUCTOR) {
			try {
				aValue = JSON.stringify(aValue);
			} catch (e) {
				console.log(e);
			}
		}

		// escape and quote the aValueue if it is a string
		if (typeof aValue === 'string') {
			aValue = '"' + aValue.replace(/(["\\$`])/g, '\\$1') + '"';
		}

		aArgs.push(aValue);
	}
};

function htmlToX(command, input, options, callback) {
	if (!options) {
		options = { quiet: true, logging: false, };
	} else if (typeof options == 'function') {
		callback = options;
		options = { quiet: true, logging: false, };
	}
	var logging = options.logging ? options.logging===true ? true : false : false;
	delete options.logging;

	var output = options.output;
	delete options.output;

	var args = [];
	args.push(command);

	if (options.quiet)
		args.push('--quiet');
	delete options.quiet;


	for (var key in options) {
		var val = options[key];
		key = key.length === 1 ? '-' + key : '--' + slang.dasherize(key);

		var values = [];
		if (val instanceof Array) {
			args.push(key);

			// For multiple arguments, put all of them in
			val.forEach(function (val) {
				pushArgument(args, val);
			});
		} else if (val.constructor === OBJ_CONSTRUCTOR) {
			// For object arguments, put them into repeated arguments
			for (var key2 in val) {
				args.push(key)
				args.push(key2)
				pushArgument(args, val[key2]);
			}
		} else {
			if (val !== false)
				args.push(key);
			pushArgument(args, val);
		}

	}

	var isUrl = /^(https?|file):\/\//.test(input);
	if (process.platform === 'win32')
		input = '"' + input + '"';

	args.push(isUrl ? input : '-'); // stdin if HTML given directly
	args.push(output || '-');       // stdout if no output file

	if (process.platform === 'win32') {
		args.unshift('"');
		args.unshift('/C');
		args.push('"');

		if (logging) {
			console.log('WKHTMLTOPDF args:\n');
			console.dir(args);
			console.log('\n');
		}

		var child = spawn('cmd', args, { windowsVerbatimArguments: true });
		if (logging) logError(child);
	} else {
		// this nasty business prevents piping problems on linux
		var child = spawn('/bin/sh', ['-c', args.join(' ') + ' | cat']);
		if (logging) logError(child);
	}

	if (callback)
		child.on('exit', callback);

	if (!isUrl)
		child.stdin.end(input);

	// return stdout stream so we can pipe
	return child.stdout;
}

function logError(child) {
	// This output is really not that useful...
	// child.stdout.setEncoding('utf8');
	// child.stdout.on('data', function (data) {
	//   console.log('(INFO) WKHTML INFO --------------------------- \n');
	//   console.log(data);
	// });

	child.stderr.setEncoding('utf8');
	child.stderr.on('data', function (data) {
		console.log('(ERROR) WKHTML ERROR --------------------------- \n');
		console.log(data);
	});
}

exports.toPdf = function (aInput, aOptions, aCallback) {
	return htmlToX(pdfCommand, aInput, aOptions, aCallback);
};

exports.toImage = function (aInput, aOptions, aCallback) {
	return htmlToX(imageCommand, aInput, aOptions, aCallback);
};
