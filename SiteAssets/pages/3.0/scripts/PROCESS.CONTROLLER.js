var flst = {};
var maindata = [];
function activateDatasets(cdmSites, allHazardsData) {
 maindata = allHazardsData;
    $(".dataset")
        .off("click")
        .on("click", function() {
            var hc = $(this).hasClass("active");
            $(".dataset").removeClass("active");
            $(".tpos-btn").removeClass("tpos-btn-active");
            // $('.add').addClass('tpos-btn-active');

            if (hc == 0) {
                var rid = $(this).attr("id");
                var trid = rid.split("_");
                var i = trid[1];
                $(this).addClass("active");
                var role = $("#" + rid + "_cdmUserRole").data("elementname");
                var comp = $("#" + rid + "_cdmCompany").data("elementname");
                var site = $("#" + rid + "_cdmSite").data("elementname");
                // toastr.success('getting user data');
                setupuserstats(role, comp, site, allHazardsData);
                // main.setup_user(role,comp,site);
            }
            if (hc == 1) {
                // main.setup_welcome();
                setupmainareastats(null, cdmSites, allHazardsData);
                // toastr.success('back home');
            }
        });
    $(".add")
        .off("click")
        .on("click", function() {
            var hc = $(this).hasClass("tpos-btn-active");
            $(".dataset").removeClass("active");
            $(".tpos-btn").removeClass("tpos-btn-active");
            if (hc == 0) {
                $(".add").addClass("tpos-btn-active");
                setupnewhazard();
            }
            if (hc == 1) {
                $(this).removeClass("tpos-btn-active");
                setupmainareastats(null, cdmSites, allHazardsData);
            }
        });
    $(".xtrabtn")
        .off("click")
        .on("click", function() {
            
            var ulink = $(this).data('action');
            // window.location.href = 'https://tidewayeastlondon.sharepoint.com/sites/powerbi/SitePages/CDM-Risk-Register.aspx';
            // window.location.href = ulink;
            //window.open(ulink, '_blank');
            if (ulink.startsWith('https')) {
                window.open(ulink, '_blank');
            }
            if (ulink == 'addfilters'){
                gimmepops("Filter selection pane",
          
                '<p style="color:white"><Strong>Note : <Strong> Filters will work only on Home Screen <p>'+
                '<div id="popscontentarea"><i class="fa fa-spinner fa-spin"></i> Loading data</div>');
                $('#langOpt').multiselect({
                    columns: 1,
                    placeholder: 'Select Languages',
                    search: true,
                    selectAll: true
                });
                tposcustomfilters(maindata);
            }
            if (ulink == 'synccsv') {
                // First get the user roles and verify that they are allowed to archive hazards
                const userId = _spPageContextInfo.userId;
                const usersListUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getByTitle(%27cdmUsers%27)/items?$filter=cdmUser%20eq%20${userId}`;
                $.ajax({
                    url: usersListUrl,
                    method: 'GET',
                    headers: {
                        "Accept": "application/json; odata=verbose"
                    },
                    success: (userData) => {
                        if (userData.d.results.length == 0) {
                            toastr.error('You do not have any user roles assigned. Please ask your system administrator to add you to the system.')
                        } else {
                            // Now we need to get the user roles data and match the id from the user data
                            const userRolesUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getByTitle(%27cdmUserRoles%27)/items`;

                            $.ajax({
                                url: userRolesUrl,
                                method: 'GET',
                                headers: {
                                    "Accept": "application/json; odata=verbose"
                                },
                                success: (userRoleData) => {
                                    const authorisedRoles = userRoleData.d.results.filter((x) => { return configData['Sync Client Hazard Permissions'].includes(x.Title) })

                                    const userRolesParsed = userData.d.results.map(x => x.cdmUserRoleId)
                                    const authorisedRolesParsed = authorisedRoles.map(x => x.ID)
                                    if (userRolesParsed.some(x => authorisedRolesParsed.includes(x))) {
                                        var url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getByTitle(%27cdmCompanies%27)/items?$select=ID,Title,cdmCompanyRole/Title&$expand=cdmCompanyRole/Title"
                                        $.ajax({
                                            url: url,
                                            method: "GET",
                                            headers: {
                                                "Accept": "application/json; odata=verbose"
                                            },
                                            success: function(data) {
                                                var Company_ID = null
                                                for (var i = 0; i < data.d.results.length; i++) {
                                                    if (data.d.results[i].Title == configData['Client Name']) {
                                                        Company_ID = data.d.results[i].ID
                                                    }
                                                }
                                                if (Company_ID) {
                                                    gimmepops(`Sync ${configData['Client Name']} CSV`)
                                                    const inputDiv = '<div id="popscontentarea"><input id="csvFileInput" type="file" accept=".csv"/><input id="sync-hs2-hazards-btn" type="button" value="Sync"/></div>';
                                                    const popsContent = document.getElementsByClassName('pops-content')[0];
                                                    popsContent.innerHTML = inputDiv;
                                                    var csvFile = document.getElementById("csvFileInput");
                                                    readFile = function() {
                                                        var reader = new FileReader();
                                                        reader.onload = function() {
                                                            rows = reader.result.split("\n");
                                                            const csvObject = {};
                                                            for (let i=0; i<rows.length; i++) {
                                                                row = rows[i].split(',');
                                                                for (let j=0; j<row.length; j++) {
                                                                    if (i == 0) { // get the column names
                                                                        var headers = row.map(x => x.trim('\r'));
                                                                        csvObject[row[j].trim('\r')] = [];
                                                                    } else {
                                                                        csvObject[headers[j]].push(row[j].trim('\r'));
                                                                    }
                                                                }
                                                            }

                                                            if (csvObject.hasOwnProperty('Status') && csvObject.hasOwnProperty('ID') && csvObject.hasOwnProperty('Review Timestamp')) { // Make sure the right file format is being used
                                                                // Keep a record of the hazards that are successfully and unsuccessfully synced. Syncing is asynchronous wheras failing a sync is synchronous. To simplify recording the audit
                                                                // information we will iterate over all the provided hazards, find the ones that fail and then attempt the sync ones that pass the validation tests (asynchronous). At the end of
                                                                // this we will record the audit information.
                                                                var successfulSyncs = [];
                                                                var unsuccessfulSyncs = [];
                                                                const hazardsToSync = [];
                                                                
                                                                let apiIdQueryStr = '(';
                                                                const timestamps = [];
                                                                for (let i=0; i<csvObject['Status'].length; i++) {
                                                                    if (csvObject['ID'][i] && i == csvObject['Status'].length-1) {
                                                                        apiIdQueryStr += `ID eq ${csvObject['ID'][i]})`;
                                                                    }
                                                                    else if (csvObject['ID'][i]) {
                                                                        apiIdQueryStr += `ID eq ${csvObject['ID'][i]} or `;
                                                                    }

                                                                    if (csvObject['Review Timestamp'][i]) {
                                                                        timestamps.push(csvObject['Review Timestamp'][i]);
                                                                    }
                                                                }
                                                                const url = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getByTitle(%27cdmHazards%27)/items?$filter=${apiIdQueryStr}`;

                                                                $.ajax({
                                                                    url: url,
                                                                    method: 'GET',
                                                                    headers: {
                                                                        "Accept": "application/json; odata=verbose"
                                                                    },
                                                                    success: async (data) => {
                                                                        const date = new Date();
                                                                        const dateNow = ukdate(date);

                                                                        for (let i=0; i<data.d.results.length; i++) {
                                                                            // First, check that the hazard has not been modified after the review timestamp - this would suggest an error
                                                                            const id = data.d.results[i]['ID'];
                                                                            const csvObjectIndex = csvObject['ID'].indexOf(id.toString());

                                                                            // There's an edge case where sync files are missed and then executed in order. If a hazard is in consecutive files then the second sync might be rejected
                                                                            // because its modified date > review timestamp. To mitigate this we will verify the last review is a sync and the last modified date = last sync date.
                                                                            const lastReview = data.d.results[i]['cdmReviews']?.split('^')[0];
                                                                            const lastReviewType = lastReview?.split(']')[2];
                                                                            const lastReviewDateSplit = lastReview?.split(']')[0].split('/');
                                                                            const lastReviewMonth = lastReviewDateSplit[1].length == 1 ? '0' + lastReviewDateSplit[1] : lastReviewDateSplit[1];
                                                                            const lastReviewDate = `${lastReviewDateSplit[2]}/${lastReviewMonth}/${lastReviewDateSplit[0]}`;
                                                                            const lateOrderSync = (lastReviewType == `Accepted by ${configData['Client Name']}` || lastReviewType.includes(`Reopened by ${configData['Client Name']}`) || 
                                                                                lastReviewType.includes(`Rejected by ${configData['Client Name']}`)) && data.d.results[i]['Modified'].split('T')[0].replaceAll('-', '/') == lastReviewDate &&
                                                                                csvObject['Review Timestamp'][csvObjectIndex].split('T')[0].replaceAll('-', '/') > lastReviewDate;
                                                                            if (csvObject['Review Timestamp'][csvObjectIndex] > data.d.results[i]['Modified'] || (csvObject['Review Timestamp'][csvObjectIndex] < data.d.results[i]['Modified'] && lateOrderSync)) {    
                                                                                const status = csvObject['Status'][csvObjectIndex];
                                                                                let history = data.d.results[i]['cdmReviews'];
                                                                                let auditTrailLine;
                                                                                let tdata;
                                                                                let error = false;

                                                                                if (status.includes('Accepted')) {
                                                                                    if (data.d.results[i]['cdmCurrentStatus'] == `Ready for review by ${configData['Client Name']}`) { // Check the hazard is in the correct state
                                                                                        tdata = ['cdmCurrentStatus|' + `Accepted by ${configData['Client Name']}`, 'cdmHazardOwner|' + Company_ID, 'cdmLastReviewStatus|Accepted'];
                                                                                        // Check if the contract and residual risk owner have also been updated
                                                                                        if (csvObject['Contract'][csvObjectIndex]) tdata.push(`cdmContract|${csvObject['Contract'][csvObjectIndex]}`);
                                                                                        if (csvObject['Residual Risk Owner'][csvObjectIndex]) tdata.push(`cdmResidualRiskOwner|${csvObject['Residual Risk Owner'][csvObjectIndex]}`);
                                                                                        auditTrailLine = dateNow + ']' + unm() + ']' + `Accepted by ${configData['Client Name']}]` + 'No comment' + '^';
                                                                                    } else {
                                                                                        toastr.error(`Could not sync hazard with id ${id} because it is in the wrong workflow state. For more details please check the cdmHazardHistory list and filter the Title by "synced".`)
                                                                                        unsuccessfulSyncs.push(`Hazard ${id}: could not be synced because it is in the incorrect workflow state. Expected state: Ready for review by ${configData['Client Name']}, actual state: ${data.d.results[i]['cdmCurrentStatus']}. Confirm with ${configData['Client Name']} it is in the correct state.\n`);
                                                                                        error = true;
                                                                                    }

                                                                                } else if (status.includes('Ready for review')) {
                                                                                    if (data.d.results[i]['cdmCurrentStatus'] == `Accepted by ${configData['Client Name']}`) { // Check the hazard is in the correct state
                                                                                        tdata = ['cdmCurrentStatus|' + `Ready for review by ${configData['Client Name']}`, `cdmLastReviewStatus|Ready for review by ${configData['Client Name']}`];
                                                                                        // Check if the contract and residual risk owner have also been updated
                                                                                        if (csvObject['Contract'][csvObjectIndex]) tdata.push(`cdmContract|${csvObject['Contract'][csvObjectIndex]}`);
                                                                                        if (csvObject['Residual Risk Owner'][csvObjectIndex]) tdata.push(`cdmResidualRiskOwner|${csvObject['Residual Risk Owner'][csvObjectIndex]}`);
                                                                                        // Update the audit trail with the reopen reason
                                                                                        let comment = '';
                                                                                        if (csvObject.hasOwnProperty('Reopen Reason') && csvObject['Reopen Reason'][csvObjectIndex]) {
                                                                                            comment = csvObject['Reopen Reason'][csvObjectIndex];
                                                                                        }
                                                                                        auditTrailLine = dateNow + ']' + unm() + ']' + `Reopened by ${configData['Client Name']}]` + `Reopen Reason: ${comment}` + '^';
                                                                                    } else {
                                                                                        toastr.error(`Could not sync hazard with id ${id} because it is in the wrong workflow state. For more details please check the cdmHazardHistory list and filter the Title by "synced".`)
                                                                                        unsuccessfulSyncs.push(`Hazard ${id}: could not be synced because it is in the incorrect workflow state. Expected state: Accepted by ${configData['Client Name']}, actual state: ${data.d.results[i]['cdmCurrentStatus']}. Confirm with ${configData['Client Name']} it is in the correct state.\n`);
                                                                                        error = true;
                                                                                    }

                                                                                } else if (status.includes('Rejected')) {
                                                                                    if (data.d.results[i]['cdmCurrentStatus'] == `Ready for review by ${configData['Client Name']}`) { // Check the hazard is in the correct state
                                                                                        tdata = ["cdmCurrentStatus|" + "Requires mitigation", `cdmLastReviewStatus|Rejected by ${configData['Client Name']}`];
                                                                                        // Check if the contract and residual risk owner have also been updated
                                                                                        if (csvObject['Contract'][csvObjectIndex]) tdata.push(`cdmContract|${csvObject['Contract'][csvObjectIndex]}`);
                                                                                        if (csvObject['Residual Risk Owner'][csvObjectIndex]) tdata.push(`cdmResidualRiskOwner|${csvObject['Residual Risk Owner'][csvObjectIndex]}`);
                                                                                        // Update the audit trail with the reason and feedback
                                                                                        let comment = '';
                                                                                        if (csvObject.hasOwnProperty('Rejection Reason') && csvObject['Rejection Reason'][csvObjectIndex]) {
                                                                                            comment += `Rejection Reason: ${csvObject['Rejection Reason'][csvObjectIndex]}`;
                                                                                        }
                                                                                        if (csvObject.hasOwnProperty('Rejection Feedback') && csvObject['Rejection Feedback'][csvObjectIndex]) {
                                                                                            comment += ` & Rejection Feedback: ${csvObject['Rejection Feedback'][csvObjectIndex]}`;
                                                                                        }
                                                                                        auditTrailLine = dateNow + ']' + unm() + ']' + `Rejected by ${configData['Client Name']}]` + comment + '^';
                                                                                    } else {
                                                                                        toastr.error(`Could not sync hazard with id ${id} because it is in the wrong workflow state. For more details please check the cdmHazardHistory list and filter the Title by "synced".`)
                                                                                        unsuccessfulSyncs.push(`Hazard ${id}: could not be synced because it is in the incorrect workflow state. Expected state: Ready for review by ${configData['Client Name']}, actual state: ${data.d.results[i]['cdmCurrentStatus']}. Confirm with ${configData['Client Name']} it is in the correct state.\n`);
                                                                                        error = true;
                                                                                    }
                                                                                }

                                                                                if (!error) {
                                                                                    history = auditTrailLine + history;
                                                                                    tdata.push(`cdmReviews|${history}`);
                                                                                    hazardsToSync.push({
                                                                                        id: id,
                                                                                        tdata: tdata
                                                                                    });
                                                                                }
                                                                            } else {
                                                                                toastr.error(`Could not sync hazard with id ${id} because it has been modified after the review by ${configData['Client Name']}. For more details please check the cdmHazardHistory list and filter the Title by "synced".`);
                                                                                unsuccessfulSyncs.push(`Hazard ${id}: could not be synced because it has been modified after the review by ${configData['Client Name']}. Confirm with ${configData['Client Name']} it is in the correct state.\n`);
                                                                            }
                                                                            if (i == data.d.results.length-1) {
                                                                                // We'll keep an array of deferred promises which each resolve to true when the hazard is successfully or unsuccessfully written to sharepoint.
                                                                                // When all promises are resolved we can then safely write the audit information
                                                                                const promises = [];
                                                                                for (let j=0; j<hazardsToSync.length; j++) {
                                                                                    const deffered = new $.Deferred();
                                                                                    promises.push(deffered);
                                                                                    await cdmdata.update('cdmHazards', hazardsToSync[j].tdata, 'clientSync', hazardsToSync[j].id,
                                                                                    () => {
                                                                                        successfulSyncs.push(id)
                                                                                        deffered.resolve(true);
                                                                                    },
                                                                                    () => {
                                                                                        unsuccessfulSyncs.push(`Hazard ${id}: could not be syned due to any internal SharePoint error. Please review the sync file and try again.`);
                                                                                        deffered.resolve(true);
                                                                                    })
                                                                                }

                                                                                if (hazardsToSync.length == 0) {
                                                                                    recordSyncAudit(successfulSyncs, unsuccessfulSyncs, csvFile.files[0].name);
                                                                                } else {
                                                                                    $.when(...promises).then(() => {
                                                                                        recordSyncAudit(successfulSyncs, unsuccessfulSyncs, csvFile.files[0].name);
                                                                                    })
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                })
                                                            } else {
                                                                toastr.error('Invalid file format')
                                                            }
                                                        }
                                                    reader.readAsBinaryString(csvFile.files[0]);
                                                    }
                                                    $("#sync-hs2-hazards-btn").on("click", readFile);
                                                } else {
                                                    toastr.error(`Could not find ${configData['Client Name']} in cdmCompanies List.`)
                                                }
                                            }
                                        })
                                    } else {
                                        toastr.error("You don't have the required permissions to complete this action")
                                    }
                                }          
                            });

                            async function recordSyncAudit(successfulSyncList, unsuccessfulSyncList, filename) {
                                // Function to record the audit information of the hazard sync to the cdmHazardHistory list
                                const cdmHazardHistory = list('cdmHazardHistory');
                                const itemCreateInfo = new SP.ListItemCreationInformation();
                                const oListItem = cdmHazardHistory.addItem(itemCreateInfo);
                                oListItem.set_item('Title', 'synced');
                                if (successfulSyncList.length > 0 && unsuccessfulSyncList.length > 0) {
                                    oListItem.set_item('cdmAction', `File name: ${filename}\nSuccessful syncs: ${successfulSyncList}\n Unsuccessful syncs:\n${unsuccessfulSyncList}`);
                                } else if (successfulSyncList.length == 0) {
                                    oListItem.set_item('cdmAction', `File name: ${filename}\nSuccessful syncs: N/A\n Unsuccessful syncs:\n${unsuccessfulSyncList}`);
                                } else if (unsuccessfulSyncList.length == 0) {
                                    oListItem.set_item('cdmAction', `File name: ${filename}\nSuccessful syncs: ${successfulSyncList}\n Unsuccessful syncs: N/A`);
                                }
                                oListItem.update();
                                ctx().load(oListItem);
                                await ctx().executeQueryAsync(onSuccess());

                                function onSuccess() {
                                    toastr.success('<br/>Successfully recorded audit information for this sync. To review this information access the cdmHazardHistory list and filter the Title by "synced", or follow this <a href="https://mottmac.sharepoint.com/teams/pj-a814/ps-master/Lists/cdmHazardHistory/AllItems.aspx?isAscending=false&FilterField1=LinkTitle&FilterValue1=synced" target="_blank"><u>link</u></a>.', 'Sync Audit Information', { timeOut: 0, extendedTimeOut: 0, closeButton: true });
                                }

                                function onFailure() {
                                    toastr.error('Failed to record audit information for this sync');
                                }
                            }
                        }
                    }
                })
            }
                
            if (ulink == 'archivehazards') {
                // First get the user roles and verify that they are allowed to archive hazards
                const userId = _spPageContextInfo.userId;
                const usersListUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getByTitle(%27cdmUsers%27)/items?$filter=cdmUser%20eq%20${userId}`;
                $.ajax({
                    url: usersListUrl,
                    method: 'GET',
                    headers: {
                        "Accept": "application/json; odata=verbose"
                    },
                    success: (userData) => {
                        if (userData.d.results.length == 0) {
                            toastr.error('You do not have any user roles assigned. Please ask your system administrator to add you to the system.')
                        } else {
                            // Now we need to get the user roles data and match the id from the user data
                            const userRolesUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getByTitle(%27cdmUserRoles%27)/items`;

                            $.ajax({
                                url: userRolesUrl,
                                method: 'GET',
                                headers: {
                                    "Accept": "application/json; odata=verbose"
                                },
                                success: (userRoleData) => {
                                    const authorisedRoles = userRoleData.d.results.filter((x) => { return configData['Archive hazards permissions'].includes(x.Title) })

                                    const userRolesParsed = userData.d.results.map(x => x.cdmUserRoleId)
                                    const authorisedRolesParsed = authorisedRoles.map(x => x.ID)
                                    if (userRolesParsed.some(x => authorisedRolesParsed.includes(x))) {
                                        gimmepops("Archiving Hazards");
                                        const inputHtml = '<p style="color:white">Do you want to archive all hazards marked as "cancelled". This will remove these hazards from the app to the Sharepoint list "cdmHazardsArchived".<p>' +
                                        '<div id="popscontentarea"><div id="archive-button" class="archive-button">Archive hazards</div></div>';
                                        const popsContent = document.getElementsByClassName('pops-content')[0];
                                        popsContent.innerHTML = inputHtml;
                                        // Add an event listner to listen for clicks
                                        document.getElementById('archive-button').addEventListener('click', () => {
                                            toastr.warning('Archiving hazards...');
                                            getCdmHazardsListItemsAndArchive();
                                            closepops();
                                        })
                                    } else {
                                        toastr.error('You do not have the required permissions to archive hazards. Ask your system administrator to grant you further user roles.')
                                    }
                                },
                                error: {
                                    function(error) {console.log(JSON.stringify(error));}
                                }
                            })
                        }
                        // You ned to get the cdmUserRoles data as well and map the user role id to the role name
                    },
                    error: {
                        function(error) {console.log(JSON.stringify(error));}
                    }
                })

                // Get all the list items and then filter for the ones thhat are cancelled. We have to it this way round (even though it makes no sense) because you can't filter by the required column
                // We request the data again instead of using allHazardsData because the allHazardsData is the result of a request that is limitted to 5000 items. The below request searches the entire
                // dataset.
                let url = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getByTitle(%27cdmHazards%27)/items`;
                const response = [];
                function getCdmHazardsListItemsAndArchive() {
                    $.ajax({
                        url: url,
                        method: "GET",
                        headers: {
                            "Accept": "application/json; odata=verbose"
                        },
                        success: (data) => {
                            response.push(...data.d.results)
                            if(data.d.__next) {
                                url = data.d.__next;
                                getCdmHazardsListItemsAndArchive()
                            } else {
                                var successCounter = 0;
                                archiveHazards();
                                if (successCounter > 0) {
                                    toastr.success(`Successfully deleted ${successCounter} hazards`)
                                }
                            }
                        },
                        error: {
                            function(error) {console.log(JSON.stringify(error));}
                        }
                    })
                    return response
                }

                function archiveHazards() {
                    // Find the relevant hazards
                    const cdmHazardData = response;

                    // Loop over hazards to be archived and extract the relevant information
                    let hazardCounter = 0;
                    let succesfulArchives = 0;
                    const promises = [];
                    for (let i=0; i<cdmHazardData.length; i++) {
                        // We can only archive hazards if they have been at least design manager reviewed
                        const legalWorkflowStates = ['Under client review', 'Under principal designer review', 'Under principal contractor review', 'Accepted'];
                        if (cdmHazardData[i].cdmUniclass === 'Cancelled' && legalWorkflowStates.includes(cdmHazardData[i].cdmCurrentStatus)) {
                            hazardCounter++;
                            const hazardData = [];
                            if (cdmHazardData[i].cdmCurrentStatus) hazardData.push(`cdmCurrentStatus|${cdmHazardData[i].cdmCurrentStatus}`);
                            if (cdmHazardData[i].cdmEntityTitle) hazardData.push(`cdmEntityTitle|${cdmHazardData[i].cdmEntityTitle}`);
                            if (cdmHazardData[i].cdmGeometry) hazardData.push(`cdmGeometry|${cdmHazardData[i].cdmGeometry}`);
                            if (cdmHazardData[i].cdmHazardCoordinates) hazardData.push(`cdmHazardCoordinates|${cdmHazardData[i].cdmHazardCoordinates}`);
                            if (cdmHazardData[i].cdmHazardDescription) hazardData.push(`cdmHazardDescription|${cdmHazardData[i].cdmHazardDescription}`);
                            if (cdmHazardData[i].cdmHazardOwnerId) hazardData.push(`cdmHazardOwner|${cdmHazardData[i].cdmHazardOwnerId}`);
                            if (cdmHazardData[i].cdmHazardTags) hazardData.push(`cdmHazardTags|${cdmHazardData[i].cdmHazardTags}`);
                            if (cdmHazardData[i].cdmHazardTypeId) hazardData.push(`cdmHazardType|${cdmHazardData[i].cdmHazardTypeId}`);
                            if (cdmHazardData[i].cdmIniRisk) hazardData.push(`cdmIniRisk|${cdmHazardData[i].cdmIniRisk}`);
                            if (cdmHazardData[i].cdmInitialRAG) hazardData.push(`cdmInitialRAG|${cdmHazardData[i].cdmInitialRAG}`);
                            if (cdmHazardData[i].cdmInitialRisk) hazardData.push(`cdmInitialRisk|${cdmHazardData[i].cdmInitialRisk}`);
                            if (cdmHazardData[i].cdmInitialRiskScore) hazardData.push(`cdmInitialRiskScore|${cdmHazardData[i].cdmInitialRiskScore}`);
                            if (cdmHazardData[i].cdmLastReviewDate) hazardData.push(`cdmLastReviewDate|${cdmHazardData[i].cdmLastReviewDate}`);
                            if (cdmHazardData[i].cdmLastReviewer) hazardData.push(`cdmLastReviewer|${cdmHazardData[i].cdmLastReviewer}`);
                            if (cdmHazardData[i].cdmLastReviewSnapshot) hazardData.push(`cdmLastReviewSnapshot|${cdmHazardData[i].cdmLastReviewSnapshot}`);
                            if (cdmHazardData[i].cdmLastReviewStatus) hazardData.push(`cdmLastReviewStatus|${cdmHazardData[i].cdmLastReviewStatus}`);
                            if (cdmHazardData[i].cdmLastReviewType) hazardData.push(`cdmLastReviewType|${cdmHazardData[i].cdmLastReviewType}`);
                            if (cdmHazardData[i].cdmMitigationDescription) hazardData.push(`cdmMitigationDescription|${cdmHazardData[i].cdmMitigationDescription}`);
                            if (cdmHazardData[i].cdmLinks) hazardData.push(`cdmLinks|${cdmHazardData[i].cdmLinks}`);
                            if (cdmHazardData[i].cdmParent) hazardData.push(`cdmParent|${cdmHazardData[i].cdmParent}`);
                            if (cdmHazardData[i].cdmPWElementId) hazardData.push(`cdmPWElement|${cdmHazardData[i].cdmPWElementId}`);
                            if (cdmHazardData[i].cdmPWStructureId) hazardData.push(`cdmPWStructure|${cdmHazardData[i].cdmPWStructureId}`);
                            if (cdmHazardData[i].cdmRAGSuggestion) hazardData.push(`cdmRAGSuggestion|${cdmHazardData[i].cdmRAGSuggestion}`);
                            if (cdmHazardData[i].cdmRAMS) hazardData.push(`cdmRAMS|${cdmHazardData[i].cdmRAMS}`);
                            if (cdmHazardData[i].cdmRelatedRAMS) hazardData.push(`cdmRelatedRAMS|${cdmHazardData[i].cdmRelatedRAMS}`);
                            if (cdmHazardData[i].cdmResidualRAG) hazardData.push(`cdmResidualRAG|${cdmHazardData[i].cdmResidualRAG}`);
                            if (cdmHazardData[i].cdmResidualRisk) hazardData.push(`cdmResidualRisk|${cdmHazardData[i].cdmResidualRisk}`);
                            if (cdmHazardData[i].cdmResidualRiskScore) hazardData.push(`cdmResidualRiskScore|${cdmHazardData[i].cdmResidualRiskScore}`);
                            if (cdmHazardData[i].cdmResRisk) hazardData.push(`cdmResRisk|${cdmHazardData[i].cdmResRisk}`);
                            if (cdmHazardData[i].cdmReviews) hazardData.push(`cdmReviews|${cdmHazardData[i].cdmReviews}`);
                            if (cdmHazardData[i].cdmRiskDescription) hazardData.push(`cdmRiskDescription|${cdmHazardData[i].cdmRiskDescription}`);
                            if (cdmHazardData[i].cdmSiblings) hazardData.push(`cdmSiblings|${cdmHazardData[i].cdmSiblings}`);
                            if (cdmHazardData[i].cdmSiteId) hazardData.push(`cdmSite|${cdmHazardData[i].cdmSiteId}`);
                            if (cdmHazardData[i].cdmStageId) hazardData.push(`cdmStage|${cdmHazardData[i].cdmStageId}`);
                            if (cdmHazardData[i].cdmSMMitigationSuggestion) hazardData.push(`cdmSMMitigationSuggestion|${cdmHazardData[i].cdmSMMitigationSuggestion}`);
                            if (cdmHazardData[i].cdmTW) hazardData.push(`cdmTW|${cdmHazardData[i].cdmTW}`);
                            if (cdmHazardData[i].cdmStageMitigationSuggestion) hazardData.push(`cdmStageMitigationSuggestion|${cdmHazardData[i].cdmStageMitigationSuggestion}`);
                            if (cdmHazardData[i].cdmUniclass) hazardData.push(`cdmUniclass|${cdmHazardData[i].cdmUniclass}`);
                            if (cdmHazardData[i].CurrentMitigationOwnerId)  hazardData.push(`CurrentMitigationOwner|${cdmHazardData[i].CurrentMitigationOwnerId}`);
                            if (cdmHazardData[i].CurrentReviewOwnerId) hazardData.push(`CurrentReviewOwner|${cdmHazardData[i].CurrentReviewOwnerId}`);
                            if (cdmHazardData[i].LegacyID) hazardData.push(`LegacyID|${cdmHazardData[i].LegacyID}`);
                            if (cdmHazardData[i].cdmPASRiskClassification) hazardData.push(`cdmPASRiskClassification|${cdmHazardData[i].cdmPASRiskClassification}`);
                            if (cdmHazardData[i].cdmStageExtraId) hazardData.push(`cdmStageExtra|${cdmHazardData[i].cdmStageExtraId}`);
                            if (cdmHazardData[i].cdmResidualRiskOwner) hazardData.push(`cdmResidualRiskOwner|${cdmHazardData[i].cdmResidualRiskOwner}`);
                            if (cdmHazardData[i].cdmContract) hazardData.push(`cdmContract|${cdmHazardData[i].cdmContract}`);
                            if (cdmHazardData[i].ID) hazardData.push(`cdmHazardId|${cdmHazardData[i].ID}`);
                            if (cdmHazardData[i].Title) hazardData.push(`Title|${cdmHazardData[i].Title}`);

                            // Create a promise to resolve later once the item has been archived
                            const deferred = new $.Deferred();
                            promises.push(deferred);

                            // Create the item in the archive list
                            const cdmHazardsArchived = list('cdmHazardsArchived');
                            const itemCreateInfo = new SP.ListItemCreationInformation();
                            let oListItem = cdmHazardsArchived.addItem(itemCreateInfo);

                            for (let j=0; j<hazardData.length; j++) {
                                const dataSplit = hazardData[j].split('|');
                                oListItem.set_item(dataSplit[0], dataSplit[1]);
                            }
                            oListItem.update();
                            ctx().load(oListItem);
                            ctx().executeQueryAsync(onSuccessfulCopy, onUnsuccessfulCopy);

                            function onSuccessfulCopy() {
                                // Delete the item in the original list
                                const cdmHazards = list('cdmHazards');
                                oListItem = cdmHazards.getItemById(cdmHazardData[i].ID);
                                oListItem.deleteObject();
                                ctx().executeQueryAsync(onSuccessfulDelete, onUnsuccessfulDelete);
                            }
            
                            function onUnsuccessfulCopy() {
                                toastr.error(`Could not archive hazard with id ${cdmHazardData[i].ID}`);
                                deferred.resolve(true);
                            }

                            function onSuccessfulDelete() {
                                succesfulArchives++;
                                deferred.resolve(true);
                            }

                            function onUnsuccessfulDelete() {
                                toastr.error(`The hazard with id ${cdmHazardData[i].ID} has been copied to the cdmHazardArchived list, but it could not be deleted`);
                                deferred.resolve(true);
                            }
                        }
                    }
                    
                    // Wait for all promises to resolve and then give success message
                    $.when(...promises)
                        .then(() => {
                            if (promises.length > 0) {
                                toastr.success(`Successfully archived ${succesfulArchives} hazard(s). Refresh the hazards to see the latest updates.`);
                            }
                        })
                    
                    if (hazardCounter == 0) {
                        toastr.error('There are no hazards to archive. To mark a hazard as ready to be archived change its status to "Cancelled".')
                    }
                }
            }

            if (ulink == 'exportbulkupload') {
                // First lets check that the current user is authorised to do this.
                const userId = _spPageContextInfo.userId;
                const usersListUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getByTitle(%27cdmUsers%27)/items?$filter=cdmUser%20eq%20${userId}`;
                $.ajax({
                    url: usersListUrl,
                    method: 'GET',
                    headers: {
                        "Accept": "application/json; odata=verbose"
                    },
                    success: (userData) => {
                        if (userData.d.results.length == 0) {
                            toastr.error('You do not have any user roles assigned. Please ask your system administrator to add you to the system.')
                        } else {
                            // Now we need to get the user roles data and match the id from the user data
                            const userRolesUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getByTitle(%27cdmUserRoles%27)/items`;

                            $.ajax({
                                url: userRolesUrl,
                                method: 'GET',
                                headers: {
                                    "Accept": "application/json; odata=verbose"
                                },
                                success: (userRoleData) => {
                                    const authorisedRoles = userRoleData.d.results.filter((x) => { return 'Design Manager' === x.Title }) // We can change this to config data later

                                    const userRolesParsed = userData.d.results.map(x => x.cdmUserRoleId)
                                    const authorisedRolesParsed = authorisedRoles.map(x => x.ID)
                                    if (userRolesParsed.some(x => authorisedRolesParsed.includes(x))) {
                                        filterExportData()
                                    } else {
                                        toastr.error('You do not have the required permissions to export data for bulk uploads. Ask your system administrator to grant you further user roles.');
                                    }
                                },
                                error: {
                                    function(error) {console.log(JSON.stringify(error));}
                                }
                            })
                        }
                    },
                    error: {
                        function(error) {console.log(JSON.stringify(error));}
                    }
                })

                // To save effort we can reuse the code for the extra button for the filters. The outcome of what we want is largely the same except we don't want to filter the data on screen, we
                // want to filter the export data. We can just change what the apply filters button does to do achieve this. This is done in the tposcustomfilters function.
                function filterExportData() {
                    gimmepops("Filter Export Data",
          
                    '<p style="color:white">Please select the filters to apply to the export.<p>' +
                    '<div id="popscontentarea"><i class="fa fa-spinner fa-spin"></i> Loading data</div>');
                    $('#langOpt').multiselect({
                        columns: 1,
                        placeholder: 'Select Languages',
                        search: true,
                        selectAll: true
                    });
                    
                    cdmdata.get("cdmhazards","",null,"frmsel_customfilters",null,null,[], 'export');
                }
            }

            if (ulink == 'importbulkupload') {
                // First lets check that the current user is authorised to do this.
                const userId = _spPageContextInfo.userId;
                const usersListUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getByTitle(%27cdmUsers%27)/items?$filter=cdmUser%20eq%20${userId}`;
                $.ajax({
                    url: usersListUrl,
                    method: 'GET',
                    headers: {
                        "Accept": "application/json; odata=verbose"
                    },
                    success: (userData) => {
                        if (userData.d.results.length == 0) {
                            toastr.error('You do not have any user roles assigned. Please ask your system administrator to add you to the system.')
                        } else {
                            // Now we need to get the user roles data and match the id from the user data
                            const userRolesUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getByTitle(%27cdmUserRoles%27)/items`;

                            $.ajax({
                                url: userRolesUrl,
                                method: 'GET',
                                headers: {
                                    "Accept": "application/json; odata=verbose"
                                },
                                success: (userRoleData) => {
                                    const authorisedRoles = userRoleData.d.results.filter((x) => { return 'Design Manager' === x.Title }) // We can change this to config data later

                                    const userRolesParsed = userData.d.results.map(x => x.cdmUserRoleId)
                                    const authorisedRolesParsed = authorisedRoles.map(x => x.ID)
                                    if (userRolesParsed.some(x => authorisedRolesParsed.includes(x))) {
                                        importData()
                                    } else {
                                        toastr.error('You do not have the required permissions to export data for bulk uploads. Ask your system administrator to grant you further user roles.');
                                    }
                                },
                                error: {
                                    function(error) {console.log(JSON.stringify(error));}
                                }
                            })
                        }
                        // You ned to get the cdmUserRoles data as well and map the user role id to the role name
                    },
                    error: {
                        function(error) {console.log(JSON.stringify(error));}
                    }
                })

                /**
                * Imports data from a CSV file into SharePoint lists.
                * Handles parsing CSV data, converting to JSON, and updating list items.
                */
                function importData() {
                    // Display a popup for importing CSV data.
                    gimmepops(`Import bulk edit CSV`);
                    const inputContent = `<div id="popscontentarea">
                        <div class="bulk-import-vertical-block">
                            <input id="csvFileInput" type="file" accept=".csv"/>
                            <label for="pw-link-input">Enter ProjectWise link to meeting minutes:</label>
                            <input type="text" id="pw-link-input" name="pw-link-input">
                        </div>
                        <input id="bulk-upload-button" type="button" value="Upload changes" style="float:right"/>
                    </div>`;
                    const popsContent = document.getElementsByClassName('pops-content')[0];
                    popsContent.innerHTML = inputContent;

                    // Upload the CSV file to SharePoint when the button is clicked.
                    $("#bulk-upload-button").on("click", () => {

                        const csvFile = document.getElementById("csvFileInput");
                        const fileName = csvFile.files[0].name;
                        const pwLink = document.getElementById('pw-link-input').value;

                        // Ensure file format is correct
                        if (fileName.split('.')[1] !== 'csv') {
                            toastr.error('Invalid file format. Please upload the csv generated by the macro.')
                        } else if (pwLink === '') {
                            toastr.error('You must provide a link to your minutes from the hazard review meeting.')
                        } else {
                            // Perform bulk update
                            handleBulkUpdateFromCSV(csvFile, pwLink);
                            // Close popup box automatically
                            $('#pops').html('');
                            $('#pops').remove();
                        }
                    })


                    /**
                    * Process a CSV file and perform bulk updates of SharePoint list items based on its content.
                    * 
                    * @param {File} file - The CSV file to be processed for bulk updates.
                    */
                    async function handleBulkUpdateFromCSV(file, pwLink) {
                        try {
                            // Read the content of the CSV file asynchronously
                            const csvData = await readCSVFile(file);

                            // Convert the CSV data to an array of JSON objects
                            const csvObjects = convertCSVArrayToJSON(csvData);

                            // Check if csvObjects is null, and return early if it is as this indicates an invalid CSV file
                            if (csvObjects === null) {
                                toastr.error("Invalid CSV file uploaded. Please make sure you are uploading the import file generated from the bulk edit template.")
                                return;
                            }

                            // Retrieve lookup data for specified lists
                            const listNames = ["cdmSites", "cdmStages", "cdmPWStructures", "cdmStagesExtra", "cdmHazardTypes", "cdmUsers", "cdmCompanies"];
                            const lookupData = await getListDataForLookupColumns(listNames);

                            // Update SharePoint list items with CSV data, using lookupData for dropdown fields
                            const log = await updateListItems(csvObjects, lookupData, pwLink);

                            // Download success/error log for updated list items
                            csvLog = convertLogToCSV(log);
                            downloadCSV(csvLog, `bulk_edit_log_${Date.now()}.csv`);

                            // Success message displayed when bulk update finishes
                            toastr.success("Finished bulk update");
                        } catch (error) {
                            console.log(JSON.stringify(error));
                            handleProcessingError(error);
                        }
                    }


                    /**
                    * Read the contents of a CSV file and parse it into an array of rows.
                    * 
                    * @param {File} file - The CSV file to read.
                    * @returns {string[][]} - Array of rows from the CSV file.
                    */
                    async function readCSVFile(file) {
                        return new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => {
                                const csvData = CSVToArray(reader.result, ",");
                                resolve(csvData);
                            };
                            reader.onerror = (error) => reject(error);
                            reader.readAsText(file.files[0]);
                        });
                    }


                    /**
                    * Converts an array of log objects into a CSV format.
                    *
                    * @param {object[]} logData - An array of log objects to be converted to CSV. Each log object should be in the format:
                    *                            {
                    *                                field1: value1,
                    *                                field2: value2,
                    *                                // ...
                    *                            }
                    * @returns {string} A CSV-formatted string representing the log data.
                    */
                    function convertLogToCSV (logData) {
                        // Extract header names from the first object
                        const headers = logData.length > 0 ? Object.keys(logData[0]) : [];
                        // Convert data to CSV rows
                        const csvRows = logData.map(obj => headers.map(header => obj[header]).join(','));
                        // Combine headers and CSV rows
                        const csvContent = [headers.join(','), ...csvRows].join('\n');
                        return csvContent;
                    }

                    /**
                    * Downloads a CSV file containing the provided data using a Blob to ensure the full dataset is preserved.
                    * Without using a Blob, downloaded data might be truncated.
                    * 
                    * @param {string} data - The CSV data to be downloaded.
                    * @param {string} fileName - The desired name for the downloaded file.
                    */
                    function downloadCSV (data, fileName) {
                        var a = document.createElement("a");
                        document.body.appendChild(a);
                        a.style = "display: none";
                        var blob = new Blob([data], {type: "text/csv;charset=utf-8"})
                        var url = window.URL.createObjectURL(blob);
                        a.href = url;
                        a.download = fileName;
                        a.click();
                        window.URL.revokeObjectURL(url);
                    }


                    /**
                    * Parses a CSV string into a two-dimensional array of rows and columns.
                    *
                    * @param {string} strData - The CSV string to be parsed.
                    * @param {string} strDelimiter - The delimiter used to separate fields in the CSV.
                    * @returns {string[][]} - A two-dimensional array containing the parsed CSV data.
                    */
                    function CSVToArray(strData, strDelimiter) {
                        // Regular expression pattern to match delimiter, newline characters, and start of line
                        // along with quoted and non-quoted fields
                        const regexPattern = new RegExp(
                            `(${strDelimiter}|\\r?\\n|\\r|^)` +
                            `(?:"([^"]*(?:""[^"]*)*)"|` +
                            `([^"${strDelimiter}\\r\\n]*))`,
                            "gi"
                        );

                        // Array to hold the parsed CSV data
                        const parsedData = [[]];

                        let matches;
                        while ((matches = regexPattern.exec(strData))) {
                            // Destructure matched values from the pattern
                            const [, matchedDelimiter, quotedValue, unquotedValue] = matches;

                            // If delimiter is not the field delimiter, start a new row in the parsed data
                            if (matchedDelimiter && matchedDelimiter !== strDelimiter) {
                                parsedData.push([]);
                            }

                            // Determine the value, either quoted or unquoted
                            const value = quotedValue ? quotedValue.replace(/""/g, "\"") : unquotedValue;

                            // Add the value to the current row in the parsed data
                            parsedData[parsedData.length - 1].push(value);
                        }

                        return parsedData;
                    }


                    /**
                    * Converts a nested array, where index 0 represents the header row, into an array of objects.
                    *
                    * @param {Array} csv_array - The nested array where index 0 is the header row.
                    * @returns {Array<Object>|null} - An array of objects with keys derived from the header row,
                    *                                or null if the header does not match the expected header,
                    *                                indicating an invalid CSV file.
                    */
                    function convertCSVArrayToJSON(csv_array) {
                        csv_header = csv_array[0];
                        expected_header = ["ID","Site","PW Structure","Hazard Type","Hazard Owner","Hazard Tags","Hazard Description","Risk Description","Mitigation Description","Initial Risk","Initial Risk Score","Initial Severity Score","Initial Likelihood Score","Residual Risk","Residual Risk Score","Residual Severity Score","Residual Likelihood Score","Designer Mitigation Suggestions","Status","Last Review Status","Last Reviewer","Last Review Date","Workflow Status","Peer Reviewer","Design Manager","Coordinates","Residual Risk Owner","Current Mitigation Owner","Current Review Owner","PW Links","cdmReviews"];
                        if (!compareArrays(csv_header, expected_header)) {
                            return null;
                        }
                        csv_data = csv_array.slice(1);
                        const csv_objects = csv_data.map(row => row.reduce((result, field, index) => ({...result, [csv_header[index]]: field}), {}));
                        return csv_objects;
                    }


                    /**
                    * Compare two arrays to check if their values are equal.
                    * @param {Array} array1 - The first array to compare.
                    * @param {Array} array2 - The second array to compare.
                    * @returns {boolean} - Returns true if the arrays are equal, otherwise false.
                    */
                    function compareArrays(array1, array2) {
                    // Check if the arrays have different lengths.
                    if (array1.length !== array2.length) {
                        return false;
                    }

                    // Iterate through the elements of the first array.
                    for (let i = 0; i < array1.length; i++) {
                        // If any pair of elements at the same index are not equal, the arrays are not equal.
                        if (array1[i] !== array2[i]) {
                            return false;
                        }
                    }

                    // If it hasn't returned false by this point, the arrays are equal.
                    return true;
                    }


                    /**
                    * Get data from SharePoint lists for lookup columns.
                    * 
                    * @param {string[]} listNames - Names of lists to retrieve data from.
                    * @returns {object} - Lookup data from SharePoint lists.
                    */
                    async function getListDataForLookupColumns(listNames) {
                        // Retrieve data from the specified SharePoint lists concurrently
                        const listData = await Promise.all(listNames.map(getList));

                        // Convert the array of list data into a lookup data object
                        const lookupData = listNames.reduce((result, listName, index) => {
                            result[listName] = listData[index];
                            return result;
                        }, {});

                        return lookupData;
                    }


                    /**
                    * Retrieves data from a specified SharePoint list using an AJAX request.
                    *
                    * @param {string} listName - The name of the SharePoint list.
                    * @returns {Promise<Object>} - A promise that resolves with data from the specified list.
                    */
                    async function getList(listName) {
                        let listUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getByTitle(%27${listName}%27)/items`;
                        return await getItems(listUrl)

                        async function getItems(url) {
                            const apiCall = await $.ajax({
                                url: url,
                                method: 'GET',
                                headers: {
                                    "Accept": "application/json; odata=verbose"
                                }
                            });
                            
                            if (apiCall.d.__next) {
                                return [...apiCall.d.results, ...await getItems(apiCall.d.__next)];
                            } else {
                                return apiCall.d.results;
                            }
                        }
                    }


                    /**
                    * Updates SharePoint list items using data from a CSV and performs batch operations for improved efficiency.
                    *
                    * @param {object[]} csvObjects - An array of JSON objects extracted from the CSV data.
                    * @param {object} lookupData - Lookup data retrieved from SharePoint lists.
                    * @returns {object[]} An array containing success/failure information for each item update.
                    *                    Each object in the array should have the following format:
                    *                    {
                    *                        fieldName1: result1,
                    *                        fieldName2: result2,
                    *                        // ...
                    *                    }
                    */
                    async function updateListItems(csvObjects, lookupData, pwLink) {
                        // Array of success/failure to write to log file afterwards
                        const importLog = []
                        // Create an array of promises, each handling the update of a SharePoint list item based on CSV data
                        const promises = csvObjects.map(async (csvObject) => {
                            const hazardID = csvObject.ID;

                            if (hazardID) {
                                // Retrieve the SharePoint list item by its hazard ID
                                const oListItem = list("cdmHazards").getItemById(hazardID);

                                // Set fields of the SharePoint list item using the CSV data and lookup information
                                const hazardLog = await setListItemFields(oListItem, csvObject, lookupData, pwLink);

                                // Check whether any fields couldn't be set. If so then the entire update of the hazard should be abandoned
                                if (Object.values(hazardLog).includes('Invalid Value')) {
                                    const failLog = Object.keys(hazardLog).reduce((acc, key) => {
                                        if (hazardLog[key] === 'Success') {
                                            acc[key] = 'Failed';
                                        } else {
                                            acc[key] = hazardLog[key]
                                        }
                                        return acc
                                    }, {});
                                    failLog['Update Status'] = 'Update failed due to invalid value(s)';
                                    importLog.push(failLog);
                                } else {
                                    // Return a new promise that wraps the asynchronous query execution
                                    return new Promise((resolve, reject) => {
                                        ctx().executeQueryAsync(
                                            () => {
                                                hazardLog['Update Status'] = 'Update Successful';
                                                importLog.push(hazardLog);
                                                handleSuccess(hazardID);
                                                resolve(true);
                                            },
                                            (sender, args) => {
                                                const hazardLogError = {}
                                                Object.keys(hazardLog).map((value) => {hazardLogError[value] = "Error in ExecuteQueryAsync"});
                                                hazardLog['Update Status'] = 'Update failed due to error in ExecuteQueryAsync';
                                                importLog.push(hazardLogError)
                                                handleFailure(hazardID, args);
                                                reject(args);
                                            }
                                        );
                                    });
                                }
                            }
                        });

                        // Wait for all promises of the items in the CSV to resolve
                        await Promise.all(promises);

                        return importLog;
                    }



                    /**
                    * Handle a successful update.
                    * 
                    * @param {string} hazardID - ID of the updated hazard.
                    */
                    function handleSuccess(hazardID) {
                        toastr.success(`Updated hazard with ID ${hazardID}`);
                    }

                    /**
                    * Handle a failure during update.
                    * 
                    * @param {string} hazardID - ID of the hazard that failed to update.
                    * @param {object} args - Arguments containing error details.
                    */
                    function handleFailure(hazardID, args) {
                        toastr.error(`Failed to update hazard with ID ${hazardID}`);
                    }

                    /**
                    * Handle errors that occur during processing.
                    * 
                    * @param {Error} error - The error that occurred.
                    */
                    function handleProcessingError(error) {
                        console.error("An error occurred:", error);
                        toastr.error("An error occurred");
                    }


                    /**
                    * Sets fields of a SharePoint list item based on CSV data and lookup information,
                    * handling validation, mapping, and updates.
                    *
                    * @param {object} listItem - The SharePoint list item object to be updated.
                    * @param {object} csvObject - CSV data for the item, containing field-value pairs.
                    * @param {object} lookupData - Lookup data retrieved from SharePoint lists.
                    * @returns {object} An object providing a log of the update process for the item.
                    *                   The log should have the following format:
                    *                   {
                    *                       HazardID: hazardID,
                    *                       fieldName1: result1,
                    *                       fieldName2: result2,
                    *                       // ...
                    *                   }
                    */
                    async function setListItemFields(listItem, csvObject, lookupData, pwLink) {

                        /**
                        * Sets a field of a SharePoint list item if the value is valid or if null values are allowed.
                        * Displays an error message if the value is invalid and null values are not allowed.
                        * 
                        * @param {object} listItem - The SharePoint list item object.
                        * @param {string} fieldName - The name of the field to set.
                        * @param {*} fieldValue - The value to set for the field.
                        * @param {boolean} allowNull - Indicates whether null values are allowed.
                        * @returns {object} An object containing the field name and the result of the operation ("Success" or "Error").
                        */
                        function setField(listItem, fieldName, fieldValue, allowNull) {
                            if (fieldValue instanceof Error) {
                                const errorMessage = `Failed to set ${fieldName}. Invalid value provided.`;
                                toastr.error(errorMessage);
                                return { [fieldName]: "Invalid Value" };
                            } else if (allowNull || fieldValue !== undefined && fieldValue !== null) {
                                listItem.set_item(fieldName, fieldValue);
                                return { [fieldName]: "Success" };
                            } else {
                                const errorMessage = `Failed to set ${fieldName}. Invalid value provided.`;
                                toastr.error(errorMessage);
                                return { [fieldName]: "Invalid Value" };
                            }
                        }

                        // Fetch the name of the current user
                        const currentUser = await getCurrentUser()
                        const currentUserName = currentUser.Title
                        const currentUserID = currentUser.cdmUserId

                        // Retrieve current values of certain fields from the list item
                        const currentListItemValues = await loadListItemValues(listItem);
                        const {
                            cdmCurrentStatus: previousWorkflowStatus,
                            cdmReviews: previousReviewSummary,
                            cdmLastReviewer: previousLastReviewer,
                            cdmLastReviewStatus: previousLastReviewStatus,
                            cdmLastReviewDate: previousLastReviewDate
                        } = currentListItemValues;
                        // Define configurations for various fields incorporating validation conditions
                        const setFields = [
                            { field: "cdmSite", value: getIDofLookupItem(lookupData.cdmSites, csvObject.Site), allowNull: false },
                            { field: "cdmPWStructure", value: getIDofLookupItem(lookupData.cdmPWStructures, csvObject["PW Structure"]), allowNull: true },
                            { field: "cdmHazardType", value: getIDofLookupItem(lookupData.cdmHazardTypes, csvObject["Hazard Type"]), allowNull: true },
                            { field: "cdmHazardOwner", value: getIDofLookupItem(lookupData.cdmCompanies, csvObject["Hazard Owner"]), allowNull: false },
                            { field: "cdmHazardTags", value: csvObject["Hazard Tags"], allowNull: true },
                            { field: "cdmHazardDescription", value: csvObject["Hazard Description"], allowNull: true },
                            { field: "cdmRiskDescription", value: csvObject["Risk Description"], allowNull: true },
                            { field: "cdmMitigationDescription", value: csvObject["Mitigation Description"], allowNull: true },
                            { field: "cdmInitialRisk", value: generateRiskSummary(csvObject["Initial Severity Score"], csvObject["Initial Likelihood Score"]), allowNull: false },
                            { field: "cdmInitialRiskScore", value: generateRiskScore(csvObject["Initial Severity Score"], csvObject["Initial Likelihood Score"]), allowNull: false },
                            { field: "cdmResidualRisk", value: generateRiskSummary(csvObject["Residual Severity Score"], csvObject["Residual Likelihood Score"]), allowNull: false },
                            { field: "cdmResidualRiskScore", value: generateRiskScore(csvObject["Residual Severity Score"], csvObject["Residual Likelihood Score"]), allowNull: false },
                            { field: "cdmStageMitigationSuggestion", value: csvObject["Designer Mitigation Suggestions"], allowNull: true },
                            { field: "cdmUniclass", value: csvObject.Status, allowNull: true },
                            { field: "cdmLastReviewStatus", value: validateWorkflowFields(csvObject["Last Review Status"], csvObject["Peer Reviewer"], csvObject["Design Manager"], previousLastReviewStatus), allowNull: true },
                            { field: "cdmLastReviewer", value: validateWorkflowFields(csvObject["Last Reviewer"], csvObject["Peer Reviewer"], csvObject["Design Manager"], previousLastReviewer), allowNull: true },
                            { field: "cdmLastReviewDate", value: convertToISODate(csvObject["Last Review Date"], previousLastReviewStatus, csvObject["Last Review Status"], previousLastReviewDate), allowNull: true },
                            { field: "cdmReviews", value: generateReviewSummary(previousReviewSummary, previousWorkflowStatus, csvObject["Workflow Status"], csvObject["Peer Reviewer"], csvObject["Design Manager"], currentUserName), allowNull: true },
                            { field: "cdmCurrentStatus", value: validateWorkflowFields(csvObject["Workflow Status"], csvObject["Peer Reviewer"], csvObject["Design Manager"], previousWorkflowStatus,
                                                                                            // specify validValues argument for allowed newValue values
                                                                                            ["Requires mitigation", 
                                                                                            "Assessment in progress", 
                                                                                            "Under peer review", 
                                                                                            "Under design manager review", 
                                                                                            "Under principal designer review"]), allowNull: false },
                            { field: "cdmHazardCoordinates", value: validate3DCoordinates(csvObject.Coordinates), allowNull: false },
                            { field: "cdmResidualRiskOwner", value: csvObject["Residual Risk Owner"], allowNull: true },
                            { field: "CurrentMitigationOwner", value: currentUserID, allowNull: false },
                            { field: "CurrentReviewOwner", value: getIDofLookupItem(lookupData.cdmUsers, csvObject["Current Review Owner"]), allowNull: true },
                            { field: "cdmLinks", value: checkIfStringIsEmpty(`${csvObject["PW Links"]}\n${pwLink}`), allowNull: false }
                        ];

                        // Initialise the hazard log object with the HazardID
                        let hazardLog = {"HazardID": csvObject.ID}
                        try {
                            // Iterate through the setFields array and update the SharePoint fields
                            for (const fieldInfo of setFields) {
                                const result = setField(listItem, fieldInfo.field, fieldInfo.value, fieldInfo.allowNull);
                                // Merge the individual field update result into the hazardLog
                                hazardLog = {...hazardLog, ...result}
                            }

                            // Update the SharePoint list item and load it into the client context
                            listItem.update();
                            ctx().load(listItem);
                        } catch (error) {
                            // In case of an error, create an error log entry for each field
                            hazardLog = {"HazardID": csvObject.ID}
                            setFields.forEach((value) => {hazardLog[value.field] = "Error in setting fields"});
                            console.error("Error setting list item fields:", error);
                        }

                        return hazardLog;
                    }


                    /**
                    * Check if a string is empty and return null if it is.
                    * 
                    * @param {string} str - The string to check for emptiness.
                    * @returns {string|null} - Returns the original string if it's not empty, or null if it's empty.
                    */
                    function checkIfStringIsEmpty(str) {
                        if (str.trim() === '') {
                            return null;
                        }
                        return str;
                    }



                    /**
                    * Load field values of a SharePoint list item asynchronously.
                    * 
                    * @param {object} listItem - The SharePoint list item object to load values for.
                    * @returns {Promise<object>} A Promise that resolves with the loaded field values.
                    */
                    async function loadListItemValues(listItem) {
                        return new Promise((resolve, reject) => {
                            ctx().load(listItem);
                            ctx().executeQueryAsync(
                                () => {
                                    resolve(listItem.get_fieldValues());
                                },
                                (sender, args) => {
                                    reject(args);
                                }
                            );
                        });
                    }


                    /**
                    * Finds the ID for Title values used in Lookup Columns.
                    * 
                    * @param {Object[]} lookupList - List of objects mapping the IDs and Titles for each value which
                    *                                   can be used for a given dropdown down list.
                    * @param {string} titleValue - Title value to be matched for finding the ID.
                    * @returns {string|null} - ID of the matched value or null if not found.
                    */
                    function getIDofLookupItem(lookupList, titleValue) {
                        const matchedItem = lookupList.find((lookupItem) => lookupItem.Title === titleValue);
                        return matchedItem ? matchedItem.ID : null;
                    }


                    /**
                    * Generates risk score based on severity and likelihood scores.
                    *
                    * @param {string} severityScore - The severity score of the risk (1 to 5) as a string.
                    * @param {string} likelihoodScore - The likelihood score of the risk (1 to 5) as a string.
                    * @returns {number|null} - Calculated risk score or null if arguments are invalid.
                    */
                    function generateRiskScore(severityScore, likelihoodScore) {
                        // Helper function to check if a value is a valid number between 1 and 5
                        const isValidScore = (value) => {
                            return typeof value === 'number' && value >= 1 && value <= 5 && !isNaN(value);
                        };

                        // Convert the input strings to integers
                        const severity = parseInt(severityScore, 10);
                        const likelihood = parseInt(likelihoodScore, 10);

                        // Check if severity and likelihood are valid numbers
                        if (!isValidScore(severity) || !isValidScore(likelihood)) {
                            // If scores are invalid then return null
                            return null;
                        }

                        return severity * likelihood;
                    }



                    /**
                    * Generates risk summary based on severity and likelihood scores.
                    *
                    * @param {string} severityScore - The severity score of the risk (1 to 5) as a string.
                    * @param {string} likelihoodScore - The likelihood score of the risk (1 to 5) as a string.
                    * @returns {string|null} - Formatted risk summary or null if arguments are invalid.
                    */
                    function generateRiskSummary(severityScore, likelihoodScore) {
                        // Helper function to check if a value is a valid number between 1 and 5
                        const isValidScore = (value) => {
                            return typeof value === 'number' && value >= 1 && value <= 5 && !isNaN(value);
                        };

                        // Convert the input strings to integers
                        const severity = parseInt(severityScore, 10);
                        const likelihood = parseInt(likelihoodScore, 10);

                        // Check if severity and likelihood are valid numbers
                        if (!isValidScore(severity) || !isValidScore(likelihood)) {
                            // If scores are invalid then return null
                            return null;
                        }

                        /**
                        * Categorises a risk score into low, medium, or high.
                        * @param {number} riskScore - The calculated risk score.
                        * @returns {string} - The risk category.
                        */
                        const categoriseRiskScore = (riskScore) => {
                            if (riskScore < 5) {
                                return "Low-clr_1";
                            } else if (riskScore >= 10) {
                                return "High-clr_5";
                            } else {
                                return "Medium-clr_4";
                            }
                        };

                        /**
                        * Categorises a severity score into corresponding labels.
                        * @param {number} severityScore - The severity score.
                        * @returns {string} - The severity category label.
                        */
                        const categoriseSeverityScore = (severityScore) => {
                            const severityCategories = {
                                1: "Insignificant",
                                2: "Marginal",
                                3: "Moderate",
                                4: "Critical",
                                5: "Catastrophic"
                            };
                            return severityCategories[severityScore];
                        };

                        /**
                        * Categorises a likelihood score into corresponding labels.
                        * @param {number} likelihoodScore - The likelihood score.
                        * @returns {string} - The likelihood category label.
                        */
                        const categoriseLikelihoodScore = (likelihoodScore) => {
                            const likelihoodCategories = {
                                1: "Unlikely",
                                2: "Seldom",
                                3: "Occasional",
                                4: "Likely",
                                5: "Definite"
                            };
                            return likelihoodCategories[likelihoodScore];
                        };

                        // Calculate the risk score by multiplying severity and likelihood scores
                        const riskScore = severityScore * likelihoodScore;
                        const riskCategory = categoriseRiskScore(riskScore);
                        const severityCategory = categoriseSeverityScore(severityScore);
                        const likelihoodCategory = categoriseLikelihoodScore(likelihoodScore);

                        // Create and return the formatted risk summary string
                        return `${riskScore}-${riskCategory}^${severityScore}-${severityCategory}^${likelihoodScore}-${likelihoodCategory}`;
                    }


                    /**
                    * Parse a string containing 3D coordinates separated by '^' and check their validity.
                    * Returns the original string if all coordinates are valid. Otherwise, returns null.
                    *
                    * @param {string} coordinates- String containing coordinates. Each coordinate is in "x,y,z" format.
                    * @returns {string|null} The original string or null if any coordinates are invalid.
                    */
                    function validate3DCoordinates(coordinates) {
                        if (coordinates.trim() === "") {
                            return coordinates; // Return the empty string as valid
                        }

                        const coordinateSets = coordinates.split('^');

                        for (const set of coordinateSets) {
                            const parts = set.split(',').map(part => parseFloat(part.trim()));

                            if (parts.some(isNaN) || parts.length !== 3) {
                                return null; // If any set is invalid, return null
                            }
                        }

                        return coordinates;
                    }


                    /**
                    * Converts a date-time string of format "dd/mm/yyyy hh:mm:ss" to a valid ISO date string.
                    * 
                    * @param {string} dateTimeString - The input date-time string in "dd/mm/yyyy hh:mm:ss" format.
                    * @returns {string|null} The converted ISO date string, or null if conversion fails.
                    */
                    function convertToISODate(dateTimeString, previousLastReviewStatus, currentLastReviewStatus, previousLastReviewDate) {
                        if (previousLastReviewStatus !== currentLastReviewStatus) { // Only update if the hazard has moved in the workflow
                            try {
                                const [datePart, timePart] = dateTimeString.split(' ');
                                const [day, month, year] = datePart.split('/').map(Number);
                                const [hour, minute, second] = timePart.split(':').map(Number);
    
                                // Create a new Date object with the local time
                                const localDate = new Date(year, month - 1, day, hour, minute);
                                const isoDate = localDate.toISOString();
    
                                return isoDate;
                            } catch (error) {
                                console.error("Error converting date-time to ISO format:", error); // Although this is an error, this is allowed - consider the case where a hazard doesn't have any review
                                return previousLastReviewDate;
                            }
                        } else {
                            return previousLastReviewDate;
                        }
                    }


                    /**
                    * Validates and returns the updated value for a field considering peer reviewer and design manager conditions.
                    * If the design manager field is populated but the peer reviewer field is empty,
                    * or if the new value is null, retain the previous value.
                    * 
                    * @param {string} previousValue - Previous value of the field.
                    * @param {string} newValue - New value of the field.
                    * @param {string} peerReviewer - Peer reviewer's name.
                    * @param {string} designManager - Design manager's name.
                    * @param {string[]} validValues - An optional array of valid values that newValue can take.
                    * @returns {string} The validated and updated field value.
                    */
                    function validateWorkflowFields(newValue, peerReviewer, designManager, previousValue, validValues) {
                        if (previousValue === "Under design manager review" && !peerReviewer || designManager && !peerReviewer || newValue === null || validValues && validValues.indexOf(newValue) === -1 || newValue === 0) {
                            toastr.error("Invalid workflow configuration");
                            return new Error("Invalid workflow configuration");
                            // return previousValue;
                        }

                        return newValue;
                    }


                    /**
                    * Generates an updated review summary based on workflow status changes and adds the current date.
                    * 
                    * @param {string} previousReviewSummary - Previous review summary.
                    * @param {string} previousWorkflowStatus - Previous workflow status.
                    * @param {string} newWorkflowStatus - New workflow status.
                    * @param {string} peerReviewer - Peer reviewer's name.
                    * @param {string} designManager - Design manager's name.
                    * @returns {string} The updated review summary.
                    */
                    function generateReviewSummary(previousReviewSummary, previousWorkflowStatus, newWorkflowStatus, peerReviewer, designManager, currentUserName) {

                        // If the design manager field is populated but the peer reviewer field is empty,
                        // or if the new workflow status is null, return previousReviewSummary
                        // If nothing has changed, return previousReviewSummary
                        if (previousWorkflowStatus === newWorkflowStatus || designManager && !peerReviewer || newWorkflowStatus === null) {
                            return previousReviewSummary;
                        }

                        // Get the current date and format it as "dd/mm/yyyy"
                        const currentDate = new Date();
                        const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;

                        // Define a mapping of transitions between workflow statuses and corresponding review summaries
                        const transitionMap = {
                            "Requires mitigation": {
                                "Under design manager review": `${formattedDate}]${peerReviewer}]completed peer review]bulk edited^${formattedDate}]${currentUserName}]requested peer review]bulk edited^${previousReviewSummary}`,
                                "Under principal designer review": `${formattedDate}]${designManager}]completed design manager review]bulk edited^${formattedDate}]${peerReviewer}]completed peer review]bulk edited^${formattedDate}]${currentUserName}]requested peer review]bulk edited^${previousReviewSummary}`
                            },
                            "Assessment in progress": {
                                "Under design manager review": `${formattedDate}]${peerReviewer}]completed peer review]bulk edited^${formattedDate}]${currentUserName}]requested peer review]bulk edited^${previousReviewSummary}`,
                                "Under principal designer review": `${formattedDate}]${designManager}]completed design manager review]bulk edited^${formattedDate}]${peerReviewer}]completed peer review]bulk edited^${formattedDate}]${currentUserName}]requested peer review]bulk edited^${previousReviewSummary}`
                            },
                            "Under peer review": {
                                "Under design manager review": `${formattedDate}]${peerReviewer}]completed peer review]bulk edited^${previousReviewSummary}`,
                                "Under principal designer review": `${formattedDate}]${designManager}]completed design manager review]bulk edited^${formattedDate}]${peerReviewer}]completed peer review]bulk edited^${previousReviewSummary}`
                            },
                            "Under design manager review": {
                                "Under principal designer review": `${formattedDate}]${designManager}]completed design manager review]bulk edited^${previousReviewSummary}`
                            }
                        };

                        // Return the updated review summary based on the transition map,
                        // or the previous review summary if no matching transition is found.
                        return transitionMap[previousWorkflowStatus]?.[newWorkflowStatus] || previousReviewSummary;

                    }


                    async function getCurrentUser() {
                        const userId = _spPageContextInfo.userId;
                        const usersListUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getByTitle(%27cdmUsers%27)/items?$filter=cdmUser%20eq%20${userId}`;
                        const userData = await new Promise((resolve, reject) => {
                            $.ajax({
                                url: usersListUrl,
                                method: 'GET',
                                headers: {
                                    "Accept": "application/json; odata=verbose"
                                },
                                success: (userData) => {
                                    if (userData.d.results.length == 0) {
                                        toastr.error('You do not have any user roles assigned. Please ask your system administrator to add you to the system.')
                                    } else {
                                        resolve(userData.d.results[0])
                                    }
                                },
                                error: (err) => {
                                    reject(err)
                                }
                            });
                        });

                        return userData
                    }

                }

            }
            
        });

    $(".edit")
        .off("click")
        .on("click", function() {
            var hc = $(this).hasClass("tpos-btn-active");
            $(".dataset").removeClass("active");
            $(".tpos-btn").removeClass("tpos-btn-active");
            if (hc == 0) {
                $(".edit").addClass("tpos-btn-active");
                setupEditableHazards(allHazardsData);
            }
            if (hc == 1) {
                $(this).removeClass("tpos-btn-active");
                setupmainareastats(null, cdmSites, allHazardsData);
            }
        });
    $(".review")
        .off("click")
        .on("click", function() {
            var hc = $(this).hasClass("tpos-btn-active");
            $(".dataset").removeClass("active");
            var action = $(this).data("action");
            toastr.success(action);
            $(".tpos-btn").removeClass("tpos-btn-active");
            if (hc == 0) {
                $(this).addClass("tpos-btn-active");
                setupReviewableHazards(action, allHazardsData);
            }
            if (hc == 1) {
                $(this).removeClass("tpos-btn-active");
                setupmainareastats(null, cdmSites, allHazardsData);
            }
        });
}

function activateGlobalNav(cdmSites, allHazardsData) {
    $(".home-button")
        .off("click")
        .on("click", function() {
            var action = $(this).data("action");
            $(".dataset").removeClass("active");
            if (action == "init") {
                setupmainareastats(null, cdmSites, allHazardsData);
            }
            if (action == "systemstats") {
                setupsystemstats();
            }
        });
    $(".tgn-btn-xtra").mouseover(function() {
        var action = $(this).data("action");
        if (action == "dynamicstats") {
            gimmesubs("", "this is DYNAMIC STATS");
        }
        if (action == "test1stats") {
            gimmesubs("", "this is TEST CONTENT 1");
        }
    });
}

function activateHazardOwnerEdit() {
    $(".cell-ownereditable")
        .off("click")
        .on("click", function() {
            var ii = $(this).attr("id");
            var ia = ii.split("_");
            var id = ia[1];
            var is = ia[2];
        });
}
var hzd = 0;
// function setUAID(k){
//     //alert(k);

//     cdmdata.get(
//         "cdmPWStructures",
//         "ID eq '" + k + "'",
//         null,
//         "frmsel_UAID"
//     );
// }
function activateHazardEdits() {
    $(".cell")
        .off("click")
        .on("click", function() {
            var ucanedit = 0;
            var ucanpeerreview = 0;
            var ucandmreview = 0;
            var ucanprecon = 0;
            var ucansmreview = 0;
            var ucanldreview = 0;
            toastr.warning('registered');

            var hi = $(this)
                .parents(".row-hazard")
                .attr("id");
            var hia = hi.split("_");
            var id = hia[1];
            hzd = id;
            var hc = $("#" + hi + " .row-header").html();
            var o = $("#" + hi + " .cdmHazardOwner").html();
            var s = $("#" + hi + " .cdmSite").html();
            var stage = $("#" + hi + " .cdmStageExtra").html();
            var lastrevstatus = $("#" + hi + " .cdmLastReviewStatus").html();
            var revstatus = $("#" + hi + " .cdmCurrentStatus").html();
            // var mitigationowner=$('#'+hi+' .CurrentMitigationOwner').html();
            // var reviewowner=$('#'+hi+' .CurrentReviewOwner').html();
            var flds;
            var fld = "";
            var uce = $("#" + hi + " .uce").hasClass("_1");
            
            const userRoles = $(".fld_cdmUserRoleTitle");
            const userSites = $(".fld_cdmSiteTitle");
            const userRolesSites = [];
            for (let i=0; i<userRoles.length; i++) {
                userRolesSites.push([
                    $(userRoles[i]).data("elementname"),
                    $(userSites[i]).data("elementname"),
                ])
            }

            if (o == '<span class="clr_5">Unassigned</span>') {
                var warning =
                    '<div class="clr_5_active">Before the hazard can be edited and mitigated, an owner has to be assigned.</div>';
                gimmepops(
                    "Assigning an owner",
                    warning +
                    '<div id="popscontentarea"><i class="fa fa-spinner fa-spin"></i> Loading data</div>'
                );

                if (hc == "RAMS hazard") {
                    cdmdata.get(
                        "cdmCompanies",
                        "cdmCompanyRole/Title eq 'Sub contractor'",
                        null,
                        "frmsel_owner",
                        hc,null,[]
                    );
                } else {
                    cdmdata.get(
                        "cdmCompanies",
                        "cdmCompanyRole/Title eq 'Design house'",
                        null,
                        "frmsel_owner",
                        hc,null,[]
                    );
                }
            } else {
                flds = $(this)
                    .attr("class")
                    .split(" ");
                for (var cc = 0; cc < flds.length; cc++) {
                    var tst = flds[cc].substring(0, 3);
                    if (tst == "cdm") {
                        fld = flds[cc];
                    }
                }
                if (fld == "cdmResidualRiskOwner" || fld == "cdmContract") {
                    if (userRolesSites.length > 0) {
                        const url = `${_spPageContextInfo.webServerRelativeUrl}/_api/web/lists/getByTitle(%27cdmHazards%27)/items?$select=cdmCurrentStatus&$filter=ID%20eq%20${hzd}`;
                        $.ajax({
                            url: url,
                            method: 'GET',
                            headers: {
                                "Accept": "application/json; odata=verbose"
                            },
                            success: (data) => {
                                const cdmCurrentStatus = data.d.results[0].cdmCurrentStatus;
                                const fieldNameDict = {
                                    "cdmResidualRiskOwner": "residual risk owner",
                                    "cdmContract": "contract"
                                }
                                if (![`Accepted by ${configData['Client Name']}`, `Ready for review by ${configData['Client Name']}`].includes(cdmCurrentStatus)) {
                                    if (fld == "cdmResidualRiskOwner") {
                                        gimmepops(
                                            "Assigning a Residual Risk Owner",
                                            '<div id="popscontentarea"><i class="fa fa-spinner fa-spin"></i> Loading data</div>'
                                        );
                                        cdmdata.get("cdmResidualRiskOwners", "", null, "frmsel_ResidualRiskOwner", hc,null,[]);
                                    } else {
                                        gimmepops(
                                            "Assigning a future works contract",
                                            '<div id="popscontentarea"><i class="fa fa-spinner fa-spin"></i> Loading data</div>'
                                        );
                                        cdmdata.get("cdmContracts", "", null, "frmsel_Contract", hc,null,[]);
                                    }
                                } else {
                                    toastr.error(`You cannot update the ${fieldNameDict[fld]} because the hazard has a current status of "${cdmCurrentStatus}"`);
                                }
                            }
                        });
                    } else {
                        toastr.error('You do not have a user role assigned so you cannot edit hazards. Ask your system administrator to add you to the system.');
                    }
                }
                else if (!uce) {
                    const peerReviewStage = $("#" + hi + " .rucp").hasClass('_3');
                    const designManagerReviewStage = $("#" + hi + " .rucd").hasClass('_3');
                    const principleDesignerReviewStage = $("#" + hi + " .rucpc").hasClass('_3');
                    const clientReviewStage = $("#" + hi + " .rucl").hasClass('_3');
                    const principalContractorReviewStage = $("#" + hi + " .rucs").hasClass('_3');
                    
                    if (peerReviewStage) {
                        const canPeerReview = $("#" + hi + " .ucp").hasClass("_1");
                        if (canPeerReview) {
                            toastr.error(`This hazard is under peer review so is locked for editing. Please review this hazard and submit a change request if it requires editing. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`);
                        } else if (configData['Peer review editable workflow state']) {
                            toastr.error(`This hazard is under peer review so is locked for editing for all users except designers. Contact a designer to complete the review or make an edit. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`)
                        } else {
                            toastr.error(`This hazard is under peer review so is locked for editing. Contact a designer to complete the review. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`);
                        }
                    } else if (designManagerReviewStage) {
                        const canDesignManagerReview = $("#" + hi + " .ucd").hasClass("_1");
                        if (canDesignManagerReview) {
                            toastr.error(`This hazard is under design manager review so is locked for editing. Please review this hazard and submit a change request if it requires editing. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`);
                        } else if (configData['Design manager review editable workflow state']) {
                            toastr.error(`This hazard is under design manager review so is locked for editing for all users except designers. Contact a design manager to complete the review or make an edit. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`)
                        } else {
                            toastr.error(`This hazard is under design manager review so is locked for editing. Contact a designer manager to complete the review. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`);
                        }
                    } else if (principleDesignerReviewStage) {
                        const canPrincipaldesignReview = $("#" + hi + " .ucpc").hasClass("_1");
                        if (canPrincipaldesignReview) {
                            toastr.error(`This hazard is under principal designer review so is locked for editing. Please review this hazard and submit a change request if it requires editing. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`);
                        } else if (configData['Principal designer review editable workflow state']) {
                            toastr.error(`This hazard is under principal designer review so is locked for editing for all users except construction managers. Contact a construction manager to complete the review or make an edit. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`)
                        } else {
                            toastr.error(`This hazard is under principal designer review so is locked for editing. Contact a principal designer to complete the review. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`);
                        }
                    } else if (clientReviewStage) {
                        const canClientReview = $("#" + hi + " .ucl").hasClass("_1");
                        if (canClientReview) {
                            toastr.error(`This hazard is under client review so is locked for editing. Please review this hazard and submit a change request if it requires editing. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`);
                        } else if (configData['Client review editable workflow state']) {
                            toastr.error(`This hazard is under client review so is locked for editing for all users except principal designers. Contact a principal designer to complete the review or make an edit. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`)
                        } else {
                            toastr.error(`This hazard is under client review so is locked for editing. Contact a client to complete the review. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`);
                        }
                    } else if (principalContractorReviewStage) {
                        const canPrincipalContractorReview = $("#" + hi + " .ucs").hasClass("_1");
                        if (canPrincipalContractorReviewReview) {
                            toastr.error(`This hazard is under principal contractor review so is locked for editing. Please review this hazard and submit a change request if it requires editing. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`);
                        } else if (configData['Principal contractor review editable workflow state']) {
                            toastr.error(`This hazard is under principal contractor review so is locked for editing for all users except construction managers. Contact a construction manager to complete the review or make an edit. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`)
                        } else {
                            toastr.error(`This hazard is under principal contractor review so is locked for editing. Contact a principal contractor to complete the review. ${configData['Full admin edit rights'] ? ' Admins can still make edits if you need to make a change.' : ''}`);
                        }
                    } else if (revstatus == 'Accepted') {
                        if (configData['Client Review']) {
                            toastr.error('This hazard has been accepted so is locked for editing. If necessary you can submit this hazard for client review.');
                        } else {
                            toastr.error('This hazard has been accepted so is locked for editing.');
                        }
                    } else if (revstatus == 'Ready for review by Client') {
                        toastr.error('This hazard is under client review so is locked for editing.');
                    } else if (userRoles.length == 0) {
                        toastr.error('You do not have a user role assigned so you cannot edit hazards. Ask your system administrator to add you to the system.')
                    } else {
                        toastr.error("Not permitted");
                    }
                } else {
                    if (fld == "cdmUniclass") {
                        gimmepops(
                            "Assigning a status",
                            '<div id="popscontentarea"><i class="fa fa-spinner fa-spin"></i> Loading data</div>'
                        );
                        cdmdata.get("cdmStatus", "", null, "frmsel_utag", hc,null,[]);
                    }
                    if (fld == "cdmPASRiskClassification") {
                        gimmepops(
                            "Assigning PAS 1192:6 Risk Classification",
                            '<div id="popscontentarea"><i class="fa fa-spinner fa-spin"></i> Loading data</div>'
                        );
                        cdmdata.get("cdmPASRiskClassification", "", null, "frmsel_PASRiskClassification", hc,null,[]);
                    }
                    if (fld == "cdmContract") {
                        gimmepops(
                            "Assigning a future works contract",
                            '<div id="popscontentarea"><i class="fa fa-spinner fa-spin"></i> Loading data</div>'
                        );
                        cdmdata.get("cdmContracts", "", null, "frmsel_Contract", hc,null,[]);
                    }
                    if (fld == "cdmPWElement") {
                        gimmepops(
                            "Assigning an element",
                            '<div id="popscontentarea"><i class="fa fa-spinner fa-spin"></i> Loading data</div>'
                        );
                        cdmdata.get("cdmPWElementTerms", "", null, "frmsel_element", hc,null,[]);
                    }
                    if (fld == "cdmHazardDescription") {
                        var existingTxt = $("#" + hi + " .cdmHazardDescription").html();
                        var txtbox =
                            '<div><textarea id="txtform" rows="6" cols="60">' +
                            existingTxt +
                            "</textarea></div>";
                        var svBtn =
                            '<div class="tpos-left-btn sv-hazard" onclick="savetxt(\'cdmHazardDescription\');">Save</div>';
                        gimmepops(
                            "Describing the hazard",
                            '<div class="clr_3_active">A hazard is something with the potential to cause harm</div>' +
                            txtbox
                        );
                        const popsContent = document.getElementsByClassName("pops-content")[0];
                        popsContent.innerHTML += svBtn;
                    }
                    if (fld == "cdmRiskDescription") {
                        var existingTxt = $("#" + hi + " .cdmRiskDescription").html();
                        var txtbox =
                            '<div><textarea id="txtform" rows="6" cols="60">' +
                            existingTxt +
                            "</textarea></div>";
                        var svBtn =
                            '<div class="tpos-left-btn sv-hazard" onclick="savetxt(\'cdmRiskDescription\');">Save</div>';
                        gimmepops(
                            "Describing the risk",
                            '<div class="clr_3_active">What harm could be caused to whom or what?</div>' +
                            txtbox
                        );
                        const popsContent = document.getElementsByClassName("pops-content")[0];
                        popsContent.innerHTML += svBtn;
                    }

                    if (fld == "cdmMitigationDescription") {
                        var existingTxt = $("#" + hi + " .cdmMitigationDescription").html();
                        var txtbox =
                            '<div><textarea id="txtform" rows="6" cols="60">' +
                            existingTxt +
                            "</textarea></div>";
                        var svBtn =
                            '<div class="tpos-left-btn sv-hazard" onclick="savetxt(\'cdmMitigationDescription\');">Save</div>';
                        gimmepops(
                            "Our mitigation",
                            '<div class="clr_3_active">Completed actions to minimise the risks</div>' +
                            txtbox
                        );
                        const popsContent = document.getElementsByClassName("pops-content")[0];
                        popsContent.innerHTML += svBtn;
                    }
                    if (fld == "cdmStageMitigationSuggestion" && hc != "RAMS hazard") {
                        var existingTxt = $(
                            "#" + hi + " .cdmStageMitigationSuggestion"
                        ).html();
                        var txtbox =
                            '<div><textarea id="txtform" rows="6" cols="60">' +
                            existingTxt +
                            "</textarea></div>";
                        var svBtn =
                            '<div class="tpos-left-btn sv-hazard" onclick="savetxt(\'cdmStageMitigationSuggestion\');">Save</div>';
                        gimmepops(
                            "Your mitigation suggestion for " + stage,
                            '<div class="clr_3_active">Suggested actions to minimise the risks</div>' +
                            txtbox
                        );
                        const popsContent = document.getElementsByClassName("pops-content")[0];
                        popsContent.innerHTML += svBtn;
                    }
                    if (fld == "cdmInitialRAG" || fld == "cdmResidualRAG") {
                        var rags = '<div id="rags"></div>';
                        gimmepops(
                            "Assessing and applying project controls - Initial control",
                            '<div class="clr_3_active">Search for, select or suggest a project control applicable to the hazard / risk</div>' +
                            rags,
                            "pops-fullscreen"
                        );
                        $("#rags").load("../3.0/html/rag.tables.html", function() {
                            getJsonFromTxt("rag.txt").done(function(data) {
                                //data=JSON.parse(data);
                                var cnt = data.length;
                                var reda = "";
                                var amba = "";
                                var grea = "";
                                var btns = [];
                                //toastr.success(cnt);
                                for (var cc = 0; cc < cnt; cc++) {
                                    var t = data[cc].RAG;
                                    var s = data[cc].Colour;
                                    var d = data[cc].RAGStatement;
                                    var tds =
                                        '<td><div class="padded">' +
                                        t +
                                        '</div></td><td><div class="padded">' +
                                        d +
                                        "</div></td>";
                                    if (s == "Red") {
                                        reda =
                                            '<tr class="rag rag-red" data-v="' +
                                            cc +
                                            '"><td>' +
                                            tds +
                                            "</tr>";
                                        $("#ragdatared").append(reda);
                                    }
                                    if (s == "Amber") {
                                        amba =
                                            '<tr class="rag rag-amber" data-v="' +
                                            cc +
                                            '"><td>' +
                                            tds +
                                            "</tr>";
                                        $("#ragdataamber").append(amba);
                                    }
                                    if (s == "Green") {
                                        grea =
                                            '<tr class="rag rag-green" data-v="' +
                                            cc +
                                            '"><td>' +
                                            tds +
                                            "</tr>";
                                        $("#ragdatagreen").append(grea);
                                    }
                                    btns.push([t, s, d]);
                                }
                                $(".sk-circle").hide();
                                $(".rag").click(function() {
                                    var v = $(this).data("v");
                                    var trm = btns[v];
                                    var val = trm[0] + "^" + trm[2] + "^" + trm[1];
                                    var tdata = [];
                                    tdata.push(fld + "|" + val);
                                    cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                    $("#pops").remove();
                                });
                                $(".svrag").click(function() {
                                    var sggid = $(this).attr("id");
                                    var clr = $("#ragclr").val();
                                    var sgg = $("#ragsuggestion").val();
                                    if (sggid == "ragu") {
                                        if (clr == "none" || sgg == "" || sgg == null) {
                                            toastr.error("Please provide a colour and a suggestion");
                                        }
                                        if (clr != "none" && sgg != "") {
                                            var tdata = [];
                                            tdata.push(
                                                fld + "|" + "RAGSG" + hzd + "^" + sgg + "^" + clr
                                            );
                                            cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                            $("#pops").remove();
                                        }
                                    } else {
                                        var tdata = [];
                                        tdata.push(
                                            fld +
                                            "|" +
                                            "None^No applicable project control found^NONE"
                                        );
                                        cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                        $("#pops").remove();
                                    }
                                });
                            });
                        });

                        // $('#pops').css('min-height','250px');
                    }
                    if (fld == "cdmInitialRisk") {
                        gimmepops("Setting the risk score", '<div id="rsselector"></div>');
                        $("#rsselector").load(
                            "../3.0/html/risk.initial.selection.panel.html",
                            function() {
                                $("#inirisk").append(
                                    '<div class="tpos-left-btn sv-hazard" onclick="saversk(\'' +
                                    fld +
                                    "');\">Save</div>"
                                );
                            }
                        );
                    }
                    if (fld == "cdmResidualRisk") {
                        gimmepops("Setting the risk score", '<div id="rsselector"></div>');
                        $("#rsselector").load(
                            "../3.0/html/risk.residual.selection.panel.html",
                            function() {
                                $("#inirisk").append(
                                    '<div class="tpos-left-btn sv-hazard" onclick="saversk(\'' +
                                    fld +
                                    "');\">Save</div>"
                                );
                            }
                        );
                    }
                    if (fld == "cdmHazardType") {
                        var cv = $(this).html();
                        var tdata = [];
                        if (cv == "Health") {
                            tdata.push("cdmHazardType|2");
                        } else {
                            tdata.push("cdmHazardType|1");
                        }
                        toastr.success("Switching hazard type");
                        cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                        $("#pops").remove();
                    }
                    if (fld == "cdmHazardCoordinates") {
                        var str = $("#h_" + hzd + "_fullco").html();
                        var coordinates = [];
                        if (str) {
                            coordinates = str.split("^");
                        }
                        var cd = "";
                        for (var cc = 0; cc < coordinates.length; cc++) {
                            cd += decCTag(cc, coordinates[cc]);
                        }
                        var cdtbl =
                            '<table id="newcoordinates" class="width-350">' +
                            cd
                        const tableContent = '<tr class="ctagnew"><td><input style="color:rgb(0,0,0)" type="number" id="nx" placeholder="x" ></td><td><input style="color:rgb(0,0,0)" type="number" id="ny" placeholder="y" ></td><td><input style="color:rgb(0,0,0)" type="number" id="nz" placeholder="z" ></td><td><div class="tpos-addbtn">+</div></td></tr><tr><td colspan="4"><div class="tpos-svbtn">Save and Close</div></td></tr></table>';
                        // var ctags=getctags(str);
                        gimmepops("Managing coordinates", cdtbl);
                        const popsContent = document.getElementsByClassName("pops-content")[0];
                        popsContent.innerHTML += tableContent;
                        var na = [];
                        $(".tpos-delbtn")
                            .off("click")
                            .on("click", function() {
                                // var na=[];
                                coordinates = [];
                                var rid = $(this)
                                    .attr("id")
                                    .substring(5);
                                var delrow = $("#ctagrow_" + rid);
                                delrow.remove();
                                var keeprow = $(".tpos-delbtn");
                                keeprow.each(function() {
                                    coordinates.push($(this).data("ctag"));
                                });
                            });
                        $(".tpos-addbtn")
                            .off("click")
                            .on("click", function() {
                                var x = sanitizeInput($("#nx").val());
                                var y = sanitizeInput($("#ny").val());
                                var z = sanitizeInput($("#nz").val());
                                if (!x || !y || !z) {}
                                else{
                                    var xyz = x + "," + y + "," + z;
                                    coordinates.push(xyz);
                                    var dd = "";
                                    for (var cc = 0; cc < coordinates.length; cc++) {
                                        dd += decCTag(cc, coordinates[cc]);
                                    }

                                    var cdtbl =
                                        '<table id="newcoordinates" class="width-350">' +
                                        dd
                                    var sanitisedCdtbl = sanitizeHTML(cdtbl);
                                    $("#newcoordinates").replaceWith(sanitisedCdtbl);
                                    $(".tpos-svbtn")
                                        .off("click")
                                        .on("click", function() {
                                            var savecoordinates = "";
                                            for (var ff = 0; ff < coordinates.length; ff++) {
                                                if (ff == 0) {
                                                    savecoordinates = coordinates[ff];
                                                } else {
                                                    savecoordinates += "^" + coordinates[ff];
                                                }
                                            }
                                            var tdata = [];
                                            tdata.push("cdmHazardCoordinates|" + savecoordinates);
                                            cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                            $("#pops").remove();
                                        });
                            }});
                        $(".tpos-svbtn")
                            .off("click")
                            .on("click", function() {
                                var savecoordinates = "";
                                for (var ff = 0; ff < coordinates.length; ff++) {
                                    if (ff == 0) {
                                        savecoordinates = coordinates[ff];
                                    } else {
                                        savecoordinates += "^" + coordinates[ff];
                                    }
                                }
                                var tdata = [];
                                tdata.push("cdmHazardCoordinates|" + savecoordinates);
                                cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                $("#pops").remove();
                            });
                        // activateCoordinatesSave();
                    }
                    if (fld == "cdmHazardTags") {
                        gimmepops(
                            "Assigning a hazard tag",
                            '<div id="popscontentarea"><i class="fa fa-spinner fa-spin"></i> Loading data</div>'
                        );
                        cdmdata.get("cdmTags", "", null, "frmsel_htag", hc,null,[]);
                    }
                    if (fld == "cdmLinks") {
                        var existingTxt = $("#" + hi + " .cdmLinks").html();
                        var txtbox =
                        '<div><textarea id="txtform" rows="6" cols="60">' +
                        existingTxt +
                        "</textarea></div>";
                        var svBtn =
                        '<div class="tpos-left-btn sv-hazard" onclick="savetxt(\'cdmLinks\');">Save</div>';
                        gimmepops(
                        "Associated Links",
                        txtbox
                        );
                        const popsContent = document.getElementsByClassName("pops-content")[0];
                        popsContent.innerHTML += svBtn;
                    }

                    if (fld == 'cdmSMMitigationSuggestion') {
                        let canSiteManagerEdit = false;
                        let systemAdmin = false;
                        for (let i=0; i<userRolesSites.length; i++) {
                            if (userRolesSites[i][0] == 'Construction Manager' && userRolesSites[i][1] == s) {
                                canSiteManagerEdit = true;
                            }
                            if (userRolesSites[i][0] == 'System admin') {
                                systemAdmin = true;
                            }
                        }
                        if ((fld == "cdmSMMitigationSuggestion" && canSiteManagerEdit) || systemAdmin) {
                            if (!configData['Construction manager approval comment populates cdmSMMitigationSuggestion'] || systemAdmin) { // If this is the case you should only be able to edit this field through the approval comment
                                var existingTxt = $(
                                    "#" + hi + " .cdmSMMitigationSuggestion"
                                ).html();
                                var txtbox =
                                    '<div><textarea id="txtform" rows="6" cols="60">' +
                                    existingTxt +
                                    "</textarea></div>";
                                var svBtn =
                                    '<div class="tpos-left-btn sv-hazard" onclick="savetxt(\'cdmSMMitigationSuggestion\');">Save</div>';
                                gimmepops(
                                    "Your mitigation suggestion for " + stage,
                                    '<div class="clr_3_active">Suggested actions to minimise the risks</div>' +
                                    txtbox
                                );
                                const popsContent = document.getElementsByClassName("pops-content")[0];
                                popsContent.innerHTML += svBtn;
                            } else {
                                toastr.error('This field can only be edited through the site managers approval comment at the principal designer review workflow stage');
                            }
                        } else {
                            toastr.error("You cannot provide a principal contractor's mitigation suggestion because you are not a principal contractor for the site where this hazard is located");
                        }
                    }
                    // if (fld == "cdmUniclass") {
                    //     gimmepops(
                    //         "Assigning a status",
                    //         '<div id="popscontentarea"><i class="fa fa-spinner fa-spin"></i> Loading data</div>'
                    //     );
                    //     cdmdata.get("cdmStatus", "", null, "frmsel_utag", hc);
                    // }
                }
            }

            // if(is='cdmHazardOwner'){
            //     gimmepops('Assigning an owner');
            // }else{

            // }
        });

}

function activateRAMSBtn() {
    // toastr.error('what is this?');
    // $('.mkramsbtn').off('click').on('click',function(){
    $('.mkramsbtn').on('click', async function() {
        var a = $(this).data("action");
        var hi = $(this)
            // .parents(".row-hazard")
            .attr("id");
        var hia = hi.split("_");
        var id = hia[1];
        // toastr.success("what???: " + id);
        hzd = id;
        var hist = "";
        var nd = new Date();
        var nnd = ukdate(nd);
        var ind = isodate(nd);
        //   toastr.success(nnd);
        var user = unm();
        var nl = "";
        var vn = $("#h_" + hzd + " .cdmSite").html();
        toastr.success('action: ' + a + ' id: ' + hzd);
        var tdata = [];

        var ht = "#h_" + hzd + " ";
        var hz = $("#h_" + hzd + " .cdmHazardDescription").html();
        var rs = $("#h_" + hzd + " .cdmRiskDescription").html();
        var risks = $(ht + ".cdmRR").html();
        var dasite = $(ht + ".cdmSite").data("siteid");
        var trisks = risks.split("-");
        var riskscoreval = trisks[0];
        var rscv = parseInt(riskscoreval, 10);

        var title1 = new Date();
        //var title2=uid();
        var title10 =
            title1.getTime() +
            "^" +
            title1.getDate() +
            "^" +
            title1.getMonth() +
            1 +
            "^" +
            title1.getFullYear();
        var title = title10.toString() + "^" + uid();
        var ms = "Awaiting mitigation";
        var stmsugg = $(
            ht + ".cdmStageMitigationSuggestion"
        ).html();

        // We need to work out the ID of the stage
        const stagesExtraUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getByTitle(%27cdmStagesExtra%27)/items`;
        const stagesExtraResponse = await $.ajax({
            url: stagesExtraUrl,
            method: 'GET',
            headers: {
                "Accept": "application/json; odata=verbose"
            }
        });
        const stagesExtraDict = stagesExtraResponse.d.results.reduce((acc, curr) => {
            acc[curr["Title"]] = curr["ID"];
            return acc;
        }, {});
        var stg = $(ht + ".cdmStageExtra").html();
        var stgi = stagesExtraDict[stg];
        var hzt = $(ht + ".cdmType").html();
        var hzti = 2;
        if (hzt == "Health") {
            hzti = 1;
        }
        // base array for any new rams hazard

        tdata.push("Title|" + title);
        tdata.push("cdmSiblings|" + title);
        tdata.push("cdmParent|" + hzd);
        tdata.push("cdmHazardDescription|" + hz);
        tdata.push("cdmRiskDescription|" + rs);
        tdata.push("cdmMitigationDescription|" + ms);
        tdata.push("cdmSite|" + dasite);
        tdata.push("cdmInitialRisk|" + risks);
        tdata.push("cdmResidualRisk|" + risks);
        tdata.push("cdmHazardType|" + hzti);
        tdata.push("cdmInitialRiskScore|" + rscv);
        tdata.push("cdmResidualRiskScore|" + rscv);
        tdata.push("cdmStageExtra|" + stgi);
        // tdata.push('cdmIniRisk|'+$('#inirisk').prop('outerHTML'));
        // tdata.push('cdmResRisk|'+$('#inirisk').prop('outerHTML'));
        tdata.push("cdmStageMitigationSuggestion|See parent hazard");
        var screen = $('#tpos-main').html();
        $('#tpos-main').html('');
        // $('.dataset').removeClass('active');
        $('#stats').remove();
        $('#systemstats').remove();
        $('#userstats').remove();
        // var newmain='<div class="tpos-main" id="tpos-main"></div>';
        // $('.tpos-body').prepend(newmain);

        $('#tpos-main').html('<div class="tpos-area-title">RAMS results for hazard: ' + hzd + '</div><div id="ramsresults" class="tpos-area-content"></div><div class="clsbtn">Close</div>');
        var utbl = '<div class="row"><div id="hazardstable"></div></div>';
        var ramsfrm = '<div class="row"><div id="ramsfrm"></div></div>';
        var datapack = '<div id="parentdata" data-parent="' + tdata + '"></div>';
        $('#ramsresults').html(ramsfrm + utbl + datapack);
        cdmdata.get(
            "cdmHazards",
            'cdmParent eq ' + hzd,
            "Modified desc",
            "hazards-table-rams",
            "hazardstable",null,[]
        );

        $('.clsbtn').click(function() {
            $('#tpos-main').html('');
            $('#tpos-main').html(screen);
            $("#tpos_search").keyup(function() {
                var q = sanitizeInput($("#tpos_search").val());
                if (q != "" && q != " ") {
                    var f = $("div.row-hazard:Contains('" + q + "')");

                    $("div.row-hazard")
                        .css("display", "none")
                        .filter(f)
                        .css("display", "block");
                } else {
                    $("div.row-hazard").css("display", "block");
                }
            });



            hazardreviewbuttonaction();
            toggleCollapse();
            toggleInfoPanel();
            activateHazardEdits();
            // activateRAMSActions();
            activateRAMSBtn();
            // rows to target


        });



        if (a === 'mkrams') {
            // $('#ramsfrm').load('../3.0/html/rams.adder.html',function(){
            // $("#addramsbtn").hide();
            $('#ramsfrm').html(
                '<div><p>As the Construction Manager undertaking the Pre-Construction Review, you can link this hazard to RAMS documents. The system then generates RAMS hazards which can be independently reviewed and mitigated by the construction team.</p><p>Note that you can add several RAMS hazards; just select another hazard after clicking the Create button.</p></div>' +
                '<div><textarea id="smmsgg" rows="3" cols="35" placeholder="Enter Construction Manager mitigation suggestion?"></textarea></div>' +
                '<div class="select-panel" id="rams"><div class="tpos-lbl">Search for a RAMS</div><div class="tpos-select" id="div_sel_rams"></div></div><div id="rmsbutton" class="row content"><div id="addramsbtn" class="tpos-svramsbtn">Create RAMS Hazard</div></div>'
            );
            jsonRAMS.get("rams", vn, "sel_rams");
            $('#addramsbtn').click(function() {
                var nrdata = [];
                // var tdata=$('#parentdata').data('parent');
                for (var cc = 0; cc < tdata.length; cc++) {
                    nrdata.push(tdata[cc]);
                }
                var mits = $("#smmsgg").val();
                if (!mits) {
                    toastr.error(
                        "Please enter a mitigation suggestion first"
                    );
                } else {

                    var raid = $("#val_rams").html();
                    var ratx = $("#sel_rams").val();
                    if (raid && ratx) {
                        nrdata.push("cdmSMMitigationSuggestion|" + mits);
                        nrdata.push("cdmRAMS|" + raid);
                        nrdata.push("cdmEntityTitle|" + ratx);
                        // $('#ramssummary').html(nrdata);
                        $("#val_rams").html('');
                        $("#sel_rams").val('');
                        $("#addramsbtn").hide();
                        tposdata.setRAMS("cdmHazards", nrdata, hzd);
                    } else if (!raid && !ratx) {
                        toastr.error('Please ask the system admin to add RAMS data to the system')
                    } else if (!ratx) {
                        toastr.error('The selected RAMS is incorrectly formatted. Please ask the system admin to correct the format, removing all whitespace from the RAMS title.')
                    }

                }

            });

        }

    });

}

function activateADDRAMSBTN() {
    // $('#rmsbutton').html('<div id="addramsbtn" class="tpos-svramsbtn">Create RAMS Hazard</div>');
    $('#addramsbtn').click(function() {
        var nrdata = [];
        var tdata=$('#parentdata').data('parent');
        for (var cc = 0; cc < tdata.length; cc++) {
            nrdata.push(tdata[cc]);
        }
        var mits = $("#smmsgg").val();
        if (!mits) {
            toastr.error(
                "Please enter a mitigation suggestion first"
            );
        } else {

            var raid = $("#val_rams").html();
            var ratx = $("#sel_rams").val();
            if (raid && ratx) {
                nrdata.push("cdmSMMitigationSuggestion|" + mits);
                nrdata.push("cdmRAMS|" + raid);
                nrdata.push("cdmEntityTitle|" + ratx);

                // $('#ramssummary').html(nrdata);
                $("#val_rams").html('');
                $("#sel_rams").val('');
                $("#addramsbtn").hide();
                tposdata.setRAMS("cdmHazards", nrdata, hzd);
            }

        }

    });

}

function activateRAMSActions() {
    $('.mkramsbtn').click(function() {
        var a = $(this).data("action");
        var hi = $(this)
            // .parents(".row-hazard")
            .attr("id");
        var hia = hi.split("_");
        var id = hia[1];
        //   toastr.success("what???: " + id);

        hzd = id;
        var hist = "";
        var nd = new Date();
        var nnd = ukdate(nd);
        var ind = isodate(nd);
        //   toastr.success(nnd);
        var user = unm();
        var nl = "";
        var vn = $("#h_" + hzd + " .cdmSite").html();
        toastr.success('action: ' + a + ' id: ' + hzd);
        var tdata = [];

        var ht = "#h_" + hzd + " ";
        var hz = $("#h_" + hzd + " .cdmHazardDescription").html();
        var rs = $("#h_" + hzd + " .cdmRiskDescription").html();
        var risks = $(ht + ".cdmRR").html();
        var dasite = $(ht + ".cdmSite").data("siteid");
        var trisks = risks.split("-");
        var riskscoreval = trisks[0];
        var rscv = parseInt(riskscoreval, 10);

        var title1 = new Date();
        //var title2=uid();
        var title10 =
            title1.getTime() +
            "^" +
            title1.getDate() +
            "^" +
            title1.getMonth() +
            1 +
            "^" +
            title1.getFullYear();
        var title = title10.toString() + "^" + uid();
        var ms = "Awaiting mitigation";
        var stmsugg = $(
            ht + ".cdmStageMitigationSuggestion"
        ).html();
        var stg = $(ht + ".cdmStageExtra").html();
        var stgi = 1;
        if (stg != "Construction") {
            stgi = 2;
        }
        var hzt = $(ht + ".cdmType").html();
        var hzti = 2;
        if (hzt == "Health") {
            hzti = 1;
        }
        // base array for any new rams hazard

        tdata.push("Title|" + title);
        tdata.push("cdmSiblings|" + title);
        tdata.push("cdmParent|" + hzd);
        tdata.push("cdmHazardDescription|" + hz);
        tdata.push("cdmRiskDescription|" + rs);
        tdata.push("cdmMitigationDescription|" + ms);
        tdata.push("cdmSite|" + dasite);
        tdata.push("cdmInitialRisk|" + risks);
        tdata.push("cdmResidualRisk|" + risks);
        tdata.push("cdmHazardType|" + hzti);
        tdata.push("cdmInitialRiskScore|" + rscv);
        tdata.push("cdmResidualRiskScore|" + rscv);
        tdata.push("cdmStageExtra|" + stgi);
        // tdata.push('cdmIniRisk|'+$('#inirisk').prop('outerHTML'));
        // tdata.push('cdmResRisk|'+$('#inirisk').prop('outerHTML'));
        tdata.push("cdmStageMitigationSuggestion|" + stmsugg);

        $('#tpos-main').html('');
        // $('.dataset').removeClass('active');
        $('#stats').remove();
        $('#systemstats').remove();
        $('#userstats').remove();
        // var newmain='<div class="tpos-main" id="tpos-main"></div>';
        // $('.tpos-body').prepend(newmain);

        $('#tpos-main').html('<div class="tpos-area-title">RAMS results for hazard: ' + hzd + '</div><div id="ramsresults" class="tpos-area-content"></div>');
        var utbl = '<div class="row"><div id="hazardstable"></div></div>';
        var ramsfrm = '<div class="row"><div id="ramsfrm"></div></div>';
        $('#ramsresults').html(ramsfrm + utbl);
        if (a === 'mkrams') {
            $('#ramsfrm').load('../3.0/html/rams.adder.html', function() {
                // $("#addramsbtn").hide();
                jsonRAMS.get("rams", vn, "sel_rams");
            });
        }
        // cdmdata.getQuickCount('cdmHazards',1,'cdmParent eq '+hzd,'Associated RAMS hazards','parentmatch','blue',null);
        cdmdata.get(
            "cdmHazards",
            'cdmParent eq ' + hzd,
            "Modified desc",
            "hazards-table",
            "hazardstable",null,[]
        );



        // new form and new 

    });
}

// function activateCoordinatesActions(){
//     coordinates=[];
//     $('.tpos-delbtn').off('click').on('click',function(){
//         // var na=[];

//         var rid=$(this).attr('id').substring(5);
//         var delrow=$('#ctagrow_'+rid);
//         delrow.remove();
//         var keeprow=$('.tpos-delbtn');
//         keeprow.each(function(){
//             coordinates.push($(this).data('ctag'));
//         });
//     });
//     $('.tpos-addbtn').off('click').on('click',function(){
//         var x=$('#nx').val();
//         var y=$('#ny').val();
//         var z=$('#nz').val();
//         var xyz=x+','+y+','+z;
//         coordinates.push(xyz);
//         var dd='';
//         for(var cc=0;cc<coordinates.length;cc++){
//             dd+=decCTag(cc,coordinates[cc]);
//         }

//         var cdtbl='<table id="newcoordinates" class="width-350">'+dd+'<tr class="ctagnew"><td><input style="color:rgb(0,0,0)" type="number" id="nx" placeholder="x" ></td><td><input style="color:rgb(0,0,0)" type="number" id="ny" placeholder="y" ></td><td><input style="color:rgb(0,0,0)" type="number" id="nz" placeholder="z" ></td><td><div class="tpos-addbtn">+</div></td></tr><tr><td colspan="4"><div class="tpos-svbtn">Save and Close</div></td></tr></table>';
//         $('#newcoordinates').replaceWith(cdtbl);
//         // savecoordinates();
//     });
//     $('.tpos-svbtn').off('click').on('click',function(){
//         var savecoordinates='';
//         for(var ff=0;ff<coordinates.length;ff++){
//             if(ff==0){
//                 savecoordinates=coordinates[ff];
//             }else{
//                 savecoordinates+='^'+coordinates[ff];
//             }
//         }
//         var tdata=[];
//         tdata.push('cdmHazardCoordinates|'+savecoordinates);
//         cdmdata.update('cdmHazards',tdata,'frmedit_updateview');
//         $('#pops').remove();

//     });

// }

function decCTag(ai, str) {
    var st = str.split(",");
    var t =
        '<tr id="ctagrow_' +
        ai +
        '" class="ctagd"><td>' +
        st[0] +
        "</td><td>" +
        st[1] +
        "</td><td>" +
        st[2] +
        '</td><td><div id="ctag_' +
        ai +
        '" data-ctag="' +
        str +
        '" class="tpos-delbtn">-</div></td></tr>';
    return t;
}

function decHTag(ai, str) {
    var st = str.split(",");
    var t =
        '<tr id="htagrow_' +
        ai +
        '" class="htagd"><td>' +
        st[0] +
        "</td><td>" +
        st[1] +
        "</td><td>" +
        st[2] +
        '</td><td><div id="htag_' +
        ai +
        '" data-htag="' +
        str +
        '" class="tpos-delbtn">-</div></td></tr>';
    return t;
}

// function savecoordinates(){
//     $('.tpos-svbtn').off('click').on('click',function(){
//         var savecoordinates='';
//         for(var ff=0;ff<coordinates.length;ff++){
//             if(ff==0){
//                 savecoordinates=coordinates[ff];
//             }else{
//                 savecoordinates+='^'+coordinates[ff];
//             }
//         }
//         var tdata=[];
//         tdata.push('cdmHazardCoordinates|'+savecoordinates);
//         cdmdata.update('cdmHazards',tdata,'frmedit_updateview');
//         $('#pops').remove();

//     });

// }

function activateCoordinatesSave() {
    $(".tpos-svbtn")
        .off("click")
        .on("click", function() {
            var x = $("#x").val();
            var y = $("#y").val();
            var z = $("#z").val();
            var newstring = "";
            var oldstring = $("#h_" + hzd + "_fullcoor").html();

            if (!x || !y || !z) {
                toastr.error(
                    "Please enter all three numbers or press cancel (X) to close the pop up"
                );
            }

            if (x && y && z) {
                if (oldstring) {
                    newstring = oldstring + "^" + x + "," + y + "," + z;
                } else {
                    newstring = x + "," + y + "," + z;
                }
            }

            var sanitizedNewString = escapeHTML(newstring)
            $("#h_" + hzd + "_fullcoor").html(sanitizedNewString);

            var ctags = getctags(newstring);
            
            var sanitizedCtags = sanitizeHTML(ctags);
            $("#mngCoo").replaceWith(sanitizedCtags);
            activateCoordinatesSave();
        });
    $(".tpos-svcbtn")
        .off("click")
        .on("click", function() {
            var tdata = [];
            var nd = $("#h_" + hzd + "_fullcoor").html();
            var x = $("#x").val();
            var y = $("#y").val();
            var z = $("#z").val();

            if (x && y && z) {
                nd = nd + "^" + x + "," + y + "," + z;
            }

            if (nd) {
                tdata.push("cdmHazardCoordinates|" + nd);
                cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                $("#pops").remove();
            } else {
                tdata.push("cdmHazardCoordinates|" + "");
                cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                $("#pops").remove();
            }
        });
    $(".ctagd")
        .off("click")
        .on("click", function() {
            var delline = $(this).data("numero");
            var fline = $("#h_" + hzd + "_fullco").html();
            var newtags = deletectag(delline, fline);
            var ctags = getctags(newtags);
            $("#mngCoo").replaceWith(ctags);
            activateCoordinatesSave();
            // toastr.error('deleting row');
        });
}

function deletectag(delline, old) {
    var strings = [];
    strings = old.split("^");
    newline = "";
    for (var i = 0; i < strings.length; i++) {
        var t = strings[i];
        if (delline == t) {
            t = "";
        }
        newline += t;
    }
    return newline;
}

function getctags(str) {
    var ippanel =
        '<div><input style="color:rgb(0,0,0)" type="number" placeholder="x" id="x" ><input style="color:rgb(0,0,0)" type="number" placeholder="y" id="y" ><input style="color:rgb(0,0,0)" type="number" placeholder="z" id="z" ></div>';
    var svbtn =
        '<div class="tpos-svbtn">+</div><div class="tpos-svcbtn">Save & Close</div>';
    var ctags = "";
    if (str) {
        var strings = [];
        strings = str.split("^");
        var t = "<tr><th>x</th><th>y</th><th>z</th></tr>";

        for (var i = 0; i < strings.length; i++) {
            var string = strings[i];
            var st = string.split(",");
            var x = st[0];
            var y = st[1];
            var z = st[2];

            if (string != "") {
                t +=
                    '<tr class="ctagd" data-numero="' +
                    i +
                    '"><td>' +
                    x +
                    "</td><td>" +
                    y +
                    "</td><td>" +
                    z +
                    "</td></tr>";
            }
        }
        ctags =
            '<div id="mngCoo"><table class="coordinatesTBL" style="width:45%;">' +
            t +
            '</table><div class="" id="h_' +
            hzd +
            '_fullcoor">' +
            str +
            "</div>" +
            ippanel +
            svbtn +
            "</div>";
    } else {
        ctags = ippanel + svbtn;
    }
    return ctags;
}

function savetxt(fld) {
    var tdata = [];
    var txt = sanitizeInput($("#txtform").val());
    // toastr.success(txt);
    tdata.push(fld + "|" + txt);
    cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
    $("#pops").remove();
}

function tposSelectOwner(lst, data, hzdt, trg) {
    var tlist = data.d.results;
    var options =
        '<tr><td class="hide" id="val_' +
        lst +
        '">0</td><td><input class="tpos-' +
        lst +
        '-select-input dvi" id="sel_' +
        lst +
        '" autofill="false" placeholder="Select a design house ..."></td></tr>';
    if (hzdt == "RAMS hazard") {
        options =
            '<tr><td class="hide" id="val_' +
            lst +
            '">0</td><td><input class="tpos-' +
            lst +
            '-select-input dvi" id="sel_' +
            lst +
            '" autofill="false" placeholder="Select a sub contractor ..."></td></tr>';
    }
    for (var cc = 0; cc < tlist.length; cc++) {
        var it = tlist[cc];
        var itid = it.ID;
        var ittitle = it.Title;
        options +=
            '<tr style="display:none;" class="tpos-' +
            lst +
            '-select-value dvs" data-list="' +
            lst +
            '" data-value="' +
            itid +
            '"><td id="dv_' +
            lst +
            "_" +
            itid +
            '">' +
            ittitle +
            "</td></tr>";
    }
    $("#popscontentarea").html(
        '<table class="tpos-select-table">' + options + "</table>"
    );
    // $('#sel_' + lst).blur(function(){
    //     $('.dvs').hide();
    // });

    $("#sel_" + lst).bind("keyup change", function(ev) {
        var st = $(this).val();
        $("#val_" + lst).html("0");
        if (st) {
            $("tr:not(:Contains(" + st + "))").each(function() {
                var t = $(this).html();
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).hide();
                }
            });
            $("tr:Contains(" + st + ")").each(function() {
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).show();
                }
            });
        }
    });
    $("#sel_" + lst).click(function() {
        var st = $(this).val();
        toastr.success(st);
        if (!st || st == "") {
            $("tr").each(function() {
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).show();
                }
            });
        }
    });
    var stopblur = 0;
    $(".tpos-" + lst + "-select-value").mousedown(function() {
        stopblur = 1;
    });

    $(".tpos-" + lst + "-select-value").click(function() {
        var dvid = $(this).data("value");
        var dv = $("#dv_" + lst + "_" + dvid).html();
        $("#sel_" + lst).val(dv);
        $("#val_" + lst).html(dvid);
        $("#h_" + hzd + "_cdmHazardOwnerTitle").html(dv);
        $("#h_" + hzd + "_cdmHazardOwner").val(dvid);
        var tdata = [];
        tdata.push("cdmHazardOwner|" + dvid);
        cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
        $("#pops").hide();
    });
    $("#sel_" + lst).blur(function() {
        if (stopblur == 1) {
            stopblur = 0;
        } else {
            $(".dvs").hide();
        }
    });
    $("#sel_" + lst).focus(function() {
        if (stopblur == 1) {
            stopblur = 0;
            $(".dvs").show();
        } else {
            $(".dvs").show();
        }
    });

    $(".btn-cancel").click(function() {
        $(".pops-title").html("");
        $(".pops-content").html("");
        $("#pops").hide();
    });
}
function getDistResults(items,propertyName){
    var result = [];
	var distResult=[];
    $.each(items, function(index, item) {
       if ($.inArray(item[propertyName], result)==-1) {
          result.push(item[propertyName]);
		  distResult.push(item);
       }
    });
    return distResult;
}
function tposSelectElement(lst, data, trg) {
    var tlist = data.d.results;
    var options =
        '<tr><td class="hide" id="val_' +
        lst +
        '">0</td><td><input class="tpos-' +
        lst +
        '-select-input dvi" id="sel_' +
        lst +
        '" autofill="false" placeholder="Select an element ..."></td></tr>';
    for (var cc = 0; cc < tlist.length; cc++) {
        var it = tlist[cc];
        var itid = it.ID;
        var ittitle = it.Title;
        options +=
            '<tr style="display:none;" class="tpos-' +
            lst +
            '-select-value dvs" data-list="' +
            lst +
            '" data-value="' +
            itid +
            '"><td id="dv_' +
            lst +
            "_" +
            itid +
            '">' +
            ittitle +
            "</td></tr>";
    }
    $("#popscontentarea").html(
        '<table class="tpos-select-table">' + options + "</table>"
    );
    // $('#sel_' + lst).blur(function(){
    //     $('.dvs').hide();
    // });

    $("#sel_" + lst).bind("keyup change", function(ev) {
        var st = $(this).val();
        $("#val_" + lst).html("0");
        if (st) {
            $("tr:not(:Contains(" + st + "))").each(function() {
                var t = $(this).html();
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).hide();
                }
            });
            $("tr:Contains(" + st + ")").each(function() {
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).show();
                }
            });
        }
    });
    $("#sel_" + lst).click(function() {
        var st = $(this).val();
        toastr.success(st);
        if (!st || st == "") {
            $("tr").each(function() {
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).show();
                }
            });
        }
    });
    var stopblur = 0;
    $(".tpos-" + lst + "-select-value").mousedown(function() {
        stopblur = 1;
    });

    $(".tpos-" + lst + "-select-value").click(function() {
        var dvid = $(this).data("value");
        var dv = $("#dv_" + lst + "_" + dvid).html();
        $("#sel_" + lst).val(dv);
        $("#val_" + lst).html(dvid);
        // $('#h_'+hzd+'_cdmHazardOwnerTitle').html(dv);
        // $('#h_'+hzd+'_cdmHazardOwner').val(dvid);
        var tdata = [];
        tdata.push("cdmPWElement|" + dvid);
        cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
        $("#pops").remove();
    });
    $("#sel_" + lst).blur(function() {
        if (stopblur == 1) {
            stopblur = 0;
        } else {
            $(".dvs").hide();
        }
    });
    $("#sel_" + lst).focus(function() {
        if (stopblur == 1) {
            stopblur = 0;
            $(".dvs").show();
        } else {
            $(".dvs").show();
        }
    });

    $(".btn-cancel").click(function() {
        $(".pops-title").html("");
        $(".pops-content").html("");
        $("#pops").remove();
    });
}

function tposSelectTag(lst, data, trg) {
    var tlist = data.d.results;
    var options =
        '<tr><td class="hide" id="val_' +
        lst +
        '">0</td><td><input class="tpos-' +
        lst +
        '-select-input dvi" id="sel_' +
        lst +
        '" autofill="false" placeholder="Select a tag ..."></td></tr>';
    for (var cc = 0; cc < tlist.length; cc++) {
        var it = tlist[cc];
        var itid = it.ID;
        var ittitle = it.Title;
        options +=
            '<tr style="display:none;" class="tpos-' +
            lst +
            '-select-value dvs" data-list="' +
            lst +
            '" data-value="' +
            itid +
            '"><td id="dv_' +
            lst +
            "_" +
            itid +
            '">' +
            ittitle +
            "</td></tr>";
    }
    $("#popscontentarea").html(
        '<table class="tpos-select-table">' + options + "</table>"
    );
    // $('#sel_' + lst).blur(function(){
    //     $('.dvs').hide();
    // });

    $("#sel_" + lst).bind("keyup change", function(ev) {
        var st = $(this).val();
        $("#val_" + lst).html("0");
        if (st) {
            $("tr:not(:Contains(" + st + "))").each(function() {
                var t = $(this).html();
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).hide();
                }
            });
            $("tr:Contains(" + st + ")").each(function() {
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).show();
                }
            });
        }
    });
    $("#sel_" + lst).click(function() {
        var st = $(this).val();
        toastr.success(st);
        if (!st || st == "") {
            $("tr").each(function() {
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).show();
                }
            });
        }
    });
    var stopblur = 0;
    $(".tpos-" + lst + "-select-value").mousedown(function() {
        stopblur = 1;
    });

    $(".tpos-" + lst + "-select-value").click(function() {
        var dvid = $(this).data("value");
        var dv = $("#dv_" + lst + "_" + dvid).html();
        $("#sel_" + lst).val(dv);
        $("#val_" + lst).html(dvid);
        // $('#h_'+hzd+'_cdmHazardOwnerTitle').html(dv);
        // $('#h_'+hzd+'_cdmHazardOwner').val(dvid);
        var tdata = [];
        tdata.push("cdmHazardTags|" + dv);
        cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
        $("#pops").remove();
    });
    $("#sel_" + lst).blur(function() {
        if (stopblur == 1) {
            stopblur = 0;
        } else {
            $(".dvs").hide();
        }
    });
    $("#sel_" + lst).focus(function() {
        if (stopblur == 1) {
            stopblur = 0;
            $(".dvs").show();
        } else {
            $(".dvs").show();
        }
    });

    $(".btn-cancel").click(function() {
        $(".pops-title").html("");
        $(".pops-content").html("");
        $("#pops").remove();
    });
}

function tposSelectUniclass(lst, data, trg) {
    var tlist = data.d.results;
    var options =
        '<tr><td class="hide" id="val_' +
        lst +
        '">0</td><td><input class="tpos-' +
        lst +
        '-select-input dvi" id="sel_' +
        lst +
        '" autofill="false" placeholder="Select a status ..."></td></tr>';
    for (var cc = 0; cc < tlist.length; cc++) {
        var it = tlist[cc];
        var itid = it.ID;
        var ittitle = it.Title;
        options +=
            '<tr style="display:none;" class="tpos-' +
            lst +
            '-select-value dvs" data-list="' +
            lst +
            '" data-value="' +
            itid +
            '"><td id="dv_' +
            lst +
            "_" +
            itid +
            '">' +
            ittitle +
            "</td></tr>";
    }
    $("#popscontentarea").html(
        '<table class="tpos-select-table">' + options + "</table>"
    );
    // $('#sel_' + lst).blur(function(){
    //     $('.dvs').hide();
    // });

    $("#sel_" + lst).bind("keyup change", function(ev) {
        var st = $(this).val();
        $("#val_" + lst).html("0");
        if (st) {
            $("tr:not(:Contains(" + st + "))").each(function() {
                var t = $(this).html();
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).hide();
                }
            });
            $("tr:Contains(" + st + ")").each(function() {
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).show();
                }
            });
        }
    });
    $("#sel_" + lst).click(function() {
        var st = $(this).val();
        toastr.success(st);
        if (!st || st == "") {
            $("tr").each(function() {
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).show();
                }
            });
        }
    });
    var stopblur = 0;
    $(".tpos-" + lst + "-select-value").mousedown(function() {
        stopblur = 1;
    });

    $(".tpos-" + lst + "-select-value").click(function() {
        var dvid = $(this).data("value");
        var dv = $("#dv_" + lst + "_" + dvid).html();
        $("#sel_" + lst).val(dv);
        $("#val_" + lst).html(dvid);
        // $('#h_'+hzd+'_cdmHazardOwnerTitle').html(dv);
        // $('#h_'+hzd+'_cdmHazardOwner').val(dvid);
        var tdata = [];
        tdata.push("cdmUniclass|" + dv);
        cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
        $("#pops").remove();
    });
    $("#sel_" + lst).blur(function() {
        if (stopblur == 1) {
            stopblur = 0;
        } else {
            $(".dvs").hide();
        }
    });
    $("#sel_" + lst).focus(function() {
        if (stopblur == 1) {
            stopblur = 0;
            $(".dvs").show();
        } else {
            $(".dvs").show();
        }
    });

    $(".btn-cancel").click(function() {
        $(".pops-title").html("");
        $(".pops-content").html("");
        $("#pops").remove();
    });
}
function tposSelectdropdown(lst, data, trg, col) {
    var tlist = data.d.results;
    var options =
      '<tr><td class="hide" id="val_' +
      lst +
      '">0</td><td><input class="tpos-' +
      lst +
      '-select-input dvi" id="sel_' +
      lst +
      '" autofill="false" placeholder="Select a value ..."></td></tr>';
    for (var cc = 0; cc < tlist.length; cc++) {
      var it = tlist[cc];
      var itid = it.ID;
      var ittitle = it.Title;
      options +=
        '<tr style="display:none;" class="tpos-' +
        lst +
        '-select-value dvs" data-list="' +
        lst +
        '" data-value="' +
        itid +
        '"><td id="dv_' +
        lst +
        "_" +
        itid +
        '">' +
        ittitle +
        "</td></tr>";
    }
    $("#popscontentarea").html(
      '<div style="width: 30%"><table style="float: left; border: 1px solid black; margin: 0; padding: 0;" class="tpos-select-table">' + options + "</table>" + "<p class='remove-selection' title='Click to remove selection' style='float: right; width: 5%; font-size: 20px; text-align: center; margin: 0; padding: 0; cursor: pointer'>&#x2715</p></div>"
    );
    // $('#sel_' + lst).blur(function(){
    //     $('.dvs').hide();
    // });
  
    $("#sel_" + lst).bind("keyup change", function (ev) {
      var st = $(this).val();
      $("#val_" + lst).html("0");
      if (st) {
        $("tr:not(:Contains(" + st + "))").each(function () {
          var t = $(this).html();
          if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
            $(this).hide();
          }
        });
        $("tr:Contains(" + st + ")").each(function () {
          if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
            $(this).show();
          }
        });
      }
    });
    $("#sel_" + lst).click(function () {
      var st = $(this).val();
      toastr.success(st);
      if (!st || st == "") {
        $("tr").each(function () {
          if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
            $(this).show();
          }
        });
      }
    });
    var stopblur = 0;
    $(".tpos-" + lst + "-select-value").mousedown(function () {
      stopblur = 1;
    });
  
    $(".tpos-" + lst + "-select-value").click(function () {
      var dvid = $(this).data("value");
      var dv = $("#dv_" + lst + "_" + dvid).html();
      $("#sel_" + lst).val(dv);
      $("#val_" + lst).html(dvid);
      // $('#h_'+hzd+'_cdmHazardOwnerTitle').html(dv);
      // $('#h_'+hzd+'_cdmHazardOwner').val(dvid);
      var tdata = [];
      tdata.push(col + "|" + dv);
      // There's a bug where ampersands are wrongly encoded as &amp;. We will reverse this encoding
      tdata = tdata.map(x => x.replace("&amp;", "&"))
      cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
      $("#pops").remove();
    });
    $("#sel_" + lst).blur(function () {
      if (stopblur == 1) {
        stopblur = 0;
      } else {
        $(".dvs").hide();
      }
    });
    $("#sel_" + lst).focus(function () {
      if (stopblur == 1) {
        stopblur = 0;
        $(".dvs").show();
      } else {
        $(".dvs").show();
      }
    });

    $(".remove-selection").click(() => {
        const update = [col + "|" + ""]
        cdmdata.update("cdmHazards", update, "frmedit_updateview");
    })
  
    $(".btn-cancel").click(function () {
      $(".pops-title").html("");
      $(".pops-content").html("");
      $("#pops").remove(); 
    });
  }
async function tposcustomfilters( data, forExport) {
    // var tlist=[];
    // if (maindata.length = 0 ) {
    //     tlist = data.d.results;
    // }
    // else {
    //     tlist = maindata;
    // }
    var tlist = data;
 
    var distlistcdmStageExtra=[];
    var distlistcdmpwstructure =[];
    var distlistcdmCurrentStatus=[];
    var distlistcdmResidualRiskOwner = [];// ['HS2 Infrastructure Management SME​​','HS2 Rail Systems Interface Engineer'];
    var selectcdmStageExtra = '';
    var selectcdmpwstructure ='';
    var selectcdmCurrentStatus ='';
    var selectcdmResidualRiskOwner ='';

    for (var cc = 0; cc < tlist.length; cc++) {
        var it = tlist[cc];
        var itid = it.cdmStageExtra.ID;
        var ittitle = it.cdmStageExtra.Title;
        var itcdmpwstructureid = it.cdmPWStructure.ID;
        var itcdmpwstructuretitle = it.cdmPWStructure.Title;
        var itcdmCurrentStatus = it.cdmCurrentStatus;
        var itcdmResidualRiskOwner = it.cdmResidualRiskOwner; 

        if (ittitle !== undefined && !distlistcdmStageExtra.includes(ittitle)){
            distlistcdmStageExtra.push(ittitle);
            selectcdmStageExtra += '<option value="'+ittitle+'">'+ittitle+'</option>'
        }

        if (itcdmpwstructureid !== undefined && !distlistcdmpwstructure.includes(itcdmpwstructureid)){
            if (configData['Create hazard show asset description']) {
                const assetUAID = it.cdmPWStructure.UAID;
                selectcdmpwstructure += '<option value="'+itcdmpwstructuretitle+'">'+`Asset: ${itcdmpwstructuretitle}; UAID: ${assetUAID}`+'</option>';
            } else {
                selectcdmpwstructure += '<option value="'+itcdmpwstructuretitle+'">'+itcdmpwstructuretitle+'</option>';
            }
            distlistcdmpwstructure.push(itcdmpwstructureid);
        }

        if (!forExport && itcdmCurrentStatus !== undefined && !distlistcdmCurrentStatus.includes(itcdmCurrentStatus) || (forExport && configData['Exportable workflow states'].includes(itcdmCurrentStatus) && itcdmCurrentStatus !== undefined && !distlistcdmCurrentStatus.includes(itcdmCurrentStatus))){
            distlistcdmCurrentStatus.push(itcdmCurrentStatus);
            selectcdmCurrentStatus += '<option value="'+itcdmCurrentStatus+'">'+itcdmCurrentStatus+'</option>'
        }

        if (itcdmResidualRiskOwner !== undefined && !distlistcdmResidualRiskOwner.includes(itcdmResidualRiskOwner)){
            distlistcdmResidualRiskOwner.push(itcdmResidualRiskOwner);
            selectcdmResidualRiskOwner += '<option value="'+itcdmResidualRiskOwner+'">'+itcdmResidualRiskOwner+'</option>'
            // selectcdmResidualRiskOwner = "<option value= 'HS2 Infrastructure Management SME' >HS2 Infrastructure Management SME</option>"+
            // "<option value= 'HS2 Rail Systems Interface Engineer'>HS2 Rail Systems Interface Engineer</option>"
        }
      
    }
    $("#popscontentarea").html('');
    $(".pops-content").append(
        (forExport === undefined ? '<button id="applyfilters" style="float:right">apply filters</button>' : '<button id="applyfiltersforexport" style="float:right" type="button">export</button>')+
        '<div class ="customfiltersection" id="popscontentarea1"> <select name="cdmpwstructurefilter[]" multiple id="cdmpwstructurefilter">' +  selectcdmpwstructure
        +"</select><br> </div>"+
        '<div class ="customfiltersection" id="popscontentarea2"> <select name="cdmStageExtrafilter[]" multiple id="cdmStageExtrafilter">' +  selectcdmStageExtra
        +"</select><br> </div>"+
        '<div class ="customfiltersection" id="popscontentarea3"> <select name="cdmCurrentStatusfilter[]" multiple id="cdmCurrentStatusfilter">' +  selectcdmCurrentStatus
        +"</select><br> </div>"+
        (forExport === undefined ? '<div class ="customfiltersection" id="popscontentarea4"> <select name="cdmResidualRiskOwnerfilter[]" multiple id="cdmResidualRiskOwnerfilter">' +  selectcdmResidualRiskOwner : '')
        +"</select><br> </div>" 
    );

    $('#cdmStageExtrafilter').multiselect({
        columns: 1,
        placeholder: 'Select Stage :',
        search: true,
        selectAll: true
    });
    $('#cdmpwstructurefilter').multiselect({
        columns: 1,
        placeholder: 'Select Asset :',
        search: true,
        selectAll: true
    });
    $('#cdmResidualRiskOwnerfilter').multiselect({
        columns: 1,
        placeholder: 'Select Residual Risk Owner :',
        search: true,
        selectAll: true
    });
    $('#cdmCurrentStatusfilter').multiselect({
        columns: 1,
        placeholder: 'Select Status :',
        search: true,
        selectAll: true
    });

    $('#applyfilters').click(function () {
        var fcdmStageExtra = [];
        var fcdmStageExtraselected =[];
        fcdmStageExtra=$('#cdmStageExtrafilter').find(':selected');
        for( a=0; a<fcdmStageExtra.length;a++){
            fcdmStageExtraselected.push(fcdmStageExtra[a].innerText);
        }
        flst['cdmStageExtra'] = fcdmStageExtraselected;

        var fcdmpwstructure = [];
        var fcdmpwstructureselected =[];
        fcdmpwstructure=$('#cdmpwstructurefilter').find(':selected');
        for( b=0; b<fcdmpwstructure.length;b++){
            if (configData['Create hazard show asset description']) { // In this case we need to process the string to get just the asset'])
                fcdmpwstructureselected.push(fcdmpwstructure[b].innerText.split(';')[0].split(':')[1].trimStart());
            } else {
                fcdmpwstructureselected.push(fcdmpwstructure[b].innerText);
            }
        }

        flst['cdmPWStructure'] = fcdmpwstructureselected;

        var fcdmCurrentStatus = [];
        var fcdmCurrentStatusselected =[];
        fcdmCurrentStatus= $('#cdmCurrentStatusfilter').find(':selected');
        for( c=0; c<fcdmCurrentStatus.length;c++){
            fcdmCurrentStatusselected.push(fcdmCurrentStatus[c].innerText.replace(/"/g,''));
        }
        
        flst['cdmCurrentStatus'] = fcdmCurrentStatusselected;

        var fcdmResidualRiskOwner = [];
        var fcdmResidualRiskOwnerselected =[];
        fcdmResidualRiskOwner= $('#cdmResidualRiskOwnerfilter').find(':selected');
        for( c=0; c<fcdmResidualRiskOwner.length;c++){
            fcdmResidualRiskOwnerselected.push(fcdmResidualRiskOwner[c].innerText);
        }
        flst['cdmResidualRiskOwner'] = fcdmResidualRiskOwnerselected;
        console.log(flst)

        cdmdata.get('cdmSites', null, 'Title asc', 'stats-table-row', 'statstbl',flst);


        //alert("stop");
        $("#pops").remove();
        
    });

    $('#applyfiltersforexport').click(() => {

        /*
        Maps hazard info to column names used in the Export Excel file. It also sanitises
        the hazard information. This sanitisation will need to be reversed when the
        CSV is reimported once changes have been made by the user. */
        const mappingObj = (obj) => {
            var result = {};
            result.ID = sanitiseInput(obj.ID);
            result.Site = sanitiseInput(obj.cdmSite.Title);
            result["PW Structure"] = sanitiseInput(obj.cdmPWStructure.Title);
            result.Stage = sanitiseInput(obj.cdmStageExtra.Title);
            result["Hazard Type"] = sanitiseInput(obj.cdmHazardType.Title);
            result["Hazard Owner"] = sanitiseInput(obj.cdmHazardOwner.Title);
            result["Hazard Tags"] = sanitiseInput(obj.cdmHazardTags);
            result.Entity = sanitiseInput(obj.cdmEntityTitle);
            result["Hazard Description"] = sanitiseInput(obj.cdmHazardDescription);
            result["Risk Description"] = sanitiseInput(obj.cdmRiskDescription);
            result["Mitigation Description"] = sanitiseInput(obj.cdmMitigationDescription);
            result["Initial Risk"] = sanitiseInput(obj.cdmInitialRisk);
            result["Residual Risk"] = sanitiseInput(obj.cdmResidualRisk);
            result["Designer Mitigation Suggestions"] = sanitiseInput(obj.cdmStageMitigationSuggestion);
            result.Status = sanitiseInput(obj.cdmUniclass);
            result.RAMS = sanitiseInput(obj.cdmRAMS);
            result["Last Review Status"] = sanitiseInput(obj.cdmLastReviewStatus);
            result["Last Reviewer"] = sanitiseInput(obj.cdmLastReviewer);
            result["Last Review Type"] = sanitiseInput(obj.cdmLastReviewType);
            result["Last Review Date"] = sanitiseInput(obj.cdmLastReviewDate);
            result["Workflow Status"] = sanitiseInput(obj.cdmCurrentStatus);
            result.Coordinates = sanitiseInput(obj.cdmHazardCoordinates);
            result.Geometry = sanitiseInput(obj.cdmGeometry);
            result.TW = sanitiseInput(obj.cdmTW);
            result["Residual Risk Owner"] = sanitiseInput(obj.cdmResidualRiskOwner);
            result["Current Mitigation Owner"] = sanitiseInput(obj.CurrentMitigationOwner.Title);
            result["Current Review Owner"] = sanitiseInput(obj.CurrentReviewOwner.Title);
            result["PW Links"] = sanitiseInput(obj.cdmLinks);
            result.Title = sanitiseInput(obj.Title);
            result.Created = sanitiseInput(obj.Created);
            result["Created By"] = sanitiseInput(obj.Author.Title);
            result.Modified = sanitiseInput(obj.Modified);
            result["Modified By"] = sanitiseInput(obj.Editor.Title);
            result.cdmReviews = sanitiseInput(obj.cdmReviews);

            return result
        }

        /*
        Returns a boolean based on whether a given hazard complies with the filters selected by
        the user in the filter pane on export. If no filters are selected for a given filter, it
        skips the compliance check as otherwise it would exclude everything. */
        const filterHazards = (hazard, filterParam) => {
            // We need to also filter out RAMS and TW hazards, so we'll add a case here to return false if this is the case
            if (hazard.cdmRAMS || hazard.cdmTW) {
                return false;
            }

            var flag = true;
            if (filterParam.cdmPWStructure.length && flag) {
                flag = filterParam.cdmPWStructure.includes(hazard.cdmPWStructure.Title);
            }

            if (filterParam.cdmStageExtra.length && flag) {
                flag = filterParam.cdmStageExtra.includes(hazard.cdmStageExtra.Title);
            }

            if (filterParam.cdmCurrentStatus.length && flag) {
                flag = filterParam.cdmCurrentStatus.includes(hazard.cdmCurrentStatus);
            }

            return flag;
        }

        /*
        Download function for CSV file. Needs to convert to Blob to ensure full dataset is downloaded.
        If this is not done, the data will be truncated on download. */
        var downloadCSV = (data, fileName) => {
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            var blob = new Blob([data], {type: "text/csv;charset=utf-8"})
            var url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);
        };

        /*
        Download funtion for the macro template
        */
        const downloadTemplate = () => {
            // First construct the url to the macro template
            const libraryName = 'SiteAssets/files';
            const fileName = 'template.xlsm';
            const fileUrl = `${_spPageContextInfo.webAbsoluteUrl}/_layouts/download.aspx?SourceUrl=${_spPageContextInfo.webAbsoluteUrl}/${libraryName}/${fileName}`;

            // Create an invisible element with a link to the fileUrl and click this
            const a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            a.href = fileUrl;
            a.download = fileName;
            a.click();
            document.body.removeChild(a);
        }

        /*
        Sanitises values for CSV by wrapping values in quotes and ensuring that existing
        quotation marks don't cause issues by replacing them with double quotes. Null values
        should not be wrapped in quotes as this causes them to be entered into the CSV as text. */
        const sanitiseInput = (value) => {
            if (typeof value === "string") {
                sanitisedString = `"${value.replace(/\"/g, '""')}"`;
                return sanitisedString;
            } else if (value) {
                return `"${value}"`;
            } else {
                return null;
            }
        }

        const uploadRollbackToSharepoint = async (data) => {
            
            // Function to upload the array buffer to sharepoint
            const uploadArrayBuffer = async (arrayBuffer) => {
                
                // Construct the filename
                const date = new Date();
                const dateFormatted = `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}T${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
                const fileName = `Export for rollback ${dateFormatted}.csv`;

                // Construct the endpoint
                const serverUrl = _spPageContextInfo.webAbsoluteUrl;
                const serverRelativeUrlToFolder = 'SiteAssets/files';
                const fileCollectionEndpoint = `${serverUrl}/_api/web/getfolderbyserverrelativeurl('${serverRelativeUrlToFolder}')/files/add(overwrite=true, url='${fileName}')`;
                
                return $.ajax({
                    url: fileCollectionEndpoint,
                    type: 'POST',
                    data: arrayBuffer,
                    processData: false,
                    headers: {
                        'accept': 'application/json;odata=verbose',
                        'X-RequestDigest': jQuery('#__REQUESTDIGEST').val()
                    }
                })
            }

            // First lets convert the data to a csv blob
            const blob = new Blob([data], {type: "text/csv;charset=utf-8"});

            // Now convert the blob to an array buffer that we can upload to sharepoint
            const arrayBuffer = await blob.arrayBuffer();
            
            // Now post the array buffer to sharepoint
            const file = uploadArrayBuffer(arrayBuffer);

            // Handle the resolved or rejected promise
            file.then(() => {
                toastr.success('Successfully saved a rollback csv. Should you need to rollback the data to its current state, contact an admin to import the timestamped rollback csv.', '', {
                    timeOut: 30000
                })
            }).catch((error) => {
                console.log(error);
                toastr.error('Failed to save a rollback csv to SharePoint. Please do not proceed with any bulk edits.', '', {
                    timeOut: 30000
                })
            })
        }

        /**
         * Before we do the export, we need to check that the user has selected a status
         */
        if ($('#cdmCurrentStatusfilter').find(':selected').length === 0) {
            toastr.error('You must select at least one status value to filter on');
            return;
        }

        /**
         * Step 1:
         * filterParam is populated with the values selected by the user for each filter dropdown.
         * This is used on export to ensure that only hazards meeting the filter requirements
         * are exported
         */ 
        let filterParam = {
            cdmPWStructure: [],
            cdmStageExtra: [],
            cdmCurrentStatus: []
        };

        const assetFilterSelected = $('#cdmpwstructurefilter').find(':selected');
        for (i=0; i<assetFilterSelected.length; i++) {
            filterParam.cdmPWStructure.push(assetFilterSelected[i].innerText);
        }

        const stageFilterSelected = $('#cdmStageExtrafilter').find(':selected');
        for (i=0; i<stageFilterSelected.length; i++) {
            filterParam.cdmStageExtra.push(stageFilterSelected[i].innerText);
        }

        const statusFilterSelected = $('#cdmCurrentStatusfilter').find(':selected');
        for (i=0; i<statusFilterSelected.length; i++) {
            filterParam.cdmCurrentStatus.push(statusFilterSelected[i].innerText);
        }

        /**
         * Step 2:
         * Create CSV file.
         */
        let csvContent = "";
        let csvHeader = Object.keys(mappingObj(tlist[0])).join(',');
        let csvValues = tlist.filter(element => filterHazards(element, filterParam))
                            .map(element => Object.values(mappingObj(element)).join(','))
                            .join('\n');
        csvContent += csvHeader + '\n' + csvValues;

        /**
         * Step 3:
         * Download CSV file.
         */
        downloadCSV(csvContent, `safetibase_export_${Date.now()}.csv`);

        /**
         * Step 4:
         * Download the macro template
         */
        downloadTemplate();

        /**
         * Step 5:
         * Save a copy of the csv to SharePoint as a rollback copy
         */
        uploadRollbackToSharepoint(csvContent);

        $(".pops-title").html("");
        $(".pops-content").html("");
        $("#pops").remove();
    })

  
   
    $(".btn-cancel").click(function () {
        $(".pops-title").html("");
        $(".pops-content").html("");
        $("#pops").remove();
    });
}

// function tposSelectcdmPWStructurefilter(lst, data, trg, col) {
//     var tlist = data.d.results;
//     lstcdmpwstructure = lst + "cdmpwstructure"
//     alert("hi");
//     var options =
//       '<tr><td class="hide" id="val_' +
//       lstcdmpwstructure +
//       '">0</td><td> Asset : </td><td><input class="tpos-' +
//       lstcdmpwstructure +
//       '-select-input dvi" id="sel_' +
//       lstcdmpwstructure +
//       '" autofill="false" placeholder="Select a value ..."></td></tr>';
//       var distlist=[];
//     for (var cc = 0; cc < tlist.length; cc++) {
//       var it = tlist[cc];
//       var itid = it.cdmPWStructure.ID;
//       var ittitle = it.cdmPWStructure.Title;
//       if (!distlist.includes(ittitle)){
//         distlist.push(ittitle);
//         options +=
//         '<tr style="display:none;" class="tpos-' +
//         lstcdmpwstructure +
//         '-select-value dvs" data-list="' +
//         lstcdmpwstructure +
//         '" data-value="' +
//         itid +
//         '"><td id="dv_' +
//         lstcdmpwstructure +
//         "_" +
//         itid +
//         '">' +
//         ittitle +
//         "</td></tr>";
//       }
      
//     }
//     $("#popscontentarea").html(
//       '<table class="tpos-select-table assetfilter">' + options + "</table>"
//     );
//     $('#sel_' + lstcdmpwstructure).blur(function(){
//         $('.dvs').hide();
//     });
  
//     $("#sel_" + lstcdmpwstructure).bind("keyup change", function (ev) {
//       var st = $(this).val();
//       $("#val_" + lstcdmpwstructure).html("0");
//       if (st) {
//         $("tr:not(:Contains(" + st + "))").each(function () {
//           var t = $(this).html();
//           if ($(this).hasClass("tpos-" + lstcdmpwstructure + "-select-value") == 1) {
//             $(this).hide();
//           }
//         });
//         $("tr:Contains(" + st + ")").each(function () {
//           if ($(this).hasClass("tpos-" + lstcdmpwstructure + "-select-value") == 1) {
//             $(this).show();
//           }
//         });
//       }
//     });
//     $("#sel_" + lstcdmpwstructure).click(function () {
//       var st = $(this).val();
//       toastr.success(st);
//       if (!st || st == "") {
//         $("tr").each(function () {
//           if ($(this).hasClass("tpos-" + lstcdmpwstructure + "-select-value") == 1) {
//             $(".tpos-" + lstcdmpwstructure + "-select-value").show();
//           }
//         });
//       }
//     });
//     var stopblur = 0;
//     $(".tpos-" + lstcdmpwstructure + "-select-value").mousedown(function () {
//       stopblur = 1;
//     });
  
//     $(".tpos-" + lstcdmpwstructure + "-select-value").click(function () {
//       var dvid = $(this).data("value");
//       var dv = $("#dv_" + lstcdmpwstructure + "_" + dvid).html();
//       $("#sel_" + lstcdmpwstructure).val(dv);
//       $("#val_" + lstcdmpwstructure).html(dvid);
//       $('#h_'+hzd+'_cdmHazardOwnerTitle').html(dv);
//       $('#h_'+hzd+'_cdmHazardOwner').val(dvid);
//       var tdata = [];
//       tdata.push(col + "|" + dv);
//       cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
      
//       flst['cdmPWStructure'] = dv;
      
//       formatdatato.statstablerows()
//       cdmdata.get('cdmSites', null, 'Title asc', 'stats-table-row', 'statstbl',flst);
//       $("#pops").remove();
//     });
//     $("#sel_" + lstcdmpwstructure).blur(function () {
//       if (stopblur == 1) {
//         stopblur = 0;
//       } else {
//         $(".dvs").hide();
//       }
//     });
//     $("#sel_" + lstcdmpwstructure).focus(function () {
//       if (stopblur == 1) {
//         stopblur = 0;
//         $(".dvs").show();
//       } else {
//         $(".dvs").show();
//       }
//     });
  
//     $(".btn-cancel").click(function () {
//       $(".pops-title").html("");
//       $(".pops-content").html("");
//       $("#pops").remove();
//     });
//   }
function tposSelectPeer(lst, data, trg) {
    var tlist = data.d.results;
    var options =
        '<tr><td class="hide" id="val_' +
        lst +
        '">0</td><td><input class="tpos-' +
        lst +
        '-select-input dvi" id="sel_' +
        lst +
        '" autocomplete="false" placeholder="Select a peer ... (optional)"></td></tr>';
    for (var cc = 0; cc < tlist.length; cc++) {
        var it = tlist[cc];
        var itid = it.cdmUser.ID;
        var ittitle = it.cdmUser.Title;
        options +=
            '<tr style="display:none;" class="tpos-' +
            lst +
            '-select-value dvs" data-list="' +
            lst +
            '" data-value="' +
            itid +
            '"><td id="dv_' +
            lst +
            "_" +
            itid +
            '">' +
            ittitle +
            "</td></tr>";
    }
    $("#popscontentarea").html(
        '<table class="tpos-select-table">' + options + "</table>"
    );
    $("#sel_" + lst).bind("keyup change", function(ev) {
        var st = $(this).val();
        $("#val_" + lst).html("0");
        if (st) {
            $("tr:not(:Contains(" + st + "))").each(function() {
                var t = $(this).html();
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).hide();
                }
            });
            $("tr:Contains(" + st + ")").each(function() {
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).show();
                }
            });
        }
    });
    $("#sel_" + lst).click(function() {
        var st = $(this).val();
        toastr.success(st);
        if (!st || st == "") {
            $("tr").each(function() {
                if ($(this).hasClass("tpos-" + lst + "-select-value") == 1) {
                    $(this).show();
                }
            });
        }
    });
    var stopblur = 0;
    $(".tpos-" + lst + "-select-value").mousedown(function() {
        stopblur = 1;
    });
    $(".tpos-" + lst + "-select-value").click(function() {
        var dvid = $(this).data("value");
        // toastr.success(dvid);
        var dv = $("#dv_" + lst + "_" + dvid).html();
        $("#sel_" + lst).val(dv);
        $("#val_" + lst).html(dvid);
        // $('#result').html(dv);
        $(".dvs").hide();
        // $('#h_'+hzd+'_cdmHazardOwnerTitle').html(dv);
        // $('#h_'+hzd+'_cdmHazardOwner').val(dvid);

        // var tdata=[];
        // var nd=new Date;
        // nd=ukdate(nd);
        // tdata.push();
        // tdata.push('cdmReviews|'+nd+ ' - '+unm()+' requested peer review');
        // cdmdata.update('cdmHazards',tdata,'frmedit_updateview');
        // $('#pops').remove();
    });
    $("#sel_" + lst).blur(function() {
        if (stopblur == 1) {
            stopblur = 0;
        } else {
            $(".dvs").hide();
        }
    });
    $("#sel_" + lst).focus(function() {
        if (stopblur == 1) {
            stopblur = 0;
            $(".dvs").show();
        } else {
            $(".dvs").show();
        }
    });

    $(".btn-cancel").click(function() {
        $(".pops-title").html("");
        $(".pops-content").html("");
        $("#pops").remove();
    });
}

// function hazardreviewbuttonaction() {
//     $(".tpos-rvbtn")
//         .off("click")
//         .on("click", function() {
//             //   toastr.success("what???");
//             var a = $(this).data("action");
//             var hi = $(this)
//                 .parents(".row-hazard")
//                 .attr("id");
//             var hia = hi.split("_");
//             var id = hia[1];
//             //   toastr.success("what???: " + id);
//             hzd = id;
//             var hist = "";
//             var nd = new Date();
//             var nnd = ukdate(nd);
//             var ind = isodate(nd);
//             //   toastr.success(nnd);
//             var user = unm();
//             var nl = "";
//             var vn = $("#h_" + hzd + " .cdmSite").html();

//             if (a == "initiatereview") {
//                 // var q='cdmCompany/ID eq \''+c+'\' and cdmUser/ID ne \''+uid()+'\' and cdmUserRole/Title eq \''+ur+'\'';
//                 var vcheck = $('#h_' + hzd + ' .cdmStageMitigationSuggestion').html();
//                 if (vcheck === null || vcheck === 'undefined' || vcheck === 'Awaiting assessment') {
//                     toastr.error('Please provide a mitigation suggestion before initiating the review');
//                 } else {
//                     gimmepops("Initiate the review process", "");
//                     $(".pops-content").load(
//                         "../3.0/html/review.initiation.form.html",
//                         function() {
//                             // cdmdata.get('cdmUsers',q,null,'frmsel_peer',null);
//                             $(".tpos-svbtn")
//                                 .off("click")
//                                 .on("click", function() {
//                                     var cmt = sanitizeInput($("#cmt").val());
//                                     if (!cmt) {
//                                         cmt = "no comment";
//                                     }
//                                     var tdata = [];
//                                     nl =
//                                         nnd + "]" + user + "]" + "requested peer review]" + cmt + "^";
//                                     hist = $("#h_" + hzd + "_cdmReviews").html();
//                                     // var regex = new RegExp("^[a-zA-Z\s]+$");
//                                     if (hist.length > 12) {
//                                         // toastr.success('something there');
//                                         nl = nl + hist;
//                                     } else {
//                                         nl = nl;
//                                     }
//                                     // if(hist==''||!hist||hist==undefined){
//                                     //     hist='';
//                                     // }
//                                     tdata.push("cdmReviews|" + nl);
//                                     tdata.push("cdmCurrentStatus|Under peer review");
//                                     tdata.push("cdmLastReviewDate|" + ind);
//                                     tdata.push("cdmLastReviewStatus|Review initiated");
//                                     tdata.push("cdmLastReviewer|" + unm());
//                                     tdata.push("CurrentMitigationOwner|" + uid());
//                                     cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
//                                     $("#pops").remove();
//                                 });
//                         }
//                     );
//                 }

//             } else {
//                 if (a == "peerreview") {
//                     gimmepops("Undertake the peer review", "");
//                     $(".pops-content").load(
//                         "../3.0/html/internal.design.review.form.html",
//                         function() {
//                             $(".tpos-svbtn")
//                                 .off("click")
//                                 .on("click", function() {
//                                     var act = $(this).data("action");
//                                     var cmt = $("#cmt").val();
//                                     // hist = $('#h_'+hzd+'_cdmReviews').html();
//                                     // if(hist==''||!hist||hist==undefined){
//                                     //     hist='';
//                                     // }

//                                     var tdata = [];
//                                     if (act == "change") {
//                                         if (cmt == "" || !cmt || cmt == undefined) {
//                                             toastr.error(
//                                                 "Please use the comment box to explain your decision and outline the required changes."
//                                             );
//                                         }
//                                         if (cmt) {
//                                             nl =
//                                                 nnd +
//                                                 "]" +
//                                                 user +
//                                                 "]" +
//                                                 "requested change]" +
//                                                 cmt +
//                                                 "^";
//                                             hist = $("#h_" + hzd + "_cdmReviews").html();
//                                             // if(hist==''||!hist||hist==undefined){
//                                             //     hist='';
//                                             // }
//                                             if (hist) {
//                                                 nl = nl + hist;
//                                             }

//                                             tdata.push("cdmReviews|" + nl);
//                                             tdata.push("cdmCurrentStatus|Assessment in progress");
//                                             tdata.push("cdmLastReviewDate|" + ind);
//                                             tdata.push("cdmLastReviewStatus|Change request issued");
//                                             tdata.push("cdmLastReviewer|" + unm());
//                                             cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
//                                             $("#pops").remove();
//                                         }
//                                     } else {
//                                         if (!cmt) {
//                                             cmt = "no comment";
//                                         }
//                                         nl =
//                                             nnd +
//                                             "]" +
//                                             user +
//                                             "]" +
//                                             "completed peer review]" +
//                                             cmt +
//                                             "^";
//                                         hist = $("#h_" + hzd + "_cdmReviews").html();
//                                         // if(hist==''||!hist||hist==undefined){
//                                         //     hist='';
//                                         // }
//                                         if (hist) {
//                                             nl = nl + hist;
//                                         }
//                                         var ns = $("#h_" + hzd + " .rucs").hasClass("_2");

//                                         tdata.push("cdmReviews|" + nl);
//                                         if (ns == 1) {
//                                             tdata.push("cdmCurrentStatus|Under Construction Manager review");
//                                         } else {
//                                             tdata.push(
//                                                 "cdmCurrentStatus|Under design manager review"
//                                             );
//                                         }

//                                         tdata.push("cdmLastReviewDate|" + ind);
//                                         tdata.push("cdmLastReviewStatus|Peer review - approved");
//                                         tdata.push("cdmLastReviewer|" + unm());
//                                         cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
//                                         $("#pops").remove();
//                                     }
//                                 });
//                         }
//                     );
//                 }
//                 if (a == "dmreview") {
//                     gimmepops("Undertake the design manager review", "");
//                     $(".pops-content").load(
//                         "../3.0/html/internal.design.review.form.html",
//                         function() {
//                             $(".tpos-svbtn")
//                                 .off("click")
//                                 .on("click", function() {
//                                     var act = $(this).data("action");
//                                     var cmt = $("#cmt").val();
//                                     // hist = $('#h_'+hzd+'_cdmReviews').html();
//                                     // if(hist==''||!hist||hist==undefined){
//                                     //     hist='';
//                                     // }

//                                     var tdata = [];
//                                     if (act == "change") {
//                                         if (cmt == "" || !cmt || cmt == undefined) {
//                                             toastr.error(
//                                                 "Please use the comment box to explain your decision and outline the required changes."
//                                             );
//                                         }
//                                         if (cmt) {
//                                             nl =
//                                                 nnd +
//                                                 "]" +
//                                                 user +
//                                                 "]" +
//                                                 "requested change]" +
//                                                 cmt +
//                                                 "^";
//                                             hist = $("#h_" + hzd + "_cdmReviews").html();
//                                             // if(hist==''||!hist||hist==undefined){
//                                             //     hist='';
//                                             // }
//                                             if (hist) {
//                                                 nl = nl + hist;
//                                             }

//                                             tdata.push("cdmReviews|" + nl);
//                                             tdata.push("cdmCurrentStatus|Assessment in progress");
//                                             tdata.push("cdmLastReviewDate|" + ind);
//                                             tdata.push("cdmLastReviewStatus|Change request issued");
//                                             tdata.push("cdmLastReviewer|" + unm());
//                                             cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
//                                             $("#pops").remove();
//                                         }
//                                     } else {
//                                         if (!cmt) {
//                                             cmt = "no comment";
//                                         }
//                                         nl =
//                                             nnd +
//                                             "]" +
//                                             user +
//                                             "]" +
//                                             "completed design manager review]" +
//                                             cmt +
//                                             "^";
//                                         hist = $("#h_" + hzd + "_cdmReviews").html();
//                                         // if(hist==''||!hist||hist==undefined){
//                                         //     hist='';
//                                         // }
//                                         if (hist) {
//                                             nl = nl + hist;
//                                         }

//                                         var ns = $("#h_" + hzd + " .rucpc").hasClass("_2");
//                                         if (ns === true) {
//                                             tdata.push("cdmReviews|" + nl);
//                                             tdata.push(
//                                                 "cdmCurrentStatus|Under pre-construction review"
//                                             );
//                                             tdata.push("cdmLastReviewDate|" + ind);
//                                             tdata.push(
//                                                 "cdmLastReviewStatus|Design manager review - approved"
//                                             );
//                                             tdata.push("cdmLastReviewer|" + unm());
//                                         } else {
//                                             tdata.push("cdmCurrentStatus|Accepted");
//                                             tdata.push("cdmReviews|" + nl);
//                                             tdata.push("cdmLastReviewDate|" + ind);
//                                             tdata.push(
//                                                 "cdmLastReviewStatus|Design manager review - approved"
//                                             );
//                                             tdata.push("cdmLastReviewer|" + unm());
//                                         }
//                                         cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
//                                         $("#pops").remove();
//                                     }
//                                     // cdmdata.update('cdmHazards',tdata,'frmedit_updateview');
//                                     // $('#pops').remove();
//                                 });
//                         }
//                     );
//                 }
//                 if (a == "pcreview") {
//                     gimmepops("Undertake the pre-construction review", "", "bigger");

//                     $(".pops-content").load(
//                         "../3.0/html/internal.design.review.form.1.html",
//                         function() {
//                             // $("#addramsbtn").hide();
//                             // jsonRAMS.get("rams", vn, "sel_rams");
//                             $(".tpos-svbtn")
//                                 .off("click")
//                                 .on("click", function() {
//                                     var act = $(this).data("action");
//                                     var cmt = $("#cmt").val();
//                                     // hist = $('#h_'+hzd+'_cdmReviews').html();
//                                     // if(hist==''||!hist||hist==undefined){
//                                     //     hist='';
//                                     // }

//                                     var tdata = [];
//                                     if (act == "change") {
//                                         if (cmt == "" || !cmt || cmt == undefined) {
//                                             toastr.error(
//                                                 "Please use the comment box to explain your decision and outline the required changes."
//                                             );
//                                         }
//                                         if (cmt) {
//                                             nl =
//                                                 nnd +
//                                                 "]" +
//                                                 user +
//                                                 "]" +
//                                                 "requested change]" +
//                                                 cmt +
//                                                 "^";
//                                             hist = $("#h_" + hzd + "_cdmReviews").html();
//                                             // if(hist==''||!hist||hist==undefined){
//                                             //     hist='';
//                                             // }
//                                             if (hist) {
//                                                 nl = nl + hist;
//                                             }

//                                             tdata.push("cdmReviews|" + nl);
//                                             tdata.push("cdmCurrentStatus|Assessment in progress");
//                                             tdata.push("cdmLastReviewDate|" + ind);
//                                             tdata.push("cdmLastReviewStatus|Change request issued");
//                                             tdata.push("cdmLastReviewer|" + unm());
//                                             cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
//                                             $("#pops").remove();
//                                         }
//                                     }
//                                     if (act === "accept") {
//                                         if (!cmt) {
//                                             cmt = "no comment";
//                                         }
//                                         nl =
//                                             nnd +
//                                             "]" +
//                                             user +
//                                             "]" +
//                                             "completed pre-construction review]" +
//                                             cmt +
//                                             "^";
//                                         hist = $("#h_" + hzd + "_cdmReviews").html();
//                                         // if(hist==''||!hist||hist==undefined){
//                                         //     hist='';
//                                         // }
//                                         if (hist) {
//                                             nl = nl + hist;
//                                         }
//                                         tdata.push("cdmReviews|" + nl);
//                                         tdata.push("cdmCurrentStatus|Under principal designer review");
//                                         tdata.push("cdmLastReviewDate|" + ind);
//                                         tdata.push(
//                                             "cdmLastReviewStatus|Pre-construction review completed"
//                                         );
//                                         tdata.push("cdmLastReviewer|" + unm());
//                                         cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
//                                         $("#pops").remove();
//                                     }
//                                     // if (act === "addrams") {
//                                     //   var mits = $("#smmsgg").val();
//                                     //   if (!mits) {
//                                     //     toastr.error(
//                                     //       "Please enter a mitigation suggestion first"
//                                     //     );
//                                     //   } else {
//                                     //     var ht = "#h_" + hzd + " ";
//                                     //     var hz = $("#h_" + hzd + " .cdmHazardDescription").html();
//                                     //     var rs = $("#h_" + hzd + " .cdmRiskDescription").html();
//                                     //     var risks = $(ht + ".cdmRR").html();
//                                     //     var dasite = $(ht + ".cdmSite").data("siteid");
//                                     //     var trisks = risks.split("-");
//                                     //     var riskscoreval = trisks[0];
//                                     //     var rscv = parseInt(riskscoreval, 10);

//                                     //     var title1 = new Date();
//                                     //     //var title2=uid();
//                                     //     var title10 =
//                                     //       title1.getTime() +
//                                     //       "^" +
//                                     //       title1.getDate() +
//                                     //       "^" +
//                                     //       title1.getMonth() +
//                                     //       1 +
//                                     //       "^" +
//                                     //       title1.getFullYear();
//                                     //     var title = title10.toString() + "^" + uid();
//                                     //     var ms = "Awaiting mitigation";
//                                     //     var stmsugg = $(
//                                     //       ht + ".cdmStageMitigationSuggestion"
//                                     //     ).html();
//                                     //     var raid = $("#val_rams").html();
//                                     //     var ratx = $("#sel_rams").val();
//                                     //     var stg = $(ht + ".cdmStageExtra").html();
//                                     //     var stgi = 1;
//                                     //     if (stg != "Construction") {
//                                     //       stgi = 2;
//                                     //     }
//                                     //     var hzt = $(ht + ".cdmType").html();
//                                     //     var hzti = 2;
//                                     //     if (hzt == "Health") {
//                                     //       hzti = 1;
//                                     //     }
//                                     //     tdata = [];
//                                     //     // toastr.success(site);
//                                     //     tdata.push("Title|" + title);
//                                     //     tdata.push("cdmSiblings|" + title);
//                                     //     tdata.push("cdmParent|" + hzd);
//                                     //     tdata.push("cdmHazardDescription|" + hz);
//                                     //     tdata.push("cdmRiskDescription|" + rs);
//                                     //     tdata.push("cdmMitigationDescription|" + ms);
//                                     //     tdata.push("cdmSite|" + dasite);
//                                     //     tdata.push("cdmInitialRisk|" + risks);
//                                     //     tdata.push("cdmResidualRisk|" + risks);
//                                     //     tdata.push("cdmHazardType|" + hzti);
//                                     //     tdata.push("cdmInitialRiskScore|" + rscv);
//                                     //     tdata.push("cdmResidualRiskScore|" + rscv);
//                                     //     // tdata.push('cdmIniRisk|'+$('#inirisk').prop('outerHTML'));
//                                     //     // tdata.push('cdmResRisk|'+$('#inirisk').prop('outerHTML'));
//                                     //     tdata.push("cdmStageMitigationSuggestion|" + stmsugg);
//                                     //     tdata.push("cdmSMMitigationSuggestion|" + mits);
//                                     //     tdata.push("cdmRAMS|" + raid);
//                                     //     tdata.push("cdmEntityTitle|" + ratx);
//                                     //     tdata.push("cdmStageExtra|" + stgi);
//                                     //     var udata = [];
//                                     //     udata.push("cdmSMMitigationSuggestion|This hazard is further mitigated via one or several RAMS hazards with the following mitigation suggestion by the Construction Manager: " + mits + " Please click 'View linked / related hazards' for further details.");

//                                     //     tposdata.setRAMS("cdmHazards", tdata, "qmsg");
//                                     //   }
//                                     // }
//                                     // cdmdata.update('cdmHazards',tdata,'frmedit_updateview');
//                                     // $('#pops').remove();
//                                 });
//                         }
//                     );
//                 }

//                 if (a == "ldreview") {
//                     gimmepops("Undertake the principal designer review", "");
//                     $(".pops-content").load(
//                         "../3.0/html/internal.design.review.form.html",
//                         function() {
//                             $(".tpos-svbtn")
//                                 .off("click")
//                                 .on("click", function() {
//                                     var act = $(this).data("action");
//                                     var cmt = $("#cmt").val();
//                                     // hist = $('#h_'+hzd+'_cdmReviews').html();
//                                     // if(hist==''||!hist||hist==undefined){
//                                     //     hist='';
//                                     // }

//                                     var tdata = [];
//                                     if (act == "change") {
//                                         if (cmt == "" || !cmt || cmt == undefined) {
//                                             toastr.error(
//                                                 "Please use the comment box to explain your decision and outline the required changes."
//                                             );
//                                         }
//                                         if (cmt) {
//                                             nl =
//                                                 nnd +
//                                                 "]" +
//                                                 user +
//                                                 "]" +
//                                                 "requested change]" +
//                                                 cmt +
//                                                 "^";
//                                             hist = $("#h_" + hzd + "_cdmReviews").html();
//                                             // if(hist==''||!hist||hist==undefined){
//                                             //     hist='';
//                                             // }
//                                             if (hist) {
//                                                 nl = nl + hist;
//                                             }

//                                             tdata.push("cdmReviews|" + nl);
//                                             tdata.push("cdmCurrentStatus|Assessment in progress");
//                                             tdata.push("cdmLastReviewDate|" + ind);
//                                             tdata.push("cdmLastReviewStatus|Change request issued");
//                                             tdata.push("cdmLastReviewer|" + unm());
//                                             cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
//                                             $("#pops").remove();
//                                         }
//                                     } else {
//                                         if (!cmt) {
//                                             cmt = "no comment";
//                                         }
//                                         nl =
//                                             nnd +
//                                             "]" +
//                                             user +
//                                             "]" +
//                                             "completed principal designer review]" +
//                                             cmt +
//                                             "^";
//                                         hist = $("#h_" + hzd + "_cdmReviews").html();
//                                         // if(hist==''||!hist||hist==undefined){
//                                         //     hist='';
//                                         // }
//                                         if (hist) {
//                                             nl = nl + hist;
//                                         }
//                                         tdata.push("cdmCurrentStatus|Accepted");
//                                         tdata.push("cdmReviews|" + nl);
//                                         tdata.push("cdmLastReviewDate|" + ind);
//                                         tdata.push(
//                                             "cdmLastReviewStatus|Principal designer review completed"
//                                         );
//                                         tdata.push("cdmLastReviewer|" + unm());
//                                         cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
//                                         $("#pops").remove();

//                                         // var ns=$('#h_'+hzd+' .rucpc').hasClass('_2');
//                                     }
//                                     // cdmdata.update('cdmHazards',tdata,'frmedit_updateview');
//                                     // $('#pops').remove();
//                                 });
//                         }
//                     );
//                 }
//                 if (a == "smreview") {
//                     gimmepops("Undertake the Construction Manager review", "");
//                     $(".pops-content").load(
//                         "../3.0/html/internal.design.review.form.html",
//                         function() {
//                             $(".tpos-svbtn")
//                                 .off("click")
//                                 .on("click", function() {
//                                     var act = $(this).data("action");
//                                     var cmt = $("#cmt").val();
//                                     // hist = $('#h_'+hzd+'_cdmReviews').html();
//                                     // if(hist==''||!hist||hist==undefined){
//                                     //     hist='';
//                                     // }
//                                     // //(hist);

//                                     var tdata = [];
//                                     if (act == "change") {
//                                         if (cmt == "" || !cmt || cmt == undefined) {
//                                             toastr.error(
//                                                 "Please use the comment box to explain your decision and outline the required changes."
//                                             );
//                                         }
//                                         if (cmt) {
//                                             nl =
//                                                 nnd +
//                                                 "]" +
//                                                 user +
//                                                 "]" +
//                                                 "requested change]" +
//                                                 cmt +
//                                                 "^";
//                                             hist = $("#h_" + hzd + "_cdmReviews").html();
//                                             // if(hist==''||!hist||hist==undefined){
//                                             //     hist='';
//                                             // }
//                                             if (hist) {
//                                                 nl = nl + hist;
//                                             }

//                                             tdata.push("cdmReviews|" + nl);
//                                             tdata.push("cdmCurrentStatus|Assessment in progress");
//                                             tdata.push("cdmLastReviewDate|" + ind);
//                                             tdata.push("cdmLastReviewStatus|Change request issued");
//                                             tdata.push("cdmLastReviewer|" + unm());
//                                             cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
//                                             $("#pops").remove();
//                                         }
//                                     } else {
//                                         if (!cmt) {
//                                             cmt = "no comment";
//                                         }
//                                         nl =
//                                             nnd +
//                                             "]" +
//                                             user +
//                                             "]" +
//                                             "completed Construction Manager review]" +
//                                             cmt +
//                                             "^";
//                                         hist = $("#h_" + hzd + "_cdmReviews").html();
//                                         // if(hist==''||!hist||hist==undefined){
//                                         //     hist='';
//                                         // }
//                                         if (hist) {
//                                             nl = nl + hist;
//                                         }
//                                         tdata.push("cdmCurrentStatus|Accepted");
//                                         tdata.push("cdmReviews|" + nl);
//                                         tdata.push("cdmLastReviewDate|" + ind);
//                                         tdata.push(
//                                             "cdmLastReviewStatus|Construction Manager review completed"
//                                         );
//                                         tdata.push("cdmLastReviewer|" + unm());
//                                         cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
//                                         $("#pops").remove();

//                                         // var ns=$('#h_'+hzd+' .rucpc').hasClass('_2');
//                                     }
//                                     // cdmdata.update('cdmHazards',tdata,'frmedit_updateview');
//                                     // $('#pops').remove();
//                                 });
//                         }
//                     );
//                 }
//             }
//         });
// }


function hazardreviewbuttonaction() {
    $(".tpos-rvbtn")
        .off("click")
        .on("click", function() {
            //   toastr.success("what???");
            var a = $(this).data("action");
            var hi = $(this)
                .parents(".row-hazard")
                .attr("id");
            var hia = hi.split("_");
            var id = hia[1];
            //   toastr.success("what???: " + id);
            hzd = id;
            var hist = "";
            var nd = new Date();
            var nnd = ukdate(nd);
            var ind = isodate(nd);
            //   toastr.success(nnd);
            var user = unm();
            var nl = "";
            var vn = $("#h_" + hzd + " .cdmSite").html();
            //   var curstatus='';
            //   hist = $("#h_" + hzd + "_cdmReviews").html();

            var stage = $("#h_" + hzd + " .cdmStageExtra").html();
            var workflow = "";
            if (stage.includes("Construction") || stage.includes("Commission")) { //uses includes instead of == as commission type hazard renamed to commissioning. Patrick Hsu, 19 Feb 2024
                workflow = "ConstructionCommission";
            }
        
            else {
                workflow = "OpsDemolMaint";
            }

            if (a == "initiatereview") {
                // var q='cdmCompany/ID eq \''+c+'\' and cdmUser/ID ne \''+uid()+'\' and cdmUserRole/Title eq \''+ur+'\'';
                var vcheck = $('#h_' + hzd + ' .cdmStageMitigationSuggestion').html();
                if (vcheck === null || vcheck === 'undefined' || vcheck === 'Awaiting assessment') {
                    toastr.error('Please provide a mitigation suggestion before initiating the review');
                } else {
                    gimmepops("Initiate the review process", "");
                    $(".pops-content").load(
                        "../3.0/html/review.initiation.form.html",
                        function() {
                            //Makes initiate review form button configurable. Patrick Hsu, 1 Feb 2024
                            var skipToReviewState = document.getElementById('skipToReviewState');
                            skipToReviewState.textContent = "Request " + `${configData[workflow][a]["nextWorkFlowState"].substring(6)}`; 
                            
                            // cdmdata.get('cdmUsers',q,null,'frmsel_peer',null);
                            $(".tpos-svbtn")
                                .off("click")
                                .on("click", function() {
                                    var cmt = sanitizeInput($("#cmt").val());
                                    if (!cmt) {
                                        cmt = "no comment";
                                    }
                                    var tdata = [];
                                    nl =
                                        nnd + "]" + user + "]" + `${configData[workflow][a]["cdmReviewHistory"]}` + cmt + "^"; //Make cdmReviews history record correct according to configurable workflow, not hard-coded. Patrick Hsu, 5 Feb 2024
                                    hist = $("#h_" + hzd + "_cdmReviews").html();
                                    // var regex = new RegExp("^[a-zA-Z\s]+$");
                                    if (hist.length > 12) {
                                        // toastr.success('something there');
                                        nl = nl + hist;
                                    } else {
                                        nl = nl;
                                    }
                                    // if(hist==''||!hist||hist==undefined){
                                    //     hist='';
                                    // }
                                    tdata.push("cdmReviews|" + nl);
                                    tdata.push(`cdmCurrentStatus|${configData[workflow][a]["nextWorkFlowState"]}`); //Editable workflow config. Patrick Hsu, 30 Jan 2024
                                    tdata.push("cdmLastReviewDate|" + ind);
                                    tdata.push("cdmLastReviewStatus|Review initiated");
                                    tdata.push("cdmLastReviewer|" + unm());
                                    tdata.push("CurrentMitigationOwner|" + uid());
                                    cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                    $("#pops").remove();
                                });
                        }
                    );
                }

            } else {
                if (a == "peerreview") {
                    gimmepops("Undertake the peer review", "");
                    $(".pops-content").load(
                        "../3.0/html/internal.design.review.form.html",
                        function() {
                            $(".tpos-svbtn")
                                .off("click")
                                .on("click", function() {
                                    var act = $(this).data("action");
                                    var cmt = sanitizeInput($("#cmt").val());
                                    // hist = $('#h_'+hzd+'_cdmReviews').html();
                                    // if(hist==''||!hist||hist==undefined){
                                    //     hist='';
                                    // }
                                    var tdata = [];
                                    if (act == "change") {
                                        if (cmt == "" || !cmt || cmt == undefined) {
                                            toastr.error(
                                                "Please use the comment box to explain your decision and outline the required changes."
                                            );
                                        }
                                        if (cmt) {
                                            nl =
                                                nnd +
                                                "]" +
                                                user +
                                                "]" +
                                                "requested change]" +
                                                cmt +
                                                "^";
                                            hist = $("#h_" + hzd + "_cdmReviews").html();
                                            // if(hist==''||!hist||hist==undefined){
                                            //     hist='';
                                            // }
                                            if (hist) {
                                                nl = nl + hist;
                                            }

                                            tdata.push("cdmReviews|" + nl);
                                            tdata.push("cdmCurrentStatus|Assessment in progress");
                                            tdata.push("cdmLastReviewDate|" + ind);
                                            tdata.push("cdmLastReviewStatus|Change request issued");
                                            tdata.push("cdmLastReviewer|" + unm());
                                            cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                            $("#pops").remove();
                                        }
                                    } else {
                                        if (!cmt) {
                                            cmt = "no comment";
                                        }
                                        nl =
                                            nnd +
                                            "]" +
                                            user +
                                            "]" +
                                            `${configData[workflow][a]["cdmReviewHistory"]}` + //Make cdmReviews history record correct according to configurable workflow, not hard-coded. Patrick Hsu, 5 Feb 2024
                                            cmt +
                                            "^";
                                        hist = $("#h_" + hzd + "_cdmReviews").html();
                                        // if(hist==''||!hist||hist==undefined){
                                        //     hist='';
                                        // }
                                        if (hist) {
                                            nl = nl + hist;
                                        }
                                        var ns = $("#h_" + hzd + " .rucs").hasClass("_2");

                                        tdata.push("cdmReviews|" + nl);
                                        getListItemsByListName({
                                                listName: `cdmHazards`,
                                                select: null,
                                                expansion: null,
                                                order: null,
                                                filter: `Id eq ${hzd}`
                                            }).done(r => {
                                                let item = ((r.d.results[0].cdmRAMS != null));
                                                if (item) {
                                                    tdata.push("cdmCurrentStatus|Under Principal Contractor review"); //Editable workflow config. Patrick Hsu, 30 Jan 2024
                                                } else {
                                                    tdata.push(
                                                        `cdmCurrentStatus|${configData[workflow][a]["nextWorkFlowState"]}`
                                                    ); //Editable workflow config. Patrick Hsu, 30 Jan 2024
                                                }

                                                tdata.push("cdmLastReviewDate|" + ind);
                                                tdata.push("cdmLastReviewStatus|Peer review - approved");
                                                tdata.push("cdmLastReviewer|" + unm());
                                                cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                                $("#pops").remove();
                                            })
                                            // let item = await getListItemsByListName({
                                            //     listName: `cdmHazards`,
                                            //     select: null,
                                            //     expansion: null, 
                                            //     order: null, 
                                            //     filter: `Id eq ${hzd}`
                                            // }).done(r => {
                                            //     return (r.d.results[0].cdmRAMS != null);
                                            // }).fail(jq => console.error('Could not get the damn thing'))


                                        // if (item) {
                                        //     tdata.push("cdmCurrentStatus|Under Construction Manager review");
                                        // } else {
                                        //     tdata.push(
                                        //         "cdmCurrentStatus|Under design manager review"
                                        //     );
                                        // }

                                        // tdata.push("cdmLastReviewDate|" + ind);
                                        // tdata.push("cdmLastReviewStatus|Peer review - approved");
                                        // tdata.push("cdmLastReviewer|" + unm());
                                        // cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                        // $("#pops").remove();
                                    }
                                });
                        }
                    );
                }
                if (a == "dmreview") {
                    gimmepops("Undertake the design manager review", "");
                    $(".pops-content").load(
                        "../3.0/html/internal.design.review.form.html",
                        function() {
                            $(".tpos-svbtn")
                                .off("click")
                                .on("click", function() {
                                    var act = $(this).data("action");
                                    var cmt = sanitizeInput($("#cmt").val());
                                    // hist = $('#h_'+hzd+'_cdmReviews').html();
                                    // if(hist==''||!hist||hist==undefined){
                                    //     hist='';
                                    // }
                                    var tdata = [];
                                    if (act == "change") {
                                        if (cmt == "" || !cmt || cmt == undefined) {
                                            toastr.error(
                                                "Please use the comment box to explain your decision and outline the required changes."
                                            );
                                        }
                                        if (cmt) {
                                            nl =
                                                nnd +
                                                "]" +
                                                user +
                                                "]" +
                                                "requested change]" +
                                                cmt +
                                                "^";
                                            hist = $("#h_" + hzd + "_cdmReviews").html();
                                            // if(hist==''||!hist||hist==undefined){
                                            //     hist='';
                                            // }
                                            if (hist) {
                                                nl = nl + hist;
                                            }

                                            tdata.push("cdmReviews|" + nl);
                                            tdata.push("cdmCurrentStatus|Assessment in progress");
                                            tdata.push("cdmLastReviewDate|" + ind);
                                            tdata.push("cdmLastReviewStatus|Change request issued");
                                            tdata.push("cdmLastReviewer|" + unm());
                                            cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                            $("#pops").remove();
                                        }
                                    } else {
                                        if (!cmt) {
                                            cmt = "no comment";
                                        }
                                        nl =
                                            nnd +
                                            "]" +
                                            user +
                                            "]" +
                                            `${configData[workflow][a]["cdmReviewHistory"]}` + //Make cdmReviews history record correct according to configurable workflow, not hard-coded. Patrick Hsu, 5 Feb 2024
                                            cmt +
                                            "^";
                                        hist = $("#h_" + hzd + "_cdmReviews").html();
                                        // if(hist==''||!hist||hist==undefined){
                                        //     hist='';
                                        // }
                                        if (hist) {
                                            nl = nl + hist;
                                        }
                                        tdata.push("cdmReviews|" + nl);
                                        tdata.push(
                                            `cdmCurrentStatus|${configData[workflow][a]["nextWorkFlowState"]}` //Editable workflow config. Patrick Hsu, 30 Jan 2024
                                        );
                                        tdata.push("cdmLastReviewDate|" + ind);
                                        tdata.push(
                                            "cdmLastReviewStatus|Design manager review - approved"
                                        );
                                        tdata.push("cdmLastReviewer|" + unm());
                                        cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                        $("#pops").remove();
                                    }
                                    // cdmdata.update('cdmHazards',tdata,'frmedit_updateview');
                                    // $('#pops').remove();
                                });
                        }
                    );
                }
                if (a == "pcreview") {
                    gimmepops("Undertake the principal designer review", "", "bigger");

                    $(".pops-content").load(
                        "../3.0/html/internal.design.review.form.1.html",
                        function() {
                            if (configData['Construction manager approval comment populates cdmSMMitigationSuggestion']) {
                                document.getElementById('approval-explainer').innerHTML = 'Please carefully review the hazard, the risk, and the mitigation method(s) before accepting or acknowledging the \
                                residual risk. Should you feel that changes are required, please use the comment box and press the change request button. If you wish to approve the hazard please use the \
                                comment box to enter your mitigation suggestion (if necessary) and press the approve button.';

                                document.getElementById('cmt').placeholder = 'Enter change requests or your mitigation suggestion here';
                            }
                            // $("#addramsbtn").hide();
                            // jsonRAMS.get("rams", vn, "sel_rams");
                            $(".tpos-svbtn")
                                .off("click")
                                .on("click", function() {
                                    var act = $(this).data("action");
                                    var cmt = sanitizeInput($("#cmt").val());
                                    // hist = $('#h_'+hzd+'_cdmReviews').html();
                                    // if(hist==''||!hist||hist==undefined){
                                    //     hist='';
                                    // }

                                    var tdata = [];
                                    if (act == "change") {
                                        if (cmt == "" || !cmt || cmt == undefined) {
                                            toastr.error(
                                                "Please use the comment box to explain your decision and outline the required changes."
                                            );
                                        }
                                        if (cmt) {
                                            nl =
                                                nnd +
                                                "]" +
                                                user +
                                                "]" +
                                                "requested change]" +
                                                cmt +
                                                "^";
                                            hist = $("#h_" + hzd + "_cdmReviews").html();
                                            // if(hist==''||!hist||hist==undefined){
                                            //     hist='';
                                            // }
                                            if (hist) {
                                                nl = nl + hist;
                                            }

                                            tdata.push("cdmReviews|" + nl);
                                            tdata.push("cdmCurrentStatus|Assessment in progress");
                                            tdata.push("cdmLastReviewDate|" + ind);
                                            tdata.push("cdmLastReviewStatus|Change request issued");
                                            tdata.push("cdmLastReviewer|" + unm());
                                            cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                            $("#pops").remove();
                                        }
                                    }
                                    if (act === "accept") {
                                        if (configData['Construction manager approval comment populates cdmSMMitigationSuggestion']) { // For the case where the client want their approval comment to populate the mitigation suggestion
                                            if (cmt) {
                                                tdata.push(`cdmSMMitigationSuggestion|${cmt}`);
                                            }
                                            cmt = '';
                                        }
                                        if (!cmt) {
                                            cmt = "no comment";
                                        }
                                        nl =
                                            nnd +
                                            "]" +
                                            user +
                                            "]" +
                                            `${configData[workflow][a]["cdmReviewHistory"]}` + //Make cdmReviews history record correct according to configurable workflow, not hard-coded. Patrick Hsu, 5 Feb 2024
                                            cmt +
                                            "^";
                                        hist = $("#h_" + hzd + "_cdmReviews").html();
                                        // if(hist==''||!hist||hist==undefined){
                                        //     hist='';
                                        // }
                                        if (hist) {
                                            nl = nl + hist;
                                        }
                                        // tdata.push("cdmReviews|" + nl);
                                        // tdata.push("cdmCurrentStatus|Under principal designer review");
                                        // tdata.push("cdmLastReviewDate|" + ind);
                                        // tdata.push(
                                        //     "cdmLastReviewStatus|Pre-construction review completed"
                                        // );
                                        // tdata.push("cdmLastReviewer|" + unm());



                                        var ns = $("#h_" + hzd + " .rucl").hasClass("_2");
                                        if (ns === true) {
                                            tdata.push("cdmReviews|" + nl);
                                            tdata.push(
                                                `cdmCurrentStatus|${configData[workflow][a]["nextWorkFlowState"]}` //Editable workflow config. Patrick Hsu, 30 Jan 2024"
                                            );
                                            tdata.push("cdmLastReviewDate|" + ind);
                                            tdata.push(
                                                "cdmLastReviewStatus|Principal designer review completed"
                                            );
                                            tdata.push("cdmLastReviewer|" + unm());
                                        } else {
                                            tdata.push("cdmCurrentStatus|Accepted");
                                            tdata.push("cdmReviews|" + nl);
                                            tdata.push("cdmLastReviewDate|" + ind);
                                            tdata.push(
                                                "cdmLastReviewStatus|Principal designer review completed"
                                            );
                                            tdata.push("cdmLastReviewer|" + unm());
                                        }



                                        cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                        $("#pops").remove();
                                    }
                                    // if (act === "addrams") {
                                    //   var mits = $("#smmsgg").val();
                                    //   if (!mits) {
                                    //     toastr.error(
                                    //       "Please enter a mitigation suggestion first"
                                    //     );
                                    //   } else {
                                    //     var ht = "#h_" + hzd + " ";
                                    //     var hz = $("#h_" + hzd + " .cdmHazardDescription").html();
                                    //     var rs = $("#h_" + hzd + " .cdmRiskDescription").html();
                                    //     var risks = $(ht + ".cdmRR").html();
                                    //     var dasite = $(ht + ".cdmSite").data("siteid");
                                    //     var trisks = risks.split("-");
                                    //     var riskscoreval = trisks[0];
                                    //     var rscv = parseInt(riskscoreval, 10);

                                    //     var title1 = new Date();
                                    //     //var title2=uid();
                                    //     var title10 =
                                    //       title1.getTime() +
                                    //       "^" +
                                    //       title1.getDate() +
                                    //       "^" +
                                    //       title1.getMonth() +
                                    //       1 +
                                    //       "^" +
                                    //       title1.getFullYear();
                                    //     var title = title10.toString() + "^" + uid();
                                    //     var ms = "Awaiting mitigation";
                                    //     var stmsugg = $(
                                    //       ht + ".cdmStageMitigationSuggestion"
                                    //     ).html();
                                    //     var raid = $("#val_rams").html();
                                    //     var ratx = $("#sel_rams").val();
                                    //     var stg = $(ht + ".cdmStageExtra").html();
                                    //     var stgi = 1;
                                    //     if (stg != "Construction") {
                                    //       stgi = 2;
                                    //     }
                                    //     var hzt = $(ht + ".cdmType").html();
                                    //     var hzti = 2;
                                    //     if (hzt == "Health") {
                                    //       hzti = 1;
                                    //     }

                                    //     tdata = [];
                                    //     // toastr.success(site);
                                    //     tdata.push("Title|" + title);
                                    //     tdata.push("cdmSiblings|" + title);
                                    //     tdata.push("cdmParent|" + hzd);
                                    //     tdata.push("cdmHazardDescription|" + hz);
                                    //     tdata.push("cdmRiskDescription|" + rs);
                                    //     tdata.push("cdmMitigationDescription|" + ms);
                                    //     tdata.push("cdmSite|" + dasite);
                                    //     tdata.push("cdmInitialRisk|" + risks);
                                    //     tdata.push("cdmResidualRisk|" + risks);
                                    //     tdata.push("cdmHazardType|" + hzti);
                                    //     tdata.push("cdmInitialRiskScore|" + rscv);
                                    //     tdata.push("cdmResidualRiskScore|" + rscv);
                                    //     // tdata.push('cdmIniRisk|'+$('#inirisk').prop('outerHTML'));
                                    //     // tdata.push('cdmResRisk|'+$('#inirisk').prop('outerHTML'));
                                    //     tdata.push("cdmStageMitigationSuggestion|" + stmsugg);
                                    //     tdata.push("cdmSMMitigationSuggestion|" + mits);
                                    //     tdata.push("cdmRAMS|" + raid);
                                    //     tdata.push("cdmEntityTitle|" + ratx);
                                    //     tdata.push("cdmStageExtra|" + stgi);
                                    //     var udata = [];
                                    //     udata.push("cdmSMMitigationSuggestion|This hazard is further mitigated via one or several RAMS hazards with the following mitigation suggestion by the Construction Manager: " + mits + " Please click 'View linked / related hazards' for further details.");

                                    //     tposdata.setRAMS("cdmHazards", tdata, "qmsg");
                                    //   }
                                    // }
                                    // cdmdata.update('cdmHazards',tdata,'frmedit_updateview');
                                    // $('#pops').remove();
                                });
                        }
                    );
                }

                if (a == "ldreview") {
                    gimmepops("Undertake the client review", "");
                    $(".pops-content").load(
                        "../3.0/html/internal.design.review.form.html",
                        function() {
                            $(".tpos-svbtn")
                                .off("click")
                                .on("click", function() {
                                    var act = $(this).data("action");
                                    var cmt = sanitizeInput($("#cmt").val());
                                    // hist = $('#h_'+hzd+'_cdmReviews').html();
                                    // if(hist==''||!hist||hist==undefined){
                                    //     hist='';
                                    // }

                                    var tdata = [];
                                    if (act == "change") {
                                        if (cmt == "" || !cmt || cmt == undefined) {
                                            toastr.error(
                                                "Please use the comment box to explain your decision and outline the required changes."
                                            );
                                        }
                                        if (cmt) {
                                            nl =
                                                nnd +
                                                "]" +
                                                user +
                                                "]" +
                                                "requested change]" +
                                                cmt +
                                                "^";
                                            hist = $("#h_" + hzd + "_cdmReviews").html();
                                            // if(hist==''||!hist||hist==undefined){
                                            //     hist='';
                                            // }
                                            if (hist) {
                                                nl = nl + hist;
                                            }

                                            tdata.push("cdmReviews|" + nl);
                                            tdata.push("cdmCurrentStatus|Assessment in progress");
                                            tdata.push("cdmLastReviewDate|" + ind);
                                            tdata.push("cdmLastReviewStatus|Change request issued");
                                            tdata.push("cdmLastReviewer|" + unm());
                                            cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                            $("#pops").remove();
                                        }
                                    } else {
                                        if (!cmt) {
                                            cmt = "no comment";
                                        }
                                        nl =
                                            nnd +
                                            "]" +
                                            user +
                                            "]" +
                                            `${configData[workflow][a]["cdmReviewHistory"]}` + //Make cdmReviews history record correct according to configurable workflow, not hard-coded. Patrick Hsu, 5 Feb 2024
                                            cmt +
                                            "^";
                                        hist = $("#h_" + hzd + "_cdmReviews").html();
                                        // if(hist==''||!hist||hist==undefined){
                                        //     hist='';
                                        // }
                                        if (hist) {
                                            nl = nl + hist;
                                        }
                                        tdata.push(`cdmCurrentStatus|${configData[workflow][a]["nextWorkFlowState"]}`); //Editable workflow config. Patrick Hsu, 30 Jan 2024
                                        tdata.push("cdmReviews|" + nl);
                                        tdata.push("cdmLastReviewDate|" + ind);
                                        tdata.push(
                                            "cdmLastReviewStatus|Client review completed"
                                        );
                                        tdata.push("cdmLastReviewer|" + unm());
                                        cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                        $("#pops").remove();

                                        // var ns=$('#h_'+hzd+' .rucpc').hasClass('_2');
                                    }
                                    // cdmdata.update('cdmHazards',tdata,'frmedit_updateview');
                                    // $('#pops').remove();
                                });
                        }
                    );
                }
                if (a == "smreview") {
                    gimmepops("Undertake the principal contractor review", "");
                    $(".pops-content").load(
                        "../3.0/html/internal.design.review.form.html",
                        function() {
                            $(".tpos-svbtn")
                                .off("click")
                                .on("click", function() {
                                    var act = $(this).data("action");
                                    var cmt = sanitizeInput($("#cmt").val());
                                    // hist = $('#h_'+hzd+'_cdmReviews').html();
                                    // if(hist==''||!hist||hist==undefined){
                                    //     hist='';
                                    // }

                                    var tdata = [];
                                    if (act == "change") {
                                        if (cmt == "" || !cmt || cmt == undefined) {
                                            toastr.error(
                                                "Please use the comment box to explain your decision and outline the required changes."
                                            );
                                        }
                                        if (cmt) {
                                            nl =
                                                nnd +
                                                "]" +
                                                user +
                                                "]" +
                                                "requested change]" +
                                                cmt +
                                                "^";
                                            hist = $("#h_" + hzd + "_cdmReviews").html();
                                            // if(hist==''||!hist||hist==undefined){
                                            //     hist='';
                                            // }
                                            if (hist) {
                                                nl = nl + hist;
                                            }

                                            tdata.push("cdmReviews|" + nl);
                                            tdata.push("cdmCurrentStatus|Assessment in progress");
                                            tdata.push("cdmLastReviewDate|" + ind);
                                            tdata.push("cdmLastReviewStatus|Change request issued");
                                            tdata.push("cdmLastReviewer|" + unm());
                                            cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                            $("#pops").remove();
                                        }
                                    } else {
                                        if (!cmt) {
                                            cmt = "no comment";
                                        }
                                        nl =
                                            nnd +
                                            "]" +
                                            user +
                                            "]" +
                                            `${configData[workflow][a]["cdmReviewHistory"]}` + //Make cdmReviews history record correct according to configurable workflow, not hard-coded. Patrick Hsu, 5 Feb 2024
                                            cmt +
                                            "^";
                                        hist = $("#h_" + hzd + "_cdmReviews").html();
                                        // if(hist==''||!hist||hist==undefined){
                                        //     hist='';
                                        // }
                                        if (hist) {
                                            nl = nl + hist;
                                        }
                                        tdata.push(`cdmCurrentStatus|${configData[workflow][a]["nextWorkFlowState"]}`); //Editable workflow config. Patrick Hsu, 30 Jan 2024
                                        tdata.push("cdmReviews|" + nl);
                                        tdata.push("cdmLastReviewDate|" + ind);
                                        tdata.push(
                                            "cdmLastReviewStatus|Principal Contractor review completed"
                                        );
                                        tdata.push("cdmLastReviewer|" + unm());
                                        cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                                        $("#pops").remove();

                                        // var ns=$('#h_'+hzd+' .rucpc').hasClass('_2');
                                    }
                                    // cdmdata.update('cdmHazards',tdata,'frmedit_updateview');
                                    // $('#pops').remove();
                                });
                        }
                    );
                }
                if (a == "clientreview") {
                    var vcheck = $('#h_' + hzd + ' .cdmResidualRiskOwner').html();
                    var contract = $('#h_' + hzd + ' .cdmContract').html();
                    if (vcheck === null || vcheck === 'undefined' || vcheck === '') {
                        toastr.error(`Please provide a Residual Risk Owner before submitting to ${configData['Client Name']}`);
                    } else if (vcheck === "HS2 Rail Systems Interface Engineer" && !contract) {
                        toastr.error("If the residual risk owner is HS2 Rail Systems Interface Engineer, you must provide a contract before submitting to HS2");
                    } else {
                        var tdata = [];
                        nl =
                            nnd +
                            "]" +
                            user +
                            "]" +
                            "submitted for client review]" +
                            "^";
                        hist = $("#h_" + hzd + "_cdmReviews").html();

                        if (hist) {
                            nl = nl + hist;
                        }

                        tdata.push("cdmReviews|" + nl);
                        tdata.push(`cdmCurrentStatus|Ready for review by ${configData['Client Name']}`);
                        tdata.push("cdmLastReviewDate|" + ind);
                        tdata.push(`cdmLastReviewStatus|Ready for review by ${configData['Client Name']}`);
                        tdata.push("cdmLastReviewer|" + unm());
                        cdmdata.update("cdmHazards", tdata, "frmedit_updateview");
                    }
                }
            }
        });

}































































function toggleCollapse() {
    $(".vwshow")
        .off("click")
        .on("click", function() {
            $(".vwdefault").show();
            $(".vwhover").hide();
            // $('.vwhover').removeClass('animated');
            // $('.vwhover').removeClass('fadeInTop');
            $(".row-hazard").removeClass("addmargin");
            $(".row-hazard").removeClass("animated");
            $(".row-hazard").removeClass("fadeIn");

            var e = $(this).attr("id");
            e = e.substring(0, e.length - 4);
            toastr.success(e);
            $("#" + e + " .vwdefault").hide();
            $("#" + e + " .vwhover").show();
            $("#" + e).addClass("animated");
            $("#" + e).addClass("fadeIn");
            $("#" + e).addClass("addmargin");
            // var is=e.split('_');
            // var i=is[1];
            // data.hazardgetitem(i);
            // page.scroll('#'+e);
        });
    $(".vwhide").click(function() {
        // var e = $(this).attr('id');
        // e = e.substring(0, e.length - 3);
        $(".row-hazard").removeClass("addmargin");
        $(".row-hazard").removeClass("animated");
        $(".row-hazard").removeClass("fadeIn");
        $(".vwdefault").show();
        $(".vwhover").hide();
        // $('.vwhover').removeClass('animated');
        // $('.vwhover').removeClass('fadeInTop');
    });
}

function toggleInfoPanel() {
    $(".revhis")
        .off("click")
        .on("click", function() {
            // toastr.success('listening-rev');
            var hi = $(this)
                .parents(".row-hazard")
                .attr("id");
            var hia = hi.split("_");
            var id = hia[1];
            hzd = id;

            if ($("#h_" + hzd + "_reviewhistory").hasClass("hide") == 1) {
                $("#h_" + hzd + "_reviewhistory").removeClass("hide");
                $("#h_" + hzd + " .revhis").addClass("highlight");
            } else {
                $("#h_" + hzd + "_reviewhistory").addClass("hide");
                $("#h_" + hzd + " .revhis").removeClass("highlight");
            }
        });
    $(".hazhis")
        .off("click")
        .on("click", function() {
            // toastr.success('listening-haz');
            var hi = $(this)
                .parents(".row-hazard")
                .attr("id");
            var hia = hi.split("_");
            var id = hia[1];
            hzd = id;

            if ($("#h_" + hzd + "_changehistory").hasClass("hide") == 1) {
                $("#h_" + hzd + "_changehistory").removeClass("hide");
                $("#h_" + hzd + " .hazhis").addClass("highlight");
                cdmdata.get(
                    "cdmHazardHistory",
                    "cdmHazard eq '" + id + "'",
                    "Modified desc",
                    "hazhistory",
                    "h_" + id + "_changehistory"
                );
            } else {
                $("#h_" + hzd + "_changehistory").addClass("hide");
                $("#h_" + hzd + " .hazhis").removeClass("highlight");
            }
        });
}

function updateHazardListItemView(lst, data) {
    var d = data.d.results;
    var h = d[0];
    var row = printHazardRow(h);

    var dc = 0;
    if ($("#h_" + hzd).hasClass("addmargin") == true) {
        dc = 1;
    }
    $("#h_" + hzd).replaceWith(row);
    if (h.cdmRAMS) {
        $("#h_" + h.ID + " .ramsonly").show();
    }
    // if (h.cdmHazardType.Title == "Safety") {
    //     $("#h_" + h.ID + " .safetyhide").hide();
    // }

    // toggleCollapse();
    // $('#h' + hzd + ' .vwdefault').hide();
    // $('#h' + hzd + ' .vwhover').show();
    // $('#h'+hzd).addClass('addmargin');
    reopenHazardAction();
    activateHazardEdits();
    hazardreviewbuttonaction();
    activateRAMSBtn();
    toggleCollapse();
    toggleInfoPanel();
    if (dc == 1) {
        deCollapse("h_" + hzd);
    }
}

function deCollapse(e) {
    $(".vwdefault").show();
    $(".vwhover").hide();
    // $('.vwhover').removeClass('animated');
    // $('.vwhover').removeClass('fadeInTop');
    $(".row-hazard").removeClass("addmargin");
    $(".row-hazard").removeClass("animated");
    $(".row-hazard").removeClass("fadeIn");

    // var e = $(this).attr('id');
    // e = e.substring(0, e.length - 3);
    $("#" + e + " .vwdefault").hide();
    $("#" + e + " .vwhover").show();
    $("#" + e).addClass("animated");
    $("#" + e).addClass("fadeIn");
    $("#" + e).addClass("addmargin");
    //   toastr.success("back to normal?");
    toggleCollapse();
}

function reopenHazardAction() {
    $('#reopen-button')
        .off('click')
        .on('click', async function() {
            const allowedUserRoles = configData["Reopen hazards"];
            const companyId = Number($(this).data('company'));
            const hazardId = Number($(this).data('hazardid'));
            hzd = hazardId; // THis is a global variable that SafetIbase uses to know which hazard to update - not ideal but too difficult to change
            
            // Only users in the hazard owner's company can reopen
            // Get the user data
            const userId = _spPageContextInfo.userId;
            const usersListUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getByTitle(%27cdmUsers%27)/items?$filter=cdmUser%20eq%20${userId}`;
            const userDataResult = await $.ajax({
                url: usersListUrl,
                method: 'GET',
                headers: {
                    'Accept': 'application/json; odata=verbose'
                }
            })
            const userRolesUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getByTitle(%27cdmUserRoles%27)/items`;

            const userRoleData = await $.ajax({
                url: userRolesUrl,
                method: 'GET',
                headers: {
                    "Accept": "application/json; odata=verbose"
                }
            })

            //filter out values in userRoleData not included in allowedUserRoles
            const authorisedRoles = [];
            for (const x of userRoleData.d.results){
                if (allowedUserRoles.includes(x.Title)){
                    authorisedRoles.push(x)
                }
            }
            
            //get the user roles IDs
            const userRolesParsed = userDataResult.d.results.map(x => x.cdmUserRoleId)

            //get the filtered userRoleData IDs

            const authorisedRolesId  = authorisedRoles.map(x => x.ID)
            
            let authorised = false;
            for (i=0; i<userDataResult.d.results.length; i++) {
                    if (userDataResult.d.results[i].cdmCompanyId === companyId) {
                        authorised = true;
                }
            }

            if (!authorised){
                toastr.error('Hazards can only be reopened by users of the company that owns the hazard');
            } else if (!(userRolesParsed.some(x => authorisedRolesId.includes(x)))) {
                toastr.error('You do not have the required permissions to reopen hazards. Ask your system administrator to grant you further user roles.' )
            } else {
                gimmepops("Reopening hazards", "");
                
                $(".pops-content").load("../3.0/html/hazard.reopen.form.html", () => {
                    $('#confirm-reopen-button').on("click", async function() {
                        // Send the hazard back to the start of the workflow
                        // Get the audit trail data so we can update it
                        const cdmReviewsUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getByTitle(%27cdmHazards%27)/items?$filter=ID%20eq%20${hazardId}&$select=cdmReviews`;
                        const cdmReviewsResult = await $.ajax({
                            url: cdmReviewsUrl,
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json; odata=verbose'
                            }
                        });
                        const today = new Date();
                        const dateFormatted = today.toLocaleDateString('en-GB');
                        const user = unm();
                        let comment = sanitizeInput($("#cmt").val());
                        if (!comment) {
                            comment = "no comment";
                        }
                        const previousCdmReviews = cdmReviewsResult.d.results[0].cdmReviews;
                        const cdmReviews = `${dateFormatted}]${user}]Reopened hazard]${comment}^${previousCdmReviews}`;
    
                        const tdata = ['cdmCurrentStatus|Assessment in progress', 'cdmLastReviewStatus|Reopened', `cdmReviews|${cdmReviews}`];
                        cdmdata.update('cdmHazards', tdata, 'frmedit_updateview');
                        closepops();
                    })
                });
                
            }
        }
    )
}
            
