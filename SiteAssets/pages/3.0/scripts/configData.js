configData = {
    'site': 'sub lot', // How does the project name its work sites? E.g., sublot.
    'Residual Risk Owner': 'HS2 Residual Risk Owner', // How does the project name its residual risk owner user group? E.g. Client residual risk owner.
    'Contract': 'HS2 Future Works Contract', // How does the project name its contracts that own the works relevant to a given hazard. E.g. Future works contract.
    'Client Review': true, // Does the project require a client review to be included in the workflow?
    'Client Review Permissions': ['System admin', 'Construction Manager'], // Which user roles should be authorised to submit hazards for client review. This is given as a list. E.g., ['System admin', 'Designer', 'Construction Manager'].
    'Client Name': 'HS2', // What is the name of the client of the project?
    'Archive hazards permissions': ['System admin'], // Which user roles should be authorised to archive hazards. This is given as a list. E.g., ['System admin', 'Designer', 'Construction Manager'].
    'Sync Client Hazard Permissions': ['System admin'], // Defines who can use 'Sync Client Hazards' button.
    'Simplified designer dashboard': false, // Do you want a simplified user dashboard for designers?
    'Simplified design manager dashboard': false, // Do you want a simplified user dashboard for designer managers?
    'Simplified construction engineer dashboard': true, // Do you want a simplified user dashboard for construction engineers?
    'Simplified construction manager dashboard': true, // Do you want a simplified user dashboard for construction managers?
    'Simplified principal designer dashboard': false, // Do you want a simplified user dashboard for principal designers?
    'Simplified system admin dashboard': false, // Do you want a simplified user dashboard for system admins?
    'Peer review editable workflow state': false, // Do you want to be able to edit hazards at peer review stage? If not, hazards that are at this stage will have to be sent to start of the workflow before they can be edited.
    'Design manager review editable workflow state': true, // Do you want to be able to edit hazards at design manager review stage? If not, hazards that are at this stage will have to be sent to start of the workflow before they can be edited.
    'Pre-construction review editable workflow state': true, // Do you want to be able to edit hazards at pre-construction review stage? If not, hazards that are at this stage will have to be sent to start of the workflow before they can be edited.
    'Principal designer review editable workflow state': false, // Do you want to be able to edit hazards at principal designer review stage? If not, hazards that are at this stage will have to be sent to start of the workflow before they can be edited.
    'Construction manager review editable workflow state': false, // Do you want to be able to edit hazards at construction manager review stage? If not, hazards that are at this stage will have to be sent to start of the workflow before they can be edited.
    'Construction manager approval comment populates cdmSMMitigationSuggestion': true, // Do you want the approval comment from the construction manager's review to populate the site manager's mitigation suggestion
    'Full admin edit rights': true, // Do you want the admin to be able to edit any field, at any point in the workflow?
    'Include contract': true, // Do you want to have the option to assign contracts to hazards?
    'Reopen hazards': [], // Defines who can use the reopen hazards button
    'Exportable workflow states': ['Requires mitigation', 'Assessment in progress', 'Under peer review', 'Under design manager review'],
    'Create hazard show asset description': true,
    'Client sync reject state': 'Under pre-construction review', // Which state should client-synced hazards be set to if rejected by the client?

    //Editable workflow config section. Patrick Hsu, Jan & Feb 2024
    //Default full workflows
    'ConstructionCommission' : {
        'initiatereview' : { 
            'nextWorkFlowState': 'Under peer review', 
            'userRoles': ['Designer','Construction Engineer','Design Manager','Construction Manager','Principal Designer', 'Site Team'], // who can review/edit the hazard at this poinT
            'cdmReviewHistory': 'requested peer review]'
        },
        'peerreview' : { 
            'nextWorkFlowState': 'Under design manager review', 
            'userRoles': ['Designer', 'Site Team'], // who can review/edit the hazard at this point
            'cdmLastReviewStatus': 'Review initiated',
            'cdmReviewHistory': 'completed peer review]'
        },
        'dmreview' : { 
            'nextWorkFlowState': 'Under pre-construction review', 
            'userRoles': ['Design Manager', 'Site Team'], // who can review/edit the hazard at this point
            'cdmLastReviewStatus': 'Peer review - approved',
            'cdmReviewHistory': 'completed design manager review]'
        },
        'pcreview' : { 
            'nextWorkFlowState': 'Accepted', 
            'userRoles': ['Construction Manager', 'Site Team'], // who can review/edit the hazard at this point
            'cdmLastReviewStatus': 'design manager review - approved',
            'cdmReviewHistory': 'completed pre-construction review]'
        },
        'ldreview' : { 
            'nextWorkFlowState': 'Under site manager review', 
            'userRoles': ['Principal Designer'], // who can review/edit the hazard at this point
            'cdmLastReviewStatus': 'Pre-construction review completed',
            'cdmReviewHistory': 'completed principal designer review]'
        },
        'smreview' : { 
            'nextWorkFlowState': 'Accepted', 
            'userRoles': ['Construction Manager'], // who can review/edit the hazard at this point
            'cdmLastReviewStatus': 'Principal designer review completed',
            'cdmReviewHistory': 'completed Construction Manager review]'
        }
    },
    'OpsDemolMaint' : {  
        'initiatereview' : { 
            'nextWorkFlowState': 'Under peer review', 
            'userRoles': ['Designer','Construction Engineer','Design Manager','Construction Manager','Principal Designer', 'Site Team'], // who can review/edit the hazard at this poinT
            'cdmReviewHistory': 'requested peer review]'
        },
        'peerreview' : { 
            'nextWorkFlowState': 'Under design manager review', 
            'userRoles': ['Designer', 'Site Team'], // who can review/edit the hazard at this point
            'cdmLastReviewStatus': 'Review initiated',
            'cdmReviewHistory': 'completed peer review]'
        },
        'dmreview' : { 
            'nextWorkFlowState': 'Under pre-construction review', 
            'userRoles': ['Design Manager','Designer', 'Site Team'], // who can review/edit the hazard at this point
            'cdmLastReviewStatus': 'Peer review - approved',
            'cdmReviewHistory': 'completed design manager review]'
        },
        'pcreview' : { 
            'nextWorkFlowState': 'Accepted', 
            'userRoles': ['Construction Manager', 'Site Team'], // who can review/edit the hazard at this point
            'cdmLastReviewStatus': 'design manager review - approved',
            'cdmReviewHistory': 'completed pre-construction review]'
        },
        'ldreview' : { 
            'nextWorkFlowState': 'Under site manager review', 
            'userRoles': ['Principal Designer'], // who can review/edit the hazard at this point
            'cdmLastReviewStatus': 'Pre-construction review completed',
            'cdmReviewHistory': 'completed principal designer review]'
        },
        'smreview' : { 
            'nextWorkFlowState': 'Accepted', 
            'userRoles': ['Construction Manager'], // who can review/edit the hazard at this point
            'cdmLastReviewStatus': 'Principal designer review completed',
            'cdmReviewHistory': 'completed Construction Manager review]'
        }
    }
}