sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/model/Sorter',
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageToast',
    'sap/ui/core/util/MockServer',
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet',
    'sap/ui/model/odata/v2/ODataModel',
    "sap/ui/unified/library",
    "sap/ui/unified/DateTypeRange",
    "sap/ui/core/date/UI5Date",
    'sap/ushell/services/UserInfo',
    'sap/m/Dialog',
],
    function (Controller, MessageBox, Filter, FilterOperator, Sorter, JSONModel,
        MessageToast, MockServer, exportLibrary, Spreadsheet, ODataModel, UserInfo, Dialog, jsPDFLoader,AutoRowMode,DateTypeRange,UI5Date) {
        "use strict";

        return Controller.extend("projectskillsappui.controller.View1", {
            onInit: function () {

                this.linearWizard = this.byId("wizardContentPage");
                this._initializeAsync();
            },

            //----------------------------------------------------------------------------------------------------------------------//
            //                                               NAVIGATION
            //----------------------------------------------------------------------------------------------------------------------//

            // Expand and collapse the side navigation
            onExpandSideNavigation: function () {
                const oSideNavigation = this.byId("sideNavigation"),
                    bExpanded = oSideNavigation.getExpanded();

                oSideNavigation.setExpanded(!bExpanded);
            },

            onNavToMyProfile: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                oRouter.navTo("MyProfile");
            },

            onNavToSkillScreener: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                oRouter.navTo("SkillScreener");
            },

            onNavToTraining: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                oRouter.navTo("Training");
            },

            onNavToCertifications: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                oRouter.navTo("Certifications");
            },

            onNavToCertificationReport: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                oRouter.navTo("CertificationReport");
            },

            onNavToTrainingCourseMaster: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                oRouter.navTo("TrainingCourseMaster");
            },

            onNavToPanelSlotBooking: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                oRouter.navTo("PanelSlotBooking");
            },

            onNavToAdoptionStatus: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                oRouter.navTo("AdoptionStatus");
            },


            //----------------------------------------------------------------------------------------------------------------------//

            _initializeAsync: async function () {

                try {
                    await this._onReadEmployeeData();
                    await this._setTreeTableDataSkills();
                    await this._setTreeTableDataIndustries();
                    this.onExpandAll();
                }
                catch (error) {
                    console.error("Error Occured in  function calls", error);
                }
            },

            // reading Employee data from the database and setting onto the view
            _onReadEmployeeData: function () {

                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new sap.ui.model.json.JSONModel();

                // var oUserInfoService = sap.ushell.Container.getService("UserInfo");
                // var sEmailId = oUserInfoService.getUser().getEmail();
                // console.log(sEmailId);

                var sEmailId = "gaurav.dharankar@ltimindtree.com"
                var oUrlParameters = {
                    "$expand": "employee_skill_detail,employee_industries_experience,employee_customer_experience,employee_cv_experience_data,employee_education_detail,employee_professional_summary,employee_product_experience,employee_language_experience,employee_country_experience",
                    "$filter": "email eq '" + sEmailId + "'"
                }

                return new Promise((resolve, reject) => {
                    var oBusyDialog = new sap.m.BusyDialog({
                        title: "Loading",
                        text: "Please wait..."
                    });
                    oBusyDialog.open();
                    oModel.read("/Employees", {
                        urlParameters: oUrlParameters,
                        success: function (response) {
                            oJSONModel.setData(response.results[0]);
                            this.getView().setModel(oJSONModel, "EmployeeModel");
                            oBusyDialog.close();
                            resolve();
                        }.bind(this),
                        error: function (error) {
                            oBusyDialog.close();
                            reject(error);
                        }
                    });
                });


            },

            //----------------------------------------------------------------------------------------------------------------------//
            //                                               SKILLS TAB
            //----------------------------------------------------------------------------------------------------------------------//

            // reading employee_skill_detail data from database and setting in tree table format
            _setTreeTableDataSkills: function () {

                return new Promise((resolve, reject) => {

                    var oModel = this.getView().getModel("EmployeeModel");
                    let oEmpl_skill_fetched_data = oModel.getProperty("/employee_skill_detail/results");

                    let bClusterNotPresent = true;

                    // tree table JSON Payload
                    var oJSONData = {
                        "cluster_array": []
                    };

                    // cluster_array Payload
                    let oJSONData_clust_array_element =
                    {
                        "clust_JSC": "",
                        "employee_skill": [
                            {
                                "skill": "",
                                "rating": 0,
                                "exp_years": 0,
                                "exp_months": 0,
                            }
                        ]
                    };

                    var oJSONData_skill_array_element;

                    // looping for setting data from the employee_skill_detail  into respective cluster and skills
                    for (let i = 0; i < oEmpl_skill_fetched_data.length; i++, bClusterNotPresent = true) {

                        for (let j = 0; j < oJSONData.cluster_array.length && i > 0; j++) {

                            if (oEmpl_skill_fetched_data[i].JSC === oJSONData.cluster_array[j].clust_JSC) {

                                oJSONData_skill_array_element =
                                {
                                    "skill": oEmpl_skill_fetched_data[i].skill,
                                    "rating": oEmpl_skill_fetched_data[i].rating,
                                    "exp_years": oEmpl_skill_fetched_data[i].exp_years,
                                    "exp_months": oEmpl_skill_fetched_data[i].exp_months,
                                    "bEditable": false,
                                }


                                oJSONData.cluster_array[j].employee_skill.push(oJSONData_skill_array_element);
                                bClusterNotPresent = false;
                                break;
                            }
                        }

                        if (bClusterNotPresent) {
                            oJSONData_clust_array_element =
                            {
                                "clust_JSC": oEmpl_skill_fetched_data[i].JSC,
                                "employee_skill": [
                                    {
                                        "skill": oEmpl_skill_fetched_data[i].skill,
                                        "rating": oEmpl_skill_fetched_data[i].rating,
                                        "exp_years": oEmpl_skill_fetched_data[i].exp_years,
                                        "exp_months": oEmpl_skill_fetched_data[i].exp_months,
                                        "bEditable": false
                                    }
                                ]
                            };

                            oJSONData.cluster_array.push(oJSONData_clust_array_element);
                        }


                    }

                    var oTreeModel = new sap.ui.model.json.JSONModel(oJSONData);

                    // setting the treetable model with created JSONModel
                    var oTreeTable = this.getView().byId("TreeTableBasic");
                    oTreeTable.setModel(oTreeModel);
                    oTreeTable.bindRows({
                        path: "/cluster_array"
                    });

                    // var oAutoRowMode = new AutoRowMode();
                    // // Set the row mode for the table
                    // oTreeTable.setRowMode(oAutoRowMode);

                    resolve();

                });

            },

            // collapse all cluster on the tree table
            onCollapseAll: function () {
                const oTreeTable = this.byId("TreeTableBasic");
                oTreeTable.collapseAll();
            },

            // collapse the selected cluster on the tree table
            onCollapseSelection: function () {
                const oTreeTable = this.byId("TreeTableBasic");
                oTreeTable.collapse(oTreeTable.getSelectedIndices());
            },

            //Expand all cluster on the tree table
            onExpandAll: function () {
                let oTreeTable = this.byId("TreeTableBasic");
                oTreeTable.expandToLevel(1);
                oTreeTable = this.byId("TreeTableIndustries");
                oTreeTable.expandToLevel(1);
            },

            // Expand the selected cluster on the tree table
            onExpandSelection: function () {
                const oTreeTable = this.byId("TreeTableBasic");
                oTreeTable.expand(oTreeTable.getSelectedIndices());
            },

            // Expand and collapse the side navigation
            onMenuButtonPress: function () {
                var toolPage = this.byId("toolPage");

                toolPage.setSideExpanded(!toolPage.getSideExpanded());
            },


            // button event for triggering the skills select dialog
            onAddSkillsDialog: function (oEvent) {

                if (!this.oDialog) {
                    this.loadFragment({
                        name: "projectskillsappui.fragment.AddSkills"
                    }).then(function (odialog) {
                        this.oDialog = odialog;
                        this.oDialog.open();

                    }.bind(this))
                } else {
                    this.oDialog.open();
                }

            },

            handleClose: function () {
                this.oDialog.destroy();
                this.oDialog = null;
            },

            // Filter for Searching the skills in the select dialog
            handleSearchSkill: function (oEvent) {
                
                var sValue = oEvent.getParameter("value");

                var InputFilter = new Filter({
                    filters: [

                        new Filter({
                            path: 'practice',
                            operator: FilterOperator.Contains,
                            value1: sValue,
                            caseSensitive: false
                        }),
                        new Filter({
                            path: 'JSC',
                            operator: FilterOperator.Contains,
                            value1: sValue,
                            caseSensitive: false
                        }),
                        new Filter({
                            path: 'leaf_skills',
                            operator: FilterOperator.Contains,
                            value1: sValue,
                            caseSensitive: false
                        })

                    ],
                    and: false
                });

                var oBinding = oEvent.getSource().getBinding("items");
                oBinding.filter([InputFilter]);
            },

            // Saving the skill selected through the select dialog into database
            handleSaveSkill: function (oEvent) {

                var oModel = this.getView().getModel("EmployeeModel");
                let oEmpl_skill_fetched_data = oModel.getProperty("/employee_skill_detail/results");

                var url = this.getOwnerComponent().getModel().sServiceUrl;
                var oRequestModel = new sap.ui.model.odata.ODataModel(url);

                var iPS_NO, sJSC, sSkill, sBatchPath;
                var that = this;
                let oAdd_Skills_Payload = {};
                var aBatchChanges = [];
                let aSelected_skill_present = [];
                let bSkillNotPresent = true;
                let changesmade = false;
                let alreadypresent = false;

                iPS_NO = oModel.getData().PS_NO;

                // data of skills selected from the skills select dialog
                var aContexts = oEvent.getParameter("selectedContexts");
                let aLeaf_data = aContexts.map(function (oContext) { return oContext.getObject(); });


                if (aLeaf_data.length > 0) {

                    // loop for checking as well as adding the skills selected from the select dialog
                    for (let i = 0; i < aLeaf_data.length; i++, bSkillNotPresent = true) {

                        // loop for checking presence of cluster and skill
                        for (let j = 0; j < oEmpl_skill_fetched_data.length; j++) {
                            // if seleced skill's cluster is already present
                            if (aLeaf_data[i].JSC === oEmpl_skill_fetched_data[j].JSC) {
                                // if seleced skill is already present
                                if (aLeaf_data[i].leaf_skills === oEmpl_skill_fetched_data[j].skill) {

                                    aSelected_skill_present.push(aLeaf_data[i].leaf_skills);
                                    bSkillNotPresent = false;
                                    alreadypresent = true;
                                    break;
                                }
                            }
                        }

                        // if selected skill not present
                        if (bSkillNotPresent) {

                            iPS_NO = parseInt(iPS_NO);
                            sJSC = encodeURIComponent(aLeaf_data[i].JSC);
                            sSkill = encodeURIComponent(aLeaf_data[i].leaf_skills);

                            //payload for posting new skill into the employee_skill_detail
                            oAdd_Skills_Payload =
                            {
                                "empl_PS_NO": iPS_NO,
                                "JSC": aLeaf_data[i].JSC,
                                "skill": aLeaf_data[i].leaf_skills,
                                "rating": 0,
                                "exp_years": false,
                                "exp_months": false
                            }

                            // pushing element into batchchange array along with the POST operation
                            sBatchPath = "/Employee_Skill_Detail(empl_PS_NO=" + iPS_NO + ",JSC='" + sJSC + "',skill='" + sSkill + "')";
                            aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "PUT", oAdd_Skills_Payload));
                            changesmade = true;
                        }

                    }

                }
                // if selected skill already present
                if (alreadypresent) {
                    MessageBox.alert(" Selected skill(s): " + aSelected_skill_present.join(", ") + " already present");
                }
                // if skills are added
                if (changesmade) {

                    oRequestModel.addBatchChangeOperations(aBatchChanges);
                    oRequestModel.submitBatch(function (oData, oResponse) {
                        // Success callback function
                        if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                            sap.m.MessageBox.success("Skills Added Successfully");
                            that._initializeAsync();
                            that.handleClose();

                        }
                        // Handle the response data
                    }, function (oError) {
                        // Error callback function
                        sap.m.MessageBox.waning("failed");
                        // Handle the error
                    });
                }
                //if no skills were selected from the skills select dialog
                else {

                    MessageBox.information(" No skill(s) selected, Please select some skills", {
                        title: "Delete Record(s)",
                        onClose: function (sAction) {
                            if (sAction === 'OK') {
                                that.onAdd();
                            }
                        }.bind(this),
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction: sap.m.MessageBox.Action.OK,
                    });
                }


            },

            // Permission for deleting existing skills from the database
            onDeleteSkill: function () {

                var that = this;
                var oModel = this.getView().getModel("EmployeeModel");
                var iPS_NO = oModel.getProperty("/PS_NO");

                var oTable = this.getView().byId("TreeTableBasic");
                var aIndices = oTable.getSelectedIndices();            //array indices of the selected records


                if (aIndices.length > 0) {

                    MessageBox.warning("Are you sure you want to delete the selected record(s)?", {
                        title: "Delete Record(s)",
                        onClose: function (sAction) {
                            if (sAction === 'OK') {
                                that.handleDeleteskill(aIndices, iPS_NO, oTable);
                            }
                        }.bind(this),
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction: sap.m.MessageBox.Action.OK,
                    });
                }
                else {
                    MessageBox.information("No record(s) selected");
                }
            },

            // deleting the selected existing skills from the database
            handleDeleteskill: function (aIndices, PS_NO, oTable) {

                var sBatchPath = "", aBatchChanges = [];
                var iPS_NO = parseInt(PS_NO);

                var that = this;

                var url = this.getOwnerComponent().getModel().sServiceUrl;
                var oRequestModel = new sap.ui.model.odata.ODataModel(url);

                // loop for finding that specific skill in the respective cluster
                for (var i = aIndices.length - 1; i >= 0; i--) {

                    var tableContext = oTable.getContextByIndex(aIndices[i]);

                    var sSkillPath = tableContext.getPath();
                    if (sSkillPath.length > 20) {

                        // fetching the skill from the selected record
                        var sSkill = oTable.getModel().getProperty(sSkillPath).skill;

                        // fetching the cluster of the selected skill
                        var sClusterPath = tableContext.getPath().slice(0, -17);
                        var sJSC = oTable.getModel().getProperty(sClusterPath).clust_JSC;

                        sJSC = encodeURIComponent(sJSC);
                        sSkill = encodeURIComponent(sSkill);

                        // pushing element into batchchange array along with the delete operation
                        sBatchPath = "/Employee_Skill_Detail(empl_PS_NO=" + iPS_NO + ",JSC='" + sJSC + "',skill='" + sSkill + "')";
                        aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "DELETE"));
                    }

                }
                oRequestModel.addBatchChangeOperations(aBatchChanges);
                oRequestModel.submitBatch(function (oData, oResponse) {
                    // Success callback function
                    if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                        sap.m.MessageBox.success("Skills Deleted Successfully");
                        that._initializeAsync();
                    }
                    // Handle the response data
                }, function (oError) {
                    // Error callback function
                    sap.m.MessageBox.waning("failed");
                    // Handle the error
                });

            },

            //the properties of the selected row from the tree table are set into editable mode
            onRowSkillSelect: function () {

                var oTable = this.getView().byId("TreeTableBasic");
                var aIndices = oTable.getSelectedIndices();

                let oModel = oTable.getModel();
                let oTreeTable_fetched_data = oModel.getProperty("/cluster_array");

                // for initially setting all the tree table rows to non-editable mode
                for (let i = 0; i < oTreeTable_fetched_data.length; i++) {
                    for (let j = 0; j < oTreeTable_fetched_data[i].employee_skill.length; j++) {
                        var sPath = "/cluster_array/" + i + "/employee_skill/" + j + "/bEditable";
                        oModel.setProperty(sPath, false);
                    }
                }


                //loop for finding and settting editable true to that specific skill
                for (let i = 0; i < aIndices.length; i++) {

                    var tableContext = oTable.getContextByIndex(aIndices[i]);

                    var sPath = tableContext.getPath() + "/bEditable";
                    if (sPath.length > 30) {
                        oModel.setProperty(sPath, true);
                    }
                }
            },

            // Updating all the changes made in the skill tree table to the database
            onSaveSkillChanges: function () {

                var oTable = this.getView().byId("TreeTableBasic");
                var aIndices = oTable.getSelectedIndices();

                if (aIndices.length !== 0) {
                    let oTableModel = oTable.getModel();
                    var that = this;

                    var oMainModel = this.getView().getModel("EmployeeModel");
                    var iPS_NO = oMainModel.getData().PS_NO;

                    var sBatchPath = "", aBatchChanges = [];

                    var url = this.getOwnerComponent().getModel().sServiceUrl;
                    var oRequestModel = new sap.ui.model.odata.ODataModel(url);

                    // payload for updation into the employee_skill_detail
                    var oUpdate_Skills_Payload =
                    {
                        "empl_PS_NO": iPS_NO,
                        "JSC": "",
                        "skill": "",
                        "rating": 0,
                        "exp_years": 0,
                        "exp_months": 0,
                        "bEditable": false
                    }

                    // loop for capturing the selected records from table  
                    for (var i = 0; i < aIndices.length; i++) {

                        var tableContext = oTable.getContextByIndex(aIndices[i]);
                        var sSkillPath = tableContext.getPath();

                        var sClusterPath = sSkillPath.slice(0, -17);

                        if (sSkillPath.length > 30) {

                            var oData = oTableModel.getProperty(sSkillPath);
                            var sJSC = oTableModel.getProperty(sClusterPath).clust_JSC;

                            oUpdate_Skills_Payload =
                            {
                                "empl_PS_NO": iPS_NO,
                                "JSC": sJSC,
                                "skill": oData.skill,
                                "rating": oData.rating,
                                "exp_years": oData.exp_years,
                                "exp_months": oData.exp_months,
                                "bEditable": false
                            }

                            sJSC = encodeURIComponent(sJSC);
                            var sSkill = encodeURIComponent(oData.skill);

                            // pushing element into batchchange array along with the update operation
                            sBatchPath = "/Employee_Skill_Detail(empl_PS_NO=" + iPS_NO + ",JSC='" + sJSC + "',skill='" + sSkill + "')";
                            aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "PUT", oUpdate_Skills_Payload));

                        }
                    }

                    // Update Database Call
                    oRequestModel.addBatchChangeOperations(aBatchChanges);
                    oRequestModel.submitBatch(function (oData, oResponse) {
                        // Success callback function - changes saved to database
                        if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                            sap.m.MessageBox.success("Skills Updated Successfully");
                            oTable.clearSelection();
                            that._initializeAsync();
                        }
                        // Handle the response data
                    }, function (oError) {
                        // Error callback function
                        sap.m.MessageBox.waning("failed");
                        // Handle the error
                    });
                }
                else {
                    MessageBox.information(" No skill(s) selected, Please select some skills");
                }

            },

            // canceling the changes we made, can be done only before saving it to the database
            onCancelSkillChanges: function () {

                var that = this;

                MessageBox.warning("Are you sure you want to discard the changes?", {
                    title: "Discard Record(s)",
                    onClose: function (sAction) {
                        if (sAction === 'OK') {
                            that._initializeAsync();
                        }
                    }.bind(this),
                    actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                    emphasizedAction: sap.m.MessageBox.Action.OK,
                });

            },

            onGeneratePDF: function () {

                var oMainModel = this.getView().getModel("EmployeeModel").getData();

                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();

                doc.text(`Name: ${oMainModel.employee_name}`, 10, 10);
                doc.text(`PS NO: ${oMainModel.PS_NO}`, 10, 20);
                doc.autoTable({ html: '#TreeTableBasic' })
                //doc.save("sample.pdf");

                const pdfBlob = doc.output('blob');
                const pdfUrl = URL.createObjectURL(pdfBlob);

                window.open(pdfUrl, '_blank');

            },

            //----------------------------------------------------------------------------------------------------------------------//
            //                                               EXPERIENCE TAB
            //----------------------------------------------------------------------------------------------------------------------//


            //////////////////////////////////////////////// INDUSTRY EXPERIENCE ////////////////////////////////////////////////////

            _setTreeTableDataIndustries: function () {

                return new Promise((resolve, reject) => {

                    var oModel = this.getView().getModel("EmployeeModel");
                    let oEmpl_Industry_fetched_data = oModel.getProperty("/employee_industries_experience/results");

                    let bClusterNotPresent = true;

                    // tree table JSON Payload
                    var oJSONData = {
                        "industry_cluster_array": []
                    };

                    // industry_cluster_array Payload
                    let oJSONData_clust_array_element =
                    {
                        "clust_industry": "",
                        "employee_industries": [
                            {
                                "ID": "",
                                "industry_type": "",
                                "exp_years": 0,
                                "exp_months": 0,
                                "bEditable": false,
                            }
                        ]
                    };

                    var oJSONData_industries_array_element;

                    // looping for setting data from the employee_skill_detail  into respective cluster and skills
                    for (let i = 0; i < oEmpl_Industry_fetched_data.length; i++, bClusterNotPresent = true) {

                        for (let j = 0; j < oJSONData.industry_cluster_array.length && i > 0; j++) {

                            if (oEmpl_Industry_fetched_data[i].industry_cluster === oJSONData.industry_cluster_array[j].clust_industry) {

                                oJSONData_industries_array_element =
                                {
                                    "ID": oEmpl_Industry_fetched_data[i].ID,
                                    "industry_type": oEmpl_Industry_fetched_data[i].industry_type,
                                    "exp_years": oEmpl_Industry_fetched_data[i].exp_years,
                                    "exp_months": oEmpl_Industry_fetched_data[i].exp_months,
                                    "bEditable": false,
                                }


                                oJSONData.industry_cluster_array[j].employee_industries.push(oJSONData_industries_array_element);
                                bClusterNotPresent = false;
                                break;
                            }
                        }

                        if (bClusterNotPresent) {
                            oJSONData_clust_array_element =
                            {
                                "clust_industry": oEmpl_Industry_fetched_data[i].industry_cluster,
                                "employee_industries": [
                                    {
                                        "ID": oEmpl_Industry_fetched_data[i].ID,
                                        "industry_type": oEmpl_Industry_fetched_data[i].industry_type,
                                        "exp_years": oEmpl_Industry_fetched_data[i].exp_years,
                                        "exp_months": oEmpl_Industry_fetched_data[i].exp_months,
                                        "bEditable": false,
                                    }
                                ]
                            };

                            oJSONData.industry_cluster_array.push(oJSONData_clust_array_element);
                        }


                    }

                    var oTreeModel = new sap.ui.model.json.JSONModel(oJSONData);

                    // setting the treetable model with created JSONModel
                    var oTreeTable = this.getView().byId("TreeTableIndustries");
                    oTreeTable.setModel(oTreeModel);
                    oTreeTable.bindRows({
                        path: "/industry_cluster_array"
                    });
                    resolve();

                });

            },

            // Add Industry experience Dialog
            onAddIndustryExperience: function () {

                if (!this.oDialog) {
                    this.loadFragment({
                        name: "projectskillsappui.fragment.AddIndustryExperience"
                    }).then(function (odialog) {
                        this.oDialog = odialog;
                        this.oDialog.open();

                    }.bind(this))
                } else {
                    this.oDialog.open();
                }

            },

            // Filter for Searching the Industry Type in the select dialog
            handleSearchIndustry: function (oEvent) {
                var sValue = oEvent.getParameter("value");

                var InputFilter = new Filter({
                    filters: [

                        new Filter({
                            path: 'industry_cluster',
                            operator: FilterOperator.Contains,
                            value1: sValue,
                            caseSensitive: false
                        }),
                        new Filter({
                            path: 'industry_type',
                            operator: FilterOperator.Contains,
                            value1: sValue,
                            caseSensitive: false
                        })
                    ],
                    and: false
                });

                var oBinding = oEvent.getSource().getBinding("items");
                oBinding.filter([InputFilter]);
            },

            // Saving the Industry Type selected through the select dialog into database
            handleSaveIndustryExperience: function (oEvent) {

                var oModel = this.getView().getModel("EmployeeModel");
                let oEmpl_skill_fetched_data = oModel.getProperty("/employee_industries_experience/results");

                var url = this.getOwnerComponent().getModel().sServiceUrl;
                var oRequestModel = new sap.ui.model.odata.ODataModel(url);

                var iPS_NO, sBatchPath;
                var that = this;
                let oAdd_Industry_Payload = {};
                var aBatchChanges = [];
                let aSelected_Industry_present = [];
                let bIndustryNotPresent = true;
                let changesmade = false;
                let alreadypresent = false;

                iPS_NO = oModel.getData().PS_NO;

                // data of skills selected from the skills select dialog
                var aContexts = oEvent.getParameter("selectedContexts");
                let aSelected_data = aContexts.map(function (oContext) { return oContext.getObject(); });


                if (aSelected_data.length > 0) {

                    // loop for checking as well as adding the skills selected from the select dialog
                    for (let i = 0; i < aSelected_data.length; i++, bIndustryNotPresent = true) {

                        // loop for checking presence of cluster and skill
                        for (let j = 0; j < oEmpl_skill_fetched_data.length; j++) {
                            // if seleced skill's cluster is already present
                            if (aSelected_data[i].industry_cluster === oEmpl_skill_fetched_data[j].industry_cluster) {
                                // if seleced skill is already present
                                if (aSelected_data[i].industry_type === oEmpl_skill_fetched_data[j].industry_type) {

                                    aSelected_Industry_present.push(aSelected_data[i].industry_type);
                                    bIndustryNotPresent = false;
                                    alreadypresent = true;
                                    break;
                                }
                            }
                        }

                        // if selected skill not present
                        if (bIndustryNotPresent) {

                            iPS_NO = parseInt(iPS_NO);

                            //payload for posting new skill into the employee_skill_detail
                            oAdd_Industry_Payload =
                            {
                                "empl_PS_NO": iPS_NO,
                                "industry_cluster": aSelected_data[i].industry_cluster,
                                "industry_type": aSelected_data[i].industry_type,
                                "exp_years": 0,
                                "exp_months": 0
                            }

                            // pushing element into batchchange array along with the POST operation
                            sBatchPath = "/Employee_Industries_Experience";
                            aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "POST", oAdd_Industry_Payload));
                            changesmade = true;
                        }

                    }

                }
                // if selected skill already present
                if (alreadypresent) {
                    MessageBox.alert(" Selected Industry(s): " + aSelected_Industry_present.join(", ") + " already present");
                }
                // if skills are added
                if (changesmade) {

                    oRequestModel.addBatchChangeOperations(aBatchChanges);
                    oRequestModel.submitBatch(function (oData, oResponse) {
                        // Success callback function
                        if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                            sap.m.MessageBox.success("Industry Experience Added Successfully");
                            that._initializeAsync();
                            that.handleClose();
                        }
                        // Handle the response data
                    }, function (oError) {
                        // Error callback function
                        sap.m.MessageBox.waning("failed");
                        // Handle the error
                    });
                }
                //if no skills were selected from the skills select dialog
                else {

                    MessageBox.information(" No Industry(s) selected, Please select some skills", {
                        title: "Delete Record(s)",
                        onClose: function (sAction) {
                            if (sAction === 'OK') {
                                that.onAddIndustryExperience();
                            }
                        }.bind(this),
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction: sap.m.MessageBox.Action.OK,
                    });
                }


            },

            onDeleteIndustry: function () {

                var that = this;
                var oModel = this.getView().getModel("EmployeeModel");
                var iPS_NO = oModel.getProperty("/PS_NO");

                var oTable = this.getView().byId("TreeTableIndustries");
                var aIndices = oTable.getSelectedIndices();            //array indices of the selected records


                if (aIndices.length > 0) {

                    MessageBox.warning("Are you sure you want to delete the selected record(s)?", {
                        title: "Delete Record(s)",
                        onClose: function (sAction) {
                            if (sAction === 'OK') {
                                that.handleDeleteIndustry(aIndices, iPS_NO, oTable);
                            }
                        }.bind(this),
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction: sap.m.MessageBox.Action.OK,
                    });
                }
                else {
                    MessageBox.information("No record(s) selected");
                }
            },

            // deleting the selected existing skills from the database
            handleDeleteIndustry: function (aIndices, PS_NO, oTable) {

                var sBatchPath = "", aBatchChanges = [];
                var iPS_NO = parseInt(PS_NO);

                var that = this;

                var url = this.getOwnerComponent().getModel().sServiceUrl;
                var oRequestModel = new sap.ui.model.odata.ODataModel(url);

                // loop for finding that specific skill in the respective cluster
                for (var i = aIndices.length - 1; i >= 0; i--) {

                    var tableContext = oTable.getContextByIndex(aIndices[i]);
                    var sIndustryPath = tableContext.getPath();

                    if (sIndustryPath.length > 20) {

                        // fetching the UUID of the selected record
                        var sID = oTable.getModel().getProperty(sIndustryPath).ID;

                        sID = encodeURIComponent(sID);

                        // pushing element into batchchange array along with the delete operation
                        sBatchPath = "/Employee_Industries_Experience(" + sID + ")";
                        aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "DELETE"));
                    }

                }
                oRequestModel.addBatchChangeOperations(aBatchChanges);
                oRequestModel.submitBatch(function (oData, oResponse) {
                    // Success callback function
                    if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                        sap.m.MessageBox.success("Industry experience removed Successfully");
                        that._initializeAsync();
                    }
                    // Handle the response data
                }, function (oError) {
                    // Error callback function
                    sap.m.MessageBox.waning("failed");
                    // Handle the error
                });


            },


            //the properties of the selected row from the tree table are set into editable mode
            onRowIndustrySelect: function () {

                var oTable = this.getView().byId("TreeTableIndustries");
                var aIndices = oTable.getSelectedIndices();
                let oModel = oTable.getModel();
                let oTreeTable_fetched_data = oModel.getProperty("/industry_cluster_array");

                // for initially setting all the tree table rows to non-editable mode
                for (let i = 0; i < oTreeTable_fetched_data.length; i++) {
                    for (let j = 0; j < oTreeTable_fetched_data[i].employee_industries.length; j++) {
                        var sPath = "/industry_cluster_array/" + i + "/employee_industries/" + j + "/bEditable";
                        oModel.setProperty(sPath, false);
                    }
                }

                //loop for finding and settting editable true to that specific skill
                for (let i = 0; i < aIndices.length; i++) {

                    var tableContext = oTable.getContextByIndex(aIndices[i]);

                    var sPath = tableContext.getPath() + "/bEditable";
                    if (sPath.length > 30) {
                        oModel.setProperty(sPath, true);
                    }
                }
            },

            // Updating all the changes made in the skill tree table to the database
            onSaveIndustryChanges: function () {

                var oTable = this.getView().byId("TreeTableIndustries");
                var aIndices = oTable.getSelectedIndices();

                if (aIndices.length !== 0) {
                    let oTableModel = oTable.getModel();
                    var that = this;

                    var oMainModel = this.getView().getModel("EmployeeModel");
                    var iPS_NO = oMainModel.getData().PS_NO;

                    var sBatchPath = "", aBatchChanges = [];

                    var url = this.getOwnerComponent().getModel().sServiceUrl;
                    var oRequestModel = new sap.ui.model.odata.ODataModel(url);

                    // payload for updation into the employee_skill_detail
                    var oUpdate_Industries_Payload =
                    {
                        "empl_PS_NO": iPS_NO,
                        "industry_cluster": "",
                        "industry_type": "",
                        "exp_years": 0,
                        "exp_months": 0,
                        "bEditable": false,
                    }

                    // loop for capturing the selected records from table  
                    for (var i = 0; i < aIndices.length; i++) {

                        var tableContext = oTable.getContextByIndex(aIndices[i]);

                        var sIndustryPath = tableContext.getPath();
                        var sClusterPath = sIndustryPath.slice(0, -22);

                        if (sIndustryPath.length > 30) {

                            var oData = oTableModel.getProperty(sIndustryPath);
                            var sIndustry_Cluster = oTableModel.getProperty(sClusterPath).clust_industry;

                            oUpdate_Industries_Payload =
                            {
                                "empl_PS_NO": iPS_NO,
                                "industry_cluster": sIndustry_Cluster,
                                "industry_type": oData.industry_type,
                                "exp_years": oData.exp_years,
                                "exp_months": oData.exp_months,
                                "bEditable": false,
                            }

                            var sID = encodeURIComponent(oData.ID);

                            //pushing element into batchchange array along with the update operation
                            sBatchPath = "/Employee_Industries_Experience(" + sID + ")";
                            aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "PUT", oUpdate_Industries_Payload));

                        }
                    }

                    // Update Database Call
                    oRequestModel.addBatchChangeOperations(aBatchChanges);
                    oRequestModel.submitBatch(function (oData, oResponse) {
                        // Success callback function - changes saved to database
                        if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                            sap.m.MessageBox.success("Industry experience updated successfully");
                            oTable.clearSelection();
                            that._initializeAsync();
                        }
                        // Handle the response data
                    }, function (oError) {
                        // Error callback function
                        sap.m.MessageBox.waning("failed");
                        // Handle the error
                    });
                }
                else {
                    MessageBox.information(" No Industry(s) selected, Please select some Industries");
                }

            },

            // canceling the changes we made, can be done only before saving it to the database
            onCancelIndustryChanges: function () {

                var that = this;

                MessageBox.warning("Are you sure you want to discard the changes?", {
                    title: "Discard Record(s)",
                    onClose: function (sAction) {
                        if (sAction === 'OK') {
                            that._initializeAsync();
                        }
                    }.bind(this),
                    actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                    emphasizedAction: sap.m.MessageBox.Action.OK,
                });

            },

            /////////////////////////////////////////////////////////////// CUSTOMER TAB ////////////////////////////////////////////////////////////

            onAddCustomerExperience: function () {

                if (!this.oDialog) {
                    this.loadFragment({
                        name: "projectskillsappui.fragment.AddCustomerExperience"
                    }).then(function (odialog) {
                        this.oDialog = odialog;
                        this.oDialog.open();

                    }.bind(this))
                } else {
                    this.oDialog.open();
                }

            },

            handleSaveCustomerExperience: function (oEvent) {

                var oModel = this.getView().getModel("EmployeeModel");
                let oEmpl_customer_fetched_data = oModel.getProperty("/employee_customer_experience/results");

                var url = this.getOwnerComponent().getModel().sServiceUrl;
                var oRequestModel = new sap.ui.model.odata.ODataModel(url);

                var iPS_NO, sBatchPath;
                var that = this;
                let oAdd_Customer_Payload = {};
                var aBatchChanges = [];
                let bCustomerNotPresent = true;
                let changesmade = false;

                iPS_NO = oModel.getData().PS_NO;

                // data of skills selected from the skills select dialog  //
                var oComboBox = this.getView().byId("comboBoxCustomer");
                var sCustomer_name = oComboBox.getValue();


                if (sCustomer_name) {

                    for (let j = 0; j < oEmpl_customer_fetched_data.length; j++) {
                        // if selected product is already present
                        if (sCustomer_name === oEmpl_customer_fetched_data[j].customer_name) {

                            bCustomerNotPresent = false;
                            break;
                        }
                    }

                    // if selected skill not present
                    if (bCustomerNotPresent) {

                        iPS_NO = parseInt(iPS_NO);

                        //payload for posting new skill into the employee_skill_detail
                        oAdd_Customer_Payload =
                        {
                            "empl_PS_NO": iPS_NO,
                            "customer_name": sCustomer_name,
                            "exp_years": 0,
                            "exp_months": 0,
                            "bEditable": false
                        }

                        // pushing element into batchchange array along with the POST operation
                        sBatchPath = "/Employee_Customer_Experience";
                        aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "POST", oAdd_Customer_Payload));
                        changesmade = true;
                    }
                    // if selected skill already present
                    else {
                        MessageBox.alert(" Selected product(s): " + sCustomer_name + " already present");
                    }

                    // if skills are added
                    if (changesmade) {

                        oRequestModel.addBatchChangeOperations(aBatchChanges);
                        oRequestModel.submitBatch(function (oData, oResponse) {
                            // Success callback function
                            if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                                sap.m.MessageBox.success("Customer experience added successfully");
                                that._initializeAsync();
                            }
                            // Handle the response data
                        }, function (oError) {
                            // Error callback function
                            sap.m.MessageBox.waning("failed");
                            // Handle the error
                        });
                    }

                }

                //if no skills were selected from the skills select dialog
                else {

                    MessageBox.information(" No Customer selected, Please select One", {
                        title: "Select Record(s)",
                        onClose: function (sAction) {
                            if (sAction === 'OK') {
                                that.onAddCustomerExperience();
                            }
                        }.bind(this),
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction: sap.m.MessageBox.Action.OK,
                    });
                }


            },

            onDeleteCustomer: function () {

                var that = this;
                var oModel = this.getView().getModel("EmployeeModel");
                var iPS_NO = oModel.getProperty("/PS_NO");

                var oTable = this.getView().byId("tableCustomerExperience");
                var aIndices = oTable.getSelectedItems();            //array indices of the selected records


                if (aIndices.length > 0) {

                    MessageBox.warning("Are you sure you want to delete the selected record(s)?", {
                        title: "Delete Record(s)",
                        onClose: function (sAction) {
                            if (sAction === 'OK') {
                                that.handleDeleteCustomer(aIndices);
                            }
                        }.bind(this),
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction: sap.m.MessageBox.Action.OK,
                    });
                }
                else {
                    MessageBox.information("No record(s) selected");
                }
            },

            // deleting the selected existing skills from the database
            handleDeleteCustomer: function (aIndices) {

                var sBatchPath = "", aBatchChanges = [];

                var that = this;

                var url = this.getOwnerComponent().getModel().sServiceUrl;
                var oRequestModel = new sap.ui.model.odata.ODataModel(url);

                // loop for finding that specific skill in the respective cluster
                for (var i = aIndices.length - 1; i >= 0; i--) {

                    // fetching the UUID of the selected record
                    var sID = aIndices[i].getBindingContext("EmployeeModel").getProperty("ID");

                    sID = encodeURIComponent(sID);

                    // pushing element into batchchange array along with the delete operation
                    sBatchPath = "/Employee_Customer_Experience(" + sID + ")";
                    aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "DELETE"));

                }
                oRequestModel.addBatchChangeOperations(aBatchChanges);
                oRequestModel.submitBatch(function (oData, oResponse) {
                    // Success callback function
                    if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                        sap.m.MessageBox.success("Customer experience removed successfully");
                        that._initializeAsync();
                    }
                    // Handle the response data
                }, function (oError) {
                    // Error callback function
                    sap.m.MessageBox.waning("failed");
                    // Handle the error
                });


            },


            //the properties of the selected row from the tree table are set into editable mode
            onRowCustomerSelect: function (oEvent) {

                var oTable = this.getView().byId("tableCustomerExperience");
                var aIndices = oTable.getSelectedItems();

                let oModel = this.getView().getModel("EmployeeModel");
                let oTable_fetched_data = oModel.getProperty("/employee_customer_experience/results");

                // for initially setting all the table rows to non-editable mode
                for (let i = 0; i < oTable_fetched_data.length; i++) {
                    var sPath = "/employee_customer_experience/results/" + i + "/bEditable";
                    oModel.setProperty(sPath, false);
                }

                //loop for finding and settting editable true to that specific skill
                for (let i = 0; i < aIndices.length; i++) {
                    aIndices[i].getBindingContext("EmployeeModel").setProperty("bEditable", true);
                }
            },

            // Updating all the changes made in the skill tree table to the database
            onSaveCustomerChanges: function () {

                var oTable = this.getView().byId("tableCustomerExperience");
                var aIndices = oTable.getSelectedItems();

                var that = this;

                var oMainModel = this.getView().getModel("EmployeeModel");
                var iPS_NO = oMainModel.getData().PS_NO;

                var sBatchPath = "", aBatchChanges = [];

                var url = this.getOwnerComponent().getModel().sServiceUrl;
                var oRequestModel = new sap.ui.model.odata.ODataModel(url);

                // payload for updation into the employee_skill_detail
                var oUpdate_Customer_Payload =
                {
                    "empl_PS_NO": iPS_NO,
                    "customer_name": "",
                    "exp_years": 0,
                    "exp_months": 0,
                    "bEditable": false,
                }

                if (aIndices.length !== 0) {

                    // loop for capturing the selected records from table  
                    for (var i = 0; i < aIndices.length; i++) {

                        var oData = aIndices[i].getBindingContext("EmployeeModel").getObject();

                        oUpdate_Customer_Payload =
                        {
                            "empl_PS_NO": iPS_NO,
                            "customer_name": oData.customer_name,
                            "exp_years": oData.exp_years,
                            "exp_months": oData.exp_months,
                            "bEditable": false,
                        }

                        var sID = encodeURIComponent(oData.ID);

                        //pushing element into batchchange array along with the update operation
                        sBatchPath = "/Employee_Customer_Experience(" + sID + ")";
                        aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "PUT", oUpdate_Customer_Payload));

                    }

                    // Update Database Call
                    oRequestModel.addBatchChangeOperations(aBatchChanges);
                    oRequestModel.submitBatch(function (oData, oResponse) {
                        // Success callback function - changes saved to database
                        if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                            sap.m.MessageBox.success("Customer(s) experience updated successfully");
                            oTable.removeSelections();
                            that._initializeAsync();
                            that.handleClose();
                        }
                        // Handle the response data
                    }, function (oError) {
                        // Error callback function
                        sap.m.MessageBox.waning("failed");
                        // Handle the error
                    });

                }
                else {
                    MessageBox.information("No Customer(s) selected, Please select some if you want to Update");
                }

            },

            // canceling the changes we made, can be done only before saving it to the database
            onCancelCustomerChanges: function () {

                var that = this;

                MessageBox.warning("Are you sure you want to discard the changes?", {
                    title: "Discard Record(s)",
                    onClose: function (sAction) {
                        if (sAction === 'OK') {
                            that._initializeAsync();
                            that.handleClose();
                        }
                    }.bind(this),
                    actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                    emphasizedAction: sap.m.MessageBox.Action.OK,
                });

            },

            /////////////////////////////////////////////////////////////// PRODUCT TAB ////////////////////////////////////////////////////////////


            onAddProductExperience: function () {

                if (!this.oDialog) {
                    this.loadFragment({
                        name: "projectskillsappui.fragment.AddProductExperience"
                    }).then(function (odialog) {
                        this.oDialog = odialog;
                        this.oDialog.open();

                    }.bind(this))
                } else {
                    this.oDialog.open();
                }

            },

            // Filter for Searching the Industry Type in the select dialog
            handleSearchProduct: function (oEvent) {
                var sValue = oEvent.getParameter("value");

                var InputFilter = new Filter({
                    filters: [

                        new Filter({
                            path: 'product_name',
                            operator: FilterOperator.Contains,
                            value1: sValue,
                            caseSensitive: false
                        })
                    ],
                    and: false
                });

                var oBinding = oEvent.getSource().getBinding("items");
                oBinding.filter([InputFilter]);
            },


            // Saving the Industry Type selected through the select dialog into database
            handleSaveProductExperience: function (oEvent) {

                var oModel = this.getView().getModel("EmployeeModel");
                let oEmpl_product_fetched_data = oModel.getProperty("/employee_product_experience/results");

                var url = this.getOwnerComponent().getModel().sServiceUrl;
                var oRequestModel = new sap.ui.model.odata.ODataModel(url);

                var iPS_NO, sBatchPath;
                var that = this;
                let oAdd_Product_Payload = {};
                var aBatchChanges = [];
                let aSelected_Product_present = [];
                let bProductNotPresent = true;
                let changesmade = false;
                let alreadypresent = false;

                iPS_NO = oModel.getData().PS_NO;

                // data of skills selected from the skills select dialog
                var aContexts = oEvent.getParameter("selectedContexts");
                let aSelected_data = aContexts.map(function (oContext) { return oContext.getObject(); });


                if (aSelected_data.length > 0) {

                    // loop for checking as well as adding the skills selected from the select dialog
                    for (let i = 0; i < aSelected_data.length; i++, bProductNotPresent = true) {

                        // loop for checking presence of cluster and skill
                        for (let j = 0; j < oEmpl_product_fetched_data.length; j++) {
                            // if selected product is already present
                            if (aSelected_data[i].product_name === oEmpl_product_fetched_data[j].product_name) {

                                aSelected_Product_present.push(aSelected_data[i].product_name);
                                bProductNotPresent = false;
                                alreadypresent = true;
                                break;

                            }
                        }

                        // if selected skill not present
                        if (bProductNotPresent) {

                            iPS_NO = parseInt(iPS_NO);

                            //payload for posting new skill into the employee_skill_detail
                            oAdd_Product_Payload =
                            {
                                "empl_PS_NO": iPS_NO,
                                "product_name": aSelected_data[i].product_name,
                                "exp_years": 0,
                                "exp_months": 0,
                                "bEditable": false
                            }

                            // pushing element into batchchange array along with the POST operation
                            sBatchPath = "/Employee_Product_Experience";
                            aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "POST", oAdd_Product_Payload));
                            changesmade = true;
                        }

                    }

                }
                // if selected skill already present
                if (alreadypresent) {
                    MessageBox.alert(" Selected product(s): " + aSelected_Product_present.join(", ") + " already present");
                }
                // if skills are added
                if (changesmade) {

                    oRequestModel.addBatchChangeOperations(aBatchChanges);
                    oRequestModel.submitBatch(function (oData, oResponse) {
                        // Success callback function
                        if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                            sap.m.MessageBox.success("Product experience added successfully");
                            that._initializeAsync();
                            that.handleClose();
                        }
                        // Handle the response data
                    }, function (oError) {
                        // Error callback function
                        sap.m.MessageBox.waning("failed");
                        // Handle the error
                    });
                }
                //if no skills were selected from the skills select dialog
                else {

                    MessageBox.information(" No product(s) selected, Please select some skills", {
                        title: "Select Record(s)",
                        onClose: function (sAction) {
                            if (sAction === 'OK') {
                                that.onAddProductExperience();
                            }
                        }.bind(this),
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction: sap.m.MessageBox.Action.OK,
                    });
                }


            },

            onDeleteProduct: function () {

                var that = this;
                var oModel = this.getView().getModel("EmployeeModel");
                var iPS_NO = oModel.getProperty("/PS_NO");

                var oTable = this.getView().byId("tableProductExperience");
                var aIndices = oTable.getSelectedItems();            //array indices of the selected records


                if (aIndices.length > 0) {

                    MessageBox.warning("Are you sure you want to delete the selected record(s)?", {
                        title: "Delete Record(s)",
                        onClose: function (sAction) {
                            if (sAction === 'OK') {
                                that.handleDeleteProduct(aIndices, iPS_NO);
                            }
                        }.bind(this),
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction: sap.m.MessageBox.Action.OK,
                    });
                }
                else {
                    MessageBox.information("No record(s) selected");
                }
            },

            // deleting the selected existing skills from the database
            handleDeleteProduct: function (aIndices, PS_NO) {

                var sBatchPath = "", aBatchChanges = [];
                var iPS_NO = parseInt(PS_NO);

                var that = this;

                var url = this.getOwnerComponent().getModel().sServiceUrl;
                var oRequestModel = new sap.ui.model.odata.ODataModel(url);

                // loop for finding that specific skill in the respective cluster
                for (var i = aIndices.length - 1; i >= 0; i--) {

                    // fetching the UUID of the selected record
                    var sID = aIndices[i].getBindingContext("EmployeeModel").getProperty("ID");

                    sID = encodeURIComponent(sID);

                    // pushing element into batchchange array along with the delete operation
                    sBatchPath = "/Employee_Product_Experience(" + sID + ")";
                    aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "DELETE"));

                }
                oRequestModel.addBatchChangeOperations(aBatchChanges);
                oRequestModel.submitBatch(function (oData, oResponse) {
                    // Success callback function
                    if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                        sap.m.MessageBox.success("Product experience removed successfully");
                        that._initializeAsync();
                    }
                    // Handle the response data
                }, function (oError) {
                    // Error callback function
                    sap.m.MessageBox.waning("failed");
                    // Handle the error
                });


            },


            //the properties of the selected row from the tree table are set into editable mode
            onRowProductSelect: function (oEvent) {

                var oTable = this.getView().byId("tableProductExperience");
                var aIndices = oTable.getSelectedItems();

                let oModel = this.getView().getModel("EmployeeModel");
                let oTable_fetched_data = oModel.getProperty("/employee_product_experience/results");

                // for initially setting all the table rows to non-editable mode
                for (let i = 0; i < oTable_fetched_data.length; i++) {
                    var sPath = "/employee_product_experience/results/" + i + "/bEditable";
                    oModel.setProperty(sPath, false);
                }

                //loop for finding and settting editable true to that specific skill
                for (let i = 0; i < aIndices.length; i++) {
                    aIndices[i].getBindingContext("EmployeeModel").setProperty("bEditable", true);
                }
            },

            // Updating all the changes made in the skill tree table to the database
            onSaveProductChanges: function () {

                var oTable = this.getView().byId("tableProductExperience");
                var aIndices = oTable.getSelectedItems();

                if (aIndices.length !== 0) {
                    var that = this;

                    var oMainModel = this.getView().getModel("EmployeeModel");
                    var iPS_NO = oMainModel.getData().PS_NO;

                    var sBatchPath = "", aBatchChanges = [];

                    var url = this.getOwnerComponent().getModel().sServiceUrl;
                    var oRequestModel = new sap.ui.model.odata.ODataModel(url);

                    // payload for updation into the employee_skill_detail
                    var oUpdate_Product_Payload =
                    {
                        "empl_PS_NO": iPS_NO,
                        "product_name": "",
                        "exp_years": 0,
                        "exp_months": 0,
                        "bEditable": false,
                    }

                    // loop for capturing the selected records from table  
                    for (var i = 0; i < aIndices.length; i++) {

                        var oData = aIndices[i].getBindingContext("EmployeeModel").getObject();

                        oUpdate_Product_Payload =
                        {
                            "empl_PS_NO": iPS_NO,
                            "product_name": oData.product_name,
                            "exp_years": oData.exp_years,
                            "exp_months": oData.exp_months,
                            "bEditable": false,
                        }

                        var sID = encodeURIComponent(oData.ID);

                        //pushing element into batchchange array along with the update operation
                        sBatchPath = "/Employee_Product_Experience(" + sID + ")";
                        aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "PUT", oUpdate_Product_Payload));

                    }

                    // Update Database Call
                    oRequestModel.addBatchChangeOperations(aBatchChanges);
                    oRequestModel.submitBatch(function (oData, oResponse) {
                        // Success callback function - changes saved to database
                        if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                            sap.m.MessageBox.success("Product(s) experience updated successfully");
                            oTable.removeSelections();
                            that._initializeAsync();
                        }
                        // Handle the response data
                    }, function (oError) {
                        // Error callback function
                        sap.m.MessageBox.waning("failed");
                        // Handle the error
                    });
                }
                else {
                    MessageBox.information(" No Product(s) selected, Please select some skills");
                }

            },

            // canceling the changes we made, can be done only before saving it to the database
            onCancelProductChanges: function () {

                var that = this;

                MessageBox.warning("Are you sure you want to discard the changes?", {
                    title: "Discard Record(s)",
                    onClose: function (sAction) {
                        if (sAction === 'OK') {
                            that._initializeAsync();
                        }
                    }.bind(this),
                    actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                    emphasizedAction: sap.m.MessageBox.Action.OK,
                });

            },

            /////////////////////////////////////////////////////////// LANGUAGE TAB ////////////////////////////////////////////////////////////


            onAddlanguageExperience: function () {

                if (!this.oDialog) {
                    this.loadFragment({
                        name: "projectskillsappui.fragment.AddLanguage"
                    }).then(function (odialog) {
                        this.oDialog = odialog;
                        this.oDialog.open();

                    }.bind(this))
                } else {
                    this.oDialog.open();
                }

            },

            // Filter for Searching the Industry Type in the select dialog
            handleSearchLanguage: function (oEvent) {
                var sValue = oEvent.getParameter("value");

                var InputFilter = new Filter({
                    filters: [

                        new Filter({
                            path: 'language',
                            operator: FilterOperator.Contains,
                            value1: sValue,
                            caseSensitive: false
                        })
                    ],
                    and: false
                });

                var oBinding = oEvent.getSource().getBinding("items");
                oBinding.filter([InputFilter]);
            },


            // Saving the Industry Type selected through the select dialog into database
            handleSaveLanguageExperience: function (oEvent) {

                var oModel = this.getView().getModel("EmployeeModel");
                let oEmpl_language_fetched_data = oModel.getProperty("/employee_language_experience/results");

                var url = this.getOwnerComponent().getModel().sServiceUrl;
                var oRequestModel = new sap.ui.model.odata.ODataModel(url);

                var iPS_NO, sBatchPath;
                var that = this;
                let oAdd_Language_Payload = {};
                var aBatchChanges = [];
                let aSelected_Language_present = [];
                let bLanguageNotPresent = true;
                let changesmade = false;
                let alreadypresent = false;

                iPS_NO = oModel.getData().PS_NO;

                // data of skills selected from the skills select dialog
                var aContexts = oEvent.getParameter("selectedContexts");
                let aSelected_data = aContexts.map(function (oContext) { return oContext.getObject(); });


                if (aSelected_data.length > 0) {

                    // loop for checking as well as adding the skills selected from the select dialog
                    for (let i = 0; i < aSelected_data.length; i++, bLanguageNotPresent = true) {

                        if (oEmpl_language_fetched_data) {

                            // loop for checking presence of cluster and skill
                            for (let j = 0; j < oEmpl_language_fetched_data.length; j++) {

                                // if selected product is already present
                                if (aSelected_data[i].language === oEmpl_language_fetched_data[j].language) {

                                    aSelected_Language_present.push(aSelected_data[i].language);
                                    bLanguageNotPresent = false;
                                    alreadypresent = true;
                                    break;

                                }
                            }
                        }

                        // if selected skill not present
                        if (bLanguageNotPresent) {

                            iPS_NO = parseInt(iPS_NO);

                            //payload for posting new skill into the employee_skill_detail
                            oAdd_Language_Payload =
                            {
                                "empl_PS_NO": iPS_NO,
                                "language": aSelected_data[i].language,
                                "proficiency_rating": 0,
                                "bEditable": false
                            }

                            // pushing element into batchchange array along with the POST operation
                            sBatchPath = "/Employee_Language_Experience";
                            aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "POST", oAdd_Language_Payload));
                            changesmade = true;
                        }

                    }

                }
                // if selected skill already present
                if (alreadypresent) {
                    MessageBox.alert(" Selected Language(s): " + aSelected_Language_present.join(", ") + " already present");
                }
                // if skills are added
                if (changesmade) {

                    oRequestModel.addBatchChangeOperations(aBatchChanges);
                    oRequestModel.submitBatch(function (oData, oResponse) {
                        // Success callback function
                        if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                            sap.m.MessageBox.success("Language Added Successfully");
                            that._initializeAsync();
                            that.handleClose();
                        }
                        // Handle the response data
                    }, function (oError) {
                        // Error callback function
                        sap.m.MessageBox.waning("failed");
                        // Handle the error
                    });
                }
                //if no skills were selected from the skills select dialog
                else {

                    MessageBox.information(" No Language(s) selected, Please select some skills", {
                        title: "Select Record(s)",
                        onClose: function (sAction) {
                            if (sAction === 'OK') {
                                that.onAddlanguageExperience();
                            }
                        }.bind(this),
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction: sap.m.MessageBox.Action.OK,
                    });
                }


            },

            onDeletelanguage: function () {

                var that = this;

                var oTable = this.getView().byId("tableLanguageProfeciency");
                var aIndices = oTable.getSelectedItems();            //array indices of the selected records

                if (aIndices.length > 0) {

                    MessageBox.warning("Are you sure you want to delete the selected record(s)?", {
                        title: "Delete Record(s)",
                        onClose: function (sAction) {
                            if (sAction === 'OK') {
                                that.handleDeleteLanguage(aIndices);
                            }
                        }.bind(this),
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction: sap.m.MessageBox.Action.OK,
                    });
                }
                else {
                    MessageBox.information("No record(s) selected");
                }
            },

            // deleting the selected existing skills from the database
            handleDeleteLanguage: function (aIndices) {

                var sBatchPath = "", aBatchChanges = [];

                var that = this;

                var url = this.getOwnerComponent().getModel().sServiceUrl;
                var oRequestModel = new sap.ui.model.odata.ODataModel(url);

                // loop for finding that specific skill in the respective cluster
                for (var i = aIndices.length - 1; i >= 0; i--) {

                    // fetching the UUID of the selected record
                    var sID = aIndices[i].getBindingContext("EmployeeModel").getProperty("ID");

                    sID = encodeURIComponent(sID);

                    // pushing element into batchchange array along with the delete operation
                    sBatchPath = "/Employee_Language_Experience(" + sID + ")";
                    aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "DELETE"));

                }
                oRequestModel.addBatchChangeOperations(aBatchChanges);
                oRequestModel.submitBatch(function (oData, oResponse) {
                    // Success callback function
                    if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                        sap.m.MessageBox.success("Language removed successfully");
                        that._initializeAsync();
                    }
                    // Handle the response data
                }, function (oError) {
                    // Error callback function
                    sap.m.MessageBox.waning("failed");
                    // Handle the error
                });


            },


            //the properties of the selected row from the tree table are set into editable mode
            onRowlanguageSelect: function (oEvent) {

                var oTable = this.getView().byId("tableLanguageProfeciency");
                var aIndices = oTable.getSelectedItems();

                let oModel = this.getView().getModel("EmployeeModel");
                let oTable_fetched_data = oModel.getProperty("/employee_language_experience/results");

                // for initially setting all the table rows to non-editable mode
                for (let i = 0; i < oTable_fetched_data.length; i++) {
                    var sPath = "/employee_language_experience/results/" + i + "/bEditable";
                    oModel.setProperty(sPath, false);
                }

                //loop for finding and settting editable true to that specific skill
                for (let i = 0; i < aIndices.length; i++) {
                    aIndices[i].getBindingContext("EmployeeModel").setProperty("bEditable", true);
                }
            },

            // Updating all the changes made in the skill tree table to the database
            onSavelanguageChanges: function () {

                var oTable = this.getView().byId("tableLanguageProfeciency");
                var aIndices = oTable.getSelectedItems();

                if (aIndices.length !== 0) {
                    var that = this;

                    var oMainModel = this.getView().getModel("EmployeeModel");
                    var iPS_NO = oMainModel.getData().PS_NO;

                    var sBatchPath = "", aBatchChanges = [];

                    var url = this.getOwnerComponent().getModel().sServiceUrl;
                    var oRequestModel = new sap.ui.model.odata.ODataModel(url);

                    // payload for updation into the employee_skill_detail
                    var oUpdate_Language_Payload =
                    {
                        "empl_PS_NO": iPS_NO,
                        "language": "",
                        "proficiency_rating": 0,
                        "bEditable": false,
                    }

                    // loop for capturing the selected records from table  
                    for (var i = 0; i < aIndices.length; i++) {

                        var oData = aIndices[i].getBindingContext("EmployeeModel").getObject();

                        oUpdate_Language_Payload =
                        {
                            "empl_PS_NO": iPS_NO,
                            "language": oData.language,
                            "proficiency_rating": oData.proficiency_rating,
                            "bEditable": false,
                        }

                        var sID = encodeURIComponent(oData.ID);

                        //pushing element into batchchange array along with the update operation
                        sBatchPath = "/Employee_Language_Experience(" + sID + ")";
                        aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "PUT", oUpdate_Language_Payload));

                    }

                    // Update Database Call
                    oRequestModel.addBatchChangeOperations(aBatchChanges);
                    oRequestModel.submitBatch(function (oData, oResponse) {
                        // Success callback function - changes saved to database
                        if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                            sap.m.MessageBox.success("Language(s) experience updated successfully");
                            oTable.removeSelections();
                            that._initializeAsync();
                        }
                        // Handle the response data
                    }, function (oError) {
                        // Error callback function
                        sap.m.MessageBox.waning("failed");
                        // Handle the error
                    });
                }
                else {
                    MessageBox.information(" No Language(s) selected, Please select some skills");
                }

            },

            // canceling the changes we made, can be done only before saving it to the database
            onCancelLanguageChanges: function () {

                var that = this;

                MessageBox.warning("Are you sure you want to discard the changes?", {
                    title: "Discard Record(s)",
                    onClose: function (sAction) {
                        if (sAction === 'OK') {
                            that._initializeAsync();
                        }
                    }.bind(this),
                    actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                    emphasizedAction: sap.m.MessageBox.Action.OK,
                });

            },


            /////////////////////////////////////////////////////////// COUNTRY TAB ////////////////////////////////////////////////////////////


            onAddCountryExperience: function () {

                if (!this.oDialog) {
                    this.loadFragment({
                        name: "projectskillsappui.fragment.AddCountryExperience"
                    }).then(function (odialog) {
                        this.oDialog = odialog;
                        this.oDialog.open();

                    }.bind(this))
                } else {
                    this.oDialog.open();
                }

            },

            // Filter for Searching the Industry Type in the select dialog
            handleSearchCountry: function (oEvent) {
                var sValue = oEvent.getParameter("value");

                var InputFilter = new Filter({
                    filters: [

                        new Filter({
                            path: 'country_name',
                            operator: FilterOperator.Contains,
                            value1: sValue,
                            caseSensitive: false
                        })
                    ],
                    and: false
                });

                var oBinding = oEvent.getSource().getBinding("items");
                oBinding.filter([InputFilter]);
            },


            // Saving the Industry Type selected through the select dialog into database
            handleSaveCountryExperience: function (oEvent) {

                var oModel = this.getView().getModel("EmployeeModel");
                let oEmpl_country_fetched_data = oModel.getProperty("/employee_country_experience/results");

                var url = this.getOwnerComponent().getModel().sServiceUrl;
                var oRequestModel = new sap.ui.model.odata.ODataModel(url);

                var iPS_NO, sBatchPath;
                var that = this;
                let oAdd_Country_Payload = {};
                var aBatchChanges = [];
                let aSelected_Country_present = [];
                let bCountryNotPresent = true;
                let changesmade = false;
                let alreadypresent = false;

                iPS_NO = oModel.getData().PS_NO;

                // data of skills selected from the skills select dialog
                var aContexts = oEvent.getParameter("selectedContexts");
                let aSelected_data = aContexts.map(function (oContext) { return oContext.getObject(); });


                if (aSelected_data.length > 0) {

                    // loop for checking as well as adding the skills selected from the select dialog
                    for (let i = 0; i < aSelected_data.length; i++, bCountryNotPresent = true) {

                        if (oEmpl_country_fetched_data) {

                            // loop for checking presence of cluster and skill
                            for (let j = 0; j < oEmpl_country_fetched_data.length; j++) {

                                // if selected product is already present
                                if (aSelected_data[i].country_name === oEmpl_country_fetched_data[j].country_name) {

                                    aSelected_Country_present.push(aSelected_data[i].country_name);
                                    bCountryNotPresent = false;
                                    alreadypresent = true;
                                    break;

                                }
                            }
                        }

                        // if selected skill not present
                        if (bCountryNotPresent) {

                            iPS_NO = parseInt(iPS_NO);

                            //payload for posting new skill into the employee_skill_detail
                            oAdd_Country_Payload =
                            {
                                "empl_PS_NO": iPS_NO,
                                "country_name": aSelected_data[i].country_name,
                                "country_flag": aSelected_data[i].country_flag,
                                "exp_years": 0,
                                "exp_months": 0,
                                "bEditable": false
                            }

                            // pushing element into batchchange array along with the POST operation
                            sBatchPath = "/Employee_Country_Experience";
                            aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "POST", oAdd_Country_Payload));
                            changesmade = true;
                        }

                    }

                }
                // if selected skill already present
                if (alreadypresent) {
                    MessageBox.alert(" Selected Country(s): " + aSelected_Country_present.join(", ") + " already present");
                }
                // if skills are added
                if (changesmade) {

                    oRequestModel.addBatchChangeOperations(aBatchChanges);
                    oRequestModel.submitBatch(function (oData, oResponse) {
                        // Success callback function
                        if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                            sap.m.MessageBox.success("Country Added Successfully");
                            that._initializeAsync();
                            that.handleClose();
                        }
                        // Handle the response data
                    }, function (oError) {
                        // Error callback function
                        sap.m.MessageBox.waning("failed");
                        // Handle the error
                    });
                }
                //if no skills were selected from the skills select dialog
                else {

                    MessageBox.information(" No Country(s) selected, Please select some skills", {
                        title: "Select Record(s)",
                        onClose: function (sAction) {
                            if (sAction === 'OK') {
                                that.onAddProductExperience();
                            }
                        }.bind(this),
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction: sap.m.MessageBox.Action.OK,
                    });
                }


            },

            onDeleteCountry: function () {

                var that = this;

                var oTable = this.getView().byId("tableCountryExperience");
                var aIndices = oTable.getSelectedItems();            //array indices of the selected records


                if (aIndices.length > 0) {

                    MessageBox.warning("Are you sure you want to delete the selected record(s)?", {
                        title: "Delete Record(s)",
                        onClose: function (sAction) {
                            if (sAction === 'OK') {
                                that.handleDeleteCountry(aIndices);
                            }
                        }.bind(this),
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction: sap.m.MessageBox.Action.OK,
                    });
                }
                else {
                    MessageBox.information("No record(s) selected");
                }
            },

            // deleting the selected existing skills from the database
            handleDeleteCountry: function (aIndices) {

                var sBatchPath = "", aBatchChanges = [];

                var that = this;

                var url = this.getOwnerComponent().getModel().sServiceUrl;
                var oRequestModel = new sap.ui.model.odata.ODataModel(url);

                // loop for finding that specific skill in the respective cluster
                for (var i = aIndices.length - 1; i >= 0; i--) {

                    // fetching the UUID of the selected record
                    var sID = aIndices[i].getBindingContext("EmployeeModel").getProperty("ID");

                    sID = encodeURIComponent(sID);

                    // pushing element into batchchange array along with the delete operation
                    sBatchPath = "/Employee_Country_Experience(" + sID + ")";
                    aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "DELETE"));

                }
                oRequestModel.addBatchChangeOperations(aBatchChanges);
                oRequestModel.submitBatch(function (oData, oResponse) {
                    // Success callback function
                    if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                        sap.m.MessageBox.success("Country experience removed successfully");
                        that._initializeAsync();
                    }
                    // Handle the response data
                }, function (oError) {
                    // Error callback function
                    sap.m.MessageBox.waning("failed");
                    // Handle the error
                });


            },


            //the properties of the selected row from the tree table are set into editable mode
            onRowCountrySelect: function (oEvent) {

                var oTable = this.getView().byId("tableCountryExperience");
                var aIndices = oTable.getSelectedItems();

                let oModel = this.getView().getModel("EmployeeModel");
                let oTable_fetched_data = oModel.getProperty("/employee_country_experience/results");

                // for initially setting all the table rows to non-editable mode
                for (let i = 0; i < oTable_fetched_data.length; i++) {
                    var sPath = "/employee_country_experience/results/" + i + "/bEditable";
                    oModel.setProperty(sPath, false);
                }

                //loop for finding and settting editable true to that specific skill
                for (let i = 0; i < aIndices.length; i++) {
                    aIndices[i].getBindingContext("EmployeeModel").setProperty("bEditable", true);
                }
            },

            // Updating all the changes made in the skill tree table to the database
            onSaveCountryChanges: function () {

                var oTable = this.getView().byId("tableCountryExperience");
                var aIndices = oTable.getSelectedItems();

                if (aIndices.length !== 0) {
                    var that = this;

                    var oMainModel = this.getView().getModel("EmployeeModel");
                    var iPS_NO = oMainModel.getData().PS_NO;

                    var sBatchPath = "", aBatchChanges = [];

                    var url = this.getOwnerComponent().getModel().sServiceUrl;
                    var oRequestModel = new sap.ui.model.odata.ODataModel(url);

                    // payload for updation into the employee_skill_detail
                    var oUpdate_Country_Payload =
                    {
                        "empl_PS_NO": iPS_NO,
                        "country_name": "",
                        "country_flag": "",
                        "exp_years": 0,
                        "exp_months": 0,
                        "bEditable": false,
                    }

                    // loop for capturing the selected records from table  
                    for (var i = 0; i < aIndices.length; i++) {

                        var oData = aIndices[i].getBindingContext("EmployeeModel").getObject();

                        oUpdate_Country_Payload =
                        {
                            "empl_PS_NO": iPS_NO,
                            "country_name": oData.country_name,
                            "country_flag": oData.country_flag,
                            "exp_years": oData.exp_years,
                            "exp_months": oData.exp_months,
                            "bEditable": false,
                        }

                        var sID = encodeURIComponent(oData.ID);

                        //pushing element into batchchange array along with the update operation
                        sBatchPath = "/Employee_Country_Experience(" + sID + ")";
                        aBatchChanges.push(oRequestModel.createBatchOperation(sBatchPath, "PUT", oUpdate_Country_Payload));

                    }

                    // Update Database Call
                    oRequestModel.addBatchChangeOperations(aBatchChanges);
                    oRequestModel.submitBatch(function (oData, oResponse) {
                        // Success callback function - changes saved to database
                        if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                            sap.m.MessageBox.success("Country(s) experience updated successfully");
                            oTable.removeSelections();
                            that._initializeAsync();
                        }
                        // Handle the response data
                    }, function (oError) {
                        // Error callback function
                        sap.m.MessageBox.waning("failed");
                        // Handle the error
                    });
                }
                else {
                    MessageBox.information(" No Country(s) selected, Please select some skills");
                }

            },

            // canceling the changes we made, can be done only before saving it to the database
            onCancelCountryChanges: function () {

                var that = this;

                MessageBox.warning("Are you sure you want to discard the changes?", {
                    title: "Discard Record(s)",
                    onClose: function (sAction) {
                        if (sAction === 'OK') {
                            that._initializeAsync();
                        }
                    }.bind(this),
                    actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                    emphasizedAction: sap.m.MessageBox.Action.OK,
                });

            },

            //----------------------------------------------------------------------------------------------------------------------//
            //                                               CV TAB
            //----------------------------------------------------------------------------------------------------------------------//


            /////////////////////////////////////////////////////////// WORK EXPERIENCE TAB ////////////////////////////////////////////////////////////



            onAddWorkExpDialog: function () {


                if (!this.oDialog) {
                    this.loadFragment({
                        name: "projectskillsappui.fragment.AddWorkExp"
                    }).then(function (odialog) {

                        this.oDialog = odialog;
                        this.oDialog.open();

                    }.bind(this))
                } else {
                    this.oDialog.open();
                }

            },


            // creating work experience
            handleSaveWorkexp: function () {

                var that = this;

                var orgVal = this.getView().byId("workExp_org");
                var orgData = orgVal.getValue();
                var designationVal = this.getView().byId("designation");
                var designationData = designationVal.getValue();
                var jobProfileVal = this.getView().byId("jobProfile");
                var jobProfileData = jobProfileVal.getValue();
                var jobStartVal = this.getView().byId("startDate");
                var jobStartData = jobStartVal.getValue();
                var endDateVal = this.getView().byId("endDate");
                var endDateData = endDateVal.getValue();
                var oMainModel = this.getView().getModel("EmployeeModel");
                var iPS_NO = oMainModel.getData().PS_NO;
                let workExpData = {

                    "company_name": orgData,
                    "role": designationData,
                    "domain": jobProfileData,
                    "startDate": jobStartData,
                    "endDate": endDateData,
                    "empl_PS_NO": iPS_NO
                }
                // 
                //console.log("workExpData");

                var url = this.getOwnerComponent().getModel().sServiceUrl + "/employee_cv_experience_data";
                jQuery.ajax({
                    type: "POST",
                    async: false,
                    contentType: "application/json",
                    url: "/v2/odata/v4/main/Employee_CV_Experience_Data",
                    data: JSON.stringify(workExpData),
                    success: function (data) {
                        console.log(data);
                        MessageBox.alert("Work Experience added successfully!");
                        that.oDialog.destroy();
                        that.oDialog = null;
                        that._initializeAsync();
                        orgVal.setValue('');
                        designationVal.setValue('');
                        jobProfileVal.setValue('');
                        jobStartVal.setValue('');
                        endDateVal.setValue('');


                    }.bind(this),
                    error: function (err) {
                        MessageBox.error("Error saving data to local database: " + err.responseText);
                    }
                });

            },


            // deleting work experience
            onMultiDeleteWorkExp: function () {
                var that = this;
                var oList = that.getView().byId("WorkExp");
                var items = oList.getSelectedItem();
                if (items === null) {
                    sap.m.MessageBox.warning("Please Select Records");
                } else {
                    var url = that.getOwnerComponent().getModel().sServiceUrl;
                    var oDataModel = new sap.ui.model.odata.ODataModel(url);
                    var batchChanges = [];

                    var jModel = that.getView().byId("WorkExp").getSelectedItems();
                    for (var i = 0; i < jModel.length; i++) {
                        var oEntry = jModel[i].getBindingContext("EmployeeModel").getObject();
                        var na = oEntry.ID;
                        //var SCACGroupVal = parseInt(SCACGroupVal1);
                        var uPath = "/Employee_CV_Experience_Data(" + na + ")";

                        batchChanges.push(oDataModel.createBatchOperation(uPath, "DELETE", oEntry));
                    }
                    oDataModel.addBatchChangeOperations(batchChanges);
                    oDataModel.submitBatch(function (oData, oResponse) {
                        // Success callback function
                        if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                            sap.m.MessageBox.success("Records Deleted Successfully");
                            that._initializeAsync();

                        }
                        // Handle the response data
                    }, function (oError) {
                        // Error callback function
                        sap.m.MessageBox.success("failed");
                        // Handle the error
                    });
                }
            },

            onEditWorkExpDialog: function (oEvent) {

                // var oList = oEvent.getSource();
                // var oLabel = this.byId("WorkExp");

                // var oListItem = oEvent.getSource().getParent(); // Assuming the event source is a control inside the CustomListItem
                // var oPath = oListItem.getBindingContext('EmployeeModel').getPath();
                // console.log(oPath);

                var oList = this.byId("WorkExp");
                var aSelectedContexts = oList.getSelectedContexts();
                console.log(aSelectedContexts[0].getObject());

                var sPath = aSelectedContexts[0].getPath();


                if (aSelectedContexts.length > 0) {
                    var sPath = aSelectedContexts[0].getPath();

                    if (!this.oDialog) {
                        this.loadFragment({
                            name: "projectskillsappui.fragment.EditWorkExp"
                        }).then(function (oDialog) {
                            this.oDialog = oDialog;

                            // Bind the element here after the dialog is fully loaded
                            this.oDialog.bindElement({
                                path: sPath,
                                model: "EmployeeModel"
                            });

                            this.oDialog.open();
                        }.bind(this)).catch(function (error) {
                            console.error("Error loading fragment:", error);
                        });
                    } else {
                        // Bind the element here if the dialog is already loaded
                        this.oDialog.bindElement({
                            path: sPath,
                            model: "EmployeeModel"
                        });

                        this.oDialog.open();
                    }
                } else {
                    console.log("No item selected");
                }
            },

            // Updating current work experience
            handleSaveWorkExp: function (oRecord) {
                var oList = this.byId("WorkExp");

                var aSelectedContexts = oList.getSelectedContexts();
                var selection = aSelectedContexts[0].getObject();
                // console.log(aSelectedContexts[0].getObject());

                var oModel = this.getOwnerComponent().getModel();
                var oRecord = this.getView().getModel('EmployeeModel').getData();
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Updating",
                    text: "Please wait..."
                });

                oBusyDialog.open();

                console.log(oRecord);
                // "empl_PS_NO": iPS_NO

                oModel.update("/Employee_CV_Experience_Data(" + selection.ID + ")", selection,
                    {
                        success: function () {
                            console.log("Data added");
                            this.oDialog.close();
                            oBusyDialog.close();
                            // this.readStorageLoc();
                        }.bind(this),
                        error: function (error) {
                            oBusyDialog.close();
                        }
                    });
            },





            // canceling the changes we made, can be done only before saving it to the database
            onCancelWorkExpChanges: function () {

                var that = this;
                this.oDialog.close();
                this.oDialog.destroy();
                this.oDialog = null;
                that._initializeAsync();


                // MessageBox.warning("Are you sure you want to discard the changes?", {
                //     title: "Discard Record(s)",
                //     onClose: function (sAction) {
                //         if (sAction === 'OK') {
                //             that._initializeAsync();
                //             that.byId("editWorkExperience").close();
                //         }
                //     }.bind(this),
                //     actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                //     emphasizedAction: sap.m.MessageBox.Action.OK,
                // });

            },




            // // updating existing work experience
            // onUpdateWorkexp: function () {
            //     // var orgid = this.getView().byId("workExp_org");
            //     // var orgIdData = orgid.getValue();
            //     var orgVal = this.getView().byId("editorg");
            //     var orgData = orgVal.getValue();
            //     var desigVal = this.getView().byId("editdesig");
            //     var desigData = desigVal.getValue();
            //     var jobProfileVal = this.getView().byId("editjobprofile");
            //     var jobProfileData = jobProfileVal.getValue();
            //     var jobStartDate = this.getView().byId("DP2");
            //     var jobStartData = jobStartDate.getValue();
            //     var endDateVal = this.getView().byId("DP5");
            //     var endDateData = endDateVal.getValue();
            //     var oMainModel = this.getView().getModel("EmployeeModel");
            //     var iPS_NO = oMainModel.getData().PS_NO;
            //     let workExpData = {

            //         'empl_PS_NO': iPS_NO,
            //         'company_name': orgData,
            //         'role': desigData,
            //         'domain': jobProfileData,
            //         'startDate': jobStartData,
            //         'endDate': endDateData
            //     }
            //     // 
            //     console.log('work exp data', workExpData);
            //     // 
            //     var oDataModel = this.getView().getModel();


            //     var that = this;
            //     let path = "/Employee_CV_Experience_Data(" + orgIdData + ")";
            //     oDataModel.update(path, workExpData, {
            //         success: function (data, response) {
            //             MessageBox.success("Data Successfully Updated");
            //             // that.onEditCancel();
            //             //that._onReadEmpData();
            //             that.oDialog.destroy();
            //             that.oDialog = null;
            //             that._initializeAsync();
            //             orgVal.setValue('');
            //             desigVal.setValue('');
            //             jobProfileVal.setValue('');
            //             jobStartDate.setValue('');
            //             endDateVal.setValue('');
            //             oDataModel.refresh();
            //             oDataModel.updateBindings();

            //         },
            //         error: function (error) {
            //             oView.byId("page").setBusy(false);
            //             MessageBox.error("Error while updating the data" + err.responseText);
            //         }
            //     });
            // },

            onCurrentCompanySelection: function () {
                var oCheckBox = this.getView().byId('currentcompany').getSelected();
                console.log('oCheckBox ==>', oCheckBox)
                var oView = this.getView();
                if (oCheckBox == true) {

                    oView.byId("currentcompany").setVisible(false);
                    oView.byId("endDate").setVisible(false);
                } else {

                    oView.byId("currentcompany").setVisible(true);
                    oView.byId("endDate").setVisible(true);
                }
            },

            // CloseDialog1: function () {
            //     this.oDialog.close();
            //     this.oDialog.destroy();
            //     this.oDialog = null;
            // },


            ///////////////////////////////////////////////////////////EDUCATION QUALIFICATION TAB ////////////////////////////////////////////////////////////      


            onAddEduDialog: function () {


                if (!this.oDialog) {
                    this.loadFragment({
                        name: "projectskillsappui.fragment.AddEduQualification"
                    }).then(function (odialog) {

                        this.oDialog = odialog;
                        this.oDialog.open();

                    }.bind(this))
                } else {
                    this.oDialog.open();
                }

            },

            // Adding education qualification
            handleSaveEduQualification: function () {

                var that = this;

                var streamData = this.getView().byId("eduStream");
                var streamVal = streamData.getValue();
                var specializationData = this.getView().byId("specialization");
                var specializationVal = specializationData.getValue();
                var instData = this.getView().byId("institute");
                var instVal = instData.getValue();
                var eduStartDate = this.getView().byId("eduStartDate");
                var eduStartDateVal = eduStartDate.getValue();
                var eduEndDate = this.getView().byId("eduEndDate");
                var eduEndDateVal = eduEndDate.getValue();
                var oMainModel = this.getView().getModel("EmployeeModel");
                var iPS_NO = oMainModel.getData().PS_NO;


                let educationData = {
                    'empl_PS_NO': iPS_NO,
                    'degree': streamVal,
                    'specialization': specializationVal,
                    'institute_name': instVal,
                    'startDate': eduStartDateVal,
                    'endDate': eduEndDateVal
                }

                console.log("educationData");

                var url = this.getOwnerComponent().getModel().sServiceUrl + "/employee_education_detail";
                jQuery.ajax({
                    type: "POST",
                    async: false,
                    contentType: "application/json",
                    url: "/v2/odata/v4/main/Employee_Education_Detail",
                    data: JSON.stringify(educationData),
                    success: function (data) {
                        console.log(data);
                        MessageBox.alert("Education Qualification added successfully!");
                        that.oDialog.destroy();
                        that.oDialog = null;
                        that._initializeAsync();
                        streamVal.setValue('');
                        specializationVal.setValue('');
                        instVal.setValue('');
                        eduStartDateVal.setValue('');
                        eduEndDateVal.setValue('');


                    }.bind(this),
                    error: function (err) {
                        MessageBox.error("Error saving data to local database: " + err.responseText);
                    }
                });

            },

            onCancelEduQualification: function () {

                var that = this;
                this.oDialog.close();
                this.oDialog.destroy();
                this.oDialog = null;
                that._initializeAsync();
            },

            // deleting education qualification
            onMultiDeleteEduQ: function () {
                var that = this;
                var oList = that.getView().byId("EduQ");
                var items = oList.getSelectedItem();
                if (items === null) {
                    sap.m.MessageBox.warning("Please Select Records");
                } else {
                    var url = that.getOwnerComponent().getModel().sServiceUrl;
                    var oDataModel = new sap.ui.model.odata.ODataModel(url);
                    var batchChanges = [];

                    var jModel = that.getView().byId("EduQ").getSelectedItems();
                    for (var i = 0; i < jModel.length; i++) {
                        var oEntry = jModel[i].getBindingContext("EmployeeModel").getObject();
                        var na = oEntry.ID;
                        //var SCACGroupVal = parseInt(SCACGroupVal1);
                        var uPath = "/Employee_Education_Detail(" + na + ")";

                        batchChanges.push(oDataModel.createBatchOperation(uPath, "DELETE", oEntry));
                    }
                    oDataModel.addBatchChangeOperations(batchChanges);
                    oDataModel.submitBatch(function (oData, oResponse) {
                        // Success callback function
                        if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
                            sap.m.MessageBox.success("Records Deleted Successfully");
                            that._initializeAsync();

                        }
                        // Handle the response data
                    }, function (oError) {
                        // Error callback function
                        sap.m.MessageBox.success("failed");
                        // Handle the error
                    });
                }
            },

            onEditEduQDialog: function (oEvent) {

                var oList = this.byId("EduQ");
                var aSelectedContexts = oList.getSelectedContexts();
                console.log(aSelectedContexts[0].getObject());

                var sPath = aSelectedContexts[0].getPath();


                if (aSelectedContexts.length > 0) {
                    var sPath = aSelectedContexts[0].getPath();

                    if (!this.oDialog) {
                        this.loadFragment({
                            name: "projectskillsappui.fragment.EditEduQualification"
                        }).then(function (oDialog) {
                            this.oDialog = oDialog;

                            // Bind the element here after the dialog is fully loaded
                            this.oDialog.bindElement({
                                path: sPath,
                                model: "EmployeeModel"
                            });

                            this.oDialog.open();
                        }.bind(this)).catch(function (error) {
                            console.error("Error loading fragment:", error);
                        });
                    } else {
                        // Bind the element here if the dialog is already loaded
                        this.oDialog.bindElement({
                            path: sPath,
                            model: "EmployeeModel"
                        });

                        this.oDialog.open();
                    }
                } else {
                    console.log("Please select the item that you want to edit");
                }
            },

            // Updating current education details
            handleSaveEduQ: function (oRecord) {

                var oList = this.byId("EduQ");

                var aSelectedContexts = oList.getSelectedContexts();
                var selection = aSelectedContexts[0].getObject();
                console.log(aSelectedContexts[0].getObject());

                var oModel = this.getOwnerComponent().getModel();
                var oRecord = this.getView().getModel('EmployeeModel').getData();
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Updating",
                    text: "Please wait..."
                });

                oBusyDialog.open();

                console.log(oRecord);
                // "empl_PS_NO": iPS_NO

                oModel.update("/Employee_Education_Detail(" + selection.ID + ")", selection,
                    {
                        success: function () {
                            console.log("Data added");
                            this.oDialog.close();
                            oBusyDialog.close();
                            // this.readStorageLoc();
                        }.bind(this),
                        error: function (error) {
                            oBusyDialog.close();
                        }
                    });
            },

            ///////////////////////////////////////////////////////////PROFILE SUMMARY TAB ////////////////////////////////////////////////////////////      

            initRichTextEditor: function (bIsTinyMCE5) {

                var sHtmlValue = '';

                var that = this;
                sap.ui.require(["sap/ui/richtexteditor/RichTextEditor", "sap/ui/richtexteditor/library"],
                    function (RTE, library) {
                        var EditorType = library.EditorType;
                        that.oRichTextEditor = new RTE("myRTE", {
                            //editorType: bIsTinyMCE5 ? EditorType.TinyMCE5 : EditorType.TinyMCE6,
                            editorType: EditorType.TinyMCE6,
                            width: "100%",
                            height: "200px",
                            position: "center",
                            customToolbar: true,
                            showGroupFont: true,
                            showGroupLink: true,
                            showGroupInsert: true,
                            value: sHtmlValue,
                            ready: function () {
                                bIsTinyMCE5 ? this.addButtonGroup("styleselect").addButtonGroup("table") : this.addButtonGroup("styles").addButtonGroup("table");
                            }
                        });

                        that.getView().byId("idVerticalLayout").addContent(that.oRichTextEditor);

                        //console.log('summary data 1=>',sHtmlValue,that.oRichTextEditor);
                    });
            },

            profSummaryDetails: function () {
                return new Promise((resolve, reject) => {
                    var oprofSummaryModel = this.getView().getModel("EmployeeModel");

                    let oEmpl_Professional = oprofSummaryModel.getProperty("/employee_professional_summary");

                    let professionalData = oEmpl_Professional.results;
                    // var wrkcareerData ="Test data";
                    var wrkcareerData = "";
                    // console.log('careerData 1==>', wrkcareerData, typeof (wrkcareerData));
                    if (professionalData.length == 0) {
                        wrkcareerData = "Not updated";
                        //console.log('careerData 2==>', wrkcareerData)
                    } else {
                        wrkcareerData = professionalData[0].professional_desc.replace(/<[^>]*>?/gm, '');
                        //console.log('careerData 3==>', wrkcareerData)
                    }
                    var oViewCVModel = new JSONModel();
                    var oCvData = {
                        profSummaryData: wrkcareerData
                    }
                    this.getView().setModel(oViewCVModel, "oViewCVModel");
                    oViewCVModel.setData(oCvData);
                    oViewCVModel.refresh();
                    //{oViewCVModel>/profSummaryData}


                    resolve();
                })
            },

            onProfSummary: function () {

                var summaryVal = this.getView().byId("idVerticalLayout");
                var summaryData = this.oRichTextEditor.getValue();
                // summaryData=summaryData.replace(/<[^>]*>?/gm, '');

                console.log('summaryData =>', summaryData)

                var oMainModel = this.getView().getModel("EmployeeModel");
                var iPS_NO = oMainModel.getData().PS_NO;
                var oView = this.getView();


                var oDataModel = this.getView().getModel();


                let oEmpl_Professional = oMainModel.getProperty("/employee_professional_summary");
                let professionalData = oEmpl_Professional.results;
                var that = this;
                console.log('Professional data ==>', professionalData);
                let profSummaryData = {
                    'empl_PS_NO': iPS_NO,
                    'professional_desc': summaryData,
                }
                if (professionalData.length == 0) {
                    let path = "/Employee_Professional_Summary";
                    oDataModel.create(path, profSummaryData, {
                        success: function (data, response) {
                            MessageBox.success("Data Successfully Updated");

                            that.oRichTextEditor.destroy();
                            that._initializeAsync();
                            that.onProfSummarynotadd();
                            oDataModel.refresh(true);
                            oDataModel.updateBindings()

                        },
                        error: function (error) {
                            oView.byId("page").setBusy(false);
                            MessageBox.error("Error while updating the data" + err.responseText);
                        }
                    });
                } else {
                    console.log('summaryData updated=>', profSummaryData);
                    let summaryID = professionalData[0].ID;
                    let path = "/Employee_Professional_Summary(" + summaryID + ")";
                    oDataModel.update(path, profSummaryData, {
                        success: function (data, response) {
                            MessageBox.success("Data Successfully Updated");

                            that.oRichTextEditor.destroy();
                            that._initializeAsync();
                            /// summaryVal.setValue('');
                            that.onProfSummarynotadd();
                            // var oDataModel=this.getView().getModel();
                            oDataModel.refresh(true);
                            oDataModel.updateBindings()
                            // oView.byId("saveProfileSumm").setVisible(false);
                            //oView.byId("profileEdit").setVisible(true);
                        },
                        error: function (error) {
                            console.log(error);
                            oView.byId("page").setBusy(false);
                            MessageBox.error("Error while updating the data" + err.responseText);
                        }
                    });
                }

            },

            onEditProfsummary: function () {

                var oView = this.getView();
                oView.byId("profSummAdd").setVisible(true);
                oView.byId("profsumm").setVisible(false);
                oView.byId("profileEdit").setVisible(false);
                // oView.byId("EditProfile").setVisible(false);
                oView.byId("DeleteProfile").setVisible(false);
                oView.byId("saveProfileSumm").setVisible(true);
                oView.byId("cancel_Profilebtn").setVisible(true);

            },

            onProfSummarynotadd: function () {

                var oView = this.getView();
                oView.byId("profSummAdd").setVisible(false);
                oView.byId("profsumm").setVisible(true);
                oView.byId("profileEdit").setVisible(true);

                // oView.byId("EditProfile").setVisible(true);
                oView.byId("DeleteProfile").setVisible(true);

                oView.byId("saveProfileSumm").setVisible(false);
                oView.byId("cancel_Profilebtn").setVisible(false);

            },

            onDeleteProfSummary: function () {
                var that = this;

                var summaryVal = this.byId("profsumm");
                var summaryData = summaryVal.getText();

                // console.log('summaryData =>', summaryData)

                var oMainModel = this.getView().getModel("EmployeeModel");
                var iPS_NO = oMainModel.getData().PS_NO;
                var oView = this.getView();


                var oDataModel = this.getView().getModel();


                let oEmpl_Professional = oMainModel.getProperty("/employee_professional_summary");
                let professionalData = oEmpl_Professional.results;

                // console.log('Professional data ==>', professionalData);
                // let profSummaryData = {
                //     'empl_PS_NO': iPS_NO,
                //     'professional_desc': summaryData,
                // }

                // console.log('summaryData updated=>', profSummaryData);
                let summaryID = professionalData[0].ID;

                let path = "/Employee_Professional_Summary(" + summaryID + ")";
                oDataModel.remove(path, {
                    success: function (data, response) {
                        MessageBox.success("Data Successfully Deleted");

                        that.oRichTextEditor.destroy();
                        that._initializeAsync();
                        summaryVal.setValue('');
                        that.onProfSummarynotadd();
                        // var oDataModel=this.getView().getModel();
                        oDataModel.refresh(true);
                        oDataModel.updateBindings()
                        // oView.byId("saveProfileSumm").setVisible(false);
                        //oView.byId("profileEdit").setVisible(true);
                    },
                    error: function (error) {
                        console.log(error);
                        // oView.byId("page").setBusy(false);
                        MessageBox.error("Error while deleting  data" + err.responseText);
                    }
                });
            },


            ///////////////////////////////////////////////////////////PDF TAB ////////////////////////////////////////////////////////////    
           
            generate_cv_new: function () {

                const table_font = "Verdana, sans-serif";
                const table_font_size_in_pixels = 12;

                var oMainModel = this.getView().getModel("EmployeeModel").getData();
                var oModel = this.getView().getModel("EmployeeModel"); // Define oModel
                let oEducationModel = oModel.getProperty("/employee_education_detail");
                let oExperienceModel = oModel.getProperty("/employee_cv_experience_data");


                //create the rows of the educationDetails
                var htmlEducationDetailsTable = ""
                for (let i = 0; i < oEducationModel.results.length; i++) {
                    htmlEducationDetailsTable += `<tr>
                           <td>${oEducationModel.results[i].degree}</td>
                           <td>${oEducationModel.results[i].specialization}</td>
                           <td>${oEducationModel.results[i].degree}</td>
                           <td>${oEducationModel.results[i].institute_name}</td>
                           <td>${oEducationModel.results[i].endDate}</td>
                           </tr>
                           `
                }

                 //create the rows of the experienceDetails
                 var htmlExperienceDetailsTable = ""
                 for (let i = 0; i < oExperienceModel.results.length; i++) {
                     htmlExperienceDetailsTable += `<tr>
                            <td>${oExperienceModel.results[i].startDate}</td>
                            <td>${oExperienceModel.results[i].endDate}</td>
                            <td>${oExperienceModel.results[i].role}</td>
                            <td>${oExperienceModel.results[i].company_name}</td>
                            <td>${oExperienceModel.results[i].endDate}</td>
                            </tr>
                            `
                 }
                var cv_html = `<!DOCTYPE html>
                    <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>BIO DATA</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            font-size: 10px;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom:20px;
                            padding:20px;

                        }
                        th, td {
                            padding: 8px;
                            text-align: left;
                            border: 1px solid #ddd;
                        }
                        th {
                            background-color: #f2f2f2;
                        }
                        .section-title {
                            font-weight: bold;
                            background-color: #f2f2f2;
                            padding: 10px;
                        }
                        .header {
                            font-weight: bold;
                            background-color: #f2f2f2;
                            padding: 20px;
                            font-size: 10px;
                            text-align: center;
                            
                        }
                        .profile-pic {
                            width: 100px;
                        }
                    </style>
                </head>
                <body>
                    
                    <div class="header">
                         BIO DATA
                    </div>
                    
                   
                    <table>
                        <tr>
                            <td rowspan="5" style="width: 20%;"><img src="profile.jpg" alt="Profile Picture" class="profile-pic"></td>
                            <td><b>Name</b></td>
                            <td colspan="3"> ${oMainModel.employee_name}</td>
                        </tr>
                        <tr>
                            <td><b>IC</b> </td>
                            <td colspan="3">${oMainModel.practice}</td>
                        </tr>
                        <tr>
                            <td><b>SBG</b> </td>
                            <td colspan="3">${oMainModel.sub_practice}</td>
                        </tr>
                        <tr>
                            <td ><b>BU</b> </td>
                            <td colspan="3">${oMainModel.deputed_bu}</td>
                        </tr>
                        <tr>
                            <td><b>Cluster Desc</b> </td>
                            <td colspan="3">${oMainModel.base_location}</td>
                        </tr>
                        <tr>
                            <td ><b>Overall Experience</b> </td>
                            <td>${oMainModel.total_experience}Yrs</td>
                            <td><b>L&T Experience</b> </td>
                            <td>${oMainModel.lti_experience}Yrs</td>
                        </tr>
                    
                        <tr>
                            <td ><b>Separation Date</b>  </td>
                            <td>${oMainModel.lwd}</td>
                            <td ><b>Reason</b> </td>
                            <td>-</td>
                        </tr>
                    </table>
                    
                
                    <div class="section-title">Employment Details</div>
                
                    <table>
                        <tr>
                            <td>PS Number</td>
                            <td>${oMainModel.PS_NO}</td>
                            <td>IS Name</td>
                            <td> ${oMainModel.customer_name}</td>
                        </tr>
                        <tr>
                            <td>Joining Date </td>
                            <td>${oMainModel.date_of_joining}</td>
                            <td>DH Name </td>
                            <td>82887 - Sthaladipti Saha</td>
                        </tr>
                        <tr>
                            <td>Date of Birth </td>
                            <td>31-Oct-2000</td>
                            <td>Cadre </td>
                            <td>M4-B</td>
                        </tr>
                        <tr>
                            <td>Age</td>
                            <td>23</td>
                            <td>Designation</td>
                            <td>${oMainModel.level}</td>
                        </tr>
                        <tr>
                            <td>Gender</td>
                            <td>Female</td>
                            <td>Last Promotion Date </td>
                            <td>-</td>
                        </tr>
                        <tr>
                            <td>Date of Retirement</td>
                            <td>-</td>
                            <td>Job Function Desc</td>
                            <td>Project Management Group</td>
                        </tr>
                        <tr>
                            <td>End of Contract</td>
                            <td>-</td>
                            <td>Department/Project Name</td>
                            <td>${oMainModel.project_name}</td>
                        </tr>
                        <tr>
                            <td >Office /Site</td>
                            <td>Office</td>
                            <td >Base Location Name</td>
                            <td>${oMainModel.base_location}</td>
                        </tr>
                    </table>
                
                    <div class="section-title">Education Details</div>
                
                    <table id="educationTable">
                        <tr>
                            <th>Qualification</th>
                            <th>Discipline</th>
                            <th>Type of Course</th>
                            <th>College / University</th>
                            <th>Year of Passing</th>
                        </tr>
                        ${htmlEducationDetailsTable}
                        
                    </table>
                   

                    <div class="section-title">Certifications</div>
                
                    <table>
                        <tr>
                            <th>Certificate Type</th>
                            <th>Institute</th>
                            <th>Company Sponsored</th>
                            <th>Certificate / Licenses</th>
                            <th>Valid Upto</th>
                        </tr>
                        <tr>
                             <td>Executive Post Graduate Diploma in Management (EPGDM)</td>
                            <td>PROJECT MANAGEMNET ASSOCIATES</td>
                            <td>-</td>
                            <td>IPMA LEVEL-D EXAM</td>
                            <td>2023</td>
                        </tr>
                        
                    </table>

                    <div class="section-title">Experience Details</div>
                
                    <table>
                        <tr>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Pervious Employers</th>
                            <th>Designation</th>
                            <th>Total No. of Yrs/Mon</th>
                        </tr>
                         ${htmlExperienceDetailsTable}
                        
                    </table>

                     <div class="section-title">Personal Details</div>
                
                    <table>
                        <tr>
                            <td>Father's Name</td>
                            <td>Susheel kushwaha</td>
                            <td>Blood Group</td>
                            <td>B+</td>
                        </tr>
                        <tr>
                            <td>Marital Status</td>
                            <td>Single</td>
                            <td>Domicile State </td>
                            <td>Madhya Pradesh</td>
                        </tr>
                        <tr>
                            <td>Number of children</td>
                            <td>-</td>
                            <td>Business Mobile</td>
                            <td>9878765250</td>
                        </tr>
                        <tr>
                            <td>Religion</td>
                            <td>Hinduism</td>
                            <td>Business Email</td>
                            <td>${oMainModel.email}</td>
                        </tr>
                        <tr>
                            <td>Nationality </td>
                            <td>Indian</td>
                            <td>Emergency Contact</td>
                            <td>9786453760</td>
                        </tr>
                        <tr>
                            <td>PAN No</td>
                            <td>-</td>
                            <td>Aadhar Number</td>
                            <td>-</td>
                        </tr>
                        
                    </table>

                    <div class="section-title">Promotion History</div>
                
                    <table>
                        <tr>
                            <th>Pervious Cadre</th>
                            <th>Current Cadre</th>
                            <th>w.e.f</th>
                            <th>Event Reason</th>
                            <th>Job Title</th>
                        </tr>
                        <tr>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                        </tr>
                        
                    </table>

                    <div class="section-title">Transfer History</div>
                    <table>
                        <tr>
                            <th>Transfer Date</th>
                            <th>IC Name</th>
                            <th>Job Code</th>
                            <th>Job Description</th>
                            <th>Site/Office</th>
                        </tr>
                        <tr>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                        </tr>
                        
                    </table>

                    <div class="section-title">Family Details</div>
                   
                    <table>
                        <tr>
                            <th>Dependent Name</th>
                            <th>Relationship</th>
                            <th>Gender</th>
                            <th>DOB</th>
                            <th>Status</th>
                        </tr>
                        <tr>
                            <td>Geeta Kushwaha</td>
                            <td>Mother</td>
                            <td>F</td>
                            <td>1-Jan-1976</td>
                            <td>Active</td>
                        </tr>
                        
                    </table>
                
                </body>
                </html>
                    `

                // var cv_html = response.value.data
                var oComponent = this.getOwnerComponent();
                var sBaseUrl = oComponent.getManifestEntry("sap.app").dataSources.admin.uri;
                var posturl = sBaseUrl + "generatePdf";
                console.log("Post URL:",posturl);
                $.ajax({
                    url: posturl,
                    dataType: "json",
                    type: "post",
                    // headers:{"x-csrf-token":csrf_token},
                    crossDomain: true,
                    contentType: "application/json",
                    data: JSON.stringify({
                        html_text: cv_html
                    }),
                    success: function (response) {
                        console.log("pdf service response", response);
                        if (response.value.statusCode === 200) {
                            const byteCharacters = atob(response.value.data.data.data);
                            const byteNumbers = new Array(byteCharacters.length);
                            for (let i = 0; i < byteCharacters.length; i++) {
                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                            }
                            const byteArray = new Uint8Array(byteNumbers);
                            const blob = new Blob([byteArray], { type: 'application/pdf' });
                            const blobUrl = URL.createObjectURL(blob);
                            console.log("blobUrl", blobUrl);
                            window.open(blobUrl, '_blank');

                        }
                    },
                    error: function (e) {
                        console.log(e);
                    },
                })
            },


            //----------------------------------------------------------------------------------------------------------------------//


            // --------------------------------------------------------------------------------------------------------------------//
            // --------------------------------------------------------------------------------------------------------------------//
            // --------------------------------------------------------------------------------------------------------------------//
            // --------------------------------------------------------------------------------------------------------------------//

            // selectRelatedRowsInTable: function (e) {
            //     var oTreeTable = this.getView().byId("TreeTableBasic");
            //     var totalrowcount = this.getView().byId("TreeTableBasic").getBinding("rows").getLength();
            //     var s = e.getSource();
            //     var n = e.getParameters().rowIndex;
            //     // var oTableContext = oTreeTable.getContextByIndex(n);
            //     var hierarchyLevel = oTreeTable.getContextByIndex(n)._mProxyInfo.level;
            //     // var a = s.getModel().getProperty("HierarchyLevel", s.getContextByIndex(n));
            //     if (hierarchyLevel === 1) {
            //         var b = n + 1;
            //         while (s.getContextByIndex(b) && oTreeTable.getContextByIndex(b)._mProxyInfo.level !== 1) {
            //             if (s.isIndexSelected(n)) {
            //                 if (!s.isIndexSelected(b)) {
            //                     // var k = s.getModel().getProperty("PurchaseOrder", s.getContextByIndex(b));
            //                     // this.aSelectedItems.push(k);
            //                     s.detachRowSelectionChange(this.onSelectSelectPOTable, this);
            //                     s.addSelectionInterval(b, b);
            //                     s.attachRowSelectionChange(this.onSelectSelectPOTable, this);
            //                     this.nItemSelectionCount += 1;
            //                 }
            //             } else {
            //                 if (s.isIndexSelected(b)) {
            //                     // k = s.getModel().getProperty("PurchaseOrder", s.getContextByIndex(b));
            //                     // var i = this.aSelectedItems.indexOf(k);
            //                     // if (i !== -1) {
            //                     //     this.aSelectedItems.splice(i, 1);
            //                     // }
            //                     s.detachRowSelectionChange(this.onSelectSelectPOTable, this);
            //                     s.removeSelectionInterval(b, b);
            //                     s.attachRowSelectionChange(this.onSelectSelectPOTable, this);
            //                     this.nItemSelectionCount -= 1;
            //                 }
            //             }
            //             b += 1;
            //         }
            //     } else {
            //         if (!s.isIndexSelected(n)) {
            //             b = n - 1;
            //             while (s.getContextByIndex(b)._mProxyInfo.level !== 1) {
            //                 b -= 1;
            //             }
            //             s.detachRowSelectionChange(this.onSelectSelectPOTable, this);
            //             s.removeSelectionInterval(b, b);
            //             s.attachRowSelectionChange(this.onSelectSelectPOTable, this);
            //             this.nHeaderSelectionCount += 1;
            //         }
            //         if (s.isIndexSelected(n)) {
            //             var flag1 = [];
            //             var flag2 = [];
            //             b = n - 1;
            //             var c = n + 1;
            //             if (c === totalrowcount) {
            //                 c = n;
            //             }
            //             if (s.getContextByIndex(c)._mProxyInfo.level == 1) {
            //                 flag1.push(true);
            //             };
            //             while (s.getContextByIndex(c)._mProxyInfo.level !== 1) {
            //                 // flag1.push(false);
            //                 if (s.isIndexSelected(c)) {
            //                     flag1.push(true);
            //                 } else {
            //                     flag1.push(false);
            //                 };
            //                 c += 1;
            //                 if (c === totalrowcount) {
            //                     break;
            //                 }
            //             };
            //             if (s.getContextByIndex(b)._mProxyInfo.level == 1) {
            //                 flag1.push(true);
            //             };
            //             while (s.getContextByIndex(b)._mProxyInfo.level !== 1) {
            //                 // flag1.push(false);
            //                 if (s.isIndexSelected(b)) {
            //                     flag1.push(true);
            //                 } else {
            //                     flag1.push(false);
            //                 }
            //                 b -= 1;
            //             }
            //             const andofFlags = flag1.every(Boolean);
            //             if (andofFlags) {
            //                 s.detachRowSelectionChange(this.onSelectSelectPOTable, this);
            //                 s.addSelectionInterval(b, b);
            //                 s.attachRowSelectionChange(this.onSelectSelectPOTable, this);
            //             }
            //         }
            //     }
            //     // var selectedrows = s.getSelectedIndices();
            //     // if (selectedrows.length > 0) {
            //     //     this.getView().byId("calstockbutton").setEnabled(true);
            //     // } else {
            //     //     this.getView().byId("calstockbutton").setEnabled(false);
            //     // }
            // },

            // onSelectSelectPOTable: function (e) {

            //     var oTable = this.getView().byId("TreeTableBasic");
            //     var aIndices = oTable.getSelectedIndices();
            //     let oModel = oTable.getModel();
            //     let oTreeTable_fetched_data = oModel.getProperty("/cluster_array");

            //     // for initially setting all the tree table rows to non-editable mode
            //     for (let i = 0; i < oTreeTable_fetched_data.length; i++) {
            //         for (let j = 0; j < oTreeTable_fetched_data[i].employee_skill.length; j++) {
            //             var sPath = "/cluster_array/" + i + "/employee_skill/" + j + "/bEditable";
            //             oModel.setProperty(sPath, false);
            //         }
            //     }

            //     var s = this.getView().byId("TreeTableBasic");
            //     if (e.getParameters().selectAll === true) {
            //         this.bSelectAll = true;
            //         this.nHeaderSelectionCount = this.countSelectedHeaders(s, s.getSelectedIndices());
            //         // this.getView().byId("calstockbutton").setEnabled(true);
            //         // this.getView().byId("CreateDeliveryButton").setEnabled(false);
            //         // this.getView().byId("CalculateStockBalanceButton").setEnabled(false);
            //         // this.getView().byId("StockRequirementButton").setEnabled(false);
            //     } else {
            //         if (e.getParameters().rowContext === null) {
            //             this.bSelectAll = false;
            //             // this.getView().byId("calstockbutton").setEnabled(false);
            //             // this.getView().byId("CreateDeliveryButton").setEnabled(false);
            //             // this.getView().byId("CalculateStockBalanceButton").setEnabled(false);
            //             // this.getView().byId("StockRequirementButton").setEnabled(false);
            //             this.nHeaderSelectionCount = 0;
            //             this.nItemSelectionCount = 0;
            //             // this.aSelectedItems = [];
            //         } else {
            //             // this.getView().byId("calstockbutton").setEnabled(true);
            //             var p = e.getParameters().rowContext.sPath;
            //             var n = e.getParameters().rowIndex;
            //             var hierarchyLevel = e.getSource().getContextByIndex(n)._mProxyInfo.level;
            //             // var l = this.getView().getModel().getProperty(p).HierarchyNodeLevel;
            //             if (s.isIndexSelected(n)) {
            //                 if (hierarchyLevel === "1") {
            //                     this.nHeaderSelectionCount += 1;
            //                     if (this.nHeaderSelectionCount > 0) {
            //                         if (this._StockReqIntentAvailable) {
            //                             // this.getView().byId("StockRequirementButton").setEnabled(true);
            //                         } else {
            //                             // this.getView().byId("StockRequirementButton").setEnabled(false);
            //                         }
            //                         // this.getView().byId("calstockbutton").setEnabled(true);
            //                     } else {
            //                         // this.getView().byId("calstockbutton").setEnabled(false);
            //                         // this.getView().byId("StockRequirementButton").setEnabled(false);
            //                     }
            //                 } else {
            //                     // this.aSelectedItems.push(this.getView().getModel().getProperty(p).ProdPlntSupplierConcatenatedID);
            //                     this.nItemSelectionCount += 1;

            //                 }
            //             } else {
            //                 if (hierarchyLevel === "2") {
            //                     this.nHeaderSelectionCount -= 1;
            //                     if (this.nHeaderSelectionCount > 0) {
            //                         // if (this._StockReqIntentAvailable) {
            //                         //     this.getView().byId("StockRequirementButton").setEnabled(true);
            //                         // } else {
            //                         //     this.getView().byId("StockRequirementButton").setEnabled(false);
            //                         // }
            //                         // this.getView().byId("calstockbutton").setEnabled(true);
            //                     } else {
            //                         // this.getView().byId("calstockbutton").setEnabled(false);
            //                         // this.getView().byId("StockRequirementButton").setEnabled(false);
            //                     }
            //                 } else {
            //                     // var i = this.aSelectedItems.indexOf(this.getView().getModel().getProperty(p).ProdPlntSupplierConcatenatedID);
            //                     // if (i !== -1) {
            //                     //     this.aSelectedItems.splice(i, 1);
            //                     // }
            //                     this.nItemSelectionCount -= 1;
            //                 }
            //             }
            //             this.selectRelatedRowsInTable(e);
            //         }
            //     }

            // },


        });
    });