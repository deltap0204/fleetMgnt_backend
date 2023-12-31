
//const log = require('lambda-log');
const request = require('request');
const ST = require('stjs');
var randomstring = require("randomstring");

const download = require('image-downloader');

const AWS = require('aws-sdk');
const axios = require('axios');
const fs = require('fs');
var s3 = new AWS.S3();
var ses = new AWS.SES({region: 'us-east-1'});




// var templateDetails = {

//     "contactInfo": "{{this.fields.customfield_10079}}",
//     "jobType": "{{this.fields.customfield_10060.value}}",
//     "installationAddress": "{{this.fields.customfield_10061}}",
//     "vehiculeBrand": "{{this.fields.customfield_10062}}",
//     "vehiculeType": "{{this.fields.customfield_10063}}",
//     "contact": "{{this.fields.customfield_10065}}",
//     "status": "{{this.fields.status.name}}",
//     "customerReference": "{{this.fields.customfield_10057}}",
//     "summary": "{{this.fields.summary}}",
//     "customer": "{{this.fields.customfield_10056}}",
//     "resolutiondate": "{{this.fields.resolutiondate}}"


// }


async function searchIssues(who, cutomFilter) {


    // let nu = Date.now();

    // if ((nu - lastConfigRead) > _timeout) {
    //     log.info("Config timed out.");
    //      = await config.readCondig(_stage, _tenant);
    //     lastConfigRead = nu;
    //     passwords.setConfig();
    // }
    let authResult = await filter(who, cutomFilter);
    return authResult;
}


module.exports.searchIssues = searchIssues;
module.exports.addcomment = addcomment;
module.exports.getDetails = getDetails;
module.exports.getImage = getImage;
module.exports.getImageThumbnail = getImageThumbnail;
module.exports.getImages = getImages;
module.exports.downloadFVDImage = downloadFVDImage;
module.exports.downloadFVDImage2 = downloadFVDImage2;
module.exports.addLocation = addLocation;
module.exports.updateTicket = updateTicket;



async function addLocation(event){
    var inputFilter = JSON.parse(event.body);
  

    console.log('in add location', inputFilter);

    var options = {
        method: 'PUT',
        url: 'https://otm-zenith.atlassian.net/rest/api/3/issue/' + inputFilter.key,
        headers:
        {
            Authorization: 'Basic ZnJhbmsudmFuZGFtbWVAb3RtZ3JvdXAuYmU6TUxDaW83Z0Q1bTk3NkxtbXRUSllCNDE1',
            //Authorization: 'Basic ZnJhbmtAb3RtLmJlOkJrUGs2ZWYxYm84SFdBZ2JVOUQ3QTkyQg==',
            'Content-Type': 'application/json'
        },
        body: inputFilter.body,
        json: true
    };

    return new Promise(function (resolve, reject) {


        request(options, function (error, res, body) {
            //console.log(res.statusCode);
            if (!error && res.statusCode == 204) {
               

                resolve(body);

            } else {
                reject(body + error);
            }
        });
    });

}
async function getDetails(key) {


    var options = {
        method: 'GET',
        url: 'https://otm-zenith.atlassian.net/rest/api/3/issue/' + key,
        headers:
            { Authorization: 'Basic ZnJhbmsudmFuZGFtbWVAb3RtZ3JvdXAuYmU6TUxDaW83Z0Q1bTk3NkxtbXRUSllCNDE1' }
    };

    /*    request(options, function (error, response, body) {
          if (error) throw new Error(error);
        
          console.log(body);
        });
    */

    return new Promise(function (resolve, reject) {


        request(options, function (error, res, body) {
            console.log(body);
            if (!error && res.statusCode == 200) {
                var template = {
                    "id": "{{id}}",
                    "key": "{{this.key}}",
                    "type": "{{this.fields.issuetype.name}}",
                    "issueTypeId": "{{this.fields.issuetype.id}}", //new
                    "contactInfo": "{{this.fields.customfield_10079}}",
                    "installationAddress": "{{this.fields.customfield_10061}}",
                    "district": "{{this.fields.customfield_10129}}",//new
                    "location": "{{this.fields.customfield_10132}}",//new
                    "vehiculeBrand": "{{this.fields.customfield_10062}}",
                    "vehiculeType": "{{this.fields.customfield_10063}}",
                    "contact": "{{this.fields.customfield_10065}}",
                    "status": "{{this.fields.status.name}}",
                    "statusId": "{{this.fields.status.id}}",//new
                    "customerReference": "{{this.fields.customfield_10057}}",
                    "summary": "{{this.fields.summary}}",
                    "customer": "{{this.fields.customfield_10056}}",
                    "resolutiondate": "{{this.fields.resolutiondate}}",
                    "licencePlate":"{{this.fields.customfield_10059}}",
                    "chassis":"{{this.fields.customfield_10058}}",
                    "vehicle_version":"{{this.fields.customfield_10064}}",
                    "field_1":"{{this.fields.customfield_10178}}",
                    "field_2":"{{this.fields.customfield_10179}}",
                    "field_3":"{{this.fields.customfield_10180}}",
                    "field_4":"{{this.fields.customfield_10182}}",
                    "field_5":"{{this.fields.customfield_10183}}",
                    "due_date":"{{this.fields.duedate}}",
                    "location1":"{{this.fields.customfield_10101}}",
                    "salesorder":"{{this.fields.customfield_10175}}",

                    "instructions": {
                        "{{#each this.fields.customfield_10080}}": {
                            "id": "{{id}}",
                            "value":"{{value}}"
                        }
                    },
                    "fluvius_instructions": {
                        "{{#each this.fields.customfield_10105}}": {
                            "id": "{{id}}",
                            "value":"{{value}}"
                        }
                    },
                    "infrabel_instructions": {//new
                        "{{#each this.fields.customfield_10128}}": {
                            "id": "{{id}}",
                            "value":"{{value}}"
                        }
                    },
                    "images": {
                        "{{#each this.fields.attachment}}": {
                            "id": "{{id}}",
                            "filename": "{{filename}}",
                            "mimeType": "{{mimeType}}",
                            "size": "{{size}}",
                            "content": "{{content}}",
                            "thumbnail":"{{thumbnail}}"
                        }
                    },
                    "locationCoordinates":"{{this.fields.customfield_10101}}",
                };


                // var templateImages = {
                //     "id": "{{id}}",
                //     "key": "{{this.key}}",
                //     "images": {
                //         "{{#each this.fields.attachment}}": {
                //             "filename": "{{filename}}",
                //             "mimeType": "{{mimeType}}",
                //             "size": "{{size}}",
                //             "content": "{{content}}",
                //         }
                //     }
                // };

                //console.log("b : " + body);
                //console.log("t : " + template);

                var xxx = ST.select(JSON.parse(body)).transformWith(template).root();
                //var yyy = ST.select(JSON.parse(body)).transformWith(templateImages).root();

    
            

                resolve(JSON.stringify(xxx));

            } else {
                log.warn("WARNING WARNING WARNING");
                log.error(error);
                log.error(body);
                reject(body + error);
            }
        });
    });



}

async function downloadFVDImage(image) {
    console.log(image);
    // console.log('aaaaaaaaa         '+image.filename);
    const options = {
        url: image.content,
        dest: '/tmp/' + image.filename,
        headers:
            { Authorization: 'Basic ZnJhbmsudmFuZGFtbWVAb3RtZ3JvdXAuYmU6TUxDaW83Z0Q1bTk3NkxtbXRUSllCNDE1' }
    };
    try {
        const { filename, newImage } = await download.image(options)
        console.log("@@@@@@@@" + filename) // => /path/to/dest/image.jpg 
        await saveToS3(image.filename, filename);

    } catch (e) {
        console.error('This is an error : ' + e)
    }
}


async function downloadFVDImage2(id, image) {
    console.log(id);
    console.log(image);
    // console.log('aaaaaaaaa         '+image.filename);
    const options = {
        url: image.content,
        dest: '/tmp/' + id + '_' + image.id + '_' + image.filename,
        headers:
            { Authorization: 'Basic ZnJhbmsudmFuZGFtbWVAb3RtZ3JvdXAuYmU6TUxDaW83Z0Q1bTk3NkxtbXRUSllCNDE1' }
    };
    try {
        if (!(await existsOnS3(id + '_' + image.id + '_' + image.filename))) {
            const { filename, newImage } = await download.image(options)
            console.log("@@@@@@@@" + filename) // => /path/to/dest/image.jpg 
            await saveToS3(id + '_' + image.id + '_' + image.filename, filename);
        }
    } catch (e) {
        console.error('This is an error : ' + e)
    }
}


async function existsOnS3(shortfilename) {
    console.log(shortfilename);

    var params2 = {
        Bucket: 'be.frict.test',
        Key: "img/" + shortfilename
    };


    const doesItExist =  await s3.headObject(params2).promise().then(function (data) {

    
        console.log(data);
        console.log('No need to save it, because we already have it!!');
        return true;
    }).catch(async function (err) {
        return false;
    });

}



async function saveToS3(shortfilename, someFileName) {
    console.log(shortfilename);
    console.log(someFileName);
    //configuring parameters
    var params = {
        Bucket: 'be.frict.test',
        Body: fs.createReadStream(someFileName),
        Key: "img/" + shortfilename
    };

    var params2 = {
        Bucket: 'be.frict.test',
        Key: "img/" + shortfilename
    };


    // const itExists = 
    await s3.headObject(params2).promise().then(function (data) {
        console.log(data);
        console.log('No need to save it, because we already have it!!');
    }).catch(async function (err) {
        console.log(err);
        if (err.code === 'NotFound') {
            try {
                const data = await s3.upload(params).promise();
                console.log("Uploaded in:", data);
            } catch (uploadError) {
                console.log('Failed to uplaod ' + someFileName + ' to ' + params.Bucket + '/' + params.Key);
            }
        }
    });

}

async function getImage(id,image) {


   const imageBase64 = await axios.get(`https://otm-zenith.atlassian.net/secure/attachment/${id}/${image}`, {responseType: 'arraybuffer',headers:
   { Authorization: 'Basic ZnJhbmsudmFuZGFtbWVAb3RtZ3JvdXAuYmU6TUxDaW83Z0Q1bTk3NkxtbXRUSllCNDE1' }})
   .then(response => Buffer.from(response.data, 'binary').toString('base64')).catch(err=>err);

   return imageBase64;
 


}

async function getImageThumbnail(id,image) {


    const imageBase64 = await axios.get(`https://otm-zenith.atlassian.net/secure/thumbnail/${id}/${image}`, {responseType: 'arraybuffer',headers:
    { Authorization: 'Basic ZnJhbmsudmFuZGFtbWVAb3RtZ3JvdXAuYmU6TUxDaW83Z0Q1bTk3NkxtbXRUSllCNDE1' }})
    .then(response => Buffer.from(response.data, 'binary').toString('base64')).catch(err=>err);
 
    return imageBase64;
  
 
 
 }

async function getImages(images) {

    
    for (let index = 0; index < images.length; index++) {
        let currentImage = images[index];
        let imageBase64 = await axios.get(`${currentImage.content}`, {responseType: 'arraybuffer',headers:
        { Authorization: 'Basic ZnJhbmsudmFuZGFtbWVAb3RtZ3JvdXAuYmU6TUxDaW83Z0Q1bTk3NkxtbXRUSllCNDE1' }})
        .then(response => Buffer.from(response.data, 'binary').toString('base64')).catch(err=>err);
        images[index].contentBase64 = `data:${currentImage.mimeType};base64,${imageBase64}`;
        
    }
 
    return images;
  
 
 
 }


async function addcomment(event) {
    var inputFilter = JSON.parse(event.body);
    

    var someText = '--- This comment was added using the webapp by ' + inputFilter.email + ' --- \n ' + inputFilter.comment;
    console.log(someText);

    var theComment = {
        "body": {
            "type": "doc",
            "version": 1,
            "content": [
                {
                    "type": "paragraph",
                    "content": [
                        {
                            "type": "text",
                            "text": someText
                        }
                    ]
                }
            ]
        }
    };


    console.log(theComment);

    var options = {
        method: 'POST',
        url: 'https://otm-zenith.atlassian.net/rest/api/3/issue/' + inputFilter.issueId + '/comment',
        headers:
        {
            Authorization: 'Basic ZnJhbmsudmFuZGFtbWVAb3RtZ3JvdXAuYmU6TUxDaW83Z0Q1bTk3NkxtbXRUSllCNDE1',
            //Authorization: 'Basic ZnJhbmtAb3RtLmJlOkJrUGs2ZWYxYm84SFdBZ2JVOUQ3QTkyQg==',
            'Content-Type': 'application/json'
        },
        body: theComment,
        json: true
    };

    var params = {
        Destination: {
            ToAddresses: ['frank@frict.be']
        },
        Message: {
            Body: {
                Text: { Data: `Hi Frank, \nUser ${inputFilter.email} has posted comment.\n Comment:- ${inputFilter.comment}\n Link:- https://otm-zenith.atlassian.net/browse/${inputFilter.issueId}`
                    
                }
                
            },
            
            Subject: { Data: `New Comment posted on ${inputFilter.issueId}`
                
            }
        },
        Source: "frank@frict.be"
    };

    const data = await ses.sendEmail(params).promise();
    return new Promise(function (resolve, reject) {


        request(options, function (error, res, body) {
            //console.log(res.statusCode);
            if (!error && res.statusCode == 201) {
               

                resolve(body);

            } else {
                reject(body + error);
            }
        });
    });




}


async function filter(who, cutomFilter) {
    console.log(who);
    console.log(JSON.stringify(cutomFilter));


    //-->customer --> 
    //resolutionDateBegin -->     
    //resolutionDateEnd -->     

    var myQuery = 'project = WT';
    if (!who || typeof who == 'undefined') {
        console.log("No customer defined yet.  Not allowing anything!");
        myQuery += ' and customer ~ \'' + randomstring.generate(); + '\'';
    } else
        if (who != 'OTM') {
            myQuery += ' and customer ~ \'' + who + '\'';
        }
    if (cutomFilter.key) {
        myQuery += ' and key = ' + cutomFilter.key;
    }
    if (cutomFilter.status) {
        myQuery += ' and status = \'' + cutomFilter.status + '\'';
    }
    if (cutomFilter.jobType) {
        myQuery += ' and \'Job type\' = \'' + cutomFilter.jobType + '\'';
    }
    if (cutomFilter.address) {
        myQuery += ' and cf[10061] ~ \'' + cutomFilter.address + '\'';
    }
    if (cutomFilter.licensePlate) {
        myQuery += ' and summary ~ \'' + cutomFilter.licensePlate + '\'';
    }
    if (cutomFilter.brand) {
        myQuery += ' and cf[10062] ~ \'' + cutomFilter.brand + '\'';
    }
    if (cutomFilter.contact) {
        myQuery += ' and cf[10065] ~ \'' + cutomFilter.contact + '\'';
    }
    if (cutomFilter.brandType) {
        myQuery += ' and cf[10063] ~ \'' + cutomFilter.brandType + '\'';
    }
    if (cutomFilter.customerReference) {
        myQuery += ' and cf[10057] ~ \'' + cutomFilter.customerReference + '\'';
    }
    if (cutomFilter.resolutionDateBegin) {
        myQuery += ' and resolutiondate >= \'' + cutomFilter.resolutionDateBegin + '\'';
    }
    if (cutomFilter.resolutionDateEnd) {
        myQuery += ' and resolutiondate <= \'' + cutomFilter.resolutionDateEnd + '\'';
    }
    if (cutomFilter.chassyNumber) {
        myQuery += ' and cf[10058] = \'' + cutomFilter.chassyNumber + '\'';
    }

    if (cutomFilter.field1) {
        myQuery += ' and cf[10178] = \'' + cutomFilter.field1 + '\'';
    }

    if (cutomFilter.field2) {
        myQuery += ' and cf[10179] = \'' + cutomFilter.field2 + '\'';
    }

    if (cutomFilter.field3) {
        myQuery += ' and cf[10180] = \'' + cutomFilter.field3 + '\'';
    }

    if (cutomFilter.field4) {
        myQuery += ' and cf[10181] = \'' + cutomFilter.field4 + '\'';
    }

    if (cutomFilter.field5) {
        myQuery += ' and cf[10182] = \'' + cutomFilter.field5 + '\'';
    }
   if (cutomFilter.issueType) {
        myQuery += ' and issuetype != \'' + cutomFilter.issueType + '\'';
    }


    // 'Job type'


    console.log(myQuery);

    var startAt = 0;

    if(cutomFilter.startAt){
        startAt = cutomFilter.startAt;
    }

    var options = {
        method: 'POST',
        url: 'https://otm-zenith.atlassian.net/rest/api/3/search',
        headers:
        {
            Authorization: 'Basic ZnJhbmsudmFuZGFtbWVAb3RtZ3JvdXAuYmU6TUxDaW83Z0Q1bTk3NkxtbXRUSllCNDE1',
            //Authorization: 'Basic ZnJhbmtAb3RtLmJlOkJrUGs2ZWYxYm84SFdBZ2JVOUQ3QTkyQg==',
            'Content-Type': 'application/json'
        },
        body:
        { //jql: 'project = WT2 and type = Epic and summary ~ "700 voertuigen"',
            jql: myQuery,
            startAt: startAt,
            maxResults: 25,
            //         fields: [ 'summary' , 'status', 'customfield_10011','customfield_10012'],
            fields: ['summary', 'attachment', 'status', 'resolutiondate', 'customfield_10079', 'customfield_10060', 'customfield_10061', 'customfield_10062', 'customfield_10063', 'customfield_10065', 'customfield_10056', 'customfield_10057','customfield_10059','customfield_10175','customfield_10178','customfield_10179','customfield_10180','customfield_10181','customfield_10182','customfield_10058'],
            fieldsByKeys: false
        },
        json: true
    };

    return new Promise(function (resolve, reject) {
        console.log(options);
        request(options, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                console.log(res);
                console.log(body);

                var template = {
                    "startAt": "{{startAt}}",
                    "maxResults": "{{maxResults}}",
                    "total": "{{total}}",
                    "issues": {
                        "{{#each issues}}": {
                            "id": "{{this.id}}",
                            "key": "{{this.key}}",
                            "summary": "{{this.fields.summary}}",
                            "status": "{{this.fields.status.name}}",
                            "contactInfo": "{{this.fields.customfield_10079}}",
                            "jobType": "{{this.fields.customfield_10060.value}}",
                            "installationAddress": "{{this.fields.customfield_10061}}",
                            "vehiculeBrand": "{{this.fields.customfield_10062}}",
                            "vehiculeType": "{{this.fields.customfield_10063}}",
                            "contact": "{{this.fields.customfield_10065}}",
                            "customer": "{{this.fields.customfield_10056}}",
                            "customerReference": "{{this.fields.customfield_10057}}",
                            "licencePlate": "{{this.fields.customfield_10059}}",
                            "resolutiondate": "{{this.fields.resolutiondate}}",
                            "attachments": "{{this.fields.attachment}}",
                            "salesorder":"{{this.fields.customfield_10175}}",
                            "crf1":"{{this.fields.customfield_10178}}",
                            "crf2":"{{this.fields.customfield_10179}}",
                            "crf3":"{{this.fields.customfield_10180}}",
                            "crf4":"{{this.fields.customfield_10181}}",
                            "crf5":"{{this.fields.customfield_10182}}",
                            "platenumber":"{{this.fields.customfield_10058}}",
                            "issueType":"{{this.fields.issueType}}
                        }
                       
                    }
                };

                resolve(ST.select(body).transformWith(template).root());

            } else {
                log.warn("WARNING WARNING WARNING");
                log.error(error);
                log.error(body);
                reject(body + error);
            }
        });
    });
}
//module.exports.authenticateUser = authenticateUser;
