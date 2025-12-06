# SlideBottomModal - Reusable Component Guide

## Overview
`SlideBottomModal` is a flexible, reusable bottom sheet modal component that slides up from the bottom of the screen with smooth animations. It's designed to be used for forms, confirmations, and any content that needs to be presented in a modal dialog.

## Features & Benefits

### ✨ Key Features
- **Smooth Animations**: Spring animation for slide-up, timing animation for slide-down
- **Flexible Content**: Accepts any React children as content
- **Customizable Header**: Built-in header with title, subtitle, and close button
- **Customizable Footer**: Built-in footer with cancel and submit buttons
- **Scrollable Content**: Optional scrollable content area for long forms
- **Keyboard Aware**: Automatically adjusts for keyboard on iOS and Android
- **Loading State**: Built-in loading state management for submit button
- **Backdrop Control**: Customizable backdrop opacity and close behavior
- **Full Customization**: Every element can be customized with style props

### 🎯 Benefits
1. **Reusability**: Use the same component for all bottom sheet modals
2. **Consistency**: Ensures consistent UI/UX across the app
3. **Flexibility**: Highly customizable for different use cases
4. **Performance**: Optimized animations using React Native's Animated API
5. **Developer Experience**: Simple props-based API, no complex state management needed
6. **Accessibility**: Built-in close button and backdrop interaction

## Props Reference

### Required Props
```typescript
visible: boolean              // Controls modal visibility
onClose: () => void          // Called when modal should close
title: string                // Modal title
children: React.ReactNode    // Modal content
```

### Optional Props

#### Display & Layout
```typescript
subtitle?: string            // Subtitle under title (default: undefined)
maxHeight?: number           // Maximum height of modal (default: 90% of screen)
minHeight?: number           // Minimum height of modal (default: 50% of screen)
borderRadius?: number        // Border radius of top corners (default: 24)
backdropOpacity?: number     // Opacity of backdrop (default: 0.5)
```

#### Header & Footer
```typescript
showHeader?: boolean         // Show/hide header (default: true)
showFooter?: boolean         // Show/hide footer (default: true)
showHandle?: boolean         // Show/hide drag handle bar (default: true)
headerIcon?: string          // Icon/emoji to show before title (default: undefined)
customHeader?: React.ReactNode    // Custom header component
customFooter?: React.ReactNode    // Custom footer component
```

#### Button Labels & Actions
```typescript
submitLabel?: string         // Submit button text (default: 'Submit')
cancelLabel?: string         // Cancel button text (default: 'Cancel')
onSubmit?: () => void | Promise<void>    // Submit button handler
onCancel?: () => void        // Cancel button handler
isLoading?: boolean          // Show loading state on submit button (default: false)
```

#### Behavior
```typescript
disableBackdropClose?: boolean    // Prevent closing on backdrop tap (default: false)
scrollEnabled?: boolean           // Enable scrollable content (default: true)
animationDuration?: number        // Duration of slide-down animation (default: 250ms)
animationTension?: number         // Spring animation tension (default: 65)
animationFriction?: number        // Spring animation friction (default: 11)
```

#### Styling
```typescript
contentContainerStyle?: ViewStyle      // Style for content container
headerStyle?: ViewStyle                // Style for header
footerStyle?: ViewStyle                // Style for footer
titleStyle?: TextStyle                 // Style for title text
subtitleStyle?: TextStyle              // Style for subtitle text
submitButtonStyle?: ViewStyle           // Style for submit button
cancelButtonStyle?: ViewStyle           // Style for cancel button
submitTextStyle?: TextStyle             // Style for submit button text
cancelTextStyle?: TextStyle             // Style for cancel button text
closeButtonStyle?: ViewStyle            // Style for close button
```

## Usage Examples

### Basic Usage
```typescript
import { SlideBottomModal } from './components/SlideBottomModal';

export const MyComponent = () => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button onPress={() => setVisible(true)} title="Open Modal" />
      
      <SlideBottomModal
        visible={visible}
        onClose={() => setVisible(false)}
        title="My Modal"
        subtitle="Additional info"
        submitLabel="Save"
        cancelLabel="Cancel"
        onSubmit={() => console.log('Submitted')}
      >
        <Text>Your content here</Text>
      </SlideBottomModal>
    </>
  );
};
```

### Form Modal with Loading
```typescript
const [loading, setLoading] = useState(false);

<SlideBottomModal
  visible={visible}
  onClose={() => setVisible(false)}
  title="✏️ Edit Profile"
  subtitle="Update your information"
  submitLabel="Update"
  isLoading={loading}
  onSubmit={async () => {
    setLoading(true);
    try {
      await updateProfile(formData);
      setVisible(false);
    } finally {
      setLoading(false);
    }
  }}
>
  <TextInput placeholder="Name" />
  <TextInput placeholder="Email" />
</SlideBottomModal>
```

### Custom Header & Footer
```typescript
<SlideBottomModal
  visible={visible}
  onClose={() => setVisible(false)}
  title="Custom Modal"
  showHeader={false}
  showFooter={false}
  customHeader={<CustomHeaderComponent />}
  customFooter={<CustomFooterComponent />}
>
  <Text>Content with custom header and footer</Text>
</SlideBottomModal>
```

### Styled Modal
```typescript
<SlideBottomModal
  visible={visible}
  onClose={() => setVisible(false)}
  title="Styled Modal"
  borderRadius={32}
  backdropOpacity={0.7}
  titleStyle={{ fontSize: 24, color: '#FF6B6B' }}
  submitButtonStyle={{ backgroundColor: '#FF6B6B' }}
  contentContainerStyle={{ paddingHorizontal: 24 }}
>
  <Text>Customized appearance</Text>
</SlideBottomModal>
```

### Prevent Backdrop Close
```typescript
<SlideBottomModal
  visible={visible}
  onClose={() => setVisible(false)}
  title="Confirmation"
  disableBackdropClose={true}
  onSubmit={handleConfirm}
>
  <Text>Are you sure? This action cannot be undone.</Text>
</SlideBottomModal>
```

## Real-World Implementation: BedFormModal

The `BedFormModal` component demonstrates the full power of `SlideBottomModal`:

```typescript
export const BedFormModal: React.FC<BedFormModalProps> = ({
  visible,
  onClose,
  onSuccess,
  roomId,
  roomNo,
  bed,
  pgId,
  organizationId,
  userId,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ /* ... */ });
  const [errors, setErrors] = useState({});

  const isEditMode = !!bed;

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      if (isEditMode) {
        await updateBed(bed.s_no, formData, headers);
      } else {
        await createBed(formData, headers);
      }
      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SlideBottomModal
      visible={visible}
      onClose={onClose}
      title={isEditMode ? '✏️ Edit Bed' : '🛏️ Add New Bed'}
      subtitle={`Room ${roomNo}`}
      submitLabel={isEditMode ? 'Update' : 'Create'}
      isLoading={loading}
      onSubmit={handleSubmit}
    >
      {/* Form fields */}
    </SlideBottomModal>
  );
};
```

## Animation Customization

### Spring Animation Parameters
The slide-up animation uses React Native's `Animated.spring()` with customizable parameters:

```typescript
// Default values
animationTension={65}      // Higher = faster, snappier animation
animationFriction={11}     // Higher = more damping, less bouncy
```

### Adjust for Different Effects
```typescript
// Snappy animation
<SlideBottomModal
  animationTension={100}
  animationFriction={15}
  // ...
/>

// Bouncy animation
<SlideBottomModal
  animationTension={40}
  animationFriction={5}
  // ...
/>
```

## Best Practices

1. **Always provide onClose**: Ensure the modal can be closed properly
2. **Use isLoading**: Show loading state during async operations
3. **Validate before submit**: Validate form data before calling onSubmit
4. **Handle errors gracefully**: Show error messages to users
5. **Keep content focused**: Don't put too much content in the modal
6. **Use icons in titles**: Add emojis/icons to make titles more visual
7. **Disable backdrop close for confirmations**: Prevent accidental dismissal
8. **Test on both platforms**: Ensure keyboard behavior works on iOS and Android

## Accessibility

- Close button is always visible and accessible
- Backdrop tap closes modal (unless disabled)
- Keyboard is handled automatically
- Loading state prevents multiple submissions
- Error messages are clearly displayed

## Performance Tips

- Use `scrollEnabled={false}` if content doesn't need scrolling
- Memoize modal content if it's complex
- Use `onSubmit` for async operations instead of inline handlers
- Keep animations smooth by avoiding heavy computations during animation

## Troubleshooting

### Modal doesn't close
- Ensure `onClose` is properly implemented
- Check if `disableBackdropClose` is preventing closure

### Keyboard overlaps content
- Ensure `KeyboardAvoidingView` is working (automatic)
- Increase `maxHeight` if needed

### Animation is choppy
- Reduce `animationTension` and `animationFriction`
- Check for heavy computations during animation

### Content is cut off
- Increase `maxHeight` prop
- Use `scrollEnabled={true}` for long content

## Migration Guide

If you're using an old modal component, here's how to migrate:

### Before
```typescript
<Modal visible={visible} animationType="slide">
  {/* Manual header, content, footer */}
</Modal>
```

### After
```typescript
<SlideBottomModal
  visible={visible}
  onClose={onClose}
  title="Title"
  onSubmit={handleSubmit}
>
  {/* Just content */}
</SlideBottomModal>
```

## Component Files
- **SlideBottomModal.tsx**: Main reusable component
- **BedFormModal.tsx**: Example implementation for bed management
- Can be used for: Tenant forms, Payment modals, Settings, Confirmations, etc.
