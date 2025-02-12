import { Form, useLoaderData } from "react-router";
import { useEffect, useState } from "react";
import { getDB } from "~/db/getDB";
import { format } from 'date-fns';
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import {
  createViewDay,
  createViewMonthGrid,
  createViewWeek,
} from '@schedule-x/calendar'
import { createEventsServicePlugin } from '@schedule-x/events-service'

import '@schedule-x/theme-default/dist/index.css'


export async function loader() {
  const db = await getDB();
  const timesheetsAndEmployees = await db.all(
    "SELECT timesheets.*, employees.full_name, employees.id AS employee_id FROM timesheets JOIN employees ON timesheets.employee_id = employees.id"
  );

  return { timesheetsAndEmployees };
}

export default function TimesheetsPage() {
  const { timesheetsAndEmployees } = useLoaderData();
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");

  return (
    <div className="container">
      {/* Toggle view mode */}
      <div className="view-toggle">
        <button onClick={() => setViewMode("table")} style={{ marginRight: 10 }}>
          Table View
        </button>
        <button onClick={() => setViewMode("calendar")}>Calendar View</button>
      </div>

      {viewMode === "table" ? (
        <div>
          <h1>Timesheet List</h1>
          {timesheetsAndEmployees.length > 0 ? (
            timesheetsAndEmployees.map((timesheet: any) => (
              <Form method="get" action={`/timesheets/${timesheet.id}`} style={{ cursor: "pointer" }}>
                <button type="submit" style={{ all: "unset", display: "block", width: "100%" }}>
                  <div key={timesheet.id}>
                    <ul className="timesheet-list">
                      <li><h2>Timesheet #{timesheet.id}</h2></li>
                      <ul>
                        <li>Employee: {timesheet.full_name} (ID: {timesheet.employee_id})</li>
                        <li>Start Time: {timesheet.start_time}</li>
                        <li>End Time: {timesheet.end_time}</li>
                      </ul>
                    </ul>
                    <br />
                  </div>
                </button>
              </Form>
            ))
          ) : (
            <p>No results found.</p>
          )}
        </div>
      ) : (
        <div style={{ marginTop: 10 }}>
          <h1>Calender View</h1>
          <CalendarApp timesheets={timesheetsAndEmployees} />
        </div>
      )}

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

function CalendarApp({ timesheets }: { timesheets: any[] }) {
  const eventsService = useState(() => createEventsServicePlugin())[0];

  const events = timesheets.map((timesheet) => ({
    id: timesheet.id.toString(),
    title: timesheet.full_name,
    start: format(new Date(timesheet.start_time), 'yyyy-MM-dd HH:mm'),
    end: format(new Date(timesheet.end_time), 'yyyy-MM-dd HH:mm'),
  }));

  const calendar = useCalendarApp({
    views: [createViewDay(), createViewWeek(), createViewMonthGrid()],
    events,
    plugins: [eventsService],
  });

  useEffect(() => {
    eventsService.getAll();
  }, []);

  return (
    <div>
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  );
}
