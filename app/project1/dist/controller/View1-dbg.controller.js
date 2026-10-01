sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], function (
    Controller,
    MessageToast,
    MessageBox,
    Fragment
) {
    "use strict";

    return Controller.extend("project1.controller.View1", {

        _base64Image: "",

        onInit: function () {

        },

        formatImage: function (sImageData) {

            if (!sImageData) {
                return "";
            }

            return "data:image/jpeg;base64," + sImageData;
        },

        onFileChange: function (oEvent) {

            const oFile = oEvent.getParameter("files")[0];

            if (!oFile) {
                return;
            }

            if (!oFile.type.startsWith("image/")) {

                MessageToast.show("Only image files are allowed");

                this.byId("fileUploader").clear();

                return;
            }

            this.byId("selectedFileName").setText(oFile.name);

            const reader = new FileReader();

            reader.onload = (e) => {

                const img = new Image();

                img.onload = () => {

                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    let width = img.width;
                    let height = img.height;

                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 600;

                    if (width > MAX_WIDTH) {

                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }

                    if (height > MAX_HEIGHT) {

                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    ctx.drawImage(img, 0, 0, width, height);

                    const compressed =
                        canvas.toDataURL("image/jpeg", 0.7);

                    this._base64Image = compressed.split(",")[1];

                    this.byId("imagePreview").setSrc(compressed);
                    this.byId("imagePreview").setVisible(true);
                };

                img.src = e.target.result;
            };

            reader.readAsDataURL(oFile);
        },

        onUpload: async function () {

            const oUploader = this.byId("fileUploader");

            if (
                !oUploader.oFileUpload ||
                oUploader.oFileUpload.files.length === 0
            ) {

                MessageToast.show("Please select an image");
                return;
            }

            const oFile = oUploader.oFileUpload.files[0];

            try {

                const oModel = this.getView().getModel();

                const oAction =
                    oModel.bindContext("/UploadImage(...)");

                oAction.setParameter("fileName", oFile.name);
                oAction.setParameter("mimeType", oFile.type);
                oAction.setParameter(
                    "description",
                    this.byId("descriptionInput").getValue()
                );
                oAction.setParameter(
                    "imageData",
                    this._base64Image
                );

                await oAction.execute();

                MessageToast.show("Image uploaded successfully");

                this._clearForm();

                this.byId("imagesTable")
                    .getBinding("items")
                    .refresh();

            } catch (err) {

                console.error(err);

                MessageBox.error("Upload failed");
            }
        },

        _clearForm: function () {

            this.byId("fileUploader").clear();

            this.byId("descriptionInput").setValue("");

            this.byId("selectedFileName")
                .setText("No file selected");

            this.byId("imagePreview")
                .setSrc("");

            this.byId("imagePreview")
                .setVisible(false);

            this._base64Image = "";
        },

        _getEditDialog: async function () {

            if (!this._oEditDialog) {

                this._oEditDialog = await Fragment.load({
                    id: this.getView().getId(),
                    name: "project1.view.fragments.EditDialog",
                    controller: this
                });

                this.getView().addDependent(this._oEditDialog);
            }

            return this._oEditDialog;
        },

        onEditPress: async function (oEvent) {

            const oObject =
                oEvent.getSource()
                    .getBindingContext()
                    .getObject();

            this._selectedEmployee = oObject;

            const oDialog = await this._getEditDialog();

            oDialog.open();

            this.byId("empId")
                .setValue(oObject.EmployeeID);

            this.byId("empName")
                .setValue(oObject.Name);

            this.byId("empDept")
                .setValue(oObject.Department);

            this.byId("empEmail")
                .setValue(oObject.Email);
        },

        onDialogSave: async function () {

            try {

                const oModel = this.getView().getModel();

                const oAction =
                    oModel.bindContext("/UpdateEmployee(...)");

                oAction.setParameter(
                    "EmployeeID",
                    this.byId("empId").getValue()
                );

                oAction.setParameter(
                    "Name",
                    this.byId("empName").getValue()
                );

                oAction.setParameter(
                    "Department",
                    this.byId("empDept").getValue()
                );

                oAction.setParameter(
                    "Email",
                    this.byId("empEmail").getValue()
                );

                await oAction.execute();

                MessageToast.show("Employee updated");

                this._oEditDialog.close();

                this.byId("employeeTable")
                    .getBinding("items")
                    .refresh();

            } catch (err) {

                console.error(err);

                MessageBox.error("Update failed");
            }
        },

        onDialogCancel: function () {

            this._oEditDialog.close();
        },

        _getExcelDialog: async function () {

            if (!this._oExcelDialog) {

                this._oExcelDialog =
                    await Fragment.load({
                        id: this.getView().getId(),
                        name: "project1.view.fragments.ExcelUploadDialog",
                        controller: this
                    });

                this.getView()
                    .addDependent(this._oExcelDialog);
            }

            return this._oExcelDialog;
        },

        onOpenExcelDialog: async function () {

            const oDialog = await this._getExcelDialog();

            oDialog.open();
        },

        onCloseExcelDialog: function () {

            this._excelFile = null;

            this.byId("selectedExcelFile")
                .setText("No file selected");

            this.byId("dialogExcelUploader")
                .clear();

            this._oExcelDialog.close();
        },

        onExcelSelect: function (oEvent) {

            this._excelFile = oEvent.getParameter("files")[0];

            if (this._excelFile) {

                this.byId("selectedExcelFile")
                    .setText(this._excelFile.name);
            }
        },

        onExcelUpload: function () {

            if (!this._excelFile) {

                MessageToast.show("Please select an Excel file");

                return;
            }

            const reader = new FileReader();

            reader.onload = async (oEvent) => {

                try {

                    const sBase64 =
                        oEvent.target.result.split(",")[1];

                    const oModel = this.getView().getModel();

                    const oAction =
                        oModel.bindContext("/UploadExcel(...)");

                    oAction.setParameter("data", sBase64);

                    await oAction.execute();

                    const oResult =
                        oAction.getBoundContext().getObject();

                    MessageToast.show(oResult.value);

                    this.byId("employeeTable")
                        .getBinding("items")
                        .refresh();

                     MessageToast.show(
                        oResult.insertedCount +
                        " inserted, " +
                        oResult.updatedCount +
                        " updated"
                    );

                    this.onCloseExcelDialog();

                } catch (err) {

                    console.error(err);

                    MessageBox.error("Excel upload failed");
                }
            };

            reader.readAsDataURL(this._excelFile);
        },

        onRefreshEmployees: function () {

            this.byId("employeeTable")
                .getBinding("items")
                .refresh();

            MessageToast.show("Employees refreshed");
        },
        onEmployeeRowPress: function(oEvent) {

           var oContext =
              oEvent.getSource().getBindingContext();

           var oEmployee =
              oContext.getObject();

           this.getOwnerComponent()
              .getRouter()
              .navTo("EmployeeProfile", {
             employeeId: oEmployee.EmployeeID
        });
     }

    });

});