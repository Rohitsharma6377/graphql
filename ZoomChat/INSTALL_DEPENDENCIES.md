# Package.json Dependencies to Add

## Required Dependency

Add this to your project:

```bash
npm install mongoose
```

## Or manually add to package.json:

```json
{
  "dependencies": {
    "mongoose": "^8.0.0"
  }
}
```

Then run:
```bash
npm install
```

## TypeScript Types (if needed)

Mongoose includes its own TypeScript definitions, so no @types package is needed.

## Verification

After installation, verify:

```bash
npm list mongoose
```

You should see:
```
└── mongoose@8.x.x
```

## Complete Installation Command

Run this single command to install all dependencies:

```bash
npm install mongoose && npm run dev
```

This will:
1. Install mongoose
2. Start the development server
3. Make the admin panel accessible at http://localhost:3000/admin
