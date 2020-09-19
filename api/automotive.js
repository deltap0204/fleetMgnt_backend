const AWS = require("aws-sdk");
const jira = require("./jira");


var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({
  region: "us-east-1"
});

module.exports.createuser = async event => {
  console.log("create user");

  try {
    switch(event.resource){
      case '/list/users':
         res = await listUsers();
         break;
      case '/create/user':
         res = await createTheUser("otm", JSON.parse(event.body));
         break;
      case '/delete/user':
         res = await deleteUser(JSON.parse(event.body));
         break;
      case '/edit/customer':
        res = await editCustomer(JSON.parse(event.body));
        break;
      case '/getfilter':
        res = await getfilter(event);
        break;
      case '/getticketdetails/{key}':
        console.log("->" + event.pathParameters.key);
        res = await jira.getDetails(event.pathParameters.key);
        break;
      case '/issue/getImage/{id}/{image}':
        var {id,image} = event.pathParameters;
        res = await jira.getImage(id,image);
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
            body: `data:image/png;base64,${res}`,
            isBase64Encoded: true
          };
        break;
      case '/issue/getThumbnail/{id}/{image}':
        var {id,image} = event.pathParameters;
        res = await jira.getImageThumbnail(id,image);
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
            body: `data:image/png;base64,${res}`,
            isBase64Encoded: true
          };
        break;
      case '/issue/images':
         res = await jira.getImages(JSON.parse(event.body));
         break;
      case '/create/comment':
          res = await jira.addcomment(event);
          break;
      case '/create/location':
        res = await jira.addLocation(event);
        console.log(JSON.stringify(res))
        break;
    }

    
    //await setPwd(event.body.emailAddress,event.body.password);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(res)
    };
  } catch (err) {
    console.log(err)
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(err.message)
    };
  }

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
async function createTheUser(who, inputFilter) {
  await createUser(
    inputFilter.emailAddress,
    inputFilter.password,
    inputFilter.customer,
    inputFilter.isAdmin,
    inputFilter.name
  );
  await setPwd(inputFilter.emailAddress, inputFilter.password);
}

async function createUser(_email, _tmpPwd, _customer, _isAdmin,name) {
  var params = {
    UserPoolId: "us-east-1_5TQpFMYfs",
    Username: _email,
    DesiredDeliveryMediums: ["EMAIL"],
    MessageAction: "SUPPRESS",
    TemporaryPassword: _tmpPwd,
    UserAttributes: [
      {
        Name: "custom:customers" /* required */,
        Value: _customer
      },
      {
        Name: "email" /* required */,
        Value: _email
      },

      {
        Name: "custom:isAdmin" /* required */,
        Value: _isAdmin
      },
      {
        Name: "custom:name" /* required */,
        Value: name
      }
    ]
  };
  return new Promise(function(resolve, reject) {
    cognitoidentityserviceprovider.adminCreateUser(params, function(err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
        reject(err, err.stack);
      } else {
        console.log(data); // successful response
        //setPwd(_email, _tmpPwd);  // hier stond een await; dat mag niet!!
        resolve(data);
      }
    });
  });
}

async function setPwd(_email, _pwd) {
  var params = {
    Password: _pwd /* required */,
    UserPoolId: "us-east-1_5TQpFMYfs" /* required */,
    Username: _email /* required */,
    Permanent: true
  };
  return new Promise(function(resolve, reject) {
    cognitoidentityserviceprovider.adminSetUserPassword(params, function(
      err,
      data
    ) {
      if (err) {
        console.log(err, err.stack); // an error occurred
        reject(err, err.stack);
      } else {
        console.log(data); // successful response
        resolve(data);
      }
    });
  });
}

async function deleteUser(body) {
  
  var params = {
    UserPoolId: 'us-east-1_5TQpFMYfs', /* required */
    Username: body.email /* required */
  };
  console.log(params);
  return new Promise(function (resolve, reject) {
    cognitoidentityserviceprovider.adminDeleteUser(params, function (err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
        reject(err, err.stack);
      }
      else {
        console.log(data);           // successful response
        resolve(data);
      }
    });
  });
}

async function editCustomer(request) {
  var params = {
    UserAttributes: [ /* required */
      {
        Name: 'custom:customers', /* required */
        Value: request.customer
      },
      {
        Name: 'custom:language', /* required */
        Value: request.language
      },
      {
        Name: 'custom:isAdmin', /* required */
        Value: request.isAdmin
      }
    ],
    UserPoolId: 'us-east-1_5TQpFMYfs', /* required */
    Username: request.Username /* required */
  };
  return new Promise(function (resolve, reject) {
    cognitoidentityserviceprovider.adminUpdateUserAttributes(params, function (err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
        reject(err, err.stack);
      }
      else {
        console.log(data);           // successful response
        resolve(data);
      }
    });
  });
}

async function listUsers() {
  var params = {
    UserPoolId: 'us-east-1_5TQpFMYfs'//, /* required */
  };
  return new Promise(function (resolve, reject) {
    cognitoidentityserviceprovider.listUsers(params, function (err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
        reject(err, err.stack);
      }
      else {
        console.log(data);           // successful response
        console.log(data.Users[0].Attributes);           // successful response
        resolve(data);
      }
    });

  });
  // return;
}

async function getfilter(event) {
  var inputFilter = JSON.parse(event.body);


  res = await jira.searchIssues(inputFilter.customer, inputFilter);

  console.log("THIS IS WHAT WE SEN?D : " + res);
  return res;
}
