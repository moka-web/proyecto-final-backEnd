const logger = require('../config/winston');

const accountSid = 'ACa3358f5965962ce0693aa48ea0323f43'; 
const authToken = '8db75861f1941c38a3619e93ee4ef6d1'; 
const client = require('twilio')(accountSid, authToken); 

const sendSms= async(body)=>{
    try {
      const message = client.messages 
      .create({ 
         body: body,  
         messagingServiceSid: 'MG4a1c44b1017e069396f89b935c91dab1',      
         to: '+5492281464044' 
       })
       logger.info('se envio el sms')
    } catch (error) {
      logger.error(error)
    }
  }
  
  module.exports=sendSms;