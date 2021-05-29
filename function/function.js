const fs = require('fs');
const http = require('http');
const iconv = require('iconv-lite');
const jsdom = require('jsdom')
const { JSDOM } = jsdom;
const request = require('sync-request');
var returnCode;

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.fetchScores = (req, res) => {


    res.set('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Authorization');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
    } else {

        const fetch = (ddrcode) => {
            var res = request('GET', `http://skillattack.com/sa4/dancer_score.php?ddrcode=${ddrcode}`)
            decodedBody = iconv.decode(res.body, 'sjis');
            return decodedBody
        }

        const parse = (string) => {

            const nameExp = /^.Name='(.*)';/
            const ddrcodeExp = /^.Ddrcode='(\d*)';/

            const indexExp = /dd.(Single|Double)Index\[(\d{1,2})\]\s*=new\sArray\(((\d*,)*\d*)\);/
            const musicExp = /dd.(Single|Double)Music\[(\d{1,2})\]\s*=new\sArray\((('.*',)*'.*')\);/
            const sequenceExp = /dd.(Single|Double)Sequence\[(\d{1,2})\]\s*=new\sArray\(((\d,)*\d)\);/
            const scoreExp = /dd.(Single|Double)Score\[(\d{1,2})\]\s*=new\sArray\((('.*',)*'.*')\);/
            const fcExp = /dd.(Single|Double)Fc\[(\d{1,2})\]\s*=new\sArray\(((\d,)*\d)\);/

            const data = {
                name: "",
                ddrcode: "",
                scores: {
                    single: {},
                    double: {}
                },
            }
            string.split("\n").forEach((line) => {
                switch(true) {
                    case nameExp.test(line) :
                        matchedStrings = line.match(nameExp)
                        data.name = matchedStrings[1]
                        break;
                    case ddrcodeExp.test(line) :
                        matchedStrings = line.match(ddrcodeExp)
                        data.ddrcode = matchedStrings[1]
                        break;
                    case indexExp.test(line) :
                        matchedStrings = line.match(indexExp)
                        if(matchedStrings.length > 2){
                            if(!data.scores[matchedStrings[1].toLowerCase()][matchedStrings[2]]){
                                data.scores[matchedStrings[1].toLowerCase()][matchedStrings[2]] = {}
                            }
                            let splitString = []
                            if(matchedStrings[3]) {
                                splitString = matchedStrings[3].split(",")
                            }
                            data.scores[matchedStrings[1].toLowerCase()][matchedStrings[2]].indexes = splitString      
                        }
                        break; 
                    case musicExp.test(line) :
                        matchedStrings = line.match(musicExp)
                        if(matchedStrings.length > 2){
                            if(!data.scores[matchedStrings[1].toLowerCase()][matchedStrings[2]]){
                                data.scores[matchedStrings[1].toLowerCase()][matchedStrings[2]] = {}
                            }
                            let splitString = []
                            if(matchedStrings[3]) {
                                splitString = matchedStrings[3].replace(/'(.*),*(.*)'/g,"'$1$2'").split(",")
                            }
                            data.scores[matchedStrings[1].toLowerCase()][matchedStrings[2]].musics = splitString            
                        }
                        break; 
                    case sequenceExp.test(line) :
                        matchedStrings = line.match(sequenceExp)
                        if(matchedStrings.length > 2){
                            if(!data.scores[matchedStrings[1].toLowerCase()][matchedStrings[2]]){
                                data.scores[matchedStrings[1].toLowerCase()][matchedStrings[2]] = {}
                            }
                            let splitString = []
                            if(matchedStrings[3]) {
                                splitString = matchedStrings[3].split(",")
                            }
                            data.scores[matchedStrings[1].toLowerCase()][matchedStrings[2]].sequences = splitString      
                        }
                        break; 
                    case scoreExp.test(line) :
                        matchedStrings = line.match(scoreExp)
                        if(matchedStrings.length > 2){
                            if(!data.scores[matchedStrings[1].toLowerCase()][matchedStrings[2]]){
                                data.scores[matchedStrings[1].toLowerCase()][matchedStrings[2]] = {}
                            }
                            let splitString = []
                            if(matchedStrings[3]) {
                                splitString = matchedStrings[3].replace(/'(\d{1,}),(\d{1,})'/g,"'$1$2'").split(",")
                            }
                            data.scores[matchedStrings[1].toLowerCase()][matchedStrings[2]].scores = splitString        
                        }
                        break; 
                    case fcExp.test(line) :
                        matchedStrings = line.match(fcExp)
                        if(matchedStrings.length > 2){
                            if(!data.scores[matchedStrings[1].toLowerCase()][matchedStrings[2]]){
                                data.scores[matchedStrings[1].toLowerCase()][matchedStrings[2]] = {}
                            }
                            let splitString = []
                            if(matchedStrings[3]) {
                                splitString = matchedStrings[3].split(",")
                            }
                            data.scores[matchedStrings[1].toLowerCase()][matchedStrings[2]].fces = splitString    
                        }
                    break; 
                }
            }) 

            const result = {}

            result.ddrcode = data.ddrcode 
            result.name = data.name 
            result.scores = {}

            result.scores.single = convertDataScores(data.scores.single)
            result.scores.double = convertDataScores(data.scores.double)

            return result
        }

        const convertDataScores = (scores) => {
            let ret = {}
            Object.keys(scores).forEach(k => {
                newKey = `${parseInt(k)+1}`
                ret[newKey] = convertDataScore(scores[k])
            })
            return ret
        }

        const convertDataScore = (score) => {
            if(score.indexes.length <= 1){ return [] }
            let ret = []
            score.indexes.forEach((s, i) => {
                ret.push({
                    index:  parseInt(score.indexes[i]),
                    music:  score.musics[i],
                    sequence:  score.sequences[i],
                    score:  score.scores[i],
                    fc:  score.fces[i]
                })
            })
            return ret
        }

        let message = ""
        let statuscode = 404
        if(req.query.ddrcode.length === 8){
            message = JSON.stringify(parse(fetch(req.query.ddrcode)), null, "  ")
            statuscode = 200
        } else {
            message = "Something went wrong."
        }
        res.status(statuscode).send(message);
    }
};