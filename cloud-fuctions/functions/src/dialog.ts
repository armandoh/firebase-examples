import * as admin from 'firebase-admin'

// -- Get the service-account.json from your Firebase console --
// 1. Go to https://console.firebase.google.com/
// 2. Select your project, then Project Settings
// 3. Click the Service Accounts tab, and click Generate new private key
// 4. Click Generate key, and save the json file, then rename it as service-account.json 
// 



const serviceAccount = require('../service-account.json')
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
}) 

;(async () =>{
    await chat('pizzachat', 'Fear', "What the heck is that?")
    await chat('pizzachat', 'Joy', "Who puts broccoli on pizza?")
    await chat('pizzachat', 'Disgust', "That's i. I'm done!")
    await chat('pizzachat', 'Anger', "Congrats, Gdl! You've ruined pizza")
    process.exit(0)
})()
.catch(err=>{console.error(err)})


async function chat(room: string, name: string, text:string){
    const messageRef = admin.database().ref('rooms').child(room).child('messages')
    await messageRef.push({name, text})
    console.log(`${name}: ${text}`)
    await sleep(2000)
}

function sleep(ms: number){
    return new Promise(resolve => setTimeout(resolve, ms))
}

