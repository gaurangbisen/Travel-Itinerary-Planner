import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["ai_mode"] == "mock"


def test_auth_login():
    res = client.post("/api/v1/auth/login", json={"email": "alex@wayfare.ai"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "alex@wayfare.ai"


def test_list_trips():
    res = client.get("/api/v1/trips")
    assert res.status_code == 200
    trips = res.json()
    assert len(trips) >= 3  # Seeded scenarios
    tokyo = next((t for t in trips if "Tokyo" in t["destination"]), None)
    assert tokyo is not None
    assert tokyo["trip_type"] == "solo"


def test_get_trip_detail():
    res = client.get("/api/v1/trips/t-solo-tokyo-001")
    assert res.status_code == 200
    trip = res.json()
    assert trip["id"] == "t-solo-tokyo-001"
    assert len(trip["days"]) >= 2
    assert len(trip["days"][0]["items"]) >= 3


def test_cost_summary():
    res = client.get("/api/v1/trips/t-solo-tokyo-001/cost-summary")
    assert res.status_code == 200
    cost = res.json()
    assert cost["trip_id"] == "t-solo-tokyo-001"
    assert "categories" in cost
    assert "days" in cost
    assert cost["total_cost"] > 0


def test_suggest_alternatives():
    res = client.post(
        "/api/v1/itinerary/items/suggest-alternatives",
        json={"item_id": "i-t1-2"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["original_item_id"] == "i-t1-2"
    assert len(data["alternatives"]) == 3


def test_toggle_lock():
    # Toggle item lock
    res = client.post("/api/v1/itinerary/items/i-t1-2/toggle-lock")
    assert res.status_code == 200
    item = res.json()
    assert item["is_locked"] is True
    
    # Toggle back
    res2 = client.post("/api/v1/itinerary/items/i-t1-2/toggle-lock")
    assert res2.status_code == 200
    assert res2.json()["is_locked"] is False


def test_regenerate_day_with_locked_items():
    # Ensure item 1 is locked in Tokyo day 1
    day_res = client.get("/api/v1/trips/t-solo-tokyo-001")
    day_1 = day_res.json()["days"][0]
    locked_item = next(i for i in day_1["items"] if i["is_locked"])
    locked_title = locked_item["title"]

    regen_res = client.post(
        "/api/v1/itinerary/regenerate-day",
        json={
            "day_id": day_1["id"],
            "instructions": "More cozy tea shops and relaxed walking"
        }
    )
    assert regen_res.status_code == 200
    refreshed_trip = regen_res.json()
    refreshed_day1 = refreshed_trip["days"][0]
    titles = [i["title"] for i in refreshed_day1["items"]]
    assert locked_title in titles  # Locked item was preserved


def test_share_token_public():
    res = client.get("/api/v1/trips/share/share_tokyo_solo_9918")
    assert res.status_code == 200
    shared = res.json()
    assert shared["destination"] == "Tokyo, Japan"


def test_export_ics():
    res = client.get("/api/v1/trips/t-solo-tokyo-001/export/ics")
    assert res.status_code == 200
    assert b"BEGIN:VCALENDAR" in res.content
    assert b"BEGIN:VEVENT" in res.content


def test_export_pdf():
    res = client.get("/api/v1/trips/t-solo-tokyo-001/export/pdf")
    assert res.status_code == 200
    assert "Wayfare Itinerary" in res.text
