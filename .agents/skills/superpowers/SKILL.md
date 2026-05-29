```markdown
# superpowers Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill introduces the core development patterns and conventions used in the `superpowers` TypeScript codebase. It covers file organization, import/export styles, commit message habits, and testing approaches. By following these guidelines, contributors can write consistent, maintainable code and collaborate effectively within the project.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `userProfile.ts`, `dataFetcher.ts`

### Import Style
- Use **relative imports** for modules within the project.
  - Example:
    ```typescript
    import { fetchData } from './dataFetcher';
    ```

### Export Style
- Use a **mixed export style** (both named and default exports are present).
  - Named export example:
    ```typescript
    export function calculatePower(level: number): number { ... }
    ```
  - Default export example:
    ```typescript
    export default SuperpowerManager;
    ```

### Commit Messages
- **Freeform** commit messages, with no enforced prefix.
- Average commit message length: ~24 characters.
  - Example:  
    ```
    fix user login bug
    ```

## Workflows

### Adding a New Feature
**Trigger:** When implementing a new capability or module  
**Command:** `/add-feature`

1. Create a new TypeScript file using camelCase naming.
2. Write your feature using relative imports for dependencies.
3. Export your main function or class (named or default as appropriate).
4. Add corresponding tests in a `.test.ts` file.
5. Commit with a concise, descriptive message.

### Fixing a Bug
**Trigger:** When resolving a defect or issue  
**Command:** `/fix-bug`

1. Locate the relevant module using camelCase file names.
2. Apply the fix, maintaining code style conventions.
3. Update or add tests in the corresponding `.test.ts` file.
4. Commit with a brief, clear message describing the fix.

### Writing Tests
**Trigger:** When adding or updating tests  
**Command:** `/write-test`

1. Create or update a test file matching the `*.test.*` pattern (e.g., `userProfile.test.ts`).
2. Write test cases for the relevant module or function.
3. Use the project's (unknown) test framework conventions.
4. Run tests to verify correctness.

## Testing Patterns

- Test files follow the `*.test.*` naming convention (e.g., `powerCalculator.test.ts`).
- The specific test framework is **unknown**, so follow existing patterns in the codebase.
- Place tests alongside or near the modules they cover.

  Example test file:
  ```typescript
  import { calculatePower } from './calculatePower';

  test('calculates correct power', () => {
    expect(calculatePower(5)).toBe(25);
  });
  ```

## Commands
| Command        | Purpose                                  |
|----------------|------------------------------------------|
| /add-feature   | Start the workflow for adding a feature  |
| /fix-bug       | Begin the process of fixing a bug        |
| /write-test    | Guide for writing or updating tests      |
```
