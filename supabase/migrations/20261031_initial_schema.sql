-- Wayfare Schema Migration
-- Enables UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (syncs with auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Trips Table
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    travelers INTEGER NOT NULL DEFAULT 1 CHECK (travelers > 0),
    trip_type TEXT NOT NULL CHECK (trip_type IN ('solo', 'couple', 'group')),
    budget NUMERIC(10, 2) NOT NULL DEFAULT 1000.00 CHECK (budget >= 0),
    budget_currency TEXT NOT NULL DEFAULT 'USD',
    pace TEXT NOT NULL CHECK (pace IN ('relaxed', 'moderate', 'fast-paced')),
    interests TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('draft', 'planned', 'active', 'completed', 'archived')),
    share_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
    cover_image TEXT,
    ai_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Trip Members Table (for collaborators & preferences)
CREATE TABLE IF NOT EXISTS trip_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'editor', 'viewer')),
    dietary_preferences TEXT[] DEFAULT '{}',
    pace_preference TEXT CHECK (pace_preference IN ('relaxed', 'moderate', 'fast-paced')),
    budget_preference NUMERIC(10, 2),
    notes TEXT,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (trip_id, user_id),
    UNIQUE (trip_id, email)
);

-- 4. Itinerary Days Table
CREATE TABLE IF NOT EXISTS itinerary_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL CHECK (day_number > 0),
    date DATE NOT NULL,
    title TEXT,
    notes TEXT,
    theme TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (trip_id, day_number)
);

-- 5. Itinerary Items Table
CREATE TABLE IF NOT EXISTS itinerary_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_id UUID NOT NULL REFERENCES itinerary_days(id) ON DELETE CASCADE,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('attraction', 'dining', 'accommodation', 'transport', 'activity')),
    title TEXT NOT NULL,
    description TEXT,
    location_name TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
    cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (cost >= 0),
    travel_time_minutes INTEGER NOT NULL DEFAULT 0 CHECK (travel_time_minutes >= 0),
    travel_mode TEXT DEFAULT 'walking' CHECK (travel_mode IN ('walking', 'transit', 'driving', 'taxi', 'biking')),
    order_index INTEGER NOT NULL DEFAULT 0,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    booking_url TEXT,
    rating NUMERIC(2, 1) DEFAULT 4.5,
    tips TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_share_token ON trips(share_token);
CREATE INDEX IF NOT EXISTS idx_trip_members_trip_id ON trip_members(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_members_user_id ON trip_members(user_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_days_trip_id ON itinerary_days(trip_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_day_id ON itinerary_items(day_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_trip_id ON itinerary_items(trip_id);

-- Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_profiles ON profiles;
CREATE TRIGGER trigger_update_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trigger_update_trips ON trips;
CREATE TRIGGER trigger_update_trips BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trigger_update_itinerary_days ON itinerary_days;
CREATE TRIGGER trigger_update_itinerary_days BEFORE UPDATE ON itinerary_days FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trigger_update_itinerary_items ON itinerary_items;
CREATE TRIGGER trigger_update_itinerary_items BEFORE UPDATE ON itinerary_items FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;

-- Helper check functions for RLS
CREATE OR REPLACE FUNCTION is_trip_member(trip_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM trip_members
        WHERE trip_id = trip_uuid AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_trip_editor(trip_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM trips WHERE id = trip_uuid AND user_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM trip_members
        WHERE trip_id = trip_uuid AND user_id = auth.uid() AND role IN ('owner', 'editor')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Trips Policies
CREATE POLICY "Users can view own or member trips" ON trips
    FOR SELECT USING (
        auth.uid() = user_id OR is_trip_member(id)
    );

CREATE POLICY "Users can insert own trips" ON trips
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

CREATE POLICY "Trip owners/editors can update trips" ON trips
    FOR UPDATE USING (
        is_trip_editor(id)
    );

CREATE POLICY "Only trip owner can delete trip" ON trips
    FOR DELETE USING (
        auth.uid() = user_id
    );

-- Trip Members Policies
CREATE POLICY "Members can view other trip members" ON trip_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM trips WHERE id = trip_members.trip_id AND user_id = auth.uid()
        ) OR is_trip_member(trip_id)
    );

CREATE POLICY "Trip editors can add members" ON trip_members
    FOR INSERT WITH CHECK (
        is_trip_editor(trip_id)
    );

CREATE POLICY "Trip editors can update members" ON trip_members
    FOR UPDATE USING (
        is_trip_editor(trip_id)
    );

CREATE POLICY "Trip editors can remove members" ON trip_members
    FOR DELETE USING (
        is_trip_editor(trip_id)
    );

-- Itinerary Days Policies
CREATE POLICY "Users can view days for accessible trips" ON itinerary_days
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM trips WHERE id = itinerary_days.trip_id AND (user_id = auth.uid() OR is_trip_member(id))
        )
    );

CREATE POLICY "Trip editors can manage itinerary days" ON itinerary_days
    FOR ALL USING (
        is_trip_editor(trip_id)
    );

-- Itinerary Items Policies
CREATE POLICY "Users can view items for accessible trips" ON itinerary_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM trips WHERE id = itinerary_items.trip_id AND (user_id = auth.uid() OR is_trip_member(id))
        )
    );

CREATE POLICY "Trip editors can manage itinerary items" ON itinerary_items
    FOR ALL USING (
        is_trip_editor(trip_id)
    );
