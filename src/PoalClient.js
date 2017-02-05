//Author: zFlarex <https://zflarex.pw>

var request = require('request');
var cheerio = require('cheerio');

var Logger = require('./Logger.js');
var Format = require('string-format');

Format.extend(String.prototype);

class PoalClient
{
    constructor(proxyAddress, verboseMode)
    {
        this._proxyAddress = 'http://{0}'.format(proxyAddress);

        this._verboseMode = verboseMode;
        this._cookieJar = request.jar();

        this._characterSet = '0123456789abcdefghijklmnopqrstuvwxyz';
    }

    Vote(pollId, voteOption)
    {
        this._retrievePollResults(pollId, (error, pollResults) =>
        {
            if(!error)
            {
                if(pollResults[voteOption] == undefined)
                {
                    if(this._verboseMode) Logger.Log('[{0}] The option \'{1}\' doesn\'t exist on the poll.'.format(this._proxyAddress, voteOption), 'FAIL');
                    return;
                }

                var postDictionary = {};

                postDictionary['c'] = 'v';
                postDictionary['id'] = pollId;
                postDictionary['ch'] = pollResults[voteOption]['index'];
                postDictionary['xc'] = this._xcCookie;

                request.post({ url: 'http://poal.me/a.php', proxy: this._proxyAddress, jar: this._cookieJar, form: postDictionary }, (error, response, body) =>
                {
                    if(!error && response.statusCode == 200)
                    {
                        if(this._verboseMode) Logger.Log('[{0}] I have successfully upvoted ...'.format(this._proxyAddress), 'FINE');
                    }
                    else
                    {
                        if(this._verboseMode) Logger.Log('[{0}] I have failed to upvoted ...'.format(this._proxyAddress), 'FAIL');
                    }
                });
            }
            else
            {
                if(this._verboseMode) Logger.Log('[{0}] I have failed to upvoted ...'.format(this._proxyAddress), 'FAIL');
            }
        });

    }

    RemoveVote(pollId)
    {
        var postDictionary = {};

        postDictionary['c'] = 'v';
        postDictionary['id'] = pollId;
        postDictionary['ch'] = 'x';
        postDictionary['xc'] = this._xcCookie;

        request.post({ url: 'http://poal.me/a.php', proxy: this._proxyAddress, jar: this._cookieJar, form: postDictionary }, (error, response, body) =>
        {
            if(!error && response.statusCode == 200)
            {
                if(this._verboseMode) Logger.Log('[{0}] I have successfully removed my vote ...'.format(this._proxyAddress), 'FINE');
            }
            else
            {
                if(this._verboseMode) Logger.Log('[{0}] I have failed to removed my vote ...'.format(this._proxyAddress), 'FAIL');
            }
        });
    }

    SendComment(pollId, userMessage)
    {
        var postDictionary = {};

        postDictionary['c'] = 'msg';
        postDictionary['id'] = pollId;
        postDictionary['lmid'] = -1;
        postDictionary['user'] = 'a:Anonymous';
        postDictionary['msg'] = userMessage;

        request.post({ url: 'http://poal.me/a.php', proxy: this._proxyAddress, jar: this._cookieJar, form: postDictionary }, (error, response, body) =>
        {
            if(!error && response.statusCode == 200)
            {
                if(this._verboseMode) Logger.Log('[{0}] I have successfully commented \'{1}\' ...'.format(this._proxyAddress, userMessage), 'FINE');
            }
            else
            {
                if(this._verboseMode) Logger.Log('[{0}] I have failed to comment \'{1}\' ...'.format(this._proxyAddress, userMessage), 'FAIL');
            }
        });
    }

    _retrievePollResults(pollId, callback)
    {
        var postDictionary = {};

		postDictionary['c'] = 'v';
		postDictionary['id'] = pollId;
		postDictionary['xc'] = '';

        request.post({ url: 'http://poal.me/a.php', proxy: this._proxyAddress, jar: this._cookieJar, form: postDictionary }, (error, response, body) =>
        {
            if(!error && response.statusCode == 200)
            {
                try
                {
                    eval('this._handlePollResults(pollId, {' + this._stringInBetween(body, '{', '}') + '}, callback);');
                }
                catch (e)
                {
                    callback(true, {});
                }
            }
            else
            {
                callback(true, {});
            }
        });
    }

    _handlePollResults(pollId, resultDictionary, callback)
    {
        request.get({ url: 'http://poal.me/{0}'.format(pollId), proxy: this._proxyAddress, jar: this._cookieJar }, (error, response, body) =>
        {
            if(!error && response.statusCode == 200)
            {
                try
                {
                    var $ = cheerio.load(body);
                    var sjo = undefined;
                    var scriptBody = $('script[type="text/javascript"]')[2].children[0].data;

                    eval(scriptBody); // sjo is defined here.

                    this._calculateXCCookie(sjo);

                    var pollResults = {};
                    var po = eval('(function() { return {' + this._stringInBetween(scriptBody, '{', '}') + '} } )();');

                    for(var i = 1; i <= po.c; i++)
                    {
                        pollResults[po['a' + i]] = {
                            'index': i,
                            'votes': resultDictionary['t' + i] == undefined ? 0 : resultDictionary['t' + i]
                        };
                    }

                    callback(false, pollResults);
                }
                catch (e)
                {
                    callback(true, {});
                }
            }
            else
            {
                callback(true, {});
            }
        });
    }

    _calculateXCCookie(sjo)
    {
        this._xcCookie = this._rSt(sjo.pv.length);
        this._xcCookie += this._dCo(this._xcCookie, sjo.pv, 365);

        this._cookieJar.setCookie(request.cookie('xc={0}e'.format(this._xcCookie)), 'http://poal.me');
    }

    _rSt(c)
    {
        var a = '';
		var d = '';

		for (var b = 1; b <= 581; b++)
		{
			a = Math.floor(36 * Math.random());

			if(25 >= a)
			{
				a = a + 97;
			}
			else
			{
				a = a + 22;
				d += String.fromCharCode(a);
			}
		}

		return d;
    }

    _dCo(c, a, d)
    {
        var b = '';
		var f = 5;

		for (var e = 0; e < a.length; e++)
		{
			var g = this._characterSet.indexOf(c.charAt(e % c.length)),
				f = f + g,
				f = 7 * f,
				f = f + 3,
				f = f % d,
				g = this._characterSet.indexOf(a.charAt(e)),
				g = (g - f) % 36;
			0 > g && (g += 36);
			b += this._characterSet.charAt(g)
		}

		return b;
    }

    _stringInBetween(source, start, end)
    {
        return source.split(start)[1].split(end)[0];
    }
}

module.exports = PoalClient;
