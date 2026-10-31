import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def run_verification():
    print("==================================================")
    print("   WAYFARE FULL USER WORKFLOW VERIFICATION   ")
    print("==================================================")

    # 1. Sign up / Login
    print("\n1. Testing Auth & User Sign In...")
    login_res = requests.post(f"{BASE_URL}/api/v1/auth/login", json={
        "email": "traveler.test@wayfare.ai",
        "full_name": "Jordan Explorer"
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token_data = login_res.json()
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    print(f"   -> Authenticated as {token_data['user']['full_name']} (token length: {len(token)})")

    # 2. Create a Solo Weekend Trip
    print("\n2. Creating Solo Weekend Trip (Tokyo Explorer)...")
    solo_res = requests.post(f"{BASE_URL}/api/v1/trips", headers=headers, json={
        "title": "Tokyo Solo Weekend Ramen & Photography",
        "destination": "Tokyo, Japan",
        "start_date": "2026-11-13",
        "end_date": "2026-11-15",
        "travelers": 1,
        "trip_type": "solo",
        "budget": 750.0,
        "budget_currency": "USD",
        "pace": "moderate",
        "interests": ["Foodie", "Photography", "Culture"],
        "status": "planned"
    })
    assert solo_res.status_code == 201, f"Create solo trip failed: {solo_res.text}"
    solo_trip = solo_res.json()
    solo_id = solo_trip["id"]
    print(f"   -> Trip Created: ID={solo_id}, Destination={solo_trip['destination']}, Budget=${solo_trip['budget']}")

    # Generate Full Itinerary for Solo Trip
    print("   -> Generating Full AI Itinerary for Solo Trip...")
    gen_solo = requests.post(f"{BASE_URL}/api/v1/itinerary/generate", headers=headers, json={
        "trip_id": solo_id,
        "custom_prompt": "Include vintage camera stores in Nakano and hidden ramen counters."
    })
    assert gen_solo.status_code == 200, f"Generate failed: {gen_solo.text}"
    solo_detail = gen_solo.json()
    print(f"   -> Itinerary Generated: {len(solo_detail['days'])} days, total cost: ${solo_detail['total_cost']}")

    # 3. Create a Couple's Relaxed Premium Trip
    print("\n3. Creating Couple's Relaxed Premium Trip (Paris Romance)...")
    couple_res = requests.post(f"{BASE_URL}/api/v1/trips", headers=headers, json={
        "title": "Romantic Paris Sunset & Champagne Getaway",
        "destination": "Paris, France",
        "start_date": "2026-11-20",
        "end_date": "2026-11-23",
        "travelers": 2,
        "trip_type": "couple",
        "budget": 2400.0,
        "budget_currency": "USD",
        "pace": "relaxed",
        "interests": ["Romantic", "Foodie", "Art & Museums", "Relaxation"],
        "status": "planned"
    })
    assert couple_res.status_code == 201
    couple_trip = couple_res.json()
    couple_id = couple_trip["id"]

    gen_couple = requests.post(f"{BASE_URL}/api/v1/itinerary/generate", headers=headers, json={
        "trip_id": couple_id,
        "custom_prompt": "Prioritize sunset over Seine, wine tasting, and relaxed late breakfast."
    })
    assert gen_couple.status_code == 200
    couple_detail = gen_couple.json()
    print(f"   -> Trip Created: ID={couple_id}, {len(couple_detail['days'])} days, total cost: ${couple_detail['total_cost']}")

    # 4. Create a Group Trip
    print("\n4. Creating Group Trip (Barcelona Roadtrip & Friends)...")
    group_res = requests.post(f"{BASE_URL}/api/v1/trips", headers=headers, json={
        "title": "Barcelona Friends Gaudi & Beach Roadtrip",
        "destination": "Barcelona, Spain",
        "start_date": "2026-11-27",
        "end_date": "2026-11-29",
        "travelers": 4,
        "trip_type": "group",
        "budget": 1600.0,
        "budget_currency": "USD",
        "pace": "fast-paced",
        "interests": ["Nightlife", "Foodie", "Architecture", "Adventure"],
        "status": "planned"
    })
    assert group_res.status_code == 201
    group_trip = group_res.json()
    group_id = group_trip["id"]

    # Add Group Members
    requests.post(f"{BASE_URL}/api/v1/trips/{group_id}/members", headers=headers, json={
        "name": "Liam Vance",
        "email": "liam@example.com",
        "role": "editor",
        "dietary_preferences": ["Vegetarian"],
        "budget_preference": 400.0
    })
    requests.post(f"{BASE_URL}/api/v1/trips/{group_id}/members", headers=headers, json={
        "name": "Sophia Zhang",
        "email": "sophia@example.com",
        "role": "editor",
        "dietary_preferences": ["Gluten-Free"],
        "budget_preference": 400.0
    })

    gen_group = requests.post(f"{BASE_URL}/api/v1/itinerary/generate", headers=headers, json={
        "trip_id": group_id,
        "custom_prompt": "Group tapas, beach volleyball, and live flamenco."
    })
    assert gen_group.status_code == 200
    group_detail = gen_group.json()
    print(f"   -> Trip Created: ID={group_id}, {len(group_detail['days'])} days, {len(group_detail['members'])} collaborators")

    # 5. Edit an Item
    print("\n5. Testing Item Editing (Updating cost and notes)...")
    target_day = solo_detail["days"][0]
    target_item = target_day["items"][0]
    edit_res = requests.put(f"{BASE_URL}/api/v1/itinerary/items/{target_item['id']}", headers=headers, json={
        "title": f"{target_item['title']} (VIP Early Entry)",
        "cost": 18.0,
        "tips": "Pre-booked online ticket saves 45 minutes queue."
    })
    assert edit_res.status_code == 200
    edited_item = edit_res.json()
    print(f"   -> Edited '{edited_item['title']}', Cost updated to ${edited_item['cost']}")

    # 6. Reorder Items
    print("\n6. Testing Drag-and-Drop Item Reordering...")
    item_ids = [i["id"] for i in target_day["items"]]
    if len(item_ids) >= 2:
        reversed_ids = list(reversed(item_ids))
        reorder_res = requests.post(
            f"{BASE_URL}/api/v1/itinerary/days/{target_day['id']}/reorder",
            headers=headers,
            json={"item_ids": reversed_ids}
        )
        assert reorder_res.status_code == 200
        new_order = reorder_res.json()
        print(f"   -> Successfully reordered {len(new_order)} items; new lead item: '{new_order[0]['title']}' at {new_order[0]['start_time']}")

    # 7. Item Lock & Single Day Regeneration
    print("\n7. Testing Item Lock and Single Day Regeneration...")
    # Lock the lead item
    lead_item_id = target_day["items"][0]["id"]
    lock_res = requests.post(f"{BASE_URL}/api/v1/itinerary/items/{lead_item_id}/toggle-lock", headers=headers)
    assert lock_res.status_code == 200
    assert lock_res.json()["is_locked"] is True
    locked_title = lock_res.json()["title"]
    print(f"   -> Locked item: '{locked_title}'")

    # Regenerate day with custom instruction
    regen_res = requests.post(f"{BASE_URL}/api/v1/itinerary/regenerate-day", headers=headers, json={
        "day_id": target_day["id"],
        "instructions": "Add more matcha tea houses and vintage bookshops"
    })
    assert regen_res.status_code == 200
    refreshed_day = regen_res.json()["days"][0]
    refreshed_titles = [i["title"] for i in refreshed_day["items"]]
    assert locked_title in refreshed_titles, "Locked item was not preserved!"
    print(f"   -> Day regenerated! Preserved locked item '{locked_title}' amongst {len(refreshed_titles)} stops.")

    # 8. Check Cost Summary & Over-Budget Warning
    print("\n8. Checking Cost Analytics & Budget Calculations...")
    cost_res = requests.get(f"{BASE_URL}/api/v1/trips/{solo_id}/cost-summary", headers=headers)
    assert cost_res.status_code == 200
    cost_data = cost_res.json()
    print(f"   -> Total Cost: ${cost_data['total_cost']:.2f}")
    print(f"   -> Budget: ${cost_data['budget']:.2f}")
    print(f"   -> Per-person Cost: ${cost_data['per_person_cost']:.2f}")
    print(f"   -> Categories ({len(cost_data['categories'])}): {', '.join(c['category'] + ': $' + str(c['amount']) for c in cost_data['categories'])}")
    print(f"   -> Over Budget Status: {cost_data['is_over_budget']}")

    # 9. Open Read-Only Public Share Link
    print("\n9. Testing Public Read-Only Share Token Link...")
    share_token = solo_detail["share_token"]
    share_res = requests.get(f"{BASE_URL}/api/v1/trips/share/{share_token}")
    assert share_res.status_code == 200
    shared_data = share_res.json()
    assert shared_data["id"] == solo_id
    print(f"   -> Public link verified without auth token! Destination: {shared_data['destination']}, Token: {share_token}")

    # 10. Calendar ICS & PDF Export
    print("\n10. Testing Calendar (.ICS) & PDF/Printable Export...")
    ics_res = requests.get(f"{BASE_URL}/api/v1/trips/{solo_id}/export/ics", headers=headers)
    assert ics_res.status_code == 200
    assert b"BEGIN:VCALENDAR" in ics_res.content
    print(f"   -> ICS calendar export valid: {len(ics_res.content)} bytes")

    pdf_res = requests.get(f"{BASE_URL}/api/v1/trips/{solo_id}/export/pdf", headers=headers)
    assert pdf_res.status_code == 200
    assert "Wayfare Itinerary" in pdf_res.text
    print(f"   -> PDF/Printable HTML export valid: {len(pdf_res.text)} characters")

    print("\n==================================================")
    print("   ALL 10 WORKFLOW VERIFICATIONS PASSED 100%!   ")
    print("==================================================")

if __name__ == "__main__":
    run_verification()
