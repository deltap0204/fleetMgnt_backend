const aws = require("aws-sdk");
var ses = new aws.SES({region: 'us-east-1'});


module.exports.handler = async (event,context,callback) => {
console.log(event.request.userAttributes.email)
    if (event.request.userAttributes.email) {
        console.log('under this')
        var params = {
          Destination: {
              ToAddresses: ['frank@frict.be']
          },
          Message: {
              Body: {
                  Text: { Data: `Hi Frank, \nUser ${event.request.userAttributes.email} has registered.`
                      
                  }
                  
              },
              
              Subject: { Data: "New User Registeration"
                  
              }
          },
          Source: "frank@frict.be"
      };

      
      const data = await ses.sendEmail(params).promise();
     
      context.done(null, event);
    } else {
        // Nothing to do, the user's email ID is unknown
        console.log('email id is null')
        callback(null, event);
    }

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
   //return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};


