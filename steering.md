1. Scaffold the full project structure: React + TypeScript frontend, Node/Express backend, Prisma with PostgreSQL
2. Generate the Prisma schema covering all five Fact Sheet types (BusinessCapability, Application, TechnologyComponent, DataObject, Integration) plus the shared base fields and the Relationship join table
3. Build the backend REST API: one router per Fact Sheet type with list, getById, create, update, and archive endpoints. Include global search endpoint.
4. Build the React shell: sidebar navigation, routing (one route per Fact Sheet type + dashboard), and a shared layout component
5. Build the list view component (reusable) and wire it up for Applications first as a reference implementation
6. Build the detail view component and wire it up for Applications, including the relationship panel
7. Repeat list + detail for the remaining four Fact Sheet types
8. Build the dashboard home page
9. Build the landscape matrix view (Applications vs Business Capabilities)
10. Build the integration map using React Flow

After each step, confirm what was built and what comes next. Do not skip ahead.