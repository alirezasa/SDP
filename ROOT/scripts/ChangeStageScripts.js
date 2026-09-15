/* $Id$ */

var stageDetails = [];
var stageIndexMapping = {};
populateStageIndexMapping();
function populateStageIndexMapping() {
	sdpAjax({
		url: "/api/v3/change_stages",//NO I18N
		success: function (response) {
			if(response.response_status && response.response_status[0].status === "success"){
				stageDetails = response.change_stages;
				stageDetails.forEach(function(item){
					stageIndexMapping[item.stage_index] = {id: item.id, name: item.name};
				});
			}
		},
		ignorefailuremessage: true,
	});
}
