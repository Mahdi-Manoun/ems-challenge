import { useState } from "react";
import { Form, useLoaderData } from "react-router";
import { getDB } from "~/db/getDB";

export async function loader() {
  const db = await getDB();
  const employees = await db.all("SELECT * FROM employees;");
  return { employees };
}

export default function EmployeesPage() {
  const { employees } = useLoaderData();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<"employee_id" | "full_name">("employee_id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  // Apply search filtering
  let filteredEmployees = employees?.filter((employee: any) => {
    const nameMatch = employee.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch;
  }) || [];


  // Apply sorting
  filteredEmployees.sort((a: any, b: any) => {
    let valueA = a[sortField];
    let valueB = b[sortField];
  
    if (valueA == null) return sortOrder === "asc" ? -1 : 1;
    if (valueB == null) return sortOrder === "asc" ? 1 : -1;
  
    if (sortField === "employee_id") {
      valueA = Number(valueA);
      valueB = Number(valueB);
    } else {
      valueA = String(valueA).toLowerCase();
      valueB = String(valueB).toLowerCase();
    }
  
    if (valueA > valueB) return sortOrder === "asc" ? -1 : 1;
    if (valueA < valueB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Apply pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container">
      <h1>Employees List</h1>
      <div>
        {/* Search input */}
        <input
          type="text"
          placeholder="Search by employee name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          style={{ margin: "10px 0", padding: "5px", width: "100%" }}
        />

        {/* Sorting options */}
        <div className="sort-container" style={{ marginTop: 20 }}>
          <label>Sort By:</label>
          <select value={sortField} onChange={(e) => setSortField(e.target.value as any)}>
            <option value="employee_id">Employee ID</option>
            <option value="full_name">Employee Name</option>
          </select>

          {/* Sorting by order */}
          <button onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "asc")}>
            {sortOrder === "asc" ? "🔼 Ascending" : "🔽 Descending"}
          </button>
        </div>
      </div>
      <hr />
      <div>
        <ul className="employee-list" id="emp-list">
          {paginatedEmployees.map((employee: any) => (
            <li key={employee.id} className="employee-item" title="Click for more info">
              <Form method="get" action={`/employees/${employee.id}`} style={{ cursor: "pointer" }}>
                <button type="submit" style={{ all: "unset", display: "block", width: "100%" }}>
                  <h2>Employee #{employee.id}</h2>
                  <img className="photo" src={employee.photoPath} alt="employee-photo" style={{ width: "100px", height: "100px", borderRadius: "50%", margin: 10 }} />
                  <ul>
                    <li>Full Name: {employee.full_name || "null"}</li>
                    <li>Email: {employee.email || "null"}</li>
                    <li>Phone Number: {employee.phone || "null"}</li>
                    <li>Job Title: {employee.job_title || "null"}</li>
                    <li>Department: {employee.department || "null"}</li>
                    {employee.cvPath && (
                      <li>
                        <a href={employee.cvPath} download>Download CV</a>
                      </li>
                    )}
                  </ul>
                </button>
              </Form>
            </li>
          ))}
        </ul>
      </div>
      <hr />

      {/* Pagination controls */}
      <div className="pagination">
        <a href="#emp-list">
          <button className="btn" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
            ◀ Prev
          </button>
        </a>
        <span> Page {currentPage} of {totalPages} </span>
        <a href="#emp-list">
          <button className="btn" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
            Next ▶
          </button>
        </a>
      </div>

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
