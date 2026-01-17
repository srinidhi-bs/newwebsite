# Personal Website Project Documentation

# MOST IMPORTANT THING:
Implement only one feature at a time (even if you have multiple features) so that:
1. Each feature can be properly tested before moving to the next
2. Changes are more manageable and easier to track
3. If any issues arise, it's easier to identify which change caused them
4. We can prioritize features based on importance
5. We can make adjustments to the implementation strategy based on feedback from each feature

# Before starting to implement any feature, the following things should be done:
1. Check if there is any existing similar feature
2. Check if any existing feature can be reused
3. Check if the feature is already implemented (if it's not, it should be implemented first)

## Project Overview
A modern, responsive personal website built with React.js, featuring various tools and sections including a powerful PDF Merger tool.

## Tech Stack
- React.js 18.2.0
- Tailwind CSS
- pdf-lib (PDF manipulation)
- pdfjs-dist (PDF rendering)
- @dnd-kit/core & @dnd-kit/sortable (Drag and drop)
- framer-motion (Animations)
- create-react-app with CRACO configuration

## Project Structure
```
srinidhibs-website/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.js
│   │   │   ├── Navigation.js
│   │   │   ├── Footer.js
│   │   │   ├── ThemeToggle.js
│   │   │   └── PageWrapper.js
│   │   ├── auth/
│   │   │   ├── Login.js
│   │   │   └── SignUp.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Finance.js
│   │   │   ├── Tools.js
│   │   │   ├── Travel.js
│   │   │   └── Contact.js
│   │   ├── tools/
│   │   │   └── pdf-merger/
│   │   │       └── PDFMerger.js
│   │   ├── calculators/
│   │   │   ├── EMICalculator.js
│   │   │   ├── HRACalculator.js
│   │   │   └── IncomeTaxCalculator.js
│   │   └── common/
│   │       └── ShareButton.js
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── firebase/
│   │   └── config.js
│   ├── utils/
│   │   └── calculatorUtils.js
│   ├── styles/
│   │   └── index.css
│   ├── App.js
│   └── index.js
├── public/
├── package.json
├── tailwind.config.js
└── craco.config.js
```

## Key Features

### 1. Authentication
- User registration and login functionality
- Google Sign-in integration
- Protected routes for authenticated users
- Dark mode compatible UI
- Responsive design for all screen sizes

### 2. PDF Tools Suite
Advanced PDF manipulation tools with the following capabilities:

#### PDF Merger
- Multiple PDF file upload
- Interactive page thumbnails
- Drag and drop reordering
- Page selection and deletion
- Real-time preview
- Dark mode support

Implementation Details:
- Uses pdf-lib for PDF manipulation
- Uses pdfjs-dist for page previews
- Implements thumbnail caching for performance
- Uses @dnd-kit for smooth drag and drop
- Maintains page selection state during reordering

#### PDF Splitter
- Single PDF file upload
- Dynamic page range selection
- Page preview for PDFs ≤ 10 pages
- Split and download as zip file
- Drag and drop file upload
- Comprehensive error handling

#### PDF to JPG Converter
- Single-page PDF to JPG conversion
- High-quality output
- Drag and drop file upload
- Client-side processing
- Instant download

#### JPG to PDF Converter
- Image to PDF conversion (JPG, JPEG, PNG)
- Maintains original dimensions
- High-quality output
- Drag and drop file upload
- Client-side processing

Common Features Across Tools:
- Responsive design
- Dark mode support
- Clear user instructions
- Progress indicators
- Error handling
- Drag and drop support

Recent Enhancements:
- Added PDF Splitter tool
- Added PDF to JPG converter
- Added JPG to PDF converter
- Improved drag and drop UX
- Added comprehensive error handling
- Added instructions sections

### 3. Website Navigation
- Responsive header with mobile menu
- Dark/light mode toggle
- Smooth transitions
- Active page highlighting

### 4. Financial Tools
- EMI Calculator
- HRA Calculator
- Income Tax Calculator
- Real-time calculations
- Input validation

### 5. Travel Section
- Photo galleries
- Travel stories
- Interactive maps
- Location-based content

## Development Guidelines

### Code Style
- Comprehensive JSDoc documentation
- Component-based architecture
- React Hooks best practices
- Tailwind CSS for styling
- Responsive design principles

### Performance Optimization
- React.memo for component memoization
- Thumbnail caching in PDF Merger
- Lazy loading for routes
- Image optimization
- Code splitting

### Dark Mode Implementation
- System preference detection
- Manual toggle option
- Persistent preference storage
- Consistent styling across modes

## Project Notes

### 🎯 Development Guidelines
1. Implement one feature at a time
2. Test thoroughly before moving to next feature
3. Keep changes manageable and trackable
4. Prioritize features based on importance
5. Adjust implementation based on feedback

### 🏗 Project Architecture
#### Tech Stack
- Frontend: React 18.2.0
- Authentication: Firebase Auth
- Database: Firebase Firestore
- Build System: CRACO

#### Key Components
1. Authentication System
   - Role-based access control
   - Google Sign-in integration
   - Admin approval workflow

2. Navigation
   - Dynamic routing based on auth state
   - Protected routes
   - Public routes: Finance, Trading
   - Private routes: Compliance Calendar, Admin Dashboard

### 🔄 Current Development State
#### Active Features
1. Authentication System (In Progress)
   - ✅ Google Sign-in implementation
   - ✅ Role-based access
   - ✅ User approval workflow
   - 🚧 Email notifications
   - 🚧 Multi-factor authentication

#### Known Issues
- Cross-origin authentication challenges
- Edge cases in user registration
- Security improvements needed

### 📝 Development Notes
#### Authentication System (Last Updated: [Current Date])
1. User Registration Flow:
   - Collect company details
   - Google authentication
   - Create Firestore document
   - Set approval status
   - Role-based redirection

2. Security Rules:
   - Admin emails auto-approved
   - Non-admin requires manual approval
   - Document-level security in Firestore

### 🗓 Version History
- v1.0.0: Initial release
- v1.1.0: PDF Merger implementation
- v1.2.0: Dark mode support
- v1.3.0: Financial calculators
- v1.4.0: Travel section
- v1.5.0: Authentication system enhancement

### 📋 Best Practices
1. Code Organization:
   - Keep components modular
   - Use consistent naming conventions
   - Document complex logic

2. Git Workflow:
   - Create feature branches
   - Write descriptive commit messages
   - Regular commits for trackability

3. Testing:
   - Test each feature thoroughly
   - Document edge cases
   - Maintain test coverage

### 🔜 Next Steps
1. Implement email notifications
2. Add multi-factor authentication
3. Create advanced admin dashboard
4. Enhance error handling
5. Add authentication logging

## Deployment

### Production Build
```bash
npm run build
```

### Server Configuration
- .htaccess for client-side routing
- Asset path configuration
- Error page setup

### InfinityFree Hosting
- FTP Details:
  - Host: ftpupload.net
  - Port: 21
  - Public directory: htdocs/public_html

## Future Enhancements
1. PDF Merger Tool


2. Website Features


3. Performance


## Testing
- Component unit tests
- Integration tests
- Performance monitoring
- Cross-browser testing
- Mobile responsiveness testing

## Maintenance
- Regular dependency updates
- Performance monitoring
- Error tracking
- User feedback collection
- Feature request tracking

## Support
For questions or issues:
- Check documentation
- Review component comments
- Test in development environment
- Verify browser console
- Check network requests

## Version History
- v1.0.0: Initial release
- v1.1.0: PDF Merger implementation
- v1.2.0: Dark mode support
- v1.3.0: Financial calculators
- v1.4.0: Travel section
- v1.5.0: Enhanced PDF Merger with drag & drop

This documentation will be continuously updated as the project evolves.
