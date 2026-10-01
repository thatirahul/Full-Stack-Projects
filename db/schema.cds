namespace invoice.ai;

using { cuid, managed } from '@sap/cds/common';

entity Invoices : cuid, managed {

    // Uploaded File
    fileName            : String(255);
    mimeType            : String(100);

    // Invoice Details
    invoiceNumber       : String(100);
    invoiceDate         : Date;
    dueDate             : Date;

    supplierName        : String(255);

    currencyCode        : String(10);
    netAmount           : Decimal(15,2);
    taxAmount           : Decimal(15,2);
    grossAmount         : Decimal(15,2);

    supplierAddress     : String(500);
    supplierCity        : String(100);

    purchaseOrder       : String(100);
    barcode             : String(255);

    buyerName           : String(255);
    buyerAddress        : String(500);
    buyerCity           : String(100);

    rawResponse         : LargeString;
}

entity EmployeeDocuments : cuid, managed {
    fileName          : String(255);
    mimeType          : String(100);

    employeeName      : String(255);
    employeeNo        : String(100);
    joiningDate       : Date;
    bankName          : String(255);
    designation       : String(255);
    department        : String(255);
    location          : String(255);
    effectiveWorkDays : Integer;
    companyname       : String(255);
    companyaddress    : String(255);

    rawResponse       : LargeString;
}