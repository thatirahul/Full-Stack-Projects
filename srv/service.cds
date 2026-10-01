using { invoice.ai as db } from '../db/schema';

service InvoiceService {

    entity Invoices as projection on db.Invoices;
    entity EmployeeDocuments as projection on db.EmployeeDocuments;

    action ExtractInvoice(
        fileName : String,
        mimeType : String,
        fileData : LargeString
    ) returns InvoiceExtraction;


    action ExtractEmployeeDocument(
        fileName : String,
        mimeType : String,
        fileData : LargeString
    ) returns EmployeeExtraction;

}

type InvoiceExtraction {

    success : Boolean;
    message : String;

    invoiceNumber : String;
    invoiceDate : String;
    dueDate : String;

    supplierName : String;
    supplierAddress : String;
    supplierCity : String;

    buyerName : String;
    buyerAddress : String;
    buyerCity : String;

    currencyCode : String;

    netAmount : Decimal(15,2);
    taxAmount : Decimal(15,2);
    grossAmount : Decimal(15,2);

    purchaseOrder : String;
    barcode : String;

}
type EmployeeExtraction {

    success : Boolean;
    message : String;


    employeeName : String;

    employeeNo : String;

    joiningDate : String;


    bankName : String;

    designation : String;

    department : String;

    location : String;
    effectiveWorkDays : Integer;
    comanyname : String;
    companyaddress : String; 

}
