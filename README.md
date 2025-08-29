# Spanish Learning Game for Dutch Kids

A fun, interactive Spanish learning application designed specifically for Dutch children ages 6-8. Features engaging game modes, spaced repetition learning, and kid-friendly design with original animated characters.

## 🎮 Features

### Core Learning Games
- **Flashcards**: Learn new words with visual cues and audio pronunciation
- **Memory Game**: Match Spanish words with pictures 
- **Quiz**: Test vocabulary knowledge with multiple choice questions
- **Pronunciation Practice**: Speech recognition for speaking practice
- **Boss Quiz**: Advanced challenge mode with adaptive difficulty

### Learning System
- **Spaced Repetition**: Intelligent review scheduling based on performance
- **Adaptive Difficulty**: Automatically adjusts based on accuracy (reduces options if <70% accuracy)
- **Progress Tracking**: Comprehensive statistics and achievement system
- **60+ Spanish Words**: Across 5 themed categories (Greetings, Numbers, Animals, Colors, Food)

### Accessibility Features
- **Dutch Interface**: Complete UI localization for Dutch children
- **Dyslexia-Friendly Mode**: Special fonts and spacing
- **Adjustable Font Sizes**: Normal, Large, Extra Large options
- **Audio Controls**: Mute/unmute, subtitle toggles
- **Classroom Mode**: Reduced volumes and slower pacing (`?mode=class`)

### Progress & Achievements
- **8 Achievement Stickers**: Original SVG rewards for milestones
- **Export Progress**: JSON export for parents to track learning
- **Mastery Tracking**: Words progress through spaced repetition levels
- **Statistics Dashboard**: Accuracy, streaks, and category completion

## 🚀 Getting Started

### One-Click Launch in Replit
1. Open the Replit project
2. Click "Run" - the application will start automatically
3. No API keys or additional setup required
4. Access the game at the provided URL

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 🎯 Game Modes

### 1. Flashcards
- Interactive card flipping with Spanish → Dutch translation
- Audio pronunciation for each word
- Self-assessment with "I knew it" / "Not yet" options
- Adaptive hints based on difficulty settings

### 2. Memory Game  
- Match Spanish words with corresponding emoji images
- 6 pairs per game session
- Score tracking with attempts counter
- Celebration animations for completion

### 3. Quiz Mode
- Multiple choice questions with 2-6 options (adaptive)
- Category-based questions or mixed review
- Immediate feedback with explanations
- Progress tracking through question sets

### 4. Pronunciation Practice
- Speech recognition for Spanish pronunciation
- Visual feedback for pronunciation accuracy
- Fallback support for unsupported browsers
- Encouraging feedback for attempts

### 5. Boss Quiz (Advanced)
- 20 challenging questions focusing on difficulty 2-3 words
- Higher point values for harder words
- Achievement unlocking for high performance
- Complete progress summary with star ratings

## 🔧 Technical Architecture

### Frontend
- **React 18** with TypeScript for type safety
- **Wouter** for lightweight routing
- **TanStack Query** for server state management
- **Framer Motion** for smooth animations
- **Tailwind CSS** with custom kid-friendly color scheme
- **Radix UI** components for accessibility

### Backend
- **Node.js + Express** for API endpoints
- **In-memory storage** for development (no database required)
- **RESTful API** design for all game interactions
- **Session management** for user progress

### Audio System
- **Web Speech API** for text-to-speech with Spanish voices
- **Speech Recognition API** for pronunciation practice
- **Fallback audio synthesis** for unsupported browsers
- **Classroom mode** with reduced volumes

### Spaced Repetition
- **6-level progression** system (0=new, 6=mastered)
- **Interval scheduling**: 1, 3, 7, 14, 30, 90, 180 days
- **Adaptive difficulty**: Reduces options when accuracy <70%
- **Smart review scheduling** prioritizing due items

## 🎨 Design & Accessibility

### Kid-Friendly Design
- **Custom color palette**: Coral (#FF6B6B), Mint (#4ECDC4), Sunny (#FFE66D)
- **Rounded corners** and **bouncy animations** throughout
- **Large touch targets** optimized for small fingers
- **Child-safe fonts**: Nunito, Comic Neue, Fredoka One

### Accessibility Features
- **WCAG compliant** color contrasts
- **Keyboard navigation** support
- **Screen reader** compatible markup
- **Dyslexia-friendly** typography option
- **Adjustable font sizes** for visual needs

### Browser Support
- **Chrome Desktop** ✅ (Primary target)
- **Android Tablet** ✅ (Touch optimized)
- **Safari/Edge** ✅ (Limited speech features)
- **Firefox** ⚠️ (Basic functionality)

## 📊 Learning Progress

### Statistics Tracked
- Words learned and mastered
- Accuracy percentages (overall and recent)
- Current and longest streaks
- Time spent learning
- Category completion rates

### Achievement System
- **First Word**: Complete first vocabulary item
- **Streak Master**: 5 correct answers in a row
- **Category Champion**: Master a complete category
- **Speed Demon**: Quick response times
- **Pronunciation Pro**: Perfect speech recognition
- **Memory Champion**: Complete memory games
- **Quiz Master**: High quiz performance
- **Boss Conqueror**: Beat the boss quiz

## 🏫 Classroom Features

### Classroom Mode (`?mode=class`)
- **Reduced audio levels** for group settings
- **Slower speech rate** for better comprehension
- **Muted sound effects** to prevent distractions
- **Extended time limits** for responses

### Parent/Teacher Tools
- **Progress export** as JSON for tracking
- **No personal data collection** - privacy focused
- **Offline capability** for areas with limited internet
- **Reset options** for multiple students

## 🧪 Testing

### Unit Tests
- **Spaced repetition algorithms** with comprehensive coverage
- **Difficulty adjustment logic** validation
- **Progress calculation** accuracy tests
- **Achievement unlock** condition testing

### Manual Testing Checklist
- [ ] All game modes load and function correctly
- [ ] Audio plays in supported browsers
- [ ] Speech recognition works (Chrome/Edge)
- [ ] Progress saves between sessions
- [ ] Responsive design on tablet/desktop
- [ ] Accessibility features work as expected
- [ ] Classroom mode reduces audio appropriately

## 🔐 Privacy & Safety

### Kid-Safe Design
- **No external API calls** required for core functionality
- **No user accounts** or personal information collection
- **Local storage only** for progress data
- **No advertisements** or external content
- **Safe character designs** - original artwork only

### Data Handling
- All progress stored locally in browser
- Optional export for parent/teacher review
- No server-side user data storage
- GDPR compliant by design

## 🚀 Deployment

### Replit Deployment
The application is configured for one-click deployment on Replit:
1. Fork the repository
2. Click "Deploy" button
3. Application will be available at generated `.replit.app` URL
4. No additional configuration required

### Environment Variables
No environment variables required for basic functionality. All features work out-of-the-box.

## 📝 Development Notes

### Adding New Vocabulary
Edit `client/src/data/spanish-vocabulary.ts` to add new words:
```typescript
{
  id: 'new_word_id',
  spanish: 'hola',
  dutch: 'hallo', 
  category: 'saludos',
  difficulty: 1, // 1-3
  imageUrl: '👋'
}
```

### Creating New Game Modes
1. Create component in `client/src/pages/`
2. Add route in `client/src/App.tsx`
3. Update navigation in `client/src/components/navigation.tsx`
4. Add translations in `client/src/i18n/nl.json`

### Customizing Difficulty System
Modify `client/src/lib/difficulty-tuner.ts` to adjust:
- Accuracy thresholds for difficulty changes
- Time limits for responses
- Number of answer options
- Hint display logic

## 🤝 Contributing

This is an educational project focused on Spanish language learning for Dutch children. Contributions should maintain the kid-safe, educational focus of the application.

## 📄 License

Educational use only. Original character designs and stickers included.