require("dotenv").config();

const cds = require("@sap/cds");
const XLSX = require("xlsx");
const { extractEducationDetails } = require("./utils/gemini");

module.exports = cds.service.impl(function () {
    
    const { Images, Employees , PersonalInfo , EmploymentInfo , EducationInfo } = this.entities;

    this.on("UploadImage", async (req) => {

        try {

            const {
                fileName,
                mimeType,
                description,
                imageData
            } = req.data;

            console.log("Received UploadImage:", {
                fileName,
                mimeType,
                description,
                imageDataLength: imageData?.length
            });

            await cds.run(
                INSERT.into(Images).entries({
                    fileName,
                    mimeType,
                    description,
                    imageData
                })
            );

            return {
                message: "Image uploaded successfully"
            };

        } catch (error) {

            console.error("UploadImage Error:", error);

            req.error(500, error.message);
        }
    });

    this.on("UpdateEmployee", async (req) => {

        try {

            const {
                EmployeeID,
                Name,
                Department,
                Email
            } = req.data;

            await cds.run(
                UPDATE(Employees)
                    .set({
                        Name,
                        Department,
                        Email
                    })
                    .where({
                        EmployeeID
                    })
            );

            return {
                message: "Employee Updated Successfully"
            };

        } catch (error) {

            console.error(
                "UpdateEmployee Error:",
                error
            );

            req.error(
                500,
                error.message
            );
        }
    });

    this.on("UploadExcel", async (req) => {

        const tx = cds.tx(req);

        const workbook = XLSX.read(
            Buffer.from(req.data.data, "base64"),
            { type: "buffer" }
        );

        const sheet =
            workbook.Sheets[workbook.SheetNames[0]];

        const rows =
            XLSX.utils.sheet_to_json(sheet);

        const employees =
            await tx.run(
                SELECT.from(Employees)
            );

        let maxId = 0;

        employees.forEach(emp => {

            const match =
                emp.EmployeeID.match(/\d+/);

            if (match) {

                const num =
                    parseInt(match[0], 10);

                if (num > maxId) {
                    maxId = num;
                }
            }
        });

        const updatedEmployees = [];
        let insertedCount = 0;
        let updatedCount = 0;

        for (const row of rows) {

            const existingEmployee =
                await tx.run(
                    SELECT.one
                        .from(Employees)
                        .where({
                            Email: row.Email
                        })
                );

            // Update existing employee
            if (existingEmployee) {

                await tx.run(
                    UPDATE(Employees)
                        .set({
                            Name: row.Name,
                            Department: row.Department
                        })
                        .where({
                            Email: row.Email
                        })
                );

                updatedEmployees.push(
                    `${row.Name} (${row.Email})`
                );

                updatedCount++;

                continue;
            }

            // Insert new employee
            maxId++;

            const employeeId =
                "EMP" +
                String(maxId).padStart(3, "0");

            await tx.run(
                INSERT.into(Employees).entries({
                    EmployeeID: employeeId,
                    Name: row.Name,
                    Department: row.Department,
                    Email: row.Email
                })
            );

            insertedCount++;
        }

        return {
            insertedCount,
            updatedCount,
            updatedEmployees
        };
    });
     this.on('UpdatePersonalInfo', async (req) => {

        const {
            EmployeeID,
            Mobile,
            HomePhone,
            Address,
            City,
            State,
            Country
        } = req.data;

        const tx = cds.transaction(req);

        const employee = await tx.run(
            SELECT.one.from(Employees)
                .where({ EmployeeID })
        );

        if (!employee) {
            return `Employee ${EmployeeID} not found`;
        }

        const personal = await tx.run(
            SELECT.one.from(PersonalInfo)
                .where({
                    employee_EmployeeID: EmployeeID
                })
        );

        if (personal) {

            await tx.run(
                UPDATE(PersonalInfo)
                    .set({
                        Mobile,
                        HomePhone,
                        Address,
                        City,
                        State,
                        Country
                    })
                    .where({
                        employee_EmployeeID: EmployeeID
                    })
            );

        } else {

            await tx.run(
                INSERT.into(PersonalInfo).entries({
                    employee_EmployeeID: EmployeeID,
                    Mobile,
                    HomePhone,
                    Address,
                    City,
                    State,
                    Country
                })
            );

        }

        return "Personal Information Updated Successfully";
    });

    /*
     * Update Employment Information
     */
    this.on('UpdateEmploymentInfo', async (req) => {

        const {
            EmployeeID,
            Designation,
            Manager,
            JoiningDate,
            EmploymentType,
            Status
        } = req.data;

        const tx = cds.transaction(req);

        const employee = await tx.run(
            SELECT.one.from(Employees)
                .where({ EmployeeID })
        );

        if (!employee) {
            return `Employee ${EmployeeID} not found`;
        }

        const employment = await tx.run(
            SELECT.one.from(EmploymentInfo)
                .where({
                    employee_EmployeeID: EmployeeID
                })
        );

        if (employment) {

            await tx.run(
                UPDATE(EmploymentInfo)
                    .set({
                        Designation,
                        Manager,
                        JoiningDate,
                        EmploymentType,
                        Status
                    })
                    .where({
                        employee_EmployeeID: EmployeeID
                    })
            );

        } else {
            await tx.run(
                INSERT.into(EmploymentInfo).entries({
                    employee_EmployeeID: EmployeeID,
                    Designation,
                    Manager,
                    JoiningDate,
                    EmploymentType,
                    Status
                })
            );
        }
        return "Employment Information Updated Successfully";
    });

    this.on('DeleteEmployee', async (req) => {

        const { EmployeeID } = req.data;

         await DELETE.from(Employees)
          .where({ EmployeeID });
         return "Employee Deleted Successfully";
  });
 this.on("AddEducation", async (req) => {

    const {
        EmployeeID,
        EducationType,
        Qualification,
        Specialization,
        Institution,
        PassingYear,
        Percentage,
        Grade
    } = req.data;

    const tx = cds.transaction(req);

    // Check Employee exists
    const employee = await tx.run(
        SELECT.one.from(Employees)
            .where({ EmployeeID })
    );

    if (!employee) {
        req.error(404, "Employee not found");
    }

    // Maximum 3 education records
    const educationList = await tx.run(
        SELECT.from(EducationInfo)
            .where({
                employee_EmployeeID: EmployeeID
            })
    );

    if (educationList.length >= 3) {
        req.error(
            400,
            "All education details have already been added."
        );
    }

    // Check duplicate Education Type
    const existingEducation = await tx.run(
        SELECT.one.from(EducationInfo)
            .where({
                employee_EmployeeID: EmployeeID,
                EducationType: EducationType
            })
    );

    if (existingEducation) {
        req.error(
            400,
            `${EducationType} details already exist for this employee. Please edit the existing record instead.`
        );
    }

    // Insert
    await tx.run(
        INSERT.into(EducationInfo).entries({
            employee_EmployeeID: EmployeeID,
            EducationType,
            Qualification,
            Specialization,
            Institution,
            PassingYear,
            Percentage,
            Grade
        })
    );

    return "Education added successfully";
});

this.on("updateEducation", async (req) => {

    const tx = cds.transaction(req);

    const {
        educationID,
        educationType,
        qualification,
        specialization,
        institution,
        passingYear,
        percentage,
        grade
    } = req.data;

    await tx.run(

        UPDATE(EducationInfo)
            .set({

                EducationType: educationType,
                Qualification: qualification,
                Specialization: specialization,
                Institution: institution,
                PassingYear: passingYear,
                Percentage: percentage,
                Grade: grade

            })
            .where({

                ID: educationID

            })

    );

    return "Education updated successfully";

});
this.on("ExtractEducationCertificate", async (req) => {
    try {
        const { image, mimeType } = req.data;

        return await extractEducationDetails(image, mimeType);

    } catch (error) {

        if (error.status === 429) {
            req.error(
                429,
                "Gemini API quota exceeded. Please try again later."
            );
        }

        req.error(500, error.message);
    }
});
   
 this.on("UploadProfilePhoto", async (req) => {

    const {
        EmployeeID,
        Image,
        MediaType,
        FileName
    } = req.data;

    const tx = cds.transaction(req);

    // Check employee exists
    const employee = await tx.run(
        SELECT.one.from(Employees)
            .where({ EmployeeID })
    );

    if (!employee) {
        req.error(404, "Employee not found");
    }

    await tx.run(
        UPDATE(Employees)
            .set({
                ProfilePhoto: Image,
                MediaType: MediaType,
                FileName: FileName
            })
            .where({
                EmployeeID
            })
    );

    return {
        message: "Photo Uploaded Successfully"
    }

});

});
