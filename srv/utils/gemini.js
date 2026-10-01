require("dotenv").config();

console.log("Gemini API Key =", process.env.GEMINI_API_KEY);

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function extractEducationDetails(image, mimeType) {

    try {

        const response = await ai.models.generateContent({

            model: "gemini-2.5-flash",

            contents: [
                {
                    role: "user",
                    parts: [

                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: image
                            }
                        },

                        {
                            text: `
You are an OCR and document information extraction assistant.
Analyze the uploaded education certificate.

The uploaded file may be either:

- An image (.jpg, .jpeg, .png)

Your first task is to determine whether the uploaded image is an EDUCATION CERTIFICATE or an ACADEMIC MARKS MEMO.

Valid documents include:
- 10th Certificate
- Secondary School Certificate (SSC)
- Intermediate / 12th Marks Memo
- Diploma Certificate
- Degree Certificate
- Provisional Certificate
- Consolidated Marks Memo
- Post Graduation Certificate
- University-issued Academic Certificates

If the uploaded image is NOT an education certificate or academic marks memo, OR the image is unrelated (such as a person, selfie, animal, landscape, ID card, Aadhaar card, PAN card, driving license, passport, invoice, bill, receipt, or any other non-academic document), return ONLY this JSON:

{
  "isCertificate": false,
  "message": "The uploaded image is not a valid education certificate.",
  "educationType": "",
  "qualification": "",
  "specialization": "",
  "institution": "",
  "passingYear": "",
  "percentage": "",
  "grade": ""
}

If the uploaded image IS a valid education certificate, extract the information and return ONLY this JSON:

{
  "isCertificate": true,
  "message": "Certificate extracted successfully.",
  "educationType": "",
  "qualification": "",
  "specialization": "",
  "institution": "",
  "passingYear": "",
  "percentage": "",
  "grade": ""
}

The educationType field MUST contain ONLY one of the following values:
- Secondary
- Graduation
- PostGraduation

Specialization Rules:

- For Secondary (SSC/10th), leave the specialization field empty.

- For Intermediate (12th), if the certificate explicitly contains the stream/group, extract it as the specialization.

Examples:
- MPC
- BiPC
- MEC
- CEC
- HEC
- Vocational

If the stream/group is not printed anywhere on the certificate, return an empty string.

Do NOT guess or infer the specialization.

Extraction Rules:

1. Return ONLY valid JSON.
2. Do NOT wrap the JSON in markdown.
3. Do NOT include explanations or extra text.
4. If a field is not available, return an empty string "".
5. Do NOT guess or infer missing values.
6. Preserve the exact spelling from the certificate.
7. If percentage is shown as CGPA or GPA or Total Marks, place that value in the "percentage" field.
8. If only grade is available, fill the "grade" field and leave "percentage" empty.
9. If multiple qualifications appear, extract only the highest qualification represented by the uploaded certificate.
10. Return exactly the JSON structure shown above.
`
                        }

                    ]
                }
            ]

        });

     let result =
    response.candidates[0]
        .content.parts[0]
        .text;

result = result
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

console.log(result);

return JSON.parse(result);

    } catch (error) {

        console.error("Gemini Error:", error);

        throw error;

    }

}

module.exports = {
    extractEducationDetails
};