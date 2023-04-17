// query resource 
q_hazards={};
q_reviews={};
q_users={};
q_companies={
    getdesignhouses:function(order,format,etrg){
        return tposdata.getq('cdmCompanies','cdmCompanyRole/Title eq \'Design house\'',order,'frmsel_owner');
    },
    getsubcontractors:function(){

    }
};
