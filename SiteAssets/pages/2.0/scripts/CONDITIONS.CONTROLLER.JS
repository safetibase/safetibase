// CONDITIONS CONTROLLER
// CENTRAL MANAGEMENT OF KEY CONDITIONS TO BE CHECKED AND PASSED 
// TO RULES CONTROLLER
//*************************************************************** */
// CHECK HAZARD CATEGORY
// variables
check_hazard={
    category:function(){
        var hc=$('#h_'+hzd+' .row-header').html();
        if(hc=='RAMS Hazard'){
            isDesignHazard=false;
            isRAMS=true;
        }
        if(hc=='Permanent works design hazard'){
            isPWD=true;
            isTWD=false;
            isRAMS=false;
            isDesignHazard=true;
        }
        if(hc=='Temporary works design hazard'){
            isPWD=false;
            isTWD=true;
            isRAMS=false;
            isDesignHazard=true;
        }
    },
    type:function(){

    }
};
check_hazard_ref={

};