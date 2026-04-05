import sys
import os
import json
import argparse
import re
import builtins
from urllib.parse import quote

# Force UTF-8 encoding for Windows compatibility with Unicode/ASCII tables
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

# Add little-brother to sys.path to allow imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'little-brother'))

try:
    import littlebrother
    from littlebrother import (
        leaked # For Email/Hash lookups
    )
    import requests
    from bs4 import BeautifulSoup
    import phonenumbers
    from phonenumbers import geocoder, carrier, timezone
except ImportError as e:
    print(f"[ERROR] Missing dependency: {e}")
    sys.exit(1)

class ArgumentInjector:
    """
    Monkeypatches builtins.input to automatically provide targets
    to LittleBrother's interactive legacy modules.
    """
    def __init__(self, inputs):
        self.inputs = list(inputs)
        self.original_input = builtins.input

    def __enter__(self):
        builtins.input = self.custom_input
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        builtins.input = self.original_input

    def custom_input(self, prompt=""):
        if self.inputs:
            return self.inputs.pop(0)
        return ""

# --- MODULE EXECUTION HELPERS ---

def run_person(name, city):
    print(f"[*] Analyzing Person: {name} in {city}...")
    with ArgumentInjector([f"{name}", city]):
        littlebrother.searchPersonne()

def run_address(address):
    print(f"[*] Analyzing Physical Address: {address}...")
    with ArgumentInjector([address]):
        littlebrother.searchAdresse()

def run_ssid(bssid):
    print(f"[*] Analyzing MAC/BSSID: {bssid}...")
    with ArgumentInjector([bssid]):
        littlebrother.bssidFinder()

def run_email_check(email):
    """
    Hardened Email Verification Engine
    Bypasses Port 25 blocks by performing DNS/MX intelligence.
    """
    print(f"[*] Analyzing Email Validity: {email}...")
    try:
        import dns.resolver
        domain = email.split('@')[-1]
        records = dns.resolver.resolve(domain, 'MX')
        mx_records = [str(r.exchange) for r in records]
        
        result = {
            "platform": "Email", "target": email, "status": "Valid Domain & MX Active",
            "mx_records": mx_records, "note": "SMTP handshake bypassed to avoid ISP port-25 blocking."
        }
        print(json.dumps(result, indent=2))
    except Exception as e:
        # Fallback to LittleBrother's legacy (with error wrapping)
        try:
            with ArgumentInjector([email]):
                littlebrother.check_email_exist()
        except Exception:
            print(f"[ERROR] Email check failed: Connection Refused or Domain Invalid.")

def run_email_leak(email):
    """
    Modern Email Leak Discovery (XposedOrNot API - 2026 Edition)
    Bypasses broken 2021 scrapers and returns structured breach metadata.
    """
    print(f"[*] Analyzing Email Leaks (XposedOrNot): {email}...")
    try:
        url = f"https://xposedornot.p.rapidapi.com/v1/check-email/{email}"
        # Direct public access often available via specific mirrors or public endpoints
        # For OSINT Orchestrator, we use the verified public check endpoint
        res = requests.get(f"https://api.xposedornot.com/v1/check-email/{email}", timeout=10)
        
        if res.status_code == 200:
            data = res.json()
            # Transform to high-density metadata for the UI
            result = {
                "platform": "BreachDirectory",
                "email": email,
                "exposed": True,
                "breaches": data.get("breaches", []),
                "note": "Exposed in known public data dumps."
            }
            print(json.dumps(result, indent=2))
        elif res.status_code == 404:
            print(json.dumps({"platform": "BreachDirectory", "email": email, "exposed": False, "status": "Secure"}, indent=2))
        else:
            raise Exception(f"API Error {res.status_code}")
            
    except Exception as e:
        # Final Fallback to Google Pastes / Dorking
        print(f"[*] Falling back to Open Passive Recon for {email}...")
        try:
            with ArgumentInjector([email]):
                littlebrother.SearchEmail4()
        except:
            print(f"[ERROR] Email leak check failed: Service Unreachable.")

def run_google_osint(query):
    print(f"[*] Deep Google Dorking: {query}...")
    with ArgumentInjector([query]):
        littlebrother.google()

def run_ip(target):
    """
    Modern Multi-Layer IP Recon Engine
    1. IP-API (Industry Standard)
    2. IPInfo.io (Fallback)
    """
    print(f"[*] Analyzing IP Infrastructure: {target}...")
    
    # LAYER 1: IP-API
    try:
        url = f"http://ip-api.com/json/{target}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query"
        res = requests.get(url, timeout=10).json()
        if res.get('status') == 'success':
            print(json.dumps(res, indent=2))
            return
    except Exception:
        pass

    # LAYER 2: IPInfo.io
    try:
        res = requests.get(f"https://ipinfo.io/{target}/json", timeout=10).json()
        if 'ip' in res:
            print(json.dumps(res, indent=2))
            return
    except Exception:
        pass

    # Final Fallback to LittleBrother's legacy (just in case)
    try:
        with ArgumentInjector([target]):
            littlebrother.ipFinder()
    except Exception as e:
        print(f"[ERROR] IP Recon total failure: {e}")

def run_phone(target):
    # Already upgraded to International Support in previous turn
    try:
        if not target.startswith('+'): target = '+' + target.replace('00','')
        pn = phonenumbers.parse(target)
        result = {
            "platform": "Phone", "number": target, "valid": phonenumbers.is_valid_number(pn),
            "location": geocoder.description_for_number(pn, "en"),
            "carrier": carrier.name_for_number(pn, "en"),
            "format": {"e164": phonenumbers.format_number(pn, phonenumbers.PhoneNumberFormat.E164)}
        }
        print(json.dumps(result, indent=2))
    except Exception as e: print(f"[ERROR] Phone Lookup failed: {e}")

# --- MAIN CLI INTERFACE ---

def main():
    parser = argparse.ArgumentParser(description='LittleBrother Full Suite Web Bridge')
    parser.add_argument('--module', required=True, help='Module (person, address, phone, ip, ssid, email-check, email-leak, hash, google)')
    parser.add_argument('--target', required=True, nargs='+', help='Main Target (collects all words)')
    parser.add_argument('--secondary', nargs='+', help='Secondary target (collects all words)')
    
    args = parser.parse_args()
    
    m = args.module
    t = " ".join(args.target).strip('"\'') # Handle spaces and quotes
    s = " ".join(args.secondary).strip('"\'') if args.secondary else ""

    if m == 'person': run_person(t, s if s else "")
    elif m == 'address': run_address(t)
    elif m == 'phone': run_phone(t)
    elif m == 'ip': run_ip(t)
    elif m == 'ssid': run_ssid(t)
    elif m == 'email-check': run_email_check(t)
    elif m == 'email-leak': run_email_leak(t)
    elif m == 'google': run_google_osint(t)
    else:
        print(f"[ERROR] Unknown module: {args.module}")

if __name__ == "__main__":
    main()
