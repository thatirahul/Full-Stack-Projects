using { image.upload as upload } from '../db/schema';

   type EducationExtraction {
    isCertificate : Boolean;
    message        : String;
    
    educationType : String;
    qualification : String;
    specialization : String;
    institution : String;
    passingYear : String;
    percentage : String;
    grade : String;

}

service ImageService {

    @restrict: [
        {
            grant: 'READ',
            to: 'Employee'
        },
        {
            grant: '*',
            to: 'Admin'
        }
    ]
    entity Images as projection on upload.Images;

    @restrict: [
        {
            grant: 'READ',
            to: 'Employee'
        },
        {
            grant: '*',
            to: 'Admin'
        }
    ]
    entity Employees as projection on upload.Employees;
   @restrict: [
  { grant:'READ', to:'Employee' },
  { grant:'*', to:'Admin' }
]
entity PersonalInfo as projection on upload.PersonalInfo;

@restrict: [
  { grant:'READ', to:'Employee' },
  { grant:'*', to:'Admin' }
]
entity EmploymentInfo as projection on upload.EmploymentInfo;
@restrict: [
  { grant:'READ', to:'Employee' },
  { grant:'*', to:'Admin' }
]
entity EducationInfo as projection on upload.EducationInfo;

    @requires: 'Admin'
    action UploadImage(
        fileName    : String,
        mimeType    : String,
        description : String,
        imageData   : LargeString
    );

    @requires: 'Admin'
    action UpdateEmployee(
        EmployeeID : String,
        Name       : String,
        Department : String,
        Email      : String
    ) returns String;

    @requires: 'Admin'
    action UploadExcel(
        data : LargeString
    ) returns String;

      @requires:'Admin'
    action UpdatePersonalInfo(
        EmployeeID     : String,
        Mobile         : String,
        HomePhone      : String,
        Address        : String,
        City           : String,
        State          : String,
        Country        : String,
    ) returns String;

    @requires:'Admin'
    action UpdateEmploymentInfo(
        EmployeeID      : String,
        Designation     : String,
        Manager         : String,
        JoiningDate     : Date,
        EmploymentType  : String,
        Status          : String
    ) returns String;

    @requires:'Admin'
    action AddEducation(
        EmployeeID     : String,
        EducationType  : String,
        Qualification  : String,
        Specialization : String,
        Institution    : String,                
        PassingYear    : Integer,
        Percentage     : Decimal(5,2),
        Grade          : String
    ) returns String;

    @requires:'Admin'
    action updateEducation(
        educationID     : UUID,
        educationType : String,
        qualification   : String,
        specialization  : String,
        institution     : String,
        passingYear     : Integer,
        percentage      : Decimal(5,2),
        grade           : String
    ) returns String;
    
    @requires:'Admin'
    action UploadProfilePhoto(
    EmployeeID : String,
    Image      : LargeString,
    MediaType  : String,
    FileName   : String
)
    @requires:'Admin'
    action DeleteEmployee(
        EmployeeID : String
    ) returns String;

    @requires:'Admin'
    action ExtractEducationCertificate(
        image:LargeString,
        mimeType:String
    ) returns EducationExtraction;

}