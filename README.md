# TravelCart

AI-powered travel booking for the US-Africa corridor. Add your trip, set a target price, and let AI notify you when it's time to book.

## Features

- 🎯 **Smart Price Targets** - AI suggests optimal target prices based on historical data
- 📊 **Price Forecasting** - See expected prices and optimal booking windows
- 🗓️ **Dual Reminders** - Optimal date + fallback date calendar reminders
- 🔒 **Price Hold** - Lock in current price while waiting for better deals
- 🔔 **Push Notifications** - Get notified when prices hit your target
- 📈 **Price Trend Analysis** - See if prices are dropping or rising

## Tech Stack

- **Frontend:** Next.js 14, React 18, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Flight Data:** Amadeus Self-Service API
- **Hosting:** Vercel

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd travelcart-starter
npm install
```

### 2. Set up Amadeus

1. Go to [developers.amadeus.com](https://developers.amadeus.com)
2. Create an account and get API keys
3. Start with the **test environment** (free)

### 3. Set up Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to SQL Editor and run the schema:
   ```bash
   # Copy contents of supabase/schema.sql and run in SQL Editor
   ```
4. Get your project URL and keys from Settings > API

### 4. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
AMADEUS_CLIENT_ID=your_amadeus_key
AMADEUS_CLIENT_SECRET=your_amadeus_secret
AMADEUS_HOSTNAME=test

NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
travelcart-starter/
├── app/
│   ├── api/
│   │   ├── airports/search/     # Airport autocomplete
│   │   ├── flights/search/      # Flight search + price analysis
│   │   ├── cart/                # Cart CRUD operations
│   │   └── cron/check-prices/   # Background price checking
│   ├── page.tsx                 # Main app page
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── CartView.tsx             # Main cart/home screen
│   ├── FlightDetail.tsx         # Flight detail with forecast
│   └── AddTripModal.tsx         # Add trip flow
├── lib/
│   ├── amadeus.ts               # Amadeus API client
│   └── supabase.ts              # Supabase client
├── types/
│   └── database.ts              # TypeScript types for DB
└── supabase/
    └── schema.sql               # Database schema
```

## API Endpoints

### `GET /api/airports/search?keyword=lagos`
Search airports by keyword.

### `GET /api/flights/search`
Search flights with price analysis.

```
?origin=YYZ
&destination=LOS
&departureDate=2026-05-10
&returnDate=2026-05-18
&adults=1
&targetPrice=1150
```

Returns:
- Flight offers with prices
- Price analysis (is it a good deal?)
- Buy/Wait signal with reasoning

### `GET /api/cart`
Get user's cart items.

### `POST /api/cart`
Add item to cart. Automatically:
- Fetches current price
- Suggests target price
- Calculates buy/wait signal
- Records price history

### `PATCH /api/cart`
Update cart item (target price, hold status, calendar status).

### `DELETE /api/cart?id=xxx`
Remove item from cart.

### `GET /api/cron/check-prices`
Background job to check prices for all active items.
- Runs every 6 hours via Vercel Cron
- Updates prices and signals
- Creates notifications when triggers fire

## Amadeus APIs Used

| API | Purpose |
|-----|---------|
| [Flight Offers Search](https://developers.amadeus.com/self-service/category/flights/api-doc/flight-offers-search) | Find flights |
| [Flight Offers Price](https://developers.amadeus.com/self-service/category/flights/api-doc/flight-offers-price) | Confirm price |
| [Flight Price Analysis](https://developers.amadeus.com/self-service/category/flights/api-doc/flight-price-analysis) | Is it a good deal? |
| [Airport & City Search](https://developers.amadeus.com/self-service/category/flights/api-doc/airport-and-city-search) | Autocomplete |

## Buy/Wait Signal Logic

The AI signal is calculated based on:

1. **Target Hit** → BUY (high confidence)
2. **< 10 days to departure** → BUY (prices spike)
3. **Lowest 25% of prices** → BUY (great deal)
4. **Price rising sharply** → BUY (before it goes higher)
5. **Price dropping + far out** → WAIT (more savings likely)
6. **In sweet spot window** → BUY if reasonable price
7. **Default far out** → WAIT for sweet spot

## Routes Focus (MVP)

**US Origins:** NYC, Atlanta, DC, Houston, Chicago, Toronto

**African Destinations:** Lagos, Accra, Nairobi, Addis Ababa, Johannesburg, Casablanca, Kigali, Dakar, Cape Town, Dar es Salaam

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

Vercel Cron is automatically configured via `vercel.json`.

### Environment Variables for Production

```
AMADEUS_CLIENT_ID=production_key
AMADEUS_CLIENT_SECRET=production_secret
AMADEUS_HOSTNAME=production
CRON_SECRET=random_secret_for_cron_auth
```

## Development Roadmap

### Week 1-2: Foundation
- [x] Amadeus integration
- [x] Flight search API
- [x] Price analysis
- [x] Cart CRUD
- [x] Basic UI

### Week 3-4: Core Features
- [ ] Push notifications (Firebase)
- [ ] Calendar integration (.ics)
- [ ] Price hold flow
- [ ] User authentication

### Week 5-6: Polish
- [ ] Airport autocomplete UI
- [ ] Error handling
- [ ] Loading states
- [ ] Mobile optimization

### Week 7-8: Launch
- [ ] Landing page
- [ ] Waitlist
- [ ] Analytics
- [ ] Seed users

## Contributing

1. Fork the repo
2. Create feature branch
3. Make changes
4. Submit PR

## License

MIT

## Credits

Based on [Amadeus prototypes](https://amadeus4dev.github.io/developer-guides/examples/prototypes/):
- amadeus-flight-booking-node
- amadeus-flight-price-analysis-django

Built for the US-Africa diaspora travel corridor.
