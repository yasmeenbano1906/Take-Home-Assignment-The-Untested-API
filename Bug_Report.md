# Bug Report

## Bug: Incorrect Pagination Offset

### Expected Behavior

When requesting page 1 with a limit of 2, the API should return the first two tasks.

For example:

* Task A
* Task B

### Actual Behavior

When requesting page 1 with a limit of 2, the API returned the third and fourth tasks instead.

For example:

* Task C
* Task D

### How I Discovered It

I first read through the existing codebase to understand how the task API and pagination logic worked. While reviewing the code, I noticed that the pagination offset calculation looked suspicious.

I then tested the pagination behavior and checked the results one by one. When requesting page 1 with a limit of 2, the first two tasks were skipped and the API returned later tasks instead. This confirmed that there was an issue with the pagination offset calculation.

Then i test all the service function to ensure any bug left.

The issue was reproduced using:

`GET /tasks?page=1&limit=2`

The tests initially failed because page 1 skipped the first two tasks.

### What a Fix Would Look Like

The pagination offset should be calculated using:

```js
const offset = (page - 1) * limit;
```

instead of:

```js
const offset = page * limit;
```

This makes page 1 start from the first task, page 2 from the third task.

### What I'd Test Next If I Had More Time

I would add tests for invalid pagination values, such as negative page numbers, zero or negative limits, and non-numeric values. I would also test more edge cases for task assignment and concurrent updates.

### The thing that Surprised Me in the Codebase

One thing I noticed was that the application uses an in-memory array to store tasks. This keeps the project simple, but all task data is lost whenever the server restarts.

I also found that the pagination logic had an off-by-one issue, which was not immediately obvious until I tested it with actual task data.

### Questions I'd Ask Before Shipping This to Production

Before production, I would ask:

* Which database should be used for persistent task storage?
* How should users and assignees be managed?
* Is authentication and authorization required?
* What are the expected pagination rules and limits?
* What logging, monitoring, and error-handling requirements should be followed?

### What I Learned

This assignment made me curious to understand backend APIs and testing more deeply. While working on it, I learned how to read an existing codebase, identify suspicious behavior, write tests to reproduce an issue, fix the bug, and add a new API feature with validation.

It also made me interested in learning more about API design, backend testing, databases, and how these kinds of APIs are handled in production. I would like to continue exploring these areas beyond the requirements of this assignment.
