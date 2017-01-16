//Author: zFlarex <https://zflarex.pw>

var colors = require('colors/safe');

class Logger
{
	static Log(logMessage, logLevel)
	{
		switch(logLevel.toUpperCase())
		{
			case 'INFO':
				var chosenColor = colors.blue;
				break;

			case 'FINE':
				var chosenColor = colors.green;
				break;

			case 'WARN':
				var chosenColor = colors.yellow;
				break;

			case 'FAIL':
				var chosenColor = colors.red;
				break;

			default:
				var chosenColor = colors.grey;
				break;
		}

		console.log('[{0}] [{1}] {2}'.format(colors.grey(Math.floor(Date.now() / 1000)), chosenColor.bold(logLevel.toUpperCase()), logMessage));
	}
}

module.exports = Logger;
