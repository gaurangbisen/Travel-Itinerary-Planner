import sys
import asyncio
import httpx
from app.main import app

async def run_all_tests():
    print("=== STARTING WAYFARE API TEST SUITE ===")
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health
        res = await client.get("/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        data = res.json()
        assert data["status"] == "healthy"
        assert data["ai_mode"] == "mock"
        print("[PASS] 1. Health check endpoint")

        # 2. Auth login
        res = await client.post("/api/v1/auth/login", json={"email": "alex@wayfare.ai"})
        assert res.status_code == 200
        token_data = res.json()
        assert "access_token" in token_data
        assert token_data["user"]["email"] == "alex@wayfare.ai"
        token = token_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("[PASS] 2. Auth login and token generation")

        # 3. List Trips
        res = await client.get("/api/v1/trips", headers=headers)
        assert res.status_code == 200
        trips = res.json()
        assert len(trips) >= 3
        tokyo_trip = next((t for t in trips if "Tokyo" in t["destination"]), None)
        assert tokyo_trip is not None
        print(f"[PASS] 3. List trips (found {len(trips)} seeded trips: Tokyo Solo, Paris Couple, Barcelona Group)")

        # 4. Get Trip Details
        trip_id = tokyo_trip["id"]
        res = await client.get(f"/api/v1/trips/{trip_id}", headers=headers)
        assert res.status_code == 200
        detail = res.json()
        assert len(detail["days"]) >= 2
        print(f"[PASS] 4. Trip details retrieval ({len(detail['days'])} days, {len(detail['days'][0]['items'])} items)")

        # 5. Cost Summary & Analytics
        res = await client.get(f"/api/v1/trips/{trip_id}/cost-summary", headers=headers)
        assert res.status_code == 200
        cost = res.json()
        assert "categories" in cost
        assert "days" in cost
        assert cost["total_cost"] > 0
        print(f"[PASS] 5. Cost summary computed: Total ${cost['total_cost']:.2f} (Budget: ${cost['budget']:.2f})")

        # 6. Suggest 3 Alternatives
        day1 = detail["days"][0]
        item_to_alt = day1["items"][1]
        res = await client.post(
            "/api/v1/itinerary/items/suggest-alternatives",
            json={"item_id": item_to_alt["id"]},
            headers=headers
        )
        assert res.status_code == 200
        alts = res.json()
        assert len(alts["alternatives"]) == 3
        print(f"[PASS] 6. Suggest alternatives (3 replacements generated for '{item_to_alt['title']}')")

        # 7. Item Lock Toggle
        res = await client.post(f"/api/v1/itinerary/items/{item_to_alt['id']}/toggle-lock", headers=headers)
        assert res.status_code == 200
        toggled = res.json()
        assert toggled["is_locked"] is True
        print(f"[PASS] 7. Lock item toggle successfully locked item")

        # 8. Single Day Regeneration (Preserving Locked Items)
        locked_item = next(i for i in day1["items"] if i.get("is_locked"))
        locked_title = locked_item["title"]
        res = await client.post(
            "/api/v1/itinerary/regenerate-day",
            json={
                "day_id": day1["id"],
                "instructions": "Add cozy tea rooms and quieter parks"
            },
            headers=headers
        )
        assert res.status_code == 200
        regen_trip = res.json()
        regen_day1 = regen_trip["days"][0]
        titles = [i["title"] for i in regen_day1["items"]]
        assert locked_title in titles
        print(f"[PASS] 8. Single day regenerated with instruction; verified locked item '{locked_title}' was preserved")

        # 9. Public Share Token View (No auth required)
        share_token = tokyo_trip["share_token"]
        res = await client.get(f"/api/v1/trips/share/{share_token}")
        assert res.status_code == 200
        shared = res.json()
        assert shared["destination"] == "Tokyo, Japan"
        print(f"[PASS] 9. Public read-only share link accessible: {share_token}")

        # 10. Calendar ICS Export
        res = await client.get(f"/api/v1/trips/{trip_id}/export/ics", headers=headers)
        assert res.status_code == 200
        assert b"BEGIN:VCALENDAR" in res.content
        assert b"BEGIN:VEVENT" in res.content
        print(f"[PASS] 10. ICS calendar export generated ({len(res.content)} bytes)")

        # 11. Printable PDF/HTML Export
        res = await client.get(f"/api/v1/trips/{trip_id}/export/pdf", headers=headers)
        assert res.status_code == 200
        assert "Wayfare Itinerary" in res.text
        print(f"[PASS] 11. Printable PDF/HTML export generated ({len(res.text)} chars)")

        # 12. Create New Trip & Generate Full Itinerary
        create_res = await client.post(
            "/api/v1/trips",
            json={
                "title": "Kyoto Autumn Garden Odyssey",
                "destination": "Kyoto, Japan",
                "start_date": "2026-11-15",
                "end_date": "2026-11-17",
                "travelers": 2,
                "trip_type": "couple",
                "budget": 1500.0,
                "budget_currency": "USD",
                "pace": "relaxed",
                "interests": ["Culture", "Nature", "Photography", "Foodie"],
                "status": "planned"
            },
            headers=headers
        )
        assert create_res.status_code == 201
        new_trip = create_res.json()
        new_trip_id = new_trip["id"]

        gen_res = await client.post(
            "/api/v1/itinerary/generate",
            json={
                "trip_id": new_trip_id,
                "custom_prompt": "Romantic autumn foliage and matcha tea ceremonies"
            },
            headers=headers
        )
        assert gen_res.status_code == 200
        gen_trip = gen_res.json()
        assert len(gen_trip["days"]) == 3
        print(f"[PASS] 12. Trip builder: created new trip and generated full 3-day itinerary with {len(gen_trip['days'])} days")

    print("\nALL 12 TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    asyncio.run(run_all_tests())
