sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/BusyDialog",
    "sap/ui/model/json/JSONModel"
], function (
    Controller,
    MessageToast,
    MessageBox,
    BusyDialog,
    JSONModel
) {
    "use strict";

    return Controller.extend("project1.controller.View1", {

        onInit: function () {

             this.byId("invoiceSection").setVisible(false);
             this.byId("customSection").setVisible(false);


            this._busyDialog = new BusyDialog();
            this._invoiceFile = null;

            const oModel = new JSONModel({
                invoice: {}
            });
            // Employee Model
            const oEmployeeModel = new JSONModel({
                employee: {}
            });

            this.getView().setModel(oModel, "invoice");
            this.getView().setModel(oEmployeeModel, "employee");


        },

        onInvoiceUpload: function (oEvent) {

            const aFiles = oEvent.getParameter("files");

            if (!aFiles || !aFiles.length) {
                return;
            }

            this._invoiceFile = aFiles[0];

            MessageToast.show(
                "Selected: " + this._invoiceFile.name
            );

        },

        // =====================================================
        // Extract Document
        // =====================================================

        onExtractDocument: async function () {

            if (!this._invoiceFile) {

                MessageBox.warning(
                    "Please select a document."
                );

                return;

            }

            const iSelected =
                this.byId("rbDocumentType")
                    .getSelectedIndex();

            if (iSelected === -1) {

                MessageBox.warning(
                    "Please select a document type."
                );

                return;

            }

            try {

                this._busyDialog.open();

                const sBase64 =
                    await this._readFileAsBase64(
                        this._invoiceFile
                    );

                const oModel =
                    this.getOwnerComponent().getModel();

                let oAction;

                if (iSelected === 0) {

                    // Invoice

                    oAction =
                        oModel.bindContext(
                            "/ExtractInvoice(...)"
                        );

                } else {

                    // Employee Custom Document

                    oAction =
                        oModel.bindContext(
                            "/ExtractEmployeeDocument(...)"
                        );

                }

                oAction.setParameter(
                    "fileName",
                    this._invoiceFile.name
                );

                oAction.setParameter(
                    "mimeType",
                    this._invoiceFile.type
                );

                oAction.setParameter(
                    "fileData",
                    sBase64
                );

                await oAction.execute();

                const oResult =
                    oAction.getBoundContext().getObject();

                console.log(oResult);

                if (iSelected === 0) {

                    this._populateInvoice(oResult);

                    this.byId("invoiceSection")
                        .setVisible(true);

                    this.byId("customSection")
                        .setVisible(false);

                    MessageToast.show(
                        "Invoice extracted successfully."
                    );

                } else {

                    this._populateEmployee(oResult);

                    this.byId("invoiceSection")
                        .setVisible(false);

                    this.byId("customSection")
                        .setVisible(true);

                    MessageToast.show(
                        "Employee document extracted successfully."
                    );

                }

            } catch (error) {

                console.error(error);

                MessageBox.error(
                    error.message ||
                    "Extraction failed."
                );

            } finally {

                this._busyDialog.close();

            }

        },

        _readFileAsBase64: function (file) {

            return new Promise(function (resolve, reject) {

                const reader = new FileReader();

                reader.onload = function (e) {

                    resolve(
                        e.target.result.split(",")[1]
                    );

                };

                reader.onerror = reject;

                reader.readAsDataURL(file);

            });

        },

        _populateInvoice: function (oData) {

            if (!oData) {
                return;
            }

            // Add uploaded file details because service doesn't return them
            oData.fileName = this._invoiceFile.name;
            oData.mimeType = this._invoiceFile.type;

            // Pretty JSON for Raw Response
            if (oData.rawResponse && typeof oData.rawResponse !== "string") {
                oData.rawResponse = JSON.stringify(
                    oData.rawResponse,
                    null,
                    2
                );
            }

            this.getView()
                .getModel("invoice")
                .setProperty("/invoice", oData);
            const oInvoiceModel = this.getView().getModel("invoice");
            oInvoiceModel.refresh(true);
        },
                _populateEmployee: function (oData) {

            if (!oData) {
                return;
            }

            oData.fileName = this._invoiceFile.name;
            oData.mimeType = this._invoiceFile.type;

            if (
                oData.rawResponse &&
                typeof oData.rawResponse !== "string"
            ) {

                oData.rawResponse =
                    JSON.stringify(
                        oData.rawResponse,
                        null,
                        2
                    );

            }

            this.getView()
                .getModel("employee")
                .setProperty("/employee", oData);

            this.getView()
                .getModel("employee")
                .refresh(true);

        },

          onDocumentTypeChange: function (oEvent) {
    var iIndex = oEvent.getParameter("selectedIndex");
    if (iIndex === 0) {
        this.byId("invoiceSection").setVisible(true);
        this.byId("customSection").setVisible(false);
    } else if (iIndex === 1) {
        this.byId("invoiceSection").setVisible(false);
        this.byId("customSection").setVisible(true);

    }



}

    });

});