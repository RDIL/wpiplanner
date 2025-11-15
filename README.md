# WPI Planner - Angular Port

This is a modern Angular port of the WPI Planner GWT application, using Angular 18 with standalone components.

## Setup

1. Install dependencies:
```bash
yarn install
```

2. Start the development server:
```bash
yarn start
```

The application will be available at `http://localhost:8888`

## Build

To build for production:
```bash
yarn build
```

The output will be in the `dist` directory.

## Project Structure

- `src/app/` - Angular components
- `src/models/` - Data models (ScheduleDB, Course, Section, etc.)
- `src/controllers/` - Business logic and state management
- `src/utils/` - Utility functions (parsers, storage, etc.)
- `src/index.html` - Main HTML file

## Development

The project uses:
- **Angular 18** with standalone components
- **TypeScript** for type safety

## Notes

- The application loads data from `new.schedb` (XML format)
