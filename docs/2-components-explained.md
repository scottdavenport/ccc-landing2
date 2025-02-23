# Components Explained 🧩

Let's look at each main component and understand what it does!

## Public Components 🌍

### Hero.tsx
```tsx
// This is the big banner at the top of our landing page
export function Hero() {
  return (
    <div className="...">
      <h1>Welcome to CCC</h1>
      ...
    </div>
  );
}
```
- Shows the main welcome message
- Has a big eye-catching design
- Uses Tailwind CSS for styling (those className="..." parts)

### Sponsors.tsx
```tsx
// Shows all our sponsors in a nice grid
export function Sponsors() {
  return (
    <div className="grid">
      <SponsorCarousel />  {/* This makes the sponsors slide */}
    </div>
  );
}
```
- Displays all our sponsors
- Uses SponsorCarousel for a sliding effect
- Makes sponsors look nice and organized

### FundsRaised.tsx
```tsx
// Shows how much money we've collected
export function FundsRaised() {
  return (
    <div>
      <h2>Funds Raised</h2>
      <div className="text-3xl">$50,000</div>
    </div>
  );
}
```
- Shows our fundraising progress
- Makes big numbers easy to read
- Will be dynamic in the future

## Admin Components 🔒

### ConnectionStatus.tsx
```tsx
// Shows if we're connected to our database
export function ConnectionStatus() {
  const [status, setStatus] = useState('checking');
  
  useEffect(() => {
    // Checks connection every 30 seconds
    checkConnection();
  }, []);
  
  return (
    <div className={getStatusColor()}>
      {status === 'connected' ? '✅' : '❌'}
    </div>
  );
}
```
- Shows green when connected to Supabase
- Shows red if there's a problem
- Checks connection automatically
- Uses React hooks (useState and useEffect)

### AddSponsorForm.tsx
```tsx
// The form for adding new sponsors
export function AddSponsorForm() {
  const [name, setName] = useState('');
  
  async function handleSubmit() {
    // Sends new sponsor to database
    await supabase.from('sponsors').insert({ name });
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} />
      <button>Add Sponsor</button>
    </form>
  );
}
```
- Lets admins add new sponsors
- Connects to Supabase database
- Handles form submission
- Shows success/error messages

### SponsorsTable.tsx
```tsx
// Shows all sponsors in a table format
export function SponsorsTable() {
  const [sponsors, setSponsors] = useState([]);
  
  useEffect(() => {
    // Gets sponsors when component loads
    loadSponsors();
  }, []);
  
  return (
    <table>
      {sponsors.map(sponsor => (
        <tr key={sponsor.id}>
          <td>{sponsor.name}</td>
          <td>
            <button onClick={() => editSponsor(sponsor)}>Edit</button>
          </td>
        </tr>
      ))}
    </table>
  );
}
```
- Shows all sponsors in a table
- Lets admins edit/delete sponsors
- Updates in real-time
- Uses map to show many sponsors at once

## UI Components 🎨

These are small, reusable pieces we use everywhere:

### Button.tsx
```tsx
// A pretty button we can use anywhere
export function Button({ children, ...props }) {
  return (
    <button className="bg-blue-500 hover:bg-blue-700" {...props}>
      {children}
    </button>
  );
}
```
- Makes consistent-looking buttons
- Changes color when you hover
- Easy to reuse anywhere

### Alert.tsx
```tsx
// Shows important messages to users
export function Alert({ title, message, type = 'info' }) {
  return (
    <div className={getAlertStyle(type)}>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}
```
- Shows important messages
- Can be success, error, or info
- Used for feedback after actions

## Tips for Working with Components 💡

1. **Components are Like Building Blocks**
   - Each component does one specific thing
   - We can combine them to make bigger features
   - They're reusable - use them multiple times!

2. **State Management**
   - `useState` keeps track of changing data
   - `useEffect` runs code when things change
   - Always think: "What needs to update?"

3. **Props are Like Settings**
   - Props let us customize components
   - Pass them like HTML attributes
   - Check the component to see what props it needs

4. **Styling with Tailwind**
   - Classes like `bg-blue-500` mean "blue background"
   - `hover:` classes work when mouse is over
   - `flex` and `grid` help with layout

5. **Best Practices**
   - Keep components small and focused
   - Use clear names that say what they do
   - Add comments to explain tricky parts
   - Test your changes in the browser
