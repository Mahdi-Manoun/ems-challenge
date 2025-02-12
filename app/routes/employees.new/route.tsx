import { Form, redirect, type ActionFunction } from "react-router";
import { getDB } from "~/db/getDB";
import validator from "validator";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";


export const action: ActionFunction = async ({ request }) => {
  const cleanText = (text: FormDataEntryValue | null) => {
    return text ? text.toString().trim() : "";
  };

  const formData = await request.formData();
  const full_name = cleanText(formData.get("full_name"));
  const email = cleanText(formData.get("email"));
  const phone = cleanText(formData.get("phone"));
  const job_title = cleanText(formData.get("job_title"));
  const department = cleanText(formData.get("department"));
  const salary = cleanText(formData.get("salary"));
  const start_date = cleanText(formData.get("start_date"));
  const end_date = cleanText(formData.get("end_date"));
  const birth_date = cleanText(formData.get("birth_date"));
  const photo = formData.get("photo") || null;
  const cv = formData.get("cv") || null;

  // checks if fields are empty
  if (!full_name || !email || !phone || !job_title ||
    !department || !salary || !start_date || !end_date ||
    !birth_date || !photo || !cv) {
    return { error: "All fields are required." };
  }


  // checks if the email & phone number are valid
  if (!validator.isEmail(email as string)) {
    return { error: "Invalid email address." };
  }

  if (isNaN(Number(phone)) || !validator.isMobilePhone(phone as string)) {
    return { error: "Invalid phone number." };
  }


  const parseDate = (dateStr: string) => {
    const timestamp = Date.parse(dateStr);
    return isNaN(timestamp) ? null : new Date(timestamp);
  };

  const startDate = parseDate(start_date);
  const endDate = parseDate(end_date);
  const birthDate = parseDate(birth_date);

  if (!startDate || !endDate || !birthDate) {
    return { error: "Invalid date format." };
  }

  if (startDate >= endDate) {
    return { error: "Start date must be before end date." };
  }

  // calculating age
  const age = new Date().getFullYear() - new Date(birth_date as string).getFullYear();

  if (age < 18) {
    return { error: "Employee must be at least 18 years old." };
  }

  // converting salary to float
  const salaryValue = parseFloat(salary as string);

  if (salaryValue < 500) {
    return { error: "Salary must be above the minimum wage." };
  }


  const photoPath = await handleFileUpload(photo as File, "photo");
  const cvPath = await handleFileUpload(cv as File, "cv");

  const db = await getDB();
  await db.run(
    'INSERT INTO employees (full_name, email, phone, job_title, department, salaryValue, start_date, end_date, birth_date, photoPath, cvPath) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [full_name, email, phone, job_title, department, salaryValue, start_date, end_date, birth_date, photoPath, cvPath]
  );

  return redirect("/employees");
}

const handleFileUpload = async (file: File | null, type: string) => {
  if (!file) {
    throw new Error(`${type} file is missing.`);
  }

  const allowedPhotoTypes = ["image/jpeg", "image/png", "image/webp"];
  const allowedCvTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

  const allowedTypes = type === "photo" ? allowedPhotoTypes : allowedCvTypes;
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`${type} file type is not allowed.`);
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads"); // save files at public/uploads
  await fs.mkdir(uploadsDir, { recursive: true });

  const fileName = `${type}-${uuidv4()}-${file.name}`;
  const filePath = path.join(uploadsDir, fileName);
  const buffer = await file.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(buffer));

  return `/uploads/${fileName}`;
};


export default function NewEmployeePage() {
  return (
    <div className="container">
      <h1>Create New Employee</h1>
      <Form method="post" encType="multipart/form-data">
        <div className="form-group">
          <label htmlFor="full_name">Full Name</label>
          <input type="text" name="full_name" id="full_name" required />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" name="email" id="email" required />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input type="tel" name="phone" id="phone" required pattern="[0-9]{10}" />
        </div>

        <div className="form-group">
          <label htmlFor="job_title">Job Title</label>
          <input type="text" name="job_title" id="job_title" required />
        </div>

        <div className="form-group">
          <label htmlFor="department">Department</label>
          <input type="text" name="department" id="department" required />
        </div>

        <div className="form-group">
          <label htmlFor="salary">Salary</label>
          <input type="number" name="salary" id="salary" required />
        </div>

        <div className="form-group">
          <label htmlFor="start_date">Start Date</label>
          <input type="date" name="start_date" id="start_date" required />
        </div>

        <div className="form-group">
          <label htmlFor="end_date">End Date</label>
          <input type="date" name="end_date" id="end_date" required />
        </div>

        <div className="form-group">
          <label htmlFor="birth_date">Birth Date</label>
          <input type="date" name="birth_date" id="birth_date" required />
        </div>

        <div className="form-group">
          <label htmlFor="photo">Employee Photo</label>
          <input type="file" name="photo" id="photo" accept="image/*" />
        </div>

        <div className="form-group">
          <label htmlFor="cv">Upload CV</label>
          <input type="file" name="cv" id="cv" accept=".pdf,.doc,.docx" />
        </div>

        <button type="submit" className="submit-btn">Create Employee</button>
      </Form>

      <hr />

      {/* Navigation links */}
      <ul className="navigation">
        <div>
          <li><a href="/employees">Employees</a></li>
          <li><a href="/employees/new">New Employee</a></li>
        </div>
        <div>
          <li><a href="/timesheets/">Timesheets</a></li>
          <li><a href="/timesheets/new">New Timesheet</a></li>
        </div>
      </ul>
    </div>

  );
}
