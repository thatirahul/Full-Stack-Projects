namespace image.upload;

using { managed } from '@sap/cds/common';

entity Images : managed {
    key ID          : UUID;
    fileName        : String(255);
    mimeType        : String(100);
    description     : String(500);
    imageData       : LargeString;
}

entity Employees : managed {
    key EmployeeID : String(20);
    Name           : String(100);
    Department     : String(100);
    Email          : String(100) @assert.unique;
    personalInfo   : Composition of one PersonalInfo
                     on personalInfo.employee = $self;

    employmentInfo : Composition of one EmploymentInfo
                     on employmentInfo.employee = $self;

    educationInfo  : Composition of many EducationInfo
                     on educationInfo.employee = $self;      

    ProfilePhoto   : LargeString;
    MediaType      : String(100);
    FileName       : String(255);                            
}

entity EducationInfo : managed {

    key ID             : UUID;

    employee           : Association to Employees;
    EducationType      : String(50);
    Qualification      : String(100);  // B.Tech, M.Tech, MBA
    Specialization     : String(100);  // CSE, ECE, Finance
    Institution        : String(200);  // College/University Name
    PassingYear        : Integer;

    Percentage         : Decimal(5,2);

    Grade              : String(10);
}
entity PersonalInfo : managed {

    key ID          : UUID;
    employee        : Association to Employees;
    Mobile          : String(20);
    HomePhone       : String(20);
    Address         : String(255);
    City            : String(100);
    State           : String(100);
    Country         : String(100);
}

entity EmploymentInfo : managed {

    key ID            : UUID;

    employee          : Association to Employees;

    Designation       : String(100);
    Manager           : String(100);

    JoiningDate       : Date;

    EmploymentType    : String(50);

    Status            : String(20);
}