import { useState } from "react";
import { Form, redirect, useLoaderData } from "react-router";
import { getDB } from "~/db/getDB"


export async function action({ request, params }: any) {
  const formData = await request.formData();
  const db = await getDB();

  const { employeeId } = params;
  const updatedEmployee = {
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    job_title: formData.get("job_title"),
    department: formData.get("department"),
    salaryValue: formData.get("salary"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    birth_date: formData.get("birth_date"),
  };

  await db.run(
    `UPDATE employees SET full_name = ?, email = ?, phone = ?, job_title = ?, department = ?, salaryValue = ?, start_date = ?, end_date = ?, birth_date = ? WHERE id = ?`,
    [
      updatedEmployee.full_name,
      updatedEmployee.email,
      updatedEmployee.phone,
      updatedEmployee.job_title,
      updatedEmployee.department,
      updatedEmployee.salaryValue,
      updatedEmployee.start_date,
      updatedEmployee.end_date,
      updatedEmployee.birth_date,
      employeeId,
    ]
  );

  return redirect("/employees/:employeeId");
}



export async function loader({ params }: any) {
  const db = await getDB();
  const employee = await db.get("SELECT * FROM employees WHERE id = ?", params.employeeId);

  if (!employee) {
    throw new Response("Employee not found", { status: 404 });
  }

  return { employee };
}

export default function EmployeePage() {
  const { employee } = useLoaderData();
  const [isHeadingVisible, setIsHeadingVisible] = useState(true);

  const toggleContent = () => {
    setIsHeadingVisible(!isHeadingVisible);
  }

  const renderValue = (value: any) => {
    return value ? value : "null";
  }

  return (
    <div className="container">
      <div className="employee-info">
        <h2>Employee #{employee.id}</h2>
        <button type="submit" onClick={toggleContent}>Edit Info</button>
      </div>

      {isHeadingVisible ? (
        <ul className="employee-list">
          <li><img src={employee.photoPath} alt="employee-photo" /></li>
          <li>Full Name: {renderValue(employee.full_name)}</li>
          <li>Email: {renderValue(employee.email)}</li>
          <li>Phone Number: {renderValue(employee.phone)}</li>
          <li>Job Title: {renderValue(employee.job_title)}</li>
          <li>Department: {renderValue(employee.department)}</li>
          <li>Salary in USD: {renderValue(employee.salaryValue)}</li>
          <li>Start Date: {renderValue(employee.start_date)}</li>
          <li>End Date: {renderValue(employee.end_date)}</li>
          <li>Birthdate: {renderValue(employee.birth_date)}</li>
          <li>
            <a href={employee.cvPath}>{employee.full_name}'s CV:</a>
          </li>
        </ul>
      ) : (
        <div>
          <Form method="post" encType="multipart/form-data">
            <div className="form-group">
              <label htmlFor="full_name">Full Name</label>
              <input type="text" name="full_name" id="full_name" required defaultValue={employee.full_name} />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" name="email" id="email" required defaultValue={employee.email} />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input type="tel" name="phone" id="phone" required pattern="[0-9]{10}" defaultValue={employee.phone} />
            </div>

            <div className="form-group">
              <label htmlFor="job_title">Job Title</label>
              <input type="text" name="job_title" id="job_title" required defaultValue={employee.job_title} />
            </div>

            <div className="form-group">
              <label htmlFor="department">Department</label>
              <input type="text" name="department" id="department" required defaultValue={employee.department} />
            </div>

            <div className="form-group">
              <label htmlFor="salary">Salary</label>
              <input type="number" name="salary" id="salary" required defaultValue={employee.salaryValue} />
            </div>

            <div className="form-group">
              <label htmlFor="start_date">Start Date</label>
              <input type="date" name="start_date" id="start_date" required defaultValue={employee.start_date} />
            </div>

            <div className="form-group">
              <label htmlFor="end_date">End Date</label>
              <input type="date" name="end_date" id="end_date" required defaultValue={employee.end_date} />
            </div>

            <div className="form-group">
              <label htmlFor="birth_date">Birth Date</label>
              <input type="date" name="birth_date" id="birth_date" required defaultValue={employee.birth_date} />
            </div>

            <button type="submit" className="submit-btn">Update Employee</button>
          </Form>
        </div>
      )
      }

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
  )
}
