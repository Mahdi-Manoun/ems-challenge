import { useState } from "react";
import { Form, redirect, useLoaderData } from "react-router";
import { getDB } from "~/db/getDB"


export async function action({ request, params }: any) {
  const formData = await request.formData();
  const db = await getDB();

  const { timesheetId } = params;
  const updatedTimesheets = {
    start_time: formData.get("start_time"),
    end_time: formData.get("end_time"),
  };

  await db.run(
    `UPDATE timesheets SET start_time = ?, end_time = ? WHERE id = ?`,
    [
      updatedTimesheets.start_time,
      updatedTimesheets.end_time,
      timesheetId,
    ]
  );

  return redirect(`/timesheets`);
}

export async function loader({ params }: any) {
  const db = await getDB();
  const timesheet = await db.get("SELECT * FROM timesheets WHERE id = ?", params.timesheetId);

  if (!timesheet) {
    throw new Response("Employee not found", { status: 404 });
  }

  return { timesheet };
}

export default function TimesheetPage() {
  const { timesheet } = useLoaderData();
  const [isHeadingVisible, setIsHeadingVisible] = useState(true);

  const toggleContent = () => {
    setIsHeadingVisible(!isHeadingVisible);
  }

  const renderValue = (value: any) => {
    return value ? value : "null";
  }
  return (
    <div className="container">
      <div className="timesheet-info">
        <h2 style={{ marginBottom: 25 }}>Timesheet #{timesheet.id}</h2>
        <button type="submit" onClick={toggleContent}>Edit Info</button>
      </div>

      {isHeadingVisible ? (
        <ul className="timesheet-list">
          <li>Employee's ID: {renderValue(timesheet.employee_id)}</li>
          <li>Start Time: {renderValue(timesheet.start_time)}</li>
          <li>End Time: {renderValue(timesheet.end_time)}</li>
        </ul>
      ) : (
        <div>
          <Form method="post" encType="multipart/form-data">

            <div className="form-group">
              <label htmlFor="start_time">Start Time</label>
              <input type="date" name="start_time" id="start_time" required defaultValue={timesheet.start_time} />
            </div>

            <div className="form-group">
              <label htmlFor="end_time">End Time</label>
              <input type="date" name="end_time" id="end_time" required defaultValue={timesheet.end_time} />
            </div>

            <button type="submit" className="submit-btn">Update Timesheet</button>
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
