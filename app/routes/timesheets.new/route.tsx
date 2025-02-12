import { useLoaderData, Form, redirect } from "react-router";
import { getDB } from "~/db/getDB";

export async function loader() {
  const db = await getDB();
  const employees = await db.all('SELECT id, full_name FROM employees');
  return { employees };
}

import type { ActionFunction } from "react-router";

export const action: ActionFunction = async ({ request }) => {

  const formData = await request.formData();
  const employee_id = formData.get("employee_id");
  const start_time = formData.get("start_time");
  const end_time = formData.get("end_time");


  // checks if fields are empty
  if (!employee_id || !start_time || !end_time) {
    return { error: "All fields are required." };
  }

  const startTime = start_time as string;
  const endTime = end_time as string;


  if (!startTime || !endTime) {
    return { error: "Invalid date format." };
  }

  const db = await getDB();
  await db.run(
    'INSERT INTO timesheets (employee_id, start_time, end_time) VALUES (?, DATETIME(?), DATETIME(?))',
    [employee_id, startTime, endTime]
  );
  

  return redirect("/timesheets");
}

export default function NewTimesheetPage() {
  const { employees } = useLoaderData(); // Used to create a select input

  return (
    <div className="container">
      <h1>Create New Timesheet</h1>
      <Form method="post">
        <div className="form-group">
          <label htmlFor="employee">Employee Name</label>
          <select name="employee_id" id="employee_id" style={{ width: 200, height: 30 }}>
            {employees.map((employee: any) => (
              <option key={employee.id} value={employee.id}>{employee.full_name} #{employee.id}</option>
            ))}
          </select>



        </div>
        <div className="form-group">
          <label htmlFor="start_time">Start Time</label>
          <input type="datetime-local" name="start_time" id="start_time" required />
        </div>
        <div className="form-group">
          <label htmlFor="end_time">End Time</label>
          <input type="datetime-local" name="end_time" id="end_time" required />
        </div>
        <button type="submit" className="submit-btn">Create Timesheet</button>
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
