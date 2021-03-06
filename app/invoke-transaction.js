var path = require('path');
var fs = require('fs');
var util = require('util');
var hfc = require('fabric-client');
var Peer = require('fabric-client/lib/Peer.js');
var helper = require('./helper.js');
var logger = helper.getLogger('invoke-chaincode');
var EventHub = require('fabric-client/lib/EventHub.js');
hfc.addConfigFile(path.join(__dirname, 'network-config.json'));
var ORGS = hfc.getConfigSetting('network-config');

var invokeChaincode = function(peerNames, channelName, chaincodeName, fcn, args, username, org) {
    logger.debug(util.format('\n============ invoke transaction on organization %s ============\n', org));
    var client = helper.getClientForOrg(org);
    var channel = helper.getChannelForOrg(org, channelName);
    if(peerNames != ""){
        var targets = buildTarget(peer,org)
    } else {
        var targets = (peerNames) ? help.newPeers(peerNames,org) : undefined; 
    }
    var tx_id = null;
    var return_response = {}

    return helper.getRegisteredUsers(username, org).then((user) => {
        tx_id = client.newTransactionID();
        logger.debug(util.format('Sending transaction "%j"', tx_id));
        // send proposal to endorser
        var request = {
            chaincodeId: chaincodeName,
            fcn: fcn,
            args: args,
            chainId: channelName,
            txId: tx_id
        };

        if (targets)
            request.targets = targets;
            
        return channel.sendTransactionProposal(request);
    }, (err) => {
        logger.error('Failed to enroll user \'' + username + '\'. ' + err);
        throw new Error('Failed to enroll user \'' + username + '\'. ' + err);
    }).then((results) => {
        var proposalResponses = results[0];
        var proposal = results[1];
        var header = results[2];
        var all_good = true;
        for (var i in proposalResponses) {
            let one_good = false;
            if (proposalResponses && proposalResponses[i].response &&
                proposalResponses[i].response.status === 200) {
                one_good = true;
                logger.info('transaction proposal was good');
            } else {
                logger.error('transaction proposal was bad');
            }
            all_good = all_good & one_good;
        }
        if (all_good) {
            logger.debug(util.format(
                'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
                proposalResponses[0].response.status, proposalResponses[0].response.message,
                proposalResponses[0].response.payload, proposalResponses[0].endorsement
                    .signature));
            // add response to result
            try{
                return_response.payload = JSON.parse(util.format("%s",proposalResponses[0].response.payload))
            }catch(e){
                return_response.payload = util.format("%s",proposalResponses[0].response.payload)
            }
            var request = {
                proposalResponses: proposalResponses,
                proposal: proposal,
                header: header
            };
            // set the transaction listener and set a timeout of 30sec
            // if the transaction did not get committed within the timeout period,
            // fail the test
            var transactionID = tx_id.getTransactionID();
            var eventPromises = [];

            if (!peerNames) {
				peerNames = channel.getPeers().map(function(peer) {
					return peer.getName();
				});
            }
            
            var eventhubs = helper.newEventHubs(peerNames, org);
            for (let key in eventhubs) {
                let eh = eventhubs[key];
                eh.connect();

                let txPromise = new Promise((resolve, reject) => {
                    let handle = setTimeout(() => {
                        eh.disconnect();
                        reject();
                    }, 30000);

                    eh.registerTxEvent(transactionID, (tx, code) => {
                        clearTimeout(handle);
                        eh.unregisterTxEvent(transactionID);
                        eh.disconnect();

                        if (code !== 'VALID') {
                            logger.error(
                                'The balance transfer transaction was invalid, code = ' + code);
                            reject();
                        } else {
                            logger.info(
                                'The balance transfer transaction has been committed on peer ' +
                                eh._ep._endpoint.addr);
                            resolve();
                        }
                    });
                });
                eventPromises.push(txPromise);
            };
            var sendPromise = channel.sendTransaction(request);
            return Promise.all([sendPromise].concat(eventPromises)).then((results) => {
                logger.debug(' event promise all complete and testing complete');
                return results[0]; // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
            }).catch((err) => {
                logger.error(
                    'Failed to send transaction and get notifications within the timeout period.'
                );
                return 'Failed to send transaction and get notifications within the timeout period.';
            });
        } else {
            logger.error(
                'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...'
            );
            return 'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...';
        }
    }, (err) => {
        logger.error('Failed to send proposal due to error: ' + err.stack ? err.stack :
            err);
        return 'Failed to send proposal due to error: ' + err.stack ? err.stack :
            err;
    }).then((response) => {
        if (response.status === 'SUCCESS' || response.status === '200') {
            logger.info('Successfully sent transaction to the orderer.');
            // return tx_id.getTransactionID();
            logger.info(response.status)
            return_response.tx_id = tx_id.getTransactionID();
            return return_response
        } else {
            logger.error('Failed to order the transaction. Error response: ' + util.format("%s",response));
            return 'Failed to order the transaction. Error response: ' + util.format("%s",response);
        }
    }, (err) => {
        logger.error('Failed to send transaction due to error: ' + err.stack ? err
            .stack : err);
        return 'Failed to send transaction due to error: ' + err.stack ? err.stack :
            err;
    });
};

function buildTarget(peer, org) {
	var target = null;
	if (typeof peer !== 'undefined') {
		let targets = helper.newPeers([peer], org);
		if (targets && targets.length > 0) target = targets[0];
	}

	return target;
}

exports.invokeChaincode = invokeChaincode;