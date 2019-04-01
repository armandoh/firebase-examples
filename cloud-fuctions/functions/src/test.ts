async function myFunction(){
    try{
        const rank = await getRank()
        return "firebase is #" + rank    
    }catch(error){
        return "Error: "+error
    }
}

function getRank(){
    return Promise.resolve(1)
}


// 1. Functions marked with the async keyword always return a Promise
// 2. If the return value from inside an Async Functions is not a Promise, it will be wrapped automatically as a Promise 
// 3. The await keyword will pause the async function until the Promise is complete
// 4. An await will always return the value or the error from the Promise
// 5. await is only used inside an async function otherwise it throws an error
