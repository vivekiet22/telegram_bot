require('dotenv').config()
const mongoose = require('mongoose');


const TelegramBot = require("node-telegram-bot-api");
const Subscribers = require('./model/subscriber');

const weather = require('openweather-apis');
// getting the temperature of delhi
weather.setLang('en');
weather.setCity('Delhi')
weather.setUnits('metric')
weather.setAPPID(process.env.ownKey);


const token = `${process.env.TOKEN}`

const DB_PASSWORD = process.env.DB_PASSWORD;
const DB = process.env.DB.replace(`<PASSWORD>`, DB_PASSWORD);


main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(DB).then(console.log("connected to db"));
  
}



bot = new TelegramBot(token,{polling:true})


bot.on('message',async (msg) => {
    const chatId = msg.chat.id;
    let Sub = "subscribe"
    let unSub = "unsubscribe"

    if (msg.text.toString().toLowerCase()===unSub) {
        try{
            const currUser =await Subscribers.findOne({user:chatId})
            if (!currUser.subscribed){
                bot.sendMessage(chatId,"Already Unsubscribed")
                return 
            }
            await Subscribers.findOneAndUpdate({user:chatId},{subscribed:false})
            console.log("unsubscribed")
            bot.sendMessage(chatId,"You have successfully unsubscribed this bot .Now you will not get the temperature of Delhi every one hour")
            
        }
        catch(err){
            console.log(err.message)
        }

    }
    else if(msg.text.toString().toLowerCase()===Sub) {
        try{
            const currUser =await Subscribers.findOne({user:chatId})
            if (currUser.subscribed){
                bot.sendMessage(chatId,"Already Subscribed")
                weather.getTemperature(function(err, temp){
                    bot.sendMessage(chatId,`For your Information ,Temperature in Delhi is : ${temp} degree celcius`)
                });

                
            }
            else{
                await Subscribers.findOneAndUpdate({user:chatId},{subscribed:true})
                console.log("subscribed :)")
                weather.getTemperature(function(err, temp){
                    console.log(temp);
                    bot.sendMessage(chatId,"subscribed the bot ,you will get the temerarture of delhi every 1 hour");
                    bot.sendMessage(chatId,`Temperature in Delhi is : ${temp} degree celcius`)
                });
                // await weather.getTemperature(async (error, temp)=>{
                //     bot.sendMessage(chatId,"subscribed the bot ,you will get the temerarture of delhi every 1 hour");
                // bot.sendMessage(chatId,`Temperature in Delhi is : ${temp} degree celcius`)
                // }
            }

        }
        catch(err){
            console.log(err.message)
        }

    }
    else{
        const subs = await Subscribers.findOne({user:chatId})
        if (subs){
            // console.log(subs)
            console.log("User already added to database")
        }
        else{
            
            await Subscribers.create({user:chatId})
        }
        bot.sendMessage(chatId,`
        Hiii,type SUBSCRIBE to subscribe the bot and UNSUBSCRIBE to unsubscribe the bot
        `)
    }

});




// creting a function to load the user 

const getSubscriber = async ()=>{
try{
    const allSub = await Subscribers.find({subscribed:true})
    return allSub
}
catch(err){
    console.log(err.message)
}
}




// to run every hour
setInterval( async () => {
    await weather.getTemperature(async function(err, temp){
        if (err){
            // bot.sendMessage()
            console.log(err)
            return 
        }
        console.log(temp);
        activeUser = await getSubscriber()
        activeUser.map((data)=>{
            console.log("-------------------")
            // console.log((data.user))
            bot.sendMessage(data.user,`Temperature in Delhi is : ${temp} degree celcius`)
    })
    });




    
}, 20000);

  

