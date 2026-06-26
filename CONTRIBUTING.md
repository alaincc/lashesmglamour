# Contributing Guidelines

Thank you for contributing to the **Lashes M Glamour** web project! To maintain code quality, consistency, and clean project history, please read and follow these development guidelines.

---

## 🛠️ Development Workflow

We use a standard branching workflow for all features, bug fixes, and document changes.

### 1. Branch Naming Conventions
Always create a new branch from `main` before starting your work. Choose a prefix representing the type of change:
- `feature/` for new pages, scripts, or layouts. E.g., `feature/booking-form`.
- `fix/` for bug fixes, alignment tweaks, or layout corrections. E.g., `fix/header-mobile-padding`.
- `docs/` for writing/updating documentation. E.g., `docs/add-api-architecture`.
- `refactor/` for restructuring existing styles or files without modifying behaviors. E.g., `refactor/css-variables`.

### 2. Git Process Flow
1. Fetch latest changes and checkout a new branch:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```
2. Develop your changes locally, following our [Coding Style Guidelines](#-coding-style-guidelines).
3. Commit your changes regularly. Keep commits focused and logically grouped.
4. Push your branch to the remote repository:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a Pull Request (PR) to merge into `main`.

---

## 📝 Commit Message Guidelines

To keep the project history easy to read and trace, commit messages should follow a light structured format:

```text
type(scope): brief description in imperative mood

Detailed explanation of the changes if necessary.
```

### Allowed Types
- **feat**: A new feature or component.
- **fix**: A bug fix.
- **docs**: Documentation only changes.
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.).
- **refactor**: A code change that neither fixes a bug nor adds a feature.
- **perf**: A code change that improves performance.
- **chore**: Updating dependencies, build configurations, or local tooling.

### Examples
- `feat(booking): implement service selector calendar`
- `fix(gallery): resolve grid alignment shift on tablets`
- `docs(readme): add setup instructions for local development`

---

## 💻 Coding Style Guidelines

### HTML Guidelines
- Always use semantic HTML tags. Avoid wrapping everything in generic `<div>` wrappers.
- Use double quotes `""` for all element attributes.
- Ensure all interactive elements (`<button>`, `<a>`, `<input>`) have unique, descriptive `id` attributes.
- Maintain accessibility standards by adding `alt` attributes on images, `aria-label` tags where necessary, and ensuring labels are connected to inputs.

### CSS Guidelines
- **No Inline Styles**: Never use `style="..."` on HTML tags.
- **Aesthetic Focus**: Adhere to our design system. Use CSS Variables defined in `css/variables.css` for colors, padding, and font-families.
- Avoid styling generic elements directly (e.g., writing `p { ... }` in component stylesheets) to prevent global pollution. Use descriptive classes instead.

### JavaScript Guidelines
- Write modern, clean JavaScript (ES6+ features: `const`, `let`, arrow functions, template literals, async/await).
- Group reusable methods or logic into utility files.
- Always cleanly comment code when implementing complex logic. Keep documentation current.
