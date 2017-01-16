//Author: zFlarex <https://zflarex.pw>

var fs = require('fs');

var Logger = require('./Logger.js');
var PoalClient = require('./PoalClient.js');

fs.readFile('proxies.txt', 'utf8', (error, data) =>
{
    if(!error)
    {
        const proxiesArray = data.replace('\r', '').split('\n');

        for(var i = 0; i < proxiesArray.length; i++)
        {
            if(proxiesArray[i].indexOf(':') !== -1)
            {
                var pClient = new PoalClient(proxiesArray[i], true);

                pClient.Vote('pollId', 'Option');
            }
        }
    }
});
