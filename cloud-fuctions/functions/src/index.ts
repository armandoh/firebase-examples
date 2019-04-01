import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp()

// ** v2 cloud function
// it includes the use of atomic transactions, meaning they complete without the possibility of interruption
// we no longer have a 'race condition', if your code doesn't have this condition then there's no need to use 'transaction' otherwise it will just slow things down
export const onMessageCreate = functions.database
.ref('/rooms/{roomId}/messages/{messageId}')
.onCreate( async (snapshot, context) => {
    const roomId = context.params.roomId
    const messageId = context.params.messageId
    console.log(`New message ${messageId} in room ${roomId}`)

    const messageData = snapshot.val()
    const text = addPizzazz(messageData.text)

    await snapshot.ref.update({ text: text })

    const countRef = snapshot.ref.parent.parent.child('messageCount')
    return countRef.transaction(count => {
        return count + 1
    })
})

export const onMessageDelete = functions.database
.ref('/rooms/{roomId}/messages/{messageId}')
.onDelete( async (snapshot, context) => {
    
    const countRef = snapshot.ref.parent.parent.child('messageCount')
    return countRef.transaction(count => {
        return count - 1
    })
})


// ** v1 cloud fuction **
// export const onMessageCreate = functions.database
// .ref('/rooms/{roomId}/messages/{messageId}')
// .onCreate((snapshot, context) => {
//     const roomId = context.params.roomId
//     const messageId = context.params.messageId
//     console.log(`New message ${messageId} in room ${roomId}`)

//     const messageData = snapshot.val()
//     const text = addPizzazz(messageData.text)

//     return snapshot.ref.update({ text: text })
// })

function addPizzazz(text: string): string {
    return text.replace(/\bpizza\b/g, '🍕')
}

export const onMessageUpdate = functions.database
.ref('/rooms/{roomId}/messages/{messageId}')
.onUpdate((change, context) => {

    const before = change.before.val()
    const after = change.after.val()
    if(before.text === after.text){
        console.log("Text didn't change")
        return null
    }

    const text = addPizzazz(after.text)
    const timeEdited = Date.now()
    return change.before.ref.update({text, timeEdited})
})


// ** v2 cloud function **
// refactored code using async, await,and the try-catch block
export const getZMGAreaWeather =
functions.https.onRequest(async(request, response) =>{
    
    try {
        const areaSnapshot =  admin.firestore().doc("areas/greater-gdl").get()
        const cities = areaSnapshot.data().cities
        const promises = []
        for (const city in cities){
            const p = admin.firestore().doc(`cities-weather/${city}`).get()
            promises.push(p)
        }
        const citySnapshots= await Promise.all(promises)
        const results = []
        citySnapshots.forEach(citySnap => {
            const data = citySnap.data()
            data.city = citySnap.id
            results.push(data)
        })
        response.send(results)
    } catch (error) {
        console.log(error )
        response.status(500).send(error)   
    }
   
}) 

// ** v1 cloud function **
//  this code was refactored - take a look at v2 
/* 
export const getZMGAreaWeather =
functions.https.onRequest((request, response) =>{
    admin.firestore().doc("areas/greater-gdl").get()
    .then(areaSnapshot => {
        const cities = areaSnapshot.data().cities
        const promises = []
        for (const city in cities){
            const p = admin.firestore().doc(`cities-weather/${city}`).get()
            promises.push(p)
        }
        return Promise.all(promises)
    })
    .then (citySnapshots => {
        const results = []
        citySnapshots.forEach(citySnap => {
            const data = citySnap.data()
            data.city = citySnap.id
            results.push(data)
        })
        response.send(results)
    })
    .catch(error => {
        console.log(error)
        response.status(500).send(error)
    })
}) 
*/

// ** Cloud function - Firestore trigger Type **
// it returns a promise
export const onGuadalajaraWeatherUpdate = 
functions.firestore.document("cities-weather/guadalajara-jal-mx").onUpdate(change => {
    const after = change.after.data()
    const payload = {
        data: {
            temp: String(after.temp),
            conditions: after.conditions
        }
    }
    return admin.messaging().sendToTopic("weather_guadalajara-jal-mx", payload)
    .catch(error => {
        console.error("FCM failed", error)
    })
})




// ** v2 cloud function - HTTP trigger Type **
// refactored code using async, await,and the try-catch block
export const getGuadalajaraWeather = functions.https.onRequest(async (request, response) => {
    
    try{
       const snapshot = await admin.firestore().doc('cities-weather/guadalajara-jal-mx').get()
       const data = snapshot.data()
       response.send(data)
    }catch(error){
        console.log(error)
        response.status(500).send(error)
    }

}); 


// ** Cloud Functions **

/* 
-- Backend code for your firebase app
-- These functions respond to events that occur in google cloud services / firestore products
-- They run in google servers, 
-- AKA serverless architechture

-- Rules for terminating a Cloud Function
-- 1. HTTP triggers - send a response at the end, it's the same response obj the fuction received
        if you don't send a reponse(success/error) the function will hang out and the client will receive nothing
-- 2. Background triggers - return a promise


> firebase deploy --only functions --project $proj_id

*/

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript