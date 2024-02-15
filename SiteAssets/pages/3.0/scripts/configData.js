configData = {
    'site': 'site', // How does the project name its work sites? E.g., sublot.
    'Residual Risk Owner': 'Residual Risk Owner', // How does the project name its residual risk owner user group? E.g. Client residual risk owner.
    'Contract': 'Contract', // How does the project name its contracts that own the works relevant to a given hazard. E.g. Future works contract.
    'Client Review': false, // Does the project require a client review to be included in the workflow?
    'Client Name': 'Client', // What is the name of the client of the project?
    'Archive hazards permissions': ['System admin'], // Which user roles should be authorised to archive hazards. This is given as a list. E.g., ['System admin', 'Designer', 'Construction Manager'].
    'Sync Client Hazard Permissions': ['System admin'], // Defines who can use 'Sync Client Hazards' button.
    'Simplified designer dashboard': false, // Do you want a simplified user dashboard for designers?
    'Simplified design manager dashboard': false, // Do you want a simplified user dashboard for designer managers?
    'Simplified construction engineer dashboard': false, // Do you want a simplified user dashboard for construction engineers?
    'Simplified construction manager dashboard': false, // Do you want a simplified user dashboard for construction managers?
    'Simplified principal designer dashboard': false, // Do you want a simplified user dashboard for principal designers?
    'Simplified system admin dashboard': false, // Do you want a simplified user dashboard for system admins?
    'Peer review editable workflow state': false, // Do you want to be able to edit hazards at peer review stage? If not, hazards that are at this stage will have to be sent to start of the workflow before they can be edited.
    'Design manager review editable workflow state': false, // Do you want to be able to edit hazards at design manager review stage? If not, hazards that are at this stage will have to be sent to start of the workflow before they can be edited.
    'Pre-construction review editable workflow state': false, // Do you want to be able to edit hazards at pre-construction review stage? If not, hazards that are at this stage will have to be sent to start of the workflow before they can be edited.
    'Principal designer review editable workflow state': false, // Do you want to be able to edit hazards at principal designer review stage? If not, hazards that are at this stage will have to be sent to start of the workflow before they can be edited.
    'Construction manager review editable workflow state': false, // Do you want to be able to edit hazards at construction manager review stage? If not, hazards that are at this stage will have to be sent to start of the workflow before they can be edited.
    'Construction manager approval comment populates cdmSMMitigationSuggestion': false, // Do you want the approval comment from the construction manager's review to populate the site manager's mitigation suggestion
    'Full admin edit rights': false, // Do you want the admin to be able to edit any field, at any point in the workflow?
    'Include contract': true, // Do you want to have the option to assign contracts to hazards?
    'Exportable workflow states': ['Requires mitigation', 'Assessment in progress', 'Under peer review', 'Under design manager review'],
 
    //Editable workflow config section. Patrick Hsu, Jan & Feb 2024
    /*
    'Workflow' : { 
        'initiatereview' : { 
            'nextWorkFlowState': 'Under peer review', 
            'userRoles': ['Designer','Construction Engineer','Design Manager','Construction Manager','Principal Designer'], // who can review/edit the hazard at this poinT
            'cdmReviewHistory': 'requested peer review]'
        },
        'peerreview' : { 
            'nextWorkFlowState': 'Under design manager review', 
            'userRoles': ['Designer'], // who can review/edit the hazard at this point
            'cdmLastReviewStatus': 'Review initiated',
            'cdmReviewHistory': 'completed peer review]'
        },
        'dmreview' : { 
            'nextWorkFlowState': 'Under pre-construction review', 
            'userRoles': ['Design Manager'], // who can review/edit the hazard at this point
            'cdmLastReviewStatus': 'Peer review - approved',
            'cdmReviewHistory': 'completed design manager review]'
        },
        'pcreview' : { 
            'nextWorkFlowState': 'Under principal designer review', 
            'userRoles': ['Construction Manager'], // who can review/edit the hazard at this point
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
        },
        'Senior Manager Flag': ['Construction Manager'], //Make the definition of senior manager user role configurable. This flag needs to be set in order to progress to pcreview, ldreview and smreview stages. Patrick Hsu, 6 Feb 2024
        'Can Edit': ['Designer'], //Make the definition of user role that can edit configurable. Patrick Hsu, 6 Feb 2024

    }

    }
    */

    //Test workflow object for playing around 
    
    // /*
    'Workflow' : { 
        'initiatereview' : { 
            'nextWorkFlowState': 'Under design manager review',
            'userRoles': ['Designer','Construction Engineer','Design Manager','Construction Manager','Principal Designer'], // who can review/edit the hazard at this poinT
            'cdmReviewHistory': 'completed design manager review]'
        },
        'peerreview' : { 
            'nextWorkFlowState': 'Under design manager review', 
            'userRoles': ['Designer'], // who can review/edit the hazard at this point
            'cdmLastReviewStatus': 'Review initiated',
            'cdmReviewHistory': 'completed peer review]'
        },
        'dmreview' : { 
            'nextWorkFlowState': 'Under pre-construction review', 
            'userRoles': ['Design Manager'], // who can review/edit the hazard at this point
            'cdmLastReviewStatus': 'Review initiated',
            'cdmReviewHistory': 'completed design manager review]'
        },
        'pcreview' : { 
            'nextWorkFlowState': 'Accepted', 
            'userRoles': ['Construction Manager'], // who can review/edit the hazard at this point
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
        },
        'Senior Manager Flag': ['Construction Manager'], //Make the definition of senior manager user role configurable. This flag needs to be set in order to progress to pcreview, ldreview and smreview stages. Patrick Hsu, 6 Feb 2024
        'Can Edit': ['Designer'], //Make the definition of user role that can edit configurable. Patrick Hsu, 6 Feb 2024

    }
    
}
// */
