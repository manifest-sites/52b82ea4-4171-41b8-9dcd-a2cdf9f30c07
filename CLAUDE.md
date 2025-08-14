You are creating a react app. The app already exists; you are modifying it. The entry point is src/App.jsx. You should keep the <Monetization></Monetization> surrounding tags and build everything inside of those.

Do not read or interact with files outside the current working directory and subfolders within it (i.e. do not go into the parent folder).

Start by reading relevant files but don't write any code.

Then make a plan for how to approach a specific problem or request.

Then implement its solution in code.

All layouts and designs should be visually appealing and follow modern design best practices. All layouts should also be responsive, working well for both desktop and mobile designs.

Use tailwind for all styling. Don't write custom CSS unless absolutely necessary.

You can create components and use components from the antd component library. For reference on how to use them, see https://ant.design/components/overview/

You have bash permissions to run "npm install..." in order to add additional packages.

You can create database schemas by adding a JSON file with that schema to entities/[ObjectName].json

For example: src/entities/Items.json

Here is the structure it must use:
{
    "name": "Item",
    "type": "object",
    "properties": {
      "userId": {
        "type": "number",
        "description": "Unique identifier for the user who owns the to do list item"
      },
      "id": {
        "type": "number",
        "description": "Unique identifier for the to do list item"
      },
      "title": {
        "type": "string",
        "description": "Name of to do list item"
      },
      "completed": {
        "type": "boolean",
        "description": "Whether the to do list item is complete"
      }
    },
    "required": [
      "name",
      "is_complete"
    ]
  }

Any schemas defined like this can automatically be called in a component like this. Do NOT create the js files for each entity (e.g. /src/entities/Item.js). Those are automatically generated.

import { Item } from './entities/Item'

And the following functions are available:

Item.list()
Item.get(:id)
Item.create(object)
Item.update(:id, object)

The response of these calls is structured like this:

{
    "success": true,
    "message": "Operation completed successfully",
    "data": [
        {
            "_id": "68731fb0414ee37e6c198249",
            "title": "Super Item!",
            "completed": true,
            "createdAt": "2025-07-13T02:53:36.988Z",
            "updatedAt": "2025-07-13T03:12:15.495Z"
        }
    ],
    "count": 1
}

Or if only a single response is accepted, data will be an object, not an array:

{
    "success": true,
    "message": "Operation completed successfully",
    "data": {
        "_id": "68731fb0414ee37e6c198249",
        "title": "Super Item!",
        "completed": true,
        "createdAt": "2025-07-13T02:53:36.988Z",
        "updatedAt": "2025-07-13T03:12:15.495Z"
    },
    "count": 1,
    "projectId": "manifest-user-01",
    "collection": "Item"
}

Use this wherever the user needs to store persistant data.

# Logout

To logout a user from anywhere in the app:

// Import the logout function
import { logout } from '../utils/auth'

// Call it directly (async function that handles everything)
logout()

// Or use await if you need to handle completion
await logout()

The logout function:
- Makes a POST request to the app-specific logout endpoint
- Automatically includes credentials
- Reloads the page on successful logout to reset app state

## Debugging browser/console errors

When the task involves reproducing or fixing runtime errors in the browser:

1) Start the dev server
- Read package.json to detect the dev script and port.
- Run: `npm run dev` (or `yarn dev` / `pnpm dev`) and wait until the server prints the local URL (usually http://localhost:xxxx).

2) Launch a headless browser with the Puppeteer MCP
- Open the local URL.
- Subscribe to page `console`, `pageerror`, and failed `request` events.
- Save console output to `tmp/console.log` and capture a screenshot on any error to `tmp/error-<timestamp>.png`.
- Example MCP actions: navigate to the URL, click through the UI to reproduce, evaluate small snippets to inspect state, and take screenshots at key steps.

3) Report + fix
- Summarize the exact repro steps, first failing stack/console lines, and any network failures.
- Propose the minimal code change, implement it, and re-run the same automated steps to verify the console is clean.
- Include before/after screenshots and the relevant excerpt of `tmp/console.log` in the summary.

4) Cleanup
- Stop any dev servers you started.