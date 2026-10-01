require("dotenv").config();

const cds = require("@sap/cds");
const documentAI = require("./utils/documentAI");

module.exports = cds.service.impl(async function () {

    const { Invoices , EmployeeDocuments } = this.entities;

    // =====================================================
    // Invoice Extraction
    // =====================================================

    this.on("ExtractInvoice", async (req) => {

        const { fileName, mimeType, fileData } = req.data;

        if (!fileData) {
            return req.error(400, "Invoice file is required.");
        }

        try {

            const invoice = await documentAI.extractInvoice({
                fileName,
                mimeType,
                fileData
            });

            // Save into DB
            // (Your existing code)

            return {
                success: true,
                message: "Invoice extracted successfully.",

                invoiceNumber: invoice.invoiceNumber,
                invoiceDate: invoice.invoiceDate,
                dueDate: invoice.dueDate,

                supplierName: invoice.supplierName,
                supplierAddress: invoice.supplierAddress,
                supplierCity: invoice.supplierCity,

                buyerName: invoice.buyerName,
                buyerAddress: invoice.buyerAddress,
                buyerCity: invoice.buyerCity,

                currencyCode: invoice.currencyCode,

                netAmount: invoice.netAmount,
                taxAmount: invoice.taxAmount,
                grossAmount: invoice.grossAmount,

                purchaseOrder: invoice.purchaseOrder,
                barcode: invoice.barcode
            };

        } catch (error) {

            return req.error(500, error.message);

        }

    });

      
    this.on("ExtractEmployeeDocument", async (req) => {


        const { fileName, mimeType, fileData } = req.data;


        if (!fileData) {
            return req.error(400, "Employee document file is required.");
        }


        try {


            const employee = await documentAI.extractEmployeeDocument({

                fileName,
                mimeType,
                fileData

            });



            return {
                success: true,
                message: "Employee document extracted successfully.",
                employeeName: employee.employeeName,
                employeeNo: employee.employeeNo,
                joiningDate: employee.joiningDate,
                bankName: employee.bankName,
                designation: employee.designation,
                department: employee.department,
                location: employee.location,
                effectiveWorkDays: employee.effectiveWorkDays,
                companyname: employee.companyname,
                companyaddress: employee.companyaddress

            };


        } catch (error) {


            console.error(
                "Employee Document Extraction Error:",
                error
            );


            return req.error(500, error.message);

        }


    });



});