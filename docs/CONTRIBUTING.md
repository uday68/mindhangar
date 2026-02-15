# Contributing to MindHangar AI for Bharat

Thank you for your interest in contributing to MindHangar AI for Bharat! This project aims to democratize AI-powered education for Indian students across diverse linguistic, cultural, and socioeconomic backgrounds.

## 🌟 **Code of Conduct**

### Cultural Sensitivity
- Respect all Indian cultures, languages, and traditions
- Avoid stereotypes and generalizations
- Consult with native speakers for language implementations
- Test cultural adaptations with users from different regions

### Inclusive Development
- Consider users from rural and urban areas
- Design for low-end devices and slow networks
- Support multiple educational boards and systems
- Ensure accessibility for all abilities

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+ installed
- Git installed
- Basic understanding of React, TypeScript, and Tailwind CSS
- Familiarity with Indian education system (helpful but not required)

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/mindhangar-ai-for-bharat.git
   cd mindhangar-ai-for-bharat
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   ```bash
   cp .env.example .env
   # Add your Gemini API key and other credentials
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Run Tests**
   ```bash
   npm run test
   ```

## 📝 **Development Workflow**

### Branch Naming Convention
- `feature/language-selector-fix` - New features
- `bugfix/offline-mode-crash` - Bug fixes
- `hotfix/critical-security-issue` - Critical fixes
- `docs/api-documentation` - Documentation updates
- `test/cultural-filter-tests` - Test additions

### Commit Message Format
```
type(scope): subject

body (optional)

footer (optional)
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```
feat(language): add Tamil language support

- Implement Tamil translation files
- Add Tamil script rendering
- Test with native Tamil speakers

Closes #123
```

```
fix(offline): resolve cache invalidation issue

- Fix service worker cache strategy
- Add proper cache versioning
- Test offline functionality on 2G network

Fixes #456
```

## 🎯 **Contribution Areas**

### 1. Language & Localization
- Add new Indian language support
- Improve existing translations
- Fix script rendering issues
- Add voice input/output for languages

**Guidelines**:
- Use native speakers for translations
- Test on devices with proper font support
- Ensure cultural appropriateness
- Document regional variations

### 2. Educational Content
- Add CBSE/ICSE/State Board content
- Create JEE/NEET/UPSC question banks
- Align content with official syllabi
- Add Indian examples and case studies

**Guidelines**:
- Verify accuracy with official sources
- Follow exam patterns exactly
- Include explanations in multiple languages
- Test with actual students

### 3. Performance Optimization
- Reduce bundle size
- Optimize for slow networks
- Improve mobile performance
- Implement caching strategies

**Guidelines**:
- Test on 2G/3G networks
- Measure data usage
- Profile on low-end devices
- Document performance improvements

### 4. Cultural Adaptation
- Add Indian cultural references
- Implement festival calendars
- Create culturally appropriate examples
- Add regional preferences

**Guidelines**:
- Research cultural context thoroughly
- Consult with cultural experts
- Test with users from different regions
- Respect religious and cultural sensitivities

## 🧪 **Testing Requirements**

### Unit Tests
```bash
npm run test
```

All new features must include unit tests:
- Test component rendering
- Test state management
- Test service functions
- Test error handling

### Integration Tests
```bash
npm run test:integration
```

Test feature interactions:
- Language switching across components
- Offline sync workflows
- Multi-panel interactions
- API integrations

### Cultural Testing
- Test with native language speakers
- Verify cultural appropriateness
- Check regional variations
- Validate educational content accuracy

### Performance Testing
- Test on 2G/3G networks
- Measure data usage
- Profile on low-end devices (2GB RAM)
- Check load times

### Mobile Testing
- Test on 4-inch screens
- Verify touch targets (44x44px minimum)
- Check responsive layouts
- Test on actual Android devices

## 📋 **Pull Request Process**

### Before Submitting
1. ✅ Code follows style guidelines
2. ✅ All tests passing
3. ✅ Documentation updated
4. ✅ Tested on mobile devices
5. ✅ Tested with Indian language content
6. ✅ Cultural sensitivity verified
7. ✅ Performance impact assessed

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Tested on mobile devices
- [ ] Tested with Indian languages
- [ ] Performance tested

## Cultural Considerations
- [ ] Culturally appropriate
- [ ] Tested with native speakers
- [ ] Regional variations considered

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #issue_number
```

### Review Process
1. Automated tests run
2. Code review by maintainers
3. Cultural sensitivity review (if applicable)
4. Performance review (if applicable)
5. Approval and merge

## 🎨 **Code Style Guidelines**

### TypeScript
- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` type
- Use meaningful variable names

```typescript
// Good
interface UserProfile {
  id: string
  name: string
  preferredLanguage: string
}

// Bad
const data: any = {}
```

### React Components
- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Add JSDoc comments for complex components

```typescript
/**
 * Language selector component for Indian languages
 * Supports 8 Indian languages with regional scripts
 */
export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelect }) => {
  // Component implementation
}
```

### CSS/Tailwind
- Use Tailwind utility classes
- Follow mobile-first approach
- Ensure minimum touch target size (44x44px)
- Test on small screens

```tsx
// Good - Mobile-first, accessible
<button className="w-12 h-12 md:w-10 md:h-10 text-lg">
  Click
</button>

// Bad - Too small for mobile
<button className="w-6 h-6 text-xs">
  Click
</button>
```

### File Organization
```
src/
├── components/
│   ├── Layout/
│   ├── Panels/
│   ├── Shared/
│   └── Auth/
├── services/
│   ├── LanguageEngine.ts
│   ├── CulturalFilter.ts
│   └── CurriculumAdapter.ts
├── hooks/
│   ├── useLanguage.ts
│   └── useOffline.ts
├── types/
│   └── index.ts
├── data/
│   ├── indian-festivals.json
│   └── cbse-syllabus.json
└── i18n/
    └── messages/
```

## 🌍 **Localization Guidelines**

### Adding a New Language

1. **Create Translation File**
   ```bash
   # Create new language file
   touch src/i18n/messages/pa.json  # Punjabi example
   ```

2. **Add Translations**
   ```json
   {
     "app.title": "ਮਾਈਂਡਹੈਂਗਰ ਏਆਈ ਫਾਰ ਭਾਰਤ",
     "welcome.message": "ਸਵਾਗਤ ਹੈ",
     ...
   }
   ```

3. **Update Language List**
   ```typescript
   // src/i18n/index.ts
   export const SUPPORTED_LANGUAGES = [
     { code: 'pa', name: 'ਪੰਜਾਬੀ', script: 'Gurmukhi' },
     ...
   ]
   ```

4. **Test with Native Speakers**
   - Verify translations are accurate
   - Check cultural appropriateness
   - Test script rendering

### Translation Best Practices
- Use formal language for educational content
- Maintain consistent terminology
- Provide context for translators
- Test on actual devices with proper fonts

## 🐛 **Bug Reports**

### Before Reporting
1. Check if issue already exists
2. Test on latest version
3. Gather reproduction steps
4. Collect device/network information

### Bug Report Template
```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to...
2. Click on...
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- Device: [e.g., Redmi 9A]
- OS: [e.g., Android 10]
- Browser: [e.g., Chrome 120]
- Network: [e.g., 3G]
- Language: [e.g., Hindi]
- Board: [e.g., CBSE Class 10]

**Screenshots**
Add screenshots if applicable
```

## 💡 **Feature Requests**

### Feature Request Template
```markdown
**Problem Statement**
What problem does this solve for Indian students?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
What other approaches did you consider?

**Cultural Considerations**
How does this fit Indian educational context?

**Target Users**
Who will benefit from this feature?
```

## 📚 **Resources**

### Indian Education System
- [CBSE Official Website](https://cbse.gov.in/)
- [ICSE Official Website](https://cisce.org/)
- [JEE Main Information](https://jeemain.nta.nic.in/)
- [NEET Information](https://neet.nta.nic.in/)

### Language Resources
- [Unicode Standards for Indian Scripts](https://unicode.org/charts/)
- [Google Fonts - Indian Languages](https://fonts.google.com/?subset=devanagari)
- [Indic Language Computing](https://www.bhashaindia.com/)

### Cultural Resources
- [Indian Festivals Calendar](https://www.drikpanchang.com/)
- [Cultural Sensitivity Guidelines](https://www.india.gov.in/)

## 🤝 **Community**

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Discord**: Real-time chat (coming soon)
- **Email**: contact@mindhangar.in

### Getting Help
- Check documentation first
- Search existing issues
- Ask in GitHub Discussions
- Be respectful and patient

## 📄 **License**

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 **Acknowledgments**

Thank you to all contributors who help make education accessible for Indian students!

Special thanks to:
- Native language speakers who help with translations
- Teachers who provide educational content feedback
- Students who test and provide user feedback
- Cultural consultants who ensure appropriateness

---

**Questions?** Open an issue or start a discussion!

**Ready to contribute?** Pick an issue labeled `good-first-issue` or `help-wanted`!