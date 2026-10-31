import uuid
from datetime import datetime, date, time
from typing import Optional
from icalendar import Calendar, Event, vCalAddress, vText, vGeo
from app.models.schemas import TripDetailResponse


def generate_ics_calendar(trip: TripDetailResponse) -> bytes:
    """Builds RFC 5545 compliant iCalendar .ics stream for the full trip."""
    cal = Calendar()
    cal.add('prodid', '-//Wayfare AI Travel Planner//wayfare.ai//EN')
    cal.add('version', '2.0')
    cal.add('x-wr-calname', f"Wayfare: {trip.title}")
    cal.add('x-wr-caldesc', trip.ai_summary or f"Trip to {trip.destination}")

    for day in trip.days:
        try:
            day_date = datetime.strptime(day.date, "%Y-%m-%d").date()
        except Exception:
            day_date = datetime.utcnow().date()

        for item in day.items:
            event = Event()
            event.add('summary', f"[{item.type.upper()}] {item.title}")
            
            # Start and End times
            try:
                sh, sm = map(int, item.start_time.split(':'))
                eh, em = map(int, item.end_time.split(':'))
                start_dt = datetime.combine(day_date, time(sh, sm))
                end_dt = datetime.combine(day_date, time(eh, em))
            except Exception:
                start_dt = datetime.combine(day_date, time(9, 0))
                end_dt = datetime.combine(day_date, time(10, 30))

            event.add('dtstart', start_dt)
            event.add('dtend', end_dt)
            event.add('dtstamp', datetime.utcnow())
            event.add('uid', f"{item.id}@{trip.id}.wayfare.ai")
            event.add('location', item.location_name)
            
            description = (
                f"{item.description}\n\n"
                f"Category: {item.type.title()}\n"
                f"Estimated Cost: ${item.cost:.2f}\n"
                f"Transit from previous: {item.travel_time_minutes} min ({item.travel_mode})\n"
                f"Tips: {item.tips or 'None'}"
            )
            event.add('description', description)

            if item.lat and item.lng:
                event.add('geo', (item.lat, item.lng))

            cal.add_component(event)

    return cal.to_ical()


def generate_printable_html(trip: TripDetailResponse) -> str:
    """Generates a clean, modern, print-ready HTML page styled for PDF/printing."""
    days_html = ""
    for day in trip.days:
        items_html = ""
        for item in day.items:
            badge_color = {
                "attraction": "#4f46e5",
                "dining": "#ea580c",
                "accommodation": "#059669",
                "transport": "#0284c7",
                "activity": "#7c3aed"
            }.get(item.type, "#4b5563")

            items_html += f"""
            <div style="display: flex; gap: 16px; margin-bottom: 16px; border-left: 3px solid {badge_color}; padding-left: 14px;">
                <div style="min-width: 85px; font-weight: 600; color: #374151; font-size: 13px;">
                    {item.start_time} - {item.end_time}
                </div>
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="background-color: {badge_color}; color: #ffffff; padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase;">
                            {item.type}
                        </span>
                        <span style="font-size: 15px; font-weight: 700; color: #111827;">{item.title}</span>
                        {"<span style='color: #d97706; font-size: 12px;'>🔒 Locked</span>" if item.is_locked else ""}
                    </div>
                    <div style="font-size: 12px; color: #4b5563; margin-top: 3px;">📍 {item.location_name}</div>
                    <div style="font-size: 13px; color: #1f2937; margin-top: 5px;">{item.description}</div>
                    {f"<div style='font-size: 12px; color: #047857; margin-top: 4px; background: #ecfdf5; padding: 4px 8px; border-radius: 4px;'>💡 <strong>Insider Tip:</strong> {item.tips}</div>" if item.tips else ""}
                    <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">
                        Est. Cost: <strong>${item.cost:.2f}</strong> &nbsp;|&nbsp; 
                        Transit: <strong>{item.travel_time_minutes} min ({item.travel_mode})</strong>
                    </div>
                </div>
            </div>
            """

        days_html += f"""
        <div style="margin-top: 28px; page-break-inside: avoid;">
            <div style="background: #f3f4f6; padding: 10px 16px; border-radius: 8px; margin-bottom: 16px;">
                <h3 style="margin: 0; font-size: 17px; color: #111827;">Day {day.day_number}: {day.title or day.date}</h3>
                <p style="margin: 3px 0 0; font-size: 12px; color: #4b5563;">Theme: {day.theme or 'Exploration'} &nbsp;|&nbsp; Date: {day.date}</p>
            </div>
            {items_html}
        </div>
        """

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Wayfare Itinerary – {trip.title}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #111827;
            margin: 0;
            padding: 36px;
            background: #ffffff;
            line-height: 1.5;
        }}
        .header {{
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
            margin-bottom: 24px;
        }}
        .badge {{
            display: inline-block;
            background: #eff6ff;
            color: #1d4ed8;
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
        }}
        @media print {{
            body {{ padding: 0; }}
            .no-print {{ display: none; }}
        }}
    </style>
</head>
<body>
    <div class="header">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
                <span class="badge">Wayfare AI Travel Planner</span>
                <h1 style="margin: 10px 0 6px; font-size: 26px;">{trip.title}</h1>
                <p style="margin: 0; font-size: 14px; color: #4b5563;">
                    📍 {trip.destination} &nbsp;•&nbsp; 
                    🗓️ {trip.start_date} to {trip.end_date} &nbsp;•&nbsp; 
                    👥 {trip.travelers} Traveler(s) ({trip.trip_type.title()}) &nbsp;•&nbsp; 
                    ⚡ Pace: {trip.pace.title()}
                </p>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 12px; color: #6b7280;">Estimated Total</div>
                <div style="font-size: 22px; font-weight: 800; color: #047857;">${trip.total_cost:.2f}</div>
                <div style="font-size: 12px; color: #6b7280;">Budget: ${trip.budget:.2f}</div>
            </div>
        </div>
        {f"<p style='margin: 12px 0 0; font-size: 13px; color: #374151; font-style: italic;'>{trip.ai_summary}</p>" if trip.ai_summary else ""}
    </div>

    {days_html}

    <div style="margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 16px; font-size: 11px; color: #9ca3af; text-align: center;">
        Generated by Wayfare – AI Travel Itinerary Planner • Shared link: /trip/share/{trip.share_token}
    </div>
</body>
</html>
"""
