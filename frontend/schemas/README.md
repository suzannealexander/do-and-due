# Schemas

- `db.schema.ts`: This file contains interfaces for the database models themselves
- `fe.schema.ts`: This file contains interfaces only used to display/track data on the frontend
- `transaction.schema.ts`: This file contains interfaces describing the FE/BE expectations for transactions

## System Transaction/Schema Planning Notes

```
// api routes
/user/create
/user/view
    [returns basically all info about a user, their username/profile photo/groups they're a member of]

/group/create
    [create a group in the db]
/group/invite
    [add specific user ids to the group (don't worry about accepting invites for now, let it be 1-sided)]
/group/view
    [request detailed info about a group (other members, events, costs etc.)]


/event/create
    [create an event in a specific group, 1 specified day, assign members, and optionally attach costs]

/cost/share/update
    [update the paid status of a cost share]

// i don't think a view route is needed, we could use /group/view to get all events in a group for now

necessary mvp actions
1. authentication
    [
        needed parts:
        - user database model
        - create user api route
        - auth is set up already
        - view user details api route
    ]
    1. create user accounts
    2. validate user credentials (all the standard auth stuff)
    3. view user accounts

2. groups
    [
        needed parts:
        - group database model [label + members]
        - create group api route
        - add user to group api route
        - view group details api route (public/private variant {wait for later?})
    ]
    1. create groups
    2. add users to groups (we can ignore search etc for now)

3. events
    [
        needed parts:
    ]
    1. add events [some date + must at least be associated with group?]
    2. delete events
```

## Cost Sharing Implementation Details

The cost sharing feature allows users to:
1. Create costs that are attached to events and divided among household members
2. Track who paid for what and who owes money
3. Mark individual shares as paid or unpaid

### Models
- `Cost`: Represents an expense with a total amount, payer, and description, associated with a specific event
- `CostShare`: Represents a portion of a cost assigned to a specific user
  
### Schema Changes
1. Added the `Cost` model with an association to the `Event` model
2. Added a many-to-many relationship between `Cost` and `User` through the `CostShare` model
3. Each `CostShare` tracks an individual user's portion of the cost and whether it's paid
4. Updated `Event` schema to include associated costs
5. Updated frontend schemas and components to handle cost creation with events

### How It Works
1. When creating an event, users can optionally add an associated cost
2. The cost includes fields for name, category, amount, description, and payer
3. Users can distribute the cost evenly among event members with one click
4. Alternatively, users can specify custom amounts for each member
5. The UI validates that the sum of individual shares equals the total cost amount
6. Costs appear nested within their parent events in the UI
7. Users can expand events to view cost details and mark shares as paid

### Implementation Details
- Costs are created during event creation by toggling "Add Associated Cost"
- The event creation form dynamically shows cost fields when toggled
- Costs are displayed within the expanded event item in the UI
- The payment status of each share can be toggled with checkboxes

This implementation integrates costs directly with events, providing a cohesive way to track both responsibilities and financial obligations within a household.
