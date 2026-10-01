sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
     "sap/m/BusyDialog"
], function (
    Controller,
    JSONModel,
    MessageToast,
    Fragment,
    MessageBox,
    BusyDialog
) {
    "use strict";

    return Controller.extend("project1.controller.EmployeeProfile", {

        onInit: function () {

            const oRouter = this.getOwnerComponent().getRouter();

            oRouter.getRoute("EmployeeProfile")
                .attachPatternMatched(
                    this._onObjectMatched,
                    this
                );
            this._oBusyDialog = new BusyDialog({
            title: "Please Wait",
            text: "Extracting certificate details..."
    });
           var oUIModel = new sap.ui.model.json.JSONModel({

            manualEntry: false

});
this.getView().setModel(new JSONModel({

    entryMode: "",
    showUpload: false,
    showFields: false,
     enableEntryMode: true
}), "ui");

     this.getView().setModel(oUIModel, "ui");
        },

        _onObjectMatched: async function (oEvent) {

            this._sEmployeeId =
                oEvent.getParameter("arguments").employeeId;

            await this._loadEmployeeDetails(this._sEmployeeId);
        },

        _loadEmployeeDetails: async function (sEmployeeId) {

            const oModel = this.getOwnerComponent().getModel();

            const oContext = oModel.bindContext(
                "/Employees('" + sEmployeeId + "')",
                undefined,
                {
                    $expand: "personalInfo,employmentInfo,educationInfo"
                }
            );

            const oData = await oContext.requestObject();

            if (oData.ProfilePhoto) {

                oData.PhotoUrl = oData.ProfilePhoto;

            } else {

                oData.PhotoUrl = "";

            }

            this.getView().setModel(
                new JSONModel(oData),
                "employee"
            );

            // Set flag for Add/Edit button
            oData.personalInfoExists = !!oData.personalInfo;
            oData.employmentInfoExists = !!oData.employmentInfo;
            oData.disableAddEducation = oData.educationInfo && oData.educationInfo.length >= 3;

            this.getView().setModel(
                new sap.ui.model.json.JSONModel(oData),
                "employee"
            );
        },

        onNavBack: function () {
            history.back();
        },

        /* =========================
           PERSONAL INFO
        ========================== */

        onPersonalInfoPress: async function () {

            if (!this._oPersonalDialog) {

                this._oPersonalDialog = await Fragment.load({
                    id: this.getView().getId(),
                    name: "project1.view.fragments.PersonalInfoDialog",
                    controller: this
                });

                this.getView().addDependent(this._oPersonalDialog);
            }

            this._oPersonalDialog.open();
        },

        onClosePersonalDialog: function () {
            this._oPersonalDialog.close();
        },

        onSavePersonalInfo: async function () {

            try {

                if (
                    !this.byId("mobileInput").getValue().trim() ||
                    !this.byId("homePhoneInput").getValue().trim() ||
                    !this.byId("addressInput").getValue().trim() ||
                    !this.byId("cityInput").getValue().trim() ||
                    !this.byId("stateInput").getValue().trim() ||
                    !this.byId("countryInput").getValue().trim()
                ) {

                    MessageBox.error(
                        "Please fill all Personal Information details."
                    );

                    return;
                }

                const oModel =
                    this.getOwnerComponent().getModel();

                const oAction =
                    oModel.bindContext("/UpdatePersonalInfo(...)");

                oAction.setParameter(
                    "EmployeeID",
                    this._sEmployeeId
                );

                oAction.setParameter(
                    "Mobile",
                    this.byId("mobileInput").getValue()
                );

                oAction.setParameter(
                    "HomePhone",
                    this.byId("homePhoneInput").getValue()
                );

                oAction.setParameter(
                    "Address",
                    this.byId("addressInput").getValue()
                );

                oAction.setParameter(
                    "City",
                    this.byId("cityInput").getValue()
                );

                oAction.setParameter(
                    "State",
                    this.byId("stateInput").getValue()
                );

                oAction.setParameter(
                    "Country",
                    this.byId("countryInput").getValue()
                );

                await oAction.execute();

                await this._loadEmployeeDetails(
                    this._sEmployeeId
                );

                MessageToast.show(
                    "Personal information saved successfully"
                );

                this._oPersonalDialog.close();

            } catch (oError) {

                console.error(oError);

                MessageBox.error(
                    "Failed to save Personal Information"
                );
            }
        },
        /* =========================
           EMPLOYMENT INFO
        ========================== */

        onEmploymentInfoPress: async function () {

            if (!this._oEmploymentDialog) {

                this._oEmploymentDialog = await Fragment.load({
                    id: this.getView().getId(),
                    name: "project1.view.fragments.EmploymentInfoDialog",
                    controller: this
                });

                this.getView().addDependent(this._oEmploymentDialog);
            }

            this._oEmploymentDialog.open();
        },

        onCloseEmploymentDialog: function () {
            this._oEmploymentDialog.close();
        },

        onSaveEmploymentInfo: async function () {

            try {

                if (
                    !this.byId("designationInput").getValue().trim() ||
                    !this.byId("managerInput").getValue().trim() ||
                    !this.byId("joiningDateInput").getValue().trim() ||
                    !this.byId("employmentTypeInput").getValue().trim() ||
                    !this.byId("statusInput").getSelectedKey()
                ) {

                    MessageBox.error(
                        "Please fill all Employment Information details."
                    );

                    return;
                }

                const oModel = this.getOwnerComponent().getModel();

                const oAction =
                    oModel.bindContext("/UpdateEmploymentInfo(...)");

                oAction.setParameter(
                    "EmployeeID",
                    this._sEmployeeId
                );

                oAction.setParameter(
                    "Designation",
                    this.byId("designationInput").getValue()
                );

                oAction.setParameter(
                    "Manager",
                    this.byId("managerInput").getValue()
                );

                const oDate =
                    this.byId("joiningDateInput").getDateValue();

                const sJoiningDate = oDate
                    ? oDate.toISOString().split("T")[0]
                    : null;

                oAction.setParameter(
                    "JoiningDate",
                    sJoiningDate
                );

                oAction.setParameter(
                    "EmploymentType",
                    this.byId("employmentTypeInput").getValue()
                );

                oAction.setParameter(
                    "Status",
                    this.byId("statusInput").getSelectedKey()
                );
                await oAction.execute();
                await this._loadEmployeeDetails(
                    this._sEmployeeId
                );
                MessageToast.show(
                    "Employment information saved successfully"
                );
                this._oEmploymentDialog.close();
            } catch (oError) {
                console.error(oError);
                MessageBox.error(
                    "Failed to save Employment Information"
                );
            }
        },
        /* =========================
           EDUCATION INFO
        ========================== */

    onEducationInfoPress: async function () {

    if (!this._oEducationDialog) {

        this._oEducationDialog = await Fragment.load({
            id: this.getView().getId(),
            name: "project1.view.fragments.EducationDialog",
            controller: this
        });

        this.getView().addDependent(this._oEducationDialog);
    }

    const oUIModel = this.getView().getModel("ui");

    // Add Mode
    if (!this._isEducationEdit) {

        oUIModel.setProperty("/enableEntryMode", true);
        oUIModel.setProperty("/entryMode", "");
        oUIModel.setProperty("/showUpload", false);
        oUIModel.setProperty("/showFields", false);

        this.byId("entryModeGroup").setSelectedIndex(-1);

        this._educationID = null;

        this.byId("educationTypeInput").setEnabled(true);
        this.byId("educationTypeInput").setSelectedKey("");

        this.byId("qualificationInput").setValue("");
        this.byId("specializationInput").setValue("");
        this.byId("institutionInput").setValue("");
        this.byId("passingYearInput").setValue("");
        this.byId("percentageInput").setValue("");
        this.byId("gradeInput").setValue("");

        this.byId("certificateUploader").clear();
        this.byId("certificateUploader").setEnabled(true);

    } else {

        // Edit Mode
        oUIModel.setProperty("/enableEntryMode", false);
        oUIModel.setProperty("/showUpload", false);
        oUIModel.setProperty("/showFields", true);

        this.byId("entryModeGroup").setSelectedIndex(1); // Manual selected
    }

    this._oEducationDialog.open();
},

        onCloseEducationDialog: function () {
            this._oEducationDialog.close();
        },

        onSaveEducation: async function () {

            try {

                const sEducationType =
                    this.byId("educationTypeInput")
                        .getSelectedKey();

                const sQualification =
                    this.byId("qualificationInput")
                        .getValue()
                        .trim();

                const sInstitution =
                    this.byId("institutionInput")
                        .getValue()
                        .trim();

                const sPassingYear =
                    this.byId("passingYearInput")
                        .getValue()
                        .trim();

                if (
                    !sEducationType ||
                    !sQualification ||
                    !sInstitution ||
                    !sPassingYear
                ) {
                    MessageBox.error(
                        "Please fill all mandatory fields."
                    );
                    return;
                }

                const oModel =
                    this.getOwnerComponent().getModel();

                let oAction;

               if (this._educationID) {

    oAction = oModel.bindContext("/updateEducation(...)");

    oAction.setParameter(
        "educationID",
        this._educationID
    );

    oAction.setParameter(
        "educationType",
        this.byId("educationTypeInput")
            .getSelectedKey()
    );

    oAction.setParameter(
        "qualification",
        this.byId("qualificationInput")
            .getValue()
    );

    oAction.setParameter(
        "specialization",
        this.byId("specializationInput")
            .getValue()
    );

    oAction.setParameter(
        "institution",
        this.byId("institutionInput")
            .getValue()
    );

    oAction.setParameter(
        "passingYear",
        parseInt(
            this.byId("passingYearInput")
                .getValue(),
            10
        )
    );

    oAction.setParameter(
        "percentage",
        parseFloat(
            this.byId("percentageInput")
                .getValue() || 0
        )
    );

    oAction.setParameter(
        "grade",
        this.byId("gradeInput")
            .getValue()
    );

                } else {

                    oAction =
                        oModel.bindContext(
                            "/AddEducation(...)"
                        );

                    oAction.setParameter(
                        "EmployeeID",
                        this._sEmployeeId
                    );

                    oAction.setParameter(
                        "EducationType",
                        sEducationType
                    );

                    oAction.setParameter(
                        "Qualification",
                        sQualification
                    );

                    oAction.setParameter(
                        "Specialization",
                        this.byId("specializationInput").getValue()
                    );

                    oAction.setParameter(
                        "Institution",
                        sInstitution
                    );

                    oAction.setParameter(
                        "PassingYear",
                        parseInt(
                            sPassingYear,
                            10
                        )
                    );

                    oAction.setParameter(
                        "Percentage",
                        parseFloat(
                            this.byId("percentageInput").getValue() || 0
                        )
                    );

                    oAction.setParameter(
                        "Grade",
                        this.byId("gradeInput").getValue()
                    );
                }

                await oAction.execute();

                await this._loadEmployeeDetails(
                    this._sEmployeeId
                );

                MessageToast.show(
                    this._educationID
                        ? "Education updated successfully"
                        : "Education added successfully"
                );

                this._oEducationDialog.close();

            } catch (oError) {

                console.error(oError);

                MessageBox.error(
                    "Failed to save Education Information"
                );
            }
        },
        onEditPersonalInfo: async function () {

            await this.onPersonalInfoPress();

            const oPersonal =
                this.getView()
                    .getModel("employee")
                    .getProperty("/personalInfo");

            if (!oPersonal) {
                sap.m.MessageToast.show("No personal information found");
                return;
            }

            this.byId("mobileInput")
                .setValue(oPersonal.Mobile || "");

            this.byId("homePhoneInput")
                .setValue(oPersonal.HomePhone || "");

            this.byId("addressInput")
                .setValue(oPersonal.Address || "");

            this.byId("cityInput")
                .setValue(oPersonal.City || "");

            this.byId("stateInput")
                .setValue(oPersonal.State || "");

            this.byId("countryInput")
                .setValue(oPersonal.Country || "");
        },

        onEditEmploymentInfo: async function () {

            await this.onEmploymentInfoPress();

            const oEmployment =
                this.getView()
                    .getModel("employee")
                    .getProperty("/employmentInfo");

            if (!oEmployment) {
                sap.m.MessageToast.show(
                    "No employment information found"
                );
                return;
            }

            this.byId("designationInput")
                .setValue(oEmployment.Designation || "");

            this.byId("managerInput")
                .setValue(oEmployment.Manager || "");

            this.byId("employmentTypeInput")
                .setValue(oEmployment.EmploymentType || "");

            this.byId("statusInput")
                .setValue(oEmployment.Status || "");

            if (oEmployment.JoiningDate) {
                this.byId("joiningDateInput")
                    .setDateValue(
                        new Date(oEmployment.JoiningDate)
                    );
            }
        },

        onEditEducation: async function (oEvent) {

    const oEducation = oEvent.getSource()
        .getBindingContext("employee")
        .getObject();

    console.log(oEducation);

    this._educationID = oEducation.ID;

    this._isEducationEdit = true;

    await this.onEducationInfoPress();

    this.byId("educationTypeInput")
        .setSelectedKey(oEducation.EducationType);

    this.byId("certificateUploader").setEnabled(false);

    this.byId("educationTypeInput")
        .setEnabled(false);

    this.byId("qualificationInput")
        .setValue(oEducation.Qualification);

    this.byId("specializationInput")
        .setValue(oEducation.Specialization);

    this.byId("institutionInput")
        .setValue(oEducation.Institution);

    this.byId("passingYearInput")
        .setValue(oEducation.PassingYear);

    this.byId("percentageInput")
        .setValue(oEducation.Percentage);

    this.byId("gradeInput")
        .setValue(oEducation.Grade);
this.getView().getModel("ui").setProperty("/enableEntryMode", false);
    this._isEducationEdit = false;
},
        onProfilePhotoPress: async function () {

            if (!this._oPhotoDialog) {

                this._oPhotoDialog = await Fragment.load({
                    id: this.getView().getId(),
                    name: "project1.view.fragments.ProfilePhotoDialog",
                    controller: this
                });

                this.getView().addDependent(this._oPhotoDialog);
            }
            // Reset dialog state
            this._capturedImage = null;
            this._mediaType = null;
            this._fileName = null;

            this.byId("previewAvatar").setSrc("");

            this.byId("photoUploader").clear();

            this._oPhotoDialog.open();
        },
        onClosePhotoDialog: function () {

            this._capturedImage = null;
            this._mediaType = null;
            this._fileName = null;

            this.byId("previewAvatar").setSrc("");

            this.byId("photoUploader").clear();

            this._oPhotoDialog.close();

        },
        onPhotoSelected: function (oEvent) {

            const file = oEvent.getParameter("files")[0];

            if (!file) {
                return;
            }

            this._mediaType = file.type;
            this._fileName = file.name;

            const reader = new FileReader();

            reader.onload = function (e) {

                const img = new Image();

                img.onload = function () {

                    const canvas = document.createElement("canvas");

                    canvas.width = 300;
                    canvas.height = 300;

                    const ctx = canvas.getContext("2d");

                    ctx.drawImage(img, 0, 0, 300, 300);

                    this._capturedImage =
                        canvas.toDataURL("image/jpeg", 0.7);

                    this.byId("previewAvatar")
                        .setSrc(this._capturedImage);

                    console.log("Upload Size:", this._capturedImage.length);

                }.bind(this);

                img.src = e.target.result;

            }.bind(this);

            reader.readAsDataURL(file);

        },
        onSaveProfilePhoto: async function () {

            if (!this._capturedImage) {
                MessageToast.show("Please capture or upload a photo.");
                return;
            }

            try {

                const oModel = this.getOwnerComponent().getModel();

                const oAction = oModel.bindContext("/UploadProfilePhoto(...)");

                oAction.setParameter("EmployeeID", this._sEmployeeId);
                oAction.setParameter("Image", this._capturedImage);
                oAction.setParameter("MediaType", this._mediaType || "image/jpeg");
                oAction.setParameter("FileName", this._fileName || "CapturedPhoto.jpg");

                await oAction.execute();

                // Reload employee details from backend
                await this._loadEmployeeDetails(this._sEmployeeId);

                MessageToast.show("Photo uploaded successfully.");

                this._capturedImage = null;
                this._mediaType = null;
                this._fileName = null;

                this.byId("previewAvatar").setSrc("");

                this.byId("photoUploader").clear();
                this._oPhotoDialog.close();

            } catch (err) {
                MessageBox.error(err.message);
            }
        },

        onCapturePhoto: async function () {

            if (!this._oCameraDialog) {

                this._oCameraDialog = await Fragment.load({
                    id: this.getView().getId(),
                    name: "project1.view.fragments.CameraDialog",
                    controller: this
                });

                this.getView().addDependent(this._oCameraDialog);
            }

            this._oCameraDialog.open();

            setTimeout(() => {
                this._startCamera();
            }, 300);
        },

        // _createVideo: function () {

        //     const oContainer = this.byId("cameraContainer");

        //     oContainer.removeAllItems();

        //     this._oVideoHTML = new sap.ui.core.HTML({

        //         content:
        //             "<video id='cameraVideo' autoplay playsinline style='width:100%;height:320px;border-radius:8px'></video>"

        //     });

        //     oContainer.addItem(this._oVideoHTML);

        // },
        onCloseCameraDialog: function () {

            this._stopCamera();

            this._oCameraDialog.close();

        },
        _startCamera: async function () {

            try {

                this._stream =
                    await navigator.mediaDevices.getUserMedia({

                        video: true

                    });

                const video =
                    document.getElementById("cameraVideo");

                video.srcObject = this._stream;
            }
            catch (e) {
                sap.m.MessageToast.show("Unable to access camera.");
            }
        },
        _stopCamera: function () {

            if (this._stream) {

                this._stream.getTracks().forEach(function (track) {

                    track.stop();
                });
            }
        },
        onTakePhoto: function () {

            const video = document.getElementById("cameraVideo");

            const canvas = document.createElement("canvas");

            canvas.width = 300;
            canvas.height = 300;

            const ctx = canvas.getContext("2d");

            ctx.drawImage(video, 0, 0, 300, 300);

            const base64 = canvas.toDataURL("image/jpeg", 0.7);

            this._capturedImage = base64;
            this._mediaType = "image/jpeg";
            this._fileName = "CapturedPhoto.jpg";

            console.log("Captured Image Size:", base64.length);

            this.byId("previewAvatar").setSrc(base64);

            this._stopCamera();

            this._oCameraDialog.close();

        },

//     onCertificateUpload: function (oEvent) {

//     const file = oEvent.getParameter("files")[0];

//     if (!file) {
//         return;
//     }

//     console.log("File Name:", file.name);
//     console.log("File Type:", file.type);
//     console.log("File Size (bytes):", file.size);
//    console.log("File Size:", (file.size / 1024 / 1024).toFixed(2), "MB");

//     const reader = new FileReader();

//     reader.onload = async (e) => {

//         const base64 = e.target.result.split(",")[1];

//         console.log("Base64 Length:", base64.length);

//         await this.extractEducationData(base64, file.type);

//     };

//     reader.readAsDataURL(file);

// },
onCertificateUpload: function (oEvent) {

    const file = oEvent.getParameter("files")[0];

    if (!file) {
        return;
    }
   // Start Busy Dialog
    this._oBusyDialog.open();
    this.compressImage(file)
        .then(({ base64, mimeType }) => {
            this.extractEducationData(base64, mimeType);
        })
        .catch((err) => {
            // Close Busy Dialog on error
            this._oBusyDialog.close();
            console.error(err);
            sap.m.MessageBox.error("Unable to process image.");
        });

},
compressImage: function (file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = (e) => {

            const img = new Image();

            img.onload = () => {

                const canvas = document.createElement("canvas");

                const maxWidth = 600;

                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {

                    height = height * (maxWidth / width);
                    width = maxWidth;

                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");

                ctx.drawImage(img, 0, 0, width, height);

                const compressed = canvas.toDataURL(
                    "image/jpeg",
                    0.35
                );

                const base64 = compressed.split(",")[1];

                console.log("Compressed Size (KB):",
                    (base64.length * 3 / 4 / 1024).toFixed(2));

                resolve({
                    base64,
                    mimeType: "image/jpeg"
                });

            };

            img.onerror = reject;

            img.src = e.target.result;

        };

        reader.onerror = reject;

        reader.readAsDataURL(file);

    });

},
_convertToPercentage: function (value) {

    if (!value) {
        return "";
    }

    // Remove unwanted characters
    let number = parseFloat(
        value.toString().replace(/[^\d.]/g, "")
    );

    if (isNaN(number)) {
        return value;
    }

    // Case 1: CGPA
    if (number <= 10) {
        return (number * 10).toFixed(2) + "%";
    }

    // Case 2: Already Percentage
    if (number <= 100) {
        return number.toFixed(2) + "%";
    }

    // Case 3: Marks out of 1000
    if (number <= 1000) {
        return (number / 10).toFixed(2) + "%";
    }

    return value;
},
extractEducationData: async function (base64, mimeType) {

    try {

        const oModel = this.getView().getModel();

        const oAction = oModel.bindContext("/ExtractEducationCertificate(...)");

        oAction.setParameter("image", base64);
        oAction.setParameter("mimeType", mimeType);

        console.log(base64.length);

        await oAction.execute();

        const data = oAction.getBoundContext().getObject();

        console.log("Gemini Response:", data);

        // Validate whether the uploaded image is an education certificate
        if (!data.isCertificate) {

            sap.m.MessageBox.error(
                data.message || "The uploaded image is not a valid education certificate."
            );
                     
            // Clear the uploaded file
            // const oUploader = this.byId("certificateUploader");
            // if (oUploader) {
            //     oUploader.clear();
            //     oUploader.setValue("");
            // }

            return;
        }
        // Convert extracted value into percentage
data.percentage = this._convertToPercentage(
    data.percentage
);

        // Populate the fields
        this.byId("educationTypeInput").setSelectedKey(data.educationType);
        this.byId("qualificationInput").setValue(data.qualification);
        this.byId("specializationInput").setValue(data.specialization);
        this.byId("institutionInput").setValue(data.institution);
        this.byId("passingYearInput").setValue(data.passingYear);
        this.byId("percentageInput").setValue(data.percentage);
        this.byId("gradeInput").setValue(data.grade);
           // Close Busy Dialog after successful extraction
        this._oBusyDialog.close();

        sap.m.MessageToast.show(
            data.message || "Certificate extracted successfully."
            
        );

    } catch (error) {
          // Close Busy Dialog if extraction fails
        this._oBusyDialog.close();

        console.error(error);

        sap.m.MessageBox.error(
            "Unable to extract certificate."
        );
    }
    this.getView().getModel("ui").setProperty("/showFields", true);
},
onEntryModeChange: function (oEvent) {

    const iIndex = oEvent.getSource().getSelectedIndex();
    const oUIModel = this.getView().getModel("ui");

    if (iIndex === 0) {

        // Upload Certificate
        oUIModel.setProperty("/entryMode", "upload");
        oUIModel.setProperty("/showUpload", true);
        oUIModel.setProperty("/showFields", false);

    } else if (iIndex === 1) {

        // Manual Entry
        oUIModel.setProperty("/entryMode", "manual");
        oUIModel.setProperty("/showUpload", false);
        oUIModel.setProperty("/showFields", true);

    }

}
    });
    
});