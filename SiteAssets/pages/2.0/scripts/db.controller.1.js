$(document).ready(function () {
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', init);
    $(document).tooltip();
    jQuery.expr[':'].Contains = function (a, i, m) {
        return jQuery(a).text().toUpperCase()
            .indexOf(m[3].toUpperCase()) >= 0;
    };

});
// GLOBALS
// adding hazards:
// var sSite=0;
// var sStructure=0;
// var sTW=0;
// var sRAMS=0;
var hzd=0;
var hzdt=0;

// FUNCTIONS
function init() {
    $('#pageTitle').html('the tpos hazards register');
    $('#DeltaSiteLogo').html('<a title="" class="ms-siteicon-a" id="ctl00_onetidProjectPropertyTitleGraphic" aria-describedby="ui-id-1" href=""><img src="data:image/png;base64,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"></a>');
    $('#tpos-page').load('../../pages/2.0/html/user.dashboard.layout.1.html', function () {
        tposdata.get('cdmUsers', 'cdmUser/Id eq \'' + uid() + '\'', 'ID asc', 'setup_nav');
        // tposdata.get('cdmHazards','Author/ID eq \'' + uid() + '\' or Editor/ID eq \'' + uid() + '\'','ID asc','setup_main');
        main.setup_welcome();
    });

}