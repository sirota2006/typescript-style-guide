# Coding Guidelines

Coding guidelines as set of conventions (sometimes arbitrary) and best practices used to create consistent, maintainable code.

Since "consistency is the key" majority of rules is enforced by automated tooling as ESLint, TypeScript, Prettier, etc.  
Still certain design and architectural decisions must be followed which are covered with described conventions bellow.

## TLDR

- **Code is organized and grouped by feature.** Place code as close to where it's relevant as possible.
- Strive for data immutability.
- Strive for functions to be pure, stateless and have single responsibility.
- Use of server-state library is encouraged ([react-query](https://tanstack.com/query/latest)).
- Use of client-state library for global state is not allowed.  
  Reconsider if something should be truly global across application, e.g. `themeMode`, `Permissions` or even that can be put in server-state user settings (e.g. `/me` endpoint). If still truly needed use [Zustand](https://github.com/pmndrs/zustand) (no Redux).
- Use named exports. In case of exceptions disable [eslint rule](https://github.com/mkosir/frontend-monorepo-boilerplate/blob/main/packages/config-eslint/index.js#L78) (e.g. Next.js pages).

## Code Collocation

- Every application or package in monorepo has project files/folders organized and grouped by **feature**.
- **Place code as close to where it's relevant as possible.**
- Deep folder nesting does not represent an issue.
- [Relevant article](https://kentcdodds.com/blog/colocation) on code collocation.

## Project Structure

Every application has following file/folder structure:

```shell
apps/
├─ product-manager/
│  ├─ common/
│  │  ├─ components/
│  │  │  ├─ ProductTitle/
│  │  │  ├─ ...
│  │  │  └─ index.tsx
│  │  ├─ consts/
│  │  │  ├─ paths.ts
│  │  │  └─ ...
│  │  └─ types/
│  ├─ modules/
│  │  ├─ HomePage/
│  │  ├─ ProductAddPage/
│  │  ├─ ProductPage/
│  │  ├─ ProductsPage/
│  │  │  ├─ api/
│  │  │  │  └─ useGetProducts/
│  │  │  ├─ components/
│  │  │  │  ├─ ProductItem/
│  │  │  │  ├─ ProductsStatistics/
│  │  │  │  └─ ...
│  │  │  ├─ utils/
│  │  │  │  └─ filterProductsByType/
│  │  │  └─ index.tsx
│  │  ├─ ...
│  │  └─ index.tsx
│  └─ pages/
│     ├─ products/
│     │  ├─ [id].tsx
│     │  ├─ add.tsx
│     │  ├─ index.tsx
│     ├─ _app.tsx
│     ├─ index.tsx
│     └─ ...
├─ warehouse/
├─ admin-dashboard/
└─ ...
```

- `modules` folder is responsible for implementation of each individual page (routed from `pages` folder)
- `pages` folder serves as a router, where its only responsibility is to define routes
- `common` folder is responsible for implementations that are truly used across application.  
  Since its a "global folder" it should be used sparingly (codebase tries to follow grouped by feature project structure as much as possible).

## Data immutability

Majority of the data should be immutable (use `Readonly`, `ReadonlyArray`, always return new array, object etc). To keep cognitive load low for future developers try to keep data objects small.  
Mutations should be used sparingly in cases when necessary: complex objects, performance reasoning etc.

## Functions

Since React components and hooks are also functions, convention should be followed as much as possible.

- Function should have single responsibility.
- Function should be stateless (not to be confused with React state) where the same input arguments return same value every single time.
- Function should accept at least one argument and return data.
- Function should not have side effects, but be pure. It's implementation should not modify or access variable value outside its local environment (global state, fetching etc.).

<details>
<summary>Potential exceptions of react components and hooks</summary>

```ts
// No input arguments.
const Logo = () => {
  return (
    <svg width="100" height="100">
      <circle cx="50" cy="50" r="40"></circle>
      <text x="50%" y="50%">
        Icon
      </text>
    </svg>
  );
};

// Parent React component with side effects.
const ProductsPage = () => {
  const { data: products } = useFetchProducts();

  return (
    <div>
      {products.map((product) => (
        <ProductItem name={product.name} />
      ))}
    </div>
  );
};

// React hook with side effects.
const useGetUsers: UseGeUsers = ({ country, isActive }) =>
  useQuery(["fetchUsers", { country, isActive }], () =>
    fetchUsers({ country, isActive })
  );
```

</details>

## Variables

- Create const assertion (`as const`) whenever object or array should be immutable and inferred as a literal type.
  - type is narrowed
  - object and array gets `readonly` properties
- Prefer object const assertion over enum.
- Prefer using `null` instead of `undefined`, to explicitly state it has no value (assignment, return type).

## Types

- All types are defined with `type` alias ([eslint rule](https://typescript-eslint.io/rules/consistent-type-definitions/#type)).  
  In case of exceptions, most commonly declaration merging (extending third-party library types - [example](https://github.com/mkosir/trpc-api-boilerplate/blob/main/src/utils/types/process-env.ts#L14)), use `interface` and disable linter.
- Array types are defined with `generic` syntax ([eslint rule](https://typescript-eslint.io/rules/array-type/#generic)).

  ```ts
  const x: Array<string> = ["a", "b"];
  const y: ReadonlyArray<string> = ["a", "b"];
  ```

## Naming

Strive to keep naming conventions consistent and readable, because another person will maintain the code you have written.  
There is no convention on cache invalidation, but for the second hardest thing, bellow conventions should be followed:

- #### React components
  Pascal case (`ProductItem`, `ProductsPage`)
- #### Prop Types
  React component name following "Props" postfix `[ComponentName]Props` - (`ProductItemProps`, `ProductsPageProps`)
- #### Functions
  Camel case (`filterProductsByType`, `useGetProducts`)
- #### Variables
  - #### Locals (`products`, `productsFiltered`)
  - ##### Booleans
    Prefixed with `is`, `has` etc. (`isProduct`)
  - ##### Constants
    `PRODUCT_ID`
  - #### Object constants
    Singular and capitalized.
    ```ts
    const OrderStatus = {
      pending: "pending",
      fulfilled: "fulfilled",
      error: "error",
    } as const;
    ```
- #### Generics

  A name followed by the capital letter T ( `RequestT`, `FooBarT`).  
  Avoid naming generics with one character (`T`, `K` etc.), the more variables we introduce, the easier it is to mistake them.

  ```ts
  const createPair = <FirstT, SecondT extends string>(
    first: FirstT,
    second: SecondT
  ): [FirstT, SecondT] => {
    return [first, second];
  };
  const pair = createPair(1, "a");
  ```

## React Components

### Component Types

- Container:
  - All container components have postfix "Container" or "Page" `[ComponentName]Container|Page`
  - Each feature has a container component (`AddUserContainer.tsx`, `EditProductContainer.tsx`, `ProductsPage.tsx` etc.)
  - Includes business logic.
  - API integration.
  - Expected file/folder structure:
  ```
  ProductsPage/
  ├─ api/
  │  └─ useGetProducts/
  ├─ components/
  │  └─ ProductItem/
  ├─ utils/
  │  └─ filterProductsByType/
  └─ index.tsx
  ```
- UI - Feature specific
  - Representational components that are designed to fulfill feature requirements.
  - Should follow functions conventions as much as possible.
  - No API integration.
  - Expected file/folder structure:
  ```
  ProductItem/
  ├─ index.tsx
  ├─ ProductItem.stories.tsx
  └─ ProductItem.test.tsx
  ```
- UI - Design system
  - Reusable/generic types of components used throughout whole monorepo.
  - Expected file/folder structure:
  ```
  Button/
  ├─ index.tsx
  ├─ styled.tsx (optional)
  ├─ Button.stories.tsx
  └─ Button.test.tsx
  ```

### Passing Data

- Prop drilling should not become an issue, if it does [break out your render method](https://kentcdodds.com/blog/prop-drilling#how-can-we-avoid-problems-with-prop-drilling).
- When defining event handler (callback) prop, prefix it with `on*` (e.g. `onClick`) and actual handler implementation function with prefix `handle*` (e.g. `handleClick`) - ([eslint rule](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-handler-names.md)).

  ```ts
  <MyComponent onClick={handleClick} />
  ```

- Component composition is not allowed.
- Fetching of data is only allowed in container components.
- Use of server-state library is encouraged ([react-query](https://tanstack.com/query/latest)).
- use of client-state library for global state is not allowed.  
  Reconsider if something should be truly global across application, e.g. `themeMode`, `Permissions` or even that can be put in server-state user settings (e.g. `/me` endpoint). If still truly needed use [Zustand](https://github.com/pmndrs/zustand) (no Redux).

## Tests

Test can be run through npm scripts, but it's highly encouraged to use [Jest Runner](https://marketplace.visualstudio.com/items?itemName=firsttris.vscode-jest-runner) VS code extension so any monorepo app/package single test can be run [instantly](https://github.com/mkosir/typescript-react-guidelines/raw/main/misc/vscode-jest-runner.gif).

```shell
code --install-extension firsttris.vscode-jest-runner
```

- All test descriptions follows naming convention as `it('should ... when ...')` ([eslint rule](https://github.com/mkosir/frontend-monorepo-boilerplate/blob/main/packages/config-eslint/index.js#L49)).
- Snapshot tests are not allowed in order to avoid fragility, regular updates of it, to have all the tests "green".  
  Exceptions can be made, with strong rational behind it , where its output is short/clear intent, whats actually being tested (e.g. design system library critical elements that shouldn't deviate).

## Conventions enforced by automated tooling

Some highlighted conventions enforced by automated tooling:

- Whole codebase is written in TypeScript strict mode with enabled ESlint [Strict Configuration](https://typescript-eslint.io/docs/linting/configs#strict).
- Use named exports. In case of exceptions disable [eslint rule](https://github.com/mkosir/frontend-monorepo-boilerplate/blob/main/packages/config-eslint/index.js#L78) (e.g. Next.js pages).