const func = require('./function/function')

func.fetchScores({query: {ddrcode: "51508903"}},{
    status (code){
        console.log(code)
        return {
            send (message){
                console.log(message)
            }
        }
    } 
})