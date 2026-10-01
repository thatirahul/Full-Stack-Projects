require("dotenv").config();

const axios = require("axios");
const FormData = require("form-data");

// -------------------------------------------------------
// Read credentials from Cloud Foundry service binding
// -------------------------------------------------------

let docAI = {};

if (process.env.VCAP_SERVICES) {

    const services = JSON.parse(process.env.VCAP_SERVICES);

    console.log("========== VCAP DEBUG ==========");
    console.log("Available Services:", Object.keys(services));

    docAI =
        services["document-information-extraction-trial"]?.[0]?.credentials || {};

}

// -------------------------------------------------------
// Configuration
// -------------------------------------------------------

const AUTH_URL =
    process.env.DOC_AI_AUTH_URL ||
    docAI.uaa?.url;

const BASE_URL =
    process.env.DOC_AI_BASE_URL ||
    docAI.url;

const OAUTH_CLIENT_ID =
    process.env.DOC_AI_CLIENT_ID ||
    docAI.uaa?.clientid;

const OAUTH_CLIENT_SECRET =
    process.env.DOC_AI_CLIENT_SECRET ||
    docAI.uaa?.clientsecret;

// Trial account uses "default"
const DOCUMENT_CLIENT_ID =
    process.env.DOC_AI_SERVICE_CLIENT_ID ||
    "default";

console.log("========== DOCUMENT AI CONFIG ==========");
console.log("AUTH URL :", AUTH_URL);
console.log("BASE URL :", BASE_URL);
console.log("CLIENT ID :", OAUTH_CLIENT_ID);
console.log("DOCUMENT CLIENT :", DOCUMENT_CLIENT_ID);
console.log("========================================");

// -------------------------------------------------------
// OAuth Token
// -------------------------------------------------------

async function getAccessToken() {

    try {

        const response = await axios.post(
            `${AUTH_URL}/oauth/token`,
            null,
            {
                auth: {
                    username: OAUTH_CLIENT_ID,
                    password: OAUTH_CLIENT_SECRET
                },
                params: {
                    grant_type: "client_credentials"
                }
            }
        );

        console.log("Access Token Generated");

        return response.data.access_token;

    } catch (err) {

        console.error("TOKEN ERROR");
        console.error(err.response?.data || err.message);

        throw err;

    }

}

// -------------------------------------------------------
// Upload Invoice
// -------------------------------------------------------

async function uploadInvoice(token, fileName, mimeType, fileData) {

    console.log("Uploading :", fileName);

    const buffer = Buffer.from(fileData, "base64");

    const form = new FormData();

    form.append("file", buffer, {
        filename: fileName,
        contentType: mimeType
    });

    form.append(
        "options",
        JSON.stringify({
            clientId: DOCUMENT_CLIENT_ID,
            schemaName: "SAP_invoice_schema"
        })
    );

    try {

        const response = await axios({

            method: "POST",

            url:
                `${BASE_URL}/document-information-extraction/v1/document/jobs`,

            headers: {
                Authorization: `Bearer ${token}`,
                ...form.getHeaders()
            },

            data: form

        });

        console.log("Upload Successful");

        return response.data;

    } catch (err) {

        console.error("UPLOAD ERROR");
        console.error(err.response?.status);
        console.error(JSON.stringify(err.response?.data, null, 2));

        throw err;

    }

}
// -------------------------------------------------------
// Upload Employee Custom Document
// -------------------------------------------------------

async function uploadEmployeeDocument(
    token,
    fileName,
    mimeType,
    fileData
) {

    console.log("Uploading Employee Document :", fileName);


    const buffer = Buffer.from(fileData, "base64");


    const form = new FormData();


    form.append("file", buffer, {

        filename: fileName,

        contentType: mimeType

    });



    form.append(
        "options",
        JSON.stringify({

            clientId: DOCUMENT_CLIENT_ID,

            // Your Custom Schema Name
            schemaName: "BankDetails",
            schemaVersion : "2"
        })
    );


    try {


        const response = await axios({

            method: "POST",

            url:
            `${BASE_URL}/document-information-extraction/v1/document/jobs`,


            headers: {

                Authorization: `Bearer ${token}`,

                ...form.getHeaders()

            },


            data: form


        });


        console.log("Employee Upload Successful");


        return response.data;


    } catch(err) {


        console.error("EMPLOYEE UPLOAD ERROR");

        console.error(
            err.response?.data || err.message
        );


        throw err;

    }

}

// -------------------------------------------------------
// Wait Until Finished
// -------------------------------------------------------

async function waitUntilFinished(token, jobId) {

    while (true) {

        const response = await axios({

            method: "GET",

            url:
                `${BASE_URL}/document-information-extraction/v1/document/jobs/${jobId}`,

            headers: {
                Authorization: `Bearer ${token}`
            }

        });

        const job = response.data;

        console.log("Status :", job);
        console.log(token);
        console.log(jobId);
        

        if (job.status === "DONE") {
            return job;
        }

        if (job.status === "FAILED") {
            throw new Error("Document AI processing failed.");
        }

        await new Promise(resolve => setTimeout(resolve, 2000));

    }

}

// -------------------------------------------------------
// Utility
// -------------------------------------------------------

function getFieldValue(fields, names) {

    if (!Array.isArray(names)) {
        names = [names];
    }

    for (const name of names) {

        const field = fields.find(f =>
            f.name === name ||
            f.fieldName === name ||
            f.id === name
        );

        if (!field) {
            continue;
        }

        return (
            field.value ??
            field.text ??
            field.content ??
            field.rawValue ??
            ""
        );

    }

    return "";

}

// -------------------------------------------------------
// Parse Result
// -------------------------------------------------------

function parseInvoice(job) {

    console.log("========== RAW RESPONSE ==========");
    console.log(JSON.stringify(job, null, 2));
    console.log("==================================");

    const extraction = job.extraction || {};

    const fields =
        extraction.headerFields ||
        extraction.fields ||
        [];

    return {

        invoiceNumber: getFieldValue(fields, "documentNumber"),

        invoiceDate: getFieldValue(fields, "documentDate"),

        dueDate: getFieldValue(fields, "dueDate"),

        supplierName: getFieldValue(fields, "senderName"),

        supplierAddress: getFieldValue(fields, "senderAddress"),

        supplierCity: getFieldValue(fields, "senderCity"),

        buyerName: getFieldValue(fields, "receiverName"),

        buyerAddress: getFieldValue(fields, "receiverAddress"),

        buyerCity: getFieldValue(fields, "receiverCity"),

        currencyCode: getFieldValue(fields, "currencyCode"),

        purchaseOrder: getFieldValue(fields, [
            "purchaseOrder",
            "purchaseOrderNumber"
        ]),

        barcode: getFieldValue(fields, "barcode"),

        netAmount: Number(getFieldValue(fields, "netAmount") || 0),

        taxAmount: Number(getFieldValue(fields, "taxAmount") || 0),

        grossAmount: Number(getFieldValue(fields, "grossAmount") || 0),

        rawResponse: job

    };

}
// -------------------------------------------------------
// Parse Employee Document Result
// -------------------------------------------------------

function parseEmployeeDocument(job) {


    console.log("========== EMPLOYEE RAW RESPONSE ==========");

    console.log(
        JSON.stringify(job,null,2)
    );

    console.log("===========================================");



    const extraction = job.extraction || {};



    const fields =
        extraction.headerFields ||
        extraction.fields ||
        [];

console.log("Parsed Employee:", {
    employeeName: getFieldValue(fields, ["EmployeeName", "BankemployeeName"]),
    employeeNo: getFieldValue(fields, ["EmployeeID", "BankemployeeID"]),
    joiningDate: getFieldValue(fields, ["JoiningDate"]),
    bankName: getFieldValue(fields, ["BankName"]),
    designation: getFieldValue(fields, ["Designation"]),
    location: getFieldValue(fields, ["Location"]),
    effectiveWorkDays: getFieldValue(fields, ["EffectiveWorkDays"]),
    companyname: getFieldValue(fields, ["CompanyName"]),
    companyaddress: getFieldValue(fields, ["CompanyAddress"]),
});

    return {

    employeeName: getFieldValue(fields, [
        "EmployeeName",
        "BankemployeeName"
    ]),

    employeeNo: getFieldValue(fields, [
        "EmployeeID",
        "BankemployeeID"
    ]),

    joiningDate: getFieldValue(fields, [
        "JoiningDate"
    ]),

    bankName: getFieldValue(fields, [
        "BankName"
    ]),

    designation: getFieldValue(fields, [
        "Designation"
    ]),

    department: getFieldValue(fields, [
        "Department"
    ]),

    location: getFieldValue(fields, [
        "Location"
    ]),

    effectiveWorkDays: Number(
        getFieldValue(fields, [
            "EffectiveWorkDays"
        ]) || 0
    ),

    companyname: getFieldValue(fields, [
        "CompanyName"
    ]),

    companyaddress: getFieldValue(fields, [
        "CompanyAddress"
    ]),

    salary: Number(
        getFieldValue(fields, [
            "EmployeeSalary"
        ]) || 0
    ),

    rawResponse: job

};


}

// -------------------------------------------------------
// Export
// -------------------------------------------------------

module.exports = {

    extractInvoice: async ({ fileName, mimeType, fileData }) => {

        const token = await getAccessToken();

        const upload = await uploadInvoice(
            token,
            fileName,
            mimeType,
            fileData
        );

        console.log("Job ID :", upload.id);

        const result = await waitUntilFinished(
            token,
            upload.id
        );

        return parseInvoice(result);

    },
      extractEmployeeDocument: async ({
        fileName,
        mimeType,
        fileData
    }) => {


        const token =
        await getAccessToken();



        const upload =
        await uploadEmployeeDocument(
            token,
            fileName,
            mimeType,
            fileData
        );



        console.log(
            "Employee Job ID :",
            upload.id
        );



        const result =
        await waitUntilFinished(
            token,
            upload.id
        );



        return parseEmployeeDocument(result);

    }

}