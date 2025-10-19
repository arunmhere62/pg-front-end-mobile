# Signup Flow Documentation

## Overview
A beautiful multi-step signup form that allows new users to register with organization and PG location details.

## Features

### ✨ User Experience
- **2-Step Form**: Clean, organized multi-step process
- **Step Indicator**: Visual progress indicator showing current step
- **Real-time Validation**: Immediate feedback on form errors
- **Cascading Dropdowns**: State and city selection based on country
- **Loading States**: Clear loading indicators for async operations
- **Responsive Design**: Works seamlessly on all screen sizes

### 🔐 Security
- Password confirmation validation
- Minimum 6-character password requirement
- Email format validation
- Phone number validation

### 🌍 Location Integration
- Fetches countries from API
- Loads states based on selected country
- Loads cities based on selected state
- Uses actual database IDs for submission

## Form Steps

### Step 1: Account Information
**Fields:**
- Organization Name * (required)
- Your Name * (required)
- Email Address * (required)
- Phone Number (optional)
- Password * (required, min 6 chars)
- Confirm Password * (required)

**Validations:**
- Email format check
- Password length (minimum 6 characters)
- Password match confirmation
- All required fields must be filled

### Step 2: PG Location Details
**Fields:**
- PG Name * (required)
- PG Address * (required, multiline)
- State * (required, dropdown with search)
- City * (required, dropdown with search)
- Pincode (optional)

**Validations:**
- All required fields must be filled
- State must be selected before city
- City selection depends on state

## API Integration

### Endpoints Used

1. **Get Countries**
   ```
   GET /api/v1/location/countries
   ```

2. **Get States by Country**
   ```
   GET /api/v1/location/states?countryCode=IN
   ```

3. **Get Cities by State**
   ```
   GET /api/v1/location/cities?stateCode=KA
   ```

4. **Signup**
   ```
   POST /api/v1/auth/signup
   ```

### Request Payload

```json
{
  "organizationName": "My PG Organization",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "9876543210",
  "pgName": "Green Valley PG",
  "pgAddress": "123 Main Street, City",
  "stateId": 1,
  "cityId": 1,
  "pgPincode": "560001"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Account created successfully. Please wait for admin approval.",
  "data": {
    "userId": 1,
    "pgId": 1,
    "organizationId": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

## Navigation Flow

```
LoginScreen
    ↓ (Click "Create New Account")
SignupScreen (Step 1)
    ↓ (Click "Next" after validation)
SignupScreen (Step 2)
    ↓ (Click "Create Account" after validation)
Success Alert
    ↓ (Click "OK")
LoginScreen
```

## Component Structure

```
SignupScreen
├── SafeAreaView (with blue header)
├── ScrollView (main content)
│   ├── Step Indicator (visual progress)
│   ├── Step 1 Form (if currentStep === 1)
│   │   ├── Organization Name Input
│   │   ├── Name Input
│   │   ├── Email Input
│   │   ├── Phone Input
│   │   ├── Password Input
│   │   └── Confirm Password Input
│   └── Step 2 Form (if currentStep === 2)
│       ├── PG Name Input
│       ├── PG Address Input (multiline)
│       ├── State Dropdown (scrollable)
│       ├── City Dropdown (scrollable, conditional)
│       └── Pincode Input
├── Bottom Action Bar (fixed)
│   ├── Back Button (if step > 1)
│   └── Next/Submit Button
└── Login Link (above action bar)
```

## State Management

### Form Data State
```typescript
interface FormData {
  // Organization & User Info
  organizationName: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  
  // PG Location Info
  pgName: string;
  pgAddress: string;
  pgPincode: string;
  
  // Location IDs
  countryCode: string;
  stateId: number | null;
  cityId: number | null;
}
```

### Dropdown Data State
```typescript
const [countries, setCountries] = useState<Country[]>([]);
const [states, setStates] = useState<State[]>([]);
const [cities, setCities] = useState<City[]>([]);
```

### Loading States
```typescript
const [loading, setLoading] = useState(false);
const [loadingStates, setLoadingStates] = useState(false);
const [loadingCities, setLoadingCities] = useState(false);
```

## Styling

### Color Scheme
- **Primary**: Blue (`Theme.colors.primary`)
- **Background**: Light gray (`Theme.colors.light`)
- **Text**: Dark gray (`Theme.colors.text.primary`)
- **Borders**: Light gray (`#E5E7EB`)
- **Selected**: Light blue (`#EEF2FF`)

### Layout
- **Padding**: 20px on all sides
- **Input Height**: Auto with 12px padding
- **Border Radius**: 8px for all inputs and buttons
- **Bottom Bar Height**: Fixed with 16px padding

## Error Handling

### Validation Errors
- Displayed via `Alert.alert()`
- Prevents form progression
- Clear error messages

### API Errors
- Catches network errors
- Displays user-friendly messages
- Extracted from `error.response?.data?.message`

### Common Error Messages
- "Please enter organization name"
- "Please enter a valid email"
- "Password must be at least 6 characters"
- "Passwords do not match"
- "Please select a state"
- "Please select a city"
- "Email already registered"
- "Phone number already registered"

## User Flow Example

1. **User opens app** → Sees Login screen
2. **Clicks "Create New Account"** → Navigates to Signup (Step 1)
3. **Fills account info** → Organization, name, email, password
4. **Clicks "Next"** → Validates and moves to Step 2
5. **Selects state** → Cities load automatically
6. **Selects city** → Fills remaining PG details
7. **Clicks "Create Account"** → Submits to API
8. **Success** → Shows alert and redirects to Login
9. **User status** → Account created as INACTIVE (awaits admin approval)

## Testing Checklist

### Step 1 Validation
- [ ] Empty organization name shows error
- [ ] Empty name shows error
- [ ] Invalid email format shows error
- [ ] Password less than 6 chars shows error
- [ ] Mismatched passwords show error
- [ ] Valid data allows progression to Step 2

### Step 2 Validation
- [ ] Empty PG name shows error
- [ ] Empty address shows error
- [ ] No state selected shows error
- [ ] No city selected shows error
- [ ] Valid data allows submission

### API Integration
- [ ] Countries load on mount
- [ ] States load when country is selected
- [ ] Cities load when state is selected
- [ ] Signup submits correct data
- [ ] Success redirects to Login
- [ ] Errors display properly

### UI/UX
- [ ] Step indicator updates correctly
- [ ] Back button works on Step 2
- [ ] Loading states show spinners
- [ ] Scrollable dropdowns work
- [ ] Selected items highlight
- [ ] Bottom bar stays fixed
- [ ] Login link works

## Future Enhancements

- [ ] Add country selection (currently defaults to India)
- [ ] Add profile image upload
- [ ] Add terms & conditions checkbox
- [ ] Add email verification
- [ ] Add password strength indicator
- [ ] Add search functionality in dropdowns
- [ ] Add form auto-save (draft)
- [ ] Add social login options
- [ ] Add OTP verification for phone
- [ ] Add address autocomplete

## Files Modified/Created

### Created
- `front-end/src/screens/auth/SignupScreen.tsx` - Main signup component
- `front-end/src/config/index.ts` - Config exports with API_BASE_URL

### Modified
- `front-end/src/navigation/AppNavigator.tsx` - Added Signup route
- `front-end/src/screens/auth/LoginScreen.tsx` - Added signup button

## Dependencies

- `axios` - HTTP client for API calls
- `react-native-safe-area-context` - Safe area handling
- `@react-navigation/native` - Navigation
- Theme system - Consistent styling

## Notes

- Default country is set to India (IN)
- User accounts are created with INACTIVE status
- Admin approval is required before login
- Password is currently stored as plain text (needs bcrypt hashing in backend)
- All location data comes from the database
- Form uses controlled components for all inputs
