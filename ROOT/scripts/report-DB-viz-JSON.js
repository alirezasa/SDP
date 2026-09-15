/* $Id$ */
delete Array.prototype.toJSON;
var ProblemTabData = {
    "t_E1": {//NO I18N
        "id": "t_E1","name": "Problem","fromId": "t_null",//NO I18N
        "data": {//NO I18N
            "columns": {//NO I18N
				"Details": {"colId": "c_A10","datatype": "BIGINT"},//NO I18N
                "Analysis": {"colId": "c_A11","datatype": "BIGINT"},//NO I18N
                "Solution": { "colId": "c_A12","datatype": "BIGINT"},//NO I18N
                "Tasks/WorkLog": {"colId": "c_A13","datatype": "BIGINT"},//NO I18N
                "Associations": {"colId": "c_A14","datatype": "BIGINT"},//NO I18N
				"History": {"colId": "c_A15","datatype": "BIGINT"},	//NO I18N
				"Notifications": {"colId": "c_A16","datatype": "BIGINT"}	//NO I18N
            },
            "fks": {"Analysis": "Problem_FK","Solution": "Problem_FK","Tasks/WorkLog": "Problem_FK","Associations": "Problem_FK","History": "Problem_FK","Notifications": "Problem_FK"},//NO I18N
            "pk": ["Details"],"uk": [],"relTypeId": "Problem","relId": "E1_Problem"//NO I18N
        }
    },
    "id": "t_E1;"//NO I18N
};
ProblemTabData =  (typeof sdpToJSON != 'undefined') ? sdpToJSON(ProblemTabData) : JSON.stringify(ProblemTabData) ; //NO I18N

var IncidentTabData ={
    "t_E2": {//NO I18N
        "id": "t_E2","name": "Request","fromId": "t_null","data": {//NO I18N
            "columns": {//NO I18N
                "Details": {"colId": "c_A20","datatype": "BIGINT"},//NO I18N
                "Assets": {"colId": "c_A21","datatype": "BIGINT"},//NO I18N
                "StopTimer": {"colId": "c_A22","datatype": "BIGINT"},//NO I18N
				"Notification": {"colId": "c_A23","datatype": "BIGINT"},//NO I18N
				"Associations": {"colId": "c_A24","datatype": "BIGINT"},//NO I18N
				"Resolution": {"colId": "c_A25","datatype": "BIGINT"},//NO I18N
				"Tasks/Worklogs": {"colId": "c_A26","datatype": "BIGINT"},//NO I18N
				"History": {"colId": "c_A27","datatype": "BIGINT"},//NO I18N
				"Approvals": {"colId": "c_A28","datatype": "BIGINT"},//NO I18N
				"others": {"colId": "c_A29","datatype": "BIGINT"}//NO I18N
            },
            "fks": {"Assets":"Problem_FK","StopTimer":"Problem_FK","Notification":"Problem_FK","Associations":"Problem_FK","Resolution":"Problem_FK","Tasks/Worklogs":"Problem_FK","History":"Problem_FK","Approvals":"Problem_FK","Service_Request":"Problem_FK","others":"Problem_FK"},"pk": ["Details"],"uk": [],"relTypeId": "Request","relId": "E2_Problem"//NO I18N
        }
    },
    "id": "t_E2;"//NO I18N
};
IncidentTabData =  (typeof sdpToJSON != 'undefined') ? sdpToJSON(IncidentTabData) : JSON.stringify(IncidentTabData) ; //NO I18N
var ChangesTabData ={
    "t_E3": {//NO I18N
        "id": "t_E3",//NO I18N
        "name": "Changes",//NO I18N
        "fromId": "t_null",//NO I18N
        "data": {//NO I18N
            "columns": {//NO I18N
                "Details": {"colId": "c_A30","datatype": "BIGINT"},//NO I18N
                "Associations": {"colId": "c_A31","datatype": "BIGINT"},//NO I18N
                "Tasks/WorkLog": {"colId": "c_A32","datatype": "BIGINT"},//NO I18N
				"History": {"colId": "c_A33","datatype": "BIGINT"},//NO I18N
				"Planning/Review": {"colId": "c_A34","datatype": "BIGINT"},//NO I18N
				"Approvals": {"colId": "c_A35","datatype": "BIGINT"},//NO I18N
				"Notification": {"colId": "c_A36","datatype": "BIGINT"}//NO I18N
            },
            "fks": {"Tasks/WorkLog" : "Problem_FK","Associations":"Problem_FK","History":"Problem_FK","Planning/Review":"Problem_FK","Approvals":"Problem_FK","Notification":"Problem_FK"},//NO I18N
            "pk": ["Details"],"uk": [],"relTypeId": "Changes","relId": "E3_Changes"//NO I18N
        }
    },
    "id": "t_E3;"//NO I18N
};
ChangesTabData =  (typeof sdpToJSON != 'undefined') ? sdpToJSON(ChangesTabData) : JSON.stringify(ChangesTabData) ; //NO I18N

var AssetsTabData ={
    "t_E5": {	//NO I18N
        "id": "t_E5",//NO I18N
        "name": "Assets",//NO I18N
        "fromId": "t_null",//NO I18N
        "data": {//NO I18N
            "columns": {//NO I18N
                "Details": {"colId": "c_A50","datatype": "BIGINT"},//NO I18N
                "Devices" : {"colId": "c_A51","datatype": "BIGINT"},//NO I18N
                "Depreciation": {"colId": "c_A52","datatype": "BIGINT"},//NO I18N
				"Network": {"colId": "c_A53","datatype": "BIGINT"},//NO I18N
				"History": {"colId": "c_A54","datatype": "BIGINT"},//NO I18N
				"Extras": {"colId": "c_A55","datatype": "BIGINT"},//NO I18N
				"Contract": {"colId": "c_A56","datatype": "BIGINT"}//NO I18N
            },
            "fks": {"Contract":"Problem_FK","Devices":"Problem_FK","Depreciation":"Problem_FK","Network":"Problem_FK","History":"Problem_FK","Extras":"Problem_FK"},//NO I18N
            "pk": ["Details"],"uk": [],"relTypeId": "Assets","relId": "E5_Assets"//NO I18N
        }
    },
    "id": "t_E5;"//NO I18N
};
AssetsTabData =  (typeof sdpToJSON != 'undefined') ? sdpToJSON(AssetsTabData) : JSON.stringify(AssetsTabData) ; //NO I18N
var ContractsTabData ={
    "t_E6": {//NO I18N
        "id": "t_E6",//NO I18N
        "name": "Contracts",//NO I18N
        "fromId": "t_null",//NO I18N
        "data": {//NO I18N
            "columns": {		//NO I18N
                "Details": {"colId": "c_A60","datatype": "BIGINT"},//NO I18N
                "Resource" : {"colId": "c_A61","datatype": "BIGINT"},//NO I18N
				"Notification": {"colId": "c_A62","datatype": "BIGINT"}//NO I18N
            },
            "fks": {"Resource":"Problem_FK","Notification":"Problem_FK"},//NO I18N
            "pk": ["Details"],"uk": [],"relTypeId": "Contracts","relId": "E6_Contracts"//NO I18N
        }
    },
    "id": "t_E6;"//NO I18N
};
ContractsTabData =  (typeof sdpToJSON != 'undefined') ? sdpToJSON(ContractsTabData) : JSON.stringify(ContractsTabData) ; //NO I18N
var PurchaseTabData ={
    "t_E7": {//NO I18N
        "id": "t_E7",//NO I18N
        "name": "Purchase",//NO I18N
        "fromId": "t_null",//NO I18N
        "data": {//NO I18N
            "columns": {//NO I18N
                "Details": {"colId": "c_A70","datatype": "BIGINT"},//NO I18N
                "Notification" : {"colId": "c_A71","datatype": "BIGINT"},//NO I18N
				"Approval": {"colId": "c_A72","datatype": "BIGINT"},//NO I18N
				"Invoice": {"colId": "c_A73","datatype": "BIGINT"},//NO I18N
				"Payment": {"colId": "c_A74","datatype": "BIGINT"},//NO I18N
				"History": {"colId": "c_A75","datatype": "BIGINT"}//NO I18N
            },
            "fks": {"Notification":"Problem_FK","Approval":"Problem_FK","Invoice":"Problem_FK","Payment":"Problem_FK","History":"Problem_FK"},//NO I18N
            "pk": ["Details"],"uk": [],"relTypeId": "Purchase","relId": "E7_Purchase"//NO I18N
        }
    },
    "id": "t_E7;"//NO I18N
};
PurchaseTabData =  (typeof sdpToJSON != 'undefined') ? sdpToJSON(PurchaseTabData) : JSON.stringify(PurchaseTabData) ; //NO I18N

var  ComputersTabData ={
    "t_E8": {//NO I18N
        "id": "t_E8",//NO I18N
        "name": "WorkStation",//NO I18N
        "fromId": "t_null",//NO I18N
        "data": {//NO I18N
            "columns": {//NO I18N
                "Details": {"colId": "c_A80","datatype": "BIGINT"},//NO I18N
                "Association" : {"colId": "c_A81","datatype": "BIGINT"},//NO I18N
				"Component": {"colId": "c_A82","datatype": "BIGINT"},//NO I18N
				"Depreciation": {"colId": "c_A83","datatype": "BIGINT"},//NO I18N
				"History": {"colId": "c_A84","datatype": "BIGINT"}//NO I18N
            },
            "fks": {"Association":"Problem_FK","Component":"Problem_FK","Depreciation":"Problem_FK","History":"Problem_FK"},//NO I18N
			"pk": ["Details"],"uk": [],"relTypeId": "WorkStation","relId": "E8_WorkStation"//NO I18N
        }
    },
    "id": "t_E8;"//NO I18N
};
ComputersTabData =  (typeof sdpToJSON != 'undefined') ? sdpToJSON(ComputersTabData) : JSON.stringify(ComputersTabData) ; //NO I18N

var SoftwareTabData ={
    "t_E9": {//NO I18N
        "id": "t_E9",//NO I18N
        "name": "Software",//NO I18N
        "fromId": "t_null",//NO I18N
        "data": {//NO I18N
            "columns": {//NO I18N
                "Details": {"colId": "c_A90","datatype": "BIGINT"},//NO I18N
                "Association" : {"colId": "c_A91","datatype": "BIGINT"},//NO I18N
				"History": {"colId": "c_A92","datatype": "BIGINT"}//NO I18N
            },
            "fks": {"Association":"Problem_FK","History":"Problem_FK"},//NO I18N
            "pk": ["Details"],"uk": [],"relTypeId": "Purchase","relId": "E9_Purchase"//NO I18N
        }
    },
    "id": "t_E9;"//NO I18N
};
SoftwareTabData =  (typeof sdpToJSON != 'undefined') ? sdpToJSON(SoftwareTabData) : JSON.stringify(SoftwareTabData) ; //NO I18N

var CMDBTabData ={
    "t_E10": {//NO I18N
        "id": "t_E10",//NO I18N
        "name": "CMDB",//NO I18N
        "fromId": "t_null",//NO I18N
        "data": {//NO I18N
            "columns": {	//NO I18N
                "Details": {"colId": "c_A100","datatype": "BIGINT"},//NO I18N
                "Type/Hierarchy" : {"colId": "c_A101","datatype": "BIGINT"},//NO I18N
				"Relationships": {"colId": "c_A102","datatype": "BIGINT"}//NO I18N
            },
            "fks": {"Type/Hierarchy":"Problem_FK","Relationships":"Problem_FK"},//NO I18N
            "pk": ["Details"],"uk": [],"relTypeId": "CMDB","relId": "E10_CMDB"//NO I18N
        }
    },
    "id": "t_E10;"//NO I18N
};
CMDBTabData =  (typeof sdpToJSON != 'undefined') ? sdpToJSON(CMDBTabData) : JSON.stringify(CMDBTabData) ; //NO I18N

var ProjectsTabData ={
    "t_E11": {//NO I18N
        "id": "t_E11",//NO I18N
        "name": "Project",//NO I18N
        "fromId": "t_null",//NO I18N
        "data": {//NO I18N
            "columns": {//NO I18N
                "Details": {"colId": "c_A110","datatype": "BIGINT"},//NO I18N
                "Members" : {"colId": "c_A111","datatype": "BIGINT"},//NO I18N
				"Tasks": {"colId": "c_A112","datatype": "BIGINT"},//NO I18N
				"Milestones": {"colId": "c_A113","datatype": "BIGINT"},//NO I18N
				"History": {"colId": "c_A114","datatype": "BIGINT"},//NO I18N
				"Associations": {"colId": "c_A115","datatype": "BIGINT"}//NO I18N
            },
            "fks": {"Members":"Problem_FK","Tasks":"Problem_FK","Milestones":"Problem_FK","History":"Problem_FK","Associations":"Problem_FK"},//NO I18N
            "pk": ["Details"],"uk": [],"relTypeId": "Project","relId": "E11_Project"//NO I18N
        }
    },
    "id": "t_E11;"//NO I18N
};
ProjectsTabData =  (typeof sdpToJSON != 'undefined') ? sdpToJSON(ProjectsTabData) : JSON.stringify(ProjectsTabData) ; //NO I18N

var TasksTabData ={
    "t_E12": {//NO I18N
        "id": "t_E12",//NO I18N
        "name": "Task",//NO I18N
        "fromId": "t_null",//NO I18N
        "data": {//NO I18N
            "columns": {//NO I18N
                "Details": {"colId": "c_A120","datatype": "BIGINT"},//NO I18N
                "Associations" : {"colId": "c_A121","datatype": "BIGINT"},//NO I18N
				"Worklog": {"colId": "c_A122","datatype": "BIGINT"},//NO I18N
				"History": {"colId": "c_A123","datatype": "BIGINT"},//NO I18N
				"Dependencies": {"colId": "c_A124","datatype": "BIGINT"}//NO I18N
            },
            "fks": {"Associations":"Problem_FK","Worklog":"Problem_FK","History":"Problem_FK","Dependencies":"Problem_FK"},//NO I18N
            "pk": ["Details"],"uk": [],"relTypeId": "Task","relId": "E12_Task"//NO I18N
        }
    },
    "id": "t_E12;"//NO I18N
};
TasksTabData =  (typeof sdpToJSON != 'undefined') ? sdpToJSON(TasksTabData) : JSON.stringify(TasksTabData) ; //NO I18N

var ReleasesTabData ={
	    "t_E13": {//NO I18N
	        "id": "t_E13",//NO I18N
	        "name": "Releases",//NO I18N
	        "fromId": "t_null",//NO I18N
	        "data": {//NO I18N
	            "columns": {//NO I18N
	                "Details": {"colId": "c_A130","datatype": "BIGINT"},//NO I18N
	                "Associations": {"colId": "c_A131","datatype": "BIGINT"},//NO I18N
	                "Tasks/WorkLog": {"colId": "c_A132","datatype": "BIGINT"},//NO I18N
					"History": {"colId": "c_A133","datatype": "BIGINT"},//NO I18N
					"Planning": {"colId": "c_A134","datatype": "BIGINT"},//NO I18N
					"Approvals": {"colId": "c_A135","datatype": "BIGINT"},//NO I18N
					"Notification": {"colId": "c_A136","datatype": "BIGINT"},//NO I18N
					"Others": {"colId": "c_A137","datatype": "BIGINT"}//NO I18N
	            },
	            "fks": {"Tasks/WorkLog" : "Problem_FK","Associations":"Problem_FK","History":"Problem_FK","Planning":"Problem_FK","Approvals":"Problem_FK","Notification":"Problem_FK","Others":"Problem_FK"},//NO I18N
	            "pk": ["Details"],"uk": [],"relTypeId": "Releases","relId": "E13_Releases"//NO I18N
	        }
	    },
	    "id": "t_E13;"//NO I18N
	};
ReleasesTabData =  (typeof sdpToJSON != 'undefined') ? sdpToJSON(ReleasesTabData) : JSON.stringify(ReleasesTabData) ; //NO I18N

var DepartmentTabData ={
    "t_E16": {//NO I18N
        "id": "t_E16",//NO I18N
        "name": "Department",//NO I18N
        "fromId": "t_null",//NO I18N
        "data": {//NO I18N
            "columns": {	//NO I18N
                "Details": {"colId": "c_A140","datatype": "BIGINT"},//NO I18N
            },
            "fks": {},//NO I18N
            "pk": ["Details"],"uk": [],"relTypeId": "Department","relId": "E16_Department"//NO I18N
        }
    },
    "id": "t_E16;"//NO I18N
};
DepartmentTabData =  (typeof sdpToJSON != 'undefined') ? sdpToJSON(DepartmentTabData) : JSON.stringify(DepartmentTabData) ; //NO I18N


var UserTabData ={
    "t_E14": {//NO I18N
        "id": "t_E14",//NO I18N
        "name": "User",//NO I18N
        "fromId": "t_null",//NO I18N
        "data": {//NO I18N
            "columns": {	//NO I18N
                "Details": {"colId": "c_A138","datatype": "BIGINT"},//NO I18N
            },
            "fks": {},//NO I18N
            "pk": ["Details"],"uk": [],"relTypeId": "User","relId": "E14_User"//NO I18N
        }
    },
    "id": "t_E14;"//NO I18N
};
UserTabData =  (typeof sdpToJSON != 'undefined') ? sdpToJSON(UserTabData) : JSON.stringify(UserTabData) ; //NO I18N

var TechnicianTabData ={
    "t_E15": {//NO I18N
        "id": "t_E15",//NO I18N
        "name": "Technician",//NO I18N
        "fromId": "t_null",//NO I18N
        "data": {//NO I18N
            "columns": {	//NO I18N
                "Details": {"colId": "c_A139","datatype": "BIGINT"},//NO I18N
            },
            "fks": {},//NO I18N
            "pk": ["Details"],"uk": [],"relTypeId": "Technician","relId": "E15_Technician"//NO I18N
        }
    },
    "id": "t_E15;"//NO I18N
};
TechnicianTabData =  (typeof sdpToJSON != 'undefined') ? sdpToJSON(TechnicianTabData) : JSON.stringify(TechnicianTabData) ; //NO I18N


var fetch = {
"E1":{//NO I18N
"A10":["Problem","ProblemFileAttachment","Problem_Fields","ProblemToDescription","ProblemToNotes"],//NO I18N
"A11":["ProblemResolution"],//NO I18N
"A12":["SolutionToWorkAround","SolutionToResolution"],//NO I18N
"A13":["ProblemToTaskDetails","ProblemToCharge"],//NO I18N
"A14":["ProblemToIncidentMapping","Arc_ProbToIncidentMapping","ProblemToChangeMapping","ProblemToService","ProblemToAsset"],//NO I18N
"A15":["ProblemHistory","ProblemHistoryDiff"],//NO I18N
"A16":["Notify_Problem"],//NO I18N
"name" : "ProblemTabData"//NO I18N
},
"E2":{	//NO I18N
"A20":["WorkOrder","WorkOrderStates","WorkOrder_Queue","WorkOrderToDescription","Request_Additional_Fields_1","Request_Additional_Fields_2","Request_Additional_Fields_3","Request_Additional_Fields_4","Request_Additional_Fields_5","Request_Additional_Fields_6","Request_Additional_Fields_7","Request_Additional_Fields_8","Request_Additional_Fields_9","Request_Additional_Fields_10","Request_Heavy_Fields_1","Request_Heavy_Fields_2","Request_Heavy_Fields_3","Request_Heavy_Fields_4","Request_Heavy_Fields_5","WorkOrderAttachment","WorkOrder_Recipients"],//NO I18N
"A21":["WO_Resources","WOToRDSSummary"],//NO I18N
"A22":["RequestOnHold"],//NO I18N
"A23":["Notify_WorkOrder","RequestNotification","RequestNotification_Recipients"],//NO I18N
"A24":["ProblemToIncidentMapping","IncidentToChangeMapping","IncidentCausedByChange"],//NO I18N
"A25":["RequestResolution","RequestResolver"],//NO I18N
"A26":["WorkOrderToCharge","WorkOrderToTaskDetails","WO_Template_Tasks","WorkOrderToExternalTasks"],//NO I18N
"A27":["WorkOrderHistory","WorkOrderHistoryDiff"],//NO I18N
"A28":["ApprovalStageMapping","CurrentApprovalStage","ApprovalStage"],//NO I18N
"A29":["RequestRI","Notes","WorkOrderToTaskTable"],//NO I18N
"name":"IncidentTabData"//NO I18N
},
"E3":{//NO I18N
"A30":["ChangeDetails","Change_Fields","ChangeToDescription","ChangeToNotes","ChangeFileAttachment","ChangeToAsset","AssessmentDetails","ChangeToService"],//NO I18N
"A31":["IncidentCausedByChange","IncidentToChangeMapping","Arc_InciCausedByChange","Arc_InciToChangeMapping","ChangeToProjects","ProblemToChangeMapping"],//NO I18N
"A32":["ChangeToCharge","ChangeToTaskDetails"],//NO I18N
"A33":["ChangeHistory","ChangeHistoryDiff"],//NO I18N
"A34":["ChangeToDefaultDescFields"],//NO I18N
"A35":["Change_ApprovalLevel","ApprovalLevel","ApprovalDetails"],//NO I18N
"A36":["Notify_Change"],//NO I18N
"name":"ChangesTabData"//NO I18N
},
"E5":{	//NO I18N
"A50":["ResourceLease","ResourceCost","ResourceOwner","ResourceAssociation","AssetAdditionalFields","ResourceAttachment"],//NO I18N
"A51":["SwitchAsset","PrinterAsset","RouterAsset","MobileDevices"],//NO I18N
"A52":["ResourceDepreciationValue"],//NO I18N
"A53":["NetworkInfo","SystemInfoNetwork"],//NO I18N
"A54":["ResourceStateHistory","ResourceOwnerHistory","ResourceAssociationHistory","ResourceContractHistory"],//NO I18N
"A55":["SystemInfo","AssetRI","SoftwareLicenses","StaticGroup"],//NO I18N
"A56":["ResourceContract","ContractDetails"],//NO I18N
"name":"AssetsTabData"//NO I18N
},
"E6":{//NO I18N
"A60":["MaintenanceContract","Contract_Fields","RenewedContract","SubContract","ContractAttachment","ContractRef"],//NO I18N
"A61":["ResourceContractHistory","ContractDetails","ResourceContract"],//NO I18N
"A62":["ContractNotificationMailIds","Notify_Contract","ContractNotificationSettings"],//NO I18N
"name":"ContractsTabData"//NO I18N
},
"E7":{	//NO I18N
"A70":["PurchaseOrder","PurchaseOrderRI","PurchaseOrder_Fields","POConflictWS","PurchaseOrderAttachment","PurchaseOrderItem"],//NO I18N
"A71":["Notify_PO","POPaymentNotification"],//NO I18N
"A72":["POLevelInfo"],//NO I18N
"A73":["InvoiceDetails"],//NO I18N
"A74":["PaymentDetails"],//NO I18N
"A75":["POHistory"],//NO I18N
"name":"PurchaseTabData"//NO I18N
},
"E8":{		//NO I18N
"A80":["Resources","ResourceLocation","ResourceOwner","Resource_Fields","ResourceAttachment","SystemInfo","AgentActions","WorkstationLoginInfo","NetworkInfo","SystemInfoNetwork"],//NO I18N
"A81":["ResourceLease","ResourceAssociation","SoftwareLicenses","StaticGroup","ResourceContract","ContractDetails","Arc_WorkOrderToResource"],//NO I18N
"A82":["Switch","Printer","Router","MobileDevices"],//NO I18N
"A83":["ResourceDepreciation","ResourceDepreciationValue"],//NO I18N
"A84":["ResourceStateHistory","ResourceOwnerHistory","ResourceAssociationHistory","ResourceContractHistory"],//NO I18N
"name":"ComputersTabData"//NO I18N
},
"E9":{//NO I18N
"A90":["SoftwareList","SuiteSoftwares","HotFixSoftwareInfo","CALUsageInfo","SoftwareInfo","Question_Software_Options","SWMeter"],//NO I18N
"A91":["SoftwareGroupMember","ComponentDefinitionSoftware","AgreementProducts"],//NO I18N
"A92":["SWINFOHISTORY","SWMeterHistory"],//NO I18N
"name":"SoftwareTabData"//NO I18N
},
"E10":{//NO I18N
"A100":["CI","CIAdditionalFields","EntityInstanceAssociation"],//NO I18N
"A101":["EntityDefinition"],//NO I18N
"A102":["InstanceRelationship","ModuleRelationship","AssociationType"],//NO I18N
"name":"CMDBTabData"//NO I18N
},
"E11":{//NO I18N
"A110":["ProjectDetails","ProjectDescription","ProjectAttachments","ProjectComments"],//NO I18N
"A111":["ProjectMembers"],//NO I18N
"A112":["TaskToProjects","TaskDetails"],//NO I18N
"A113":["MileStoneDetails","MileStoneDescription"],//NO I18N
"A114":["ProjectHistory","ProjectHistoryDiff"],//NO I18N
"A115":["ChangeToProjects"],//NO I18N
"name":"ProjectsTabData"//NO I18N
},
"E12":{//NO I18N
"A120":["TaskDetails","TaskDescription","TaskComments","TaskDetailsReminder"],//NO I18N
"A121":["ProblemToTaskDetails","ChangeToTaskDetails","TaskToProjects","WorkOrderToTaskDetails","WO_Template_Tasks"],//NO I18N
"A122":["TaskToCharge"],//NO I18N
"A123":["TaskDetailsHistory","TaskDetailsHistoryDiff"],//NO I18N
"A124":["Task_Dependencies"],//NO I18N
"name":"TasksTabData" //NO I18N
},
"E13":{//NO I18N
	"A130":["ReleaseDetails","ReleaseAdditionalFields","ReleaseMultiSelectFields", "ReleaseToDescription","ReleaseNotes","ReleaseAttachments","ReleaseToAsset","ReleaseToService","ReleaseToDescription","CIToReleaseMapping","ReleaseRoleUserMapping","ReleaseToClosureCode"],//NO I18N
	"A131":["ReleaseToChanges","ReleaseToProjects"],//NO I18N
	"A132":["ReleaseToCharge","ReleaseToTasks"],//NO I18N
	"A133":["ReleaseHistory","ReleaseHistoryDiff"],//NO I18N
	"A134":["ReleaseToDefaultDescFields"],//NO I18N
	"A135":["ReleaseApprovalLevel","ApprovalLevel","ApprovalDetails"],//NO I18N
	"A136":["Notify_Release"],//NO I18N
	"A137":["ReleaseStageData","ReleaseAttachmentField","ReleaseStatusComments"],//NO I18N
	"name":"ReleasesTabData"//NO I18N
},
"E14":{//NO I18N
"A138":["SDUser","UserAdditionalFields","DepartmentDefinition","SupportGroup"],//NO I18N
"name":"UserTabData"//NO I18N
},
"E15":{//NO I18N
  "A139":["SDUser","UserAdditionalFields","PortalTechnicians","DepartmentDefinition","SupportGroup"],//NO I18N
  "name":"TechnicianTabData"//NO I18N
},
"E16":{//NO I18N
  "A140":["DepartmentDefinition","DepartmentAdditionalFields","DeptRoleToUserMapping"],//NO I18N
  "name":"DepartmentTabData"//NO I18N
}
};

/*
STRUCTURE :

var localColumnDescriptions = {
    "<Table_Name>":{"<Column_Name>":"<Description>","<Column_Name>":"Description",....},//NO I18N
    "<Table_Name>":{"<Column_Name>":"<Description>",....}//NO I18N
    ...
    ..
    .
};

var localTableDescriptions = {
    "<Table_Name>":"<Description>",//NO I18N
    "<Table_Name>":"<Description>",//NO I18N
    ...
    ..
    .
};

var hiddenColumns = {
    "<Table_Name>":["<Column_Name>","<Column_Name>",...],//NO I18N
    "<Table_Name>":["<Column_Name>","<Column_Name>",...]//NO I18N
...
..
.
};

var hiddenTables = ["<Table_Name>","<Table_Name>",....];//NO I18N

*/

var localColumnDescriptions = {
    "ColumnDetails":{"COLUMN_ID":"Holds the column ids of the tables","TABLE_ID":"Holds the table id of the table"},//NO I18N
    "TableDetails":{"TABLE_ID":"Holds the table details"}//NO I18N
};

var localTableDescriptions = {
    "TableDetails":"Holds the table details",//NO I18N
    "FKDefinition":"Holds the foreign key definitions"//NO I18N
};

var hiddenColumns = {
    "NetworkInfo":["example_1"],//NO I18N
    "WorkStation":["example_2","example_3"]//NO I18N
};

var hiddenTables = ["example_4"];//NO I18N
