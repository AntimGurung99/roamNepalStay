import requests
from decimal import Decimal


def geocode_listing_address(address="", city="", province="", region="",district="", country="Nepal"):
    """
    Returns (latitude, longitude) as Decimal values or (None, None)
    using OpenStreetMap Nominatim.
    """
    parts = [address, city, province,district, region, country]
    query = ", ".join([part.strip() for part in parts if part and str(part).strip()])

    if not query:
        return None, None

    try:
        response = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={
                "q": query,
                "format": "json",
                "limit": 1,
            },
            headers={
                "User-Agent": "RoamNepalStay/1.0"
            },
            timeout=10,
        )
        response.raise_for_status()
        results = response.json()

        if not results:
            return None, None

        lat = Decimal(str(results[0]["lat"]))
        lon = Decimal(str(results[0]["lon"]))
        return lat, lon

    except Exception as e:
        print("Geocoding failed:", e)
        return None, None